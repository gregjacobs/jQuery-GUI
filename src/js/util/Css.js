/*global define */
define( [
	'jquery',
	'lodash',
	'jqGui/JqGui'
],
function( jQuery, _, JqGui ) {
	
	var spacesRe = /\s+/g;
	
	
	/**
	 * @class jqGui.util.Css
	 * @singleton
	 * 
	 * General CSS manipulation/reading functionality.  Allows the dynamic modification of 
	 * style sheets, reading of values, etc. Also has some utility methods for working with CSS.
	 */
	var Css = {
		
		/**
		 * @private
		 * @property {Object} SIDES_MAP
		 * 
		 * A helper property for the measuring methods (ex: {@link #getPadding}), which maps the single letter "sides"
		 * names ('t', 'r', 'b', 'l') to the full CSS word (i.e. "top", "right", "bottom", "left").
		 */
		SIDES_MAP : {
			't' : 'top',
			'r' : 'right',
			'b' : 'bottom',
			'l' : 'left'
		},
		
		
		// ------------------------------------
		
		
		/**
		 * Adds a CSS class to a string of space-delimited CSS classes. Only adds the CSS class if the CSS class
		 * does not already exist in the string.
		 * 
		 * For example:
		 *     
		 *     Css.addCls( "class1 class2", "class3" );  // -> "class1 class2 class3"
		 *     Css.addCls( "class1 class2", "class2" );  // -> "class1 class2" (no duplicate CSS classes)
		 *     Css.addCls( "", "class1" );               // -> "class1"
		 *     Css.addCls( "class1", "class2 class3" );  // -> "class1 class2 class3"
		 * 
		 * @param {String} str The string with the space-delimited CSS classes to add the `cssClass` to.
		 * @param {String} cssClass The CSS class(es) to add to the `str`. If adding multiple CSS classes, they 
		 *   must be separated by a space.
		 * @return {String} The `str`, with the `cssClass` added.
		 */
		addCls : function( str, cssClass ) {
			str = jQuery.trim( str );
			cssClass = jQuery.trim( cssClass );
			
			var origClasses = ( str ) ? str.split( spacesRe ) : [],           // only split if the arg is not an empty string
			    newClasses = ( cssClass ) ? cssClass.split( spacesRe ) : [];  // only split if the arg is not an empty string
			
			return _.unique( origClasses.concat( newClasses ) ).join( ' ' );
		},
		
		
		/**
		 * Removes a CSS class from a string of space-delimited CSS classes. 
		 * 
		 * For example:
		 *     
		 *     Css.removeCls( "class1 class2", "class1" );  // -> "class2"
		 *     Css.removeCls( "class1 class2", "class2" );  // -> "class1"
		 *     Css.removeCls( "class1 class2", "class3" );  // -> "class1 class2" (class3 didn't exist in the `str`, so no removal)
		 *     Css.removeCls( "class1 class2 class3", "class1 class2" );  // -> "class3"
		 * 
		 * @param {String} str The string with the space-delimited CSS classes to remove the `cssClass` from.
		 * @param {String} cssClass The CSS class(es) to remove from the `str`. If removing multiple CSS classes, they 
		 *   must be separated by a space.
		 * @return {String} The `str`, with the `cssClass` removed.
		 */
		removeCls : function( str, cssClass ) {
			str = jQuery.trim( str );
			cssClass = jQuery.trim( cssClass );
			
			var origClasses = ( str ) ? str.split( spacesRe ) : [],              // only split if the arg is not an empty string
			    removeClasses = ( cssClass ) ? cssClass.split( spacesRe ) : [];  // only split if the arg is not an empty string
			
			return _.without.apply( null, [ origClasses ].concat( removeClasses ) ).join( ' ' );
		},
		
		
		/**
		 * Determines if a CSS class exists within a string of CSS classes. For example:
		 *     
		 *     Css.hasCls( "class1 class2", "class1" );  // -> true
		 *     Css.hasCls( "class1 class2", "class3" );  // -> false
		 *     Css.hasCls( "", "class1" );               // -> false
		 *     Css.hasCls( "class1 class2 class3", "class2" );  // -> true
		 * 
		 * @param {String} str The string of CSS class(es) to query. Ex: "class1 class2"
		 * @param {String} cssClass The CSS class to test for. Ex: "class2"
		 * @return {Boolean} True if the `str` has the given `cssClass`, false otherwise.
		 */
		hasCls : function( str, cssClass ) {
			str = jQuery.trim( str );
			cssClass = jQuery.trim( cssClass );
			
			if( !str || !cssClass ) {
				return false;
			} else {
				var regex = new RegExp( '(^| )' + cssClass + '( |$)' );
				return regex.test( str );
			}
		},
		
		
		/**
		 * Given an Object (map) of CSS property/value pairs, will return a string that can be placed directly
		 * into the "style" attribute of an element. camelCased CSS property names will be converted to 
		 * dashes. Ex: "fontSize" will be converted to "font-size".
		 * 
		 * @param {Object} cssProperties An Object (map) of CSS property/value pairs. Ex: { color: 'red', fontSize: '10px;' }
		 * @return {String} The CSS string that can be used directly in an element's "style" attribute, or when using it
		 *   to update an existing element's styles, can be used directly on the .style.cssText property.
		 */
		mapToString : function( cssProperties ) {
			var replaceRegex = /([A-Z])/g,
			    cssString = "",
			    normalizedProp;
			
			_.forOwn( cssProperties, function( value, prop ) {
				normalizedProp = prop.replace( replaceRegex, '-$1' ).toLowerCase();
				cssString += normalizedProp + ':' + value + ';';
			} );
			return cssString;
		},
		
		
		/**
		 * Updates the given &lt;style&gt; element(s) with new CSS text. Handles the special case for IE.
		 * 
		 * @param {String/HTMLElement/jQuery} styleEl A selector, reference to an HTMLElement, or jQuery wrapped
		 *   set of &lt;style&gt; elements to update.
		 * @param {String} cssText The new CSS text to update the style element(s) with.
		 */
		updateStyleEl : function( styleEl, cssText ) {
			var $styleEl = jQuery( styleEl );
			
			if( JqGui.isIE ) {
				for( var i = 0, len = $styleEl.length; i < len; i++ ) {   // in case there is more than one element
					$styleEl[ i ].styleSheet.cssText = cssText;  // special case for IE
				}
			} else {
				$styleEl.text( cssText );
			}
		},
		
		
		/**
		 * Normalizes a CSS "size" property value. When provided a number, or a string that converts to a number, this method adds 
		 * the 'px' suffix. When provided any other string, it returns the string unchanged (for example, when providing a percentage 
		 * size, such as "50%").
		 * 
		 * @param {Number/String} sizeVal The size value. If the size is a number, it will have 'px' appended to it.
		 * @return {String} The normalized CSS size value. 
		 */
		normalizeSizeValue : function( sizeVal ) {
			if( !isNaN( +sizeVal ) ) {
				sizeVal += 'px';
			}
			return sizeVal;
		},
		
		
		// ------------------------------------
		
		// Measurement Helpers
		
		
		/**
		 * Retrieves the width of the padding for the given `sides` of the `element`. `sides` can be either 't', 'r', 'b', or 
		 * 'l' (for "top", "right", "bottom", or "left"), *or* it can be a combination of more than one to add the padding widths
		 * together. Ex: 'rl' would add the right and left padding together and return that number.
		 * 
		 * @param {String/HTMLElement/jQuery} element The element to calculate padding for. Can be a selector string, actual HTML element, 
		 *   or jQuery wrapped set. In the case of a jQuery wrapped set, only the first element will be considered for the calculation. 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the padding for the given `sides`.
		 */
		getPadding : function( element, sides ) {
			return this.sumSides( element, 'padding', sides );
		},
		
		
		/**
		 * Retrieves the width of the margin for the given `sides` of the `element`. `sides` can be either 't', 'r', 'b', or 
		 * 'l' (for "top", "right", "bottom", or "left"), *or* it can be a combination of more than one to add the margin widths
		 * together. Ex: 'rl' would add the right and left margin together and return that number.
		 * 
		 * @param {String/HTMLElement/jQuery} element The element to calculate margin for. Can be a selector string, actual HTML element, 
		 *   or jQuery wrapped set. In the case of a jQuery wrapped set, only the first element will be considered for the calculation. 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the margin for the given `sides`.
		 */
		getMargin : function( element, sides ) {
			return this.sumSides( element, 'margin', sides );
		},
		
		
		/**
		 * Retrieves the width of the border for the given `sides` of the `element`. `sides` can be either 't', 'r', 'b', or 
		 * 'l' (for "top", "right", "bottom", or "left"), *or* it can be a combination of more than one to add the border widths
		 * together. Ex: 'rl' would add the right and left border together and return that number.
		 * 
		 * @param {String/HTMLElement/jQuery} element The element to calculate border for. Can be a selector string, actual HTML element, 
		 *   or jQuery wrapped set. In the case of a jQuery wrapped set, only the first element will be considered for the calculation. 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the border for the given `sides`.
		 */
		getBorderWidth : function( element, sides ) {
			return this.sumSides( element, 'border', sides, 'width' );
		},
		
		
		
		/**
		 * Retrieves the "frame" size, which is the sum of the width of the padding, margin, and border, for the given `sides` of the `element`. `sides` 
		 * can be either 't', 'r', 'b', or 'l' (for "top", "right", "bottom", or "left"), *or* it can be a combination of more than one to add the 
		 * padding/border/margin widths together. Ex: 'rl' would add the right and left padding together and return that number.
		 * 
		 * @param {String/HTMLElement/jQuery} element The element to calculate border for. Can be a selector string, actual HTML element, 
		 *   or jQuery wrapped set. In the case of a jQuery wrapped set, only the first element will be considered for the calculation. 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The sum total of the width of the border, plus padding, plus margin, for the given `sides`.
		 */
		getFrameSize : function( element, sides ) {
			return this.getPadding( element, sides ) + this.getMargin( element, sides ) + this.getBorderWidth( element, sides );
		},
		
		
		/**
		 * Private helper method to sum up the `sides` for a given `element` and `propertyName`.
		 * 
		 * @private
		 * @param {String/HTMLElement/jQuery} element The element to read the CSS properties from (a combination of `propertyName`, and the sides. 
		 *   ex: 'padding-left')
		 * @param {String} propertyName The property name to read sides from. Ex: 'padding', 'margin', or 'border-width'. This will be combined with
		 *   each of the `sides`. So this is specified as 'padding', and a side is specified as 'l', the property read will be 'padding-left'. 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'.
		 * @param {String} [propertyNameSuffix=""] If there is a suffix for the CSS property name. This is pretty much only used in the case
		 *   of 'border' as the full width property name for say, left border, is 'border-left-width'
		 */
		sumSides : function( element, propertyName, sides, propertyNameSuffix ) {
			var total = 0,
			    SIDES_MAP = this.SIDES_MAP,
			    $element = jQuery( element );
			
			// If a property name suffix was provided, add a preceding '-'
			propertyNameSuffix = ( propertyNameSuffix ) ? '-' + propertyNameSuffix : "";
			
			for( var i = 0, len = sides.length; i < len; i++ ) {
				var style = $element.css( propertyName + '-' + SIDES_MAP[ sides.charAt( i ) ] + propertyNameSuffix ),
				    intValue = parseInt( style, 10 );
				
				// Ignore the property if IE8< returned "auto", "thin", "medium", "thick", etc. May need better method for checking 
				// sizes in the future for when jQuery doesn't return a px value.
				if( !isNaN( intValue ) ) {
					total += intValue;
				}
			}
			return total;
		}
		
	};

	return Css;
	
} );