# Railway 프론트엔드 502 에러 해결

## 문제
프론트엔드 루트 경로(`/`)에서 502 에러 발생:
```
GET /
502 Bad Gateway
connection dial timeout
host: workhaja-production.up.railway.app
upstreamAddress: "" (비어있음)
```

## 원인
프론트엔드 서버가 시작되지 않았거나 응답하지 않는 상태입니다.

## 해결 방법

### 1. Deploy Logs 확인 (가장 중요!)

Railway 대시보드에서:
1. **프론트엔드 서비스** (`workhaja-production`) 선택
2. **"Deployments"** 탭 클릭
3. 최신 배포 (Completed 상태) 클릭
4. **"Deploy Logs"** 탭 확인

**확인할 내용:**
- ✅ 빌드가 성공했는지
- ✅ 서버가 시작되었는지:
  ```
  ▲ Next.js 16.0.10
  - Local:         http://localhost:PORT
  ```
- ❌ 에러 메시지 확인:
  - 빌드 에러
  - 포트 에러
  - 시작 에러

### 2. 빌드 에러 확인

Deploy Logs에서 빌드 단계 확인:

**정상:**
```
✓ Compiled successfully
```

**에러:**
- TypeScript 에러
- 의존성 설치 실패
- 빌드 스크립트 에러

### 3. 시작 명령어 확인

Railway Settings에서:
1. 프론트엔드 서비스 → **"Settings"** 탭
2. **"Start Command"** 확인:
   ```
   npm run start
   ```
   또는 `railway.json`의 설정 확인

### 4. 포트 설정 확인

`staff-scheduling-ui/package.json`의 start 스크립트 확인:
```json
{
  "scripts": {
    "start": "next start -p ${PORT:-3000}"
  }
}
```

✅ 이미 올바르게 설정되어 있습니다!

**주의:**
- `PORT` 환경 변수를 수동으로 설정하지 마세요
- Railway가 자동으로 `PORT` 환경 변수를 제공합니다

### 5. 환경 변수 확인

프론트엔드 서비스 → **"Variables"** 탭에서:

**필수 변수:**
```
NEXT_PUBLIC_API_URL=https://workhaja-back-production.up.railway.app
```

**주의:**
- `PORT` 변수를 수동으로 설정하지 마세요
- Railway가 자동으로 제공합니다

### 6. 빌드 명령어 확인

Railway Settings에서:
1. **"Build Command"** 확인:
   ```
   npm install && npm run build
   ```
   또는 `railway.json`의 설정 확인

### 7. 일반적인 문제 및 해결

#### 문제 1: 빌드 실패

**증상:**
- Deploy Logs: 빌드 에러 메시지
- 배포 상태: Failed

**해결:**
1. 로그에서 에러 메시지 확인
2. TypeScript 에러인 경우 코드 수정
3. 의존성 문제인 경우 `package.json` 확인
4. 재배포

#### 문제 2: 서버 시작 실패

**증상:**
- 빌드는 성공했지만 서버가 시작되지 않음
- 로그에 시작 메시지가 없음

**해결:**
1. 시작 명령어 확인 (`npm run start`)
2. 포트 설정 확인
3. 환경 변수 확인

#### 문제 3: 메모리 부족

**증상:**
- 배포 후 바로 크래시
- 로그: 메모리 관련 에러

**해결:**
1. Railway 플랜 확인
2. 불필요한 의존성 제거
3. 빌드 최적화

### 8. 로컬에서 테스트

프론트엔드가 로컬에서 정상 작동하는지 확인:

```bash
cd staff-scheduling-ui
npm install
npm run build
npm run start
```

로컬에서 작동한다면 Railway 설정 문제입니다.

### 9. 체크리스트

- [ ] Deploy Logs에서 빌드 성공 확인
- [ ] Deploy Logs에서 서버 시작 메시지 확인
- [ ] Deploy Logs에서 에러 메시지 확인
- [ ] `NEXT_PUBLIC_API_URL` 환경 변수가 설정되어 있는지
- [ ] `PORT` 환경 변수를 수동으로 설정하지 않았는지
- [ ] `railway.json`의 startCommand가 올바른지
- [ ] 시작 명령어가 올바른지 (`npm run start`)
- [ ] 로컬에서 빌드 및 시작이 되는지

### 10. 재배포

문제를 해결한 후:
1. Railway 대시보드 → 프론트엔드 서비스
2. **"Settings"** 탭
3. **"Redeploy"** 버튼 클릭
4. 또는 GitHub에 푸시하면 자동 재배포

## 디버깅 팁

### Deploy Logs에서 확인할 패턴:

**✅ 정상:**
```
> my-v0-project@0.1.0 build
> next build

✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

> my-v0-project@0.1.0 start
> next start -p ${PORT:-3000}

▲ Next.js 16.0.10
- Local:         http://localhost:PORT
```

**❌ 빌드 에러:**
```
Error: Failed to compile
```

**❌ 시작 에러:**
```
Error: listen EADDRINUSE: address already in use
```

**❌ 포트 에러:**
```
Error: Port is not available
```

## 추가 참고

- Railway 공식 문서: https://docs.railway.app/
- 프론트엔드 README: `staff-scheduling-ui/` (있는 경우)
- 환경 변수 가이드: `ENVIRONMENT_VARIABLES.md`

