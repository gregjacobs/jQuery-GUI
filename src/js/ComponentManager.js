/*global define */
define( [
	'require'
], function( require ) {
	
	/**
	 * @class ui.ComponentManager
	 *
	 * Object used to manage {@link ui.Component} "types", and handles instantiating them based on the string that is specified
	 * for them in the manifest.  
	 *
	 * @singleton
	 */
	var ComponentManager = {
		
		/**
		 * @private
		 * @property {Object} componentClasses
		 * 
		 * An Object (map) of the {@link ui.Component} classes which have been {@link #registerType registered}, 
		 * keyed by their type name. 
		 */
		componentClasses : {},
	   
	   
		/**
		 * Registers a given class with a `type` name. This is used to map the type names specified in Bit manifests
		 * to the class that should be instantiated.  Note that type names are case-insensitive.
		 * 
		 * This method will throw an error if a type name is already registered, to assist in making sure that we don't get
		 * unexpected behavior from a type name being overwritten.
		 * 
		 * @method registerType
		 * @param {String} type The type name of registered class.
		 * @param {Function} jsClass The class (constructor function) to register.
		 */
		registerType : function( type, jsClass ) {
			type = type.toLowerCase();
			
			if( !this.componentClasses[ type ] ) { 
				this.componentClasses[ type ] = jsClass;
			} else {
				throw new Error( "Error: ui.ComponentManager already has a type '" + type + "'" );
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
			return this.componentClasses[ type.toLowerCase() ];
		},
		
		
		/**
		 * Determines if the ComponentManager has (i.e. can instantiate) a given `type`.
		 * 
		 * @method hasType
		 * @param {String} type
		 * @return {Boolean} True if the ComponentManager has the given type.
		 */
		hasType : function( type ) {
			if( !type ) {  // any falsy type value given, return false
				return false;
			} else {
				return !!this.componentClasses[ type.toLowerCase() ];
			}
		},
		
		
		/**
		 * Creates (instantiates) a {@link ui.Component Component} based on its type name, given
		 * a configuration object that has a `type` property. If an already-instantiated 
		 * {@link ui.Component Component} is provided, it will simply be returned unchanged.
		 * 
		 * @method create
		 * @param {Object} config The configuration object for the Component. Config objects should have the property `type`, 
		 *   which determines which type of {@link ui.Component Component} will be instantiated. If the object does not
		 *   have a `type` property, it will default to "container", which makes it simple to create things like tab containers. 
		 *   Note that already-instantiated {@link ui.Component Components} will simply be returned unchanged. 
		 * @return {ui.Component} The instantiated Component.
		 */
		create : function( config ) {
			var type = config.type ? config.type.toLowerCase() : undefined,
			    Component = require( 'ui/Component' );  // need to require here, as otherwise we'd have an unresolved circular dependency (ui.Component depends on ui.ComponentManager)
			
			if( config instanceof Component ) {
				// Already a Component instance, return it
				return config;
				
			} else if( this.hasType( type || "container" ) ) {
				return new this.componentClasses[ type || "container" ]( config );
				
			} else {
				// No registered type with the given type, throw an error
				throw new Error( "ComponentManager.create(): Unknown type: '" + type + "'" );
			}
		}
		
	};
	
	return ComponentManager;
	
} );