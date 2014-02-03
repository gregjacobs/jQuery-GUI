/*global define */
define( [
	'jquery',
	'lodash',
	
	'gui/ComponentManager',
	'gui/Overlay',
	'gui/template/LoDash',
	'gui/util/Css',
	
	'gui/window/Header',
	'gui/panel/ToolButton'   // for instantiating ToolButtons based on the toolButtons config
], function( jQuery, _, ComponentManager, Overlay, LoDashTpl, Css ) {
	
	/**
	 * @class gui.window.Window
	 * @extends gui.Overlay
	 * @alias type.window
	 * 
	 * Basic class for creating a window (also known as a dialog). Window is a subclass of {@link gui.Container}, and accepts
	 * child components as such. The Window may also accept a {@link #title} config, and it adds a {@link #closeButton close button} 
	 * to the top right  
	 */
	var Window = Overlay.extend( {
		
		/**
		 * @cfg {String} title
		 * 
		 * The title of the Window.
		 */
		title : "",
		
		/**
		 * @cfg {Object/Object[]/gui.panel.ToolButton/gui.panel.ToolButton[]} toolButtons
		 * 
		 * One or more {@link gui.panel.ToolButton ToolButtons} or ToolButton config objects. These will
		 * be placed on the right side of the Window's header (i.e. top right of the Window).
		 */
		
		/**
		 * @cfg {Object} header
		 * 
		 * Any configuration options to pass to the {@link #property-header} component. This may include
		 * a `type` property to specify a different Header subclass than the default {@link gui.window.Header}.
		 */
		
		/**
		 * @cfg {Boolean} headerHidden
		 * 
		 * `true` to initially hide the Window's {@link #property-header}. Can be shown using {@link #showHeader}. 
		 */

		/**
		 * @cfg {String} bodyCls
		 * 
		 * Any additional CSS class(es) to add to the Window's {@link #$bodyEl body} element. If multiple CSS classes
		 * are added, they should each be separated by a space. Ex:
		 * 
		 *     bodyCls : 'bodyClass1 bodyClass2'
		 */
		bodyCls: '',
		
		/**
		 * @cfg {Object} bodyStyle
		 * 
		 * Any additional CSS style(s) to apply to the Window's {@link #$bodyEl body} element. Should be an object where the 
		 * keys are the CSS property names, and the values are the CSS values. Ex:
		 * 
		 *     bodyStyle : {
		 *         'padding'    : '5px',
		 *         'border-top' : '1px solid #000'
		 *     }
		 */
		
		/**
		 * @cfg {Boolean} closeButton
		 * 
		 * `true` to show the close button on the top right, `false` to hide it.
		 */
		closeButton : true,
		
		/**
		 * @cfg {Boolean} modal
		 * 
		 * `true` to make this window a modal window (as opposed to a modeless window). When the Window is modal,
		 * a mask is placed behind it, covering the rest of the document as to force the user to interact with 
		 * the Window until it is hidden.
		 */
		modal : false,
		
		/**
		 * @cfg {String} closeAction
		 * 
		 * The action to take when the {@link #closeButton} is clicked, or the Window is closed by the 'esc' button.
		 * Acceptable values are: 
		 * 
		 * - `'{@link #method-destroy}'`: Destroys the Window for automatic cleanup from the DOM. The Window will not be available to
		 *   be shown again using the {@link #method-show} method.
		 *    
		 * - `'{@link #method-hide}'`: Hides the Window. The Window will be available to be shown again using the {@link #method-show} method.
		 *   The Window must be manually {@link #method-destroy destroyed} when it is no longer needed.
		 */
		closeAction : 'destroy',
		
		/**
		 * @cfg {Boolean} closeOnEscape
		 * 
		 * `true` to have the Window close when the 'esc' key is pressed. Set to `false` to disable this behavior. The action taken (whether
		 * the Window is {@link #method-destroy destroyed} or simply {@link #method-hide hidden}) is governed by the {@Link #closeAction} config.
		 */
		closeOnEscape : true,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'gui-window',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		x : 'center',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		y : 'center',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		renderTpl : new LoDashTpl( [
			'<div',
				' id="<%= elId %>-body"',
				' class="<%= baseCls %>-body<% if( bodyCls ) { %> <%= bodyCls %><% } %>"',
				'<% if( bodyStyle ) { %> style="<%= bodyStyle %>"<% } %>>',
			'</div>'
		] ),
		
		
		/**
		 * @protected
		 * @property {jQuery} $modalMaskEl
		 * 
		 * The element that is used to mask the document when the Window is shown, and {@link #modal} is enabled.
		 * This will only be created when the Window is shown the first time.
		 */
		
		/**
		 * @private
		 * @property {Function} modalMaskResizeHandler
		 * 
		 * The bound handler function that is a handler of the window resize event, which resizes the {@link #$modalMaskEl}
		 * when the browser window is resized.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $bodyEl
		 * 
		 * A reference to the Window's body element. This will be available after the Window is rendered.
		 */
		
		/**
		 * @protected
		 * @property {gui.window.Header} header
		 * 
		 * The Container which acts as the Window's header. The header holds the {@link #title}, and any {@link #toolButtons} 
		 * specified. 
		 * 
		 * Note that this Container is only created if a {@link #title} or {@link #toolButtons} have been specified.
		 */

		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// Move the `header` config to `headerCfg`, as to not be confusing when an actual gui.window.Header is created in the `header` property
			this.headerCfg = this.header;
			delete this.header;
			
			// Add the close button if the config is true
			if( this.closeButton ) {
				this.toolButtons = ( this.toolButtons || [] ).concat( {
					toolType : 'close',
					
					handler  : this.doClose,
					scope    : this
				} );
			}
			
			this._super( arguments );
			
			if( this.title || this.toolButtons || this.headerCfg ) {
				this.doCreateHeader();
			}
		},
		
		
		/**
		 * @inheritdoc
		 */
		getRenderTplData : function() {
			var bodyStyle = Css.mapToString( this.bodyStyle || {} );
			
			return _.assign( this._super( arguments ), {
				bodyCls   : this.bodyCls,
				bodyStyle : bodyStyle
			} );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.$bodyEl = jQuery( '#' + this.elId + '-body' );
			
			if( this.header ) {
				this.header.render( this.$el, 0 );  // prepend before the body
			}
			
			if( this.closeOnEscape ) this.initCloseOnEscape();
			if( this.modal ) this.initModalResizeHandler();
		},
		
		
		/**
		 * Called from {@link #onRender}. If the {@link #closeOnEscape} config is true, sets up a keydown event for the key 
		 * to close the Window when pressed.
		 * 
		 * @private
		 */
		initCloseOnEscape : function() {
			var me = this;  // for closure
			this.$el.keyup( function( evt ) {
				if( evt.keyCode === 27 && me.closeOnEscape ) {  // 27 == 'esc' char
					me.doClose();
				}
			} );
		},
		

		/**
		 * Called from {@link #onRender}. If the {@link #modal} config is true, this method sets up a handler to resize the 
		 * modal mask when the browser window resizes.
		 * 
		 * @private
		 */
		initModalResizeHandler : function() {
			this.modalMaskResizeHandler = _.debounce( _.bind( this.resizeModalMask, this ), 100, { maxWait: 300 } );
			jQuery( window ).on( 'resize', this.modalMaskResizeHandler );
		},
		
		
		/**
		 * Returns the body element for the Window, wrapped in a jQuery object.  This element will only be available after the 
		 * Window has been rendered by the {@link #method-render} method.  
		 * 
		 * @return {jQuery}
		 */
		getBodyEl : function() {
			return this.$bodyEl;  // created when rendered
		},
		
		
		/**
		 * Override of superclass method, used to specify the {@link #$bodyEl} as the target for Window content.
		 * 
		 * @protected
		 * @return {jQuery}
		 */
		getContentTarget : function() {
			return this.getBodyEl();
		},

		
		// -----------------------------------
		
		
		/**
		 * Extension of hook method from superclass, which shows the {@link #modal} mask, if enabled.
		 * 
		 * @protected
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onShow : function( options ) {
			this._super( arguments );
			
			if( this.modal ) {
				var $modalMaskEl = this.$modalMaskEl;
				
				if( !$modalMaskEl ) {
					$modalMaskEl = this.$modalMaskEl = this.createModalMaskEl();
				}
				$modalMaskEl.appendTo( 'body' );  // make sure it is appended to the body (it is detached on hide)
				this.resizeModalMask();
				
				$modalMaskEl.show();
			}
		},
		
		
		/**
		 * Sizes the modal mask to the browser window's size.
		 * 
		 * @protected
		 */
		resizeModalMask : function() {
			var $modalMaskEl = this.$modalMaskEl;
			
			// Only size it if the window is shown, and the element has been created
			if( this.isVisible() && $modalMaskEl ) {
				var $window = jQuery( window );
				this.$modalMaskEl.css( {
					width  : $window.width(),
					height : $window.height()
				} );
			}
		},
		

		/**
		 * Extension of hook method from superclass, which hides the {@link #modal} mask, if enabled.
		 * 
		 * @protected
		 * @param {Object} options The options object which was originally provided to the {@link #method-hide} method.
		 */
		onHide : function( options ) {
			if( this.modal ) {
				this.$modalMaskEl.detach();
			}
			
			this._super( arguments );
		},
		
		
		/**
		 * Creates the {@link #$modalMaskEl}, for use when the Window is set to be {@link #modal}.
		 * 
		 * @protected
		 * @return {jQuery} The modal masking element, which is appended to the document body.
		 */
		createModalMaskEl : function() {
			return jQuery( '<div class="' + this.baseCls + '-modalMask" />' );
		},
		
		
		/**
		 * Protected method which handles the {@link #closeAction} of the Window.
		 * 
		 * @protected
		 */
		doClose : function() {
			this.hide();
				
			if( this.closeAction === 'destroy' ) {
				if( this.hiding )  // in the process of hiding (i.e. animating its hide), then wait until it's complete before destroying
					this.on( 'afterhide', function() { this.destroy(); }, this );  // don't call destroy() with any arguments
				else 
					this.destroy();
			}
		},
		
		
		// -----------------------------------
		
		// Header Functionality
		
		/**
		 * Performs the creation of the {@link #property-header}, by calling {@link #createHeader}, and then applying 
		 * any post-processing required (which includes rendering it as the first element in the Window
		 * itself if it is already rendered).
		 * 
		 * To create a different {@link #property-header} in a subclass, override {@link #createHeader} instead of this 
		 * method.
		 * 
		 * @protected
		 */
		doCreateHeader : function() {
			this.header = this.createHeader( _.defaults( {}, this.headerCfg, {
				type         : 'windowheader',
				componentCls : this.baseCls + '-header',  // Ex: For Window itself, 'gui-window-header'
				title        : this.title,
				toolButtons  : this.toolButtons
			} ) );
			this.header.setVisible( !this.headerHidden );
			delete this.headerHidden;
			
			if( this.rendered ) {
				this.header.render( this.$el, /* prepend */ 0 );  // prepend to make it the first element (i.e. before the body)
			}
		},
		
		
		/**
		 * Creates the {@link #property-header}, which contains the {@link #title} and any {@link #toolButtons} configured.
		 * 
		 * @protected
		 * @param {Object} headerConfig The configuration for the header, with defaults applied from the Window.
		 * @return {gui.window.Header}
		 */
		createHeader : function( headerConfig ) {
			return ComponentManager.create( headerConfig );
		},
		
		
		/**
		 * Gets the {@link #property-header} of the Window. If the {@link #property-header} has not been created yet,
		 * it will be instantiated before it is returned.
		 * 
		 * In most cases, you will not need to directly access the Window's {@link #property-header} component. Most of 
		 * the time, you will set the {@link #cfg-header} config options, and if the Window's title needs to be changed,
		 * you will use the {@link #setTitle} method.
		 * 
		 * However, this method is provided for more advanced operations, such as if components need to be injected into
		 * the header. In this case, be aware that the header is created with components of its own, and you will need
		 * to inject yours at the correct indexes.
		 * 
		 * @return {gui.window.Header}
		 */
		getHeader : function() {
			if( !this.header ) {
				this.doCreateHeader();
			}
			return this.header;
		},
		
		
		/**
		 * Sets the title of the Window.
		 * 
		 * @param {String} title The title to set.
		 * @chainable
		 */
		setTitle : function( title ) {
			if( !this.header ) {
				this.doCreateHeader();
			}
			
			this.title = title;
			this.header.setTitle( title );
			
			return this;
		},
		
		
		/**
		 * Retrieves the {@link #title} of the Window.
		 * 
		 * @return {String} The title of the Window.
		 */
		getTitle : function() {
			return this.title;
		},
		
		
		/**
		 * Shows the Window's {@link #property-header}, if it is currently hidden.
		 * 
		 * @chainable
		 */
		showHeader : function() {
			if( this.header ) {
				this.header.show();
			} else {
				this.headerHidden = false;  // in case the header hasn't been created yet, we'll use this for when it is
			}
			
			return this;
		},
		
		
		/**
		 * Hides the Window's {@link #property-header}, if it is currently visible.
		 * 
		 * @chainable
		 */
		hideHeader : function() {
			if( this.header ) {
				this.header.hide();
			} else {
				this.headerHidden = true;  // in case the header hasn't been created yet, we'll use this for when it is
			}
			
			return this;
		},
		
		
		// ---------------------------------
		
		// Window's Body Styling Functionality
		
		/**
		 * Adds one or more CSS classes to the Window's {@link #$bodyEl body} element.
		 * 
		 * @param {String} cssClass One or more CSS classes to add to the Window's {@link #$bodyEl body} element. If specifying 
		 *   multiple CSS classes, they should be separated with a space. Ex: "class1 class2"
		 * @return {gui.window.Window} This Window, to allow method chaining.
		 */
		addBodyCls : function( cssClass ) {
			if( !this.rendered ) {
				this.bodyCls = Css.addCls( this.bodyCls, cssClass );  // update the `bodyCls` config in the unrendered state
			} else {
				this.$bodyEl.addClass( cssClass ); // delegate to jQuery in this case
			}
			return this;
		},
		
		
		/**
		 * Removes one or more CSS classes from the Window's {@link #$bodyEl body} element.
		 * 
		 * @param {String} cssClass One or more CSS classes to remove from the Window's {@link #$bodyEl body} element. If specifying 
		 *   multiple CSS classes, they should be separated with a space. Ex: "class1 class2"
		 * @return {gui.window.Window} This Window, to allow method chaining.
		 */
		removeBodyCls : function( cssClass ) {
			if( !this.rendered ) {
				this.bodyCls = Css.removeCls( this.bodyCls, cssClass );  // update the `bodyCls` config in the unrendered state
			} else {
				this.$bodyEl.removeClass( cssClass ); // delegate to jQuery in this case
			}
			return this;
		},
		
		
		/**
		 * Determines if the Window's {@link #$bodyEl body} element has the given `cssClass`.
		 * 
		 * @param {String} cssClass The CSS class to test for.
		 * @return {Boolean} True if the Window's {@link #$bodyEl body} element has the given `cssClass`, false otherwise.
		 */
		hasBodyCls : function( cssClass ) {
			// Check the `bodyCls` config in the unrendered state, or the body element itself in the rendered state
			return ( !this.rendered ) ? Css.hasCls( this.bodyCls, cssClass ) : this.$bodyEl.hasClass( cssClass );
		},
		
		
		/**
		 * Sets a CSS style property on the Window's {@link #$bodyEl body} element.
		 * 
		 * @param {String/Object} name The CSS property name. This first argument may also be provided as an Object of key/value
		 *   pairs for CSS property names/values to apply to the Window's {@link #$bodyEl body} element.
		 * @param {String} value The value for the CSS property. Optional if the first argument is an Object.
		 * @return {gui.window.Window} This Window, to allow method chaining.
		 */
		setBodyStyle : function( name, value ) {
			if( !this.rendered ) {
				this.bodyStyle = this.bodyStyle || {};
				
				if( typeof name === 'object' ) {
					_.assign( this.bodyStyle, name );  // apply each of the properties on the provided 'styles' object onto the Window's bodyStyle
				} else {
					this.bodyStyle[ name ] = value;
				}
				
			} else {
				this.$bodyEl.css( name, value );  // will work for both method signatures (i.e. when `name` is an object, and when provided both name / value)
			}
			return this;
		},
		
		
		// -----------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			if( this.header ) this.header.destroy();
			
			if( this.$modalMaskEl ) {
				this.$modalMaskEl.remove();
			}
			
			if( this.modalMaskResizeHandler ) {
				jQuery( window ).off( 'resize', this.modalMaskResizeHandler );
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'window', Window );
	
	return Window;
	
} );
