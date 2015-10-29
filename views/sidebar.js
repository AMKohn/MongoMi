/**
 * The sidebar
 */
define(["backbone", "hogan.js", "views/tabs", "models/sidebar", "text!templates/sidebar.hjs"], function(Backbone, Hogan, Tabs, Model, template) {
	var Sidebar = Backbone.View.extend({
		tagName: "nav",
		className: "sidebar",

		events: {
			"click .tabs li[data-type]": function(e) {
				console.log("Sidebar click: Type: %s ID: %s", e.currentTarget.getAttribute("data-type"), e.currentTarget.getAttribute("data-id"));
			}
		},

		initialize: function() {
			this.model = new Model();

			this.model.on("change", this.render, this);

			this.render();
		},

		template: Hogan.compile(template),

		render: function() {
			this.$el.html(this.template.render(this.model.toJSON()));
		}
	});

	return new Sidebar();
});