/*global define */
define( [
	'lodash',
	'Class'
], function( _, Class ) {
	
	/**
	 * @abstract
	 * @class data.attribute.Attribute
	 * @extends Object
	 * 
	 * Base attribute definition class for {@link data.Model Models}. The Attribute itself does not store data, but instead simply
	 * defines the behavior of a {@link data.Model Model's} attributes. A {@link data.Model Model} is made up of Attributes. 
	 * 
	 * Note: You will most likely not instantiate Attribute objects directly. This is used by {@link data.Model} with its
	 * {@link data.Model#cfg-attributes attributes} prototype config. Anonymous config objects provided to {@link data.Model#cfg-attributes attributes}
	 * will be passed to the Attribute constructor.
	 */
	var Attribute = Class.extend( Object, {
		abstractClass: true,
		
		
		statics : {
			
			/**
			 * An object (hashmap) which stores the registered Attribute types. It maps type names to Attribute subclasses.
			 * 
			 * @private
			 * @static
			 * @property {Object} attributeTypes
			 */
			attributeTypes : {},
			
			
			/**
			 * Static method to instantiate the appropriate Attribute subclass based on a configuration object, based on its `type` property.
			 * 
			 * @static
			 * @method create
			 * @param {Object} config The configuration object for the Attribute. Config objects should have the property `type`, 
			 *   which determines which type of Attribute will be instantiated. If the object does not have a `type` property, it will default 
			 *   to `mixed`, which accepts any data type, but does not provide any type checking / data consistency. Note that already-instantiated 
			 *   Attributes will simply be returned unchanged. 
			 * @return {data.attribute.Attribute} The instantiated Attribute.
			 */
			create : function( config ) {
				var type = config.type ? config.type.toLowerCase() : undefined;
			
				if( config instanceof Attribute ) {
					// Already an Attribute instance, return it
					return config;
					
				} else if( this.hasType( type || "mixed" ) ) {
					return new this.attributeTypes[ type || "mixed" ]( config );
					
				} else {
					// No registered type with the given config's `type`, throw an error
					throw new Error( "data.attribute.Attribute: Unknown Attribute type: '" + type + "'" );
				}
			},
			
			
			/**
			 * Static method used to register implementation Attribute subclass types. When creating an Attribute subclass, it 
			 * should be registered with the Attribute superclass (this class), so that it can be instantiated by a string `type` 
			 * name in an anonymous configuration object. Note that type names are case-insensitive.
			 * 
			 * This method will throw an error if a type name is already registered, to assist in making sure that we don't get
			 * unexpected behavior from a type name being overwritten.
			 * 
			 * @static
			 * @method registerType
			 * @param {String} typeName The type name of the registered class. Note that this is case-insensitive.
			 * @param {Function} jsClass The Attribute subclass (constructor function) to register.
			 */
			registerType : function( type, jsClass ) {
				type = type.toLowerCase();
				
				if( !this.attributeTypes[ type ] ) { 
					this.attributeTypes[ type ] = jsClass;
				} else {
					throw new Error( "Error: Attribute type '" + type + "' already exists" );
				}
			},
			
			
			/**
			 * Retrieves the Component class (constructor function) that has been registered by the supplied `type` name. 
			 * 
			 * @method getType
			 * @param {String} type The type name of the registered class.
			 * @return {Function} The class (constructor function) that has been registered under the given type name.
			 */
			getType : function( type ) {
				return this.attributeTypes[ type.toLowerCase() ];
			},
			
			
			/**
			 * Determines if there is a registered Attribute type with the given `typeName`.
			 * 
			 * @method hasType
			 * @param {String} typeName
			 * @return {Boolean}
			 */
			hasType : function( typeName ) {
				if( !typeName ) {  // any falsy type value given, return false
					return false;
				} else {
					return !!this.attributeTypes[ typeName.toLowerCase() ];
				}
			}
			
		}, // end statics
		
		
		// -------------------------------------
		
		
		/**
		 * @cfg {String} name (required)
		 * The name for the attribute, which is used by the owner Model to reference it.
		 */
		name : "",
		
		/**
		 * @cfg {String} type
		 * Specifies the type of the Attribute, in which a conversion of the raw data will be performed.
		 * This accepts the following general types, but custom types may be added using the {@link data.attribute.Attribute#registerType} method.
		 * 
		 * - {@link data.attribute.Mixed mixed}: Performs no conversions, and no special processing of given values. This is the default Attribute type (not recommended).
		 * - {@link data.attribute.String string}
		 * - {@link data.attribute.Integer int} / {@link data.attribute.Integer integer}
		 * - {@link data.attribute.Float float} (really a "double")
		 * - {@link data.attribute.Boolean boolean} / {@link data.attribute.Boolean bool}
		 * - {@link data.attribute.Date date}
		 * - {@link data.attribute.Model model}
		 * - {@link data.attribute.Collection collection}
		 */
		
		/**
		 * @cfg {Mixed/Function} defaultValue
		 * 
		 * The default value to set to the Attribute, when the Attribute is given no initial value.
		 *
		 * If the `defaultValue` is a function, the function will be executed each time a {@link data.Model Model} is created, and its return 
		 * value is used as the `defaultValue`. This is useful, for example, to assign a new unique number to an attribute of a {@link data.Model Model}. 
		 * Ex:
		 * 
		 *     require( [
		 *         'lodash',   // assuming Lo-Dash (or alternatively, Underscore.js) is available
		 *         'data/Model'
		 *     ], function( _, Model ) {
		 *     
		 *         MyModel = Model.extend( {
		 *             attributes : [
		 *                 {
		 *                     name: 'uniqueId', 
		 *                     defaultValue: function() {
		 *                         return _.uniqueId();
		 *                     }
		 *                 }
		 *             ]
		 *         } );
		 *     
		 *     } );
		 * 
		 * Note that the function is called in the scope of the Attribute, which may be used to read the Attribute's own properties/configs,
		 * or call its methods.
		 */
		
		/**
		 * @cfg {Function} set
		 * 
		 * A function that can be used to implement any custom processing needed to convert the raw value provided to the attribute to 
		 * the value which will ultimately be stored on the {@link data.Model Model}. Only provide this config if you want to override
		 * the default {@link #convert} function which is used by the Attribute (or Attribute subclass). 
		 * 
		 * This function is passed the following arguments:
		 * 
		 * - **model** : {@link data.Model}
		 *   
		 *   The Model for which a value to the Attribute is being set.
		 *   
		 * - **newValue** : Mixed
		 *   
		 *   The provided new data value to the attribute. If the attribute has no initial data value, its {@link #defaultValue}
		 *   will be provided to this argument upon instantiation of the {@link data.Model Model}.
		 *   
		 * - **oldValue** : Mixed
		 *   
		 *   The old value that the attribute held (if any).
		 * 
		 * 
		 * The function should do any processing that is necessary, and return the value that the Model should hold for the value. 
		 * For example, this `set` function will convert a string value to a JavaScript
		 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date" target="_blank">Date</a>
		 * object. Otherwise, it will return the value unchanged:
		 * 
		 *     {
		 *         name : 'myDateAttr',
		 *         
		 *         set : function( model, newValue, oldValue ) {
		 *             if( typeof newValue === 'string' ) {
		 *                 newValue = new Date( newValue );
		 *             }
		 *             return newValue;
		 *         }
		 *     }
		 * 
		 * If you are using an Attribute subclass (such as the {@link data.attribute.String StringAttribute}), and you want to call the
		 * original {@link #convert} function that is defined, as well as add your own conversion processing, you can do so by simply
		 * calling `this.convert( newValue )` in your `set` function. Ex:
		 * 
		 *     {
		 *         name : 'trimmedName',
		 *         type : 'string',
		 *         
		 *         set : function( model, newValue ) {
		 *             newValue = this.convert( newValue );  // make sure it's been converted to a string, using all of the rules defined in the StringAttribute
		 *             
		 *             return ( newValue.length > 50 ) ? newValue.substr( 0, 47 ) + '...' : newValue;   // this would most likely be a View detail in a real application, but demonstrates the capability
		 *         }
		 *     }
		 * 
		 * 
		 * ## Computed Attributes
		 * 
		 * The `set` function can also be used to set other attributes of a "computed" attribute. Ex:
		 * 
		 *     {
		 *         // A "computed" attribute which combines the 'firstName' and 'lastName' attributes in this model 
		 *         // (assuming they are there)
		 *         name : 'fullName',
		 *         
		 *         set : function( model, newValue, oldValue ) {
		 *             // Setter which takes the first and last name given (such as "John Smith"), and splits them up into 
		 *             // their appropriate parts, to set the appropriate "source" attributes for the computed attribute.
		 *             var names = newValue.split( ' ' );  // split on the space between first and last name
		 *             
		 *             model.set( 'firstName', names[ 0 ] );
		 *             model.set( 'lastName', names[ 1 ] );
		 *         },
		 * 
		 *         get : function( model, value ) {
		 *             // Combine firstName and lastName "source" attributes for the computed attribute's return
		 *             return model.get( 'firstName' ) + " " + model.get( 'lastName' );
		 *         }
		 *     }
		 * 
		 * For the general case of querying other Attributes for their value, be careful in that they may not be set to the expected value 
		 * when this `set` function executes. For creating computed Attributes that rely on other Attributes' values, use a {@link #cfg-get} 
		 * function instead.
		 * 
		 * ## Notes:
		 * 
		 * - Both a `set` and a {@link #get} function can be used in conjunction.
		 * - The `set` function is called upon instantiation of the {@link data.Model Model} if the Model is passed an initial value
		 *   for the Attribute, or if the Attribute has a {@link #defaultValue}.
		 * - The `set` function is called in the scope of the Attribute, so any properties or methods of the Attribute may be referenced.
		 */
		
		/**
		 * @cfg {Function} get
		 * 
		 * A function that can be used to convert the stored value that is held by a Model, when the Model's {@link data.Model#get get} 
		 * method is called for the Attribute. This is useful to create "computed" attributes, which may be created based on other 
		 * Attributes' values. The function is passed the argument of the underlying stored value, and should return the computed value.
		 * 
		 * This function is passed the following arguments:
		 * 
		 * - **model** : {@link data.Model}
		 * 
		 *   The Model for which the value of the Attribute is being retrieved.
		 *   
		 * - **value** : Mixed
		 *   
		 *   The value that the Attribute currently has stored in the {@link data.Model Model}.
		 *
		 * 
		 * For example, if we had a {@link data.Model Model} with `firstName` and `lastName` Attributes, and we wanted to create a `fullName` 
		 * Attribute, this could be done as in the example below.
		 * 
		 *     {
		 *         name : 'fullName',
		 *         
		 *         get : function( model, value ) {  // in this example, the Attribute has no value of its own, so we ignore the `value` arg
		 *             return model.get( 'firstName' ) + " " + model.get( 'lastName' );
		 *         }
		 *     }
		 * 
		 * ## Notes:
		 * 
		 * - Both a `set` and a {@link #get} function can be used in conjunction.
		 * - If the intention is to convert a provided value which needs to be stored on the {@link data.Model Model} in a different way,
		 *   use a {@link #cfg-set} function instead. 
		 * - The `get` function is called in the scope of the Attribute, so any properties or methods of the Attribute may be referenced.
		 */
		
		/**
		 * @cfg {Function} raw
		 * 
		 * A function that can be used to convert an Attribute's value to a raw representation, usually for persisting data on a server.
		 * This function is automatically called (if it exists) when a persistence {@link data.persistence.proxy.Proxy proxy} is collecting
		 * the data to send to the server. The function is passed two arguments, and should return the raw value.
		 * 
		 * @cfg {data.Model} raw.model The Model instance that this Attribute belongs to.
		 * @cfg {Mixed} raw.value The underlying value that the Attribute currently has stored in the {@link data.Model Model}.
		 * 
		 * For example, a Date object is normally converted to JSON with both its date and time components in a serialized string (such
		 * as "2012-01-26T01:20:54.619Z"). To instead persist the Date in m/d/yyyy format, one could create an Attribute such as this:
		 * 
		 *     {
		 *         name : 'eventDate',
		 *         
		 *         set : function( model, value ) { return new Date( value ); },  // so the value is stored as a Date object when used client-side
		 *         raw : function( model, value ) {
		 *             return (value.getMonth()+1) + '/' + value.getDate() + '/' + value.getFullYear();  // m/d/yyyy format 
		 *         }
		 *     }
		 * 
		 * The value that this function returns is the value that is used when the Model's {@link data.Model#raw raw} method is called
		 * on the Attribute.
		 * 
		 * This function is called in the scope of the Attribute, so any properties or methods of the Attribute may be referenced.
		 */
		
		/**
		 * @cfg {Boolean} persist
		 * True if the attribute should be persisted by its {@link data.Model Model} using the Model's {@link data.Model#proxy proxy}.
		 * Set to false to prevent the attribute from being persisted.
		 */
		persist : true,
		
		
		
		/**
		 * Creates a new Attribute instance. Note: You will normally not be using this constructor function, as this class
		 * is only used internally by {@link data.Model}.
		 * 
		 * @constructor 
		 * @param {Object/String} config An Object (map) of the Attribute object's configuration options, which is its definition. 
		 *   Can also be its Attribute {@link #name} provided directly as a string.
		 */
		constructor : function( config ) {
			// If the argument wasn't an object, it must be its attribute name
			if( typeof config !== 'object' ) {
				config = { name: config };
			}
			
			// Copy members of the attribute definition (config) provided onto this object
			_.assign( this, config );
			
			
			// Each Attribute must have a name.
			var name = this.name;
			if( name === undefined || name === null || name === "" ) {
				throw new Error( "no 'name' property provided to data.attribute.Attribute constructor" );
				
			} else if( typeof this.name === 'number' ) {  // convert to a string if it is a number
				this.name = name.toString();
			}
		},
		
		
		/**
		 * Retrieves the name for the Attribute.
		 * 
		 * @return {String}
		 */
		getName : function() {
			return this.name;
		},
		
		
		/**
		 * Retrieves the default value for the Attribute.
		 * 
		 * @return {Mixed}
		 */
		getDefaultValue : function() {
			var defaultValue = this.defaultValue;
			
			if( typeof defaultValue === "function" ) {
				// If the default value is a factory function, execute it and use its return value
				defaultValue = defaultValue.call( this );  // call the function in the scope of this Attribute object
				
			} else if( _.isPlainObject( defaultValue ) ) {
				// If defaultValue is an anonymous object, clone it, to not edit the original object structure
				defaultValue = _.cloneDeep( defaultValue );
			}
			
			return defaultValue;
		},
		
		
		
		/**
		 * Determines if the Attribute should be persisted.
		 * 
		 * @return {Boolean}
		 */
		isPersisted : function() {
			return this.persist;
		},
		
		
		/**
		 * Determines if the Attribute has a user-defined setter (i.e. the {@link #cfg-set set} config was provided).
		 * 
		 * @return {Boolean} True if the Attribute was provided a user-defined {@link #cfg-set set} function. 
		 */
		hasUserDefinedSetter : function() {
			return this.hasOwnProperty( 'set' );
		},
		
		
		/**
		 * Determines if the Attribute has a user-defined getter (i.e. the {@link #cfg-get get} config was provided).
		 * 
		 * @return {Boolean} True if the Attribute was provided a user-defined {@link #cfg-get get} function. 
		 */
		hasUserDefinedGetter : function() {
			return this.hasOwnProperty( 'get' );
		},
		
		
		// ---------------------------
		
		
		/**
		 * Allows the Attribute to determine if two values of its data type are equal, and the model
		 * should consider itself as "changed". This method is passed the "old" value and the "new" value
		 * when a value is {@link data.Model#set set} to the Model, and if this method returns `false`, the
		 * new value is taken as a "change".
		 * 
		 * This may be overridden by subclasses to provide custom comparisons, but the default implementation is
		 * to directly compare primitives, and deep compare arrays and objects.
		 * 
		 * @param {Mixed} oldValue
		 * @param {Mixed} newValue
		 * @return {Boolean} True if the values are equal, and the Model should *not* consider the new value as a 
		 *   change of the old value, or false if the values are different, and the new value should be taken as a change.
		 */
		valuesAreEqual : function( oldValue, newValue ) {
			return _.isEqual( oldValue, newValue );
		},
		
		
		// ---------------------------
		
		
		/**
		 * Implements the conversion function, if any, for the Attribute or Attribute subclass. By default, this method
		 * simply returns the value unchanged, but subclasses override this to implement their specific data 
		 * conversions.
		 * 
		 * This method is automatically called by the {@link #method-set set method}, unless a {@link #cfg-set set config} 
		 * has been provided to override it. This method may still be called from within a provided {@link #cfg-set set config}
		 * function however, by simply calling `this.convert( newValue )`.
		 * 
		 * @param {Mixed} value The value to convert.
		 * @return {Mixed} The converted value.
		 */
		convert : function( value ) {
			return value;
		},
		
		
		/**
		 * Method that allows for processing the value that is to be stored for this Attribute on a {@link data.Model}. This method,
		 * by default, calls the {@link #convert} method to do any necessary conversion for the value, dependent on the particular
		 * Attribute subclass in use. However, this method may be overridden by providing a {@link #cfg-set set config}.
		 * 
		 * @param {data.Model} model The Model instance that is providing the value.
		 * @param {Mixed} newValue The new value, which was provided to the Model's {@link data.Model#set set} method.
		 * @param {Mixed} oldValue The old (previous) value that the {@link data.Model Model} held.
		 */
		set : function( model, newValue, oldValue ) {
			return this.convert( newValue );
		},
		
		
		/**
		 * Method that allows for post-processing of the value that is to be set to the {@link data.Model}.
		 * This method is executed after the {@link #method-set set method} (or {@link #cfg-set set config} function, if one was
		 * provided). The `value` provided to this method is the value that has been already processed by {@link #method-set}. 
		 * 
		 * The return value from this method will be the value that is ultimately set as the data for the Attribute on the 
		 * {@link data.Model Model}.
		 * 
		 * Note that the default implementation simply returns the value unchanged, but this may be overridden
		 * in subclasses to provide a post-processing conversion or type check.
		 * 
		 * @param {data.Model} model The Model instance that is providing the value. This is normally not used,
		 *   but is provided in case any model processing is needed.
		 * @param {Mixed} value The value provided to the {@link data.Model#set} method, after it has been processed by either
		 *   the {@link #method-set set method} or any provided {@link #cfg-set set config} function.
		 * @return {Mixed} The converted value.
		 */
		afterSet : function( model, value ) {
			return value;
		}
		
	} );
	
	
	return Attribute;
	
} );
