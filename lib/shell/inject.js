var global = this,
	shellPrinted = false,
	shellPrinting = false,
	oldPrint = global.print,
	oldSPH = shellPrintHelper;

var exec = function(query, maxDocs) {
	maxDocs = maxDocs || 25;

	var ret = {
		error: false
	};

	var res = null,
		start = new Date().getTime();

	try {
		res = eval(query);
	}
	catch (e) {
		res = e;
	}


	if (typeof res == "undefined") {
		// Make sure that we have a db var before we use it
		if (__callLastError && typeof db !== "undefined" && db.getMongo && db.getMongo().writeMode() == "legacy") {
			__callLastError = false;

			var err = db.getLastError(1);
	
			if (err !== null) {
				ret.error = tojson(err, null, true);
			}
			else {
				ret.result = undefined;
			}
		}
		else {
			ret.result = undefined;
		}
	}
	else if (res == __magicNoPrint) {
		return;
	}
	else if (res === null) {
		ret.result = null;
	}
	else if (res instanceof Error || typeof res == "function") {
		ret.result = res.toString();
	}
	else if (res instanceof DBQuery) {
		ret.docs = [];

		var n = 0;

		while (res.hasNext() && n < maxDocs) {
			ret.docs.push(tojson(res.next(), null, true));

			n++;
		}

		if (res.hasNext()) {
			ret.more = true;

			___it___ = res;
		}
		else {
			___it___ = null;
		}
	}
	else if (res instanceof DBCollection) {
		ret.result = res.shellPrint();
	}
	else if (typeof res.shellPrint == "function") {
		ret.result = res.shellPrint();

		ret.shellPrint = true;
	}
	else if (typeof res.shellPrint == "function") {
		ret.result = res.shellPrint();

		ret.shellPrint = true;
	}
	else {
		try {
			// tojson also handles res.tojson()
			ret.result = tojson(res, null, true);

			ret.json = true;
		}
		catch (e) {
			try {
				ret.result = res.toString();
			}
			catch (e) {
				ret.error = "Response unserializable";
			}
		}
	}

	if (typeof db !== "undefined") {
		ret.db = db.toString();
	}

	ret.time = new Date().getTime() - start;

	oldPrint(JSON.stringify(ret));
};

global.print = function(d) {
	var res = {
		result: d,
		error: false
	};

	if (shellPrinting) {
		shellPrinted = true;
	}

	try {
		return oldPrint.call(global, JSON.stringify(res));
	}
	catch(e) {
		return oldPrint.call(global, JSON.stringify({
			error: "Failed to encode response from Mongo shell"
		}));
	}
};

global.shellPrintHelper = function() {
	shellPrinting = true;

	oldSPH.apply(this, arguments);

	// Ensure something is always printed
	if (!shellPrinted) {
		print(null);
	}

	shellPrinted = false;
	shellPrinting = false;
};

oldPrint("initialized");