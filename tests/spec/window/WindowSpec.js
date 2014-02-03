/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'gui/window/Window'
], function( Window ) {
	
	describe( 'gui.window.Window', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, shown (rendered), and destroyed", function() {
				var window = new Window();
				window.show();
				
				window.destroy();
			} );
			
		} );
		
		
		describe( "configs", function() {
			
			describe( "`bodyCls` config", function() {
				
				it( "should add the given CSS class to the Window's body element when provided", function() {
					var window = new Window( {
						bodyCls : 'myBodyClass'
					} );
					window.render( 'body' );  // render to the document body
					
					expect( window.$bodyEl.hasClass( 'myBodyClass' ) ).toBe( true );
					
					window.destroy();  // clean up
				} );
				
				it( "should add the given multiple CSS classes to the Window's body element when provided", function() {
					var window = new Window( {
						bodyCls : 'myBodyClass1 myBodyClass2'
					} );
					window.render( 'body' );  // render to the document body

					expect( window.$bodyEl.hasClass( 'myBodyClass1' ) ).toBe( true );
					expect( window.$bodyEl.hasClass( 'myBodyClass2' ) ).toBe( true );
					
					window.destroy();  // clean up
				} );
				
			} );
			
			describe( "`bodyStyle` config", function() {
				
				it( "should not add any styles to the Window's body element when not provided", function() {
					var window = new Window();
					window.render( 'body' );  // render to the document body
					
					expect( window.$bodyEl.attr( 'style' ) ).toBeUndefined();
					
					window.destroy();  // clean up
				} );
				
				it( "should add any styles to the Window's body element when provided", function() {
					var window = new Window( {
						bodyStyle : {
							'text-decoration' : 'underline'
						}
					} );
					window.render( 'body' );  // render to the document body
					
					expect( window.$bodyEl.attr( 'style' ) ).toMatch( /^text-decoration:\s*underline;$/ );
					
					window.destroy();  // clean up
				} );
				
			} );
			
		} );
		
		
		// -----------------------------------
		
		
		describe( 'addBodyCls()', function() {
			var window;
			
			beforeEach( function() {
				window = new Window();
			} );
			
			afterEach( function() {
				window.destroy();
			} );
			
			
			it( "should add one or more CSS classes to the window's body, in its unrendered state", function() {
				window.addBodyCls( 'myBodyClass1' );
				window.addBodyCls( 'myBodyClass2' );
				window.addBodyCls( 'myBodyClass3 myBodyClass4' );
				
				window.render( 'body' );  // render to the document body
				
				var $windowBodyEl = window.getBodyEl();
				expect( $windowBodyEl.hasClass( 'myBodyClass1' ) ).toBe( true );
				expect( $windowBodyEl.hasClass( 'myBodyClass2' ) ).toBe( true );
				expect( $windowBodyEl.hasClass( 'myBodyClass3' ) ).toBe( true );
				expect( $windowBodyEl.hasClass( 'myBodyClass4' ) ).toBe( true );
			} );
			
			
			it( "should add one or more CSS classes to the window's body, in its rendered state", function() {
				window.render( 'body' );  // render to the document body
				
				window.addBodyCls( 'myBodyClass1' );
				window.addBodyCls( 'myBodyClass2' );
				window.addBodyCls( 'myBodyClass3 myBodyClass4' );
				
				var $windowBodyEl = window.getBodyEl();
				expect( $windowBodyEl.hasClass( 'myBodyClass1' ) ).toBe( true );
				expect( $windowBodyEl.hasClass( 'myBodyClass2' ) ).toBe( true );
				expect( $windowBodyEl.hasClass( 'myBodyClass3' ) ).toBe( true );
				expect( $windowBodyEl.hasClass( 'myBodyClass4' ) ).toBe( true );
			} );
			
		} );
		
		
		describe( 'removeBodyCls()', function() {
			var window;
			
			beforeEach( function() {
				window = new Window( {
					bodyCls : 'myBodyClass1 myBodyClass2 myBodyClass3 myBodyClass4'
				} );
			} );
			
			afterEach( function() {
				window.destroy();
			} );
			
			
			it( "should remove one or more CSS classes from the window's body, in its unrendered state", function() {
				window.removeBodyCls( 'myBodyClass1' );
				window.removeBodyCls( 'myBodyClass3 myBodyClass4' );
				
				window.render( 'body' );  // render to the document body
				
				var $windowBodyEl = window.getBodyEl();
				expect( $windowBodyEl.hasClass( 'myBodyClass1' ) ).toBe( false );
				expect( $windowBodyEl.hasClass( 'myBodyClass2' ) ).toBe( true );
				expect( $windowBodyEl.hasClass( 'myBodyClass3' ) ).toBe( false );
				expect( $windowBodyEl.hasClass( 'myBodyClass4' ) ).toBe( false );
			} );
			
			
			it( "should remove one or more CSS classes from the window's body, in its rendered state", function() {
				window.render( 'body' );  // render to the document body

				window.removeBodyCls( 'myBodyClass1' );
				window.removeBodyCls( 'myBodyClass3 myBodyClass4' );
				
				var $windowBodyEl = window.getBodyEl();
				expect( $windowBodyEl.hasClass( 'myBodyClass1' ) ).toBe( false );
				expect( $windowBodyEl.hasClass( 'myBodyClass2' ) ).toBe( true );
				expect( $windowBodyEl.hasClass( 'myBodyClass3' ) ).toBe( false );
				expect( $windowBodyEl.hasClass( 'myBodyClass4' ) ).toBe( false );
			} );
			
		} );
		
		
		describe( 'hasBodyCls()', function() {
			var window;
			
			beforeEach( function() {
				window = new Window();
			} );
			
			afterEach( function() {
				window.destroy();
			} );
			
			
			it( "should determine if the body element has the given CSS classes, in the Window's unrendered state", function() {
				window.addBodyCls( 'myBodyClass1' );
				window.addBodyCls( 'myBodyClass2' );
				window.addBodyCls( 'myBodyClass3 myBodyClass4' );

				expect( window.hasBodyCls( 'myBodyClass1' ) ).toBe( true );
				expect( window.hasBodyCls( 'myBodyClass2' ) ).toBe( true );
				expect( window.hasBodyCls( 'myBodyClass3' ) ).toBe( true );
				expect( window.hasBodyCls( 'myBodyClass4' ) ).toBe( true );
				expect( window.hasBodyCls( 'myBodyClass5' ) ).toBe( false );
			} );
			
			
			it( "should determine if the body element has the given CSS classes, in the Window's rendered state", function() {
				window.addBodyCls( 'myBodyClass1' );
				window.addBodyCls( 'myBodyClass2' );
				window.addBodyCls( 'myBodyClass3 myBodyClass4' );
				
				window.render( 'body' );

				expect( window.hasBodyCls( 'myBodyClass1' ) ).toBe( true );
				expect( window.hasBodyCls( 'myBodyClass2' ) ).toBe( true );
				expect( window.hasBodyCls( 'myBodyClass3' ) ).toBe( true );
				expect( window.hasBodyCls( 'myBodyClass4' ) ).toBe( true );
				expect( window.hasBodyCls( 'myBodyClass5' ) ).toBe( false );
			} );
			
		} );
		
		
		describe( 'setBodyStyle()', function() {
			var window;
			
			beforeEach( function() {
				window = new Window();
			} );
			
			afterEach( function() {
				window.destroy();
			} );
			
			
			it( "should add one or more CSS styles to the window's body, in its unrendered state", function() {
				// Use non-inherited CSS properties
				window.setBodyStyle( 'padding-top', '1px' );
				window.setBodyStyle( { 'padding-left': '2px', 'padding-right': '3px' } );
				
				window.render( 'body' );  // render to the document body
				
				var $windowBodyEl = window.getBodyEl();
				expect( $windowBodyEl.css( 'padding-top' ) ).toBe( '1px' );
				expect( $windowBodyEl.css( 'padding-left' ) ).toBe( '2px' );
				expect( $windowBodyEl.css( 'padding-right' ) ).toBe( '3px' );
			} );
			
			
			it( "should add one or more CSS styles to the window's body, in its rendered state", function() {
				window.render( 'body' );  // render to the document body

				// Use non-inherited CSS properties
				window.setBodyStyle( 'padding-top', '1px' );
				window.setBodyStyle( { 'padding-left': '2px', 'padding-right': '3px' } );
				
				var $windowBodyEl = window.getBodyEl();
				expect( $windowBodyEl.css( 'padding-top' ) ).toBe( '1px' );
				expect( $windowBodyEl.css( 'padding-left' ) ).toBe( '2px' );
				expect( $windowBodyEl.css( 'padding-right' ) ).toBe( '3px' );
			} );
			
		} );
		
	} );
	
} );