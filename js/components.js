/*global $*/
(function(exports) {
  "use strict";

  function Component() {}
  Component.create = function(definition) {
    var initializer = definition.initialize || $.noop;

    delete definition.initialize;

    function Constructor() {
      var args = [].slice.call(arguments);

      if (args.length > 0) {
        this.$root = $(args.shift());
      } else {
        this.$root = $({});
      }

      this._update();
      initializer.apply(this, args);
      this._listen();
    }
    Constructor.prototype = createPrototype(definition);

    return Constructor;
  };

  function createPrototype(definition) {
    var method   = "",
        isPublic = /^[a-z]/;

    definition._accessible = [];
    definition._events     = $.extend({}, definition._events);
    definition._references = $.extend({}, definition._references);

    for (method in definition) {
      if ($.isFunction(definition[method]) && isPublic.test(method)) {
        DOMAccessible.call(definition, method);
        definition._accessible.push(method);
      }
    }

    definition._listen = listen;
    definition._update = updateReferences;

    return definition;
  }

  function DOMAccessible(method) {
    var fn = this[method];

    this[method] = function(data, event) {
      var retval, context = { source: this };

      this.$root.trigger("before-" + method, context);
      retval = fn.call(this, data, event);
      context.returnValue = retval;
      this.$root.trigger("after-" + method, context);

      return retval;
    };

    this[":on:"+method] = function(event, data) {
      this[method].call(this, data, event);
    };
  }

  function updateReferences() {
    var refname, selector;

    for (refname in this._references) {
      selector = this._references[refname];
      this["$" + refname] = this.$root.find(selector);
    }
  }

  function listen() {
    this.$root.off("." + this._namespace);

    exposeMethods(this, this._accessible);
    bindEvents(this, this._events);
  }

  function exposeMethods(instance, eventList) {
    var ns = "." + instance._namespace;

    eventList.forEach(function(event) {
      instance.$root.on("do-" + event + ns,
                        instance[":on:"+event].bind(instance));
    }, instance);
  }

  function bindEvents(instance, eventMap) {
    var eventHandler, eventName, descriptor, handlerFn,
        ns = "." + instance._namespace;

    for (eventName in eventMap) {
      eventHandler = eventMap[eventName];
      descriptor   = eventName.split(/\s+/);

      if (descriptor.length < 2) continue;

      handlerFn    = instance[eventHandler].bind(instance);

      instance.$root.on(descriptor[0] + ns,
                    descriptor.slice(1).join(" "),
                    createEventHandler(handlerFn));
    }
  }

  function createEventHandler(handler) {
    return function(event, data) {
      return handler(data, event);
    };
  }

  exports.Component = Component;
}(window));
