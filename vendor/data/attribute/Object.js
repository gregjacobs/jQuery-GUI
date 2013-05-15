/*global define */
define( [
	'lodash',
	'Class',
	'data/attribute/Attribute'
], function( _, Class, Attribute ) {
	
	/**
	 * @class data.attribute.Object
	 * @extends data.attribute.Attribute
	 * 
	 * Attribute definition class for an Attribute that takes an object value.
	 */
	var ObjectAttribute = Class.extend( Attribute, {
		
		/**
		 * @cfg {Object} defaultValue
		 * @inheritdoc
		 */
		defaultValue : null,
		
		
		/**
		 * Override of superclass method used to normalize the provided `value`. All non-object values are converted to `null`,
		 * while object values are returned unchanged.
		 * 
		 * @param {Mixed} value The value to convert.
		 * @return {Object}
		 */
		convert : function( value ) {
			value = this._super( arguments );
			
			if( typeof value !== 'object' ) {
				value = null;  // convert all non-object values to null
			}
			
			return value;
		}
		
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'object', ObjectAttribute );
	
	return ObjectAttribute;
	
} );