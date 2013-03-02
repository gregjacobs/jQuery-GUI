/*global define, describe, it, expect */
define( [
	'ui/util/Observable'
], function( Observable ) {
	
	describe( "ui.util.Observable", function() {
		
		describe( "fireEvent()", function() {
			it( "firing an event with two listeners, and the first one returns false, should not stop the second from running (returning false should only stop event propagation)", function() {
				var observable = new Observable();
				observable.addEvents( 'testevent' );
				
				var handler1Fired = false, handler2Fired = false;
				observable.addListener( 'testevent', function() { handler1Fired = true; return false; } );
				observable.addListener( 'testevent', function() { handler2Fired = true; } );
				
				observable.fireEvent( 'testevent' );
				
				expect( handler1Fired ).toBe( true );  // The first event handler should have been executed
				expect( handler2Fired ).toBe( true );  // The second event handler should have been executed, even though the first returned false. Returning false should not prevent other handlers from executing, only stop event bubbling.
			} );
			
			
			
			it( "firing an event where one of its handlers returns false should have the call to fireEvent() return false", function() {
				var observable = new Observable();
				observable.addEvents( 'testevent' );
				
				observable.addListener( 'testevent', function() { return false; } );
				observable.addListener( 'testevent', function() {} );
				
				expect( observable.fireEvent( 'testevent' ) ).toBe( false );  // Firing the event where the first its two handlers returned false should have caused the return from fireEvent() to be false.
				
				// ----------------------------------------------
				
				observable = new Observable();
				observable.addEvents( 'testevent' );
				
				observable.addListener( 'testevent', function() {} );
				observable.addListener( 'testevent', function() { return false; } );
				
				expect( observable.fireEvent( 'testevent' ) ).toBe( false );  // Firing the event where the second of its two handlers returned false should have caused the return from fireEvent() to be false.
				
				
				// ----------------------------------------------
				
				observable = new Observable();
				observable.addEvents( 'testevent' );
				
				observable.addListener( 'testevent', function() {} );
				observable.addListener( 'testevent', function() { return false; } );
				observable.addListener( 'testevent', function() {} );
				
				expect( observable.fireEvent( 'testevent' ) ).toBe( false );  // Firing the event where the second of its three handlers returned false should have caused the return from fireEvent() to be false.
			} );
			
			
			
			it( "firing an event where none of its handlers returns false should have the call to fireEvent() return true", function() {
				var observable = new Observable();
				observable.addEvents( 'testevent' );
				
				observable.addListener( 'testevent', function() {} );
				observable.addListener( 'testevent', function() {} );
				
				expect( observable.fireEvent( 'testevent' ) ).toBe( true );  // Firing the event where none of its handlers returned false should have caused the return from fireEvent() to be true.
			} );
		} );
		
	} );
	
} );