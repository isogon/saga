// @flow

export default class ExtendableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export class SagaError extends ExtendableError {
  results: any
  constructor(results: any) {
    super("The saga encountered an error.");
    this.results = results;
  }
}

export class TransactionError extends ExtendableError {
}
