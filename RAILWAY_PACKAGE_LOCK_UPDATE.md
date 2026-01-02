# Railway package-lock.json 동기화 문제 해결

## 문제
Nixpacks가 `npm ci`를 사용하는데, `package.json`과 `package-lock.json`이 동기화되지 않아 빌드가 실패합니다.

## 해결 방법

### 방법 1: railway.json에 nixpacksPlan 설정 (시도 중)

`railway.json`에 `nixpacksPlan.installCommand`를 추가했습니다. 이것이 작동하지 않으면 방법 2를 사용하세요.

### 방법 2: 로컬에서 package-lock.json 업데이트 (권장)

로컬에서 `npm install`을 실행하여 `package-lock.json`을 최신 상태로 업데이트:

```bash
cd workhaja-api
npm install
git add package-lock.json
git commit -m "Update package-lock.json to sync with package.json"
git push
```

이렇게 하면 `npm ci`도 정상 작동합니다.

### 방법 3: Railway Settings에서 Build Command 오버라이드

Railway 대시보드 → 백엔드 서비스 → **"Settings"** 탭:

**Build Command**를 다음과 같이 설정:
```
npm install && npx prisma generate && npm run build
```

이렇게 하면 `npm ci` 대신 `npm install`이 사용됩니다.

## 체크리스트

- [x] `railway.json`에 `nixpacksPlan.installCommand` 추가 시도
- [ ] 재배포 후 확인
- [ ] 작동하지 않으면 로컬에서 `npm install` 실행
- [ ] `package-lock.json` 업데이트 후 커밋 및 푸시

## 참고

- `npm ci`: 빠르고 안정적이지만, `package-lock.json`이 정확해야 함
- `npm install`: `package-lock.json`을 업데이트하며 더 유연함

