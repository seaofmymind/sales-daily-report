# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 요구 사항
다음과 같은 기능을 가진 영업 일일 보고 시스템을 만들고자 합니다.

- 영업 사원은 오늘 방문한 고객과 방문 내용을 보고합니다. 고객과 방문 내용은 하루에 여러 행을 추가할 수 있습니다.
- 현재의 과거나 상담(Problem), 내일 할 일(Plan)을 작성하고, 여기에 상급자가 댓글로 의견을 남길 수 있습니다.
- 고객 마스터, 영업 마스터가 존재합니다.

## ER 다이어그램 정의
@doc/ERD.md

## 화면 설계
@doc/SCREEN_DESIGN.md

## API 명세서
@doc/API_SCHEME.md

## 테스트 명세서
@doc/TEST_DEFINITION.md

## 사용 기술
**언어** TypeScript
**프레임워크** Next.js(App Router)
**UI 컴포넌트** shadcn/ui + Tailwind CSS
**API 스키마 정의** OpenAPI(Zod에 의한 검증)
**DB 스키마 정의** Prisma.js
**테스트** Vitest
**배포** Google Cloud Run

---

## 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 실행
npm run start

# 린트
npm run lint

# Prisma: DB 스키마 동기화 (개발)
npx prisma db push

# Prisma: 마이그레이션 생성 및 적용
npx prisma migrate dev --name <migration-name>

# Prisma: 시드 데이터 삽입
npx prisma db seed

# Prisma Studio (DB GUI)
npx prisma studio

# 테스트 전체 실행
npx vitest run

# 테스트 감시 모드
npx vitest

# 단일 테스트 파일 실행
npx vitest run src/path/to/test.test.ts

# 테스트 커버리지
npx vitest run --coverage
```

---

## 아키텍처

### 디렉토리 구조

```
src/
  app/                      # Next.js App Router 페이지 및 API Route
    (auth)/
      login/                # SCR-001 로그인
    (main)/
      dashboard/            # SCR-002 메인 대시보드
      reports/              # SCR-003~005 보고서 목록/작성/상세
        [id]/
          edit/
      master/
        customers/          # SCR-006 고객 마스터
        salespersons/       # SCR-007 영업 사원 마스터
    api/                    # Route Handlers (API 엔드포인트)
      auth/
      reports/
      customers/
      salespersons/
  components/               # 재사용 UI 컴포넌트 (shadcn/ui 기반)
  lib/                      # 유틸리티 및 공유 로직
    prisma.ts               # Prisma 클라이언트 싱글턴
    auth.ts                 # JWT 인증 헬퍼
    zod/                    # Zod 스키마 (요청/응답 검증)
  types/                    # TypeScript 타입 정의
prisma/
  schema.prisma             # DB 스키마 (ERD.md 기준)
  seed.ts                   # 테스트용 시드 데이터
```

### 인증 흐름
- JWT 기반 (accessToken + refreshToken)
- Next.js Middleware에서 보호된 라우트의 토큰 검증
- 역할(role)은 `SALESPERSON` / `MANAGER` / `ADMIN` 세 가지
- MANAGER 여부는 동적 판단: `manager_id`가 현재 사용자 `id`인 하위 사원이 1명 이상 존재하면 MANAGER

### API Route 패턴
- 모든 Route Handler는 `src/app/api/` 아래 위치
- 요청 바디는 Zod 스키마로 파싱·검증 후 처리
- 응답 구조: `{ success, data, error }` (API_SCHEME.md 공통 규약 준수)
- 에러 응답: `{ success: false, data: null, error: { code, message } }`

### 데이터 접근
- Prisma Client를 `src/lib/prisma.ts`에서 싱글턴으로 export
- DB 스키마는 ERD.md의 엔티티 정의를 따름
- 보고서 상태: `DRAFT` | `SUBMITTED` (제출 후 수정 불가)

### 권한 제어 규칙
- `GET /reports`: SALESPERSON은 본인만, MANAGER는 팀 전체(`manager_id = 현재 사용자`), ADMIN은 전체
- 보고서 생성/수정: 당일 날짜 한정, DRAFT 상태만 수정 가능
- 댓글 작성: MANAGER(해당 사원의 직속 상급자) 또는 ADMIN만 가능
- 마스터 데이터(고객, 사원) CRUD: ADMIN 전용
