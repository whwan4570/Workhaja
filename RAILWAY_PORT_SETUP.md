# Railway "Choose your target port" 해결 가이드

## 문제
Railway에서 "Choose your target port" 메시지가 나타납니다.

## 원인
Railway가 백엔드 서비스가 사용하는 포트를 자동으로 감지하지 못했을 때 나타납니다.

## 해결 방법

### 방법 1: Railway Settings에서 포트 설정 (권장)

Railway 대시보드에서:

1. **백엔드 서비스** (`workhaja-back`) 선택
2. **"Settings"** 탭 클릭
3. **"Networking"** 섹션 찾기
4. **"Public Networking"** 또는 **"Port"** 설정 확인
5. 포트 설정:
   - **방법 A**: 포트를 지정하지 않고 자동 감지 사용
     - 포트 필드를 비워두기 (Railway가 `PORT` 환경 변수를 사용)
   - **방법 B**: 명시적으로 포트 지정 (선택사항)
     - 하지만 일반적으로 필요 없음

### 방법 2: 서비스가 PORT 환경 변수 사용 확인

백엔드 코드(`shiftory-api/src/main.ts`)에서:

```typescript
const port = process.env.PORT || 3000;
await app.listen(port);
```

✅ 이미 올바르게 설정되어 있습니다!

Railway는 자동으로 `PORT` 환경 변수를 제공하므로, 서비스가 이를 사용하면 됩니다.

### 방법 3: Railway Service Settings 확인

1. 백엔드 서비스 → **"Settings"** 탭
2. **"Networking"** 섹션에서:
   - **"Expose Port"** 또는 **"Public Networking"** 활성화
   - 포트 번호는 **비워두기** (Railway가 자동으로 설정)
3. 저장

### 방법 4: Service의 연결 확인 (PostgreSQL)

때로는 PostgreSQL 서비스와의 연결 문제로 포트 선택이 나타날 수 있습니다:

1. PostgreSQL 서비스가 추가되어 있는지 확인
2. 백엔드 서비스와 PostgreSQL 서비스가 연결되어 있는지 확인
3. `DATABASE_URL` 환경 변수가 자동으로 설정되어 있는지 확인

## Railway 포트 동작 방식

Railway는:
1. **동적 포트 할당**: 각 서비스에 자동으로 포트를 할당
2. **PORT 환경 변수**: 서비스에 `PORT` 환경 변수를 제공
3. **자동 감지**: 서비스가 `PORT` 환경 변수를 사용하면 자동으로 감지

**중요:** 
- ❌ `PORT` 환경 변수를 **수동으로 설정하지 마세요**
- ✅ 서비스 코드에서 `process.env.PORT`를 사용하세요
- ✅ Railway가 자동으로 설정하도록 두세요

## 체크리스트

- [ ] 백엔드 서비스의 Settings에서 포트 설정 확인
- [ ] `PORT` 환경 변수를 수동으로 설정하지 않았는지 확인
- [ ] `shiftory-api/src/main.ts`에서 `process.env.PORT`를 사용하는지 확인
- [ ] PostgreSQL 서비스가 연결되어 있는지 확인
- [ ] 서비스가 정상적으로 시작되고 있는지 확인 (Deploy Logs)

## 추가 확인 사항

### Deploy Logs에서 확인:
```
🚀 Workhaja API is running on: http://localhost:PORT
```

이 메시지가 나타나면 서버가 포트에서 정상적으로 실행되고 있습니다.

### 환경 변수 확인:
Railway 대시보드 → 백엔드 서비스 → **"Variables"** 탭:

**있으면 안 되는 것:**
- ❌ `PORT=3000` (수동 설정)

**있어야 하는 것:**
- ✅ `DATABASE_URL` (자동 생성)
- ✅ `JWT_SECRET` (수동 설정)
- ✅ `FRONTEND_URL` (수동 설정)
- ✅ `PORT` (Railway가 자동으로 제공 - Variables 탭에 보이지 않을 수 있음)

## 문제가 계속되는 경우

1. **서비스 재배포:**
   - Settings → Redeploy 클릭
   - 또는 GitHub에 푸시하여 자동 재배포

2. **서비스 삭제 후 재생성:**
   - 마지막 수단으로 서비스를 삭제하고 다시 추가
   - Root Directory를 올바르게 설정 (`shiftory-api`)

3. **Railway Support 문의:**
   - Railway 공식 지원에 문의

## 참고
- Railway는 일반적으로 포트를 자동으로 감지합니다
- "Choose your target port"는 드물게 발생하며, 대부분 Settings에서 해결됩니다
- NestJS는 `process.env.PORT`를 사용하면 Railway가 자동으로 감지합니다

