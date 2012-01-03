/**
 * @class ui.toolButtons.CloseButton
 * @extends ui.toolButtons.ToolButton
 * 
 * Renders a "Close" Button, which is a button with an "X" as its icon. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.CloseButton = Kevlar.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element. Defaults to "Close" for this subclass.
	 */
	tooltip: "Close",
	
	
	// protected
	initComponent : function() {
		// determine the primaryIcon config based on the 'size' config
		if( this.size === 'tiny' ) {
			this.primaryIcon = 'jux-icon-x-dkgray-sm';
		} else if( this.size === 'small' ) {
			this.primaryIcon = 'ui-icon-delete';
		} else {
			this.primaryIcon = 'jux-icon-close';
		}
		
		ui.toolButtons.CloseButton.superclass.initComponent.call( this );
	}

} );

// Register the type so it can be created by the string 'CloseButton' in the manifest
ui.ComponentManager.registerType( 'CloseButton', ui.toolButtons.CloseButton );
