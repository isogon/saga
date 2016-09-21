import bounce from "./bounce";

import Statuses from "./Statuses";

export default class Transaction {
  constructor(onRun, onCompensate) {
    this.onRun = onRun;
    this.onCompensate = onCompensate;
  }

  run(...args) {
    return Transaction._run(this.onRun, args);
  }

  compensate(...args) {
    return Transaction._run(this.onCompensate, args);
  }

  static _run(target, args) {
    return bounce(function() {
      return target(...args);
    }).then(result => ({
      status: Statuses.SUCCESS,
      data: result
    }), error => ({
      status: Statuses.ERROR,
      data: error
    }));
  }
}
