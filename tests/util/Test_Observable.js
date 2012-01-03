/*global Ext, Y, Kevlar */
Ext.test.Session.addTest( 'Kevlar.util', {
	
	name: 'Kevlar.util.Observable',
	
	
	setUp: function() {
		
    },


	// -----------------------
	
	
	// fireEvent() tests
	
	
	"firing an event with two listeners, and the first one returns false, should not stop the second from running (returning false should only stop event propagation)" : function() {
		var observable = new Kevlar.util.Observable();
		observable.addEvents( 'testevent' );
		
		var handler1Fired = false, handler2Fired = false;
		observable.addListener( 'testevent', function() { handler1Fired = true; return false; } );
		observable.addListener( 'testevent', function() { handler2Fired = true; } );
		
		observable.fireEvent( 'testevent' );
		
		Y.Assert.isTrue( handler1Fired, "The first event handler should have been executed" );
		Y.Assert.isTrue( handler2Fired, "The second event handler should have been executed, even though the first returned false. Returning false should not prevent other handlers from executing, only stop event bubbling." );
	},
	
	
	
	"firing an event where one of its handlers returns false should have the call to fireEvent() return false" : function() {
		var observable = new Kevlar.util.Observable();
		observable.addEvents( 'testevent' );
		
		observable.addListener( 'testevent', function() { return false; } );
		observable.addListener( 'testevent', function() {} );
		
		Y.Assert.isFalse( observable.fireEvent( 'testevent' ), "Firing the event where the first its two handlers returned false should have caused the return from fireEvent() to be false." );
		
		// ----------------------------------------------
		
		var observable = new Kevlar.util.Observable();
		observable.addEvents( 'testevent' );
		
		observable.addListener( 'testevent', function() {} );
		observable.addListener( 'testevent', function() { return false; } );
		
		Y.Assert.isFalse( observable.fireEvent( 'testevent' ), "Firing the event where the second of its two handlers returned false should have caused the return from fireEvent() to be false." );
		
		
		// ----------------------------------------------
		
		var observable = new Kevlar.util.Observable();
		observable.addEvents( 'testevent' );
		
		observable.addListener( 'testevent', function() {} );
		observable.addListener( 'testevent', function() { return false; } );
		observable.addListener( 'testevent', function() {} );
		
		Y.Assert.isFalse( observable.fireEvent( 'testevent' ), "Firing the event where the second of its three handlers returned false should have caused the return from fireEvent() to be false." );
	},
	
	
	
	"firing an event where none of its handlers returns false should have the call to fireEvent() return true" : function() {
		var observable = new Kevlar.util.Observable();
		observable.addEvents( 'testevent' );
		
		observable.addListener( 'testevent', function() {} );
		observable.addListener( 'testevent', function() {} );
		
		Y.Assert.isTrue( observable.fireEvent( 'testevent' ), "Firing the event where none of its handlers returned false should have caused the return from fireEvent() to be true." );
	},
	
	
	
	// ----------------------------------
	
	
	// event bubbling tests
	
	
	"firing an event where none of its handlers returns false should have allowed the event to bubble" : function() {
		var parentObservable = new Kevlar.util.Observable();		
		var childObservable = new Kevlar.util.Observable();  
		childObservable.getBubbleTarget = function() { return parentObservable; }; // implement getBubbleTarget for the test
		
		childObservable.addEvents( 'testevent' );
		childObservable.enableBubble( 'testevent' );
		
		var eventBubbledToParent = false;
		parentObservable.addListener( 'testevent', function() { eventBubbledToParent = true; } );
		childObservable.addListener( 'testevent', function() {} );
		
		childObservable.fireEvent( 'testevent' );
		Y.Assert.isTrue( eventBubbledToParent, "Firing the event where none of its handlers returned false should have allowed the event to bubble." );
	},
	
	
	"firing an event where its one handler returns false should have prevented the event from bubbling" : function() {
		var parentObservable = new Kevlar.util.Observable();		
		var childObservable = new Kevlar.util.Observable();  
		childObservable.getBubbleTarget = function() { return parentObservable; }; // implement getBubbleTarget for the test
		
		childObservable.addEvents( 'testevent' );
		childObservable.enableBubble( 'testevent' );
		
		var eventBubbledToParent = false;
		parentObservable.addListener( 'testevent', function() { eventBubbledToParent = true; } );
		childObservable.addListener( 'testevent', function() { return false; } );
		
		childObservable.fireEvent( 'testevent' );
		Y.Assert.isFalse( eventBubbledToParent, "Firing the event its one handler returned false should have prevented the event from bubbling." );
	},
	
	
	"firing an event where one of its handlers returns false should have prevented the event from bubbling" : function() {
		var parentObservable = new Kevlar.util.Observable();		
		var childObservable = new Kevlar.util.Observable();  
		childObservable.getBubbleTarget = function() { return parentObservable; }; // implement getBubbleTarget for the test
		
		childObservable.addEvents( 'testevent' );
		childObservable.enableBubble( 'testevent' );
		
		var eventBubbledToParent = false;
		parentObservable.addListener( 'testevent', function() { eventBubbledToParent = true; } );
		childObservable.addListener( 'testevent', function() { return false; } );
		childObservable.addListener( 'testevent', function() {} );
		
		childObservable.fireEvent( 'testevent' );
		Y.Assert.isFalse( eventBubbledToParent, "Firing the event where the first of its two handlers returned false should have prevented the event from bubbling." );
		
		// --------------------------------------------------
		
		var parentObservable = new Kevlar.util.Observable();		
		var childObservable = new Kevlar.util.Observable();  
		childObservable.getBubbleTarget = function() { return parentObservable; }; // implement getBubbleTarget for the test
		
		childObservable.addEvents( 'testevent' );
		childObservable.enableBubble( 'testevent' );
		
		var eventBubbledToParent = false;
		parentObservable.addListener( 'testevent', function() { eventBubbledToParent = true; } );
		childObservable.addListener( 'testevent', function() {} );
		childObservable.addListener( 'testevent', function() { return false; } );
		
		childObservable.fireEvent( 'testevent' );
		Y.Assert.isFalse( eventBubbledToParent, "Firing the event where the second of its two handlers returned false should have prevented the event from bubbling." );
	},
	
	
	"Providing the enableBubble() method an object or array of objects should enable bubbling just the same as a string or array of strings" : function() {
		var parentObservable = new Kevlar.util.Observable();		
		var childObservable = new Kevlar.util.Observable();  
		childObservable.getBubbleTarget = function() { return parentObservable; }; // implement getBubbleTarget for the test
		
		childObservable.addEvents( 'testevent' );
		childObservable.enableBubble( { eventName : 'testevent' } );
		
		var eventBubbledToParent = false;
		parentObservable.addListener( 'testevent', function() { eventBubbledToParent = true; } );
		childObservable.addListener( 'testevent', function() {} );
		
		childObservable.fireEvent( 'testevent' );
		Y.Assert.isTrue( eventBubbledToParent, "The enableBubble() method should have been able to take an object as its argument to enable bubbling for an event." );
	},
	
	
	"Providing the enableBubble() method a bubbleFn that just returns false should prevent bubbling" : function() {
		var parentObservable = new Kevlar.util.Observable();
		var childObservable = new Kevlar.util.Observable();  
		childObservable.getBubbleTarget = function() { return parentObservable; }; // implement getBubbleTarget for the test
		
		childObservable.addEvents( 'testevent' );
		childObservable.enableBubble( { 
			eventName : 'testevent', 
			bubbleFn : function( observableObj ) { return false; } 
		} );
		
		var eventBubbledToParent = false;
		parentObservable.addListener( 'testevent', function() { eventBubbledToParent = true; } );
		childObservable.addListener( 'testevent', function() {} );
		
		childObservable.fireEvent( 'testevent' );
		Y.Assert.isFalse( eventBubbledToParent, "A bubbleFn provided to enableBubble() that simply returns false should have prevented the event from bubbling." );
	},
	
	
	"Providing the enableBubble() method a bubbleFn that returns nothing should NOT prevent bubbling" : function() {
		var parentObservable = new Kevlar.util.Observable();
		var childObservable = new Kevlar.util.Observable();  
		childObservable.getBubbleTarget = function() { return parentObservable; }; // implement getBubbleTarget for the test
		
		childObservable.addEvents( 'testevent' );
		childObservable.enableBubble( {
			eventName: 'testevent', 
			bubbleFn: function( observableObj ) { /* empty */ }
		} );
		
		var eventBubbledToParent = false;
		parentObservable.addListener( 'testevent', function() { eventBubbledToParent = true; } );
		childObservable.addListener( 'testevent', function() {} );
		
		childObservable.fireEvent( 'testevent' );
		Y.Assert.isTrue( eventBubbledToParent, "A bubbleFn provided to enableBubble() that returns nothing should have NOT prevented the event from bubbling." );
	}
	
} );