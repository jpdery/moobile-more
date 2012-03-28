/*
---

name: Timer

description: Provides a small profiling tool.

license: MIT-style license.

author:
	- Jean-Philippe Dery (jean-philippe.dery@lemieuxbedard.com)

requires:

provides:
	- Timer

...
*/

(function(window) {

var filling = function(str, len) {
	if (str.length > len) {
		str = str.substring(0, len);
	} else {
		var fill = len - str.length;
		for (var j = 0; j < fill; j++) {
			str += ' ';
		}
	}
	return str;
};

var timestamps = [];

window.Timer = {

	mark: function(name) {
		timestamps.push({timestamp: Date.now(), label: name || null});
	},

	log: function() {

		console.log('|=======================================|==============================|==============================|');
		console.log('| EVENT                                 | TIMESTAMP                    | DELTA                        |')
		console.log('|=======================================|==============================|==============================|');

		for (var i = 0; i < timestamps.length; i++) {

			var label = String(timestamps[i].label || i);
			var stamp = String(timestamps[i].timestamp);

			var delta = 0;
			if (i > 0) {
				delta = timestamps[i].timestamp - timestamps[i - 1].timestamp;
			}
			delta = String(delta);

			label = filling(label, 37);
			stamp = filling(stamp + 'ms', 28);
			delta = filling(delta + 'ms', 28);

			console.log('| ' + label + ' | ' + stamp + ' | ' + delta + ' |');
		}

		console.log('|=======================================|==============================|==============================|');

		timestamps.empty();
	}

};

})(window);