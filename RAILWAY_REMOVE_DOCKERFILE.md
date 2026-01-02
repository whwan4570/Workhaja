# Railway에서 Dockerfile 제거하여 railway.json 사용

## 문제
Railway Settings에 "Dockerfile Path"가 설정되어 있어서 자동으로 Dockerfile을 사용하고 있습니다.

## 해결 방법

### 방법 1: Railway Settings에서 Dockerfile Path 제거 (권장)

Railway 대시보드 → 백엔드 서비스 → **"Settings"** 탭:

1. **"Dockerfile Path"** 필드 찾기
2. 필드를 **비우기** (값 삭제)
3. 저장

이렇게 하면 Railway가 Dockerfile을 사용하지 않고 `railway.json`을 사용합니다.

### 방법 2: Dockerfile 이름 변경 (이미 적용됨)

Dockerfile을 `Dockerfile.backup`으로 이름 변경:

```bash
git mv workhaja-api/Dockerfile workhaja-api/Dockerfile.backup
git commit -m "Temporarily rename Dockerfile to use railway.json"
git push
```

이렇게 하면 Railway가 Dockerfile을 찾을 수 없으므로 `railway.json`을 사용합니다.

### 방법 3: Dockerfile 삭제 (주의)

Dockerfile을 완전히 삭제할 수도 있지만, 나중에 필요할 수 있으므로 이름 변경을 권장합니다.

## railway.json 확인

`workhaja-api/railway.json` 파일이 올바르게 설정되어 있는지 확인:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 다음 단계

1. Dockerfile 이름 변경 (또는 Settings에서 Dockerfile Path 제거)
2. Railway가 자동으로 재배포 시작
3. Deploy Logs 확인
4. 서버 시작 메시지 확인: `🚀 Workhaja API is running on: http://localhost:PORT`

## Dockerfile 다시 사용하려면

나중에 Dockerfile을 다시 사용하고 싶다면:

1. `Dockerfile.backup`을 `Dockerfile`로 이름 변경
2. Railway Settings에서 Dockerfile Path 설정
3. 재배포

## 참고

- Railway는 `Dockerfile` 파일이 있으면 자동으로 감지합니다
- `railway.json`과 `Dockerfile`이 둘 다 있으면 Dockerfile이 우선됩니다
- Dockerfile을 사용하지 않으려면 이름을 변경하거나 Settings에서 경로를 제거해야 합니다

