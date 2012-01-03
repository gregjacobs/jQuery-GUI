/**
 * @class ui.toolButtons.UpButton
 * @extends ui.toolButtons.ToolButton
 * 
 * Renders a "Move Up" Button, which is a small button with an up arrow as its icon. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.UpButton = Kevlar.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element. Defaults to "Move Up" for this subclass.
	 */
	tooltip: "Move Up",
	
	
	// protected
	initComponent : function() {
		// determine the primaryIcon config based on the 'size' config
		if( this.size === 'small' ) {
			this.primaryIcon = 'ui-icon-arrowthick-1-n';
		} else {
			this.primaryIcon = 'jux-icon-arrow-circle-n-lg';
		}
		
		ui.toolButtons.UpButton.superclass.initComponent.call( this );
	}

} );

// Register the type so it can be created by the string 'UpButton' in the manifest
ui.ComponentManager.registerType( 'UpButton', ui.toolButtons.UpButton );