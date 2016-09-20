import Promise from "bluebird";
import go from "just-next-tick";

export default function bounce(fn, fail = false) {
  return new Promise((resolve, reject) => go(function() {
    (fail === true ? reject : resolve)(fn());
  }));
};
