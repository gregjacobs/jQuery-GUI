/**
 * @class Kevlar.data.Field
 * @extends Object
 * 
 * Field definition object for {@link Kevlar.data.Model Models}. The Field itself does not store data, but instead simply
 * defines the behaviors of a {@link Kevlar.data.Model Model's} fields.  A {@link Kevlar.data.Model Model} is made up of Fields. 
 * 
 * @constructor
 * @param {Object/String} config The field object's config, which is its definition. Can also be its field name provided directly as a string.
 */
/*global Kevlar */
Kevlar.data.Field = Kevlar.extend( Object, {
	
	/**
	 * @cfg {String} name (required)
	 * The name for the field, which is used by the owner Model to reference it.
	 */
	name : "",
	
	/**
	 * @cfg {String} type
	 * Currently unused, but specifies the type of the Field. In the future, this may be implemented to do type checking
	 * on field data.
	 * 
	 * This may be one of the following values:
	 * <ul>
	 *   <li>auto (default, no type checking is done)</li>
	 *   <li>int</li>
	 *   <li>float</li>
	 *   <li>string</li>
	 *   <li>boolean</li>
	 *   <li>date</li>
	 *   <li>object</li>
	 *   <li>array</li>
	 * </ul>
	 */
	
	/**
	 * @cfg {Mixed/Function} defaultValue
	 * The default value for the Field, if it has no value of its own. This can also be specified as the config 'default', 
	 * but must be wrapped in quotes as `default` is a reserved word in JavaScript.<br><br>
	 *
	 * If the defaultValue is a function, the function will be executed, and its return value used as the defaultValue.
	 */
	
	/**
	 * @cfg {Function} convert
	 * A function that can be used when the Field is created to convert its value. This function is passed two arguments:
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li>
	 *       <b>value</b> : Mixed
	 *       <div class="sub-desc">
	 *         The provided data value to the field. If the field had no initial data value, its {@link #defaultValue} will be provided. 
	 *         If it has no data, and no {@link #defaultValue}, it will be undefined.
	 *       </div>
	 *     </li>
	 *     <li>
	 *       <b>model</b> : Kevlar.data.Model
	 *       <div class="sub-desc">The Model instance that this Field belongs to.</div>
	 *     </li>
	 *   </ul>
	 * </div>
	 * 
	 * This function should return the value that the Field should hold. Ex:
	 * <pre><code>convert : function( value, model ) { return model.get( 'someOtherField' ) * value; }</code></pre>
	 * 
	 * Note that this function is called in the order of the field definitions, and doesn't resolve dependencies on the 'convert' of
	 * other fields, so keep this in mind.
	 */
	
	/**
	 * @cfg {Object} scope
	 * The scope to call the {@link #convert} function in. 
	 */
	
	/**
	 * @cfg {Boolean} persist
	 * True if the field should be persisted by its {@link Kevlar.data.Model Model} using the Model's {@link Kevlar.data.Model#proxy proxy}.
	 * Set to false to prevent the field from being persisted.
	 */
	persist : true,
	
	
	constructor : function( config ) {
		// If the argument wasn't an object, it must be its field name
		if( typeof config !== 'object' ) {
			config = { name: config };
		}
		
		// Copy members of the field definition (config) provided onto this object
		Kevlar.apply( this, config );
		
		
		// Each Field must have a name.
		var name = this.name;
		if( name === undefined || name === null || name === "" ) {
			throw new Error( "no 'name' property provided to Kevlar.data.Field constructor" );
			
		} else if( typeof this.name === 'number' ) {  // convert to a string if it is a number
			this.name = name.toString();
		}
		
		
		// Handle defaultValue
		if( this[ 'default' ] ) {  // accept the key as simply 'default'
			this.defaultValue = this[ 'default' ];
		}
		if( typeof this.defaultValue === "function" ) {
			this.defaultValue = this.defaultValue();
		}
		
		// If defaultValue is an object, recurse through it and execute any functions, using their return values as the defaults
		if( typeof this.defaultValue === 'object' ) {
			(function recurse( obj ) {
				for( var prop in obj ) {
					if( obj.hasOwnProperty( prop ) ) {
						if( typeof obj[ prop ] === 'function' ) {
							obj[ prop ] = obj[ prop ]();
						} else if( typeof obj[ prop ] === 'object' ) {
							recurse( obj[ prop ] );
						}
					}
				}
			})( this.defaultValue );
		}
		
	},
	
	
	/**
	 * Retrieves the name for the Field.
	 * 
	 * @method getName()
	 */
	getName : function() {
		return this.name;
	}
	
} );
