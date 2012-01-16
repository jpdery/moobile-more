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
	 * @since  0.1.0
	 */
	request: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	currentLanguage: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	sourceLanguage: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	translationLanguages: [],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	translations: {},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
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
	 * @since  0.1.0
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
	 * @since  0.1.0
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
	 * @since  0.1.0
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
	 * @since  0.1.0
	 */
	getLanguage: function() {
		return this.currentLanguage;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	clean: function(key) {

		key = key.trim();
		key = key.replace(/\s+/g, ' ');
		key = key.stripTags();

		return key;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willChangeLanguage: function(language) {
		document.body.removeClass('lang-' + this.currentLanguage);
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didChangeLanguage: function(language) {
		document.body.addClass('lang-' + this.currentLanguage);
	}

};

Object.append(Moobile.Translator, new Events);
Object.append(Moobile.Translator, new Options);
Object.append(Moobile.Translator, new Class.Binds);

(function() {

	var translate = Moobile.Translator.get.bind(Moobile.Translator);

	Class.refactor(Moobile.Entity, {

		initialize: function(element, options, name) {
			this.translator = Moobile.Translator;
			return this.previous(element, options, name);
		}

	});

	Class.refactor(Moobile.ViewController, {

		initialize: function(options, name) {
			this.translator = Moobile.Translator;
			return this.previous(options, name);
		}

	});

	Class.refactor(Moobile.Text, {

		isTranslatable: function() {
			return this.element.get('data-lang') == null;
		},

		setText: function(text) {
			return this.previous(this.isTranslatable() ? translate(text) : text);
		},

		willBuild: function() {

			this.previous();

			var html = this.element.get('html');
			if (html && this.isTranslatable()) {
				this.element.set('html', translate(html));
			}

			this.translator.addEvent('change', function() {
				this.setText(this.getText());
			}.bind(this));
		}

	});

})();