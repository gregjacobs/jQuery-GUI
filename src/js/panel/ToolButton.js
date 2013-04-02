/*global define */
define( [
	'ui/Button',
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
		 * @cfg {String} ttype (required)
		 * 
		 * The tool button type. Currently accepts the strings:
		 * 
		 * - close
		 * - closethick
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// <debug>
			if( !this.ttype ) throw new Error( "'ttype' cfg required" );
			// </debug>
			
			this.addCls( 'ui-ToolButton' );
			this.iconCls = 'ui-ToolButton-icon ui-icon ui-icon-' + this.ttype;
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the type so it can be created by the type string 'toolbutton'
	ComponentManager.registerType( 'toolbutton', ToolButton );
	
	return ToolButton;
	
} );