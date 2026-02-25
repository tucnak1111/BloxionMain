-- CreateTable
CREATE TABLE "AuthAttempt" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthLoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthLoginEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthAttempt_ipAddress_createdAt_idx" ON "AuthAttempt"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "AuthLoginEvent_userId_idx" ON "AuthLoginEvent"("userId");

-- CreateIndex
CREATE INDEX "AuthLoginEvent_ipAddress_createdAt_idx" ON "AuthLoginEvent"("ipAddress", "createdAt");

-- AddForeignKey
ALTER TABLE "AuthLoginEvent" ADD CONSTRAINT "AuthLoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
