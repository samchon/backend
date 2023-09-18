-- CreateTable
CREATE TABLE "attachment_files" (
    "id" UUID NOT NULL,
    "name" VARCHAR,
    "extension" VARCHAR,
    "url" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attachment_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bbs_articles" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "bbs_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bbs_article_snapshots" (
    "id" UUID NOT NULL,
    "bbs_article_id" UUID NOT NULL,
    "format" VARCHAR NOT NULL,
    "title" VARCHAR NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bbs_article_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bbs_article_snapshot_files" (
    "id" UUID NOT NULL,
    "bbs_article_snapshot_id" UUID NOT NULL,
    "attachment_file_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "bbs_article_snapshot_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bbs_article_comments" (
    "id" UUID NOT NULL,
    "bbs_article_id" UUID NOT NULL,
    "parent_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "bbs_article_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bbs_article_comment_snapshots" (
    "id" UUID NOT NULL,
    "bbs_article_comment_id" UUID NOT NULL,
    "format" VARCHAR NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bbs_article_comment_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bbs_article_comment_snapshot_files" (
    "id" UUID NOT NULL,
    "bbs_article_comment_snapshot_id" UUID NOT NULL,
    "attachment_file_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "bbs_article_comment_snapshot_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mv_bbs_article_last_snapshots" (
    "bbs_article_id" UUID NOT NULL,
    "bbs_article_snapshot_id" UUID NOT NULL,

    CONSTRAINT "mv_bbs_article_last_snapshots_pkey" PRIMARY KEY ("bbs_article_id")
);

-- CreateIndex
CREATE INDEX "bbs_articles_created_at_idx" ON "bbs_articles"("created_at");

-- CreateIndex
CREATE INDEX "bbs_article_snapshots_bbs_article_id_created_at_idx" ON "bbs_article_snapshots"("bbs_article_id", "created_at");

-- CreateIndex
CREATE INDEX "bbs_article_snapshot_files_bbs_article_snapshot_id_idx" ON "bbs_article_snapshot_files"("bbs_article_snapshot_id");

-- CreateIndex
CREATE INDEX "bbs_article_snapshot_files_attachment_file_id_idx" ON "bbs_article_snapshot_files"("attachment_file_id");

-- CreateIndex
CREATE INDEX "bbs_article_comments_bbs_article_id_parent_id_created_at_idx" ON "bbs_article_comments"("bbs_article_id", "parent_id", "created_at");

-- CreateIndex
CREATE INDEX "bbs_article_comment_snapshots_bbs_article_comment_id_create_idx" ON "bbs_article_comment_snapshots"("bbs_article_comment_id", "created_at");

-- CreateIndex
CREATE INDEX "bbs_article_comment_snapshot_files_bbs_article_comment_snap_idx" ON "bbs_article_comment_snapshot_files"("bbs_article_comment_snapshot_id");

-- CreateIndex
CREATE INDEX "bbs_article_comment_snapshot_files_attachment_file_id_idx" ON "bbs_article_comment_snapshot_files"("attachment_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "mv_bbs_article_last_snapshots_bbs_article_snapshot_id_key" ON "mv_bbs_article_last_snapshots"("bbs_article_snapshot_id");

-- AddForeignKey
ALTER TABLE "bbs_article_snapshots" ADD CONSTRAINT "bbs_article_snapshots_bbs_article_id_fkey" FOREIGN KEY ("bbs_article_id") REFERENCES "bbs_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbs_article_snapshot_files" ADD CONSTRAINT "bbs_article_snapshot_files_bbs_article_snapshot_id_fkey" FOREIGN KEY ("bbs_article_snapshot_id") REFERENCES "bbs_article_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbs_article_snapshot_files" ADD CONSTRAINT "bbs_article_snapshot_files_attachment_file_id_fkey" FOREIGN KEY ("attachment_file_id") REFERENCES "attachment_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbs_article_comments" ADD CONSTRAINT "bbs_article_comments_bbs_article_id_fkey" FOREIGN KEY ("bbs_article_id") REFERENCES "bbs_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbs_article_comments" ADD CONSTRAINT "bbs_article_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "bbs_article_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbs_article_comment_snapshots" ADD CONSTRAINT "bbs_article_comment_snapshots_bbs_article_comment_id_fkey" FOREIGN KEY ("bbs_article_comment_id") REFERENCES "bbs_article_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbs_article_comment_snapshot_files" ADD CONSTRAINT "bbs_article_comment_snapshot_files_bbs_article_comment_sna_fkey" FOREIGN KEY ("bbs_article_comment_snapshot_id") REFERENCES "bbs_article_comment_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bbs_article_comment_snapshot_files" ADD CONSTRAINT "bbs_article_comment_snapshot_files_attachment_file_id_fkey" FOREIGN KEY ("attachment_file_id") REFERENCES "attachment_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mv_bbs_article_last_snapshots" ADD CONSTRAINT "mv_bbs_article_last_snapshots_bbs_article_id_fkey" FOREIGN KEY ("bbs_article_id") REFERENCES "bbs_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mv_bbs_article_last_snapshots" ADD CONSTRAINT "mv_bbs_article_last_snapshots_bbs_article_snapshot_id_fkey" FOREIGN KEY ("bbs_article_snapshot_id") REFERENCES "bbs_article_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
