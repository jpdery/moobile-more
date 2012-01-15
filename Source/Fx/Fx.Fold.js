/*
---

name: Fx.Fold

description: Provides an fx transition that animates a page flip using a canvas.

license: MIT-style license.

author:
	- Jean-Philippe Dery (jean-philippe.dery@lemieuxbedard.com)
	- http://www.netmagazine.com/tutorials/create-page-flip-effect-html5-canvas

requires:

provides:
	- Fx.Fold

...
*/


Fx.Fold = new Class({

	Implements: [
		Events,
		Options,
		Class.Binds
	],

	element: null,

	canvas: null,

	context: null,

	progress: 1,

	target: 1,

	dragging: false,

	options: {
		bookSizeX: null,
		bookSizeY: null,
		bookPadding: 60,
		pageSizeX: null,
		pageSizeY: null,
		draggable: true,
		outdent: 20
	},

	timer: null,

	initialize: function(element, options) {

		this.element = document.id(element);

		this.setOptions(options);

		var size = this.element.getSize();
		if (this.options.bookSizeX == null) this.options.bookSizeX = size.x;
		if (this.options.bookSizeY == null) this.options.bookSizeY = size.y;
		if (this.options.pageSizeX == null) this.options.pageSizeX = Math.round(this.options.bookSizeX / 2.075);
		if (this.options.pageSizeY == null) this.options.pageSizeY = Math.round(this.options.bookSizeY / 1.040);

		this.canvas = new Element('canvas');
		this.canvas.inject(this.element);
		this.canvas.set('width',  this.options.bookSizeX + this.options.bookPadding * 2);
		this.canvas.set('height', this.options.bookSizeY + this.options.bookPadding * 2);
		this.canvas.setStyle('left', -this.options.bookPadding);
		this.canvas.setStyle('top',  -this.options.bookPadding);

		this.context = this.canvas.getContext('2d');

		return this;
	},

	start: function(to, from) {

		clearInterval(this.timer);

		if (to >  1) to =  1;
		if (to < -1) to = -1;
		this.target = to;

		if (from) {
			if (from >  1) from =  1;
			if (from < -1) from = -1;
			this.progress = from;
		}

		this.timer = this.render.periodical(1000 / 60, this);

		return this;
	},

	render: function()  {

		var diff = (this.target - this.progress) * 0.2;
		this.progress += diff;
		this.drawFrame(this.progress);

		if (Math.abs(diff) <= 0.009) clearInterval(this.timer);

		return this;
	},

	drawFrame: function(progress, context) {

		// i deserve no credit for this

		var bookSizeX = this.options.bookSizeX;
		var bookSizeY = this.options.bookSizeY;
		var pageSizeX = this.options.pageSizeX;
		var pageSizeY = this.options.pageSizeY;

		context = context || this.context;
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		var spacing = (bookSizeY - pageSizeY ) / 2;

		// strength of the fold is strongest in the middle of the book
		var strength = 1 - Math.abs(progress);

		// width of the folded paper
		var foldWidth = (pageSizeX * 0.5 ) * (1 - progress);

		// x position of the folded paper
		var foldX = pageSizeX * progress + foldWidth;

		// how far the page should outdent vertically due to perspective
		var verticalOutdent = this.options.outdent * strength;

		// the maximum width of the left and right side shadows
		var paperShadowWidth = (pageSizeX * 0.5 ) * Math.max(Math.min(1 - progress, 0.5), 0);
		var rightShadowWidth = (pageSizeX * 0.5 ) * Math.max(Math.min(strength, 0.5), 0);
		var leftShadowWidth =  (pageSizeX * 0.5 ) * Math.max(Math.min(strength, 0.5), 0);

		this.fireEvent('fold', Math.max(foldX, 0));

		context.save();
		context.translate(this.options.bookPadding + (bookSizeX / 2), spacing + this.options.bookPadding);

		// draw a sharp shadow on the left side of the page
		context.strokeStyle = 'rgba(0,0,0,' + (0.05 * strength) + ')';
		context.lineWidth = 30 * strength;
		context.beginPath();
		context.moveTo(foldX - foldWidth, -verticalOutdent * 0.5);
		context.lineTo(foldX - foldWidth, pageSizeY + (verticalOutdent * 0.5));
		context.stroke();

		// right side drop shadow
		var rightShadowGradient = context.createLinearGradient(foldX, 0, foldX + rightShadowWidth, 0);
		rightShadowGradient.addColorStop(0, 'rgba(0,0,0,' + (strength * 0.2) + ')');
		rightShadowGradient.addColorStop(0.8, 'rgba(0,0,0,0.0)');

		context.fillStyle = rightShadowGradient;
		context.beginPath();
		context.moveTo(foldX, 0);
		context.lineTo(foldX + rightShadowWidth, 0);
		context.lineTo(foldX + rightShadowWidth, pageSizeY);
		context.lineTo(foldX, pageSizeY);
		context.fill();

		// left side drop shadow
		var leftShadowGradient = context.createLinearGradient(foldX - foldWidth - leftShadowWidth, 0, foldX - foldWidth, 0);
		leftShadowGradient.addColorStop(0, 'rgba(0,0,0,0.0)');
		leftShadowGradient.addColorStop(1, 'rgba(0,0,0,' + (strength * 0.15) + ')');

		context.fillStyle = leftShadowGradient;
		context.beginPath();
		context.moveTo(foldX - foldWidth - leftShadowWidth, 0);
		context.lineTo(foldX - foldWidth, 0);
		context.lineTo(foldX - foldWidth, pageSizeY);
		context.lineTo(foldX - foldWidth - leftShadowWidth, pageSizeY);
		context.fill();

		// gradient applied to the folded paper (highlights & shadows)
		var foldGradient = context.createLinearGradient(foldX - paperShadowWidth, 0, foldX, 0);
		foldGradient.addColorStop(0.35, '#fafafa');
		foldGradient.addColorStop(0.73, '#eeeeee');
		foldGradient.addColorStop(0.9, '#fafafa');
		foldGradient.addColorStop(1.0, '#e2e2e2');

		context.fillStyle = foldGradient;
		context.strokeStyle = 'rgba(0,0,0,0.06)';
		context.lineWidth = 0.5;

		// draw the folded piece of paper
		context.beginPath();
		context.moveTo(foldX, 0);
		context.lineTo(foldX, pageSizeY);
		context.quadraticCurveTo(foldX, pageSizeY + (verticalOutdent * 2), foldX - foldWidth, pageSizeY + verticalOutdent);
		context.lineTo(foldX - foldWidth, -verticalOutdent);
		context.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);

		context.fill();
		context.stroke();

		context.restore();

		return this;
	}

});