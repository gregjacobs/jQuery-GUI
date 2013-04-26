/*global define */
define( [
	'jqc/button/Button',
	'jqc/ComponentManager'
], function( Button, ComponentManager ) {
	
	/**
	 * @class jqc.panel.ToolButton
	 * @extends jqc.button.Button
	 * @alias type.toolbutton
	 * 
	 * Small utility class for a button that can be used in a {@link jqc.panel.Panel Panel's} header.
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
		componentCls : 'jqc-ToolButton',
		
		
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
				'jqc-icon',
				'jqc-icon-' + toolType,
				componentCls + '-icon',
				componentCls + '-icon-' + toolType
			].join( " " );
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'toolbutton', ToolButton );
	
	return ToolButton;
	
} );