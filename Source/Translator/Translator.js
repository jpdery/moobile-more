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
	- Moobile/ViewController

provides:
	- ViewController.Language

...
*/

if (window.Moobile == undefined)
	window.Moobile = {};

Moobile.Translator = new new Class({

	Implements: [
		Events,
		Options,
		Class.Binds
	],

	base: '',

	request: null,

	language: null,

	languages: {},

	translations: {},

	get: function(key) {

		if (this.language == null)
			return key;

		var translation = this.translations[key];
		if (translation) {
			translation = translation[this.language];
			if (translation) return translation;
		}

		return key;
	},

	process: function(elements) {

		if (elements instanceof Element)
			elements = [elements];

		elements.each(function(element) {

			var key = element.retrieve('translator:key', null);
			if (key == null) {
				key = element.getProperty('html');
				key = this.clean(key);
			}

			if (key) {
				element.set('html', this.get(key));
				element.store('translator:key', key);
			}

		}, this);

		return this;
	},

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

	onLoad: function(str, xml) {
		var doc = document.id(xml.documentElement);
		this.loadLanguages(doc);
		this.loadTranslations(doc);
		this.fireEvent('loaded');
		return this;
	},

	setLanguage: function(language) {
		if (this.language != language) {
			this.language = language;
			this.fireEvent('change');
		}
		return this;
	},

	getLanguage: function() {
		return this.language;
	},

	clean: function(key) {
		key = key.trim();
		key = key.replace(/\s+/g, ' ');
		key = key.stripTags();		
		return key;
	},

	loadLanguages: function(doc) {

		var element = doc.getElement('languages');
		if (element == null) {
			throw new Error('You must have a languages element.');
		}

		this.base = element.getProperty('base');
		if (this.base == null) {
			throw new Error('The languages element must define a base language.');
		}

		this.language = this.base;

		element.getElements('language').each(function(item) {
			var code = item.getProperty('name').trim();
			var name = item.getProperty('text').trim();
			this.languages[code] = name;
		}, this);

		return this;
	},

	loadTranslations: function(doc) {

		var element = doc.getElement('translations');
		if (element) {
			element.getElements('tr').each(function(tr) {

				var key = null;
				var val = {};

				tr.getElements('str').each(function(str) {

					var text = str.getProperty('text');
					var lang = str.getProperty('lang');
					if (lang == this.base) {
						key = text;
						key = this.clean(key);
					}

					val[lang] = text;

				}, this);

				if (key == null) {
					throw new Error('Cannot find a traduction using the base language in ' + tr.innerHtml);
				}

				this.translations[key] = val;

			}, this);
		}

		return this;
	}
});

(function() {

	Class.refactor(Moobile.View, {

		__texts: [],

		build: function(element) {

			this.previous(element);

			this.__texts = this.getElements('[data-role=text]');
			Moobile.Translator.process(this.__texts);
			Moobile.Translator.addEvent('change', this.bound('__updateTexts'));

			return this;
		},

		__updateTexts: function() {

			this.__texts.each(function(element) {
				var text = element.get('html');
				if (text) {
					text = Moobile.Translator.get(text);
					element.set('html', text);
				}
			}.bind(this));

			return this;
		}

	});


	Class.refactor(Moobile.Label, {

		build: function(element) {

			this.previous(element);

			var text = this.text.get('html');
			if (text) {
				text = Moobile.Translator.get(text);
				this.text.set('html', text);
			}

			Moobile.Translator.addEvent('change', this.bound('__updateText'));

			return this;
		},

		setText: function(text) {

			if (text) {
				text = Moobile.Translator.get(text);
			}

			return this.previous(text);
		},

		__updateText: function() {

			var text = this.text.get('html');
			if (text) {
				text = Moobile.Translator.get(text);
				this.text.set('html', text);
			}

			return this;
		}

   });

})();
