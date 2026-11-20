import { translateApiMessage } from "@/utils/apiMessage";

export function handleError(error) {
  if (!error?.response) {
    return translateApiMessage(error?.message || "Network error occurred");
  }

  if (error.response.status === 422) {
    return error.response.data.errors;
  }

  return translateApiMessage(
    error.response.data?.message || "An unexpected error occurred"
  );
}
