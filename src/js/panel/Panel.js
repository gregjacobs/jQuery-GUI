/*global define */
define( [
	'jquery',
	'lodash',
	'jqc/util/Css',
	'jqc/ComponentManager',
	'jqc/Container',
	'jqc/Label',
	'jqc/template/LoDash',
	'jqc/panel/ToolButton'   // for instantiating ToolButtons based on the toolButtons config
], function( jQuery, _, Css, ComponentManager, Container, Label, LoDashTpl ) {

	/**
	 * @class jqc.panel.Panel
	 * @extends jqc.Container
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
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Panel',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		renderTpl : new LoDashTpl( [
			'<div id="<%= elId %>-header" class="<%= baseCls %>-header"><div class="jqc-clear" /></div>',
			'<div id="<%= elId %>-body" class="<%= baseCls %>-body" <% if( bodyStyle ) { %>style="<%= bodyStyle %>"<% } %>></div>',
			'<div id="<%= elId %>-footer" class="<%= baseCls %>-footer"><div class="jqc-clear" /></div>'
		] ),
		
		
		/**
		 * @protected
		 * @property {jQuery} $headerEl
		 * 
		 * A reference to the Panel's header container element. This will be available after the Panel is rendered.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $bodyEl
		 * 
		 * A reference to the Panel's body element. This will be available after the Panel is rendered.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $footerEl
		 * 
		 * A reference to the Panel's footer container element. This will be available after the Panel is rendered.
		 */
		
		/**
		 * @protected
		 * @property {jqc.Container} header
		 * 
		 * The Container which acts as the Panel's header. The header holds the title, and any  {@link #toolButtons} 
		 * specified. 
		 * 
		 * Note that this Container is only created if a {@link #title} or tool buttons have been specified.
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
			if( this.title || this.toolButtons ) {
				this.header = this.createHeader();
			}
			
			if( this.buttons ) {
				this.footer = this.createFooter();
			}
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			var elId = this.elId;
			this.$headerEl = jQuery( '#' + elId + '-header' );
			this.$bodyEl = jQuery( '#' + elId + '-body' );
			this.$footerEl = jQuery( '#' + elId + '-footer' );
			
			if( this.header ) {
				this.header.render( this.$headerEl, /* prepend */ 0 );  // prepend before the "clear" el
			}
			if( this.footer ) {
				this.footer.render( this.$footerEl, /* prepend */ 0 );  // prepend before the "clear" el
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
		 * Creates the {@link #header} Container, which contains the {@link #title} and any
		 * {@link #toolButtons} configured.
		 * 
		 * @protected
		 * @return {jqc.Container}
		 */
		createHeader : function() {
			this.titleCmp = this.createTitleCmp();
			this.toolButtonsCt = this.createToolButtonsCt();
			
			return new Container( {
				cls   : this.baseCls + '-header-innerCt',
				items : this.buildHeaderItems( this.titleCmp, this.toolButtonsCt )
			} );
		},
		
		
		/**
		 * Creates the title component. This is the component that the {@link #title}
		 * config will be applied to, by default.
		 * 
		 * @protected
		 * @return {jqc.Label}
		 */
		createTitleCmp : function() {
			return new Label( {
				cls  : this.baseCls + '-header-title',
				text : this.title
			} );
		},
		
		
		/**
		 * Creates the tool buttons container.
		 * 
		 * @protected
		 * @return {jqc.Container}
		 */
		createToolButtonsCt : function() {
			return new Container( {
				cls         : this.baseCls + '-header-toolButtons',
				defaultType : 'toolbutton',   // jqc.panel.ToolButton
				items       : this.toolButtons
			} );
		},
		
		
		/**
		 * Builds the array of the {@link #header header's} child items. The arguments are provided so they can be 
		 * used to insert the components different positions in the items array in an override of this method.
		 * 
		 * @protected
		 * @param {jqc.Label} titleCmp The title component, created by {@link #createTitleCmp}.
		 * @param {jqc.Container} toolButtonsCt The tool buttons {@link jqc.Container Container}.
		 * @return {Object[]}
		 */
		buildHeaderItems : function( titleCmp, toolButtonsCt ) {
			return [
				titleCmp,
				toolButtonsCt
			];
		},
		
		
		/**
		 * Creates the {@link #footer} Container, which contains any {@link #buttons} that were configured.
		 * 
		 * @protected
		 * @return {jqc.Container}
		 */
		createFooter : function() {
			return new Container( {
				cls    : this.baseCls + '-footer-innerCt',
				layout : 'hbox',
				items  : [
					{ type: 'component', flex: 1 },  // to push the buttons to the right
					{
						type : 'container',
						cls  : this.baseCls + '-footer-buttons',
						
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
				this.header = this.createHeader();
				
				if( this.rendered ) {
					this.header.render( this.$headerEl, /* prepend */ 0 );
				}
			}
			
			this.title = title;
			this.titleCmp.setText( title );
			
			return this;
		}
		
	} );
	
	// Register the type so it can be created by the type string 'panel'
	ComponentManager.registerType( 'panel', Panel );
	
	return Panel;
	
} );