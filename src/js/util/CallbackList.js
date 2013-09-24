/*global define */
define( [
	'lodash',
	'Class'
], function( _, Class ) {
	
	/**
	 * @class jqGui.util.CallbackList
	 * @extends Object
	 * 
	 * Simple utility used to maintain a list of callback functions, and their associated scope objects.
	 * 
	 * This utility ensures that a given callback is not added more than once, and provides convenient methods
	 * to call all of the callbacks in the list in their own scopes.
	 */
	var CallbackList = Class.create( {
		
		/**
		 * @protected
		 * @property {Object[]} callbacks
		 * 
		 * An array of objects which stores the callbacks. Each object has properties `callback` and `scope`.
		 * 
		 * To give a visual example:
		 * 
		 *     callbacks : [
		 *         { callback: function(){}, scope: obj },
		 *         { callback: function(){}, scope: obj2 }
		 *     ]
		 */
		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			this.callbacks = [];
		},
		
		
		/**
		 * Adds a `callback` to the CallbackList, with an optional `scope`.
		 * 
		 * If the `callback` function is already in the CallbackList with the given `scope`, it will not be added 
		 * again to prevent inefficiencies by accidentally adding a callback more than once.
		 * 
		 * @param {Function} callback The callback function to add.
		 * @param {Object} [scope] The scope to call the callback in.
		 */
		add : function( callback, scope ) {
			if( !this.contains( callback, scope ) ) {
				this.callbacks.push( { callback: callback, scope: scope } );
			}
		},
		
		
		/**
		 * Retrieves all of the callbacks in the CallbackList. This method returns an array of objects, where each object
		 * has properties `callback` and `scope`.
		 * 
		 * This method is useful if you want to implement some other scheme than simply calling all of the callbacks using
		 * {@link #callAll} or {@link #applyAll}, such as if a return value of `false` from one of them should stop the others
		 * from being called.
		 * 
		 * Example return from this method:
		 * 
		 *     [
		 *         { callback: function(){}, scope: obj },
		 *         { callback: function(){}, scope: obj2 }
		 *     ]
		 *     
		 * @return {Object[]}
		 */
		getAll : function() {
			return this.callbacks;
		},
		
		
		/**
		 * Determines if the CallbackList holds a given `callback`/`scope` pair. The `scope` parameter may be omitted if
		 * the `callback` was not {@link #add added} with a `scope`.
		 * 
		 * @param {Function} callback The callback function to check for.
		 * @param {Object} [scope] The scope that the callback was {@link #add added} with.
		 */
		contains : function( callback, scope ) {
			return ( this.indexOf( callback, scope ) !== -1 );
		},
		
		
		/**
		 * Determines the index that a given `callback`/`scope` pair exists within the CallbackList. Returns -1 if the
		 * callback/scope is not found.
		 * 
		 * The `scope` parameter may be omitted if the `callback` was not {@link #add added} with a `scope`.
		 * 
		 * @param {Function} callback The callback function to check for.
		 * @param {Object} [scope] The scope that the callback was {@link #add added} with.
		 */
		indexOf : function( callback, scope ) {
			return _.findIndex( this.callbacks, function( cb ) { return cb.callback === callback && cb.scope === scope; } );
		},
		
		
		/**
		 * Calls each of the callbacks in the CallBackList, in the scope that they were {@link #add added} in.
		 * The arguments provided to this method will be provided to each callback function when they are called.
		 * 
		 * Example:
		 * 
		 *     callbackList.callAll( 1, 2, 3 );  // each callback is called with the arguments: 1, 2, 3
		 * 
		 * @param {Mixed...} args The arguments to provide to each callback function. Each argument provided to this
		 *   method will be provided to each callback.
		 */
		callAll : function() {
			this.applyAll( arguments );
		},
		
		
		/**
		 * Calls each of the callbacks in the CallBackList, in the scope that they were {@link #add added} in, applying
		 * the array of arguments that is provided to this method.
		 * 
		 * Example:
		 * 
		 *     callbackList.applyAll( [ 1, 2, 3 ] );  // each callback is called with the arguments: 1, 2, 3
		 *     
		 * @param {Mixed[]} args The array of arguments which will be applied to each callback function.
		 */
		applyAll : function( args ) {
			var callbacks = this.callbacks;
			for( var i = 0, len = callbacks.length; i < len; i++ ) {
				callbacks[ i ].callback.apply( callbacks[ i ].scope || window, args );
			}
		},
		
		
		/**
		 * Removes a `callback` from the CallbackList. The `scope` parameter, if provided, must match the `scope` that the 
		 * callback was {@link #add added} with. If the callback was added without a `scope`, then `scope` must be omitted.
		 * 
		 * @param {Function} callback The callback function to remove.
		 * @param {Object} [scope] The scope that the callback was {@link #add added} with.
		 */
		remove : function( callback, scope ) {
			var cbIdx = this.indexOf( callback, scope );
			if( cbIdx !== -1 ) {
				this.callbacks.splice( cbIdx, 1 );
			}
		},
		
		
		/**
		 * Removes all callbacks from the CallbackList, resetting it to its empty state.
		 */
		removeAll : function() {
			this.callbacks.length = 0;
		}
		
	} );
	
	return CallbackList;
	
} );