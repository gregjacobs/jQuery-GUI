/*global define, describe, it, expect */
define( [
	'ui/Label'
],
function( Label ) {
	
	describe( 'ui.Label', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var label = new Label();
				
				label.render( 'body' );
				
				label.destroy();
			} );
			
		} );
		
	} );

} );