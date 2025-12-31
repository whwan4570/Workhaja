# Railway 404 에러 해결 가이드

## 문제
백엔드 API 호출 시 404 에러 발생:
```
path: "/workhaja-back-production.up.railway.app/auth/register"
httpStatus: 404
```

## 원인 분석

로그를 보면 요청 경로에 도메인이 포함되어 있습니다:
- ❌ 잘못된 경로: `/workhaja-back-production.up.railway.app/auth/register`
- ✅ 올바른 경로: `/auth/register`

이것은 **프론트엔드의 API URL 설정이 잘못되었을 가능성**이 높습니다.

## 해결 방법

### 1. 프론트엔드 환경 변수 확인

Railway 대시보드에서:
1. **프론트엔드 서비스** 선택
2. **"Variables"** 탭 클릭
3. `NEXT_PUBLIC_API_URL` 확인

**올바른 설정:**
```
NEXT_PUBLIC_API_URL=https://workhaja-back-production.up.railway.app
```

**잘못된 설정 (예시):**
```
NEXT_PUBLIC_API_URL=https://workhaja-back-production.up.railway.app/auth
```
- 끝에 `/auth` 같은 경로를 추가하지 마세요!

```
NEXT_PUBLIC_API_URL=/workhaja-back-production.up.railway.app
```
- `https://` 프로토콜이 빠져있으면 안 됩니다!

### 2. 백엔드 서비스 URL 확인

Railway 대시보드에서:
1. **백엔드 서비스** 선택
2. **"Settings"** 탭 클릭
3. **"Generate Domain"** 버튼이 있으면 클릭 (도메인이 없다면)
4. 생성된 URL 복사 (예: `https://workhaja-back-production.up.railway.app`)

### 3. 환경 변수 설정 방법

#### Railway에서 환경 변수 추가/수정:

1. 프론트엔드 서비스 → **"Variables"** 탭
2. **"New Variable"** 클릭 또는 기존 변수 클릭
3. 설정:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: 백엔드 서비스의 전체 URL (예: `https://workhaja-back-production.up.railway.app`)
4. **"Add"** 또는 **"Update"** 클릭
5. 프론트엔드 서비스가 **자동으로 재배포**됩니다

### 4. 확인 사항 체크리스트

- [ ] 백엔드 서비스가 실행 중인지 확인
- [ ] 백엔드 서비스에 도메인이 할당되어 있는지 확인
- [ ] `NEXT_PUBLIC_API_URL`이 `https://`로 시작하는지 확인
- [ ] `NEXT_PUBLIC_API_URL` 끝에 경로(`/auth`, `/api` 등)가 없는지 확인
- [ ] 백엔드 URL과 프론트엔드 URL이 다른지 확인
  - 백엔드: `workhaja-back-production.up.railway.app`
  - 프론트엔드: `workhaja-production.up.railway.app`

### 5. 올바른 설정 예시

#### 백엔드 서비스 (shiftory-api)
```
Service Name: workhaja-back
Domain: https://workhaja-back-production.up.railway.app
```

#### 프론트엔드 서비스 (staff-scheduling-ui)
```
Service Name: workhaja-frontend
Domain: https://workhaja-production.up.railway.app
Variables:
  NEXT_PUBLIC_API_URL=https://workhaja-back-production.up.railway.app
```

### 6. 백엔드 API 테스트

브라우저나 curl로 직접 테스트:

```bash
# 백엔드가 정상 작동하는지 확인 (Unix/Linux/Mac)
curl https://workhaja-back-production.up.railway.app/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Windows PowerShell의 경우
curl.exe -X POST https://workhaja-back-production.up.railway.app/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

**예상 응답:**
- ✅ 성공 (200): `{"accessToken":"...","storeId":"..."}`
- ⚠️ 400 Bad Request: 요청 데이터 문제
- ⚠️ 401 Unauthorized: 인증 문제
- ❌ 502 Bad Gateway: **백엔드 서버가 실행되지 않음** - Railway 대시보드에서 백엔드 서비스 상태 확인 필요
- ❌ 404 Not Found: 경로가 잘못되었거나 백엔드가 해당 엔드포인트를 제공하지 않음

### 7. 프론트엔드에서 API 호출 확인

브라우저 개발자 도구에서:
1. **F12** 누르기
2. **Network** 탭 열기
3. 회원가입/로그인 시도
4. 실패한 요청 클릭
5. **Request URL** 확인:
   - ✅ 올바름: `https://workhaja-back-production.up.railway.app/auth/register`
   - ❌ 잘못됨: `https://workhaja-production.up.railway.app/workhaja-back-production.up.railway.app/auth/register`

## 추가 문제 해결

### 백엔드가 404를 반환하는 경우

백엔드 서비스 로그 확인:
1. Railway 대시보드 → 백엔드 서비스
2. **"Deployments"** 탭
3. 최신 배포 클릭
4. 로그 확인:
   - 서버가 시작되었는지
   - 에러 메시지가 있는지
   - 포트가 올바른지 (Railway는 동적 포트 사용)

### CORS 에러가 발생하는 경우

백엔드의 `FRONTEND_URL` 환경 변수 확인:
```
FRONTEND_URL=https://workhaja-production.up.railway.app
```

## 요약

1. **프론트엔드 환경 변수**: `NEXT_PUBLIC_API_URL`을 백엔드 URL로 설정 (프로토콜 포함, 경로 제외)
2. **백엔드 도메인**: Railway에서 생성된 도메인 확인
3. **재배포**: 환경 변수 변경 후 자동 재배포 확인
4. **테스트**: 브라우저 개발자 도구에서 실제 요청 URL 확인

