/*global define, describe, it, expect */
define( [
	'ui/panel/Panel'
],
function( Panel ) {
	
	describe( 'ui.panel.Panel', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var panel = new Panel();
				
				panel.render( 'body' );
				
				panel.destroy();
			} );
			
		} );
		
		
		describe( "configs", function() {
			
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
		
	} );

} );