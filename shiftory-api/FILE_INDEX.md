# Backend File Index - Quick Reference

## 📁 Source Files (src/) - ~70 files

### Auth Module (src/auth/) - 12 files
| File | Description |
|------|-------------|
| `auth.controller.ts` | 인증 컨트롤러 (login, register) |
| `auth.module.ts` | 인증 모듈 |
| `auth.service.ts` | 인증 서비스 (비즈니스 로직) |
| `decorators/current-user.decorator.ts` | @CurrentUser 데코레이터 |
| `decorators/roles.decorator.ts` | @Roles 데코레이터 |
| `decorators/index.ts` | 데코레이터 export |
| `dto/login.dto.ts` | 로그인 DTO |
| `dto/register.dto.ts` | 회원가입 DTO |
| `dto/index.ts` | DTO export |
| `guards/jwt-auth.guard.ts` | JWT 인증 가드 |
| `guards/roles.guard.ts` | 역할 기반 가드 |
| `guards/index.ts` | 가드 export |
| `strategies/jwt.strategy.ts` | JWT 전략 |
| `index.ts` | 모듈 export |

### Stores Module (src/stores/) - 8 files
| File | Description |
|------|-------------|
| `stores.controller.ts` | 스토어 컨트롤러 |
| `stores.module.ts` | 스토어 모듈 |
| `stores.service.ts` | 스토어 서비스 |
| `interceptors/store-context.interceptor.ts` | 스토어 컨텍스트 인터셉터 |
| `dto/create-store.dto.ts` | 스토어 생성 DTO |
| `dto/create-membership.dto.ts` | 멤버십 생성 DTO |
| `index.ts` | 모듈 export |

### Scheduling Module (src/scheduling/) - 11 files
| File | Description |
|------|-------------|
| `shifts.controller.ts` | 시프트 컨트롤러 |
| `shifts.service.ts` | 시프트 서비스 |
| `months.controller.ts` | 월별 스케줄 컨트롤러 |
| `months.service.ts` | 월별 스케줄 서비스 |
| `availability.controller.ts` | 가용성 컨트롤러 |
| `availability.service.ts` | 가용성 서비스 |
| `scheduling.module.ts` | 스케줄링 모듈 |
| `dto/create-shift.dto.ts` | 시프트 생성 DTO |
| `dto/update-shift.dto.ts` | 시프트 수정 DTO |
| `dto/create-month.dto.ts` | 월 생성 DTO |
| `dto/upsert-availability.dto.ts` | 가용성 생성/수정 DTO |
| `dto/index.ts` | DTO export |
| `index.ts` | 모듈 export |

### Change Requests Module (src/change-requests/) - 12 files
| File | Description |
|------|-------------|
| `change-requests.controller.ts` | 변경 요청 컨트롤러 |
| `change-requests.service.ts` | 변경 요청 서비스 |
| `change-requests.module.ts` | 변경 요청 모듈 |
| `candidates.controller.ts` | 후보자 컨트롤러 |
| `candidates.service.ts` | 후보자 서비스 |
| `audit.service.ts` | 감사 로그 서비스 |
| `dto/create-change-request.dto.ts` | 요청 생성 DTO |
| `dto/approve-change-request.dto.ts` | 승인 DTO |
| `dto/reject-change-request.dto.ts` | 거부 DTO |
| `dto/apply-candidate.dto.ts` | 후보자 신청 DTO |
| `dto/index.ts` | DTO export |
| `index.ts` | 모듈 export |

### Documents Module (src/documents/) - 9 files
| File | Description |
|------|-------------|
| `documents.controller.ts` | 문서 컨트롤러 |
| `documents.service.ts` | 문서 서비스 |
| `documents.module.ts` | 문서 모듈 |
| `submissions.controller.ts` | 제출물 컨트롤러 |
| `submissions.service.ts` | 제출물 서비스 |
| `dto/create-document.dto.ts` | 문서 생성 DTO |
| `dto/update-document.dto.ts` | 문서 수정 DTO |
| `dto/submit-submission.dto.ts` | 제출물 제출 DTO |
| `dto/review-submission.dto.ts` | 제출물 검토 DTO |
| `dto/index.ts` | DTO export |
| `index.ts` | 모듈 export |

### Time Summary Module (src/time-summary/) - 6 files
| File | Description |
|------|-------------|
| `me-summary.controller.ts` | 내 요약 컨트롤러 |
| `admin-summary.controller.ts` | 관리자 요약 컨트롤러 |
| `time-summary.service.ts` | 시간 요약 서비스 |
| `time-summary.module.ts` | 시간 요약 모듈 |
| `utils/time.utils.ts` | 시간 계산 유틸리티 |
| `index.ts` | 모듈 export |

### Labor Rules Module (src/labor-rules/) - 6 files
| File | Description |
|------|-------------|
| `labor-rules.controller.ts` | 근로 규칙 컨트롤러 |
| `labor-rules.service.ts` | 근로 규칙 서비스 |
| `labor-rules.module.ts` | 근로 규칙 모듈 |
| `dto/update-labor-rules.dto.ts` | 근로 규칙 수정 DTO |
| `dto/index.ts` | DTO export |
| `index.ts` | 모듈 export |

### Users Module (src/users/) - 3 files
| File | Description |
|------|-------------|
| `users.module.ts` | 사용자 모듈 |
| `users.service.ts` | 사용자 서비스 |
| `index.ts` | 모듈 export |

### Admin Module (src/admin/) - 3 files
| File | Description |
|------|-------------|
| `admin.controller.ts` | 관리자 컨트롤러 |
| `admin.module.ts` | 관리자 모듈 |
| `index.ts` | 모듈 export |

### Common Module (src/common/) - 2 files
| File | Description |
|------|-------------|
| `enums/role.enum.ts` | 역할 열거형 (OWNER, MANAGER, WORKER) |
| `enums/index.ts` | 열거형 export |

### Prisma Module (src/prisma/) - 3 files
| File | Description |
|------|-------------|
| `prisma.service.ts` | Prisma 서비스 |
| `prisma.module.ts` | Prisma 모듈 |
| `index.ts` | 모듈 export |

### Root Files - 2 files
| File | Description |
|------|-------------|
| `app.module.ts` | 루트 모듈 (모든 모듈 통합) |
| `main.ts` | 애플리케이션 진입점 |

## 📁 Prisma Files

| File | Description |
|------|-------------|
| `prisma/schema.prisma` | 데이터베이스 스키마 정의 |
| `prisma/migrations/*.sql` | 마이그레이션 파일들 |

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `DATABASE_SETUP.md` | 데이터베이스 설정 가이드 |
| `TEST_SCENARIOS.md` | 테스트 시나리오 |
| `IMPLEMENTATION_SUMMARY.md` | 구현 요약 |
| `CHANGE_REQUESTS_BACKEND.md` | 변경 요청 백엔드 구현 |
| `CHANGES.md` | 변경 사항 |
| `MIGRATION.md` | 마이그레이션 가이드 |
| `README.md` | 프로젝트 README |
| `RUN.md` | 실행 가이드 |

## ⚙️ Configuration Files

| File | Description |
|------|-------------|
| `nest-cli.json` | NestJS CLI 설정 |
| `package.json` | 의존성 관리 |
| `tsconfig.json` | TypeScript 설정 |
| `package-lock.json` | Lock 파일 |

## 📊 Summary

| Category | Count |
|----------|-------|
| Controllers | ~15 |
| Services | ~15 |
| DTOs | ~20 |
| Guards/Decorators/Interceptors | ~8 |
| Modules | ~12 |
| Prisma Files | 6+ |
| Documentation | 7 |
| Configuration | 4 |
| **Total** | **~87** |

