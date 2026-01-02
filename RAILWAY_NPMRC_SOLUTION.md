# Railway npm ci 문제 해결: .npmrc 사용

## 문제
Nixpacks의 install 단계에서 `npm ci`가 실패하지만, Build Command만으로는 install 단계를 변경할 수 없습니다.

## 해결 방법: .npmrc 파일 사용

`.npmrc` 파일을 추가하여 npm의 동작을 변경할 수 있습니다.

### 방법 1: package-lock.json 무시 (시도 중)

`workhaja-api/.npmrc` 파일 생성:
```
package-lock=false
```

이렇게 하면 npm이 `package-lock.json`을 무시하고 설치합니다.

### 방법 2: Railway Settings에서 Install Command 설정

Railway 대시보드 → 백엔드 서비스 → **"Settings"** 탭:

**Install Command** 필드가 있다면:
```
npm install
```

로 설정합니다.

### 방법 3: package-lock.json 삭제

만약 `.npmrc`가 작동하지 않으면, `package-lock.json`을 삭제할 수도 있습니다:

```bash
git rm workhaja-api/package-lock.json
git commit -m "Remove package-lock.json to use npm install"
git push
```

이렇게 하면 Railway에서 `npm install`을 실행할 때 새로운 `package-lock.json`이 생성됩니다.

## 참고

- `.npmrc` 파일은 npm의 설정 파일입니다
- `package-lock=false`는 npm이 `package-lock.json`을 무시하도록 합니다
- 이렇게 하면 `npm ci` 대신 `npm install`이 작동할 수 있습니다

## 체크리스트

- [x] `.npmrc` 파일 추가
- [ ] 재배포 후 확인
- [ ] 작동하지 않으면 `package-lock.json` 삭제 고려

