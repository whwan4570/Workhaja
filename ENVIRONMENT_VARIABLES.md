# 환경 변수 설정 가이드

## 📋 Backend 환경 변수 (shiftory-api/.env)

### 필수 변수 (Required)

```env
# 데이터베이스 연결
DATABASE_URL="postgresql://user:password@localhost:5432/workhaja?schema=public"

# JWT 인증 시크릿 키
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### 선택 변수 (Optional)

```env
# 서버 포트 (기본값: 3000)
PORT=3000

# 프론트엔드 URL (CORS 설정용)
FRONTEND_URL="http://localhost:3001"

# JWT 토큰 만료 시간 (기본값: 7d)
JWT_EXPIRES_IN="7d"
```

### 알림 기능 (Notifications) - 선택사항

```env
# Admin 디버그 엔드포인트용 내부 키
INTERNAL_KEY="your-secret-key-here"
```

### 파일 업로드 (S3/R2) - 선택사항

#### Cloudflare R2 사용 시:
```env
S3_ENDPOINT="https://your-account.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="your-bucket-name"
S3_PUBLIC_BASE_URL="https://your-bucket.public-url.com"
```

#### AWS S3 사용 시:
```env
# S3_ENDPOINT는 비워두거나 제거
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-aws-access-key"
S3_SECRET_ACCESS_KEY="your-aws-secret-key"
S3_BUCKET="your-bucket-name"
S3_PUBLIC_BASE_URL="https://your-bucket.s3.amazonaws.com"
```

### Backend 완전한 예시 (.env)

```env
# ============================================
# 필수 (Required)
# ============================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workhaja?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# ============================================
# 선택 (Optional)
# ============================================
PORT=3000
FRONTEND_URL="http://localhost:3001"
JWT_EXPIRES_IN="7d"

# ============================================
# 알림 기능 (Notifications - Optional)
# ============================================
INTERNAL_KEY="your-internal-key-for-admin-endpoints"

# ============================================
# 파일 업로드 (S3/R2 - Optional)
# ============================================
# Cloudflare R2
S3_ENDPOINT="https://your-account.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="your-bucket-name"
S3_PUBLIC_BASE_URL="https://your-bucket.public-url.com"
```

---

## 🎨 Frontend 환경 변수 (staff-scheduling-ui/.env.local)

### 필수 변수 (Required)

```env
# 백엔드 API URL
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Frontend 완전한 예시 (.env.local)

```env
# ============================================
# 필수 (Required)
# ============================================
# 로컬 개발 환경
NEXT_PUBLIC_API_URL="http://localhost:3000"

# 프로덕션 환경 (Railway 배포 시)
# NEXT_PUBLIC_API_URL="https://your-backend.railway.app"
```

---

## 🚀 배포 환경별 설정

### Railway 배포 시

#### Backend 환경 변수:
```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
JWT_SECRET="your-production-jwt-secret"
FRONTEND_URL="https://your-frontend.railway.app"
PORT=3000
```

#### Frontend 환경 변수:
```env
NEXT_PUBLIC_API_URL="https://your-backend.railway.app"
```

### 로컬 개발 환경

#### Backend 환경 변수:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workhaja?schema=public"
JWT_SECRET="dev-secret-key"
FRONTEND_URL="http://localhost:3001"
PORT=3000
```

#### Frontend 환경 변수:
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 📝 빠른 설정 가이드

### Backend 최소 설정 (.env)

로컬 개발을 위한 최소한의 설정:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workhaja?schema=public"
JWT_SECRET="dev-secret-key-change-in-production"
FRONTEND_URL="http://localhost:3001"
```

### Frontend 최소 설정 (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## ⚠️ 중요 사항

1. **`.env` 파일은 Git에 커밋하지 마세요!**
   - `.gitignore`에 이미 포함되어 있어야 합니다
   - 민감한 정보(JWT_SECRET, 데이터베이스 비밀번호 등)가 포함됩니다

2. **프로덕션 환경에서는 반드시 강력한 JWT_SECRET 사용**
   - 최소 32자 이상의 랜덤 문자열 권장
   - `openssl rand -base64 32` 명령어로 생성 가능

3. **Frontend 환경 변수는 `NEXT_PUBLIC_` 접두사 필요**
   - Next.js에서 브라우저에서 접근 가능한 변수는 `NEXT_PUBLIC_`로 시작해야 합니다
   - 빌드 시점에 값이 번들에 포함됩니다

4. **S3/R2 설정은 파일 업로드 기능을 사용할 때만 필요**
   - 설정하지 않으면 파일 업로드 기능이 비활성화됩니다
   - 백엔드에서 경고 메시지만 표시됩니다

---

## 🔍 환경 변수 확인 방법

### Backend
```bash
cd shiftory-api
cat .env
```

### Frontend
```bash
cd staff-scheduling-ui
cat .env.local
```

### Railway에서 확인
1. Railway 대시보드 접속
2. 해당 서비스 선택
3. "Variables" 탭 클릭
4. 환경 변수 목록 확인

