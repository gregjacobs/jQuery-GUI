/*global define, describe, xdescribe, beforeEach, afterEach, it, xit, expect */
define( [
	'jquery',
	'gui/Mask'
], function( jQuery, Mask ) {
	
	describe( "gui.Mask", function() {
		var $el,   // an element to use to mask
		    mask;  // initialized in tests
		
		beforeEach( function() {
			$el = jQuery( '<div style="width: 100px; height: 100px;"></div>' ).appendTo( 'body' );
			mask = null;
		} );
		
		afterEach( function() {
			mask.destroy();
			$el.remove();
		} );
		
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated (just a sanity check for now)", function() {
				mask = new Mask( $el );
			} );
			
		} );
		
		
		describe( "config options", function() {
			
			describe( 'overlayCls', function() {
			
				it( "should add the CSS class specified to the $overlayEl", function() {
					mask = new Mask( $el, { overlayCls: 'testing-123' } );
					mask.show();
					
					expect( mask.$overlayEl.hasClass( 'testing-123' ) ).toBe( true );
				} );
				
			} );
			
			describe( 'contentCls', function() {
			
				it( "should add the CSS class specified to the $contentEl", function() {
					mask = new Mask( $el, { contentCls: 'testing-123' } );
					mask.show();
					
					expect( mask.$contentEl.hasClass( 'testing-123' ) ).toBe( true );
				} );
				
			} );
			
			
			describe( 'spinner/msg', function() {
			
				it( "should leave the $contentEl invisible if `spinner` is false, and there is no `msg`", function() {
					mask = new Mask( $el, { spinner: false, msg: "" } );
					mask.show();
					
					expect( mask.$contentEl.css( 'display' ) ).toBe( 'none' );
				} );
				
				
				it( "should show the $contentEl and add the spinner-showing CSS class if `spinner` is true", function() {
					mask = new Mask( $el, { spinner: true, msg: "" } );  // `msg` still empty
					mask.show();

					expect( mask.$contentEl.css( 'display' ) ).toBe( 'block' );
					expect( mask.$contentEl.hasClass( mask.spinnerVisibleCls ) ).toBe( true );
					expect( mask.$msgEl.css( 'display' ) ).toBe( 'none' );
				} );
				
				
				it( "should show the $contentEl and add the msg-showing CSS class if there is a `msg` config", function() {
					mask = new Mask( $el, { spinner: false, msg: "Test Msg" } );
					mask.show();
					
					expect( mask.$contentEl.css( 'display' ) ).toBe( 'block' );
					expect( mask.$contentEl.hasClass( mask.spinnerVisibleCls ) ).toBe( false );
					expect( mask.$msgEl.css( 'display' ) ).toBe( 'inline-block' );
					expect( mask.$msgEl.html() ).toMatch( "Test Msg" );
				} );
				
				
				it( "should show the $contentEl and add both the spinner-showing and msg-showing CSS classes if there is both a `spinner` and `msg` config", function() {
					mask = new Mask( $el, { spinner: true, msg: "Test Msg" } );
					mask.show();
					
					expect( mask.$contentEl.css( 'display' ) ).toBe( 'block' );
					expect( mask.$contentEl.hasClass( mask.spinnerVisibleCls ) ).toBe( true );
					expect( mask.$msgEl.css( 'display' ) ).toBe( 'inline-block' );
					expect( mask.$msgEl.html() ).toMatch( "Test Msg" );
				} );
				
			} );
			
		} );
		
		
		describe( 'updateConfig()', function() {
			
			it( "should remove any old overlayCls, and apply a new one provided in the config", function() {
				mask = new Mask( $el, { overlayCls: 'oldCls' } );
				mask.show();

				expect( mask.$overlayEl.hasClass( 'oldCls' ) ).toBe( true );  // initial condition
				
				mask.updateConfig( { overlayCls: 'newCls' } );
				expect( mask.$overlayEl.hasClass( 'oldCls' ) ).toBe( false );
				expect( mask.$overlayEl.hasClass( 'newCls' ) ).toBe( true );
			} );

			
			it( "should remove any old contentCls, and apply a new one provided in the config", function() {
				mask = new Mask( $el, { contentCls: 'oldCls' } );
				mask.show();

				expect( mask.$contentEl.hasClass( 'oldCls' ) ).toBe( true );  // initial condition
				
				mask.updateConfig( { contentCls: 'newCls' } );
				expect( mask.$contentEl.hasClass( 'oldCls' ) ).toBe( false );
				expect( mask.$contentEl.hasClass( 'newCls' ) ).toBe( true );
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