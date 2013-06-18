/*global define, describe, it, expect */
define( [
	'jqc/util/Css'
], 
function( Css ) {
	
	describe( 'jqc.util.Css', function() {
		
		describe( 'addCls()', function() {
			
			it( "should add CSS classes to an empty string", function() {
				expect( Css.addCls( "", "" ) ).toBe( "" );
				expect( Css.addCls( "", "class1" ) ).toBe( "class1" );
				expect( Css.addCls( "", "class1 class2" ) ).toBe( "class1 class2" );
				expect( Css.addCls( "", "class1 class2 class3" ) ).toBe( "class1 class2 class3" );
			} );
			
			
			it( "should not add duplicate CSS classes to a string of CSS classes", function() {
				expect( Css.addCls( "class1", "class1" ) ).toBe( "class1" );
				expect( Css.addCls( "class1 class2", "class1 class2" ) ).toBe( "class1 class2" );
				expect( Css.addCls( "class1 class2 class3", "class1 class2 class3" ) ).toBe( "class1 class2 class3" );

				expect( Css.addCls( "class1", "class1 class2" ) ).toBe( "class1 class2" );
				expect( Css.addCls( "class1", "class1 class2 class3" ) ).toBe( "class1 class2 class3" );

				expect( Css.addCls( "class1", "class1 class1 class2 class2" ) ).toBe( "class1 class2" );
			} );
			
			
			it( "should handle extra spaces in the arguments where they don't really belong", function() {
				expect( Css.addCls( "  ", "   " ) ).toBe( "" );
				expect( Css.addCls( "", "  class1   " ) ).toBe( "class1" );
				expect( Css.addCls( "   ", "class1" ) ).toBe( "class1" );
				expect( Css.addCls( "     ", "  class1   " ) ).toBe( "class1" );
				expect( Css.addCls( "  class1    class2 ", "  class3   class4    " ) ).toBe( "class1 class2 class3 class4" );
			} );
			
		} );
		
		
		describe( 'removeCls()', function() {

			it( "should have no effect on an empty string of CSS classes", function() {
				expect( Css.removeCls( "", "" ) ).toBe( "" );
				expect( Css.removeCls( "", "class1" ) ).toBe( "" );
				expect( Css.removeCls( "", "class1 class2" ) ).toBe( "" );
				expect( Css.removeCls( "", "class1 class2 class3" ) ).toBe( "" );
			} );
			
			
			it( "should remove CSS classes from the string of CSS classes", function() {
				expect( Css.removeCls( "class1 class2", "class1" ) ).toBe( "class2" );
				expect( Css.removeCls( "class1 class2", "class1 class2" ) ).toBe( "" );
				expect( Css.removeCls( "class1 class2 class3", "class1 class2" ) ).toBe( "class3" );
				expect( Css.removeCls( "class1 class2", "class3" ) ).toBe( "class1 class2" );  // (class3 didn't exist in the `str`, so no removal)
				expect( Css.removeCls( "class1 class2 class3", "class3" ) ).toBe( "class1 class2" );
			} );
			

			it( "should handle extra spaces in the arguments where they don't really belong", function() {
				expect( Css.removeCls( "   ", "   " ) ).toBe( "" );
				expect( Css.removeCls( "   ", "class1" ) ).toBe( "" );
				expect( Css.removeCls( "class1", "   " ) ).toBe( "class1" );
				expect( Css.removeCls( "  class1 class2", "class1   " ) ).toBe( "class2" );
				expect( Css.removeCls( " class1    class2", "class1   class2" ) ).toBe( "" );
				expect( Css.removeCls( "class1 class2   class3  ", " class1    class2" ) ).toBe( "class3" );
				expect( Css.removeCls( "   class1   class2   class3  ", "  class3   " ) ).toBe( "class1 class2" );
			} );
			
		} );
		
		
		describe( 'hasCls()', function() {
			
			it( "should return true if the given CSS class exists in the string of CSS classes", function() {
				expect( Css.hasCls( "class1", "class1" ) ).toBe( true );
				expect( Css.hasCls( "class1 class2", "class1" ) ).toBe( true );
				expect( Css.hasCls( "class1 class2", "class2" ) ).toBe( true );
				expect( Css.hasCls( "class1 class2 class3", "class1" ) ).toBe( true );
				expect( Css.hasCls( "class1 class2 class3", "class2" ) ).toBe( true );
				expect( Css.hasCls( "class1 class2 class3", "class3" ) ).toBe( true );
			} );
			
			
			it( "should return false if the given CSS class does not exist in the string of CSS classes", function() {
				expect( Css.hasCls( "class1", "class2" ) ).toBe( false );
				expect( Css.hasCls( "class1 class2", "class3" ) ).toBe( false );
				expect( Css.hasCls( "class1 class2", "class3" ) ).toBe( false );
				expect( Css.hasCls( "class1 class2 class3", "class4" ) ).toBe( false );
				
				// Test the cssClass being a substring of a CSS class in the string
				expect( Css.hasCls( "class1", "class" ) ).toBe( false );
				expect( Css.hasCls( "class1 class2", "class" ) ).toBe( false );
				expect( Css.hasCls( "class1 class2", "class" ) ).toBe( false );
				expect( Css.hasCls( "class1 class2 class3", "class" ) ).toBe( false );
			} );
			
			
			it( "should return false if there are no CSS classes in the CSS class string, or if the CSS class provided is the empty string", function() {
				expect( Css.hasCls( "", "" ) ).toBe( false );
				expect( Css.hasCls( "", "class1" ) ).toBe( false );
				expect( Css.hasCls( "class1", "" ) ).toBe( false );
			} );
			
			
			it( "should handle extra whitespace arguments", function() {
				expect( Css.hasCls( "  ", " " ) ).toBe( false );
				expect( Css.hasCls( "  ", "  " ) ).toBe( false );
				expect( Css.hasCls( " ", "  class1  " ) ).toBe( false );
				expect( Css.hasCls( "  class1  ", "  " ) ).toBe( false );
				
				expect( Css.hasCls( "  class1    class2", "class1" ) ).toBe( true );
				expect( Css.hasCls( "class1    class2  ", "class1" ) ).toBe( true );
				expect( Css.hasCls( "  class1    class2", "class2" ) ).toBe( true );
				expect( Css.hasCls( "class1    class2  ", "class2" ) ).toBe( true );
				expect( Css.hasCls( "  class1    class2  class3", "class3" ) ).toBe( true );
				expect( Css.hasCls( "class1    class2  class3  ", "class3" ) ).toBe( true );
			} );
			
		} );
		
	
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