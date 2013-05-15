/*global define */
define( [
	'lodash',
	'Class',
	'data/attribute/Attribute',
	'data/attribute/Object'
], function( _, Class, Attribute, ObjectAttribute ) {
	
	/**
	 * @class data.attribute.Date
	 * @extends data.attribute.Object
	 * 
	 * Attribute definition class for an Attribute that takes a JavaScript Date object.
	 */
	var DateAttribute = Class.extend( ObjectAttribute, {
		
		/**
		 * Override of superclass method used to convert the provided data value into a JavaScript Date object. If the value provided 
		 * is not a Date, or cannot be parsed into a Date, will return `null`.
		 * 
		 * @param {Mixed} value The value to convert.
		 * @return {Date} The Date object, or `null` if the value could not be parsed into a Date.
		 */
		convert : function( value ) {
			if( _.isDate( value ) ) {
				return value;
			}
			if( _.isNumber( value ) || ( _.isString( value ) && value && !isNaN( +value ) ) ) {
				return new Date( +value );  // If the date is a number (or a number in a string), assume it's the number of milliseconds since the Unix epoch (1/1/1970)
			}
			
			// All else fails, try to parse the value using Date.parse
			var parsed = Date.parse( value );
			return ( parsed ) ? new Date( parsed ) : null;
		}
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'date', DateAttribute );
	
	return DateAttribute;
	
} );