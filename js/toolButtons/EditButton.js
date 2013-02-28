/**
 * @class ui.toolButtons.EditButton
 * @extends ui.toolButtons.ToolButton
 * 
 * Renders an "Edit" Button, which is a small button with a pencil as its icon. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, Jux, ui */
ui.toolButtons.EditButton = Class.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element. Defaults to "Edit" for this subclass.
	 */
	tooltip: "Edit",
	
	
	// protected
	initComponent : function() {
		// determine the primaryIcon config based on the 'size' config
		if( this.size === 'small' ) {
			this.primaryIcon = 'ui-icon-pencil';
		} else {
			this.primaryIcon = 'ui-icon-pencil-lg';
		}
		
		ui.toolButtons.EditButton.superclass.initComponent.call( this );
	}

} );

// Register the type so it can be created by the string 'EditButton' in the manifest
ui.ComponentManager.registerType( 'EditButton', ui.toolButtons.EditButton );