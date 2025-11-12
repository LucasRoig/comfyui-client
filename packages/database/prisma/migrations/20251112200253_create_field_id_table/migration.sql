/*
  Warnings:

  - You are about to drop the column `field_label` on the `template_input_image_field` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `template_input_image_field` table. All the data in the column will be lost.
  - You are about to drop the column `template_id` on the `template_input_image_field` table. All the data in the column will be lost.
  - You are about to drop the column `field_label` on the `template_output_image_field` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `template_output_image_field` table. All the data in the column will be lost.
  - You are about to drop the column `template_id` on the `template_output_image_field` table. All the data in the column will be lost.
  - You are about to drop the column `field_label` on the `template_string_field` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `template_string_field` table. All the data in the column will be lost.
  - You are about to drop the column `template_id` on the `template_string_field` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "template_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    CONSTRAINT "template_field_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_template_input_image_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "parent_field_id" TEXT NOT NULL,
    CONSTRAINT "template_input_image_field_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "template_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "template_input_image_field_parent_field_id_fkey" FOREIGN KEY ("parent_field_id") REFERENCES "template_input_image_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_template_input_image_field" ("field_id", "id", "parent_field_id") SELECT "field_id", "id", "parent_field_id" FROM "template_input_image_field";
DROP TABLE "template_input_image_field";
ALTER TABLE "new_template_input_image_field" RENAME TO "template_input_image_field";
CREATE UNIQUE INDEX "template_input_image_field_field_id_key" ON "template_input_image_field"("field_id");
CREATE TABLE "new_template_output_image_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "parent_field_id" TEXT NOT NULL,
    CONSTRAINT "template_output_image_field_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "template_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "template_output_image_field_parent_field_id_fkey" FOREIGN KEY ("parent_field_id") REFERENCES "template_output_image_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_template_output_image_field" ("field_id", "id", "parent_field_id") SELECT "field_id", "id", "parent_field_id" FROM "template_output_image_field";
DROP TABLE "template_output_image_field";
ALTER TABLE "new_template_output_image_field" RENAME TO "template_output_image_field";
CREATE UNIQUE INDEX "template_output_image_field_field_id_key" ON "template_output_image_field"("field_id");
CREATE TABLE "new_template_string_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "parent_field_id" TEXT NOT NULL,
    CONSTRAINT "template_string_field_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "template_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "template_string_field_parent_field_id_fkey" FOREIGN KEY ("parent_field_id") REFERENCES "template_string_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_template_string_field" ("field_id", "id", "parent_field_id") SELECT "field_id", "id", "parent_field_id" FROM "template_string_field";
DROP TABLE "template_string_field";
ALTER TABLE "new_template_string_field" RENAME TO "template_string_field";
CREATE UNIQUE INDEX "template_string_field_field_id_key" ON "template_string_field"("field_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "template_field_field_label_idx" ON "template_field"("field_label");

-- CreateIndex
CREATE UNIQUE INDEX "template_field_template_id_field_id_key" ON "template_field"("template_id", "field_id");
