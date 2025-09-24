import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Content not found.'
  }

  if (error instanceof AxiosError) {
    // Handle different API error response formats
    const response = error.response
    if (response?.data) {
      errMsg = response.data.detail || 
               response.data.message || 
               response.data.title || 
               response.data.error ||
               `HTTP ${response.status}: ${response.statusText}`
    } else if (error.code === 'NETWORK_ERROR') {
      errMsg = 'Network error. Please check your connection.'
    } else if (error.code === 'TIMEOUT') {
      errMsg = 'Request timeout. Please try again.'
    }
  }

  toast.error(errMsg)
}
