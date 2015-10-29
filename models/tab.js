/**
 * The tab model
 */
define(["backbone"], function(Backbone) {
	var Tab = Backbone.Model.extend({
		defaults: {
			active: false,
			name: "New Tab",
			server: {
				port: 27017,
				host: "localhost",
				name: "Server Name"
			},
			database: "local"
		}
	});

	return Tab;
});