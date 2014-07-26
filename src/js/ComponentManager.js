/*global define */
define( function() {
	
	/**
	 * @class gui.ComponentManager
	 * @singleton
	 *
	 * Object used to manage {@link gui.Component} `type`s and instances. Performs the following tasks:
	 * 
	 * 1) Instantiates anonymous configuration objects with a `type` property into the appropriate {@link gui.Component}
	 *    subclass ({@link #create} method).
	 * 2) Maintains a map of Component's {@link gui.Component#elId element IDs} -> {@link gui.Component Component} instances,
	 *    which are registered when components are rendered.
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
		 * @private
		 * @property {Object} elementIdMap
		 * 
		 * An Object (map) of {@link gui.Component#elId Component element IDs} -> {@link gui.Component Component} instances,
		 * which are registered when each Component is {@link gui.Component#render rendered}.
		 */
		elementIdMap : {},
	   
	   
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
			var jsClass = this.componentClasses[ type ];
			
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
				return !!this.componentClasses[ type.toLowerCase() ];
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
			var type = config.type ? config.type.toLowerCase() : undefined;
			
			if( config.isGuiComponent ) {
				// Already a Component instance, return it
				return config;
				
			} else if( this.hasType( type || "container" ) ) {
				return new this.componentClasses[ type || "container" ]( config );
				
			} else {
				// No registered type with the given type, throw an error
				throw new Error( "ComponentManager.create(): Unknown type: '" + type + "'" );
			}
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Registers a {@link gui.Component Component's} element to be associated with the Component instance.
		 * Sets up a mapping by the Component's {@link gui.Component#elId element ID}, and is done when the
		 * Component is {@link gui.Component#render rendered}.
		 * 
		 * Note: This is used internally by the library, and shouldn't be called directly.
		 * 
		 * @param {String} elId The Component's {@link gui.Component#elId element ID}.
		 * @param {gui.Component} component The Component itself.
		 */
		registerComponentEl : function( elId, component ) {
			this.elementIdMap[ elId ] = component;
		},
		
		
		/**
		 * Unregisters a {@link gui.Component Component's} element from its association with its {@link gui.Component}
		 * instance. This is performed when a Component is destroyed.
		 * 
		 * Note: This is used internally by the library, and shouldn't be called directly.
		 * 
		 * @param {String} elId The Component's {@link gui.Component#elId element ID}.
		 */
		unregisterComponentEl : function( elId ) {
			delete this.elementIdMap[ elId ];
		},
		
		
		/**
		 * Retrieves a {@link gui.Component Component} instance by its {@link gui.Component#elId element ID}.
		 * 
		 * Note: This is used internally by the library (namely the {@link gui.ComponentDomDelegateHandler} class), 
		 * and shouldn't be called directly from code except for debugging purposes. Code that reverse-references a
		 * Component instance from an HTML element instead of simply being passed the Component reference will most
		 * likely be very difficult to understand, and maintain.
		 * 
		 * @param {String} elId The Component's {@link gui.Component#elId element ID}.
		 * @return {gui.Component} The Component instance that is mapped to the `elId`, or `null` if one was not found.
		 */
		getComponentByElId : function( elId ) {
			return this.elementIdMap[ elId ] || null;
		}
		
	};
	
	return ComponentManager;
	
} );