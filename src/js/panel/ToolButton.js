/*global define */
define( [
	'jqGui/button/Button',
	'jqGui/ComponentManager'
], function( Button, ComponentManager ) {
	
	/**
	 * @class jqGui.panel.ToolButton
	 * @extends jqGui.button.Button
	 * @alias type.toolbutton
	 * 
	 * Small utility class for a button that can be used in a {@link jqGui.panel.Panel Panel's} header.
	 */
	var ToolButton = Button.extend( {
		
		/**
		 * @cfg {String} toolType (required)
		 * 
		 * The tool button type. Currently accepts the strings:
		 * 
		 * - close
		 * - closethick
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqGui-panel-toolbutton',
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// <debug>
			if( !this.toolType ) throw new Error( "'toolType' cfg required" );
			// </debug>
			
			var componentCls = this.componentCls,
			    toolType = this.toolType;
			
			this.iconCls = [
				'jqGui-icon-' + toolType,
				componentCls + '-icon',
				componentCls + '-icon-' + toolType
			].join( " " );
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'toolbutton', ToolButton );
	
	return ToolButton;
	
} );