/**
 * @abstract
 * @class ui.formFields.WrappedInputField
 * @extends ui.formFields.AbstractField
 * 
 * Abstract base class for form fields which handles making a div element look like a form field, so that
 * elements (including an input) may be placed inside to look like they are all in the form field, but really
 * they are separate. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.formFields.WrappedInputField = Kevlar.extend( ui.formFields.AbstractField, {	
	
	/**
	 * Handles the basic rendering for all field subclasses. Takes care of adding a label (if specified), the
	 * containing div for the input element, and the input element itself if specified.
	 * 
	 * @protected
	 * @method onRender
	 */
	onRender : function( $container ) {
		ui.formFields.WrappedInputField.superclass.onRender.apply( this, arguments );
		
		this.$inputContainerEl.addClass( 'dialog-formField-wrappedInputField' );
	},
	
	
	/**
	 * Template method for handling the input field being focused. This extension of the method
	 * adds the "glow" to the input's container while the field has focus.
	 * 
	 * @protected
	 * @method onFocus
	 */
	onFocus : function() {
		this.$inputContainerEl.addClass( 'dialog-formField-wrappedInputField-focus' );
		
		ui.formFields.WrappedInputField.superclass.onFocus.apply( this, arguments );
	},
	
	
	/**
	 * Template method for handling the input field being blurred. This extension of the method
	 * removes the "glow" from the input's container.
	 * 
	 * @protected
	 * @method onBlur
	 */
	onBlur : function() {
		this.$inputContainerEl.removeClass( 'dialog-formField-wrappedInputField-focus' );
		
		ui.formFields.WrappedInputField.superclass.onBlur.apply( this, arguments );
	}
	
} );