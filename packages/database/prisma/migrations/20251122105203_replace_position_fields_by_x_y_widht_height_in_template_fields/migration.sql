/*
  Warnings:

  - You are about to drop the column `position` on the `template_field` table. All the data in the column will be lost.
  - Added the required column `height` to the `template_field` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `template_field` table without a default value. This is not possible if the table is not empty.
  - Added the required column `x` to the `template_field` table without a default value. This is not possible if the table is not empty.
  - Added the required column `y` to the `template_field` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_template_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "template_id" TEXT NOT NULL,
    CONSTRAINT "template_field_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_template_field" ("field_id", "field_label", "id", "template_id") SELECT "field_id", "field_label", "id", "template_id" FROM "template_field";
DROP TABLE "template_field";
ALTER TABLE "new_template_field" RENAME TO "template_field";
CREATE INDEX "template_field_field_label_idx" ON "template_field"("field_label");
CREATE UNIQUE INDEX "template_field_template_id_field_id_key" ON "template_field"("template_id", "field_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
