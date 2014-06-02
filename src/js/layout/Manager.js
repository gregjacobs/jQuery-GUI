/*global define */
define( [
	'lodash'
], function( _ ) {
	
	/**
	 * @class gui.layout.Manager
	 * @singleton
	 *
	 * Object used to manage {@link gui.layout.Layout} "types", and handles instantiating them based on the `type` string that 
	 * is registered for them.
	 */
	var LayoutManager = {
		
		/**
		 * @private
		 * @property {Object} layoutClasses
		 * 
		 * An Object (map) of the {@link gui.layout.Layout} classes which have been {@link #registerType registered}, 
		 * keyed by their type name.
		 */
		layoutClasses : {},
		
	   
		/**
		 * Registers a {@link gui.layout.Layout Layout}, allowing {@link #layout layouts} to be specified by their string `type` name.
		 * 
		 * This method will throw an error if a type name is already registered, to assist in making sure that we don't get
		 * unexpected behavior from a type name being overwritten.
		 *
		 * @param {String} typeName The type name for the Layout.
		 * @param {Function} layoutClass A {@link gui.layout.Layout} subclass.
		 */
		registerType : function( typeName, jsClass ) {
			typeName = typeName.toLowerCase();
			
			if( !this.layoutClasses[ typeName ] ) { 
				this.layoutClasses[ typeName ] = jsClass;
			// <debug>
			} else {
				throw new Error( "Error: gui.layout.Manager already has a type '" + typeName + "'" );
			// </debug>
			}
		},
		
		
		/**
		 * Retrieves the {@link gui.layout.Layout} class (constructor function) that has been registered by the supplied `type` name. 
		 * 
		 * @param {String} typeName The type name that the layout was registered with. This is case-insensitive.
		 * @return {Function} The {@link gui.layout.Layout Layout} that was registered with the given `typeName`.
		 */
		getType : function( typeName ) {
			typeName = typeName.toLowerCase();
			var jsClass = this.layoutClasses[ typeName ];
			
			// <debug>
			if( !jsClass ) 
				throw new Error( "The layout class with type name '" + typeName + "' has not been registered. Make sure that the layout " +
				                 "exists, and has been 'required' by a RequireJS require() or define() call" );
			// </debug>
			
			return jsClass;
		},
		
		
		/**
		 * Determines if the LayoutManager has (i.e. can instantiate) a given `type`.
		 * 
		 * @param {String} typeName The type name to check for.
		 * @return {Boolean} `true` if the LayoutManager has the given type, `false` otherwise.
		 */
		hasType : function( typeName ) {
			if( !typeName ) {  // any falsy type value given, return false
				return false;
			} else {
				return !!this.layoutClasses[ typeName.toLowerCase() ];
			}
		},
		
		
		/**
		 * Creates (instantiates) a {@link gui.layout.Layout Layout} based on its type name, given a configuration object that 
		 * has a `type` property. If an already-instantiated {@link gui.layout.Layout Layout} is provided, it will simply be 
		 * returned unchanged.
		 * 
		 * @param {Object/gui.layout.Layout} config The configuration object for the Layout. Config objects should have the property `type`, 
		 *   which determines which type of {@link gui.layout.Layout Layout} that will be instantiated. If the object does not
		 *   have a `type` property, it will default to instantiating an {@link gui.layout.Auto AutoLayout}. 
		 *   Note that already-instantiated {@link gui.layout.Layout Layouts} will simply be returned unchanged. 
		 * @return {gui.layout.Layout} The instantiated Layout.
		 */
		create : function( layoutCfg ) {
			if( layoutCfg && layoutCfg.isGuiLayout ) {
				// The layout is already a gui.layout.Layout instance
				return layoutCfg;
	
			} else {
				// The `layoutCfg` is a string or layoutCfg object
				var layoutTypeName;
	
				if( typeof layoutCfg === 'string' ) {
					layoutTypeName = layoutCfg;
	
				} else if( typeof layoutCfg === 'object' ) {  // config object
					layoutTypeName = ( layoutCfg.type || 'auto' ).toLowerCase();   // default to 'auto' layout
					
					layoutCfg = _.clone( layoutCfg );
					delete layoutCfg.type;  // remove the 'type' property from the config object now, as to not shadow the Layout object's prototype 'type' property when applied
	
				} else {
					// Not a gui.layout.Layout, String, or Object...
					throw new Error( "Invalid layout argument provided to setLayout. See method description in docs." );
				}

				// Create the layout strategy object from its type name if all is well
				var LayoutClass = this.getType( layoutTypeName );
				return new LayoutClass( layoutCfg );
			}
		}
		
	};
	
	
	return LayoutManager;
	
} );