# 🚀 Shiftory 빠른 배포 가이드

## 옵션 1: Railway 한 곳 배포 (추천) ⭐

Railway에서 프론트엔드, 백엔드, 데이터베이스를 모두 배포합니다.

**가이드**: [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md) 또는 [`SINGLE_PLATFORM_DEPLOYMENT.md`](./SINGLE_PLATFORM_DEPLOYMENT.md) 참고

**문제 해결**: [`RAILWAY_FIX.md`](./RAILWAY_FIX.md) 참고

## 옵션 2: Vercel + Railway 분리 배포

Vercel로 프론트엔드, Railway로 백엔드를 배포하는 방법입니다.

## 📋 사전 준비

1. GitHub 저장소 준비
2. Vercel 계정 (무료)
3. Railway 계정 (무료)

## ⚡ 5분 배포

### 1단계: 백엔드 배포 (Railway)

1. https://railway.app 접속 및 로그인
2. "New Project" > "Deploy from GitHub repo"
3. `shiftory-api` 저장소 선택
4. "New" > "Database" > "PostgreSQL" 추가
5. "Variables" 탭에서 환경 변수 추가:

```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=https://your-app.vercel.app (나중에 업데이트)
INTERNAL_KEY=your-internal-key
```

6. 배포 완료 후 URL 복사 (예: `https://shiftory-api.railway.app`)

### 2단계: 프론트엔드 배포 (Vercel)

1. https://vercel.com 접속 및 로그인
2. "Add New Project"
3. GitHub 저장소 선택
4. **Root Directory**: `staff-scheduling-ui` 설정
5. 환경 변수 추가:

```
NEXT_PUBLIC_API_URL=https://shiftory-api.railway.app
```

6. "Deploy" 클릭
7. 배포 완료 후 URL 복사 (예: `https://shiftory-app.vercel.app`)

### 3단계: 연결

1. Railway로 돌아가서 `FRONTEND_URL` 업데이트:
   ```
   FRONTEND_URL=https://shiftory-app.vercel.app
   ```
2. Railway 서비스 재배포

## ✅ 완료!

이제 다음 주소로 접속할 수 있습니다:
- 프론트엔드: https://your-app.vercel.app
- 백엔드: https://your-api.railway.app

## 🔍 테스트

1. 프론트엔드 접속
2. 회원가입 테스트
3. 로그인 테스트

## 📚 상세 가이드

- Railway 한 곳 배포: [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md)
- Railway 문제 해결: [`RAILWAY_FIX.md`](./RAILWAY_FIX.md)
- Vercel 배포: [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md)
- 백엔드 배포: [`BACKEND_DEPLOYMENT.md`](./BACKEND_DEPLOYMENT.md)

