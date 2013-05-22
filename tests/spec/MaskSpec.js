/*global define, describe, xdescribe, beforeEach, afterEach, it, expect */
define( [
	'jquery',
	'jqc/Mask'
],
function( jQuery, Mask ) {
	
	describe( "jqc.Mask", function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated (just a sanity check for now)", function() {
				var $el = jQuery( '<div />' );
				var mask = new Mask( $el );
				
				mask.destroy();
			} );
			
		} );
		
		
		xdescribe( "config options", function() {
			
			it( "should leave the $contentEl invisible if `spinner` is false, and there is no `msg`", function() {
				
			} );
			
			
			it( "should show the $contentEl and add the spinner-showing CSS class if `spinner` is true", function() {
				
			} );
			
			
			it( "should show the $contentEl and add the msg-showing CSS class if there is a `msg` config", function() {
				
			} );
			
			
			it( "should show the $contentEl and add both the spinner-showing and msg-showing CSS classes if there is both a `spinner` and `msg` config", function() {
				
			} );
			
		} );
		
		
		xdescribe( 'setMsg()', function() {
			
		} );
		
		
		xdescribe( 'show()', function() {
			
		} );
		
		
		xdescribe( 'hide()', function() {
			
		} );
		
		
		xdescribe( 'isVisible()', function() {
			
		} );
		
		
		xdescribe( 'destroy()', function() {
			
		} );
		
	} );
	
} );