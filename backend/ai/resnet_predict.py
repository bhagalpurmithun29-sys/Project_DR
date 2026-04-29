import sys
import os
import json
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import traceback

def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No image path provided"}))
            sys.exit(1)

        image_path = sys.argv[1]
        
        # ResNet Model Path
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'resnet.pth')
        
        if not os.path.exists(model_path):
            print(json.dumps({"error": f"Model file not found at {model_path}."}))
            sys.exit(1)

        # Standard DR classes from training set (matches YOLO order)
        # 0: Mild, 1: Moderate, 2: No_DR, 3: Proliferate_DR, 4: Severe
        class_names = ['Mild NPDR', 'Moderate NPDR', 'No DR', 'Proliferate DR', 'Severe NPDR']

        # Load ResNet50 architecture
        model = models.resnet50(pretrained=False)
        num_ftrs = model.fc.in_features
        model.fc = torch.nn.Linear(num_ftrs, 5) # 5 classes
        
        # Load weights
        state_dict = torch.load(model_path, map_location=torch.device('cpu'))
        model.load_state_dict(state_dict)
        model.eval()

        # Image Preprocessing - Trying without normalization to see if it fixes the bias
        preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            # transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        # Load and process image
        if image_path.startswith('http'):
            import requests
            from io import BytesIO
            response = requests.get(image_path)
            input_image = Image.open(BytesIO(response.content)).convert('RGB')
        else:
            input_image = Image.open(image_path).convert('RGB')
            
        input_tensor = preprocess(input_image)
        input_batch = input_tensor.unsqueeze(0) # create a mini-batch as expected by the model

        # Run inference
        with torch.no_grad():
            output = model(input_batch)
            sys.stderr.write(f"Raw Logits: {output[0].tolist()}\n")
        
        # Get probabilities
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        sys.stderr.write(f"Probabilities: {probabilities.tolist()}\n")
        top_prob, top_catid = torch.max(probabilities, 0)
        
        predicted_class = class_names[top_catid]
        probability = float(top_prob)

        # Risk Mapping Logic (Updated for corrected order)
        risk_map = {
            'No DR': 'Low Risk',
            'Mild NPDR': 'Low Risk',
            'Moderate NPDR': 'Moderate Risk',
            'Severe NPDR': 'High Risk',
            'Proliferate DR': 'High Risk'
        }
        
        risk = risk_map.get(predicted_class, 'Moderate Risk')

        findings = [f"AI Analysis detects: {predicted_class}"]
        if predicted_class != 'No DR':
            findings.append(f"Confidence score: {probability:.2%}")
        else:
            findings.append("No significant diabetic retinopathy detected.")

        result = {
            "probability": probability,
            "riskLevel": risk,
            "lesionCount": int(top_catid), # Using class index as a proxy for severity level
            "status": "Analyzed",
            "aiModel": "ResNet-50 (Clinical)",
            "findings": findings,
            "prediction": predicted_class,
            "classProbabilities": {class_names[i]: float(probabilities[i]) for i in range(len(class_names))}
        }
        
        print(json.dumps(result))

    except Exception as e:
        sys.stderr.write(traceback.format_exc())
        print(json.dumps({"error": str(e), "traceback": True}))
        sys.exit(1)

if __name__ == "__main__":
    main()
