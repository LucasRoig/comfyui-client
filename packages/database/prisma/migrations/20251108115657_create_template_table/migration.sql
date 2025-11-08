/*
  Warnings:

  - Added the required column `template_id` to the `input_image` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "is_root" BOOLEAN NOT NULL DEFAULT false,
    "parent_id" TEXT,
    "project_id" TEXT NOT NULL,
    CONSTRAINT "template_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "template" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "template_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_input_image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "original_file_name" TEXT NOT NULL,
    "original_path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "import_task_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    CONSTRAINT "input_image_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "input_image_import_task_id_fkey" FOREIGN KEY ("import_task_id") REFERENCES "import_task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "input_image_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_input_image" ("id", "import_task_id", "original_file_name", "original_path", "project_id", "type") SELECT "id", "import_task_id", "original_file_name", "original_path", "project_id", "type" FROM "input_image";
DROP TABLE "input_image";
ALTER TABLE "new_input_image" RENAME TO "input_image";
CREATE UNIQUE INDEX "input_image_project_id_original_path_key" ON "input_image"("project_id", "original_path");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
