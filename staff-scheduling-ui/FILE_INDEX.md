# File Index - Quick Reference

## 📁 App Pages (12 files)

| File | Description |
|------|-------------|
| `app/documents/page.tsx` | 문서 및 컴플라이언스 관리 페이지 |
| `app/join/page.tsx` | 초대 링크 조인 페이지 |
| `app/login/page.tsx` | 로그인 페이지 |
| `app/notifications/page.tsx` | 알림 인박스 페이지 |
| `app/notifications/debug/page.tsx` | Admin 디버그 도구 페이지 |
| `app/reports/page.tsx` | 리포트 페이지 |
| `app/requests/page.tsx` | 변경 요청 페이지 |
| `app/schedule/page.tsx` | 스케줄 페이지 |
| `app/schedule/loading.tsx` | 스케줄 로딩 컴포넌트 |
| `app/signup/page.tsx` | 회원가입 페이지 |
| `app/stores/page.tsx` | 스토어 목록 페이지 |
| `app/layout.tsx` | 루트 레이아웃 |
| `app/globals.css` | 전역 스타일 |

## 🧩 Feature Components (20 files)

### Core Components
- `components/availability-editor.tsx` - 가용성 편집기
- `components/member-table.tsx` - 멤버 테이블
- `components/schedule-calendar.tsx` - 스케줄 캘린더
- `components/shift-card.tsx` - 시프트 카드
- `components/sidebar.tsx` - 사이드바 네비게이션
- `components/store-list.tsx` - 스토어 목록
- `components/theme-provider.tsx` - 테마 프로바이더
- `components/topbar.tsx` - 상단 바 (알림 벨 포함)

### Documents Components (4 files)
- `components/documents/create-document-modal.tsx`
- `components/documents/document-card.tsx`
- `components/documents/review-submission-row.tsx`
- `components/documents/submit-compliance-modal.tsx`

### Modals (8 files)
- `components/modals/add-shift-modal.tsx`
- `components/modals/create-month-modal.tsx`
- `components/modals/create-request-modal.tsx`
- `components/modals/create-store-modal.tsx`
- `components/modals/invite-member-modal.tsx`
- `components/modals/publish-confirmation-modal.tsx`
- `components/modals/request-change-modal.tsx`
- `components/modals/shift-modal.tsx`

### Notifications Components (4 files)
- `components/notifications/notification-bell.tsx`
- `components/notifications/notification-filters.tsx`
- `components/notifications/notification-item.tsx`
- `components/notifications/notification-list.tsx`

## 🎨 UI Components (57 files - shadcn/ui)

### Form Components
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/select.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/switch.tsx`
- `components/ui/radio-group.tsx`
- `components/ui/label.tsx`
- `components/ui/form.tsx`
- `components/ui/field.tsx`

### Layout Components
- `components/ui/card.tsx`
- `components/ui/dialog.tsx`
- `components/ui/sheet.tsx`
- `components/ui/tabs.tsx`
- `components/ui/accordion.tsx`
- `components/ui/separator.tsx`
- `components/ui/sidebar.tsx`

### Feedback Components
- `components/ui/alert.tsx`
- `components/ui/toast.tsx`
- `components/ui/sonner.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/spinner.tsx`
- `components/ui/progress.tsx`

### Navigation Components
- `components/ui/dropdown-menu.tsx`
- `components/ui/navigation-menu.tsx`
- `components/ui/breadcrumb.tsx`
- `components/ui/menubar.tsx`

### Data Display
- `components/ui/table.tsx`
- `components/ui/badge.tsx`
- `components/ui/avatar.tsx`
- `components/ui/calendar.tsx`
- `components/ui/chart.tsx`
- `components/ui/carousel.tsx`

### 기타 UI Components (30+ files)
- `components/ui/alert-dialog.tsx`
- `components/ui/aspect-ratio.tsx`
- `components/ui/button-group.tsx`
- `components/ui/collapsible.tsx`
- `components/ui/command.tsx`
- `components/ui/context-menu.tsx`
- `components/ui/drawer.tsx`
- `components/ui/empty.tsx`
- `components/ui/hover-card.tsx`
- `components/ui/input-group.tsx`
- `components/ui/input-otp.tsx`
- `components/ui/item.tsx`
- `components/ui/kbd.tsx`
- `components/ui/pagination.tsx`
- `components/ui/popover.tsx`
- `components/ui/resizable.tsx`
- `components/ui/scroll-area.tsx`
- `components/ui/slider.tsx`
- `components/ui/toggle.tsx`
- `components/ui/toggle-group.tsx`
- `components/ui/tooltip.tsx`
- `components/ui/use-mobile.tsx`
- `components/ui/use-toast.ts`

## 🔌 API Clients (12 files)

- `lib/api.ts` - 메인 API 클라이언트 (인증 포함)
- `lib/availabilityApi.ts` - 가용성 API
- `lib/date.ts` - 날짜 유틸리티 함수
- `lib/documentsApi.ts` - 문서 API
- `lib/mock-data.ts` - 목업 데이터
- `lib/notificationsApi.ts` - 알림 API
- `lib/reportsApi.ts` - 리포트 API
- `lib/requestsApi.ts` - 변경 요청 API
- `lib/schedulingApi.ts` - 스케줄링 API
- `lib/settingsApi.ts` - 설정 API
- `lib/submissionsApi.ts` - 제출 API
- `lib/types.ts` - 공통 타입
- `lib/utils.ts` - 유틸리티 함수

## 📝 Types (4 files)

- `types/availability.ts` - 가용성 타입 정의
- `types/documents.ts` - 문서 타입 정의
- `types/notifications.ts` - 알림 타입 정의
- `types/requests.ts` - 변경 요청 타입 정의

## 🪝 Hooks (3 files)

- `hooks/useAuth.ts` - 인증 훅
- `hooks/use-mobile.ts` - 모바일 감지 훅
- `hooks/use-toast.ts` - 토스트 훅

## 📚 Documentation (12 files)

- `AVAILABILITY_IMPLEMENTATION.md`
- `AVAILABILITY_SUMMARY.md`
- `CHANGE_REQUESTS_IMPLEMENTATION.md`
- `DOCUMENTS_COMPLETE.md`
- `DOCUMENTS_IMPLEMENTATION.md`
- `FRONTEND_BACKEND_CONNECTION.md`
- `IMPLEMENTATION_COMPLETE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `NOTIFICATIONS_IMPLEMENTATION.md`
- `SCHEDULE_IMPLEMENTATION.md`
- `SCHEDULE_IMPROVEMENTS.md`
- `STEP4_STEP5_IMPLEMENTATION.md`

## ⚙️ Configuration (5 files)

- `components.json` - shadcn/ui 설정
- `next.config.mjs` - Next.js 설정
- `package.json` - 의존성 관리
- `postcss.config.mjs` - PostCSS 설정
- `tsconfig.json` - TypeScript 설정

## 🖼️ Static Assets (8 files)

- `public/apple-icon.png`
- `public/icon-dark-32x32.png`
- `public/icon-light-32x32.png`
- `public/icon.svg`
- `public/placeholder-logo.png`
- `public/placeholder-logo.svg`
- `public/placeholder-user.jpg`
- `public/placeholder.jpg`
- `public/placeholder.svg`

## 📊 Summary

| Category | Count |
|----------|-------|
| Pages | 12 |
| Feature Components | 20 |
| UI Components | 57 |
| API Clients | 12 |
| Types | 4 |
| Hooks | 3 |
| Documentation | 12 |
| Configuration | 5 |
| Static Assets | 8 |
| **Total** | **133** |

