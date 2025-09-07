import os, uuid, hashlib
from werkzeug.utils import secure_filename

CARPETA_SUBIDAS = "uploads"
os.makedirs(CARPETA_SUBIDAS, exist_ok=True)

EXTENSIONES_PERMITIDAS = {"pdf", "png", "jpg", "jpeg"}
TAM_MIN_IMAGEN_BYTES = 10 * 1024  # 10 KB

def extension_permitida(nombre: str) -> bool:
    return "." in nombre and nombre.rsplit(".", 1)[1].lower() in EXTENSIONES_PERMITIDAS

def guardar_archivo(archivo, subcarpeta: str) -> str:
    destino = os.path.join(CARPETA_SUBIDAS, subcarpeta)
    os.makedirs(destino, exist_ok=True)
    nombre = secure_filename(archivo.filename)
    unico = f"{uuid.uuid4().hex}_{nombre}"
    ruta = os.path.join(destino, unico)
    archivo.save(ruta)
    return ruta

def hash_sha256(ruta: str) -> str:
    h = hashlib.sha256()
    with open(ruta, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def validar_archivo_basico(ruta: str) -> bool:
    """Sanity check mínimo para evitar archivos vacíos."""
    try:
        return os.path.getsize(ruta) >= TAM_MIN_IMAGEN_BYTES
    except Exception:
        return False
