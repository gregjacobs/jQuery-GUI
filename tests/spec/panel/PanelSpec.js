/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jqGui/panel/Panel'
],
function( Panel ) {
	
	describe( 'jqGui.panel.Panel', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var panel = new Panel();
				
				panel.render( 'body' );
				
				panel.destroy();
			} );
			
		} );
		
		
		describe( "configs", function() {
			
			describe( "`bodyCls` config", function() {
				
				it( "should add the given CSS class to the Panel's body element when provided", function() {
					var panel = new Panel( {
						bodyCls : 'myBodyClass'
					} );
					panel.render( 'body' );  // render to the document body
					
					expect( panel.$bodyEl.hasClass( 'myBodyClass' ) ).toBe( true );
				} );
				
				it( "should add the given multiple CSS classes to the Panel's body element when provided", function() {
					var panel = new Panel( {
						bodyCls : 'myBodyClass1 myBodyClass2'
					} );
					panel.render( 'body' );  // render to the document body

					expect( panel.$bodyEl.hasClass( 'myBodyClass1' ) ).toBe( true );
					expect( panel.$bodyEl.hasClass( 'myBodyClass2' ) ).toBe( true );
				} );
				
			} );
			
			describe( "`bodyStyle` config", function() {
				
				it( "should not add any styles to the Panel's body element when not provided", function() {
					var panel = new Panel();
					panel.render( 'body' );  // render to the document body
					
					expect( panel.$bodyEl.attr( 'style' ) ).toBeUndefined();
				} );
				
				it( "should add any styles to the Panel's body element when provided", function() {
					var panel = new Panel( {
						bodyStyle : {
							'text-decoration' : 'underline'
						}
					} );
					panel.render( 'body' );  // render to the document body
					
					expect( panel.$bodyEl.attr( 'style' ) ).toMatch( /^text-decoration:\s*underline;$/ );
				} );
				
			} );
			
		} );
		
		
		// -----------------------------------
		
		
		describe( 'addBodyCls()', function() {
			var panel;
			
			beforeEach( function() {
				panel = new Panel();
			} );
			
			afterEach( function() {
				panel.destroy();
			} );
			
			
			it( "should add one or more CSS classes to the panel's body, in its unrendered state", function() {
				panel.addBodyCls( 'myBodyClass1' );
				panel.addBodyCls( 'myBodyClass2' );
				panel.addBodyCls( 'myBodyClass3 myBodyClass4' );
				
				panel.render( 'body' );  // render to the document body
				
				var $panelBodyEl = panel.getBodyEl();
				expect( $panelBodyEl.hasClass( 'myBodyClass1' ) ).toBe( true );
				expect( $panelBodyEl.hasClass( 'myBodyClass2' ) ).toBe( true );
				expect( $panelBodyEl.hasClass( 'myBodyClass3' ) ).toBe( true );
				expect( $panelBodyEl.hasClass( 'myBodyClass4' ) ).toBe( true );
			} );
			
			
			it( "should add one or more CSS classes to the panel's body, in its rendered state", function() {
				panel.render( 'body' );  // render to the document body
				
				panel.addBodyCls( 'myBodyClass1' );
				panel.addBodyCls( 'myBodyClass2' );
				panel.addBodyCls( 'myBodyClass3 myBodyClass4' );
				
				var $panelBodyEl = panel.getBodyEl();
				expect( $panelBodyEl.hasClass( 'myBodyClass1' ) ).toBe( true );
				expect( $panelBodyEl.hasClass( 'myBodyClass2' ) ).toBe( true );
				expect( $panelBodyEl.hasClass( 'myBodyClass3' ) ).toBe( true );
				expect( $panelBodyEl.hasClass( 'myBodyClass4' ) ).toBe( true );
			} );
			
		} );
		
		
		describe( 'removeBodyCls()', function() {
			var panel;
			
			beforeEach( function() {
				panel = new Panel( {
					bodyCls : 'myBodyClass1 myBodyClass2 myBodyClass3 myBodyClass4'
				} );
			} );
			
			afterEach( function() {
				panel.destroy();
			} );
			
			
			it( "should remove one or more CSS classes from the panel's body, in its unrendered state", function() {
				panel.removeBodyCls( 'myBodyClass1' );
				panel.removeBodyCls( 'myBodyClass3 myBodyClass4' );
				
				panel.render( 'body' );  // render to the document body
				
				var $panelBodyEl = panel.getBodyEl();
				expect( $panelBodyEl.hasClass( 'myBodyClass1' ) ).toBe( false );
				expect( $panelBodyEl.hasClass( 'myBodyClass2' ) ).toBe( true );
				expect( $panelBodyEl.hasClass( 'myBodyClass3' ) ).toBe( false );
				expect( $panelBodyEl.hasClass( 'myBodyClass4' ) ).toBe( false );
			} );
			
			
			it( "should remove one or more CSS classes from the panel's body, in its rendered state", function() {
				panel.render( 'body' );  // render to the document body

				panel.removeBodyCls( 'myBodyClass1' );
				panel.removeBodyCls( 'myBodyClass3 myBodyClass4' );
				
				var $panelBodyEl = panel.getBodyEl();
				expect( $panelBodyEl.hasClass( 'myBodyClass1' ) ).toBe( false );
				expect( $panelBodyEl.hasClass( 'myBodyClass2' ) ).toBe( true );
				expect( $panelBodyEl.hasClass( 'myBodyClass3' ) ).toBe( false );
				expect( $panelBodyEl.hasClass( 'myBodyClass4' ) ).toBe( false );
			} );
			
		} );
		
		
		describe( 'hasBodyCls()', function() {
			var panel;
			
			beforeEach( function() {
				panel = new Panel();
			} );
			
			afterEach( function() {
				panel.destroy();
			} );
			
			
			it( "should determine if the body element has the given CSS classes, in the Panel's unrendered state", function() {
				panel.addBodyCls( 'myBodyClass1' );
				panel.addBodyCls( 'myBodyClass2' );
				panel.addBodyCls( 'myBodyClass3 myBodyClass4' );

				expect( panel.hasBodyCls( 'myBodyClass1' ) ).toBe( true );
				expect( panel.hasBodyCls( 'myBodyClass2' ) ).toBe( true );
				expect( panel.hasBodyCls( 'myBodyClass3' ) ).toBe( true );
				expect( panel.hasBodyCls( 'myBodyClass4' ) ).toBe( true );
				expect( panel.hasBodyCls( 'myBodyClass5' ) ).toBe( false );
			} );
			
			
			it( "should determine if the body element has the given CSS classes, in the Panel's rendered state", function() {
				panel.addBodyCls( 'myBodyClass1' );
				panel.addBodyCls( 'myBodyClass2' );
				panel.addBodyCls( 'myBodyClass3 myBodyClass4' );
				
				panel.render( 'body' );

				expect( panel.hasBodyCls( 'myBodyClass1' ) ).toBe( true );
				expect( panel.hasBodyCls( 'myBodyClass2' ) ).toBe( true );
				expect( panel.hasBodyCls( 'myBodyClass3' ) ).toBe( true );
				expect( panel.hasBodyCls( 'myBodyClass4' ) ).toBe( true );
				expect( panel.hasBodyCls( 'myBodyClass5' ) ).toBe( false );
			} );
			
		} );
		
		
		describe( 'setBodyStyle()', function() {
			var panel;
			
			beforeEach( function() {
				panel = new Panel();
			} );
			
			afterEach( function() {
				panel.destroy();
			} );
			
			
			it( "should add one or more CSS styles to the panel's body, in its unrendered state", function() {
				// Use non-inherited CSS properties
				panel.setBodyStyle( 'padding-top', '1px' );
				panel.setBodyStyle( { 'padding-left': '2px', 'padding-right': '3px' } );
				
				panel.render( 'body' );  // render to the document body
				
				var $panelBodyEl = panel.getBodyEl();
				expect( $panelBodyEl.css( 'padding-top' ) ).toBe( '1px' );
				expect( $panelBodyEl.css( 'padding-left' ) ).toBe( '2px' );
				expect( $panelBodyEl.css( 'padding-right' ) ).toBe( '3px' );
			} );
			
			
			it( "should add one or more CSS styles to the panel's body, in its rendered state", function() {
				panel.render( 'body' );  // render to the document body

				// Use non-inherited CSS properties
				panel.setBodyStyle( 'padding-top', '1px' );
				panel.setBodyStyle( { 'padding-left': '2px', 'padding-right': '3px' } );
				
				var $panelBodyEl = panel.getBodyEl();
				expect( $panelBodyEl.css( 'padding-top' ) ).toBe( '1px' );
				expect( $panelBodyEl.css( 'padding-left' ) ).toBe( '2px' );
				expect( $panelBodyEl.css( 'padding-right' ) ).toBe( '3px' );
			} );
			
		} );
		
	} );

} );