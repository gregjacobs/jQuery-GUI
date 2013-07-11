/*global define */
define( [
	'lodash',
	'jqc/ComponentManager',
	'jqc/Container',
	'jqc/Label',
	'jqc/layout/HBox'
], function( _, ComponentManager, Container, Label ) {
	
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
		 * @cfg {Number} titlePosition
		 * 
		 * The index in the Header's {@link #items} array where the {@link #title} component should be
		 * placed. This is most useful when providing the {@link #items} config to place other components
		 * in the Header.
		 * 
		 * Defaults to 0, making the {@link #title} component the first component.
		 */
		titlePosition : 0,
		
		/**
		 * @cfg {Object/Object[]} items
		 * 
		 * Any component(s) to place into the Header. The {@link #title} component is automatically
		 * added to this array at the index specified by the {@link #titlePosition}, and any {@link #toolButtons}
		 * are automatically appended as well.
		 * 
		 * See this config in the superclass for more details.
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
			
			this.items = this.buildItems();  // note: if an `items` config was passed to the Header, it will be handled in buildItems()
			
			this._super( arguments );
		},
		
		
		/**
		 * Builds the array of the header's child items.
		 * 
		 * @protected
		 * @return {Object/Object[]} The child item(s).
		 */
		buildItems : function() {
			var items = this.items || [];  // start with any custom items, or an empty array
			if( !_.isArray( items ) )  // the `items` config may have been a single object, in which case, wrap in an array
				items = [ items ];
			
			// Add the title component at the appropriate position
			var titlePosition = Math.min( this.titlePosition, items.length );  // append if at a position greater than the number of items
			items.splice( titlePosition, 0, this.titleLabel );
			
			// Add the toolbuttons, right aligned
			items.push( 
				{ type: 'component', flex: 1 },  // take up the middle space, to effectively right-align the tool buttons
				this.toolButtonsCt
			);
			
			return items;
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
			this.doLayout();  // Update the Header's layout for the new text size
		}
		
	} );
	
	ComponentManager.registerType( 'panelheader', PanelHeader );
	
	return PanelHeader;
	
} );