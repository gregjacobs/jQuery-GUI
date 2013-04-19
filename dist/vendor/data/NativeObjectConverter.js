/*global define */
define( [
	'require',
	'lodash',
	'data/DataComponent',
	'data/Collection',  // circular dependency, not included in args list
	'data/Model'        // circular dependency, not included in args list
], function( require, _, DataComponent ) {
	
	/**
	 * @private
	 * @class data.NativeObjectConverter
	 * @singleton
	 * 
	 * NativeObjectConverter allows for the conversion of {@link data.Collection Collection} / {@link data.Model Models}
	 * to their native Array / Object representations, while dealing with circular dependencies.
	 */
	var NativeObjectConverter = {
		
		/**
		 * Converts a {@link data.Collection Collection} or {@link data.Model} to its native Array/Object representation,
		 * while dealing with circular dependencies.
		 *  
		 * @param {data.Collection/data.Model} A Collection or Model to convert to its native Array/Object representation.
		 * @param {Object} [options] An object (hashmap) of options to change the behavior of this method. This may include:
		 * @param {String[]} [options.attributeNames] In the case that a {@link data.Model Model} is provided to this method, this
		 *   may be an array of the attribute names that should be returned in the output object.  Other attributes will not be processed.
		 *   (Note: only affects the Model passed to this method, and not nested models.)
		 * @param {Boolean} [options.persistedOnly] True to have the method only return data for the persisted attributes on
		 *   Models (i.e. attributes with the {@link data.attribute.Attribute#persist persist} config set to true, which is the default).
		 * @param {Boolean} [options.raw] True to have the method only return the raw data for the attributes, by way of the {@link data.Model#raw} method. 
		 *   This is used for persistence, where the raw data values go to the server rather than higher-level objects, or where some kind of serialization
		 *   to a string must take place before persistence (such as for Date objects). 
		 *   
		 *   As a hack (unfortunately, due to limited time), if passing the 'raw' option as true, and a nested {@link data.Collection Collection} is in a 
		 *   {@link data.attribute.Collection} that is *not* {@link data.attribute.Collection#embedded}, then only an array of the 
		 *   {@link data.Model#idAttribute ID attribute} values is returned for that collection. The final data for a related (i.e. non-embedded) nested
		 *   Collection may look something like this:
		 *     
		 *     myRelatedCollection : [
		 *         { id: 1 },
		 *         { id: 2 }
		 *     ]
		 * 
		 * 
		 * @return {Object[]/Object} An array of objects (for the case of a Collection}, or an Object (for the case of a Model)
		 *   with the internal attributes converted to their native equivalent.
		 */
		convert : function( dataComponent, options ) {
			options = options || {};
			var Model = require( 'data/Model' ),
			    Collection = require( 'data/Collection' ),
			    cache = {},  // keyed by models' clientId, and used for handling circular dependencies
			    persistedOnly = !!options.persistedOnly,
			    raw = !!options.raw,
			    data = ( dataComponent instanceof Collection ) ? [] : {};  // Collection is an Array, Model is an Object
			
			// Prime the cache with the Model/Collection provided to this method, so that if a circular reference points back to this
			// model, the data object is not duplicated as an internal object (i.e. it should refer right back to the converted
			// Model's/Collection's data object)
			cache[ dataComponent.getClientId() ] = data;
			
			// Recursively goes through the data structure, and convert models to objects, and collections to arrays
			_.assign( data, (function convert( dataComponent, attribute ) {  // attribute is only used when processing models, and a nested collection is come across, where the data.attribute.Attribute is passed along for processing when 'raw' is provided as true. See doc for 'raw' option about this hack..
				var clientId, 
				    cachedDataComponent,
				    data,
				    i, len;
				
				if( dataComponent instanceof Model ) {
					// Handle Models
					var attributes = dataComponent.getAttributes(),
					    attributeNames = options.attributeNames || _.keys( attributes ),
					    attributeName, currentValue;
					
					data = {};  // data is an object for a Model
					
					// Slight hack, but delete options.attributeNames now, so that it is not used again for inner Models (should only affect the first 
					// Model that gets converted, i.e. the Model provided to this method)
					delete options.attributeNames;
					
					for( i = 0, len = attributeNames.length; i < len; i++ ) {
						attributeName = attributeNames[ i ];
						if( !persistedOnly || attributes[ attributeName ].isPersisted() === true ) {
							currentValue = data[ attributeName ] = ( raw ) ? dataComponent.raw( attributeName ) : dataComponent.get( attributeName );
							
							// Process Nested DataComponents
							if( currentValue instanceof DataComponent ) {
								clientId = currentValue.getClientId();
								
								if( ( cachedDataComponent = cache[ clientId ] ) ) {
									data[ attributeName ] = cachedDataComponent;
								} else {
									// first, set up an array/object for the cache (so it exists when checking for it in the next call to convert()), 
									// and set that array/object to the return data as well
									cache[ clientId ] = data[ attributeName ] = ( currentValue instanceof Collection ) ? [] : {};  // Collection is an Array, Model is an Object
									
									// now, populate that object with the properties of the inner object
									_.assign( cache[ clientId ], convert( currentValue, attributes[ attributeName ] ) );
								}
							}
						}
					}
					
				} else if( dataComponent instanceof Collection ) {
					// Handle Collections
					var models = dataComponent.getModels(),
					    model, idAttributeName;
					
					data = [];  // data is an array for a Container
					
					// If the 'attribute' argument to the inner function was provided (coming from a Model that is being converted), and the 'raw' option is true,
					// AND the collection is *not* an embedded collection (i.e. it is a "related" collection), then we only want the ID's of the models for the conversion.
					// See note about this hack in the doc comment for the method for the 'raw' option.
					if( options.raw && attribute && !attribute.isEmbedded() ) {
						for( i = 0, len = models.length; i < len; i++ ) {
							model = models[ i ];
							idAttributeName = model.getIdAttributeName();
							
							data[ i ] = {};
							data[ i ][ idAttributeName ] = model.get( idAttributeName );
						}
						
					} else { 
						// Otherwise, provide the models themselves
						for( i = 0, len = models.length; i < len; i++ ) {
							model = models[ i ];
							clientId = model.getClientId();
							
							data[ i ] = cache[ clientId ] || convert( model );
						}
					}
				}
				
				return data;
			})( dataComponent ) );
			
			return data;
		}
		
	};
	
	
	return NativeObjectConverter;
	
} );