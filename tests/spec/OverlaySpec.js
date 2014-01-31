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
					
					overlay.destroy();
				} );
				
				
				it( "should be saved into another config so that the Overlay is not rendered immediately, but rendered into the correct place when show() is called", function() {
					var overlay = new Overlay( { 
						renderTo : $testDiv
					} );
					
					expect( overlay.isRendered() ).toBe( false );  // should *not* be rendered yet, since Overlay stores the config away for later
					
					overlay.show();
					expect( overlay.isRendered() ).toBe( true );
					expect( overlay.getEl().parent().is( $testDiv ) ).toBe( true );  // make sure it rendered into the correct place
					
					overlay.destroy();
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
					
					overlay.destroy();
				} );
				
			} );
			
		} );
		
		
		describe( 'setPosition()', function() {
			var overlay;
			
			beforeEach( function() {
				overlay = new Overlay();
			} );
			
			afterEach( function() {
				overlay.destroy();
			} );
			
			
			it( "should set the x/y position of the Overlay based on the default of `window`", function() {
				overlay.setPosition( 100, 200 );
				overlay.show();
				
				var offset = overlay.getEl().offset();
				expect( offset.left ).toBe( 100 );
				expect( offset.top ).toBe( 200 );
			} );
			
			
			it( "should set the x/y position of the Overlay based on the parent element of where the Overlay has been rendered to", function() {
				var $body = jQuery( 'body' ),
				    $div = jQuery( '<div style="position: absolute; left: 25px; top: 50px;"></div>' ).appendTo( $body );
				
				overlay.render( $div );
				overlay.setPosition( 100, 200 );
				overlay.show();
				
				var offset = overlay.getEl().offset();
				expect( offset.left ).toBe( 25 + 100 );  // 25 from the <div> the Overlay is rendered into
				expect( offset.top ).toBe( 50 + 200 );   // 50 from the <div> the Overlay is rendered into
				
				$div.remove();  // clean up
			} );
			
		} );
		
	} );
	
} );