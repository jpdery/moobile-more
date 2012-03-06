/*
---

name: ScrollView.Gallery

description: Provides a scroll view that automatically unload its exhibit once
             they are not displayed.

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- ScrollView

provides:
	- ScrollView.Gallery

...
*/

Moobile.ScrollView.Gallery = new Class({

	Extends: Moobile.ScrollView,

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_presentedExhibits: [],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_dismissedExhibits: [],

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	didBuild: function() {
		this.parent();
		this.addEvent('scroll', this.bound('_onScroll'));
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	didBecomeReady: function() {
		this.parent();
		this._update();
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	destroy: function() {
		this.removeEvent('scroll', this.bound('_onScroll'));
		this.parent();
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	addExhibits: function(exhibits) {

		Array.from(exhibits).each(function(exhibit) {
			this.addExhibit(exhibit);
		}, this);

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	addExhibit: function(exhibit) {

		exhibit.addEvent('load', this.bound('_onExhibitLoad'));
		exhibit.addEvent('unload', this.bound('_onExhibitUnload'));

		this.addChild(exhibit);

		var ymin = 0;
		var xmin = 0;
		var ymax = this.getContentSize().y;
		var xmax = this.getContentSize().x;

		if (ymax > 0 && xmax > 0) {

			var pos = exhibit.getPosition(this.wrapper);

			var top = pos.y;
			var bot = pos.y + exhibit.getSize().y;

			var lft = pos.x;
			var rgt = pos.x + exhibit.getSize().x;

			var visible = bot >= ymin && top <= ymax &&
						  rgt >= xmin && lft <= xmax;

			if (visible) {
				exhibit.present();
				this._presentedExhibits.push(exhibit);
			} else {
				exhibit.dismiss();
				this._dismissedExhibits.push(exhibit);
			}

		} else {
			exhibit.dismiss();
			this._dismissedExhibits.push(exhibit);
		}

		return this;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getExhibitAt: function(index) {
		return this.getChildOfTypeAt(Moobile.Exhibit, index);
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getExhibits: function() {
		return this.getChildrenOfType(Moobile.Exhibit);
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getPresentedExhibits: function() {
		return this._presentedExhibits;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	getDismissedExhibits: function() {
		return this._dismissedExhibits;
	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	didPresentExhibit: function(exhibit) {

	},

	/**
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	didDismissExhibit: function(exhibit) {

	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_update: function() {

		//
		// I believe this could be optimized a lot
		//

		var ymin = 0;
		var xmin = 0;
		var ymax = this.getContentSize().y;
		var xmax = this.getContentSize().x;

		this.getExhibits().each(function(exhibit) {

			var pos = exhibit.getPosition(this.wrapper);

			var top = pos.y;
			var bot = pos.y + exhibit.getSize().y;

			var lft = pos.x;
			var rgt = pos.x + exhibit.getSize().x;

			var visible = bot >= ymin && top <= ymax &&
						  rgt >= xmin && lft <= xmax;

			if (visible) {
				if (this._dismissedExhibits.contains(exhibit)) {
					this._dismissedExhibits.erase(exhibit);
					this._presentedExhibits.push(exhibit);
					exhibit.present();
					this.didPresentExhibit(exhibit);
				}
			} else {
				if (this._presentedExhibits.contains(exhibit)) {
					this._presentedExhibits.erase(exhibit);
					this._dismissedExhibits.push(exhibit);
					exhibit.dismiss();
					this.didDismissExhibit(exhibit);
				}
			}

		}, this);

		return this;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_onExhibitLoad: function(sender) {
		this.fireEvent('exhibitload', sender);
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_onExhibitUnload: function(sender) {
		this.fireEvent('exhibitunload', sender);
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1
	 */
	_onScroll: function() {
		this._update();
	}

});

