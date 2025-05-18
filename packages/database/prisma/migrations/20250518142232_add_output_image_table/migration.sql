-- CreateTable
CREATE TABLE "output_image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "relative_path" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    CONSTRAINT "output_image_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "prompt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
