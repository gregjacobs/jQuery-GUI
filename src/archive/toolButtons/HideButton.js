/**
 * @class ui.toolButtons.HideButton
 * @extends ui.toolButtons.ToolButton
 * 
 * A specialized subclass that renders a "Hide" Button, which is a small button with an eye as its icon, used to allow the toggling of some 
 * item to be shown (visible) or hidden. Also includes functionality for toggling the "visible" and "hidden" states of 
 * the icon on the button, and retrieving which is currently set.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, Jux, ui */
ui.toolButtons.HideButton = Class.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @hide
	 * @cfg {String} secondaryIcon
	 */
	
	/**
	 * @hide
	 * @cfg {String} tooltip
	 */
 
	
	/**
	 * @cfg {String} buttonState
	 * The initial state that the button is showing.  This can be either "visible" or "hidden". Defaults to "visible", 
	 * meaning for the user that: the item that the button is representing is going to be shown.
	 */
	buttonState : 'visible',
	
	/**
	 * @cfg {String} visibleTooltip
	 * The text to use for the tooltip of the button when the state of the button is "visibile".
	 * Defaults to "Hide" (telling the user that if they click the button, it will go to the "hidden" state).
	 */
	visibleTooltip : "Hide",
	
	/**
	 * @cfg {String} hiddenTooltip
	 * The text to use for the tooltip of the button when the state of the button is "hidden".
	 * Defaults to "Show" (telling the user that if they click the button, it will go to the "visible" state).
	 */
	hiddenTooltip : "Show",
	
	

	/**
	 * @private
	 * @property visibleIconCls
	 * The css class that shows the "visible" state icon.
	 */
	
	/**
	 * @private
	 * @property hiddenIconCls
	 * The css class that shows the "hidden" state icon.
	 */
	
	
	

	// protected
	initComponent : function() {
		if( this.buttonState !== 'visible' && this.buttonState !== 'hidden' ) {
			throw new Error( "Invalid buttonState config. Must be either 'visible' or 'hidden'." );
		}
		
		// determine the "visible" and "hidden" icon css classes based on the 'size' config
		if( this.size === 'small' ) {
			this.visibleIconCls = 'ui-icon-eyeopen';
			this.hiddenIconCls = 'ui-icon-eyeclosed';
		} else {
			this.visibleIconCls = 'jux-icon-show-lg';
			this.hiddenIconCls = 'jux-icon-hide-lg';
		}
		
		// Set the initial icon and set the initial 'title' config based on the buttonState
		if( this.buttonState === 'visible' ) {
			this.primaryIcon = this.visibleIconCls;
			this.tooltip = this.visibleTooltip;
		} else {
			this.primaryIcon = this.hiddenIconCls;
			this.tooltip = this.hiddenTooltip;
		}
		
		// Call superclass initComponent after ToolButton configs have been set
		ui.toolButtons.HideButton.superclass.initComponent.call( this );
	},
	
	
	/**
	 * Extension of onClick template method used to toggle the show/hide state of the button.
	 *
	 * @protected
	 * @method onClick
	 */
	onClick : function() {
		// Toggle the button to the next state
		this.toggleButtonState();
		
		// Call the superclass method
		ui.toolButtons.HideButton.superclass.onClick.apply( this, arguments );
	},
	
	
	/**
	 * Toggles the button's state back and forth, from visible->hidden if it is currently 'visible', or hidden->visible if it
	 * is currently 'hidden'. 
	 * 
	 * @method toggleButtonState
	 */
	toggleButtonState : function() {
		if( this.buttonState === 'visible' ) {
			this.setButtonState( 'hidden' );
		} else {
			this.setButtonState( 'visible' );
		}
	},
	
	
	/**
	 * Sets the button's visible/hidden state.  Accepts the strings 'visible' or 'hidden'.
	 *
	 * @method setButtonState
	 * @param {String} buttonState Either 'visible' or 'hidden'.
	 */
	setButtonState : function( buttonState ) {
		if( buttonState !== 'visible' && buttonState !== 'hidden' ) {
			throw new Error( "Invalid buttonState argument. Must be either 'visible' or 'hidden'." );
		}
		
		this.buttonState = buttonState;
		
		// Modify the state by setting the option on the jQuery UI Button
		if( buttonState === 'visible' ) {
			this.$el.button( 'option', 'icons', { primary: this.visibleIconCls, secondary: null } );
			this.$el.attr( 'title', this.visibleTooltip );
		} else {
			this.$el.button( 'option', 'icons', { primary: this.hiddenIconCls, secondary: null } );
			this.$el.attr( 'title', this.hiddenTooltip );
		}
	},
	
	
	/**
	 * Retrieves the current button state. Will return either 'visible' or 'hidden'.
	 *
	 * @method getButtonState
	 * @return {String} Either 'visible' or 'hidden', depending on the button's current state.
	 */
	getButtonState : function() {
		return this.buttonState;
	}
	 
} );

// Register the type so it can be created by the string 'HideButton' in the manifest
ui.ComponentManager.registerType( 'HideButton', ui.toolButtons.HideButton );