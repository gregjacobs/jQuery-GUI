/*global define */
define( [
	'jquery',
	'lodash',
	'ui/form/field/Text.Behavior'
], function( jQuery, _, TextFieldBehavior ) {
	
	/**
	 * @class ui.form.field.Text.EmptyTextBehavior
	 * @extends ui.form.field.Text.Behavior
	 * 
	 * Handles a {ui.form.field.Text TextField} when it is in the "default" state (i.e. it is displaying a default value
	 * when empty).  This is opposed to when it is using the {@link ui.form.field.Text.InfieldLabelBehavior InfieldLabelBehavior}, 
	 * which is incompatible with the field having emptyText.
	 */
	var EmptyTextBehavior = TextFieldBehavior.extend( {
		
		/**
		 * @private
		 * @property emptyTextCls
		 * The CSS class that should be applied when showing the {@link ui.form.field.Text#emptyText emptyText}.
		 * @type String
		 */
		emptyTextCls : 'ui-hint-text',
		
		
		/**
		 * Called when the TextField's setValue() method is called (if the TextField is rendered), which handles
		 * the {@link ui.form.field.Text#emptyText emptyText}.
		 * 
		 * @param {ui.form.field.Text} textField
		 * @param {String} value
		 */
		onSetValue : function( textField, value ) {
			// If the value being set is the emptyText, add the ui-hint-text class.  Not sure if this should definitely be like this, but it should work 
			// for most cases (i.e. every case except when the user sets actual data that is the emptyText). Otherwise, make sure that the ui-hint-text class 
			// is removed on set.
			if( value === textField.getEmptyText() ) {
				textField.getInputEl().addClass( this.emptyTextCls );
			} else {
				textField.getInputEl().removeClass( this.emptyTextCls );
			}
		},
		
		
		/**
		 * Called when the TextField has been focused, which removes the {@link ui.form.field.Text#emptyText emptyText} in the TextField
		 * if that is what is currently set.
		 * 
		 * @param {ui.form.field.Text} textField
		 */
		onFocus : function( textField ) {		
			// make sure the "empty text" css class is removed
			textField.getInputEl().removeClass( this.emptyTextCls );
			
			// If the current value is the emptyText value, clear the field.
			if( textField.getValue() === textField.getEmptyText() ) {
				textField.setValue( "" );
			}
		},
		
		
		/**
		 * Called when the TextField has been blurred, to set the {@link ui.form.field.Text#emptyText emptyText} 
		 * back into the field if the field has been left empty. This action is only performed however if the 
		 * {@link ui.form.field.Text#restoreEmptyText restoreEmptyText} config is true on the 
		 * {@link ui.form.field.Text TextField}.
		 * 
		 * @param {ui.form.field.Text} textField
		 */
		onBlur : function( textField ) {
			// If the field is empty when blurred, and its restoreEmptyText config is true, then put in the 
			// emptyText back in (which will add the appropriate css class).
			if( textField.restoreEmptyText && textField.getValue() === "" ) {
				textField.setValue( textField.getEmptyText() || "" );
			}
		}
		
	} );

	return EmptyTextBehavior;
	
} );