/**
 * @class Kevlar.CSS
 * @singleton
 * 
 * General CSS manipulation/reading functionality.  Allows the dynamic modification of 
 * style sheets, reading of values, etc. Also has some utility methods for working with CSS.
 */
/*global Kevlar */
Kevlar.CSS = {
	
	/**
	 * Given a hash of CSS property/value pairs, will return a string that can be placed directly
	 * into the "style" attribute of an element. camelCased CSS property names will be converted to 
	 * dashes. Ex: "fontSize" will be converted to "font-size".
	 * 
	 * @method hashToString
	 * @param {Object} cssProperties An object (hash) of CSS property/value pairs. Ex: { color: 'red', fontSize: '10px;' }
	 * @return {String} The CSS string that can be used directly in an element's "style" attribute, or when using it
	 *   to update an existing element's styles, can be used directly on the .style.cssText property.
	 */
	hashToString : function( cssProperties ) {
		var replaceRegex = /([A-Z])/g,
		    cssString = "",
		    normalizedProp;
		    
		for( var prop in cssProperties ) {
			if( cssProperties.hasOwnProperty( prop ) ) {
				normalizedProp = prop.replace( replaceRegex, '-$1' ).toLowerCase();
				cssString += normalizedProp + ':' + cssProperties[ prop ] + ';';
			}
		}
		return cssString;
	}
	
};
