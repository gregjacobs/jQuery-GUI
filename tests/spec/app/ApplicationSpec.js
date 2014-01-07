/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'gui/app/Application',
	'gui/app/Controller',
	'gui/Viewport'
], function( Application, Controller, Viewport ) {
	
	describe( 'gui.app.Application', function() {
		
		describe( 'constructor', function() {
			
			it( "should throw an error if a Viewport is not returned from createViewport()", function() {
				var MyApplication = Application.extend( {
					createViewport : function() {}  // note: no return value
				} );
				
				expect( function() {
					var app = new MyApplication();
				} ).toThrow( "Error: No viewport returned by createViewport() method" );
			} );
			
			
			it( "should store the Viewport which is returned from createViewport() as the `viewport` property", function() {
				var viewport = new Viewport();
				var MyApplication = Application.extend( {
					createViewport : function() { return viewport; }
				} );
				
				var app = new MyApplication();
				expect( app.viewport ).toBe( viewport );
			} );
			
		} );
		
	} );
	
} );