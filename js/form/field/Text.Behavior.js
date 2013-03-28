/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'ui/UI'
], function( jQuery, _, Class, UI ) {
	
	/**
	 * @class ui.form.field.Text.Behavior
	 * @extends Object
	 * 
	 * Defines the interface for the strategy TextField behavior pattern implementation in {@link ui.form.field.Text}.
	 */
	var TextFieldBehavior = Class.extend( Object, {
			
		/**
		 * Called when the TextField is rendered.
		 * 
		 * @abstract
		 * @method onRender
		 * @param {ui.form.field.Text} textField
		 */
		onRender : UI.emptyFn,
		
			
		/**
		 * Called when the TextField's setValue() method is called (if the TextField is rendered)
		 * 
		 * @abstract
		 * @method onSetValue
		 * @param {ui.form.field.Text} textField
		 * @param {String} value
		 */
		onSetValue : UI.emptyFn,
		
		
		/**
		 * Called when the TextField has been changed.
		 * 
		 * @abstract
		 * @method onChange
		 * @param {ui.form.field.Text} textField
		 */
		onChange : UI.emptyFn,
		
		
		/**
		 * Called when the TextField has been focused.
		 * 
		 * @abstract
		 * @method onFocus
		 * @param {ui.form.field.Text} textField
		 */
		onFocus : UI.emptyFn,
		
		
		/**
		 * Called when the TextField has been blurred.
		 * 
		 * @abstract
		 * @method onBlur
		 * @param {ui.form.field.Text} textField
		 */
		onBlur : UI.emptyFn,
		
		
		/**
		 * Called when the TextField gets a keydown event.
		 * 
		 * @abstract
		 * @method onKeyDown
		 * @param {ui.form.field.Text} textField
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyDown : UI.emptyFn,
		
		
		/**
		 * Called when the TextField gets a keyup event.
		 * 
		 * @abstract
		 * @method onKeyUp
		 * @param {ui.form.field.Text} textField
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyUp : UI.emptyFn,
		
		
		/**
		 * Called when the TextField gets a keypress event.
		 * 
		 * @abstract
		 * @method onKeyPress
		 * @param {ui.form.field.Text} textField
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyPress : UI.emptyFn
		
	} );

	return TextFieldBehavior;
	
} );