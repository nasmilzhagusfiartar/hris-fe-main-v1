export function handleError(error) {
    if (!error?.response) {
        return error?.message || 'Network error occurred';
    }

    if (error.response.status === 422) {
        return error.response.data.errors;
    }

    return error.response.data?.message || 'An unexpected error occurred';
}
