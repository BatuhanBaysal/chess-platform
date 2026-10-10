export interface ErrorResponse {
  status: number;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string> | null;
}
