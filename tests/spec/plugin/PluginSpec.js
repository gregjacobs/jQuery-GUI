/*global define, describe, it, expect */
define( [
	'Class',
	'jqc/plugin/Plugin'
],
function( Class, Plugin ) {
	
	describe( 'jqc.plugin.Plugin', function() {
		
		describe( 'constructor', function() {
			
			it( "should assign the properties provided on the config object to the Plugin itself", function() {
				var MyPlugin = Class.extend( Plugin, {
					init : function() {}
				} );
				
				var pluginInstance = new MyPlugin( {
					someConfig : 1
				} );
				expect( pluginInstance.someConfig ).toBe( 1 );
			} );
			
		} );
		
	} );
	
} );