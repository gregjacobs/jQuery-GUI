/*global define, jasmine, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'jquery',
	
	'gui/Component',
	'gui/Mask'
], function( jQuery, Component, Mask ) {
	
	describe( "gui.Mask", function() {
		var $el1,       // an element to mask
		    $el2,       // an element to mask
		    component1, // a gui.Component used to test Component support
		    component2, // a gui.Component used to test Component support
		    mask;       // initialized in tests
		
		beforeEach( function() {
			// Custom matchers for Mask
			this.addMatchers( {
				
				// To determine if a Mask instance is attached to a given parent element
				toBeAttachedTo : function( parentEl ) {
					var $maskOverlayEl = this.actual.$overlayEl,
					    $maskContentEl = this.actual.$contentEl;
					
					this.message = function() { 
						var expectedEl = parentEl[ 0 ] || parentEl;  // first condition for jQuery object, second for HTMLElement
						return "Expected Mask's elements to have parent element: " + expectedEl.outerHTML;
					};
					
					return $maskOverlayEl.parent().is( parentEl ) && $maskContentEl.parent().is( parentEl );
				},
			
				// To determine if the Mask's $contentEl is visible
				toHaveContentVisible : function() {
					var mask = this.actual,
					    $contentEl = mask.$contentEl,
					    notText = this.isNot ? " not" : "";
					
					this.message = function() {
						return "Expected Mask's $contentEl" + notText + " to be visible";
					};
					
					return !!$contentEl && ( $contentEl.hasClass( mask.spinnerVisibleCls ) || $contentEl.hasClass( mask.msgVisibleCls ) );
				},
				
				// To determine if the Mask's $spinnerEl is visible
				toHaveSpinnerVisible : function() {
					var mask = this.actual,
					    $contentEl = mask.$contentEl,
					    notText = this.isNot ? " not" : "";
					
					this.message = function() {
						return "Expected Mask's spinner" + notText + " to be visible";
					};
					
					return !!$contentEl && $contentEl.hasClass( mask.spinnerVisibleCls );
				},
				
				// To determine if the Mask's $msgEl is visible
				toHaveMsgVisible : function() {
					var mask = this.actual,
					    $contentEl = mask.$contentEl,
					    notText = this.isNot ? " not" : "";
					
					this.message = function() {
						return "Expected Mask's message element" + notText + " to be visible";
					};
					
					return !!$contentEl && $contentEl.hasClass( mask.msgVisibleCls );
				}
			
			} );
			

			$el1 = jQuery( '<div data-name="$el1" style="width: 200px; height: 200px;"></div>' ).appendTo( 'body' );
			$el2 = jQuery( '<div data-name="$el2" style="width: 200px; height: 200px;"></div>' ).appendTo( 'body' );
			component1 = new Component( { attr: { 'data-name': "componentEl1" }, style: { position: 'absolute', top: 0, left: 0, width: '200px', height: '200px' } } );
			component2 = new Component( { attr: { 'data-name': "componentEl2" }, style: { position: 'absolute', top: 0, left: 200, width: '200px', height: '200px' } } );
			mask = null;
		} );
		
		afterEach( function() {
			if( mask ) mask.destroy();  // some tests throw errors from bad configuration options, so the mask object is not always instantiated 
			component1.destroy();
			component2.destroy();
			$el1.remove();
			$el2.remove();
		} );
		
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated with no configuration options (just a sanity check for now)", function() {
				mask = new Mask();
			} );
			
		} );
		
		
		describe( "config options", function() {
			
			describe( 'target', function() {
				
				it( "should accept an HTML element of where to render the Mask", function() {
					mask = new Mask( { target: $el1[ 0 ] } );
					mask.show();

					expect( mask ).toBeAttachedTo( $el1 );
				} );
				
				
				it( "should accept a jQuery wrapped set of where to render the Mask", function() {
					mask = new Mask( { target: $el1 } );
					mask.show();

					expect( mask ).toBeAttachedTo( $el1 );
				} );
				
				
				it( "should throw an error if a jQuery wrapped set is provided with 0 elements", function() {
					expect( function() {
						mask = new Mask( { target: jQuery() } );  // empty jQuery set
					} ).toThrow( "`target` jQuery object must hold exactly one element" );
				} );
				
				
				it( "should throw an error if a jQuery wrapped set is provided with 2 or more elements", function() {
					var el1 = document.createElement( 'div' ),
					    el2 = document.createElement( 'div' );
					
					expect( function() {
						mask = new Mask( { target: jQuery( [ el1, el2 ] ) } );
					} ).toThrow( "`target` jQuery object must hold exactly one element" );
				} );
				
				
				it( "should accept an unrendered Component of where to render the Mask. The mask should not be rendered until the Component is rendered, if it is shown", function() {
					mask = new Mask( { target: component1, overlayCls: 'testing-123' } );
					mask.show();
					
					expect( mask.isRendered() ).toBe( false );
					
					component1.render( 'body' );
					expect( mask.isRendered() ).toBe( true );
					expect( mask ).toBeAttachedTo( component1.getMaskTarget() );
				} );
				
				
				it( "should accept an unrendered Component of where to render the Mask. The mask should not automatically be shown when the Component is rendered, until a call to Mask.show() is made", function() {
					mask = new Mask( { target: component1, overlayCls: 'testing-123' } );
					expect( mask.isRendered() ).toBe( false );  // initial condition
					
					// Component is rendered - shouldn't cause the Mask to be rendered immediately since the Mask hasn't been shown
					component1.render( 'body' );
					expect( mask.isRendered() ).toBe( false );
					
					// Now show the Mask
					mask.show();
					expect( mask.isRendered() ).toBe( true );
					expect( mask ).toBeAttachedTo( component1.getMaskTarget() );
				} );
				
				
				it( "should accept a rendered Component of where to render the Mask. The mask should be rendered immediately when it is shown", function() {
					component1.render( 'body' );
					
					mask = new Mask( { target: component1, overlayCls: 'testing-123' } );
					mask.show();

					expect( mask.isRendered() ).toBe( true );
					expect( mask ).toBeAttachedTo( component1.getMaskTarget() );
				} );
				
				
				it( "should accept a Component, and render where the Component's getMaskTarget() method tells it to render", function() {
					component1.render( 'body' );
					component1.getMaskTarget = function() { return $el1; };  // inline override - redirect to the test's $el1 element
					
					mask = new Mask( { target: component1, overlayCls: 'testing-123' } );
					mask.show();

					expect( mask.isRendered() ).toBe( true );
					expect( mask ).toBeAttachedTo( $el1 );
				} );
				
			} );
			
			
			describe( 'overlayCls', function() {
			
				it( "should add the CSS class specified to the $overlayEl", function() {
					mask = new Mask( { target: $el1, overlayCls: 'testing-123' } );
					mask.show();
					
					expect( mask.$overlayEl.hasClass( 'testing-123' ) ).toBe( true );
				} );
				
			} );
			
			
			describe( 'contentCls', function() {
			
				it( "should add the CSS class specified to the $contentEl", function() {
					mask = new Mask( { target: $el1, contentCls: 'testing-123' } );
					mask.show();
					
					expect( mask.$contentEl.hasClass( 'testing-123' ) ).toBe( true );
				} );
				
			} );
			
			
			describe( 'spinner/msg', function() {
			
				it( "should leave the $contentEl invisible if `spinner` is false, and there is no `msg`", function() {
					mask = new Mask( { target: $el1, spinner: false, msg: "" } );
					mask.show();
					
					expect( mask.$contentEl.css( 'display' ) ).toBe( 'none' );
				} );
				
				
				it( "should show the $contentEl and add the spinner-showing CSS class if `spinner` is true", function() {
					mask = new Mask( { target: $el1, spinner: true, msg: "" } );  // `msg` still empty
					mask.show();

					expect( mask.$contentEl.css( 'display' ) ).toBe( 'block' );
					expect( mask.$contentEl.hasClass( mask.spinnerVisibleCls ) ).toBe( true );
					expect( mask.$msgEl.css( 'display' ) ).toBe( 'none' );
				} );
				
				
				it( "should show the $contentEl and add the msg-showing CSS class if there is a `msg` config", function() {
					mask = new Mask( { target: $el1, spinner: false, msg: "Test Msg" } );
					mask.show();
					
					expect( mask.$contentEl.css( 'display' ) ).toBe( 'block' );
					expect( mask.$contentEl.hasClass( mask.spinnerVisibleCls ) ).toBe( false );
					expect( mask.$msgEl.css( 'display' ) ).toBe( 'inline-block' );
					expect( mask.$msgEl.html() ).toMatch( "Test Msg" );
				} );
				
				
				it( "should show the $contentEl and add both the spinner-showing and msg-showing CSS classes if there is both a `spinner` and `msg` config", function() {
					mask = new Mask( { target: $el1, spinner: true, msg: "Test Msg" } );
					mask.show();
					
					expect( mask.$contentEl.css( 'display' ) ).toBe( 'block' );
					expect( mask.$contentEl.hasClass( mask.spinnerVisibleCls ) ).toBe( true );
					expect( mask.$msgEl.css( 'display' ) ).toBe( 'inline-block' );
					expect( mask.$msgEl.html() ).toMatch( "Test Msg" );
				} );
				
			} );
			
			
			describe( 'contentPosition', function() {
				
				it( "should allow the content element to be positioned within the mask using any side", function() {
					mask = new Mask( { target: $el1, msg: "Test Msg", contentPosition: { my: 'left top', at: 'left top' } } );
					mask.show();
					
					var position = mask.$contentEl.position();
					expect( position.left ).toBe( 0 );  // top left corner
					expect( position.top ).toBe( 0 );
				} );
				

				it( "should allow the content element to be positioned within the mask using offsets", function() {
					mask = new Mask( { target: $el1, msg: "Test Msg", contentPosition: { my: 'left+20 top+10', at: 'left top' } } );
					mask.show();
					
					var position = mask.$contentEl.position();
					expect( position.left ).toBe( 20 );
					expect( position.top ).toBe( 10 );
				} );
				
			} );
			
		} );
		
		
		describe( 'resetConfig()', function() {
			
			it( "should remove any old `overlayCls` cfg, and apply a new one provided in the config", function() {
				mask = new Mask( { target: $el1, overlayCls: 'oldCls' } );
				mask.show();

				expect( mask.$overlayEl.hasClass( 'oldCls' ) ).toBe( true );  // initial condition
				
				mask.resetConfig( { overlayCls: 'newCls' } );
				expect( mask.$overlayEl.hasClass( 'oldCls' ) ).toBe( false );
				expect( mask.$overlayEl.hasClass( 'newCls' ) ).toBe( true );
			} );

			
			it( "should remove any old `contentCls` cfg, and apply a new one provided in the config", function() {
				mask = new Mask( { target: $el1, contentCls: 'oldCls' } );
				mask.show();

				expect( mask.$contentEl.hasClass( 'oldCls' ) ).toBe( true );  // initial condition
				
				mask.resetConfig( { contentCls: 'newCls' } );
				expect( mask.$contentEl.hasClass( 'oldCls' ) ).toBe( false );
				expect( mask.$contentEl.hasClass( 'newCls' ) ).toBe( true );
			} );
			
			
			it( "should remove any old `contentPosition` cfg, and apply a new one provided in the config", function() {
				mask = new Mask( { target: $el1, msg: "Test Msg", contentPosition: { my: 'left+20 top+30', at: 'left top' } } );
				mask.show();
				
				// Check initial condition
				var position = mask.$contentEl.position();
				expect( position.left ).toBe( 20 );
				expect( position.top ).toBe( 30 );

				mask.resetConfig( { msg: "Test Msg", contentPosition: { my: 'left+10 top+15', at: 'left top' } } );
				var position2 = mask.$contentEl.position();
				expect( position2.left ).toBe( 10 );
				expect( position2.top ).toBe( 15 );
			} );
			
		} );
		
		
		describe( 'setTarget()', function() {
			
			it( "should allow a `target` of an HTML element", function() {
				mask = new Mask();
				mask.setTarget( $el1[ 0 ] );
				
				mask.show();
				expect( mask ).toBeAttachedTo( $el1[ 0 ] );
			} );
			
			
			it( "should allow a `target` of a jQuery wrapped set", function() {
				mask = new Mask();
				mask.setTarget( $el1 );
				
				mask.show();
				expect( mask ).toBeAttachedTo( $el1 );
			} );
			
			
			it( "should throw an error if a jQuery wrapped set is provided with 0 elements", function() {
				mask = new Mask();
				
				expect( function() {
					mask.setTarget( jQuery() );  // empty jQuery set
				} ).toThrow( "`target` jQuery object must hold exactly one element" );
			} );
			
			
			it( "should throw an error if a jQuery wrapped set has 2 or more elements", function() {
				mask = new Mask();
				var el1 = document.createElement( 'div' ),
				    el2 = document.createElement( 'div' );
				
				expect( function() {
					mask.setTarget( jQuery( [ el1, el2 ] ) );
				} ).toThrow( "`target` jQuery object must hold exactly one element" );
			} );
			
			
			it( "should allow a `target` of a rendered gui.Component", function() {
				component1.render( 'body' );
				mask = new Mask();
				
				mask.setTarget( component1 );
				mask.show();
				expect( mask ).toBeAttachedTo( component1.getMaskTarget() );
			} );
			
			
			it( "should add a listener for the 'render' event on an unrendered `target` gui.Component, which will auto-show the mask if the Mask has been shown when the Component is rendered", function() {
				spyOn( component1, 'on' ).andCallThrough();
				spyOn( component1, 'un' ).andCallThrough();
				
				mask = new Mask();
				mask.setTarget( component1 );  // component1 is unrendered
				expect( component1.on.calls.length ).toBe( 1 );                 // initial condition:
				expect( component1.on.calls[ 0 ].args[ 0 ] ).toBe( 'render' );  // called component1.on( 'render', ... )
				expect( component1.un.calls.length ).toBe( 0 );
				
				
				mask.show();
				expect( mask.isRendered() ).toBe( false ); // Component is not yet rendered, and hence the Mask has not been rendered yet either
				
				component1.render( 'body' );
				expect( mask.isRendered() ).toBe( true );  // Mask is rendered now since the component has been rendered
				expect( component1.un.calls.length ).toBe( 1 );
				expect( component1.un.calls[ 0 ].args[ 0 ] ).toBe( 'render' );  // called component1.un( 'render', ... ) to unregister the handler
			} );
			
			
			it( "should remove the 'render' event listener for the previous `target` gui.Component, and assign one to the new gui.Component if both are unrendered", function() {
				spyOn( component1, 'on' ).andCallThrough();
				spyOn( component1, 'un' ).andCallThrough();
				spyOn( component2, 'on' ).andCallThrough();
				spyOn( component2, 'un' ).andCallThrough();
				
				mask = new Mask( { target: component1 } );
				expect( component1.on.calls.length ).toBe( 1 );                 // initial condition:
				expect( component1.on.calls[ 0 ].args[ 0 ] ).toBe( 'render' );  // called component1.on( 'render', ... )
				
				mask.setTarget( component2 );
				expect( component1.un.calls.length ).toBe( 1 );
				expect( component1.un.calls[ 0 ].args[ 0 ] ).toBe( 'render' );  // called component1.un( 'render', ... )
				expect( component2.on.calls.length ).toBe( 1 );
				expect( component2.on.calls[ 0 ].args[ 0 ] ).toBe( 'render' );  // called component2.on( 'render', ... )
			} );
			
			
			describe( "mask moving functionality", function() {
				
				it( "should move the Mask's elements to the new `target` element if the Mask is visible when setTarget() is called", function() {
					mask = new Mask( { target: $el1 } );
					mask.show();
					
					expect( mask ).toBeAttachedTo( $el1 );  // initial condition
					
					mask.setTarget( $el2 );
					expect( mask ).toBeAttachedTo( $el2 );
				} );
				
				
				it( "should cause the Mask to be shown on the new `target` element if setTarget() is called when the Mask is hidden", function() {
					mask = new Mask( { target: $el1 } );
					
					mask.setTarget( $el2 );
					mask.show();
					
					expect( mask ).toBeAttachedTo( $el2 );
				} );
				
				
				it( "should move the Mask's elements to the new `target` gui.Component if the Mask is visible when setTarget() is called", function() {
					component1.render( 'body' );
					component2.render( 'body' );
					
					mask = new Mask( { target: component1 } );
					mask.show();
					
					expect( mask ).toBeAttachedTo( component1.getMaskTarget() );  // initial condition
					
					mask.setTarget( component2 );
					expect( mask ).toBeAttachedTo( component2.getMaskTarget() );
				} );
				
				
				it( "should cause the Mask to be shown on the new `target` gui.Component if setTarget() is called when the Mask is hidden", function() {
					component1.render( 'body' );
					component2.render( 'body' );
					
					mask = new Mask( { target: component1 } );
					
					mask.setTarget( component2 );
					mask.show();
					
					expect( mask ).toBeAttachedTo( component2.getMaskTarget() );
				} );
				
				
				it( "should move the Mask's elements to the new `target` gui.Component if the Mask is visible when setTarget() is called", function() {
					component1.render( 'body' );
					component2.render( 'body' );
					
					mask = new Mask( { target: component1 } );
					mask.show();
					
					expect( mask ).toBeAttachedTo( component1.getMaskTarget() );  // initial condition
					
					mask.setTarget( component2 );
					expect( mask ).toBeAttachedTo( component2.getMaskTarget() );
				} );
				
				
				it( "should show the Mask on the new `target` element if the Mask was 'deferred' because the previous value of a gui.Component was unrendered", function() {
					mask = new Mask( { target: component1 } );  // unrendered component
					mask.show();
					
					expect( mask.isRendered() ).toBe( false );  // initial condition
					
					mask.setTarget( $el1 );
					expect( mask.isRendered() ).toBe( true );
					expect( mask ).toBeAttachedTo( $el1 );  // initial condition
				} );
				
				
				it( "should show the Mask on the new `target` gui.Component that is rendered if the Mask was 'deferred' because the previous value of a gui.Component was unrendered", function() {
					component2.render( 'body' );  // only component2 is rendered
					
					mask = new Mask( { target: component1 } );  // unrendered component1
					mask.show();
					
					expect( mask.isRendered() ).toBe( false );  // initial condition
					
					mask.setTarget( component2 );
					expect( mask.isRendered() ).toBe( true );
					expect( mask ).toBeAttachedTo( component2.getMaskTarget() );
				} );
				
				
				it( "should defer showing the Mask on the new `target` gui.Component that is unrendered if it had previously been shown on an HTMLElement", function() {
					mask = new Mask( { target: $el1 } );
					mask.show();
					
					expect( mask ).toBeAttachedTo( $el1 );  // initial condition
					
					mask.setTarget( component1 );  // component1 is not rendered
					expect( mask.isAttached() ).toBe( false );
				} );
				
				
				it( "should defer showing the Mask on the new `target` gui.Component that is unrendered if it had previously been shown on a rendered gui.Component", function() {
					component1.render( 'body' );  // only component1 is rendered
					
					mask = new Mask( { target: component1 } );
					mask.show();
					
					expect( mask ).toBeAttachedTo( component1.getMaskTarget() );  // initial condition
					
					mask.setTarget( component2 );
					expect( mask.isAttached() ).toBe( false );
				} );
				
			} );
				
		} );
		
		
		describe( 'setSpinner()', function() {
			
			it( "should set the visibility of the spinner of an unrendered Mask", function() {
				mask = new Mask( { target: $el1 } );
				mask.setSpinner( true );
				
				mask.show();
				expect( mask ).toHaveSpinnerVisible();
			} );
			
			
			it( "should make the 'spinner element' visible on a rendered Mask", function() {
				mask = new Mask( { target: $el1 } );
				mask.show();
				
				expect( mask ).not.toHaveSpinnerVisible();  // initial condition
				
				mask.setSpinner( true );
				expect( mask ).toHaveSpinnerVisible();
			} );
			
			
			it( "should hide the 'spinner element' if removing the spinner", function() {
				mask = new Mask( { target: $el1, spinner: true } );
				mask.show();

				expect( mask ).toHaveSpinnerVisible();  // initial condition
				
				mask.setSpinner( false );  // remove spinner
				expect( mask ).not.toHaveSpinnerVisible();
			} );
			
			
			it( "should hide the 'content element' if removing the spinner when there is no `msg`", function() {
				mask = new Mask( { target: $el1, spinner: true, msg: "" } );
				mask.show();

				expect( mask ).toHaveContentVisible();  // initial condition
				
				mask.setSpinner( false );  // remove spinner
				expect( mask ).not.toHaveContentVisible();
			} );
			
			
			it( "should not hide the 'content element' if removing the spinner when there is a `msg`", function() {
				mask = new Mask( { target: $el1, spinner: true, msg: "A Message" } );
				mask.show();

				expect( mask ).toHaveContentVisible();  // initial condition
				
				mask.setSpinner( false );  // remove spinner
				expect( mask ).toHaveContentVisible();  // should still be visible since a `msg` exists
			} );
			
		} );
		
		
		describe( 'setMsg()', function() {
			
			it( "should set the message of an unrendered Mask", function() {
				mask = new Mask( { target: $el1, msg: "Old Message" } );
				mask.setMsg( "New Message" );
				
				mask.show();
				expect( mask ).toHaveMsgVisible();
				expect( mask.$msgEl.html() ).not.toMatch( "Old Message" );
				expect( mask.$msgEl.html() ).toMatch( "New Message" );
			} );
			
			
			it( "should make the 'message element' visible, and add the message on a rendered Mask", function() {
				mask = new Mask( { target: $el1 } );
				mask.show();
				
				expect( mask ).not.toHaveContentVisible();  // initial condition
				
				mask.setMsg( "New Message" );
				expect( mask ).toHaveMsgVisible();
				expect( mask.$msgEl.html() ).toMatch( "New Message" );
			} );
			
			
			it( "should hide the 'message element' if removing the message with an empty string", function() {
				mask = new Mask( { target: $el1, msg: "Old Message" } );
				mask.show();
				
				expect( mask ).toHaveMsgVisible();  // initial condition
				expect( mask.$msgEl.html() ).toMatch( "Old Message" );  // initial condition
				
				mask.setMsg( "" );  // remove message
				expect( mask ).not.toHaveMsgVisible();
				expect( mask.$msgEl.html() ).not.toMatch( "Old Message" );
			} );
			
			
			it( "should hide the 'content element' if removing the message when there is no `spinner`", function() {
				mask = new Mask( { target: $el1, spinner: false, msg: "A Message" } );
				mask.show();

				expect( mask ).toHaveContentVisible();  // initial condition
				
				mask.setMsg( "" );  // remove message
				expect( mask ).not.toHaveContentVisible();
			} );
			
			
			it( "should not hide the 'content element' if removing the message when the `spinner` is visible", function() {
				mask = new Mask( { target: $el1, spinner: true, msg: "A Message" } );
				mask.show();

				expect( mask ).toHaveContentVisible();  // initial condition

				mask.setMsg( "" );  // remove message
				expect( mask ).toHaveContentVisible();  // should still be visible since the `spinner` exists
			} );
			
		} );
		
		
		describe( 'show()', function() {
			
			it( "should throw an error if there is no `target` when the method is called", function() {
				mask = new Mask();
				
				expect( function() {
					mask.show();
				} ).toThrow( "Cannot show Mask, no `target` specified" );
			} );
			
			
			it( "should add the 'gui-masked' CSS class to the target element to remove scrollbars", function() {
				mask = new Mask( { target: $el1 } );
				mask.show();
				
				expect( $el1.hasClass( 'gui-masked' ) ).toBe( true );
			} );

			
			it( "should add the 'gui-masked-relative' CSS class to give the target element a positioning context if it does not yet have one", function() {
				var $div = jQuery( '<div style="position: static; width: 200px; height: 200px;" />' ).appendTo( 'body' );
				
				mask = new Mask( { target: $div } );
				mask.show();
				
				expect( $div.hasClass( 'gui-masked-relative' ) ).toBe( true );
				
				$div.remove();
			} );
			
			
			it( "should *not* add the 'gui-masked-relative' CSS class to the target element if the target element already has a positioning context", function() {
				var $div = jQuery( '<div style="position: absolute; width: 200px; height: 200px;" />' ).appendTo( 'body' );
				
				mask = new Mask( { target: $div } );
				mask.show();
				
				expect( $div.hasClass( 'gui-masked-relative' ) ).toBe( false );
				
				$div.remove();
			} );
			
			
			it( "should size the $overlayEl to the outer height of the `target` element", function() {
				// Give the element some extra padding and border
				$el1.css( 'padding', '5px 0' );            // will add 10px total (top/bot)
				$el1.css( 'border', '1px solid black' );  // will add 2px total (top/bot)
				
				mask = new Mask( { target: $el1 } );
				mask.show();
				
				expect( mask.$overlayEl.height() ).toBe( 200 + 10 + 2 );  // 200 is the original $el1 height, plus the padding and border
			} );
			
			
			it( "should position the $contentEl to its correct position within the mask", function() {
				mask = new Mask( { target: $el1, msg: "Test Msg", contentPosition: { my: 'left+20 top+10', at: 'left top' } } );
				mask.show();
				
				var position = mask.$contentEl.position();
				expect( position.left ).toBe( 20 );
				expect( position.top ).toBe( 10 );
			} );
			
			
			it( "should resize the $overlayEl and reposition the $contentEl to its correct position within the mask every 100ms, to account for the `target` element changing size", function() {
				jasmine.Clock.useMock();
				
				mask = new Mask( { 
					target: $el1, 
					msg: "Test Msg", 
					contentPosition: { my: 'left bottom', at: 'left bottom' }  // pin content to bottom
				} );
				mask.show();
				
				var $overlayEl = mask.$overlayEl,
				    $contentEl = mask.$contentEl,
				    contentElHeight = $contentEl.outerHeight();  //save the height for calculations
				
				// Check initial conditions
				expect( $overlayEl.height() ).toBe( 200 );  // 200 is the original $el1 height
				expect( $contentEl.css( 'top' ) ).toBe( 200 - contentElHeight + "px" );
				
				// Now resize the `target` element
				$el1.css( 'height', '300px' );
				jasmine.Clock.tick( 99 );  // 99ms have passed, but not 100!
				expect( $overlayEl.height() ).toBe( 200 );  // don't know about the change just yet, still 200
				expect( $contentEl.css( 'top' ) ).toBe( 200 - contentElHeight + "px" );  // don't know about the change just yet, still at old position
				
				jasmine.Clock.tick( 1 );
				expect( $overlayEl.height() ).toBe( 300 );  // now fixed
				expect( $contentEl.css( 'top' ) ).toBe( 300 - contentElHeight + "px" );  // now fixed
			} );
			
		} );
		
		
		describe( 'hide()', function() {

			it( "should remove the 'gui-masked' CSS class from the target element which was given to it during show()", function() {
				mask = new Mask( { target: $el1 } );
				mask.show();
				
				expect( $el1.hasClass( 'gui-masked' ) ).toBe( true );  // initial condition
				
				mask.hide();
				expect( $el1.hasClass( 'gui-masked' ) ).toBe( false );
			} );
			
			
			it( "should remove the 'gui-masked-relative' CSS class from the target element if it was given to it during show() to give the element a positioning context", function() {
				var $div = jQuery( '<div style="position: static; width: 200px; height: 200px;" />' ).appendTo( 'body' );
				
				mask = new Mask( { target: $div } );
				mask.show();
				
				expect( $div.hasClass( 'gui-masked-relative' ) ).toBe( true );  // initial condition
				
				mask.hide();
				expect( $div.hasClass( 'gui-masked-relative' ) ).toBe( false );
				
				$div.remove();
			} );
			
			
			it( "should 'hide' the Mask's elements by detaching them from the DOM", function() {
				mask = new Mask( { target: $el1 } );
				
				mask.show();
				expect( $el1.find( mask.$overlayEl ).length ).toBe( 1 );  // initial condition - is in DOM
				expect( $el1.find( mask.$contentEl ).length ).toBe( 1 );  // initial condition - is in DOM
				
				mask.hide();
				expect( $el1.find( mask.$overlayEl ).length ).toBe( 0 );  // no longer in DOM
				expect( $el1.find( mask.$contentEl ).length ).toBe( 0 );  // no longer in DOM
			} );
			
		} );
		
		
		describe( 'isVisible()', function() {
			
			beforeEach( function() {
				mask = new Mask( { target: $el1 } );
			} );
			
			
			it( "should return `false` when the mask is just instantiated", function() {
				expect( mask.isVisible() ).toBe( false );
			} );
			
			
			it( "should return `true` when the mask is shown", function() {
				mask.show();
				expect( mask.isVisible() ).toBe( true );
			} );
			
			
			it( "should return `false` when the mask is shown and then hidden again", function() {
				mask.show();
				mask.hide();
				expect( mask.isVisible() ).toBe( false );
				
				// And another round just for good measure
				mask.show();
				expect( mask.isVisible() ).toBe( true );

				mask.hide();
				expect( mask.isVisible() ).toBe( false );
			} );
			
		} );
		
		
		describe( 'destroy()', function() {
			
			it( "should destroy a newly instantiated (but unrendered) Mask without errors", function() {
				var mask = new Mask( { target: $el1 } );
				
				mask.destroy();
			} );
			
			
			it( "should remove a rendered Mask's elements from the DOM", function() {
				var mask = new Mask( { target: $el1 } );
				
				mask.show();
				expect( jQuery( 'body' ).find( mask.$overlayEl ).length ).toBe( 1 );  // initial condition - is in DOM
				expect( jQuery( 'body' ).find( mask.$contentEl ).length ).toBe( 1 );  // initial condition - is in DOM
				
				mask.destroy();
				expect( jQuery( 'body' ).find( mask.$overlayEl ).length ).toBe( 0 );  // no longer in DOM
				expect( jQuery( 'body' ).find( mask.$contentEl ).length ).toBe( 0 );  // no longer in DOM
			} );
			
			
			it( "should remove any 'render' event listener it has on a `target` gui.Component", function() {
				spyOn( component1, 'un' ).andCallThrough();
				
				var mask = new Mask( { target: component1 } );
				expect( component1.un ).not.toHaveBeenCalled();  // not yet
				
				mask.destroy();
				expect( component1.un ).toHaveBeenCalled();
			} );
			
		} );
		
	} );
	
} );