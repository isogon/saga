import Saga from "../../src/Saga";
import Outcomes from "../../src/Outcomes";
import Statuses from "../../src/Statuses";

describe("Saga", function() {
  var firstTrxRet;
  var secondTrxRet;
  var firstTrx;
  var secondTrx;
  var saga;

  function makeInstance() {
    firstTrxRet = {
      status: Statuses.SUCCESS,
      data: Math.random()
    };
    firstTrx = {
      run: sinon.stub().returns(Promise.resolve(firstTrxRet)),
      compensate: sinon.stub().returns(Promise.resolve(firstTrxRet))
    };

    secondTrxRet = {
      status: Statuses.SUCCESS,
      data: Math.random()
    };
    secondTrx = {
      run: sinon.stub().returns(Promise.resolve(secondTrxRet)),
      compensate: sinon.stub().returns(Promise.resolve(secondTrxRet))
    };

    saga = new Saga(firstTrx, secondTrx);
  }

  it("is a function (class)", function() {
    expect(Saga).to.be.a("function");
  });

  it("can be constructed", function() {
    makeInstance();
    expect(saga).to.be.an.instanceof(Saga);
  });

  describe("#run", function() {
    beforeEach(makeInstance);

    it("returns a promise", function(done) {
      saga.run().then(function() {
        done();
      }, function() {
        done();
      });
    });

    it("the promise resolves to outcomes", function() {
      const sagaRun = saga.run();

      return Promise.all([
        expect(sagaRun).to.eventually.be.an("array")
          .that.has.length(2),
        expect(sagaRun).to.eventually.have.deep.property("[0]")
          .that.is.an("object")
          .that.has.property("status")
          .that.equals(Statuses.SUCCESS),
        expect(sagaRun).to.eventually.have.deep.property("[0]")
          .that.is.an("object")
          .that.has.property("outcome")
          .that.equals(Outcomes.COMPLETED),
        expect(sagaRun).to.eventually.have.deep.property("[0]")
          .that.is.an("object")
          .that.has.property("data")
          .that.equals(firstTrxRet.data),
        expect(sagaRun).to.eventually.have.deep.property("[1]")
          .that.is.an("object")
          .that.has.property("status")
          .that.equals(Statuses.SUCCESS),
        expect(sagaRun).to.eventually.have.deep.property("[1]")
          .that.is.an("object")
          .that.has.property("outcome")
          .that.equals(Outcomes.COMPLETED),
        expect(sagaRun).to.eventually.have.deep.property("[1]")
          .that.is.an("object")
          .that.has.property("data")
          .that.equals(secondTrxRet.data)
      ]);
    });

    it("calls all transaction runs", function() {
      return saga.run().then(function() {
        expect(firstTrx.run).to.have.been.calledOnce;
        expect(secondTrx.run).to.have.been.calledOnce;
      });
    });

    it("calls previous transaction compensates on failure", function() {
      const sagaRun = saga.run();

      secondTrx.run = sinon.stub().returns(Promise.resolve(
        Object.assign({}, secondTrxRet, { status: Statuses.FAILURE })
      ));

      return Promise.all([
        expect(sagaRun).to.eventually.be.rejected,
        sagaRun.then(null, function() {
          expect(firstTrx.run).to.have.been.calledOnce;
          expect(secondTrx.run).to.have.been.calledOnce;
          expect(firstTrx.compensate).to.have.been.calledOnce;
        })
      ]);
    });

    it("calls `Transaction.run`s with args and previous results", function() {
      const firstArg = Math.random();
      const secondArg = Math.random();
      const sagaRun = saga.run(firstArg, secondArg);

      return Promise.all([
        expect(sagaRun).to.eventually.be.fulfilled,
        sagaRun.then(function() {
          expect(firstTrx.run).to.have.been.calledOnce;
          expect(firstTrx.run).to.have.been
            .calledWithExactly([], firstArg, secondArg);
          expect(secondTrx.run).to.have.been.calledOnce;
          expect(secondTrx.run).to.have.been
            .calledWithExactly([firstTrxRet.data], firstArg, secondArg);
        })
      ]);
    });

    it("calls `Transaction.compensate`s with args, failure, and correlated .run result", function() {
      const firstArg = Math.random();
      const secondArg = Math.random();

      secondTrx.run = sinon.stub().returns(Promise.resolve(
        Object.assign({}, secondTrxRet, { status: Statuses.FAILURE })
      ));

      const sagaRun = saga.run(firstArg, secondArg);

      return Promise.all([
        expect(sagaRun).to.eventually.be.rejected,
        sagaRun.then(null, function() {
          expect(firstTrx.run).to.have.been.calledOnce;
          expect(firstTrx.run).to.have.been
            .calledWithExactly([], firstArg, secondArg);
          expect(secondTrx.run).to.have.been.calledOnce;
          expect(secondTrx.run).to.have.been
            .calledWithExactly([firstTrxRet.data], firstArg, secondArg);
          expect(firstTrx.compensate).to.have.been.calledOnce;
          expect(firstTrx.compensate).to.have.been
            .calledWithExactly(
              firstTrxRet.data,
              secondTrxRet.data,
              firstArg,
              secondArg
            );
        })
      ]);
    });
  });
});
