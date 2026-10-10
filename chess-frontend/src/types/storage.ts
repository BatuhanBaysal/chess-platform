export interface FileDownloadDTO {
  data: Blob | ArrayBuffer;
  contentType: string;
  fileName: string;
}
