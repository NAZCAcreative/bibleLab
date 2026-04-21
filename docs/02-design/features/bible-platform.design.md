---
template: design
version: 1.3
feature: bible-platform
date: 2026-04-15
author: dkpark55@gmail.com
project: bibleLab
status: Draft
---

# 성경 플랫폼 (Bible Platform) Design Document

> **Summary**: 클린 아키텍처 기반 모바일 우선 PWA 성경 플랫폼 — KJV + 한국어 병행, 오프라인 지원, 하이라이트·메모·1독 진행률·묵상 기능
>
> **Project**: bibleLab
> **Version**: 0.1.0
> **Author**: dkpark55@gmail.com
> **Date**: 2026-04-15
> **Status**: Draft
> **Planning Doc**: [bible-platform.plan.md](../01-plan/features/bible-platform.plan.md)

---

## Context Anchor

> Copied from Plan document. Ensures strategic context survives Design→Do handoff.

| Key | Value |
|-----|-------|
| **WHY** | 모바일에서 지속적인 성경 읽기·묵상 습관 형성을 가로막는 접근성 문제 해결 |
| **WHO** | 한국어 사용자 (성인 성도, 청년부), 모바일로 성경 읽기를 원하는 누구나 |
| **RISK** | 한국어 번역 품질 관리 (AI 번역 오류 가능성), PWA 오프라인 캐시 용량 한계 |
| **SUCCESS** | 1독 진행률 추적 동작 / 하이라이트·메모 저장-복원 / 오프라인 읽기 / LCP < 2.5초 (모바일) |
| **SCOPE** | Phase 1: 읽기·검색·기본 인증 → Phase 2: 하이라이트·메모·1독 진행률 → Phase 3: 묵상·큐티·다국어 |

---

## 1. Overview

### 1.1 Design Goals

- 클린 아키텍처 레이어 엄격 분리로 도메인 로직의 테스트 가능성과 장기 유지보수성 확보
- 모바일 First 레이아웃 — 터치 친화적, 최소 클릭으로 성경 읽기 진입
- PWA 오프라인 전략: 성경 본문(~5MB)을 IndexedDB + Cache API에 사전 저장
- 이중 언어(KJV/한국어) 구조를 DB에서 분리하여 향후 번역본 교체 비용 최소화

### 1.2 Design Principles

- **도메인 격리**: Domain 레이어는 외부 의존성(Prisma, Next.js) 없이 순수 TypeScript
- **단방향 의존성**: Presentation → Application → Domain ← Infrastructure
- **오프라인 우선**: Service Worker가 성경 본문 API를 가로채 캐시 응답 우선
- **번역 추상화**: `Verse` 엔티티는 `text_en / text_ko` 컬럼으로 언어에 독립적

---

## 2. Architecture

### 2.0 Architecture Comparison

| Criteria | Option A: Minimal | Option B: Clean | Option C: Pragmatic |
|----------|:-:|:-:|:-:|
| **New Files** | ~15 | ~50 | ~30 |
| **Complexity** | Low | High | Medium |
| **Maintainability** | Medium | High | High |
| **Effort** | Low | High | Medium |
| **Testability** | Low | High | Medium |

**Selected: Option B — Clean Architecture**
**Rationale**: 성경 플랫폼은 도메인 규칙(읽기 진행률 계산, 하이라이트 병합 등)이 복잡하고 장기 운영을 목표로 하므로, 초기 비용을 감수하고 테스트 가능성이 높은 클린 아키텍처를 선택.

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (PWA)                           │
│                                                             │
│  ┌──────────────────┐    ┌───────────────────────────────┐  │
│  │  Presentation    │    │    Service Worker (offline)   │  │
│  │  (React/Next.js) │    │    - Cache API (static)       │  │
│  │  - Pages         │    │    - IndexedDB (bible data)   │  │
│  │  - Components    │◀──▶│    - Background Sync          │  │
│  │  - Hooks         │    └───────────────────────────────┘  │
│  └────────┬─────────┘                                       │
└───────────┼─────────────────────────────────────────────────┘
            │ HTTP (fetch)
┌───────────▼─────────────────────────────────────────────────┐
│                   Next.js Server                             │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Application  │  │   Domain     │  │ Infrastructure   │  │
│  │ - Use Cases  │  │ - Entities   │  │ - PrismaDB       │  │
│  │ - Services   │──│ - Repos(if)  │──│ - Route Handlers │  │
│  │ - DTOs       │  │ - Value Obj  │  │ - NextAuth       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                              │               │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │    PostgreSQL DB      │
                                    │  (Verse, User,        │
                                    │   Highlight, Memo,    │
                                    │   ReadingProgress,    │
                                    │   QTNote)             │
                                    └─────────────────────┘
```

### 2.2 Data Flow

```
[성경 읽기 흐름]
User (장/절 선택)
  → BibleReaderPage (Presentation)
  → useGetChapter hook → GetChapterUseCase (Application)
  → BibleRepository.getChapter() (Domain interface)
  → PrismaBibleRepository.getChapter() (Infrastructure)
  → PostgreSQL: SELECT * FROM Verse WHERE book=? AND chapter=?
  → DTO 변환 → Presentation 렌더링

[오프라인 흐름]
Service Worker intercepts /api/bible/** fetch
  → Cache Storage HIT → return cached response
  → Cache MISS → fetch from server → cache & return
```

### 2.3 Layer Dependencies

| Layer | Location | Depends On |
|-------|----------|-----------|
| Presentation | `src/presentation/` | Application |
| Application | `src/application/` | Domain |
| Domain | `src/domain/` | 없음 (순수 TypeScript) |
| Infrastructure | `src/infrastructure/` | Domain (인터페이스 구현) |

---

## 3. Data Model

### 3.1 Domain Entities

```typescript
// src/domain/entities/Verse.ts
interface Verse {
  id: string
  bookId: number           // 1-66
  bookName: BookName       // Value Object (e.g., "Genesis", "창세기")
  chapter: number          // 1-150
  verse: number            // 1-176
  textEn: string           // KJV 원문 (공개 도메인)
  textKo: string           // 한국어 번역 (AI 번역 or 라이선스 취득본)
}

// src/domain/entities/User.ts
interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
}

// src/domain/entities/Highlight.ts
interface Highlight {
  id: string
  userId: string
  verseId: string
  color: HighlightColor    // Value Object: 'yellow' | 'green' | 'blue' | 'pink'
  createdAt: Date
}

// src/domain/entities/Memo.ts
interface Memo {
  id: string
  userId: string
  verseId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

// src/domain/entities/ReadingProgress.ts
interface ReadingProgress {
  id: string
  userId: string
  bookId: number
  chapter: number
  readAt: Date             // 읽은 날짜
}

// src/domain/entities/QTNote.ts
interface QTNote {
  id: string
  userId: string
  date: Date               // 묵상 날짜
  verseRef: string | null  // 예: "John 3:16"
  content: string
  createdAt: Date
  updatedAt: Date
}
```

### 3.2 Value Objects

```typescript
// src/domain/value-objects/BookName.ts
// 66권 책 이름 매핑 (영문/한국어)
type BookName = {
  en: string   // "Genesis"
  ko: string   // "창세기"
  abbr: string // "Gen"
  testament: 'old' | 'new'
  totalChapters: number
}

// src/domain/value-objects/HighlightColor.ts
type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink'

// src/domain/value-objects/Language.ts
type Language = 'en' | 'ko' | 'bilingual'
```

### 3.3 Repository Interfaces

```typescript
// src/domain/repositories/IBibleRepository.ts
interface IBibleRepository {
  getChapter(bookId: number, chapter: number): Promise<Verse[]>
  searchVerses(query: string, lang: Language): Promise<Verse[]>
  getVerse(bookId: number, chapter: number, verse: number): Promise<Verse | null>
}

// src/domain/repositories/IHighlightRepository.ts
interface IHighlightRepository {
  getByUser(userId: string): Promise<Highlight[]>
  getByVerse(userId: string, verseId: string): Promise<Highlight | null>
  upsert(data: Omit<Highlight, 'id' | 'createdAt'>): Promise<Highlight>
  delete(id: string, userId: string): Promise<void>
}

// src/domain/repositories/IReadingProgressRepository.ts
interface IReadingProgressRepository {
  getProgress(userId: string): Promise<ReadingProgress[]>
  markChapterRead(userId: string, bookId: number, chapter: number): Promise<ReadingProgress>
  getProgressPercentage(userId: string): Promise<number>  // 0-100
}

// src/domain/repositories/IMemoRepository.ts
interface IMemoRepository {
  getByVerse(userId: string, verseId: string): Promise<Memo | null>
  upsert(data: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Memo>
  delete(id: string, userId: string): Promise<void>
}

// src/domain/repositories/IQTNoteRepository.ts
interface IQTNoteRepository {
  getByDate(userId: string, date: Date): Promise<QTNote | null>
  getAll(userId: string): Promise<QTNote[]>
  upsert(data: Omit<QTNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<QTNote>
  delete(id: string, userId: string): Promise<void>
}
```

### 3.4 Prisma Schema (PostgreSQL)

```prisma
// prisma/schema.prisma

model Book {
  id            Int     @id                // 1-66
  nameEn        String                     // "Genesis"
  nameKo        String                     // "창세기"
  nameAbbr      String                     // "Gen"
  testament     String                     // "old" | "new"
  totalChapters Int
  verses        Verse[]
}

model Verse {
  id         String      @id @default(cuid())
  bookId     Int
  chapter    Int
  verse      Int
  textEn     String      @db.Text          // KJV 원문
  textKo     String      @db.Text          // 한국어 번역
  book       Book        @relation(fields: [bookId], references: [id])
  highlights Highlight[]
  memos      Memo[]

  @@unique([bookId, chapter, verse])
  @@index([bookId, chapter])
  // 풀텍스트 인덱스 (PostgreSQL)
  @@index([textEn], type: Gin)
  @@index([textKo], type: Gin)
}

model User {
  id              String            @id @default(cuid())
  email           String            @unique
  name            String?
  emailVerified   DateTime?
  image           String?
  createdAt       DateTime          @default(now())
  highlights      Highlight[]
  memos           Memo[]
  readingProgress ReadingProgress[]
  qtNotes         QTNote[]
  // NextAuth 관련
  accounts        Account[]
  sessions        Session[]
}

model Highlight {
  id        String   @id @default(cuid())
  userId    String
  verseId   String
  color     String                          // 'yellow' | 'green' | 'blue' | 'pink'
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  verse     Verse    @relation(fields: [verseId], references: [id], onDelete: Cascade)

  @@unique([userId, verseId])
}

model Memo {
  id        String   @id @default(cuid())
  userId    String
  verseId   String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  verse     Verse    @relation(fields: [verseId], references: [id], onDelete: Cascade)

  @@unique([userId, verseId])
}

model ReadingProgress {
  id      String   @id @default(cuid())
  userId  String
  bookId  Int
  chapter Int
  readAt  DateTime @default(now())
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, bookId, chapter])
  @@index([userId])
}

model QTNote {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime
  verseRef  String?                         // "John 3:16"
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId])
}

// NextAuth 필수 모델
model Account { ... }
model Session { ... }
model VerificationToken { ... }
```

---

## 4. API Specification

### 4.1 Endpoint List

| Method | Path | Description | Auth |
|--------|------|-------------|:----:|
| GET | `/api/bible/books` | 66권 목록 (이름·장 수) | No |
| GET | `/api/bible/[bookId]/[chapter]` | 특정 장 전체 절 | No |
| GET | `/api/bible/search?q=&lang=` | 키워드 검색 | No |
| GET | `/api/highlights` | 내 하이라이트 전체 | Yes |
| POST | `/api/highlights` | 하이라이트 추가/변경 | Yes |
| DELETE | `/api/highlights/[id]` | 하이라이트 삭제 | Yes |
| GET | `/api/memos/[verseId]` | 특정 절 메모 조회 | Yes |
| PUT | `/api/memos/[verseId]` | 메모 저장 (upsert) | Yes |
| DELETE | `/api/memos/[verseId]` | 메모 삭제 | Yes |
| GET | `/api/progress` | 1독 진행률 + 읽은 장 목록 | Yes |
| POST | `/api/progress` | 장 읽음 처리 | Yes |
| GET | `/api/qt` | 묵상 노트 목록 | Yes |
| GET | `/api/qt/[date]` | 특정 날짜 묵상 | Yes |
| PUT | `/api/qt/[date]` | 묵상 노트 저장 (upsert) | Yes |
| DELETE | `/api/qt/[date]` | 묵상 노트 삭제 | Yes |

### 4.2 Key Response Shapes

#### `GET /api/bible/[bookId]/[chapter]`

```json
{
  "data": {
    "book": { "id": 43, "nameEn": "John", "nameKo": "요한복음" },
    "chapter": 3,
    "verses": [
      {
        "id": "clxxx",
        "verse": 16,
        "textEn": "For God so loved the world...",
        "textKo": "하나님이 세상을 이처럼 사랑하사..."
      }
    ]
  }
}
```

#### `GET /api/progress`

```json
{
  "data": {
    "percentage": 42.3,
    "totalChapters": 1189,
    "readChapters": 503,
    "byBook": [
      { "bookId": 1, "nameKo": "창세기", "totalChapters": 50, "readChapters": 50 }
    ]
  }
}
```

---

## 5. UI/UX Design

### 5.1 Screen Layout (Mobile-First)

```
┌─────────────────────────┐
│  [←] 요한복음 3장   [⚙] │  ← TopBar (책/장 표시, 설정)
├─────────────────────────┤
│  [창세기▼] [3장▼] [KO▼] │  ← 네비게이션 드롭다운
├─────────────────────────┤
│                         │
│  ¹⁶ 하나님이 세상을     │  ← VerseItem (절 번호 + 본문)
│     이처럼 사랑하사...  │    (길게 누르면 하이라이트/메모 메뉴)
│                         │
│  ¹⁷ 하나님이 그 아들을  │
│     세상에 보내신 것은  │
│                         │
├─────────────────────────┤
│  [성경] [검색] [기록] [나]│  ← BottomNav (4탭)
└─────────────────────────┘
```

### 5.2 User Flow

```
홈(진행률 카드)
  ├── 성경 읽기 탭
  │     ├── 책 선택 (드롭다운/그리드)
  │     ├── 장 선택 → BibleReaderPage
  │     │     ├── 절 길게 누르기 → VerseActionSheet
  │     │     │     ├── 하이라이트 색상 선택
  │     │     │     └── 메모 작성 → MemoModal
  │     │     └── 스와이프 좌/우 → 이전/다음 장
  │     └── 1독 진행률 자동 업데이트
  ├── 검색 탭
  │     ├── 키워드 입력 → SearchResultPage
  │     └── 결과 클릭 → BibleReaderPage (해당 절 포커스)
  ├── 기록 탭
  │     ├── 달력 뷰 (읽은 날짜 표시)
  │     └── QT 노트 리스트 → QTDetailPage
  └── 내 탭
        ├── 하이라이트/메모 모아보기
        └── 로그아웃 / 설정 (폰트 크기)
```

### 5.3 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `BibleReaderPage` | `presentation/pages/` | 장 읽기 메인 페이지 |
| `VerseItem` | `presentation/components/bible/` | 절 렌더링 + 상호작용 |
| `VerseActionSheet` | `presentation/components/bible/` | 하이라이트·메모 바텀시트 |
| `ChapterNavigator` | `presentation/components/bible/` | 책/장 드롭다운 + 스와이프 |
| `LanguageToggle` | `presentation/components/bible/` | EN/KO/양쪽 전환 |
| `SearchBar` | `presentation/components/search/` | 검색 입력 + 자동완성 |
| `ReadingProgressBar` | `presentation/components/progress/` | 1독 퍼센테이지 바 |
| `CalendarView` | `presentation/components/progress/` | 읽은 날짜 달력 |
| `QTEditor` | `presentation/components/qt/` | 묵상 노트 에디터 |
| `MobileLayout` | `presentation/components/layout/` | 기본 모바일 레이아웃 |
| `BottomNav` | `presentation/components/layout/` | 하단 4탭 네비게이션 |

### 5.4 Page UI Checklist

#### BibleReaderPage (`/bible/[bookId]/[chapter]`)

- [ ] TopBar: 현재 책 이름 (한국어) + 장 번호 표시
- [ ] Dropdown: 책 선택 (66권, 한국어 이름)
- [ ] Dropdown: 장 선택 (해당 책의 총 장 수)
- [ ] Toggle: 언어 전환 버튼 (EN / KO / 양쪽)
- [ ] List: 절 목록 (절 번호 superscript + 본문 텍스트)
- [ ] Gesture: 절 길게 누르기 → VerseActionSheet 표시
- [ ] ActionSheet: 하이라이트 색상 4가지 선택 버튼
- [ ] ActionSheet: 메모 작성 버튼 → MemoModal
- [ ] Highlight: 하이라이트된 절 배경색 표시
- [ ] Memo indicator: 메모 있는 절에 아이콘 표시
- [ ] SwipeGesture: 좌/우 스와이프로 이전/다음 장 이동
- [ ] 장 읽기 완료 자동 처리 (스크롤 하단 도달 시)

#### SearchPage (`/search`)

- [ ] Input: 검색어 입력창 (자동 포커스)
- [ ] Filter: 언어 필터 (KO / EN / 전체)
- [ ] List: 검색 결과 (책·장·절 + 미리보기 텍스트)
- [ ] Highlight: 검색어 강조 표시
- [ ] Empty: 결과 없음 안내 메시지

#### ProgressPage (`/progress`)

- [ ] ProgressBar: 전체 1독 퍼센테이지 (숫자 + 바)
- [ ] Stats: 읽은 장 수 / 전체 1189장
- [ ] Calendar: 월별 달력 (읽은 날 색상 표시)
- [ ] BookList: 66권별 진행률 (완독 표시)

#### QTPage (`/qt`)

- [ ] Calendar: 날짜 선택 달력
- [ ] Editor: 텍스트 에디터 (본문 연결 필드 포함)
- [ ] VerseRef: 관련 구절 입력 (예: 요 3:16)
- [ ] List: 이전 묵상 목록

---

## 6. Error Handling

### 6.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| 400 | VALIDATION_ERROR | 잘못된 입력 | fieldErrors 포함 응답 |
| 401 | UNAUTHORIZED | 미인증 | 로그인 페이지 리다이렉트 |
| 404 | NOT_FOUND | 리소스 없음 | 404 컴포넌트 표시 |
| 429 | RATE_LIMITED | 요청 과다 | 재시도 안내 |
| 500 | INTERNAL_ERROR | 서버 오류 | Sentry 로그 + 사용자 안내 |
| OFFLINE | OFFLINE_MODE | 인터넷 없음 | 캐시 사용, 저장 작업 대기열 |

### 6.2 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 값이 올바르지 않습니다.",
    "details": {
      "fieldErrors": { "color": ["유효한 색상이 아닙니다."] }
    }
  }
}
```

### 6.3 Offline Error Strategy

- 성경 읽기: 캐시에서 즉시 응답 (오류 없음)
- 하이라이트/메모 저장: IndexedDB에 임시 저장 → 온라인 복구 시 Background Sync
- 인증 필요 작업 오프라인 시도: "오프라인 상태입니다. 연결 후 자동 저장됩니다." 토스트

---

## 7. Security Considerations

- [ ] JWT는 httpOnly Cookie에만 저장 (XSS 방어)
- [ ] CSRF 토큰 적용 (NextAuth 내장)
- [ ] 성경 데이터 API는 인증 없이 읽기 허용 (공개 데이터)
- [ ] 하이라이트·메모 API: userId는 서버에서 세션에서 추출 (클라이언트 전송 금지)
- [ ] 검색 쿼리 파라미터 Zod 유효성 검사 (SQL Injection 방지)
- [ ] Rate Limiting: 검색 API 60req/min, 인증 API 10req/min
- [ ] HTTPS 전용 (HSTS 헤더)

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool | Phase |
|------|--------|------|-------|
| L1: API | 모든 endpoint 상태·응답 형태 | curl / Playwright request | Do |
| L2: UI | 각 페이지 UI 체크리스트 요소 | Playwright | Do |
| L3: E2E | 성경 읽기·검색·하이라이트 전체 흐름 | Playwright | Do |

### 8.2 L1: API Test Scenarios

| # | Endpoint | Method | Description | Expected |
|---|----------|--------|-------------|----------|
| 1 | `/api/bible/43/3` | GET | 요한복음 3장 절 목록 | 200, `.data.verses.length` = 36 |
| 2 | `/api/bible/search?q=사랑&lang=ko` | GET | 한국어 검색 | 200, `.data.length` > 0 |
| 3 | `/api/highlights` | GET | 미인증 접근 | 401 UNAUTHORIZED |
| 4 | `/api/highlights` (인증) | POST | 하이라이트 저장 | 201, `.data.color` 일치 |
| 5 | `/api/progress` (인증) | POST | 장 읽음 처리 | 201, `.data.percentage` 변화 |
| 6 | `/api/bible/search?q=` | GET | 빈 쿼리 | 400 VALIDATION_ERROR |

### 8.3 L2: UI Action Test Scenarios

| # | Page | Action | Expected |
|---|------|--------|----------|
| 1 | BibleReader | 페이지 진입 | §5.4 체크리스트 요소 전부 렌더링 |
| 2 | BibleReader | 절 길게 누르기 | VerseActionSheet 표시 |
| 3 | BibleReader | 하이라이트 색상 선택 | 절 배경색 즉시 변경 |
| 4 | BibleReader | 스와이프 → | 다음 장 로딩 |
| 5 | Search | 키워드 입력 | 결과 목록 표시 (키워드 강조) |
| 6 | Progress | 페이지 진입 | 퍼센테이지 바 + 달력 렌더링 |

### 8.4 L3: E2E Scenario Test Scenarios

| # | Scenario | Steps | Success Criteria |
|---|----------|-------|-----------------|
| 1 | 성경 읽기 | 홈 → 요한복음 선택 → 3장 → 스크롤 끝 | 장 읽음 처리, 진행률 증가 |
| 2 | 하이라이트 | 요 3:16 길게 누르기 → 노란색 선택 → 재방문 | 하이라이트 유지 |
| 3 | 검색 플로우 | 검색탭 → "사랑" 입력 → 결과 클릭 → 해당 절 이동 | 해당 절 화면 포커스 |
| 4 | 인증 흐름 | 이메일 회원가입 → 로그인 → 메모 작성 → 재로그인 | 메모 복원 |
| 5 | 오프라인 | 오프라인 상태에서 성경 읽기 | 캐시 응답으로 정상 표시 |

### 8.5 Seed Data Requirements

| Entity | Minimum Count | Key Fields |
|--------|:------------:|------------|
| Book | 66 | id, nameEn, nameKo, totalChapters |
| Verse | 31,103 | bookId, chapter, verse, textEn, textKo |
| User (테스트) | 1 | email: test@test.com |

---

## 9. Clean Architecture

### 9.1 Layer Structure

```
src/
├── presentation/              # UI 레이어
│   ├── pages/                 # Next.js App Router 페이지
│   │   ├── bible/[bookId]/[chapter]/page.tsx
│   │   ├── search/page.tsx
│   │   ├── progress/page.tsx
│   │   └── qt/page.tsx
│   ├── components/
│   │   ├── bible/             # BibleReader, VerseItem, VerseActionSheet
│   │   ├── search/            # SearchBar, SearchResult
│   │   ├── progress/          # ReadingProgressBar, CalendarView
│   │   ├── qt/                # QTEditor, QTList
│   │   ├── layout/            # MobileLayout, BottomNav, TopBar
│   │   └── ui/                # Button, Modal, BottomSheet, Toast
│   └── hooks/                 # useChapter, useHighlight, useProgress
│
├── application/               # 유스케이스 레이어
│   ├── use-cases/
│   │   ├── bible/
│   │   │   ├── GetChapterUseCase.ts
│   │   │   └── SearchVersesUseCase.ts
│   │   ├── highlight/
│   │   │   └── UpsertHighlightUseCase.ts
│   │   ├── progress/
│   │   │   ├── MarkChapterReadUseCase.ts
│   │   │   └── GetProgressUseCase.ts
│   │   └── qt/
│   │       └── UpsertQTNoteUseCase.ts
│   ├── services/
│   │   └── ReadingProgressService.ts  # 퍼센테이지 계산 로직
│   └── dto/
│       ├── VerseDTO.ts
│       └── ProgressDTO.ts
│
├── domain/                    # 도메인 레이어 (순수 TS)
│   ├── entities/              # Verse, User, Highlight, Memo, ...
│   ├── repositories/          # IBibleRepository, IHighlightRepository, ...
│   └── value-objects/         # BookName, HighlightColor, Language
│
└── infrastructure/            # 인프라 레이어
    ├── db/
    │   ├── prisma/
    │   │   ├── PrismaBibleRepository.ts
    │   │   ├── PrismaHighlightRepository.ts
    │   │   └── PrismaProgressRepository.ts
    │   └── client.ts          # Prisma 싱글턴
    ├── api/                   # Next.js Route Handlers
    │   ├── bible/
    │   ├── highlights/
    │   ├── progress/
    │   └── qt/
    └── pwa/
        ├── service-worker.ts  # SW 로직
        └── cache-strategy.ts  # 캐시 전략 정의
```

### 9.2 Dependency Rules

```
Presentation → Application → Domain ← Infrastructure
                    ↑
             Domain(인터페이스)
             Infrastructure(구현체)
```

Domain은 순수 TypeScript — Next.js, Prisma, React 불필요.

---

## 10. Coding Convention Reference

### 10.1 Naming Conventions (이 프로젝트)

| Target | Rule | Example |
|--------|------|---------|
| Use Case 클래스 | `{Verb}{Noun}UseCase` | `GetChapterUseCase` |
| Repository 인터페이스 | `I{Name}Repository` | `IBibleRepository` |
| Repository 구현체 | `Prisma{Name}Repository` | `PrismaBibleRepository` |
| DTO | `{Name}DTO` | `VerseDTO` |
| API Route 파일 | `route.ts` | `app/api/bible/[bookId]/[chapter]/route.ts` |
| 훅 | `use{Feature}{Action}` | `useChapterRead`, `useHighlightToggle` |

### 10.2 Environment Variables

| Variable | Purpose | Scope |
|----------|---------|-------|
| `DATABASE_URL` | PostgreSQL 연결 | Server |
| `NEXTAUTH_SECRET` | 세션 서명 키 | Server |
| `NEXTAUTH_URL` | 앱 URL | Server |
| `NEXT_PUBLIC_APP_URL` | 클라이언트 URL | Client |

---

## 11. Implementation Guide

### 11.1 Full File Structure

위 §9.1 참조 (총 ~50개 파일)

### 11.2 Implementation Order

1. [ ] **M1: 프로젝트 초기화** — Next.js 14 + Tailwind + Prisma + NextAuth 세팅
2. [ ] **M2: 도메인 레이어** — Entity 타입, Repository 인터페이스, Value Objects 정의
3. [ ] **M3: DB + 시드** — Prisma schema 적용, KJV + 한국어 번역 데이터 31,103절 import
4. [ ] **M4: 인프라 레이어** — Prisma 구현체 (BibleRepo, HighlightRepo, ProgressRepo)
5. [ ] **M5: Application 레이어** — Use Cases + ReadingProgressService
6. [ ] **M6: API Route Handlers** — /api/bible, /api/highlights, /api/progress, /api/qt
7. [ ] **M7: 성경 읽기 UI** — BibleReaderPage, VerseItem, ChapterNavigator, LanguageToggle
8. [ ] **M8: 하이라이트·메모 UI** — VerseActionSheet, MemoModal, 저장 연동
9. [ ] **M9: 1독 진행률 UI** — ReadingProgressBar, CalendarView, ProgressPage
10. [ ] **M10: 검색 UI** — SearchBar, SearchResultPage
11. [ ] **M11: PWA 오프라인** — Service Worker, 캐시 전략, Background Sync
12. [ ] **M12: QT 묵상 UI** — QTEditor, QTList, QTDetailPage

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Turns |
|--------|-----------|-------------|:-----:|
| 프로젝트 초기화 + 도메인 | `module-1` | M1 + M2: 세팅, 타입 정의 | 30-40 |
| DB + 데이터 시드 | `module-2` | M3: Prisma schema + 성경 데이터 import | 40-50 |
| 인프라 + Application | `module-3` | M4 + M5 + M6: Repository + UseCase + API | 50-60 |
| 성경 읽기 UI | `module-4` | M7 + M8: Reader + 하이라이트·메모 | 50-60 |
| 진행률 + 검색 UI | `module-5` | M9 + M10: Progress + Search | 40-50 |
| PWA + QT | `module-6` | M11 + M12: 오프라인 + 묵상 | 40-50 |

#### Recommended Session Plan

| Session | Phase | Scope | Turns |
|---------|-------|-------|:-----:|
| Session 1 | Plan + Design | 전체 | 35-40 |
| Session 2 | Do | `--scope module-1,module-2` | 50-60 |
| Session 3 | Do | `--scope module-3` | 50-60 |
| Session 4 | Do | `--scope module-4` | 50-60 |
| Session 5 | Do | `--scope module-5,module-6` | 50-60 |
| Session 6 | Check + Report | 전체 | 35-40 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-15 | Initial draft (Clean Architecture 선택) | dkpark55@gmail.com |
