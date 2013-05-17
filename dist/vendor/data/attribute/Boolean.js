/*global define */
/*jshint eqnull:true */
define( [
	'lodash',
	'Class',
	'data/attribute/Attribute',
	'data/attribute/Primitive'
], function( _, Class, Attribute, PrimitiveAttribute ) {
	
	/**
	 * @class data.attribute.Boolean
	 * @extends data.attribute.Primitive
	 * 
	 * Attribute definition class for an Attribute that takes a boolean (i.e. true/false) data value.
	 */
	var BooleanAttribute = Class.extend( PrimitiveAttribute, {
		
		/**
		 * @cfg {Mixed/Function} defaultValue
		 * @inheritdoc
		 * 
		 * The Boolean Attribute defaults to `false`, unless the {@link #useNull} config is set to `true`, 
		 * in which case it defaults to `null` (to denote the Attribute being "unset").
		 */
		defaultValue: function() {
			return this.useNull ? null : false;
		},
		
		
		/**
		 * @cfg {Boolean} useNull
		 * 
		 * True to allow `null` to be set to the Attribute (which is usually used to denote that the 
		 * Attribute is "unset", and it shouldn't take an actual default value).
		 * 
		 * This is also used when parsing the provided value for the Attribute. If this config is true, and the value 
		 * cannot be "easily" parsed into a Boolean (i.e. if it's undefined, null, or an empty string), 
		 * `null` will be used instead of converting to `false`.
		 */
		
		
		/**
		 * Override of superclass method, which converts the provided data value into a Boolean. If {@link #useNull} is true, 
		 * "unparsable" values will return `null`. See {@link #useNull} for details.
		 * 
		 * @param {Mixed} value The value to convert.
		 * @return {Boolean} The converted value.
		 */
		convert : function( value ) {
			value = this._super( arguments );
			
			if( this.useNull && ( value == null || value === '' ) ) {
				return null;
			}
			return value === true || value === 'true' || value === 1 || value === "1";
		}
		
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'boolean', BooleanAttribute );
	Attribute.registerType( 'bool', BooleanAttribute );
	
	return BooleanAttribute;
	
} );