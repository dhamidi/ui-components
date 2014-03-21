$(function() {
  var TodoItem = window.Component.create({
    _namespace: "todo-list",
    _references: {
      "done": ".todo-item-done"
    },
    _events: {
      "change .todo-item-done": "toggle"
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
    _references: {
      "items":    ".todo-item-list",
      "total":    ".todo-list-total-count",
      "done":     ".todo-list-done-count",
      "content":  ".action-create [name=content]",
      "template": ".todo-item-template"
    },
    _events: {
      "click .action-delete"   : "removeItem",
      "submit .action-create"  : "addItem",
      "after-toggle .todo-item": "count"
    },
    initialize: function(options) {
      var self = this;

      this._template = this.$template.html();
    },
    addItem: function(data, event) {
      var $el = $(this._template),
          content = (data && data.content) || this.$content.val();

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
});
