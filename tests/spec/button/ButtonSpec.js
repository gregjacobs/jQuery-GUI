/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jqg/button/Button'
], function( Button ) {
	
	describe( 'jqg.button.Button', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var button = new Button();
				
				button.render( 'body' );
				
				button.destroy();
			} );
			
		} );
		
	} );
	
} );