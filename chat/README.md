# Chat · Verificación de Cédula y Certificado (Flask + OCR)

## Requisitos
- Python 3.10+ (recomendado)
- Windows con **Tesseract OCR** instalado (UB Mannheim build). Ruta típica:
  `C:\Program Files\Tesseract-OCR\tesseract.exe`
- (Opcional) GPU NVIDIA para acelerar EasyOCR.

# Instalacion IA Ollama
ollama pull llava:latest

# Instalacion OCR Tesseract
https://github.com/tesseract-ocr/tesseract/releases/download/5.5.0/tesseract-ocr-w64-setup-5.5.0.20241111.exe

## Instalación (CPU)
pip install flask
pip install flask-session
pip install requests
pip install numpy
pip install PyMuPDF
pip install opencv-python
pip install easyocr
pip install pytesseract

### Usar GPU (OPCIONAL)
pip uninstall -y torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

## Ejecutar programa
cd "ruta_proyecto_chat"
.\genai\Scripts\activate
python app.py
### abre http://127.0.0.1:5000

## Estructura proyecto
chat/
├─ routes/
│  ├─ web.py            # Página /
│  └─ analizar.py       # POST /analizar
├─ services/
│  ├─ ocr_ai.py         # EasyOCR + Tesseract (MRZ) + parsers
│  ├─ llm_struct.py     # llamados a modelo de texto (Ollama)
│  └─ utils.py          # guardado de archivos, hash, checks
├─ templates/
│  └─ index.html        # UI de carga y resultados
├─ uploads/             # (ignorado por git) archivos subidos
├─ flask_session/       # (ignorado por git) sesiones
├─ app.py               # entrada Flask (antes a.py)
├─ .gitignore
└─ README.md