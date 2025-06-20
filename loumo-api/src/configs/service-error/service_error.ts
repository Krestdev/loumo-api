export default class ServiceError extends Error {
  errorData?: unknown;
  constructor(message: string, data: unknown) {
    super(message);
    this.errorData = data;
  }
}
