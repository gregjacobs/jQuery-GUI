/**
 * @class Kevlar.util.Function
 * @singleton
 * 
 * Utility class for methods relating to `Function` functionality.
 */
/*global Kevlar */
Kevlar.util.Function = {
	
	/**
	 * Creates a new function from the provided `fn`, changing the context object (`this` reference) to the provided `scope`.
	 *
	 * @param {Function} fn The function to bind.
	 * @param {Object} scope The scope (`this` reference) in which the function is to be executed.
	 * @return {Function} The new function.
	 */
	bind: function( fn, scope ) {
		return function() {
			return fn.apply( scope, arguments );
		};
	}
	
}