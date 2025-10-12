/*
  Warnings:

  - You are about to drop the column `original_directory` on the `input_image` table. All the data in the column will be lost.
  - Added the required column `import_task_id` to the `input_image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_path` to the `input_image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `input_image` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "import_task" (
    "id" TEXT NOT NULL PRIMARY KEY
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
    CONSTRAINT "input_image_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "input_image_import_task_id_fkey" FOREIGN KEY ("import_task_id") REFERENCES "import_task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_input_image" ("id", "original_file_name", "project_id") SELECT "id", "original_file_name", "project_id" FROM "input_image";
DROP TABLE "input_image";
ALTER TABLE "new_input_image" RENAME TO "input_image";
CREATE UNIQUE INDEX "input_image_project_id_original_path_key" ON "input_image"("project_id", "original_path");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
