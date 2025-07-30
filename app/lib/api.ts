// app/lib/api.ts
const API_BASE_URL = 'http://172.16.0.12:5266'

export interface LoginRequest {
  identifier: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  username: string
  password: string
}

export interface LoginMethod {
  id: string
  code: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export const authApi = {
  // Get active login methods for the login form
  getActiveLoginMethods: async (): Promise<LoginMethod[]> => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/login-methods/active`)
    const data = await response.json()
    return data.data
  },

  // Login user
  login: async (credentials: LoginRequest) => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }
    
    const data = await response.json()
    return data.data // Contains accessToken and accessTokenExpiresAt
  },

  // Register new user
  register: async (userData: RegisterRequest) => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }
    
    return await response.json()
  },

  // Refresh token
  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/token-refresh`, {
      method: 'POST',
      credentials: 'include', // Important for HTTP-only cookies
    })
    
    const data = await response.json()
    return data.data
  }
}