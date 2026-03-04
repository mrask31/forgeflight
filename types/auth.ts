export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
