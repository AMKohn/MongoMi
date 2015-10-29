/**
 * The main app view
 */
define(["jquery", "backbone", "views/toolbar", "views/sidebar", "views/tabs"], function($, Backbone, Toolbar, Sidebar, Tabs) {
	var App = Backbone.View.extend({
		el: "body",

		Tabs: Tabs,
		Sidebar: Sidebar,
		Toolbar: Toolbar,

		initialize: function() {
			this.render();

			Tabs.collection.create();

			window.nwDispatcher.requireNwGui().Window.get().showDevTools();
		},

		render: function() {
			this.$main = $(document.createElement("main"));

			this.$main.append(this.Sidebar.$el, this.Tabs.$el);

			this.$el.append(this.Toolbar.$el, this.$main);
		}
	});

	return new App();
});