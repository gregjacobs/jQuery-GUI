/*global define */
define( [
	'lodash',
	'Class',
	'jqc/Component'
], function( _, Class, Component ) {
	
	/**
	 * @class jqc.app.EventBus
	 * @extends Object
	 * @singleton
	 * 
	 * Singleton class which allows any subscriber to listen to all events from all {@link jqc.Component Component}
	 * instances (including {@link jqc.Component Component} subclass instances).
	 */
	var EventBus = Class.create( {
		
		/**
		 * @protected
		 * @property {Object[]} callbacks
		 * 
		 * An array of Objects (maps), each of which have properties `callback` and `scope`. Callbacks are subscribed
		 * using the {@link #subscribe} method.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} fireEventPatched
		 * 
		 * Flag which is set to `true` once Observable's {@link Observable#fireEvent fireEvent} method has been wrapped in an
		 * interceptor function on {@link jqc.Component Component's} prototype, which provides the hook to be able to listen
		 * for all Component events.
		 * 
		 * Without this, we would need to subscribe an 'all' event listener to every instantiated component, and then remove that 
		 * listener when the components are {@link jqc.Component#method-destroy destroyed}. This would really just be extra processing 
		 * and memory usage.
		 */
		fireEventPatched : false,
		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			this.callbacks = [];
		},
		
		
		/**
		 * Subscribes a callback to all events from all components. The callback is provided the following arguments:
		 * 
		 * - component ({@link jqc.Component}) : The Component that fired the event.
		 * - eventName (String) : The name of the event that was fired.
		 * - fireEventArgs (Mixed[]) : The array of arguments that were passed to the original {@link Observable#fireEvent fireEvent}
		 *   call. This does not include the event name.
		 * 
		 * For example:
		 * 
		 *     var handlerFn = function( component, eventName ) {
		 *         console.log( "Component " + component.getId() + " fired the event '" + eventName + 
		 *             "' with args: ", Array.prototype.slice.call( arguments, 2 ) );
		 *     };
		 * 
		 *     EventBus.subscribe( handlerFn );
		 * 
		 * 
		 * @param {Function} callback The callback function to subscribe.
		 * @param {Object} [scope=window] The scope (`this` reference) to call the `callback` in.
		 */
		subscribe : function( callback, scope ) {
			this.patchFireEvent();  // only patches if it isn't already patched
			
			if( this.findCallback( callback, scope ) === -1 ) {
				this.callbacks.push( { callback: callback, scope: scope } );
			}
		},
		
		
		/**
		 * Unsubscribes a callback subscribed with {@link #subscribe}.
		 * 
		 * @param {Function} callback The callback function to unsubscribe.
		 * @param {Object} [scope=window] The scope (`this` reference) which the `callback` was set to be called with.
		 */
		unsubscribe : function( callback, scope ) {
			var callbackIdx = this.findCallback( callback, scope );
			if( callbackIdx !== -1 ) {
				this.callbacks.splice( callbackIdx, 1 );
			}
		},
		
		
		/**
		 * Finds the index of the provided `callback` and `scope` in the {@link #callbacks} array. If none exists,
		 * returns -1.
		 * 
		 * @protected
		 * @param {Function} callback The callback to look for.
		 * @param {Object} scope The scope that the callback is attached to.
		 * @return {Number} The index in the {@link #callbacks} array, or -1 for "not found".
		 */
		findCallback : function( callback, scope ) {
			return _.findIndex( this.callbacks, function( cbObj ) { return ( cbObj.callback === callback && cbObj.scope === scope ); } );
		},
		
		
		/**
		 * Handles an event being fired on a {@link jqc.Component}, by dispatching the event to all subscribed callbacks.
		 * The arguments that are passed to the callback are documented in {@link #subscribe}.
		 * 
		 * @protected
		 * @param {jqc.Component} component The Component that fired the event.
		 * @param {String} eventName The event name that was fired.
		 * @param {Mixed[]} fireEventArgs The arguments provided to the original {@link Observable#fireEvent fireEvent} call.
		 *   This does not include the event name.
		 */
		dispatchEvent : function( component, eventName, fireEventArgs ) {
			var callbackObjs = this.callbacks,
			    ret;
			
			for( var i = 0, len = callbackObjs.length; i < len; i++ ) {
				var callResult = callbackObjs[ i ].callback.call( callbackObjs[ i ].scope, component, eventName, fireEventArgs );
				if( callResult === false )
					ret = false;
			}
			
			return ret;
		},
		
		
		/**
		 * Patches Observable's {@link Observable#fireEvent fireEvent} method on {@link jqc.Component Component's} prototype, using
		 * an interceptor function which provides the hook to be able to listen for all Component events.
		 * 
		 * Without this, we would need to subscribe an 'all' event listener to every instantiated component, and then remove that 
		 * listener when the components are {@link jqc.Component#method-destroy destroyed}. This would just be extra processing 
		 * and memory usage, when this method is much simpler.
		 * 
		 * This method will only be executed once. Once the interceptor method has been placed, it does not need to be added again.
		 * 
		 * @protected
		 */
		patchFireEvent : function() {
			if( !this.fireEventPatched ) {
				var me = this,
				    prototype = Component.prototype,
				    origFireEvent = prototype.fireEvent;
				
				prototype.fireEvent = function( eventName ) {
					var returnVal = origFireEvent.apply( this, arguments );
					
					if( returnVal !== false ) {
					    returnVal = me.dispatchEvent( this, eventName, Array.prototype.slice.call( arguments, 1 ) );
					}
					
					return returnVal;
				};
				
				this.fireEventPatched = true;
			}
		}
		
		
	} );
	
	
	// Return singleton instance
	return new EventBus();
	
} );