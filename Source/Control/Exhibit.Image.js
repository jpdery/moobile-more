/*
---

name: Exhibit.Image

description:

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Exhibit

provides:
	- Exhibit.Image

...
*/


Moobile.Exhibit.Image = new Class({

	Extends: Moobile.Exhibit,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_image: null,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_imageSource: null,

	/**
	 * @overrides
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	willBuild: function() {
		this.parent();
		var image = this.element.getRoleElement('image');
		if (image === null) {
			image = new Element('img');
			image.inject(this.element);
			image.setRole('image');
		}
	},

	/**
	 * @see    http://moobile.net/api/0.1/Control/Image#setSource
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setImageSource: function(source) {
		this._imageSource = source;
		return this;
	},

	/**
	 * @see    http://moobile.net/api/0.1/Control/getSource
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getImageSource: function() {
		return this._imageSource;
	},

	/**
	 * @overrides
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	setImage: function(image) {

		if (this._image === image)
			return this;

		if (this._image) {
			this._image.removeEvent('load', this.bound('_onImageLoad'));
			this._image.removeEvent('unload', this.bound('_onImageUnload'));
			this._image.replaceWith(image, true);
		} else {
			this.addChild(image);
		}

		this._image = image;
		this._image.addClass('image');
		this._image.addEvent('load', this.bound('_onImageLoad'));
		this._image.addEvent('unload', this.bound('_onImageUnload'));

		return this;
	},

	/**
	 * @overrides
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getImage: function() {
		return this._image;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	present: function() {
		this._image.setSource(this._imageSource);
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	dismiss: function() {
		this._image.setSource('data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_onImageLoad: function() {
		this.fireEvent('load');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_onImageUnload: function() {
		this.fireEvent('unload');
	}

});

Moobile.Component.defineRole('image', Moobile.Exhibit.Image, function(element) {
	this.setImage(Moobile.Component.create(Moobile.Image, element, 'data-image'));
});