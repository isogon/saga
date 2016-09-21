import Promise from "bluebird";

export default function bounce(fn, fail = false) {
  return new Promise((resolve, reject) => process.nextTick(function() {
    (fail === true
      ? reject
      : resolve)(fn());
  }));
}
