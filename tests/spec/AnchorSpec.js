/*global define, describe, it, expect */
/*jshint scripturl:true */
define( [
	'jqc/Anchor'
],
function( Anchor ) {
	
	describe( 'jqc.Anchor', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var anchor = new Anchor();
				
				anchor.render( 'body' );
				
				anchor.destroy();
			} );
			
		} );
		
		
		describe( "rendering", function() {
						
			describe( "`href` config", function() {
								
				it( "should render with an `href` attribute of 'javascript:;' if no `href` config is provided", function() {
					var anchor = new Anchor();
					anchor.render( 'body' );
					
					expect( anchor.getEl().attr( 'href' ) ).toBe( 'javascript:;' );
					
					anchor.destroy();  // clean up
				} );
				
				
				it( "should render with an `href` attribute of 'javascript:;' if the `href` config was an empty string", function() {
					var anchor = new Anchor( {
						href : ""
					} );
					anchor.render( 'body' );
					
					expect( anchor.getEl().attr( 'href' ) ).toBe( 'javascript:;' );
					
					anchor.destroy();  // clean up
				} );
				
				
				it( "should render with an `href` attribute of 'javascript:;' if the `href` config was a string of just whitespace", function() {
					var anchor = new Anchor( {
						href : "   "
					} );
					anchor.render( 'body' );
					
					expect( anchor.getEl().attr( 'href' ) ).toBe( 'javascript:;' );
					
					anchor.destroy();  // clean up
				} );
				
				
				it( "should render with an `href` attribute of the `href` config value provided", function() {
					var anchor = new Anchor( {
						href : "http://google.com"
					} );
					anchor.render( 'body' );
					
					expect( anchor.getEl().attr( 'href' ) ).toBe( "http://google.com" );
					
					anchor.destroy();  // clean up
				} );
				
			} );
			
			
			describe( "`target` config", function() {
				
				it( "should render with no `target` attribute if no `target` config was provided", function() {
					var anchor = new Anchor();
					anchor.render( 'body' );
					
					expect( anchor.getEl().attr( 'target' ) ).toBeUndefined();
					
					anchor.destroy();  // clean up
				} );
				
				
				it( "should render with a `target` attribute of the `target` config provided", function() {
					var anchor = new Anchor( {
						target : '_blank'
					} );
					anchor.render( 'body' );
					
					expect( anchor.getEl().attr( 'target' ) ).toBe( "_blank" );
					
					anchor.destroy();  // clean up
				} );
				
			} );
			
			
			describe( "`text` config", function() {
				
				it( "should render with no text if no `text` config was provided", function() {
					var anchor = new Anchor();
					anchor.render( 'body' );
					
					expect( anchor.getEl().html() ).toBe( "" );
					
					anchor.destroy();  // clean up
				} );
				
				
				it( "should render with the value of the `text` config", function() {
					var anchor = new Anchor( {
						text : "Test Anchor"
					} );
					anchor.render( 'body' );
					
					expect( anchor.getEl().html() ).toBe( "Test Anchor" );
					
					anchor.destroy();  // clean up
				} );
				
				it( "should render with the value of the `html` config, if that config is provided instead of `text`", function() {
					var anchor = new Anchor( {
						html : "Test Anchor HTML"
					} );
					anchor.render( 'body' );
					
					expect( anchor.getEl().html() ).toBe( "Test Anchor HTML" );
					
					anchor.destroy();  // clean up
				} );
				
			} );
			
		} );
		
		
		describe( 'normalizeHref()', function() {
			
			it( "should return 'javascript:;' if an empty value or only whitespace is provided", function() {
				var anchor = new Anchor();
				
				expect( anchor.normalizeHref( "" ) ).toBe( "javascript:;" );
				expect( anchor.normalizeHref( "  " ) ).toBe( "javascript:;" );
				
				anchor.destroy();  // clean up
			} );
			
			
			it( "should return any provided string, trimming its value", function() {
				var anchor = new Anchor();
				
				expect( anchor.normalizeHref( "TestStr" ) ).toBe( "TestStr" );
				expect( anchor.normalizeHref( "   TestStr  " ) ).toBe( "TestStr" );
				
				anchor.destroy();  // clean up
			} );
			
		} );
		
		
		describe( 'setHref()', function() {
			
			it( "should set the `href` config behind the scenes if the component is not rendered yet", function() {
				var anchor = new Anchor();
				anchor.setHref( "http://google.com" );
				
				// Now render, and check
				anchor.render( 'body' );
				expect( anchor.getEl().attr( 'href' ) ).toBe( "http://google.com" );
				
				anchor.destroy();  // clean up
			} );
			
			
			it( "should set the `href` attribute of the anchor if it is already rendered", function() {
				var anchor = new Anchor();
				anchor.render( 'body' );   // render first
				
				anchor.setHref( "http://google.com" );
				expect( anchor.getEl().attr( 'href' ) ).toBe( "http://google.com" );
				
				anchor.destroy();  // clean up
			} );
			
			
			it( "should be chainable, both when unrendered and rendered", function() {
				var anchor = new Anchor();
				
				// Check while unrendered
				expect( anchor.setHref( "http://google.com" ) ).toBe( anchor );
				
				// Now render and test again
				anchor.render( 'body' );
				expect( anchor.setHref( "http://yahoo.com" ) ).toBe( anchor );
				
				anchor.destroy();  // clean up
			} );
			
		} );
		
		
		describe( 'setText()', function() {
			
			it( "should set the `html` config behind the scenes if the component is not rendered yet", function() {
				var anchor = new Anchor();
				anchor.setText( "Test Anchor" );
				
				// Now render, and check
				anchor.render( 'body' );
				expect( anchor.getEl().html() ).toBe( "Test Anchor" );
				
				anchor.destroy();  // clean up
			} );
			
			
			it( "should set the innerHTML of the anchor if it is already rendered", function() {
				var anchor = new Anchor();
				anchor.render( 'body' );   // render first
				
				anchor.setText( "Test Anchor" );
				expect( anchor.getEl().html() ).toBe( "Test Anchor" );
				
				anchor.destroy();  // clean up
			} );
			
			
			it( "should be chainable, both when unrendered and rendered", function() {
				var anchor = new Anchor();
				
				// Check while unrendered
				expect( anchor.setText( "Test Anchor" ) ).toBe( anchor );
				
				// Now render and test again
				anchor.render( 'body' );
				expect( anchor.setText( "Test Anchor, Again" ) ).toBe( anchor );
				
				anchor.destroy();  // clean up
			} );
			
		} );
		
		
		describe( "click functionality", function() {
			
			it( "should fire the 'click' event when clicked", function() {
				var anchor = new Anchor();
				anchor.render( 'body' );
				
				var clickEventCount = 0;
				anchor.on( 'click', function( cmp ) { 
					clickEventCount++;
					expect( cmp ).toBe( anchor );  // make sure the anchor component was provided as the first argument
				} );
				
				anchor.getEl().trigger( 'click' );
				expect( clickEventCount ).toBe( 1 );  // make sure the event was fired
				
				anchor.destroy();  // clean up
			} );
			
			
			it( "should prevent the 'click' event from firing if a 'beforeclick' handler returns false", function() {
				var anchor = new Anchor();
				anchor.render( 'body' );
				
				var beforeclickEventCount = 0,
				    clickEventCount = 0;
				
				anchor.on( {
					'beforeclick' : function( cmp ) {
						beforeclickEventCount++;
						expect( cmp ).toBe( anchor );  // make sure the anchor component was provided as the first argument
						
						return false;  // return false to prevent 'click' event from firing
					},
					'click' : function( cmp ) {
						clickEventCount++;
					}
				} );
				
				anchor.getEl().trigger( 'click' );
				expect( beforeclickEventCount ).toBe( 1 );  // make sure the 'beforeclick' event was fired
				expect( clickEventCount ).toBe( 0 );  // make sure the 'click' event was *not* fired
				
				anchor.destroy();  // clean up
			} );
			
		} );
		
	} );

} );