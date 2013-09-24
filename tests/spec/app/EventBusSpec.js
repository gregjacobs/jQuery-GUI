/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
/*jshint sub:true */
define( [
	'lodash',
	'jqGui/app/EventBus',
	'jqGui/Component'
], function( _, EventBus, Component ) {
	
	describe( 'jqGui.app.EventBus', function() {
		
		afterEach( function() {
			// Reset the EventBus's callbacks array. Do a check for its existence though, in case the property
			// is ever renamed.
			if( !_.isArray( EventBus.callbacks ) ) {
				throw new Error( "EventBus's `callbacks` array not found. Property name changed in source file?" );
			}
			
			EventBus.callbacks = [];  // reset the callbacks array
		} );
		
		
		describe( 'subscribe()/unsubscribe()', function() {
			var component,
			    handlerFn1,
			    handlerFn2,
			    handler1CallCount,
			    handler2CallCount,
			    scopeObj = {};
			
			
			beforeEach( function() {
				component = new Component();
				handler1CallCount = 0;
				handler2CallCount = 0;
				
				handlerFn1 = function( cmp, eventName, args ) {
					if( eventName === 'all' ) return;  // ignore the automatic 'all' event
					
					handler1CallCount++;
					
					expect( cmp ).toBe( component );
					expect( eventName ).toBe( 'componentevent' );
					expect( args ).toEqual( [ component, 1, 2, 3 ] );
				};
				
				handlerFn2 = function( cmp, eventName, args ) {
					if( eventName === 'all' ) return;  // ignore the automatic 'all' event
					
					handler2CallCount++;
					
					expect( this ).toBe( scopeObj );
					expect( cmp ).toBe( component );
					expect( eventName ).toBe( 'componentevent' );
					expect( args ).toEqual( [ component, 1, 2, 3 ] );
				};
			} );
			
			
			it( "should subscribe a handler function to listen for all Component events, and be able to remove the subscription", function() {
				EventBus.subscribe( handlerFn1 );
				component.fireEvent( 'componentevent', component, 1, 2, 3 );
				
				expect( handler1CallCount ).toBe( 1 );  // make sure the handler was called
				
				
				// Now unsubscribe
				EventBus.unsubscribe( handlerFn1 );
				
				// Fire the event again
				component.fireEvent( 'componentevent', component, 1, 2, 3 );
				expect( handler1CallCount ).toBe( 1 );  // should not have called the unsubscribed handler again
			} );
			
			
			it( "should subscribe the same handler function only once when provided the same scope (i.e. duplicate subscriptions of the same callback/scope combo should be dropped)", function() {
				// Simulate multiple subscriptions for each handler function
				EventBus.subscribe( handlerFn1 );
				EventBus.subscribe( handlerFn1 );
				EventBus.subscribe( handlerFn1 );
				EventBus.subscribe( handlerFn2, scopeObj );
				EventBus.subscribe( handlerFn2, scopeObj );
				EventBus.subscribe( handlerFn2, scopeObj );
				
				// Fire the event
				component.fireEvent( 'componentevent', component, 1, 2, 3 );
				
				expect( handler1CallCount ).toBe( 1 );  // make sure the handler was called only once, even with multiple subscriptions for the same one
				expect( handler2CallCount ).toBe( 1 );  // make sure the handler was called only once, even with multiple subscriptions for the same one
				
				
				// Now unsubscribe the first
				EventBus.unsubscribe( handlerFn1 );
				
				// Fire the event again
				component.fireEvent( 'componentevent', component, 1, 2, 3 );
				expect( handler1CallCount ).toBe( 1 );  // should not have called the unsubscribed handler again
				expect( handler2CallCount ).toBe( 2 );
				
				
				// Check that unsubscribing a handler with a different scope object than the one it was subscribed with
				// does not actually unsubscribe that callback/scope combination
				EventBus.unsubscribe( handlerFn2 );            // attempt unsubscribing with no scope object arg
				component.fireEvent( 'componentevent', component, 1, 2, 3 );
				expect( handler2CallCount ).toBe( 3 );         // still subscribed, should have been called again
				
				EventBus.unsubscribe( handlerFn2, { a: 1 } );  // attempt unsubscribing with a completely different scope object
				component.fireEvent( 'componentevent', component, 1, 2, 3 );
				expect( handler2CallCount ).toBe( 4 );         // still subscribed, should have been called again
				
				
				// And finally, unsubscribe the callback/scope combination
				EventBus.unsubscribe( handlerFn2, scopeObj );
				component.fireEvent( 'componentevent', component, 1, 2, 3 );
				expect( handler2CallCount ).toBe( 4 );         // should not have been called again (remaining at 4)
			} );
			
			
			it( "should return false back to the event firer, if a handler returns false", function() {
				var handlerCount = 0;
				
				EventBus.subscribe( function( component, eventName ) {
					if( eventName === 'all' ) return;  // ignore automatic 'all' event
					
					handlerCount++;
					return false;
				} );
				
				var returnVal = component.fireEvent( 'componentevent', component );
				
				expect( handlerCount ).toBe( 1 );  // make sure the handler was called
				expect( returnVal ).toBe( false );
			} );
			
		} );
		
	} );
	
} );