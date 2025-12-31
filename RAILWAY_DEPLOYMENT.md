# Railway 한 곳 배포 가이드

Railway에서 프론트엔드, 백엔드, 데이터베이스를 모두 배포하는 방법입니다.

## 🚂 Railway 배포 (모든 서비스)

### 장점
- ✅ 한 곳에서 모든 서비스 관리
- ✅ 무료 티어 제공
- ✅ GitHub 자동 배포
- ✅ 간단한 설정

## 📋 사전 준비

1. GitHub 저장소 준비
2. Railway 계정 (https://railway.app)

## 🚀 배포 단계

### 1단계: Railway 프로젝트 생성

1. https://railway.app 접속 및 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 저장소 선택

### 2단계: PostgreSQL 데이터베이스 추가

1. 프로젝트에서 "New" 클릭
2. "Database" > "PostgreSQL" 선택
3. Railway가 자동으로 `DATABASE_URL` 환경 변수를 생성합니다

### 3단계: 백엔드 배포

1. 프로젝트에서 "New" 클릭
2. "GitHub Repo" 선택
3. 저장소 선택
4. **중요**: "Configure Service" 클릭
5. **Root Directory**: `shiftory-api` 입력 (반드시 설정!)
6. "Deploy" 클릭

#### 환경 변수 설정

백엔드 서비스의 "Variables" 탭에서 다음 변수 추가:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=https://your-frontend.railway.app
INTERNAL_KEY=your-internal-key

# S3/R2 설정 (선택사항)
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-bucket.public-url.com
```

**중요**: `DATABASE_URL`은 `${{Postgres.DATABASE_URL}}`로 설정하면 Railway가 자동으로 연결합니다.

#### 빌드 설정

"Settings" 탭에서:
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm run start:prod`

#### 배포 후 URL 확인

배포 완료 후 생성된 URL 확인 (예: `https://shiftory-api.railway.app`)

### 4단계: 프론트엔드 배포

1. 프로젝트에서 "New" 클릭
2. "GitHub Repo" 선택
3. 같은 저장소 선택
4. **중요**: "Configure Service" 클릭
5. **Root Directory**: `staff-scheduling-ui` 입력 (반드시 설정!)
6. "Deploy" 클릭

#### 환경 변수 설정

프론트엔드 서비스의 "Variables" 탭에서:

```env
NEXT_PUBLIC_API_URL=https://shiftory-api.railway.app
```

**중요**: 백엔드 URL을 먼저 확인한 후 설정하세요.

#### 빌드 설정

"Settings" 탭에서:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Output Directory**: `.next`

또는 Next.js를 Static Export로 배포하려면:

**방법 1: Node.js 서버로 실행 (권장)**
- 위 설정 사용

**방법 2: Static Export (더 간단)**
- `next.config.mjs` 수정 필요 (아래 참고)

### 5단계: 도메인 설정 (선택사항)

각 서비스의 "Settings" > "Networking"에서:
- Custom Domain 설정 가능
- 또는 Railway 제공 도메인 사용

## 🔧 Next.js Static Export 설정 (선택사항)

Static Export를 원하는 경우 `staff-scheduling-ui/next.config.mjs` 수정:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export 활성화
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

그리고 빌드 설정:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve out` (또는 다른 static server)

## 🔗 서비스 연결

### 백엔드 → 프론트엔드

1. 백엔드의 `FRONTEND_URL`을 프론트엔드 URL로 설정
2. 백엔드 재배포

### 프론트엔드 → 백엔드

1. 프론트엔드의 `NEXT_PUBLIC_API_URL`을 백엔드 URL로 설정
2. 프론트엔드 재배포

## 📊 Railway 프로젝트 구조

```
Railway Project
├── PostgreSQL Database
│   └── DATABASE_URL (자동 생성)
├── Backend Service (shiftory-api)
│   ├── DATABASE_URL=${{Postgres.DATABASE_URL}}
│   ├── JWT_SECRET=...
│   └── FRONTEND_URL=...
└── Frontend Service (staff-scheduling-ui)
    └── NEXT_PUBLIC_API_URL=...
```

## ✅ 배포 확인

### 1. 백엔드 확인

```bash
curl https://your-backend.railway.app/auth/me
# 401 Unauthorized 응답이 정상
```

### 2. 프론트엔드 확인

브라우저에서 프론트엔드 URL 접속

### 3. 통합 테스트

1. 프론트엔드에서 회원가입
2. 로그인
3. 기능 테스트

## 🔍 문제 해결

### 빌드 실패

1. **백엔드 빌드 실패**
   - Node.js 버전 확인 (18.18+ 또는 20.x)
   - Prisma 클라이언트 생성 확인
   - 빌드 로그 확인

2. **프론트엔드 빌드 실패**
   - 환경 변수 확인
   - TypeScript 오류 확인 (`ignoreBuildErrors: true` 설정 확인)

### 연결 실패

1. **CORS 오류**
   - 백엔드 `FRONTEND_URL` 확인
   - 백엔드 CORS 설정 확인

2. **API 호출 실패**
   - `NEXT_PUBLIC_API_URL` 확인
   - 백엔드 서버 상태 확인

### 데이터베이스 연결 실패

1. `DATABASE_URL` 환경 변수 확인
2. PostgreSQL 서비스 상태 확인
3. Prisma 마이그레이션 확인

## 💰 비용

Railway 무료 티어:
- $5 크레딧/월
- 제한된 사용량
- 개발/테스트용으로 충분

프로덕션 사용 시 유료 플랜 고려

## 🎯 빠른 체크리스트

- [ ] Railway 프로젝트 생성
- [ ] PostgreSQL 데이터베이스 추가
- [ ] 백엔드 서비스 배포
  - [ ] Root Directory: `shiftory-api`
  - [ ] 환경 변수 설정
  - [ ] 빌드/시작 명령 설정
- [ ] 프론트엔드 서비스 배포
  - [ ] Root Directory: `staff-scheduling-ui`
  - [ ] 환경 변수 설정 (`NEXT_PUBLIC_API_URL`)
- [ ] 백엔드 `FRONTEND_URL` 업데이트
- [ ] 배포 확인 및 테스트

## 📚 추가 리소스

- [Railway 문서](https://docs.railway.app)
- [Railway Next.js 가이드](https://docs.railway.app/guides/nextjs)
- [Railway 환경 변수](https://docs.railway.app/develop/variables)

