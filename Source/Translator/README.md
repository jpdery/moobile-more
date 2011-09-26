Moobile Translator
==================

This class is used to translate content within views without having to call
a translation method. Text wrapped in [data-role=text] element will be 
translated.

How to use
----------

window.addEvent('ready', function() {

	Moobile.Translator.addEvent('loaded', function() {
		
		/* Initialization... */
		
	});

	Moobile.Translator.load('path-to-translations.xml');

});

