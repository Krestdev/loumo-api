export interface CreateUserQuery {
  loginAfterCreate?: boolean;
  email: string;
  password: string;
}
