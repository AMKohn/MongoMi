/**
 * Overwrite the window's require function with requirejs'
 *
 * The window's require function is defined by nw.js and is separate from
 * global.require so this isn't actually overwriting Node's require, just
 * nw.js' proxy.
 *
 * The nw.gui module should be loaded by calling nwDispatcher.requireNwGui() or
 * nwRequire("nw.gui")
 */
window.nwRequire = require;

window.require = require("requirejs");


var vm = require("vm"),
	context = vm.createContext(window);

require.makeNodeWrapper = function (contents) {
	return '(function (require, requirejs, define, window, document) { ' +
		contents +
	'\n}(global.requirejsVars.require, global.requirejsVars.requirejs, global.requirejsVars.define, global.window, global.window.document));';
};

require.exec = function(text, realPath) {
	text = require.makeNodeWrapper(text);

	return vm.runInThisContext(text, realPath);
};

require.config({
	nodeRequire: nwRequire,
	paths: {
		"ace": "vendor/ace",
		"text": "vendor/text",
		"lodash": "vendor/lodash",
		"backbone": "vendor/backbone",

		// Marionette is loaded from a file instead of the NPM module so it uses Lodash instead of Underscore
		"marionette": "lib/marionette-renderer"
	},
	map: {
		"*": {
			"underscore": "lodash"
		}
	},
	config: {
		text: {
			env: "node"
		}
	}
});


/**
 * Init
 */
require(["views/app"], function(app) {
	window.App = app;
});