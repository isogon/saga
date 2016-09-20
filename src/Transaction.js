import Promise from "bluebird";

import bounce from "./bounce";

import Statuses from "./Statuses";

export default class Transaction {
  constructor(onRun, onCompensate) {
    this.onRun = onRun;
    this.onCompensate = onCompensate;
  }

  run(...args) {
    return this._run(this.onRun, args);
  }

  compensate(...args) {
    return this._run(this.onCompensate, args);
  }

  _run(target, args) {
    return Promise.resolve(target(...args)).then(result => {
      return {
        status: Statuses.SUCCESS,
        data: result
      }
    }, error => {
      return {
        status: Statuses.ERROR,
        data: error
      };
    });
  }
};
