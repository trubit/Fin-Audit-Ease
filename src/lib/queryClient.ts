import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes fresh data
      gcTime: 10 * 60 * 1000, // 10 minutes cache garbage collection
      refetchOnWindowFocus: false, // Prevent jarring refetches on window blur/focus
      retry: (failureCount, error: unknown) => {
        // Do not retry client validation, auth failures, not found, conflict, rate limit, or cancellation
        if (typeof error === 'object' && error !== null && 'status' in error) {
          const status = (error as { status: number }).status
          if ([400, 401, 403, 404, 409, 422, 429, 499].includes(status)) {
            return false
          }
        }
        if (typeof error === 'object' && error !== null && 'code' in error) {
          const code = (error as { code: string }).code
          if (code === 'REQUEST_CANCELLED' || code === 'RATE_LIMITED' || code === 'CONFLICT') {
            return false
          }
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: false, // Never auto-retry mutations to prevent duplicate financial actions
    },
  },
})
