export interface UserProfile {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: Date;
  gender: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSignupData {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: Date;
  gender: string;
  email: string;
  password: string;
}
