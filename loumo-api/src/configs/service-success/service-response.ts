/* eslint-disable @typescript-eslint/no-explicit-any */

import { ServiceError } from "../index.js";

export default class ServiceResponse {
  errorMessage?: string;
  message?: string;
  statusCode?: number;
  data?: any;
  error?: ServiceError;

  constructor(data: {
    message?: string;
    errorMessage?: string;
    data?: any;
    statusCode?: number;
    error?: ServiceError;
  }) {
    this.errorMessage = data.errorMessage;
    this.message = data.message;
    this.data = data.data;
    this.statusCode = data.statusCode;
    this.error = data.error;
  }
}
