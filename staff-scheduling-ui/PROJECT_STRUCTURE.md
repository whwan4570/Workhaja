# Project Structure - staff-scheduling-ui

## Overview
Next.js App Router 기반의 스태프 스케줄링 프론트엔드 애플리케이션

## Directory Structure

```
staff-scheduling-ui/
├── app/                          # Next.js App Router 페이지
│   ├── documents/               # 문서 및 컴플라이언스 페이지
│   │   └── page.tsx
│   ├── join/                    # 초대 링크 조인 페이지
│   │   └── page.tsx
│   ├── login/                   # 로그인 페이지
│   │   └── page.tsx
│   ├── notifications/           # 알림 페이지
│   │   ├── debug/               # Admin 디버그 도구
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── reports/                 # 리포트 페이지
│   │   └── page.tsx
│   ├── requests/                # 변경 요청 페이지
│   │   └── page.tsx
│   ├── schedule/                # 스케줄 페이지
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── signup/                  # 회원가입 페이지
│   │   └── page.tsx
│   ├── stores/                  # 스토어 목록 페이지
│   │   └── page.tsx
│   ├── globals.css              # 전역 스타일
│   └── layout.tsx               # 루트 레이아웃
│
├── components/                   # React 컴포넌트
│   ├── documents/               # 문서 관련 컴포넌트
│   │   ├── create-document-modal.tsx
│   │   ├── document-card.tsx
│   │   ├── review-submission-row.tsx
│   │   └── submit-compliance-modal.tsx
│   ├── modals/                  # 모달 컴포넌트
│   │   ├── add-shift-modal.tsx
│   │   ├── create-month-modal.tsx
│   │   ├── create-request-modal.tsx
│   │   ├── create-store-modal.tsx
│   │   ├── invite-member-modal.tsx
│   │   ├── publish-confirmation-modal.tsx
│   │   ├── request-change-modal.tsx
│   │   └── shift-modal.tsx
│   ├── notifications/           # 알림 관련 컴포넌트
│   │   ├── notification-bell.tsx
│   │   ├── notification-filters.tsx
│   │   ├── notification-item.tsx
│   │   └── notification-list.tsx
│   ├── ui/                      # shadcn/ui 컴포넌트 (60+ 파일)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── ... (기타 UI 컴포넌트들)
│   ├── availability-editor.tsx  # 가용성 편집기
│   ├── member-table.tsx         # 멤버 테이블
│   ├── schedule-calendar.tsx    # 스케줄 캘린더
│   ├── shift-card.tsx           # 시프트 카드
│   ├── sidebar.tsx              # 사이드바
│   ├── store-list.tsx           # 스토어 목록
│   ├── theme-provider.tsx       # 테마 프로바이더
│   └── topbar.tsx               # 상단 바
│
├── hooks/                        # React 커스텀 훅
│   ├── use-mobile.ts
│   ├── use-toast.ts
│   └── useAuth.ts                # 인증 훅
│
├── lib/                          # 유틸리티 및 API 클라이언트
│   ├── api.ts                    # 메인 API 클라이언트
│   ├── availabilityApi.ts        # 가용성 API
│   ├── date.ts                   # 날짜 유틸리티
│   ├── documentsApi.ts          # 문서 API
│   ├── mock-data.ts              # 목업 데이터
│   ├── notificationsApi.ts      # 알림 API
│   ├── reportsApi.ts             # 리포트 API
│   ├── requestsApi.ts            # 요청 API
│   ├── schedulingApi.ts          # 스케줄링 API
│   ├── settingsApi.ts            # 설정 API
│   ├── submissionsApi.ts         # 제출 API
│   ├── types.ts                  # 공통 타입
│   └── utils.ts                  # 유틸리티 함수
│
├── types/                        # TypeScript 타입 정의
│   ├── availability.ts           # 가용성 타입
│   ├── documents.ts              # 문서 타입
│   ├── notifications.ts          # 알림 타입
│   └── requests.ts               # 요청 타입
│
├── public/                       # 정적 파일
│   ├── apple-icon.png
│   ├── icon-dark-32x32.png
│   ├── icon-light-32x32.png
│   ├── icon.svg
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
│
├── styles/                       # 스타일 파일
│   └── globals.css
│
├── Documentation/                # 문서 파일들
│   ├── AVAILABILITY_IMPLEMENTATION.md
│   ├── AVAILABILITY_SUMMARY.md
│   ├── CHANGE_REQUESTS_IMPLEMENTATION.md
│   ├── DOCUMENTS_COMPLETE.md
│   ├── DOCUMENTS_IMPLEMENTATION.md
│   ├── FRONTEND_BACKEND_CONNECTION.md
│   ├── IMPLEMENTATION_COMPLETE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── NOTIFICATIONS_IMPLEMENTATION.md
│   ├── SCHEDULE_IMPLEMENTATION.md
│   ├── SCHEDULE_IMPROVEMENTS.md
│   └── STEP4_STEP5_IMPLEMENTATION.md
│
├── Configuration Files
│   ├── components.json           # shadcn/ui 설정
│   ├── next.config.mjs          # Next.js 설정
│   ├── package.json             # 의존성 관리
│   ├── postcss.config.mjs       # PostCSS 설정
│   └── tsconfig.json            # TypeScript 설정
│
└── Lock Files
    ├── package-lock.json
    └── pnpm-lock.yaml
```

## File Count by Category

### Pages (app/) - 12 files
- **Main Pages**: 9 pages (documents, login, notifications, reports, requests, schedule, signup, stores, join)
- **Sub Pages**: 2 pages (notifications/debug)
- **Layout/Config**: 2 files (layout.tsx, globals.css, loading.tsx)

### Components - 77+ files
- **Feature Components**: 8 files
  - availability-editor.tsx
  - member-table.tsx
  - schedule-calendar.tsx
  - shift-card.tsx
  - sidebar.tsx
  - store-list.tsx
  - theme-provider.tsx
  - topbar.tsx

- **Documents Components**: 4 files
  - create-document-modal.tsx
  - document-card.tsx
  - review-submission-row.tsx
  - submit-compliance-modal.tsx

- **Modals**: 8 files
  - add-shift-modal.tsx
  - create-month-modal.tsx
  - create-request-modal.tsx
  - create-store-modal.tsx
  - invite-member-modal.tsx
  - publish-confirmation-modal.tsx
  - request-change-modal.tsx
  - shift-modal.tsx

- **Notifications Components**: 4 files
  - notification-bell.tsx
  - notification-filters.tsx
  - notification-item.tsx
  - notification-list.tsx

- **UI Components (shadcn/ui)**: 57 files
  - Basic: button, input, label, textarea, select, checkbox, switch
  - Layout: card, dialog, sheet, tabs, accordion
  - Feedback: alert, toast, sonner, skeleton, spinner
  - Navigation: sidebar, dropdown-menu, navigation-menu
  - Data Display: table, badge, avatar, calendar
  - Form: form, field, radio-group
  - 기타: 40+ 컴포넌트

### Hooks - 3 files
- useAuth.ts (인증)
- use-mobile.ts (반응형)
- use-toast.ts (토스트)

### API Clients (lib/) - 12 files
- api.ts (메인 클라이언트)
- availabilityApi.ts
- documentsApi.ts
- notificationsApi.ts
- reportsApi.ts
- requestsApi.ts
- schedulingApi.ts
- settingsApi.ts
- submissionsApi.ts
- date.ts (날짜 유틸)
- types.ts (공통 타입)
- utils.ts (유틸리티)
- mock-data.ts (목업)

### Types - 4 files
- availability.ts
- documents.ts
- notifications.ts
- requests.ts

### Documentation - 12 files
- 구현 가이드 및 완료 문서들

### Configuration - 5 files
- components.json
- next.config.mjs
- package.json
- postcss.config.mjs
- tsconfig.json

### Static Assets - 8 files
- 아이콘 및 플레이스홀더 이미지들

## 주요 기능별 파일 그룹

### 1. 인증 (Authentication)
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `hooks/useAuth.ts`
- `lib/api.ts` (인증 포함)

### 2. 스토어 관리 (Store Management)
- `app/stores/page.tsx`
- `components/store-list.tsx`
- `components/modals/create-store-modal.tsx`
- `components/modals/invite-member-modal.tsx`
- `components/member-table.tsx`

### 3. 스케줄링 (Scheduling)
- `app/schedule/page.tsx`
- `components/schedule-calendar.tsx`
- `components/shift-card.tsx`
- `components/modals/add-shift-modal.tsx`
- `components/modals/create-month-modal.tsx`
- `components/modals/publish-confirmation-modal.tsx`
- `lib/schedulingApi.ts`

### 4. 가용성 (Availability)
- `components/availability-editor.tsx`
- `lib/availabilityApi.ts`
- `types/availability.ts`

### 5. 변경 요청 (Change Requests)
- `app/requests/page.tsx`
- `components/modals/create-request-modal.tsx`
- `lib/requestsApi.ts`
- `types/requests.ts`

### 6. 문서 및 컴플라이언스 (Documents & Compliance)
- `app/documents/page.tsx`
- `components/documents/*` (4 files)
- `lib/documentsApi.ts`
- `lib/submissionsApi.ts`
- `types/documents.ts`

### 7. 리포트 (Reports)
- `app/reports/page.tsx`
- `lib/reportsApi.ts`

### 8. 알림 (Notifications)
- `app/notifications/page.tsx`
- `app/notifications/debug/page.tsx`
- `components/notifications/*` (4 files)
- `components/topbar.tsx` (벨 포함)
- `lib/notificationsApi.ts`
- `types/notifications.ts`

## 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui (60+ components)
- **State Management**: React Hooks
- **HTTP Client**: Axios (via api.ts)
- **Date Handling**: date-fns (via lib/date.ts)
- **Notifications**: Sonner (toast)

## 주요 패턴

1. **API Layer**: 모든 API 호출은 `lib/*Api.ts` 파일로 분리
2. **Type Safety**: 모든 타입은 `types/` 디렉토리에 정의
3. **Component Organization**: 기능별로 디렉토리 분리
4. **Modal Pattern**: 재사용 가능한 모달 컴포넌트
5. **Page Structure**: Next.js App Router 기반 페이지 라우팅

## 총 파일 수

- **Pages**: ~12 files
- **Components**: ~77 files (UI 컴포넌트 포함)
- **Hooks**: 3 files
- **API Clients**: 12 files
- **Types**: 4 files
- **Documentation**: 12 files
- **Configuration**: 5 files
- **Static Assets**: 8 files

**총계: 약 134 파일** (node_modules 제외)

## 파일 통계

- **UI Components**: 57 files (shadcn/ui)
- **Feature Components**: 20 files (기능별 컴포넌트)
- **Pages**: 12 files
- **API Clients**: 12 files
- **Types**: 4 files
- **Hooks**: 3 files
- **Documentation**: 12 files
- **Configuration**: 5 files
- **Static Assets**: 8 files
- **Styles**: 1 file

**총 134 파일**

