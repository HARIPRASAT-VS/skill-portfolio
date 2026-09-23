export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  token?: string;
}

export interface LoginCredentials {
  email?: string;
  password?: string;
}

export interface RegisterCredentials {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  data: User;
  message?: string;
}
