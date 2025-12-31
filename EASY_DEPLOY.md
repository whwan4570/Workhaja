# 🚀 쉬운 배포 가이드 (초보자용)

Railway로 10분 안에 배포하기!

## 📋 준비물

1. GitHub 계정
2. Railway 계정 (무료) - https://railway.app
3. 10분 시간

## ❓ FAQ: 저장소는 하나인가요?

**네, 하나의 저장소면 됩니다!**

- `shiftory-api`와 `staff-scheduling-ui`는 **같은 저장소**에 있습니다
- Railway에서 **같은 저장소를 2번 선택**하되, Root Directory만 다르게 설정합니다
- 별도 저장소로 분리할 필요 없습니다!

## 🎯 단계별 가이드

### 1단계: GitHub에 코드 올리기 (이미 했다면 스킵)

```bash
# 터미널에서 실행
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2단계: Railway 가입 및 로그인

1. https://railway.app 접속
2. "Start a New Project" 클릭
3. GitHub로 로그인 (권장)

### 3단계: 프로젝트 생성

1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. 저장소 선택
4. "Deploy Now" 클릭

### 4단계: 데이터베이스 추가

1. 프로젝트 화면에서 "New" 버튼 클릭
2. "Database" 선택
3. "PostgreSQL" 선택
4. 완료! Railway가 자동으로 데이터베이스를 생성합니다

### 5단계: 백엔드 배포

1. 프로젝트 화면에서 "New" 버튼 클릭
2. "GitHub Repo" 선택
3. **같은 저장소** 선택 (예: `your-username/shiftory`)
4. **중요!** "Configure Service" 클릭
5. **Root Directory**에 `shiftory-api` 입력
   - 이렇게 하면 Railway가 `shiftory-api` 폴더만 사용합니다
6. "Deploy" 클릭

#### 환경 변수 설정 (백엔드)

배포가 시작되면:
1. 백엔드 서비스 클릭
2. "Variables" 탭 클릭
3. 다음 변수들을 추가:

```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
JWT_SECRET = 아무거나-긴-문자열-123456789
JWT_EXPIRES_IN = 7d
PORT = 
FRONTEND_URL = https://your-frontend.railway.app (나중에 업데이트)
```

**팁**: `DATABASE_URL`은 `${{Postgres.DATABASE_URL}}`로 입력하면 자동으로 연결됩니다!

#### 빌드 설정 (백엔드)

1. "Settings" 탭 클릭
2. "Build Command"에 입력:
   ```
   npm install && npx prisma generate && npm run build
   ```
3. "Start Command"에 입력:
   ```
   npx prisma migrate deploy && npm run start:prod
   ```

#### 백엔드 URL 확인

배포가 완료되면:
1. "Settings" 탭 클릭
2. "Generate Domain" 클릭
3. 생성된 URL 복사 (예: `https://shiftory-api.railway.app`)

### 6단계: 프론트엔드 배포

1. 프로젝트 화면에서 "New" 버튼 클릭
2. "GitHub Repo" 선택
3. **같은 저장소** 선택 (백엔드와 동일한 저장소!)
4. **중요!** "Configure Service" 클릭
5. **Root Directory**에 `staff-scheduling-ui` 입력
   - 백엔드는 `shiftory-api`, 프론트엔드는 `staff-scheduling-ui`로 다르게 설정!
6. "Deploy" 클릭

#### 환경 변수 설정 (프론트엔드)

1. 프론트엔드 서비스 클릭
2. "Variables" 탭 클릭
3. 다음 변수 추가:
   ```
   NEXT_PUBLIC_API_URL = https://shiftory-api.railway.app
   ```
   (5단계에서 복사한 백엔드 URL 사용)

#### 빌드 설정 (프론트엔드)

1. "Settings" 탭 클릭
2. "Build Command"에 입력:
   ```
   npm install && npm run build
   ```
3. "Start Command"에 입력:
   ```
   npm run start
   ```

#### 프론트엔드 URL 확인

배포가 완료되면:
1. "Settings" 탭 클릭
2. "Generate Domain" 클릭
3. 생성된 URL 복사 (예: `https://shiftory-frontend.railway.app`)

### 7단계: 연결하기

1. 백엔드 서비스로 돌아가기
2. "Variables" 탭 클릭
3. `FRONTEND_URL` 찾기
4. 값을 프론트엔드 URL로 변경:
   ```
   FRONTEND_URL = https://shiftory-frontend.railway.app
   ```
5. 백엔드 서비스 재배포 (자동으로 재배포될 수도 있음)

## ✅ 완료!

이제 프론트엔드 URL로 접속하면 됩니다!

## 🔍 문제 해결

### "Railpack could not determine how to build"

**원인**: Root Directory를 설정하지 않았습니다.

**해결**:
1. 서비스 설정에서 "Configure Service" 클릭
2. Root Directory에 `shiftory-api` 또는 `staff-scheduling-ui` 입력
3. 재배포

### 빌드 실패

**원인**: 환경 변수가 없거나 잘못되었습니다.

**해결**:
1. "Variables" 탭에서 환경 변수 확인
2. `DATABASE_URL`이 `${{Postgres.DATABASE_URL}}`로 설정되었는지 확인
3. 재배포

### API 연결 실패

**원인**: `NEXT_PUBLIC_API_URL`이 잘못되었습니다.

**해결**:
1. 프론트엔드 "Variables" 탭 확인
2. 백엔드 URL이 올바른지 확인
3. 재배포

## 📸 시각적 가이드

각 단계마다 Railway 화면에서:
- **"New"** 버튼 = 왼쪽 상단 또는 중앙
- **"Variables"** 탭 = 서비스 클릭 후 상단 탭
- **"Settings"** 탭 = 서비스 클릭 후 상단 탭
- **"Configure Service"** = 저장소 선택 후 나타나는 버튼

## 💡 팁

1. **Root Directory는 반드시 설정하세요!**
   - 백엔드: `shiftory-api`
   - 프론트엔드: `staff-scheduling-ui`

2. **환경 변수는 정확히 입력하세요**
   - `DATABASE_URL = ${{Postgres.DATABASE_URL}}` (공백 주의!)

3. **배포는 시간이 걸립니다**
   - 첫 배포는 5-10분 걸릴 수 있습니다
   - 인내심을 가지세요!

4. **로그 확인**
   - 서비스 클릭 → "Deployments" 탭 → 로그 확인

## 🆘 도움이 필요하신가요?

문제가 발생하면:
1. `RAILWAY_FIX.md` 파일 참고
2. Railway 로그 확인
3. 환경 변수 다시 확인

## 🎉 성공!

배포가 완료되면:
- 프론트엔드 URL로 접속
- 회원가입 테스트
- 로그인 테스트
- 기능 테스트

축하합니다! 🎊

