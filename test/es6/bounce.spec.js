import bounce from "../../src/bounce";

describe("bounce", function() {
  var bounced;
  var expectedResult;

  beforeEach(() => {
    expectedResult = Math.random();
    bounced = sinon.stub().returns(expectedResult);
  });

  it("defers execution of a function", function(done) {
    bounce(done);
  });

  it("returns a promise", function() {
    return expect(bounce(sinon.stub())).to.eventually.be.fulfilled;
  });

  it("returns the result of the function in a promise", function() {
    return expect(bounce(bounced)).to.eventually.equal(expectedResult);
  });

  it("gets called with no arguments", function() {
    return bounce(bounced).then(() => {
      expect(bounced).to.have.been.calledOnce;
      expect(bounced).to.have.been.calledWithExactly();
    });
  });
});
