/**
 * @class ui.toolButtons.DeleteButton
 * @extends ui.toolButtons.ToolButton
 * 
 * Renders a "Delete" Button, which is a small button with an "X" as its icon. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.DeleteButton = Kevlar.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element. Defaults to "Delete" for this subclass.
	 */
	tooltip: "Delete",
	
	
	// protected
	initComponent : function() {
		// determine the primaryIcon config based on the 'size' config
		if( this.size === 'tiny' ) {
			this.primaryIcon = 'jux-icon-x-ltgray-sm';
		} else if( this.size === 'small' ) {
			this.primaryIcon = 'ui-icon-delete';
		} else {
			this.primaryIcon = 'jux-icon-x-circle-lg';
		}
		
		ui.toolButtons.DeleteButton.superclass.initComponent.call( this );
	}

} );

// Register the type so it can be created by the string 'DeleteButton' in the manifest
ui.ComponentManager.registerType( 'DeleteButton', ui.toolButtons.DeleteButton );