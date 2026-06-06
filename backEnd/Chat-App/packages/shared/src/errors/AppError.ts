export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string) {
    return new AppError(msg, 400);
  }

  static unauthorized(msg = "Unauthorized") {
    return new AppError(msg, 401);
  }

  static notFound(msg = "Not Found") {
    return new AppError(msg, 404);
  }
}
