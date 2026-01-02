# Railway: Dockerfile vs railway.json

## 문제
Dockerfile을 사용할 때 서버가 시작되지 않고 컨테이너가 즉시 종료됩니다.

## 해결 방법: Dockerfile 대신 railway.json 사용

Railway는 두 가지 방법으로 배포할 수 있습니다:
1. **Dockerfile 사용** (현재 방식)
2. **railway.json 사용** (권장)

### 방법 1: Railway Settings에서 Builder 변경

Railway 대시보드 → 백엔드 서비스 → **"Settings"** 탭:

1. **"Builder"** 섹션 찾기
2. **"Nixpacks"** 선택 (Dockerfile 대신)
3. 저장

이렇게 하면 Railway가 `railway.json` 파일을 사용합니다.

### 방법 2: Dockerfile 임시 제거

임시로 Dockerfile의 이름을 변경:

```bash
mv workhaja-api/Dockerfile workhaja-api/Dockerfile.backup
```

그리고 `railway.json`이 사용되도록 합니다.

**주의**: 이 방법은 빌드 과정도 변경될 수 있으므로 주의가 필요합니다.

### railway.json 설정 확인

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

## Dockerfile vs railway.json 비교

### Dockerfile 사용 시
- ✅ 더 많은 제어 가능
- ✅ 멀티 스테이지 빌드 가능
- ❌ 복잡함
- ❌ 디버깅 어려움
- ❌ 현재 문제 발생

### railway.json 사용 시
- ✅ 간단함
- ✅ Railway 최적화
- ✅ 자동 최적화
- ✅ 디버깅 쉬움
- ✅ 권장 방법

## 권장 해결 방법

**Railway Settings에서 Builder를 "Nixpacks"로 변경하는 것이 가장 간단하고 안전합니다.**

이렇게 하면:
1. Dockerfile이 무시됨
2. `railway.json`이 사용됨
3. 빌드 및 시작 명령어가 `railway.json`에서 가져옴
4. 더 나은 로깅 및 디버깅

## 단계별 가이드

1. Railway 대시보드 → 백엔드 서비스 (`Workhaja`)
2. **"Settings"** 탭 클릭
3. **"Builder"** 섹션 찾기
4. **"Nixpacks"** 선택 (또는 "Dockerfile"에서 변경)
5. 저장
6. 서비스가 자동으로 재배포됨
7. Deploy Logs 확인

## 체크리스트

- [ ] Railway Settings에서 Builder 확인
- [ ] Builder를 "Nixpacks"로 변경
- [ ] `railway.json` 파일이 올바르게 설정되어 있는지 확인
- [ ] 재배포 후 Deploy Logs 확인
- [ ] 서버 시작 메시지 확인

