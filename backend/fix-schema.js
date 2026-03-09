import fs from 'fs';
import path from 'path';

const schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = "postgresql://postgres:braz_master_2026@localhost:5432/studio_braz?schema=public"
}

enum UserRole {
  SUPER_ADMIN
  ADMIN_STAFF
  ACCOUNTANT
  VIP_CLIENT
  NORMAL_USER
}

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  role              UserRole  @default(ADMIN_STAFF)
  displayName       String?
  photoUrl          String?
  bio               String?   @db.Text
  legalName         String?
  nif               String?   @unique
  address           String?
  phone             String?
  twoFactorSecret   String?
  isTwoFactorEnabled Boolean  @default(false)
  providedServices  Service[] @relation("StaffServices")
  managedBookings   Booking[] @relation("StaffBookings")
  clientProfile     Client?   @relation(fields: [clientId], references: [id])
  clientId          String?   @unique
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([email])
  @@index([role])
}

model Client {
  id        String    @id @default(uuid())
  name      String
  email     String?   @unique
  phone     String?   
  isVIP     Boolean   @default(false)
  user      User?
  bookings  Booking[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([email])
  @@index([name])
}

model Service {
  id          String    @id @default(uuid())
  name        String    @unique
  label       String
  duration    Int
  price       Float
  category    String?
  staff       User[]    @relation("StaffServices")
  bookings    BookingService[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Booking {
  id              String    @id @default(uuid())
  date            String   
  time            String   
  status          String    @default("pending")
  notes           String?   
  totalPrice      Float?    
  deletedAt       DateTime? 
  invoiceId       String?
  invoiceUrl      String?
  clientId        String
  client          Client    @relation(fields: [clientId], references: [id])
  staffId         String
  staff           User      @relation("StaffBookings", fields: [staffId], references: [id])
  services        BookingService[]
  parentBookingId String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([date])
  @@index([staffId])
  @@index([status, date])
}

model BookingService {
  bookingId String
  booking   Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  serviceId String
  service   Service @relation(fields: [serviceId], references: [id])

  @@id([bookingId, serviceId])
}

model Expense {
  id          String   @id @default(uuid())
  description String
  amount      Float
  date        String
  staffId     String?
  createdAt   DateTime @default(now())

  @@index([date])
}

model TokenBlacklist {
  id        String   @id @default(uuid())
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([expiresAt])
}
`;

const prismaDir = 'c:/Users/Edu/MyProject/backend/prisma';
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

fs.writeFileSync(path.join(prismaDir, 'schema.prisma'), schemaContent, { encoding: 'utf8' });
console.log('Successfully wrote schema.prisma with UTF-8 encoding');
