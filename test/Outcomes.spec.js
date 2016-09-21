import Outcomes from "../src/Outcomes";

describe("Outcomes", function() {
  it("is an object keyed by strings, with the key as the value", function() {
    expect(Outcomes).to.be.an("object");
    Object.keys(Outcomes).forEach(key =>
      expect(Outcomes).to.have.ownProperty(key, key)
    );
  });
});
