/*global define, describe, it, xit, expect, JsMockito */
define( [
	'jqc/Viewport'
], function( Viewport ) {
	
	describe( 'jqc.Viewport', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed (test should simply not error)", function() {
				var viewport = new Viewport( {
					renderTo : 'body'
				} );
				
				viewport.destroy();
			} );
			
		} );
		
	} );
	
} );