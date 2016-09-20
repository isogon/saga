import Transaction from "../src/Transaction";
import Statuses from "../src/Statuses";

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
    xit("runs multiple Transactions in parallel", function() {
    })
  });
});
