/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'jqc/Jqc'
], function( jQuery, _, Class, Jqc ) {
	
	/**
	 * @class jqc.form.field.Text.Behavior
	 * @extends Object
	 * 
	 * Defines the interface for the strategy TextField behavior pattern implementation in {@link jqc.form.field.Text}.
	 */
	var TextFieldBehavior = Class.extend( Object, {
			
		/**
		 * Called when the TextField is rendered.
		 * 
		 * @abstract
		 * @method onRender
		 * @param {jqc.form.field.Text} textField
		 */
		onRender : Jqc.emptyFn,
		
			
		/**
		 * Called when the TextField's setValue() method is called (if the TextField is rendered)
		 * 
		 * @abstract
		 * @method onSetValue
		 * @param {jqc.form.field.Text} textField
		 * @param {String} value
		 */
		onSetValue : Jqc.emptyFn,
		
		
		/**
		 * Called when the TextField has been changed.
		 * 
		 * @abstract
		 * @method onChange
		 * @param {jqc.form.field.Text} textField
		 */
		onChange : Jqc.emptyFn,
		
		
		/**
		 * Called when the TextField has been focused.
		 * 
		 * @abstract
		 * @method onFocus
		 * @param {jqc.form.field.Text} textField
		 */
		onFocus : Jqc.emptyFn,
		
		
		/**
		 * Called when the TextField has been blurred.
		 * 
		 * @abstract
		 * @method onBlur
		 * @param {jqc.form.field.Text} textField
		 */
		onBlur : Jqc.emptyFn,
		
		
		/**
		 * Called when the TextField gets a keydown event.
		 * 
		 * @abstract
		 * @method onKeyDown
		 * @param {jqc.form.field.Text} textField
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyDown : Jqc.emptyFn,
		
		
		/**
		 * Called when the TextField gets a keyup event.
		 * 
		 * @abstract
		 * @method onKeyUp
		 * @param {jqc.form.field.Text} textField
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyUp : Jqc.emptyFn,
		
		
		/**
		 * Called when the TextField gets a keypress event.
		 * 
		 * @abstract
		 * @method onKeyPress
		 * @param {jqc.form.field.Text} textField
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyPress : Jqc.emptyFn
		
	} );

	return TextFieldBehavior;
	
} );