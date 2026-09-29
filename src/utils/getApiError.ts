import axios from "axios";

export const getApiError = (
  error: unknown,
  fallback = "An unexpected error occurred."
): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ??
      error.message ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};