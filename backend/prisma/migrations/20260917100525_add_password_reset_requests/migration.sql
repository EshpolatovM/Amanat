-- CreateEnum
CREATE TYPE "PasswordResetStatus" AS ENUM ('pending_telegram', 'otp_sent', 'verified', 'used', 'expired');

-- CreateTable
CREATE TABLE "password_reset_requests" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "chat_id" TEXT,
    "status" "PasswordResetStatus" NOT NULL DEFAULT 'pending_telegram',
    "otp_hash" TEXT,
    "otp_expires_at" TIMESTAMP(3),
    "otp_attempts" INTEGER NOT NULL DEFAULT 0,
    "reset_token_hash" TEXT,
    "reset_token_expires_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_reset_requests_phone_idx" ON "password_reset_requests"("phone");

-- CreateIndex
CREATE INDEX "password_reset_requests_chat_id_idx" ON "password_reset_requests"("chat_id");
