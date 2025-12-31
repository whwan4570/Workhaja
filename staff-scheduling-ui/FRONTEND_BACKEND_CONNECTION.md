# 프론트엔드-백엔드 연결 가이드

## 설정 완료 사항

### 1. API 클라이언트 생성
- `lib/api.ts` 파일에 API 클라이언트 구현
- 인증 토큰 관리 (localStorage)
- 에러 처리 포함

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. 백엔드 CORS 설정
- 백엔드에서 `http://localhost:3001` (또는 프론트엔드 포트) 허용하도록 설정됨

## 연결된 기능

### ✅ 로그인 (`/login`)
- 실제 백엔드 API 호출
- 성공 시 토큰 저장 및 `/stores`로 리다이렉트

### ✅ 회원가입 (`/signup`)
- 실제 백엔드 API 호출
- 자동으로 Store 생성 및 OWNER 멤버십 할당
- 성공 시 토큰 저장 및 `/stores`로 리다이렉트

### ✅ Stores 페이지 (`/stores`)
- 실제 백엔드에서 Store 목록 가져오기
- Store 생성 기능
- 멤버 초대 기능
- 멤버 목록 조회

## 실행 방법

### 1. 백엔드 실행

```bash
cd /Users/joon/shiftory-api
npm run start:dev
```

백엔드가 `http://localhost:3000`에서 실행됩니다.

### 2. 프론트엔드 실행

```bash
cd /Users/joon/Downloads/staff-scheduling-ui
npm install  # 처음 한 번만
npm run dev
```

프론트엔드가 `http://localhost:3001` (또는 다른 포트)에서 실행됩니다.

### 3. 테스트

1. 브라우저에서 `http://localhost:3001` 접속
2. 회원가입 또는 로그인
3. Stores 페이지에서 기능 테스트

## API 엔드포인트 매핑

| 프론트엔드 | 백엔드 | 설명 |
|-----------|--------|------|
| `authApi.register()` | `POST /auth/register` | 회원가입 |
| `authApi.login()` | `POST /auth/login` | 로그인 |
| `authApi.getMe()` | `GET /auth/me` | 현재 사용자 정보 |
| `storesApi.getStores()` | `GET /stores` | 내가 속한 Store 목록 |
| `storesApi.createStore()` | `POST /stores` | Store 생성 |
| `storesApi.getStoreMe()` | `GET /stores/:storeId/me` | Store에서 내 역할 |
| `membershipsApi.getStoreMembers()` | `GET /stores/:storeId/members` | Store 멤버 목록 |
| `membershipsApi.createMembership()` | `POST /stores/:storeId/memberships` | 멤버 초대 |

## 문제 해결

### CORS 에러
- 백엔드의 `main.ts`에서 CORS 설정 확인
- 프론트엔드 포트가 `FRONTEND_URL` 환경변수와 일치하는지 확인

### 인증 에러 (401)
- 토큰이 localStorage에 저장되어 있는지 확인
- 브라우저 개발자 도구 > Application > Local Storage 확인

### API 연결 실패
- 백엔드가 실행 중인지 확인
- `.env.local`의 `NEXT_PUBLIC_API_URL`이 올바른지 확인
- 네트워크 탭에서 요청 URL 확인

## 다음 단계

추가로 구현할 수 있는 기능:
- [ ] 로그아웃 기능
- [ ] 토큰 만료 시 자동 갱신
- [ ] 에러 바운더리
- [ ] 로딩 상태 표시 개선
- [ ] Schedule 페이지 API 연결

