/*global define */
define( [
	'lodash',
	'Class',
	'data/attribute/Attribute'
], function( _, Class, Attribute ) {
	
	/**
	 * @class data.attribute.Mixed
	 * @extends data.attribute.Attribute
	 * 
	 * Attribute definition class for an Attribute that takes any data value.
	 */
	var MixedAttribute = Class.extend( Attribute, {
			
		// No specific implementation at this time. All handled by the base class Attribute.
		
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'mixed', MixedAttribute );
	
	return MixedAttribute;
	
} );