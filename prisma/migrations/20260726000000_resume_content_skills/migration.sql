-- AlterTable
ALTER TABLE "ResumeVersion" ADD COLUMN     "contentText" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
