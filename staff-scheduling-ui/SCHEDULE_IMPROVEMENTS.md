# Schedule 페이지 개선 구현 완료

## 생성/수정된 파일 목록

### 새로 생성된 파일
1. `lib/settingsApi.ts` - Labor rules 및 weekStartsOn 설정 API
2. `components/modals/create-month-modal.tsx` - Create Month 모달 컴포넌트

### 수정된 파일
1. `lib/date.ts` - 주간 범위 계산 및 유틸리티 함수 추가
2. `lib/schedulingApi.ts` - getMonth, createMonth API 추가
3. `app/schedule/page.tsx` - Month/Week 뷰 토글 및 전체 기능 구현

## 주요 구현 내용

### 1. 날짜 유틸리티 확장 (`lib/date.ts`)

#### 추가된 함수
- `parseYMD(ymd: string)`: YYYY-MM-DD 문자열을 Date로 변환
- `getWeekRange(anchorDate, weekStartsOn)`: 주간 범위 계산
  - weekStartsOn: 0 = Sunday, 1 = Monday
  - from, to (YYYY-MM-DD), days 배열 반환
- `addMonths(year, month, delta)`: 월 추가/빼기
- `formatWeekRange(from, to)`: 주간 범위 포맷팅 ("Week of Jan 5 – Jan 11, 2026")

### 2. 스케줄 API 확장 (`lib/schedulingApi.ts`)

#### 추가된 함수
- `getMonth(storeId, year, month)`: 월 정보 조회 (404 시 null 반환)
- `createMonth(storeId, payload)`: 새 월 생성
  - payload: `{ year, month, lockAt? }`

### 3. 설정 API (`lib/settingsApi.ts`)

#### 주요 함수
- `getLaborRules(storeId)`: Labor rules 조회
- `getWeekStartsOn(storeId)`: weekStartsOn 값 가져오기
  - 백엔드 API 시도 → localStorage fallback → 기본값 1 (Monday)
- `setWeekStartsOn(weekStartsOn)`: localStorage에 저장 (임시)

### 4. Create Month 모달 (`components/modals/create-month-modal.tsx`)

- Year, Month는 현재 보고 있는 월로 고정
- lockAt 입력 (datetime-local, 옵션)
- 성공 시 월 상태 새로고침

### 5. Schedule 페이지 개선 (`app/schedule/page.tsx`)

#### 주요 기능

**1. Month/Week 뷰 토글**
- Tabs 컴포넌트로 뷰 전환
- MONTH: 월별 shift 표시
- WEEK: 주별 shift 표시

**2. 월 존재 여부 확인**
- MONTH 모드 진입 시 `getMonth()` 호출
- 404 응답 시 `monthExists = false`
- Alert 표시 + "Create Month" 버튼

**3. Week 뷰**
- `anchorDate` 기반 주간 네비게이션
- Prev/Next 버튼으로 ±7일 이동
- 주간 범위 표시: "Week of Jan 5 – Jan 11, 2026"
- 왼쪽 패널에 주간 날짜 리스트 (shift 개수 표시)

**4. weekStartsOn 설정**
- WEEK 모드에서만 표시되는 Selector
- "Week starts on: Sunday/Monday"
- 변경 시 localStorage 저장 및 즉시 반영

**5. Status 및 lockAt 표시**
- Status Badge: OPEN/DRAFT/PUBLISHED/unknown
- lockAt가 있으면 Alert로 표시

**6. Shift 로딩 범위**
- MONTH 모드: `getMonthRange()` 사용
- WEEK 모드: `getWeekRange()` 사용 (weekStartsOn 반영)

**7. Published 상태 처리**
- Add Shift 버튼 비활성화
- Publish 버튼 비활성화
- 안내 문구 표시

## 사용된 백엔드 엔드포인트

### 필수 (이미 구현됨)
1. **GET /stores/:storeId/shifts?from=YYYY-MM-DD&to=YYYY-MM-DD**
2. **POST /stores/:storeId/months/:year-:month/shifts**
3. **POST /stores/:storeId/months/:year-:month/publish**

### 추가 (구현 필요 시)
4. **GET /stores/:storeId/months/:year-:month**
   - 404 시 null 반환 (월 없음)
   - 성공 시 ScheduleMonth 반환

5. **POST /stores/:storeId/months**
   - Body: `{ year, month, lockAt? }`
   - ScheduleMonth 반환

6. **GET /stores/:storeId/labor-rules** (옵션)
   - `{ weekStartsOn?: number }` 반환
   - 없으면 localStorage fallback 사용

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

### ✅ 시나리오 1: Store 선택 후 /schedule 진입
1. `/login`에서 로그인
2. `/stores`에서 store 선택
3. `/schedule`로 이동
4. MONTH 모드에서 현재 월의 shift 로드 확인

### ✅ 시나리오 2: Month가 없으면 Alert + Create Month
1. 존재하지 않는 월로 이동 (예: 미래 월)
2. "This month is not created yet" Alert 확인
3. "Create Month" 버튼 클릭
4. 모달에서 lockAt 입력 (옵션)
5. "Create Month" 클릭
6. 성공 시 Alert 사라지고 Status 표시

### ✅ 시나리오 3: MONTH 모드에서 shifts 로드 확인
1. MONTH 모드 유지
2. Prev/Next로 월 이동
3. 각 월의 shift가 올바르게 로드되는지 확인

### ✅ 시나리오 4: WEEK 모드로 전환 및 weekStartsOn 변경
1. "Week" 탭 클릭
2. 주간 범위 표시 확인 ("Week of ...")
3. "Week starts on" Selector에서 "Sunday" 선택
4. 주간 범위가 일요일부터 시작하도록 변경되는지 확인
5. "Monday"로 다시 변경
6. 주간 범위가 월요일부터 시작하도록 변경되는지 확인

### ✅ 시나리오 5: Week에서 Add Shift 생성
1. WEEK 모드에서 날짜 선택
2. "Add Shift" 버튼 클릭
3. Shift 생성
4. 성공 시 해당 날짜의 shift 리스트에 반영되는지 확인

### ✅ 시나리오 6: Publish 후 PUBLISHED 상태 확인
1. MONTH 모드에서 "Publish Month" 클릭
2. 확인 모달에서 "Publish Schedule" 클릭
3. 성공 시:
   - Badge가 "PUBLISHED"로 변경
   - "Add Shift" 버튼 비활성화
   - "Publish Month" 버튼 비활성화
   - 안내 문구 표시

### ✅ 시나리오 7: Published 이후 Add Shift 시도
1. Published 상태에서 "Add Shift" 클릭
2. 모달에서 "Month is published. Changes require approval." 메시지 확인
3. 폼 필드가 비활성화되는지 확인

## 주요 UX 개선사항

### 1. 뷰 모드 전환
- Month/Week 토글로 쉽게 전환
- 각 모드에 맞는 네비게이션 (월/주)

### 2. 주 시작 요일 설정
- WEEK 모드에서만 표시
- 즉시 반영 (localStorage 저장)
- 백엔드 API 없이도 동작

### 3. 월 존재 여부 처리
- 명확한 Alert 메시지
- Create Month 버튼으로 즉시 생성 가능
- 생성 후 자동 새로고침

### 4. Status 표시
- Badge로 명확한 상태 표시
- lockAt 정보 제공
- unknown 상태도 표시

### 5. Week 뷰
- 주간 날짜 리스트로 쉬운 네비게이션
- 각 날짜의 shift 개수 표시
- 선택된 날짜 하이라이트

## 다음 개선 사항 (선택)

1. **멤버 드롭다운**: Add Shift 모달에서 user ID 대신 멤버 선택
2. **Shift 편집**: Shift 카드 클릭 시 편집 모달
3. **Shift 삭제**: Cancel 버튼 기능
4. **Week 뷰 캘린더**: 주간 그리드 뷰 추가
5. **백엔드 PUT**: weekStartsOn을 백엔드에 저장하는 API 연동

