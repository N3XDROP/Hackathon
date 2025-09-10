import os, uuid, hashlib, shutil
from werkzeug.utils import secure_filename

CARPETA_SUBIDAS = "uploads"
os.makedirs(CARPETA_SUBIDAS, exist_ok=True)

EXTENSIONES_PERMITIDAS = {"pdf", "png", "jpg", "jpeg"}
TAM_MIN_IMAGEN_BYTES = 10 * 1024  # 10 KB

def extension_permitida(nombre: str) -> bool:
    return "." in nombre and nombre.rsplit(".", 1)[1].lower() in EXTENSIONES_PERMITIDAS

def ruta_usuario(usuario_id: str, estado: str) -> str:
    """
    Retorna la ruta base de un usuario según el estado del flujo.
    estado puede ser: 'pendientes', 'revisados', 'validados'
    """
    return os.path.join(CARPETA_SUBIDAS, estado, str(usuario_id))

def guardar_archivo(archivo, usuario_id: str, estado: str = "pendientes") -> str:
    """
    Guarda el archivo en la carpeta correspondiente al usuario y estado.
    - estado: 'pendientes' (user), 'revisados' (admin), 'validados' (comité)
    """
    destino = ruta_usuario(usuario_id, estado)
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

def mover_a_estado(usuario_id: str, origen: str, destino: str) -> str:
    """
    Mueve la carpeta de un usuario de un estado a otro.
    Ejemplo: pendientes → revisados → validados
    """
    src = ruta_usuario(usuario_id, origen)
    dst = ruta_usuario(usuario_id, destino)

    if not os.path.exists(src):
        raise FileNotFoundError(f"No existe carpeta de origen: {src}")

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.move(src, dst)

    return dst
