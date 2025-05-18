/*
  Warnings:

  - You are about to drop the column `workflowId` on the `prompt` table. All the data in the column will be lost.
  - Added the required column `workflow_id` to the `prompt` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_prompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "json" JSONB NOT NULL,
    "workflow_id" TEXT NOT NULL,
    CONSTRAINT "prompt_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "comfy_workflow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_prompt" ("id", "json") SELECT "id", "json" FROM "prompt";
DROP TABLE "prompt";
ALTER TABLE "new_prompt" RENAME TO "prompt";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
