/*global define, describe, it, expect */
define( [
	'jqGui/Label'
],
function( Label ) {
	
	describe( 'jqGui.Label', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var label = new Label();
				
				label.render( 'body' );
				
				label.destroy();
			} );
			
		} );
		
	} );

} );