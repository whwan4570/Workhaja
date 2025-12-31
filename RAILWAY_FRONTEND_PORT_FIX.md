# Railway 프론트엔드 "Stopping Container" 에러 해결

## 문제
프론트엔드가 Railway에서 시작되다가 바로 멈추는 문제:
```
Starting Container
✓ Starting...
✓ Ready in 325ms
> next start
▲ Next.js 16.0.10
- Local:         http://localhost:8080
Stopping Container
```

## 원인
Next.js가 Railway의 동적 PORT 환경 변수를 올바르게 사용하지 못하는 경우가 있습니다.

## 해결 방법

### 방법 1: package.json 수정 (권장)

`staff-scheduling-ui/package.json`의 start 스크립트를 다음과 같이 수정:

```json
{
  "scripts": {
    "start": "next start -p ${PORT:-3000}"
  }
}
```

이렇게 하면:
- Railway가 제공하는 PORT 환경 변수를 사용
- PORT가 없으면 기본값 3000 사용 (로컬 개발용)

### 방법 2: Railway Settings에서 확인

1. Railway 대시보드에서 프론트엔드 서비스 선택
2. "Settings" 탭 클릭
3. "Start Command" 확인:
   ```
   npm run start
   ```
4. "Variables" 탭에서 PORT 환경 변수가 자동으로 설정되어 있는지 확인
   - Railway가 자동으로 PORT를 제공합니다
   - 수동으로 설정할 필요 없습니다

### 방법 3: 헬스체크 확인

Railway는 기본적으로 헬스체크를 수행합니다. Next.js는 루트 경로(`/`)에서 응답을 반환하므로 문제가 없어야 합니다.

만약 헬스체크가 문제라면:
1. Railway Settings에서 "Healthcheck Path" 확인
2. 기본값은 `/`입니다
3. 필요시 명시적으로 설정

## 확인 사항

### 1. 빌드가 성공했는지 확인
```
✓ Build completed
```

### 2. 서버가 시작되는지 확인
```
✓ Ready in XXXms
```

### 3. 로그에서 에러 메시지 확인
Railway 대시보드의 "Deployments" 탭에서 전체 로그 확인

## 추가 디버깅

### Railway 로그에서 확인할 사항:
1. **빌드 에러**: 빌드 단계에서 에러가 있는지
2. **포트 충돌**: 포트가 이미 사용 중인지
3. **메모리 부족**: 메모리 한도 초과
4. **타임아웃**: 시작 시간이 너무 오래 걸리는지

### 로컬에서 테스트:
```bash
cd staff-scheduling-ui
npm run build
PORT=8080 npm run start
```

## 완전한 설정 예시

### package.json
```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev -p 3001",
    "lint": "eslint .",
    "start": "next start -p ${PORT:-3000}"
  }
}
```

### railway.json (선택사항)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 참고
- Next.js는 기본적으로 `process.env.PORT`를 자동으로 감지합니다
- 하지만 명시적으로 `-p ${PORT}`를 지정하는 것이 더 안전합니다
- Railway는 PORT 환경 변수를 자동으로 제공하므로 별도 설정 불필요

