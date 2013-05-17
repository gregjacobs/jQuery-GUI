/*global define */
define( [
	'lodash',
	'Class',
	'data/attribute/Attribute',
	'data/attribute/Number'
], function( _, Class, Attribute, NumberAttribute ) {
	
	/**
	 * @class data.attribute.Integer
	 * @extends data.attribute.Number
	 * 
	 * Attribute definition class for an Attribute that takes an integer data value. If a decimal
	 * number is provided (i.e. a "float"), the decimal will be ignored, and only the integer value used.
	 */
	var IntegerAttribute = Class.extend( NumberAttribute, {
		
		/**
		 * Override of superclass method used to convert the provided data value into an integer. If {@link #useNull} is true, 
		 * undefined/null/empty string values will return `null`, or else will otherwise be converted to 0. If the number is simply 
		 * not parsable, will return NaN. 
		 * 
		 * @param {Mixed} value The value to convert.
		 * @return {Number} The converted value.
		 */
		convert : function( value ) {
			value = this._super( arguments );
			
			var defaultValue = ( this.useNull ) ? null : 0;
			return ( value !== undefined && value !== null && value !== '' ) ? parseInt( String( value ).replace( this.stripCharsRegex, '' ), 10 ) : defaultValue;
		}
		
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'int', IntegerAttribute );
	Attribute.registerType( 'integer', IntegerAttribute );
	
	return IntegerAttribute;
	
} );