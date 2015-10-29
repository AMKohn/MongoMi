/**
 * The shell view
 */
define(["lodash", "lib/shell/shell", "views/editor"], function(_, Shell, EditorView) {
	var ShellView = EditorView.extend({
		events: {
			"click button.execute": function() {
				this.exec(this.editor.getSelectedText() || this.editor.getValue());
			}
		},

		initialize: function(options) {
			this.initEditor({
				minLines: 3,
				maxLines: 20
			});

			this.initShell();

			this.$el.prepend('<button type="button" class="material flat green execute">Execute</button>');

			this.editor.commands.addCommand({
				name: "execute",
				bindKey: {
					win: "Ctrl-Enter",
					mac: "Command-Enter"
				},
				exec: function() {
					// Hide the autocomplete dropdown, if visible. This is the same
					// command triggered when the Esc key is pressed.
					if (this.editor.completer && this.editor.completer.detach) {
						this.editor.completer.detach();
					}

					this.exec(this.editor.getSelectedText() || this.editor.getValue());
				}.bind(this)
			});
		},

		initShell: function() {
			this.shell = new Shell({
				host: this.model.get("server").host,
				port: this.model.get("server").port,
				database: this.model.get("database")
			});

			this.shell.on("error", function(err) {
				this.trigger("error", err.toString());
			}, this);

			this.editor.completers.push({
				getCompletions: function(editor, session, pos, prefix, cb) {
					var statement = this.getStatementAt(pos, editor);

					if (statement === "nested") {
						return this.nestedSnippets;
					}

					this.getShellCompletions(statement, cb);
				}.bind(this)
			});
		},

		getShellCompletions: function(statement, cb) {
			// Use this.exec so we get the cb bound to `this`
			this.exec('shellAutocomplete(' + JSON.stringify(statement.prefix + statement.operator) + ');__autocomplete__', function(err, res, d) {
				if (res.length !== 1) return;

				try {
					d = JSON.parse(d.result);
				}
				catch (e) {}

				if (!d || !Array.isArray(d) || !d.length) {
					return cb(null, []);
				}

				var prefixLength = statement.prefix.length;

				var completions = _.map(d, function(completion) {
					var isFn = _.last(completion) == "(";

					// Clean up the shell's response.  It includes parentheses
					// if the result is a function and the original statement
					completion = completion.slice(prefixLength, isFn ? -1 : null);


					if (this.completeSnippets.hasOwnProperty(completion)) {
						return {
							score: 1,
							type: "snippet",
							meta: "snippet",
							caption: this.completeSnippets[completion].name,
							snippet: this.completeSnippets[completion].content
						};
					}
					else if (isFn) {
						return {
							score: 1,
							type: "snippet",
							meta: "snippet",
							caption: completion,
							snippet: completion + "($0)"
						};
					}
					else {
						return {
							score: 1,
							meta: "shell",
							value: completion,
							caption: completion
						};
					}
				}, this);

				cb(null, completions);
			});
		},

		exec: function(command, cb) {
			var that = this;

			this.shell.exec(command, function(err, res, currRes) {
				if (cb) {
					return cb.call(that, err, res, currRes);
				}

				if (err) {
					return that.trigger("result", err.toString(), true);
				}

				res = _.reduce(res, function(res, e) {
					e = JSON.stringify(e, true, "\t");

					e = String(e).trim();

					if (e && res) {
						return res + "\n\n" + e;
					}
					else if (e) {
						return e;
					}
					else {
						return res;
					}
				}, "");

				that.trigger("result", res);
			});
		}
	});

	return ShellView;
});