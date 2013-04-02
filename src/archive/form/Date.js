/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'ui/ComponentManager',
	'ui/form/field/Text'
], function( jQuery, _, Class, ComponentManager, TextField ) {
	
	/**
	 * @class ui.form.field.Date
	 * @extends ui.form.field.Text
	 * 
	 * Date input field, which uses a jQuery UI DatePicker when the field has focus.
	 */
	var DateField = Class.extend( TextField, {
		
		/**
		 * @cfg {String} emptyText
		 * The text to show in the field when the field is empty. When the user focuses the field, this text
		 * will be removed, allowing the user to type their value.<br><br>
		 * 
		 * For DateField, this accepts the special string "now", which can be used to set the field's emptyText to the current date.<br><br>
		 * 
		 * Note that this is not compatible with the {@link #labelPosition} config set to "infield". See the description of {@link #labelPosition}.
		 */
		
		/**
		 * @cfg {String/Function} value
		 * The initial value for the field, if any. The special string "now" can be used to set the field to the current date.
		 */
		 
		// protected
		initComponent : function() {
			this._super( arguments );
			
			// Handle the string "now" on the emptyText
			this.emptyText = this.handleDateValue( this.emptyText );
			
			// Handle the string "now" on the value
			this.value = this.handleDateValue( this.value );
		},
		
		
		// protected
		onRender : function( container ) { 
			// Call superclass onRender() first, to render this Component's element
			this._super( arguments );
			
			// Create a jQuery UI Datepicker instance for the field
			this.$inputEl.datepicker( {
	            dateFormat: 'mm/dd/yy'
	        } );
		},
		
		
		/**
		 * Extension of {@link ui.form.field.Text#setValue}, to accept the special value "now", and replace it with the current date.
		 * 
		 * @method setValue
		 * @param {String} value The value for the field. Accepts the special value "now", which will be replaced by the current date (in mm/dd/yyyy format).
		 */
		setValue : function( value ) {
			value = this.handleDateValue( value );
			
			this._super( [ value ] );
		},
		
		
		/**
		 * Extension of {@link ui.form.field.Text#setEmptyText}, to accept the special value "now", and replace it with the current date.
		 * 
		 * @method setEmptyText
		 * @param {Mixed} emptyText The empty text to set to the Field.
		 */
		setEmptyText : function( emptyText ) {
			emptyText = this.handleDateValue( emptyText );
			
			this._super( [ emptyText ] );
		},
		
		
		/**
		 * Converts the given `value` to the appropriate value for the DateField. If the special value "now" is provided, it will be replaced with the
		 * current date.
		 * 
		 * @private
		 * @method handleDateValue
		 * @param {String} value The value to convert if it is the string "now".
		 * @return {String}
		 */
		handleDateValue : function( value ) {		
			return ( value === "now" ) ? jQuery.datepicker.formatDate( 'mm/dd/yy', new Date() ) : value;
		},
		
		
		/**
		 * Destroys the jQuery UI datepicker instance on the field upon field destruction.
		 * 
		 * @protected
		 * @method onDestroy
		 */
		onDestroy : function() {
			if( this.rendered ) {
				this.$inputEl.datepicker( 'destroy' );
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the class so it can be created by the type string 'datefield'
	ComponentManager.registerType( 'datefield', DateField );
	
	return DateField;

} );