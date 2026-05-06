# 영업 일일 보고 시스템 — API 명세서

> 작성일: 2026-05-06  
> 버전: v1.0  
> Base URL: `https://api.example.com/v1`

---

## 목차

1. [공통 규약](#1-공통-규약)
2. [인증 API](#2-인증-api)
3. [일일 보고서 API](#3-일일-보고서-api)
4. [방문 기록 API](#4-방문-기록-api)
5. [Problem / Plan API](#5-problem--plan-api)
6. [댓글 API](#6-댓글-api)
7. [고객 마스터 API](#7-고객-마스터-api)
8. [영업 사원 마스터 API](#8-영업-사원-마스터-api)
9. [에러 코드](#9-에러-코드)

---

## 1. 공통 규약

### 1.1 요청 헤더

| 헤더 | 필수 | 설명 |
|---|---|---|
| `Authorization` | Y (로그인 제외) | `Bearer {accessToken}` |
| `Content-Type` | Y (요청 바디 있을 때) | `application/json` |
| `Accept` | N | `application/json` |

### 1.2 응답 구조

모든 API는 아래 구조로 응답한다.

```json
{
  "success": true,
  "data": { },
  "error": null
}
```

실패 시:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "REPORT_NOT_FOUND",
    "message": "보고서를 찾을 수 없습니다."
  }
}
```

### 1.3 페이징 응답 구조

목록 조회 API는 `data` 안에 페이징 정보를 포함한다.

```json
{
  "success": true,
  "data": {
    "items": [ ],
    "pagination": {
      "page": 1,
      "size": 20,
      "totalCount": 153,
      "totalPages": 8
    }
  }
}
```

### 1.4 공통 날짜 형식

| 타입 | 형식 | 예시 |
|---|---|---|
| date | `YYYY-MM-DD` | `2026-05-06` |
| datetime | ISO 8601 UTC | `2026-05-06T05:30:00Z` |
| time | `HH:mm` | `14:30` |

### 1.5 권한 역할

| 역할 코드 | 설명 |
|---|---|
| `SALESPERSON` | 영업 사원 |
| `MANAGER` | 상급자 (팀원의 manager_id가 본인 id인 경우) |
| `ADMIN` | 관리자 |

---

## 2. 인증 API

### 2.1 로그인

```
POST /auth/login
```

로그인 후 액세스 토큰과 리프레시 토큰을 발급한다.

**권한:** 없음 (비인증)

**요청 바디**

```json
{
  "email": "hong@example.com",
  "password": "plaintext_password"
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `email` | string | Y | 등록된 이메일 |
| `password` | string | Y | 비밀번호 |

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 3600,
    "salesperson": {
      "id": 1,
      "name": "홍길동",
      "department": "영업1팀",
      "position": "대리",
      "role": "SALESPERSON"
    }
  }
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | 이메일 또는 비밀번호 불일치 |
| 400 | `VALIDATION_ERROR` | 필수 항목 누락 |

---

### 2.2 토큰 갱신

```
POST /auth/refresh
```

리프레시 토큰으로 새 액세스 토큰을 발급한다.

**권한:** 없음

**요청 바디**

```json
{
  "refreshToken": "eyJhbGci..."
}
```

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "expiresIn": 3600
  }
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 401 | `INVALID_REFRESH_TOKEN` | 토큰 만료 또는 유효하지 않음 |

---

### 2.3 로그아웃

```
POST /auth/logout
```

서버에서 리프레시 토큰을 무효화한다.

**권한:** 인증된 사용자

**응답 예시 (200)**

```json
{
  "success": true,
  "data": null
}
```

---

## 3. 일일 보고서 API

### 3.1 보고서 목록 조회

```
GET /reports
```

**권한:** 전체 (SALESPERSON은 본인, MANAGER는 팀 전체, ADMIN은 전체)

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `startDate` | date | N | 30일 전 | 조회 시작일 |
| `endDate` | date | N | 오늘 | 조회 종료일 |
| `salespersonId` | number | N | - | 특정 사원 필터 (MANAGER/ADMIN만 유효) |
| `status` | string | N | - | `DRAFT` / `SUBMITTED` |
| `page` | number | N | 1 | 페이지 번호 |
| `size` | number | N | 20 | 페이지당 건수 (최대 100) |

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 42,
        "reportDate": "2026-05-06",
        "status": "SUBMITTED",
        "salesperson": {
          "id": 1,
          "name": "홍길동",
          "department": "영업1팀"
        },
        "visitCount": 3,
        "commentCount": 2,
        "createdAt": "2026-05-06T01:00:00Z",
        "updatedAt": "2026-05-06T05:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "totalCount": 45,
      "totalPages": 3
    }
  }
}
```

---

### 3.2 보고서 단건 조회

```
GET /reports/{reportId}
```

**권한:** 본인 / MANAGER (팀원) / ADMIN

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `reportId` | number | 보고서 ID |

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "reportDate": "2026-05-06",
    "status": "SUBMITTED",
    "salesperson": {
      "id": 1,
      "name": "홍길동",
      "department": "영업1팀",
      "position": "대리"
    },
    "visitRecords": [
      {
        "id": 101,
        "seq": 1,
        "customer": {
          "id": 10,
          "name": "김철수",
          "company": "(주)ABC"
        },
        "visitTime": "10:00",
        "content": "신제품 소개 미팅 진행",
        "result": "2차 미팅 일정 협의 중"
      }
    ],
    "dailyNotes": [
      {
        "id": 201,
        "noteType": "PROBLEM",
        "seq": 1,
        "content": "ABC사 계약 지연 문제 지속 중",
        "comments": [
          {
            "id": 301,
            "commenter": {
              "id": 5,
              "name": "이부장",
              "position": "부장"
            },
            "content": "법무팀 협의 일정 확인 요청 바랍니다.",
            "createdAt": "2026-05-06T07:00:00Z"
          }
        ],
        "createdAt": "2026-05-06T05:00:00Z"
      },
      {
        "id": 202,
        "noteType": "PLAN",
        "seq": 1,
        "content": "내일 오전 DEF사 방문 예정",
        "comments": [],
        "createdAt": "2026-05-06T05:00:00Z"
      }
    ],
    "createdAt": "2026-05-06T01:00:00Z",
    "updatedAt": "2026-05-06T05:30:00Z"
  }
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 404 | `REPORT_NOT_FOUND` | 존재하지 않는 보고서 |
| 403 | `FORBIDDEN` | 조회 권한 없음 |

---

### 3.3 보고서 생성

```
POST /reports
```

**권한:** SALESPERSON (당일 보고서가 없는 경우에만)

**요청 바디**

```json
{
  "reportDate": "2026-05-06",
  "status": "DRAFT",
  "visitRecords": [
    {
      "seq": 1,
      "customerId": 10,
      "visitTime": "10:00",
      "content": "신제품 소개 미팅 진행",
      "result": "2차 미팅 일정 협의 중"
    }
  ],
  "dailyNotes": [
    {
      "noteType": "PROBLEM",
      "seq": 1,
      "content": "ABC사 계약 지연 문제 지속 중"
    },
    {
      "noteType": "PLAN",
      "seq": 1,
      "content": "내일 오전 DEF사 방문 예정"
    }
  ]
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `reportDate` | date | Y | 보고 날짜. 오늘 날짜만 허용 |
| `status` | string | Y | `DRAFT` / `SUBMITTED` |
| `visitRecords` | array | Y | 방문 기록 목록. 최소 1건 |
| `visitRecords[].seq` | number | Y | 정렬 순서 |
| `visitRecords[].customerId` | number | Y | 고객 마스터 ID |
| `visitRecords[].visitTime` | time | N | 방문 시각 (`HH:mm`) |
| `visitRecords[].content` | string | Y | 방문 내용 |
| `visitRecords[].result` | string | N | 결과 |
| `dailyNotes` | array | N | Problem/Plan 목록 |
| `dailyNotes[].noteType` | string | Y | `PROBLEM` / `PLAN` |
| `dailyNotes[].seq` | number | Y | 정렬 순서 |
| `dailyNotes[].content` | string | Y | 내용 |

**응답 예시 (201)**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "reportDate": "2026-05-06",
    "status": "DRAFT"
  }
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 409 | `REPORT_ALREADY_EXISTS` | 당일 보고서 이미 존재 |
| 400 | `INVALID_REPORT_DATE` | 오늘 날짜가 아님 |
| 400 | `VALIDATION_ERROR` | 필수 항목 누락 또는 형식 오류 |

---

### 3.4 보고서 수정

```
PUT /reports/{reportId}
```

**권한:** 본인 / DRAFT 상태인 경우에만

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `reportId` | number | 보고서 ID |

**요청 바디**

생성(3.3)과 동일한 구조. `reportDate` 변경 불가.

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "reportDate": "2026-05-06",
    "status": "DRAFT",
    "updatedAt": "2026-05-06T06:00:00Z"
  }
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 403 | `REPORT_ALREADY_SUBMITTED` | 제출된 보고서는 수정 불가 |
| 403 | `FORBIDDEN` | 타인 보고서 수정 불가 |
| 404 | `REPORT_NOT_FOUND` | 존재하지 않는 보고서 |

---

### 3.5 보고서 제출

```
PATCH /reports/{reportId}/submit
```

DRAFT → SUBMITTED 상태로 변경한다. 제출 이후 수정 불가.

**권한:** 본인 / DRAFT 상태인 경우에만

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "status": "SUBMITTED",
    "updatedAt": "2026-05-06T06:00:00Z"
  }
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 409 | `REPORT_ALREADY_SUBMITTED` | 이미 제출된 보고서 |
| 403 | `FORBIDDEN` | 타인 보고서 제출 불가 |
| 404 | `REPORT_NOT_FOUND` | 존재하지 않는 보고서 |

---

## 4. 방문 기록 API

> 보고서 단건 조회(3.2)에 방문 기록이 포함되므로,  
> 하위 리소스 단독 CRUD는 DRAFT 상태의 보고서에 한해 제공한다.

### 4.1 방문 기록 추가

```
POST /reports/{reportId}/visit-records
```

**권한:** 본인 / DRAFT 상태인 보고서

**요청 바디**

```json
{
  "seq": 2,
  "customerId": 15,
  "visitTime": "14:00",
  "content": "계약 갱신 협의",
  "result": "다음 주 재협의 예정"
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `seq` | number | Y | 정렬 순서 |
| `customerId` | number | Y | 고객 마스터 ID |
| `visitTime` | time | N | 방문 시각 (`HH:mm`) |
| `content` | string | Y | 방문 내용 |
| `result` | string | N | 결과 |

**응답 예시 (201)**

```json
{
  "success": true,
  "data": {
    "id": 105,
    "seq": 2,
    "customer": {
      "id": 15,
      "name": "박영희",
      "company": "(주)DEF"
    },
    "visitTime": "14:00",
    "content": "계약 갱신 협의",
    "result": "다음 주 재협의 예정"
  }
}
```

---

### 4.2 방문 기록 수정

```
PUT /reports/{reportId}/visit-records/{visitRecordId}
```

**권한:** 본인 / DRAFT 상태인 보고서

**요청 바디**

추가(4.1)와 동일한 구조.

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "id": 105,
    "seq": 2,
    "customer": { "id": 15, "name": "박영희", "company": "(주)DEF" },
    "visitTime": "15:00",
    "content": "계약 갱신 협의 (수정)",
    "result": "다음 주 재협의 예정"
  }
}
```

---

### 4.3 방문 기록 삭제

```
DELETE /reports/{reportId}/visit-records/{visitRecordId}
```

**권한:** 본인 / DRAFT 상태인 보고서

> 마지막 1건은 삭제 불가 (보고서당 최소 1건 유지).

**응답 예시 (200)**

```json
{
  "success": true,
  "data": null
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 409 | `MINIMUM_VISIT_RECORD` | 마지막 방문 기록은 삭제 불가 |
| 403 | `REPORT_ALREADY_SUBMITTED` | 제출된 보고서의 기록 변경 불가 |
| 404 | `VISIT_RECORD_NOT_FOUND` | 존재하지 않는 방문 기록 |

---

## 5. Problem / Plan API

### 5.1 항목 추가

```
POST /reports/{reportId}/notes
```

**권한:** 본인 / DRAFT 상태인 보고서

**요청 바디**

```json
{
  "noteType": "PROBLEM",
  "seq": 2,
  "content": "GHI사 미수금 회수 지연"
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `noteType` | string | Y | `PROBLEM` / `PLAN` |
| `seq` | number | Y | 같은 `noteType` 내 정렬 순서 |
| `content` | string | Y | 항목 내용 |

**응답 예시 (201)**

```json
{
  "success": true,
  "data": {
    "id": 205,
    "noteType": "PROBLEM",
    "seq": 2,
    "content": "GHI사 미수금 회수 지연",
    "comments": [],
    "createdAt": "2026-05-06T06:00:00Z"
  }
}
```

---

### 5.2 항목 수정

```
PUT /reports/{reportId}/notes/{noteId}
```

**권한:** 본인 / DRAFT 상태인 보고서

**요청 바디**

```json
{
  "seq": 2,
  "content": "GHI사 미수금 회수 지연 (수정)"
}
```

> `noteType` 변경 불가.

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "id": 205,
    "noteType": "PROBLEM",
    "seq": 2,
    "content": "GHI사 미수금 회수 지연 (수정)",
    "updatedAt": "2026-05-06T06:30:00Z"
  }
}
```

---

### 5.3 항목 삭제

```
DELETE /reports/{reportId}/notes/{noteId}
```

**권한:** 본인 / DRAFT 상태인 보고서

**응답 예시 (200)**

```json
{
  "success": true,
  "data": null
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 403 | `REPORT_ALREADY_SUBMITTED` | 제출된 보고서의 항목 변경 불가 |
| 404 | `NOTE_NOT_FOUND` | 존재하지 않는 항목 |

---

## 6. 댓글 API

> 상급자(MANAGER, ADMIN)만 댓글을 작성할 수 있다.

### 6.1 댓글 작성

```
POST /reports/{reportId}/notes/{noteId}/comments
```

**권한:** MANAGER (해당 사원의 상급자) / ADMIN

**요청 바디**

```json
{
  "content": "법무팀 협의 일정 확인 요청 바랍니다."
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `content` | string | Y | 댓글 내용. 1자 이상 |

**응답 예시 (201)**

```json
{
  "success": true,
  "data": {
    "id": 301,
    "commenter": {
      "id": 5,
      "name": "이부장",
      "position": "부장"
    },
    "content": "법무팀 협의 일정 확인 요청 바랍니다.",
    "createdAt": "2026-05-06T07:00:00Z"
  }
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 403 | `FORBIDDEN` | 상급자 권한 없음 |
| 404 | `NOTE_NOT_FOUND` | 존재하지 않는 항목 |

---

### 6.2 댓글 수정

```
PUT /reports/{reportId}/notes/{noteId}/comments/{commentId}
```

**권한:** 댓글 작성자 본인

**요청 바디**

```json
{
  "content": "법무팀 협의 일정 확인 요청 바랍니다. (수정)"
}
```

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "id": 301,
    "content": "법무팀 협의 일정 확인 요청 바랍니다. (수정)",
    "updatedAt": "2026-05-06T07:30:00Z"
  }
}
```

---

### 6.3 댓글 삭제

```
DELETE /reports/{reportId}/notes/{noteId}/comments/{commentId}
```

**권한:** 댓글 작성자 본인 / ADMIN

**응답 예시 (200)**

```json
{
  "success": true,
  "data": null
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 403 | `FORBIDDEN` | 삭제 권한 없음 |
| 404 | `COMMENT_NOT_FOUND` | 존재하지 않는 댓글 |

---

## 7. 고객 마스터 API

### 7.1 고객 목록 조회

```
GET /customers
```

**권한:** 전체 (검색용) / ADMIN (전체 목록 관리)

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `keyword` | string | N | - | 고객명 또는 회사명 부분 일치 검색 |
| `page` | number | N | 1 | 페이지 번호 |
| `size` | number | N | 20 | 페이지당 건수 (최대 100) |

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "name": "김철수",
        "company": "(주)ABC",
        "contactName": "김철수",
        "phone": "02-1234-5678",
        "email": "kim@abc.com",
        "address": "서울시 강남구",
        "createdAt": "2025-01-10T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "totalCount": 87,
      "totalPages": 5
    }
  }
}
```

---

### 7.2 고객 단건 조회

```
GET /customers/{customerId}
```

**권한:** 전체

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "김철수",
    "company": "(주)ABC",
    "contactName": "김철수",
    "phone": "02-1234-5678",
    "email": "kim@abc.com",
    "address": "서울시 강남구 테헤란로 123",
    "createdAt": "2025-01-10T00:00:00Z",
    "updatedAt": "2026-03-01T00:00:00Z"
  }
}
```

---

### 7.3 고객 등록

```
POST /customers
```

**권한:** ADMIN

**요청 바디**

```json
{
  "name": "박영희",
  "company": "(주)DEF",
  "contactName": "박영희",
  "phone": "031-987-6543",
  "email": "park@def.com",
  "address": "경기도 성남시"
}
```

| 필드 | 타입 | 필수 | 제약 |
|---|---|---|---|
| `name` | string | Y | 최대 100자 |
| `company` | string | Y | 최대 200자 |
| `contactName` | string | N | 최대 50자 |
| `phone` | string | N | 최대 20자 |
| `email` | string | N | 이메일 형식, 최대 100자 |
| `address` | string | N | 최대 300자 |

**응답 예시 (201)**

```json
{
  "success": true,
  "data": {
    "id": 88,
    "name": "박영희",
    "company": "(주)DEF",
    "createdAt": "2026-05-06T08:00:00Z"
  }
}
```

---

### 7.4 고객 수정

```
PUT /customers/{customerId}
```

**권한:** ADMIN

**요청 바디**

등록(7.3)과 동일한 구조.

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "id": 88,
    "name": "박영희",
    "company": "(주)DEF",
    "updatedAt": "2026-05-06T08:30:00Z"
  }
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 404 | `CUSTOMER_NOT_FOUND` | 존재하지 않는 고객 |
| 403 | `FORBIDDEN` | 권한 없음 |

---

## 8. 영업 사원 마스터 API

### 8.1 영업 사원 목록 조회

```
GET /salespersons
```

**권한:** 전체 (자동완성용) / ADMIN (전체 목록 관리)

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `keyword` | string | N | - | 이름 또는 부서 부분 일치 검색 |
| `department` | string | N | - | 부서명 일치 필터 |
| `page` | number | N | 1 | |
| `size` | number | N | 20 | 최대 100 |

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "홍길동",
        "department": "영업1팀",
        "position": "대리",
        "email": "hong@example.com",
        "phone": "010-1234-5678",
        "manager": {
          "id": 5,
          "name": "이부장"
        },
        "createdAt": "2024-03-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "totalCount": 32,
      "totalPages": 2
    }
  }
}
```

---

### 8.2 영업 사원 단건 조회

```
GET /salespersons/{salespersonId}
```

**권한:** 전체 (본인) / ADMIN (전체)

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "department": "영업1팀",
    "position": "대리",
    "email": "hong@example.com",
    "phone": "010-1234-5678",
    "manager": {
      "id": 5,
      "name": "이부장",
      "position": "부장"
    },
    "createdAt": "2024-03-01T00:00:00Z",
    "updatedAt": "2026-01-15T00:00:00Z"
  }
}
```

---

### 8.3 영업 사원 등록

```
POST /salespersons
```

**권한:** ADMIN

**요청 바디**

```json
{
  "name": "최신입",
  "department": "영업2팀",
  "position": "사원",
  "email": "choi@example.com",
  "phone": "010-9999-0000",
  "managerId": 5
}
```

| 필드 | 타입 | 필수 | 제약 |
|---|---|---|---|
| `name` | string | Y | 최대 50자 |
| `department` | string | Y | 최대 100자 |
| `position` | string | Y | 최대 50자 |
| `email` | string | Y | 이메일 형식, 중복 불가 |
| `phone` | string | N | 최대 20자 |
| `managerId` | number | N | 자기 자신 불가, 순환 참조 불가 |

**응답 예시 (201)**

```json
{
  "success": true,
  "data": {
    "id": 33,
    "name": "최신입",
    "department": "영업2팀",
    "email": "choi@example.com",
    "createdAt": "2026-05-06T09:00:00Z"
  }
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 409 | `EMAIL_ALREADY_EXISTS` | 이메일 중복 |
| 400 | `CIRCULAR_MANAGER_REFERENCE` | 순환 상급자 참조 |
| 400 | `SELF_MANAGER_REFERENCE` | 본인을 상급자로 지정 |

---

### 8.4 영업 사원 수정

```
PUT /salespersons/{salespersonId}
```

**권한:** ADMIN

**요청 바디**

등록(8.3)과 동일한 구조. `email` 변경 시 중복 검사 수행.

**응답 예시 (200)**

```json
{
  "success": true,
  "data": {
    "id": 33,
    "name": "최신입",
    "department": "영업2팀",
    "updatedAt": "2026-05-06T09:30:00Z"
  }
}
```

**오류 응답**

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 404 | `SALESPERSON_NOT_FOUND` | 존재하지 않는 사원 |
| 409 | `EMAIL_ALREADY_EXISTS` | 이메일 중복 |
| 400 | `CIRCULAR_MANAGER_REFERENCE` | 순환 상급자 참조 |

---

## 9. 에러 코드

### 공통

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 요청 바디 유효성 검사 실패 |
| 401 | `UNAUTHORIZED` | 인증 토큰 없음 또는 만료 |
| 401 | `INVALID_CREDENTIALS` | 이메일/비밀번호 불일치 |
| 401 | `INVALID_REFRESH_TOKEN` | 리프레시 토큰 만료 또는 무효 |
| 403 | `FORBIDDEN` | 해당 리소스에 대한 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 (범용) |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 내부 오류 |

### 보고서

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 404 | `REPORT_NOT_FOUND` | 보고서 없음 |
| 409 | `REPORT_ALREADY_EXISTS` | 당일 보고서 중복 |
| 400 | `INVALID_REPORT_DATE` | 당일 날짜가 아님 |
| 403 | `REPORT_ALREADY_SUBMITTED` | 제출된 보고서 수정/삭제 불가 |

### 방문 기록

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 404 | `VISIT_RECORD_NOT_FOUND` | 방문 기록 없음 |
| 409 | `MINIMUM_VISIT_RECORD` | 최소 1건 유지 위반 |

### Problem / Plan

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 404 | `NOTE_NOT_FOUND` | 항목 없음 |
| 400 | `INVALID_NOTE_TYPE` | `PROBLEM` / `PLAN` 이외 값 |

### 댓글

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 404 | `COMMENT_NOT_FOUND` | 댓글 없음 |

### 고객 마스터

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 404 | `CUSTOMER_NOT_FOUND` | 고객 없음 |

### 영업 사원 마스터

| HTTP | 에러 코드 | 설명 |
|---|---|---|
| 404 | `SALESPERSON_NOT_FOUND` | 사원 없음 |
| 409 | `EMAIL_ALREADY_EXISTS` | 이메일 중복 |
| 400 | `SELF_MANAGER_REFERENCE` | 본인 상급자 지정 |
| 400 | `CIRCULAR_MANAGER_REFERENCE` | 상급자 순환 참조 |

---

## API 엔드포인트 요약

| 메서드 | 엔드포인트 | 설명 | 권한 |
|---|---|---|---|
| POST | `/auth/login` | 로그인 | 전체 |
| POST | `/auth/refresh` | 토큰 갱신 | 전체 |
| POST | `/auth/logout` | 로그아웃 | 인증 사용자 |
| GET | `/reports` | 보고서 목록 | 전체 |
| GET | `/reports/{id}` | 보고서 단건 조회 | 전체 |
| POST | `/reports` | 보고서 생성 | SALESPERSON |
| PUT | `/reports/{id}` | 보고서 수정 | 본인 (DRAFT) |
| PATCH | `/reports/{id}/submit` | 보고서 제출 | 본인 (DRAFT) |
| POST | `/reports/{id}/visit-records` | 방문 기록 추가 | 본인 (DRAFT) |
| PUT | `/reports/{id}/visit-records/{vId}` | 방문 기록 수정 | 본인 (DRAFT) |
| DELETE | `/reports/{id}/visit-records/{vId}` | 방문 기록 삭제 | 본인 (DRAFT) |
| POST | `/reports/{id}/notes` | Problem/Plan 추가 | 본인 (DRAFT) |
| PUT | `/reports/{id}/notes/{nId}` | Problem/Plan 수정 | 본인 (DRAFT) |
| DELETE | `/reports/{id}/notes/{nId}` | Problem/Plan 삭제 | 본인 (DRAFT) |
| POST | `/reports/{id}/notes/{nId}/comments` | 댓글 작성 | MANAGER / ADMIN |
| PUT | `/reports/{id}/notes/{nId}/comments/{cId}` | 댓글 수정 | 작성자 본인 |
| DELETE | `/reports/{id}/notes/{nId}/comments/{cId}` | 댓글 삭제 | 작성자 / ADMIN |
| GET | `/customers` | 고객 목록 | 전체 |
| GET | `/customers/{id}` | 고객 단건 조회 | 전체 |
| POST | `/customers` | 고객 등록 | ADMIN |
| PUT | `/customers/{id}` | 고객 수정 | ADMIN |
| GET | `/salespersons` | 사원 목록 | 전체 |
| GET | `/salespersons/{id}` | 사원 단건 조회 | 전체 / ADMIN |
| POST | `/salespersons` | 사원 등록 | ADMIN |
| PUT | `/salespersons/{id}` | 사원 수정 | ADMIN |