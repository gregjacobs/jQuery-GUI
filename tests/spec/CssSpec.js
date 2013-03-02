/*global define, describe, it, expect */
define( [
	'ui/Css'
], 
function( Css ) {
	
	describe( 'ui.Css', function() {
	
		it( "hashToString() should return an empty string when providing an empty hash", function() {
			expect( Css.hashToString( {} ) ).toBe( "" );
		} );
		
	
		it( "hashToString() should convert a hash of property/value pairs to a CSS string", function() {
			var props = {
				'color'     : 'red',
				'font-size' : '12px'
			};
			
			expect( Css.hashToString( props ) ).toBe( "color:red;font-size:12px;" );
		} );
		
		
		it( "hashToString() should convert camelCase style properties to their 'dash' form for the resulting string", function() {
			var props = {
				'fontFamily' : 'Arial',
				'fontSize'   : '12px'
			};
			
			expect( Css.hashToString( props ) ).toBe( "font-family:Arial;font-size:12px;" );
		} );
	} );
} );