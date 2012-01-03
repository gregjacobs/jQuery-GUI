/**
 * @class ui.formFields.DateTimeField
 * @extends ui.formFields.TextField
 * 
 * Date input field, which uses the jQuery datetimeEntry plugin when the field has focus.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.formFields.DateTimeField = Kevlar.extend( ui.formFields.TextField, {
	
	/**
	 * @cfg {String} emptyText
	 * The text to show in the field when the field is empty. When the user focuses the field, this text
	 * will be removed, allowing the user to type their value.<br><br>
	 * 
	 * For DateTimeField, this accepts the special string "now", which can be used to set the field's emptyText to the current date.<br><br>
	 * 
	 * Note that this is not compatible with the {@link #labelPosition} config set to "infield". See the description of {@link #labelPosition}.
	 */
	
	/**
	 * @cfg {String/Function} value
	 * The initial value for the field, if any. The special string "now" can be used to set the field to the current date.
	 */
	 
	// protected
	initComponent : function() {
		ui.formFields.DateTimeField.superclass.initComponent.apply( this, arguments );
		
		// Handle the string "now" on the emptyText
		this.emptyText = this.handleDateValue( this.emptyText );
		
		// Handle the string "now" on the value
		this.value = this.handleDateValue( this.value );
	},
	
	
	// protected
	onRender : function( container ) { 
		// Call superclass onRender() first, to render this Component's element
		ui.formFields.DateTimeField.superclass.onRender.apply( this, arguments );
		
		this.$inputEl.datetimeEntry( { datetimeFormat: 'Y/O/D H:M' } );
	},
	
	
	/**
	 * Extension of {@link ui.formFields.TextField#setValue}, to accept the special value "now", and replace it with the current date.
	 * 
	 * @method setValue
	 * @param {String} value The value for the field. Accepts the special value "now", which will be replaced by the current date.
	 */
	setValue : function( value ) {
		value = this.handleDateValue( value );
		
		ui.formFields.DateTimeField.superclass.setValue.call( this, value );
	},
	
	
	/**
	 * Extension of {@link ui.formFields.TextField#setEmptyText}, to accept the special value "now", and replace it with the current date.
	 * 
	 * @method setEmptyText
	 * @param {Mixed} emptyText The empty text to set to the Field.
	 */
	setEmptyText : function( emptyText ) {
		emptyText = this.handleDateValue( emptyText );
		
		ui.formFields.DateTimeField.superclass.setEmptyText.call( this, emptyText );
	},
	
	
	/**
	 * Converts the given `value` to the appropriate value for the DateTimeField. If the special value "now" is provided, it will be replaced with the
	 * current date.
	 * 
	 * @private
	 * @method handleDateValue
	 * @param {String} value The value to convert if it is the string "now".
	 * @return {String}
	 */
	handleDateValue : function( value ) {		
		return ( value === "now" ) ? new Date() : value;
	},
	
	
	/**
	 * Destroys the jQuery datetimeEntry instance on the field upon field destruction.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		if( this.rendered ) {
			this.$inputEl.datetimeEntry( 'destroy' );
		}
		
		ui.formFields.DateTimeField.superclass.onDestroy.apply( this, arguments );
	}
	
} );


// Register the type so it can be created by the string 'Date' in the manifest
ui.ComponentManager.registerType( 'DateTime', ui.formFields.DateTimeField );
