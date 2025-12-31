# 로그인/회원가입 "Failed to fetch" 에러 해결 가이드

## 문제
로그인 또는 회원가입 시 "Failed to fetch" 에러가 발생합니다.

## 원인
이 에러는 주로 **백엔드 서버가 실행되지 않았을 때** 발생합니다.

## 해결 방법

### 1. 백엔드 서버 실행 확인

백엔드 서버가 `http://localhost:3000`에서 실행 중인지 확인하세요.

**PowerShell에서 확인:**
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

포트 3000에서 실행 중이 아니라면 백엔드를 시작해야 합니다.

### 2. 백엔드 서버 시작

#### 방법 1: 개발 모드로 실행
```powershell
cd shiftory-api
npm run start:dev
```

서버가 시작되면 다음과 같은 메시지가 표시됩니다:
```
🚀 Workhaja API is running on: http://localhost:3000
```

#### 방법 2: 환경 변수 확인
백엔드가 시작되지 않는다면 `.env` 파일이 필요할 수 있습니다.

**최소한의 .env 파일 생성 (shiftory-api/.env):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workhaja?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### 3. 프론트엔드 서버 실행 확인

프론트엔드 서버가 `http://localhost:3001`에서 실행 중인지 확인하세요.

**PowerShell에서 확인:**
```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
```

#### 프론트엔드 시작:
```powershell
cd staff-scheduling-ui
npm run dev
```

### 4. 데이터베이스 확인

백엔드가 시작되지 않는다면 PostgreSQL 데이터베이스가 실행 중인지 확인하세요.

**PostgreSQL 확인:**
```powershell
# PostgreSQL이 Docker로 실행 중인지 확인
docker ps | findstr postgres

# 또는 PostgreSQL 서비스 확인 (Windows)
Get-Service | Where-Object {$_.Name -like "*postgres*"}
```

### 5. 전체 실행 순서

1. **데이터베이스 시작** (필요한 경우)
   ```powershell
   docker run --name workhaja-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=workhaja -p 5432:5432 -d postgres:15
   ```

2. **백엔드 시작** (새 터미널)
   ```powershell
   cd shiftory-api
   npm run start:dev
   ```
   
3. **프론트엔드 시작** (새 터미널)
   ```powershell
   cd staff-scheduling-ui
   npm run dev
   ```

4. **브라우저에서 접속**
   - 프론트엔드: http://localhost:3001
   - 백엔드 API: http://localhost:3000

## 체크리스트

- [ ] 백엔드 서버가 `http://localhost:3000`에서 실행 중
- [ ] 프론트엔드 서버가 `http://localhost:3001`에서 실행 중
- [ ] PostgreSQL 데이터베이스가 실행 중
- [ ] `.env` 파일에 올바른 `DATABASE_URL` 설정
- [ ] 브라우저 콘솔에서 네트워크 탭 확인 (요청이 어디로 가는지)
- [ ] CORS 에러가 아닌지 확인

## 추가 디버깅

### 브라우저 개발자 도구에서 확인:
1. **F12** 누르기
2. **Network** 탭 열기
3. 로그인 버튼 클릭
4. 실패한 요청 클릭하여 상세 정보 확인:
   - URL이 올바른지 (`http://localhost:3000/auth/login`)
   - 요청 상태 코드 (Failed, 404, 500 등)
   - 에러 메시지

### 백엔드 로그 확인:
백엔드 서버 터미널에서 에러 메시지 확인

