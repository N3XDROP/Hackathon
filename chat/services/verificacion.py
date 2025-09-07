def verificar_consistencia(resultados: dict) -> dict:
    """
    Recibe el JSON consolidado de todos los documentos y devuelve:
    {
      "alertas": [str],
      "coincidencia": bool
    }
    """
    alertas = []
    nombres = []
    cedulas = []

    # Cédula
    ced_cedula = resultados.get("resultado_cedula", {}).get("nombres")
    ced_cedula_ap = resultados.get("resultado_cedula", {}).get("apellidos")
    ced_cedula_id = resultados.get("resultado_cedula", {}).get("nuip")
    if ced_cedula and ced_cedula_ap:
        nombres.append(f"{ced_cedula_ap} {ced_cedula}")
    if ced_cedula_id:
        cedulas.append(ced_cedula_id)

    # Certificado médico
    cert_nombre = resultados.get("resultado_certificado", {}).get("nombre_paciente")
    if cert_nombre:
        nombres.append(cert_nombre)

    # RUT
    rut = resultados.get("resultado_rut", {})
    if rut.get("nombre"):
        nombres.append(rut["nombre"])
    if rut.get("cedula"):
        cedulas.append(rut["cedula"])

    # Contraloría / RNMC / Procuraduría / Policía
    for doc in ["resultado_antecedentes_contraloria", 
                "resultado_antecedentes_policia",
                "resultado_antecedentes_procuraduria",
                "resultado_antecedentes_rnmc"]:
        d = resultados.get(doc, {})
        if d.get("nombre"):
            nombres.append(d["nombre"])
        if d.get("cedula"):
            cedulas.append(d["cedula"])

    # Validaciones
    if len(set(nombres)) > 1:
        alertas.append(f"⚠️ Nombres no coinciden entre documentos: {set(nombres)}")
    if len(set(cedulas)) > 1:
        alertas.append(f"⚠️ Cédulas no coinciden entre documentos: {set(cedulas)}")

    return {
        "alertas": alertas,
        "coincidencia": not alertas
    }