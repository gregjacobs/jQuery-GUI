/*global define, describe, beforeEach, it, expect */
define( [
	'jquery',
	'jqGui/anim/Animation'
], function( jQuery, Animation ) {
	
	describe( 'jqGui.anim.Animation', function() {
		
		describe( 'start()', function() {
			var $targetEl;
			
			beforeEach( function() {
				$targetEl = jQuery( '<div />' );
			} );
			
			it( "should throw an error if the `target` config is missing", function() {
				expect( function() {
					var anim = new Animation( {
						// NOTE: no 'target' config
					} );
					anim.start();
				} ).toThrow( "jqGui.anim.Animation.start(): Error. No `target` config provided" );
			} );
			
			
			it( "should throw an error if both the `to` and `effect` configs are missing", function() {
				expect( function() {
					var anim = new Animation( {
						target : $targetEl
						// NOTE: no 'to' and 'effect' config
					} );
					anim.start();
				} ).toThrow( "jqGui.anim.Animation.start(): Error. No `to` or `effect` config provided" );
			} );
			
			
			it( "should not error if a `target` config, and a `to` config is provided", function() {
				var anim = new Animation( {
					target : $targetEl,
					to : { someProp: 1 }
				} );
				anim.start();
			} );
			
			
			// NOTE: commented test because we're not including jQuery UI effects library
			/*it( "should not error if a `target` config, and an `effect` config is provided", function() {
				var anim = new Animation( {
					target : $targetEl,
					effect : "testEffect"
				} );
				anim.start();
			} );*/			
			
		} );
		
	} );
	
} );