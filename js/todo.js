/*global $*/
(function(exports) {
  "use strict";

  function Component() {}
  Component.create = function(definition) {
    var initializer = definition.initialize || $.noop,
        constructor;

    delete definition.initialize;

    function Constructor() {
      var args = [].slice.call(arguments);

      if (args.length > 0) {
        this.$root = $(args.shift());
      } else {
        this.$root = $({});
      }

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

    for (method in definition) {
      if ($.isFunction(definition[method]) && isPublic.test(method)) {
        DOMAccessible.call(definition, method);
        definition._accessible.push(method);
      }
    }

    definition._listen = listen;

    return definition;
  }

  function DOMAccessible(method) {
    var fn = this[method];

    this[method] = function(data, event) {
      var retval;

      this.$root.trigger("before-" + method, {source: this});
      retval = fn.call(this, data, event);
      this.$root.trigger("after-" + method, {source: this});

      return retval;
    };

    this[":on:"+method] = function(event, data) {
      this[method].call(this, data, event);
    };
  }

  function listen() {
    var event, descriptor, handler;

    this.$root.off("." + this._namespace);

    this._accessible.forEach(function(event) {
      this.$root.on("do-" + event + "." + this._namespace,
                    this[":on:"+event].bind(this));
    }, this);

    for (event in this._events) {
      descriptor = event.split(/\s+/);
      if (descriptor.length < 2) continue;
      handler    = this[this._events[event]].bind(this);

      this.$root.on(descriptor[0] + "." + this._namespace,
                    descriptor[1],
                    createEventHandler(handler));

    }
  }

  function createEventHandler(handler) {
    return function(event, data) {
      return handler(data, event);
    };
  }

  exports.Component = Component;
}(window));

$(function() {
  var TodoItem = window.Component.create({
    _namespace: "todo-list",
    _events: {
      "change .todo-item-done": "toggle"
    },
    initialize: function(options) {
      var self = this;
      this.$done = this.$root.find(".todo-item-done");
    },
    toggle: function(data, event) {
      if (this.$done.is(":checked")) {
        this.markDone();
      } else {
        this.markNotDone();
      }
    },
    markNotDone: function(data, event) {
      this.$root.removeClass("is-done").addClass("is-not-done");
    },
    markDone: function(data, event) {
      this.$root.addClass("is-done").removeClass("is-not-done");
    },
    remove: function(data, event) {
      this.$root.remove();
    }
  });
  var TodoList = window.Component.create({
    _namespace: "todo-list",
    _events: {
      "click .action-delete"   : "removeItem",
      "submit .action-create"  : "addItem",
      "after-toggle .todo-item": "count"
    },
    initialize: function(options) {
      var self = this;

      this.$items = this.$root.find(".todo-item-list");
      this.$total = this.$root.find(".todo-list-total-count");
      this.$done  = this.$root.find(".todo-list-done-count");
      this.$content = this.$root.find(".action-create [name=content]");
      this._template = this.$root.find(".todo-item-template").html();
    },
    addItem: function(data, event) {
      var $el = $(this._template),
          content =(data && data.content) || this.$content.val();

      new TodoItem($el);

      $el.find(".todo-item-content").text(content);

      this.$items.append($el);
      this.$content.val("");
      this.count();

      event.preventDefault();
    },
    removeItem: function(data, event) {
      $(event.target).trigger("do-remove");
      this.count();
    },
    count: function(data, event) {
      this.$total.text(this.$items.find(".todo-item").length);
      this.$done.text(this.$items.find(".todo-item.is-done").length);
    }
  });

  window.Component.TodoItem = TodoItem;
  window.Component.TodoList = TodoList;

  new TodoList(".todo-list");
  window.$list = $(".todo-list");
});
