/* global window: true */

describe("Saga", function() {
  function bounce(thing, fail) {
    return new Promise(function(resolve, reject) {
      window.setTimeout(function() {
        const action = fail === true
          ? reject
          : resolve;

        return action(thing);
      }, 0);
    });
  }

  it("exists", function() {
    expect(window.sagajs).to.be.an("object");
    expect(window.sagajs.Saga).to.be.a("function");
    expect(window.sagajs.Transaction).to.be.a("function");
  });

  it("works in the browser", function() {
    const Saga = window.sagajs.Saga;
    const Transaction = window.sagajs.Transaction;

    const trx2result = Math.random();
    const trx2run = sinon.stub().returns(bounce(trx2result, true));

    const trx1result = Math.random();
    const trx1run = sinon.stub().returns(bounce(trx1result));
    const trx1compensation = Math.random();
    const trx1compensate = sinon.stub().returns(bounce(trx1compensation));

    const trx2 = new Transaction(trx2run);
    const trx1 = new Transaction(trx1run, trx1compensate);

    const saga = new Saga(trx1, trx2);
    const sagaInput = Math.random();
    const sagaRun = saga.run(sagaInput);

    return Promise.all([
      expect(sagaRun).to.eventually.be.rejected,
      sagaRun.then(null, function() {
        expect(trx1compensate).to.have.been.calledOnce;
        expect(trx1compensate).to.have.been
          .calledWithExactly(trx1result, trx2result, sagaInput);
        expect(trx1run).to.have.been.calledOnce;
        expect(trx1run).to.have.been
          .calledWithExactly([], sagaInput);
        expect(trx2run).to.have.been.calledOnce;
        expect(trx2run).to.have.been
          .calledWithExactly([trx1result], sagaInput);
      })
    ]);
  });
});
