/*global define, describe, it, expect */
define( [
	'jqg/Image'
],
function( Image ) {
	
	describe( 'jqg.Image', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var image = new Image();
				
				image.render( 'body' );
				
				image.destroy();
			} );
			
		} );
		
	} );

} );