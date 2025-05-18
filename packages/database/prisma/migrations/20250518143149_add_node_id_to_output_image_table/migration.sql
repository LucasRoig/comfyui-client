/*
  Warnings:

  - Added the required column `node_id` to the `output_image` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_output_image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "relative_path" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "node_id" TEXT NOT NULL,
    CONSTRAINT "output_image_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_output_image" ("filename", "id", "prompt_id", "relative_path") SELECT "filename", "id", "prompt_id", "relative_path" FROM "output_image";
DROP TABLE "output_image";
ALTER TABLE "new_output_image" RENAME TO "output_image";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
