define(["lodash", "backbone", "child_process", "text!lib/shell/inject.js"], function(_, Backbone, cp, inject) {
	var Shell = function(options) {
		options = options || {};

		var args = [];

		if (options.username) {
			args.push("-u", options.username);
		}

		if (options.password) {
			args.push("-p", options.password);
		}

		if (options.host) {
			args.push("--host", options.host);
		}

		if (options.port) {
			args.push("--port", options.port);
		}

		this.process = cp.spawn("bin/shells/" + (options.version || "3.0") + ".exe", args);


		this.process.on("exit", this.trigger.bind(this, "exit"));
		this.process.stderr.on("data", this.trigger.bind(this, "error"));

		var cmdCB = function(err, res) {
			this._cmdCB(err, res);
		};

		this.on("data", cmdCB.bind(this, null));
		this.on("error", cmdCB.bind(this, true));


		this.initConnection(options.database || "local", function() {
			console.log("Shell initialized");

			this.attachListener();
		});
	};

	_.assign(Shell.prototype, Backbone.Events);

	Shell.prototype.initConnection = function(db, cb) {
		var that = this;

		// Try switching to the db before initializing the connection.
		// 
		// Errors are handled in the constructor function
		that.process.stdin.write("shellHelper.use(" + JSON.stringify(db) + ")\n");

		that.process.stdout.on("data", function onData(data) {
			try {
				data = data.toString();

				if (data.indexOf("switched to db") !== -1) {
					that.process.stdin.write("eval(" + JSON.stringify(inject) + ")\n");
				}
				else if (data.indexOf("initialized") !== -1) {
					that.process.stdout.removeListener("data", onData);

					cb.call(that);
				}
			}
			catch (e) {}
		});
	};

	Shell.prototype.attachListener = function() {
		var that = this;

		this.process.stdout.setEncoding("utf8");
		this.process.stderr.setEncoding("utf8");

		// Stop stdout from emitting data events so we
		// can process them
		this.process.stdout.pause();


		// This system ensures that we get the entire message/doc instead of just
		// a chunk of it
		var immediate = null,
			data = "";

		this.process.stdout.on("readable", function() {
			var chunk;

			while (null !== (chunk = that.process.stdout.read())) {
				data += chunk;
			}

			global.clearImmediate(immediate);

			immediate = global.setImmediate(function() {
				var d = data.split("\n");

				data = "";

				d.forEach(function(d) {
					try {
						d = JSON.parse(d);
					}
					catch (err) {}

					if (d && d.error) {
						that.trigger("error", d);
					}
					else {
						that.trigger("data", d);
					}
				});
			});
		});
	};


	/**
	 * The command callback function.
	 *
	 * When a command is run all data from the shell is sent via this callback
	 * until it (the callback) is replaced with one from a command run later.
	 *
	 * The data it receives is decoded so it can be any type
	 *
	 * @api     private
	 */
	Shell.prototype._cmdCB = function(err, res) {
		console.log((err ? "Error: " : "") + res);
	};

	Shell.prototype.exec = function(cmd, cb) {
		var respReceived = false,
			start = process.hrtime(),
			result = [];

		this._cmdCB = function(err, res) {
			if (!respReceived) {
				respReceived = true;

				var diff = process.hrtime(start);

				console.log("Command took %s ms", (diff[0] * 1E9 + diff[1]) / 1000000);
			}

			result.push(res);

			if (cb) {
				cb(err, _.clone(result), res);
			}
			else {
				console.log(err ? "Error: " : "" + data);
			}
		};

		this.process.stdin.write("exec(" + JSON.stringify(cmd) + ")\n");
	};

	return Shell;
});