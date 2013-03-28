/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'ui/Html'
], function( Html ) {

	describe( "ui.Html", function() {
		
		describe( "Test decode()", function() {
			
			it( "decode() should handle encoded spaces", function() {
				var testString = "this should have two &nbsp;spaces";
				expect( Html.decode( testString ) ).toBe( "this should have two  spaces" );
			} );
			
		} );
		
		
		describe( "Test stripTags()", function() {
			
			it( "stripTags() should return an identical string when there are no tags", function() {
				var testString = "this should be unchanged";
				expect( Html.stripTags( testString ) ).toBe( testString );
			} );
			
			
			it( "stripTags() should remove a single pair of tags", function() {
				expect( Html.stripTags( "I have a <span>span</span>." ) ).toBe( "I have a span." );
			} );
			
			
			it( "stripTags() should work for nested tags", function() {
				expect( Html.stripTags( "<title><i>Lorem</i> <s>ipsum</s> dolor</title>" ) ).toBe( "Lorem ipsum dolor" );
			} );
			
			
			it( "stripTags() should work for nested tags with newlines", function() {
				expect( Html.stripTags( "<title><i>Lorem</i>\n<s>ipsum</s> dolor</title>" ) ).toBe( "Lorem\nipsum dolor" );
			} );
			
		} );
		
		
		describe( "Test nl2br()", function() {
			
			it( "nl2br() should return an identical string when there are no newlines", function() {
				var testString = "this should be unchanged";
				expect( Html.nl2br( testString ) ).toBe( testString );
			} );
			
			
			it( "nl2br() should replace a mid-string newline with a br tag", function() {
				expect( Html.nl2br( "I have a\nnewline." ) ).toBe( "I have a<br />newline." );
			} );
			
		} );
		
	} );
	
} );
