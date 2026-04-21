---
template: plan
version: 1.3
feature: bible-platform
date: 2026-04-15
author: dkpark55@gmail.com
project: bibleLab
status: Draft
---

# 성경 플랫폼 (Bible Platform) Planning Document

> **Summary**: 모바일 우선 PWA 성경 읽기·묵상 플랫폼 — 저작권 자유 영어 성경(KJV) 기반, 한국어 번역 병행 표시, 하이라이트/메모, 묵상·큐티, 1독 진행률을 개인화 저장
>
> **Project**: bibleLab
> **Version**: 0.1.0
> **Author**: dkpark55@gmail.com
> **Date**: 2026-04-15
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 기존 성경 앱은 설치 부담이 크거나 모바일 UX가 열악해 지속적인 성경 읽기·묵상 습관 형성이 어렵다 |
| **Solution** | 저작권 자유 KJV(영어) 텍스트를 기반으로 하되 한국어 번역을 병행 표시하는 PWA 플랫폼. 오프라인 지원 + 1독 진행률·묵상 기록으로 꾸준한 읽기를 돕는다 |
| **Function/UX Effect** | 손가락 친화적 UI로 성경 읽기·검색·하이라이트·메모·큐티 노트를 한 앱에서 처리, 1독 퍼센테이지로 성취감 제공 |
| **Core Value** | 누구나 설치 없이 모바일에서 바로 성경을 읽고, 개인 묵상 기록을 클라우드로 영구 보관할 수 있다 |

---

## Context Anchor

> Auto-generated from Executive Summary. Propagated to Design/Do documents for context continuity.

| Key | Value |
|-----|-------|
| **WHY** | 모바일에서 지속적인 성경 읽기·묵상 습관 형성을 가로막는 접근성 문제 해결 |
| **WHO** | 한국어 사용자 (성인 성도, 청년부), 모바일로 성경 읽기를 원하는 누구나 |
| **RISK** | 한국어 번역 품질 관리 (AI 번역 오류 가능성), PWA 오프라인 캐시 용량 한계 |
| **SUCCESS** | 1독 진행률 추적 동작 / 하이라이트·메모 저장-복원 / 오프라인 읽기 / LCP < 2.5초 (모바일) |
| **SCOPE** | Phase 1: 읽기·검색·기본 인증 → Phase 2: 하이라이트·메모·1독 진행률 → Phase 3: 묵상·큐티·다국어 |

---

## 1. Overview

### 1.1 Purpose

한국어 사용자가 모바일 브라우저에서 즉시 성경을 읽고, 개인 묵상 기록(하이라이트·메모·큐티 노트)을 클라우드에 저장하며, 1독 진행 상황을 시각적으로 확인할 수 있는 PWA 플랫폼을 제공한다.

영어 원문(KJV, 공개 도메인)을 기본 데이터 소스로 사용하고, 한국어 번역을 병행 표시하거나 전환할 수 있도록 한다. 이를 통해 저작권 이슈 없이 안전하게 서비스를 출시하고, 이후 정식 한국어 번역본 라이선스 취득 시 대체한다.

### 1.2 Background

- 한국 기독교 인구의 스마트폰 보급률은 95% 이상이나, 기존 성경 앱은 네이티브 앱 설치·업데이트 부담이 크다
- PWA는 홈 화면 추가·오프라인 지원을 통해 네이티브 앱 수준의 UX를 제공하면서 개발·배포 비용을 낮출 수 있다
- **데이터 전략**: KJV(공개 도메인)를 1차 소스로 DB에 저장. 한국어 표시는 아래 두 가지 방식 중 선택:
  - **방식 A** — 공개 도메인 한국어 번역(개역한글 1911·1938년판 등 저작권 만료본) 병행 저장
  - **방식 B** — KJV 텍스트를 Claude/GPT API로 실시간 또는 사전 번역하여 DB 저장
- 초기에는 방식 B(AI 번역 사전 저장)로 빠르게 서비스하고, 정식 라이선스 취득 후 검증된 한국어 번역본으로 교체한다

### 1.3 Related Documents

- Requirements: 본 문서
- References: 추후 Design 문서 (`docs/02-design/features/bible-platform.design.md`)

---

## 2. Scope

### 2.1 In Scope

**Phase 1 — 핵심 읽기 (MVP)**
- [ ] 성경 읽기 (구약/신약 전체, 개역개정)
- [ ] 책·장·절 내비게이션 (모바일 친화적 UI)
- [ ] 키워드 & 구절 번호 검색
- [ ] 이메일/소셜 로그인 (개인화 저장 기반)
- [ ] PWA 오프라인 지원 (Service Worker + 로컬 캐시)

**Phase 2 — 개인화 & 진행률**
- [ ] 구절 하이라이트 (색상 선택)
- [ ] 구절 메모 작성·조회
- [ ] 성경 1독 진행률 (퍼센테이지, 읽은 장 기록)
- [ ] 읽은 기록 히스토리 (달력 뷰)

**Phase 3 — 묵상 & 확장**
- [ ] 묵상/큐티 노트 작성 (날짜별)
- [ ] 묵상 리스트 & 검색
- [ ] 다국어 성경 추가 (영어 NIV/KJV 등)
- [ ] 구절 공유 (카카오톡, 클립보드)

### 2.2 Out of Scope

- 음성 낭독 (TTS) — 추후 검토
- 커뮤니티 / 댓글 기능
- 설교 영상·팟캐스트 연동
- 유료 구독 / 결제 시스템 (Phase 1 기준)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 성경 전체 텍스트 읽기 (구약 39권, 신약 27권) — KJV(영어) + 한국어 번역 병행 표시 | High | Pending |
| FR-02 | 책/장 네비게이션 — 스와이프 or 드롭다운 선택 | High | Pending |
| FR-03 | 키워드 검색 — 결과에 책·장·절 표시, 해당 절로 이동 | High | Pending |
| FR-04 | 이메일 회원가입 / 로그인 (JWT 기반) | High | Pending |
| FR-05 | PWA 매니페스트 + Service Worker (오프라인 성경 캐시) | High | Pending |
| FR-06 | 구절 하이라이트 (3가지 이상 색상, 저장·불러오기) | Medium | Pending |
| FR-07 | 구절 메모 작성·수정·삭제 | Medium | Pending |
| FR-08 | 1독 진행률 — 읽은 장 체크, 전체 퍼센테이지 표시 | Medium | Pending |
| FR-09 | 읽은 기록 달력 뷰 (날짜별 읽은 장 확인) | Medium | Pending |
| FR-10 | 묵상/큐티 노트 작성 (날짜·본문 연결) | Low | Pending |
| FR-11 | 구절 공유 (클립보드 복사, 카카오톡 공유) | Low | Pending |
| FR-12 | 언어 전환 — 영어(KJV) / 한국어 번역 / 한영 병행 표시 중 선택 | Medium | Pending |
| FR-13 | 한국어 번역 데이터 import — AI 사전 번역 또는 공개 도메인 번역본 seed | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | LCP < 2.5초 (모바일 4G 기준) | Lighthouse Mobile |
| Performance | 성경 검색 응답 < 300ms | API 응답 시간 측정 |
| Offline | 오프라인 성경 읽기 가능 (캐시 HIT) | Chrome DevTools Network Throttle |
| Security | OWASP Top 10 준수, JWT 탈취 방지 | 보안 리뷰 |
| Accessibility | 폰트 크기 조절 (최소 14px ~ 최대 24px) | 사용자 설정 |
| Scalability | DB 성능 — 31,103절 풀텍스트 인덱스 | EXPLAIN ANALYZE |
| PWA | Lighthouse PWA 점수 90+ | Lighthouse |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] FR-01 ~ FR-05 (Phase 1) 모두 구현 및 동작 확인
- [ ] PWA 오프라인 모드에서 성경 읽기 가능
- [ ] 로그인 후 하이라이트·메모 저장 → 재접속 시 복원
- [ ] 1독 진행률 퍼센테이지 정확하게 반영
- [ ] Lighthouse Mobile Performance 80+, PWA 90+
- [ ] 모바일 (iPhone SE, Galaxy S21) 주요 기능 정상 동작

### 4.2 Quality Criteria

- [ ] TypeScript strict mode, lint 에러 0
- [ ] Core 기능 테스트 커버리지 70% 이상
- [ ] 빌드 성공 (CI 통과)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 한국어 번역 저작권 | High | Low | **KJV 공개 도메인 기반**으로 저작권 이슈 우회. AI 번역 사전 저장으로 초기 서비스. 추후 라이선스 취득 후 교체 |
| AI 번역 품질 | Medium | Medium | 시편·잠언 등 시가서는 직역보다 의역 필요 — 번역 후 주요 구절 샘플 검토 필수 |
| PWA 오프라인 캐시 용량 초과 (성경 데이터 ~5MB) | Medium | Low | 책별 청크 캐싱, IndexedDB 활용 |
| 모바일 성능 저하 (긴 장 렌더링) | Medium | Medium | 가상 스크롤(Virtual Scroll) 적용, 청크 로딩 |
| DB 풀텍스트 검색 느림 (31,103절) | Medium | Low | PostgreSQL FTS 인덱스 또는 SQLite FTS5 |
| 인증 토큰 탈취 | High | Low | httpOnly Cookie + CSRF 방지, HTTPS 전용 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| Bible 데이터 (성경 본문) | DB Schema | 새로 생성 — 책/장/절 구조로 31,103절 저장. `text_en`(KJV) + `text_ko`(번역) 컬럼 분리 |
| User 계정 | DB Schema | 새로 생성 — 이메일 기반 인증 |
| Highlight / Memo | DB Schema | 새로 생성 — 사용자-구절 연결 |
| ReadingProgress | DB Schema | 새로 생성 — 사용자별 읽은 장 기록 |
| QTNote | DB Schema | 새로 생성 — 날짜별 묵상 노트 |

### 6.2 Current Consumers

신규 프로젝트이므로 기존 소비자 없음.

### 6.3 Verification

- [ ] 성경 데이터 import 스크립트 검증 (총 31,103절 확인)
- [ ] 인증 흐름 E2E 테스트

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Starter** | 정적 사이트 | ☐ |
| **Dynamic** | 기능 기반 모듈, BaaS 연동 | ☑ |
| **Enterprise** | 레이어 분리, 마이크로서비스 | ☐ |

**선택: Dynamic** — 사용자 인증, DB 연동, API 필요. 하지만 초기 단계이므로 Enterprise 수준의 과도한 추상화는 지양.

### 7.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Framework | **Next.js 14 (App Router)** | SSR/SSG 혼용, PWA 지원, 파일 기반 라우팅 |
| Styling | **Tailwind CSS** | 모바일 우선 반응형, 빠른 프로토타이핑 |
| State Management | **Zustand** | 읽기 위치·설정 등 경량 전역 상태 관리 |
| API | **Next.js Route Handlers** | BFF 패턴, 외부 API 없이 자체 처리 |
| DB | **PostgreSQL + Prisma** | 풀텍스트 검색, 관계형 데이터 (하이라이트·메모) |
| Auth | **NextAuth.js** | 이메일 + 소셜 로그인, JWT/Session 유연 선택 |
| PWA | **next-pwa** | Service Worker 자동 생성, 오프라인 캐시 전략 |
| Testing | **Vitest + Playwright** | 유닛 + E2E |
| Backend (BaaS) | **자체 구현** (Next.js API Routes + PostgreSQL) | 데이터 직접 제어, 오프라인 캐시 유리 |

### 7.3 Folder Structure Preview

```
bibleLab/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── (auth)/             # 로그인/회원가입
│   │   ├── bible/              # 성경 읽기 ([book]/[chapter])
│   │   ├── search/             # 검색
│   │   ├── notes/              # 메모·하이라이트
│   │   ├── qt/                 # 묵상·큐티
│   │   └── api/                # Route Handlers
│   ├── components/
│   │   ├── bible/              # BibleReader, VerseItem, ChapterNav
│   │   ├── ui/                 # Button, Modal, BottomSheet 등
│   │   └── layout/             # MobileLayout, BottomNav
│   ├── features/
│   │   ├── bible/              # 성경 읽기 로직
│   │   ├── highlight/          # 하이라이트 기능
│   │   ├── reading-progress/   # 1독 진행률
│   │   └── qt/                 # 묵상 노트
│   ├── lib/
│   │   ├── prisma.ts           # DB 클라이언트
│   │   ├── auth.ts             # NextAuth 설정
│   │   └── sw/                 # Service Worker 유틸
│   └── types/                  # TypeScript 타입 정의
├── prisma/
│   ├── schema.prisma           # DB 스키마
│   └── seed/                   # 성경 데이터 시드
└── public/
    ├── manifest.json           # PWA 매니페스트
    └── icons/                  # PWA 아이콘
```

---

## 8. Convention Prerequisites

### 8.1 Conventions to Define/Verify

| Category | To Define | Priority |
|----------|-----------|:--------:|
| 컴포넌트 명명 | PascalCase, `features/` 내 도메인 분리 | High |
| API Route | `/api/bible/[book]/[chapter]` 패턴 | High |
| DB 모델 명 | PascalCase (Prisma 기본) | High |
| 환경 변수 | `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | High |
| 모바일 브레이크포인트 | sm: 390px (iPhone SE 기준) | Medium |

### 8.2 Environment Variables Needed

| Variable | Purpose | Scope |
|----------|---------|-------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | Server |
| `NEXTAUTH_SECRET` | NextAuth 서명 키 | Server |
| `NEXTAUTH_URL` | 앱 기본 URL | Server |
| `NEXT_PUBLIC_APP_URL` | 클라이언트 앱 URL | Client |

---

## 9. Next Steps

1. [ ] KJV 공개 도메인 데이터 확보 (예: `theopenbible.info` JSON 또는 `scrollmapper/bible_databases`)
2. [ ] 한국어 번역 전략 결정 — AI 사전 번역(Claude Batch API) or 공개 도메인 한국어 번역본(1911/1938년판) import
3. [ ] Design 문서 작성 (`bible-platform.design.md`)
4. [ ] Phase 1 Schema 정의 (Prisma 스키마 — `Verse.text_en` + `Verse.text_ko`)
5. [ ] PWA 설정 검증 (next-pwa + Service Worker 전략)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-15 | Initial draft | dkpark55@gmail.com |
