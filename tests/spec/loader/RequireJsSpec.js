/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'jquery',
	
	'gui/loader/RequireJs'
], function( jQuery, RequireJsLoader ) {
	
	describe( 'gui.loader.RequireJs', function() {
		var loader,
		    requireDeferred;
		
		beforeEach( function() {
			loader = new RequireJsLoader();
			requireDeferred = new jQuery.Deferred();
			
			// Mock the `require()` method of the Loader to return the tests' deferred
			spyOn( loader, 'require' ).andCallFake( function() {
				return requireDeferred;
			} );
		} );
		
		
		describe( 'load', function() {
			
			it( "should load the given dependencies and resolve its promise with a map of path -> dependency", function() {
				var dependencyMap,
				    promise = loader.load( [ 'path/to/A', 'path/to/B' ] ).then( function( deps ) { dependencyMap = deps; } );
				
				expect( promise.state() ).toBe( 'pending' );  // initial condition
				
				// Resolve the "require" promise. This part is mocked. Not using actual RequireJS loader for this part since it would 
				// try to load actual dependencies.
				var depA = "a", depB = "b";  // some fake dependencies
				requireDeferred.resolve( [ depA, depB ] );

				// Now check the final state
				expect( promise.state() ).toBe( 'resolved' );  // initial condition
				expect( dependencyMap ).toEqual( {
					'path/to/A' : depA,
					'path/to/B' : depB
				} );
			} );
			
		} );
		
	} );

} );