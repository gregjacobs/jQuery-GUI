define( function() {
	
	var trimRegex = /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g;
  
	
	/**
	 * @class UI.StringUtil
	 * @singleton
	 * 
	 * Utility class for working with strings, beyond what the JavaScript API provides.
	 */
	var StringUtil = {
		
		/**
		 * Returns the html with all tags stripped.
		 * 
		 * @param {String} v The html to be stripped.
		 * @return {String} The resulting text.
		 */
		stripTags : function( v ) {
			return !v ? v : String( v ).replace( /<[^>]+>/g, "" );
		},
		
		
		/**
		 * Removes whitespace from either end of a string.
		 * 
		 * Ex: "   foo bar  "  is turned into "foo bar".
		 * 
		 * @param {String} v The string to trim.
		 * @return {String} The trimmed string.
		 */
		trim : function( v ) {
			return string.replace( trimRegex, "" );
		},
		

		/**
		 * Truncate a string and add an ellipsis ('...') to the end if it exceeds the specified length
		 * 
		 * @method ellipsis
		 * @param {String} value The string to truncate
		 * @param {Number} length The maximum length to allow before truncating
		 * @param {Boolean} [word=false] True to try to find a common work break.
		 * @return {String} The converted text
		 */
		ellipsis : function(value, len, word) {
			if (value && value.length > len) {
				if (word) {
					var vs = value.substr(0, len - 2),
						index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
						
					if (index == -1 || index < (len - 15)) {
						return value.substr(0, len - 3) + "...";
					} else {
						return vs.substr(0, index) + "...";
					}
				} else {
					return value.substr(0, len - 3) + "...";
				}
			}
			return value;
		}
		
	};

	
	return StringUtil;
	
} );