# Railway PostgreSQL Query 실행 가이드

## 방법 1: Railway 웹 대시보드 사용 (권장)

### 단계별 가이드

1. **Railway 대시보드 접속**
   - https://railway.app 접속
   - 로그인

2. **프로젝트 선택**
   - 프로젝트 목록에서 해당 프로젝트 클릭

3. **PostgreSQL 서비스 찾기**
   - 프로젝트 화면에서 PostgreSQL 서비스 찾기
   - PostgreSQL 서비스 카드 클릭

4. **Query 탭 찾기**
   - PostgreSQL 서비스 화면 상단에 있는 탭 중:
     - **"Query"** 탭 클릭
     - 또는 **"Data"** 탭 → **"Query"** 클릭
     - 또는 **"Connect"** 탭 → 하단에 Query 옵션

5. **SQL 입력 및 실행**
   - Query 에디터(텍스트 입력 필드)에 다음 SQL 입력:
   ```sql
   DELETE FROM "_prisma_migrations" 
   WHERE migration_name = '20260102000000_add_store_location_and_special_code' 
   AND finished_at IS NULL;
   ```
   - **"Run Query"** 또는 **"Execute"** 버튼 클릭
   - 또는 `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac) 누르기

6. **결과 확인**
   - 성공 메시지 또는 "1 row deleted" 같은 메시지 확인
   - 에러가 있으면 에러 메시지 확인

7. **재배포**
   - 백엔드 서비스로 이동
   - **"Deployments"** 탭 클릭
   - **"Redeploy"** 버튼 클릭 (또는 자동 재배포 대기)

## 방법 2: Railway CLI 사용 (대안)

Railway CLI가 설치되어 있다면:

```bash
# Railway CLI 로그인 (처음 한 번만)
railway login

# 프로젝트 연결
railway link

# PostgreSQL에 연결하여 SQL 실행
railway run psql $DATABASE_URL -c "DELETE FROM \"_prisma_migrations\" WHERE migration_name = '20260102000000_add_store_location_and_special_code' AND finished_at IS NULL;"
```

## 방법 3: 외부 PostgreSQL 클라이언트 사용

1. Railway PostgreSQL 서비스의 **"Connect"** 탭에서 연결 정보 확인:
   - Host
   - Port
   - Database
   - User
   - Password

2. pgAdmin, DBeaver, TablePlus 등의 PostgreSQL 클라이언트로 연결

3. SQL 실행

## Query 탭을 찾을 수 없는 경우

만약 Query 탭이 보이지 않으면:

1. **Railway UI 업데이트 확인**: Railway가 UI를 업데이트했을 수 있습니다
2. **PostgreSQL 서비스 타입 확인**: PostgreSQL 서비스인지 확인
3. **권한 확인**: 프로젝트에 대한 권한이 있는지 확인
4. **Railway 지원팀 문의**: Query 기능이 비활성화되어 있을 수 있습니다

## 대안: 마이그레이션 파일 이름 변경

Query를 사용할 수 없다면, 마이그레이션 파일 이름을 변경하여 새로운 마이그레이션으로 처리할 수 있습니다:

1. 로컬에서 마이그레이션 폴더 이름 변경
2. 마이그레이션 SQL 내용 확인
3. 재배포

이 경우 기존 데이터는 수동으로 업데이트해야 할 수 있습니다.

