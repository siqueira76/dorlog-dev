export interface User {
  id: string;
  name: string;
  email: string;
  provider: 'email' | 'google';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}
