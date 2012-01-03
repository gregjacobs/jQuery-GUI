/**
 * @class ui.formFields.TextField.EmptyTextBehavior
 * @extends ui.formFields.TextField.AbstractBehavior
 * 
 * Handles a {ui.formFields.TextField TextField} when it is in the "default" state (i.e. it is displaying a default value
 * when empty).  This is opposed to when it is using the {@link ui.formFields.TextField.InfieldLabelBehavior InfieldLabelBehavior}, 
 * which is incompatible with the field having emptyText.
 *
 * @constructor
 */
/*global Kevlar, ui */
ui.formFields.TextField.EmptyTextBehavior = Kevlar.extend( ui.formFields.TextField.AbstractBehavior, {
	
	/**
	 * @private
	 * @property emptyTextCls
	 * The CSS class that should be applied when showing the {@link ui.formFields.TextField#emptyText emptyText}.
	 * @type String
	 */
	emptyTextCls : 'ui-hint-text',
	
	
	/**
	 * Called when the TextField's setValue() method is called (if the TextField is rendered), which handles
	 * the {@link ui.formFields.TextField#emptyText emptyText}.
	 * 
	 * @method onSetValue
	 * @param {ui.formFields.TextField} textField
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
	 * Called when the TextField has been focused, which removes the {@link ui.formFields.TextField#emptyText emptyText} in the TextField
	 * if that is what is currently set.
	 * 
	 * @method onFocus
	 * @param {ui.formFields.TextField} textField
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
	 * Called when the TextField has been blurred, to set the {@link ui.formFields.TextField#emptyText emptyText} 
	 * back into the field if the field has been left empty. This action is only performed however if the 
	 * {@link ui.formFields.TextField#restoreEmptyText restoreEmptyText} config is true on the 
	 * {@link ui.formFields.TextField TextField}.
	 * 
	 * @method onBlur
	 * @param {ui.formFields.TextField} textField
	 */
	onBlur : function( textField ) {
		// If the field is empty when blurred, and its restoreEmptyText config is true, then put in the 
		// emptyText back in (which will add the appropriate css class).
		if( textField.restoreEmptyText && textField.getValue() === "" ) {
			textField.setValue( textField.getEmptyText() || "" );
		}
	}
	
} );
