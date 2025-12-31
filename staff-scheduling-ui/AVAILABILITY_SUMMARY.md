# Availability UI 구현 요약

## 구현 완료

### ✅ 타입/API 레이어
- `types/availability.ts`: Availability 타입 정의
- `lib/availabilityApi.ts`: API 클라이언트 (list, upsert, delete)

### ✅ Schedule 페이지 통합
- Shifts/Availability 탭 추가
- Availability 로드 및 상태 관리
- 사용자 role 및 ID 로드

### ✅ Availability 편집 UI
- `components/availability-editor.tsx`: 편집 컴포넌트
- All day / Time window 옵션
- Save/Delete 기능
- lockAt 및 monthStatus 기반 비활성화

### ✅ 캘린더 표시
- MONTH 모드: 날짜에 dot 표시
- WEEK 모드: 날짜 리스트에 badge 표시

### ✅ 관리자 뷰
- OWNER/MANAGER: 선택 날짜의 모든 unavailable 인원 표시
- WORKER: 본인만 표시

### ✅ lockAt 처리
- 마감 시간 확인
- 마감 후 편집 비활성화
- 명확한 안내 문구

## 파일 구조

```
staff-scheduling-ui/
├── types/
│   └── availability.ts          # Availability 타입
├── lib/
│   └── availabilityApi.ts       # Availability API
├── components/
│   ├── availability-editor.tsx  # 편집 컴포넌트
│   └── schedule-calendar.tsx    # 캘린더 (수정됨)
└── app/
    └── schedule/
        └── page.tsx              # Schedule 페이지 (수정됨)
```

## API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/stores/:storeId/months/:year-:month/availability` | 월별 availability 조회 |
| POST | `/stores/:storeId/months/:year-:month/availability` | availability 생성/수정 |
| DELETE | `/stores/:storeId/availability/:availabilityId` | availability 삭제 |

## 테스트 체크리스트

- [x] Worker 계정으로 로그인 후 월 생성
- [x] All day unavailable 저장 → dot 표시
- [x] Time window unavailable 저장
- [x] Availability 삭제 → dot 사라짐
- [x] lockAt 마감 후 편집 비활성화
- [x] 403 에러 메시지 표시
- [x] 관리자 계정에서 unavailable 인원 목록 표시

## 실행 방법

```bash
# 백엔드
cd /Users/joon/shiftory-api
npm run start:dev

# 프론트엔드
cd /Users/joon/Downloads/staff-scheduling-ui
npm run dev
```

## 주요 UX

1. **직관적인 토글**: "I'm unavailable this day"로 쉽게 설정
2. **All day 옵션**: 전체 일 또는 시간대 선택 가능
3. **시각적 표시**: 캘린더에 dot로 availability 표시
4. **명확한 안내**: lockAt 마감 시 명확한 메시지
5. **관리자 뷰**: 팀 전체 availability 한눈에 확인

