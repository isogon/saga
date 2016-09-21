import bounce from "./bounce";

import SagaError from "./SagaError";
import Statuses from "./Statuses";
import Outcomes from "./Outcomes";

const EMPTY_ARRAY_LENGTH = 0;
const STARTING_ARRAY_INDEX = 0;

export default class Saga {
  constructor(...transactions) {
    this.transactions = transactions;
  }

  //Lots of local scope in here, because we can run the same saga multiple times
  //possibly with different arguments
  run(...args) {
    const toRun = this.transactions.slice(STARTING_ARRAY_INDEX);
    const previousResults = [];
    const previousCompensationResults = [];
    const previouslyRan = [];
    var compensatingFor = null;

    function compensateNext() {
      if (previouslyRan.length === EMPTY_ARRAY_LENGTH) {
        return bounce(function() {
          return new SagaError(previousCompensationResults.map(result =>
            Object.assign({}, result, { outcome: Outcomes.COMPENSATED })
          ));
        }, true);
      }
      const currentlyCompensating = previouslyRan.pop();
      const currentCompensationResult = previousResults.pop();

      return currentlyCompensating.compensate(currentCompensationResult.data,
        compensatingFor, ...args).then(result => {
          previousCompensationResults.unshift(result);

          return bounce(compensateNext);
        });
    }
    function runNext() {
      if (toRun.length === EMPTY_ARRAY_LENGTH) {
        return bounce(function() {
          return previousResults.map(result =>
            Object.assign({}, result, { outcome: Outcomes.COMPLETED })
          );
        });
      }
      const currentlyRunning = toRun.shift();

      return currentlyRunning.run(previousResults.map(previousResult =>
          previousResult.data
        ), ...args).then(result => {
          if (result.status === Statuses.SUCCESS) {
            previouslyRan.push(currentlyRunning);
            previousResults.push(result);

            return bounce(runNext);
          }

          compensatingFor = result.data;

          return bounce(compensateNext);
        });
    }

    return bounce(runNext);
  }
}
