/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'ui/ComponentManager',
	'ui/form/field/Field'
], function( jQuery, _, Class, ComponentManager, Field ) {
	
	/**
	 * @class ui.form.field.Field.Checkbox
	 * @extends ui.form.field.Field
	 *  
	 * Checkbox field component.
	 */
	var CheckboxField = Class.extend( Field, {
		
		/**
		 * @cfg {String} checkboxLabel
		 * The label for the checkbox itself, which will be placed to the right of the checkbox. This config is to differentiate from
		 * the {@link ui.form.field.Field#label label} provided by {@link ui.form.field.Field Field} (the one which
		 * affects all form field components uniformly).  Defaults to an empty string.<br><br>
		 * 
		 * Note that if the checkbox should be aligned with other form fields that have "left side" labels (see 
		 * {@link ui.form.field.Field#labelPosition}, then set its {@link ui.form.field.Field#label label} config to
		 * a non-breaking space (&amp;nbsp;).
		 */
		checkboxLabel : "",
		
		/**
		 * @cfg {String/Function} value
		 * The initial value for the field, if any. Any truthy value will initialize the checkbox as checked.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			// Create the input element, and append it to the $inputContainerEl
			this.$inputEl = jQuery( '<input type="checkbox" class="checkbox" id="' + this.inputId + '" name="' + this.inputName + '"' + ( this.value ? ' checked' : '' ) + ' />' )
				.appendTo( this.$inputContainerEl );
			
			// Create the checkbox label element, which comes up on the right side of the checkbox.
			this.$checkboxLabelEl = jQuery( '<label for="' + this.inputId + '" class="dialog-formField-label" />&nbsp;' + ( this.checkboxLabel || "" ) )
				.appendTo( this.$inputContainerEl );
			
			// Add event handlers to the input element
			this.$inputEl.on( {
				'change' : _.bind( function() {
					this.onChange( this.getValue() );  // call onChange() with the new value.
				}, this )
			} );
		},
		
		
		
		/**
		 * Implementation of {@link ui.form.field.Field Field}'s setValue() method, which sets the value to the field.
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
		 * Implementation of {@link ui.form.field.Field Field}'s getValue() method, which returns the value of the field.
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
	
	
	// Register the class so it can be created by the type string 'checkboxfield'
	ComponentManager.registerType( 'checkboxfield', CheckboxField );
	
	return CheckboxField;
	
} );