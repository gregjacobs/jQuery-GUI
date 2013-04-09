/*global define, describe, it, expect */
define( [
	'jqc/Image'
],
function( Image ) {
	
	describe( 'jqc.Image', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var image = new Image();
				
				image.render( 'body' );
				
				image.destroy();
			} );
			
		} );
		
	} );

} );