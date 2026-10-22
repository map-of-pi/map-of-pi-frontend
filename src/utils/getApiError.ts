import axios from "axios";

export const getApiError = (
  error: unknown,
  fallback = "An unexpected error occurred."
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string") {
      return data || error.message || fallback;
    }

    if (data && typeof data === "object") {
      const responseData = data as {
        message?: unknown;
        error?: unknown;
        detail?: unknown;
      };

      if (typeof responseData.message === "string") {
        return responseData.message;
      }

      if (typeof responseData.error === "string") {
        return responseData.error;
      }

      if (
        responseData.error &&
        typeof responseData.error === "object" &&
        "message" in responseData.error
      ) {
        const message = responseData.error.message;

        if (typeof message === "string") {
          return message;
        }
      }

      if (typeof responseData.detail === "string") {
        return responseData.detail;
      }
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};