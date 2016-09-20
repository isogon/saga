import Promise from "bluebird";

import bounce from "./bounce";

import SagaError from "./SagaError";
import Statuses from "./Statuses";
import Outcomes from "./Outcomes";

export default class Saga {
  constructor(...transactions) {
    this.transactions = transactions;
  }

  //Lots of local scope in here, because we can run the same saga multiple times
  //possibly with different arguments
  run(...args) {
    const toRun = this.transactions.slice(0);
    const previousResults = [];
    const previousCompensationResults = [];
    const previouslyRan = [];
    var compensatingFor = null;
    function compensateNext() {
      if (previouslyRan.length === 0) {
        return bounce(_=>new SagaError(previousCompensationResults.map(result => Object.assign({}, result, {
          outcome: Outcomes.COMPENSATED
        }))), true);
      }
      const currentlyCompensating = previouslyRan.pop();
      const currentCompensationResult = previousResults.pop();
      return currentlyCompensating.compensate(currentCompensationResult.data, compensatingFor, ...args).then(result => {
        previousCompensationResults.unshift(result);
        return bounce(compensateNext);
      });
    }
    function runNext() {
      if (toRun.length === 0) {
        return bounce(_=>previousResults.map(result => Object.assign({}, result, {
          outcome: Outcomes.COMPLETED
        })));
      }
      const currentlyRunning = toRun.shift();
      return currentlyRunning.run(previousResults.map(previousResult => previousResult.data), ...args).then(result => {
        if (result.status === Statuses.SUCCESS) {
          previouslyRan.push(currentlyRunning);
          previousResults.push(result);
          return bounce(runNext);
        }

        compensatingFor = result.data;
        return bounce(compensateNext);
      }, (e) => {
        console.log("error?");
        console.log(e);
      });
    }
    return bounce(runNext);
  }
};
