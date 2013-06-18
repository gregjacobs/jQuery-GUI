/*global define */
define( [
	'jqc/Container',
	'jqc/Label',
	'jqc/layout/HBox'
], function( Container, Label ) {
	
	/**
	 * @class jqc.panel.Header
	 * @extends jqc.Container
	 * 
	 * Specialized Container subclass which is used as a {@link jqc.panel.Panel Panel's} header.
	 */
	var PanelHeader = Container.extend( {
		
		/**
		 * @cfg {String} title
		 * 
		 * The title of the Panel, which is placed in the {@link #titleLabel}.
		 */
		
		/**
		 * @cfg {Object/Object[]/jqc.panel.ToolButton/jqc.panel.ToolButton[]} toolButtons
		 * 
		 * One or more {@link jqc.panel.ToolButton ToolButtons} or ToolButton config objects. These will
		 * be placed on the right side of the header.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		layout : 'hbox',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-panel-header',
		
		
		/**
		 * @protected
		 * @property {jqc.Label} titleLabel
		 * 
		 * The label component for the title.
		 */
		
		/**
		 * @protected
		 * @property {jqc.Container} toolButtonsCt
		 * 
		 * The Container that holds the {@link #toolButtons}.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this.titleLabel = this.createTitleLabel();
			this.toolButtonsCt = this.createToolButtonsCt();
			
			this.items = this.buildItems();
			
			this._super( arguments );
		},
		
		
		/**
		 * Builds the array of the header's child items.
		 * 
		 * @protected
		 * @return {Object/Object[]} The child item(s).
		 */
		buildItems : function() {
			return [
				this.titleLabel,
				
				{ type: 'component', flex: 1 },  // take up the middle space, to effectively right-align the tool buttons
				
				this.toolButtonsCt
			];
		},
			
			
		/**
		 * Creates the title component. This is the component that the {@link #title}
		 * config will be applied to, by default.
		 * 
		 * @protected
		 * @return {jqc.Label}
		 */
		createTitleLabel : function() {
			return new Label( {
				cls  : this.componentCls + '-title',
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
				cls         : this.componentCls + '-toolButtons',
				defaultType : 'toolbutton',   // jqc.panel.ToolButton
				items       : this.toolButtons
			} );
		},
		
		
		// ------------------------------------
		
		
		/**
		 * Sets the text in the {@link #titleLabel}.
		 * 
		 * @param {String} title
		 */
		setTitle : function( title ) {
			this.titleLabel.setText( title );
		}
		
	} );
	
	return PanelHeader;
	
} );