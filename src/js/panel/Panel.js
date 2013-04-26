/*global define */
define( [
	'jquery',
	'lodash',
	'jqc/util/Css',
	'jqc/ComponentManager',
	'jqc/Container',
	'jqc/panel/Header',
	'jqc/template/LoDash',
	'jqc/panel/ToolButton'   // for instantiating ToolButtons based on the toolButtons config
], function( jQuery, _, Css, ComponentManager, Container, PanelHeader, LoDashTpl ) {

	/**
	 * @class jqc.panel.Panel
	 * @extends jqc.Container
	 * @alias type.panel
	 *
	 * An application-oriented {@link jqc.Container} subclass which supports adding a {@link #title} bar and 
	 * {@link #toolButtons}.
	 */
	var Panel = Container.extend( {
		
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
		 * @cfg {Object/Object[]/jqc.panel.ToolButton/jqc.panel.ToolButton[]} toolButtons
		 * 
		 * One or more {@link jqc.panel.ToolButton ToolButtons} or ToolButton config objects. These will
		 * be placed on the right side of the Panel's header (i.e. top right of the Panel).
		 */
		
		/**
		 * @cfg {Object/Object[]/jqc.button.Button/jqc.button.Button[]} buttons
		 * 
		 * One or more {@link jqc.button.Button Buttons} or Button config objects for buttons to place
		 * in the footer of the Panel. These will be placed on the right side of the Panel's footer 
		 * (i.e. bottom right of the Panel).
		 */
		
		/**
		 * @cfg {Boolean} headerHidden
		 * 
		 * `true` to initially hide the Panel's {@link #header}. Can be shown using {@link #showHeader}. 
		 */
		
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Panel',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		renderTpl : new LoDashTpl( [
			'<div id="<%= elId %>-body" class="<%= baseCls %>-body" <% if( bodyStyle ) { %>style="<%= bodyStyle %>"<% } %>></div>'
		] ),
		
		
		/**
		 * @protected
		 * @property {jQuery} $bodyEl
		 * 
		 * A reference to the Panel's body element. This will be available after the Panel is rendered.
		 */
		
		/**
		 * @protected
		 * @property {jqc.Container} header
		 * 
		 * The Container which acts as the Panel's header. The header holds the {@link #title}, and any {@link #toolButtons} 
		 * specified. 
		 * 
		 * Note that this Container is only created if a {@link #title} or {@link #toolButtons} have been specified.
		 */
		
		/**
		 * @protected
		 * @property {jqc.Container} footer
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
			
			if( this.title || this.toolButtons ) {
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
				bodyStyle : bodyStyle
			} );
		},
		
		
		/**
		 * Override of superclass method, used to specify the {@link #$bodyEl} as the target for Panel content.
		 * 
		 * @protected
		 * @return {jQuery}
		 */
		getContentTarget : function() {
			return this.$bodyEl;  // created when rendered
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * Performs the creation of the {@link #header}, by calling {@link #createHeader}, and then applying 
		 * any post-processing required (which includes rendering it as the first element in the Panel
		 * itself if it is already rendered).
		 * 
		 * To create a different {@link #header} in a subclass, override {@link #createHeader} instead of this 
		 * method.
		 * 
		 * @protected
		 */
		doCreateHeader : function() {
			this.header = this.createHeader();
			this.header.setVisible( !this.headerHidden );
			delete this.headerHidden;
			
			if( this.rendered ) {
				this.header.render( this.$el, /* prepend */ 0 );  // prepend to make it the first element (i.e. before the body)
			}
		},
		
		
		/**
		 * Creates the {@link #header}, which contains the {@link #title} and any {@link #toolButtons} configured.
		 * 
		 * @protected
		 * @return {jqc.panel.Header}
		 */
		createHeader : function() {
			return new PanelHeader( {
				title       : this.title,
				toolButtons : this.toolButtons
			} );
		},
		
		
		/**
		 * Performs the creation of the {@link #footer}, by calling {@link #createFooter}, and then applying 
		 * any post-processing required (which includes rendering it as the last element in the Panel
		 * itself if it is already rendered).
		 * 
		 * To create a different {@link #header} in a subclass, override {@link #createHeader} instead of this 
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
		 * @return {jqc.Container}
		 */
		createFooter : function() {
			return new Container( {
				cls    : this.baseCls + '-Footer',
				layout : 'hbox',
				
				items  : [
					{ type: 'component', flex: 1 },  // to push the buttons to the right
					{
						type : 'container',
						cls  : this.baseCls + '-Footer-buttons',
						
						defaultType : 'button',   // jqc.button.Button
						items       : this.buttons
					}
				]
			} );
		},
		
		
		// -----------------------------------
		
		
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
		 * Shows the Panel's {@link #header}, if it is currently hidden.
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
		 * Hides the Panel's {@link #header}, if it is currently visible.
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
		}
		
	} );
	
	
	ComponentManager.registerType( 'panel', Panel );
	
	return Panel;
	
} );