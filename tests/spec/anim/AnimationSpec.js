/*global define, describe, it, expect */
define( [
	'jquery',
	'ui/anim/Animation'
], function( jQuery, Animation ) {
	
	describe( 'ui.anim.Animation', function() {
		
		it( "should require the 'target' config, and either the 'to' or 'effect' configs", function() {
			var $targetEl = jQuery( '<div />' );
			
			// Should not error
			var anim = new Animation( {
				target : $targetEl,
				to : { someProp: 1 }
			} );
			
			// Should not error
			var anim2 = new Animation( {
				target : $targetEl,
				effect : "testEffect"
			} );
			
			expect( function() {
				var anim3 = new Animation( {
					// NOTE: no 'target' config
				} );
			} ).toThrow( "ui.anim.Animation: Error. No 'target' config provided" );
			
			expect( function() {
				var anim4 = new Animation( {
					target : $targetEl
					// NOTE: no 'to' or 'effect' configs
				} );
			} ).toThrow( "ui.anim.Animation: Error. No 'to' or 'effect' config provided" );
		} );
		
	} );
	
} );