# Workhaja

직원 스케줄 관리 시스템 - 프론트엔드와 백엔드가 분리된 모노레포 프로젝트입니다.

## 📁 프로젝트 구조

```
Workhaja/
├── shiftory-api/          # NestJS 백엔드 API
│   ├── src/               # 소스 코드
│   ├── prisma/            # 데이터베이스 스키마
│   └── README.md          # 백엔드 상세 문서
│
├── staff-scheduling-ui/   # Next.js 프론트엔드
│   ├── app/               # Next.js App Router 페이지
│   ├── components/        # React 컴포넌트
│   └── lib/               # 유틸리티 및 API 클라이언트
│
└── README.md              # 이 파일
```

## 🚀 빠른 시작

### 배포 (Railway 추천) ⭐

**초보자용**: [`EASY_DEPLOY.md`](./EASY_DEPLOY.md) - 가장 쉬운 단계별 가이드  
**상세 가이드**: [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md) - 상세 설명

Railway에서 프론트엔드, 백엔드, 데이터베이스를 한 곳에서 배포합니다.

### 로컬 개발

#### 백엔드

```bash
cd shiftory-api
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

#### 프론트엔드

```bash
cd staff-scheduling-ui
npm install
npm run dev
```

## 📚 문서

### 배포 가이드
- ⭐ **[`EASY_DEPLOY.md`](./EASY_DEPLOY.md)** - **초보자용 쉬운 배포 가이드 (추천!)**
- [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md) - Railway 상세 배포 가이드
- [`RAILWAY_FIX.md`](./RAILWAY_FIX.md) - Railway 배포 문제 해결
- [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md) - Vercel 배포 가이드 (선택사항)

### 백엔드 문서
- [`shiftory-api/README.md`](./shiftory-api/README.md) - 백엔드 상세 문서
- [`shiftory-api/DATABASE_SETUP.md`](./shiftory-api/DATABASE_SETUP.md) - 데이터베이스 설정
- [`shiftory-api/ENV_EXAMPLE.md`](./shiftory-api/ENV_EXAMPLE.md) - 환경 변수 예시

## 🛠 기술 스택

### 백엔드
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (passport-jwt)

### 프론트엔드
- **Framework**: Next.js 16
- **UI**: React 19, Tailwind CSS
- **Components**: Radix UI
- **State**: React Hooks

## 📋 주요 기능

- ✅ 사용자 인증 (회원가입, 로그인)
- ✅ 매장 관리 (Store)
- ✅ 멤버십 및 역할 관리 (OWNER, MANAGER, WORKER)
- ✅ 스케줄 관리
- ✅ 변경 요청 (Change Requests)
- ✅ 노동 규칙 (Labor Rules)
- ✅ 시간 요약 (Time Summary)
- ✅ 문서 관리 (Documents)
- ✅ 알림 (Notifications)
- ✅ 파일 업로드 (S3/R2)

## 🔧 환경 변수

### 백엔드 (`shiftory-api/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/shiftory
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### 프론트엔드 (`staff-scheduling-ui/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

자세한 내용은 [`shiftory-api/ENV_EXAMPLE.md`](./shiftory-api/ENV_EXAMPLE.md) 참고

## 📦 배포 옵션

### Railway (추천) ⭐
- 프론트엔드, 백엔드, 데이터베이스 한 곳에서 관리
- 무료 티어 제공
- GitHub 자동 배포
- **가이드**: [`EASY_DEPLOY.md`](./EASY_DEPLOY.md)

### Vercel + Railway
- Vercel: 프론트엔드
- Railway: 백엔드 + 데이터베이스
- **가이드**: [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md)

## 🤝 기여

이슈나 풀 리퀘스트를 환영합니다!

## 📄 라이선스

MIT
