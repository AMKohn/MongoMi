/**
 * The results view
 */
define(["lodash", "lib/shell/shell", "views/editor"], function(_, Shell, EditorView) {
	var ResultsView = EditorView.extend({
		initialize: function(options) {
			this.initEditor({
				readOnly: true
			});
		},

		/**
		 * Sets the content of the results editor
		 *
		 * @api    public
		 * @param  {String}  val  The value to set
		 */
		set: function(val) {
			this.editor.setValue(val, -1);
		}
	});

	return ResultsView;
});