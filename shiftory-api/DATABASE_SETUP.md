# 데이터베이스 설정 가이드

## PostgreSQL 시작 방법

### 방법 1: Homebrew로 설치된 경우

```bash
# PostgreSQL 시작
brew services start postgresql@14
# 또는
brew services start postgresql@15
# 또는
brew services start postgresql@16

# 실행 중인 서비스 확인
brew services list
```

### 방법 2: Docker 사용 (권장)

Docker가 설치되어 있다면:

```bash
# PostgreSQL 컨테이너 실행
docker run --name shiftory-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=shiftory \
  -p 5432:5432 \
  -d postgres:15

# 컨테이너 상태 확인
docker ps

# 로그 확인
docker logs shiftory-postgres
```

`.env` 파일의 `DATABASE_URL`을 확인:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shiftory
```

### 방법 3: PostgreSQL이 이미 설치된 경우

```bash
# macOS에서 PostgreSQL 시작
pg_ctl -D /usr/local/var/postgres start

# 또는 시스템 설정에서 시작
# System Preferences > PostgreSQL > Start
```

### 방법 4: PostgreSQL 설치가 안 된 경우

#### Homebrew로 설치:
```bash
brew install postgresql@15
brew services start postgresql@15

# 데이터베이스 생성
createdb shiftory
```

#### Docker로 설치:
```bash
# Docker Desktop 설치 후
docker run --name shiftory-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=shiftory \
  -p 5433:5433 \
  -d postgres:15
```

## 연결 확인

PostgreSQL이 실행 중인지 확인:

```bash
# 방법 1: psql로 연결 테스트
psql -h localhost -U postgres -d shiftory

# 방법 2: pg_isready 사용
pg_isready -h localhost -p 5433

# 방법 3: Docker 컨테이너 확인
docker ps | grep postgres
```

## .env 파일 확인

`.env` 파일에 올바른 `DATABASE_URL`이 설정되어 있는지 확인:

```bash
cat .env | grep DATABASE_URL
```

예시:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shiftory
```

형식: `postgresql://[사용자명]:[비밀번호]@[호스트]:[포트]/[데이터베이스명]`

## 문제 해결

### 포트 5432가 이미 사용 중인 경우

```bash
# 포트 사용 확인
lsof -i :5432

# 다른 포트 사용 (예: 5433)
# .env 파일에서 포트 변경
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/shiftory
```

### 데이터베이스가 없는 경우

```bash
# 데이터베이스 생성
createdb shiftory

# 또는 psql로 생성
psql -U postgres
CREATE DATABASE shiftory;
\q
```

### Docker 컨테이너 재시작

```bash
# 컨테이너 중지
docker stop shiftory-postgres

# 컨테이너 시작
docker start shiftory-postgres

# 컨테이너 재생성 (데이터 삭제됨)
docker rm -f shiftory-postgres
docker run --name shiftory-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=shiftory \
  -p 5432:5432 \
  -d postgres:15
```

## 마이그레이션 실행

PostgreSQL이 실행 중이면:

```bash
# Prisma Client 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate dev --name add_stores_and_memberships
```


