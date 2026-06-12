from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


def markdown_to_plain(md: str) -> str:
    text = md

    # Remove fenced code fences but keep content inside.
    text = re.sub(
        r"```[a-zA-Z0-9_-]*\n([\s\S]*?)```",
        lambda m: m.group(1),
        text,
    )

    # Strip heading markers.
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.M)

    # Blockquotes.
    text = re.sub(r"^>\s?", "", text, flags=re.M)

    # Tables: replace pipe with spacing.
    text = text.replace("|", "    ")

    # Inline code/emphasis markers.
    text = text.replace("**", "").replace("`", "")

    # Bullets.
    text = re.sub(r"^\s*-\s+", "• ", text, flags=re.M)

    # Collapse excessive whitespace (keep newlines).
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip() + "\n"


def wrap_lines(c: canvas.Canvas, line: str, max_width: float, font_size: int) -> list[str]:
    # Simple character-width approximation for Helvetica.
    avg_char_px = font_size * 0.52
    max_chars = max(10, int(max_width / avg_char_px))
    words = line.split(" ")
    if not words:
        return [""]
    out: list[str] = []
    cur = ""
    for w in words:
        if not cur:
            cand = w
        else:
            cand = f"{cur} {w}"
        if len(cand) <= max_chars:
            cur = cand
        else:
            out.append(cur)
            cur = w
    if cur:
        out.append(cur)
    return out


def render_pdf(plain_text: str, out_path: Path) -> None:
    page_w, page_h = letter
    left = 0.75 * inch
    right = page_w - 0.75 * inch
    top = page_h - 0.75 * inch
    bottom = 0.75 * inch
    max_width = right - left

    out_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(out_path), pagesize=letter)
    c.setTitle("AnganSakti 360 - Jury Presentation")

    font_name = "Helvetica"
    font_bold = "Helvetica-Bold"
    line_height = 12

    # Title page header
    c.setFont(font_bold, 16)
    y = top
    c.drawString(left, y, "AnganSakti 360 — Hackathon Jury Presentation")
    y -= 18
    c.setFont(font_name, 10)
    c.setFillColor(colors.grey)
    c.drawString(left, y, "Generated from docs/HACKATHON_JURY_PRESENTATION.md (plain-text layout)")
    c.setFillColor(colors.black)
    y -= 22
    c.setFont(font_name, 11)

    for raw in plain_text.splitlines():
        line = raw.rstrip()
        if not line:
            y -= line_height
            continue

        if y < bottom + line_height * 2:
            c.showPage()
            y = top
            c.setFont(font_name, 11)

        # Heuristic heading emphasis
        is_heading = bool(
            re.match(r"^(Part|Step|[0-9]+\.[0-9]+|[0-9]+\.|WDCW|AnganSakti|Public|Share|Report|My|Supervisor|District|State)", line)
        ) or line.isupper()

        font_size = 12 if is_heading and len(line) < 100 else 11
        c.setFont(font_bold if is_heading and font_size == 12 else font_name, font_size)

        for wrapped in wrap_lines(c, line, max_width, c._fontsize):  # type: ignore[attr-defined]
            if y < bottom + line_height * 2:
                c.showPage()
                y = top
                c.setFont(font_name, 11)
            c.drawString(left, y, wrapped)
            y -= line_height

    c.save()


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    md_path = root / "docs" / "HACKATHON_JURY_PRESENTATION.md"
    out_path = root / "docs" / "HACKATHON_JURY_PRESENTATION.pdf"

    md = md_path.read_text(encoding="utf-8")
    plain = markdown_to_plain(md)
    render_pdf(plain, out_path)
    print(f"Wrote: {out_path}")


if __name__ == "__main__":
    main()

