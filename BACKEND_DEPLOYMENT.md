# 백엔드 배포 가이드

Shiftory 백엔드를 배포하는 방법을 설명합니다. Railway 또는 Render를 사용할 수 있습니다.

## 🚂 Railway 배포 (추천)

### 장점
- 무료 티어 제공
- PostgreSQL 자동 설정
- GitHub 연동
- 간단한 설정

### 배포 단계

1. **Railway 계정 생성**
   - https://railway.app 접속
   - GitHub로 로그인

2. **프로젝트 생성**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - `shiftory-api` 저장소 선택

3. **PostgreSQL 데이터베이스 추가**
   - "New" > "Database" > "PostgreSQL" 선택
   - Railway가 자동으로 `DATABASE_URL` 환경 변수를 생성합니다

4. **환경 변수 설정**
   - 프로젝트 > "Variables" 탭
   - 다음 변수 추가:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=https://your-vercel-app.vercel.app
INTERNAL_KEY=your-internal-key-for-admin-endpoints

# S3/R2 설정 (선택사항)
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-bucket.public-url.com
```

5. **빌드 설정**
   - "Settings" > "Build Command": `npm install && npx prisma generate && npm run build`
   - "Settings" > "Start Command": `npx prisma migrate deploy && npm run start:prod`

6. **배포**
   - Railway가 자동으로 배포를 시작합니다
   - 배포 완료 후 생성된 URL 확인 (예: `https://shiftory-api.railway.app`)

## 🎨 Render 배포 (대안)

### 배포 단계

1. **Render 계정 생성**
   - https://render.com 접속
   - GitHub로 로그인

2. **Web Service 생성**
   - "New" > "Web Service" 선택
   - GitHub 저장소 연결
   - `shiftory-api` 선택

3. **설정**
   - **Name**: `shiftory-api`
   - **Root Directory**: `shiftory-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`

4. **PostgreSQL 데이터베이스 생성**
   - "New" > "PostgreSQL" 선택
   - 데이터베이스 이름 설정
   - Render가 자동으로 `DATABASE_URL` 환경 변수를 생성합니다

5. **환경 변수 설정**
   - Web Service > "Environment" 탭
   - 위와 동일한 환경 변수 추가

6. **배포**
   - "Create Web Service" 클릭
   - 배포 완료 후 생성된 URL 확인

## 🔧 Prisma 마이그레이션

배포 시 Prisma 마이그레이션이 자동으로 실행되도록 설정되어 있습니다:

```bash
npx prisma migrate deploy
```

수동 실행이 필요한 경우:

```bash
# Railway
railway run npx prisma migrate deploy

# Render
# Render 대시보드에서 Shell 접속 후 실행
```

## 🔍 배포 확인

### 헬스 체크

```bash
curl https://your-backend-url.com/auth/me
# 401 Unauthorized 응답이 정상 (인증 필요)
```

### API 테스트

```bash
# 회원가입 테스트
curl -X POST https://your-backend-url.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

## 🔐 보안 체크리스트

- [ ] `JWT_SECRET`을 강력한 랜덤 문자열로 설정
- [ ] `INTERNAL_KEY`를 강력한 랜덤 문자열로 설정
- [ ] `FRONTEND_URL`을 실제 프론트엔드 URL로 설정
- [ ] 데이터베이스 비밀번호 확인
- [ ] 환경 변수가 안전하게 관리되는지 확인

## 📝 환경 변수 참조

### 필수 변수

```env
DATABASE_URL=postgresql://... (Railway/Render가 자동 생성)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 선택 변수

```env
INTERNAL_KEY=your-internal-key
S3_ENDPOINT=...
S3_REGION=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET=...
S3_PUBLIC_BASE_URL=...
```

## 🐛 문제 해결

### 데이터베이스 연결 실패

1. `DATABASE_URL` 환경 변수 확인
2. PostgreSQL 데이터베이스가 실행 중인지 확인
3. 네트워크 연결 확인

### Prisma 마이그레이션 실패

1. 데이터베이스 연결 확인
2. 마이그레이션 파일 확인
3. 수동 실행: `npx prisma migrate deploy`

### 빌드 실패

1. Node.js 버전 확인 (18.18+ 또는 20.x)
2. 의존성 설치 확인
3. 빌드 로그 확인

## 📚 추가 리소스

- [Railway 문서](https://docs.railway.app)
- [Render 문서](https://render.com/docs)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)

