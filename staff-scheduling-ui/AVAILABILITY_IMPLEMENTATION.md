# Availability UI 구현 완료

## 생성/수정된 파일 목록

### 새로 생성된 파일
1. `types/availability.ts` - Availability 타입 정의
2. `lib/availabilityApi.ts` - Availability API 클라이언트
3. `components/availability-editor.tsx` - Availability 편집 컴포넌트

### 수정된 파일
1. `app/schedule/page.tsx` - Availability 탭 및 기능 통합
2. `components/schedule-calendar.tsx` - Availability 표시 추가

## 주요 구현 내용

### 1. 타입 정의 (`types/availability.ts`)
- `Availability` 인터페이스
  - `id`, `userId`, `date`, `startTime?`, `endTime?`
  - `user?` (관리자 뷰용)

### 2. Availability API (`lib/availabilityApi.ts`)
- `listAvailability()`: 월별 availability 조회
- `upsertAvailability()`: availability 생성/수정 (POST)
- `deleteAvailability()`: availability 삭제 (DELETE)
- 날짜는 항상 YYYY-MM-DD로 normalize

### 3. Availability 편집 컴포넌트 (`components/availability-editor.tsx`)
- "I'm unavailable this day" 토글
- "All day" 체크박스
- 시간 입력 (startTime/endTime) - All day가 아닐 때만
- Save/Delete 버튼
- lockAt 및 monthStatus 기반 비활성화
- 에러 처리 (403, 400 등)

### 4. Schedule 페이지 통합 (`app/schedule/page.tsx`)

#### 추가된 상태
- `contentTab`: "SHIFTS" | "AVAILABILITY"
- `availabilityList`: Availability[]
- `availabilityByDate`: Record<YYYY-MM-DD, Availability[]>
- `myAvailabilityForSelectedDate`: Availability | null
- `userRole`, `userId`: 사용자 역할 및 ID
- `availLoading`, `availError`: 로딩/에러 상태

#### 주요 기능
1. **Availability 로드**
   - MONTH 모드: 해당 월의 availability 로드
   - WEEK 모드: 주가 속한 월의 availability 로드
   - shifts와 병렬로 로드

2. **Shifts/Availability 탭**
   - Tabs 컴포넌트로 전환
   - SHIFTS: 기존 shift 리스트
   - AVAILABILITY: Availability 편집 UI

3. **관리자 뷰**
   - OWNER/MANAGER일 경우 선택 날짜의 모든 unavailable 인원 표시
   - WORKER일 경우 본인만 표시

4. **캘린더 표시**
   - MONTH 모드: 내 availability가 있는 날짜에 dot 표시
   - WEEK 모드: 주간 날짜 리스트에 "Unavailable" badge 표시

5. **lockAt 처리**
   - lockAt이 있고 현재 시간이 지났으면 편집 비활성화
   - "Availability submission deadline has passed." 안내
   - 403 에러 시 "Submission is locked. Contact a manager." 메시지

### 5. 캘린더 표시 (`components/schedule-calendar.tsx`)
- `availabilityByDate` prop 추가
- `userId` prop 추가
- 내 availability가 있는 날짜에 작은 dot 표시
- 선택된 날짜에서는 dot 색상 변경

## 사용된 백엔드 엔드포인트

1. **GET /stores/:storeId/months/:year-:month/availability**
   - 월별 availability 조회
   - Worker: 본인만, Manager/Owner: 전체

2. **POST /stores/:storeId/months/:year-:month/availability**
   - availability 생성/수정 (upsert)
   - Body: `{ date: "YYYY-MM-DD", startTime?: "HH:mm" | null, endTime?: "HH:mm" | null }`
   - 권한: Worker (본인만), Manager/Owner (전체)

3. **DELETE /stores/:storeId/availability/:availabilityId**
   - availability 삭제
   - 권한: Worker (본인만), Manager/Owner (전체)

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

### ✅ 시나리오 1: Worker 계정으로 로그인 후 월 생성
1. Worker 계정으로 로그인
2. `/schedule`에서 해당 월 생성 (없으면)
3. Availability 탭 클릭
4. 날짜 선택

### ✅ 시나리오 2: All day unavailable 저장
1. Availability 탭에서 날짜 선택
2. "I'm unavailable this day" 토글 ON
3. "All day" 체크박스 체크
4. "Save" 클릭
5. 캘린더에 dot 표시 확인
6. WEEK 모드에서 "Unavailable" badge 확인

### ✅ 시나리오 3: Time window unavailable 저장
1. Availability 탭에서 날짜 선택
2. "I'm unavailable this day" 토글 ON
3. "All day" 체크박스 해제
4. Start Time: "09:00", End Time: "17:00" 입력
5. "Save" 클릭
6. 저장 확인

### ✅ 시나리오 4: Availability 삭제
1. Availability가 있는 날짜 선택
2. "Delete" 버튼 클릭
3. 캘린더에서 dot 사라지는지 확인

### ✅ 시나리오 5: lockAt 마감 처리
1. lockAt을 과거로 설정한 월로 이동
2. Availability 탭에서 편집 시도
3. "Availability submission deadline has passed." 안내 확인
4. 폼 필드 비활성화 확인
5. 저장 시도 시 403 에러 및 "Submission is locked. Contact a manager." 메시지 확인

### ✅ 시나리오 6: 관리자 계정 (선택)
1. OWNER 또는 MANAGER 계정으로 로그인
2. Availability 탭에서 날짜 선택
3. "Unavailable Team Members" 섹션에 모든 unavailable 인원 표시 확인
4. Worker 계정으로는 본인만 표시되는지 확인

## 주요 기능

### Availability 편집
- 토글: "I'm unavailable this day"
- All day 옵션
- 시간 입력 (startTime/endTime)
- Save/Delete 버튼

### 권한 처리
- Worker: 본인 availability만 조회/수정
- Manager/Owner: 전체 조회 가능 (UI에 표시)

### lockAt 처리
- 마감 시간 확인
- 마감 후 편집 비활성화
- 명확한 안내 문구

### 캘린더 표시
- MONTH 모드: 날짜에 dot 표시
- WEEK 모드: 날짜 리스트에 badge 표시

### 에러 처리
- 403: "Submission is locked. Contact a manager."
- 400/409: 서버 메시지 표시
- 네트워크 에러: "Failed to load availability" + Retry 버튼

## 다음 개선 사항 (선택)

1. **Availability 편집 모달**: 현재는 인라인 편집, 모달로 분리 가능
2. **캘린더 개선**: 더 명확한 availability 표시 (색상, 아이콘)
3. **관리자 기능**: Availability 일괄 관리
4. **통계**: 월별 unavailable 일수 표시
5. **알림**: lockAt 마감 전 알림

