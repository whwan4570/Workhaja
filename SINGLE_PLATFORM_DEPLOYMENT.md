# 한 곳 배포 가이드

Shiftory를 한 플랫폼에서 모두 배포하는 방법입니다.

## 🎯 추천 플랫폼

### 1. Railway (가장 추천) ⭐
- ✅ 프론트엔드, 백엔드, 데이터베이스 모두 지원
- ✅ 무료 티어 제공
- ✅ GitHub 자동 배포
- ✅ 간단한 설정

**가이드**: `RAILWAY_DEPLOYMENT.md` 참고

### 2. Render
- ✅ 프론트엔드, 백엔드, 데이터베이스 모두 지원
- ✅ 무료 티어 제공
- ⚠️ 설정이 약간 복잡

### 3. Fly.io
- ✅ 프론트엔드, 백엔드, 데이터베이스 모두 지원
- ✅ 글로벌 배포
- ⚠️ 설정이 복잡

## 🚀 Railway 빠른 시작

### 1. 프로젝트 생성
1. https://railway.app 접속
2. "New Project" > "Deploy from GitHub repo"
3. 저장소 선택

### 2. 데이터베이스 추가
1. "New" > "Database" > "PostgreSQL"
2. 자동으로 `DATABASE_URL` 생성됨

### 3. 백엔드 배포
1. "New" > "GitHub Repo" > 같은 저장소
2. Root Directory: `shiftory-api`
3. 환경 변수:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://your-frontend.railway.app
   ```
4. Build Command: `npm install && npx prisma generate && npm run build`
5. Start Command: `npx prisma migrate deploy && npm run start:prod`

### 4. 프론트엔드 배포
1. "New" > "GitHub Repo" > 같은 저장소
2. Root Directory: `staff-scheduling-ui`
3. 환경 변수:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
4. Build Command: `npm install && npm run build`
5. Start Command: `npm run start`

### 5. 연결
1. 백엔드 `FRONTEND_URL`을 프론트엔드 URL로 업데이트
2. 재배포

## 📊 구조

```
Railway Project
├── PostgreSQL
├── Backend (shiftory-api)
└── Frontend (staff-scheduling-ui)
```

## ✅ 장점

- 한 곳에서 모든 서비스 관리
- 환경 변수 공유 쉬움
- 배포 자동화
- 비용 절감

## 📚 상세 가이드

- Railway: `RAILWAY_DEPLOYMENT.md`
- Render: `BACKEND_DEPLOYMENT.md` (Render 섹션 참고)

