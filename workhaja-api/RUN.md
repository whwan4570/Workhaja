# 실행 가이드

## 사전 요구사항

1. **Node.js 설치** (v18 이상 권장)
   - macOS: `brew install node` 또는 [nodejs.org](https://nodejs.org/)에서 다운로드
   - 설치 확인: `node --version`, `npm --version`

2. **PostgreSQL 실행 중**
   - 로컬 PostgreSQL 또는 Docker로 실행
   - `.env` 파일에 `DATABASE_URL` 설정되어 있어야 함

## 실행 단계

### 1. 의존성 설치

```bash
npm install
```

### 2. Prisma Client 생성

```bash
npx prisma generate
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name add_stores_and_memberships
```

이 명령어는:
- 마이그레이션 파일을 생성합니다
- 데이터베이스에 변경사항을 적용합니다
- Prisma Client를 자동으로 재생성합니다

### 4. 서버 시작

```bash
npm run start:dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 5. 테스트 실행 (새 터미널에서)

서버가 실행 중인 상태에서 새 터미널을 열고:

#### 빠른 테스트 스크립트

```bash
# 테스트 스크립트 생성
cat > test-stage2.sh << 'EOF'
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=== Step 1: Register User A ==="
RESPONSE_A=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"userA@test.com","password":"Passw0rd!","name":"User A"}')
TOKEN_A=$(echo $RESPONSE_A | jq -r '.accessToken')
STORE_ID_A=$(echo $RESPONSE_A | jq -r '.storeId')
echo "Token A: $TOKEN_A"
echo "Store ID A: $STORE_ID_A"

echo -e "\n=== Step 2: User A checks stores ==="
curl -s http://localhost:3000/stores -H "Authorization: Bearer $TOKEN_A" | jq '.'

echo -e "\n=== Step 3: Register User B ==="
RESPONSE_B=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"userB@test.com","password":"Passw0rd!","name":"User B"}')
TOKEN_B=$(echo $RESPONSE_B | jq -r '.accessToken')
STORE_ID_B=$(echo $RESPONSE_B | jq -r '.storeId')
echo "Token B: $TOKEN_B"
echo "Store ID B: $STORE_ID_B"

echo -e "\n=== Step 4: User A adds User B as WORKER ==="
curl -s -X POST $BASE_URL/stores/$STORE_ID_A/memberships \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"email":"userB@test.com","role":"WORKER"}' | jq '.'

echo -e "\n=== Step 5: User B checks role in Store A ==="
curl -s http://localhost:3000/stores/$STORE_ID_A/me \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'

echo -e "\n=== Step 6: User A (OWNER) accesses admin ping ==="
curl -s http://localhost:3000/stores/$STORE_ID_A/admin/ping \
  -H "Authorization: Bearer $TOKEN_A" | jq '.'

echo -e "\n=== Step 7: User B (WORKER) tries admin ping (should fail) ==="
curl -s http://localhost:3000/stores/$STORE_ID_A/admin/ping \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'
EOF

chmod +x test-stage2.sh
./test-stage2.sh
```

#### 수동 테스트

```bash
# 1. User A 회원가입
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"userA@test.com","password":"Passw0rd!","name":"User A"}'

# 응답에서 accessToken과 storeId를 복사하세요
# 예: TOKEN_A="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# 예: STORE_ID_A="clx1234567890abcdef"

# 2. User A의 매장 리스트 확인
curl http://localhost:3000/stores \
  -H "Authorization: Bearer $TOKEN_A"

# 3. User B 회원가입
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"userB@test.com","password":"Passw0rd!","name":"User B"}'

# 4. User A가 User B를 WORKER로 추가
curl -X POST http://localhost:3000/stores/$STORE_ID_A/memberships \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"email":"userB@test.com","role":"WORKER"}'

# 5. User B가 Store A에서 자신의 role 확인
curl http://localhost:3000/stores/$STORE_ID_A/me \
  -H "Authorization: Bearer $TOKEN_B"

# 6. User A (OWNER)가 admin ping 접근 (성공 예상)
curl http://localhost:3000/stores/$STORE_ID_A/admin/ping \
  -H "Authorization: Bearer $TOKEN_A"

# 7. User B (WORKER)가 admin ping 접근 (403 예상)
curl http://localhost:3000/stores/$STORE_ID_A/admin/ping \
  -H "Authorization: Bearer $TOKEN_B"
```

## Prisma Studio로 데이터 확인

데이터베이스 내용을 시각적으로 확인하려면:

```bash
npx prisma studio
```

브라우저에서 `http://localhost:5555`가 열리며 다음 테이블을 확인할 수 있습니다:
- `users`
- `stores`
- `memberships`

## 문제 해결

### 마이그레이션 에러

```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 리셋 (주의: 모든 데이터 삭제)
npx prisma migrate reset
```

### 서버 시작 에러

- `.env` 파일이 있는지 확인
- `DATABASE_URL`이 올바른지 확인
- PostgreSQL이 실행 중인지 확인

### 포트 충돌

기본 포트 3000이 사용 중이면 `.env`에 `PORT=3001` 등으로 변경

