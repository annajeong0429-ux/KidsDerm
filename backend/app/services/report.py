"""진료용 리포트 PDF 생성 (요구사항 F14).

경과 자료를 A4 한 장으로 묶어, 보호자가 진료 때 의료진에게 보여줄 수 있게 만든다.
문서 안에서도 "진단이 아니라 관찰 기록 요약"이라는 점을 분명히 밝힌다.
"""

import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from app.core import photo_storage
from app.dtos.cases import CaseDetailResponse, PhotoRecordResponse
from app.dtos.medical import DiagnosisResponse

# 도커 이미지에 fonts-nanum 패키지로 설치되는 글꼴 경로.
_FONT_CANDIDATES = [
    ("NanumGothic", "/usr/share/fonts/truetype/nanum/NanumGothic.ttf"),
    ("NanumGothicBold", "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf"),
]

_FONT = "Helvetica"
_FONT_BOLD = "Helvetica-Bold"
_fonts_ready = False


def _ensure_fonts() -> None:
    """한글 글꼴을 한 번만 등록한다. 글꼴이 없으면 기본 글꼴로 물러난다
    - 한글은 깨지지만 PDF 생성 자체가 실패하는 것보다는 낫다."""
    global _FONT, _FONT_BOLD, _fonts_ready
    if _fonts_ready:
        return
    try:
        for name, path in _FONT_CANDIDATES:
            pdfmetrics.registerFont(TTFont(name, path))
        _FONT, _FONT_BOLD = "NanumGothic", "NanumGothicBold"
    except Exception:
        pass
    _fonts_ready = True


_W, _H = A4
_MARGIN = 56.0  # 약 20mm
_CONTENT_W = _W - _MARGIN * 2

_MUTED = colors.HexColor("#6b7280")
_LINE = colors.HexColor("#d1d5db")
_ACCENT = colors.HexColor("#1f2937")

_SYMPTOM_LABEL = ["없음", "약간", "보통", "심함", "매우 심함"]

ALL_SECTIONS = ("photos", "graph", "symptoms", "prescription")


def _level_text(value: int) -> str:
    """자가보고 1~5를 사람이 읽을 말로 바꾼다."""
    if 1 <= value <= 5:
        return f"{_SYMPTOM_LABEL[value - 1]}({value})"
    return str(value)


def _fever_text(celsius: float) -> str:
    if celsius >= 38.0:
        return f"{celsius:.1f}C 고열"
    if celsius >= 37.5:
        return f"{celsius:.1f}C 미열"
    return f"{celsius:.1f}C"


def _evenly_pick(items: list, limit: int) -> list:
    """항목이 많으면 처음과 마지막을 반드시 포함해 고르게 골라낸다."""
    if len(items) <= limit:
        return items
    step = (len(items) - 1) / (limit - 1)
    return [items[round(i * step)] for i in range(limit)]


def _clip(text: str, limit: int) -> str:
    return text if len(text) <= limit else text[: limit - 1] + "..."


class ReportBuilder:
    """A4 한 장짜리 리포트를 위에서 아래로 순서대로 그려나간다.

    PDF 좌표는 왼쪽 아래가 (0,0)이라 위에서부터 쓰려면 y를 줄여가며 그려야 한다.
    self.y가 "지금 그릴 위치"이고, 무언가 그릴 때마다 그만큼 아래로 내린다.
    """

    def __init__(
        self,
        child_name: str,
        detail: CaseDetailResponse,
        diagnoses: list[DiagnosisResponse],
        generated_on: str,
        image_paths: dict[int, str],
    ):
        _ensure_fonts()
        self.child_name = child_name
        self.detail = detail
        self.diagnoses = diagnoses
        self.generated_on = generated_on
        # 사진 파일의 저장 경로는 API 응답(DTO)에 담지 않는다 - 서버 내부 경로를
        # 클라이언트에 알려줄 이유가 없기 때문이다. 그래서 리포트를 만들 때만
        # 따로 {사진 id: 경로} 형태로 받아서 쓴다.
        self.image_paths = image_paths
        self.buffer = io.BytesIO()
        self.c = canvas.Canvas(self.buffer, pagesize=A4)
        self.c.setTitle(f"{child_name} 경과 관찰 리포트")
        self.y = _H - _MARGIN

    # ---------- 그리기 도우미 ----------

    def _text(
        self,
        s: str,
        *,
        size: float = 10,
        bold: bool = False,
        gap: float = 14,
        color=colors.black,
        x: float | None = None,
    ) -> None:
        self.c.setFont(_FONT_BOLD if bold else _FONT, size)
        self.c.setFillColor(color)
        self.c.drawString(_MARGIN if x is None else x, self.y, s)
        self.y -= gap

    def _section(self, title: str) -> None:
        self.y -= 8
        self.c.setStrokeColor(_LINE)
        self.c.setLineWidth(0.5)
        self.c.line(_MARGIN, self.y + 12, _W - _MARGIN, self.y + 12)
        self._text(title, size=10.5, bold=True, gap=16, color=_ACCENT)

    # ---------- 각 구역 ----------

    def _header(self) -> None:
        case = self.detail
        self._text("경과 관찰 리포트", size=17, bold=True, gap=8)
        self._text("키즈덤AI · 보호자가 가정에서 기록한 관찰 자료 요약본", size=8.5, gap=20, color=_MUTED)

        part = case.body_part + (f" ({case.body_part_detail})" if case.body_part_detail else "")
        self._text(f"{self.child_name} · {part}", size=12.5, bold=True, gap=15)
        self._text(
            f"관찰 {case.days_observed}일째 · 기록 {case.photo_count}건 · 추세 {case.status}"
            f"   |   생성일 {self.generated_on}",
            size=9,
            gap=8,
            color=_MUTED,
        )

    def _photos(self) -> None:
        photos = self.detail.photos
        if not photos:
            return
        self._section("시계열 사진")

        # 한 줄에 최대 6장. 많으면 처음과 마지막을 포함해 고르게 골라낸다.
        picked = _evenly_pick(photos, 6)
        box = 68.0
        gap = 8.0
        x = _MARGIN
        top = self.y

        for shot in picked:
            self._draw_photo(shot, x, top - box, box)
            self.c.setFont(_FONT, 7)
            self.c.setFillColor(_MUTED)
            self.c.drawString(x, top - box - 10, shot.taken_at.strftime("%m/%d"))
            self.c.drawString(x, top - box - 19, f"{shot.area_ratio:.1f}%")
            x += box + gap

        self.y = top - box - 30

    def _draw_photo(self, shot: PhotoRecordResponse, x: float, y: float, size: float) -> None:
        """사진이 저장돼 있으면 실제 이미지를, 없으면 대표 색상 사각형을 그린다."""
        stored = self.image_paths.get(shot.id)
        if stored:
            try:
                data = photo_storage.load(stored)
                self.c.drawImage(
                    ImageReader(io.BytesIO(data)),
                    x,
                    y,
                    width=size,
                    height=size,
                    preserveAspectRatio=True,
                    anchor="c",
                    mask="auto",
                )
                return
            except Exception:
                # 복호화·디코딩이 실패해도 리포트 전체를 실패시키지 않고 색상으로 대체한다.
                pass
        try:
            self.c.setFillColor(colors.HexColor(shot.image_color))
        except Exception:
            self.c.setFillColor(_LINE)
        self.c.rect(x, y, size, size, stroke=0, fill=1)

    def _graph(self) -> None:
        photos = self.detail.photos
        if not photos:
            return
        self._section("병변 면적 비율 변화")

        h = 78.0
        top = self.y
        bottom = top - h
        ratios = [p.area_ratio for p in photos]
        peak = max(max(ratios), 1.0)

        self.c.setStrokeColor(_LINE)
        self.c.setLineWidth(0.7)
        self.c.line(_MARGIN, bottom, _MARGIN + _CONTENT_W, bottom)
        self.c.line(_MARGIN, bottom, _MARGIN, top)

        def px(i: int) -> float:
            if len(photos) == 1:
                return _MARGIN + _CONTENT_W / 2
            return _MARGIN + (i * _CONTENT_W) / (len(photos) - 1)

        def py(v: float) -> float:
            return bottom + (v / peak) * (h - 10)

        self.c.setStrokeColor(colors.HexColor("#111827"))
        self.c.setLineWidth(1.2)
        for i in range(len(photos) - 1):
            self.c.line(px(i), py(ratios[i]), px(i + 1), py(ratios[i + 1]))
        self.c.setFillColor(colors.HexColor("#111827"))
        for i, v in enumerate(ratios):
            self.c.circle(px(i), py(v), 2.2, stroke=0, fill=1)

        # 처방 시점 세로선 - "약을 쓰기 시작한 뒤로 어떻게 달라졌는지"가 이 그래프의 핵심이다.
        self._draw_prescription_marker(px, bottom, top)

        self.y = bottom - 12
        self._text(
            f"최초 {self.detail.baseline_area_ratio:.1f}%  ->  최근 {self.detail.latest_area_ratio:.1f}%"
            f"   (추세: {self.detail.status})",
            size=9.5,
            gap=13,
        )

    def _draw_prescription_marker(self, px, bottom: float, top: float) -> None:
        if not self.diagnoses:
            return
        first = min(self.diagnoses, key=lambda d: d.visited_on)
        dates = [p.taken_at.date() for p in self.detail.photos]
        if len(dates) < 2 or first.visited_on < dates[0] or first.visited_on > dates[-1]:
            return

        # 진단일이 촬영 시점들 사이 어디쯤인지 비율로 환산한다.
        idx = 0.0
        for i in range(len(dates) - 1):
            if dates[i] <= first.visited_on <= dates[i + 1]:
                span = (dates[i + 1] - dates[i]).days or 1
                idx = i + (first.visited_on - dates[i]).days / span
                break

        left, right = px(0), px(len(dates) - 1)
        x = left + (right - left) * (idx / (len(dates) - 1))
        self.c.setStrokeColor(_MUTED)
        self.c.setLineWidth(0.6)
        self.c.setDash(2, 2)
        self.c.line(x, bottom, x, top)
        self.c.setDash()
        self.c.setFont(_FONT, 7)
        self.c.setFillColor(_MUTED)
        self.c.drawString(x + 2, top - 7, "처방")

    def _symptoms(self) -> None:
        rows = [(p, p.symptoms) for p in self.detail.photos if p.symptoms]
        if not rows:
            return
        self._section("보호자 자가보고 증상")

        cols = [_MARGIN, _MARGIN + 70, _MARGIN + 145, _MARGIN + 220, _MARGIN + 295, _MARGIN + 380]
        self.c.setFont(_FONT_BOLD, 8.5)
        self.c.setFillColor(_MUTED)
        for label, x in zip(["날짜", "가려움", "진물", "통증", "발열", "비고"], cols):
            self.c.drawString(x, self.y, label)
        self.y -= 12

        # 최근 5건만 싣는다 - 한 장에 담아야 하고, 의료진이 보는 건 최근 경과다.
        for photo, sym in rows[-5:]:
            self.c.setFont(_FONT, 8.5)
            self.c.setFillColor(colors.black)
            values = [
                photo.taken_at.strftime("%Y-%m-%d"),
                _level_text(sym.itching),
                _level_text(sym.oozing),
                _level_text(sym.pain),
                _fever_text(sym.fever_celsius),
                "신규 병변" if sym.new_lesion else "-",
            ]
            for value, x in zip(values, cols):
                self.c.drawString(x, self.y, value)
            self.y -= 12

        memos = [(p.taken_at.strftime("%m/%d"), s.memo) for p, s in rows if s and s.memo]
        if memos:
            self.y -= 2
            for when, memo in memos[-2:]:
                self._text(f"· {when} 메모: {_clip(memo, 80)}", size=8, gap=11, color=_MUTED)

    def _prescription(self) -> None:
        if not self.diagnoses:
            return
        self._section("진단 · 처방 이력 (의료진 진단을 보호자가 기록한 내용)")
        for dx in self.diagnoses:
            self._text(f"{dx.visited_on}  {dx.hospital_name} - {dx.diagnosis_name}", size=9.5, gap=12)
            for rx in dx.prescriptions:
                detail = f"{rx.medication_name} ({rx.form}, {rx.duration_days}일분)"
                if rx.note:
                    detail += f" · {_clip(rx.note, 45)}"
                self._text(f"    - {detail}", size=8.5, gap=11, color=_MUTED)
            if not dx.prescriptions:
                self._text("    - 처방 없음", size=8.5, gap=11, color=_MUTED)

    def _footer(self) -> None:
        """비진단 고지(요구사항 F13). 리포트는 인쇄되어 돌아다닐 수 있으므로
        화면뿐 아니라 종이 위에도 반드시 남아야 한다."""
        box_h = 34.0
        y = _MARGIN
        self.c.setFillColor(colors.HexColor("#f3f4f6"))
        self.c.rect(_MARGIN, y, _CONTENT_W, box_h, stroke=0, fill=1)
        self.c.setFillColor(_ACCENT)
        self.c.setFont(_FONT_BOLD, 8.5)
        self.c.drawString(_MARGIN + 8, y + box_h - 13, "본 자료는 의학적 진단이 아닙니다.")
        self.c.setFont(_FONT, 8)
        self.c.setFillColor(_MUTED)
        self.c.drawString(
            _MARGIN + 8,
            y + box_h - 25,
            "가정에서 촬영·기록한 관찰 자료를 정리한 것으로, 최종 판단은 의료진의 진료를 통해 이루어집니다.",
        )

    def build(self, sections: set[str]) -> bytes:
        self._header()
        if "photos" in sections:
            self._photos()
        if "graph" in sections:
            self._graph()
        if "symptoms" in sections:
            self._symptoms()
        if "prescription" in sections:
            self._prescription()
        self._footer()
        self.c.showPage()
        self.c.save()
        return self.buffer.getvalue()
