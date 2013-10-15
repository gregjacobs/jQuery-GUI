/*global define, describe, it, expect */
define( [
	'gui/Label'
],
function( Label ) {
	
	describe( 'gui.Label', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var label = new Label();
				
				label.render( 'body' );
				
				label.destroy();
			} );
			
		} );
		
	} );

} );