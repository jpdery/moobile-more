/*
---

name: Exhibit

description: Provides a that mainly goes in a gallery. This image is
             wrapped inside an element that does not change its size unless
             specified. The goal of this image is also to free it's memory when
             it's not visible, use with ScrollView.Gallery.

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Component

provides:
	- Exhibit

...
*/

Moobile.Exhibit = new Class({

	Extends:Moobile.Component,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	options: {
		size: {
			x: 242,
			y: 313
		}
	},

	/**
	 * @overrides
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	willBuild: function() {
		this.parent();
		this.element.addClass('exhibit');
		this.element.setStyle('width', this.options.size.x);
		this.element.setStyle('height', this.options.size.y);
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	present: function() {
		throw new Error('You must override this method');
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	dismiss: function() {
		throw new Error('You must override this method');
	}

});