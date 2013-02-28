/**
 * @abstract
 * @class ui.AbstractOverlay
 * @extends ui.Container
 *
 * Base class for UI elements that "float" on top of the document (most notably: {@link ui.Overlay}, and {@link ui.Dialog}).
 * This can be positioned by {@link #x} and {@link #y} values, or positioned relative to other elements using the {@link #anchor}
 * config.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, window, jQuery, Jux, ui */
ui.AbstractOverlay = Class.extend( ui.Container, {

	/**
	 * @cfg {Boolean} autoDestroy
	 * True by default, the Overlay is destroyed when it is closed for automatic DOM/memory management. However, if
	 * the Overlay is to be reused between many opens/closes (to avoid the overhead of creating new ones), this can be set
	 * to false so that it can be re-opened after it is closed.  A call to {@link #destroy} must be done manually however
	 * once the Overlay is no longer needed, to clean up its elements and event handlers (which includes its window resize
	 * handler).
	 */
	autoDestroy : true,


	/**
	 * @cfg {Boolean} autoOpen
	 * Set to true to automatically open the overlay when it is instantiated. If false, a call to {@link #open} is
	 * required to open the overlay.
	 */
	autoOpen : false,


	/**
	 * @cfg {Boolean} closeOnEscape
	 * True to have the Overlay close when the 'esc' key is pressed. Set to false to disable this behavior.
	 */
	closeOnEscape : true,

	/**
	 * @cfg {Boolean} closeOnMouseOut
	 * True to have the Overlay close after the mouse has left the Overlay. Waits for the {@link #closeOnMouseOutDelay}
	 * before actually closing the Overlay.
	 */
	closeOnMouseOut : false,
	
	/**
	 * @cfg {Number} closeOnMouseOutDelay
	 * If the {@link #closeOnMouseOut} config is true, this number is the delay (in milliseconds) that the Overlay waits 
	 * before running the {@link #method-close close} method. The timeout starts when the mouse leaves the overlay, but is
	 * reset if the mouse comes back over the overlay.
	 */
	closeOnMouseOutDelay : 2000,


	/**
	 * @cfg {Object} openAnim
	 * A {@link ui.anim.Animation} configuration object to animate the "opening" transition. You do not need to specify
	 * the {@link ui.anim.Animation#target} parameter however, as it will be set to this Overlay.
	 */

	/**
	 * @cfg {Object} closeAnim
	 * A {@link ui.anim.Animation} configuration object to animate the "closing" transition. You do not need to specify
	 * the {@link ui.anim.Animation#target} parameter however, as it will be set to this Overlay.
	 */



	// Positioning Configs

	/**
	 * @cfg {Object} anchor
	 * An anchoring configuration object, to anchor the overlay to another element on the page.
	 * This is an object with the following properties:
	 *
	 * @cfg {String} anchor.my
	 *   Where on the overlay itself to position against the target `element`. Accepts a string in the
	 *   form of "horizontal vertical". A single value such as "right" will default to "right center", "top"
	 *   will default to "center top" (following CSS convention). Acceptable values: "top", "center", "bottom",
	 *   "left", "right". Example: "left top" or "center center".  So, if "left top", the top left of the overlay
	 *   will be positioned to the target `element`. Defaults to "left top".
	 *
	 * @cfg {String} anchor.at
	 *   Where at the target `element` the overlay should be positioned against. Accepts a string in the
	 *   form of "horizontal vertical". A single value such as "right" will default to "right center", "top"
	 *   will default to "center top" (following CSS convention). Acceptable values: "top", "center", "bottom",
	 *   "left", "right". Example: "left top" or "center center".  So, if "left bottom", the overlay will be
	 *   positioned against the bottom left of the target `element`. Defaults to "left bottom".
	 *
	 * @cfg {HTMLElement/jQuery/ui.Component} anchor.of
	 *   The HTMLElement or {@link ui.Component} to anchor the overlay to. Can either be defined as either "of" (following
	 *   jQuery UI) or "element". Required unless the `element` property is provided.
	 *
	 * @cfg {HTMLElement/jQuery/ui.Component} [anchor.element]
	 *   Synonym of `of` property, which may replace it where it makes more sense in calling code.
	 *
	 * @cfg {String} [anchor.offset]
	 *   Adds these left-top values to the calculated position. Ex: "50 50" (left top). A single value
	 *   given in the string will apply to both left and top values.
	 *
	 * @cfg {String} [anchor.collision]
	 *   When the positioned element overflows the window in some direction, move it to an alternative position. Similar to `my` and `at`,
	 *   this accepts a single value or a pair for horizontal/vertical, eg. "flip", "fit", "fit flip", "fit none". Defaults to 'flip'.
	 *
	 *   - __flip__: (the default) to the opposite side and the collision detection is run again to see if it will fit. If it won't fit in either position, the center option should be used as a fall back.
	 *   - __fit__: so the element keeps in the desired direction, but is re-positioned so it fits.
	 *   - __none__: do not do collision detection.
	 */

	/**
	 * @cfg {Number/String} x
	 * The initial x position of the Overlay. This can be a number defining how many pixels from the left of the screen,
	 * or one of the strings that the jQuery UI Positioning plugin accepts ('center', 'left', 'right', 'top', 'bottom').
	 * This can also be a negative integer, in which case it will be taken as the number of pixels from the right side of
	 * the screen. Ex: A value of -50 will position the right side of the Overlay 50px from the right side of the screen.<br><br>
	 *
	 * Note that this config will not be used if {@link #anchor} is provided.
	 */

	/**
	 * @cfg {Number/String} y
	 * The initial y position of the Overlay. This can be a number defining how many pixels from the top of the screen,
	 * or one of the strings that the jQuery UI Positioning plugin accepts ('center', 'left', 'right', 'top', 'bottom').
	 * This can also be a negative integer, in which case it will be taken as the number of pixels from the bottom of
	 * the screen. Ex: A value of -50 will position the bottom of the Overlay 50px from the bottom of the screen.<br><br>
	 *
	 * Note that this config will not be used if {@link #anchor} is provided.
	 */


	/**
	 * @cfg {Number/String} maxHeight
	 * A maximum height to give the Overlay. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing,
	 * but will be constrained to the browser's viewport.  If a maxHeight is given that is larger than the browser's viewport, then the browser's
	 * viewport height will be preferred.
	 */

	/**
	 * @cfg {Number/String} maxWidth
	 * A maximum width to give the Overlay. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing,
	 * but will be constrained to the browser's viewport.  If a maxWidth is given that is larger than the browser's viewport, then the browser's
	 * viewport width will be preferred.
	 */



	/**
	 * @hide
	 * @cfg {jQuery/HTMLElement} renderTo
	 * 
	 * This config should not be specified for this subclass. The Overlay will
	 * automatically be rendered into the document body when it is opened.
	 */


	/**
	 * @private
	 * @property {Boolean} opened
	 * 
	 * Flag that is set to true when the Overlay is opened. Is set to false when the Overlay is closed. Note that this
	 * is set to true immediately when the Overlay is opened (even while it is {@link #opening}), and set to false immediately
	 * when the Overlay is closed (even while it is {@link #closing}). This is for the fact that even if the Overlay is opening,
	 * it is already shown, and therefore considered opened.
	 */
	opened : false,

	/**
	 * @private
	 * @property {Boolean} opening
	 * 
	 * Flag that is set to true while the Overlay is opening (i.e. its {@link #openAnim} animation is running). It is set to false
	 * when the Overlay has fully opened.
	 */
	opening : false,

	/**
	 * @private
	 * @property {Boolean} closing
	 * 
	 * Flag that is set to true when the Overlay is closing (i.e. its {@link #closeAnim} animation is running). It is set to false
	 * when the Overlay has fully closed.
	 */
	closing : false,

	/**
	 * @private
	 * @property {ui.anim.Animation} currentAnimation
	 * 
	 * The currently running open or close animation (see {@link #openAnim}/{@link #closeAnim}), if any. Will be null if the Overlay
	 * is not currently in the process of opening or closing.
	 */
	currentAnimation : null,

	/**
	 * @private
	 * @property {jQuery} $contentContainer
	 * 
	 * The inner overlay container, where either content HTML or child {@link ui.Component Components} are added.
	 */

	/**
	 * @private
	 * @property {Function} windowResizeHandler
	 * 
	 * The scope wrapped function for handling window resizes (which calls the method to resize the overlay accordingly).
	 * This is needed as a property so that we can unbind the window's resize event from the Overlay when the Overlay
	 * is destroyed.
	 */

	/**
	 * @private
	 * @property {Jux.util.DelayedTask} mouseOutHideTask
	 * 
	 * A DelayedTask instance used to keep track of how long the mouse has not been over the Overlay, for use when the
	 * {@link #closeOnMouseOut} config is true. The delay is dictated by the {@link #closeOnMouseOutDelay} config.
	 * 
	 * Note that this will only be created if the {@link #closeOnMouseOut} config is true.
	 */


	// protected
	initComponent : function() {
		// Call superclass initComponent
		this._super( arguments );


		this.addEvents(
			/**
			 * Fires before the Overlay is opened. Handlers of this event may cancel
			 * the opening of the Overlay by returning false.
			 *
			 * @event beforeopen
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'beforeopen',

			/**
			 * Fires when the Overlay has opened, or if an {@link #openAnim} config was provided, has <b>started</b> to open.
			 * To find out when an {@link #openAnim} animation has finished, listen to the {@link #opencomplete} event.<br><br>
			 *
			 * Note that this event fires as soon as the Overlay is starting to open because handlers most likely expect to do something
			 * with the Overlay immediately, before an animation is run on it. So for handlers of Overlays that first don't have
			 * any {@link #openAnim}, and then are given one, they will still work as expected (as opposed to the behavior of if this event
			 * fired at the end of the animation).
			 *
			 * @event open
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'open',

			/**
			 * An alias of the {@link #open} event, which can make handler-adding code more consistent and clear.
			 * Having a 'begin' event for 'open' maintains consistency with {@link #closebegin}.
			 *
			 * @event openbegin
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'openbegin',

			/**
			 * Fires when the overlay has fully opened, after an {@link #openAnim} animation has finished. Note that this
			 * event will fire regardless of if an {@link #openAnim} config was provided or not.<br><br>
			 *
			 * @event opencomplete
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'opencomplete',

			/**
			 * Fires just before the Overlay would be closed due to the Overlay "losing focus" (i.e.
			 * a click was made in the document outside of the overlay. This fires before the {@link #beforeclose}
			 * event, and handlers of this event may cancel the closing of the Overlay by returning false.
			 *
			 * @event beforeblurclose
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 * @param {jQuery.Event} evt The click event on the document, outside of the Overlay's elements.
			 */
			'beforeblurclose',

			/**
			 * Fires before the Overlay is closed. Handlers of this event may cancel
			 * the closing of the Overlay by returning false.
			 *
			 * @event beforeclose
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'beforeclose',

			/**
			 * Fires when the overlay is beginning to close. This event is useful if a {@link #closeAnim} is specified,
			 * as it fires just before the animation starts. The {@link #close} event will fire when the animation is complete,
			 * and the Overlay has completely closed. Note that this event will fire regardless of if a {@link #closeAnim} config
			 * is provided or not.<br><br>
			 *
			 * For the reason that this event is 'closebegin' instead of making an 'closecomplete' (to be consistent with
			 * 'opencomplete'), see the note in the {@link #close} event.
			 *
			 * @event closebegin
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'closebegin',

			/**
			 * Fires when the Overlay has closed, or if a {@link #closeAnim} config was provided, has <b>finished</b> closing.
			 * To find out when a {@link #closeAnim} animation has started, listen to the {@link #closebegin} event.<br><br>
			 *
			 * Note that this event fires only after the Overlay has fully closed because handlers most likely expect to do something
			 * after the Overlay is hidden from the DOM. So for handlers of Overlays that first don't have any {@link #closeAnim}, and
			 * then are given one, they will still work as expected (as opposed to the behavior of if this event fired at the start
			 * of the animation).
			 *
			 * @event close
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'close',

			/**
			 * An alias of the {@link #close} event, which can make handler-adding code more consistent and clear.
			 * Having a 'complete' event for 'close' maintains consistency with {@link #opencomplete}.
			 *
			 * @event closecomplete
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'closecomplete'
		);

		// Create the task that will hide the Overlay if the closeOnMouseOut config is true
		if( this.closeOnMouseOut ) {
			this.mouseOutHideTask = new Jux.util.DelayedTask();
		}

		// If the autoOpen config has been set to true, open the overlay immediately
		if( this.autoOpen ) {
			this.open();
		}
	},


	/**
	 * Extension of onRender which is used to create Overlay and its inner overlay content.
	 *
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		this._super( arguments );


		// Create the content div container, which will hold the overlay's HTML or child components.
		// This is a separate container so that the "arrow" can be appended inside the same overlay
		// container (in ui.Overlay), and is also for an extra layer of styling.
		this.$contentContainer = jQuery( '<div class="ui-overlay-content" />' ).appendTo( this.$el );


		// ------------------------------------------------


		// If the closeOnEscape config is true, set up a keydown event for it to close the overlay.
		if( this.closeOnEscape ) {
			this.$el.keydown( function( evt ) {
				if( evt.keyCode === jQuery.ui.keyCode.ESCAPE ) {
					this.close();
				}
			}.createDelegate( this ) );
		}


		// If the closeOnMouseOut config is true, set up mouseenter and mouseleave events to delay the close
		// of the overlay
		if( this.closeOnMouseOut ) {
			this.$el.on( {
				'mouseenter mousemove' : jQuery.proxy( this.onMouseEnter, this ),
				'mouseleave' : jQuery.proxy( this.onMouseLeave, this )
			} );
		} 


		// ------------------------------------------------


		// Set up an event handler for the window's resize event, to re-size and re-position the overlay based on the
		// new viewport's size.  The handler for this event is "buffered" just a little, so that the many resize events
		// that get fired while a window is being dragged don't cause the resize calculations to run each and every time.
		// Need to store the resize handler itself so that we can unbind it in the destroy() method when the Overlay is destroyed.
		var delayedTask = new Jux.util.DelayedTask( function() { this.onWindowResize(); }, this );
		this.windowResizeHandler = function() {	delayedTask.delay( 150 ); };
		jQuery( window ).bind( 'resize', this.windowResizeHandler );
	},


	/**
	 * Retrieves the element that should be the target for the Component's content (html) or child components.  For this subclass,
	 * this is the {@link #$contentContainer}.
	 *
	 * @method getContentTarget
	 * @return {jQuery} The element (jQuery wrapped set) where HTML content or child components should be placed.
	 */
	getContentTarget : function() {
		return this.$contentContainer;
	},


	// -----------------------------------------
	

	/**
	 * Handles the mouse entering the Overlay. This method is to support the {@link #closeOnMouseOut} config,
	 * and is only called if {@link #closeOnMouseOut} is true.
	 * 
	 * @private
	 * @method onMouseEnter
	 */
	onMouseEnter : function() {
		this.mouseOutHideTask.cancel();
	},


	/**
	 * Handles the mouse leaving the Overlay. This method is to support the {@link #closeOnMouseOut} config,
	 * and is only called if {@link #closeOnMouseOut} is true.
	 * 
	 * @private
	 * @method onMouseLeave
	 */
	onMouseLeave : function() {
		this.mouseOutHideTask.delay( this.closeOnMouseOutDelay, this.close, this );
	},


	// -----------------------------------------


	/**
	 * Opens the Overlay, rendering it if it has not yet been rendered. The overlay is rendered here
	 * so all Components can be added to it first before rendering it.
	 *
	 * @method open
	 * @param {Object} [options] An object which may contain the following properties. Note that providing any
	 *   properties that are configuration options will overwrite those configuration options of the same name.
	 * @param {Object} [options.anchor] An {@link #anchor} config to set on the call to open. Note that subsequent calls to
	 *   open() will use this config unless changed by a call to {@link #setAnchor}.
	 * @param {Number/String} [options.x] An {@link #x} config to set on the call to open. Note that subsequent calls to open()
	 *   will use this config unless changed by a call to {@link #setPosition}. See {@link #x} for more details. Note that
	 *   providing an `anchor` will override this value.
	 * @param {Number/String} [options.y] A {@link #y} config to set on the call to open. Note that subsequent calls to open()
	 *   will use this config unless changed by a call to {@link #setPosition}.  See {@link #y} for more details. Note that
	 *   providing an `anchor` will override this value.
	 * @param {Boolean} [options.animate] True by default, set to false to skip any {@link #openAnim} that is defined from running
	 *   its animation (on this call to `open()` only).
	 */
	open : function( options ) {
		options = options || {};
		if( typeof options.animate === 'undefined' ) {
			options.animate = true;
		}

		// If the Overlay is currently in the process of being animated closed when the call to this method is made, finish it up
		// so we can open it again.
		if( this.closing ) {
			this.currentAnimation.end();  // ends the "closing" animation, and runs closeComplete()
		}

		// if the overlay isn't opened already, and a beforeopen handler doesn't return false
		if( !this.opened && this.fireEvent( 'beforeopen', this ) !== false ) {
			this.opened = true;
			this.opening = true;  // will only be true while any 'openAnim' animation is running

			// If the overlay has not been rendered yet, render it now to the document body
			if( !this.rendered ) {
				this.render( document.body );
			}

			// Call the show() method of the Component superclass when the Overlay is opened, so that the onShow() hook method runs, and the 'show' event fires.
			// Note that this should be done before setting the Overlay's position, as that relies on the Overlay's inner content.
			this.show();


			// Call hook method
			this.onBeforeOpen( options );

			// ---------------------------------


			// Set any of the config options provided as the options to this method

			// Position the overlay now that it is shown. If new positioning information was provided, use that.
			// Otherwise, position based on the last set values.
			if( options.anchor ) {
				this.setAnchor( options.anchor );

			} else if( options.hasOwnProperty( 'x' ) || options.hasOwnProperty( 'y' ) ) {
				var x = ( typeof options.x !== 'undefined' ) ? options.x : this.x;  // if one was provided, but not the other,
				var y = ( typeof options.y !== 'undefined' ) ? options.y : this.y;  // use the current value for the other
				this.setPosition( x, y );

			} else {
				// No new anchor or x/y configs provided in the call to this method, position the Overlay based on any pre-configured values
				this.updatePosition();
			}


			// ---------------------------------

			// Run hook method, and fire the 'open' event, before any animation is run. See the 'open' and the 'opencomplete'
			// event description for details on why this is done now, and not when the open animation (if any) is complete.
			this.onOpen();
			this.fireEvent( 'openbegin', this );
			this.fireEvent( 'open', this );

			// If an open animation was specified, run that now. Otherwise, call the 'openComplete' method immediately.
			if( this.openAnim && options.animate ) {  // note: options.animate is true by default
				var animConfig = Jux.apply( {}, { target: this }, this.openAnim );  // the 'openAnim' config provides defaults. We specify the target explicitly.

				this.currentAnimation = new ui.anim.Animation( animConfig );
				this.currentAnimation.addListener( 'afteranimate', this.openComplete, this );  // adding a listener instead of providing in config, in case there is already a listener in the config
				this.currentAnimation.start();
			} else {
				this.openComplete();
			}
		}
	},


	/**
	 * Hook method that is run before the Overlay has been opened (before any {@link #openAnim} has started).
	 *
	 * @protected
	 * @method onBeforeOpen
	 * @param {Object} options The options object provided to the {@link #open} method.
	 */
	onBeforeOpen : Jux.emptyFn,


	/**
	 * Private method that is run when the Overlay has fully opened. This may be delayed from the call to {@link #open} if an
	 * {@link #openAnim} config exists, or may be called immediately if not. Sets private properties to the state they should
	 * be in when the Overlay has fully opened.
	 *
	 * @private
	 * @method openComplete
	 */
	openComplete : function() {
		this.opening = false;
		this.currentAnimation = null;  // remove the reference to the "opening" animation

		/* For now, only starting the timeout when the mouse is actually moved over the Overlay element.
		 * If we start it now, Overlays that open as the result of mouse-overing/clicking an element, where 
		 * the overlay is opened right above the element, the timer may close it before the user ever 
		 * moves their mouse.
		if( this.closeOnMouseOut ) {
			this.mouseOutHideTask.delay( this.closeOnMouseOutDelay, this.close, this );
		}
		*/
		
		this.fireEvent( 'opencomplete', this );
	},


	/**
	 * Hook method that is run when the Overlay has been opened, after any {@link #openAnim} has completed.
	 *
	 * @protected
	 * @method onOpen
	 */
	onOpen : Jux.emptyFn,


	/**
	 * Determines if this Overlay is currently open, or in the process of opening (with an {@link #openAnim}.
	 * If the overlay is currently closing (with a {@link #closeAnim}, it will *not* be considered open.
	 *
	 * @method isOpen
	 * @return {Boolean} True if the Overlay is open, or in the process of opening. Returns false otherwise.
	 */
	isOpen : function() {
		return this.opened;
	},


	/**
	 * Retrieves the height of the Overlay itself. The Overlay must be open for this calculation.
	 *
	 * @method getHeight
	 * @return {Number} The height of the Overlay if it is open, or 0 if it is not.
	 */
	getHeight : function() {
		if( this.isOpen() ) {
			return this.$el.outerHeight();
		} else {
			return 0;
		}
	},


	/**
	 * Retrieves the width of the Dialog itself. The dialog must be open for this calculation.
	 *
	 * @method getWidth
	 * @return {Number} The width of the Dialog if it is open, or 0 if it is not.
	 */
	getWidth : function() {
		if( this.isOpen() ) {
			return this.$el.outerWidth();
		} else {
			return 0;
		}
	},


	/**
	 * Sets the position of the Overlay (more specifically, the {@link #x} and {@link #y} configs), and refreshes the Overlay's
	 * position (if it is currently open). Note: by running this method, any {@link #anchor} config is nulled out.
	 *
	 * @method setPosition
	 * @param {Number/String} x The new x position of the Overlay. See the {@link #x} config for details.
	 * @param {Number/String} y The new y position of the Overlay. See the {@link #y} config for details.
	 */
	setPosition : function( x, y ) {
		// Store the variables in case the dialog is not yet open, and for later use if the browser window is resized.
		// (This is mainly needed for when this method is called externally, and not from within the Overlay.)
		this.x = x;
		this.y = y;

		// Make sure there is no 'anchor' if we want x/y positioning
		this.anchor = null;

		this.updatePosition();
	},


	/**
	 * Sets the {@link #anchor} config, and refreshes the Overlay's position (if it is currently open).
	 *
	 * @method setAnchor
	 * @param {Object} anchor See the {@link #anchor} config for details.
	 */
	setAnchor : function( anchor ) {
		this.anchor = anchor;
		this.updatePosition();
	},


	/**
	 * Resets the position of the Overlay to match the {@link #anchor} config if one exists, or otherwise uses the
	 * {@link #x} and {@link #y} configs.
	 *
	 * @private
	 * @method updatePosition
	 */
	updatePosition : function() {
		if( this.isOpen() ) {
			var my, at, of, offset, collision,
			    $el = this.$el;

			if( this.anchor ) {
				// Anchor config provided, or set with setAnchor(), use that
			    var anchor = this.anchor;

				my = anchor.my || 'left top';
				at = anchor.at || 'left bottom';
			    of = anchor.element || anchor.of;  // accept either 'element' or 'of' from the anchor config
				offset = anchor.offset;
				collision = anchor.collision || 'flip';  // even though this seems to be the default 'collision' value in jQuery UI, we need this default value for a later if statement to check if 'flip' was used (as a short circuit to checking the classes on the element itself)

				// Handle the anchor element being a ui.Component, by grabbing the Component's DOM element
				if( of instanceof ui.Component ) {
					of = of.getEl();
				}

			} else {
				// no 'anchor' config provided, use x/y relative to the document body
				var xSide = ( this.x > 0 ) ? 'left' : 'right';  // Position from right if this.x < 0
				var ySide = ( this.y > 0 ) ? 'top' : 'bottom';  // Position from bottom if this.y < 0
				my = at = xSide + ' ' + ySide;
				of = document.body;
				offset = this.x + ' ' + this.y;
			}

			// Position the Overlay
			$el.position( {
				my: my,
				at: at,
				of: of,
				offset: offset,
				collision: collision
			} );

			// Check if there was a collision with the window
			this.checkCollision();
		}
	},


	/**
	 * Checks if the Overlay has collided with the window in some way. If so, calls the {@link #onCollision} method
	 * with information about the collision.
	 *
	 * @private
	 * @method checkCollision
	 */
	checkCollision : function() {
		var anchor = this.anchor;
		if( anchor ) {
			var collision = anchor.collision || 'flip';   // "flip" is the default for jQuery UI's position utility, so if it has not been specified, that is what was used
			if( collision.indexOf( 'flip' ) > -1 ) {
				var cssClass = this.$el.attr( 'class' );

				if( /(^| )ui-flipped-(top|bottom|left|right)( |$)/.test( cssClass ) ) {
					this.onCollision( 'flip', {
						top    : /(^| )ui-flipped-bottom( |$)/.test( cssClass ),  // these are opposites,
						bottom : /(^| )ui-flipped-top( |$)/.test( cssClass ),     // as the position it was flipped
						left   : /(^| )ui-flipped-right( |$)/.test( cssClass ),   // to is the opposite position
						right  : /(^| )ui-flipped-left( |$)/.test( cssClass )     // it collided with the window
					} );
				}
			}
		}
	},

	/**
	 * Hook method that is executed after the Overlay has been positioned using the {@link #anchor} config, but
	 * has collided with the window boundaries in some direction. This implementation reverses any {@link #anchor}
	 * `offset` when flipped.
	 *
	 * @protected
	 * @method onCollision
	 * @param {String} collisionType The value of the `collision` option of the {@link #anchor} config.
	 *
	 * @param {Object} collisionDirections An object (hash) of where the Overlay collided with the window. Has properties:
	 * @param {Boolean} collisionDirections.top True if the Overlay collided with the top of the window, false otherwise.
	 * @param {Boolean} collisionDirections.bottom True if the Overlay collided with the bottom of the window, false otherwise.
	 * @param {Boolean} collisionDirections.left True if the Overlay collided with the left side of the window, false otherwise.
	 * @param {Boolean} collisionDirections.right True if the Overlay collided with the right side of the window, false otherwise.
	 */
	onCollision : function( collisionType, collisionDirections ) {
		/* Not sure we need all of this code... jQuery UI might take care of it after all
		var anchor = this.anchor;
		if( collisionType === 'flip' && anchor && anchor.offset ) {
			// Reverse the offsets of the anchor in the appropriate direction, if it had offsets
			var offsets = anchor.offset.split( ' ' ),   // will make an array of 'left' and 'top' offsets (unless there is only one value, which will be normalized next)
			    newXOffset = 0, newYOffset = 0;

			// Normalize the 'offsets' if only one value was provided
			if( offsets.length === 1 ) {
				offsets[ 1 ] = offsets[ 0 ];
			}

			if( collisionDirections.left || collisionDirections.right ) {
				newXOffset = ( -1 * +offsets[ 0 ] );  // apply the offset on the opposite side of where it was going originally (before the collision)
			}
			if( collisionDirections.top || collisionDirections.bottom ) {
				newYOffset = ( -1 * +offsets[ 1 ] );  // apply the offset on the opposite side of where it was going originally (before the collision)
			}

			if( newXOffset !== 0 || newYOffset !== 0 ) {
				this.$el.css( {
					left : ( parseInt( this.$el.css( 'left' ), 10 ) + newXOffset ) + 'px',
					top  : ( parseInt( this.$el.css( 'top' ), 10 ) + newYOffset ) + 'px'
				} );
			}
		}*/
	},



	/**
	 * Event handler for the browser window's resize event, in which the Overlay is re-positioned.
	 *
	 * @private
	 * @method onWindowResize
	 */
	onWindowResize : function() {
		this.updatePosition();
	},


	/**
	 * Closes the overlay.
	 *
	 * @method close
	 * @param {Object} [options] An object which may contain the following properties:
	 * @param {Boolean} [options.animate] True by default, set to false to skip any {@link #closeAnim} that is 
	 *   defined from running its animation (on this call to `close()` only).
	 */
	close : function( options ) {
		options = options || {};
		if( typeof options.animate === 'undefined' ) {
			options.animate = true;
		}

		if( this.opening ) {
			this.currentAnimation.end();  // ends the "opening" animation, and runs openComplete()
		}

		// If the Overlay is open, and is not currently in the process of closing, close it now.
		if( this.opened && !this.closing && this.fireEvent( 'beforeclose', this ) !== false ) {
			this.opened = false;
			this.closing = true;  // will only be true while any openAnim animation is running

			// Call hook method
			this.onBeforeClose( options );

			// Cancel any pending closeOnMouseOut task
			if( this.closeOnMouseOut ) {
				this.mouseOutHideTask.cancel();
			}

			this.fireEvent( 'closebegin', this );

			// If a close animation was specified, run that now. Otherwise, call the 'closeCompleteCallback' immediately.
			if( this.closeAnim && options.animate ) {  // note: options.animate is true by default
				var animConfig = Jux.apply( {}, { target: this }, this.closeAnim );

				this.currentAnimation = new ui.anim.Animation( animConfig );
				this.currentAnimation.addListener( 'afteranimate', this.closeComplete, this );  // adding a listener instead of providing in config, in case there is already a listener in the config
				this.currentAnimation.start();
			} else {
				this.closeComplete();
			}
		}
	},


	/**
	 * Hook method that is run just before the Overlay is to be closed (before any {@link #closeAnim} has started).
	 *
	 * @protected
	 * @method onBeforeClose
	 * @param {Object} options The options object provided to the {@link #close} method.
	 */
	onBeforeClose : Jux.emptyFn,


	/**
	 * Private method that is run when the Overlay has fully closed. This may be delayed from the call to {@link #close} if a
	 * {@link #closeAnim} config exists, or may be called immediately if not. Hides the Overlay (if it is not already hidden),
	 * runs the {@link #onClose} hook method, and fires the {@link #close} event. If the {@link #autoDestroy} config is true,
	 * destroys the Overlay as well.
	 *
	 * @private
	 * @method closeComplete
	 */
	closeComplete : function() {
		this.closing = false;
		this.currentAnimation = null;  // remove the reference to the "closing" animation

		this.hide();

		// Run hook method, and fire the 'close' event
		this.onClose();
		this.fireEvent( 'close', this );
		this.fireEvent( 'closecomplete', this );

		// Destroy this Overlay when closed for DOM/memory management, if the autoDestroy config is true
		if( this.autoDestroy ) {
			this.destroy();
		}
	},



	/**
	 * Hook method that is run when the Overlay has been closed (after any {@link #closeAnim} has completed).
	 *
	 * @protected
	 * @method onClose
	 */
	onClose : Jux.emptyFn,


	// protected
	onDestroy : function() {
		// Make sure the Overlay is closed, and all of that functionality has run, before destroying the overlay.
		if( this.isOpen() ) {
			this.close( { animate: false } );
		}

		// Unbind our window resize handler, but only if it's rendered, as the windowResizeHandler is set up in onRender(). 
		// Otherwise, if the windowResizeHandler is undefined when we call unbind, we'd end up unbinding *all* window resize handlers!)
		if( this.rendered ) {
			jQuery( window ).unbind( 'resize', this.windowResizeHandler );
		}

		this._super( arguments );
	}

} );
