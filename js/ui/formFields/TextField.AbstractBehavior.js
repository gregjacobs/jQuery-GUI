/**
 * @class ui.formFields.TextField.AbstractBehavior
 * @extends Object
 * 
 * Defines the interface for the strategy TextField behavior pattern implementation in {@link ui.formFields.TextField}.
 *
 * @constructor
 */
/*global Kevlar, ui */
ui.formFields.TextField.AbstractBehavior = Kevlar.extend( Object, {
		
	/**
	 * Called when the TextField is rendered.
	 * 
	 * @abstract
	 * @method onRender
	 * @param {ui.formFields.TextField} textField
	 */
	onRender : Kevlar.emptyFn,
	
		
	/**
	 * Called when the TextField's setValue() method is called (if the TextField is rendered)
	 * 
	 * @abstract
	 * @method onSetValue
	 * @param {ui.formFields.TextField} textField
	 * @param {String} value
	 */
	onSetValue : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField has been changed.
	 * 
	 * @abstract
	 * @method onChange
	 * @param {ui.formFields.TextField} textField
	 */
	onChange : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField has been focused.
	 * 
	 * @abstract
	 * @method onFocus
	 * @param {ui.formFields.TextField} textField
	 */
	onFocus : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField has been blurred.
	 * 
	 * @abstract
	 * @method onBlur
	 * @param {ui.formFields.TextField} textField
	 */
	onBlur : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField gets a keydown event.
	 * 
	 * @abstract
	 * @method onKeyDown
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyDown : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField gets a keyup event.
	 * 
	 * @abstract
	 * @method onKeyUp
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyUp : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField gets a keypress event.
	 * 
	 * @abstract
	 * @method onKeyPress
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyPress : Kevlar.emptyFn
	
} );
