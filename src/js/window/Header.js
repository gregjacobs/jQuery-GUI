/*global define */
define( [
	'gui/ComponentManager',
	'gui/panel/Header'
], function( ComponentManager, PanelHeader ) {
	
	/**
	 * @class gui.window.Header
	 * @extends gui.panel.Header
	 * 
	 * Specialized Container subclass which is used as a {@link gui.window.Window Window's} header.
	 */
	var WindowHeader = PanelHeader.extend( {
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'gui-window-header'
		
	} );
	
	ComponentManager.registerType( 'windowheader', WindowHeader );
	
	return WindowHeader;
	
} );