import streamlit as st
from ultralytics import YOLO
from PIL import Image
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load Gemini model
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

# Load YOLO model from the centralized models directory
model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
model = YOLO(model_path)

# DR classes
class_names = ['Mild', 'Moderate', 'No_DR', 'Proliferate_DR', 'Severe']

# Streamlit UI
st.title("🩺 Diabetic Retinopathy Detection + GenAI (Gemini)")
st.write("Upload a retinal image to detect lesions and generate an AI medical report.")

# Upload image
uploaded_file = st.file_uploader("Upload Retina Image", type=["jpg","png","jpeg"])

if uploaded_file is not None:

    image = Image.open(uploaded_file)

    st.image(image, caption="Uploaded Retina Image", use_container_width=True)

    # Run YOLO detection
    results = model(image)

    # Save detection output
    results[0].save("output.jpg")

    st.subheader("🔍 Detection Result")
    st.image("output.jpg")

    # Count lesions
    counts = {name:0 for name in class_names}

    for box in results[0].boxes:
        cls_id = int(box.cls)
        counts[class_names[cls_id]] += 1

    st.subheader("📊 Detected Lesions")

    for k,v in counts.items():
        st.write(f"{k}: {v}")

    # Convert results to text
    detection_text = "\n".join([f"{k}: {v}" for k,v in counts.items()])

    if st.button("Generate AI Medical Report"):

        with st.spinner("Generating report..."):

            prompt = f"""
You are an ophthalmology AI assistant.

Detected lesions in retinal scan:

{detection_text}

Write a short diabetic retinopathy report.
Explain possible severity.
"""

            response = gemini_model.generate_content(prompt)

            report = response.text

        st.subheader("🧠 AI Generated Medical Report")

        st.write(report)