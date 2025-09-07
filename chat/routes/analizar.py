from flask import Blueprint, request, Response, session, redirect, url_for

from services.utils import (
    EXTENSIONES_PERMITIDAS, extension_permitida, guardar_archivo,
    validar_archivo_basico, hash_sha256
)
from services.ocr_ai import (
    extraer_texto_documento,
    extraer_mrz_texto,
    parse_nuip_from_mrz,
    parse_names_from_mrz,
    parse_birth_from_mrz,
    canonicalizar_nuip,
    mrz_desde_texto_ocr,
    _is_valid_mrz,
)
from services.llm_struct import (
    estructurar_cedula_desde_texto,
    estructurar_certificado_desde_texto,
    estructurar_rut_desde_texto,
    estructurar_contraloria_desde_texto,
    estructurar_procuraduria_desde_texto,
    estructurar_policia_desde_texto,
    estructurar_rnmc_desde_texto,
)

analizar_bp = Blueprint("analizar", __name__)

@analizar_bp.post("/analizar")
def analizar():
    documentos_requeridos = [
        "cedula", "certificado", "rut", "camara_comercio", "carta_intencion",
        "carta_aceptacion", "antecedentes_contraloria", "antecedentes_procuraduria",
        "antecedentes_policia", "antecedentes_rnmc"
    ]

    faltan_documentos = [doc for doc in documentos_requeridos if doc not in request.files or request.files[doc].filename == ""]
    # Los campos de texto también son requeridos
    if not request.form.get("descripcion_entidad"):
        faltan_documentos.append("descripcion_entidad")
    if not request.form.get("tipo_entidad"):
        faltan_documentos.append("tipo_entidad")
    if not request.form.get("objeto_social"):
        faltan_documentos.append("objeto_social")
    if not request.form.get("direccion_fisica"):
        faltan_documentos.append("direccion_fisica")
    if not request.form.get("residencia_boyaca"):
        faltan_documentos.append("residencia_boyaca")

    # Guardamos todos los archivos recibidos
    usuario_id = (request.form.get("usuario_id") or "").strip() or "anon"
    rutas = {}
    for doc in documentos_requeridos:
        file = request.files.get(doc)
        if file and file.filename and extension_permitida(file.filename):
            rutas[doc] = guardar_archivo(file, usuario_id)

    # Sanity checks
    observ = []
    for key, ruta in rutas.items():
        if not validar_archivo_basico(ruta):
            observ.append(f"{key} vacío o ilegible.")

    if observ:
        return Response(" ; ".join(observ), 400)

    # OCR e IA
    resultados = {}
    if "cedula" in rutas:
        texto_ced = extraer_texto_documento(rutas["cedula"])
        mrz_txt = extraer_mrz_texto(rutas["cedula"])
        if not _is_valid_mrz(mrz_txt):
            mrz_txt = mrz_desde_texto_ocr(texto_ced)
        if _is_valid_mrz(mrz_txt):
            texto_ced += "\n\n[MRZ]\n" + mrz_txt

        resultado_ced = estructurar_cedula_desde_texto(texto_ced)

        if _is_valid_mrz(mrz_txt):
            nuip_mrz = parse_nuip_from_mrz(mrz_txt)
            apellidos_mrz, nombres_mrz = parse_names_from_mrz(mrz_txt)
            fecha_nac_mrz = parse_birth_from_mrz(mrz_txt)
        else:
            nuip_mrz = None
            apellidos_mrz, nombres_mrz = (None, None)
            fecha_nac_mrz = None

        if nuip_mrz:
            resultado_ced["nuip"] = nuip_mrz
        else:
            resultado_ced["nuip"] = canonicalizar_nuip(resultado_ced.get("nuip"))

        if apellidos_mrz:
            resultado_ced["apellidos"] = apellidos_mrz
        if nombres_mrz:
            resultado_ced["nombres"] = nombres_mrz
        if (not (resultado_ced.get("fecha_nacimiento") or "").strip()) and fecha_nac_mrz:
            resultado_ced["fecha_nacimiento"] = fecha_nac_mrz

        resultado_ced["mrz_detectada"] = bool(_is_valid_mrz(mrz_txt))
        resultados["cedula"] = resultado_ced
        session["texto_cedula"] = texto_ced[:1000]
        session["mrz_texto"] = (mrz_txt or "")[:500]

    if "certificado" in rutas:
        texto_cert = extraer_texto_documento(rutas["certificado"])
        resultado_cert = estructurar_certificado_desde_texto(texto_cert)
        resultados["certificado"] = resultado_cert
        session["texto_certificado"] = texto_cert[:1000]

    if "rut" in rutas:
        texto_rut = extraer_texto_documento(rutas["rut"])
        resultados["rut"] = estructurar_rut_desde_texto(texto_rut)

    if "antecedentes_contraloria" in rutas:
        texto_contra = extraer_texto_documento(rutas["antecedentes_contraloria"])
        resultados["contraloria"] = estructurar_contraloria_desde_texto(texto_contra)

    if "antecedentes_procuraduria" in rutas:
        texto_proc = extraer_texto_documento(rutas["antecedentes_procuraduria"])
        resultados["procuraduria"] = estructurar_procuraduria_desde_texto(texto_proc)

    if "antecedentes_policia" in rutas:
        texto_poli = extraer_texto_documento(rutas["antecedentes_policia"])
        resultados["policia"] = estructurar_policia_desde_texto(texto_poli)

    if "antecedentes_rnmc" in rutas:
        texto_rnmc = extraer_texto_documento(rutas["antecedentes_rnmc"])
        resultados["rnmc"] = estructurar_rnmc_desde_texto(texto_rnmc)

    # Consolidar resultados
    cedula_ok = resultados.get("cedula", {}).get("ok", False)
    cert_ok = resultados.get("certificado", {}).get("ok", False)
    completo = cedula_ok and cert_ok and not faltan_documentos
    estado = "pendiente_revision_admin"

    session["ultimo_analisis"] = {
        "usuario_id": usuario_id,
        "resultados": resultados,
        "completo": completo,
        "estado": estado,
        "faltan_documentos": faltan_documentos,
    }

    mensajes = []
    if faltan_documentos:
        mensajes.append(f"Faltan documentos o campos: {', '.join(faltan_documentos)}")
    if not cedula_ok:
        mensajes.append("Cédula con observaciones o incompleta.")
    if not cert_ok:
        mensajes.append("Certificado con observaciones o incompleto.")

    msg = ("Documentos completos. " if completo else "Documentos INCOMPLETOS. ")
    if mensajes:
        msg += " ".join(mensajes) + " "
    msg += f"Estado: {estado}."
    session["mensaje_estado"] = msg

    return redirect(url_for("web.index"))