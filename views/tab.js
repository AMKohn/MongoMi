/**
 * The tab view
 */
define(["marionette", "views/shell", "views/results"], function(Marionette, Shell, Results) {
	var TabView = Marionette.LayoutView.extend({
		tagName: "div",
		className: function() {
			return "tab" + (this.model.get("active") ? " active" : "");
		},

		template: "tab",

		regions: {
			shell: ".shell .editor-wrapper",
			results: ".results-wrapper"
		},

		modelEvents: {
			"change:active": function() {
				this.el.setAttribute("class", this.className());
			}
		},

		initialize: function() {
			this.shell = new Shell({
				model: this.model
			});

			this.results = new Results();

			this.shell.on("result", function(result) {
				this.results.set(result);
			}, this);
		},

		onRender: function() {
			this.showChildView("shell", this.shell);

			this.showChildView("results", this.results);
		}
	});

	return TabView;
});