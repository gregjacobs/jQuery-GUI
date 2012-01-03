/**
 * @class ui.toolButtons.ToolButton
 * @extends ui.Button
 * 
 * Renders a ToolButton.  A ToolButton is a small button (~16x16) that is used to perform an action. Some examples include
 * an {@link ui.toolButtons.EditButton EditButton}, a {@link ui.toolButtons.HideButton HideButton}, and 
 * a {@link ui.toolButtons.DeleteButton DeleteButton}. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.ToolButton = Kevlar.extend( ui.Button, {
	
	/**
	 * @cfg {String} size
	 * The size of the tool button. At this time, this can be either 'tiny', 'small', or 'large'. Defaults to 'large'
	 * now that we seem to be using all large icons on the site (used to default to 'small'). Note that some buttons
	 * may not support each type. TODO: CSS classes should be added for each.
	 */
	size : 'large',
	
	
	// protected
	initComponent : function() {
		this.cls += ' ui-toolButton ui-toolButton-' + this.size;  // size will be 'tiny', 'small', or 'large'
				
		ui.toolButtons.ToolButton.superclass.initComponent.call( this );
	}
	
} );

// Register the type so it can be created by the string 'ToolButton' in the manifest
ui.ComponentManager.registerType( 'ToolButton', ui.toolButtons.ToolButton );