CREATE TABLE "Projects" (
  "id" INTEGER PRIMARY KEY,
  "authors" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "bannerImageId" TEXT,
  "youtubeVideoUrl" TEXT,
  "slug" TEXT NOT NULL DEFAULT '233a7b01-ee6e-47fa-a5ec-91edd503b807',
  "webhookUrl" TEXT,
  "callToActionUrl" TEXT,
  "callToActionText" TEXT,
  "isPublished" INTEGER NOT NULL DEFAULT FALSE,
  "logoImageId" TEXT,
  "isFeatured" INTEGER NOT NULL DEFAULT FALSE,
  "updatedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Posts" (
  "id" INTEGER PRIMARY KEY,
  "title" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "content" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL REFERENCES "Projects" ("id"),
  "isFeatured" INTEGER NOT NULL DEFAULT FALSE
);

CREATE TABLE "Leads" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL REFERENCES "Projects" ("id")
);

CREATE TABLE "PageView" (
  "_id" INTEGER PRIMARY KEY,
  "url" TEXT NOT NULL,
  "date" TEXT NOT NULL
);
CREATE INDEX "url_idx" ON "PageView" ("url");
CREATE INDEX "date_idx" ON "PageView" ("date");
