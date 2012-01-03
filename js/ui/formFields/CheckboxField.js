/**
 * @class ui.formFields.CheckboxField
 * @extends ui.formFields.AbstractField
 *  
 * Checkbox field component.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.formFields.CheckboxField = Kevlar.extend( ui.formFields.AbstractField, {
	
	/**
	 * @cfg {String} checkboxLabel
	 * The label for the checkbox itself, which will be placed to the right of the checkbox. This config is to differentiate from
	 * the {@link ui.formFields.AbstractField#label label} provided by {@link ui.formFields.AbstractField AbstractField} (the one which
	 * affects all form field components uniformly).  Defaults to an empty string.<br><br>
	 * 
	 * Note that if the checkbox should be aligned with other form fields that have "left side" labels (see 
	 * {@link ui.formFields.AbstractField#labelPosition}, then set its {@link ui.formFields.AbstractField#label label} config to
	 * a non-breaking space (&amp;nbsp;).
	 */
	checkboxLabel : "",
	
	/**
	 * @cfg {String/Function} value
	 * The initial value for the field, if any. Any truthy value will initialize the checkbox as checked.
	 */
	
	
	// protected
	onRender : function() {
		// Call superclass onRender()
		ui.formFields.CheckboxField.superclass.onRender.apply( this, arguments );
		
		
		// Create the input element, and append it to the $inputContainerEl
		this.$inputEl = jQuery( '<input type="checkbox" class="checkbox" id="' + this.inputId + '" name="' + this.inputName + '"' + ( this.value ? ' checked' : '' ) + ' />' )
			.appendTo( this.$inputContainerEl );
		
		// Create the checkbox label element, which comes up on the right side of the checkbox.
		this.$checkboxLabelEl = jQuery( '<label for="' + this.inputId + '" class="dialog-formField-label" />&nbsp;' + ( this.checkboxLabel || "" ) )
			.appendTo( this.$inputContainerEl );
		
		// Add event handlers to the input element
		this.$inputEl.bind( {
			change : function() { this.onChange( this.getValue() ); }.createDelegate( this )   // call onChange() with the new value.
		} );
	},
	
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s setValue() method, which sets the value to the field.
	 * 
	 * @method getValue
	 * @param {Boolean} value The value of the field. If truthy, the checkbox will be checked. If falsy, the checkbox will be unchecked.
	 */
	setValue : function( value ) {
		if( !this.rendered ) {
			this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
		} else {
			this.$inputEl.prop( 'checked', !!value );
		}
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s getValue() method, which returns the value of the field.
	 * 
	 * @method getValue
	 * @return {Boolean} The value of the field (true if it's checked, false otherwise).
	 */
	getValue : function() {
		if( !this.rendered ) {
			return !!this.value;  // If the value was set before the Component has been rendered (i.e. before the Field has been created), return that. Make sure it returns a Boolean as well.
		} else {
			return this.$inputEl.prop( "checked" );
		}
	}
	
} );


// Register the type so it can be created by the string 'Checkbox' in the manifest
// For backward compatibility, register the type 'Boolean' as well.
ui.ComponentManager.registerType( 'Checkbox', ui.formFields.CheckboxField );  
ui.ComponentManager.registerType( 'Boolean', ui.formFields.CheckboxField ); 