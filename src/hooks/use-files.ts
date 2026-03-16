import { useMutation } from "@tanstack/react-query";
import { filesApi } from "@/api/files.api";

// For file uploads, we generally don't cache anything in React Query since we just get URLs back.

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => filesApi.uploadFile(file),
  });
}

export function useUploadFiles() {
  return useMutation({
    mutationFn: (files: File[]) => filesApi.uploadFiles(files),
  });
}
