# Railway 배포 문제 해결

## 문제

Railpack이 모노레포 구조를 인식하지 못하는 경우, 각 서비스를 **별도로** 추가해야 합니다.

## 해결 방법

### 방법 1: 각 서비스를 별도로 추가 (권장)

Railway에서는 모노레포의 각 서비스를 **별도 서비스**로 추가해야 합니다.

#### 1단계: 프로젝트 생성

1. Railway에서 "New Project" 클릭
2. "Empty Project" 선택 (또는 GitHub 저장소 연결)

#### 2단계: PostgreSQL 데이터베이스 추가

1. "New" > "Database" > "PostgreSQL" 선택
2. 자동으로 `DATABASE_URL` 생성됨

#### 3단계: 백엔드 서비스 추가

1. "New" > "GitHub Repo" 클릭
2. **같은 저장소** 선택
3. **중요**: "Configure Service" 클릭
4. **Root Directory**: `shiftory-api` 입력
5. "Deploy" 클릭

**환경 변수 설정** (서비스 > Variables):
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=https://your-frontend.railway.app
INTERNAL_KEY=your-internal-key
```

**빌드 설정** (서비스 > Settings):
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npx prisma migrate deploy && npm run start:prod`

#### 4단계: 프론트엔드 서비스 추가

1. 프로젝트에서 "New" > "GitHub Repo" 클릭
2. **같은 저장소** 선택
3. **중요**: "Configure Service" 클릭
4. **Root Directory**: `staff-scheduling-ui` 입력
5. "Deploy" 클릭

**환경 변수 설정**:
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**빌드 설정**:
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`

### 방법 2: railway.json 사용

각 서비스 디렉토리에 `railway.json` 파일이 생성되어 있습니다:
- `shiftory-api/railway.json`
- `staff-scheduling-ui/railway.json`

이 파일들이 있으면 Railway가 자동으로 빌드/시작 명령을 인식합니다.

## 중요 사항

### Root Directory 설정 필수!

Railway에서 서비스를 추가할 때 **반드시 Root Directory를 설정**해야 합니다:

- 백엔드: `shiftory-api`
- 프론트엔드: `staff-scheduling-ui`

Root Directory를 설정하지 않으면 Railway가 루트 디렉토리에서 `package.json`을 찾으려고 해서 실패합니다.

## 프로젝트 구조

```
Railway Project
├── PostgreSQL Database
├── Backend Service
│   └── Root Directory: shiftory-api
└── Frontend Service
    └── Root Directory: staff-scheduling-ui
```

## 단계별 체크리스트

### 백엔드 배포
- [ ] 프로젝트 생성
- [ ] PostgreSQL 추가
- [ ] 백엔드 서비스 추가
- [ ] **Root Directory: `shiftory-api` 설정** ⚠️
- [ ] 환경 변수 설정
- [ ] 빌드/시작 명령 설정
- [ ] 배포 완료 후 URL 확인

### 프론트엔드 배포
- [ ] 프론트엔드 서비스 추가
- [ ] **Root Directory: `staff-scheduling-ui` 설정** ⚠️
- [ ] 환경 변수 설정 (`NEXT_PUBLIC_API_URL`)
- [ ] 빌드/시작 명령 설정
- [ ] 배포 완료 후 URL 확인

### 연결
- [ ] 백엔드 `FRONTEND_URL` 업데이트
- [ ] 재배포

## 문제 해결

### "Railpack could not determine how to build"

**원인**: Root Directory가 설정되지 않음

**해결**:
1. 서비스 설정에서 Root Directory 확인
2. `shiftory-api` 또는 `staff-scheduling-ui`로 설정
3. 재배포

### 빌드 실패

**원인**: Node.js 버전 또는 의존성 문제

**해결**:
1. 빌드 로그 확인
2. Node.js 버전 확인 (18.18+ 또는 20.x)
3. `package.json` 확인

### 환경 변수 오류

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. 서비스 > Variables 탭 확인
2. 필수 환경 변수 추가
3. 재배포

## 참고

- Railway는 모노레포를 지원하지만, 각 서비스를 **별도로 추가**해야 합니다
- Root Directory 설정이 가장 중요합니다
- `railway.json` 파일이 있으면 자동으로 빌드/시작 명령을 인식합니다

