/**
 * This module replaces Marionette's default template renderer with Hogan
 */
define(["vendor/backbone.marionette", "hogan.js"], function(Marionette, Hogan) {
	Marionette.TemplateCache.prototype.loadTemplate = function(templateId) {
		// Require in node is synchronous
		var template = require("text!templates/" + templateId + ".hjs");

		if (!template || !template.length) {
			var err = new Error('Could not find template: "' + templateId + '"');

			err.name = "NoTemplateError";

			throw err;
		}

		return template;
	};

	Marionette.TemplateCache.prototype.compileTemplate = function(template) {
		template = Hogan.compile(template);

		// Hogan uses `this` internally, so we need to preserve its scope
		return function(data) {
			return template.render(data);
		};
	};

	return Marionette;
});