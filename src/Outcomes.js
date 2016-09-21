const Statuses = [
  "COMPLETED",
  "COMPENSATED"
].reduce((acc, val) => Object.assign(acc, { [val]: val }), {});

export default Statuses;
