-- CreateTable
CREATE TABLE "prompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "json" JSONB NOT NULL,
    "workflowId" TEXT NOT NULL,
    CONSTRAINT "prompt_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "comfy_workflow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
