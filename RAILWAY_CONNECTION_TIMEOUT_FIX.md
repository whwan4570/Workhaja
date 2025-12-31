# Railway Connection Dial Timeout 에러 해결

## 문제
Railway HTTP 로그에서 다음 에러 발생:
```
"connection dial timeout"
"Retried single replica"
httpStatus: 502
upstreamAddress: "" (비어있음)
```

## 원인 분석

이 에러는 Railway가 백엔드 서버에 연결할 수 없다는 의미입니다:
1. 서버가 시작되지 않았거나
2. 서버가 크래시되었거나
3. 포트 설정이 잘못되었거나
4. 서버가 Railway의 동적 포트를 사용하지 않고 있습니다

## 해결 방법

### 1. Deploy Logs 확인 (가장 중요!)

Railway 대시보드에서:
1. 백엔드 서비스 선택
2. **"Deployments"** 탭 클릭
3. 최신 배포 (Completed 상태) 클릭
4. **"Deploy Logs"** 탭 확인

**확인할 내용:**
- ✅ 서버가 시작되었는지 확인:
  ```
  🚀 Workhaja API is running on: http://localhost:PORT
  ```
- ❌ 에러 메시지 확인:
  - 데이터베이스 연결 에러
  - 포트 에러
  - 환경 변수 누락
  - 빌드 에러

### 2. 백엔드 포트 설정 확인

Railway는 동적 포트를 사용합니다. 백엔드는 `process.env.PORT`를 사용해야 합니다.

**확인 사항:**
- `shiftory-api/src/main.ts`에서 포트 설정:
  ```typescript
  const port = process.env.PORT || 3000;
  await app.listen(port);
  ```
  ✅ 올바른 설정입니다!

### 3. 환경 변수 확인

Railway 대시보드 → 백엔드 서비스 → **"Variables"** 탭에서:

**필수 변수:**
```
DATABASE_URL=postgresql://... (Railway가 자동 생성해야 함)
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend.railway.app
```

**주의:**
- `PORT` 변수를 수동으로 설정하지 마세요! Railway가 자동으로 설정합니다.
- `PORT`를 수동으로 설정하면 Railway의 동적 포트와 충돌할 수 있습니다.

### 4. 데이터베이스 연결 확인

가장 흔한 원인 중 하나입니다:

1. PostgreSQL 서비스가 Railway에 추가되어 있는지 확인
2. PostgreSQL 서비스와 백엔드 서비스가 연결되어 있는지 확인
3. `DATABASE_URL` 환경 변수가 자동으로 설정되어 있는지 확인

**Railway에서 데이터베이스 연결:**
1. 백엔드 서비스 → **"Variables"** 탭
2. `DATABASE_URL` 변수가 있는지 확인
3. 없다면 PostgreSQL 서비스를 추가하고 연결

### 5. 빌드 및 시작 명령어 확인

`shiftory-api/railway.json` 확인:

```json
{
  "build": {
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm run start:prod"
  }
}
```

**Railway Settings에서 확인:**
1. 백엔드 서비스 → **"Settings"** 탭
2. Build Command 확인
3. Start Command 확인

### 6. 로컬에서 테스트

로컬에서 동일한 명령어로 테스트:

```bash
cd shiftory-api

# 환경 변수 설정
export DATABASE_URL="your-database-url"
export JWT_SECRET="your-secret"
export PORT=3000

# 빌드
npm install
npx prisma generate
npm run build

# 시작
npx prisma migrate deploy
npm run start:prod
```

로컬에서 작동한다면 Railway 설정 문제입니다.

### 7. 일반적인 문제 및 해결

#### 문제 1: Prisma 마이그레이션 실패

**증상:**
- Deploy Logs: Prisma 에러 메시지
- "Can't reach database server"

**해결:**
- `DATABASE_URL` 확인
- PostgreSQL 서비스가 실행 중인지 확인
- 마이그레이션이 이미 적용되었는지 확인

#### 문제 2: 서버 시작 실패

**증상:**
- 빌드는 성공했지만 서버가 시작되지 않음
- 로그에 시작 메시지가 없음

**해결:**
- 환경 변수 확인 (`JWT_SECRET` 등)
- `main.ts`의 에러 핸들링 확인
- 시작 명령어 확인

#### 문제 3: 포트 충돌

**증상:**
- "Port already in use" 에러
- Railway가 포트를 찾을 수 없음

**해결:**
- `PORT` 환경 변수를 수동으로 설정하지 않기
- Railway가 자동으로 설정하도록 두기
- `process.env.PORT`를 사용하는지 확인

### 8. 재배포

문제를 해결한 후:

1. **Railway 대시보드에서 재배포:**
   - 백엔드 서비스 → **"Settings"** 탭
   - **"Redeploy"** 버튼 클릭

2. **또는 GitHub에 푸시:**
   ```bash
   git add .
   git commit -m "Fix backend configuration"
   git push
   ```
   Railway가 자동으로 재배포합니다.

### 9. 체크리스트

문제 해결을 위한 체크리스트:

- [ ] Deploy Logs에서 서버 시작 메시지 확인
- [ ] Deploy Logs에서 에러 메시지 확인
- [ ] PostgreSQL 서비스가 연결되어 있는지
- [ ] `DATABASE_URL` 환경 변수가 설정되어 있는지
- [ ] `JWT_SECRET` 환경 변수가 설정되어 있는지
- [ ] `PORT` 환경 변수를 수동으로 설정하지 않았는지
- [ ] `railway.json`의 startCommand가 올바른지
- [ ] 로컬에서 동일한 명령어로 테스트
- [ ] 빌드가 성공적으로 완료되었는지

## 디버깅 팁

### Deploy Logs에서 확인할 패턴:

**✅ 정상:**
```
> workhaja-api@1.0.0 start:prod
> node dist/main

🚀 Workhaja API is running on: http://localhost:PORT
```

**❌ 데이터베이스 에러:**
```
Error: P1001: Can't reach database server
```

**❌ 포트 에러:**
```
Error: listen EADDRINUSE: address already in use
```

**❌ 환경 변수 누락:**
```
Error: JWT_SECRET is not defined
```

## 추가 리소스

- Railway 공식 문서: https://docs.railway.app/
- 백엔드 README: `shiftory-api/README.md`
- 환경 변수 가이드: `ENVIRONMENT_VARIABLES.md`

