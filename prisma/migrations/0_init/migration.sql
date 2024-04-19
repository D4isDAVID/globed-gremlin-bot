-- CreateTable
CREATE TABLE "Gremlin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "submitterId" TEXT NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "GremlinsConfig" (
    "guildId" TEXT NOT NULL,
    "dailyDay" INTEGER NOT NULL DEFAULT 1,
    "dailyHour" INTEGER NOT NULL DEFAULT 0,
    "dailyMinute" INTEGER NOT NULL DEFAULT 0,
    "dailyChannelId" TEXT,
    "submissionsChannelId" TEXT,
    "monthlyReset" BOOLEAN NOT NULL DEFAULT false,
    "monthlyResetKeep" INTEGER NOT NULL DEFAULT 5
);

-- CreateIndex
CREATE UNIQUE INDEX "GremlinsConfig_guildId_key" ON "GremlinsConfig"("guildId");

