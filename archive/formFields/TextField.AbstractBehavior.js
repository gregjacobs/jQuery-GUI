/**
 * @class ui.formFields.TextField.AbstractBehavior
 * @extends Object
 * 
 * Defines the interface for the strategy TextField behavior pattern implementation in {@link ui.formFields.TextField}.
 *
 * @constructor
 */
/*global Class, Jux, ui */
ui.formFields.TextField.AbstractBehavior = Class.extend( Object, {
		
	/**
	 * Called when the TextField is rendered.
	 * 
	 * @abstract
	 * @method onRender
	 * @param {ui.formFields.TextField} textField
	 */
	onRender : Jux.emptyFn,
	
		
	/**
	 * Called when the TextField's setValue() method is called (if the TextField is rendered)
	 * 
	 * @abstract
	 * @method onSetValue
	 * @param {ui.formFields.TextField} textField
	 * @param {String} value
	 */
	onSetValue : Jux.emptyFn,
	
	
	/**
	 * Called when the TextField has been changed.
	 * 
	 * @abstract
	 * @method onChange
	 * @param {ui.formFields.TextField} textField
	 */
	onChange : Jux.emptyFn,
	
	
	/**
	 * Called when the TextField has been focused.
	 * 
	 * @abstract
	 * @method onFocus
	 * @param {ui.formFields.TextField} textField
	 */
	onFocus : Jux.emptyFn,
	
	
	/**
	 * Called when the TextField has been blurred.
	 * 
	 * @abstract
	 * @method onBlur
	 * @param {ui.formFields.TextField} textField
	 */
	onBlur : Jux.emptyFn,
	
	
	/**
	 * Called when the TextField gets a keydown event.
	 * 
	 * @abstract
	 * @method onKeyDown
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyDown : Jux.emptyFn,
	
	
	/**
	 * Called when the TextField gets a keyup event.
	 * 
	 * @abstract
	 * @method onKeyUp
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyUp : Jux.emptyFn,
	
	
	/**
	 * Called when the TextField gets a keypress event.
	 * 
	 * @abstract
	 * @method onKeyPress
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyPress : Jux.emptyFn
	
} );
