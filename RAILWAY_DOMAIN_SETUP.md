# Railway 도메인 및 환경 변수 설정 가이드

## 도메인 정보

### 백엔드 서비스
- **서비스 이름**: `workhaja-back-production`
- **도메인**: `https://workhaja-production.up.railway.app`

### 프론트엔드 서비스
- **서비스 이름**: `workhaja-frontend` (또는 다른 이름)
- **도메인**: `https://soothing-fulfillment-production.up.railway.app`

## 환경 변수 설정

### 백엔드 서비스 환경 변수

Railway 대시보드 → 백엔드 서비스 → **"Variables"** 탭:

```env
# 데이터베이스 (PostgreSQL 서비스와 연결)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT 시크릿
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 프론트엔드 URL (CORS 설정용)
FRONTEND_URL=https://soothing-fulfillment-production.up.railway.app

# 포트 (수동 설정하지 마세요 - Railway가 자동으로 설정)
# PORT 환경 변수는 설정하지 않습니다!
```

**중요:**
- `FRONTEND_URL`은 프론트엔드 도메인으로 설정
- `DATABASE_URL`은 `${{Postgres.DATABASE_URL}}` 형식으로 PostgreSQL 서비스와 연결
- `PORT`는 수동으로 설정하지 않음 (Railway가 자동 제공)

### 프론트엔드 서비스 환경 변수

Railway 대시보드 → 프론트엔드 서비스 → **"Variables"** 탭:

```env
# 백엔드 API URL
NEXT_PUBLIC_API_URL=https://workhaja-production.up.railway.app
```

**중요:**
- `NEXT_PUBLIC_API_URL`은 백엔드 도메인으로 설정
- `https://` 프로토콜 포함
- 끝에 경로(`/api`, `/auth` 등) 추가하지 않기

## 환경 변수 설정 방법

### 백엔드 서비스

1. Railway 대시보드 → 백엔드 서비스 (`workhaja-back-production`) 선택
2. **"Variables"** 탭 클릭
3. 필요한 변수들 추가/수정:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `JWT_SECRET` | `your-secret-key-here` |
   | `FRONTEND_URL` | `https://soothing-fulfillment-production.up.railway.app` |

### 프론트엔드 서비스

1. Railway 대시보드 → 프론트엔드 서비스 선택
2. **"Variables"** 탭 클릭
3. 변수 추가:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://workhaja-production.up.railway.app` |

## 완전한 설정 예시

### 백엔드 서비스 (`workhaja-back-production`)

**도메인**: `https://workhaja-production.up.railway.app`

**Variables:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://soothing-fulfillment-production.up.railway.app
```

**Settings:**
- Root Directory: `shiftory-api`
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npx prisma migrate deploy && npm run start:prod`

### 프론트엔드 서비스

**도메인**: `https://soothing-fulfillment-production.up.railway.app`

**Variables:**
```env
NEXT_PUBLIC_API_URL=https://workhaja-production.up.railway.app
```

**Settings:**
- Root Directory: `staff-scheduling-ui`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`

## CORS 설정 확인

백엔드 코드에서 CORS가 올바르게 설정되어 있는지 확인:

`shiftory-api/src/main.ts`:
```typescript
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
app.enableCors({
  origin: frontendUrl,
  // ...
});
```

✅ `FRONTEND_URL` 환경 변수가 프론트엔드 도메인으로 설정되어 있으면 CORS가 정상 작동합니다.

## API 호출 흐름

1. **브라우저**: `https://soothing-fulfillment-production.up.railway.app` 접속
2. **프론트엔드**: `NEXT_PUBLIC_API_URL`을 사용하여 API 요청
3. **API 요청**: `https://workhaja-production.up.railway.app/auth/register`
4. **백엔드**: CORS 검사 (Origin: `https://soothing-fulfillment-production.up.railway.app`)
5. **백엔드**: `FRONTEND_URL`과 일치하므로 요청 허용

## 체크리스트

### 백엔드
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}` 설정
- [ ] `JWT_SECRET` 설정
- [ ] `FRONTEND_URL=https://soothing-fulfillment-production.up.railway.app` 설정
- [ ] `PORT` 환경 변수를 수동으로 설정하지 않음
- [ ] Root Directory: `shiftory-api` 설정

### 프론트엔드
- [ ] `NEXT_PUBLIC_API_URL=https://workhaja-production.up.railway.app` 설정
- [ ] Root Directory: `staff-scheduling-ui` 설정
- [ ] 환경 변수 변경 후 재배포 완료 대기

## 문제 해결

### CORS 에러 발생 시
- 백엔드 `FRONTEND_URL`이 프론트엔드 도메인과 일치하는지 확인
- 백엔드 재배포 (환경 변수 변경 후)

### API 연결 실패 시
- 프론트엔드 `NEXT_PUBLIC_API_URL`이 백엔드 도메인과 일치하는지 확인
- 프론트엔드 재배포 (환경 변수 변경 후)
- 브라우저 Network 탭에서 실제 요청 URL 확인

## 요약

- **백엔드 도메인**: `https://workhaja-production.up.railway.app`
- **프론트엔드 도메인**: `https://soothing-fulfillment-production.up.railway.app`
- **백엔드 `FRONTEND_URL`**: 프론트엔드 도메인으로 설정
- **프론트엔드 `NEXT_PUBLIC_API_URL`**: 백엔드 도메인으로 설정

