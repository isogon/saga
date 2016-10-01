const Promise = require("bluebird");

var fakeUserDb = new Map();
var usedUsers = new Set();
var fakeGroupDb = new Map();
var groupDbTickets = new Map();
var counter = 0;
var resetCounter = 0;
var fail = false;

module.exports = {
  userAdd(username) {
    if (usedUsers.has(username)) {
      return Promise.reject(new Error("User already in database"));
    }

    const uid = counter++;
    usedUsers.add(username);
    fakeUserDb.put(uid, username);

    return Promise.resolve({uid});
  }

  userDel(uid) {
    if (!fakeUserDb.has(uid)) {
      return Promise.reject(new Error("UID is not in database"));
    }

    usedUsers.delete(fakeUserDb.get(uid));
    fakeUserDb.delete(uid);
  },

  addToGroup(uid, groupName) {
    if (fail) {
      return Promise.reject(new Error("An unknown error has occurred"));
    }

    if (!fakeUserDb.has(uid)) {
      return Promise.reject(new Error("UID does not exist"));
    }

    const operatingSet = fakeGroupDb.get(groupName) || new Set();

    if (operatingSet.has(uid)) {
      return Promise.reject(new Error("User is already in this group"));
    }

    const membershipTicket = counter++;
    groupDbTickets.set(membershipTicket, {uid, groupName});

    operatingSet.add(uid);

    fakeGroupDb.set(groupName, operatingSet);

    return Promise.resolve({membershipTicket});
  },

  deleteFromGroup(membershipTicket) {
    if (!groupDbTickets.has(membershipTicket)) {
      return Promise.reject(new Error("Membership ticket does not exist"));
    }

    const ticketContent = groupDbTickets.get(membershipTicket);
    const { uid, groupName } = ticketContent;

    if (!fakeUserDb.has(uid)) {
      return Promise.reject(new Error("UID does not exist"));
    }

    if (!fakeGroupDb.has(groupName)) {
      return Promise.reject(new Error("Group does not exist"));
    }

    const operatingSet = fakeGroupDb.get(groupName);

    if (!operatingSet.has(uid)) {
      return Promise.reject(new Error("User is not in group."));
    }

    operatingSet.delete(uid);

    return Promise.resolve(ticketContent);
  },

  toggleGroupFailures() {
    return fail = !fail;
  },

  reset() {
    fakeUserDb = new Map();
    usedUsers = new Set();
    fakeGroupDb = new Map();
    groupDbTickets = new Map();
    counter = (++resetCounter) * 10000;
    fail = false;
  }
};



































