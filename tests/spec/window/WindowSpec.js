/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jqGui/window/Window'
], function( Window ) {
	
	describe( 'jqGui.window.Window', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, shown (rendered), and destroyed", function() {
				var window = new Window();
				window.show();
				
				window.destroy();
			} );
			
		} );
		
	} );
	
} );