/*global define, describe, it, expect */
define( [
	'jquery',
	'jqc/Mask'
],
function( jQuery, Mask ) {
	
	describe( "jqc.Mask", function() {
		
		it( "should be able to be instantiated (just a sanity check for now)", function() {
			var $el = jQuery( '<div />' );
			var mask = new Mask( $el );
		} );
		
	} );
	
} );