/*global define */
define( [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/form/field/Field'
], function( jQuery, _, ComponentManager, Field ) {
	
	/**
	 * @class jqc.form.field.Checkbox
	 * @extends jqc.form.field.Field
	 * @alias type.checkbox
	 * @alias type.checkboxfield
	 *  
	 * Checkbox field component.
	 */
	var CheckboxField = Field.extend( {
		
		/**
		 * @cfg {String} checkboxLabel
		 * 
		 * The label for the checkbox itself, which will be placed to the right of the checkbox. This config is to differentiate from
		 * the {@link jqc.form.field.Field#label label} provided by {@link jqc.form.field.Field Field} (the one which
		 * affects all form field components uniformly).  Defaults to an empty string.
		 * 
		 * Note that if the checkbox should be aligned with other form fields that have "left side" labels (see 
		 * {@link jqc.form.field.Field#labelAlign}, then set its {@link jqc.form.field.Field#label label} config to
		 * a non-breaking space (&amp;nbsp;).
		 */
		checkboxLabel : "",
		
		/**
		 * @cfg {String/Function} value
		 * 
		 * The initial value for the field, if any. Any truthy value will initialize the checkbox as checked.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-form-CheckboxField',
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			// Create the input element, and append it to the $inputContainerEl
			this.$inputEl = jQuery( '<input type="checkbox" class="' + this.componentCls + '-input" id="' + this.inputId + '" name="' + this.inputName + '"' + ( this.value ? ' checked' : '' ) + ' />' )
				.appendTo( this.$inputContainerEl );
			
			// Create the checkbox label element, which comes up on the right side of the checkbox.
			this.$checkboxLabelEl = jQuery( '<label for="' + this.inputId + '" class="' + this.componentCls + '-label" />&nbsp;' + ( this.checkboxLabel || "" ) )
				.appendTo( this.$inputContainerEl );
			
			// Add event handlers to the input element
			this.$inputEl.on( {
				'change' : _.bind( function() {
					this.onChange( this.getValue() );  // call onChange() with the new value.
				}, this )
			} );
		},
		
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * 
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
		 * Implementation of {@link jqc.form.field.Field Field}'s getValue() method, which returns the value of the field.
		 * 
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
	
	
	ComponentManager.registerType( 'checkbox', CheckboxField );
	ComponentManager.registerType( 'checkboxfield', CheckboxField );
	
	return CheckboxField;
	
} );