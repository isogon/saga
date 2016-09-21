const Statuses = [
  "SUCCESS",
  "ERROR"
].reduce((acc, val) => Object.assign(acc, { [val]: val }), {});

export default Statuses;
