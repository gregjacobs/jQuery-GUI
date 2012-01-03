/**
 * @class ui.Dialog
 * @extends ui.Container
 * 
 * Wrapper for the jQuery UI Dialog, which also provides the functionality
 * of a {@link ui.Container} that may hold child {@link ui.Component Components}, and a few other features such as:
 * <div class="mdetail-params"><ul>
 *   <li>Automatic cleanup of the dialog when it is closed (see the {@link #autoDestroy} config}.</li>
 *   <li>Management of a "content" area, and a bottom bar (which may be used as a footer and/or buttons bar).</li>
 *   <li>
 *     Better management of the {@link #closeOnEscape} feature that jQuery UI normally provides. In regular jQuery UI dialogs, this config
 *     has the effect of when the 'esc' key is pressed, *all* open dialogs are closed (such as when one is opened on top of another), while 
 *     the implementation in this class only closes the dialog that has focus when the 'esc' key is pressed.
 *   </li>
 *   <li>
 *     Automatic dialog sizing based on the window's viewport (the dialog is constrained to the viewport's size), and a window resize handler 
 *     to automatically resize the Dialog when the window size changes.
 *   </li>
 *   <li>A configuration option to easily hide the top-right "close" button that jQuery UI dialogs create. See {@link #closeButton}.</li>
 *   <li>The ability to make the modal overlay be transparent on a per-dialog basis, via configuration. See {@link #overlay}.</li>
 *   <li>
 *     The ability to position the dialog based on an offset from the right side or bottom of the screen. See the {@link #x} and {@link #y}
 *     configs, noting the ability to provide a negative integer to them (which signifies to position from the right side or bottom of the screen).
 *   </li>
 * </ul></div>
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global window, jQuery, Kevlar, ui */
ui.Dialog = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {Boolean} autoDestroy
	 * True by default, the Dialog is destroyed when it is closed for automatic DOM/memory management. However, if
	 * the Dialog is to be reused between many opens/closes (to avoid the overhead of creating new ones), this can be set 
	 * to false so that it can be re-opened after it is closed.  A call to {@link #destroy} must be done manually however
	 * once the Dialog is no longer needed, to clean up its elements and event handlers (which includes its window resize
	 * handler).  
	 */
	autoDestroy : true,
	
	
	/**
	 * @cfg {Boolean} autoOpen
	 * Set to true to automatically open the dialog when it is instantiated. If false, a call to {@link #open} is
	 * required to open the dialog.
	 */
	autoOpen : false,
	
	
	/**
	 * @cfg {Boolean} modal
	 * True to create the dialog as a modal dialog (i.e. everything behind the dialog will be inaccessible).
	 */
	modal : false,
	
	
	/**
	 * @cfg {Boolean} overlay
	 * If the {@link #modal} config is true, this may be set to false to hide the modal's overlay that normally shows behind the
	 * dialog.  The overlay itself won't actually hidden (therefore still making the dialog a modal dialog), but made completely 
	 * transparent instead.<br><br>
	 *
	 * NOTE/TODO: This currently has issues with multiple jQueryUI dialogs with different opacities set, possibly due to other dialogs
	 * (esp. ones created directly, without using this class) changing all overlay opacities, and jQuery UI remembering these states
	 * and re-using them for some reason. Have to investigate.
	 */
	overlay : true,
	
	
	/**
	 * @cfg {Number/String} x
	 * The initial x position of the Dialog. This can be a number defining how many pixels from the left of the screen,
	 * or one of the strings that the jQuery UI Dialog accepts ('center', 'left', 'right', 'top', 'bottom').  This can also be a negative
	 * integer, in which case it will be taken as the number of pixels from the right side of the screen. Ex: A value of -50 will position the 
	 * right side of the dialog 50px from the right side of the screen.
	 */
	x : 'center',
	
	/**
	 * @cfg {Number/String} y
	 * The initial y position of the Dialog. This can be a number defining how many pixels from the top of the screen,
	 * or one of the strings that the jQuery UI Dialog accepts ('center', 'left', 'right', 'top', 'bottom').  This can also be a negative
	 * integer, in which case it will be taken as the number of pixels from the bottom of the screen. Ex: A value of -50 will position the 
	 * bottom of the dialog 50px from the bottom of the screen. 
	 */
	y : 'center',
	
	
	/**
	 * @cfg {Number/String} height
	 * A height to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string.
	 */
	height : 'auto',
	
	/**
	 * @cfg {Number/String} width
	 * A width to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string.
	 */
	width : 'auto',
	
	/**
	 * @cfg {Number/String} minHeight
	 * A minimum height to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string.
	 */
	minHeight : 10,
	
	/**
	 * @cfg {Number/String} minWidth
	 * A minimum width to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string.
	 */
	minWidth : 'auto',
	
	/**
	 * @cfg {Number/String} maxHeight
	 * A maximum height to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing,
	 * but will be constrained to the browser's viewport.  If a maxHeight is given that is larger than the browser's viewport, then the browser's
	 * viewport height will be preferred. 
	 */
	
	/**
	 * @cfg {Number/String} maxWidth
	 * A maximum width to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing,
	 * but will be constrained to the browser's viewport.  If a maxWidth is given that is larger than the browser's viewport, then the browser's
	 * viewport width will be preferred.
	 */
	
	
	/**
	 * @cfg {String/HTMLElement/jQuery/ui.Component} title 
	 * The title for the dialog box to use. Can be a string of text, a string of HTML, a jQuery wrapped set, or a 
	 * {@link ui.Component}.
	 */
	title: '',
	
	
	/**
	 * @cfg {Boolean/ui.Button} closeButton
	 * True to create a close button in the top right of the dialog. When clicked, this button closes the dialog.
	 * Set to false to hide this button.  This config also accepts a ui.Button instance for the button,
	 * but this button must set up its own handler for what to do when clicked (it will simply be placed in the close 
	 * button's position).
	 */
	closeButton : true,
	
	/**
	 * @cfg {Boolean} closeOnEscape
	 * True to have the dialog close when the 'esc' key is pressed. Set to false to disable this behavior. If this config is
	 * true, and the 'esc' key is pressed, the Dialog will close.
	 */
	closeOnEscape : true,
	
	
	/**
	 * @cfg {ui.Button[]} buttons
	 * An array of {@link ui.Button} configs for the main dialog buttons (the buttons that display on the bottom
	 * right of the dialog box). Defaults to an empty array, for no buttons.<br><br>
	 * 
	 * Note that if anonymous config objects are provided to this config, and they do not specify a 'type', they are assumed 
	 * to be of type {@link ui.Button}.
	 */
	buttons : [],
	
	/**
	 * @cfg {String/HTMLElement/jQuery/ui.Component} footer
	 * An HTML string, HTML Element, jQuery wrapped set, or {@link ui.Component} (most likely a {@link ui.Container}) to put
	 * into the footer of the dialog.  The content for the footer will go on the left side of the footer (as Dialog buttons
	 * are pushed to the right side).
	 */
	
	
	/**
	 * @hide 
	 * @cfg {jQuery/HTMLElement} renderTo 
	 * This config should not be specified for this subclass. The Dialog will
	 * automatically be rendered into the document body when it is opened. 
	 */
	
	
	
	/**
	 * @private
	 * @property $dialog
	 * The jQuery UI dialog instance element.
	 * @type jQuery
	 */
	
	/**
	 * @protected
	 * @property $dialogOuter
	 * The dialog's outer element. This will be added after the jQuery UI dialog has been instantiated.
	 * @type jQuery
	 */
		
	/**
	 * @private
	 * @property $dialogInner
	 * The dialog's inner wrapper element, used as an extra layer for styling the dialog's border.
	 * It will be added after the jQuery UI dialog has been instantiated, and positioned directly
	 * inside the outer dialog element (the element created by jQuery UI for the dialog).
	 * @type jQuery
	 */
		
	/**
	 * @private
	 * @property $contentContainer
	 * The content container, where either content HTML or child {@link ui.Component Components} are added.
	 * This is actually just an alias of {@link ui.Component#$el the Component's element}, as the
	 * {@link ui.Component Component's} element is what is used for the dialog's content.
	 * @type jQuery
	 */
	
	/**
	 * @private
	 * @property bottomBarContainer
	 * The {@link ui.Container} instance for holding the {@link #footerContainer} and the {@link #buttonsContainer}, at
	 * the bottom of the Dialog.  This may or may not be shown, depending on if the {@link #footer} or {@link #buttons}
	 * configs are set (if neither are set, the bottom bar will not be shown).  Note that the {@link #buttons} config has
	 * a default however.  To display no buttons, set `buttons: []`
	 * @type ui.Container  
	 */
	
	/**
	 * @private
	 * @property footerContainer
	 * The {@link ui.Container} instance for holding footer content / {@link ui.Component Components}, in the {@link #bottomBarContainer}.
	 * @type ui.Container
	 */
	
	/**
	 * @private
	 * @property buttonsContainer
	 * The {@link ui.Container} instance for holding the main Dialog {@link ui.Button Buttons}, in the {@link #bottomBarContainer}.
	 * @type ui.Container
	 */
	
	/**
	 * @private
	 * @property $overlayEl
	 * The overlay element that jQuery UI creates for modal dialogs. This element will exist only if the {@link #modal}
	 * config is set to true, and after the dialog has been opened.
	 */
	
	/**
	 * @private
	 * @property windowResizeHandler
	 * The scope wrapped function for handling window resizes (which calls the method to resize the dialog accordingly).
	 * This is needed as a property so that we can unbind the window's resize event from the Dialog when the Dialog
	 * is destroyed. 
	 * @type Function
	 */
	
	
	// protected
	initComponent : function() {
		// Workaround for jQuery UI Dialog. Because the jQuery UI Dialog is what should be sized by the width/height configs,
		// and because the jQuery UI Dialog wraps the ui.Component's div element with its own, we don't want the div element 
		// that ui.Component creates to be sized; just the UI Dialog.  So, setting these configs to private dialog-only variables 
		// which will be used when the jQuery UI Dialog is instantiated, and then removing them before calling the superclass 
		// initComponent so that the (now inner) div element created by ui.Component is not affected by sizing.  "Removing" the 
		// original configs by setting them to undefined rather than deleting them, for the case of subclasses that override
		// the properties on their prototype.
		this.dialogHeight = this.height;        this.height = undefined;
		this.dialogWidth = this.width;          this.width = undefined;
		this.dialogMinHeight = this.minHeight;  this.minHeight = undefined;
		this.dialogMinWidth = this.minWidth;    this.minWidth = undefined;
		this.dialogMaxHeight = this.maxHeight;  this.maxHeight = undefined;
		this.dialogMaxWidth = this.maxWidth;    this.maxWidth = undefined;
		
		
		this.addEvents(
			/**
			 * @event beforeopen
			 * Fires before the dialog has opened. Handlers of this event may prevent
			 * the opening of the dialog by returning false. 
			 * @param {ui.Dialog} dialog This dialog instance.
			 */
			'beforeopen',
			
			/**
			 * @event open
			 * Fires when the dialog has opened.
			 * @param {ui.Dialog} dialog This dialog instance.
			 */
			'open',
			
			/**
			 * @event beforeclose
			 * Fires before the dialog has closed. Handlers of this event may prevent
			 * the closing of the dialog by returning false. 
			 * @param {ui.Dialog} dialog This dialog instance.
			 */
			'beforeclose',
			
			/**
			 * @event close
			 * Fires when the dialog has closed.
			 * @param {ui.Dialog} dialog This dialog instance.
			 */
			'close',
			
			/**
			 * @event keypress
			 * Fires when a key is pressed in the Dialog.
			 * @param {ui.Dialog} dialog This Dialog object.
			 * @param {jQuery.Event} evt The jQuery event object for the event.
			 */
			'keypress'
		);
		
		
		// Add the css class to the element created by ui.Component. This element will be the dialog's content, as the Dialog itself is created
		// with another div. Doing this here instead of in onRender so that it is applied immediately when the Component's element is created.
		this.cls += ' dialog-content';
		
		
		// Run the setTitle() logic on the provided raw config. setTitle() re-sets the 'title' property on this object
		this.setTitle( this.title );
		
		
		// ----------------------------------------------
		
		// Set up the bottom bar
		
		
		// Create a Container for the footer (which renders to the left side of the bottom bar). This is created regardless
		// of it is has any content at instantiation time because it may be filled later with the setFooter() method.
		// The footer may have direct HTML content, or child ui.Components.
		var footerIsHTMLContent = false,
		    footer = this.footer;
		if( Kevlar.isString( footer ) || Kevlar.isElement( footer ) || Kevlar.isJQuery( footer ) ) {
			footerIsHTMLContent = true;
		}
		this.footerContainer = new ui.Container( {
			cls       : 'dialog-bottom-content-left',
			style     : { display: 'inline-block' },
			
			contentEl : ( footerIsHTMLContent ) ? footer : undefined,  // HTML elements / jQuery wrapped sets: append directly to the Container's div element
			items     : ( footerIsHTMLContent ) ? undefined : footer   // ui.Component/config object(s): add as child items
		} );
		
		
		// Create a Container for the "main" dialog buttons. This is created regardless of it is has buttons at instantiation 
		// time because it may be filled later with the setButtons() method.
		this.buttonsContainer = new ui.Container( {
			defaultType : 'Button',
			
			cls      : 'dialog-bottom-content-right',
			style    : { display: 'inline-block' },
			items    : this.buttons
		} );
		
		
		// Create the Container for the bottom bar itself, which holds both the footer and the dialog buttons. This 
		// will only be initially shown if the 'footer' config has been set, and/or the 'buttons' config has been set, 
		// but may be shown after a call to setFooter() or setButtons().
		this.bottomBarContainer = new ui.Container( {
			cls : 'dialog-bottom-content ui-corner-all',
			hidden : true,  // initially hidden.  Will be shown in the open() method
			
			items : [
				this.footerContainer,
				this.buttonsContainer
			]
		} );
		
		
		// ----------------------------------------------
		
		
		// Call superclass initComponent
		ui.Dialog.superclass.initComponent.call( this );
		
		
		// ----------------------------------------------
		
		
		// If the autoOpen config has been set to true, open the dialog immediately
		if( this.autoOpen ) {
			this.open();
		}
	},
	
	
	/**
	 * Extension of onRender which is used to create jQuery UI Dialog and its inner dialog content.
	 * 
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		ui.Dialog.superclass.onRender.apply( this, arguments );
		
		// Create a wrapping element for the dialog's content and bottom bar
		this.$dialog = jQuery( '<div />' );
		
		
		// The ui.Component's div element becomes the content div container, which will hold the dialog's HTML or child components.
		this.$contentContainer = this.$el  // aliasing for clarity
		  .appendTo( this.$dialog );
		
		
		// Because jQuery UI has some issues with opening multiple dialogs and setting the minHeight and minWidth configs
		// on it, I'm temporarily setting them here right on the $contentContainer to guarantee that they are set.
		if( typeof this.dialogMinWidth !== 'undefined' ) {
			this.$contentContainer.css( 'min-width', this.dialogMinWidth );
		}
		if( typeof this.dialogMinHeight !== 'undefined' ) {
			this.$contentContainer.css( 'min-height', this.dialogMinHeight );
		}
		
		
		// Render the bottomBarContainer into the $dialog element
		this.bottomBarContainer.render( this.$dialog );
		
		
		// ------------------------------------
		
		
		// Create the jQuery UI dialog instance out of the new dialog div element
		this.$dialog.dialog( {
			dialogClass: 'jux-dialog jux ' + this.cls,
			title: this.title,
			modal: this.modal,
			draggable: true,
			autoOpen: false,
			resizable: false,
			closeOnEscape: false, // we want to explicitly disable this here, so that if the esc key is pressed, the ui.Dialog's destroy() method gets run, 
			                      // removing event handlers and the window resize handler. Will re-implement this behavior next, in this method. This is also to 
								  // to prevent the default jQuery UI Dialog behavior of if two dialogs are open (one on top of the other), both are closed when
								  // 'esc' is pressed! The implementation of the 'esc' key in this method only closes the Dialog that has focus.
			
			//position: [ this.x, this.y ],      -- Doing this after the dialog has opened, and after the content area has been sized.
			
			// No need for the following 'max' configs (nor do they really work either), as we handle the max width of the dialog's $contentContainer when the dialog is opened.
			// Leaving these here as a reminder, though.
			//maxWidth: this.dialogMaxWidth,  
			//maxHeight: this.dialogMaxHeight,
			
			// Due to bugs in jQuery UI with opening multiple dialogs, the min width/height doesn't always get applied correctly for subsequent dialog openings when
			// set to the actual values provided to ui.Dialog (i.e. this.minHeight and this.maxHeight). So, these are explicitly set to 0 here to override the jQuery UI 
			// defaults of 150. Otherwise, the actual min width/height are handled by setting them directly on the $contentContainer, in the resizeContentContainer() method.
			minWidth: 0,       
			minHeight: 0,  
			
			width: this.dialogWidth,
			height: this.dialogHeight,
			
			// event handlers
			dragStop : this.onDragStop.createDelegate( this )
		} );
		
		// Store the "outer" dialog element (i.e. the element that jQuery UI creates for the Dialog).
		var $dialogOuter = this.$dialogOuter = this.$dialog.dialog( 'widget' );
		
		
		// Create the inner dialog wrapper element. This is used as an extra layer for styling the dialog's border.
		// We add our inner wrapper directly inside the outer dialog element, and then need to retrieve it again to set
		// it to this.$dialogInner because jQuery creates brand new elements with wrapInner(), preventing us from 
		// creating the element and storing it as a reference first.
		$dialogOuter.wrapInner( '<div class="dialog-innerWrap" />' );
		this.$dialogInner = $dialogOuter.find( '.dialog-innerWrap' ); 
		
		
		// ------------------------------------------------
		
		// Handle the titlebar's button, by removing jQuery UI's, and replacing it with our own
		
		// Find the title bar, to add the button into it
		var $titleBar = $dialogOuter.find( 'div.ui-dialog-titlebar' );
		
		// Get the "close button" element that jQuery UI provides in the top right of the dialog, and remove it.
		// We'll add our own next.
		var $closeLink = $titleBar.find( 'a.ui-dialog-titlebar-close' );
		$closeLink.remove();
		
		// If the closeButton config is explicitly true, create a ui.CloseButton instance that will close the Dialog when clicked
		if( this.closeButton === true ) {
			this.closeButton = new ui.toolButtons.CloseButton( {
				handler : function() { 
					this.close();
				},
				scope : this
			} );
		}
		
		// If the closeButton config is a ui.Button instance at this point (
		if( this.closeButton instanceof ui.Button ) {
			this.closeButton.render( $titleBar );
			this.closeButton.getEl().addClass( 'ui-dialog-titlebar-close' );
		}
		
		
		// ------------------------------------------------
		
		
		// Set up the keypress listener on the dialog, to run the template method, and fire the keypress event.
		this.$contentContainer.bind( 'keypress', this.onKeyPress.createDelegate( this ) );
		
		
		// ------------------------------------------------
		
		
		// Set up an event handler for the window's resize event, to re-size and re-position the dialog based on the
		// new viewport's size.  The handler for this event is "buffered" just a little, so that the many resize events 
		// that get fired while a window is being dragged don't cause the resize calculations to run each and every time. 
		// Need to store the resize handler itself so that we can unbind it in the destroy() method when the Dialog is destroyed.
		var resizeTask = new Kevlar.util.DelayedTask( function() {
			this.onWindowResize();
		}, this );
		this.windowResizeHandler = function() {	resizeTask.delay( 150 ); };
		jQuery( window ).bind( 'resize', this.windowResizeHandler );
		
	},  // eo onRender
	
	
	/**
	 * Opens the dialog, rendering it if it has not yet been rendered. The dialog is rendered here
	 * so all Components can be added to it first before rendering it.
	 */
	open : function() {
		if( this.fireEvent( 'beforeopen', this ) !== false ) {
			// If the dialog has not been rendered yet, render it now to the document body
			if( !this.rendered ) {
				this.render( document.body );
			}
			
			// Open the jQuery UI Dialog
			this.$dialog.dialog( 'open' );
			
			
			// If this dialog is a modal dialog, get its overlay element (the one created by jQuery UI for this Dialog) 
			if( this.modal === true ) {
				this.$overlayEl = jQuery( 'body div.ui-widget-overlay:last' );
				
				// If the 'overlay' config is set to false, set the overlay element to be completely transparent.
				if( this.overlay === false ) {
					this.$overlayEl.css( 'opacity', 0 );
				}
			}
			
			
			// Workaround for jQuery UI Dialog: call the show() method of the Component superclass when the Dialog is
			// opened, so that the onShow() template method runs, and the 'show' event fires. This would most likely be
			// done if the Dialog was implemented directly (i.e. not using jQuery UI), and is expected by the ui.Container
			// superclass, which implements onShow().  Note that this should be done before setting the dialog's position, 
			// as that relies on the dialog's inner content. 
			this.show();
			
			// Now that the dialog is open (i.e. shown), show the bottomBarContainer if the 'footer' and/or 'buttons' 
			// configs were actually specified with content. Must do before we resize the container.
			if( this.footer || this.buttons.length > 0 ) {
				this.bottomBarContainer.show();
			}
			
			// Now that the dialog is opened (and its elements have been created), we can make calculations and size
			// the $contentContainer appropriately, based on the maxHeight/maxWidth configs, or the browser's viewport.
			this.resizeContentContainer();
			
			// We can now set the Dialog's position, which will reflect the dynamically sized $contentContainer.
			// This is needed to be done after the setting of $contentContainer especially for 'x' and 'y' config
			// values of 'center'. 
			this.setPosition( this.x, this.y );
			
			// Run template method, and fire the 'open' event
			this.onOpen();
			this.fireEvent( 'open', this );
		}
	},
	
	
	/**
	 * Template method that is run when the Dialog has been opened.
	 * 
	 * @protected
	 * @method onOpen
	 */
	onOpen : Kevlar.emptyFn,
	
	
	/**
	 * Determines if this Dialog is currently open.
	 * 
	 * @method isOpen
	 * @return {Boolean} True if the Dialog is open, false otherwise.
	 */
	isOpen : function() {
		return this.rendered && this.$dialog.dialog( 'isOpen' );   // make sure the Dialog has been rendered first, otherwise this.$dialog won't exist
	},
	
	
	/**
	 * Retrieves the height of the Dialog itself. The dialog must be open for this calculation.
	 * 
	 * @method getHeight
	 * @return {Number} The height of the Dialog if it is open, or 0 if it is not.
	 */
	getHeight : function() {
		if( this.isOpen() ) {
			return this.$dialog.dialog( 'widget' ).outerHeight();
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
			return this.$dialog.dialog( 'widget' ).outerWidth();
		} else {
			return 0;
		}
	},
	
	
	/**
	 * Sets the Dialog's title.
	 * 
	 * @method setTitle
	 * @param {String/HTMLElement/jQuery/ui.Component} title The title for the dialog box to use. Can be a string of text, a string of 
	 *   HTML, an HTMLElement, a jQuery wrapped set, or a {@link ui.Component}. 
	 */
	setTitle : function( title ) {
		// If the title is a ui.Component, render its HTML into a document fragment for setting it as the title.
		if( title instanceof ui.Component ) {
			var docFrag = document.createDocumentFragment();
			title.render( docFrag );
			title = title.getEl();  // grab the element from the ui.Component
		}
		this.title = title;   // save the title in case the Dialog is not yet rendered
		
		// It is possible that the inner jQuery dialog may not exist yet when this is called, if the 
		// Dialog has not yet been rendered.  Only set the title on the jQuery dialog itself if it does.
		if( this.$dialog ) {  
			this.$dialog.dialog( 'option', 'title', title );
		}
	},
	
	
	/**
	 * Sets (replaces) the footer content. See the {@link #footer} config for more information on the footer.
	 * 
	 * @method setFooter
	 * @param {String/HTMLElement/jQuery/ui.Component} footer A string of HTML, an HTMLElement, or a jQuery wrapped set to put into the
	 *   footer. Also accepts a ui.Component instance.
	 */
	setFooter : function( footer ) {
		// If the bottom bar container is not set to be shown (it is set to be hidden), show it now.
		if( this.bottomBarContainer.isHidden() ) {
			this.bottomBarContainer.show();
		}
		
		// Now, replace the footer content in the footerContainer
		this.footerContainer.removeAll();
		this.footerContainer.getEl().empty();
		if( footer instanceof ui.Component ) {
			this.footerContainer.add( footer );
		} else {
			this.footerContainer.getEl().append( footer );
		}
	},
	
	
	/**
	 * Sets (replaces) the Dialog's buttons. See the {@link #buttons} config for more information on buttons.
	 *
	 * @method setButtons
	 * @param {ui.Button/ui.Button[]} buttons A single button to replace the buttons with, or an array of buttons. Can also be button config objects.
	 */
	setButtons : function( buttons ) {
		// If the bottom bar container is not set to be shown (it is set to be hidden), show it now.
		if( this.bottomBarContainer.isHidden() ) {
			this.bottomBarContainer.show();
		}
		
		// Now, replace the buttons in the buttonsContainer
		this.buttonsContainer.removeAll();
		this.buttonsContainer.add( buttons );
	},
	
	
	/**
	 * Sets the position of the Dialog.
	 * 
	 * @method setPosition
	 * @param {Number/String} x The x position of the Dialog. This can be a number defining how many pixels from the left of the screen,
	 *   or one of the strings that the jQuery UI Dialog accepts ('center', 'left', 'right', 'top', 'bottom'). This can also be a negative
	 *   integer, in which case it will be taken as the number of pixels from the right side of the screen. Ex: A value of -50 will position the 
	 *   right side of the dialog 50px from the right side of the screen.
	 * @param {Number/String} y The y position of the Dialog. This can be a number defining how many pixels from the top of the screen,
	 *   or one of the strings that the jQuery UI Dialog accepts ('center', 'left', 'right', 'top', 'bottom').  This can also be a negative
	 *   integer, in which case it will be taken as the number of pixels from the bottom of the screen. Ex: A value of -50 will position the 
	 *   bottom of the dialog 50px from the bottom of the screen.
	 */
	setPosition : function( x, y ) {
		// Store the variables in case the dialog is not yet open, and for later use if the browser window is resized.
		// (This is mainly needed for when this method is called externally, and not from within the Dialog.)
		this.x = x;
		this.y = y;
		
		if( this.isOpen() ) {
			// Convert any negative x and y values to "from the right" and "from the bottom" values.  These calculations create positive left/top
			// values for x and y, which are what the jQuery UI dialog expects. Note: these need the dialog to be open, as they measure the dialog's size.
			if( x < 0 || y < 0 ) {
				var $window = jQuery( window );
				if( x < 0 ) {
					x = $window.width() - this.getWidth() - (-x);  // the right of the window, minus the width of the dialog, minus the negative value of x (to continue moving it left)
					// note: not saving this.x to the new positive value of x, so that if the window is resized, the x position is still relative to the right side of the screen
				}
				if( y < 0 ) {
					y = $window.height() - this.getHeight() - (-y);  // the bottom of the window, minus the height of the dialog, minus the negative value of y (to continue moving it up)
					// note: not saving this.y to the new positive value of y, so that if the window is resized, the y position is still relative to the bottom of the screen
				}
			}
			
			this.$dialog.dialog( 'option', 'position', [x, y] );
		}
	},
	
	
	/**
	 * Gets the position of the Dialog. This can only be retrieved if the dialog is currently open. If the dialog is not open,
	 * all values will return 0.
	 * 
	 * @method getPosition
	 * @return {Object} An object with the following properties:
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li><b>x</b> : Int<div class="sub-desc">The position of the left side of the dialog, relative to the left side of the screen. Same as `left`.</div>
	 *     <li><b>y</b> : Int<div class="sub-desc">The position of the top of the dialog, relative to the top of the screen. Same as `top`.</div>
	 *     <li><b>left</b> : Int<div class="sub-desc">The position of the left side of the dialog, relative to the left side of the screen. Same as `x`.</div>
	 *     <li><b>top</b> : Int<div class="sub-desc">The position of the left side of the dialog, relative to the left side of the screen. Same as `y`.</div>
	 *     <li><b>right</b> : Int<div class="sub-desc">The position of the right side of the dialog, relative to the right side of the screen.</div>
	 *     <li><b>bottom</b> : Int<div class="sub-desc">The position of the bottom of the dialog, relative to the bottom of the screen.</div>
	 *   </ul>
	 * </div>
	 */
	getPosition : function() {
		if( !this.isOpen() ) {
			return {
				x      : 0,
				y      : 0,
				left   : 0,
				top    : 0,
				right  : 0,
				bottom : 0
			};
			
		} else {
			var $window  = jQuery( window ),
			    position = this.$dialog.dialog( 'widget' ).position(),
			    left     = position.left,
			    top      = position.top,
			    right    = $window.width() - ( position.left + this.getWidth() ),
			    bottom   = $window.height() - ( position.top + this.getHeight() );
			
			return {
				x      : left,
				y      : top,
				left   : left,
				top    : top,
				right  : right,
				bottom : bottom
			};
		}
	},
	
	
	/**
	 * Sizes the {@link #$contentContainer} of the dialog (the container that holds the dialog's content) to constrain its
	 * size to the {@link #maxHeight} and {@link #maxWidth} configs, OR the browser's viewport size; whichever is smaller.
	 * This is to keep the Dialog's size constrained to the browser's viewport size, which otherwize may hide things like the 
	 * bottom button bar.<br><br>
	 * 
	 * This method makes calculations based on the dimensions of the dialog's title bar and button bar, and sizes the content 
	 * container appropriately to honor the {@link #maxHeight} and {@link #maxWidth} configs, or to be constrained to the 
	 * browser's viewport. Note that the Dialog must be currently be open for these calculations to be made, and this method
	 * is automatically called from the {@link #open} method.
	 * 
	 * @method resizeContentContainer
	 */
	resizeContentContainer : function() {
		// We can only do these calculations (and only want to do these calculations) if the dialog is currently open
		if( this.isOpen() ) {
			var $window = jQuery( window ),
			    $dialogOuter = this.$dialog.dialog( 'widget' ),  // access the jQuery UI Dialog's outer element
			    $dialogInner = this.$dialogInner,                // the inner wrapping element used to style the dialog's border. This sits directly inside of the outer element. 
			    $dialogContentWrap = this.$dialog,               // the element that wraps the dialog's content, and bottom bar.
			    $titleBar = $dialogOuter.find( 'div.ui-dialog-titlebar' ),
				$bottomBar = this.bottomBarContainer.getEl(),
				$contentContainer = this.$contentContainer;
			    
			
			// local function to calculated margins, borders, and padding, and return an object {height,width}
			var calculateElementSurround = function( $el ) {
				return {
					height : parseInt( $el.css( 'marginTop' ), 10 ) + parseInt( $el.css( 'borderTopWidth' ), 10 ) + parseInt( $el.css( 'paddingTop' ), 10 ) +
				             parseInt( $el.css( 'marginBottom' ), 10 ) + parseInt( $el.css( 'borderBottomWidth' ), 10 ) + parseInt( $el.css( 'paddingBottom' ), 10 ),
				
					width  : parseInt( $el.css( 'marginLeft' ), 10 ) + parseInt( $el.css( 'borderLeftWidth' ), 10 ) + parseInt( $el.css( 'paddingLeft' ), 10 ) +
				             parseInt( $el.css( 'marginRight' ), 10 ) + parseInt( $el.css( 'borderRightWidth' ), 10 ) + parseInt( $el.css( 'paddingRight' ), 10 )
				};
			};
			
			
			// We need the total height/width that the dialog takes up, without the content area. This includes margins, borders,
			// and paddings ("surround") of the outer element containers ($dialogOuter, $dialogInner, and $dialogContentWrap), as well as
			// the heights (but not widths) of $titleBar and $bottomBar.
			var dialogOuterSurround = calculateElementSurround( $dialogOuter ),
			    dialogInnerSurround = calculateElementSurround( $dialogInner ),
			    dialogContentWrapSurround = calculateElementSurround( $dialogContentWrap ),
				
				totalOuterHeight = dialogOuterSurround.height + dialogInnerSurround.height + dialogContentWrapSurround.height + $titleBar.outerHeight( true ) + $bottomBar.outerHeight( true ),
				totalOuterWidth = dialogOuterSurround.width + dialogInnerSurround.width + dialogContentWrapSurround.width,
			
			    // Find the maximum height and width available for the dialog. Use the configured maxHeight and maxWidth
			    // if they will fit, or use the max height/width that the browser viewport is currently providing (whichever is smaller).
			    calculatedMaxHeight = Math.min( +this.dialogMaxHeight || Number.POSITIVE_INFINITY, $window.height() - 20 ), // the given maxHeight config (converted to a number), or the window's height - 20px; whichever is smaller
			    calculatedMaxWidth = Math.min( +this.dialogMaxWidth || Number.POSITIVE_INFINITY, $window.width() - 20 ),    // the given maxWidth config (converted to a number), or the window's width - 20px; whichever is smaller
			
			    // Find the max height/width that we can make the content area, based on the calculated available max height/width
			    calculatedMaxContentHeight = calculatedMaxHeight - totalOuterHeight,
			    calculatedMaxContentWidth = calculatedMaxWidth - totalOuterWidth;
			
			
			// Set the maxHeight and maxWidth on the outer dialog element itself. This is for when the regular height/width configs have been explicitly
			// set, and the dialog should shrink past those if the viewport's size (or dialog's maxHeight/maxWidth configs) can't support that size.
			$dialogOuter.css( 'maxHeight', Math.max( calculatedMaxHeight - dialogOuterSurround.height, 0 ) );  // don't let these go negative,
			$dialogOuter.css( 'maxWidth', Math.max( calculatedMaxWidth - dialogOuterSurround.width, 0 ) );     // in case the browser is *really* small
			$dialogInner.css( 'maxHeight', Math.max( calculatedMaxHeight - dialogOuterSurround.height - dialogInnerSurround.height, 0 ) );  // don't let these go negative,
			$dialogInner.css( 'maxWidth', Math.max( calculatedMaxWidth - dialogOuterSurround.width - dialogInnerSurround.width, 0 ) );      // in case the browser is *really* small
			
			
			// Set the max height/width on the $contentContainer (which is inside the $dialogContentWrap element)
			$contentContainer.css( 'maxHeight', Math.max( calculatedMaxContentHeight, 0 ) );  // don't let these go negative,
			$contentContainer.css( 'maxWidth', Math.max( calculatedMaxContentWidth, 0 ) );    // in case the browser is *really* small
			
			
			// If the Dialog's mask (inherited form ui.Component) is supposed to be shown, we may need to recalculated its height. 
			// Running the mask() method will do this.
			if( this.masked ) {
				this.mask();
			}
		}
	},
	
	
	/**
	 * Event handler for the browser window's resize event, in which the Dialog's {@link #$contentContainer} is resized,
	 * and its position is reset.
	 * 
	 * @private
	 * @method onWindowResize
	 */
	onWindowResize : function() {
		this.resizeContentContainer();
		this.setPosition( this.x, this.y );
	},
	
	
	/**
	 * Method that is run when the Dialog has finished being dragged from one position to another. This method
	 * handles the dragStop event from the jQuery UI dialog.  This method stores the new position ({@link #x} and {@link #y} values)
	 * for if the window is resized, the dialog will try to be repositioned in the same place. See the {@link #onWindowResize} method.
	 * 
	 * @private
	 * @method onDragStop
	 * @param {jQuery.Event} event
	 * @param {Object} ui An object with properties `offset` and `position`. Each of these has a `left` and `top` property.
	 */
	onDragStop : function( event, ui ) {
		// Store the new x and y values when the Dialog is dragged for if the window is resized, the dialog will try to be repositioned in the same place.
		var position = ui.position;
		this.x = position.left;
		this.y = position.top;
	},
	
	
	/**
	 * Method that is run when there is a keypress event in the dialog.  This method fires the {@link #keypress}
	 * event, and if the {@link #closeOnEscape} config is true, this method closes the dialog if the key is 'esc'.
	 * 
	 * @protected
	 * @method onKeyPress
	 * @param {jQuery.Event} evt
	 */
	onKeyPress : function( evt ) {
		this.fireEvent( 'keypress', this, evt );
		
		// If the closeOnEscape config is true, and the key pressed was 'esc', close the dialog.
		if( this.closeOnEscape && evt.keyCode === jQuery.ui.keyCode.ESCAPE ) {
			this.close();
		}
	},
	
	
	/**
	 * Closes the dialog.
	 * 
	 * @method close
	 */
	close : function() {
		if( this.rendered && this.fireEvent( 'beforeclose', this ) !== false ) {
			this.onBeforeClose();
			
			// If this dialog was a modal dialog, and the overlay was hidden, remove its 'opacity'
			// style at this time before the jQuery UI Dialog is closed. jQuery UI does weird things 
			// if the opacity is still set when the dialog closes, by opening up any new dialogs 
			// with weird overlay opacity values.
			if( this.modal && this.overlay === false ) {
				this.$overlayEl.css( 'opacity', '' );
			}
			this.$overlayEl = null;  // dialog is closing, it will remove its own overlay element. Remove this reference now.
			
			// Close the jQuery UI Dialog
			this.$dialog.dialog( 'close' );
			
			
			// Run template method, and fire the 'close' event
			this.onClose();  
			this.fireEvent( 'close', this );
			
			// Destroy this Dialog when closed for DOM/memory management, if the autoDestroy config is true
			if( this.autoDestroy ) {
				this.destroy();
			}
		}
	},
	
	
	/**
	 * Template method that is run before the dialog has been closed, but after the {@link #beforeclose} event
	 * has fired (as a {@link #beforeclose} handler may return false, and prevent the dialog from closing).
	 * 
	 * @protected
	 * @method onBeforeClose 
	 */
	onBeforeClose : Kevlar.emptyFn,
	
	
	/**
	 * Template method that is run when the Dialog has been closed.
	 * 
	 * @protected
	 * @method onClose
	 */
	onClose : Kevlar.emptyFn,
	
	
	/**
	 * Method that runs when the Dialog is being destroyed.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		if( this.isOpen() ) {
			this.close();
		}
		
		// Destroy other Containers used by the Dialog
		this.bottomBarContainer.destroy();
		
		if( this.rendered ) {
			// unbind our window resize handler (which is set up in onRender)
			jQuery( window ).unbind( 'resize', this.windowResizeHandler );
		
			// destroy the dialog and its elements
			this.$dialog.dialog( 'destroy' );  // returns the inner element to its pre-init state
			this.$dialog.unbind();
		}

		
		ui.Dialog.superclass.onDestroy.apply( this, arguments );
	},
	
	
	// -----------------------------
	
	
	/**
	 * Override of {@link ui.Component#getMaskTarget} used to redefine the mask target as the Dialog's "inner" element, 
	 * which covers everything but the border.
	 * 
	 * @method getMaskTarget
	 * @return {jQuery}
	 */
	getMaskTarget : function() {
		return this.$dialogInner;
	},
	
	
	// -----------------------------
	
	
	/**
	 * Extensions of {@link ui.Container ui.Container's} "cascade" method to include the bottomBarContainer of the Dialog in the cascade.
	 * See {@link ui.Container#cascade} for details on this method.<br><br>
	 * 
	 * @devNote All of the Container "child processing" methods use this method (like the findBy, findById, findByKey, 
	 * setData, and getData methods), so extending this effectively "updates" these methods as well for the Dialog
	 * to include the bottomBarContainer.
	 * 
	 * @method cascade
	 * @param {Function} fn The function to call
	 * @param {Object} scope (optional) The scope of the function (defaults to current Component)
	 * @param {Array} args (optional) The args to call the function with (defaults to passing the current Component)
	 */
	cascade : function() {
		// First call the superclass method to handle the processing of this Container's items (the Dialog's items)
		ui.Dialog.superclass.cascade.apply( this, arguments );
		
		// Now call the method on the bottomBarContainer to process that as well
		this.bottomBarContainer.cascade.apply( this.bottomBarContainer, arguments );
	}
	
	
} );
