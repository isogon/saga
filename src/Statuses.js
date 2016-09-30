// @flow

const Statuses = {
  SUCCESS: "SUCCESS",
  ERROR: "ERROR"
};

export type Status = $Keys<typeof Statuses>; //eslint-disable-line no-undef

export default Statuses;
