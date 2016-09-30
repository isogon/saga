// @flow

import bounce from "./bounce";
import Transaction from "./Transaction";
import Statuses from "./Statuses";
import Outcomes from "./Outcomes";
import { TransactionError } from "./Errors";

import type { Outcome } from "./Outcomes.js";
import type { Status } from "./Statuses.js";

const ALREADY_COMPENSATED = "This transaction has already been compensated.";
const CANNOT_COMPENSATE = "This transaction failed and cannot be compensated.";

export default class TransactionResult {
  transaction: Transaction
  args: Array<mixed>
  context: Object
  status: Status
  outcome: Outcome
  data: mixed

  constructor(
    transaction: Transaction,
    args: Array<mixed>,
    context: Object,
    status: Status,
    data: mixed
  ) {
    this.outcome = Outcomes.COMPLETED;
    this.transaction = transaction;
    this.args = args;
    this.context = context;
    this.status = status;
    this.data = data;
  }

  compensate(upstreamError: mixed): Promise<TransactionResult> {
    if (this.outcome === Outcomes.COMPENSATED) {
      return bounce(new TransactionError(ALREADY_COMPENSATED), true);
    }

    if (this.status === Statuses.ERROR) {
      return bounce(new TransactionError(CANNOT_COMPENSATE), true);
    }

    const compensateArgs = [this.data, upstreamError, ...this.args];

    return Reflect.apply(
      this.transaction.onCompensate,
      this.context,
      compensateArgs
    ).then(() => this);
  }
}
