/*
---

name: Moobile.Translator

description: Define a static Translator object that get based on a
             definition file. This also override methods in several object
			 to get automatically some properties.

license: MIT-style license.

author:
	- Jean-Philippe Dery (jean-philippe.dery@lemieuxbedard.com)

requires:

provides:
	- Moobile.Translator

...
*/

/**
 * With CSS:
 *
 * *[data-role][data-lang] {
 * 	display: none
 * }
 *
 */

if (window.Moobile == undefined)
	window.Moobile = {};

Moobile.Translator = {

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	request: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	currentLanguage: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	sourceLanguage: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	translationLanguages: [],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	translations: {},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	get: function(source) {

		if (this.currentLanguage == null || 
			this.currentLanguage == this.sourceLanguage)
			return source;

		var translations = this.translations[this.clean(source)];
		if (translations) {
			var translation = translations[this.currentLanguage];
			if (translation) {
				return translation;
			}
		}

		return source;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	add: function(source, translations) {

		source = this.clean(source);

		if (this.translations[source] == undefined)
			this.translations[source] = {};

		if (typeof translations == 'object') {
			Object.each(translations, function(translation, lang) {
				this.translations[source][lang] = translation;
			}, this)
		} else {
			translations = Array.from(translations);
			this.translationLanguages.each(function(lang, index) {
				this.translations[source][lang] = translations[index];
			},this);
		}

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	load: function(file) {

		if (this.request == null) {
			this.request = new Moobile.Request();
			this.request.addEvent('success', this.bound('onLoad'));
		}

		this.request.options.method = 'get';
		this.request.options.url = file;
		this.request.cancel();
		this.request.send();

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	onLoad: function(str, xml) {

		var sourceLanguages = xml.getElementsByTagName('source-language');
		if (sourceLanguages.length == 0)
			throw new Error('Missing <source-language> element.');

		this.sourceLanguage = sourceLanguages[0].textContent.trim();
		if (this.currentLanguage == null) {
			this.setLanguage(this.sourceLanguage);
		}

		var translationLanguages = xml.getElementsByTagName('translation-language');
		if (translationLanguages.length == 0)
			throw new Error('Missing at least one <translation-language> element.');

		for (var i = 0; i < translationLanguages.length; i++) {
			this.translationLanguages[i] = translationLanguages[i].textContent.trim();
		}

		var dict = xml.getElementsByTagName('dict');
		if (dict.length == 0)
			throw new Error('Missing the root <dict> element');

		dict = dict[0];

		for (var i = 0; i < dict.childNodes.length; i++) {

			var node = dict.childNodes[i];
			if (node.nodeType == 3)
				continue;

			if (node.nodeName == 'source') {

				var source = this.clean(node.textContent);

				this.translations[source] = {};

				var index = -1;
				var trans = [];

				while (true) {

					index++;

					var nextNode = dict.childNodes[i + 1 + index];
					if (nextNode == undefined)
						break;

					if (nextNode.nodeType == 3)
						continue;

					if (nextNode.nodeName == 'translation') {
						trans.push(nextNode);
					}

					if (nextNode.nodeName == 'source') {
						break;
					}
				}

				if (trans.length != this.translationLanguages.length) {
					throw new Error('Translations for source ' + source + ' does not match the available translations languages');
				}

				for (var j = 0; j < this.translationLanguages.length; j++) {

					var translationNode = trans[j];
					var translationLanguage = this.translationLanguages[j];

					var content = new XMLSerializer().serializeToString(translationNode);
					content = content.replace(/^<translation>/, '');
					content = content.replace(/<\/translation>$/, '');

					this.translations[source][translationLanguage] = content;
				}
			}
		}

		this.fireEvent('load');

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setLanguage: function(language) {

		if (this.currentLanguage != language) {

			var change = this.currentLanguage != null;

			this.willChangeLanguage(language);
			this.currentLanguage = language;
			this.didChangeLanguage(language);

			if (change) this.fireEvent('change');
		}

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getLanguage: function() {
		return this.currentLanguage;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	clean: function(key) {
		key = String(key);
		key = key.trim();
		key = key.stripTags();
		key = key.replace(/[^A-Za-z0-9]*/g, '');
		return key;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	willChangeLanguage: function(language) {
		document.body.removeClass('lang-' + this.currentLanguage);
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	didChangeLanguage: function(language) {
		document.body.addClass('lang-' + this.currentLanguage);
	}

};

Object.append(Moobile.Translator, new Events);
Object.append(Moobile.Translator, new Options);
Object.append(Moobile.Translator, new Class.Binds);

(function() {

	var translate = function(source) {
		return Moobile.Translator.get.call(Moobile.Translator, source);
	};

	Class.refactor(Moobile.Component, {

		/**
		 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
		 * @since  0.1
		 */
		initialize: function(element, options, name) {
			this.translator = Moobile.Translator;
			return this.previous(element, options, name);
		}

	});

	Class.refactor(Moobile.ViewController, {

		/**
		 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
		 * @since  0.1
		 */
		initialize: function(options, name) {
			this.translator = Moobile.Translator;
			this.translator.addEvent('change', this.bound('_onLanguageChange'));
			return this.previous(options, name);
		},

		/**
		 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
		 * @since  0.1
		 */
		destroy: function() {
			this.translator.removeEvent('change', this.bound('_onLanguageChange'));
			this.previous();
		},

		/**
		 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
		 * @since  0.1
		 */
		didChangeLanguage: function() {

		},

		/**
		 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
		 * @since  0.1
		 */
		_onLanguageChange: function() {
			this.didChangeLanguage(this.translator.getLanguage());
		},

	});

	Class.refactor(Moobile.Text, {

		translationSource: null,

		/**
		 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
		 * @since  0.1
		 */
		translatable: function() {
			return this.element ? this.element.get('data-lang') == null : false;
		},

		/**
		 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
		 * @since  0.1
		 */
		setText: function(text) {

			if (text instanceof Moobile.Text)
				text = text.getText();

			if (this.translationSource == null) {
				this.translationSource = text;
			}

			this.previous(this.translatable() ? translate(text) : text);

			return this;
		},

		/**
		 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
		 * @since  0.1
		 */
		setLanguage: function(language) {
			this.element.set('data-lang', language);
			return this;
		},

		/**
		 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
		 * @since  0.1
		 */
		willBuild: function() {

			var html = this.element.get('html');
			if (html) {
				this.translationSource = html;
			}

			if (this.translationSource && this.translatable()) {
				this.element.set('html', translate(this.translationSource));
			}

			this.translator.addEvent('change', function() {
				if (this.translationSource && this.translatable()) {
					this.element.set('html', translate(this.translationSource));
				}
			}.bind(this));

			this.previous();
		}

	});

	Class.refactor(Moobile.Image, {

		_updateSource: function() {
			var source = null;
			if (source === null && window.devicePixelRatio >= 2) source = this.element.get('data-src-' + Browser.Device.name + '-2x-' + this.translator.getLanguage());
			if (source === null && window.devicePixelRatio >= 2) source = this.element.get('data-src-' + Browser.Device.name + '-2x');
			if (source === null && window.devicePixelRatio >= 2) source = this.element.get('data-src-2x-' + this.translator.getLanguage());
			if (source === null && window.devicePixelRatio >= 2) source = this.element.get('data-src-2x');
			if (source === null) source = this.element.get('data-src-' + Browser.Device.name + '-' + this.translator.getLanguage());
			if (source === null) source = this.element.get('data-src-' + Browser.Device.name);
			if (source === null) source = this.element.get('data-src-' + this.translator.getLanguage());
			if (source) this.setSource(source);
		},

		willBuild: function() {
			this.previous();
			this._updateSource();
			this.translator.addEvent('change', this.bound('_updateSource'));
		},

		destroy: function() {
			this.translator.removeEvent('change', this.bound('_updateSource'));
			this.previous();
		}

	});

})();