/*global describe,it,beforeEach,expect*/
describe("Component", function() {
  var C = window.Component.create({
    _namespace: "C",
    _events: {
      "click button":  "foo",
      "click .bar": "bar"
    },
    _references: {
      "button": "button",
      "bar"   : ".bar"
    },
    foo: function(data, event) {
      return 1;
    },
    bar: function(data, event) {
      return 2;
    }
  });

  beforeEach(function() {
    this.$component = $("#jasmine-fixtures .component");
  });

  describe("#create", function() {
    it("creates a constructor function", function() {
      var component = new C(this.$component);
      expect(component instanceof C).toBeTruthy();
    });

    it("defines a method _listen", function() {
      expect(C.prototype._listen instanceof Function).toBeTruthy();
    });

    it("defines a method _update", function() {
      expect(C.prototype._update instanceof Function).toBeTruthy();
    });

    it("lists all DOM accessible methods in _accessible", function() {
      expect(C.prototype._accessible).toContain("foo");
      expect(C.prototype._accessible).toContain("bar");
      expect(C.prototype._accessible).not.toContain("_namespace");
    });
  });
});
