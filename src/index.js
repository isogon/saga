import Saga from "./Saga";
import Transaction from "./Transaction";
import Outcomes from "./Outcomes";
import Statuses from "./Statuses";

export { Saga, Transaction, Outcomes, Statuses };

const chainCreate = new Saga(
  new Transaction(function(previousResults, fooArg, barArg) {
    return Foo.create(fooArg);
  }, function(ownResult, upstreamError) {
    return Foo.remove({
      _id: ownResult._id
    });
  }),
  new Transaction(function(previousResults, fooArg, barArg) {
    const createdFoo = previousResults.slice(-1)[0];
    return Bar.create(Object.assign({}, barArg, {
      foo: createdFoo._id
    })).then(null, (err) => {
      //do any necessary immediate cleanup here
      //doing this is probably not necessary in most cases

      //you must re-throw the error so the promise is rejected
      //and saga can handle your promise
      throw err;
    });
  }, function(ownResult, upstreamError) {

  })
);

chainCreate.run({
  fooVal: "hello"
}, {
  barVal: "world"
}).then(function() {

}, function() {

});
