/**
 * The tabs collection/controller
 */
define(["backbone", "models/tab"], function(Backbone, Tab) {
	var Tabs = Backbone.Collection.extend({
		model: Tab,

		activeTab: 0,


		/**
		 * Navigates to the previous tab
		 *
		 * @api     public
		 */
		prev: function() {
			var index = this.activeTab - 1;

			if (this.at(index)) {
				this.navigate(index);
			}
			else {
				// If the tab doesn't exist, switch to the last tab
				this.navigate((this.length || 1) - 1);
			}
		},


		/**
		 * Navigates to the next tab
		 *
		 * @api     public
		 */
		next: function() {
			var index = this.activeTab + 1;

			if (this.at(index)) {
				this.navigate(index);
			}
			else {
				// If the tab doesn't exist, switch to the first tab
				this.navigate(0);
			}
		},


		/**
		 * Navigates to a tab by index, ID, or model
		 *
		 * @api     public
		 * @param   {String|Number|Backbone.Model}  which  The index, ID, or model of the tab to mark as active
		 */
		navigate: function(which) {
			var model;

			if (typeof which === "number") {
				model = this.at(which);
			}
			else {
				model = this.get(which);
			}

			if (!model) {
				return;
			}

			this.find("active").set("active", false);

			model.set("active", true);
		},


		/**
		 * Adds a new tab
		 *
		 * @api     public
		 * @param   {Object|Backbone.Model}  tab        The tab to add
		 * @param   {Object}                 [options]  Any options to pass to the Backbone add function,
		 *                                              specify `at` to insert the tab at a particular index
		 * @return  {Backbone.Model}                    The added tab
		 */
		add: function(tab, options) {
			options = options || {};

			options.silent = true;

			if (!tab) {
				tab = new this.model();
			}

			var ret = Backbone.Collection.prototype.add.call(this, tab, options);

			if (ret.get("active")) {
				// Since active is already true, this is silent
				this.navigate(ret);

				this.trigger("change:active", ret, true, options);
			}

			this.trigger("add", ret, this, options);
			this.trigger("update", this, options);
		},


		/**
		 * Creates a blank new tab
		 *
		 * @api     public
		 * @return  {Backbone.Model}  The tab
		 */
		create: function() {
			return this.add({
				active: true
			});
		},


		/**
		 * Removes a tab by index, ID, or model
		 *
		 * @api     public
		 * @param   {Number|String|Backbone.Model}  which  The index, ID, or model of the tab to remove
		 */
		remove: function(which) {
			var model;

			if (typeof which === "number") {
				model = this.at(which);
			}
			else if (typeof which === "string") {
				model = this.get(which);
			}

			if (!model) {
				return;
			}

			var index = this.indexOf(model);

			var ret = Backbone.Collection.prototype.remove.call(this, model, {
				silent: true
			});

			if (ret.get("active")) {
				this.navigate(index > 1 ? index - 1 : 0);
			}

			this.trigger("remove", ret, this, options);
			this.trigger("update", this, options);
		},


		initialize: function() {
			this.on("change:active", function(tab) {
				this.activeTab = this.indexOf(tab);
			});
		}
	});

	return new Tabs();
});