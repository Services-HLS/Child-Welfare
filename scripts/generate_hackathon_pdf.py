#!/usr/bin/env python3
"""Generate PDF from HACKATHON_PRESENTATION_GUIDE.md using fpdf2."""

from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    from fpdf import FPDF
except ImportError:
    print("Installing fpdf2...")
    import subprocess

    subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf2", "-q"])
    from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "HACKATHON_PRESENTATION_GUIDE.md"
PDF_PATH = ROOT / "docs" / "HACKATHON_PRESENTATION_GUIDE.pdf"


def sanitize(text: str) -> str:
    """Replace characters not supported by core Helvetica font."""
    replacements = {
        "\u2014": "-",
        "\u2013": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2022": "-",
        "\u2192": "->",
        "\u2190": "<-",
        "\u2713": "[x]",
        "\u2717": "[ ]",
        "\u00b7": "-",
        "\u2026": "...",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text.encode("latin-1", errors="replace").decode("latin-1")


def _wrap_chunks(text: str, width: int) -> list[str]:
    if len(text) <= width:
        return [text]
    return [text[i : i + width] for i in range(0, len(text), width)]


class GuidePDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "AnganSakti 360 - Hackathon Presentation Guide", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Page {self.page_no()}", align="C")


def write_line(pdf: GuidePDF, line: str, in_code: bool) -> None:
    line = sanitize(line.rstrip())
    if not line.strip():
        pdf.ln(3)
        return

    if line.startswith("```"):
        return

    pdf.set_x(pdf.l_margin)
    w = pdf.w - pdf.l_margin - pdf.r_margin

    if in_code:
        pdf.set_font("Courier", "", 8)
        pdf.set_text_color(40, 40, 40)
        for chunk in _wrap_chunks(line, 110):
            pdf.multi_cell(w, 4.5, chunk)
        pdf.ln(1)
        return

    if line.startswith("# "):
        pdf.ln(4)
        pdf.set_font("Helvetica", "B", 16)
        pdf.set_text_color(15, 23, 42)
        pdf.multi_cell(w, 8, line[2:].strip())
        pdf.ln(2)
        return

    if line.startswith("## "):
        pdf.ln(3)
        pdf.set_font("Helvetica", "B", 13)
        pdf.set_text_color(30, 58, 95)
        pdf.multi_cell(w, 7, line[3:].strip())
        pdf.ln(1)
        return

    if line.startswith("### "):
        pdf.ln(2)
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(30, 64, 175)
        pdf.multi_cell(w, 6, line[4:].strip())
        pdf.ln(1)
        return

    if line.startswith("#### "):
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(51, 65, 85)
        pdf.multi_cell(w, 5.5, line[5:].strip())
        pdf.ln(1)
        return

    if line.startswith("|") and "|" in line[1:]:
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(30, 41, 59)
        cells = [c.strip() for c in line.strip("|").split("|")]
        if all(re.match(r"^[-:]+$", c) for c in cells):
            return
        pdf.multi_cell(w, 4.5, " | ".join(cells))
        return

    if line.startswith("- ") or line.startswith("* "):
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(30, 41, 59)
        pdf.multi_cell(w, 5, f"  - {line[2:].strip()}")
        return

    m = re.match(r"^(\d+)\.\s+(.*)", line)
    if m:
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(30, 41, 59)
        pdf.multi_cell(w, 5, f"  {m.group(1)}. {m.group(2)}")
        return

    if line.startswith("**") and line.endswith("**"):
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(15, 23, 42)
        pdf.multi_cell(w, 5, line.strip("*"))
        return

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(30, 41, 59)
    clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", line)
    clean = re.sub(r"`([^`]+)`", r"\1", clean)
    clean = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", clean)
    pdf.multi_cell(w, 5, clean)


def build_pdf(md_path: Path, pdf_path: Path) -> None:
    text = md_path.read_text(encoding="utf-8")
    pdf = GuidePDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(18, 18, 18)
    pdf.add_page()

    in_code = False
    for raw_line in text.splitlines():
        if raw_line.strip().startswith("```"):
            in_code = not in_code
            continue
        write_line(pdf, raw_line, in_code)

    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(pdf_path))
    print(f"Generated: {pdf_path} ({pdf_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    md = MD_PATH
    out = PDF_PATH
    if len(sys.argv) > 1:
        md = Path(sys.argv[1])
    if len(sys.argv) > 2:
        out = Path(sys.argv[2])
    if not md.exists():
        raise SystemExit(f"Markdown not found: {md}")
    build_pdf(md, out)
