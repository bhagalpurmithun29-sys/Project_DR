import sys
import os
import json
import warnings
import traceback

# Suppress warnings and YOLO logs
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['YOLO_VERBOSE'] = 'False'

def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No image path provided"}))
            sys.exit(1)

        image_path = sys.argv[1]
        
        # YOLO Model Path - Centralized Repository
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
        
        # DR classes from user's app.py
        class_names = ['Mild', 'Moderate', 'No_DR', 'Proliferate_DR', 'Severe']

        if not os.path.exists(model_path):
            print(json.dumps({"error": f"Model file not found at {model_path}."}))
            sys.exit(1)

        from ultralytics import YOLO
        import numpy as np
        
        # Load YOLO model
        model = YOLO(model_path)
        
        # Run inference
        results = model.predict(source=image_path, conf=0.25, verbose=False)
        result_obj = results[0]
        
        boxes = result_obj.boxes
        counts = {name: 0 for name in class_names}
        confidences = []

        if boxes is not None:
            for box in boxes:
                cls_id = int(box.cls)
                if cls_id < len(class_names):
                    counts[class_names[cls_id]] += 1
                    confidences.append(float(box.conf))

        # Risk Mapping Logic
        risk = "Low Risk"
        if counts['Proliferate_DR'] > 0 or counts['Severe'] > 0:
            risk = "High Risk"
        elif counts['Moderate'] > 0:
            risk = "Moderate Risk"
        elif counts['Mild'] > 0:
            risk = "Low Risk"
        
        avg_conf = float(np.mean(confidences)) if confidences else 0.0
        num_lesions = len(confidences)

        findings = []
        for k, v in counts.items():
            if v > 0:
                findings.append(f"{v} {k.replace('_', ' ')} detected.")

        output = {
            "probability": avg_conf,
            "riskLevel": risk,
            "lesionCount": num_lesions,
            "status": "Analyzed",
            "aiModel": "YOLOv8-Custom",
            "findings": findings if findings else ["No pathology detected."],
            "classCounts": counts
        }
        
        # Only print the JSON to stdout
        print(json.dumps(output))

    except Exception as e:
        # Print full traceback to stderr for system diagnostics
        sys.stderr.write(traceback.format_exc())
        # Print clean JSON error to stdout for Node.js parser
        print(json.dumps({"error": str(e), "traceback": True}))
        sys.exit(1)

if __name__ == "__main__":
    main()
