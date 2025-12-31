# Railway 프론트엔드 API URL 502 에러 해결

## 문제
프론트엔드에서 API 호출 시 502 에러 발생:
```
OPTIONS /auth/register
502 Bad Gateway
connection dial timeout
host: workhaja-production.up.railway.app
```

## 원인
프론트엔드가 자신의 도메인(`workhaja-production.up.railway.app`)으로 API 요청을 보내고 있습니다. 
실제로는 **백엔드 도메인**으로 요청을 보내야 합니다.

이것은 `NEXT_PUBLIC_API_URL` 환경 변수가 설정되지 않았거나 잘못 설정되었을 때 발생합니다.

## 해결 방법

### 1. 프론트엔드 환경 변수 확인 및 설정

Railway 대시보드에서:

1. **프론트엔드 서비스** (`workhaja-production`) 선택
2. **"Variables"** 탭 클릭
3. `NEXT_PUBLIC_API_URL` 변수 확인

**현재 상태:**
- ❌ 변수가 없거나
- ❌ 잘못된 값이 설정되어 있거나
- ❌ 프론트엔드 자신의 URL로 설정되어 있음

### 2. 올바른 설정 방법

#### 백엔드 URL 확인:
1. **백엔드 서비스** (`workhaja-back-production`) 선택
2. **"Settings"** 탭 클릭
3. 생성된 도메인 확인 (예: `https://workhaja-back-production.up.railway.app`)

#### 프론트엔드 Variables 설정:
1. **프론트엔드 서비스** → **"Variables"** 탭
2. **"New Variable"** 클릭 (없는 경우) 또는 기존 변수 클릭
3. 설정:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: 백엔드 서비스의 전체 URL
     - 예: `https://workhaja-back-production.up.railway.app`
4. **"Add"** 또는 **"Update"** 클릭

**중요:**
- ✅ `https://` 프로토콜 포함
- ✅ 백엔드 도메인 사용 (프론트엔드 도메인이 아님!)
- ✅ 끝에 경로(`/api`, `/auth` 등) 추가하지 않기

### 3. 올바른 설정 예시

```
프론트엔드 서비스:
  Name: workhaja-production
  Domain: https://workhaja-production.up.railway.app
  Variables:
    NEXT_PUBLIC_API_URL=https://workhaja-back-production.up.railway.app

백엔드 서비스:
  Name: workhaja-back-production
  Domain: https://workhaja-back-production.up.railway.app
```

### 4. 잘못된 설정 예시

❌ **잘못됨:**
```
NEXT_PUBLIC_API_URL=https://workhaja-production.up.railway.app
```
→ 프론트엔드 자신의 URL로 설정 (자기 자신에게 요청)

❌ **잘못됨:**
```
NEXT_PUBLIC_API_URL=/auth
```
→ 상대 경로 (프로토콜 없음)

❌ **잘못됨:**
```
NEXT_PUBLIC_API_URL=https://workhaja-back-production.up.railway.app/api
```
→ 끝에 `/api` 경로 추가 (불필요)

### 5. 재배포 확인

환경 변수를 설정/수정하면 Railway가 자동으로 프론트엔드를 재배포합니다.

1. **"Deployments"** 탭에서 재배포 상태 확인
2. 배포 완료 대기
3. 브라우저에서 테스트

### 6. 브라우저에서 확인

재배포 후:

1. 브라우저 개발자 도구 (F12) 열기
2. **Network** 탭 열기
3. 회원가입/로그인 시도
4. 요청 URL 확인:
   - ✅ 올바름: `https://workhaja-back-production.up.railway.app/auth/register`
   - ❌ 잘못됨: `https://workhaja-production.up.railway.app/auth/register`

## 체크리스트

- [ ] 백엔드 서비스가 실행 중인지 확인
- [ ] 백엔드 서비스의 도메인 URL 확인
- [ ] 프론트엔드 Variables에 `NEXT_PUBLIC_API_URL` 설정
- [ ] `NEXT_PUBLIC_API_URL`이 백엔드 도메인으로 설정되어 있는지
- [ ] `NEXT_PUBLIC_API_URL`이 `https://`로 시작하는지
- [ ] `NEXT_PUBLIC_API_URL` 끝에 경로가 없는지
- [ ] 프론트엔드 재배포가 완료되었는지
- [ ] 브라우저 Network 탭에서 실제 요청 URL 확인

## 추가 디버깅

### 코드에서 확인:
`staff-scheduling-ui/lib/api.ts`에서:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
```

- `NEXT_PUBLIC_API_URL`이 설정되지 않으면 기본값 `http://localhost:3000` 사용
- Railway에서는 환경 변수가 반드시 설정되어야 함

### 빌드 타임 vs 런타임

`NEXT_PUBLIC_*` 환경 변수는 **빌드 타임**에 번들에 포함됩니다:
- 환경 변수를 변경한 후 **재배포**가 필요함
- 코드만 변경해서는 반영되지 않음
- Railway가 자동으로 재배포하지만 완료될 때까지 기다려야 함

## 요약

1. **백엔드 도메인 확인**: `https://workhaja-back-production.up.railway.app`
2. **프론트엔드 Variables에 `NEXT_PUBLIC_API_URL` 설정**: 백엔드 도메인으로
3. **재배포 대기**: 자동 재배포 완료될 때까지
4. **브라우저에서 확인**: Network 탭에서 실제 요청 URL 확인

이렇게 설정하면 프론트엔드가 올바른 백엔드 URL로 API 요청을 보내게 됩니다!

