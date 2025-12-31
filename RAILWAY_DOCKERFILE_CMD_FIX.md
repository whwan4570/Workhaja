# Railway Dockerfile CMD 디버깅

## 문제
Railway가 Dockerfile을 사용하고 있어서 `railway.json`의 Start Command가 무시됩니다. 서버가 시작되지 않습니다.

## 원인
Railway는 프로젝트 루트에 Dockerfile이 있으면 그것을 사용합니다. 이 경우 Dockerfile의 `CMD`가 실행됩니다.

## 해결 방법

### 1. Dockerfile의 CMD 수정 (권장)

`workhaja-api/Dockerfile` 파일의 마지막 줄을 수정:

**현재:**
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
```

**디버깅용 (더 상세한 로그):**
```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && echo '=== Migrations done ===' && ls -la dist/ && echo '=== Starting server ===' && node dist/main.js"]
```

또는 에러를 더 잘 보기 위해:
```dockerfile
CMD ["sh", "-c", "set -e && npx prisma migrate deploy && echo '=== Migrations done ===' && ls -la dist/ && echo '=== Starting server ===' && exec node dist/main.js"]
```

### 2. Dockerfile 없이 railway.json 사용 (대안)

만약 Dockerfile을 사용하지 않고 싶다면:

1. Dockerfile을 임시로 이름 변경:
   ```bash
   mv workhaja-api/Dockerfile workhaja-api/Dockerfile.backup
   ```

2. `railway.json`의 Start Command가 사용됩니다.

3. 다시 Dockerfile을 사용하려면:
   ```bash
   mv workhaja-api/Dockerfile.backup workhaja-api/Dockerfile
   ```

**주의**: 이 방법은 빌드 과정도 변경될 수 있으므로 주의가 필요합니다.

### 3. Railway Settings에서 Start Command 설정

Railway 대시보드 → 백엔드 서비스 → **"Settings"** 탭:

**Builder**: "Nixpacks" 선택 (Dockerfile 대신)
- 이렇게 하면 Dockerfile이 무시되고 `railway.json`이 사용됩니다.

### 4. 환경 변수 확인

Dockerfile을 사용하더라도 환경 변수는 Railway의 Variables에서 설정됩니다.

백엔드 서비스 → **"Variables"** 탭에서 확인:
- `DATABASE_URL` - 필수
- `JWT_SECRET` - 필수
- `FRONTEND_URL` - 필수
- `PORT` - 설정하지 마세요 (Railway가 자동 제공)

### 5. Deploy Logs 확인

CMD를 수정한 후 재배포하고 Deploy Logs를 확인:

1. "=== Migrations done ===" 메시지가 나타나는지
2. `dist/` 폴더의 파일 목록
3. "=== Starting server ===" 메시지가 나타나는지
4. 서버 시작 메시지 (`🚀 Workhaja API is running...`)
5. 에러 메시지

## 현재 상태 확인

### Dockerfile 사용 여부 확인

Build Logs에 다음이 나타나면 Dockerfile을 사용 중입니다:
```
Using Detected Dockerfile
```

### railway.json vs Dockerfile

- **Dockerfile이 있으면**: Dockerfile의 `CMD`가 사용됩니다
- **Dockerfile이 없으면**: `railway.json`의 `startCommand`가 사용됩니다
- **Railway Settings에서 Builder를 "Nixpacks"로 변경하면**: Dockerfile이 무시되고 `railway.json`이 사용됩니다

## 권장 해결 방법

1. **Dockerfile의 CMD를 디버깅용으로 수정** (위의 방법 1)
2. 변경사항 커밋 및 푸시
3. Railway가 자동 재배포
4. Deploy Logs 확인하여 어느 단계에서 실패하는지 파악
5. 문제 해결 후 CMD를 원래대로 복원하거나 유지

## 체크리스트

- [ ] Dockerfile의 CMD가 올바르게 설정되어 있는지
- [ ] CMD에 디버깅용 echo 명령어 추가
- [ ] 필수 환경 변수가 설정되어 있는지
- [ ] Deploy Logs에서 각 단계 확인
- [ ] 서버 시작 메시지 확인
- [ ] 에러 메시지 확인

