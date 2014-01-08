/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'jquery',
	
	'gui/loader/Loader'
], function( jQuery, Loader ) {
	
	describe( 'gui.loader.Loader', function() {
		
		describe( 'load()', function() {
			
			it( "should call doLoad(), and return a promise which is resolved when doLoad() resolves its promise", function() {
				var deferred = new jQuery.Deferred(),
				    dependencyMap;
				
				var ConcreteLoader = Loader.extend( {
					doLoad : function() { return deferred.promise(); }
				} );
				
				var loader = new ConcreteLoader(),
				    promise = loader.load( [ 'a', 'b', 'c' ] ).done( function( deps ) { dependencyMap = deps; } );
				
				expect( promise.state() ).toBe( 'pending' );  // initial condition
				
				deferred.resolve( { a: "a", b: "b", c: "c" } );
				expect( promise.state() ).toBe( 'resolved' );
				expect( dependencyMap ).toEqual( { a: "a", b: "b", c: "c" } );  // the "return" value
			} );

			
			it( "should call doLoad(), and return a promise which is rejected if doLoad() rejects its promise", function() {
				var deferred = new jQuery.Deferred(),
				    errorMessage;
				
				var ConcreteLoader = Loader.extend( {
					doLoad : function() { return deferred.promise(); }
				} );
				
				var loader = new ConcreteLoader(),
				    promise = loader.load( [ 'a', 'b', 'c' ] ).fail( function( err ) { errorMessage = err; } );
				
				expect( promise.state() ).toBe( 'pending' );  // initial condition
				
				deferred.reject( "An error occurred" );
				expect( promise.state() ).toBe( 'rejected' );
				expect( errorMessage ).toBe( "An error occurred" );  // the "return" value
			} );
			
		} );
		
	} );

} );