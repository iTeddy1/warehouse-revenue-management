// src/lib/api-client.ts
import axios from 'axios'

// 1. Setup Base URL chuẩn
// Backend Phase 1 chạy ở port 4000
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
