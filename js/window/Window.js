/*global define */
define( [
	'ui/ComponentManager',
	'ui/Overlay'
], function( ComponentManager, Overlay ) {
	
	/**
	 * @class ui.window.Window
	 * @extends ui.Overlay
	 * 
	 * Basic class for creating a window (also known as a dialog).
	 */
	var Window = Overlay.extend( {
		
	} );
	
	
	// Register the type so that it can be created by the type string 'window'
	ComponentManager.registerType( 'window', Window );
	
	return Window;
	
} );