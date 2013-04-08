/*global define */
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
		defaultValue: function( attribute ) {
			return attribute.useNull ? null : "";
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
		 * Converts the provided data value into a Boolean. If {@link #useNull} is true, "unparsable" values
		 * will return null. 
		 * 
		 * @method beforeSet
		 * @param {data.Model} model The Model instance that is providing the value. This is normally not used,
		 *   but is provided in case any model processing is needed.
		 * @param {Mixed} newValue The new value provided to the {@link data.Model#set} method.
		 * @param {Mixed} oldValue The old (previous) value that the model held (if any).
		 * @return {Boolean} The converted value.
		 */
		beforeSet : function( model, newValue, oldValue ) {
			var defaultValue = ( this.useNull ) ? null : "";
			return ( newValue === undefined || newValue === null ) ? defaultValue : String( newValue );
		}
		
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'string', StringAttribute );
	
	return StringAttribute;
	
} );