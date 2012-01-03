/**
 * @class ui.toolButtons.DownButton
 * @extends ui.toolButtons.ToolButton
 * 
 * Renders a "Move Down" Button, which is a small button with a down arrow as its icon. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.DownButton = Kevlar.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element. Defaults to "Move Down" for this subclass.
	 */
	tooltip: "Move Down",
	
	
	// protected
	initComponent : function() {
		// determine the primaryIcon config based on the 'size' config
		if( this.size === 'small' ) {
			this.primaryIcon = 'ui-icon-arrowthick-1-s';
		} else {
			this.primaryIcon = 'jux-icon-arrow-circle-s-lg';
		}
		
		ui.toolButtons.DownButton.superclass.initComponent.call( this );
	}

} );

// Register the type so it can be created by the string 'DownButton' in the manifest
ui.ComponentManager.registerType( 'DownButton', ui.toolButtons.DownButton );