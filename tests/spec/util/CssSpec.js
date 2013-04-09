/*global define, describe, it, expect */
define( [
	'jqc/util/Css'
], 
function( Css ) {
	
	describe( 'jqc.util.Css', function() {
	
		describe( 'mapToString()', function() {
			
			it( "should return an empty string when providing an empty map (Object)", function() {
				expect( Css.mapToString( {} ) ).toBe( "" );
			} );
			
		
			it( "should convert a map (Object) of property/value pairs to a CSS string", function() {
				var props = {
					'color'     : 'red',
					'font-size' : '12px'
				};
				
				expect( Css.mapToString( props ) ).toBe( "color:red;font-size:12px;" );
			} );
			
			
			it( "should convert camelCase style properties to their 'dash' form for the resulting string", function() {
				var props = {
					'fontFamily' : 'Arial',
					'fontSize'   : '12px'
				};
				
				expect( Css.mapToString( props ) ).toBe( "font-family:Arial;font-size:12px;" );
			} );
			
		} );
		
		
		describe( 'normalizeSizeValue()', function() {
			
			it( "should convert a number to the number + 'px'", function() {
				expect( Css.normalizeSizeValue( 0 ) ).toBe( '0px' );
				expect( Css.normalizeSizeValue( 10 ) ).toBe( '10px' );
				expect( Css.normalizeSizeValue( 99.5 ) ).toBe( '99.5px' );
			} );
			
			
			it( "should convert a plain number which is in a string, to the number + 'px'", function() {
				expect( Css.normalizeSizeValue( "0" ) ).toBe( '0px' );
				expect( Css.normalizeSizeValue( "10" ) ).toBe( '10px' );
				expect( Css.normalizeSizeValue( "99.5" ) ).toBe( '99.5px' );
			} );
			
			
			it( "should return a percentage, or other size string unchanged", function() {
				expect( Css.normalizeSizeValue( '0%' ) ).toBe( '0%' );
				expect( Css.normalizeSizeValue( '10%' ) ).toBe( '10%' );
				expect( Css.normalizeSizeValue( '99.5%' ) ).toBe( '99.5%' );
				
				expect( Css.normalizeSizeValue( '10em' ) ).toBe( '10em' );
			} );
			
		} );
		
	} );
} );