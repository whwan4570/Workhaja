# Schedule 페이지 백엔드 연결 구현 가이드

## 구현 완료 사항

### 1. 날짜 유틸리티 (`lib/date.ts`)
- `getMonthRange()`: 월 범위 계산 (from, to, days)
- `formatYMD()`: Date를 YYYY-MM-DD로 변환
- `extractYMD()`: ISO 문자열에서 YYYY-MM-DD 추출
- `timeToMinutes()`, `compareTimes()`: 시간 비교 유틸리티

### 2. 스케줄 API 레이어 (`lib/schedulingApi.ts`)
- `getShifts()`: 날짜 범위로 shift 조회
- `createShift()`: 새 shift 생성
- `publishMonth()`: 월 스케줄 발행
- Shift, ScheduleMonth 타입 정의

### 3. 인증 훅 (`hooks/useAuth.ts`)
- `useAuth()`: 토큰 및 storeId 관리
- 자동 로그인 리다이렉트

### 4. Add Shift 모달 (`components/modals/add-shift-modal.tsx`)
- Shift 생성 폼
- 유효성 검사 (시간 형식, endTime > startTime)
- Published 상태에서 비활성화
- 에러 처리 (403, 400 등)

### 5. Schedule 페이지 (`app/schedule/page.tsx`)
- 월별 shift 로드
- 날짜 선택 및 필터링
- Shift 그룹핑 (날짜별)
- Publish 기능
- 로딩/에러/빈 상태 처리
- Canceled shift 토글

## 사용된 백엔드 엔드포인트

1. **GET /stores/:storeId/shifts?from=YYYY-MM-DD&to=YYYY-MM-DD**
   - 날짜 범위로 shift 조회
   - 쿼리 파라미터: `from`, `to`, `userId` (optional)

2. **POST /stores/:storeId/months/:year-:month/shifts**
   - 새 shift 생성
   - Body: `{ userId, date, startTime, endTime, breakMins? }`
   - 권한: OWNER 또는 MANAGER

3. **POST /stores/:storeId/months/:year-:month/publish**
   - 월 스케줄 발행
   - 권한: OWNER만

## 환경 변수

`.env.local` 파일에 다음을 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 실행 방법

### 1. 백엔드 실행
```bash
cd /Users/joon/shiftory-api
npm run start:dev
```

### 2. 프론트엔드 실행
```bash
cd /Users/joon/Downloads/staff-scheduling-ui
npm run dev
```

프론트엔드는 `http://localhost:3001`에서 실행됩니다.

## 테스트 시나리오

### 1. 로그인 및 Store 선택
1. `/login`에서 로그인
2. `/stores`에서 store 선택 (storeId가 localStorage에 저장됨)
3. `/schedule`로 이동

### 2. 월 Shift 로드 확인
- 현재 월의 shift가 자동으로 로드됨
- 상단에 "January 2026" 같은 월 표시
- Prev/Next 버튼으로 월 이동 가능

### 3. 날짜 선택 및 Shift 표시
- 왼쪽 캘린더에서 날짜 클릭
- 중간 패널에 해당 날짜의 shift만 표시
- 빈 날짜는 "No shifts scheduled" 메시지

### 4. Add Shift
1. "Add Shift" 버튼 클릭
2. 폼 입력:
   - Employee: user ID 입력 (텍스트)
   - Date: 선택된 날짜 (기본값)
   - Start Time: HH:mm 형식
   - End Time: HH:mm 형식 (startTime보다 커야 함)
   - Break Minutes: 숫자
3. "Create Shift" 클릭
4. 성공 시 목록 자동 새로고침

### 5. Publish Month (OWNER만)
1. "Publish Month" 버튼 클릭
2. 확인 모달에서 "Publish Schedule" 클릭
3. 성공 시:
   - Badge가 "PUBLISHED"로 변경
   - "Add Shift" 버튼 비활성화
   - Published 상태 안내 문구 표시

### 6. Published 상태에서 Add Shift 시도
1. Published 상태에서 "Add Shift" 클릭
2. 모달에서 "Month is published. Changes require approval." 메시지 표시
3. 폼 필드 비활성화

## 주요 기능

### Shift 그룹핑
- `groupShiftsByDate()` 함수로 날짜별 그룹화
- 선택된 날짜의 shift만 표시

### Canceled Shift 필터
- "Show canceled" 체크박스로 토글
- 기본값: false (canceled shift 숨김)

### 에러 처리
- 403: "Only OWNER can publish" 또는 "Month is published"
- 400/409: 서버 메시지 표시
- 네트워크 에러: "Failed to load shifts" + Retry 버튼

### 로딩 상태
- 최초 로드: 스피너 + "Loading shifts..."
- 새로고침: 버튼에 스피너 아이콘

## 다음 개선 사항

1. **멤버 드롭다운**: Add Shift 모달에서 user ID 대신 멤버 선택
2. **Shift 편집**: Shift 카드 클릭 시 편집 모달
3. **Shift 삭제**: Cancel 버튼 기능
4. **월 상태 조회**: GET /stores/:storeId/months/:year-:month로 실제 상태 가져오기
5. **Optimistic Updates**: Shift 생성 시 즉시 UI 업데이트

