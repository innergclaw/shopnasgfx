#!/usr/bin/env python3
"""Build the three ShopNasGfx package example PDFs from real client work."""

from __future__ import annotations

import io
from pathlib import Path

from PIL import Image, ImageColor
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "examples"
FONT_DIR = Path("/tmp/example-fonts")
RASTER = Path("/tmp/example-rasters")
PORTFOLIO_LOGOS = Path("/workspace/shopnasgfx-portfolio/site/public/logos")
SHOP = ROOT

INK = HexColor("#0B0B0B")
PAPER = HexColor("#F6F0E7")
CREAM = HexColor("#FFFDF8")
MUTED = HexColor("#6F655C")
LINE = HexColor("#151515")
GOLD = HexColor("#D49A34")
LIME = HexColor("#C8FF2E")
PAGE = letter  # 612 x 792
W, H = PAGE
MARGIN = 48
CONTENT_W = W - MARGIN * 2

HONEY = {
    "horizontal": SHOP / "assets/showcase/honey-and-friends-horizontal.png",
    "stacked": SHOP / "assets/showcase/honey-and-friends-stacked.png",
    "badge": SHOP / "assets/showcase/honey-and-friends-badge.png",
    "monogram": SHOP / "assets/showcase/honey-and-friends-monogram.png",
}
BOXING = {
    "black": RASTER / "10-for-10-boxing-black.png",
    "white": RASTER / "10-for-10-boxing-white.png",
    "website": PORTFOLIO_LOGOS / "10-for-10-boxing-logo-black-website.png",
}

# Color values sampled from the Honey & Friends Events marks in the public file set.
HONEY_COLORS = [
    ("Honey gold", "#F0B40C"),
    ("Black", "#000000"),
    ("Paper", "#FFFDF8"),
]


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Anton", "/usr/share/fonts/truetype/sand-box/google/Anton/Anton-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("Inter", FONT_DIR / "Inter-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("InterSemi", FONT_DIR / "Inter-SemiBold.ttf"))
    pdfmetrics.registerFont(TTFont("InterBold", FONT_DIR / "Inter-Bold.ttf"))


def hex_color(value: str) -> Color:
    r, g, b = ImageColor.getrgb(value)
    return Color(r / 255, g / 255, b / 255)


def prep_logo(path: Path, max_px: int = 1600, background: str = "#FFFDF8") -> ImageReader:
    im = Image.open(path).convert("RGBA")
    im.thumbnail((max_px, max_px), Image.Resampling.LANCZOS)
    bg = Image.new("RGBA", im.size, ImageColor.getrgb(background) + (255,))
    composed = Image.alpha_composite(bg, im).convert("RGB")
    buf = io.BytesIO()
    composed.save(buf, format="JPEG", quality=88, optimize=True)
    buf.seek(0)
    return ImageReader(buf)


def logo_size(path: Path) -> tuple[int, int]:
    with Image.open(path) as im:
        return im.size


def fit_box(path: Path, box_w: float, box_h: float, padding: float = 16) -> tuple[float, float]:
    iw, ih = logo_size(path)
    avail_w, avail_h = box_w - padding * 2, box_h - padding * 2
    scale = min(avail_w / iw, avail_h / ih)
    return iw * scale, ih * scale


class Doc:
    def __init__(self, path: Path, title: str, package: str, price: str, pages: int):
        self.path = path
        self.title = title
        self.package = package
        self.price = price
        self.pages = pages
        self.page = 0
        self.c = canvas.Canvas(str(path), pagesize=PAGE)
        self.c.setTitle(title)
        self.c.setAuthor("SHOPNASGFX")
        self.c.setSubject("Example deliverable")
        self.c.setCreator("SHOPNASGFX")

    def start_page(self) -> canvas.Canvas:
        if self.page:
            self.c.showPage()
        self.page += 1
        c = self.c
        c.setFillColor(PAPER)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        # Top lime rule
        c.setFillColor(LIME)
        c.rect(0, H - 8, W, 8, fill=1, stroke=0)
        # Footer
        c.setFillColor(LINE)
        c.rect(MARGIN, 28, CONTENT_W, 0.75, fill=1, stroke=0)
        c.setFillColor(MUTED)
        c.setFont("Inter", 8)
        c.drawString(MARGIN, 16, "Example deliverable")
        c.drawRightString(W - MARGIN, 16, f"{self.page} of {self.pages}   shopnasgfx.com")
        return c

    def header(self, c: canvas.Canvas, y: float) -> float:
        # Eyebrow
        label = "EXAMPLE DELIVERABLE"
        c.setFont("InterBold", 8)
        tw = c.stringWidth(label, "InterBold", 8) + 16
        c.setFillColor(LIME)
        c.roundRect(MARGIN, y - 16, tw, 18, 9, fill=1, stroke=0)
        c.setFillColor(INK)
        c.drawString(MARGIN + 8, y - 11, label)
        y -= 40
        c.setFillColor(MUTED)
        c.setFont("InterSemi", 9)
        c.drawString(MARGIN, y, "SHOPNASGFX")
        y -= 34
        c.setFillColor(INK)
        c.setFont("Anton", 32)
        c.drawString(MARGIN, y, self.package.upper())
        y -= 20
        c.setFillColor(INK)
        c.setFont("InterSemi", 11)
        c.drawString(MARGIN, y, self.price)
        y -= 16
        c.setStrokeColor(LINE)
        c.setLineWidth(1)
        c.line(MARGIN, y, W - MARGIN, y)
        return y - 22

    def text_block(self, c: canvas.Canvas, y: float, lines: list[str], font="Inter", size=10.5, leading=16, color=INK, width=CONTENT_W) -> float:
        c.setFillColor(color)
        c.setFont(font, size)
        for raw in lines:
            for line in wrap(c, raw, font, size, width):
                c.drawString(MARGIN, y, line)
                y -= leading
        return y

    def frame(self, c: canvas.Canvas, x: float, y: float, w: float, h: float, fill=CREAM) -> None:
        c.setFillColor(fill)
        c.setStrokeColor(LINE)
        c.setLineWidth(1.25)
        c.rect(x, y, w, h, fill=1, stroke=1)

    def placed_logo(self, c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, background="#FFFDF8") -> None:
        self.frame(c, x, y, w, h, fill=hex_color(background))
        dw, dh = fit_box(path, w, h, padding=22)
        img = prep_logo(path, background=background)
        c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")

    def caption(self, c: canvas.Canvas, x: float, y: float, text: str, width: float) -> float:
        c.setFillColor(MUTED)
        c.setFont("InterSemi", 8)
        c.drawString(x, y, "EXAMPLE DELIVERABLE")
        y -= 13
        c.setFillColor(INK)
        c.setFont("Inter", 9)
        for line in wrap(c, text, "Inter", 9, width):
            c.drawString(x, y, line)
            y -= 12
        return y

    def placeholder(self, c: canvas.Canvas, x: float, y: float, w: float, h: float, title: str, body: str) -> None:
        self.frame(c, x, y, w, h, fill=HexColor("#EFE8DC"))
        c.setFillColor(INK)
        c.setFont("InterBold", 10)
        c.drawString(x + 16, y + h - 24, title)
        c.setFillColor(MUTED)
        c.setFont("Inter", 9)
        ty = y + h - 42
        for line in wrap(c, body, "Inter", 9, w - 32):
            c.drawString(x + 16, ty, line)
            ty -= 13

    def save(self) -> None:
        self.c.save()


def wrap(c: canvas.Canvas, text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines, cur = [], ""
    for word in words:
        trial = word if not cur else f"{cur} {word}"
        if c.stringWidth(trial, font, size) <= width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines or [""]


def build_logo_starter() -> None:
    doc = Doc(
        OUT / "logo-starter.pdf",
        "Logo Starter example ~ SHOPNASGFX",
        "Logo Starter",
        "$125, paid in full",
        pages=2,
    )
    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "A primary logo and the production-ready files needed to begin use.",
            "The work below is an example deliverable from a completed ShopNasGfx project for 10 for 10 Boxing.",
        ],
        leading=15,
    )
    y -= 8
    frame_h = 340
    doc.placed_logo(c, BOXING["black"], MARGIN, y - frame_h, CONTENT_W, frame_h, background="#FFFDF8")
    doc.caption(
        c,
        MARGIN,
        y - frame_h - 16,
        "10 for 10 Boxing. Primary mark, shown on a light ground.",
        CONTENT_W,
    )

    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "The file set. Black and white versions of the approved mark, prepared for light and dark grounds.",
            "The public example set for this project includes SVG and PNG. The delivery also includes the remaining production-ready files required to begin use.",
        ],
        leading=15,
    )
    y -= 6
    gap = 14
    col_w = (CONTENT_W - gap) / 2
    frame_h = 300
    doc.placed_logo(c, BOXING["black"], MARGIN, y - frame_h, col_w, frame_h, background="#FFFDF8")
    doc.placed_logo(c, BOXING["white"], MARGIN + col_w + gap, y - frame_h, col_w, frame_h, background="#0B0B0B")
    cap_y = y - frame_h - 16
    doc.caption(c, MARGIN, cap_y, "Black artwork on paper. Example deliverable.", col_w - 8)
    doc.caption(c, MARGIN + col_w + gap, cap_y, "White artwork on ink. Example deliverable.", col_w - 8)

    # File list
    list_y = 86
    c.setFillColor(INK)
    c.setFont("InterSemi", 10)
    c.drawString(MARGIN, list_y + 48, "Files in this example set")
    c.setFont("Inter", 9.5)
    c.setFillColor(INK)
    files = [
        "SVG, black and white",
        "PNG, black, for web use",
    ]
    fy = list_y + 32
    for item in files:
        c.drawString(MARGIN, fy, item)
        fy -= 14
    doc.save()


def build_brand_kit() -> None:
    doc = Doc(
        OUT / "brand-starter-kit.pdf",
        "Brand Starter Kit example ~ SHOPNASGFX",
        "Brand Starter Kit",
        "$300, paid in full",
        pages=3,
    )
    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "Main, secondary, and icon/mark, delivered as production-ready files.",
            "The system below is an example deliverable from a completed ShopNasGfx project for Honey & Friends Events.",
        ],
        leading=15,
    )
    y -= 8
    frame_h = 280
    doc.placed_logo(c, HONEY["horizontal"], MARGIN, y - frame_h, CONTENT_W, frame_h)
    doc.caption(c, MARGIN, y - frame_h - 16, "Honey & Friends Events. Main mark, horizontal. Example deliverable.", CONTENT_W)

    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(c, y, ["Secondary mark and icon/mark from the same system."], leading=15)
    y -= 8
    gap = 14
    col_w = (CONTENT_W - gap) / 2
    left_h = 250
    doc.placed_logo(c, HONEY["stacked"], MARGIN, y - left_h, col_w, left_h)
    doc.placed_logo(c, HONEY["badge"], MARGIN + col_w + gap, y - left_h, col_w, left_h)
    cap = y - left_h - 16
    cap_left = doc.caption(c, MARGIN, cap, "Secondary mark, stacked. Example deliverable.", col_w - 8)
    doc.caption(c, MARGIN + col_w + gap, cap, "Icon/mark, badge. Example deliverable.", col_w - 8)
    y = min(cap_left, cap) - 20
    # monogram full width but shorter
    mono_h = 170
    # prevent overlap with footer
    if y - mono_h < 80:
        mono_h = y - 80
    doc.placed_logo(c, HONEY["monogram"], MARGIN, y - mono_h, CONTENT_W, mono_h)
    doc.caption(c, MARGIN, y - mono_h - 16, "Icon/mark, monogram. Example deliverable.", CONTENT_W)

    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "Color and type complete the kit.",
            "The color values below were sampled from the approved Honey & Friends Events marks in the public file set.",
        ],
        leading=15,
    )
    y -= 10
    c.setFont("InterSemi", 10)
    c.setFillColor(INK)
    c.drawString(MARGIN, y, "Color")
    y -= 18
    chip_w = (CONTENT_W - 16) / 3
    chip_h = 92
    for i, (name, value) in enumerate(HONEY_COLORS):
        x = MARGIN + i * (chip_w + 8)
        doc.frame(c, x, y - chip_h, chip_w, chip_h, fill=hex_color(value))
        # label under chip
        c.setFillColor(INK)
        c.setFont("InterSemi", 8)
        c.drawString(x, y - chip_h - 14, name)
        c.setFont("Inter", 8)
        c.setFillColor(MUTED)
        c.drawString(x, y - chip_h - 26, value)
    y = y - chip_h - 50
    c.setFillColor(INK)
    c.setFont("InterSemi", 10)
    c.drawString(MARGIN, y, "Type")
    y -= 16
    slot_h = 220
    doc.placeholder(
        c,
        MARGIN,
        y - slot_h,
        CONTENT_W,
        slot_h,
        "Type pairing. Placeholder.",
        "A named type specimen and font files for this project are not in the public ShopNasGfx or portfolio file set. This plate will be replaced with the original type delivery when those files are provided.",
    )
    doc.caption(c, MARGIN, y - slot_h - 16, "Missing from the public archive: type specimen and font files for Honey & Friends Events.", CONTENT_W)
    doc.save()


def build_launch() -> None:
    doc = Doc(
        OUT / "launch-package.pdf",
        "Launch Package example ~ SHOPNASGFX",
        "Launch Package",
        "$750. 50% deposit ($375) to start, remainder due before final files.",
        pages=3,
    )
    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "Everything in the Brand Starter Kit, plus a landing page / website for digital ownership: domain, mailing list, contact, forms, and automation.",
            "The identity below is an example deliverable from a completed ShopNasGfx project for Honey & Friends Events. It shows the kit included in this package.",
        ],
        leading=15,
    )
    y -= 8
    gap = 12
    # four marks in a row might be tight; 2x2
    cell_w = (CONTENT_W - gap) / 2
    cell_h = 170
    items = [
        (HONEY["horizontal"], "Main mark, horizontal."),
        (HONEY["stacked"], "Secondary mark, stacked."),
        (HONEY["badge"], "Icon/mark, badge."),
        (HONEY["monogram"], "Icon/mark, monogram."),
    ]
    for i, (path, label) in enumerate(items):
        col, row = i % 2, i // 2
        x = MARGIN + col * (cell_w + gap)
        top = y - row * (cell_h + 36)
        doc.placed_logo(c, path, x, top - cell_h, cell_w, cell_h)
        doc.caption(c, x, top - cell_h - 14, f"{label} Example deliverable.", cell_w - 6)

    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "Landing page / website. The public ShopNasGfx site and portfolio do not include a finished landing page mockup for this package.",
            "The slots below mark that work. A real project will be placed here when the files are provided.",
        ],
        leading=15,
    )
    y -= 8
    slot_h = 420
    doc.placeholder(
        c,
        MARGIN,
        y - slot_h,
        CONTENT_W,
        slot_h,
        "Landing page mockup. Placeholder.",
        "No landing page or website mockup for a Launch Package is in the public ShopNasGfx repository or the ShopNasGfx portfolio. This plate should show a real homepage and key site views from a completed project: hero, contact, and the page structure used for digital ownership.",
    )
    doc.caption(c, MARGIN, y - slot_h - 16, "Missing from the public archive: a finished landing page or website mockup.", CONTENT_W)

    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "Digital ownership included in the Launch Package: domain, mailing list, contact, forms, and automation.",
            "None of these items are in the public ShopNasGfx or portfolio file set as finished examples. Each slot below is reserved for a real screen or document from a completed project.",
        ],
        leading=15,
    )
    y -= 10
    gap = 12
    col_w = (CONTENT_W - gap) / 2
    row_h = 200
    slots = [
        ("Domain. Placeholder.", "A real domain setup record or launch screenshot will be placed here."),
        ("Mailing list. Placeholder.", "A real mailing list or signup view will be placed here."),
        ("Contact and forms. Placeholder.", "A real contact page or form from a completed site will be placed here."),
        ("Automation. Placeholder.", "A real automation or intake flow from a completed project will be placed here."),
    ]
    for i, (title, body) in enumerate(slots):
        col, row = i % 2, i // 2
        x = MARGIN + col * (col_w + gap)
        top = y - row * (row_h + 16)
        doc.placeholder(c, x, top - row_h, col_w, row_h, title, body)
    doc.save()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    register_fonts()
    for key, path in BOXING.items():
        if not path.exists():
            raise SystemExit(f"Missing boxing artwork: {path}")
    for key, path in HONEY.items():
        if not path.exists():
            raise SystemExit(f"Missing Honey & Friends artwork: {path}")
    build_logo_starter()
    build_brand_kit()
    build_launch()
    for name in ("logo-starter.pdf", "brand-starter-kit.pdf", "launch-package.pdf"):
        p = OUT / name
        size = p.stat().st_size
        print(f"{name}: {size / 1024:.1f} KB")
        if size >= 3 * 1024 * 1024:
            raise SystemExit(f"{name} is over 3 MB")


if __name__ == "__main__":
    main()
