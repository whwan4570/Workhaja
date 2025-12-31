# Git 파일/폴더 이름 변경 가이드

## 파일 이름 변경

### 단일 파일 이름 변경

```bash
git mv old-filename.md new-filename.md
git commit -m "Rename file: old-filename.md to new-filename.md"
git push
```

### 여러 파일 이름 변경

```bash
git mv file1.md new-file1.md
git mv file2.md new-file2.md
git commit -m "Rename multiple files"
git push
```

## 폴더 이름 변경

### 폴더 이름 변경 (예: shiftory-api → workhaja-api)

**주의**: 폴더 이름을 변경하면 많은 파일의 경로가 바뀌므로 신중해야 합니다!

```bash
# 폴더 이름 변경
git mv shiftory-api workhaja-api

# 모든 참조 업데이트 후 커밋
git commit -m "Rename shiftory-api to workhaja-api"
git push
```

**폴더 이름 변경 후 필요한 작업:**
1. 모든 문서에서 경로 업데이트
2. README.md 파일들의 경로 업데이트
3. Railway 설정 파일 업데이트 (railway.json)
4. 코드 내부 참조 업데이트

## Windows에서 주의사항

Windows에서 파일/폴더 이름이 대소문자만 다른 경우:

```bash
# 대소문자만 다른 경우 두 단계로 나눠서 진행
git mv oldname OldName-temp
git mv OldName-temp OldName
git commit -m "Rename to fix case sensitivity"
git push
```

## 파일 이름 변경 예시

### 예시 1: 문서 파일 이름 변경

```bash
# 현재: RAILWAY_FIX.md
# 변경: RAILWAY_TROUBLESHOOTING.md

git mv RAILWAY_FIX.md RAILWAY_TROUBLESHOOTING.md
git commit -m "Rename RAILWAY_FIX.md to RAILWAY_TROUBLESHOOTING.md"
git push
```

### 예시 2: 디렉토리 이름 변경 (복잡함)

```bash
# shiftory-api → workhaja-api로 변경
git mv shiftory-api workhaja-api

# README.md 파일들에서 경로 업데이트
# - README.md
# - EASY_DEPLOY.md
# - RAILWAY_DEPLOYMENT.md
# 등등...

git add -A
git commit -m "Rename shiftory-api to workhaja-api and update all references"
git push
```

## 자동 참조 업데이트

폴더 이름을 변경한 후, 모든 참조를 찾아서 업데이트해야 합니다:

```bash
# shiftory-api를 참조하는 모든 파일 찾기
grep -r "shiftory-api" . --exclude-dir=node_modules --exclude-dir=.git

# 또는 Windows PowerShell
Select-String -Path . -Pattern "shiftory-api" -Recurse -Exclude "node_modules","\.git"
```

## Railway 배포 시 주의사항

폴더 이름을 변경하면:
1. Railway의 Root Directory 설정 업데이트 필요
2. 기존 배포가 깨질 수 있음
3. 새로 배포해야 할 수 있음

**권장**: 프로덕션 환경에서는 폴더 이름 변경을 신중하게 고려하세요!

## 빠른 참조

```bash
# 파일 이름 변경
git mv old-name new-name

# 커밋
git commit -m "Rename: old-name to new-name"

# 푸시
git push
```

## 되돌리기

실수로 변경했다면:

```bash
# 마지막 커밋 되돌리기
git reset --soft HEAD~1

# 또는 파일만 되돌리기
git restore --staged filename
git restore filename
```

