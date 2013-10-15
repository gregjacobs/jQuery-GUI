/*global define */
define( [
	'require',
	'gui/Component'  // loaded via require() call in the code below, as it is a circular dependency
], function( require ) {
	
	/**
	 * @class gui.ComponentManager
	 * @singleton
	 *
	 * Object used to manage {@link gui.Component} "types", and handles instantiating them based on the string that is specified
	 * for them in the manifest.
	 */
	var ComponentManager = {
		
		/**
		 * @private
		 * @property {Object} componentClasses
		 * 
		 * An Object (map) of the {@link gui.Component} classes which have been {@link #registerType registered}, 
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
		 * @param {String} type The type name of registered class.
		 * @param {Function} jsClass The class (constructor function) to register.
		 */
		registerType : function( type, jsClass ) {
			type = type.toLowerCase();
			
			if( !this.componentClasses[ type ] ) { 
				this.componentClasses[ type ] = jsClass;
			// <debug>
			} else {
				throw new Error( "Error: gui.ComponentManager already has a type '" + type + "'" );
			// </debug>
			}
		},
		
		
		/**
		 * Retrieves the Component class (constructor function) that has been registered by the supplied `type` name. 
		 * 
		 * @param {String} type The type name of the registered class.
		 * @return {Function} The class (constructor function) that has been registered under the given `type` name.
		 */
		getType : function( type ) {
			type = type.toLowerCase();
			
			// Note: special case for 'component', added to get around the RequireJS circular dependency issue where 
			// gui.Component can't register itself with the ComponentManager
			var jsClass = ( type === 'component' ) ? require( 'gui/Component' ) : this.componentClasses[ type ];
			
			// <debug>
			if( !jsClass ) 
				throw new Error( "The class with type name '" + type + "' has not been registered. Make sure that the component " +
				                 "exists, and has been 'required' by a RequireJS require() or define() call" );
			// </debug>
			
			return jsClass;
		},
		
		
		/**
		 * Determines if the ComponentManager has (i.e. can instantiate) a given `type`.
		 * 
		 * @param {String} type The type name to check for.
		 * @return {Boolean} `true` if the ComponentManager has the given type, `false` otherwise.
		 */
		hasType : function( type ) {
			if( !type ) {  // any falsy type value given, return false
				return false;
			} else {
				type = type.toLowerCase();
				
				// Note: special case for 'component', added to get around the RequireJS circular dependency issue where 
				// Component can't register itself with the ComponentManager
				return ( type === 'component' ) ? true : !!this.componentClasses[ type ];
			}
		},
		
		
		/**
		 * Creates (instantiates) a {@link gui.Component Component} based on its type name, given
		 * a configuration object that has a `type` property. If an already-instantiated 
		 * {@link gui.Component Component} is provided, it will simply be returned unchanged.
		 * 
		 * @param {Object} config The configuration object for the Component. Config objects should have the property `type`, 
		 *   which determines which type of {@link gui.Component Component} will be instantiated. If the object does not
		 *   have a `type` property, it will default to "container", which makes it simple to create things like tab containers. 
		 *   Note that already-instantiated {@link gui.Component Components} will simply be returned unchanged. 
		 * @return {gui.Component} The instantiated Component.
		 */
		create : function( config ) {
			var type = config.type ? config.type.toLowerCase() : undefined,
			    Component = require( 'gui/Component' );  // need to require here, as otherwise we'd have an unresolved circular dependency (gui.Component depends on gui.ComponentManager)
			
			if( config instanceof Component ) {
				// Already a Component instance, return it
				return config;
				
			} else if( type === 'component' ) {  // special case, added to get around the RequireJS circular dependency issue where Component can't register itself with the ComponentManager
				return new Component( config );
				
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