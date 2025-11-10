import { getApiUrl } from "./api-config"

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface ApiError {
  message: string
  status?: number
}

/**
 * Standardized API fetch wrapper with error handling
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const apiUrl = getApiUrl()
  const url = `${apiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Extract the data field if it exists, otherwise return the whole response
    return data.data || data
  } catch (error) {
    console.error("[v0] API Fetch Error:", {
      endpoint,
      url,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET", signal })
}

/**
 * POST request
 */
export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

/**
 * PUT request
 */
export async function apiPut<T>(endpoint: string, body: any): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE" })
}
