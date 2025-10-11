-- CreateTable
CREATE TABLE "input_image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "original_file_name" TEXT NOT NULL,
    "original_directory" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    CONSTRAINT "input_image_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
