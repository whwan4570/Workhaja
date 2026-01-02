# Railway npm ci 문제 해결: nixpacks.toml 사용

## 문제
Nixpacks의 install 단계에서 `npm ci`가 실패하지만, Build Command만으로는 install 단계를 변경할 수 없습니다.

## 해결 방법: nixpacks.toml 파일 사용

Nixpacks는 `nixpacks.toml` 파일을 사용하여 빌드 프로세스를 커스터마이즈할 수 있습니다.

### nixpacks.toml 파일 생성

`workhaja-api/nixpacks.toml` 파일을 생성하여 install 단계를 `npm install`로 설정:

```toml
[phases.setup]
nixPkgs = ["nodejs_22", "npm-9_x"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npx prisma generate", "npm run build"]

[start]
cmd = "npx prisma migrate deploy && npm run start:prod"
```

이렇게 하면:
- `[phases.install]` 섹션에서 `npm install`을 사용하도록 명시적으로 설정
- `[phases.build]` 섹션에서 Prisma 생성 및 빌드 명령 설정
- `[start]` 섹션에서 시작 명령 설정

## nixpacks.toml vs railway.json

- **nixpacks.toml**: Nixpacks 빌더 전용 설정 파일 (더 세밀한 제어 가능)
- **railway.json**: Railway 플랫폼 전반의 설정 파일

두 파일이 모두 있으면 `nixpacks.toml`이 우선순위가 높습니다.

## 체크리스트

- [x] `nixpacks.toml` 파일 생성
- [ ] 재배포 후 확인
- [ ] Build Logs에서 `npm install`이 사용되는지 확인
- [ ] 빌드가 성공하는지 확인

## 참고

- Nixpacks는 `nixpacks.toml` 파일이 있으면 이를 사용합니다
- `railway.json`의 설정은 무시될 수 있습니다
- `nixpacks.toml`이 더 세밀한 제어를 제공합니다

