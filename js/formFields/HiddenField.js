/**
 * @class ui.formFields.HiddenField
 * @extends ui.formFields.AbstractField
 * 
 * A hidden input.  This class does not have any visible display. 
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, jQuery, Jux, ui */
ui.formFields.HiddenField = Class.extend( ui.formFields.AbstractField, {
	
	/**
	 * @hide
	 * @cfg {String} label
	 */
	
	/**
	 * @hide
	 * @cfg {String} help
	 */
	
	/**
	 * @hide
	 * @cfg {Boolean} hidden
	 */
	
	
	
	// protected
	initComponent : function() {
		// Make sure there is no label and help text
		this.label = "";
		this.help = "";
		
		// Make sure the outer element (created by ui.Component) is hidden, as there should be no visible indication of the field
		this.hidden = true;
		
		// Call superclass initComponent
		ui.formFields.HiddenField.superclass.initComponent.call( this );
	},
	
	
	// protected
	onRender : function( container ) { 
		// Call superclass onRender() first, to render this Component's element
		ui.formFields.HiddenField.superclass.onRender.apply( this, arguments );
		
		// Create and append the hidden field
		this.$inputEl = jQuery( '<input type="hidden" id="' + this.inputId + '" name="' + this.inputName + '" value="' + ( this.value || "" ) + '" />' )
			.appendTo( this.$inputContainerEl );
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s setValue() method, which sets the value to the field.
	 * 
	 * @method getValue
	 * @param {String} value The value of the field.
	 */
	setValue : function( value ) {
		if( !this.rendered ) {
			this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
		} else {
			this.$inputEl.val( value );
		}
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s getValue() method, which returns the value of the field.
	 * 
	 * @method getValue
	 * @return {String} The value of the field.
	 */
	getValue : function() {
		if( !this.rendered ) {
			return this.value;  // If the value was set before the Component has been rendered (i.e. before the Field has been created), return that.
		} else {
			return this.$inputEl.val();
		}
	}
	
} );


// Register the type so it can be created by the string 'Hidden' in the manifest
ui.ComponentManager.registerType( 'Hidden', ui.formFields.HiddenField );  