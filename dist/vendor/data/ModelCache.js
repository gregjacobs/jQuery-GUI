/*global define */
define( function() {

	/**
	 * @private
	 * @class data.ModelCache
	 * @singleton
	 * 
	 * Singleton class which caches models by their type (subclass type), and id. This is used
	 * to retrieve models, and not duplicate them when instantiating the same model type with the
	 * same instance id. 
	 * 
	 * This is a class used internally by Data, and should not be used directly.
	 */
	var ModelCache = {
		
		/**
		 * The hashmap of model references stored in the cache. This hashmap is a two-level hashmap, first keyed by the
		 * {@link data.Model Model's} assigned `__Data_modelTypeId`, and then its instance id.
		 * 
		 * @private
		 * @property {Object} models
		 */
		models : {},
		
		
		/**
		 * Returns a Model that is in the cache with the same model type (model subclass) and instance id, if one exists
		 * that matches the type of the provided `model`, and the provided instance `id`. If a Model does not already exist, 
		 * the provided `model` is simply returned.
		 * 
		 * @param {data.Model} model
		 * @param {String} [id] The ID of the model (if it has one).
		 * @return {data.Model}
		 */
		get : function( model, id ) {
			var modelClass = model.constructor,
			    modelTypeId = modelClass.__Data_modelTypeId,  // the current modelTypeId, defined when the Model is extended
			    cachedModel;
			
			// If there is not a cache for this modelTypeId, create one now
			if( !this.models[ modelTypeId ] ) {
				this.models[ modelTypeId ] = {};
			}
			
			// If the model has an id provided with it, pull the cached model with that id (if it exists), or otherwise cache it
			if( typeof id !== 'undefined' ) {
				cachedModel = this.models[ modelTypeId ][ id ];
				if( !cachedModel ) {
					this.models[ modelTypeId ][ id ] = model;
				}
			}
			
			return cachedModel || model;
		}
	
	};
	
	return ModelCache;
	
} );