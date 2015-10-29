/**
 * The tabs CollectionView
 */
define(["marionette", "collections/tabs", "views/tab"], function(Marionette, Tabs, Tab) {
	var TabsView = Marionette.CollectionView.extend({
		tagName: "div",
		className: "tabs",

		childView: Tab,
		emptyView: Marionette.ItemView.extend({
			template: "no-tabs"
		}),

		initialize: function() {
			this.render();
		}
	});

	return new TabsView({
		collection: Tabs
	});
});