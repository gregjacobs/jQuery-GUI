/*global define */
define( [
	'jqg/button/Button',
	'jqg/ComponentManager'
], function( Button, ComponentManager ) {
	
	/**
	 * @class jqg.panel.ToolButton
	 * @extends jqg.button.Button
	 * @alias type.toolbutton
	 * 
	 * Small utility class for a button that can be used in a {@link jqg.panel.Panel Panel's} header.
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
		componentCls : 'jqg-panel-toolbutton',
		
		
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
				'jqg-icon-' + toolType,
				componentCls + '-icon',
				componentCls + '-icon-' + toolType
			].join( " " );
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'toolbutton', ToolButton );
	
	return ToolButton;
	
} );