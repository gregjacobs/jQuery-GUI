/*global define, describe, it, expect */
define( [
	'jquery',
	'ui/Mask'
],
function( jQuery, Mask ) {
	
	describe( "ui.Mask", function() {
		
		it( "should be able to be instantiated (just a sanity check for now)", function() {
			var $el = jQuery( '<div />' );
			var mask = new Mask( $el );
		} );
		
	} );
	
} );