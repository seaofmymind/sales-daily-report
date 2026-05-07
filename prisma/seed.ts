import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('Test1234!', 10)

  // Clear all data in reverse dependency order
  await prisma.comment.deleteMany()
  await prisma.dailyNote.deleteMany()
  await prisma.visitRecord.deleteMany()
  await prisma.dailyReport.deleteMany()
  await prisma.customer.deleteMany()
  // Clear self-referential FK before deleting salespersons
  await prisma.salesperson.updateMany({ data: { managerId: null } })
  await prisma.salesperson.deleteMany()

  // Insert salespersons without manager first (이부장, 관리자)
  await prisma.$executeRaw`INSERT INTO salespersons (id, manager_id, name, department, position, email, phone, password, created_at, updated_at) VALUES
    (5, NULL, '이부장', '영업1팀', '부장', 'lee@test.com', '010-5555-0005', ${password}, NOW(), NOW()),
    (9, NULL, '관리자', '관리부', '관리자', 'admin@test.com', '010-9999-0009', ${password}, NOW(), NOW())`

  // Insert salespersons with manager reference (홍길동, 김영업)
  await prisma.$executeRaw`INSERT INTO salespersons (id, manager_id, name, department, position, email, phone, password, created_at, updated_at) VALUES
    (1, 5, '홍길동', '영업1팀', '대리', 'hong@test.com', '010-1111-0001', ${password}, NOW(), NOW()),
    (2, 5, '김영업', '영업1팀', '사원', 'kim@test.com', '010-2222-0002', ${password}, NOW(), NOW())`

  // Reset salespersons sequence
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('salespersons', 'id'), GREATEST((SELECT MAX(id) FROM salespersons), 1))`

  // Insert customers
  await prisma.$executeRaw`INSERT INTO customers (id, name, company, contact_name, phone, email, address, created_at, updated_at) VALUES
    (10, '김철수', '(주)ABC', '김철수', '02-1234-5678', 'kim@abc.com', '서울시 강남구', NOW(), NOW()),
    (11, '박영희', '(주)DEF', '박영희', '031-987-6543', 'park@def.com', '경기도 성남시', NOW(), NOW())`

  // Reset customers sequence
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('customers', 'id'), GREATEST((SELECT MAX(id) FROM customers), 1))`

  // Insert daily reports
  await prisma.$executeRaw`INSERT INTO daily_reports (id, salesperson_id, report_date, status, created_at, updated_at) VALUES
    (100, 1, '2026-05-05', 'SUBMITTED', NOW(), NOW()),
    (101, 1, '2026-05-04', 'SUBMITTED', NOW(), NOW()),
    (102, 2, '2026-05-05', 'SUBMITTED', NOW(), NOW())`

  // Reset daily_reports sequence
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('daily_reports', 'id'), GREATEST((SELECT MAX(id) FROM daily_reports), 1))`

  // Insert visit records (at least 1 per report as required)
  await prisma.$executeRaw`INSERT INTO visit_records (daily_report_id, customer_id, seq, visit_time, content, result) VALUES
    (100, 10, 1, '10:00', '신제품 소개 미팅 진행', '2차 미팅 일정 협의 중'),
    (101, 11, 1, '14:00', '계약 갱신 협의', '다음 주 재협의 예정'),
    (102, 10, 1, '09:00', '정기 방문', '계약 검토 중')`

  // Insert daily notes for report 100 (needed for comment tests TC-CMT-001 etc.)
  await prisma.$executeRaw`INSERT INTO daily_notes (daily_report_id, note_type, seq, content, created_at) VALUES
    (100, 'PROBLEM', 1, 'ABC사 계약 지연 문제 지속 중', NOW()),
    (100, 'PLAN', 1, '내일 오전 DEF사 방문 예정', NOW())`

  console.log('Seed completed successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
