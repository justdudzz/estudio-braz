import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});
const sql = `
-- Enums (Simulados como Check Constraints)
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN_STAFF', 'ACCOUNTANT', 'VIP_CLIENT', 'NORMAL_USER');

-- Tabelas
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" DEFAULT 'ADMIN_STAFF' NOT NULL,
    "displayName" TEXT,
    "photoUrl" TEXT,
    "bio" TEXT,
    "legalName" TEXT,
    "nif" TEXT UNIQUE,
    "address" TEXT,
    "phone" TEXT,
    "twoFactorSecret" TEXT,
    "isTwoFactorEnabled" BOOLEAN DEFAULT false NOT NULL,
    "clientId" TEXT UNIQUE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Client" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE,
    "phone" TEXT,
    "isVIP" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Service" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "label" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Booking" (
    "id" TEXT PRIMARY KEY,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "notes" TEXT,
    "totalPrice" DOUBLE PRECISION,
    "deletedAt" TIMESTAMP(3),
    "invoiceId" TEXT,
    "invoiceUrl" TEXT,
    "clientId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "parentBookingId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "BookingService" (
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    CONSTRAINT "BookingService_pkey" PRIMARY KEY ("bookingId", "serviceId"),
    CONSTRAINT "BookingService_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookingService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Expense" (
    "id" TEXT PRIMARY KEY,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "staffId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "TokenBlacklist" (
    "id" TEXT PRIMARY KEY,
    "token" TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabelas de Junção (Relacionamento N-N Staff-Service)
CREATE TABLE "_StaffServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_StaffServices_AB_unique" UNIQUE ("A", "B"),
    CONSTRAINT "_StaffServices_A_fkey" FOREIGN KEY ("A") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StaffServices_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Client_email_idx" ON "Client"("email");
CREATE INDEX "Client_name_idx" ON "Client"("name");
CREATE INDEX "Booking_date_idx" ON "Booking"("date");
CREATE INDEX "Booking_staffId_idx" ON "Booking"("staffId");
CREATE INDEX "Booking_status_date_idx" ON "Booking"("status", "date");
CREATE INDEX "Expense_date_idx" ON "Expense"("date");
CREATE INDEX "TokenBlacklist_expiresAt_idx" ON "TokenBlacklist"("expiresAt");
CREATE INDEX "_StaffServices_B_index" ON "_StaffServices"("B");
`;
async function sync() {
    try {
        console.log('🌱 Starting manual DB sync...');
        // Drop existing if needed (be careful, but here we want a clean state)
        // await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;'); 
        await pool.query(sql);
        console.log('✅ DATABASE SYNC SUCCESSFUL!');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ DB SYNC FAILED:', err);
        process.exit(1);
    }
}
sync();
