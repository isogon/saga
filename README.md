Saga.js
=======

What is a saga?
===============
A saga is a sequence of actions whose outcome can be thought of as either wholly
succeeding, or wholly failing.

In practice a saga is composed of multiple actions, each of which has a
compensating action which can be run to undo any changes that were made in the
action. This is a useful pattern for having transaction-like semantics for
services you do not control, microservices where ACID transactions are not
possible, implementing pseudo-transactions across databases, or anything else
that your application does and want to be sure cleans up after itself upon
failure.

Usage
=====
These examples use ES6 and node.js, the library is compiled to work with ES5,
and even in the browser. (See the dist folder if you want a browser bundle, the
build folder if you want to see what code gets run by node/commonjs, and the src
folder if you want the es6 source files.)

```js
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
```

Further reading
===============

* [the original paper on sagas](http://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf),
* [s comparison between sagas and things mistakenly called sagas](http://kellabyte.com/2012/05/30/clarifying-the-saga-pattern/)

FAQs
====

Isn't this just a workflow?
---------------------------

Maybe? This library provides for some degree of coordination and sequence to the
transactions within a saga.

This library passes along the result of previous transactions, and whether you
use the results or not is up to you.

You keep saying transaction, what do you mean by that?
------------------------------------------------------

In this library a transaction is the unit of an action and a compensating action
to undo whatever the action would do. You compose multiple transactions into a
saga.

Things that need doing
======================
1. More examples.
1. More testing.
1. More test configurations (different node environments, different browsers, etc)
1. CI, probablt of the travis variety
