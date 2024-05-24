-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GremlinsConfig" (
    "guildId" TEXT NOT NULL,
    "dailyDay" INTEGER NOT NULL DEFAULT 1,
    "dailyHour" INTEGER NOT NULL DEFAULT 0,
    "dailyMinute" INTEGER NOT NULL DEFAULT 0,
    "monthlyHour" INTEGER NOT NULL DEFAULT 0,
    "monthlyMinute" INTEGER NOT NULL DEFAULT 0,
    "monthlyGremlinCount" INTEGER NOT NULL DEFAULT 0,
    "dailyChannelId" TEXT,
    "submissionsChannelId" TEXT,
    "monthlyReset" BOOLEAN NOT NULL DEFAULT false,
    "monthlyResetKeep" INTEGER NOT NULL DEFAULT 5,
    "monthlyResetHour" INTEGER NOT NULL DEFAULT 0,
    "monthlyResetMinute" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_GremlinsConfig" ("dailyChannelId", "dailyDay", "dailyHour", "dailyMinute", "guildId", "monthlyReset", "monthlyResetHour", "monthlyResetKeep", "monthlyResetMinute", "submissionsChannelId") SELECT "dailyChannelId", "dailyDay", "dailyHour", "dailyMinute", "guildId", "monthlyReset", "monthlyResetHour", "monthlyResetKeep", "monthlyResetMinute", "submissionsChannelId" FROM "GremlinsConfig";
DROP TABLE "GremlinsConfig";
ALTER TABLE "new_GremlinsConfig" RENAME TO "GremlinsConfig";
CREATE UNIQUE INDEX "GremlinsConfig_guildId_key" ON "GremlinsConfig"("guildId");
PRAGMA foreign_key_check("GremlinsConfig");
PRAGMA foreign_keys=ON;
