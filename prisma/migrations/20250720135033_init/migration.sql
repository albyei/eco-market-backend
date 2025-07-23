/*
  Warnings:

  - You are about to drop the column `fileType` on the `schoolactivity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `schoolactivity` DROP COLUMN `fileType`,
    ADD COLUMN `image` VARCHAR(255) NULL;
