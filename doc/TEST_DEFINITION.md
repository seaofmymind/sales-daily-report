# 영업 일일 보고 시스템 — 테스트 명세서

> 작성일: 2026-05-06  
> 버전: v1.0

---

## 목차

1. [테스트 개요](#1-테스트-개요)
2. [테스트 환경](#2-테스트-환경)
3. [테스트 데이터](#3-테스트-데이터)
4. [인증 테스트](#4-인증-테스트)
5. [일일 보고서 테스트](#5-일일-보고서-테스트)
6. [방문 기록 테스트](#6-방문-기록-테스트)
7. [Problem / Plan 테스트](#7-problem--plan-테스트)
8. [댓글 테스트](#8-댓글-테스트)
9. [고객 마스터 테스트](#9-고객-마스터-테스트)
10. [영업 사원 마스터 테스트](#10-영업-사원-마스터-테스트)
11. [권한 / 보안 테스트](#11-권한--보안-테스트)
12. [화면(UI) 테스트](#12-화면ui-테스트)
13. [테스트 결과 요약표](#13-테스트-결과-요약표)

---

## 1. 테스트 개요

### 1.1 목적

영업 일일 보고 시스템의 기능 요구사항, API 동작, 권한 제어, 화면 흐름이 설계 명세와 일치하는지 검증한다.

### 1.2 테스트 범위

| 구분 | 범위 | 제외 |
|---|---|---|
| 기능 테스트 | 인증, 보고서 CRUD, 방문 기록, Problem/Plan, 댓글, 마스터 관리 | 성능·부하 테스트 |
| API 테스트 | 정상 응답, 오류 응답, HTTP 상태코드, 응답 필드 검증 | 외부 연동 |
| 권한 테스트 | 역할별 접근 허용 / 차단 | - |
| UI 테스트 | 화면 흐름, 유효성 메시지, 조건부 렌더링 | 크로스 브라우저 |

### 1.3 판정 기준

| 등급 | 기준 |
|---|---|
| **Pass** | 기대 결과와 실제 결과가 일치 |
| **Fail** | 기대 결과와 실제 결과가 불일치 |
| **N/A** | 해당 환경에서 테스트 불가 |

### 1.4 테스트 ID 규칙

```
TC-{영역코드}-{번호}

영역 코드
  AUTH  : 인증
  RPT   : 일일 보고서
  VISIT : 방문 기록
  NOTE  : Problem / Plan
  CMT   : 댓글
  CUST  : 고객 마스터
  SP    : 영업 사원 마스터
  AUTH2 : 권한 / 보안
  UI    : 화면
```

---

## 2. 테스트 환경

| 항목 | 내용 |
|---|---|
| API Base URL | `https://api-test.example.com/v1` |
| 프론트엔드 URL | `https://test.example.com` |
| DB | 테스트 전용 DB (운영 DB와 분리) |
| 브라우저 | Chrome 최신 버전 |
| API 테스트 도구 | Postman / curl |
| 인증 방식 | Bearer Token (JWT) |

---

## 3. 테스트 데이터

테스트 시작 전 아래 데이터가 DB에 준비되어 있어야 한다.

### 사용자 계정

| ID | 이름 | 역할 | 이메일 | 비밀번호 | 상급자 |
|---|---|---|---|---|---|
| 1 | 홍길동 | SALESPERSON | hong@test.com | Test1234! | 이부장(ID: 5) |
| 2 | 김영업 | SALESPERSON | kim@test.com | Test1234! | 이부장(ID: 5) |
| 5 | 이부장 | MANAGER | lee@test.com | Test1234! | - |
| 9 | 관리자 | ADMIN | admin@test.com | Test1234! | - |

### 고객 마스터

| ID | 고객명 | 회사명 |
|---|---|---|
| 10 | 김철수 | (주)ABC |
| 11 | 박영희 | (주)DEF |

### 기존 보고서 (참조용)

| ID | 작성자 | 보고 날짜 | 상태 |
|---|---|---|---|
| 100 | 홍길동 | 2026-05-05 (어제) | SUBMITTED |
| 101 | 홍길동 | 2026-05-04 | SUBMITTED |
| 102 | 김영업 | 2026-05-05 | SUBMITTED |

---

## 4. 인증 테스트

### TC-AUTH-001 정상 로그인

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH-001 |
| **테스트 항목** | 유효한 이메일/비밀번호로 로그인 성공 |
| **사전 조건** | 홍길동 계정이 DB에 존재 |
| **테스트 절차** | `POST /auth/login` `{ "email": "hong@test.com", "password": "Test1234!" }` |
| **기대 결과** | HTTP 200, `accessToken` / `refreshToken` / 사용자 정보 반환 |
| **판정** | Pass / Fail |

---

### TC-AUTH-002 잘못된 비밀번호로 로그인 실패

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH-002 |
| **테스트 항목** | 틀린 비밀번호 입력 시 인증 실패 |
| **사전 조건** | 홍길동 계정 존재 |
| **테스트 절차** | `POST /auth/login` `{ "email": "hong@test.com", "password": "wrong" }` |
| **기대 결과** | HTTP 401, `error.code = "INVALID_CREDENTIALS"` |
| **판정** | Pass / Fail |

---

### TC-AUTH-003 존재하지 않는 이메일 로그인 실패

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH-003 |
| **테스트 항목** | 미등록 이메일로 로그인 시 인증 실패 |
| **테스트 절차** | `POST /auth/login` `{ "email": "nobody@test.com", "password": "Test1234!" }` |
| **기대 결과** | HTTP 401, `error.code = "INVALID_CREDENTIALS"` |
| **판정** | Pass / Fail |

---

### TC-AUTH-004 필수 항목 누락 시 유효성 오류

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH-004 |
| **테스트 항목** | 비밀번호 미입력 시 오류 |
| **테스트 절차** | `POST /auth/login` `{ "email": "hong@test.com" }` |
| **기대 결과** | HTTP 400, `error.code = "VALIDATION_ERROR"` |
| **판정** | Pass / Fail |

---

### TC-AUTH-005 토큰 갱신 성공

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH-005 |
| **테스트 항목** | 유효한 리프레시 토큰으로 액세스 토큰 갱신 |
| **사전 조건** | TC-AUTH-001 실행 후 `refreshToken` 보유 |
| **테스트 절차** | `POST /auth/refresh` `{ "refreshToken": "{refreshToken}" }` |
| **기대 결과** | HTTP 200, 새 `accessToken` 반환 |
| **판정** | Pass / Fail |

---

### TC-AUTH-006 만료된 리프레시 토큰으로 갱신 실패

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH-006 |
| **테스트 항목** | 만료된 리프레시 토큰 사용 시 오류 |
| **테스트 절차** | `POST /auth/refresh` `{ "refreshToken": "expired_or_invalid_token" }` |
| **기대 결과** | HTTP 401, `error.code = "INVALID_REFRESH_TOKEN"` |
| **판정** | Pass / Fail |

---

### TC-AUTH-007 인증 토큰 없이 API 호출 실패

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH-007 |
| **테스트 항목** | Authorization 헤더 없이 보호된 API 호출 시 인증 오류 |
| **테스트 절차** | `GET /reports` (Authorization 헤더 미포함) |
| **기대 결과** | HTTP 401, `error.code = "UNAUTHORIZED"` |
| **판정** | Pass / Fail |

---

### TC-AUTH-008 로그아웃 후 리프레시 토큰 무효화

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH-008 |
| **테스트 항목** | 로그아웃 이후 기존 리프레시 토큰 사용 불가 |
| **사전 조건** | TC-AUTH-001 실행 후 `refreshToken` 보유 |
| **테스트 절차** | 1. `POST /auth/logout` 호출 2. 동일 `refreshToken`으로 `POST /auth/refresh` 호출 |
| **기대 결과** | 1단계: HTTP 200 / 2단계: HTTP 401 |
| **판정** | Pass / Fail |

---

## 5. 일일 보고서 테스트

### TC-RPT-001 보고서 목록 조회 — 영업 사원 본인 보고서만 조회

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-001 |
| **테스트 항목** | SALESPERSON은 본인 보고서만 목록에 반환됨 |
| **사전 조건** | 홍길동(ID:1) 로그인. 보고서 ID:100, 101 존재 |
| **테스트 절차** | `GET /reports` (홍길동 토큰) |
| **기대 결과** | 반환 목록에 `salesperson.id = 1`인 보고서만 포함. 김영업 보고서(ID:102) 미포함 |
| **판정** | Pass / Fail |

---

### TC-RPT-002 보고서 목록 조회 — 상급자 팀 전체 조회

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-002 |
| **테스트 항목** | MANAGER는 팀원 전체 보고서 조회 가능 |
| **사전 조건** | 이부장(ID:5) 로그인. 홍길동·김영업이 이부장의 팀원 |
| **테스트 절차** | `GET /reports` (이부장 토큰) |
| **기대 결과** | 홍길동·김영업 보고서 모두 반환 |
| **판정** | Pass / Fail |

---

### TC-RPT-003 보고서 목록 조회 — 기간 필터

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-003 |
| **테스트 항목** | `startDate` / `endDate` 파라미터로 기간 필터링 |
| **사전 조건** | 홍길동 보고서 ID:100(05-05), 101(05-04) 존재 |
| **테스트 절차** | `GET /reports?startDate=2026-05-05&endDate=2026-05-05` (홍길동 토큰) |
| **기대 결과** | ID:100만 반환. ID:101 미포함 |
| **판정** | Pass / Fail |

---

### TC-RPT-004 보고서 목록 조회 — 상태 필터

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-004 |
| **테스트 항목** | `status=SUBMITTED` 필터 적용 |
| **테스트 절차** | `GET /reports?status=SUBMITTED` (홍길동 토큰) |
| **기대 결과** | 상태가 `SUBMITTED`인 보고서만 반환 |
| **판정** | Pass / Fail |

---

### TC-RPT-005 보고서 단건 조회 — 정상

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-005 |
| **테스트 항목** | 존재하는 보고서 단건 조회 |
| **사전 조건** | 홍길동 보고서 ID:100 존재 (visitRecords, dailyNotes, comments 포함) |
| **테스트 절차** | `GET /reports/100` (홍길동 토큰) |
| **기대 결과** | HTTP 200. `id`, `visitRecords`, `dailyNotes`, `comments` 모두 포함 |
| **판정** | Pass / Fail |

---

### TC-RPT-006 보고서 단건 조회 — 존재하지 않는 ID

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-006 |
| **테스트 항목** | 없는 보고서 ID 조회 시 404 반환 |
| **테스트 절차** | `GET /reports/99999` (홍길동 토큰) |
| **기대 결과** | HTTP 404, `error.code = "REPORT_NOT_FOUND"` |
| **판정** | Pass / Fail |

---

### TC-RPT-007 보고서 생성 — 정상 (DRAFT)

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-007 |
| **테스트 항목** | 오늘 날짜로 보고서를 DRAFT 상태로 생성 |
| **사전 조건** | 홍길동의 오늘 보고서 없음 |
| **테스트 절차** | `POST /reports` 오늘 날짜(`2026-05-06`), visitRecords 1건, status = `DRAFT` |
| **기대 결과** | HTTP 201, `id` 반환, `status = "DRAFT"` |
| **판정** | Pass / Fail |

---

### TC-RPT-008 보고서 생성 — 당일 중복 생성 실패

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-008 |
| **테스트 항목** | 당일 보고서가 이미 존재할 때 중복 생성 시도 시 오류 |
| **사전 조건** | TC-RPT-007 실행 후 오늘 보고서 존재 |
| **테스트 절차** | `POST /reports` 동일 날짜로 재요청 |
| **기대 결과** | HTTP 409, `error.code = "REPORT_ALREADY_EXISTS"` |
| **판정** | Pass / Fail |

---

### TC-RPT-009 보고서 생성 — 오늘 날짜가 아닌 경우 실패

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-009 |
| **테스트 항목** | 과거 날짜로 보고서 생성 시도 시 오류 |
| **테스트 절차** | `POST /reports` `{ "reportDate": "2026-05-01", ... }` |
| **기대 결과** | HTTP 400, `error.code = "INVALID_REPORT_DATE"` |
| **판정** | Pass / Fail |

---

### TC-RPT-010 보고서 생성 — visitRecords 0건 시 유효성 오류

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-010 |
| **테스트 항목** | 방문 기록 없이 보고서 생성 시도 시 오류 |
| **테스트 절차** | `POST /reports` `{ ..., "visitRecords": [] }` |
| **기대 결과** | HTTP 400, `error.code = "VALIDATION_ERROR"` |
| **판정** | Pass / Fail |

---

### TC-RPT-011 보고서 수정 — DRAFT 상태 정상 수정

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-011 |
| **테스트 항목** | DRAFT 보고서의 방문 내용 수정 |
| **사전 조건** | TC-RPT-007으로 생성된 DRAFT 보고서 ID 보유 |
| **테스트 절차** | `PUT /reports/{id}` 방문 내용 변경 |
| **기대 결과** | HTTP 200, `updatedAt` 갱신 |
| **판정** | Pass / Fail |

---

### TC-RPT-012 보고서 수정 — SUBMITTED 상태 수정 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-012 |
| **테스트 항목** | 제출된 보고서 수정 시도 시 오류 |
| **사전 조건** | 보고서 ID:100 (SUBMITTED 상태) |
| **테스트 절차** | `PUT /reports/100` 방문 내용 변경 시도 |
| **기대 결과** | HTTP 403, `error.code = "REPORT_ALREADY_SUBMITTED"` |
| **판정** | Pass / Fail |

---

### TC-RPT-013 보고서 제출 — 정상 제출

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-013 |
| **테스트 항목** | DRAFT → SUBMITTED 상태 전환 |
| **사전 조건** | TC-RPT-007으로 생성된 DRAFT 보고서 ID 보유 |
| **테스트 절차** | `PATCH /reports/{id}/submit` |
| **기대 결과** | HTTP 200, `status = "SUBMITTED"` |
| **판정** | Pass / Fail |

---

### TC-RPT-014 보고서 제출 — 이미 제출된 보고서 재제출 실패

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-RPT-014 |
| **테스트 항목** | SUBMITTED 보고서 재제출 시 오류 |
| **사전 조건** | TC-RPT-013 실행 후 SUBMITTED 상태 |
| **테스트 절차** | `PATCH /reports/{id}/submit` 재호출 |
| **기대 결과** | HTTP 409, `error.code = "REPORT_ALREADY_SUBMITTED"` |
| **판정** | Pass / Fail |

---

## 6. 방문 기록 테스트

### TC-VISIT-001 방문 기록 추가 — 정상

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-VISIT-001 |
| **테스트 항목** | DRAFT 보고서에 방문 기록 1건 추가 |
| **사전 조건** | TC-RPT-007으로 생성된 DRAFT 보고서 (방문 기록 1건 포함) |
| **테스트 절차** | `POST /reports/{id}/visit-records` `{ "seq": 2, "customerId": 11, "visitTime": "14:00", "content": "계약 갱신 협의", "result": "" }` |
| **기대 결과** | HTTP 201, 새 방문 기록 `id` 반환 |
| **판정** | Pass / Fail |

---

### TC-VISIT-002 방문 기록 추가 — SUBMITTED 보고서 추가 실패

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-VISIT-002 |
| **테스트 항목** | 제출된 보고서에 방문 기록 추가 시도 시 오류 |
| **사전 조건** | 보고서 ID:100 (SUBMITTED) |
| **테스트 절차** | `POST /reports/100/visit-records` |
| **기대 결과** | HTTP 403, `error.code = "REPORT_ALREADY_SUBMITTED"` |
| **판정** | Pass / Fail |

---

### TC-VISIT-003 방문 기록 추가 — 존재하지 않는 고객 ID

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-VISIT-003 |
| **테스트 항목** | 없는 customerId로 방문 기록 추가 시 오류 |
| **테스트 절차** | `POST /reports/{id}/visit-records` `{ "customerId": 99999, ... }` |
| **기대 결과** | HTTP 400, `error.code = "VALIDATION_ERROR"` 또는 `CUSTOMER_NOT_FOUND` |
| **판정** | Pass / Fail |

---

### TC-VISIT-004 방문 기록 추가 — content 누락 시 유효성 오류

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-VISIT-004 |
| **테스트 항목** | 필수 항목(content) 누락 시 오류 |
| **테스트 절차** | `POST /reports/{id}/visit-records` `{ "seq": 2, "customerId": 11 }` |
| **기대 결과** | HTTP 400, `error.code = "VALIDATION_ERROR"` |
| **판정** | Pass / Fail |

---

### TC-VISIT-005 방문 기록 수정 — 정상

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-VISIT-005 |
| **테스트 항목** | DRAFT 보고서의 방문 기록 내용 수정 |
| **사전 조건** | TC-VISIT-001 실행 후 방문 기록 ID 보유 |
| **테스트 절차** | `PUT /reports/{id}/visit-records/{vId}` content 변경 |
| **기대 결과** | HTTP 200, 변경된 내용 반환 |
| **판정** | Pass / Fail |

---

### TC-VISIT-006 방문 기록 삭제 — 정상

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-VISIT-006 |
| **테스트 항목** | DRAFT 보고서에서 방문 기록 1건 삭제 |
| **사전 조건** | TC-VISIT-001 실행 후 방문 기록 2건 존재 |
| **테스트 절차** | `DELETE /reports/{id}/visit-records/{vId}` (2번째 행 삭제) |
| **기대 결과** | HTTP 200, 1건만 남음 |
| **판정** | Pass / Fail |

---

### TC-VISIT-007 방문 기록 삭제 — 마지막 1건 삭제 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-VISIT-007 |
| **테스트 항목** | 방문 기록이 1건뿐일 때 삭제 시도 시 오류 |
| **사전 조건** | DRAFT 보고서에 방문 기록 1건만 존재 |
| **테스트 절차** | `DELETE /reports/{id}/visit-records/{vId}` |
| **기대 결과** | HTTP 409, `error.code = "MINIMUM_VISIT_RECORD"` |
| **판정** | Pass / Fail |

---

## 7. Problem / Plan 테스트

### TC-NOTE-001 Problem 항목 추가 — 정상

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-NOTE-001 |
| **테스트 항목** | DRAFT 보고서에 Problem 항목 추가 |
| **사전 조건** | DRAFT 보고서 존재 |
| **테스트 절차** | `POST /reports/{id}/notes` `{ "noteType": "PROBLEM", "seq": 1, "content": "ABC사 계약 지연 문제" }` |
| **기대 결과** | HTTP 201, `noteType = "PROBLEM"`, `comments = []` |
| **판정** | Pass / Fail |

---

### TC-NOTE-002 Plan 항목 추가 — 정상

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-NOTE-002 |
| **테스트 항목** | DRAFT 보고서에 Plan 항목 추가 |
| **테스트 절차** | `POST /reports/{id}/notes` `{ "noteType": "PLAN", "seq": 1, "content": "내일 DEF사 방문" }` |
| **기대 결과** | HTTP 201, `noteType = "PLAN"` |
| **판정** | Pass / Fail |

---

### TC-NOTE-003 Problem / Plan 여러 건 추가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-NOTE-003 |
| **테스트 항목** | 동일 보고서에 Problem 2건, Plan 2건 추가 가능 |
| **사전 조건** | DRAFT 보고서 존재 |
| **테스트 절차** | `POST /reports/{id}/notes` 4회 호출 (PROBLEM×2, PLAN×2) |
| **기대 결과** | 4건 모두 HTTP 201 반환 |
| **판정** | Pass / Fail |

---

### TC-NOTE-004 유효하지 않은 noteType 입력

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-NOTE-004 |
| **테스트 항목** | `PROBLEM` / `PLAN` 이외의 값 입력 시 오류 |
| **테스트 절차** | `POST /reports/{id}/notes` `{ "noteType": "TODO", ... }` |
| **기대 결과** | HTTP 400, `error.code = "INVALID_NOTE_TYPE"` 또는 `VALIDATION_ERROR` |
| **판정** | Pass / Fail |

---

### TC-NOTE-005 항목 수정 — noteType 변경 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-NOTE-005 |
| **테스트 항목** | 수정 API에서 noteType 변경 시도 시 기존 값 유지 |
| **사전 조건** | TC-NOTE-001 실행 후 PROBLEM 항목 존재 |
| **테스트 절차** | `PUT /reports/{id}/notes/{nId}` `{ "noteType": "PLAN", "content": "수정 내용" }` |
| **기대 결과** | HTTP 200, `noteType`은 여전히 `"PROBLEM"` |
| **판정** | Pass / Fail |

---

### TC-NOTE-006 항목 삭제 — 정상

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-NOTE-006 |
| **테스트 항목** | DRAFT 보고서의 Note 항목 삭제 |
| **사전 조건** | TC-NOTE-001 실행 후 PROBLEM 항목 존재 |
| **테스트 절차** | `DELETE /reports/{id}/notes/{nId}` |
| **기대 결과** | HTTP 200. 이후 보고서 단건 조회 시 해당 항목 미포함 |
| **판정** | Pass / Fail |

---

### TC-NOTE-007 SUBMITTED 보고서의 항목 수정 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-NOTE-007 |
| **테스트 항목** | 제출된 보고서의 Note 항목 수정 시도 시 오류 |
| **사전 조건** | 보고서 ID:100 (SUBMITTED), Note 항목 존재 |
| **테스트 절차** | `PUT /reports/100/notes/{nId}` |
| **기대 결과** | HTTP 403, `error.code = "REPORT_ALREADY_SUBMITTED"` |
| **판정** | Pass / Fail |

---

## 8. 댓글 테스트

### TC-CMT-001 댓글 작성 — 상급자 정상 작성

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CMT-001 |
| **테스트 항목** | MANAGER가 팀원 보고서의 Note에 댓글 작성 |
| **사전 조건** | 이부장(MANAGER) 로그인. 홍길동 보고서 Note 항목 존재 |
| **테스트 절차** | `POST /reports/100/notes/{nId}/comments` `{ "content": "확인 요청 바랍니다." }` (이부장 토큰) |
| **기대 결과** | HTTP 201, `commenter.id = 5`, 댓글 내용 반환 |
| **판정** | Pass / Fail |

---

### TC-CMT-002 댓글 작성 — 영업 사원 작성 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CMT-002 |
| **테스트 항목** | SALESPERSON이 댓글 작성 시도 시 오류 |
| **사전 조건** | 홍길동(SALESPERSON) 로그인 |
| **테스트 절차** | `POST /reports/100/notes/{nId}/comments` (홍길동 토큰) |
| **기대 결과** | HTTP 403, `error.code = "FORBIDDEN"` |
| **판정** | Pass / Fail |

---

### TC-CMT-003 댓글 작성 — 타 팀 상급자 작성 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CMT-003 |
| **테스트 항목** | 팀원 관계가 없는 상급자가 댓글 작성 시도 시 오류 |
| **사전 조건** | 다른 팀 상급자 계정 존재 (홍길동의 manager_id와 다름) |
| **테스트 절차** | `POST /reports/100/notes/{nId}/comments` (타 팀 상급자 토큰) |
| **기대 결과** | HTTP 403, `error.code = "FORBIDDEN"` |
| **판정** | Pass / Fail |

---

### TC-CMT-004 댓글 작성 — content 빈 문자열 유효성 오류

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CMT-004 |
| **테스트 항목** | 빈 댓글 작성 시 유효성 오류 |
| **사전 조건** | 이부장 로그인 |
| **테스트 절차** | `POST /reports/100/notes/{nId}/comments` `{ "content": "" }` |
| **기대 결과** | HTTP 400, `error.code = "VALIDATION_ERROR"` |
| **판정** | Pass / Fail |

---

### TC-CMT-005 댓글 수정 — 작성자 본인 정상 수정

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CMT-005 |
| **테스트 항목** | 댓글 작성자가 본인 댓글 수정 |
| **사전 조건** | TC-CMT-001 실행 후 댓글 ID 보유 |
| **테스트 절차** | `PUT /reports/100/notes/{nId}/comments/{cId}` `{ "content": "수정된 댓글" }` (이부장 토큰) |
| **기대 결과** | HTTP 200, 변경된 내용 및 `updatedAt` 반환 |
| **판정** | Pass / Fail |

---

### TC-CMT-006 댓글 수정 — 타인 댓글 수정 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CMT-006 |
| **테스트 항목** | 타인이 작성한 댓글 수정 시도 시 오류 |
| **사전 조건** | 이부장이 작성한 댓글. ADMIN 이외 다른 계정으로 시도 |
| **테스트 절차** | `PUT /reports/100/notes/{nId}/comments/{cId}` (다른 상급자 토큰) |
| **기대 결과** | HTTP 403, `error.code = "FORBIDDEN"` |
| **판정** | Pass / Fail |

---

### TC-CMT-007 댓글 삭제 — 작성자 본인 삭제

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CMT-007 |
| **테스트 항목** | 댓글 작성자 본인이 댓글 삭제 |
| **사전 조건** | TC-CMT-001 실행 후 댓글 ID 보유 |
| **테스트 절차** | `DELETE /reports/100/notes/{nId}/comments/{cId}` (이부장 토큰) |
| **기대 결과** | HTTP 200. 이후 보고서 조회 시 해당 댓글 미포함 |
| **판정** | Pass / Fail |

---

### TC-CMT-008 댓글 삭제 — ADMIN에 의한 삭제

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CMT-008 |
| **테스트 항목** | ADMIN이 타인 댓글 삭제 가능 |
| **사전 조건** | TC-CMT-001 실행 후 댓글 ID 보유. ADMIN 로그인 |
| **테스트 절차** | `DELETE /reports/100/notes/{nId}/comments/{cId}` (ADMIN 토큰) |
| **기대 결과** | HTTP 200 |
| **판정** | Pass / Fail |

---

## 9. 고객 마스터 테스트

### TC-CUST-001 고객 목록 조회 — 키워드 검색

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CUST-001 |
| **테스트 항목** | 고객명 키워드 부분 일치 검색 |
| **테스트 절차** | `GET /customers?keyword=ABC` (홍길동 토큰) |
| **기대 결과** | 회사명 또는 고객명에 "ABC"가 포함된 고객만 반환 |
| **판정** | Pass / Fail |

---

### TC-CUST-002 고객 등록 — 정상

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CUST-002 |
| **테스트 항목** | ADMIN이 신규 고객 등록 |
| **사전 조건** | ADMIN 로그인 |
| **테스트 절차** | `POST /customers` `{ "name": "이테스트", "company": "(주)테스트", "email": "test@test.com" }` |
| **기대 결과** | HTTP 201, 새 고객 `id` 반환 |
| **판정** | Pass / Fail |

---

### TC-CUST-003 고객 등록 — 필수 항목 누락

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CUST-003 |
| **테스트 항목** | 고객명(name) 누락 시 유효성 오류 |
| **테스트 절차** | `POST /customers` `{ "company": "(주)테스트" }` |
| **기대 결과** | HTTP 400, `error.code = "VALIDATION_ERROR"` |
| **판정** | Pass / Fail |

---

### TC-CUST-004 고객 등록 — 이메일 형식 오류

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CUST-004 |
| **테스트 항목** | 이메일 형식이 아닌 값 입력 시 유효성 오류 |
| **테스트 절차** | `POST /customers` `{ "name": "이테스트", "company": "(주)테스트", "email": "not-an-email" }` |
| **기대 결과** | HTTP 400, `error.code = "VALIDATION_ERROR"` |
| **판정** | Pass / Fail |

---

### TC-CUST-005 고객 등록 — SALESPERSON 접근 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CUST-005 |
| **테스트 항목** | SALESPERSON이 고객 등록 시도 시 권한 오류 |
| **사전 조건** | 홍길동 로그인 |
| **테스트 절차** | `POST /customers` (홍길동 토큰) |
| **기대 결과** | HTTP 403, `error.code = "FORBIDDEN"` |
| **판정** | Pass / Fail |

---

### TC-CUST-006 고객 수정 — 정상

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CUST-006 |
| **테스트 항목** | ADMIN이 고객 정보 수정 |
| **사전 조건** | TC-CUST-002로 등록된 고객 ID 보유 |
| **테스트 절차** | `PUT /customers/{id}` phone 변경 |
| **기대 결과** | HTTP 200, `updatedAt` 갱신 |
| **판정** | Pass / Fail |

---

### TC-CUST-007 고객 수정 — 존재하지 않는 ID

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-CUST-007 |
| **테스트 항목** | 없는 고객 ID 수정 시도 시 404 |
| **테스트 절차** | `PUT /customers/99999` |
| **기대 결과** | HTTP 404, `error.code = "CUSTOMER_NOT_FOUND"` |
| **판정** | Pass / Fail |

---

## 10. 영업 사원 마스터 테스트

### TC-SP-001 사원 등록 — 정상

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-SP-001 |
| **테스트 항목** | ADMIN이 신규 영업 사원 등록 |
| **사전 조건** | ADMIN 로그인 |
| **테스트 절차** | `POST /salespersons` `{ "name": "신규사원", "department": "영업3팀", "position": "사원", "email": "new@test.com", "managerId": 5 }` |
| **기대 결과** | HTTP 201, 새 사원 `id` 반환 |
| **판정** | Pass / Fail |

---

### TC-SP-002 사원 등록 — 이메일 중복

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-SP-002 |
| **테스트 항목** | 이미 등록된 이메일로 사원 등록 시 오류 |
| **테스트 절차** | `POST /salespersons` `{ ..., "email": "hong@test.com" }` |
| **기대 결과** | HTTP 409, `error.code = "EMAIL_ALREADY_EXISTS"` |
| **판정** | Pass / Fail |

---

### TC-SP-003 사원 등록 — 자기 자신을 상급자로 지정 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-SP-003 |
| **테스트 항목** | `managerId`를 본인 ID로 설정 시 오류 |
| **사전 조건** | TC-SP-001로 등록된 사원 ID 보유 |
| **테스트 절차** | `PUT /salespersons/{id}` `{ ..., "managerId": {id} }` (본인 ID) |
| **기대 결과** | HTTP 400, `error.code = "SELF_MANAGER_REFERENCE"` |
| **판정** | Pass / Fail |

---

### TC-SP-004 사원 수정 — 순환 상급자 참조 방지

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-SP-004 |
| **테스트 항목** | A의 상급자가 B, B의 상급자를 A로 설정 시 순환 참조 오류 |
| **사전 조건** | 사원 A(ID:1), 사원 B(ID:5). B가 A의 상급자로 설정되어 있음 |
| **테스트 절차** | `PUT /salespersons/5` `{ ..., "managerId": 1 }` (B의 상급자를 A로 변경) |
| **기대 결과** | HTTP 400, `error.code = "CIRCULAR_MANAGER_REFERENCE"` |
| **판정** | Pass / Fail |

---

### TC-SP-005 사원 수정 — 이메일 변경 중복 검사

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-SP-005 |
| **테스트 항목** | 다른 사원이 사용 중인 이메일로 변경 시 오류 |
| **테스트 절차** | `PUT /salespersons/{id}` `{ ..., "email": "kim@test.com" }` |
| **기대 결과** | HTTP 409, `error.code = "EMAIL_ALREADY_EXISTS"` |
| **판정** | Pass / Fail |

---

### TC-SP-006 사원 마스터 — SALESPERSON 접근 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-SP-006 |
| **테스트 항목** | SALESPERSON이 사원 등록 시도 시 권한 오류 |
| **테스트 절차** | `POST /salespersons` (홍길동 토큰) |
| **기대 결과** | HTTP 403, `error.code = "FORBIDDEN"` |
| **판정** | Pass / Fail |

---

## 11. 권한 / 보안 테스트

### TC-AUTH2-001 영업 사원이 타인 보고서 조회 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH2-001 |
| **테스트 항목** | 홍길동이 김영업의 보고서(ID:102) 단건 조회 시 권한 오류 |
| **사전 조건** | 홍길동 로그인. 김영업 보고서 ID:102 존재 |
| **테스트 절차** | `GET /reports/102` (홍길동 토큰) |
| **기대 결과** | HTTP 403, `error.code = "FORBIDDEN"` |
| **판정** | Pass / Fail |

---

### TC-AUTH2-002 영업 사원이 타인 보고서 수정 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH2-002 |
| **테스트 항목** | 홍길동이 김영업의 DRAFT 보고서 수정 시도 시 권한 오류 |
| **테스트 절차** | `PUT /reports/{김영업 DRAFT 보고서 ID}` (홍길동 토큰) |
| **기대 결과** | HTTP 403, `error.code = "FORBIDDEN"` |
| **판정** | Pass / Fail |

---

### TC-AUTH2-003 상급자가 팀원 외 보고서 조회 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH2-003 |
| **테스트 항목** | 이부장이 자신의 팀원이 아닌 사원의 보고서 조회 시 권한 오류 |
| **사전 조건** | 다른 팀 사원 보고서 존재 |
| **테스트 절차** | `GET /reports/{타팀 사원 보고서 ID}` (이부장 토큰) |
| **기대 결과** | HTTP 403, `error.code = "FORBIDDEN"` |
| **판정** | Pass / Fail |

---

### TC-AUTH2-004 ADMIN이 전체 보고서 조회 가능

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH2-004 |
| **테스트 항목** | ADMIN은 모든 보고서 조회 가능 |
| **사전 조건** | ADMIN 로그인 |
| **테스트 절차** | `GET /reports` (ADMIN 토큰). `GET /reports/100`, `GET /reports/102` |
| **기대 결과** | 모두 HTTP 200 반환 |
| **판정** | Pass / Fail |

---

### TC-AUTH2-005 만료된 액세스 토큰으로 API 호출 실패

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH2-005 |
| **테스트 항목** | 만료된 액세스 토큰 사용 시 인증 오류 |
| **테스트 절차** | 만료된 JWT를 Authorization 헤더에 담아 `GET /reports` 호출 |
| **기대 결과** | HTTP 401, `error.code = "UNAUTHORIZED"` |
| **판정** | Pass / Fail |

---

### TC-AUTH2-006 위조된 토큰으로 API 호출 실패

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH2-006 |
| **테스트 항목** | 서명이 올바르지 않은 JWT 사용 시 인증 오류 |
| **테스트 절차** | JWT payload를 임의로 수정(서명 불일치)하여 `GET /reports` 호출 |
| **기대 결과** | HTTP 401, `error.code = "UNAUTHORIZED"` |
| **판정** | Pass / Fail |

---

### TC-AUTH2-007 salespersonId 필터 — SALESPERSON 무시 처리

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-AUTH2-007 |
| **테스트 항목** | SALESPERSON이 `salespersonId` 파라미터로 타인 보고서 조회 시도 시 본인 보고서만 반환 |
| **테스트 절차** | `GET /reports?salespersonId=2` (홍길동 토큰, ID:2는 김영업) |
| **기대 결과** | 홍길동 본인 보고서만 반환 (salespersonId 파라미터 무시) |
| **판정** | Pass / Fail |

---

## 12. 화면(UI) 테스트

### TC-UI-001 로그인 화면 — 빈 폼 제출 시 유효성 메시지 표시

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-001 |
| **테스트 항목** | 이메일/비밀번호 미입력 후 로그인 버튼 클릭 |
| **테스트 절차** | 1. `/login` 접속 2. 아무 입력 없이 로그인 버튼 클릭 |
| **기대 결과** | 필수 입력 필드에 유효성 오류 메시지 표시. API 호출 없음 |
| **판정** | Pass / Fail |

---

### TC-UI-002 보고서 작성 — 방문 기록 행 추가 / 삭제

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-002 |
| **테스트 항목** | 방문 기록 행 추가 및 삭제 버튼 동작 |
| **테스트 절차** | 1. `/reports/new` 접속 2. `행 추가` 클릭 3번 3. 마지막 행 `삭제` 클릭 |
| **기대 결과** | 2단계: 행이 3개로 증가 / 3단계: 행이 2개로 감소 |
| **판정** | Pass / Fail |

---

### TC-UI-003 보고서 작성 — 마지막 방문 기록 행 삭제 불가

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-003 |
| **테스트 항목** | 방문 기록 1행만 남았을 때 삭제 버튼 비활성화 |
| **테스트 절차** | 1. `/reports/new` 접속 (기본 1행) 2. 삭제 버튼 상태 확인 |
| **기대 결과** | 삭제 버튼 `disabled` 처리되어 클릭 불가 |
| **판정** | Pass / Fail |

---

### TC-UI-004 보고서 작성 — 고객명 자동완성

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-004 |
| **테스트 항목** | 고객명 입력창에 2글자 이상 입력 시 자동완성 팝업 표시 |
| **테스트 절차** | 1. 방문 기록의 고객명 입력창에 "ABC" 입력 |
| **기대 결과** | "ABC"가 포함된 고객 목록 팝업 표시. 항목 선택 시 `customerId` 자동 바인딩 |
| **판정** | Pass / Fail |

---

### TC-UI-005 보고서 작성 — 제출 전 확인 모달 표시

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-005 |
| **테스트 항목** | 제출 버튼 클릭 시 확인 모달 표시 후 확인 시 제출 진행 |
| **테스트 절차** | 1. 보고서 입력 완료 2. 제출 버튼 클릭 3. 확인 모달에서 "확인" 클릭 |
| **기대 결과** | 2단계: 모달 표시 / 3단계: 제출 API 호출 → SCR-005로 이동 |
| **판정** | Pass / Fail |

---

### TC-UI-006 보고서 작성 — 제출 모달 취소 시 이동 없음

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-006 |
| **테스트 항목** | 제출 확인 모달에서 "취소" 클릭 시 화면 유지 |
| **테스트 절차** | 1. 제출 버튼 클릭 2. 모달에서 "취소" 클릭 |
| **기대 결과** | 모달 닫힘. 보고서 작성 화면 유지. API 호출 없음 |
| **판정** | Pass / Fail |

---

### TC-UI-007 보고서 상세 — 댓글 입력창 조건부 표시

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-007 |
| **테스트 항목** | 역할에 따라 댓글 입력창 표시/숨김 |
| **테스트 절차** | 1. 홍길동(SALESPERSON)으로 로그인 → `/reports/100` 접속 2. 이부장(MANAGER)으로 로그인 → 동일 페이지 접속 |
| **기대 결과** | 1: 댓글 입력창 미표시 / 2: 댓글 입력창 표시 |
| **판정** | Pass / Fail |

---

### TC-UI-008 보고서 상세 — SUBMITTED 상태에서 편집 버튼 미표시

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-008 |
| **테스트 항목** | 제출된 보고서 조회 시 편집 버튼 미표시 |
| **테스트 절차** | 홍길동으로 `/reports/100` (SUBMITTED) 접속 |
| **기대 결과** | 편집 버튼 미표시 |
| **판정** | Pass / Fail |

---

### TC-UI-009 보고서 상세 — DRAFT 상태에서 편집 버튼 표시

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-009 |
| **테스트 항목** | DRAFT 보고서 조회 시 편집 버튼 표시 |
| **사전 조건** | TC-RPT-007로 생성된 DRAFT 보고서 |
| **테스트 절차** | 홍길동으로 DRAFT 보고서 상세 접속 |
| **기대 결과** | 편집 버튼 표시. 클릭 시 SCR-004(편집)으로 이동 |
| **판정** | Pass / Fail |

---

### TC-UI-010 보고서 작성 — 미저장 상태 이탈 경고

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-010 |
| **테스트 항목** | 임시저장 없이 페이지 이탈 시 경고 다이얼로그 표시 |
| **테스트 절차** | 1. 보고서 작성 화면에서 내용 입력 2. 브라우저 뒤로가기 클릭 |
| **기대 결과** | "저장하지 않고 나가시겠습니까?" 브라우저 confirm 다이얼로그 표시 |
| **판정** | Pass / Fail |

---

### TC-UI-011 대시보드 — 오늘 보고서 없을 때 "작성하기" 버튼

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-011 |
| **테스트 항목** | 오늘 보고서 미작성 시 대시보드 버튼 레이블 확인 |
| **사전 조건** | 홍길동의 오늘 보고서 없음 |
| **테스트 절차** | 홍길동으로 `/dashboard` 접속 |
| **기대 결과** | 버튼 레이블 "작성하기" 표시. 클릭 시 SCR-004로 이동 |
| **판정** | Pass / Fail |

---

### TC-UI-012 대시보드 — DRAFT 보고서 있을 때 "이어서 작성" 버튼

| 항목 | 내용 |
|---|---|
| **테스트 ID** | TC-UI-012 |
| **테스트 항목** | 오늘 DRAFT 보고서 존재 시 버튼 레이블 변경 확인 |
| **사전 조건** | TC-RPT-007 실행 후 DRAFT 보고서 존재 |
| **테스트 절차** | 홍길동으로 `/dashboard` 접속 |
| **기대 결과** | 버튼 레이블 "이어서 작성" 표시 |
| **판정** | Pass / Fail |

---

## 13. 테스트 결과 요약표

| 테스트 ID | 테스트 항목 | 결과 | 비고 |
|---|---|---|---|
| TC-AUTH-001 | 정상 로그인 | | |
| TC-AUTH-002 | 잘못된 비밀번호 로그인 실패 | | |
| TC-AUTH-003 | 미등록 이메일 로그인 실패 | | |
| TC-AUTH-004 | 필수 항목 누락 유효성 오류 | | |
| TC-AUTH-005 | 토큰 갱신 성공 | | |
| TC-AUTH-006 | 만료 리프레시 토큰 갱신 실패 | | |
| TC-AUTH-007 | 인증 토큰 없이 API 호출 실패 | | |
| TC-AUTH-008 | 로그아웃 후 토큰 무효화 | | |
| TC-RPT-001 | 보고서 목록 — 본인 보고서만 조회 | | |
| TC-RPT-002 | 보고서 목록 — 상급자 팀 전체 조회 | | |
| TC-RPT-003 | 보고서 목록 — 기간 필터 | | |
| TC-RPT-004 | 보고서 목록 — 상태 필터 | | |
| TC-RPT-005 | 보고서 단건 조회 정상 | | |
| TC-RPT-006 | 보고서 단건 조회 — 없는 ID | | |
| TC-RPT-007 | 보고서 생성 DRAFT | | |
| TC-RPT-008 | 보고서 생성 — 당일 중복 실패 | | |
| TC-RPT-009 | 보고서 생성 — 오늘 날짜 아님 실패 | | |
| TC-RPT-010 | 보고서 생성 — visitRecords 0건 실패 | | |
| TC-RPT-011 | 보고서 수정 DRAFT 정상 | | |
| TC-RPT-012 | 보고서 수정 SUBMITTED 불가 | | |
| TC-RPT-013 | 보고서 제출 정상 | | |
| TC-RPT-014 | 보고서 재제출 실패 | | |
| TC-VISIT-001 | 방문 기록 추가 정상 | | |
| TC-VISIT-002 | 방문 기록 추가 — SUBMITTED 불가 | | |
| TC-VISIT-003 | 방문 기록 — 없는 customerId | | |
| TC-VISIT-004 | 방문 기록 — content 누락 | | |
| TC-VISIT-005 | 방문 기록 수정 정상 | | |
| TC-VISIT-006 | 방문 기록 삭제 정상 | | |
| TC-VISIT-007 | 방문 기록 마지막 1건 삭제 불가 | | |
| TC-NOTE-001 | Problem 추가 정상 | | |
| TC-NOTE-002 | Plan 추가 정상 | | |
| TC-NOTE-003 | Problem/Plan 여러 건 추가 | | |
| TC-NOTE-004 | 유효하지 않은 noteType | | |
| TC-NOTE-005 | noteType 변경 불가 | | |
| TC-NOTE-006 | 항목 삭제 정상 | | |
| TC-NOTE-007 | SUBMITTED 항목 수정 불가 | | |
| TC-CMT-001 | 댓글 작성 — 상급자 정상 | | |
| TC-CMT-002 | 댓글 작성 — 영업 사원 불가 | | |
| TC-CMT-003 | 댓글 작성 — 타 팀 상급자 불가 | | |
| TC-CMT-004 | 댓글 — 빈 content 유효성 오류 | | |
| TC-CMT-005 | 댓글 수정 — 작성자 본인 | | |
| TC-CMT-006 | 댓글 수정 — 타인 불가 | | |
| TC-CMT-007 | 댓글 삭제 — 작성자 본인 | | |
| TC-CMT-008 | 댓글 삭제 — ADMIN 삭제 | | |
| TC-CUST-001 | 고객 목록 키워드 검색 | | |
| TC-CUST-002 | 고객 등록 정상 | | |
| TC-CUST-003 | 고객 등록 — 필수 항목 누락 | | |
| TC-CUST-004 | 고객 등록 — 이메일 형식 오류 | | |
| TC-CUST-005 | 고객 등록 — SALESPERSON 불가 | | |
| TC-CUST-006 | 고객 수정 정상 | | |
| TC-CUST-007 | 고객 수정 — 없는 ID | | |
| TC-SP-001 | 사원 등록 정상 | | |
| TC-SP-002 | 사원 등록 — 이메일 중복 | | |
| TC-SP-003 | 사원 등록 — 자기 참조 불가 | | |
| TC-SP-004 | 사원 수정 — 순환 참조 방지 | | |
| TC-SP-005 | 사원 수정 — 이메일 중복 검사 | | |
| TC-SP-006 | 사원 마스터 — SALESPERSON 불가 | | |
| TC-AUTH2-001 | 타인 보고서 조회 불가 | | |
| TC-AUTH2-002 | 타인 보고서 수정 불가 | | |
| TC-AUTH2-003 | 상급자 팀 외 보고서 조회 불가 | | |
| TC-AUTH2-004 | ADMIN 전체 보고서 조회 | | |
| TC-AUTH2-005 | 만료 토큰 API 호출 실패 | | |
| TC-AUTH2-006 | 위조 토큰 API 호출 실패 | | |
| TC-AUTH2-007 | salespersonId 필터 권한 우회 방지 | | |
| TC-UI-001 | 로그인 — 빈 폼 유효성 메시지 | | |
| TC-UI-002 | 방문 기록 행 추가 / 삭제 | | |
| TC-UI-003 | 방문 기록 마지막 행 삭제 버튼 비활성화 | | |
| TC-UI-004 | 고객명 자동완성 팝업 | | |
| TC-UI-005 | 제출 확인 모달 → 제출 | | |
| TC-UI-006 | 제출 모달 취소 시 화면 유지 | | |
| TC-UI-007 | 댓글 입력창 역할 조건부 표시 | | |
| TC-UI-008 | SUBMITTED 상태 편집 버튼 미표시 | | |
| TC-UI-009 | DRAFT 상태 편집 버튼 표시 | | |
| TC-UI-010 | 미저장 이탈 경고 | | |
| TC-UI-011 | 대시보드 "작성하기" 버튼 | | |
| TC-UI-012 | 대시보드 "이어서 작성" 버튼 | | |

---

> **총 테스트 케이스: 68건**  
> Pass: __ / Fail: __ / N/A: __