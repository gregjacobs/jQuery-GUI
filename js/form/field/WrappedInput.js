/*global define */
define( [
	'ui/form/field/Field'
], function( Field ) {

	/**
	 * @abstract
	 * @class ui.form.field.WrappedInput
	 * @extends ui.form.field.Field
	 * 
	 * Abstract base class for form fields which handles making a div element look like a form field, so that
	 * elements (including an input) may be placed inside to look like they are all in the form field, but really
	 * they are separate. 
	 */
	var WrappedInputField = Field.extend( {
		abstractClass : true,
		
		
		/**
		 * Handles the basic rendering for all field subclasses. Takes care of adding a label (if specified), the
		 * containing div for the input element, and the input element itself if specified.
		 * 
		 * @protected
		 * @method onRender
		 */
		onRender : function( $container ) {
			this._super( arguments );
			
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
			
			this._super( arguments );
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
			
			this._super( arguments );
		}
		
	} );
	
	return WrappedInputField;
	
} );