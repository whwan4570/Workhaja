# Vercel 배포 가이드

이 가이드는 Workhaja 프론트엔드를 Vercel에 배포하는 방법을 설명합니다.

## 📋 사전 준비

1. **GitHub 저장소 준비**
   - 프로젝트를 GitHub에 푸시해야 합니다
   - Vercel은 GitHub 저장소와 연동됩니다

2. **백엔드 API 배포**
   - 프론트엔드가 백엔드 API를 호출하므로, 먼저 백엔드를 배포해야 합니다
   - 추천 플랫폼: Railway, Render, Fly.io

## 🚀 Vercel 배포 단계

### 1단계: Vercel 계정 생성 및 프로젝트 연결

1. [Vercel](https://vercel.com)에 가입/로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `staff-scheduling-ui` 선택
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install` (기본값)

### 2단계: 환경 변수 설정

Vercel 대시보드에서 **Settings > Environment Variables**로 이동하여 다음 환경 변수를 추가:

```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

**중요**: 
- `NEXT_PUBLIC_` 접두사가 있는 변수만 클라이언트에서 접근 가능합니다
- 백엔드 API URL은 실제 배포된 백엔드 주소여야 합니다

### 3단계: 배포

1. "Deploy" 버튼 클릭
2. 빌드 및 배포 진행 상황 확인
3. 배포 완료 후 제공되는 URL로 접속

## 🔧 백엔드 배포 (Railway 추천)

### Railway로 백엔드 배포

1. [Railway](https://railway.app)에 가입/로그인
2. "New Project" > "Deploy from GitHub repo" 선택
3. `shiftory-api` 저장소 선택
4. 환경 변수 설정:

```env
DATABASE_URL=postgresql://... (Railway가 자동 생성)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=https://your-vercel-app.vercel.app
INTERNAL_KEY=your-internal-key
```

5. PostgreSQL 데이터베이스 추가:
   - Railway 대시보드에서 "New" > "Database" > "PostgreSQL" 선택
   - 자동으로 `DATABASE_URL` 환경 변수가 생성됩니다

6. 배포 후 생성된 URL을 복사 (예: `https://shiftory-api.railway.app`)

### Render로 백엔드 배포 (대안)

1. [Render](https://render.com)에 가입/로그인
2. "New" > "Web Service" 선택
3. GitHub 저장소 연결
4. 설정:
   - **Root Directory**: `shiftory-api`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`
   - **Environment**: Node

5. 환경 변수 추가 (위와 동일)

## 🔗 프론트엔드와 백엔드 연결

### CORS 설정

백엔드의 `FRONTEND_URL` 환경 변수를 Vercel 배포 URL로 설정:

```env
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 환경 변수 업데이트

Vercel에서 `NEXT_PUBLIC_API_URL`을 백엔드 URL로 업데이트:

```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

## 📝 배포 후 확인 사항

### 1. 프론트엔드 확인
- [ ] Vercel 배포 URL 접속 가능
- [ ] 로그인/회원가입 페이지 표시
- [ ] API 연결 확인 (브라우저 개발자 도구 Network 탭)

### 2. 백엔드 확인
- [ ] 백엔드 API URL 접속 가능
- [ ] CORS 설정 확인
- [ ] 데이터베이스 연결 확인

### 3. 통합 테스트
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] API 호출 테스트

## 🔍 문제 해결

### 빌드 실패

**문제**: TypeScript 오류
**해결**: `next.config.mjs`에서 `ignoreBuildErrors: true` 설정 확인

**문제**: 환경 변수 누락
**해결**: Vercel 대시보드에서 환경 변수 확인

### API 연결 실패

**문제**: CORS 오류
**해결**: 
1. 백엔드 `FRONTEND_URL` 환경 변수 확인
2. 백엔드 코드에서 CORS 설정 확인

**문제**: 404 오류
**해결**: 
1. `NEXT_PUBLIC_API_URL`이 올바른지 확인
2. 백엔드 서버가 실행 중인지 확인

### 데이터베이스 연결 실패

**문제**: Prisma 마이그레이션 실패
**해결**: 
1. `DATABASE_URL` 환경 변수 확인
2. Railway/Render에서 PostgreSQL 데이터베이스 상태 확인
3. 마이그레이션 수동 실행: `npx prisma migrate deploy`

## 📚 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app)
- [Render 문서](https://render.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

## 🎯 빠른 체크리스트

배포 전:
- [ ] GitHub에 코드 푸시
- [ ] 백엔드 배포 완료
- [ ] 백엔드 URL 확인
- [ ] 환경 변수 준비

Vercel 배포:
- [ ] Vercel 프로젝트 생성
- [ ] Root Directory 설정 (`staff-scheduling-ui`)
- [ ] 환경 변수 추가 (`NEXT_PUBLIC_API_URL`)
- [ ] 배포 실행

배포 후:
- [ ] 프론트엔드 접속 확인
- [ ] 백엔드 연결 확인
- [ ] 기능 테스트

