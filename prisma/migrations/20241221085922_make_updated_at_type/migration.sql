-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'expense';

-- AlterTable
ALTER TABLE "Investments" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'investment';

-- AlterTable
ALTER TABLE "Savings" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'saving';
