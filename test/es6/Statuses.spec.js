import Statuses from "../../src/Statuses";

describe("Statuses", function() {
  it("is an object keyed by strings, with the key as the value", function() {
    expect(Statuses).to.be.an("object");
    Object.keys(Statuses).forEach(key =>
      expect(Statuses).to.have.ownProperty(key, key)
    );
  });
});
