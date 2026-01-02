# Railway 마이그레이션 실패 해결: migrate resolve 사용

## 문제
실패한 마이그레이션이 데이터베이스에 남아있어서 새로운 마이그레이션이 실행되지 않습니다:
```
Error: P3009
migrate found failed migrations in the target database
The `20260102000000_add_store_location_and_special_code` migration started at ... failed
```

## 해결 방법: prisma migrate resolve 사용

`nixpacks.toml`의 start command에 `prisma migrate resolve` 명령을 추가하여 실패한 마이그레이션을 "rolled back"으로 표시합니다.

### 변경 사항

`workhaja-api/nixpacks.toml`:
```toml
[start]
cmd = "npx prisma migrate resolve --rolled-back 20260102000000_add_store_location_and_special_code 2>/dev/null || true; npx prisma migrate deploy && npm run start:prod"
```

이 명령은:
1. 실패한 마이그레이션을 "rolled back"으로 표시 (에러 무시)
2. 새로운 마이그레이션 실행
3. 서버 시작

### 작동 원리

- `prisma migrate resolve --rolled-back`: 실패한 마이그레이션을 "rolled back" 상태로 표시
- `2>/dev/null || true`: 에러를 무시하고 계속 진행 (마이그레이션이 이미 resolve되었을 수 있음)
- `npx prisma migrate deploy`: 새로운 마이그레이션 실행

## 재배포 후

Railway가 재배포하면:
1. 실패한 마이그레이션이 resolve됩니다
2. 새로운 마이그레이션이 실행됩니다
3. 서버가 시작됩니다

## 참고

- `--rolled-back`: 마이그레이션이 롤백되었다고 표시
- `--applied`: 마이그레이션이 이미 적용되었다고 표시 (이 경우 사용 안 함)

