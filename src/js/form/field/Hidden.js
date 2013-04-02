/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'ui/ComponentManager',
	'ui/form/field/Field'
], function( jQuery, _, Class, ComponentManager, Field ) {
	
	/**
	 * @class ui.form.field.Hidden
	 * @extends ui.form.field.Field
	 * 
	 * A hidden input. This class does not have any visible display.
	 */
	var HiddenField = Class.extend( Field, {
		
		/**
		 * @hide
		 * @cfg {String} label
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
			
			this._super( arguments );
		},
		
		
		// protected
		onRender : function( container ) { 
			// Call superclass onRender() first, to render this Component's element
			this._super( arguments );
			
			// Create and append the hidden field
			this.$inputEl = jQuery( '<input type="hidden" id="' + this.inputId + '" name="' + this.inputName + '" value="' + ( this.value || "" ) + '" />' )
				.appendTo( this.$inputContainerEl );
		},
		
		
		/**
		 * Implementation of {@link ui.form.field.Field Field}'s setValue() method, which sets the value to the field.
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
		 * Implementation of {@link ui.form.field.Field Field}'s getValue() method, which returns the value of the field.
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
	
	
	// Register the class so it can be created by the type string 'hiddenfield'
	ComponentManager.registerType( 'hiddenfield', HiddenField );
	
	return HiddenField;
	
} );