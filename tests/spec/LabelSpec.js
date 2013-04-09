/*global define, describe, it, expect */
define( [
	'jqc/Label'
],
function( Label ) {
	
	describe( 'jqc.Label', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var label = new Label();
				
				label.render( 'body' );
				
				label.destroy();
			} );
			
		} );
		
	} );

} );