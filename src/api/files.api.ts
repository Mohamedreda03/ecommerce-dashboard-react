import { apiClient } from "./client";

export const filesApi = {
  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<{ url: string; filename: string }>(
      "/files/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },

  async uploadFiles(
    files: File[],
  ): Promise<{ urls: string[]; filenames: string[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files[]", file);
    });

    const { data } = await apiClient.post<{
      urls: string[];
      filenames: string[];
    }>("/files/upload-multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
