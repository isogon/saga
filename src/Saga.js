// @flow

import Promise from "bluebird";

import bounce from "./bounce";

import { SagaError } from "./Errors";
import Statuses from "./Statuses";
import Outcomes from "./Outcomes";
import Transaction from "./Transaction";

import TransactionResult from "./TransactionResult";

const EMPTY_ARRAY_LENGTH = 0;
const STARTING_ARRAY_INDEX = 0;

export default class Saga {
  transactions: Array<Transaction>
  constructor(...transactions: Array<Transaction>) {
    this.transactions = transactions;
  }

  //Lots of local scope in here, because we can run the same saga multiple times
  //possibly with different arguments
  run(...args: Array<mixed>): Promise<TransactionResult> {
    const toRun = this.transactions.slice(STARTING_ARRAY_INDEX);
    const previousResults = [];

    Promise.mapSeries(toRun, transaction: Transaction => {
      return transaction.run().then(result: TransactionResult => {
        if (result.status === Statuses.ERROR) {
          return Promise.reject(result)
        }

        previousResults.push(result);

        return result;
      })
    }).then((data) => {
      return new SagaResult(
        this,
        args,
        Statuses.SUCCESS,
        data
      );
    }, function(data) {

    })



    return bounce(runNext);
  }
}
