/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'jquery',
	'gui/Overlay'
], function( jQuery, Overlay ) {
	
	describe( 'gui.Overlay', function() {
		
		describe( "configs", function() {
			
			describe( "`renderTo` config", function() {
				var $testDiv;
				
				beforeEach( function() {
					$testDiv = jQuery( '<div></div>' ).appendTo( 'body' );
				} );
				
				afterEach( function() {
					$testDiv.remove();
				} );
				
				
				it( "when not provided, Overlay should render itself to the document body", function() {
					var overlay = new Overlay();
					expect( overlay.isRendered() ).toBe( false );  // initial condition
					
					overlay.show();
					expect( overlay.isRendered() ).toBe( true );
					expect( overlay.getEl().parent().is( 'body' ) ).toBe( true );
				} );
				
				
				it( "should be saved into another config so that the Overlay is not rendered immediately, but rendered into the correct place when show() is called", function() {
					var overlay = new Overlay( { 
						renderTo : $testDiv
					} );
					
					expect( overlay.isRendered() ).toBe( false );  // should *not* be rendered yet, since Overlay stores the config away for later
					
					overlay.show();
					expect( overlay.isRendered() ).toBe( true );
					expect( overlay.getEl().parent().is( $testDiv ) ).toBe( true );  // make sure it rendered into the correct place
				} );
				

				it( "should explicitly set the `renderTo` config to `undefined` instead of deleting the property, to make sure it doesn't unshadow a prototype `renderTo` property", function() {
					var OverlaySubclass = Overlay.extend( {
						renderTo : $testDiv  // prototype property
					} );
					var overlay = new OverlaySubclass();
					
					expect( overlay.isRendered() ).toBe( false );  // should *not* be rendered yet, since Overlay stores the config away for later
					
					overlay.show();
					expect( overlay.isRendered() ).toBe( true );
					expect( overlay.getEl().parent().is( $testDiv ) ).toBe( true );  // make sure it rendered into the correct place
				} );
				
			} );
			
		} );
		
	} );
	
} );