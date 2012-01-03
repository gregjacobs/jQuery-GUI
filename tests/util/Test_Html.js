/*global Ext, Y, Kevlar */
Ext.test.Session.addTest( 'Kevlar.util', {
	
	name: 'Kevlar.util.Html',
	
	
	/*
	 * Setup / teardown
	 */
	setUp:  function() {
		
	},
	
	tearDown: function() {
		
	},
	
	
	// --------------------------------------
	
	
	"stripTags() should return an identical string when there are no tags" : function() {
		var testString = "this should be unchanged";
		Y.Assert.areSame( testString, Kevlar.util.Html.stripTags( testString ) );
	},
	
	"stripTags() should remove a single pair of tags" : function() {
		Y.Assert.areSame( "I have a span.", Kevlar.util.Html.stripTags( "I have a <span>span</span>." ) );
	},
	
	"stripTags() should work for nested tags" : function() {
		Y.Assert.areSame( "Lorem ipsum dolor", Kevlar.util.Html.stripTags( "<title><i>Lorem</i> <s>ipsum</s> dolor</title>" ) );
	},

	"stripTags() should work for nested tags with newlines" : function() {
		Y.Assert.areSame( "Lorem\nipsum dolor", Kevlar.util.Html.stripTags( "<title><i>Lorem</i>\n<s>ipsum</s> dolor</title>" ) );
	},
	
	
	// ---------------------
	
	
	"nl2br() should return an identical string when there are no newlines" : function() {
		var testString = "this should be unchanged";
		Y.Assert.areSame( testString, Kevlar.util.Html.nl2br( testString ) );
	},
	
	"nl2br() should replace a mid-string newline with a br tag" : function() {
		Y.Assert.areSame( "I have a<br />newline.", Kevlar.util.Html.nl2br( "I have a\nnewline." ) );
	}
	
} );
