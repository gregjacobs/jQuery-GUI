/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jqGui/button/Button'
], function( Button ) {
	
	describe( 'jqGui.button.Button', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var button = new Button();
				
				button.render( 'body' );
				
				button.destroy();
			} );
			
		} );
		
	} );
	
} );