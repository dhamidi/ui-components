/*global describe,it,beforeEach,afterEach,expect,spyOn,jasmine*/
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

  describe("a created component", function() {
    beforeEach(function() {
      this.instance = new C(this.$component);
    });

    it("assigns the first constructor argument to this.$root", function() {
      expect(this.instance.$root[0]).toBe(this.$component[0]);
    });

    describe("_references", function() {
      it("has an instance variable for each reference", function() {
        expect(this.instance.$button[0])
          .toBe(this.$component.find("button")[0]);
        expect(this.instance.$bar[0])
          .toBe(this.$component.find(".bar")[0]);
      });
    });

    describe("_namespace", function() {
      it("namespaces events with _namespace", function() {
        this.$component.off(".C");
        spyOn(this.instance, "foo");
        this.$component.trigger("do-foo");
        expect(this.instance.foo).not.toHaveBeenCalled();
      });
    });

    describe("_events", function() {
      it("sets up event handlers for the keys", function() {
        var spy = jasmine.createSpy("foo");
        this.$component.on("after-foo", spy);
        this.$component.find("button").trigger("click");
        expect(spy).toHaveBeenCalled();
      });
    });

    describe("listening to and triggering events", function() {
      it("exposes each method via event handlers", function() {
        ["foo", "bar"].forEach(function(method) {
          spyOn(this.instance, method);
          this.$component.trigger("do-" + method);
          expect(this.instance[method]).toHaveBeenCalled();
        }, this);
      });

      it("triggers an event before calling a method", function() {
        var spy = jasmine.createSpy("beforeFoo");
        this.$component.on("before-foo", spy);
        this.instance.foo();
        expect(spy).toHaveBeenCalled();
      });

      it("triggers an event after calling a method", function() {
        var spy = jasmine.createSpy("afterFoo");
        this.$component.on("after-foo", spy);
        this.instance.foo();
        expect(spy).toHaveBeenCalled();
      });

      it("provides the instance as 'source' to the event handler", function() {
        var spy = jasmine.createSpy("afterFoo"),
            args;

        this.$component.on("after-foo", spy);
        this.instance.foo();

        args = spy.calls.argsFor(0);

        expect(args.length).toBe(2);
        expect(args[0] instanceof $.Event).toBeTruthy();
        expect(args[1]).toEqual({source: this.instance});
      });
    });


  });
});
