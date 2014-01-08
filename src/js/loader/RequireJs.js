/*global define, require */
define( [
	'jquery',
	'lodash',
	
	'gui/loader/Loader'
], function( jQuery, _, Loader ) {
	
	/**
	 * @class gui.loader.RequireJs
	 * @extends gui.loader.Loader
	 * 
	 * Abstraction of the RequireJS dependency loader, which can load dependencies on the fly and return an Object (map) of the
	 * loaded dependencies. See superclass for details on its use.
	 */
	var RequireJsLoader = Loader.extend( {
		
		/**
		 * Implementation of superclass method to perform the actual loading of the dependencies.
		 * 
		 * @protected
		 * @param {String[]} paths An array of strings for the paths to load.
		 * @return {jQuery.Promise} A Promise which is resolved when the dependencies have been loaded. The promise is resolved with
		 *   an Object (map) where the keys are the dependency paths, and the values are the dependencies themselves. If the dependencies
		 *   fail to load, the promise is rejected with an error message.
		 */
		doLoad : function( paths ) {
			var me = this,   // for closure
			    deferred = new jQuery.Deferred();
			
			this.require( paths ).then( function( dependencies ) {
				var dependencyMap = me.buildDependencyMap( paths, dependencies );
				
				deferred.resolve( dependencyMap );
			} );
			
			return deferred;
		},
		
		
		/**
		 * Performs the actual loading of the dependencies for the {@link #doLoad} method using the RequireJS `require()` function. 
		 * 
		 * This is a separate method in order to override for the unit tests.
		 * 
		 * @protected
		 * @param {String[]} paths An array of the paths for the dependencies to load.
		 * @return {jQuery.Promise} A Promise which is resolved with one argument: An array of the loaded dependencies, in the
		 *   order of the original `paths`.
		 */
		require : function( dependencyPaths, callback ) {
			var deferred = new jQuery.Deferred();
			
			// call the RequireJS `require()` function
			require( dependencyPaths, function() { 
				deferred.resolve( _.toArray( arguments ) );
			} );
			return deferred.promise();
		},
		
		
		/**
		 * Builds the dependency map for the value that the {@link #doLoad} promise is resolved with. This method takes
		 * the array of string paths, and the array of the loaded dependencies, and creates a map of path -> dependency.
		 * 
		 * @protected
		 * @param {String[]} paths The original array of paths that were loaded.
		 * @param {Mixed[]} dependencies The loaded dependencies, in the order of the `paths`.
		 * @return {Object} An Object (map) where the keys are the original paths, and the values are the loaded dependencies.
		 */
		buildDependencyMap : function( paths, dependencies ) {
			var dependencyMap = {};
			
			for( var i = 0, len = paths.length; i < len; i++ ) {
				dependencyMap[ paths[ i ] ] = dependencies[ i ];
			}
			return dependencyMap;
		}
		
	} );
	
	return RequireJsLoader;
	
} );