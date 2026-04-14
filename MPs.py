import streamlit as st
import numpy as np
import cv2
from ultralytics import YOLO
from PIL import Image
import io
import time

# ===============================================================
# PAGE CONFIG
# ===============================================================
st.set_page_config(
    page_title="AI DR Detection System",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ===============================================================
# CUSTOM CSS
# ===============================================================
st.markdown("""
<style>
.main-title {
    font-size: 38px;
    font-weight: 700;
    color: #0E4D92;
}
.sub-title {
    font-size: 18px;
    color: #444444;
}
.success-box {
    padding: 15px;
    border-radius: 10px;
    background-color: #e6f9f0;
    color: #008060;
    font-weight: bold;
}
.error-box {
    padding: 15px;
    border-radius: 10px;
    background-color: #ffe6e6;
    color: #cc0000;
    font-weight: bold;
}
.footer {
    text-align: center;
    padding: 20px;
    color: gray;
    font-size: 14px;
}
</style>
""", unsafe_allow_html=True)

# ===============================================================
# LOAD MODEL
# ===============================================================
@st.cache_resource
def load_trained_model():
    model_path = "best.pt"
    if not os.path.exists(model_path):
        model_path = os.path.join("backend", "ai", "best.pt")
    
    if not os.path.exists(model_path):
        st.error(f"🚨 Model file '{model_path}' not found! Please ensure 'best.pt' is in the root directory.")
        st.stop()
        
    return YOLO(model_path)

import os
model = load_trained_model()

# ===============================================================
# SIDEBAR
# ===============================================================
st.sidebar.header("⚙️ Detection Settings")

CONF_THRESHOLD = st.sidebar.slider("Confidence Threshold", 0.05, 0.95, 0.25, 0.05)
IOU_THRESHOLD  = st.sidebar.slider("IoU (NMS) Threshold",  0.05, 0.95, 0.45, 0.05)

box_color = st.sidebar.selectbox("Bounding Box Color", ["Red", "Green", "Blue", "Yellow"])
show_conf  = st.sidebar.checkbox("Show Confidence Scores", value=True)
show_labels = st.sidebar.checkbox("Show Class Labels", value=True)

st.sidebar.markdown("---")
st.sidebar.caption("Model: **best.pt** (YOLO Detection)")

# ===============================================================
# HEADER
# ===============================================================
st.markdown('<div class="main-title">🩺 AI Diabetic Retinopathy Detection System</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Automated lesion detection and DR screening using YOLO</div>', unsafe_allow_html=True)
st.markdown("---")

# ===============================================================
# FILE UPLOAD
# ===============================================================
uploaded_file = st.file_uploader(
    "Upload Retinal Fundus Image",
    type=["jpg", "jpeg", "png"]
)

# ===============================================================
# MAIN PROCESSING
# ===============================================================
if uploaded_file is not None:

    col1, col2 = st.columns(2)

    image = Image.open(uploaded_file).convert("RGB")
    image_np = np.array(image)

    col1.subheader("Original Fundus Image")
    col1.image(image_np, use_container_width=True)

    # -------------------------------------------------------
    # PREDICTION
    # -------------------------------------------------------
    with st.spinner("Running AI Analysis..."):
        time.sleep(0.5)
        results = model.predict(
            source=image_np,
            conf=CONF_THRESHOLD,
            iou=IOU_THRESHOLD,
            verbose=False
        )

    result = results[0]  # single image
    boxes  = result.boxes  # Boxes object

    # -------------------------------------------------------
    # DRAW BOUNDING BOXES
    # -------------------------------------------------------
    color_dict = {
        "Red":    (255,  50,  50),
        "Green":  ( 50, 220,  50),
        "Blue":   ( 50, 130, 255),
        "Yellow": (255, 220,   0),
    }
    draw_color = color_dict[box_color]

    annotated = image_np.copy()
    num_detections = 0

    if boxes is not None and len(boxes) > 0:
        num_detections = len(boxes)
        names = model.names  # class index -> class name dict

        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            conf  = float(box.conf[0])
            cls   = int(box.cls[0])
            label = names[cls] if show_labels else ""
            label_str = f"{label} {conf:.2f}" if (show_labels and show_conf) else \
                        f"{conf:.2f}"          if show_conf               else \
                        label

            # Box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), draw_color, 2)

            # Label background + text
            if label_str:
                (tw, th), _ = cv2.getTextSize(label_str, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
                cv2.rectangle(annotated, (x1, y1 - th - 8), (x1 + tw + 4, y1), draw_color, -1)
                cv2.putText(
                    annotated, label_str,
                    (x1 + 2, y1 - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55,
                    (255, 255, 255), 1, cv2.LINE_AA
                )

    col2.subheader("Detection Result")
    col2.image(annotated, use_container_width=True)

    # -------------------------------------------------------
    # DIAGNOSIS SUMMARY
    # -------------------------------------------------------
    st.markdown("## 🧾 Diagnosis Summary")

    colA, colB, colC = st.columns(3)
    colA.metric("Lesions Detected", num_detections)
    colB.metric("Confidence Threshold", CONF_THRESHOLD)
    colC.metric("IoU Threshold", IOU_THRESHOLD)

    if num_detections > 0:
        avg_conf_val = float(boxes.conf.mean())
        st.progress(min(int(avg_conf_val * 100), 100))
        st.markdown('<div class="error-box">⚠️ DR DETECTED — Lesions found in fundus image</div>', unsafe_allow_html=True)

        # Per-detection table
        st.markdown("### Detected Lesions")
        names = model.names
        rows = []
        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            rows.append({
                "Lesion #":    i + 1,
                "Class":       names[int(box.cls[0])],
                "Confidence":  f"{float(box.conf[0]):.3f}",
                "BBox (x1,y1,x2,y2)": f"({x1}, {y1}, {x2}, {y2})"
            })
        st.table(rows)
    else:
        st.progress(0)
        st.markdown('<div class="success-box">✅ NORMAL — No lesions detected</div>', unsafe_allow_html=True)

    # -------------------------------------------------------
    # DOWNLOAD
    # -------------------------------------------------------
    st.markdown("## 📥 Download Results")

    annotated_img = Image.fromarray(annotated)
    buffer = io.BytesIO()
    annotated_img.save(buffer, format="PNG")
    buffer.seek(0)

    st.download_button(
        "Download Annotated Image",
        buffer.getvalue(),
        file_name="dr_detection.png",
        mime="image/png"
    )

    # -------------------------------------------------------
    # TECH DETAILS
    # -------------------------------------------------------
    with st.expander("🔬 Technical Details"):
        st.write("Model classes:", model.names)
        st.write("Total detections:", num_detections)
        if num_detections > 0:
            st.write("Confidence scores:", [f"{float(c):.3f}" for c in boxes.conf])
            st.write("Raw boxes (xyxy):", boxes.xyxy.tolist())

# ===============================================================
# FOOTER
# ===============================================================
st.markdown("---")
st.markdown('<div class="footer">AI-based DR Screening System | For Research & Educational Use Only</div>', unsafe_allow_html=True)