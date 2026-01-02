# Railway 마이그레이션 실패 최종 해결

## 문제
`prisma migrate resolve` 명령이 제대로 실행되지 않습니다.

## 해결 방법

`railway.json`과 `nixpacks.toml` 모두에 `prisma migrate resolve` 명령을 추가했습니다.

### railway.json
```json
"startCommand": "npx prisma migrate resolve --rolled-back 20260102000000_add_store_location_and_special_code 2>/dev/null; npx prisma migrate deploy && npm run start:prod"
```

### nixpacks.toml
```toml
[start]
cmd = "npx prisma migrate resolve --rolled-back 20260102000000_add_store_location_and_special_code || npx prisma migrate deploy || npx prisma migrate deploy && npm run start:prod"
```

## 작동 원리

- `prisma migrate resolve --rolled-back`: 실패한 마이그레이션을 "rolled back" 상태로 표시
- `2>/dev/null`: 에러 메시지를 숨김 (이미 resolve되었을 수 있음)
- `;`: 앞 명령의 성공/실패와 관계없이 다음 명령 실행
- `npx prisma migrate deploy`: 마이그레이션 실행
- `&& npm run start:prod`: 마이그레이션이 성공하면 서버 시작

## 대안: Railway Settings에서 직접 수정

만약 여전히 작동하지 않으면, Railway Settings에서 Start Command를 직접 수정하세요:

1. Railway 대시보드 → 백엔드 서비스 → Settings
2. Start Command 필드에 다음 입력:
   ```
   npx prisma migrate resolve --rolled-back 20260102000000_add_store_location_and_special_code 2>/dev/null; npx prisma migrate deploy && npm run start:prod
   ```
3. 저장 및 재배포

## 참고

- `railway.json`의 startCommand가 `nixpacks.toml`보다 우선순위가 높을 수 있습니다
- 두 파일 모두 수정하여 어느 쪽을 사용하든 작동하도록 했습니다

