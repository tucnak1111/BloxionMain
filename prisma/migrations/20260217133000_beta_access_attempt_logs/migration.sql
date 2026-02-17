-- CreateTable
CREATE TABLE "BetaAccessAttempt" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "codeIdentifier" TEXT NOT NULL,
    "betaAccessCodeId" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetaAccessAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BetaAccessAttempt_attemptedAt_idx" ON "BetaAccessAttempt"("attemptedAt");

-- CreateIndex
CREATE INDEX "BetaAccessAttempt_status_idx" ON "BetaAccessAttempt"("status");

-- CreateIndex
CREATE INDEX "BetaAccessAttempt_betaAccessCodeId_idx" ON "BetaAccessAttempt"("betaAccessCodeId");

-- AddForeignKey
ALTER TABLE "BetaAccessAttempt" ADD CONSTRAINT "BetaAccessAttempt_betaAccessCodeId_fkey" FOREIGN KEY ("betaAccessCodeId") REFERENCES "BetaAccessCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
