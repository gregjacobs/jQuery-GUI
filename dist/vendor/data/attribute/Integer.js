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
		 * Converts the provided data value into an integer. If {@link #useNull} is true, undefined/null/empty string 
		 * values will return null, or else will otherwise be converted to 0. If the number is simply not parsable, will 
		 * return NaN. 
		 * 
		 * This method will strip off any decimal value from a provided number.
		 * 
		 * @method beforeSet
		 * @param {data.Model} model The Model instance that is providing the value. This is normally not used,
		 *   but is provided in case any model processing is needed.
		 * @param {Mixed} newValue The new value provided to the {@link data.Model#set} method.
		 * @param {Mixed} oldValue The old (previous) value that the model held (if any).
		 * @return {Boolean} The converted value.
		 */
		beforeSet : function( model, newValue, oldValue ) {
			var defaultValue = ( this.useNull ) ? null : 0;
			return ( newValue !== undefined && newValue !== null && newValue !== '' ) ? parseInt( String( newValue ).replace( this.stripCharsRegex, '' ), 10 ) : defaultValue;
		}
		
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'int', IntegerAttribute );
	Attribute.registerType( 'integer', IntegerAttribute );
	
	
	return IntegerAttribute;
	
} );