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

OMNI = {
    "main": SHOP / "assets/client-logos/omni-global-solutions-corrected-logo.png",
    "secondary": SHOP / "assets/client-logos/omni-global-solutions-horizontal-logo.png",
    "icon": SHOP / "assets/client-logos/omni-global-solutions-logo-mark.png",
}
OMNI_SCREENS = {
    "desktop": OUT / "source" / "omni-global-desktop.jpg",
    "mobile": OUT / "source" / "omni-global-mobile.jpg",
    "contact": OUT / "source" / "omni-global-contact.jpg",
}
OMNI_LIVE_URL = "https://ownyourweb.xyz/demos/omni-global-solutions.html"

# Color values sampled from the approved Omni Global Solutions marks in the public file set.
OMNI_COLORS = [
    ("Omni green", "#98C522"),
    ("Steel", "#5D5D5C"),
    ("Silver", "#A19F9F"),
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

    def placed_logo_alpha(self, c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, background="#FFFDF8") -> None:
        """Place a logo with its own transparency so the plate color stays even."""
        self.frame(c, x, y, w, h, fill=hex_color(background))
        dw, dh = fit_box(path, w, h, padding=22)
        im = Image.open(path).convert("RGBA")
        im.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, format="PNG", optimize=True)
        buf.seek(0)
        c.drawImage(ImageReader(buf), x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")

    def placed_photo(self, c: canvas.Canvas, path: Path, x: float, y: float, w: float, h: float, fill="#0B0B0B") -> None:
        """Place a screenshot, letterboxed inside a framed plate."""
        self.frame(c, x, y, w, h, fill=hex_color(fill))
        iw, ih = logo_size(path)
        pad = 0
        avail_w, avail_h = w - pad * 2, h - pad * 2
        scale = min(avail_w / iw, avail_h / ih)
        dw, dh = iw * scale, ih * scale
        img = ImageReader(str(path))
        c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, preserveAspectRatio=True, mask="auto")

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

    def link_line(self, c: canvas.Canvas, x: float, y: float, label: str, url: str, width: float) -> float:
        """Draw a visible text link and a clickable URI annotation."""
        c.setFillColor(INK)
        c.setFont("InterSemi", 10)
        c.drawString(x, y, label)
        tw = c.stringWidth(label, "InterSemi", 10)
        c.setStrokeColor(INK)
        c.setLineWidth(0.7)
        c.line(x, y - 1.4, x + tw, y - 1.4)
        c.linkURL(url, (x, y - 4, x + tw, y + 12), relative=0, thickness=0)
        y -= 13
        visible = url.removeprefix("https://").removeprefix("http://")
        c.setFillColor(MUTED)
        c.setFont("Inter", 8)
        for line in wrap(c, visible, "Inter", 8, width):
            lw = c.stringWidth(line, "Inter", 8)
            c.drawString(x, y, line)
            c.linkURL(url, (x, y - 3, x + lw, y + 10), relative=0, thickness=0)
            y -= 11
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
            "The work below is from Project Omni Global, a completed project for Omni Global Solutions LLC.",
        ],
        leading=15,
    )
    y -= 8
    frame_h = 340
    doc.placed_logo_alpha(c, OMNI["main"], MARGIN, y - frame_h, CONTENT_W, frame_h, background="#FFFDF8")
    doc.caption(
        c,
        MARGIN,
        y - frame_h - 16,
        "Omni Global Solutions LLC. Main mark, shown on a light ground. Example deliverable.",
        CONTENT_W,
    )

    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "The file set. The approved main mark, shown on light and dark grounds.",
            "The public example is a PNG of the main mark. The project delivery also includes JPG, a print-ready PDF, and the editable source file.",
        ],
        leading=15,
    )
    y -= 6
    gap = 14
    col_w = (CONTENT_W - gap) / 2
    frame_h = 300
    doc.placed_logo_alpha(c, OMNI["main"], MARGIN, y - frame_h, col_w, frame_h, background="#FFFDF8")
    doc.placed_logo_alpha(c, OMNI["main"], MARGIN + col_w + gap, y - frame_h, col_w, frame_h, background="#0B0B0B")
    cap_y = y - frame_h - 16
    doc.caption(c, MARGIN, cap_y, "Approved mark on paper. Example deliverable.", col_w - 8)
    doc.caption(c, MARGIN + col_w + gap, cap_y, "Approved mark on ink. Example deliverable.", col_w - 8)

    list_y = 86
    c.setFillColor(INK)
    c.setFont("InterSemi", 10)
    c.drawString(MARGIN, list_y + 48, "Files in this example set")
    c.setFont("Inter", 9.5)
    c.setFillColor(INK)
    files = [
        "PNG, for digital use",
        "JPG, for previews and uploads",
        "PDF, print-ready",
        "PSD, editable source",
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
            "The system below is from Project Omni Global, a completed project for Omni Global Solutions LLC.",
        ],
        leading=15,
    )
    y -= 8
    frame_h = 280
    doc.placed_logo_alpha(c, OMNI["main"], MARGIN, y - frame_h, CONTENT_W, frame_h)
    doc.caption(c, MARGIN, y - frame_h - 16, "Omni Global Solutions LLC. Main mark. Example deliverable.", CONTENT_W)

    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(c, y, ["Secondary mark and icon/mark from the same system."], leading=15)
    y -= 8
    gap = 14
    col_w = (CONTENT_W - gap) / 2
    cell_h = 380
    doc.placed_logo_alpha(c, OMNI["secondary"], MARGIN, y - cell_h, col_w, cell_h)
    doc.placed_logo_alpha(c, OMNI["icon"], MARGIN + col_w + gap, y - cell_h, col_w, cell_h)
    cap = y - cell_h - 16
    doc.caption(c, MARGIN, cap, "Secondary mark, wordmark. Example deliverable.", col_w - 8)
    doc.caption(c, MARGIN + col_w + gap, cap, "Icon/mark. Example deliverable.", col_w - 8)

    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "Color and type complete the kit.",
            "The color values below were sampled from the approved Omni Global Solutions marks in the public file set.",
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
    for i, (name, value) in enumerate(OMNI_COLORS):
        x = MARGIN + i * (chip_w + 8)
        doc.frame(c, x, y - chip_h, chip_w, chip_h, fill=hex_color(value))
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
        "Type specimen. Placeholder.",
        "A named typeface for these marks is not identified in the public file set or project records. This plate will be replaced with the original type delivery when that is confirmed.",
    )
    doc.caption(c, MARGIN, y - slot_h - 16, "Type specimen and font files are not identified in the public archive for Project Omni Global.", CONTENT_W)
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
            "The identity below is from Project Omni Global, a completed project for Omni Global Solutions LLC. It shows the kit included in this package.",
        ],
        leading=15,
    )
    y -= 10
    gap = 12
    main_h = 168
    doc.placed_logo_alpha(c, OMNI["main"], MARGIN, y - main_h, CONTENT_W, main_h)
    y = doc.caption(
        c,
        MARGIN,
        y - main_h - 14,
        "Omni Global Solutions LLC. Main mark. Example deliverable.",
        CONTENT_W,
    )
    y -= 18
    cell_w = (CONTENT_W - gap) / 2
    cell_h = 188
    items = [
        (OMNI["secondary"], "Secondary mark, wordmark. Example deliverable."),
        (OMNI["icon"], "Icon/mark. Example deliverable."),
    ]
    for i, (path, label) in enumerate(items):
        x = MARGIN + i * (cell_w + gap)
        doc.placed_logo_alpha(c, path, x, y - cell_h, cell_w, cell_h)
        doc.caption(c, x, y - cell_h - 14, label, cell_w - 6)

    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "Example deliverable ~ Project Omni Global.",
            "Live screenshots of the published landing page, desktop at 1440 and mobile at 390. The site is at ownyourweb.xyz/demos/omni-global-solutions.html.",
        ],
        leading=15,
    )
    y -= 10
    gap = 12
    # Side by side: desktop (wide) and mobile (tall), top-aligned, height set by the mobile frame.
    # Leave room under the captions for a clickable live-site line.
    mobile_h = 400
    iw, ih = logo_size(OMNI_SCREENS["mobile"])
    mobile_w = mobile_h * (iw / ih)
    desktop_w = CONTENT_W - gap - mobile_w
    dw, dh = logo_size(OMNI_SCREENS["desktop"])
    desktop_h = desktop_w * (dh / dw)
    doc.placed_photo(c, OMNI_SCREENS["desktop"], MARGIN, y - desktop_h, desktop_w, desktop_h, fill="#0B0B0B")
    doc.placed_photo(c, OMNI_SCREENS["mobile"], MARGIN + desktop_w + gap, y - mobile_h, mobile_w, mobile_h, fill="#0B0B0B")
    desk_end = doc.caption(
        c,
        MARGIN,
        y - desktop_h - 14,
        "Desktop, 1440. Example deliverable ~ Project Omni Global.",
        desktop_w,
    )
    mob_end = doc.caption(
        c,
        MARGIN + desktop_w + gap,
        y - mobile_h - 14,
        "Mobile, 390. Example deliverable ~ Project Omni Global.",
        mobile_w,
    )
    doc.link_line(
        c,
        MARGIN,
        min(desk_end, mob_end) - 16,
        "View the live site",
        OMNI_LIVE_URL,
        CONTENT_W,
    )

    c = doc.start_page()
    y = doc.header(c, H - 36)
    y = doc.text_block(
        c,
        y,
        [
            "Digital ownership included in the Launch Package: domain, mailing list, contact, forms, and automation.",
            "Only what exists on the live Project Omni Global site is shown here. Anything the site does not include stays a marked placeholder.",
        ],
        leading=15,
    )
    y -= 10
    iw, ih = logo_size(OMNI_SCREENS["contact"])
    contact_h = CONTENT_W * (ih / iw)
    doc.placed_photo(c, OMNI_SCREENS["contact"], MARGIN, y - contact_h, CONTENT_W, contact_h, fill="#0B0B0B")
    y = doc.caption(
        c,
        MARGIN,
        y - contact_h - 14,
        "Contact on the live site. Phone, email, and a Request Quote mailto button. Example deliverable ~ Project Omni Global.",
        CONTENT_W,
    )
    y -= 18
    gap = 12
    col_w = (CONTENT_W - gap) / 2
    row_h = 88
    slots = [
        (
            "Domain. Placeholder.",
            "A custom domain pointed at this site is not part of the live example. The page is published at ownyourweb.xyz/demos/omni-global-solutions.html.",
        ),
        (
            "Mailing list. Placeholder.",
            "The live site does not include a mailing list or signup.",
        ),
        (
            "Forms. Placeholder.",
            "The live site has no form. Quote requests use the mailto button shown in the contact example above.",
        ),
        (
            "Automation. Placeholder.",
            "The live site does not include an automation or intake flow.",
        ),
    ]
    for i, (title, body) in enumerate(slots):
        col, row = i % 2, i // 2
        x = MARGIN + col * (col_w + gap)
        top = y - row * (row_h + 8)
        doc.placeholder(c, x, top - row_h, col_w, row_h, title, body)
    doc.save()


def launch_link_uris(path: Path) -> list[str]:
    from pypdf import PdfReader

    uris: list[str] = []
    for page in PdfReader(str(path)).pages:
        annots = page.annotations or []
        for annot in annots:
            action = annot.get_object().get("/A")
            if action and action.get("/URI"):
                uris.append(str(action["/URI"]))
    return uris


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    register_fonts()
    for key, path in {**OMNI, **OMNI_SCREENS}.items():
        if not path.exists():
            raise SystemExit(f"Missing Omni Global artwork or screenshot: {path}")
    build_logo_starter()
    build_brand_kit()
    build_launch()
    for name in ("logo-starter.pdf", "brand-starter-kit.pdf", "launch-package.pdf"):
        p = OUT / name
        size = p.stat().st_size
        print(f"{name}: {size / 1024:.1f} KB")
        if size >= 3 * 1024 * 1024:
            raise SystemExit(f"{name} is over 3 MB")
    uris = launch_link_uris(OUT / "launch-package.pdf")
    print("launch-package.pdf link URIs:", uris)
    if OMNI_LIVE_URL not in uris:
        raise SystemExit("launch-package.pdf is missing a clickable link to the live demo")


if __name__ == "__main__":
    main()
