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
		 * Overridden `beforeSet` method used to normalize the value provided. All non-object values are converted to null,
		 * while object values are returned unchanged.
		 * 
		 * @inheritdoc
		 */
		beforeSet : function( model, newValue, oldValue ) {
			if( typeof newValue !== 'object' ) {
				newValue = null;  // convert all non-object values to null
			}
			
			return newValue;
		}
		
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'object', ObjectAttribute );
	
	return ObjectAttribute;
	
} );