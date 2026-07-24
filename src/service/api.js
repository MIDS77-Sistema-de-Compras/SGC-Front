export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://ec2-54-241-55-128.us-west-1.compute.amazonaws.com:8081";

export function getPageContent(response) {
    return Array.isArray(response)
        ? response
        : response?.content ?? [];
}

function getToken() {
    if (typeof document === "undefined") return null;

    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="));

    return match
        ? decodeURIComponent(match.split("=")[1])
        : null;
}

async function handleRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
        "ngrok-skip-browser-warning": "true",
        ...(!isFormData && {
            "Content-Type": "application/json",
        }),
        ...(token && {
            Authorization: `Bearer ${token}`,
        }),
        ...options.headers,
    };

    const response = await fetch(url, {
        credentials: "include",
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => ({}));

        const error = new Error(
            errorData.message ||
                "Erro na requisição"
        );

        error.status = response.status;
        error.details = errorData;

        throw error;
    }

    return response.json().catch(() => {});
}

export const api = {
    get: (endpoint, options) =>
        handleRequest(endpoint, {
            ...options,
            method: "GET",
        }),

    post: (endpoint, body, options) =>
        handleRequest(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        }),

    put: (endpoint, body, options) =>
        handleRequest(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(body),
        }),

    patch: (endpoint, body, options) =>
        handleRequest(endpoint, {
            ...options,
            method: "PATCH",
            body: body
                ? JSON.stringify(body)
                : undefined,
        }),

    delete: (endpoint, options) =>
        handleRequest(endpoint, {
            ...options,
            method: "DELETE",
        }),

    postFormData: (endpoint, formData, options) =>
        handleRequest(endpoint, {
            ...options,
            method: "POST",
            body: formData,
        }),

    putFormData: (endpoint, formData, options) =>
        handleRequest(endpoint, {
            ...options,
            method: "PUT",
            body: formData,
        }),

    patchFormData: (endpoint, formData, options) =>
        handleRequest(endpoint, {
            ...options,
            method: "PATCH",
            body: formData,
        }),
};