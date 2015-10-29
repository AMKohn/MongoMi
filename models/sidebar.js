/**
 * The sidebar model
 */
define(["backbone"], function(Backbone) {
	var Model = Backbone.Model.extend({
		defaults: {
			servers: [{
				open: true,
				port: 27017,
				name: "iChrome",
				host: "localhost",
				databases: [{
					name: "stats",
					collections: [{
						name: "Indexes",
						type: "internal-indexes"
					}, {
						name: "client",
						type: "collection",
						indexes: [{
							internal: true,
							name: "ID (internal)"
						}, {
							name: "Event Class"
						}]
					}, {
						name: "compiled",
						type: "collection"
					}, {
						name: "server",
						type: "collection"
					}, {
						name: "log",
						type: "collection"
					}]
				}, {
					name: "sync",
					collections: []
				}]
			}]
		},

		fetch: function() {
			try {
				var servers = JSON.parse(localStorage.servers);
			}
			catch (e) {
				return;
			}

			this.set({
				servers: servers
			});

			return this;
		},

		save: function() {
			try {
				localStorage.servers = JSON.stringify(this.toJSON());
			}
			catch (e) {}
		},

		initialize: function() {
			this.fetch();

			this.on("change", this.save);
		}
	});

	return Model;
});