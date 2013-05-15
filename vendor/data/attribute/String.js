/*global define */
/*jshint eqnull:true */
define( [
	'lodash',
	'Class',
	'data/attribute/Attribute',
	'data/attribute/Primitive'
], function( _, Class, Attribute, PrimitiveAttribute ) {
	
	/**
	 * @class data.attribute.String
	 * @extends data.attribute.Primitive
	 * 
	 * Attribute definition class for an Attribute that takes a string data value.
	 */
	var StringAttribute = Class.extend( PrimitiveAttribute, {
		
		/**
		 * @cfg {Mixed/Function} defaultValue
		 * @inheritdoc
		 * 
		 * The String Attribute defaults to `""` (empty string), unless the {@link #useNull} config is 
		 * set to `true`, in which case it defaults to `null` (to denote the Attribute being "unset").
		 */
		defaultValue: function() {
			return this.useNull ? null : "";
		},
		
		
		/**
		 * @cfg {Boolean} useNull
		 * True to allow `null` to be set to the Attribute (which is usually used to denote that the 
		 * Attribute is "unset", and it shouldn't take an actual default value).
		 * 
		 * This is also used when parsing the provided value for the Attribute. If this config is true, and the value 
		 * cannot be "easily" parsed into a String (i.e. if it's undefined, or null), `null` will be used 
		 * instead of converting to an empty string.
		 */
		
		
		/**
		 * Override of superclass method used to convert the value into a string. If {@link #useNull} is true, "unparsable" values
		 * will return null. See {@link #useNull} for details.
		 * 
		 * @param {Mixed} value The value to convert.
		 * @return {String}
		 */
		convert : function( value ) {
			value = this._super( arguments );
			
			var defaultValue = ( this.useNull ) ? null : "";
			return ( value == null ) ? defaultValue : String( value );
		}
		
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'string', StringAttribute );
	
	return StringAttribute;
	
} );