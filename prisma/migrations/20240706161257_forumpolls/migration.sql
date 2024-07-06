-- CreateTable
CREATE TABLE "ForumPoll" (
    "channelId" TEXT NOT NULL,
    "question" TEXT NOT NULL DEFAULT 'My Poll',
    "duration" INTEGER NOT NULL DEFAULT 336,
    "allowMultiselect" BOOLEAN NOT NULL DEFAULT false,
    "pin" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "ForumPollAnswer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channelId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "emojiId" TEXT,
    "emojiName" TEXT,
    CONSTRAINT "ForumPollAnswer_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ForumPoll" ("channelId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ForumPoll_channelId_key" ON "ForumPoll"("channelId");
