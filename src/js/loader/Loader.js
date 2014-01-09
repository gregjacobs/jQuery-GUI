/*global define */
define( [
	'jquery',
	'Class'
], function( jQuery, Class ) {
	
	/**
	 * @abstract
	 * @class gui.loader.Loader
	 * 
	 * Base class for the abstraction of a dynamic dependency loader (such as RequireJS). This allows dependencies to be loaded 
	 * on the fly and have those dependencies provided as an Object (map) for later consumption.
	 * 
	 * Normally, dependencies for classes are loaded using RequireJS directly. However, there are cases where dependencies need 
	 * to be loaded dynamically, and that is where this class comes in. 
	 * 
	 * ## Use
	 * 
	 * This class allows classes like {@link gui.app.Application} to dynamically load dependencies when needed. (See 
	 * {@link gui.app.Application} for more details on that.) It also provides an abstraction point so that other implementations
	 * can implement different dynamic loading functionality. An example of this might be an implementation which may interact with 
	 * a server-side component to dynamically load "packages" of dependencies more efficiently than on a file-by-file basis.
	 */
	var Loader = Class.create( {
		abstractClass : true,
		
		
		/**
		 * Dynamically loads the given dependencies.
		 * 
		 * @param {String[]} paths An array of strings for the paths to load.
		 * @return {jQuery.Promise} A Promise which is resolved when the dependencies have been loaded. The promise is resolved with
		 *   an Object (map) where the keys are the dependency paths, and the values are the dependencies themselves. If the dependencies
		 *   fail to load, the promise is rejected with an error message.
		 */
		load : function( paths ) {
			// Note: This method may be updated to allow an Object (map) argument which will allow dependency aliases in the future, and
			// thus it calls a separate method to do the work so this method can be updated at a later time to support this feature.
			return this.doLoad( paths );
		},
		
		
		/**
		 * Method which subclasses must implement to perform the actual loading of the dependencies.
		 * 
		 * @abstract
		 * @protected
		 * @method doLoad
		 * @param {String[]} paths An array of strings for the paths to load.
		 * @return {jQuery.Promise} A Promise which is resolved when the dependencies have been loaded. The promise is resolved with
		 *   an Object (map) where the keys are the dependency paths, and the values are the dependencies themselves. If the dependencies
		 *   fail to load, the promise is rejected with an error message.
		 */
		doLoad : Class.abstractMethod
		
	} );
	
	return Loader;
	
} );