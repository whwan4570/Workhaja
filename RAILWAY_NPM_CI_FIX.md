# Railway npm ci 오류 해결

## 문제
Nixpacks가 자동으로 `npm ci`를 실행하지만, `package.json`과 `package-lock.json`이 동기화되지 않아 빌드가 실패합니다.

에러 메시지:
```
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: @aws-sdk/client-s3@3.958.0 from lock file
...
```

## 원인
- Nixpacks는 기본적으로 `npm ci`를 사용합니다 (더 빠르고 안정적)
- `npm ci`는 `package-lock.json`과 `package.json`이 완전히 동기화되어야 합니다
- `package-lock.json`이 최신 상태가 아닐 때 발생합니다

## 해결 방법

### 방법 1: railway.json에 installCommand 추가 (권장)

`workhaja-api/railway.json` 파일 수정:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "installCommand": "npm install",
    "buildCommand": "npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**변경 사항:**
- `installCommand: "npm install"` 추가 → `npm ci` 대신 `npm install` 사용
- `buildCommand`에서 `npm install` 제거 (이미 installCommand에서 실행)

### 방법 2: 로컬에서 package-lock.json 업데이트

로컬에서 `package-lock.json`을 업데이트하고 커밋:

```bash
cd workhaja-api
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

그러면 `npm ci`도 정상 작동합니다.

### 방법 1 vs 방법 2

- **방법 1 (권장)**: 더 유연하고, `package-lock.json`이 약간 오래되어도 작동
- **방법 2**: 더 엄격하고, `package-lock.json`을 항상 최신 상태로 유지해야 함

## 참고

- `npm ci`: `package-lock.json`을 정확히 따르며, 더 빠르고 안정적
- `npm install`: `package.json`을 기준으로 의존성을 설치하고 `package-lock.json`을 업데이트

## 체크리스트

- [x] `railway.json`에 `installCommand: "npm install"` 추가
- [ ] Railway가 자동으로 재배포
- [ ] 빌드가 성공하는지 확인
- [ ] 서버가 시작되는지 확인

