from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    ListFlowable,
    ListItem,
    PageBreak,
    HRFlowable,
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "TitleCustom", parent=styles["Title"], fontSize=20, spaceAfter=4, textColor=colors.HexColor("#1A1A1A")
)
subtitle_style = ParagraphStyle(
    "SubtitleCustom", parent=styles["Normal"], fontSize=11, textColor=colors.HexColor("#737373"), spaceAfter=14
)
h2_style = ParagraphStyle(
    "H2Custom", parent=styles["Heading2"], fontSize=13, spaceBefore=14, spaceAfter=6, textColor=colors.HexColor("#FF4F2B")
)
body_style = ParagraphStyle(
    "BodyCustom", parent=styles["Normal"], fontSize=10, leading=15, alignment=TA_LEFT, spaceAfter=4
)
bullet_style = ParagraphStyle(
    "BulletCustom", parent=styles["Normal"], fontSize=10, leading=14.5, spaceAfter=3
)
small_style = ParagraphStyle(
    "SmallCustom", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#737373")
)

def build_page(story, lang):
    if lang == "en":
        story.append(Paragraph("Outcome Guard", title_style))
        story.append(Paragraph("Catching silent failures in workflow automation (n8n) — one-page overview for Tevi", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#3C3C3C")))

        story.append(Paragraph("The Problem", h2_style))
        story.append(Paragraph(
            "Automation platforms like n8n and Zapier can report a workflow as “successful” even when "
            "the real-world outcome never happened — an API returns HTTP 200 with an error hidden in the "
            "body, a filter lets bad data through, a field maps correctly but with the wrong value. "
            "Native error handling only catches thrown errors, not this “silent failure” class of bug.",
            body_style,
        ))

        story.append(Paragraph("The Evidence", h2_style))
        evidence = [
            "An analysis of 6,000+ real n8n workflows identified silent, mid-workflow failures as a named, "
            "recurring failure pattern — workflows stop or misbehave while still reporting success.",
            "n8n's own community forum has open threads of users hit by Cloudflare (HTTP 520) interrupting "
            "workflows mid-run — the exact class of external dependency breakage this tool targets.",
            "The identical “silent success” problem is independently documented for Zapier "
            "(“the failure mode nobody talks about — a green checkmark that did exactly the wrong "
            "thing”), confirming this spans the whole workflow-automation category, not just n8n.",
            "A small existing product (NotiLens) already monetizes “know when your Zaps break silently” "
            "for Zapier specifically — proof buyers pay for this, and a signal that n8n's equivalent "
            "audience is still open.",
            "Cloudflare is tightening default rules on September 15, 2026 to block “Agent” category "
            "bots by default — external-dependency breakage for automations is about to get more common, "
            "not less.",
            "n8n publishes a documented, supported path to build and publish community nodes (CLI tooling, "
            "verification guidelines, marketplace listing) — confirmed technically buildable by a small team.",
        ]
        story.append(ListFlowable(
            [ListItem(Paragraph(e, bullet_style), leftIndent=10, bulletColor=colors.HexColor("#FF4F2B")) for e in evidence],
            bulletType="bullet",
        ))

        story.append(Paragraph("The Idea", h2_style))
        story.append(Paragraph(
            "An n8n community node, “Outcome Guard”, placed after any workflow step you don't fully "
            "trust. It checks the <i>real</i> outcome (a field is correct, a response has no hidden error, an "
            "independent re-fetch confirms the record exists) and throws a normal n8n error on failure — "
            "plugging straight into n8n's existing Error Workflow / Slack / PagerDuty alerting. No new dashboard "
            "to learn. Monetization follows the standard pattern in this ecosystem: free/open node to get "
            "distribution through n8n's marketplace, paid hosted service for advanced checks and history.",
            body_style,
        ))

        story.append(Paragraph("Honest Assessment", h2_style))
        story.append(Paragraph(
            "Score: 8/10. Real, documented, currently-live pain; a confirmed distribution channel (n8n's node "
            "marketplace); no direct n8n-specific competitor found. Not a 10: total addressable market is "
            "scoped to n8n's user base, a Zapier-side competitor already exists (proof of demand, not a "
            "monopoly on it), and a bigger player could absorb the feature later. Recommended next step: ship "
            "a working prototype and get it in front of 5–10 real n8n users before investing further.",
            body_style,
        ))

        story.append(Spacer(1, 10))
        story.append(Paragraph("Prepared by Claude · research-backed, sources available on request", small_style))

    else:
        story.append(Paragraph("Outcome Guard", title_style))
        story.append(Paragraph("Detectar fallas silenciosas en la automatización de flujos de trabajo (n8n) — resumen de una página para Tevi", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#3C3C3C")))

        story.append(Paragraph("El Problema", h2_style))
        story.append(Paragraph(
            "Plataformas de automatización como n8n y Zapier pueden marcar un flujo de trabajo como "
            "“exitoso” aunque el resultado real nunca haya ocurrido: una API devuelve HTTP 200 con un "
            "error escondido en el cuerpo de la respuesta, un filtro deja pasar datos incorrectos, un campo se "
            "mapea en el lugar correcto pero con el valor equivocado. El manejo de errores nativo solo detecta "
            "errores que se lanzan explícitamente, no este tipo de “falla silenciosa”.",
            body_style,
        ))

        story.append(Paragraph("La Evidencia", h2_style))
        evidence_es = [
            "Un análisis de más de 6.000 flujos de trabajo reales de n8n identificó las fallas "
            "silenciosas a mitad de flujo como un patrón de falla recurrente y ya nombrado: el flujo se "
            "detiene o falla mientras sigue reportando éxito.",
            "El propio foro de la comunidad de n8n tiene hilos abiertos de usuarios afectados por Cloudflare "
            "(HTTP 520) interrumpiendo flujos en pleno funcionamiento — exactamente el tipo de falla de "
            "dependencia externa que esta herramienta ataca.",
            "El mismo problema de “éxito silencioso” está documentado de forma independiente "
            "para Zapier (“el modo de falla del que nadie habla: un tilde verde que hizo exactamente lo "
            "incorrecto”), confirmando que el problema abarca toda la categoría de automatización, "
            "no solo n8n.",
            "Ya existe un producto pequeño (NotiLens) que monetiza “saber cuándo tus Zaps fallan "
            "silenciosamente” específicamente para Zapier — prueba de que la gente paga por esto, "
            "y una señal de que el público equivalente en n8n sigue sin cubrir.",
            "Cloudflare endurece sus reglas por defecto el 15 de septiembre de 2026 para bloquear bots "
            "categoría “Agent” por defecto — las fallas por dependencias externas en "
            "automatizaciones se van a volver más comunes, no menos.",
            "n8n publica un camino documentado y soportado para construir y publicar nodos de comunidad "
            "(herramientas CLI, guías de verificación, listado en el marketplace) — confirmado "
            "como técnicamente construible por un equipo chico.",
        ]
        story.append(ListFlowable(
            [ListItem(Paragraph(e, bullet_style), leftIndent=10, bulletColor=colors.HexColor("#FF4F2B")) for e in evidence_es],
            bulletType="bullet",
        ))

        story.append(Paragraph("La Idea", h2_style))
        story.append(Paragraph(
            "Un nodo de comunidad de n8n, “Outcome Guard”, que se coloca después de cualquier paso "
            "del flujo en el que no confíes del todo. Verifica el resultado <i>real</i> (un campo es "
            "correcto, una respuesta no tiene un error oculto, una nueva consulta independiente confirma que el "
            "registro existe) y lanza un error normal de n8n si falla — conectándose directamente con "
            "el Error Workflow / Slack / PagerDuty que ya existen en n8n. Sin dashboard nuevo que aprender. La "
            "monetización sigue el patrón estándar del ecosistema: nodo gratuito/abierto para "
            "conseguir distribución a través del marketplace de n8n, servicio alojado pago para "
            "verificaciones avanzadas e historial.",
            body_style,
        ))

        story.append(Paragraph("Evaluación Honesta", h2_style))
        story.append(Paragraph(
            "Puntaje: 8/10. Dolor real, documentado y vigente hoy; canal de distribución confirmado "
            "(marketplace de nodos de n8n); no se encontró un competidor específico para n8n. No es un "
            "10: el mercado direccionable está acotado a la base de usuarios de n8n, ya existe un "
            "competidor del lado de Zapier (prueba de demanda, no un monopolio sobre ella), y un jugador más "
            "grande podría absorber la funcionalidad más adelante. Próximo paso recomendado: "
            "lanzar un prototipo funcional y mostrarlo a 5–10 usuarios reales de n8n antes de invertir más.",
            body_style,
        ))

        story.append(Spacer(1, 10))
        story.append(Paragraph("Preparado por Claude · respaldado por investigación, fuentes disponibles a pedido", small_style))


def main():
    doc = SimpleDocTemplate(
        "Outcome-Guard-Overview-EN-ES.pdf",
        pagesize=A4,
        topMargin=20 * mm,
        bottomMargin=18 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
    )
    story = []
    build_page(story, "en")
    story.append(PageBreak())
    build_page(story, "es")
    doc.build(story)
    print("done")


if __name__ == "__main__":
    main()
