const Promise = require("bluebird");

const { Saga, Transaction } = require("../build");
const { userAdd, userDel, addToGroup, deleteFromGroup } = require("./some-library");

const createUser = new Transaction(

  //This runs to do some simple part of an action
  (previousResults, username) => userAdd(username)
    .then(uid => ({uid, username})),

  //This runs if it needs to be undone
  ({uid}) => userDel(uid));

const addUserToGroup = new Transaction(
  ([{uid}], username, groupName) => addToGroup(uid, groupName)
    .then((membershipTicket) => ({uid, groupName, membershipTicket})),
  ({membershipTicket}) => deleteFromGroup(membershipTicket));

const newUserSaga = new Saga(createUser, addUserToGroup);

export default function(username, memberGroup) {
  return newUserSaga.run(username, memberGroup);
}
