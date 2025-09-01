# routes/analizar.py
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
    _is_valid_mrz,  # validador de MRZ (útil/no basura)
)
from services.llm_struct import (
    estructurar_cedula_desde_texto,
    estructurar_certificado_desde_texto
)

analizar_bp = Blueprint("analizar", __name__)

# Integración con DB (si existe)
try:
    from db import registrar_envio_documentos
except Exception:
    registrar_envio_documentos = None


@analizar_bp.post("/analizar")
def analizar():
    # 1) Archivos requeridos
    if "cedula" not in request.files or "certificado" not in request.files:
        return Response("Faltan archivos: cédula y certificado.", 400)

    f_ced = request.files["cedula"]
    f_cert = request.files["certificado"]
    usuario_id = (request.form.get("usuario_id") or "").strip() or "anon"

    # 2) Validaciones iniciales
    if f_ced.filename == "" or f_cert.filename == "":
        return Response("Archivo sin nombre.", 400)
    if not (extension_permitida(f_ced.filename) and extension_permitida(f_cert.filename)):
        return Response(f"Extensiones permitidas: {', '.join(sorted(EXTENSIONES_PERMITIDAS))}.", 400)

    # 3) Guardar en /uploads/<usuario_id>/
    ruta_ced = guardar_archivo(f_ced, usuario_id)
    ruta_cert = guardar_archivo(f_cert, usuario_id)

    # 4) Evitar duplicados triviales
    if hash_sha256(ruta_ced) == hash_sha256(ruta_cert):
        return Response("Los dos archivos son idénticos. Sube documentos distintos.", 400)

    # 5) Sanity checks mínimos
    observ = []
    if not validar_archivo_basico(ruta_ced):
        observ.append("Cédula vacía o ilegible.")
    if not validar_archivo_basico(ruta_cert):
        observ.append("Certificado vacío o ilegible.")
    if observ:
        return Response(" ; ".join(observ), 400)

    # 6) OCR IA (texto plano desde imagen/PDF)
    texto_ced = extraer_texto_documento(ruta_ced)
    texto_cert = extraer_texto_documento(ruta_cert)

    # 6.1) MRZ: primero con Tesseract; si no es válida, reconstruir desde el texto OCR
    mrz_txt = extraer_mrz_texto(ruta_ced)
    if not _is_valid_mrz(mrz_txt):
        mrz_txt = mrz_desde_texto_ocr(texto_ced)

    # 6.2) Adjunta MRZ válida al texto a enviar al LLM (para dar contexto)
    if _is_valid_mrz(mrz_txt):
        texto_ced += "\n\n[MRZ]\n" + mrz_txt

    # 7) Estructurar con LLM (sobre todo el texto disponible)
    resultado_ced = estructurar_cedula_desde_texto(texto_ced)
    resultado_cert = estructurar_certificado_desde_texto(texto_cert)

    # 7.1) Parseos desde MRZ (solo si válida)
    if _is_valid_mrz(mrz_txt):
        nuip_mrz = parse_nuip_from_mrz(mrz_txt)
        apellidos_mrz, nombres_mrz = parse_names_from_mrz(mrz_txt)
        fecha_nac_mrz = parse_birth_from_mrz(mrz_txt)
    else:
        nuip_mrz = None
        apellidos_mrz, nombres_mrz = (None, None)
        fecha_nac_mrz = None

    # 7.2) Consolidar: priorizar MRZ; si no hay, normalizar/usar lo del LLM
    # NUIP
    if nuip_mrz:
        resultado_ced["nuip"] = nuip_mrz
    else:
        resultado_ced["nuip"] = canonicalizar_nuip(resultado_ced.get("nuip"))

    # Nombres / Apellidos
    if apellidos_mrz:
        resultado_ced["apellidos"] = apellidos_mrz
    if nombres_mrz:
        resultado_ced["nombres"] = nombres_mrz

    # Fecha de nacimiento
    if (not (resultado_ced.get("fecha_nacimiento") or "").strip()) and fecha_nac_mrz:
        resultado_ced["fecha_nacimiento"] = fecha_nac_mrz

    # Bandera MRZ
    resultado_ced["mrz_detectada"] = bool(_is_valid_mrz(mrz_txt))

    # 8) Estado general
    cedula_ok = bool(resultado_ced.get("ok"))
    cert_ok = bool(resultado_cert.get("ok"))
    completo = cedula_ok and cert_ok
    estado = "pendiente_revision_admin"

    # 9) Resúmenes legibles para UI
    resumen_cedula = {
        "NUIP": (resultado_ced.get("nuip") or "").strip(),
        "Nombres": (resultado_ced.get("nombres") or "").strip(),
        "Apellidos": (resultado_ced.get("apellidos") or "").strip(),
        "Fecha de nacimiento": (resultado_ced.get("fecha_nacimiento") or "").strip(),
        "Encabezados válidos": resultado_ced.get("encabezados_validos"),
        "República detectada": resultado_ced.get("republica_detectada"),
        "MRZ detectada": resultado_ced.get("mrz_detectada"),
    }
    tipo_doc = (resultado_cert.get("tipo_documento_detectado") or "").lower()
    resumen_certificado = {
        "Tipo detectado": tipo_doc or "desconocido",
        "Nombre paciente": (resultado_cert.get("nombre_paciente") or "").strip(),
        "Fecha": (resultado_cert.get("fecha") or "").strip(),
        "Resultado": (resultado_cert.get("resultado") or "").strip(),
        "Médico": (resultado_cert.get("nombre_medico") or "").strip(),
        "Registro profesional": (resultado_cert.get("registro_profesional") or "").strip(),
        "Firma detectada": resultado_cert.get("firma_detectada"),
    }

    # 10) Guardar en sesión (para renderizar en index)
    session["ultimo_analisis"] = {
        "usuario_id": usuario_id,
        "cedula_ok": cedula_ok,
        "resultado_cedula": resultado_ced,
        "resumen_cedula": resumen_cedula,
        "cert_ok": cert_ok,
        "resultado_certificado": resultado_cert,
        "resumen_certificado": resumen_certificado,
        "completo": completo,
        "estado": estado,
        "ruta_cedula": ruta_ced,
        "ruta_certificado": ruta_cert,
        "texto_cedula": texto_ced[:1000],       # opcional para debug
        "texto_certificado": texto_cert[:1000], # opcional para debug
        "mrz_texto": (mrz_txt or "")[:500],
    }

    # 11) Registrar en DB si está disponible (no crítico)
    if registrar_envio_documentos:
        try:
            from json import dumps
            registrar_envio_documentos(
                usuario_id=usuario_id,
                ruta_cedula=ruta_ced,
                ruta_certificado=ruta_cert,
                completo=completo,
                estado=estado,
                observaciones=None,
                json_cedula=dumps(resultado_ced, ensure_ascii=False),
                json_certificado=dumps(resultado_cert, ensure_ascii=False),
            )
        except Exception as e:
            print("DB error:", e)

    # 12) Mensaje al cliente (para banner en index)
    mensajes = []
    if not cedula_ok:
        miss = resultado_ced.get("missing_fields") or []
        mensajes.append(f"Cédula con observaciones: {', '.join(miss) if miss else 'revise datos legibles.'}")
    if not cert_ok:
        miss = resultado_cert.get("missing_fields") or []
        if tipo_doc == "afiliacion":
            mensajes.append("Subiste 'certificado de afiliación', se requiere 'certificado MÉDICO de aptitud'.")
        else:
            mensajes.append(f"Certificado con observaciones: {', '.join(miss) if miss else 'faltan campos.'}")

    msg = ("Documentos completos. " if completo else "Documentos INCOMPLETOS. ")
    if mensajes:
        msg += " ".join(mensajes) + " "
    msg += f"Estado: {estado}."
    session["mensaje_estado"] = msg

    # 13) Volver al index (misma página)
    return redirect(url_for("web.index"))