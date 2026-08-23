# 키즈덤AI (KidsDerm AI)

> 병변을 임상 지표로 정량화하는 소아 피부질환 경과 관찰 보조 도구

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](...)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-ee4c2c.svg)](...)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](...)

---

## 프로젝트 개요

아토피피부염처럼 만성 경과를 보이는 소아 피부질환에서,  
부모가 "나아지고 있는가?"를 객관적으로 판단할 수 있는 근거가 부족합니다.

키즈덤AI는 부모가 촬영한 사진에서  
**병변 면적 비율**과 **EASI 구성 4징후**(홍반·구진·긁은 자국·태선화)를 정량화하고,  
시계열로 변화를 추적하여 부모와 의료진이 같은 근거를 보고 판단할 수 있도록 돕습니다.

> ⚠️ **본 도구는 의학적 진단을 대체하지 않습니다.**  
> 참고용 정보이며, 최종 판단과 치료는 반드시 의료진과 상담하시기 바랍니다.

---

## 핵심 기능

1. **병변 영역 자동 분할** → 면적 비율 산출
2. **4징후 중증도 추정** (홍반·구진·긁은 자국·태선화)
3. **시점 간 비교** → 호전 / 유지 / 악화 판정
4. **질병관리청 역학 정보 연계** (감염성 질환군)

---

## 시스템 파이프라인

[여기에 8단계 파이프라인 다이어그램 또는 표 삽입]

1. 부모 촬영 + 증상 기록  
2. 병변 분할 (배경·피부·병변)  
3. 1차 분류 (4질환군 → 세부 후보)  
4. 중증도 정량화 (면적 + 4징후)  
5. 증상·진료 기록 (기준점 설정)  
6. 시계열 변화 판정  
7. 근거 정보 제공  
8. 최종 판단 (부모/의료진)

---

## 기술 스택

- **Language**: Python 3.8+
- **Deep Learning**: PyTorch, torchvision
- **Image Processing**: OpenCV, NumPy
- **Evaluation**: scikit-learn (DSC, IoU)
- **API**: 질병관리청 오픈API
- **Visualization**: matplotlib, seaborn
- **UI Prototype**: Figma

---

## 데이터셋

### 대회 제공 데이터 (미개방)
- **소아청소년 피부질환 이미지 데이터** (건양대학교의료원 / AI-Hub)
- 데이터안심존에서만 접근 가능
- EASI 구성 4징후 + 세그멘테이션 마스크 제공

### 예선 사전 검증용 공개 데이터
- HAM10000 + Lesion Segmentations (Kaggle)
- 목적: **파이프라인 동작 검증** (성능 주장 아님)
- 결과: 병변 분할 DSC **0.8847** / IoU 0.7873

> 실제 대회 데이터와 질환·촬영 방식·면적 비율 분모 정의가 다르므로,  
> 본 실험 결과는 실제 성능을 예측하지 않습니다.

---

## 예선 검증 결과 (Proxy Experiment)

| 항목 | 내용 |
|------|------|
| 데이터 | HAM10000 800장 |
| 모델 | 경량 U-Net (사전학습 미사용) |
| Best DSC | 0.8847 |
| Final IoU | 0.7873 |
| 목적 | 학습 → 추론 → 면적 산출 파이프라인 동작 확인 |

[학습 곡선 이미지]  
[오버레이 샘플 이미지]

---

## 프로젝트 구조

프론트엔드는 `kidsderm-ai/` (Next.js App Router + TypeScript + Tailwind CSS)에 있습니다.

```
kidsderm-ai/
├── src/
│   ├── app/
│   │   ├── onboarding/          # CM-01 · 스플래시 · 시작 페이지 · 비진단 고지 동의
│   │   ├── login/, signup/      # CM-02 · 로그인 · 회원가입 · 약관 동의
│   │   ├── profile/             # CM-03 · 아이 프로필 등록 · 전환
│   │   ├── page.tsx             # HM-01-01 · 홈 대시보드
│   │   ├── cases/               # HM-01-02 · 관찰 사례 목록
│   │   │   └── [caseId]/        # TR · 케이스별 타임라인·사진비교·그래프·요약·리포트, MD-02 진료 이력
│   │   ├── outbreak/            # HM-02-01 · 우리 지역 유행 현황
│   │   ├── record/              # RC · 촬영 가이드 → 카메라/갤러리 → 증상·발병정보 입력 → 저장
│   │   ├── analysis/            # AN · 분석 진행 → 1차 분류 → 유행정보 → 종합 참고정보 → 고지 → 진료입력 유도
│   │   ├── medical/             # MD-01 · 진단·처방 입력 → 재진 예정일 설정
│   │   ├── notifications/       # NT · 알림 목록 · 촬영 리마인더 설정
│   │   ├── settings/            # ST · 설정 홈 · 지역/알림 설정 · 데이터 관리 · 약관 · 고지사항
│   │   ├── layout.tsx           # 루트 레이아웃 (폰트, 메타데이터, AppShell)
│   │   └── globals.css          # 디자인 토큰 (색상·타이포) — Tailwind v4 @theme
│   ├── components/
│   │   ├── layout/              # AppShell(폰 프레임+하단 탭바), BottomTabBar, ScreenHeader
│   │   ├── ui/                  # Button, Card, Badge, Checkbox, IntensitySlider, Disclaimer 등 공통 컴포넌트
│   │   └── icons.tsx            # 아이콘 세트 + 새싹 로고(LogoMark)·워드마크(Wordmark)
│   └── lib/
│       ├── types.ts             # 도메인 타입 (Case, PhotoRecord, Diagnosis, Prescription 등)
│       ├── mock-data.ts         # 백엔드 연동 전 목데이터
│       ├── record-context.tsx   # 기록(RC) 다단계 플로우 상태 공유
│       └── medical-context.tsx  # 진단·처방(MD) 다단계 플로우 상태 공유
├── scripts/screenshot.js        # Playwright 기반 화면 스크린샷 스크립트
├── Dockerfile.dev, docker-compose.yml  # 로컬 개발용 Docker 환경 (핫리로드)
└── public/                      # 정적 에셋
```

> AI 모델 학습/추론 파이프라인(PyTorch 등)은 별도 저장소 또는 이후 커밋에서 추가될 예정이며, 현재 저장소에는 프론트엔드 프로토타입만 포함되어 있습니다.

---

## 한계 및 주의사항

- 본 서비스는 **비진단 보조 도구**입니다.
- 세그멘테이션 라벨이 제공되는 질환군에만 면적 정량화를 적용합니다.
- 병원 DSLR/더모스코피 데이터 vs 스마트폰 촬영 간 **도메인 갭**이 존재합니다.
- 불확실한 경우 항상 병원 방문 권고 쪽으로 보수적으로 동작하도록 설계했습니다.

---

## 팀

**키즈is프리덤**
- 팀장: 기획 · AI · 백엔드
- 팀원: UI/UX · 프로토타이핑

2026 K-Health 미개방 의료데이터 활용 경진대회 예선 제출작

---

## 라이선스

MIT License (또는 대회 규정에 맞는 라이선스)

---

## Acknowledgments

- AI-Hub 소아청소년 피부질환 이미지 데이터
- HAM10000 Dataset (Tschandl et al., 2018)
- 질병관리청 오픈API
