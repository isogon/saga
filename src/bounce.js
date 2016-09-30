// @flow

import Promise from "bluebird";

export default function bounce(thing: mixed, fail: boolean = false) {
  return new Promise((resolve, reject) => process.nextTick(function() {
    (fail === true
      ? reject
      : resolve)(typeof thing === "function"
      ? thing()
      : thing);
  }));
}
