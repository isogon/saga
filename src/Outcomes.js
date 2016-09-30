// @flow

const Outcomes = {
  COMPLETED: "COMPLETED",
  COMPENSATED: "COMPENSATED"
};

export type Outcome = $Keys<typeof Outcomes>; //eslint-disable-line no-undef

export default Outcomes;
