/**
 * Interfaces que representan los DTOs (Data Transfer Objects)
 * definidos en el backend.
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}