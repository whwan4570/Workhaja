# Railway 502 Bad Gateway 에러 해결

## 문제
백엔드 API 호출 시 502 에러 발생:
```json
{
  "status": "error",
  "code": 502,
  "message": "Application failed to respond"
}
```

## 원인
502 Bad Gateway는 Railway가 백엔드 애플리케이션에 연결할 수 없거나, 애플리케이션이 응답하지 않을 때 발생합니다.

## 해결 방법

### 1. 백엔드 서비스 상태 확인

Railway 대시보드에서:
1. **백엔드 서비스** (`workhaja-back-production`) 선택
2. **"Deployments"** 탭 클릭
3. 최신 배포 상태 확인:
   - ✅ **Active**: 배포 성공
   - ❌ **Failed**: 배포 실패 - 로그 확인 필요
   - ⏳ **Building/Deploying**: 배포 중

### 2. 배포 로그 확인

1. **"Deployments"** 탭에서 최신 배포 클릭
2. 로그에서 에러 메시지 확인:
   - 빌드 에러
   - 시작 에러
   - 데이터베이스 연결 에러
   - 포트 에러

### 3. 일반적인 원인 및 해결

#### 원인 1: 빌드 실패

**증상:**
- Deployment 상태: Failed
- 로그: 빌드 에러 메시지

**해결:**
1. 로그에서 에러 메시지 확인
2. `package.json`의 빌드 스크립트 확인
3. 의존성 설치 문제인지 확인
4. 코드 수정 후 재배포

#### 원인 2: 서버 시작 실패

**증상:**
- 빌드는 성공했지만 서버가 시작되지 않음
- 로그: "Application failed to respond"

**해결:**
1. 환경 변수 확인 (`DATABASE_URL`, `JWT_SECRET` 등)
2. 포트 설정 확인 (Railway는 동적 포트 사용)
3. 시작 명령어 확인 (`railway.json`의 `startCommand`)

#### 원인 3: 데이터베이스 연결 실패

**증상:**
- 로그: "Can't reach database server" 또는 Prisma 에러

**해결:**
1. PostgreSQL 서비스가 실행 중인지 확인
2. `DATABASE_URL` 환경 변수 확인
3. 데이터베이스 서비스 연결 확인 (Railway에서 자동 연결되어야 함)

#### 원인 4: 메모리 부족

**증상:**
- 배포 후 바로 크래시
- 로그: 메모리 관련 에러

**해결:**
1. Railway 플랜 확인 (무료 플랜은 메모리 제한 있음)
2. 불필요한 의존성 제거
3. 빌드 최적화

### 4. 백엔드 서비스 재배포

문제를 해결한 후:
1. Railway 대시보드 → 백엔드 서비스
2. **"Settings"** 탭
3. **"Redeploy"** 버튼 클릭
4. 또는 GitHub에 푸시하면 자동 재배포

### 5. 환경 변수 확인

백엔드 서비스 → **"Variables"** 탭에서 필수 변수 확인:

**필수 변수:**
```
DATABASE_URL=postgresql://... (Railway에서 자동 생성되어야 함)
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend.railway.app
```

### 6. 로컬에서 테스트

백엔드가 로컬에서 정상 작동하는지 확인:

```bash
cd shiftory-api
npm install
npm run build
npm run start:prod
```

로컬에서 작동한다면 Railway 설정 문제일 가능성이 높습니다.

## 체크리스트

- [ ] 백엔드 서비스가 Railway에 배포되어 있는지
- [ ] 최신 배포 상태가 "Active"인지
- [ ] 배포 로그에 에러가 없는지
- [ ] 필수 환경 변수가 설정되어 있는지 (`DATABASE_URL`, `JWT_SECRET`)
- [ ] PostgreSQL 서비스가 연결되어 있는지
- [ ] `railway.json`의 `startCommand`가 올바른지
- [ ] 포트 설정이 올바른지 (동적 포트 사용)

## 디버깅 명령어

### Railway CLI 사용 (선택사항)
```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 로그 확인
railway logs

# 환경 변수 확인
railway variables
```

## 추가 참고

- [Railway 공식 문서](https://docs.railway.app/)
- 백엔드 README: `shiftory-api/README.md`
- 환경 변수 가이드: `ENVIRONMENT_VARIABLES.md`

