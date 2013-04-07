/*global define */
define( [
	'ui/button/Button',
	'ui/ComponentManager'
], function( Button, ComponentManager ) {
	
	/**
	 * @class ui.panel.ToolButton
	 * @extends ui.Button
	 * 
	 * Small utility class for a button that can be used in a {@link ui.panel.Panel Panel's} header.
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
		componentCls : 'ui-ToolButton',
		
		
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
				'ui-icon',
				'ui-icon-' + toolType,
				componentCls + '-icon',
				componentCls + '-icon-' + toolType
			].join( " " );
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the type so it can be created by the type string 'toolbutton'
	ComponentManager.registerType( 'toolbutton', ToolButton );
	
	return ToolButton;
	
} );