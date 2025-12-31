# Railway 백엔드 서버 시작 실패 해결

## 문제
Deploy Logs에서 Prisma 마이그레이션은 성공했지만, 서버 시작 메시지(`🚀 Workhaja API is running on: http://localhost:PORT`)가 나타나지 않습니다.

## 원인
`npm run start:prod` (즉, `node dist/main`) 명령이 실행되지 않거나, 실행되다가 크래시되고 있습니다.

## 해결 방법

### 방법 1: Start Command에 에러 출력 추가 (권장)

Railway 대시보드 → 백엔드 서비스 → **"Settings"** 탭:

**현재 Start Command:**
```bash
npx prisma migrate deploy && npm run start:prod
```

**수정된 Start Command (디버깅용):**
```bash
npx prisma migrate deploy && echo "=== Migrations done ===" && node dist/main.js
```

또는 더 상세한 로그를 위해:
```bash
npx prisma migrate deploy && echo "=== Migrations done ===" && ls -la dist/ && echo "=== Starting server ===" && node dist/main.js
```

이렇게 하면:
1. 마이그레이션 완료 후 명확한 메시지 출력
2. `dist/` 폴더 내용 확인
3. 서버 시작 시도 및 에러 메시지 확인 가능

### 방법 2: 빌드 확인

**Build Logs**에서 빌드가 성공했는지 확인:

Railway 대시보드 → 백엔드 서비스 → 최신 배포 → **"Build Logs"** 탭:

확인할 내용:
- [ ] `npm install` 성공
- [ ] `npx prisma generate` 성공
- [ ] `npm run build` 성공
- [ ] `dist/main.js` 파일이 생성되었는지

만약 빌드가 실패했다면:
- TypeScript 컴파일 에러
- 의존성 문제
- 빌드 스크립트 문제

### 방법 3: Start Command를 단계별로 분리

문제를 정확히 파악하기 위해 Start Command를 단계별로 실행:

**임시 Start Command:**
```bash
echo "Step 1: Running migrations..." && npx prisma migrate deploy && echo "Step 2: Checking dist folder..." && ls -la dist/ && echo "Step 3: Starting server..." && node dist/main.js
```

### 방법 4: 환경 변수 확인

백엔드 서비스 → **"Variables"** 탭에서 필수 변수 확인:

**필수 변수:**
- `DATABASE_URL` - 설정되어 있어야 함
- `JWT_SECRET` - 설정되어 있어야 함
- `FRONTEND_URL` - 설정되어 있어야 함

**주의:** `PORT` 환경 변수는 **설정하지 마세요**. Railway가 자동으로 제공합니다.

### 방법 5: 로컬에서 테스트

로컬에서 빌드 및 실행이 되는지 확인:

```bash
cd workhaja-api

# 의존성 설치
npm install

# Prisma 생성
npx prisma generate

# 빌드
npm run build

# dist 폴더 확인
ls -la dist/

# 서버 시작 (로컬 포트 사용)
node dist/main.js
```

로컬에서 정상 작동한다면 Railway 설정 문제일 가능성이 높습니다.

### 방법 6: NODE_ENV 설정 확인

프로덕션 환경에서 다른 동작을 하는 코드가 있을 수 있습니다.

**임시로 NODE_ENV 명시:**
```bash
NODE_ENV=production npx prisma migrate deploy && npm run start:prod
```

### 방법 7: Railway Settings 확인

Railway 대시보드 → 백엔드 서비스 → **"Settings"** 탭:

- **Root Directory**: `workhaja-api` (또는 `shiftory-api`)로 설정되어 있는지
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: 위의 디버깅 명령어 사용

## 디버깅 체크리스트

- [ ] Build Logs에서 빌드가 성공했는지 확인
- [ ] Build Logs에서 `dist/main.js` 파일이 생성되었는지 확인
- [ ] Deploy Logs의 전체 내용 확인 (특히 마지막 부분)
- [ ] Start Command에 `echo` 명령어 추가하여 각 단계 확인
- [ ] 필수 환경 변수가 모두 설정되었는지 확인
- [ ] 로컬에서 빌드 및 실행이 되는지 확인
- [ ] Root Directory가 올바르게 설정되었는지 확인

## 예상되는 에러 메시지

Deploy Logs에서 다음 에러들이 나타날 수 있습니다:

1. **파일을 찾을 수 없음:**
   ```
   Error: Cannot find module '/app/dist/main'
   ```
   → 빌드가 실패했거나 `dist/` 폴더가 없음

2. **환경 변수 누락:**
   ```
   Error: Environment variable not found: DATABASE_URL
   ```
   → 환경 변수 설정 확인

3. **포트 바인딩 에러:**
   ```
   Error: listen EADDRINUSE: address already in use
   ```
   → Railway의 `PORT` 환경 변수 사용 확인

4. **의존성 에러:**
   ```
   Error: Cannot find module 'xxx'
   ```
   → `npm install`이 제대로 실행되지 않음

## 다음 단계

1. Start Command를 디버깅용으로 수정
2. 재배포
3. Deploy Logs 전체 확인
4. 에러 메시지 확인
5. 에러에 따라 적절한 해결 방법 적용

## 참고

- `railway.json` 파일의 `startCommand`를 수정해도 되지만, Railway 대시보드의 Settings에서 설정한 값이 우선됩니다.
- Railway 대시보드의 Settings에서 Start Command를 수정하면 `railway.json`의 설정을 덮어씁니다.

