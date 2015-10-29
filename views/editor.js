/**
 * The editor view
 */
define([
	"lodash", "marionette", "ace/ace", "ace/snippets", "text!lib/snippets/main", "text!lib/snippets/autocomplete", "text!lib/snippets/nested", "ace/ext/language_tools"
], function(_, Marionette, Ace, AceSnippets, snippets, completeSnippets, nestedSnippets) {
	/**
	 * Set up main Ace snippets
	 */
	Ace.config.loadModule("ace/snippets/javascript", function(m) {
		if (m) {
			if (!AceSnippets.snippetManager.files) {
				AceSnippets.snippetManager.files = {};
			}

			AceSnippets.snippetManager.files.javascript = m;

			// Use += to append snippets instead of replacing them
			m.snippetText = snippets;

			m.snippets = AceSnippets.snippetManager.parseSnippetFile(m.snippetText);

			AceSnippets.snippetManager.register(m.snippets, m.scope);
		}
	});


	var EditorView = Marionette.ItemView.extend({
		tagName: "div",
		template: false,
		className: "editor",

		defaults: {
			wrap: true,
			useWorker: false,
			enableSnippets: true,
			showPrintMargin: false,
			behavioursEnabled: true,
			highlightActiveLine: false,
			theme: "ace/theme/monokai",
			mode: "ace/mode/javascript",
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true
		},

		initialize: function() {
			this.initEditor();
		},

		initEditor: function(options) {
			this.editor = Ace.edit(this.el);

			this.editor.setOptions(_.assign({}, this.defaults, options));

			this.editor.$blockScrolling = Infinity;

			this.editor.renderer.setScrollMargin(5, 5);

			// Clean up the editor before destroying
			this.on("before:destroy", this.editor.destroy, this.editor);
		},

		nestedSnippets: _.map(AceSnippets.snippetManager.parseSnippetFile(nestedSnippets), function(e) {
			return {
				caption: e.name,
				snippet: e.content,
				meta: "snippet",
				type: "snippet"
			};
		}),

		completeSnippets: _.indexBy(AceSnippets.snippetManager.parseSnippetFile(completeSnippets), "name"),

		getStatementAt: function(pos, editor) {
			var token = editor.session.getTokenAt(pos.row, pos.column),
				row = editor.session.bgTokenizer.lines[pos.row];

			var tokens = _(editor.session.bgTokenizer.lines)
				.take(pos.row)
				.concat(row.slice(0, row.indexOf(token)))
				.flatten();

			if ((tokens.last() || {}).type === "paren") {
				return "nested";
			}

			var prefix = tokens.takeRightWhile(function(e) {
				return e.value !== ";" && e.type.split(".")[0] !== "paren";
			}).value();

			if (prefix[0] && prefix[0].type && prefix[0].type !== "identifier") {
				return {
					prefix: "",
					operator: ""
				};
			}

			if (token.type !== "identifier") {
				prefix.push(token);
			}

			return {
				prefix: _.pluck(prefix, "value").join(""),
				operator: token.type === "identifier" ? token.value : ""
			};
		}
	});

	return EditorView;
});