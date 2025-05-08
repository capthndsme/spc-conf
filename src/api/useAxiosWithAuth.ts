import axios, { AxiosInstance } from 'axios'
const AXIOS_TIMEOUT = 100000

export function useAxiosWithAuth(): AxiosInstance {
  const apiBaseUrl = 'https://parcel-be.hyprhost.online'

  const token = localStorage.getItem('_SPC_SSN_HASH')
  const userId = localStorage.getItem('_SPC_USER_ID')

  const axiosInstance = axios.create({
    baseURL: apiBaseUrl,
    timeout: AXIOS_TIMEOUT,
    validateStatus: () => true,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-user-id": userId
    },
  })

  axiosInstance.interceptors.request.use(
    async (requestConfig) => {
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`
      } else {
        requestConfig.headers.Authorization = ''
      }

      return requestConfig
    },
    (error) => {
      return Promise.reject(new Error(error))
    },
  )

  axiosInstance.interceptors.response.use(async (requestConfig) => {
    requestConfig.headers = {
      Authorization: `Bearer ${token}`, 
      Accept: 'application/json',
    }

    return requestConfig
  })

  return axiosInstance
}