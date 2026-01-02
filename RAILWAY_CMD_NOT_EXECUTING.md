# Railway CMD 명령어가 실행되지 않는 문제

## 문제
Prisma 마이그레이션은 성공했지만, Dockerfile CMD의 나머지 부분(서버 시작)이 실행되지 않습니다.

## 증상
- Deploy Logs에서 `No pending migrations to apply.` 메시지 후 더 이상 로그가 없음
- 서버 시작 메시지 (`🚀 Workhaja API is running...`)가 나타나지 않음
- 디버깅용 `echo` 명령어도 출력되지 않음

## 가능한 원인

### 1. CMD 명령어 구문 문제
`sh -c`에서 여러 명령어를 연결할 때 문제가 발생할 수 있습니다.

### 2. Railway가 Dockerfile 변경사항을 인식하지 못함
Railway가 캐시된 이미지를 사용하고 있을 수 있습니다.

### 3. Prisma migrate deploy가 프로세스를 종료함
마이그레이션이 완료된 후 프로세스가 종료될 수 있습니다.

## 해결 방법

### 방법 1: CMD를 쉘 스크립트로 분리

`workhaja-api/Dockerfile`을 다음과 같이 수정:

```dockerfile
# Run migrations and start server
COPY <<EOF /app/start.sh
#!/bin/sh
set -e
echo "=== Starting migrations ==="
npx prisma migrate deploy
echo "=== Migrations done ==="
echo "=== Checking dist folder ==="
ls -la dist/
echo "=== Starting server ==="
exec node dist/main.js
EOF

RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]
```

### 방법 2: CMD를 단순화

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy; node dist/main.js"]
```

### 방법 3: && 대신 ; 사용

`&&`는 앞 명령어가 성공해야 다음 명령어가 실행되지만, `;`는 무조건 다음 명령어를 실행합니다.

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy; echo 'Starting server'; node dist/main.js"]
```

### 방법 4: Railway Settings에서 Start Command 오버라이드

Railway 대시보드 → 백엔드 서비스 → **"Settings"** 탭:

**Builder**를 "Nixpacks"로 변경하면 Dockerfile 대신 `railway.json`이 사용됩니다.

그런 다음 `railway.json`의 `startCommand`를 사용:
```json
{
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/main.js"
  }
}
```

### 방법 5: Dockerfile 없이 railway.json 사용 (권장)

1. `workhaja-api/Dockerfile`을 임시로 이름 변경:
   ```bash
   mv workhaja-api/Dockerfile workhaja-api/Dockerfile.backup
   ```

2. `railway.json`이 올바르게 설정되어 있는지 확인

3. Railway가 Nixpacks를 사용하도록 설정

4. 재배포

## 현재 Dockerfile CMD 분석

현재 CMD:
```dockerfile
CMD ["sh", "-x", "-c", "set -e && echo '=== Starting migrations ===' && npx prisma migrate deploy && echo '=== Migrations done ===' && echo '=== Checking dist folder ===' && ls -la dist/ && echo '=== Starting server ===' && exec node dist/main.js"]
```

문제점:
- `set -e`는 에러 발생 시 즉시 종료됩니다
- `&&` 연결은 모든 명령어가 성공해야 합니다
- `sh -x`는 디버깅 출력을 하지만 Railway 로그에 나타나지 않을 수 있습니다

## 권장 해결 방법

가장 간단한 방법으로 시작:

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

이렇게 하면:
1. 마이그레이션 실행
2. 성공하면 서버 시작
3. 실패하면 에러 메시지 표시

## 체크리스트

- [ ] Dockerfile의 CMD가 올바른 형식인지 확인
- [ ] Railway가 새로운 Dockerfile을 사용하는지 확인 (빌드 로그에서 "Using Detected Dockerfile" 확인)
- [ ] CMD를 단순화하여 테스트
- [ ] Railway Settings에서 Builder를 "Nixpacks"로 변경하여 railway.json 사용 시도
- [ ] Dockerfile 없이 railway.json만 사용하는 방법 시도

