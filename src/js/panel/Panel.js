/*global define */
define( [
	'jquery',
	'lodash',
	'gui/util/Css',
	'gui/ComponentManager',
	'gui/Container',
	'gui/panel/Header',
	'gui/template/LoDash',
	'gui/panel/ToolButton'   // for instantiating ToolButtons based on the toolButtons config
], function( jQuery, _, Css, ComponentManager, Container, PanelHeader, LoDashTpl ) {

	/**
	 * @class gui.panel.Panel
	 * @extends gui.Container
	 * @alias type.panel
	 *
	 * An application-oriented {@link gui.Container} subclass which supports adding a {@link #title} bar and 
	 * {@link #toolButtons}.
	 */
	var Panel = Container.extend( {

		/**
		 * @cfg {String} bodyCls
		 * 
		 * Any additional CSS class(es) to add to the Panel's {@link #$bodyEl body} element. If multiple CSS classes
		 * are added, they should each be separated by a space. Ex:
		 * 
		 *     bodyCls : 'bodyClass1 bodyClass2'
		 */
		bodyCls: '',
		
		/**
		 * @cfg {Object} bodyStyle
		 * 
		 * Any additional CSS style(s) to apply to the Panel's {@link #$bodyEl body} element. Should be an object where the 
		 * keys are the CSS property names, and the values are the CSS values. Ex:
		 * 
		 *     bodyStyle : {
		 *         'padding'    : '5px',
		 *         'border-top' : '1px solid #000'
		 *     }
		 */
		
		/**
		 * @cfg {String} title
		 * 
		 * The title of the Panel.
		 */
		title : "",
		
		/**
		 * @cfg {Object/Object[]/gui.panel.ToolButton/gui.panel.ToolButton[]} toolButtons
		 * 
		 * One or more {@link gui.panel.ToolButton ToolButtons} or ToolButton config objects. These will
		 * be placed on the right side of the Panel's header (i.e. top right of the Panel).
		 */
		
		/**
		 * @cfg {Object} header
		 * 
		 * Any configuration options to pass to the {@link #property-header} component. This may include
		 * a `type` property to specify a different Header subclass than the default {@link gui.panel.Header}.
		 */
		
		/**
		 * @cfg {Object/Object[]/gui.button.Button/gui.button.Button[]} buttons
		 * 
		 * One or more {@link gui.button.Button Buttons} or Button config objects for buttons to place
		 * in the footer of the Panel. These will be placed on the right side of the Panel's footer 
		 * (i.e. bottom right of the Panel).
		 */
		
		/**
		 * @cfg {Boolean} headerHidden
		 * 
		 * `true` to initially hide the Panel's {@link #property-header}. Can be shown using {@link #showHeader}. 
		 */
		
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'gui-panel',
		
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
		 * @property {jQuery} $bodyEl
		 * 
		 * A reference to the Panel's body element. This will be available after the Panel is rendered.
		 */
		
		/**
		 * @protected
		 * @property {gui.Container} header
		 * 
		 * The Container which acts as the Panel's header. The header holds the {@link #title}, and any {@link #toolButtons} 
		 * specified. 
		 * 
		 * Note that this Container is only created if a {@link #title} or {@link #toolButtons} have been specified.
		 */
		
		/**
		 * @protected
		 * @property {gui.Container} footer
		 * 
		 * The Container which acts as the Panel's footer. The footer holds the any {@link #buttons} specified. 
		 * 
		 * Note that this Container is only created if a {@link #buttons} config has been specified.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			// Move the `header` config to `headerCfg`, as to not be confusing when an actual gui.panel.Header is created in the `header` property
			this.headerCfg = this.header;
			delete this.header;
			
			if( this.title || this.toolButtons || this.headerCfg ) {
				this.doCreateHeader();
			}
			if( this.buttons ) {
				this.doCreateFooter();
			}
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
			if( this.footer ) {
				this.footer.render( this.$el );  // append after the body
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
		 * Returns the body element for the Panel, wrapped in a jQuery object.  This element will only be available after the 
		 * Panel has been rendered by the {@link #method-render} method.  
		 * 
		 * @return {jQuery}
		 */
		getBodyEl : function() {
			return this.$bodyEl;  // created when rendered
		},
		
		
		/**
		 * Override of superclass method, used to specify the {@link #$bodyEl} as the target for Panel content.
		 * 
		 * @protected
		 * @return {jQuery}
		 */
		getContentTarget : function() {
			return this.getBodyEl();
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * Performs the creation of the {@link #property-header}, by calling {@link #createHeader}, and then applying 
		 * any post-processing required (which includes rendering it as the first element in the Panel
		 * itself if it is already rendered).
		 * 
		 * To create a different {@link #property-header} in a subclass, override {@link #createHeader} instead of this 
		 * method.
		 * 
		 * @protected
		 */
		doCreateHeader : function() {
			this.header = this.createHeader( _.defaults( {}, this.headerCfg, {
				type         : 'panelheader',
				componentCls : this.baseCls + '-header',  // Ex: For Panel itself, 'gui-panel-header'. For Window, 'gui-window-header'
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
		 * @param {Object} headerConfig The configuration for the header, with defaults applied from the Panel.
		 * @return {gui.panel.Header}
		 */
		createHeader : function( headerConfig ) {
			return ComponentManager.create( headerConfig );
		},
		
		
		/**
		 * Performs the creation of the {@link #footer}, by calling {@link #createFooter}, and then applying 
		 * any post-processing required (which includes rendering it as the last element in the Panel
		 * itself if it is already rendered).
		 * 
		 * To create a different {@link #property-header} in a subclass, override {@link #createHeader} instead of this 
		 * method.
		 * 
		 * @protected
		 */
		doCreateFooter : function() {
			this.footer = this.createFooter();
			
			if( this.rendered ) {
				this.footer.render( this.$el );  // append to make it the last element (i.e. after the body)
			}
		},
		
		
		/**
		 * Creates the {@link #footer} Container, which contains any {@link #buttons} that were configured.
		 * 
		 * @protected
		 * @return {gui.Container}
		 */
		createFooter : function() {
			return new Container( {
				cls    : this.baseCls + '-footer',
				layout : 'hbox',
				
				items  : [
					{ type: 'component', flex: 1 },  // to push the buttons to the right
					{
						type : 'container',
						cls  : this.baseCls + '-footer-buttons',
						
						defaultType : 'button',   // gui.button.Button
						items       : this.buttons
					}
				]
			} );
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Gets the {@link #property-header} of the Panel. If the {@link #property-header} has not been created yet,
		 * it will be instantiated before it is returned.
		 * 
		 * In most cases, you will not need to directly access the Panel's {@link #property-header} component. Most of 
		 * the time, you will set the {@link #cfg-header} config options, and if the Panel's title needs to be changed,
		 * you will use the {@link #setTitle} method.
		 * 
		 * However, this method is provided for more advanced operations, such as if components need to be injected into
		 * the header. In this case, be aware that the header is created with components of its own, and you will need
		 * to inject yours at the correct indexes.
		 * 
		 * @return {gui.panel.Header}
		 */
		getHeader : function() {
			if( !this.header ) {
				this.doCreateHeader();
			}
			return this.header;
		},
		
		
		/**
		 * Sets the title of the Panel.
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
		 * Retrieves the {@link #title} of the Panel.
		 * 
		 * @return {String} The title of the Panel.
		 */
		getTitle : function() {
			return this.title;
		},
		
		
		/**
		 * Shows the Panel's {@link #property-header}, if it is currently hidden.
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
		 * Hides the Panel's {@link #property-header}, if it is currently visible.
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
		
		// Panel's Body Styling Functionality
		
		/**
		 * Adds one or more CSS classes to the Panel's {@link #$bodyEl body} element.
		 * 
		 * @param {String} cssClass One or more CSS classes to add to the Panel's {@link #$bodyEl body} element. If specifying 
		 *   multiple CSS classes, they should be separated with a space. Ex: "class1 class2"
		 * @return {gui.panel.Panel} This Panel, to allow method chaining.
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
		 * Removes one or more CSS classes from the Panel's {@link #$bodyEl body} element.
		 * 
		 * @param {String} cssClass One or more CSS classes to remove from the Panel's {@link #$bodyEl body} element. If specifying 
		 *   multiple CSS classes, they should be separated with a space. Ex: "class1 class2"
		 * @return {gui.panel.Panel} This Panel, to allow method chaining.
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
		 * Determines if the Panel's {@link #$bodyEl body} element has the given `cssClass`.
		 * 
		 * @param {String} cssClass The CSS class to test for.
		 * @return {Boolean} True if the Panel's {@link #$bodyEl body} element has the given `cssClass`, false otherwise.
		 */
		hasBodyCls : function( cssClass ) {
			// Check the `bodyCls` config in the unrendered state, or the body element itself in the rendered state
			return ( !this.rendered ) ? Css.hasCls( this.bodyCls, cssClass ) : this.$bodyEl.hasClass( cssClass );
		},
		
		
		/**
		 * Sets a CSS style property on the Panel's {@link #$bodyEl body} element.
		 * 
		 * @param {String/Object} name The CSS property name. This first argument may also be provided as an Object of key/value
		 *   pairs for CSS property names/values to apply to the Panel's {@link #$bodyEl body} element.
		 * @param {String} value The value for the CSS property. Optional if the first argument is an Object.
		 * @return {gui.panel.Panel} This Panel, to allow method chaining.
		 */
		setBodyStyle : function( name, value ) {
			if( !this.rendered ) {
				this.bodyStyle = this.bodyStyle || {};
				
				if( typeof name === 'object' ) {
					_.assign( this.bodyStyle, name );  // apply each of the properties on the provided 'styles' object onto the Panel's bodyStyle
				} else {
					this.bodyStyle[ name ] = value;
				}
				
			} else {
				this.$bodyEl.css( name, value );  // will work for both method signatures (i.e. when `name` is an object, and when provided both name / value)
			}
			return this;
		},

		
		// ---------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			if( this.header ) this.header.destroy();
			if( this.footer ) this.footer.destroy();
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'panel', Panel );
	
	return Panel;
	
} );