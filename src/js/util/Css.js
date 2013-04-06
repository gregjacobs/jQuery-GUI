/*global define */
define( [
	'jquery',
	'lodash',
	'ui/UI'
],
function( jQuery, _, UI ) {
	
	/**
	 * @class ui.util.Css
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
			
			if( UI.isIE ) {
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
			return this.sumSides( jQuery( element ), 'padding', sides );
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
			return this.sumSides( jQuery( element ), 'margin', sides );
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
			return this.sumSides( jQuery( element ), 'border', sides, 'width' );
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
				total += parseInt( $element.css( propertyName + '-' + SIDES_MAP[ sides.charAt( i ) ] + propertyNameSuffix ), 10 );
			}
			return total;
		}
		
	};

	return Css;
	
} );