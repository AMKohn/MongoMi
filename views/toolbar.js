/**
 * The toolbar
 */
define(["backbone", "hogan.js", "collections/tabs", "text!templates/toolbar.hjs"], function(Backbone, Hogan, Tabs, template) {
	var Toolbar = Backbone.View.extend({
		tagName: "header",
		className: "toolbar",

		events: {
			"click .tabs li": function(e) {
				Tabs.navigate(e.currentTarget.getAttribute("data-id"));
			}
		},

		initialize: function() {
			Tabs.on("update change", this.render, this);

			this.render();
		},

		template: Hogan.compile(template),

		render: function() {
			this.$el.html(this.template.render({
				tabs: Tabs.map(function(e) {
					return {
						id: e.cid,
						name: e.get("name"),
						active: e.get("active")
					};
				})
			}));
		}
	});

	return new Toolbar();
});