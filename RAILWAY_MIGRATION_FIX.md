# Railway 마이그레이션 실패 해결

## 문제
마이그레이션이 실패했습니다:
```
Error: P3009
migrate found failed migrations in the target database
The `20260102000000_add_store_location_and_special_code` migration started at ... failed
```

## 원인
기존 stores 테이블에 데이터가 있는데, `special_code`를 `NOT NULL DEFAULT ''`로 추가하려고 했습니다. 빈 문자열('')이 여러 행에 있을 경우 unique 제약조건과 충돌할 수 있습니다.

## 해결 방법

마이그레이션 SQL을 단계별로 실행하도록 수정했습니다:

1. 먼저 컬럼을 nullable로 추가
2. 기존 데이터에 unique한 special_code 값 생성 및 업데이트
3. special_code를 NOT NULL로 변경
4. unique 인덱스 생성

## Railway에서 수동으로 마이그레이션 해결

만약 여전히 실패하면, Railway에서 수동으로 마이그레이션 상태를 리셋해야 할 수 있습니다:

### 방법 1: Railway PostgreSQL 콘솔 사용

1. Railway 대시보드 → PostgreSQL 서비스 선택
2. "Query" 탭 클릭
3. 다음 SQL 실행하여 실패한 마이그레이션 상태 제거:

```sql
-- 실패한 마이그레이션 레코드 삭제
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20260102000000_add_store_location_and_special_code' 
AND finished_at IS NULL;

-- 또는 마이그레이션 테이블 확인
SELECT * FROM "_prisma_migrations" ORDER BY started_at DESC LIMIT 5;
```

4. 재배포

### 방법 2: 마이그레이션 파일 이름 변경

마이그레이션 파일의 타임스탬프를 새로운 것으로 변경하여 새로운 마이그레이션으로 처리:

```bash
# 마이그레이션 파일 이름 변경
mv prisma/migrations/20260102000000_add_store_location_and_special_code \
   prisma/migrations/20260102120000_add_store_location_and_special_code
```

그런 다음 재배포

## 예방 조치

향후 마이그레이션 작성 시:
- 기존 데이터가 있는 경우 nullable로 시작
- 데이터 업데이트 후 NOT NULL 제약조건 추가
- unique 제약조건은 데이터가 준비된 후에 추가

