# Railway 백엔드 서버 시작 실패 문제 해결

## 문제
백엔드 서비스에서 502 "connection dial timeout" 에러가 발생하며, 서버가 응답하지 않습니다.

**증상:**
- HTTP Logs: `"connection dial timeout"` 에러 (3번 재시도)
- Deploy Logs: Prisma 마이그레이션은 성공했지만 서버 시작 메시지가 없음

## 원인 분석

### 가능한 원인들:

1. **서버가 시작되지 않음**
   - `npm run start:prod` 명령이 실행되지 않음
   - `dist/main.js` 파일이 없거나 잘못됨
   - 빌드가 실패했지만 로그에 표시되지 않음

2. **서버가 시작되다가 크래시됨**
   - 환경 변수 누락
   - 런타임 에러
   - 의존성 문제

3. **포트 바인딩 실패**
   - Railway의 `PORT` 환경 변수를 사용하지 않음
   - 포트 충돌

## 해결 방법

### 1. Railway Start Command 확인

Railway 대시보드 → 백엔드 서비스 → **"Settings"** 탭:

**현재 설정 확인:**
- **Root Directory**: `workhaja-api` (또는 `shiftory-api`)
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm run start:prod`

**올바른 설정:**
```
Root Directory: workhaja-api
Build Command: npm install && npx prisma generate && npm run build
Start Command: npx prisma migrate deploy && npm run start:prod
```

### 2. Deploy Logs 전체 확인

Railway 대시보드 → 백엔드 서비스 → 최신 배포 → **"Deploy Logs"** 탭:

**확인해야 할 내용:**

1. **빌드 단계:**
   ```
   ✓ npm install 완료
   ✓ npx prisma generate 완료
   ✓ npm run build 완료
   ✓ dist/main.js 파일 생성 확인
   ```

2. **마이그레이션 단계:**
   ```
   ✓ npx prisma migrate deploy 실행
   ✓ "No pending migrations to apply" 또는 마이그레이션 성공
   ```

3. **서버 시작 단계:**
   ```
   ✓ node dist/main 실행
   ✓ "🚀 Workhaja API is running on: http://localhost:PORT" 메시지
   ```

**만약 서버 시작 메시지가 없다면:**
- 서버가 시작되지 않았거나
- 시작하다가 크래시되었을 가능성이 높습니다

### 3. 에러 로그 확인

Deploy Logs의 마지막 부분을 자세히 확인하세요:

- **에러 메시지가 있는지**
- **스택 트레이스가 있는지**
- **어디서 멈췄는지**

### 4. Start Command 분리 (디버깅용)

문제를 정확히 파악하기 위해 Start Command를 단계별로 분리할 수 있습니다:

**임시 Start Command (디버깅용):**
```bash
npx prisma migrate deploy && echo "Migrations done" && node dist/main.js
```

이렇게 하면 어느 단계에서 실패하는지 명확히 알 수 있습니다.

### 5. 포트 확인

`workhaja-api/src/main.ts` 파일에서 포트 설정이 올바른지 확인:

```typescript
const port = process.env.PORT || 3000;
await app.listen(port);
console.log(`🚀 Workhaja API is running on: http://localhost:${port}`);
```

✅ `process.env.PORT`를 사용하고 있으면 Railway의 동적 포트를 올바르게 사용합니다.

### 6. 환경 변수 확인

백엔드 서비스 → **"Variables"** 탭에서 필수 변수가 모두 설정되어 있는지 확인:

**필수 변수:**
- [x] `DATABASE_URL` - PostgreSQL 연결 문자열
- [x] `JWT_SECRET` - JWT 시크릿 키
- [x] `FRONTEND_URL` - 프론트엔드 URL (CORS용)

**주의:** `PORT` 환경 변수는 **설정하지 마세요**. Railway가 자동으로 제공합니다.

### 7. 빌드 파일 확인

로컬에서 빌드가 제대로 되는지 확인:

```bash
cd workhaja-api
npm install
npx prisma generate
npm run build

# dist/main.js 파일이 생성되었는지 확인
ls -la dist/main.js

# 로컬에서 테스트 실행
node dist/main.js
```

로컬에서 정상 작동한다면 Railway 설정 문제일 가능성이 높습니다.

### 8. 로그 레벨 확인

NestJS가 더 자세한 에러를 출력하도록 하려면, Start Command에 환경 변수를 추가할 수 있습니다:

```bash
NODE_ENV=production npx prisma migrate deploy && npm run start:prod
```

## 체크리스트

- [ ] Railway Start Command가 올바른지 확인 (`npx prisma migrate deploy && npm run start:prod`)
- [ ] Deploy Logs에서 서버 시작 메시지 확인 (`🚀 Workhaja API is running...`)
- [ ] Deploy Logs에서 에러 메시지 확인
- [ ] `dist/main.js` 파일이 빌드되었는지 확인
- [ ] 필수 환경 변수가 모두 설정되었는지 확인
- [ ] 로컬에서 빌드 및 실행이 되는지 확인
- [ ] 포트 설정이 `process.env.PORT`를 사용하는지 확인

## 다음 단계

Deploy Logs의 **전체 내용**을 확인하여:
1. 서버 시작 메시지가 있는지
2. 에러 메시지가 있는지
3. 어느 단계에서 멈췄는지

확인하신 후 결과를 알려주시면 더 정확한 해결 방법을 제시하겠습니다.

