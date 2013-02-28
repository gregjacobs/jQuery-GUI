/*global tests, Ext, Y, Jux */
tests.unit.Jux.util.add( new Ext.test.Suite( {
	
	name: 'Html',
	
	
	
	items : [
		
		/*
		 * Test decode()
		 */
		{
			name : "Test decode()",
			
			
			"decode() should handle encoded spaces" : function() {
				var testString = "this should have two &nbsp;spaces";
				Y.Assert.areSame( "this should have two  spaces", Jux.util.Html.decode( testString ) );
			}
		},
		
		
		// --------------------------------------
			
		
		/*
		 * Test stripTags()
		 */
		{
			name : "Test stripTags()",
			
			
			"stripTags() should return an identical string when there are no tags" : function() {
				var testString = "this should be unchanged";
				Y.Assert.areSame( testString, Jux.util.Html.stripTags( testString ) );
			},
			
			"stripTags() should remove a single pair of tags" : function() {
				Y.Assert.areSame( "I have a span.", Jux.util.Html.stripTags( "I have a <span>span</span>." ) );
			},
			
			"stripTags() should work for nested tags" : function() {
				Y.Assert.areSame( "Lorem ipsum dolor", Jux.util.Html.stripTags( "<title><i>Lorem</i> <s>ipsum</s> dolor</title>" ) );
			},
		
			"stripTags() should work for nested tags with newlines" : function() {
				Y.Assert.areSame( "Lorem\nipsum dolor", Jux.util.Html.stripTags( "<title><i>Lorem</i>\n<s>ipsum</s> dolor</title>" ) );
			}
		},
			
			
		
		// --------------------------------------
		
		
		/*
		 * Test nl2br()
		 */
		{
			name : "Test nl2br()",
			
			
			"nl2br() should return an identical string when there are no newlines" : function() {
				var testString = "this should be unchanged";
				Y.Assert.areSame( testString, Jux.util.Html.nl2br( testString ) );
			},
			
			"nl2br() should replace a mid-string newline with a br tag" : function() {
				Y.Assert.areSame( "I have a<br />newline.", Jux.util.Html.nl2br( "I have a\nnewline." ) );
			}
		}
	]
	
} ) );
