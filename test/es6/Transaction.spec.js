import Transaction from "../../src/Transaction";
import Statuses from "../../src/Statuses";

describe("Transaction", function() {
  var trx;
  var stubRun;
  var stubCompensate;

  function makeInstance() {
    stubRun = sinon.stub();
    stubCompensate = sinon.stub();
    trx = new Transaction(stubRun, stubCompensate);
  }

  it("is a function (class)", function() {
    expect(Transaction).to.be.a("function");
  });

  it("can be constructed", function() {
    makeInstance();
    expect(trx).to.be.an.instanceof(Transaction);
  });

  describe("#run", function() {
    beforeEach(makeInstance);

    it("returns a promise", function() {
      return expect(trx.run()).to.eventually.be.fulfilled;
    });

    it("calls the run handler with all passed arguments", function() {
      const arg1 = Math.random();
      const arg2 = Math.random();
      const trxRun = trx.run(arg1, arg2);

      return trxRun.then(() => {
        expect(stubRun).to.have.been.calledOnce;
        expect(stubRun).to.have.been.calledWithExactly(arg1, arg2);
      });
    });

    it("resolves with an object with a status and data", function() {
      const trxRun = trx.run();

      return Promise.all([
        expect(trxRun).to.eventually.be.an("object"),
        expect(trxRun).to.eventually.have.property("status"),
        expect(trxRun).to.eventually.have.property("data"),
        expect(trxRun).to.eventually.be.fulfilled
      ]);
    });

    it("handles success by returning data and an success status", function() {
      const expectedResult = Math.random();

      stubRun.returns(Promise.resolve(expectedResult));

      const trxRun = trx.run();

      return Promise.all([
        expect(trxRun).to.eventually.have.property("status", Statuses.SUCCESS),
        expect(trxRun).to.eventually.have.property("data", expectedResult),
        expect(trxRun).to.eventually.be.fulfilled
      ]);
    });

    it("handles rejections by returning data and an error status", function() {
      const expectedResult = Math.random();

      stubRun.returns(Promise.reject(expectedResult));

      const trxRun = trx.run();

      return Promise.all([
        expect(trxRun).to.eventually.have.property("status", Statuses.ERROR),
        expect(trxRun).to.eventually.have.property("data", expectedResult),
        expect(trxRun).to.eventually.be.fulfilled
      ]);
    });
  });

  describe("#compensate", function() {
    beforeEach(makeInstance);

    it("returns a promise", function() {
      return expect(trx.compensate()).to.eventually.be.fulfilled;
    });

    it("calls the compensate handler with all passed arguments", function() {
      const arg1 = Math.random();
      const arg2 = Math.random();

      const trxRun = trx.compensate(arg1, arg2);

      return trxRun.then(() => {
        expect(stubCompensate).to.have.been.calledOnce;
        expect(stubCompensate).to.have.been.calledWithExactly(arg1, arg2);
      });
    });

    it("resolves with an object with a status and data", function() {
      const trxRun = trx.compensate();

      return Promise.all([
        expect(trxRun).to.eventually.be.an("object"),
        expect(trxRun).to.eventually.have.property("status"),
        expect(trxRun).to.eventually.have.property("data"),
        expect(trxRun).to.eventually.be.fulfilled
      ]);
    });

    it("handles success by returning data and an success status", function() {
      const expectedResult = Math.random();

      stubCompensate.returns(Promise.resolve(expectedResult));

      const trxRun = trx.compensate();

      return Promise.all([
        expect(trxRun).to.eventually.have.property("status", Statuses.SUCCESS),
        expect(trxRun).to.eventually.have.property("data", expectedResult),
        expect(trxRun).to.eventually.be.fulfilled
      ]);
    });

    it("handles rejections by returning data and an error status", function() {
      const expectedResult = Math.random();

      stubCompensate.returns(Promise.reject(expectedResult));

      const trxRun = trx.compensate();

      return Promise.all([
        expect(trxRun).to.eventually.have.property("status", Statuses.ERROR),
        expect(trxRun).to.eventually.have.property("data", expectedResult),
        expect(trxRun).to.eventually.be.fulfilled
      ]);
    });
  });

  describe(".all", function() {
    var trx1;
    var trx2;
    var trx1run;
    var trx1compensate;
    var trx2run;
    var trx2compensate;
    var trxAll;
    var trx1data;
    var trx2data;

    beforeEach(function() {
      trx1data = Math.random();
      trx1run = sinon.stub().returns(Promise.resolve(trx1data));
      trx1compensate = sinon.stub().returns(Promise.resolve(trx1data));
      trx2data = Math.random();
      trx2run = sinon.stub().returns(Promise.resolve(trx2data));
      trx2compensate = sinon.stub().returns(Promise.resolve(trx1data));

      trx1 = new Transaction(trx1run, trx1compensate);
      trx2 = new Transaction(trx2run, trx2compensate);

      trxAll = Transaction.all(trx1, trx2);
    });

    it("runs multiple Transactions in parallel", function() {
      const trxRun = trxAll.run();

      return Promise.all([
        expect(trxRun).to.eventually.be.fulfilled,
        trxRun.then(() => {
          expect(trx1run).to.have.been.calledOnce;
          expect(trx2run).to.have.been.calledOnce;
        })
      ]);
    });

    it("calls all transactions with the same arguments", function() {
      const trxAllArgs = [
        Math.random(),
        Math.random(),
        Math.random()
      ];

      const trxRun = trxAll.run(...trxAllArgs);

      return Promise.all([
        expect(trxRun).to.eventually.be.fulfilled,
        trxRun.then(() => {
          expect(trx1run).to.have.been.calledWithExactly(...trxAllArgs);
          expect(trx2run).to.have.been.calledWithExactly(...trxAllArgs);
        })
      ]);
    });

    it("returns the same type of meta object as a Transaction", function() {
      const expectedResult = [trx1data, trx2data];

      const trxRun = trxAll.run();

      return Promise.all([
        expect(trxRun).to.eventually.have.property("status")
          .that.equals(Statuses.SUCCESS),
        expect(trxRun).to.eventually.have.property("data")
          .that.is.an("array")
          .that.deep.equals(expectedResult)
      ]);
    });

    it("calls compensators of successful transactions if any fail", function() {
      const trxAllArgs = [
        Math.random(),
        Math.random(),
        Math.random()
      ];
      var trxRun = trxAll.run(...trxAllArgs);

      trx1run.returns(Promise.reject(trx1data));

      return Promise.all([
        expect(trxRun).to.eventually.be.fulfilled,
        trxRun.then(() => {
          expect(trx1run).to.have.been.calledOnce;
          expect(trx2run).to.have.been.calledOnce;
          expect(trx1compensate).not.to.have.been.called;
          expect(trx2compensate).to.have.been.calledOnce;
        })
      ]);
    });

    it("compensates all of its actions if called to do so", function() {
      const fakeErr = Math.random();
      const trxAllArgs = [
        Math.random(),
        Math.random(),
        Math.random()
      ];

      const trxRun = trxAll.run().then(function() {
        trxAll.compensate(fakeErr, ...trxAllArgs);
      });

      return Promise.all([
        expect(trxRun).to.eventually.be.fulfilled,
        trxRun.then(() => {
          expect(trx1compensate).to.have.been.calledOnce;
          expect(trx1compensate).to.have.been
            .calledWithExactly(trx1data, fakeErr, ...trxAllArgs);
          expect(trx2compensate).to.have.been
            .calledWithExactly(trx2data, fakeErr, ...trxAllArgs);
          expect(trx1run).to.have.been.calledOnce;
          expect(trx2run).to.have.been.calledOnce;
        })
      ]);
    });
  });
});
