/*global define */
define( [
	'jquery',
	'lodash',
	'ui/util/Css',
	'ui/ComponentManager',
	'ui/Container',
	'ui/Label',
	'ui/template/LoDash',
	'ui/panel/ToolButton'   // for instantiating ToolButtons based on the toolButtons config
], function( jQuery, _, Css, ComponentManager, Container, Label, LoDashTpl ) {

	/**
	 * @class ui.panel.Panel
	 * @extends ui.Container
	 *
	 * An application-oriented {@link ui.Container} subclass which supports adding a {@link #title} bar and 
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
		 * @cfg {Object/Object[]/ui.panel.ToolButton/ui.panel.ToolButton[]} toolButtons
		 * 
		 * One or more {@link ui.panel.ToolButton ToolButtons} or ToolButton config objects. These will
		 * be placed on the right side of the Panel's header.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'ui-Panel',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		renderTpl : new LoDashTpl( [
			'<div id="<%= elId %>-header" class="<%= baseCls %>-header"><div class="ui-clear" /></div>',
			'<div id="<%= elId %>-body" class="<%= baseCls %>-body" <% if( bodyStyle ) { %>style="<%= bodyStyle %>"<% } %>></div>'
		] ),
		
		
		/**
		 * @protected
		 * @property {ui.Container} header
		 * 
		 * The Container which acts as the Panel's header. The header holds the title, and any  {@link #toolButtons} 
		 * specified. 
		 * 
		 * Note that this Container is only created if a {@link #title} or tool buttons have been specified.
		 */
		
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
		 * @inheritdoc
		 */
		initComponent : function() {			
			if( this.title || this.toolButtons ) {
				this.header = this.createHeader();
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
			
			if( this.header ) {
				this.header.render( this.$headerEl, /* prepend */ 0 );
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
		 * Creates the {@link #header}.
		 * 
		 * @protected
		 * @return {ui.Container}
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
		 * @return {ui.Label}
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
		 * @return {ui.Container}
		 */
		createToolButtonsCt : function() {
			return new Container( {
				cls         : this.baseCls + '-header-toolButtons',
				defaultType : 'toolbutton',
				items       : this.toolButtons
			} );
		},
		
		
		/**
		 * Builds the array of the {@link #header header's} child items. The arguments are provided so they can be 
		 * used to insert the components different positions in the items array in an override of this method.
		 * 
		 * @protected
		 * @param {ui.Label} titleCmp The title component, created by {@link #createTitleCmp}.
		 * @param {ui.Container} toolButtonsCt The tool buttons {@link ui.Container Container}.
		 * @return {Object[]}
		 */
		buildHeaderItems : function( titleCmp, toolButtonsCt ) {
			return [
				titleCmp,
				toolButtonsCt
			];
		},
		
		
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