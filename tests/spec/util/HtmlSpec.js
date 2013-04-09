/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jqc/util/Html'
], function( Html ) {

	describe( 'jqc.util.Html', function() {
		
		describe( 'decode()', function() {
			
			it( "should handle encoded spaces", function() {
				var testString = "this should have two &nbsp;spaces";
				expect( Html.decode( testString ) ).toBe( "this should have two  spaces" );
			} );
			
		} );
		
		
		describe( 'stripTags()', function() {
			
			it( "should return an identical string when there are no tags", function() {
				var testString = "this should be unchanged";
				expect( Html.stripTags( testString ) ).toBe( testString );
			} );
			
			
			it( "should remove a single pair of tags", function() {
				expect( Html.stripTags( "I have a <span>span</span>." ) ).toBe( "I have a span." );
			} );
			
			
			it( "should work for nested tags", function() {
				expect( Html.stripTags( "<title><i>Lorem</i> <s>ipsum</s> dolor</title>" ) ).toBe( "Lorem ipsum dolor" );
			} );
			
			
			it( "should work for nested tags with newlines", function() {
				expect( Html.stripTags( "<title><i>Lorem</i>\n<s>ipsum</s> dolor</title>" ) ).toBe( "Lorem\nipsum dolor" );
			} );
			
		} );
		
		
		describe( 'nl2br()', function() {
			
			it( "should return an identical string when there are no newlines", function() {
				var testString = "this should be unchanged";
				expect( Html.nl2br( testString ) ).toBe( testString );
			} );
			
			
			it( "should replace a mid-string newline with a br tag", function() {
				expect( Html.nl2br( "I have a\nnewline." ) ).toBe( "I have a<br />newline." );
			} );
			
		} );
		
		
		describe( 'attrMapToString()', function() {
			
			it( "should return an empty string when providing an empty map (Object)", function() {
				expect( Html.attrMapToString( {} ) ).toBe( "" );
			} );
			
		
			it( "should convert an Object (map) of attribute name/value pairs to a tag string", function() {
				var attrs = {
					'id'    : 'myElement',
					'title' : "My Tooltip"
				};
				
				expect( Html.attrMapToString( attrs ) ).toBe( 'id="myElement" title="My Tooltip"' );
			} );
			
		} );
		
	} );
	
} );
