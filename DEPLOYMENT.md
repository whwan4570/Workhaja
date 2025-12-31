# Shiftory 배포 가이드 (레거시)

> **참고**: Vercel 배포를 원하시면 `VERCEL_DEPLOYMENT.md`를 참고하세요.
> 백엔드 배포는 `BACKEND_DEPLOYMENT.md`를 참고하세요.

이 문서는 Shiftory 프로젝트를 Docker를 사용하여 배포하는 방법을 설명합니다.

## 배포 전 체크리스트

### ✅ 준비된 것들
- [x] NestJS 백엔드 API (프로덕션 빌드 스크립트 포함)
- [x] Next.js 프론트엔드 (프로덕션 빌드 스크립트 포함)
- [x] Prisma 마이그레이션 파일
- [x] Dockerfile (백엔드, 프론트엔드)
- [x] docker-compose.yml (로컬 개발용)

### ⚠️ 배포 전 설정 필요
- [ ] 환경 변수 설정 (.env 파일)
- [ ] 데이터베이스 연결 설정
- [ ] S3/R2 스토리지 설정 (파일 업로드용)
- [ ] CORS 설정 (프로덕션 도메인)
- [ ] SSL 인증서 (HTTPS)

## 배포 방법

### 방법 1: Docker Compose (로컬/개발 서버)

```bash
# 1. 프로젝트 루트에서 .env 파일 생성
cat > .env << EOF
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000
INTERNAL_KEY=your-internal-key
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-bucket.public-url.com
EOF

# 2. Docker Compose로 실행
docker-compose up -d

# 3. 로그 확인
docker-compose logs -f
```

### 방법 2: 개별 Docker 컨테이너

#### 백엔드 배포

```bash
cd shiftory-api

# Docker 이미지 빌드
docker build -t shiftory-api .

# 컨테이너 실행
docker run -d \
  --name shiftory-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/shiftory" \
  -e JWT_SECRET="your-secret-key" \
  -e FRONTEND_URL="https://your-frontend-domain.com" \
  shiftory-api
```

#### 프론트엔드 배포

```bash
cd staff-scheduling-ui

# Docker 이미지 빌드 (환경 변수 포함)
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.your-domain.com \
  -t shiftory-frontend .

# 컨테이너 실행
docker run -d \
  --name shiftory-frontend \
  -p 3001:3001 \
  shiftory-frontend
```

### 방법 3: 클라우드 플랫폼 배포

#### Vercel (프론트엔드)

1. Vercel에 프로젝트 연결
2. 환경 변수 설정:
   - `NEXT_PUBLIC_API_URL`: 백엔드 API URL
3. 빌드 설정:
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Railway / Render (백엔드)

1. GitHub 저장소 연결
2. 환경 변수 설정:
   - `DATABASE_URL`: PostgreSQL 연결 문자열
   - `JWT_SECRET`: JWT 시크릿 키
   - `FRONTEND_URL`: 프론트엔드 URL
   - 기타 S3/R2 설정
3. 빌드 명령: `npm run build`
4. 시작 명령: `npm run start:prod`

#### AWS / GCP / Azure

각 플랫폼의 컨테이너 서비스(AWS ECS, GCP Cloud Run, Azure Container Instances)를 사용하여 Docker 이미지를 배포할 수 있습니다.

## 환경 변수 설정

### 백엔드 (.env)

```env
# 필수
DATABASE_URL=postgresql://user:password@host:5432/shiftory?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000

# CORS 설정 (프로덕션 도메인)
FRONTEND_URL=https://your-frontend-domain.com

# 선택사항
INTERNAL_KEY=your-internal-key-for-admin-endpoints

# S3/R2 설정 (파일 업로드용)
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-bucket.public-url.com
```

### 프론트엔드 (.env.local 또는 배포 플랫폼 환경 변수)

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## 데이터베이스 마이그레이션

프로덕션 환경에서는 마이그레이션을 자동으로 실행하도록 설정되어 있습니다:

```bash
# Dockerfile에서 자동 실행
npx prisma migrate deploy
```

수동 실행이 필요한 경우:

```bash
cd shiftory-api
npx prisma migrate deploy
```

## 보안 체크리스트

- [ ] `JWT_SECRET`을 강력한 랜덤 문자열로 변경
- [ ] `INTERNAL_KEY`를 강력한 랜덤 문자열로 설정
- [ ] 데이터베이스 비밀번호를 강력하게 설정
- [ ] HTTPS 사용 (프로덕션)
- [ ] CORS를 프로덕션 도메인으로 제한
- [ ] 환경 변수를 안전하게 관리 (비밀 관리자 사용)
- [ ] S3/R2 접근 키를 안전하게 관리

## 모니터링 및 로깅

프로덕션 환경에서는 다음을 고려하세요:

1. **로깅**: Winston, Pino 등의 로깅 라이브러리 추가
2. **모니터링**: Sentry, DataDog 등의 에러 추적 도구
3. **헬스 체크**: `/health` 엔드포인트 추가
4. **메트릭**: Prometheus, Grafana 등

## 트러블슈팅

### 데이터베이스 연결 실패

```bash
# 연결 확인
docker-compose exec api npx prisma db pull

# 마이그레이션 상태 확인
docker-compose exec api npx prisma migrate status
```

### 빌드 실패

```bash
# 캐시 없이 재빌드
docker-compose build --no-cache

# 개별 서비스 재빌드
docker-compose build api
docker-compose build frontend
```

### 포트 충돌

`docker-compose.yml`에서 포트를 변경하거나, 실행 중인 서비스를 중지하세요.

## 다음 단계

배포 후:

1. API 엔드포인트 테스트
2. 프론트엔드에서 백엔드 연결 확인
3. 사용자 인증 테스트
4. 파일 업로드 기능 테스트 (S3/R2 설정된 경우)
5. 알림 기능 테스트

## 지원

문제가 발생하면:
- 로그 확인: `docker-compose logs`
- 데이터베이스 상태 확인: `docker-compose exec postgres psql -U postgres -d shiftory`
- API 헬스 체크: `curl http://localhost:3000/auth/me`

