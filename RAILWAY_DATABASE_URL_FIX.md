# Railway DATABASE_URL 에러 해결

## 문제
Railway 배포 로그에서 다음 에러 발생:
```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Environment variable not found: DATABASE_URL.
```

## 원인
백엔드 서비스에 `DATABASE_URL` 환경 변수가 설정되지 않았습니다.

## 해결 방법

### 방법 1: PostgreSQL 서비스 연결 (권장)

Railway 대시보드에서:

#### 1단계: PostgreSQL 서비스 추가

1. 프로젝트 화면에서 **"New"** 버튼 클릭
2. **"Database"** 선택
3. **"PostgreSQL"** 선택
4. PostgreSQL 서비스가 생성됩니다

#### 2단계: 백엔드 서비스와 연결

1. **백엔드 서비스** (`workhaja-back`) 선택
2. **"Variables"** 탭 클릭
3. **"New Variable"** 클릭
4. 설정:
   - **Key**: `DATABASE_URL`
   - **Value**: `${{Postgres.DATABASE_URL}}`
     - PostgreSQL 서비스 이름이 다르면 `${{YourPostgresServiceName.DATABASE_URL}}`로 변경
5. **"Add"** 클릭

#### 3단계: 서비스 재배포

`DATABASE_URL` 환경 변수를 추가하면 Railway가 자동으로 재배포를 시작합니다.

### 방법 2: 수동으로 DATABASE_URL 입력 (비권장)

PostgreSQL 서비스가 이미 있다면:

1. **PostgreSQL 서비스** 선택
2. **"Variables"** 탭 클릭
3. `DATABASE_URL` 변수의 값을 복사
4. **백엔드 서비스** → **"Variables"** 탭
5. `DATABASE_URL` 추가하고 복사한 값 붙여넣기

**주의**: 이 방법은 PostgreSQL 서비스가 재생성되면 값이 바뀔 수 있습니다. 방법 1이 더 안전합니다!

## 확인 방법

### 1. Variables 탭에서 확인

백엔드 서비스 → **"Variables"** 탭에서:
- ✅ `DATABASE_URL=${{Postgres.DATABASE_URL}}` 또는 실제 값이 있어야 함

### 2. Deploy Logs에서 확인

재배포 후 Deploy Logs에서:
- ✅ `DATABASE_URL` 에러가 사라져야 함
- ✅ Prisma 마이그레이션이 성공해야 함
- ✅ 서버가 정상적으로 시작해야 함

## 체크리스트

- [ ] PostgreSQL 서비스가 프로젝트에 추가되어 있는지
- [ ] 백엔드 서비스의 Variables에 `DATABASE_URL`이 설정되어 있는지
- [ ] `DATABASE_URL` 값이 `${{Postgres.DATABASE_URL}}` 형식인지 (또는 유효한 값인지)
- [ ] PostgreSQL 서비스와 백엔드 서비스가 같은 프로젝트에 있는지
- [ ] 재배포가 완료되었는지

## PostgreSQL 서비스 이름 확인

만약 PostgreSQL 서비스 이름이 `Postgres`가 아니라면:
1. PostgreSQL 서비스를 클릭
2. 서비스 이름 확인 (예: `PostgreSQL`, `db`, `database` 등)
3. 백엔드 Variables에서 `${{서비스이름.DATABASE_URL}}` 형식으로 설정

## 추가 환경 변수

백엔드 서비스의 Variables 탭에서 다음 변수들도 확인하세요:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend.railway.app
```

## 문제가 계속되는 경우

### 1. PostgreSQL 서비스 확인

PostgreSQL 서비스가 정상적으로 실행 중인지 확인:
- 서비스 상태가 "Running"인지
- 로그에 에러가 없는지

### 2. 서비스 삭제 후 재생성

마지막 수단으로:
1. 백엔드 서비스 삭제
2. PostgreSQL 서비스 삭제
3. PostgreSQL 서비스 재생성
4. 백엔드 서비스 재생성
5. `DATABASE_URL=${{Postgres.DATABASE_URL}}` 설정

### 3. Railway Support 문의

위 방법으로 해결되지 않으면 Railway 공식 지원에 문의하세요.

## 요약

1. **PostgreSQL 서비스 추가** (없는 경우)
2. **백엔드 Variables에 `DATABASE_URL=${{Postgres.DATABASE_URL}}` 추가**
3. **자동 재배포 대기**
4. **Deploy Logs에서 확인**

이렇게 하면 `DATABASE_URL` 에러가 해결됩니다!

