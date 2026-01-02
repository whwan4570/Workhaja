# Railway 마이그레이션 실패 해결: 파일 이름 변경 방법

## 문제
Query 탭이 없어서 실패한 마이그레이션을 수동으로 삭제할 수 없습니다.

## 해결 방법: 마이그레이션 파일 이름 변경

실패한 마이그레이션 파일의 이름을 새로운 타임스탬프로 변경하면, Prisma가 새로운 마이그레이션으로 인식하여 다시 실행합니다.

### 단계

1. **마이그레이션 폴더 이름 변경**
   - `20260102000000_add_store_location_and_special_code` 
   - → `20260102120000_add_store_location_and_special_code` (새로운 타임스탬프)

2. **재배포**
   - Railway가 자동으로 재배포합니다

### 왜 작동하는가?

- Prisma는 `_prisma_migrations` 테이블에 마이그레이션 이름을 기록합니다
- 파일 이름을 변경하면 Prisma가 새로운 마이그레이션으로 인식합니다
- 새로운 타임스탬프로 변경하면 마이그레이션 순서가 올바르게 유지됩니다

### 주의사항

- 마이그레이션 SQL은 이미 수정되어 있어서 기존 데이터를 올바르게 처리합니다
- 컬럼이 이미 추가되어 있다면 마이그레이션이 실패할 수 있습니다
- 이 경우 마이그레이션 SQL에서 `ADD COLUMN IF NOT EXISTS`를 사용하도록 수정했습니다

## 대안: Railway CLI 사용

Railway CLI가 설치되어 있다면:

```bash
railway run psql $DATABASE_URL -c "DELETE FROM \"_prisma_migrations\" WHERE migration_name = '20260102000000_add_store_location_and_special_code' AND finished_at IS NULL;"
```

