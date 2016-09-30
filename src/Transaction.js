// @flow

import bounce from "./bounce";
import Statuses from "./Statuses";
import TransactionResult from "./TransactionResult";

//const EMPTY_ARRAY_LENGTH = 0;

type Transactable = (...args: any) => Promise<any>;

export default class Transaction {
  onRun: Transactable
  onCompensate: Transactable
  constructor(onRun: Transactable, onCompensate: Transactable) {
    this.onRun = onRun;
    this.onCompensate = onCompensate;
  }

  run(...args: any): Promise<TransactionResult> {
    const context = {};

    return bounce(() => Reflect.apply(this.onRun, context, args))
      .then(data => ({
        data,
        status: Statuses.SUCCESS
      }), data => ({
        data,
        status: Statuses.ERROR
      }))
      .then(({ data, status }) => new TransactionResult(
        this,
        args,
        context,
        status,
        data
      ));
  }

  static all(...transactions: Array<Transaction>): Transaction {
    return new Transaction(function(...args: any) {
      return Promise.all(
        transactions.map(transaction => transaction.run(args))
      );
    }, function(resultSet: Array<TransactionResult>, upstreamError: mixed) {
      return Promise.all(
        resultSet.map(result => result.compensate(upstreamError))
      );
    });
  }

  static fromSaga(): void {
    //TODO
  }
}
