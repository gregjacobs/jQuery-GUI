/*!
 * jQuery-Component
 * Version 0.1.0
 *
 * Copyright(c) 2013 Gregory Jacobs.
 * MIT Licensed. http://www.opensource.org/licenses/mit-license.php
 *
 * https://github.com/gregjacobs/jQuery-Component
 */

/*!
 * jQuery-Component
 * Copyright(c) 2013 Gregory Jacobs.
 * 
 * MIT Licensed. http://www.opensource.org/licenses/mit-license.php
 * https://github.com/gregjacobs/jQuery-Component
 */

/*global define */
define('jqc/Jqc', [
	'Class',
	'jquery',
	'lodash'
], function( Class, jQuery, _ ) {

	/**
	 * @class jqc.Jqc
	 * @singleton
	 * 
	 * Main singleton class of the jQuery-Component library, with a few base utility functions. 
	 * 
	 * This class can be included in implementations by using the RequireJS path of 'jqc/Jqc'. Ex:
	 * 
	 *     require( [ 'jqc/Jqc' ], function( Jqc ) {
	 *         console.log( "This browser's scrollbar width: ", Jqc.getScrollbarWidth(), "px" );
	 *     } );
	 */
	var Jqc = Class.extend( Object, {

		/**
		 * @readonly
		 * @property {Boolean} isIE
		 * 
		 * Will be true if the browser is Internet Explorer, false otherwise.
		 */
		
		/**
		 * @private
		 * @property {String} blankImgUrl
		 * 
		 * The url of a blank (transparent) 1x1 gif image. Retrieve with {@link #getBlankImgUrl}.
		 */
		blankImgUrl : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',

	
		/**
		 * @constructor
		 */
		constructor : function() {
			var userAgent = window.navigator.userAgent.toLowerCase();
			
			this.isIE = /msie/.test( userAgent ) && !( /opera/.test( userAgent ) );
		},

		
		// -----------------------------------
		
		
		/**
		 * An empty function. This can be referred to in cases where you need a function,
		 * but do not want to create a new function object. Used for performance and clarity
		 * reasons.
		 *
		 * @method emptyFn
		 */
		emptyFn : function() {},
		

		/**
		 * Retrieves the url of a 1x1 transparent gif image. This is actually a data url.
		 * This may be placed into CSS styles as such:
		 * 
		 *     var $div = jQuery( '<div />' );
		 *     $div.css( 'background-image', 'url(' + Jqc.getBlankImgUrl() + ')' );
		 * 
		 * @method getBlankImgUrl
		 * @return {String}
		 */
		getBlankImgUrl : function() {
			return this.blankImgUrl;
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Retrieves the sizes of the scrollbars used on the current browser. This can differ
		 * depending on browser, operating system, or even different accessibility settings.
		 * 
		 * @method getScrollbarSizes
		 * @return {Object} An object containing the scrollbar sizes.
		 * @return {Number} return.width The width of the vertical scrollbar.
		 * @return {Number} return.height The height of the vertical scrollbar.
		 */
		getScrollbarSizes : (function() {
			var scrollbarSizes;
			
			return function() {
				if( !scrollbarSizes ) {
					var $div = jQuery( '<div style="position:absolute;width:100px;height:100px;overflow:scroll;top:-9999px;" />' ),
					    div = $div[ 0 ];
					
					$div.appendTo( 'body' );  // so we can measure it
					
					scrollbarSizes = {
						width  : div.offsetWidth - div.clientWidth,
						height : div.offsetHeight - div.clientHeight
					};
					
					$div.remove();
				}
					
				return scrollbarSizes;
			};
		})(),
		
		
		/**
		 * Retrieves the width of the browser's vertical scrollbar. See {@link #getScrollbarSizes} for 
		 * more details.
		 * 
		 * @method getScrollbarWidth
		 * @return {Number} The width of the browser's vertical scrollbar.
		 */
		getScrollbarWidth : function() {
			return this.getScrollbarSizes().width;
		},
		
		
		/**
		 * Retrieves the height of the browser's horizontal scrollbar. See {@link #getScrollbarSizes} for 
		 * more details.
		 * 
		 * @method getScrollbarHeight
		 * @return {Number} The height of the browser's horizontal scrollbar.
		 */
		getScrollbarHeight : function() {
			return this.getScrollbarSizes().height;
		},
		
		
		// -----------------------------------
		
		
		
		/**
		 * Preloads a set of images using the old-school Image object, and calls the callback
		 * when all images have loaded. Right now, errors are not handled--they are treated 
		 * the same way as if the image had loaded properly.
		 *
		 * @method loadImages
		 * @param {Array} images A list of image URLs.
		 * @param {Function} callback A callback function for after all the images have loaded.
		 * @param {Object} [scope=window] The scope to run the callback function in.
		 */
		loadImages : function( images, callback, scope ) {
			if( !_.isArray( images ) ) {
				return;
			}
			
			var imagesLoaded = 0,
				imagesCount = images.length,
				img;
			
			var onLoad = function() {
				imagesLoaded++;
				
				if( imagesLoaded >= imagesCount ) {
					callback.call( scope || window );
				}
			};
			
			for( var i = 0; i < imagesCount; i++ ) {
				img = new Image();
				jQuery( img ).on( 'load error', onLoad );
				img.src = images[ i ];
			}
		},
		
		
		/**
		 * Convenience function for loading a single image.
		 *
		 * @method loadImage
		 * @param {String} image An image URL.
		 * @param {Function} callback A callback function for after the image has loaded.
		 * @param {Object} [scope=window] The scope to run the callback function in.
		 */
		loadImage : function( image, callback, scope ) {
			this.loadImages( [ image ], callback, scope );
		}
		
	} );
	
	
	// Return singleton instance
	return new Jqc();
	
} );
/*global define */
define('jqc/util/Css', [
	'jquery',
	'lodash',
	'jqc/Jqc'
],
function( jQuery, _, Jqc ) {
	
	/**
	 * @class jqc.util.Css
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
			
			if( Jqc.isIE ) {
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
/*global define */
define('jqc/util/Html', [
	'lodash'
], function( _ ) {
	
	/**
	 * @class jqc.util.Html
	 * @singleton
	 * 
	 * Utility class for doing html/text transformations.
	 */
	var Html = {
		
		/**
		 * Converts certain characters (&, <, >, and ") to their HTML entity equivalents for literal display in web pages, and for
		 * using HTML strings within HTML attributes.
		 * 
		 * @method encode
		 * @param {String} value The string to encode
		 * @return {String} The encoded text
		 */
		encode : function( value ) {
			return !value ? value : String( value ).replace( /&/g, "&amp;" ).replace( />/g, "&gt;" ).replace( /</g, "&lt;" ).replace( /"/g, "&quot;" );
		},
		
		
		/**
		 * Converts certain characters (&, <, >, and ") from their HTML entity equivalents.
		 * 
		 * @method decode
		 * @param {String} value The string to decode
		 * @return {String} The decoded text
		 */
		decode : function( value ) {
			return !value ? value : String( value ).replace( /&gt;/g, ">" ).replace( /&lt;/g, "<" ).replace( /&quot;/g, '"' ).replace( /&amp;/g, "&" ).replace( /&nbsp;/g, " " );
		},
		
		
		/**
		 * Returns the html with all tags stripped.
		 * 
		 * @method stripTags
		 * @param {String} v The html to be stripped.
		 * @return {String} The resulting text.
		 */
		stripTags : function( v ) {
			return !v ? v : String( v ).replace( /<[^>]+>/g, "" );
		},
		
		
		/**
		 * Replace newlines with &lt;br /&gt; tags
		 * 
		 * @method nl2br
		 * @param {String} text The text to convert newlines into &lt;br /&gt; tags.
		 * @return {String} The converted text.
		 */
		nl2br : function( text ) {
			return text.replace( /\n/g, "<br />" );
		},
		
		
		/**
		 * Given an Object (map) of attribute name/value pairs, will return a string that can be placed directly
		 * into an HTML tag to add attributes to that element.
		 * 
		 * @param {Object} attrMap An Object (map) of attribute name/value pairs. Ex: { id: 'myEl', title: "My Tooltip" }
		 * @return {String} The string that can be used directly in an element tag to add the attributes. Ex:
		 *   `id="myEl" title="My Tooltip"`
		 */
		attrMapToString : function( attrMap ) {
			var attr = [];
			
			_.forOwn( attrMap, function( attrValue, attrName ) {
				attr.push( attrName + '="' + attrValue + '"' );
			} );
			return attr.join( " " );
		}
		
	};
	
	return Html;
	
} );
/*global define */
define('jqc/template/Template', [
	'lodash',
	'Class'
], function( _, Class ) {
	
	/**
	 * @abstract
	 * @class jqc.template.Template
	 * @extends Object
	 * 
	 * Base class and interface for template implementations. For the default concrete Template implementation used
	 * by the framework, see {@link jqc.template.LoDash}.
	 */
	var Template = Class.extend( Object, {
		abstractClass : true,
		
		/**
		 * Applies the given `data` object to the Template, and returns the result.
		 * 
		 * @abstract
		 * @method apply
		 * @param {Object} [data] The data object to apply to the template (i.e. execute the compiled template function 
		 *   with). If the template does not use any data, this may be ommitted.
		 * @return {String} The result of applying the `data` object to the template.
		 */
		apply : Class.abstractMethod
		
	} );
	
	return Template;
	
} );
/*global define */
define('jqc/template/LoDash', [
	'lodash',
	'jqc/template/Template'
], function( _, Template ) {
	
	/**
	 * @class jqc.template.LoDash
	 * @extends jqc.template.Template
	 * 
	 * A wrapper class for Lo-Dash templates which helps with a few normalization procedures, and
	 * allows for lazy compilation of a template from its string source.
	 * 
	 * This is the default template used by the framework.
	 * 
	 * For more information on Lo-Dash templates, see: [http://lodash.com/docs#template](http://lodash.com/docs#template)
	 */
	var LoDashTpl = Template.extend( {
		
		/**
		 * @cfg {Boolean} compiled
		 * 
		 * `true` to compile the Lo-Dash template immediately when the LoDashTpl is instantiated. Defaults to false,
		 * for lazy compilation (i.e. the template is only compiled when it is first used). 
		 */
		compiled : false,
		
		
		/**
		 * @protected
		 * @property {String} tplSource
		 * 
		 * The source string that will generate the {@link #compiledTplFn}. This property will only be set
		 * if the constructor is called with a string or array of strings as its first argument.
		 */
		
		/**
		 * @protected
		 * @property {Object} tplOptions
		 * 
		 * The options that will be provided to the Lo-Dash template generator function to create the 
		 * {@link #compiledTplFn}. This property will only be set if the constructor is called with a string 
		 * or array of strings as its first argument.
		 */
		
		/**
		 * @protected
		 * @property {Function} compiledTplFn
		 * 
		 * The compiled Lo-Dash template function. This is generated by the {@link #compile} function
		 * when either called directly, or when the template is first used (lazy compilation).
		 */
		
		
		
		/**
		 * @constructor
		 * @param {String/String[]/Function/jqc.template.Template} tpl A string or an array of strings which will be concatenated 
		 *   together to generate the Lo-Dash template, a compiled Lo-Dash template function, or a {@link jqc.template.Template} 
		 *   instance which will simply be returned from this constructor.
		 * @param {Object} options Any options to provide to the Lo-Dash template generator function. This argument
		 *   is only valid when the first argument to this constructor is a string or array of strings. See 
		 *   [http://lodash.com/docs#template](http://lodash.com/docs#template) for the options that are accepted.
		 *   This parameter also accepts the configuration options of this class.
		 */
		constructor : function( tpl, options ) {
			this._super( arguments );
			
			if( tpl instanceof Template ) {
				return tpl;
			} else {
				options = options || {};
				
				if( _.isString( tpl ) || _.isArray( tpl ) ) {
					this.tplSource = [].concat( tpl ).join( "" );
					this.tplOptions = _.omit( options, 'compiled' );  // omit (i.e. filter out) the config options of this class
					
					if( options.compiled )
						this.compile();
					
				} else if( tpl && tpl.source ) {  // function was provided, check for 'source' property to see if it is a compiled Lo-Dash template
					this.compiledTplFn = tpl;
				
				// <debug>
				} else {
					throw new Error( "Invalid `tpl` argument to LoDashTpl constructor" );
				// </debug>
				}
			}
		},
		
		
		/**
		 * Compiles the template, if it is not yet a compiled Lo-Dash template function. You normally do not
		 * need to call this method, as it will be called automatically when the template is first used, but
		 * this may be called to pre-compile the template. Alternatively, the {@link #compiled} configuration 
		 * option may be used when instantiating for this effect as well.
		 */
		compile : function() {
			if( !this.compiledTplFn ) {
				this.compiledTplFn = _.template( this.tplSource, null, this.tplOptions );
			}
		},
		
		
		/**
		 * Applies the given `data` object to the Lo-Dash template, and returns the result.
		 * Compiles the template if it is not yet compiled.
		 * 
		 * @param {Object} [data] The data object to apply to the template (i.e. execute the compiled template function 
		 *   with). If the template does not use any data, this may be ommitted (an empty object will be provided instead).
		 * @return {String} The result of applying the `data` object to the template.
		 */
		apply : function( data ) {
			if( !this.compiledTplFn ) {
				this.compile();
			}
			
			return this.compiledTplFn( data || {} );
		}
		
	} );
	
	return LoDashTpl;
	
} );
/*global define */
define('jqc/Mask', [
	'jquery',
	'lodash',
	'Class',
	'jqc/template/Template',
	'jqc/template/LoDash',
	'jquery-ui.position'  // jQuery UI's `position` plugin
], 
function( jQuery, _, Class, Template, LoDashTpl ) {
	
	/**
	 * @class jqc.Mask
	 * @extends Object
	 * 
	 * Generalized class that can create a mask over any given element, and provides a simple interface
	 * to show, hide, and add content to it.
	 */
	var Mask = Class.extend( Object, {
		
		/**
		 * @cfg {Boolean} spinner
		 * 
		 * `true` to display a spinner image in the {@link #$contentEl} element when the mask is shown.
		 */
		spinner : false,
		
		/**
		 * @cfg {String/HTMLElement/jQuery} msg
		 * 
		 * A message (or any content) to display in the center of the mask. If this is specified, the {@link #$contentEl} will be
		 * made to look like an opaque box, so that text inside of it is easily readable. Defaults to an empty string, for no message.
		 */
		msg : "",
		

		
		/**
		 * @protected
		 * @property {String/jqc.template.Template} maskTpl
		 * 
		 * The template to use to create the Mask's elements.
		 */
		maskTpl : new LoDashTpl( [
			'<div data-elem="jqc-mask-overlay" class="jqc-mask-overlay" />',
			'<div data-elem="jqc-mask-content" class="jqc-mask-content">',
				'<span class="jqc-mask-spinner" />',
				'<div data-elem="jqc-mask-msg" class="jqc-mask-msg" />',
			'</div>'
		] ),
		
		/**
		 * @protected
		 * @property {jQuery} $targetEl
		 * 
		 * The element to mask, wrapped in a jQuery wrapped set.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} rendered
		 * 
		 * Will be true once the Mask's elements have been rendered ({@link #initMaskElements} has been run). Initially false.
		 */
		rendered : false,
		
		/**
		 * @protected
		 * @property {jQuery} $overlayEl
		 * 
		 * The masking element itself. This is lazily created in the {@link #initMaskElements} method when the mask is to
		 * be shown.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $contentEl
		 * 
		 * The content element that sits on top of the Mask to display the {@link #msg} and/or {@link #spinner}. This is lazily 
		 * created in the {@link #initMaskElements} method when the mask is to be shown.
		 */
		
		/**
		 * @protected
		 * @property [jQuery} $msgEl
		 * 
		 * The element that is used to display the {@link #msg}, which sits inside the {@link #$contentEl}.
		 */
		
		/**
		 * @protected
		 * @property {String} spinnerVisibleCls
		 * 
		 * The CSS class to add to the Mask's {@link #$contentEl} when the spinner is visible.
		 */
		spinnerVisibleCls : 'jqc-mask-spinner-visible',
		
		/**
		 * @protected
		 * @property {String} msgVisibleCls
		 * 
		 * The CSS class to add to the Mask's {@link #$contentEl} when a {@link #msg} exists.
		 */
		msgVisibleCls : 'jqc-mask-msg-visible',
		
		/**
		 * @protected
		 * @property {Boolean} visible
		 * 
		 * Stores if the mask is currently being shown or not (visible). Retrieve with {@link #isVisible}.
		 */
		visible : false,
		
		
		/**
		 * @constructor
		 * @param {HTMLElement/jQuery} targetEl The element or jQuery wrapped set that the mask is to mask over. This
		 *   may only be one element in the case of a jQuery wrapped set. 
		 * @param {Object} config Any additional configuration options for the Mask, specified in an object (hash).
		 */
		constructor : function( targetEl, config ) {
			if( _.isElement( targetEl ) ) {
				this.$targetEl = jQuery( targetEl );
				
			} else if( targetEl instanceof jQuery ) {
				// <debug>
				if( targetEl.length !== 1 ) {
					throw new Error( "If the 'targetEl' argument to the jqc.Mask constructor is a jQuery wrapped set, it must contain exactly one element." );
				}
				// </debug>
				this.$targetEl = targetEl;
			
			// <debug>
			} else {
				throw new Error( "jqc.Mask requires the first argument to its constructor to be an HTMLElement, or a jQuery wrapped set" );
			// </debug>
			}
			
			if( !( this.maskTpl instanceof Template ) )
				this.maskTpl = new LoDashTpl( this.maskTpl );
			
			// Apply any additional configuration properties onto this object
			this.updateConfig( config );
		},
		
		
		
		/**
		 * Updates the configuration of the mask. Accepts an object with the configuration options for this class,
		 * and updates the Mask accordingly.  Note that all configuration options that are not provided in the
		 * `config` argument will be reset to their defaults. 
		 * 
		 * @param {Object} config The new configuration options for the Mask. See the "config options" section of the docs for details. 
		 */
		updateConfig : function( config ) {
			// Remove any previously set configuration options (unshadows defaults on prototype)
			delete this.spinner;
			delete this.msg;
			
			// Apply the new config
			_.assign( this, config );
			
			// If the mask is already rendered, update the elements accordingly
			if( this.rendered ) {
				this.updateMaskElements();
			}
		},
		
		
		/**
		 * Creates the masking elements (the {@link #$overlayEl} and {@link #$contentEl}) if they have not yet been created. When creating
		 * the elements, they are appended to the target element (note that they are absolutely positioned so they do not affect document flow).
		 * 
		 * @protected
		 */
		initMaskElements : function() {
			// Create the mask elements if they do not yet exist, and append it to the target element
			if( !this.rendered ) {
				var $targetEl = this.$targetEl;
				$targetEl.append( this.maskTpl.apply( {} ) );  // no data for the template (at this point in time)
				
				var onMaskClick = _.bind( this.onMaskClick, this );
				this.$overlayEl = $targetEl.find( '[data-elem="jqc-mask-overlay"]' )
					.on( 'click', onMaskClick );
				this.$contentEl = $targetEl.find( '[data-elem="jqc-mask-content"]' )
					.on( 'click', onMaskClick );
				this.$msgEl = $targetEl.find( '[data-elem="jqc-mask-msg"]' );
				
				this.rendered = true;
				this.updateMaskElements();
			}
		},
		
		
		/**
		 * Updates the mask elements with the current values of the configuration options (which may be set after instantiation time
		 * with the {@link #updateConfig} method.
		 * 
		 * @protected
		 */
		updateMaskElements : function() {
			if( this.rendered ) {
				// Update the spinner's visibility based on the `spinner` config
				this.$contentEl.toggleClass( this.spinnerVisibleCls, this.spinner );
				
				// Update the message
				this.setMsg( this.msg );
			}
		},
		
		
		/**
		 * Sets the {@link #msg message} for the Mask.
		 * 
		 * @param {String} msg The message. Accepts HTML. To remove the message, provide an empty string.
		 */
		setMsg : function( msg ) {
			this.msg = msg;
			
			if( this.rendered ) {
				this.$contentEl.toggleClass( this.msgVisibleCls, !!msg );
				this.$msgEl.html( msg );
			}
		},
		
		
		/**
		 * Handles a click to the Mask's elements by simply stopping event propagation. The mask should swallow any click events 
		 * to it, to prevent any behavior from the bubbling of the event.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onMaskClick : function( evt ) { 
			evt.stopPropagation();  // the mask should swallow any click events to it, to prevent any behavior from the bubbling of the event.
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Shows the mask over the target element.
		 * 
		 * Note that if the mask is already visible, and its height needs to be recalculated because the underlying element's 
		 * size has changed, this method may be called again to redraw the mask.
		 */
		show : function() {
			if( !this.isVisible() ) {
				// First, make sure the masking elements have been created (lazily created upon showing the mask, not in the constructor)
				this.initMaskElements();
				
				
				var $targetEl = this.$targetEl,
				    $overlayEl = this.$overlayEl,
				    $contentEl = this.$contentEl;
				
				// First, add the jqc-masked css class to the target element, which removes the target element's scroll bars
				$targetEl.addClass( 'jqc-masked' );
				
				// Next, give the target element a relative positioning context if it currently does not have one (i.e. it 
				// has "position: static"), and the target element not the document body (the document body already has a positioning context)
				if( $targetEl.css( 'position' ) === 'static' && !$targetEl.is( 'body' ) ) {
					$targetEl.addClass( 'jqc-masked-relative' );
				}
				
				
				// Now show the masking element. Make sure it is appended if it has been detached.
				$overlayEl.appendTo( $targetEl );
				
				// IE will not expand full height automatically if it has auto height. Just doing this calc for all browsers for now,
				// instead of worrying about browser detection (determining which versions of IE are affected) or attempting 
				// a feature detection for this.
				$overlayEl.height( $targetEl.outerHeight() );
				
				
				// Position the content element ($contentEl) in the center of the $targetEl, and set it to continually reposition it on an interval.
				// The interval is for when elements on the page may resize themselves, we need to adjust the content element's position. The interval
				// will be cleared once the mask is hidden.
				this.$contentEl.appendTo( $targetEl );  // Make sure it is appended if it has been detached.
				this.repositionContentEl();
				var me = this;  // for closure
				var repositionIntervalId = setInterval( function() {
					if( me.isVisible() ) {
						me.repositionContentEl();
					} else {
						clearInterval( repositionIntervalId );  // When no longer shown, clear the interval
					}
				}, 100 );
				
				this.visible = true;
			}
		},
		
		
		/**
		 * Repositions the {@link #$contentEl} to be in the center of the {@link #$targetEl}.
		 * 
		 * @protected
		 */
		repositionContentEl : function() {
			// using jQuery UI positioning utility to center the content element
			if( this.isContentElVisible() ) {
				this.$contentEl.position( {
					my: 'center center',
					at: 'center center',
					of: this.$targetEl
				} );
			}
		},
		
		
		/**
		 * Hides the mask.
		 */
		hide : function() {
			// Should only hide if the mask is currently visible.
			if( this.isVisible() ) {
				// Hide the mask and the content element (if it exists), and restore the target element 
				// to its original state (i.e. scrollbars allowed, and no positioning context if it didn't have one)
				this.$overlayEl.detach();
				this.$contentEl.detach();
				this.$targetEl.removeClass( 'jqc-masked' ).removeClass( 'jqc-masked-relative' );
				
				this.visible = false;
			}
		},
		
		
		/**
		 * Determines if the Mask is currently shown (visible).
		 * 
		 * @return {Boolean} `true` if the mask is currently shown (visible), `false` otherwise.
		 */
		isVisible : function() {
			return this.visible;
		},
		
		
		/**
		 * Determines if the {@link #$contentEl} is visible. This is used internally.
		 * 
		 * @protected
		 * @return {Boolean} `true` if the {@link #$contentEl} is visible, `false` otherwise.
		 */
		isContentElVisible : function() {
			return ( this.spinner || !!this.msg );
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Destroys the mask by cleaning up its elements.
		 */
		destroy : function() {
			// Make sure the mask has been hidden, to restore the target element to its original state
			this.hide();
			
			if( this.rendered ) {
				this.$overlayEl.remove();
				this.$contentEl.remove();
			}
		}
		
	} );
	
	return Mask;
} );

/*global define */
define('jqc/anim/Animation', [
	'require',
	'jquery',
	'lodash',
	'Class',
	'Observable',
	'jqc/Component'
], function( require, jQuery, _, Class, Observable, Component ) {
	
	/**
	 * @class jqc.anim.Animation
	 * @extends Observable
	 * 
	 * A class that encapsulates a single animation of a given HTMLElement, jQuery wrapped set, or {@link jqc.Component}.
	 */
	var Animation = Class.extend( Observable, {
		
		/**
		 * @cfg {HTMLElement/jQuery/jqc.Component} target (required)
		 * 
		 * The target element(s) to animate. In the case of a {@link jqc.Component}, the Component's {@link jqc.Component#getEl getEl}
		 * method is run to retrieve the element to animate.
		 * 
		 * Note that this config is not required upon instantiation of the Animation, but must be present at the time that
		 * {@link #start} is executed. The target may be set after instantiation time using {@link #setTarget}.
		 */
		
		/**
		 * @cfg {String/Object} effect (required)
		 * 
		 * One of the jQuery UI effects to use for the animation. See 
		 * <a href="http://docs.jquery.com/UI/Effects">http://docs.jquery.com/UI/Effects</a> for a list of
		 * effects.
		 * 
		 * If specific options are required for the effect, this config may be specified as an object (hash) of keys/values.
		 * The key 'type' is required in this case, for the name of the effect. For a list of options for effects, see the link for the 
		 * particular {@link #effect} you are using here: <a href="http://docs.jquery.com/UI/Effects">http://docs.jquery.com/UI/Effects</a>, 
		 * and then scroll down to the 'Arguments' section for the additional options that can be used in this hash. Ex:
		 * `effect : { type: 'slide', direction: 'up', mode: 'show' }`
		 * 
		 * Note: This config is mutually exclusive with the {@link #to} config, and override it if provided.
		 */
		
		/**
		 * @cfg {Object} from
		 * 
		 * A hash of CSS properties to start the animation from (i.e. these are set at the start of the animation). If
		 * none are provided, the animation animates from the element's current CSS state. 
		 */
		
		/**
		 * @cfg {Object} to (required)
		 * 
		 * A hash of CSS properties to animate to. Note: this config is mutually exclusive with the {@link #effect} 
		 * config, and will be overridden if an {@link #effect} config is provided.
		 */
		
		/**
		 * @cfg {Number} duration
		 * 
		 * The duration in milliseconds to run the animation.
		 */
		duration : 250,
		
		/**
		 * @cfg {String} easing
		 * 
		 * The name of the easing to use to run the animation. Only used if using the {@link #to} config. For a full list 
		 * of available options, see <http://jqueryui.com/demos/effect/#easing>. 
		 */
		easing : 'linear',
		
		/**
		 * @cfg {Function} callback
		 * 
		 * Callback to run when the animation is complete. This function is called with this Animation instance as its first argument.
		 */
		
		/**
		 * @cfg {Object} scope
		 * 
		 * The scope to run the {@link #callback} in. Defaults to `window`.
		 */
		
		
		/**
		 * @private
		 * @property {jQuery} $target
		 * 
		 * The jQuery wrapped set for the {@link #target}, after being resolved by {@link #resolveTarget}.
		 */
		
		/**
		 * @private
		 * @property {Boolean} running
		 * 
		 * Flag to determine if the animation is currently running. Because this class's {@link #target} can be multiple elements, and
		 * because jQuery's animate() function calls its complete() callback once per each element, we need this flag to be able to set
		 * it back to false when the first complete() call is made. We don't want to run the {@link #end} method once for each element,
		 * just once for all elements as a whole.  
		 */
		running : false,
		
		/**
		 * @private
		 * @property {Boolean} complete
		 * 
		 * Flag that is set to true once the animation is complete.
		 */
		complete : false,
		
		
		/**
		 * @constructor
		 * @param {Object} [config] The configuration options for this instance.
		 */
		constructor : function( config ) {
			_.assign( this, config );
			
			// Call the superclass (Observable) constructor
			this._super( arguments );
			
			
			this.addEvents(
				/**
				 * Fires just before the animation starts. Handlers of this event may return false to
				 * prevent the animation from starting.
				 * 
				 * @event beforeanimate
				 * @param {jqc.anim.Animation} animation This Animation instance.
				 * @preventable
				 */
				'beforeanimate',
				
				/**
				 * Fires when the animation completes.
				 * 
				 * @event afteranimate
				 * @param {jqc.anim.Animation} animation This Animation instance.
				 */
				'afteranimate',
				
				/**
				 * An alias of {@link #afteranimate}, fires when the animation completes.
				 * 
				 * @event complete
				 * @param {jqc.anim.Animation} animation This Animation instance.
				 */
				'complete'
			);
		},
		
		
		/**
		 * Sets the {@link #target} for the Animation. This method allows it to be set after instantiation,
		 * if the {@link #target} config was not provided.
		 * 
		 * @param {HTMLElement/jQuery/jqc.Component} target The target element(s) to animate. In the case of a {@link jqc.Component}, 
		 *   the Component's {@link jqc.Component#getEl getEl} method is run to retrieve the element to animate.
		 * @chainable
		 */
		setTarget : function( target ) {
			this.$target = null;  // clear out any previous $target element resolution. The element will be resolved from the provided `target` when start() is executed
			
			this.target = target;
			return this;
		},
		
		
		/**
		 * Normalizes the {@link #target} config that was provided upon instantiation, or provided from
		 * {@link #setTarget}, and return the element that it refers to. If the t
		 * 
		 * @return {jQuery} The target element, wrapped in a jQuery set, or `null` if the target could not
		 *   be resolved to an element.
		 */
		resolveTarget : function() {
			var $target = this.$target || null;
			if( $target )   // already resolved the $target element, return it immediately
				return $target;
			
			// Make sure there is a 'target' config, and normalize it if need be
			var target = this.target;
			if( target ) {
				if( target instanceof require( 'jqc/Component' ) ) {   // need to require() jqc.Component here, because it is a circular dependency
					$target = jQuery( target.getEl() );
				} else {
					$target = jQuery( target );
				}
			}
			delete this.target;  // raw config no longer needed
			
			return ( this.$target = $target );  // cache and return the $target. If there was no `target` config, this will return null (as $target wasn't set to anything else)
		},
		
		
		/**
		 * Starts the animation. The {@link #target} and either a {@link #to} or {@link #effect} config must be
		 * set at this point to start the animation.
		 */
		start : function() {
			var $target = this.resolveTarget(),
			    from = this.from,
			    to = this.to,
			    effect = this.effect,
			    duration = this.duration,
			    onLastFrame = this.onLastFrame;
			
			// <debug>
			// Make sure there is a target element, and either a 'to' config or an 'effect' config
			if( !$target ) {
				throw new Error( "jqc.anim.Animation.start(): Error. No `target` config provided" );
			}
			if( !to && !effect ) {
				throw new Error( "jqc.anim.Animation.start(): Error. No `to` or `effect` config provided" );
			}
			// </debug>
			
			if( !this.running && !this.complete && this.fireEvent( 'beforeanimate', this ) !== false ) {
				this.running = true;
				
				// If the 'from' config was provided with CSS properties, apply them now
				if( from ) {
					$target.css( from );
				}
				
				// If the 'effect' config was provided, use that. Otherwise, animate to the 'to' config.
				if( effect ) {
					var effectType, effectOptions;
					if( typeof effect === 'object' ) {
						effectType = effect.type;
						effectOptions = effect;  // can just use the object itself with the 'type' property. 'type' be ignored by jQuery UI 
						
					} else {  // 'effect' was provided as a string
						effectType = effect;
						effectOptions = {};
					}
					
					// Run the effect
					$target.effect( effectType, effectOptions, duration, _.bind( onLastFrame, this ) );
					
				} else {
					$target.animate( to, {
						duration : duration,
						easing   : this.easing,
						complete : _.bind( onLastFrame, this )  // run the 'end' method in the scope of this class, not the DOM element that has completed its animation
					} );
				}
			}
		},
		
		
		/**
		 * Determines if the animation is currently running.
		 * 
		 * @return {Boolean} True if the animation is currently running, false otherwise.
		 */
		isRunning : function() {
			return this.running;
		},
		
		
		/**
		 * Determines if the animation is complete.
		 * 
		 * @return {Boolean} True if the animation has completed.
		 */
		isComplete : function() {
			return this.complete;
		},
		
		
		/**
		 * Pre-emptively ends the animation, if it is running, jumping the {@link #target} element(s) to their 
		 * "end of animation" state.
		 */
		end : function() {
			if( this.running ) {
				this.$target.stop( /* clearQueue */ false, /* jumpToEnd */ true );
				
				this.onLastFrame();
			}
		},
		
		
		/**
		 * Cleans up the Animation object after the last frame has been reached, and calls the {@link #callback} if one
		 * was provided.
		 * 
		 * @protected
		 */
		onLastFrame : function() {
			if( this.running ) {
				// set this flag first, so stopping the animation does not enter this block again from another call to this method 
				// (in case the animation is stopped before it is complete, and we don't need it called for each element that is animated)
				this.running = false;
				this.complete = true;
				
				if( typeof this.callback === 'function' ) {
					this.callback.call( this.scope || window, this );
				}
				this.fireEvent( 'afteranimate', this );
				this.fireEvent( 'complete', this );
				
				// Remove references to elements
				delete this.$target;
			}
		}
		
	} );
	
	
	return Animation;
	
} );
/*global define */
define('jqc/plugin/Plugin', [ 
	'lodash',
	'Class',
	'Observable'
],
function( _, Class, Observable ) {
	
	/**
	 * @abstract
	 * @class jqc.plugin.Plugin
	 * @extends Observable
	 * 
	 * Abstract base class for plugins.  All plugins that are created should extend from this class.  Concrete plugin implementations
	 * must implement the method {@link #init}, which is called by a {@link jqc.Component} when it initializes the plugin. See
	 * {@link #init} for more details.
	 * 
	 * See the jqc.plugin package for examples on building plugins.
	 */
	var Plugin = Class.extend( Observable, {
		abstractClass : true,
		
		
		/**
		 * @constructor
		 * @param {Object} config The configuration options for the plugin, specified in an object (hash).
		 */
		constructor : function( config ) {
			// Apply the properties of the configuration object onto this object
			_.assign( this, config );
			
			// Call superclass (Observable) constructor. Must be done after config has been applied.
			this._super( arguments );
		},
		
		
		/**
		 * Abstract method that must be implemented by subclasses to provide the functionality of the plugin. This method
		 * is called by the {@link jqc.Component} that the plugin has been provided to when the Component initializes its plugins. 
		 * This method is given a reference to the {@link jqc.Component Component} as the first argument so that the Component's
		 * events can be subscribed to and its methods can be overridden/extended to implement the plugin's functionality.
		 * 
		 * @abstract
		 * @method init
		 * @param {jqc.Component} component A reference to the {@link jqc.Component} that this plugin belongs to. 
		 */
		init : Class.abstractMethod
		
	} );
	
	
	return Plugin;
	
} );

/*global define */
define('jqc/Component', [
	'require',
	'jquery',
	'lodash',
	'Class',
	'jqc/Jqc',
	'Observable',
	'jqc/util/Css',
	'jqc/util/Html',
	'jqc/Mask',
	'jqc/anim/Animation',
	'jqc/plugin/Plugin',
	'jqc/template/Template',
	'jqc/template/LoDash',
	'jqc/ComponentManager'   // circular dependency. used via require() call in code below
],
function( require, jQuery, _, Class, Jqc, Observable, Css, Html, Mask, Animation, Plugin, Template, LoDashTpl ) {

	/**
	 * @class jqc.Component
	 * @extends Observable
	 * @alias type.component
	 * 
	 * Generalized component that defines a displayable item that can be placed onto a page. Provides a base element (by default, a div),
	 * and a framework for the instantiation, rendering, and (eventually) the destruction process, with events that can be listened to
	 * each step of the way.
	 * 
	 * Components can be constructed via anonymous config objects, based on their `type` property. This is useful for defining components in
	 * an anonymous object, when added as items of a {@link jqc.Container}.
	 * 
	 * Some other things to note about Component and its subclasses are:
	 * 
	 * - Any configuration options that are provided to its constructor are automatically applied (copied) onto the new Component object. This
	 *   makes them available as properties, and allows them to be referenced in subclasses as `this.configName`.  However, unless the
	 *   configuration options are also listed as public properties, they should not be used externally.
	 * - Components directly support masking and un-masking their viewable area.  See the {@link #maskConfig} configuration option, and the {@link #mask} and
	 *   {@link #unMask} methods.
	 * - When a Component is {@link #method-destroy} destroyed, a number of automatic cleanup mechanisms are executed. See {@link #method-destroy} for details.
	 */
	var Component = Class.extend( Observable, { 
		
		/**
		 * @cfg {String} id
		 *  
		 * The id that identifies this Component instance. Defaults to a unique id, and may be retrieved by {@link #getId}.
		 */
		
		/**
		 * @cfg {String} elType
		 * 
		 * The element type that should be created as the Component's HTML element. For example, the string
		 * 'div' will create a &lt;div&gt; element for the Component. Any HTML element type can be used,
		 * and subclasses may override the default for a different implementation.
		 */
		elType : 'div',
		 
		/**
		 * @cfg {jQuery/HTMLElement} renderTo 
		 * 
		 * The HTML element to render this component to. If specified, the component will be rendered immediately 
		 * upon creation.
		 */
		
		/**
		 * @cfg {Boolean} hidden
		 * 
		 * True to initially render the Component hidden.
		 */
		hidden : false,
		
		/**
		 * @protected
		 * @cfg {String} baseCls
		 * 
		 * The base CSS class to apply to the Component. This is meant for subclasses to specify, to change the CSS class that
		 * is applied to the Component's {@link #$el element}. 
		 * 
		 * The value of this config, by convention, is also used to prefix descendent elements of a Component subclass. For 
		 * example, {@link jqc.panel.Panel Panel} sets this config to 'jqc-Panel', and its header and body elements are prefixed with 
		 * this to become 'jqc-Panel-header' and 'jqc-Panel-body', respectively. However when a {@link jqc.window.Window Window} is 
		 * created (which is a subclass of {@link jqc.panel.Panel Panel}, the value is 'jqc-Window', and the header and body become 
		 * 'jqc-Window-header' and 'jqc-Window-body' instead.
		 */
		baseCls : 'jqc-Component',
		
		/**
		 * @protected
		 * @cfg {String} componentCls
		 * 
		 * Any additional CSS class(es) to apply to the Component's root {@link #$el element}, to distinguish it for styling.
		 * This is used for subclasses whose parent defines a {@link #baseCls}, but then have to add additional styling
		 * themselves. 
		 * 
		 * For example, the base form {@link jqc.form.field.Field Field} class adds the {@link #baseCls} 'jqc-form-Field', and
		 * the {@link jqc.form.field.Text Text} field subclass wants to keep that class, and also add 'jqc-form-TextField'
		 * to allow for any different styling of that particular subclass component. The result is two css classes:
		 * 'jqc-form-Field' and 'jqc-form-TextField'. In the case of {@link jqc.form.field.TextArea TextArea} (a subclass
		 * of the Text field}, its componentCls is 'jqc-form-TextAreaField', which overrides Text field's componentCls.
		 */
		
		/**
		 * @cfg {String} cls
		 * 
		 * Any additional CSS class(es) to add to this component's element. If multiple, they should be separated by a space. 
		 * Useful for styling Components and their inner elements (if any) based on regular CSS rules.
		 * (Note that this is named 'cls' instead of 'class', as 'class' is a JavaScript reserved word.)
		 */
		cls: '',
		
		/**
		 * @cfg {Object} style
		 * 
		 * Any additional CSS style(s) to apply to the outer div element. Should be an object where the keys are the CSS 
		 * property names, and the values are the CSS values. Ex:
		 * 
		 *     style : {
		 *         'text-decoration' : 'underline',
		 *         'padding-top'     : '20px',
		 *         'margin'          : '5px'
		 *     }
		 */
		
		/**
		 * @cfg {Object} attr
		 * 
		 * Any additional html attributes to apply to the outer div element. Should be an object where the keys are the attribute names, and the values are the 
		 * attribute values. Attribute values should be strings.
		 */
		
		
		/**
		 * @protected
		 * @cfg {String/String[]/Function/jqc.template.LoDash} renderTpl
		 * 
		 * The template to use to render the Component's **internal** structure. This is used for Component subclasses to
		 * generate the markup that will make up the Component's structure that does not change. This is opposed to the {@link #tpl}
		 * config, which if present, is used to update the component's markup with new data via {@link #update}.
		 * 
		 * The markup generated by this template (in conjunction with the {@link #renderTplData} config) will be created during the
		 * {@link #method-render rendering process}, before the {@link #onRender} hook method is called. This allows the code in 
		 * {@link #onRender} to perform any necessary operations on the generated structure.
		 * 
		 * If a subclass is supplying this config, it should also override the {@link #getContentTarget} method, and return the element
		 * that should be the target of the {@link #html}, {@link #contentEl}, and {@link #tpl} configs. For example:
		 * 
		 *     renderTpl : new LoDashTpl( [
		 *         '<div id="<%= elId %>-titlebar">',  // `elId` var is automatically provided in the {@link #renderTplData}, from the unique {@link #elId} property - See {@link #renderTplData}
		 *             '<%= title %>',                 // `title` var would need to be provided in the {@link #renderTplData} by subclass
		 *         '</div>',
		 *         '<div id="<%= elId %>-body"></div>'
		 *     ] ),
		 *     
		 *     getContentTarget : function() {
		 *         return this.bodyEl || (this.bodyEl = jQuery( '#' + this.elId + '-body' ));  // cache the bodyEl for subsequent calls
		 *     }
		 * 
		 * If, for example, the {@link #html} config is provided, then the value of the config will be placed into the "body" div.
		 * 
		 * 
		 * This config may be a string, an array of strings, a compiled Lo-Dash template function, or a {@link jqc.template.Template} 
		 * instance. For the string, array of strings, or function form, a {@link jqc.template.LoDash LoDash template} instance will be 
		 * created when the Component is rendered. To use another Template type, pass in an instance of a {@link jqc.template.Template} 
		 * subclass to this config. 
		 * 
		 * For more information on Lo-Dash templates (the default type), see: [http://lodash.com/docs#template](http://lodash.com/docs#template)
		 */
		
		/**
		 * @protected
		 * @cfg {Object} renderTplData
		 * 
		 * The data to be provided to the {@link #renderTpl}, if any. For example, if we had the following {@link #renderTpl}:
		 * 
		 *     renderTpl : new LoDashTpl( [
		 *         '<div data-elem="titlebar"><%= title %></div>',
		 *         '<div data-elem="body"></div>'
		 *     ] )
		 *     
		 * Then we would want to set this config to:
		 * 
		 *     { title: "My Title" }
		 *     
		 * This may be done explicitly, in say {@link #initComponent} using the code `this.renderTplData = { title: "My Title" };`,
		 * or it may be returned by an override of the {@link #getRenderTplData} method.
		 * 
		 * 
		 * ### Common Properties
		 * 
		 * A set of common properties will always be available on this object for the {@link #renderTpl} (which are supplied by the 
		 * {@link #getRenderTplData} method), including:
		 * 
		 * - **elId**: The value of the {@link #elId} property (an auto-generated, unique value).
		 * - **baseCls**: The {@link #baseCls} config, which is the base CSS class to prefix descendent elements' CSS
		 *   classes with. Ex: a {@link #baseCls} of 'jqc-Panel' is used to prefix a {@link jqc.panel.Panel Panel's} body
		 *   element to become 'jqc-Panel-body', but when a {@link jqc.window.Window Window} is created, the value is
		 *   'jqc-Window', and the body becomes 'jqc-Window-body' instead. 
		 * - **componentCls**: The {@link #componentCls} config.
		 */
		
		
		/**
		 * @cfg {String} html
		 * Any explicit HTML to attach to the Component at render time.
		 * 
		 * Note that this config, in the end, has the same effect as the {@link #contentEl} config, but is more clear 
		 * from the client code's side for adding explict HTML to the Component.
		 */
		
		/**
		 * @cfg {HTMLElement/jQuery} contentEl
		 * An existing element or jQuery wrapped set to place into the Component when it is rendered, which will become
		 * the "content" of the Component.  The element will be moved from its current location in the DOM to inside this
		 * Component's element.
		 * 
		 * Note that this config, in the end, has the same effect as the {@link #html} config, but is more clear from the
		 * client code's side for adding DOM elements to the Component.
		 */
		
		/**
		 * @cfg {String/String[]/Function/jqc.template.Template} tpl
		 * 
		 * The template to use as the HTML template of the Component. 
		 * 
		 * Used in conjunction with the {@link #tplData} config (which will be the data that is provided to the template
		 * function), this template can be used as the component's markup. Its output is injected into the element specified by
		 * the {@link #getContentTarget content target}, after the {@link #onRender} method has been executed. 
		 * 
		 * If this config is specified, it will override the {@link #html} and {@link #contentEl} configs. The markup that it 
		 * outputs can be updated with new data by using the {@link #update} method, and providing an Object as its first argument.
		 * 
		 * 
		 * This config may be a string, an array of strings, a compiled Lo-Dash template function, or a {@link jqc.template.Template} 
		 * instance. For the string, array of strings, or function form, a {@link jqc.template.LoDash LoDash template} instance will be 
		 * created when the Component is rendered. To use another Template type, pass in an instance of a {@link jqc.template.Template} 
		 * subclass to this config. 
		 * 
		 * For more information on Lo-Dash templates (the default type), see: [http://lodash.com/docs#template](http://lodash.com/docs#template)
		 */
		
		/**
		 * @cfg {Object} tplData
		 * 
		 * The data to provide to the {@link #tpl} when initially rendering the Component. If this config is not
		 * specified, but a {@link #tpl} config is, then the {@link #tpl} will simply be provided an empty object as its data.
		 * 
		 * Note that the template data can be provided after {@link #method-render} time to update the markup of the Component using 
		 * the {@link #update} method. However, if initial data is available, it should be provided with this config so that the 
		 * template is run with the correct initial data the first time, and doesn't need to be run again unless the data has 
		 * changed.
		 */
		
		
		/**
		 * @cfg {Number/String} height
		 * A height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} width
		 * A width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} minHeight
		 * A minimum height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} minWidth
		 * A minimum width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} maxHeight
		 * A maximum height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} maxWidth
		 * A maximum width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		
		/**
		 * @cfg {Object} maskConfig A configuration object for the default mask that will be shown when the {@link #mask} method is called (if {@link #mask mask's}
		 * argument is omitted), or if the {@link #cfg-masked} configuration option is true (in which a mask will be shown over the Component, using this maskConfig, 
		 * when it is first rendered).  This default maskConfig can be overrided when calling {@link #mask} by passing a configuration object for its argument.
		 * 
		 * Masks are shown and hidden using the {@link #mask} and {@link #unMask} methods. If this configuration option is not provided, the configuration
		 * options default to the default values of the configuration options for {@link jqc.Mask}.
		 */
		
		/**
		 * @cfg {Boolean} masked True to instantiate the Component with its mask shown (the {@link #mask} method is automatically run when the Component
		 * is rendered).
		 */
		masked : false,
		
		
		/**
		 * @cfg {jqc.plugin.Plugin/jqc.plugin.Plugin[]} plugins
		 * 
		 * A single plugin or array of plugins to attach to the Component. Plugins must extend the class {@link jqc.plugin.Plugin}.
		 * See {@link jqc.plugin.Plugin} for details on creating plugins.
		 * 
		 * Note that Component will normalize this config into an array, converting a single plugin into a one-element array, or creating
		 * an empty array if no plugins were provided.  This is done so that subclasses may add plugins by pushing them directly
		 * onto the plugins array in their implementation of {@link #initComponent}. 
		 */
		
		
		/**
		 * @protected
		 * @cfg {jqc.Container} parentContainer
		 * 
		 * The parent {@link jqc.Container Container} of this Component (if any), which this Component is a child of. This is set 
		 * by the {@link jqc.Container Container} that is adding this Component as a child, and should not be supplied directly.
		 */
		parentContainer: null,
		
		
		/**
		 * @private
		 * @property {String} uuid (readonly)
		 * 
		 * A unique identifier for the Component, which is unique among all Components on a given page. Can be
		 * retrieved with {@link #getUuid}.
		 */
		 
		/**
		 * @protected
		 * @property {String} elId (readonly)
		 * 
		 * The unique id that is generated for the Component's {@link #$el element}. This is different than {@link #id} so that 
		 * each Component is always guaranteed to have a unique ID for its {@link #$el element}. 
		 * 
		 * Component subclasses often query the DOM for the elements that they create in a {@link #renderTpl} based on this elId. 
		 * If we only used {@link #id} to uniquely identify elements, then there would be the possibility that the user could
		 * accidentally create two components with the same {@link #id}, in which case the second Component would actually 
		 * query and be operating on the DOM elements created for the first Component by mistake.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} rendered
		 * 
		 * Property that can be used to determine if the Component has been rendered.  
		 * Will be set to true after the render method has been executed.
		 */
		rendered: false,
		
		/**
		 * @protected
		 * @property {jQuery} $el
		 * 
		 * The main element that is created for the Component (determined by the {@link #elType} config). 
		 * This will be available after the Component is rendered, and may be retrieved using {@link #getEl}
		 */
		
		/**
		 * @private
		 * @property {Boolean} hidden
		 * 
		 * Property that stores the 'hidden' state of the Component. This property is set to true immediately
		 * when the Component is hidden (even if a hide animation is to take place), and set to false immediately
		 * when the Component is shown (even if a show animation is to take place). This behavior is for the fact
		 * that even if the Component is in the process of showing, it is already shown in some manner.
		 * 
		 * Note that the Component may still be considered "hidden" by its element's visibility, and this case
		 * may be tested for with the `checkDom` parameter that {@link #isHidden} provides.
		 */
	
		/**
		 * @private
		 * @property {Boolean} showing
		 * 
		 * Flag that is set to true while the Component is showing (i.e. a show animation is running). It is set to false
		 * when the Component has fully shown (its animation has completed).
		 */
		showing : false,
	
		/**
		 * @private
		 * @property {Boolean} hiding
		 * 
		 * Flag that is set to true when the Component is hiding (i.e. a hide animation is running). It is set to false
		 * when the Component has fully hidden (its animation has completed).
		 */
		hiding : false,
	
		/**
		 * @private
		 * @property {jqc.anim.Animation} currentAnimation
		 * 
		 * The currently running {@link #method-show}/{@link #method-hide} animation, if any. Will be null if the Component
		 * is not currently in the process of showing or hiding. This is only relevant when {@link #method-show} or
		 * {@link #method-hide} is called with the `anim` option.
		 */
		currentAnimation : null,
		
		
		/**
		 * @protected
		 * @property {Boolean} masked
		 * 
		 * Flag to store the current state of if the Component is masked or not. This is also a config option.
		 */
		
		/**
		 * @private
		 * @property {Boolean} deferMaskShow
		 * 
		 * Flag that is set to true if the {@link #mask} method is run, but the Component is currently hidden.
		 * The Component must be in a visible state to show the mask, as the jqc.Mask class makes a calculation of 
		 * the height of the mask target element.  When the Component's {@link #method-show} method runs, this flag will be
		 * tested to see if it is true, and if so, will run the {@link #mask} method at that time.
		 */
		deferMaskShow : false,
		
		/**
		 * @private
		 * @property {jqc.Mask} _mask
		 * 
		 * The jqc.Mask instance that the Component is currently using to mask over the Component. This will be null
		 * if no jqc.Mask has been created (i.e. the {@link #mask} method has never been called). 
		 */
		
		/**
		 * @private
		 * @property {Object} deferredMaskConfig
		 * 
		 * If the masking of the Component needs to be deferred (either because the Component is not yet rendered, or because
		 * the Component is currently hidden), then the configuration options to show the mask with are stored in this property,
		 * for when the mask does in fact get shown.
		 */
		
		
		/**
		 * @protected
		 * @property {Boolean} updateCalledWithContent
		 * 
		 * This special flag is for if a {@link #tpl} exists, but the {@link #update} method was called with direct HTML content
		 * (instead of {@link #tplData}). This only matters while the Component is in its {@link #rendered unrendered} state. A 
		 * value of `true` tells the {@link #method-render} method to skip rendering the {@link #tpl}, and instead use the direct 
		 * {@link #html} content that was provided to the call to {@link #update}.
		 */

		
		/**
		 * @protected
		 * @property {Boolean} destroying
		 * 
		 * Property which is set to `true` while the {@link #method-destroy} method executes. This is mainly for the
		 * {@link #onDestroy} hook method, which may call other methods that may want to determine if the Component is 
		 * destroying itself, in order to avoid doing unnecessary work.
		 * 
		 * An example of this would be a method that resets the Component's element to an "empty" state due to unbinding
		 * itself from a data entity, but really shouldn't do so when the Component's element is just going to be removed 
		 * from the DOM anyway. 
		 */
		destroying: false,
		
		/**
		 * @protected
		 * @property {Boolean} destroyed
		 * 
		 * Initially `false`, and will be set to `true` after the {@link #method-destroy} method executes.
		 */
		destroyed: false,
		
		
		/**
		 * @constructor
		 * @param {Object} config The configuration options for this Component, specified in an object (hash).
		 */
		constructor : function( config ) {
			// Apply the properties of the configuration object onto this object
			_.assign( this, config );
			
			
			// Call superclass (observable) constructor. Must be done after config has been applied.
			this._super( arguments );
			
	        
			// Add events that this class will fire
			this.addEvents( 
				/**
				 * Fires when this Component has been {@link #method-render rendered}.
				 * 
				 * @event render
				 * @param {jqc.Component} component This Component instance.
				 */
				'render',
				
				/**
				 * Fires before the Component is shown. Handlers of this event may cancel the showing of the Component by 
				 * returning false.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event beforeshow
				 * @param {jqc.Component} component This Component instance.
				 * @preventable
				 */
				'beforeshow',
				
				/**
				 * Fires when the Component has been shown, using the {@link #method-show} method. If an `anim` option
				 * was passed to the {@link #method-show} method, this event fires immediately, just after the beginning of the
				 * animation. To find out when the animation is complete, listen to the {@link #aftershow} event.
				 *
				 * Note that this event fires as soon as the Component is starting to show because handlers most likely expect to do 
				 * something with the Component immediately. So for handlers of Components that first don't show with any `anim`, and 
				 * then are given one at a later time, they will still work as expected (as opposed to the behavior of if this event 
				 * fired at the end of the animation).
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 * 
				 * @event show
				 * @param {jqc.Component} component This Component instance.
				 */
				'show',
	
				/**
				 * An alias of the {@link #event-show} event, which can make handler-adding code more consistent and clear
				 * when running animations. Also, having a 'begin' event for 'show' also maintains consistency with {@link #hidebegin}.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event showbegin
				 * @param {jqc.Component} component This Component instance.
				 */
				'showbegin',
	
				/**
				 * Fires when the Component has fully shown, after any animation has finished. Note that this
				 * event will fire regardless of if an `anim` option was provided to the {@link #method-show} method or not.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event aftershow
				 * @param {jqc.Component} component This Component instance.
				 */
				'aftershow',
				
				/**
				 * Fires before the Component is hidden. Handlers of this event may cancel the hiding of the Component by 
				 * returning false.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event beforehide
				 * @param {jqc.Component} component This Component instance.
				 * @preventable
				 */
				'beforehide',
	
				/**
				 * Fires when the Component has been hidden, using the {@link #method-hide} method. If an `anim` option was passed
				 * to the {@link #method-hide} method, this event fires *after* the animation has finished hiding the Component. 
				 * To find out when a hide animation has started, listen to the {@link #hidebegin} event.
				 * 
				 * Note that this event fires only after the Component has fully hidden because handlers most likely expect to do something
				 * after the Component is hidden from the DOM. So for handlers of Components that first don't hide with any `anim`, and
				 * then are given one at a later time, they will still work as expected (as opposed to the behavior of if this event fired 
				 * at the start of the animation).
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 * 
				 * @event hide
				 * @param {jqc.Component} component This Component instance.
				 */
				'hide',
	
				/**
				 * Fires when the Component is beginning to hide. This event is useful if an `anim` option is specified to the
				 * {@link #method-hide} method, as it fires just before the animation starts. The {@link #event-hide} 
				 * (and {@link #afterhide}) event will fire when the animation is complete, and the Component has been completely 
				 * hidden. Note that this event will  fire regardless of if an `anim` option is provided to the {@link #method-hide} 
				 * method or not.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event hidebegin
				 * @param {jqc.Component} component This Component instance.
				 */
				'hidebegin',
	
				/**
				 * An alias of the {@link #event-hide} event, which can make handler-adding code more consistent and clear.
				 * Having a 'complete' event for 'hide' also maintains consistency with {@link #aftershow}.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event afterhide
				 * @param {jqc.Component} component This Component instance.
				 */
				'afterhide',
				
				/**
				 * Fires just before this Component is destroyed. A handler of this event may return false to cancel 
				 * the destruction process for the Component.
				 * 
				 * @event beforedestroy
				 * @param {jqc.Component} component This Component instance. 
				 * @preventable
				 */
				'beforedestroy',
				
				/**
				 * Fires when this Component has been destroyed.
				 * 
				 * @event destroy
				 * @param {jqc.Component} component This Component instance.
				 */
				'destroy'
			);
			
			
			// Generate a globally unique identifier for the Component, which is unique for all Components on the page.
			// This will also be used as the `elId`, and the default value for the `id` config if one was not provided.
			this.uuid = this.elId = 'jqc-cmp-' + _.uniqueId();
			this.id = this.id || this.uuid;  // default the Component's id to the uuid if not provided
			
			
			// Normalize the 'plugins' config into an array before calling initComponent, so that subclasses may just push any
			// plugins that they wish directly onto the array without extra processing.
			this.plugins = this.plugins || [];
			if( !_.isArray( this.plugins ) ) {
				this.plugins = [ this.plugins ];
			}
	        
			
			// Call template method for the initialization of subclasses of this Component
			this.initComponent();
			
			
			// Initialize any plugins provided to the Component
			if( this.plugins.length > 0 ) {
				this.initPlugins( this.plugins );
			}
			
			// Render the component immediately if a 'renderTo' element is specified
			if( this.renderTo ) {
				this.render( this.renderTo );
				delete this.renderTo;   // no longer needed
			}
		},
		
		
		/**
		 * Hook method for initialization. This method should replace constructor for subclasses
		 * of Component.
		 * 
		 * @protected
		 * @method initComponent
		 */
		initComponent : Jqc.emptyFn,
		
		
		/**
		 * Initializes the plugins for the Component.
		 * 
		 * @private
		 * @param {jqc.plugin.Plugin/jqc.plugin.Plugin[]} plugin A single plugin, or array of plugins to initialize.
		 */
		initPlugins : function( plugin ) {
			if( _.isArray( plugin ) ) {
				for( var i = 0, len = plugin.length; i < len; i++ ) {
					this.initPlugins( plugin[ i ] ); 
				}
				return;  // array has been processed, return
			}
			
			if( !( plugin instanceof Plugin ) ) {
				throw new Error( "error: a plugin provided to this Component was not of type jqc.plugin.Plugin" );
			}
			
			// Initialize the plugin, passing a reference to this Component into it.
			plugin.init( this );
		},
		
		
		/**
		 * Renders the component into a containing HTML element.  Starts by creating the base div element for this component, and then 
		 * calls the hook method {@link #onRender} to allow subclasses to add their own functionality/elements into the rendering process.
		 * When fully complete, the {@link #event-render render event is fired}, and then {@link #doLayout} is executed (if the `deferLayout` 
		 * option is not provided as `true`).
		 *
		 * @param {HTMLElement/jQuery} containerEl The HTML element to render this component into.
		 * @param {Object} [options] Any of the following options. (Note: for backward compatibility, this argument may be the `position` option below.)
		 * @param {String/Number/HTMLElement/jQuery} [options.position] The index, element id, or element that the component should be inserted before.
		 *   This element should exist within the `containerEl`.
		 * @param {Boolean} [options.deferLayout=false] True to defer the execution of {@link #doLayout} during the rendering
		 *   process until manually called.
		 */
		render : function( containerEl, options ) {
			// Destroyed components can't be re-rendered. Return out.
			if( this.destroyed ) {
				return;
			}
			
			// Maintain backward compatibility where the `options` argument was the `position` option
			var position;
			if( _.isNumber( options ) || _.isString( options ) || _.isElement( options ) || options instanceof jQuery ) {
				position = options;
				options = { position: position };  // store it in there for when it is provided to hook methods
			} else {
				options = options || {};
				position = options.position;
			}
			
			
			var $containerEl = jQuery( containerEl );
			
			// Normalize position to the element where the Component is to be placed before (if provided)
			if( typeof position !== 'undefined' ) {
				if( typeof position === 'number' ) {
					// note: If the numeric `position` doesn't resolve to an element to insert before, it will become `undefined`, causing the code later to just append it instead. 
					// This is desired behavior, as inserting into an element at a position greater than the number of elements in the container, would make sense to simply append.
					position = $containerEl.children().get( position );   // get() will return undefined if there is no element at that position
				} else {
					position = $containerEl.find( position );  // if an element was provided, make sure that the element exists in the container element provided as well
				}
			}
			
			
			if( this.rendered ) {
				// Component is already rendered, just append it to the supplied container element
				if( position ) {
					// If the element where this Component is to be positioned before happens to already be this Component's element,
					// jQuery's insertBefore() has the effect of removing the element from the DOM... Hence, only move the Component's
					// element if it is not to be placed "before itself" (in which otherwise, it is already in the correct position, 
					// and we don't need to do anything anyway) 
					if( position[ 0 ] !== this.$el[ 0 ] ) {
						this.$el.insertBefore( position );
					}
				} else {
					this.$el.appendTo( $containerEl );
				}
				
			} else {
				// Handle any additional attributes (the `attr` config) that were specified to add (or any attributes
				// added by subclass implementations of getRenderAttributes())
				var attr = Html.attrMapToString( this.getRenderAttributes() );
				delete this.attr;  // config no longer needed
				
				// Create a CSS string of any specified styles (the `style` config + sizing configs such as width/height)
				var style = Css.mapToString( this.getRenderStyle() );  // convert the Object (map) returned by getRenderStyle() into a CSS string
				delete this.style;  // config no longer needed
				
				// If there is a `renderTpl`, execute it now
				var renderTpl = this.renderTpl,
				    renderTplMarkup = "";
				if( renderTpl ) {
					renderTpl = ( renderTpl instanceof Template ) ? renderTpl : new LoDashTpl( renderTpl );  // normalize renderTpl to a Template instance if it is not one already
					renderTplMarkup = renderTpl.apply( this.getRenderTplData() );
					
					delete this.renderTpl;      // no longer needed
					delete this.renderTplData;  // no longer needed
				}
				
				// Create the main (outermost) element for the Component. By default, creates a div element, such as: <div id="someId"></div>
				// With a `renderTpl`, it will create the div with its `renderTpl` result as its inner HTML. Ex:
				// <div id="someId"><div id="bodyEl" /></div>
				var cls = _.compact( [ this.baseCls, this.componentCls, this.cls ] ).join( " " );  // _.compact() removes falsy values. In this case, undefined values.
				var elMarkup = [
					'<', this.elType, ' id="', this.elId, '" class="', cls, '" style="', style, '" ', attr, '>',
						renderTplMarkup,
					'</', this.elType, '>'
				].join( "" );
				this.$el = jQuery( elMarkup );
				
				
				// Appending the element to the container before the call to onRender. It is necessary to do things in this order (and not rendering children and then appending)
				// for things like the jQuery UI tabs, which requires that their wrapping elements be attached to the DOM when they are instantiated.
				// Otherwise, those items require their instantiation to be placed into a setTimeout(), which causes a flicker on the screen (especially for the jQuery UI tabs). 
				if( position ) {
					this.$el.insertBefore( position );
				} else {
					this.$el.appendTo( $containerEl );
				}
				
				
				// Setting the render flag before the call to onRender so that onRender implementations can call methods that check this flag (such as setters
				// that handle the case of the Component not yet being rendered).
				this.rendered = true;
				
				// Call onRender hook method for subclasses to add their own elements, and whatever else they need 
				this.onRender( $containerEl, options );
				
				// Make sure the `tpl` has been created into a LoDashTpl instance, not only for the initial rendering,
				// but also for when calling `update()` with a data object.
				if( this.tpl && !( this.tpl instanceof Template ) ) {
					this.tpl = new LoDashTpl( this.tpl );
				}
				
				
				// Attach the output of the `tpl` config (if provided) or any specified HTML or content element to the Component's content 
				// target. The content target is by default, the Component's element, but may be overridden by subclasses that generate a 
				// more complex HTML structure.
				var $contentTarget = this.getContentTarget();
				if( this.tpl && !this.updateCalledWithContent ) {  // tpl config takes precedence over html/contentEl configs, *unless* update() has been called with HTML content
					$contentTarget.append( this.tpl.apply( this.tplData ) );
					
				} else {
					if( this.html ) {
						$contentTarget.append( this.html );
					}
					if( this.contentEl ) {
						$contentTarget.append( this.contentEl );
					}
				}
				delete this.tplData;                  // no longer needed
				delete this.updateCalledWithContent;  // no longer needed
				delete this.html;                     // no longer needed
				delete this.contentEl;                // no longer needed
				
				
				// If the Component was configured with hidden = true, hide it now. This must be done after onRender,
				// because some onRender methods change the 'display' style of the outer element.
				if( this.hidden ) {
					this.$el.hide();
				}
				
				// If the Component was configured with masked = true, show the mask now.
				if( this.masked ) {
					this.mask( this.deferredMaskConfig );  // deferredMaskConfig will be defined if a call to mask() has been made before the Component has been rendered. Otherwise, it will be undefined.
				}
				
				// Call the onAfterRender hook method, and fire the 'render' event
				this.onAfterRender( $containerEl, options );
				this.fireEvent( 'render', this );
				
				// Finally, if the deferLayout option was not provided as true, run the layout on the Component (or Container, 
				// if it's a jqc.Container subclass!)
				if( !options.deferLayout ) {
					this.doLayout();
				}
			}
		},
		
		
		/**
		 * Retrieves the additional attributes that are used to render the Component's {@link #$el element} with.
		 * This method is called from {@link #method-render} when initially rendering the component.
		 * 
		 * @protected
		 * @return {Object} An Object (map) of the additional attributes which should be applied to the Component's
		 *   main {@link #$el element}.
		 */
		getRenderAttributes : function() {
			return this.attr || {};
		},
		
		
		/**
		 * Retrieves the style properties that are used to render the Component's {@link #$el element} with. This method 
		 * is called from {@link #method-render} when initially rendering the component.
		 * 
		 * @protected
		 * @return {Object} An Object (map) of the style properties which should be applied to the Component's main 
		 *   {@link #$el element}.
		 */
		getRenderStyle : function() {
			var style = this.style || {};
			
			// Apply any custom sizing
			var width = this.width,
			    height = this.height,
			    minWidth = this.minWidth,
			    minHeight = this.minHeight,
			    maxWidth = this.maxWidth,
			    maxHeight = this.maxHeight;
			
			var undef,  // to allow for minification var collapse
			    normalizeSizeValue = Css.normalizeSizeValue;  // to allow for minification var collapse
			if( width !== undef )     style.width = normalizeSizeValue( width );
			if( height !== undef )    style.height = normalizeSizeValue( height );
			if( minWidth !== undef )  style.minWidth = normalizeSizeValue( minWidth );
			if( minHeight !== undef ) style.minHeight = normalizeSizeValue( minHeight );
			if( maxWidth !== undef )  style.maxWidth = normalizeSizeValue( maxWidth );
			if( maxHeight !== undef ) style.maxHeight = normalizeSizeValue( maxHeight );
			
			return style;
		},
		
		
		/**
		 * Retrieves the data to be used by the {@link #renderTpl}. Adds the common properties to any {@link #renderTplData} config
		 * provided before returning. These properties are enumerated in the {@link #renderTplData} config doc.
		 * 
		 * This method may be overridden to add properties to the returned object. However, this superclass method should always 
		 * be called first, to supply the initial properties.
		 * 
		 * @protected
		 * @return {Object} An Object (map) with the properties needed for the {@link #renderTpl}.
		 */
		getRenderTplData : function() {
			return _.assign( {}, {
				elId         : this.elId,
				baseCls      : this.baseCls,
				componentCls : this.componentCls
			}, this.renderTplData || {} );
		},
		
		
		/**
		 * Determines if the Component is currently {@link #rendered}.
		 * 
		 * @return {Boolean} True if the Component is rendered, false otherwise.
		 */
		isRendered : function() {
			return this.rendered;
		},
		
		
		/**
		 * Hook method that runs when a Component is being rendered, after the Component's base element has been created, its
		 * {@link #renderTpl} has been processed and appended, and the element has been appended to its parent element.
		 * 
		 * @protected
		 * @method onRender
		 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component is being rendered into.
		 * @param {Object} options The options provided to {@link #method-render}.
		 */
		onRender : Jqc.emptyFn,
		
		
		/**
		 * Hook method that runs when a Component has been completely rendered. This includes everything up to the point of
		 * when the {@link #onRender} hook method has been called, and after the {@link #html}, {@link #contentEl}, and 
		 * {@link #tpl} configs have been processed and their content has been added to the Component's {@link #$el element}.
		 * It is also called after the initial {@link #cfg-hidden} state has been processed, and any initial 
		 * {@link #cfg-masked mask} has been applied.
		 * 
		 * @protected
		 * @method onAfterRender
		 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component has been rendered into.
		 * @param {Object} options The options provided to {@link #method-render}.
		 */
		onAfterRender : Jqc.emptyFn,
		
		
		/**
		 * Updates the HTML of the component directly, or re-runs the {@link #tpl} to update the HTML if {@link #tplData template data}
		 * (an Object) is provided. Will handle the unrendered and rendered states of the Component.
		 *
		 * @param {String/HTMLElement/jQuery/Object} contentOrTplData The HTML content as a string, an HTML element, or a jQuery 
		 *   wrapped set of elements to update the component's {@link #getContentTarget content target} with. If an Object is provided, 
		 *   it is taken as the {@link #tplData data} that the {@link #tpl} should be executed with, allowing this method to update the 
		 *   Component's markup via its {@link #tpl}.
		 */
		update : function( content ) {
			var isTplData = _.isPlainObject( content );  // will be true if it is a plain JavaScript Object, meaning template data is being provided
			
			if( !this.rendered ) {
				if( isTplData ) {
					this.tplData = content;
					
				} else {  // Not a plain JavaScript Object, must be HTML content
					// Remove this config, just in case it was specified. Setting the 'html' config (next) has the same effect as 'contentEl'.
					delete this.contentEl;
					
					// Set the 'html' config, for when the Component is rendered.
					this.html = content;
					this.updateCalledWithContent = true;  // in case there is a `tpl` config, this flag tells render() to use the `html` config instead 
                                                          // of `tpl` when it renders. We don't want to delete the `tpl` config, since it may be used with
                                                          // data provided to this method at a later time.
				}
			} else {
				this.getContentTarget()
					.empty()
					.append( isTplData ? this.tpl.apply( content ) : content );
			}
		},
		
		
		
		// Layout Functionality
		
		/**
		 * This method was initially intended to bring Component layouts into the mix (instead of only having {@link jqc.Container Container}
		 * layouts, which lay out {@link jqc.Container#items child components}). A Component layout was going to size and position the HTML 
		 * elements that a particular Component had created in its {@link #onRender} method.
		 * 
		 * However, at the time of this writing, we never got around to implementing this feature, and {@link jqc.Container} extends
		 * this method for its {@link jqc.Container#layout layout} of {@link jqc.Container#items child components}. This method was added into 
		 * the Component class (this class) later though, in an effort to allow Components to respond to being laid out by their {@link #parentContainer}.
		 * When the Component's {@link #parentContainer} runs its {@link jqc.Container#layout layout}, this method is executed from it. A 
		 * Component author may implement an extension of the {@link #onComponentLayout} hook method to respond to the Component being laid 
		 * out by its {@link #parentContainer}, such as to implement updating the size or positioning of its child elements upon being laid out.
		 * Note that {@link #onComponentLayout} will eventually be called just from the Component's initial {@link #method-render rendering} 
		 * process as well, if the Component is not being rendered by a {@link #parentContainer} layout (i.e. it is a standalone Component,
		 * not part of a {@link jqc.Container Container}/Component hierarchy).
		 * 
		 * So, bottom line, if you wish for your Component to do something when it is laid out by its {@link #parentContainer},
		 * implement the {@link #onComponentLayout} method. See {@link #onComponentLayout} for details.
		 */
		doLayout : function() {
			// Note: this method is extended in the jqc.Container subclass. Keep this in mind if ever implementing Component
			// layouts properly, which should both run both the Component's layout, *and* the Container's layout (in that order).
			
			// Simply call the hook method to allow subclasses to participate in the Component being laid out, and fire the event.
			this.onComponentLayout();
		},
		
		
		/**
		 * Hook method that is executed when {@link #doLayout} has executed. Extend this method (calling the superclass method first)
		 * to implement any logic that the Component subclass should perform when it is either: 
		 * 
		 * a) Initially rendered (as a standalone component, not part of a {@link jqc.Container Container}/Component hierarchy), or
		 * b) Has been laid out by its {@link #parentContainer}. If initially rendered by its {@link #parentContainer parent container's}
		 * layout, then this will be the same event.
		 * 
		 * For example, a Component could resize its inner elements for new dimensions set on the Component by its 
		 * {@link #parentContainer parentContainer's} {@link jqc.Container#layout layout} algorithm. The layout may size the Component
		 * upon its initial rendering, an update to the child components of the {@link #parentContainer}, or from say, a browser resize
		 * where the layout runs again.
		 *
		 * @protected
		 * @template
		 * @method onComponentLayout
		 */
		onComponentLayout : Jqc.emptyFn,
		
		
		/**
		 * When called on the Component, this method bubbles up to the top of the {@link jqc.Container Container}/Component hierarchy,
		 * and runs {@link #doLayout} on the top-most component. This has the effect of re-doing the layout for all Containers/Components
		 * in that particular hierarchy. As such, this may be an expensive operation; use with care. This may be useful however for components
		 * that are sized based on their content, and when their content size changes, they should force a layout to adjust for the new
		 * content size.
		 */
		updateLayout : function() {
			// Bubble up to the top level parent container of this Component's hierarchy, and then call doLayout() on it
			var p = this;
			while( p.parentContainer ) {
				p = p.parentContainer;
			}
			p.doLayout();
		},
		
		
		// ----------------------------
		
		// Attribute, CSS Class, and Element Style related functionality
		
		/**
		 * Sets an attribute on the Component's {@link #$el element}.
		 * 
		 * @param {String/Object} name The attribute name. This first argument may also be provided as an Object of key/value
		 *   pairs for attribute names/values to apply to the Component's {@link #$el element}.
		 * @param {String} value The value for the attribute. Optional if the first argument is an Object.
		 * @return {jqc.Component} This Component, to allow method chaining.
		 */
		setAttr : function( name, value ) {
			if( !this.rendered ) {
				this.attr = this.attr || {};
				
				if( typeof name === 'object' ) {
					_.assign( this.attr, name );  // apply each of the properties on the provided 'attrs' object onto the component's attributes
				} else {
					this.attr[ name ] = value;
				}
				
			} else {
				this.$el.attr( name, value );  // will work for both method signatures
			}
			return this;
		},
		
		
		/**
		 * Adds a CSS class to the Component's {@link #$el element}.
		 * 
		 * @param {String} cssClass One or more CSS classes to add to the Component's element. If specifying multiple CSS classes,
		 *   they should be separated with a space. Ex: "class1 class2"
		 * @return {jqc.Component} This Component, to allow method chaining.
		 */
		addCls : function( cssClass ) {
			if( !this.rendered ) {
				var cssClasses = cssClass.split( ' ' );
				for( var i = 0, len = cssClasses.length; i < len; i++ ) {
					var cls = cssClasses[ i ],
					    regex = new RegExp( '(^| )' + cls + '( |$)' );
					    
					if( !regex.test( this.cls ) ) {
						this.cls += ' ' + cls;
					}
				}
				this.cls = jQuery.trim( this.cls );
				
			} else {
				this.$el.addClass( cssClass ); // delegate to jQuery in this case
			}
			return this;
		},
		
		
		/**
		 * Removes a CSS class from the Component's {@link #$el element}.
		 * 
		 * @param {String} cssClass One or more CSS classes to remove from the Component's element. If specifying multiple CSS classes,
		 *   they should be separated with a space. Ex: "class1 class2"
		 * @return {jqc.Component} This Component, to allow method chaining.
		 */
		removeCls : function( cssClass ) {
			if( !this.rendered ) {
				var cssClasses = cssClass.split( ' ' );
				var replaceFn = function( match, $1, $2 ) {
					return ( $1 === " " && $2 === " " ) ? " " : "";  // if the css class was padded with spaces on both sides, replace with a single space. Otherwise, we can replace with nothing.
				};
				
				for( var i = 0, len = cssClasses.length; i < len; i++ ) {
					var cls = cssClasses[ i ],
					    regex = new RegExp( '(^| )' + cls + '( |$)', 'g' );
									
					this.cls = this.cls.replace( regex, replaceFn );
				}
				
			} else {
				this.$el.removeClass( cssClass ); // delegate to jQuery in this case
			}
			return this;
		},
	
	
		/**
		 * Adds or removes a CSS class from the Component's {@link #$el element}, based on if the CSS class already exists on the element
		 * or not. If providing the `flag` argument, the `cssClass` will be added or removed based on if `flag` is true or false.
		 * 
		 * @param {String} cssClass One or more CSS classes to remove from the Component's element. If specifying multiple CSS classes,
		 *   they should be separated with a space. Ex: "class1 class2"
		 * @param {Boolean} [flag] True if the class(es) should be added, false if they should be removed. This argument is optional,
		 *   and if provided, determines if the class should be added or removed.
		 * @return {jqc.Component} This Component, to allow method chaining.
		 */
		toggleCls : function( cssClass, flag ) {
			if( typeof flag === 'undefined' ) {
				this[ !this.hasCls( cssClass ) ? 'addCls' : 'removeCls' ]( cssClass );
			} else {
				this[ flag ? 'addCls' : 'removeCls' ]( cssClass );
			}
			return this;
		},
		
		
		/**
		 * Determines if the Component's {@link #$el element} has the given `cssClass`.
		 * 
		 * @param {String} cssClass The CSS class to test for.
		 * @return {Boolean} True if the {@link #$el element} has the given `cssClass`, false otherwise.
		 */
		hasCls : function( cssClass ) {
			if( !this.rendered ) {
				var regex = new RegExp( '(^| )' + cssClass + '( |$)', 'g' );
				return regex.test( this.cls );
				
			} else {
				return this.$el.hasClass( cssClass );
			}
		},
		
		
		/**
		 * Sets a CSS style property on the Component's {@link #$el element}.
		 * 
		 * @param {String/Object} name The CSS property name. This first argument may also be provided as an Object of key/value
		 *   pairs for CSS property names/values to apply to the Component's {@link #$el element}.
		 * @param {String} value The value for the CSS property. Optional if the first argument is an Object.
		 * @return {jqc.Component} This Component, to allow method chaining.
		 */
		setStyle : function( name, value ) {
			if( !this.rendered ) {
				this.style = this.style || {};
				
				if( typeof name === 'object' ) {
					_.assign( this.style, name );  // apply each of the properties on the provided 'styles' object onto the component's style
				} else {
					this.style[ name ] = value;
				}
				
			} else {
				this.$el.css( name, value );  // will work for both method signatures (i.e. when `name` is an object, and when provided both name / value)
			}
			return this;
		},
		
		
		// ----------------------------
		
		
		/**
		 * Retrieves the element that should be the target for the Component's content (html).  For jqc.Component, this is just the Component's
		 * base element (see {@link #$el}), but this method can be overridden in subclasses that define a more complex structure, where their
		 * content should be placed elsewhere. 
		 * 
		 * @protected
		 * @return {jQuery} The element (jQuery wrapped set) where HTML content should be placed. The {@link #html} and {@link #contentEl} 
		 *   configs will be attached to this element.
		 */
		getContentTarget : function() {
			return this.getEl();
		},
		
		
		/**
		 * Returns the globally unique {@link #uuid} of this Component.
		 * 
		 * @return {String}
		 */
		getUuid : function() {
			return this.uuid;
		},
		
		
		/**
		 * Returns the {@link #id} of this Component.
		 * 
		 * @return {String}
		 */
		getId : function() {
			return this.id;
		},
		
		
		/**
		 * Returns the container element for this component, wrapped in a jQuery object.  This element will only
		 * be available after the component has been rendered by {@link #method-render}.  The element that will be returned
		 * will be the one created for the Component in the {@link #method-render} method, and its type is dependent on the
		 * {@link #elType} config.
		 * 
		 * @return {jQuery}
		 */
		getEl : function() {
			return this.$el;
		},
		
		
		/**
		 * Sets the size of the element.
		 * 
		 * @param {Number} width The width, in pixels, for the Component. If undefined, no width will be set.
		 * @param {Number} height The height, in pixels, for the Component. If undefined, no height will be set.
		 */
		setSize : function( width, height ) {
			if( typeof width !== 'undefined' ) {
				this.width = width;
				
				if( this.rendered ) {
					this.$el.width( width );
				}
			}
			if( typeof height !== 'undefined' ) {
				this.height = height;
				
				if( this.rendered ) {
					this.$el.height( height );
				}
			}
		},
		
		
		/**
		 * Sets the width of the element.
		 *
		 * @param {Number/String} width The width. If a number, assumes pixels, otherwise uses the exact string.
		 */
		setWidth : function( width ) {
			this.setSize( width, undefined );
		},
		
		
		/**
		 * Returns the width of the Component. 
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 *
		 * @return {Number}
		 */
		getWidth : function() {
			return this.$el.width();
		},
		
		
		/** 
		 * Returns the inner width of the Component. The inner width of the Component is the Component's width, plus
		 * its padding.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @return {Number}
		 */
		getInnerWidth : function() {
			return this.$el.innerWidth();
		},
		
		
		/**
		 * Returns the outer width of the Component. The outer width of the Component is the Component's width, plus
		 * its padding, plus its border width. Provide the optional argument `includeMargin` as true to include the margin
		 * as well.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @param {Boolean} [includeMargin=false]
		 * @return {Number}
		 */
		getOuterWidth : function( includeMargin ) {
			return this.$el.outerWidth( includeMargin || false );  // must pass boolean arg (at least for jQuery 1.9.1)
		},
	
		
		/**
		 * Sets the height of the element.
		 *
		 * @param {Number/String} height The height. If a number, assumes pixels, otherwise uses the exact string.
		 */
		setHeight : function( height ) {
			this.setSize( undefined, height );
		},
		
	
		/**
		 * Returns the height of the Component. 
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 *
		 * @return {Number}
		 */
		getHeight : function() {
			return this.$el.height();
		},
		
		
		/** 
		 * Returns the inner height of the Component. The inner height of the Component is the Component's height, plus
		 * its padding.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @return {Number}
		 */
		getInnerHeight : function() {
			return this.$el.innerHeight();
		},
		
		
		/** 
		 * Returns the outer height of the Component. The outer height of the Component is the Component's height, plus
		 * its padding, plus its border width. Provide the optional argument `includeMargin` as true to include the margin
		 * as well.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @param {Boolean} [includeMargin=false]
		 * @return {Number}
		 */
		getOuterHeight : function( includeMargin ) {
			return this.$el.outerHeight( includeMargin || false );  // must pass boolean arg (at least for jQuery 1.9.1)
		},
	
		
		/**
		 * Returns the configured width of the component.
		 *
		 * @return {Number}
		 */
		getConfiguredWidth : function() {
			return this.width;
		},
	
		
		/**
		 * Returns the configured height of the component.
		 *
		 * @return {Number}
		 */
		getConfiguredHeight : function() {
			return this.height;
		},
		
		
		/**
		 * Retrieves the width of the padding for the given `sides` of the component's {@link #$el element}. 
		 * `sides` can be either 't', 'r', 'b', 'l' for "top", "right", "bottom", or "left", *or* it can be a 
		 * combination of more than one to add the widths together. Ex: 'lr' would add the left and right padding 
		 * together and return that number.
		 * 
		 * Note: This method can only be run after the Component has been {@link #rendered}.
		 * 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the padding for the given `sides`.
		 */
		getPadding : function( sides ) {
			return Css.getPadding( this.$el, sides );
		},	
		
		
		/**
		 * Retrieves the width of the margin for the given `sides` of the component's {@link #$el element}. 
		 * `sides` can be either 't', 'r', 'b', 'l' for "top", "right", "bottom", or "left", *or* it can be a 
		 * combination of more than one to add the widths together. Ex: 'lr' would add the left and right margin 
		 * together and return that number.
		 * 
		 * Note: This method can only be run after the Component has been {@link #rendered}.
		 * 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the margin for the given `sides`.
		 */
		getMargin : function( sides ) {
			return Css.getMargin( this.$el, sides );
		},
		
		
		/**
		 * Retrieves the width of the border for the given `sides` of the component's {@link #$el element}. 
		 * `sides` can be either 't', 'r', 'b', 'l' for "top", "right", "bottom", or "left", *or* it can be a 
		 * combination of more than one to add the widths together. Ex: 'lr' would add the left and right border 
		 * together and return that number.
		 * 
		 * Note: This method can only be run after the Component has been {@link #rendered}.
		 * 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the border for the given `sides`.
		 */
		getBorderWidth : function( sides ) {
			return Css.getBorderWidth( this.$el, sides );
		},
		
		
		/**
		 * Retrieves the "frame" size of the component's {@link #$el element}, which is the sum of the width of the padding, margin, and border, 
		 * for the given `sides` of the `element`. `sides` can be either 't', 'r', 'b', or 'l' (for "top", "right", "bottom", or "left"), *or* 
		 * it can be a combination of more than one to add the padding widths together. Ex: 'rl' would add the right and left padding/border/margin 
		 * together and return that number.
		 * 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The sum total of the width of the border, plus padding, plus margin, for the given `sides`.
		 */
		getFrameSize : function( sides ) {
			return Css.getFrameSize( this.$el, sides );
		},
	
		
		// ------------------------------------
		
		
		/**
		 * Convenience method to show or hide the Component using a boolean.
		 * 
		 * @param {Boolean} visible True to show the Component, false to hide it.
		 * @return {jqc.Component} This Component, to allow method chaining.
		 */
		setVisible : function( visible ) {
			return this[ visible ? 'show' : 'hide' ]();
		},
		
		
		/**
		 * Shows the Component. 
		 *
		 * @param {Object} [options] An object which may contain the following options:
		 * @param {Object} [options.anim] An {@link jqc.anim.Animation Animation} config object (minus the 
		 *   {@link jqc.anim.Animation#target target} property) for animating the showing of the Component. 
		 *   Note that this will only be run if the Component is currently {@link #rendered}.
		 * @chainable
		 */
		show : function( options ) {
			// If the Component is currently visible, or a 'beforeshow' handler returned false, simply return out.
			if( !this.hidden || this.fireEvent( 'beforeshow', this ) === false )
				return this;
			
			// set flag regardless of if the Component is rendered or not. If not yet rendered, this flag will be tested 
			// for in the render() method to determine if the Component should be rendered hidden or not.
			this.hidden = false;
			
			if( this.rendered ) {
				options = options || {};
				
				// If the Component is currently in the process of being animated to its hidden state when the call to this method 
				// is made, finish it up so we can open it again.
				if( this.hiding ) {
					this.currentAnimation.end();  // ends the "hiding" animation, and runs onHideComplete()
				}
				
				this.showing = true;  // will only be true while any show animation is running
				this.onBeforeShow( options );  // call hook method
				
				// make sure the element is displayed. This is done even for animations, which will always need
				// to display the element in some way first before animating size, opacity, etc
				this.$el.show();
				
				// Call template method, and fire the events. These are done before the animation is complete. See the 'show' and 
				// 'aftershow' event descriptions for details on why this is done now, instead of when the animation (if any) 
				// is complete.
				this.onShow( options );
				this.fireEvent( 'showbegin', this );
				this.fireEvent( 'show', this );
				
				// If a mask show request has been made while the Component was hidden, show the mask now, with the configuration requested when the call to mask() was made (if any).
				if( this.deferMaskShow ) {
					this.mask( this.deferredMaskConfig );
				}
				
				// If a show animation was specified, run that now. Otherwise, simply show the element
				var animConfig = options.anim;  // Note: setting this after the onBeforeShow() hook method has executed, to give it a chance to modify the `anim` option
				if( animConfig ) {
					animConfig = _.assign( {}, animConfig, { target: this } );  // the `animConfig` provides defaults. We specify the target explicitly.
					
					var anim = this.currentAnimation = new Animation( animConfig );
					anim.on( 'complete', _.partial( this.onShowComplete, options ), this );  // adding a listener instead of providing in config, in case there is already a listener in the config
					anim.start();
				} else {
					this.onShowComplete( options );
				}
			}
			
			return this;
		},
	
	
		/**
		 * Private method that handles when the Component has been fully shown. This may be delayed from the call to {@link #method-show} 
		 * if an animation was run, or may be called immediately (synchronously) if not. Sets private properties to the state they 
		 * should be in when the Component has been fully shown, calls the {@link #onAfterShow} hook method, and fires the 
		 * {@link #aftershow} event.
		 *
		 * @private
		 * @template
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onShowComplete : function( options ) {
			this.showing = false;
			this.currentAnimation = null;  // remove the reference to the "showing" animation
			
			this.onAfterShow( options );
			this.fireEvent( 'aftershow', this );
		},
		
		
		/**
		 * Hook method that is run before the Component has been shown (before an animation has started, if any).
		 *
		 * @protected
		 * @template
		 * @method onBeforeShow
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onBeforeShow : Jqc.emptyFn,
		
		
		/**
		 * Hook method for handling the component being shown. This will only be called when the 
		 * Component is shown after it is rendered. Note that this method is called immediately after
		 * any animation is started by providing the `animConfig` argument to {@link #method-show}.
		 * 
		 * @protected
		 * @template
		 * @method onShow
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onShow : Jqc.emptyFn,
		
		
		/**
		 * Hook method that is run when the Component has been fully shown. This may be delayed from the call to {@link #method-show} 
		 * if an animation was run, or may be called immediately (synchronously) if not. 
		 *
		 * @protected
		 * @template
		 * @method onAfterShow
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onAfterShow : Jqc.emptyFn,
		
		
		
		/**
		 * Hides the Component.
		 *
		 * @param {Object} [options] An object which may contain the following options:
		 * @param {Object} [options.anim] An {@link jqc.anim.Animation Animation} config object (minus the 
		 *   {@link jqc.anim.Animation#target target) property) for animating the showing of the Component. 
		 *   Note that this will only be run if the Component is currently {@link #rendered}.
		 * @chainable
		 */
		hide : function( options ) {
			// If the Component is currently hidden, or a 'beforehide' handler returned false, simply return out.
			if( this.hidden || this.fireEvent( 'beforehide', this ) === false )
				return this;
			
			// set flag regardless of if the Component is rendered or not. If not yet rendered, this flag will be tested 
			// for in the render() method to determine if the Component should be rendered hidden or not.
			this.hidden = true;
			
			if( this.rendered ) {
				options = options || {};
				
				// If the Component is currently in the process of being animated to its shown (visible) state when the call to this 
				// method is made, finish it up so we can open it again.
				if( this.showing ) {
					this.currentAnimation.end();  // ends the "showing" animation, and runs onShowComplete()
				}
				
				this.hiding = true;  // will only be true while any hide animation is running
				this.onBeforeHide( options );  // call hook method
				
				this.fireEvent( 'hidebegin', this );
				
				// If a show animation was specified, run that now. Otherwise, simply show the element
				var animConfig = options.anim;  // Note: setting this after the onBeforeShow() hook method has executed, to give it a chance to modify the `anim` option
				if( animConfig ) {
					animConfig = _.assign( {}, animConfig, { target: this } );  // the `animConfig` provides defaults. We specify the target explicitly.
					
					var anim = this.currentAnimation = new Animation( animConfig );    
					anim.on( 'complete', _.partial( this.onHideComplete, options ), this );  // adding a listener instead of providing in config, in case there is already a listener in the config
					anim.start();
				} else {
					this.onHideComplete( options );
				}				
			}
			
			return this;
		},
	
	
		/**
		 * Private method that is run when the Component has fully hidden. This may be delayed from the call to {@link #method-hide} if a
		 * animation is run, or may be called immediately if not. Hides the Component (if it is not already hidden), runs the 
		 * {@link #onHide} hook method, and fires the {@link #event-hide} event.
		 *
		 * @private
		 * @param {Object} options The options object which was originally provided to the {@link #method-hide} method.
		 */
		onHideComplete : function( options ) {
			this.hiding = false;
			this.currentAnimation = null;  // remove the reference to the "hiding" animation
			
			this.$el.hide();   // make sure the element is hidden at this point
			
			// Run hook methods, and fire the 'hide' events
			this.onHide( options );
			this.fireEvent( 'hide', this );
			this.onAfterHide( options );          // maintains consistency with having an `onAfterShow()` method
			this.fireEvent( 'afterhide', this );  // maintains consistency with having an `aftershow` event
		},
		
		
		/**
		 * Hook method that is run just before the Component it to be hidden (before an animation has started, if any).
		 *
		 * @protected
		 * @template
		 * @method onBeforeHide
		 * @param {Object} options The options object which was originally provided to the {@link #method-hide} method.
		 */
		onBeforeHide : Jqc.emptyFn,
		
		
		/**
		 * Hook method that is run when the Component has fully hidden. This will only be called when the Component is hidden after it 
		 * is rendered. This may be delayed from the call to {@link #method-hide} if a animation is run, or may be called immediately 
		 * if not.
		 * 
		 * @protected
		 * @template
		 * @method onHide
		 * @param {Object} options The options object which was originally provided to the {@link #method-hide} method.
		 */
		onHide : Jqc.emptyFn,
	
	
		/**
		 * Hook method that is run when the Component has fully hidden. This will only be called when the Component is hidden after it 
		 * is rendered. This may be delayed from the call to {@link #method-hide} if a animation is run, or may be called immediately 
		 * if not.
		 *
		 * @protected
		 * @template
		 * @method onAfterHide
		 * @param {Object} options The options object which was originally provided to the {@link #method-hide} method.
		 */
		onAfterHide : Jqc.emptyFn,
		
		
		/**
		 * Determines if the Component is hidden.
		 * 
		 * If the `checkDom` flag is not passed or is `false`, then this method simply returns the value of the {@link #property-hidden}
		 * flag. If the `checkDom` flag is passed as true, this method tests for the Component's element visibility, and will 
		 * return true if 1) the element itself is set as "display: none", 2) a parent element of the Component is set to 
		 * `display: none;`, or 3) the element is not attached to the document.
		 * 
		 * @param {Boolean} [checkDom=false] `true` to also interrogate the DOM to see if the Component is hidden to the user
		 *   (i.e. the element is not attached to the DOM, or its CSS `display` property is set to 'none'). If this argument is 
		 *   provided as `true`, and the component is not yet {@link #method-render rendered}, then this method will always return 
		 *   `true` (as an unrendered component can't be visible, and therefore must be hidden).
		 * @return {Boolean} `true` if the Component is hidden, `false` otherwise.
		 */
		isHidden : function( checkDom ) {
			if( this.hidden ) {  // quick test: if the component's flag says it's hidden, immediately return true
				return true;
				
			} else {
				// `hidden` flag is false, check other conditions
				if( !this.rendered ) {
					return ( checkDom ) ? true : false;  // `hidden` flag is false, and if checkDom flag is passed as true, we want to return true (as the Component must be hidden if it is not yet rendered into the DOM)
					
				} else {
					return ( checkDom ) ? !this.isDomVisible() : false;  // not checking the DOM, return the state of the flag (which must be false at this point)
				}
			}
		},
		
		
		/**
		 * Tests to see if the Component is visible.
		 * 
		 * If the `domVisible` flag is not passed or is `false`, then this method simply returns the opposite state of the internal
		 * {@link #property-hidden} flag. If the `domVisible` flag is passed as true, this method tests for the Component's element visibility, 
		 * and will return false if 1) the element itself is set as "display: none", 2) a parent element of the Component is set to 
		 * `display: none;`, or 3) the element is not attached to the document.
		 * 
		 * @param {Boolean} [domVisible=true] `true` to also interrogate the DOM to see if the Component is visible to the user
		 *   (i.e. the element is attached to the DOM, and its CSS `display` property is something other than 'none'). If this argument 
		 *   is provided as `true`, and the component is not yet {@link #method-render rendered}, then this method will always return 
		 *   `false` (as an unrendered component can't be visible).
		 * @return {Boolean} `true` if the Component is visible, `false` otherwise.
		 */
		isVisible : function( checkDom ) {
			return !this.isHidden( checkDom );
		},
		
		
		/**
		 * Utility method which determines if the Component's {@link #$el element} is visible in the DOM. Runs an 
		 * algorithm to check:
		 * 
		 * 1. If the {@link #$el element} is attached to the DOM.
		 * 2. If the {@link #$el element} itself is not `display: none;`
		 * 3. If any of the {@link #$el element's} parent elements are `display: none;`
		 * 
		 * For most cases, one would want to use {@link #isVisible} instead.
		 * 
		 * @protected
		 * @return {Boolean} `true` if the Component's {@link #$el element} is visible in the DOM, false otherwise.
		 *   If the component is not rendered, returns false immediately.
		 */
		isDomVisible : function() {
			if( !this.isRendered() )
				return false;  // can't be DOM visible if it's not rendered
			
			
			var $el = this.$el;
			
			// NOTE: Cannot simply use the jQuery :hidden selector. jQuery determines if an element is hidden by if it
			// has any computed height or width > 0. The Component's element can be shown, but if it's not taking up 
			// any space because it has no content, it would still be considered hidden by jQuery. We instead want to see
			// if the Component, or any of its ancestor elements are hidden via "display: none", to determine if it's hidden.
			// The Component must also be attached to the document to be considered "shown".
			//return $el.is( ':hidden' );  -- intentionally left here as a reminder not to use
			
			// Find out if the component itself, or any of its ancestor elements has "display: none".
			if( $el.css( 'display' ) === 'none' ) {    // slight optimization by testing the Component's element itself first, before grabbing parent elements to test
				return false;
				
			} else {
				var $parents = $el.parents(),
				    numParents = $parents.length;
				
				// If the element is not attached to the document (it has no parents, or the top level ancestor is not the <html> tag), then it must be hidden
				if( numParents === 0 || $parents[ numParents - 1 ].tagName.toLowerCase() !== 'html' ) {
					return false;
				}

				// Element is attached to the DOM, check all parents for one that is not displayed
				for( var i = 0, len = $parents.length; i < len; i++ ) {
					if( $parents.eq( i ).css( 'display' ) === 'none' ) {
						return false;
					}
				}
			}
			
			// Passed checks, element must not be hidden (i.e. must be visible)
			return true;
		},
		
		
		/**
		 * Detaches the Component from the DOM, if it is currently rendered and in the DOM. This method can be used
		 * for performance reasons, to completely remove the element from the DOM when it is unnecessary for the 
		 * Component to be in it.
		 * 
		 * The Component may be re-attached to the DOM by calling {@link #method-render} again on it (with the new container
		 * element to append/insert it into).
		 */
		detach : function() {
			if( this.rendered ) {
				this.$el.detach();
			}
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Masks the component with a {@link jqc.Mask}. Uses the default mask configuration provided by the {@link #maskConfig} configuration object,
		 * or optionally, the provided `maskConfig` argument.
		 * 
		 * @param {Object} maskConfig (optional) The explicit configuration options to set the {@link jqc.Mask} that will mask over the Component.
		 *   If not provided, will use the default options provided by the {@link #maskConfig} configuration option.
		 */
		mask : function( maskConfig ) {
			maskConfig = maskConfig || this.maskConfig;  // use the provided argument if it exists, or the defaults provided by the config option otherwise
			
			// Set the flag for the isMasked method. Also, if the Component is not rendered, this is updated so that the mask will show on render time.
			this.masked = true;
			
			if( !this.rendered ) {
				this.deferredMaskConfig = maskConfig;  // set the maskConfig to use when the Component is rendered
				
			} else {
				// If the Component is currently hidden when the mask() request is made, we need to defer
				// it to when the Component's show() method is run. This is because jqc.Mask has to make a calculation
				// of the mask target's height. 
				if( this.isHidden() ) {
					this.deferMaskShow = true;
					this.deferredMaskConfig = maskConfig;  // set the maskConfig to use when the Component is shown
					
				} else {
					// Component is rendered and is shown (i.e. not hidden), then we can show the mask
					
					// If there is not yet a mask instance for this Component, create one now.
					// Otherwise, just update its config.
					if( !this._mask ) {
						this._mask = new Mask( this.getMaskTarget(), maskConfig );
					} else {
						this._mask.updateConfig( maskConfig );
					}
					this._mask.show();
					
					// mask has been shown, make sure deferMaskShow flag is set back to false
					this.deferMaskShow = false;
					delete this.deferredMaskConfig;  // in case this exists from a previous deferred mask, remove it now
				}
			}
		},
		
		
		/**
		 * Hides the mask (shown with the {@link #mask} method) from the Component's element.
		 */
		unMask : function() {
			this.masked = false;
			
			// in case there was a show request while hidden: set deferMaskShow back to false, and remove the deferredMaskConfig (as we're now hiding the mask)
			this.deferMaskShow = false;  
			delete this.deferredMaskConfig;
			
			if( this.rendered && this._mask ) {
				this._mask.hide();
			}
		},
		
		
		/**
		 * Determines if the Component is currently masked.  See the {@link #mask} method for details on showing the Component's mask.
		 * 
		 * @return {Boolean}
		 */
		isMasked : function() {
			return this.masked;
		},
		
		
		/**
		 * Method that defines which element the Component's mask should be shown over. For jqc.Component,
		 * this is the Component's base {@link #$el element}, but this may be redefined by subclasses.
		 * 
		 * @protected
		 * @return {jQuery}
		 */
		getMaskTarget : function() {
			return this.getEl();
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Sets the Container that owns (i.e. is a parent of) this Component.
		 * 
		 * @param {jqc.Container} container
		 */
		setParentContainer : function( container ) {
			this.parentContainer = container;
		},
		
		
		/**
		 * Gets the Container that owns (i.e. is a parent of) this Component.
		 * 
		 * @return {jqc.Container} The Container that owns this Component, or null if there is none.
		 */
		getParentContainer : function() {
			return this.parentContainer;
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Bubbles up the Component/Container heirarchy, calling the specified function with each parent Container, starting
		 * with this Component. The scope (this) of function call will be the scope provided or the current Component. The arguments 
		 * to the function will be the `args` provided or the current component. If the function returns false at any point,
		 * the bubble is stopped.
		 * 
		 * @param {Function} fn The function to call.
		 * @param {Object} scope (optional) The scope of the function (defaults to current node)
		 * @param {Array} args (optional) The args to call the function with (default to passing the current component)
		 */
		bubble : function( fn, scope, args ) {
			var p = this;
			while( p ) {
				if( fn.apply( scope || p, args || [p] ) === false) {
					break;
				}
				p = p.parentContainer;
			}
		},
		
		
		/**
		 * Finds a {@link jqc.Container Container} above this Component at any level by a custom function. If the passed function returns
		 * true, the {@link jqc.Container Container} will be returned.
		 * 
		 * @param {Function} fn The custom function to call with the arguments (Container, this Component).
		 * @return {jqc.Container} The first Container for which the custom function returns true.
		 */
		findParentBy : function( fn ) {
			for( var p = this.parentContainer; (p !== null) && !fn( p, this ); p = p.parentContainer );  // intentional semicolon, loop does the work
			return p || null;
		},
		
		
		/**
		 * Finds a {@link jqc.Container Container} above this Component at any level by {@link #id}.  If there is no parent Container
		 * with the supplied `id`, this method returns null.
		 * 
		 * @param {String} id The {@link #id} of the parent Container to look for.
		 * @return {jqc.Container} The first Container which matches the supplied {@link #id}.
		 *   If no Container for the supplied {@link #id} is found, this method returns null.
		 */
		findParentById : function( id ) {
			for( var p = this.parentContainer; p && p.id !== id; p = p.parentContainer );  // intentional semicolon, loop does the work
			return p || null;
		},
		
		
		/**
		 * Finds the closest {@link jqc.Container Container} above this Component by Container `type`.  The Container `type` can be either
		 * the type name that is registered to the {@link jqc.ComponentManager ComponentManager} (see the description of this class), or the JavaScript
		 * class (constructor function) of the Container.
		 * 
		 * @param {Function} type The type name registered with the {@link jqc.ComponentManager ComponentManager}, or the constructor function (class) of the Container.
		 * @return {jqc.Container} The first Container which is an instance of the supplied type. 
		 */
		findParentByType : function( type ) {
			if( typeof type === 'string' ) {
				type = require( 'jqc/ComponentManager' ).getType( type );
				
				// No type found for the given type name, return null immediately
				if( !type ) {
					return null;
				}
			}
			
			// Find the parent by type (js class / constructor function)
			for( var p = this.parentContainer; p && !(p instanceof type); p = p.parentContainer );  // intentional semicolon, loop does the work
			return p || null;
		},
		
		
		/**
		 * Determines if this Component is a descendent of the provided `container`.
		 * 
		 * @param {jqc.Container} container
		 * @return {Boolean} `true` if the Component is a descendant of the `container`, otherwise `false`.
		 */
		isDescendantOf : function( container ) {
			for( var p = this.parentContainer; p && p !== container; p = p.parentContainer );  // intentional semicolon, loop does the work
			return !!p;
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Destroys the Component. Frees (i.e. deletes) all references that the Component held to HTMLElements or jQuery wrapped sets
		 * (so as to prevent memory leaks) and removes them from the DOM, removes the Component's {@link #mask} if it has one, purges 
		 * all event {@link #listeners} from the object, and removes the Component's element ({@link #$el}) from the DOM, if the Component 
		 * is rendered.
		 *
		 * Fires the {@link #beforedestroy} event, which a handler can return false from to cancel the destruction process,
		 * and the {@link #event-destroy} event.
		 */
		destroy : function() {
			if( !this.destroyed && this.fireEvent( 'beforedestroy', this ) !== false ) {
				this.destroying = true;
				
				// Run template method for subclasses first, to allow them to handle their processing
				// before the Component's element is removed
				this.onDestroy();
				
				// If the Component is currently animating, end it
				if( this.currentAnimation ) {
					this.currentAnimation.end();
				}
				
				// Destroy the mask, if it is an instantiated jqc.Mask object (it may not be if the mask was never used)
				if( this._mask instanceof Mask ) {
					this._mask.destroy();
				}
				
				// Remove any HTMLElement or jQuery wrapped sets used by the Component from the DOM, and free 
				// the references so that we prevent memory leaks.
				// Note: This includes the Component's $el reference (if it has been created by the Component being rendered).
				for( var prop in this ) {
					if( this.hasOwnProperty( prop ) ) {
						var propValue = this[ prop ];
						
						if( _.isElement( propValue ) ) {
							// First, wrap the raw HTMLElement in a jQuery object, for easy removal. Then delete the reference.
							jQuery( propValue ).remove();
							delete this[ prop ];
						} else if( propValue instanceof jQuery ) {
							propValue.remove();
							delete this[ prop ];
						}
					}
				}
				
				this.rendered = false;  // the Component is no longer rendered; it's $el has been removed (above)
				this.destroying = false;
				this.destroyed = true;
				this.fireEvent( 'destroy', this );
				this.purgeListeners();  // Note: Purge listeners must be called after 'destroy' event fires!
			}
		},
		
		
		/**
		 * Template method for subclasses to extend that is called during the Component's destruction process.
		 * 
		 * @protected
		 * @method onDestroy
		 */
		onDestroy : Jqc.emptyFn
	
	} );
	
	
	// NOTE: Due to circular dependency issues with RequireJS, ComponentManager automatically registers this class with
	// the type string 'component'. Leaving below line commented as a reminder. Even if we add an async require() call here,
	// it is possible that the Component class is still not registered in time for use.
	//ComponentManager.registerType( 'component', Component );   -- leave as reminder

	return Component;
	
} );

/*global define */
define('jqc/ComponentManager', [
	'require',
	'jqc/Component'  // loaded via require() call in the code below, as it is a circular dependency
], function( require ) {
	
	/**
	 * @class jqc.ComponentManager
	 * @singleton
	 *
	 * Object used to manage {@link jqc.Component} "types", and handles instantiating them based on the string that is specified
	 * for them in the manifest.
	 */
	var ComponentManager = {
		
		/**
		 * @private
		 * @property {Object} componentClasses
		 * 
		 * An Object (map) of the {@link jqc.Component} classes which have been {@link #registerType registered}, 
		 * keyed by their type name. 
		 */
		componentClasses : {},
	   
	   
		/**
		 * Registers a given class with a `type` name. This is used to map the type names specified in Bit manifests
		 * to the class that should be instantiated.  Note that type names are case-insensitive.
		 * 
		 * This method will throw an error if a type name is already registered, to assist in making sure that we don't get
		 * unexpected behavior from a type name being overwritten.
		 * 
		 * @param {String} type The type name of registered class.
		 * @param {Function} jsClass The class (constructor function) to register.
		 */
		registerType : function( type, jsClass ) {
			type = type.toLowerCase();
			
			if( !this.componentClasses[ type ] ) { 
				this.componentClasses[ type ] = jsClass;
			// <debug>
			} else {
				throw new Error( "Error: jqc.ComponentManager already has a type '" + type + "'" );
			// </debug>
			}
		},
		
		
		/**
		 * Retrieves the Component class (constructor function) that has been registered by the supplied `type` name. 
		 * 
		 * @param {String} type The type name of the registered class.
		 * @return {Function} The class (constructor function) that has been registered under the given `type` name.
		 */
		getType : function( type ) {
			type = type.toLowerCase();
			
			// Note: special case for 'component', added to get around the RequireJS circular dependency issue where 
			// jqc.Component can't register itself with the ComponentManager
			var jsClass = ( type === 'component' ) ? require( 'jqc/Component' ) : this.componentClasses[ type ];
			
			// <debug>
			if( !jsClass ) 
				throw new Error( "The class with type name '" + type + "' has not been registered. Make sure that the component " +
				                 "exists, and has been 'required' by a RequireJS require() or define() call" );
			// </debug>
			
			return jsClass;
		},
		
		
		/**
		 * Determines if the ComponentManager has (i.e. can instantiate) a given `type`.
		 * 
		 * @param {String} type The type name to check for.
		 * @return {Boolean} `true` if the ComponentManager has the given type, `false` otherwise.
		 */
		hasType : function( type ) {
			if( !type ) {  // any falsy type value given, return false
				return false;
			} else {
				type = type.toLowerCase();
				
				// Note: special case for 'component', added to get around the RequireJS circular dependency issue where 
				// Component can't register itself with the ComponentManager
				return ( type === 'component' ) ? true : !!this.componentClasses[ type ];
			}
		},
		
		
		/**
		 * Creates (instantiates) a {@link jqc.Component Component} based on its type name, given
		 * a configuration object that has a `type` property. If an already-instantiated 
		 * {@link jqc.Component Component} is provided, it will simply be returned unchanged.
		 * 
		 * @param {Object} config The configuration object for the Component. Config objects should have the property `type`, 
		 *   which determines which type of {@link jqc.Component Component} will be instantiated. If the object does not
		 *   have a `type` property, it will default to "container", which makes it simple to create things like tab containers. 
		 *   Note that already-instantiated {@link jqc.Component Components} will simply be returned unchanged. 
		 * @return {jqc.Component} The instantiated Component.
		 */
		create : function( config ) {
			var type = config.type ? config.type.toLowerCase() : undefined,
			    Component = require( 'jqc/Component' );  // need to require here, as otherwise we'd have an unresolved circular dependency (jqc.Component depends on jqc.ComponentManager)
			
			if( config instanceof Component ) {
				// Already a Component instance, return it
				return config;
				
			} else if( type === 'component' ) {  // special case, added to get around the RequireJS circular dependency issue where Component can't register itself with the ComponentManager
				return new Component( config );
				
			} else if( this.hasType( type || "container" ) ) {
				return new this.componentClasses[ type || "container" ]( config );
				
			} else {
				// No registered type with the given type, throw an error
				throw new Error( "ComponentManager.create(): Unknown type: '" + type + "'" );
			}
		}
		
	};
	
	return ComponentManager;
	
} );
/*global define */
/*jshint scripturl:true */
define('jqc/Anchor', [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/Component'
], function( jQuery, _, ComponentManager, Component ) {
	
	/**
	 * @class jqc.Anchor
	 * @extends jqc.Component
	 * @alias type.anchor
	 *
	 * A simple anchor component. This component can be used as a standard anchor (&lt;a&gt; tag) by setting
	 * the {@link #href} config, or clicks can be responded to dynamically by listening for the {@link #click} 
	 * event.
	 * 
	 *     @example
	 *     require( [
	 *         'jqc/Anchor'
	 *     ], function( Anchor ) {
	 *     
	 *         var standardAnchor = new Anchor( {
	 *             renderTo : 'body'
	 *             
	 *             text : "Google.com",
	 *             href : "http://www.google.com",
	 *             target : "_blank"
	 *         } );
	 *         
	 *         var listenerAnchor = new Anchor( {
	 *             renderTo : 'body'
	 *             
	 *             text : "Click Me",
	 *             listeners : {
	 *                 'click' : function( anchor ) {
	 *                     alert( "You clicked the anchor!" );
	 *                 }
	 *             }
	 *         } );
	 *     } );
	 */
	var Anchor = Component.extend( {
		
		/**
		 * @cfg {String} href
		 * 
		 * The href for the anchor tag. Defaults to 'javascript:;' so that the anchor takes no action.
		 * In this case, listen to the {@link #click} event to respond to the click in a custom manner.
		 */
		
		/**
		 * @cfg {String} target
		 * 
		 * The HTML `target` attribute for the anchor. This can be, for example, set to "_blank" to have
		 * the anchor open its {@link #href} in a new window.
		 */
		
		/**
		 * @cfg {String} text
		 * 
		 * The text (or html) to put inside the anchor. (Synonymous to the {@link #html} config in this case).
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		elType : 'a',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Anchor',
	
	
		// protected
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires before the Anchor is clicked. Handlers may return false to cancel the action of the anchor.
				 * 
				 * @event beforeclick
				 * @param {jqc.Anchor} anchor This Anchor instance.
				 * @preventable
				 */
				'beforeclick',
				
				/**
				 * Fires when the Anchor is clicked.
				 * 
				 * @event click
				 * @param {jqc.Anchor} anchor This Anchor instance.
				 */
				'click'
			);
			
			this.setAttr( 'href', this.normalizeHref( this.href ) );
			if( this.target ) {
				this.setAttr( 'target', this.target );
			}
			this.html = this.html || this.text;
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.getEl().on( 'click', _.bind( this.onClick, this ) );
		},
	
	
		// -------------------------------------
		
		/**
		 * Normalizes the provided `href` to 'javascript:;' if an empty string
		 * or only whitespace is provided.
		 *
		 * @param {String} href
		 * @return {String} The normalized href.
		 */
		normalizeHref : function( href ) {
			return jQuery.trim( href ) || 'javascript:;';
		},


		/**
		 * Sets the anchor's {@link #href}.
		 *
		 * @param {String} href
		 * @chainable
		 */
		setHref : function( href ) {
			this.setAttr( 'href', this.normalizeHref( href ) );
			return this;
		},


		/**
		 * Sets the anchor's text (or html). Internally calls {@link #update}.
		 *
		 * @param {String} text The text for the anchor.
		 * @chainable
		 */
		setText : function( text ) {
			this.update( text );
			return this;
		},


		// -----------------------------------


		/**
		 * Handler for when the anchor is clicked.
		 *
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onClick : function( evt ) {
			// If the Anchor has a 'beforeclick' handler that returns false, prevent the default browser behavior
			// and do not fire the 'click' event
			if( this.fireEvent( 'beforeclick', this ) === false ) {
				evt.stopPropagation();
				evt.preventDefault();
				return false;
			} else {
				this.fireEvent( 'click', this );
			}
		}
	
	} );
	
	
	ComponentManager.registerType( 'anchor', Anchor );
	
	return Anchor;
	
} );
/*global define */
define('jqc/layout/Layout', [
	'lodash',
	'Class',
	'jqc/Jqc',
	'Observable'
], function( _, Class, Jqc, Observable ) {
	
	/**
	 * @abstract 
	 * @class jqc.layout.Layout
	 * @extends Observable
	 * 
	 * Base class Layout that defines the public interface of all Layout subclasses. Layouts are stateful strategy objects 
	 * that are used by {@link jqc.Container jqc.Containers} to implement how their child items are displayed. Because of their 
	 * stateful nature, the same layout may not be used by multiple {@link jqc.Container jqc.Containers}.
	 * 
	 * The default layout that is used for a {@link jqc.Container Container} is the {@link jqc.layout.Auto}, 
	 * which simply renders each child component directly into the {@link jqc.Container jqc.Container's} 
	 * {@link jqc.Component#getContentTarget content target element}, and does no further sizing or formatting.
	 * 
	 * 
	 * ## Building a Layout
	 * 
	 * Layout subclasses should implement the {@link #onLayout} hook method to implement their layout routine.
	 * They should first call the superclass `onLayout` method, and then implement the code to perform the desired layout.
	 * Note the following items:
	 * 
	 * - {@link #onLayout} and {@link #afterLayout} will be executed each time the {@link #container container's} 
	 *   {@link jqc.Container#doLayout} method is executed. This means that {@link #onLayout} and {@link #afterLayout}
	 *   may be called multiple times during the lifetime of the Layout, and this should be handled. Some layouts choose
	 *   to have completely separate "first run" and "update layout" methods.
	 * - Use the helper methods in this Layout class to {@link #renderComponent render} and {link #sizeComponent size}
	 *   child components of the {@link #container}. They take into account details of the Layout system, and sizing details
	 *   (such as accounting for child component padding/margin/border) that aren't handled elsewhere. See the 
	 *   {@link #renderComponent} and {@link #sizeComponent} methods for details.
	 * - Layouts should handle the case of the {@link #container} they are laying out having 0 child components, and it should
	 *   also handle the cases where child components are added, removed, or reordered. However, try not execute the
	 *   {@link #renderComponent} method (and thus the {@link jqc.Component#method-render} method) when the component is already
	 *   rendered and in the correct position. This adds DOM overhead, and can cause some weird behavior such as having
	 *   {@link jqc.form.field.Text Text Fields} to lose focus if a layout runs that does this.
	 * - Browser window resize events should not be handled within the Layout. The top level {@link jqc.Viewport} will
	 *   call its {@link jqc.Container#doLayout doLayout} method to fix the layout automatically, on resize.
	 * 
	 * Layouts are required to manage any HTML elements that they create, and should clean up after themselves
	 * when they are done. This includes cleaning up old HTML elements when {@link #doLayout} (and therefore,
	 * {@link #onLayout}) is run again, and when the Layout is {@link #method-destroy destroyed}. Subclasses should
	 * implement the {@link #onDestroy} method to implement their clean up as part of the destruction process.
	 * Note that a layout may be destroyed by a {@link jqc.Container} if another layout is set to it, and therefore
	 * it cannot be relied on that the Container will clean up any stray elements that a Layout has created.
	 */
	var Layout = Class.extend( Observable, {
		abstractClass : true,
		
		
		/**
		 * @cfg {jqc.Container} container
		 * 
		 * The {@link jqc.Container} that this Layout object belongs to. Defaults to null, and can be set
		 * after instantiation with {@link #setContainer}. 
		 */
		container : null,
		
		/**
		 * @private
		 * @property {Object} needsLayoutMap
		 * 
		 * A map of the child components that need to be laid out on each {@link #doLayout} run. When 
		 * {@link #doLayout} is called, the map is initialized with all child components set to true. When
		 * the {@link #doLayout} method is about to finish, any child components that have not had a layout
		 * executed manually during the layout routine (implemented by a Layout subclass) will have their
		 * {@link #doLayout} method called in turn. 
		 */
		
		/**
		 * @protected
		 * @property {Boolean} destroyed
		 * 
		 * Flag which is set to true once the layout has been {@link #method-destroy destroyed}.
		 */
		destroyed : false,
		
		
		/**
		 * @constructor
		 * @param {Object} [config] Any of the configuration options of this class, specified in an Object (map).
		 */
		constructor : function( config ) {
			this.addEvents(
				/**
				 * Fires when this layout is destroyed.
				 * 
				 * @event destroy
				 * @param {jqc.layout.Layout} layout This AbstractLayout instance.
				 */
				'destroy'
			);
			
			// Apply the properties of the configuration object onto this object
			_.assign( this, config );
			
			// Call Observable's constructor
			this._super( arguments );
			
			// Call hook method for layout initialization
			this.initLayout();
			
			// And set the container / call the hook method if the `container` config was provided
			if( this.container ) {
				this.setContainer( this.container );
			}
		},
		
		
		/**
		 * Hook method which should be extended to provide any of the Layout's initialization logic.
		 * 
		 * Note that the {@link #container} reference may or may not be available when this method is
		 * called, so you shouldn't rely on its existence in it. To set up any initialization for the
		 * {@link #container}, extend {@link #onContainerSet} instead.
		 * 
		 * @protected
		 * @template
		 * @method initLayout
		 */
		initLayout : Jqc.emptyFn,
		
		
		/**
		 * Sets the {@link jqc.Container} instance that this Layout belongs to.
		 * 
		 * @param {jqc.Container} container
		 */
		setContainer : function( container ) {
			this.container = container;
			this.onContainerSet( container );
		},
		
		
		/**
		 * Gets the {@link jqc.Container} instance that this Layout belongs to.
		 * 
		 * @return {jqc.Container} The container
		 */
		getContainer : function() {
			return this.container;
		},
		
		
		/**
		 * Hook method which is executed when the {@link #container} is set to the Layout.
		 * This is executed upon initialization if the {@link #cfg-container} config was provided (but
		 * after {@link #initLayout} is executed), or when {@link #setContainer} is called.
		 * 
		 * Note that this method is guaranteed to run before {@link #doLayout} runs, and subclasses
		 * should call the superclass method first.
		 * 
		 * @protected
		 * @template
		 * @method onContainerSet
		 * @param {jqc.Container} container The Container that was set.
		 */
		onContainerSet : Jqc.emptyFn,
		
		
		/**
		 * Performs the layout strategy. Calls the {@link #onLayout} hook method for subclasses to perform the 
		 * necessary layout processing.
		 */
		doLayout : function() {
			// Simply return out if the layout has already been destroyed
			if( this.destroyed ) {
				return;
			}
			
			var container = this.container,
			    childComponents = container.getItems(),
			    numChildComponents = childComponents.length,
			    $targetEl = container.getContentTarget(),
			    childComponent,
			    i;
			
			var needsLayoutMap = this.needsLayoutMap = {};
			for( i = 0; i < numChildComponents; i++ ) {
				childComponent = childComponents[ i ];
				
				needsLayoutMap[ childComponent.getUuid() ] = true;
				childComponent.on( 'afterlayout', this.markLayoutComplete, this );
			}
			
			
			// Call hook method for subclasses to implement their layout routine
			this.onLayout( childComponents, $targetEl );
			
			
			// Now that each child jqc.Component has been rendered, we need to run the layouts on each component 
			// that has not yet had a layout executed on it
			for( i = 0; i < numChildComponents; i++ ) {
				childComponent = childComponents[ i ];
				
				// Unsubscribe the event first
				childComponent.un( 'afterlayout', this.markLayoutComplete, this );
				
				// And if the component still needs a layout (the layout hasn't been performed by a subclass 
				// implementation), execute it now
				if( needsLayoutMap[ childComponent.getUuid() ] === true ) {
					childComponent.doLayout();
				}
			}
			
			// Call hook method for subclasses to finalize their layout routine
			this.afterLayout( childComponents, $targetEl );
		},
		
		
		/**
		 * Hook method for subclasses to override to implement their layout strategy.
		 * 
		 * @protected
		 * @template
		 * @method onLayout
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : Jqc.emptyFn,
		
		
		/**
		 * Hook method for subclasses to override to implement any layout finalization strategy. This method
		 * is called after {@link #onLayout}, and after all child components which needed to be laid out, have
		 * been laid out.
		 * 
		 * @protected
		 * @template
		 * @method afterLayout
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		afterLayout : Jqc.emptyFn,
		
		
		/**
		 * Handles when a child component is laid out manually in a Layout subclass, during the layout routine
		 * ({@link #doLayout}/{@link #onLayout}). This is so that we know that we don't have to lay out components
		 * that have already been manually laid out.
		 * 
		 * @param {jqc.Component} component The Component that a layout was performed on.
		 */
		markLayoutComplete : function( component ) {
			this.needsLayoutMap[ component.getUuid() ] = false;
		},
		
		
		// ------------------------------------------------
		
		
		/**
		 * Utility method used to render a child {@link jqc.Component} into the layout's target element. This method renders
		 * the child component, deferring any layout of child {@link jqc.Container containers} until after the layout process 
		 * is complete.
		 * 
		 * This method lazily renders the provided `component`. A call to the component's {@link jqc.Component#method-render render}
		 * method will only be made if:
		 * 
		 * 1) The `component` is not yet {@link jqc.Component#method-render rendered}.
		 * 2) The `component` is rendered, but not a child of the `$targetEl`. Calling {@link jqc.Component#method-render render} here
		 *    will move it.
		 * 3) The `component` is not at the provided `position` in the $targetEl. Basically if the `position` option is provided, 
		 *    an extra check will be made to determine if the component already exists at that position, and if so, no call to 
		 *    {@link jqc.Component#method-render render} will be made.
		 * 
		 * The main reason that this method checks to see if the {@link jqc.Component#method-render} method needs to be called before
		 * doing so is so that we do not end up moving components around the DOM when they don't need to be. Doing so will
		 * make the browser do more work, and can also cause unwanted side effects. One of these side effects could be if the user 
		 * is editing a {@link jqc.form.field.TextArea TextArea Field}, and the field resizes, triggering a layout routine 
		 * (see {@link jqc.form.field.TextArea#autoGrow}). If a parent layout of the TextArea moves a component in the DOM, 
		 * the TextArea will lose focus, and the user would have to click into it again to continue editing.
		 * 
		 * @protected
		 * @param {jqc.Component} component The component to render.
		 * @param {jQuery} $targetEl The target element to render the `component` into.
		 * @param {Object} [options] Any additional options to provide to the `options` argument of the 
		 *   `component`'s {@link jqc.Component#method-render} method. 
		 * @param {Number/String/HTMLElement/jQuery} [options.position] This property is handled in particular 
		 *   by this method (if provided), to determine if the `component` needs to be moved (by way
		 *   of the {@link jqc.Component#method-render render} method). If provided, an extra test will check if
		 *   the component is already in the correct position, or else no call to {@link jqc.Component#method-render}
		 *   will be made (as an optimization). This may be a numeric position index, a jQuery selector, an HTML 
		 *   element, or a jQuery wrapped set itself.
		 */
		renderComponent : function( component, $targetEl, options ) {
			options = options || {};
			
			var position = options.position,
			    cmpEl = component.getEl();
			
			if(
				!component.isRendered() ||  // The component isn't rendered, we need to render it
				( typeof position === 'undefined' && cmpEl.parent()[ 0 ] !== $targetEl[ 0 ] )          ||  // No `position` provided, and the component's element is not a direct child of the $targetEl, we need to render it to move it   
				( typeof position === 'number'    && $targetEl.children()[ position ] !== cmpEl[ 0 ] ) ||  // `position` argument provided as a number, and the component's element does not exist at that position, we need to render it to move it
				( 
					// `position` argument is a selector, HTMLElement, or jQuery wrapped set, find it under the $targetEl. 
					// If the element is not the `position`'s previous sibling, then it needs to be rendered to move it
					( typeof position === 'string' || typeof position === 'object' ) && 
					$targetEl.find( position ).prev()[ 0 ] !== cmpEl[ 0 ]
				)
			) {
				_.assign( options, { deferLayout: true } );
				component.render( $targetEl, options );
			}
		},
		
		
		/**
		 * Utility method used to size a child {@link jqc.Component} to the given `width` and `height`, based on the `component`'s 
		 * margin/padding/border widths. This method should only be called after the `component` has already been rendered, so that 
		 * it can access the margin/padding/border widths on the `component`.
		 * 
		 * @protected
		 * @param {jqc.Component} component The {@link jqc.Component component} to size.
		 * @param {Number} targetWidth The width the component should be sized to. If the width should not be changed, this argument
		 *   may be passed as `undefined`.
		 * @param {Number} targetHeight The height the component should be sized to. If the height should not be changed, this argument
		 *   may be passed as `undefined`.
		 */
		sizeComponent : function( component, targetWidth, targetHeight ) {
			// Calculate its size based on the target width and height, and the component's margin/padding/border
			var width = targetWidth, 
			    height = targetHeight;
			
			// Only do calculations to remove the margin, padding, and border width if the targetWidth/targetHeight were provided as numbers
			if( !isNaN( +targetWidth ) ) {
				width = targetWidth - component.getMargin( 'lr' ) - component.getPadding( 'lr' ) - component.getBorderWidth( 'lr' );
			}
			if( !isNaN( +targetHeight ) ) {
				height = targetHeight - component.getMargin( 'tb' ) - component.getPadding( 'tb' ) - component.getBorderWidth( 'tb' );
			}
			
			component.setSize( width, height );
		},
		
		
		// ------------------------------------------------
		
		
		/**
		 * Destroys the layout by cleaning up its event listeners. Subclasses should extend the onDestroy method to implement 
		 * any destruction process they specifically need.
		 */
		destroy : function() {
			if( !this.destroyed ) {
				this.onDestroy();
				
				this.destroyed = true;
				this.fireEvent( 'destroy', this );
				this.purgeListeners();  // Note: purge listeners only after the 'destroy' event has been fired!
				
				this.setContainer( null );
			}
		},
		
		
		/**
		 * Template method that subclasses should extend to implement their own destruction process.
		 * 
		 * @protected
		 * @template
		 * @method onDestroy
		 */
		onDestroy : Jqc.emptyFn
		
	} );

	return Layout;
} );
/*global define */
define('jqc/layout/Auto', [
	'require',
	'jqc/layout/Layout',
	'jqc/Container'
], function( require, Layout ) {
	
	/**
	 * @class jqc.layout.Auto
	 * @extends jqc.layout.Layout
	 * @alias layout.auto
	 * 
	 * The default layout that is used for a {@link jqc.Container Container}, which simply
	 * renders each child component into their own div element, and does no further sizing or formatting.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'auto' (or
	 * by not giving a {@link jqc.Container Container} any {@link jqc.Container#layout layout} config).
	 */
	var AutoLayout = Layout.extend( {
		
		/**
		 * Layout implementation for AutoLayout, which simply renders each child component directly into the 
		 * Container's content target (see {@link jqc.Component#getContentTarget}). 
		 * 
		 * @protected
		 * @method onLayout
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {
			this._super( arguments );
			
			for( var i = 0, len = childComponents.length; i < len; i++ ) {
				// Render the child component (note: it will only be rendered if it is not yet rendered, or not in the correct position in the $targetEl)
				this.renderComponent( childComponents[ i ], $targetEl, { position: i } );
			}
		}
		
	} );
	
	
	// Register the layout type with the jqc.Container class, which is used to be able to instantiate the layout via its type name.
	require( [ 'jqc/Container' ], function( Container ) {
		Container.registerLayout( 'auto', AutoLayout );
	} );

	return AutoLayout;
} );
/*global define */
define('jqc/Container', [
	'require',
	'lodash',
	'Class',
	'jqc/Jqc',
	'jqc/ComponentManager',
	'jqc/Component',
	'jqc/layout/Layout',   // circular dependency, used with require() call
	'jqc/layout/Auto'      // circular dependency, used with require() call
], function( require, _, Class, Jqc, ComponentManager, Component ) {

	/**
	 * @class jqc.Container
	 * @extends jqc.Component
	 * @alias type.container
	 *
	 * Base class for a component that holds other child components. Provides a default
	 * container layout that just adds child components directly into it with no layout.
	 */
	var Container = Class.extend( Component, {
	
		statics : {
			
			/**
			 * @private
			 * @static
			 * @property {Object} LAYOUTS
			 * Hash object that stores "registered" layout types. The layouts are in the `jqc.layout` package, and each
			 * specifies a type name that is used to instantiate them.
			 */
			LAYOUTS : {},
			
			/**
			 * Registers a {@link jqc.layout.Layout Layout} with the Container class, allowing {@link #layout layouts}
			 * to be specified by their string `typeName`.
			 *
			 * @static
			 * @method registerLayout
			 * @param {String} typeName The type name for the Layout.
			 * @param {Function} layoutClass A jqc.layout.Layout subclass.
			 */
			registerLayout : function( typeName, layoutClass ) {
				this.LAYOUTS[ typeName.toLowerCase() ] = layoutClass;
			}
			
		},
	
		/**
		 * @cfg {String} defaultType
		 * The default Component 'type' to instantiate when child {@link #items} are specified as anonymous config objects
		 * without a `type` property of their own. 
		 */
		defaultType : 'container',
		
		/**
		 * @cfg {Function} acceptType
		 * The {@link jqc.Component} class (or subclass) to accept in the Container for child {@link #items}. If an added component 
		 * is not an instance of this type, an error will be thrown. This should be set to a {@link jqc.Component} subclass (as only 
		 * {@link jqc.Component Components} may be added to a Container in the first place).
		 * 
		 * This config is useful for subclasses to set/override if they require a specific {@link jqc.Component} subclass to be added to
		 * them, so as to not allow just any {@link jqc.Component} to be added, and direct the user as such.
		 * 
		 * Note that the check for this is performed after any anonymous config objects have been converted into their corresponding
		 * {@link jqc.Component} instance.
		 */
		acceptType : Component,
	
		/**
		 * @cfg {Boolean} destroyRemoved
		 * True if the Container should automatically destroy child Components that have been removed from it.
		 */
		destroyRemoved : true,
	
		/**
		 * @cfg {String/Object/jqc.layout.Layout} layout
		 * The layout strategy object to use for laying out (displaying) the Container's child items.  This can either be a string with the
		 * type name of the layout, an object which should have the property `type` (for the layout's type name) and any other layout
		 * configuration options, or an instantiated {@link jqc.layout.Layout} subclass.
		 */
	
		/**
		 * @cfg {Object/Object[]/jqc.Component/jqc.Component[]} items
		 * Any Components/Containers that will become children of this Container, and will be instantiated at
		 * construction time.  These can be retrieved from the Container using {@link #getItems}.
		 *
		 * Note that specifying child items is mutually exclusive with setting the {@link jqc.Component#html} and
		 * {@link jqc.Component#contentEl} configs, and will take precedence over them.
		 */
	
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Container',
	
	
		/**
		 * @private
		 * @property {jqc.Component[]} childComponents
		 * 
		 * An array of child components. Created from the "items" config, or call(s) to the {@link #method-add} method.
		 */
		
		/**
		 * @private
		 * @property {Boolean} deferLayout
		 * 
		 * Will be set to true if a layout is requested (i.e. the {@link #doLayout} method is run), but the Container
		 * cannot be laid out at that time due to the Container being hidden.  This flag is tested for when the Container
		 * is then shown, and if true, will run {@link #doLayout} then.
		 */
		deferLayout : false,
	
	
		// protected
		initComponent : function() {
			// If the items config has a value, remove any html and contentEl configs, as the items config takes precedence.
			if( this.items ) {
				this.html = undefined;
				this.contentEl = undefined;
			}
	
			// Check that the 'acceptType' config actually refers to a class
			if( typeof this.acceptType !== 'function' ) { throw new Error( "'acceptType' config did not resolve to a constructor function" ); }
	
			this.addEvents(
				/**
				 * Fires before a Component has been added to this Container. A handler of
				 * this event may return false to cancel the addition of the Component.
				 *
				 * @event beforeadd
				 * @param {jqc.Container} container This Container.
				 * @param {jqc.Component} component The Component that is to be added.
				 */
				'beforeadd',
	
				/**
				 * Fires after a Component has been added to this Container. This event bubbles.
				 *
				 * @event add
				 * @param {jqc.Container} container This Container.
				 * @param {jqc.Component} component The Component that was added.
				 * @param {Number} index The index in this Container's child items array that the Component was added to.
				 */
				'add',
	
				/**
				 * Fires when a Component has been reordered within the Container (i.e. its index has changed).
				 * This is fired by the {@link #insert} method if it notices that the Component being "inserted" is
				 * already in this Container, but at a different index. If the Component was previously in a different
				 * Container, then the {@link #event-add} event is fired.
				 *
				 * @event reorder
				 * @param {jqc.Container} container This Container.
				 * @param {jqc.Component} component The Component that was reordered within the Container.
				 * @param {Number} index The new index of the Component in this Container's child items array.
				 * @param {Number} previousIndex The previous index of the Component in this Container's child items array.
				 */
				'reorder',
	
				/**
				 * Fires before a Component has been removed from this Container. A handler of
				 * this event may return false to cancel the removal of the Component.
				 *
				 * @event beforeremove
				 * @param {jqc.Container} container This Container.
				 * @param {jqc.Component} component The Component that is to be removed.
				 */
				'beforeremove',
	
				/**
				 * Fires after a Component has been removed from this Container. This event bubbles.
				 *
				 * @event remove
				 * @param {jqc.Container} container This Container.
				 * @param {jqc.Component} component The Component that was removed.
				 * @param {Number} index The index in this Container's child items array that the Component was removed from.
				 */
				'remove',
				
				/**
				 * Fires after the Container's {@link #doLayout} method has successfully executed.  
				 * Note that this event will fire after the {@link #event-render} event fires for
				 * the initial rendering of the Container (as {@link #doLayout} is executed at that
				 * point).
				 *
				 * @event afterlayout
				 * @param {jqc.Container} container This Container.
				 */
				'afterlayout'
			);
	
			// Call superclass initComponent
			this._super( arguments );
	
			this.childComponents = [];
	
			// Add child Components if specified in an items config
			if( this.items ) {
				this.add( this.items );
				delete this.items;  // no longer needed, instantiated item components have been put into this.childComponents
			}
	
			// Set any provided layout.
			if( this.layout ) {
				this.setLayout( this.layout );
			}
	
	
			// If initial data was provided for child Components, set it now.
			if( this.data ) {
				this.setData( this.data );
			}
		},
	
	
	
		// ----------------------------------------
	
		// Child Component Manipulation Methods
	
	
		/**
		 * Creates a Component from a configuration object. Automatically adds the parentContainer property to the supplied
		 * `config` object that refers to this Container, and adds the {@link #defaultType} to the `config` object
		 * if no `type` property was specified.
		 *
		 * @protected
		 * @method createComponent
		 * @param {Object} config The configuration object for the Component.
		 * @return {jqc.Component} The instantiated Component.
		 */
		createComponent : function( config ) {
			// Set the Component's parentContainer property to this Container, and use the default component 'type' if one wasn't specified
			// in the provided config. Adding in the 'parentContainer' and 'type' properties onto a new object, because we
			// don't want to modify the original configuration object (as that object may be used multiple times, or elsewhere).
			config = _.defaults( _.clone( config ), {
				parentContainer: this,
				type: this.defaultType
			} );
	
			return ComponentManager.create( config );
		},
	
	
		/**
		 * Adds child {@link jqc.Component Component(s)} to this Container, instantiating them into their appropriate
		 * jqc.Component subclass.  When all Components are added, this method automatically calls {@link #doLayout} to
		 * refresh the layout.
		 *
		 * Note that if multiple Components are being added, it is recommended that they all be provided to this method
		 * in one call, using the array form of the `cmp` argument.  A call to {@link #doLayout} will only be done
		 * after all Components are added (and not once for each add).
		 *
		 * This method fires the 'add' event for each Component that is added.
		 *
		 *
		 * @method add
		 * @param {jqc.Component/Object/jqc.Component[]/Array} cmp A single child {@link jqc.Component} or config object, or an array of
		 *   child {@link jqc.Component Components} or config objects.
		 * @return {jqc.Component/jqc.Component[]} Returns the Component that was added, or an array of the Components that were added, depending on
		 *   the type provided to the `cmp` argument.  Single Component addition returns a single Component; array addition returns an array. See
		 *   the return value of {@link #insert}.
		 */
		add : function( cmp ) {
			var returnVal;
	
			if( _.isArray( cmp ) ) {
				returnVal = [];
				for( var i = 0, numItems = cmp.length; i < numItems; i++ ) {
					returnVal.push( this.doInsert( cmp[ i ] ) );
				}
	
			} else {
				returnVal = this.doInsert( cmp );  // note: will append the component when not specifying the "position" argument
			}
	
			// Redraw the layout after all Components have been added
			this.doLayout();
	
			return returnVal;
		},
	
	
		/**
		 * Inserts (or moves) a {@link jqc.Component Component} into this Container.
		 *
		 * @method insert
		 * @param {jqc.Component/Object} cmp The Component or config object of a Component to insert.
		 * @param {Number} position (optional) The position (index) to insert the Component at. If omitted, the component will be appended to the Container.
		 * @return {jqc.Component} The Component that was inserted, or null if the Component was not added because a beforeadd event handler returned false.
		 */
		insert : function( cmp, position ) {
			cmp = this.doInsert( cmp, position );
	
			// Redraw the layout after the Component has been inserted
			this.doLayout();
	
			return cmp;
		},
	
	
		/**
		 * Private method that does the actual add or insert of the Component.  This is called by both {@link #method-add} and {@link #insert} methods, and exists
		 * so that those methods can call {@link #doLayout} after their processing is complete.
		 *
		 * @private
		 * @method doInsert
		 * @param {jqc.Component/Object} component The Component or config object of a Component to insert.
		 * @param {Number} position (optional) The position (index) to insert the Component at. If omitted, the component will be appended to the Container.
		 * @return {jqc.Component} The Component that was inserted, or null if the component was not added because a beforeadd event handler returned false.
		 */
		doInsert : function( component, position ) {
			// First, fix position if it is out of the bounds of the childComponents array
			if( typeof position !== 'number' ) {
				position = this.childComponents.length;  // append by default
			} else if( position < 0 ) {
				position = 0;
			} else if( position > this.childComponents.length ) {
				position = this.childComponents.length;
			}
	
	
			var isInstantiatedComponent = ( component instanceof Component ),   // if the component argument is an actual instantiated jqc.Component, and not just a configuration object
			    isReorder = isInstantiatedComponent && this.has( component );  // Determines if this is an actual addition of the Component to the Container, or a reorder of the Component within the Container
	
			if( isReorder ) {
				// Component is currently in this Container, remove its reference from its current location in the childComponents array.
				// It will be re-added to the childComponents array next.
				var childComponents = this.childComponents;
				for( var i = 0, len = childComponents.length; i < len; i++ ) {
					if( childComponents[ i ] === component ) {
						this.childComponents.splice( i, 1 );  // remove component from array. will re-add later
						break;
					}
				}
	
				// Add the component to the new position in the childComponents array
				this.childComponents.splice( position, 0, component );
	
				// Call the onReorder template method, and fire the 'reorder' event
				this.onReorder( component, position, i );  // Component, new index, previous index
				this.fireEvent( 'reorder', this, component, position, i );  // Container, Component, new index, previous index
	
				return component;
	
			} else {
				// If the component is not yet a jqc.Component instance at this point (i.e. it is a configuration object), instantiate it now so
				// we can provide it to the beforeadd event
				if( !isInstantiatedComponent ) {
					component = this.createComponent( component );
				}
				
				// Perform the check that the component is of the correct class type (governed by the 'acceptType' config).
				if( !( component instanceof this.acceptType ) ) {  // Note: this.acceptType defaults to jqc.Component
					throw new Error( "A Component added to the Container was not of the correct class type ('acceptType' config)" );
				}
	
				if( this.fireEvent( 'beforeadd', this, component ) !== false ) {
					// If the component currently has a parent Container other than this one, remove the component from it. We will set its parent to this Container next.
					var currentParentContainer = component.getParentContainer();
					if( currentParentContainer ) {
						currentParentContainer.remove( component, /* destroyRemoved */ false );
					}
					
					// Set the component to have this Container as its parent container (regardless of if it has a current parent Container or not)
					component.setParentContainer( this );
	
					// Add the component to the new position in the childComponents array
					this.childComponents.splice( position, 0, component );
	
					// Run template method, and fire the event
					this.onAdd( component, position );
					this.fireEvent( 'add', this, component, position );
	
					return component;
	
				} else {
					// a beforeadd event handler returned false, return null from this method
					return null;
				}
			}
		},
	
	
		/**
		 * Hook method that is run when a Component is added or inserted into the Container.
		 *
		 * @protected
		 * @template
		 * @method onAdd
		 * @param {jqc.Component} component The component that was added or inserted into this Container.
		 * @param {Number} index The index in this Container's child items array where the new Component was added.
		 */
		onAdd : Jqc.emptyFn,
	
	
		/**
		 * Hook method that is run when a Component is reordered within the Container.
		 *
		 * @protected
		 * @template
		 * @method onReorder
		 * @param {jqc.Component} component The Component that was reordered within the Container.
		 * @param {Number} index The new index of the Component in this Container's child items array.
		 * @param {Number} previousIndex The previous index of the Component in this Container's child items array.
		 */
		onReorder : Jqc.emptyFn,
	
	
	
		/**
		 * Removes one or more child {@link jqc.Component Component(s)} from this Container.  
		 * 
		 * Removed {@link jqc.Component Components} will automatically have their {@link jqc.Component#method-destroy} method called if 
		 * the {@link #destroyRemoved} config is true (the default), or if the `destroyRemoved` argument is explicitly set to true. 
		 * If the Component is not destroyed, its main {@link jqc.Component#$el element} is detached from this Container.  When all 
		 * Components are removed, this method automatically calls {@link #doLayout} to refresh the layout.
		 *
		 * Note that if multiple Components are being removed, it is recommended that they all be provided to this method
		 * in one call, using the array form of the `cmp` argument.  A call to {@link #doLayout} will only be done
		 * after all Components have been removed (as opposed to once for each Component that is removed).
		 *
		 * The 'remove' event will be fired for each Component that is successfully removed (i.e. the Component was found in the 
		 * Container, and a {@link #beforeremove} event handler did not return false for it).
		 *
		 * @method remove
		 * @param {jqc.Component/jqc.Component[]} cmp A single child {@link jqc.Component Component}, or an array of child Components.
		 * @param {Boolean} destroyRemoved (optional) True to automatically destroy the removed component. Defaults to the value of this Container's {@link #destroyRemoved} config.
		 * @return {jqc.Component/jqc.Component[]} Returns the Component that was removed, or an array of the Components that were removed, depending on
		 *   the type provided to the `cmp` argument.  Single Component removal returns a single Component (or null if the Component was not removed);
		 *   array removal returns an array of the Components that were successfully removed.
		 */
		remove : function( cmp, destroyRemoved ) {
			var returnVal;
	
			if( _.isArray( cmp ) ) {
				returnVal = [];
				for( var i = 0, numItems = cmp.length; i < numItems; i++ ) {
					var removedComponent = this.doRemove( cmp[ i ], destroyRemoved );
					if( removedComponent ) {
						returnVal.push( removedComponent );
					}
				}
	
			} else {
				returnVal = this.doRemove( cmp, destroyRemoved );  // note: will append the component when not specifying the "position" argument
			}
	
			// Refresh the layout
			this.doLayout();
	
			return returnVal;
		},
		
		
		/**
		 * Removes the child Component at the given `idx`, and returns the removed component. If there is no component 
		 * at the given `idx`, then this method has no effect and returns `null`.
		 * 
		 * Note that the removed {@link jqc.Component Component} will automatically have its {@link jqc.Component#method-destroy destroy} 
		 * method called if the {@link #destroyRemoved} config is true (the default), or if the `destroyRemoved` argument is 
		 * explicitly set to true. If the Component is not destroyed, its main {@link jqc.Component#$el element} is detached from 
		 * this Container.  
		 * 
		 * When the Component is removed, this method automatically calls {@link #doLayout} to refresh the layout.
		 * 
		 * The 'remove' event will be fired for each Component that is successfully removed (i.e. the Component was found in the 
		 * Container, and a {@link #beforeremove} event handler did not return false for it).
		 * 
		 * @param {Number} idx The index of the child component to remove.
		 * @return {jqc.Component} Returns the Component that was removed, or `null` if there was no Component at the given `idx`.
		 */
		removeAt : function( idx ) {
			return this.remove( this.getItemAt( idx ) );
		},
	
	
		/**
		 * Removes all child Component(s) from this Container.
		 *
		 * @param {Boolean} destroyRemoved (optional) True to automatically destroy the removed components. Defaults to the value of this Container's {@link #destroyRemoved} config.
		 */
		removeAll : function( destroyRemoved ) {
			var childComponents = this.childComponents;
			for( var i = childComponents.length-1; i >= 0; i-- ) {
				this.doRemove( childComponents[ i ], destroyRemoved );
			}
	
			// Refresh the layout
			this.doLayout();
		},
	
	
		/**
		 * Removes a child {@link jqc.Component Component(s)} from this Container.  If a Component is successfully removed, the 'remove' event will be fired.
		 * Removed {@link jqc.Component Components} will automatically have their destroy() method called if the {@link #destroyRemoved} config is true, or
		 * if the `destroyRemoved` argument is explicitly set to true.  If the Component is not destroyed, its main {@link jqc.Component#getEl element} is
		 * detached from this Container.
		 *
		 * @private
		 * @method doRemove
		 * @param {jqc.Component/jqc.Component[]} cmp A single child {@link jqc.Component Component}, or an array of child Components.
		 * @param {Boolean} destroyRemoved (optional) True to automatically destroy the removed component. Defaults to the value of this Container's {@link #destroyRemoved} config.
		 * @return {jqc.Component} The Component that was removed, or null if no Component was removed (i.e. a {@link #beforeremove}
		 *   event handler returned false, or the Component to be removed was not found).
		 */
		doRemove : function( cmp, destroyRemoved ) {
			var i, len,
			    childComponents = this.childComponents,
				idx = -1;
	
			// default the destroyRemoved argument to the Container's destroyRemoved config if not provided (i.e. undefined)
			destroyRemoved = ( typeof destroyRemoved === 'undefined' ) ? this.destroyRemoved : destroyRemoved;
	
			// Find the component in this Container
			for( i = 0, len = childComponents.length; i < len; i++ ) {
				if( childComponents[ i ] === cmp ) {
					idx = i;
					break;
				}
			}
	
			// Make sure the component exists in this container before continuing
			if( idx !== -1 ) {
				if( this.fireEvent( 'beforeremove', this, cmp ) !== false ) {
					// Remove the parentContainer reference from the child Component. It was set to this Container when the Component was added.
					cmp.setParentContainer( null );
	
					// First, detach the Component's element. This is done first so that the onRemove() template method, and subscribers of the 'remove'
					// event, can process their code without the element still being in the DOM. This is also done so that if the Component is not being
					// destroyed (destroyRemoved flag is false), that it is still at least removed from the Container's DOM (as a call to destroy() would
					// normally do the same thing when removing the element itself).
					cmp.detach();  // detach the Component's element from the Container's element (if it's rendered)
	
					childComponents.splice( idx, 1 );  // remove the Component from the Container's childComponents array
	
					// Run template method, and fire the event
					this.onRemove( cmp, idx );
					this.fireEvent( 'remove', this, cmp, idx );
	
					// Destroy the Component if the destroyRemoved flag is true at this point. Doing this after the remove event so that subscribers can
					// process the removal before the Component is possibly put into a state where say, its data can no longer be retrieved.
					if( destroyRemoved ) {
						cmp.destroy();
					}
	
					return cmp;  // successful removal, return a reference to the removed Component
				}
			}
	
			return null;  // unsuccessful removal, return null
		},
	
	
		/**
		 * Hook method that is run when a Component is removed from the Container.
		 *
		 * @protected
		 * @template
		 * @method onRemove
		 * @param {jqc.Component} component The component that was removed.
		 * @param {Number} index The index in this Container's child items array where the Component was removed from.
		 */
		onRemove : Jqc.emptyFn,
	
	
	
		// ----------------------------------------
	
		// Child Component Accessor Methods
	
		/**
		 * Retrives the number of child items ({@link jqc.Component components}) that are currently held by this Container.
		 * 
		 * @method getCount
		 * @return {Number}
		 */
		getCount : function() {
			return this.childComponents.length;
		},
	
	
		/**
		 * Retrieves the child items ({@link jqc.Component components}) that are currently held by this Container.
		 *
		 * @method getItems
		 * @return {jqc.Component[]}
		 */
		getItems : function() {
			return this.childComponents;
		},
	
	
		/**
		 * Retrieves the child item ({@link jqc.Component Component} at the specified `index`. If the
		 * index is out of range of the child items, this method returns null.
		 *
		 * @method getItemAt
		 * @param {Number} index
		 * @return {jqc.Component} The child item ({@link jqc.Component Component}) at the specified index, or null if the index is out of range.
		 */
		getItemAt : function( index ) {
			return this.childComponents[ index ] || null;
		},
	
	
		/**
		 * Retrieves the index of the given child item ({@link jqc.Component Component}). Returns -1 if the if the item
		 * is not found.
		 *
		 * @method getItemIndex
		 * @param {jqc.Component} item The item to get the index of.
		 * @return {Number} The index of the item (component), or -1 if it was not found.
		 */
		getItemIndex : function( item ) {
			var childComponents = this.childComponents;
			for( var i = 0, len = childComponents.length; i < len; i++ ) {
				if( childComponents[ i ] === item ) {
					return i;
				}
			}
			return -1;  // item not found
		},
	
	
		/**
		 * Determine if this Container has a given `component` as a direct child component of this Container.
		 *
		 * @method has
		 * @param {jqc.Component} component The {@link jqc.Component Component} to look for as a child of this Container.
		 * @return {Boolean} True if the Component is found as a direct child of this Container, false otherwise.
		 */
		has : function( component ) {
			return this.getItemIndex( component ) !== -1;
		},
	
	
	
		// ----------------------------------------
	
	
		/**
		 * Extension of onShow method used to test if a layout request has been deferred on the Container due
		 * to the Container being hidden at the time.  If a layout request was deferred, {@link #doLayout}
		 * will be run.
		 *
		 * @protected
		 * @method onShow
		 */
		onShow : function() {
			// Call superclass onShow
			this._super( arguments );
			
			// If a layout has been deferred from a call to doLayout() while this Container was hidden,
			// we'll run the layout now.
			if( this.deferLayout ) {
				this.doLayout();
			}
	
			// Go through all child Component's, notifying them that they have been shown (if they are not hidden)
			var childComponents = this.childComponents;
			for( var i = 0, len = childComponents.length; i < len; i++ ) {
				var childComponent = childComponents[ i ];
				if( !childComponent.isHidden() ) {  // note: we don't need to query the DOM for this check, so no 'checkDom' argument to isHidden()
					childComponents[ i ].onShow();
				}
			}
		},
	
	
	
		// ----------------------------------------
	
		// Layout Methods
	
	
		/**
		 * Lays out the Container's child components ({@link #items}) using the configured {@link #layout} strategy object.
		 * If no {@link #layout} has been configured, the default {@link jqc.layout.Auto} is used.
		 *
		 * Note that a layout can only be done if the Container is rendered and visible. This method will automatically
		 * be run when the Container's {@link #method-render} method runs. If the Container isn' visible when this method is called,
		 * the layout will be deferred until the {@link #method-show} method is called.
		 *
		 * @method doLayout
		 */
		doLayout : function() {
			// Run the superclass's (jqc.Component's) layout functionality first
			this._super( arguments );
			
			if( !this.canLayout() ) {
				// If the Container is currently hidden, set this flag to true so that
				// when the show() method is run, a layout is triggered.
				this.deferLayout = true;
	
			} else {
				// Make sure the deferLayout flag is false, now that a layout is about to be run
				this.deferLayout = false;
				
				// Run the before layout template method
				this.onBeforeLayout();
				
				// Run the layout strategy, which will lay the child components out into this Container,
				// using the layout target returned by the getContentTarget() method.
				this.getLayout().doLayout();
	
				// Run the template method after layout has been executed, and fire the afterlayout event
				this.onLayout();
				this.fireEvent( 'afterlayout', this );
			}
		},
		
		
		/**
		 * Hook method that is executed just before the {@link #layout layout's} {@link jqc.layout.Layout#doLayout doLayout}
		 * method is executed to run the layout.
		 * 
		 * @protected
		 * @template
		 * @method onBeforeLayout
		 */
		onBeforeLayout : Jqc.emptyFn,
		
		
		/**
		 * Hook method that is executed after {@link #doLayout} has successfully executed. Extend this method
		 * (calling the superclass method first) to implement any post-layout logic that the Container subclass
		 * should perform after its {@link #items child components} have been laid out.
		 *
		 * @protected
		 * @template
		 * @method onLayout
		 */
		onLayout : Jqc.emptyFn,
		
	
		/**
		 * Determines if the Container can be laid out at this time. The Container must be rendered, and visible.
		 * It must be visible because for some layouts, especially those that use jQuery UI components or that
		 * need to calculate the size of elements, we can not lay out their child {@link jqc.Component Components}
		 * when the Container's element is hidden (i.e. no css visibility/display).
		 *
		 * This method is basically used to determine if we can lay the child Components out, and if not, a layout
		 * will be deferred until the Container is shown.  All Containers/Components within a Dialog are a case for
		 * this, where their child Components are requested to be laid out before the Dialog is shown.
		 *
		 * @private
		 * @method canLayout
		 * @return {Boolean}
		 */
		canLayout : function() {
			return this.isRendered() && !this.isHidden( /* checkDom */ true );  // not hidden, we can run the layout
		},
	
	
	
		/**
		 * Retrieves the {@link jqc.layout.Layout Layout} object that the Container is currently
		 * configured to use.  If no {@link #layout} is currently configured for the Container, this method
		 * creates a {@link jqc.layout.Auto} to use for this Container, and returns that.
		 *
		 * @method getLayout
		 */
		getLayout : function() {
			if( !this.layout ) {
				var AutoLayout = require( 'jqc/layout/Auto' );
				this.setLayout( new AutoLayout() );
			}
			return this.layout;
		},
	
	
		/**
		 * Sets a new layout strategy object for the Container. Any previous layout will be detached from
		 * the Container (its container reference set to null).
		 *
		 * @method setLayout
		 * @param {String/Object/jqc.layout.Layout} layout See the {@link #layout} config.
		 */
		setLayout : function( layout ) {
			var Layout = require( 'jqc/layout/Layout' );  // for dealing with circular dependency
			
			// Destroy the current layout if we have a new one, and detach all Components in the Container, as 
			// a new layout is going to have to render them anyway.
			if( this.layout instanceof Layout && this.layout !== layout ) {
				var childComponents = this.childComponents;
				for( var i = 0, len = childComponents.length; i < len; i++ ) {
					childComponents[ i ].detach();
				}
				
				// Note: should destroy the layout *after* all child components have been detached, in case the layout removes 
				// elements that hold Component elements. We don't want Component elements, and all of their handlers and such, removed.
				this.layout.destroy();
			}

	
			if( layout instanceof Layout ) {
				// The new layout is already an AbstractLayout instance
				this.layout = layout;
				layout.setContainer( this );
	
			} else {
				// The new layout is a string or config object
				var layoutType,
				    layoutConfig = { container: this };
	
				if( typeof layout === 'string' ) {
					layoutType = layout;
	
				} else if( typeof layout === 'object' ) { // config object
					layoutType = layout.type || 'auto';   // default to 'auto' layout
					layoutConfig = _.defaults( _.clone( layoutConfig ), layout );
					delete layoutConfig.type;  // remove the 'type' property from the config object now, as to not shadow the Layout object's prototype 'type' property when applied
	
				} else {
					// Not a jqc.layout.Layout, String, or Object...
					throw new Error( "Invalid layout argument provided to setLayout. See method description in docs." );
				}
	
				// Layout types should be case-insensitive
				layoutType = layoutType.toLowerCase();
	
				// Check that the layout type given is a registered layout type
				if( !Container.LAYOUTS[ layoutType ] ) {
					throw new Error( "layout type '" + layoutType + "' is not a registered layout type." );
				}
	
				// Create the layout strategy object if all is well
				this.layout = new Container.LAYOUTS[ layoutType ]( layoutConfig );
			}
		},
	
	
	
		// ----------------------------------------
	
	
		/**
		 * Cascades down the {@link jqc.Component Component}/Container heirarchy from this Container (called first), calling the specified
		 * function for each Component. The scope (`this` reference) of the function call will be the scope provided,
		 * or the current Component that is being processed.
		 *
		 * If the function returns false at any point, the cascade does not continue down that branch. However, siblings of the Container
		 * that was being processed when the function returned false are still processed.
		 *
		 * @param {Function} fn The function to call
		 * @param {Object} [scope] The scope of the function. Defaults to the {@link jqc.Component Component} that is currently being
		 *   processed.
		 */
		cascade : function( fn, scope, args ) {
			if( fn.apply( scope || this, args || [this] ) !== false ) {
				var childComponents = this.childComponents;
	
				for( var i = 0, len = childComponents.length; i < len; i++ ) {
					if( childComponents[ i ].cascade ) {
						childComponents[ i ].cascade( fn, scope, args );
					} else {
						fn.apply( scope || childComponents[ i ], args || [ childComponents[ i ] ] );
					}
				}
			}
		},
	
	
		/**
		 * Finds a Component under this container at any level by {@link jqc.Component#id id}.
		 *
		 * @param {String} id The ID of the Component to search for.
		 * @return {jqc.Component} The component with the given `id`, or `null` if none was found.
		 */
		findById : function( id ) {
			var returnVal = null,
			    thisContainer = this;
	
			this.cascade( function( component ) {
				if( component !== thisContainer && component.getId() === id ) {
					returnVal = component;
					return false;
				}
			} );
			return returnVal;
		},
	
	
		/**
		 * Finds the {@link jqc.Component Components} under this Container at any level by a custom function. If the passed function 
		 * returns true for a given Component, then that Component will be included in the results.
		 *
		 * @param {Function} fn The function to call. The function will be called with the following arguments:
		 * @param {jqc.Component} fn.component The Component that is being inspected.
		 * @param {jqc.Container} fn.thisContainer This Container instance.
		 * @param {Object} [scope] The scope to call the function in. Defaults to the Component being inspected.
		 * @return {jqc.Component[]} Array of {@link jqc.Component Components}
		 */
		findBy : function( fn, scope ) {
			var returnVal = [],
			    thisContainer = this;
	
			this.cascade( function( component ) {
				if( component !== thisContainer && fn.call( scope || component, component, thisContainer ) === true ) {
					returnVal.push( component );
				}
			} );
			return returnVal;
		},
	
	
		/**
		 * Finds the {@link jqc.Component Components} under this Container at any level by Component `type`. The Component `type` can be either 
		 * the type name that is registered to the {@link jqc.ComponentManager} (see the description of the {@link jqc.Component} class), 
		 * or the JavaScript class (constructor function) of the {@link jqc.Component Component}.
		 *
		 * @param {Function} type The type name registered with the {@link jqc.ComponentManager}, or the constructor function (class) of the Component.
		 * @return {jqc.Component[]} Array of {@link jqc.Component Components} which match the `type`.
		 */
		findByType : function( type ) {
			if( typeof type === 'string' ) {
				type = ComponentManager.getType( type );
				
				// No type found for the given type name, return empty array immediately
				if( !type ) {
					return [];
				}
			}
			
			return this.findBy( function( cmp ) { 
				if( Class.isInstanceOf( cmp, type ) ) {
					return true; 
				}
			} );
		},
	
	
		// ----------------------------------------
	
	
		/**
		 * Destroys each child Component in the Container. Called when the Component's destroy() method is called.
		 *
		 * @protected
		 * @method onDestroy
		 */
		onDestroy : function() {
			// Remove all child components (which will destroy them if destroyRemoved is true. Otherwise,
			// it will detach them, which makes it safe to destroy the layout).
			this.removeAll();
	
			// Destroy the Container's layout, if it has one
			var Layout = require( 'jqc/layout/Layout' );
			if( this.layout instanceof Layout ) {  // just in case it's still the string config
				this.layout.destroy();
			}
			
			this._super( arguments );
		}
	
	} );
	
	
	ComponentManager.registerType( 'container', Container );
	
	
	return Container;
} );
/*global define */
define('jqc/ComponentQuery', [
	'lodash',
	'Class',
	'jqc/Container',
	'jqc/ComponentManager'
], function( _, Class, Container, ComponentManager ) {
	
	/**
	 * @class jqc.ComponentQuery
	 * @extends Object
	 * @singleton
	 * 
	 * Singleton class which implements a simple querying mechanism in order to find components.
	 * 
	 * At this time, the selectors that are available are limited to:
	 * 
	 * - **id** : For referencing a Component by {@link jqc.Component#id}. Example: "#myComponent".
	 * - **type** : For referencing one or more Components by their string 'type' name. Example: "button" would
	 *   find all {@link jqc.button.Button} instances, and any subclasses of Button instances. It will also find
	 *   instances which implementing the type name as a mixin.
	 * 
	 * No child or descendant selectors are available yet at this time, but this class will be extended to do
	 * so in the near future.
	 */
	var ComponentQuery = Class.extend( Object, {
		
		/**
		 * Queries for components in the `context` array of components, using the `selector`. Returns the array of matching
		 * components. See the description of this class for valid selectors.
		 * 
		 * @param {String} selector The selector to query components by.
		 * @param {jqc.Component/jqc.Component[]} context The component(s) to query the `selector` for. If one
		 *   or more of the components match the selector, they will be included. Components that are 
		 *   {@link jqc.Container Containers} will be recursively queried to determine if their descendant 
		 *   components match the `selector` as well.
		 */
		query : function( selector, context ) {
			context = [].concat( context );  // normalize to array
			
			var workingSet = _.flatten( context, /* isShallow */ true ),
			    i, len;
			
			// Compile the working set of components
			for( i = 0, len = context.length; i < len; i++ ) {
				if( context[ i ] instanceof Container ) {
					workingSet.push.apply( workingSet, this.getDescendants( context[ i ] ) );
				}
			}
			
			return this.filterBySelector( workingSet, selector );
		},
		
		
		/**
		 * Determines if a given `component` is matched by the provided `selector`.
		 * 
		 * @param {jqc.Component} component The Component(s) to test.
		 * @param {String} selector The selector string to test the `component` against.
		 * @return {Boolean} `true` if the Component matches the selector, `false` otherwise.
		 */
		is : function( component, selector ) {
			var components = [ component ];
			return ( this.filterBySelector( components, selector ).length === 1 );  // returns true if the length is still 1 after applying the selector as a filter  
		},
		
		
		/**
		 * Applies the given `selector` against a set of `components`. The components array will be filtered based
		 * on the selector, and the resulting array returned.
		 * 
		 * @protected
		 * @param {jqc.Component[]} The list of components which is to be filtered by the selector.
		 * @param {String} selector The selector string to apply to the set of components.
		 * @return {jqc.Component[]} The unique set of Components that matched the selector. Duplicates are removed.
		 */
		filterBySelector : function( components, selector ) {
			if( selector.charAt( 0 ) === '#' ) {  // ID selector
				components = this.filterById( components, selector.substr( 1 ) );
			} else {
				components = this.filterByType( components, selector );
			}
			return _.unique( components );  // return only the unique set of components (i.e. duplicates removed)
		},
		
		
		/**
		 * Filters the given set of `components` by returning only the ones that have an {@link jqc.Component#id id}
		 * matching the provided `id`.
		 * 
		 * @protected
		 * @param {jqc.Component[]} components
		 * @param {String} id The ID of the component to return.
		 * @return {jqc.Component[]} The filtered array of components.
		 */
		filterById : function( components, id ) {
			return _.filter( components, function( component ) { return ( component.getId() === id ); } );
		},
		
		
		/**
		 * Filters the given set of `components` by returning only the ones that are of the `type` provided.
		 * The `type` name is resolved to the component's class, in which each component is tested to be an
		 * instance of that class (i.e. a direct instance of that class, an instance of a subclass of that
		 * type, or an instance of a class that implements the `type` as a mixin).
		 * 
		 * If the `type` provided is not a registered type name, then an empty array is returned, as no component
		 * could possibly match it. This is done instead of throwing an error for the case that a certain type has 
		 * not yet been loaded in yet when using the {@link #query} or {@link #is} methods, or when a
		 * {@link jqc.app.Controller} listens for events on a certain component type which hasn't been loaded yet.
		 * 
		 * @protected
		 * @param {jqc.Component[]} components
		 * @param {String} type The component `type`, which will be resolved to a component class to test each
		 *   component against.
		 * @return {jqc.Component[]} The filtered array of components.
		 */
		filterByType : function( components, type ) {
			if( !ComponentManager.hasType( type ) ) {
				return [];
				
			} else {
				// Resolve `type` string to its corresponding class
				type = ComponentManager.getType( type );
				
				var _Class = Class;  // local ref to be closer to the below closure
				return _.filter( components, function( component ) { return _Class.isInstanceOf( component, type ); } );
			}
		},
		
		
		/**
		 * Retrieves the descendants of the provided {@link jqc.Container Container}.
		 * 
		 * @protected
		 * @param {jqc.Container} container
		 * @param {jqc.Component[]} All of the descendant components of the `container`. 
		 */
		getDescendants : function( container ) {
			var items = container.getItems(),
			    result = [];
			
			for( var i = 0, len = items.length; i < len; i++ ) {
				var item = items[ i ];
				
				result.push( item );
				if( item instanceof Container ) {
					result.push.apply( result, this.getDescendants( item ) );
				}
			}
			return result;
		}
		
	} );
	
	
	// Return singleton instance
	return new ComponentQuery();
	
} );
/*global define */
define('jqc/Image', [
	'lodash',
	'Class',
	'jqc/ComponentManager',
	'jqc/Component'
], function( _, Class, ComponentManager, Component ) {
	
	/**
	 * @class jqc.Image
	 * @extends jqc.Component
	 * @alias type.image
	 *
	 * A simple image component.
	 */
	var Image = Class.extend( Component, {
		
		/**
		 * @cfg {String} src
		 * The initial src (url) for the image.
		 */
		src : "",
		
		/**
		 * @hide
		 * @cfg {String} elType
		 * @inheritdoc
		 */
		elType : 'img',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Image',
		
		
		/**
		 * @protected
		 * @property {Boolean} loaded
		 * 
		 * Flag to store the state of if the image is loaded or not. If a new image is requested
		 * via {@link #setSrc}, this flag is set back to false until the new image is loaded.
		 */
		loaded : false,
		
		/**
		 * @protected
		 * @property {Boolean} errored
		 * 
		 * Flag to store the state of if it has been attempted to load the image, but it has failed to load. If a new
		 * image is requested via {@link #setSrc}, this flag is set back to false until the new image either loads or errors.
		 */
		errored : false,
		
		
		/**
		 * @protected
		 * @property {String} blankImg
		 * 
		 * A blank image which is used to swap into the underlying image before placing a new image src in. This is a 
		 * webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f,
		 * where the 'load' event wouldn't be fired again if setting to the same image src. Using this data uri bypasses 
		 * a webkit log warning.
		 */
		blankImg : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
	
		
	
	
		// protected
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires when the underlying image has loaded successfully.
				 * 
				 * @event load
				 * @param {jqc.Image} image This Image instance.
				 */
				'load',
				
				/**
				 * Fires when the underlying image has failed to load.
				 * 
				 * @event error
				 * @param {jqc.Image} image This Image instance.
				 */
				'error'
			);
			
			this._super( arguments );
		},
	
		
		// protected
		onRender : function() {
			this._super( arguments );
			
			if( this.src ) {
				this.setSrc( this.src );
			}
		},
	
	
		// -------------------------------------
		
		
		/**
		 * Sets the {@link #src} (url) of the Image.
		 * 
		 * @method setSrc
		 * @param {String} src The new src (url) for the image.
		 */
		setSrc : function( src ) {
			this.src = src;
			
			if( this.rendered ) {
				this.loaded = false;
				this.errored = false;
				
				// Unbind load and error events before switching in the blankImg, as we don't want these events from the switch to the blankImg
				this.$el.unbind( '.uiImage' );  // unbind all events in the 'uiImage' namespace
				this.$el.attr( 'src', this.blankImg );  // see description of `blankImg` property in this class for why we set this here before the new src
				
				// Now bind the load and error events for when we set the new src
				this.$el.bind( {
					'load.uiImage'  : _.bind( this.onImageLoad, this ),
					'error.uiImage' : _.bind( this.onImageError, this )
				} );
				this.$el.attr( 'src', this.src );
			}
		},
		
		
		/**
		 * Retrieves the {@link #src} (url) of the Image. If no {@link #src} has been provided (either by the configuration
		 * option, or by {@link #setSrc}), will return an empty string.
		 * 
		 * @method getSrc
		 * @return {String} The current {@link #src} of the image.
		 */
		getSrc : function() {
			return this.src;
		},
		
		
		/**
		 * Determines if the image has loaded successfully.
		 * 
		 * @method isLoaded
		 * @return {Boolean}
		 */
		isLoaded : function() {
			return this.loaded;
		},
		
		
		/**
		 * Determines if the image has failed to load.
		 * 
		 * @method isErrored
		 * @return {Boolean}
		 */
		isErrored : function() {
			return this.errored;
		},
		
		
		/**
		 * Called when the underlying image has loaded successfully.
		 * 
		 * @protected
		 * @method onImageLoad
		 */
		onImageLoad : function() {
			this.loaded = true;
			this.fireEvent( 'load', this );
		},
		
		
		/**
		 * Called when the underlying image has failed to load.
		 * 
		 * @protected
		 * @method onImageError
		 */
		onImageError : function() {
			this.errored = true;
			this.fireEvent( 'error', this );
		}
	
	} );
	
	
	ComponentManager.registerType( 'image', Image );
	
	return Image;
} );
/*global define */
define('jqc/Label', [
	'jqc/ComponentManager',
	'jqc/Component'
], function( ComponentManager, Component ) {
	
	/**
	 * @class jqc.Label
	 * @extends jqc.Component
	 * @alias type.label
	 * 
	 * Creates a label (piece of text).
	 */
	var Label = Component.extend( {
	
		/**
		 * @cfg {String/HTMLElement/jQuery} text
		 * 
		 * The label's text. Accepts HTML, DOM nodes, and jQuery wrapped sets as well.
		 */
		text : "",
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Label',
		
	
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.$el.append( this.text || "" );
			delete this.text;  // no longer needed
		},
		
		
		/**
		 * Sets the label's text.  Accepts HTML, DOM nodes, and jQuery wrapper objects as well.
		 * 
		 * @method setText
		 * @param {String/HTMLElement/jQuery} text The text, HTML, or DOM element to set to the label. 
		 */
		setText : function( text ) {
			if( !this.rendered ) {
				this.text = text;  // set the config. will be used when rendered
			} else {
				this.$el.html( text );
			}
		},
		
		
		/**
		 * Gets the label's text.  Will return the HTML of the label if it has any.
		 * 
		 * @method getText
		 * @return {String}
		 */
		getText : function() {
			if( !this.rendered ) {
				return this.text || "";
			} else {
				return this.getEl().html();  // in case DOM nodes were provided as the `text`, return the html
			}
		}
	
	} );
	
	
	// Register the class so it can be created by the type string 'label'
	ComponentManager.registerType( 'label', Label );
	
	return Label;
	
} );
/*global define */
define('jqc/layout/HBox', [
	'jquery',
	'jqc/Component',
	'jqc/Container',
	'jqc/layout/Layout'
], function( jQuery, Component, Container, Layout ) {

	/**
	 * @class jqc.layout.HBox
	 * @extends jqc.layout.Layout
	 * @alias layout.hbox
	 * 
	 * A layout that renders its {@link #container container's} child components using a "flexbox" scheme. Each child component
	 * in the Container that should have a flexible width that proportionally should take up the remaining area of its parent
	 * element should have a special property named {@link #flex}, that determines how wide the box should be in relation to the
	 * available area.  This property is a number, relative to other children. If a {@link #flex} not provided, the layout uses 
	 * the component's width instead.
	 */
	var HBoxLayout = Layout.extend( {
		
		/**
		 * @cfg {Number} flex
		 * This config is to be placed on **child components** of the {@link #container}. The number is a ratio
		 * of how much space the child component should take up in relation to the remaining space in the target
		 * element, and based on other child components' flex values.
		 * 
		 * For example, the following configuration would make component #1 have ~33% width, and component #2 have
		 * ~67% width.
		 * 
		 *     layout : 'hbox',
		 *     items : [
		 *         {
		 *             flex : 1,
		 *             html : "I'm at 33% width"
		 *         },
		 *         {
		 *             flex : 2,
		 *             html : "I'm at 67% width"
		 *         }
		 *     ]
		 * 
		 * Other components may also exist in the {@link #container} that do not have a {@link #flex} value. These will be sized,
		 * and components *with* a {@link #flex} value will be flexed into the *remaining* space that is not taken up by the other
		 * components. Example:
		 * 
		 *     width : 100,    // not necessary, but just for example purposes
		 *     layout : 'hbox',
		 *     
		 *     items : [
		 *         {
		 *             html : "I will be sized based on my content. Let's say my width is 20px though, for argument's sake"
		 *         },
		 *         {
		 *             flex : 1,
		 *             html : "Since the previous component is 20px wide, I will take up the remaining 80px of space"
		 *         }
		 *     ]
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $clearEl
		 * 
		 * The element used to clear the floats created by the layout routine.
		 */
		
		
		/**
		 * Hook method for subclasses to override to implement their layout strategy. Implements the HBoxLayout algorithm.
		 * 
		 * @protected
		 * @template
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {
			this._super( arguments );
			
			
			var flexedComponents = [],
			    totalFlex = 0,
			    totalUnflexedWidth = 0,
			    i, len, childComponent, numChildComponents = childComponents.length;
			
			// First, render and lay out each of the child components that don't have a 'flex' value.
			// While we're at it, we'll add up the total flex that components which *do* have a flex value have.
			for( i = 0; i < numChildComponents; i++ ) {
				childComponent = childComponents[ i ];
				
				// Add the CSS class to components to be able to place them in an HBox layout. This adds `float:left;`,
				// and a few other fixing styles.
				childComponent.addCls( 'jqc-layout-HBox-component' );
				
				// Render the component (note: it is only rendered if it is not yet rendered already, or in the wrong position in the DOM)
				this.renderComponent( childComponent, $targetEl, { position: i } );
				
				// Only process the child component if it is not hidden
				if( !childComponent.isHidden() ) {
					if( !childComponent.flex ) {
						// Not a flexed component, do its layout
						childComponent.doLayout();
						
						// Sadly, the element being measured may have a sub-pixel width, but jQuery returns the floor value of 
						// it. And in this case, we would get float wrapping because the sum of the actual widths would be greater 
						// than the container width after flex values are computed. So simply adding one pixel as a workaround
						// at this point. May have to do something different in the future, with a table layout.
						totalUnflexedWidth += Math.floor( 1 + childComponent.getOuterWidth( /* includeMargin */ true ) );
						
					} else {
						// Flexed component: push it onto the flexed components processing array for the next step
						flexedComponents.push( childComponent );
						totalFlex += childComponent.flex;
					}
				}
			}
			
			// Now go through and size the other child components based on their flex values and the remaining space.
			if( totalFlex > 0 ) {
				var targetWidth = $targetEl.width(),
				    targetHeight = $targetEl.height(),
				    remainingTargetWidth = targetWidth - totalUnflexedWidth,
				    trimmedPixels = 0;  // Stores the decimal values resulting in the division of the remainingTargetWidth divided by the flex value. 
				                        // The pixels that are trimmed off of each of the child components is added to the last item to fill the extra space.
				
				for( i = 0, len = flexedComponents.length; i < len; i++ ) {
					childComponent = flexedComponents[ i ];
					
					// Now size the flexed component based on the flex value
					var newChildWidth = ( childComponent.flex / totalFlex ) * remainingTargetWidth;
					trimmedPixels += newChildWidth % 1;            // take the decimal value from the child height. Ex: 3.25 % 1 == 0.25  (We'll use this later).
					newChildWidth = Math.floor( newChildWidth );  // and do the actual trimming off of the decimal for the new child height
					
					// If sizing the last component, add in (the smallest whole number of) the decimal value pixels that were trimmed from previous components
					if( i === len - 1 ) {
						newChildWidth += Math.floor( trimmedPixels );
						newChildWidth--;  // and take off a pixel to attempt to fix the accidental browser wrapping issue with sub-pixel widths...
					}
					
					this.sizeComponent( childComponent, newChildWidth, undefined );
				}
			}
			
			if( !this.$clearEl ) {
				this.$clearEl = jQuery( '<div class="jqc-layout-HBox-clear" />' );  // to clear the floats
			}
			$targetEl.append( this.$clearEl );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			if( this.$clearEl ) {
				this.$clearEl.remove();
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the layout type with the jqc.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'hbox', HBoxLayout );
	
	return HBoxLayout;
	
} );

/*global define */
define('jqc/panel/Header', [
	'jqc/Container',
	'jqc/Label',
	'jqc/layout/HBox'
], function( Container, Label ) {
	
	/**
	 * @class jqc.panel.Header
	 * @extends jqc.Container
	 * 
	 * Specialized Container subclass which is used as a {@link jqc.panel.Panel Panel's} header.
	 */
	var PanelHeader = Container.extend( {
		
		/**
		 * @cfg {String} title
		 * 
		 * The title of the Panel, which is placed in the {@link #titleLabel}.
		 */
		
		/**
		 * @cfg {Object/Object[]/jqc.panel.ToolButton/jqc.panel.ToolButton[]} toolButtons
		 * 
		 * One or more {@link jqc.panel.ToolButton ToolButtons} or ToolButton config objects. These will
		 * be placed on the right side of the header.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		layout : 'hbox',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-Panel-Header',
		
		
		/**
		 * @protected
		 * @property {jqc.Label} titleLabel
		 * 
		 * The label component for the title.
		 */
		
		/**
		 * @protected
		 * @property {jqc.Container} toolButtonsCt
		 * 
		 * The Container that holds the {@link #toolButtons}.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this.titleLabel = this.createTitleLabel();
			this.toolButtonsCt = this.createToolButtonsCt();
			
			this.items = this.buildItems();
			
			this._super( arguments );
		},
		
		
		/**
		 * Builds the array of the header's child items.
		 * 
		 * @protected
		 * @return {Object/Object[]} The child item(s).
		 */
		buildItems : function() {
			return [
				this.titleLabel,
				
				{ type: 'component', flex: 1 },  // take up the middle space, to effectively right-align the tool buttons
				
				this.toolButtonsCt
			];
		},
			
			
		/**
		 * Creates the title component. This is the component that the {@link #title}
		 * config will be applied to, by default.
		 * 
		 * @protected
		 * @return {jqc.Label}
		 */
		createTitleLabel : function() {
			return new Label( {
				cls  : this.componentCls + '-title',
				text : this.title
			} );
		},
		
		
		/**
		 * Creates the tool buttons container.
		 * 
		 * @protected
		 * @return {jqc.Container}
		 */
		createToolButtonsCt : function() {
			return new Container( {
				cls         : this.componentCls + '-toolButtons',
				defaultType : 'toolbutton',   // jqc.panel.ToolButton
				items       : this.toolButtons
			} );
		},
		
		
		// ------------------------------------
		
		
		/**
		 * Sets the text in the {@link #titleLabel}.
		 * 
		 * @param {String} title
		 */
		setTitle : function( title ) {
			this.titleLabel.setText( title );
		}
		
	} );
	
	return PanelHeader;
	
} );
/*global define */
define('jqc/button/Button', [
	'jquery',
	'lodash',
	'jqc/Component',
	'jqc/ComponentManager',
	'jqc/template/LoDash'
], function( jQuery, _, Component, ComponentManager, LoDashTpl ) {

	/**
	 * @class jqc.button.Button
	 * @extends jqc.Component
	 * @alias type.button
	 * 
	 * A generic button that calls its {@link #handler} when clicked.
	 */
	var Button = Component.extend( {
		
		/**
		 * @cfg {String} iconCls
		 * 
		 * A CSS class to use for the icon.
		 */
		
		/**
		 * @cfg {String} iconAlign
		 * 
		 * Which side to put the icon on. Accepts 'left' or 'right'.
		 */
		iconAlign : 'left',
		
		/**
		 * @cfg {String} text
		 *  
		 * The text for the button.
		 */
		text : "",
	
		/**
		 * @cfg {String} tooltip
		 * 
		 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
		 * attribute of the button element.
		 */
		tooltip: "",
		
		/**
		 * @cfg {Function} handler
		 * 
		 * A function to run when the button is clicked. Alternatively, one can listen to the {@link #click} event. 
		 */
		
		/**
		 * @cfg {Object} scope
		 * 
		 * The scope to run the {@link #handler} function in. Defaults to the Button object.
		 */
		
		/**
		 * @cfg {Boolean} disabled
		 * 
		 * Set to `true` to have the button be initially disabled.
		 */
		disabled : false,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Button',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		renderTpl : new LoDashTpl( [
			'<span class="<%= baseCls %>-icon <%= baseCls %>-icon-left <%= leftIconElCls %>"></span>',
			'<a id="<%= elId %>-text" class="<%= baseCls %>-text <%= textElCls %>" href="javascript:;" title="<%= tooltip %>">',
				'<%= text %>',
			'</a>',
			'<span class="<%= baseCls %>-icon <%= baseCls %>-icon-right <%= rightIconElCls %>"></span>'
		] ),
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires when the button has been clicked.
				 * 
				 * @event click
				 * @param {jqc.button.Button} button This jqc.Button instance.
				 */
				'click',
				
				/**
				 * Fires when the mouse has entered (hovered over) the button. Equivalent to the jQuery mouseenter event.
				 * 
				 * @event mouseenter
				 * @param {jqc.button.Button} button This jqc.Button instance.
				 */
				'mouseenter',
				
				/**
				 * Fires when the mouse has left (no longer hovered over) the button. Equivalent to the jQuery mouseleave event.
				 * 
				 * @event mouseleave
				 * @param {jqc.button.Button} button This jqc.Button instance.
				 */
				'mouseleave'
			);
			
			this._super( arguments );
		},
		
		
		/**
		 * Override of superclass method used to add the {@link #tooltip} config as the "title" attribute.
		 * 
		 * @protected
		 * @return {Object}
		 */
		getRenderAttributes : function() {
			var attributes = this._super( arguments );
			
			if( this.tooltip ) {
				attributes.title = this.tooltip;
			}
			return attributes;
		},
		
		
		/**
		 * Override of superclass method used to build the {@link #renderTplData} object.
		 * 
		 * @protected
		 * @return {Object}
		 */
		getRenderTplData : function() {
			var leftIconElCls = "",
			    rightIconElCls = "",
			    textElCls = "",
			    iconCls = this.iconCls,
			    hiddenCls = this.baseCls + '-hiddenEl';
			
			if( !iconCls ) {
				leftIconElCls = rightIconElCls = hiddenCls;
			} else if( this.iconAlign === 'left' ) {
				leftIconElCls = iconCls;
				rightIconElCls = hiddenCls;
			} else {
				leftIconElCls = hiddenCls;
				rightIconElCls = iconCls;
			}
			
			return _.defaults( this._super( arguments ), {
				text     : this.text,
				tooltip  : this.tooltip,
				
				leftIconElCls  : leftIconElCls,
				rightIconElCls : rightIconElCls,
				textElCls      : textElCls
			} );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			if( this.disabled ) {
				this.disable();
			}
			
			// Store a reference to the text element
			this.$textEl = jQuery( '#' + this.elId + '-text' );
			
			// Add Event Handlers
			this.$el.on( {
				'mouseenter' : _.bind( this.onMouseEnter, this ),
				'mouseleave' : _.bind( this.onMouseLeave, this ),
				'mousedown'  : _.bind( this.onMouseDown, this ),
				'mouseup'    : _.bind( this.onMouseUp, this ),
				'click'      : _.bind( this.onClick, this )
			} );
		},
		
		
		/**
		 * Sets the text on the button. Accepts HTML as well.
		 * 
		 * @param {String} text
		 */
		setText : function( text ) {
			this.text = text;
			
			if( this.rendered ) {
				this.$textEl.html( text );
			}
		},
		
		
		/**
		 * Disables the button.
		 * 
		 * @method disable
		 */
		disable : function() {
			this.disabled = true;
			
			if( this.rendered ) {
				this.$el.prop( 'disabled', true );
			}
		},
		
		
		/**
		 * Enables the button (if it was previously {@link #disable disabled}).
		 * 
		 * @method enable
		 */
		enable : function() {
			this.disabled = false;
			
			if( this.rendered ) {
				this.$el.prop( 'disabled', false );
			}
		},
		
		
		/**
		 * Sets the disabled/enabled state of the Button based on the provided `disabled` flag.
		 * 
		 * @param {Boolean} disabled True to disable the Button, false to enable the Button.
		 */
		setDisabled : function( disabled ) {
			this[ disabled ? 'disable' : 'enable' ]();
		},
		
		
		/**
		 * Handles a click to the Button.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onClick : function( evt ) {
			if( this.handler ) {
				this.handler.call( this.scope || this, this );  // run the handler in the scope of this Button if no scope config was provided, and provide this button instasnce as the first arg
			}
			
			this.fireEvent( 'click', this );
		},
		
		
		/**
		 * Method that is run when mouse hovers over the Button.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onMouseEnter : function() {
			this.addCls( this.baseCls + '-hover' );
			
			this.fireEvent( 'mouseenter', this );
		},
		
		
		/**
		 * Method that is run when mouse un-hovers the Button.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onMouseLeave : function() {
			this.removeCls( this.baseCls + '-hover' );
			
			this.fireEvent( 'mouseleave', this );
		},
		
		
		/**
		 * Method that is run when mouse is pressed down on the Button.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onMouseDown : function() {
			this.addCls( this.baseCls + '-active' );
		},
		
		
		/**
		 * Method that is run when mouse is release on the Button.
		 * 
		 * @protected
		 * @param {jQuery.Event} evt
		 */
		onMouseUp : function() {
			this.removeCls( this.baseCls + '-active' );
		}
		
	} );
	
	
	ComponentManager.registerType( 'button', Button );
	
	return Button;
	
} );

/*global define */
define('jqc/panel/ToolButton', [
	'jqc/button/Button',
	'jqc/ComponentManager'
], function( Button, ComponentManager ) {
	
	/**
	 * @class jqc.panel.ToolButton
	 * @extends jqc.button.Button
	 * @alias type.toolbutton
	 * 
	 * Small utility class for a button that can be used in a {@link jqc.panel.Panel Panel's} header.
	 */
	var ToolButton = Button.extend( {
		
		/**
		 * @cfg {String} toolType (required)
		 * 
		 * The tool button type. Currently accepts the strings:
		 * 
		 * - close
		 * - closethick
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-ToolButton',
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// <debug>
			if( !this.toolType ) throw new Error( "'toolType' cfg required" );
			// </debug>
			
			var componentCls = this.componentCls,
			    toolType = this.toolType;
			
			this.iconCls = [
				'jqc-icon',
				'jqc-icon-' + toolType,
				componentCls + '-icon',
				componentCls + '-icon-' + toolType
			].join( " " );
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'toolbutton', ToolButton );
	
	return ToolButton;
	
} );
/*global define */
define('jqc/panel/Panel', [
	'jquery',
	'lodash',
	'jqc/util/Css',
	'jqc/ComponentManager',
	'jqc/Container',
	'jqc/panel/Header',
	'jqc/template/LoDash',
	'jqc/panel/ToolButton'   // for instantiating ToolButtons based on the toolButtons config
], function( jQuery, _, Css, ComponentManager, Container, PanelHeader, LoDashTpl ) {

	/**
	 * @class jqc.panel.Panel
	 * @extends jqc.Container
	 * @alias type.panel
	 *
	 * An application-oriented {@link jqc.Container} subclass which supports adding a {@link #title} bar and 
	 * {@link #toolButtons}.
	 */
	var Panel = Container.extend( {
		
		/**
		 * @cfg {Object} bodyStyle
		 * 
		 * Any additional CSS style(s) to apply to the Panel's {@link #$bodyEl body} element. Should be an object where the 
		 * keys are the CSS property names, and the values are the CSS values. Ex:
		 * 
		 *     bodyStyle : {
		 *         'padding'    : '5px',
		 *         'border-top' : '1px solid #000'
		 *     }
		 */
		
		/**
		 * @cfg {String} title
		 * 
		 * The title of the Panel.
		 */
		title : "",
		
		/**
		 * @cfg {Object/Object[]/jqc.panel.ToolButton/jqc.panel.ToolButton[]} toolButtons
		 * 
		 * One or more {@link jqc.panel.ToolButton ToolButtons} or ToolButton config objects. These will
		 * be placed on the right side of the Panel's header (i.e. top right of the Panel).
		 */
		
		/**
		 * @cfg {Object/Object[]/jqc.button.Button/jqc.button.Button[]} buttons
		 * 
		 * One or more {@link jqc.button.Button Buttons} or Button config objects for buttons to place
		 * in the footer of the Panel. These will be placed on the right side of the Panel's footer 
		 * (i.e. bottom right of the Panel).
		 */
		
		/**
		 * @cfg {Boolean} headerHidden
		 * 
		 * `true` to initially hide the Panel's {@link #header}. Can be shown using {@link #showHeader}. 
		 */
		
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Panel',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		renderTpl : new LoDashTpl( [
			'<div id="<%= elId %>-body" class="<%= baseCls %>-body" <% if( bodyStyle ) { %>style="<%= bodyStyle %>"<% } %>></div>'
		] ),
		
		
		/**
		 * @protected
		 * @property {jQuery} $bodyEl
		 * 
		 * A reference to the Panel's body element. This will be available after the Panel is rendered.
		 */
		
		/**
		 * @protected
		 * @property {jqc.Container} header
		 * 
		 * The Container which acts as the Panel's header. The header holds the {@link #title}, and any {@link #toolButtons} 
		 * specified. 
		 * 
		 * Note that this Container is only created if a {@link #title} or {@link #toolButtons} have been specified.
		 */
		
		/**
		 * @protected
		 * @property {jqc.Container} footer
		 * 
		 * The Container which acts as the Panel's footer. The footer holds the any {@link #buttons} specified. 
		 * 
		 * Note that this Container is only created if a {@link #buttons} config has been specified.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {		
			this._super( arguments );
			
			if( this.title || this.toolButtons ) {
				this.doCreateHeader();
			}
			if( this.buttons ) {
				this.doCreateFooter();
			}
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.$bodyEl = jQuery( '#' + this.elId + '-body' );
			
			if( this.header ) {
				this.header.render( this.$el, 0 );  // prepend before the body
			}
			if( this.footer ) {
				this.footer.render( this.$el );  // append after the body
			}
		},
		
		
		/**
		 * @inheritdoc
		 */
		getRenderTplData : function() {
			var bodyStyle = Css.mapToString( this.bodyStyle || {} );
			
			return _.assign( this._super( arguments ), {
				bodyStyle : bodyStyle
			} );
		},
		
		
		/**
		 * Override of superclass method, used to specify the {@link #$bodyEl} as the target for Panel content.
		 * 
		 * @protected
		 * @return {jQuery}
		 */
		getContentTarget : function() {
			return this.$bodyEl;  // created when rendered
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * Performs the creation of the {@link #header}, by calling {@link #createHeader}, and then applying 
		 * any post-processing required (which includes rendering it as the first element in the Panel
		 * itself if it is already rendered).
		 * 
		 * To create a different {@link #header} in a subclass, override {@link #createHeader} instead of this 
		 * method.
		 * 
		 * @protected
		 */
		doCreateHeader : function() {
			this.header = this.createHeader();
			this.header.setVisible( !this.headerHidden );
			delete this.headerHidden;
			
			if( this.rendered ) {
				this.header.render( this.$el, /* prepend */ 0 );  // prepend to make it the first element (i.e. before the body)
			}
		},
		
		
		/**
		 * Creates the {@link #header}, which contains the {@link #title} and any {@link #toolButtons} configured.
		 * 
		 * @protected
		 * @return {jqc.panel.Header}
		 */
		createHeader : function() {
			return new PanelHeader( {
				title       : this.title,
				toolButtons : this.toolButtons
			} );
		},
		
		
		/**
		 * Performs the creation of the {@link #footer}, by calling {@link #createFooter}, and then applying 
		 * any post-processing required (which includes rendering it as the last element in the Panel
		 * itself if it is already rendered).
		 * 
		 * To create a different {@link #header} in a subclass, override {@link #createHeader} instead of this 
		 * method.
		 * 
		 * @protected
		 */
		doCreateFooter : function() {
			this.footer = this.createFooter();
			
			if( this.rendered ) {
				this.footer.render( this.$el );  // append to make it the last element (i.e. after the body)
			}
		},
		
		
		/**
		 * Creates the {@link #footer} Container, which contains any {@link #buttons} that were configured.
		 * 
		 * @protected
		 * @return {jqc.Container}
		 */
		createFooter : function() {
			return new Container( {
				cls    : this.baseCls + '-Footer',
				layout : 'hbox',
				
				items  : [
					{ type: 'component', flex: 1 },  // to push the buttons to the right
					{
						type : 'container',
						cls  : this.baseCls + '-Footer-buttons',
						
						defaultType : 'button',   // jqc.button.Button
						items       : this.buttons
					}
				]
			} );
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Sets the title of the Panel.
		 * 
		 * @param {String} title The title to set.
		 * @chainable
		 */
		setTitle : function( title ) {
			if( !this.header ) {
				this.doCreateHeader();
			}
			
			this.title = title;
			this.header.setTitle( title );
			
			return this;
		},
		
		
		/**
		 * Retrieves the {@link #title} of the Panel.
		 * 
		 * @return {String} The title of the Panel.
		 */
		getTitle : function() {
			return this.title;
		},
		
		
		/**
		 * Shows the Panel's {@link #header}, if it is currently hidden.
		 * 
		 * @chainable
		 */
		showHeader : function() {
			if( this.header ) {
				this.header.show();
			} else {
				this.headerHidden = false;  // in case the header hasn't been created yet, we'll use this for when it is
			}
			
			return this;
		},
		
		
		/**
		 * Hides the Panel's {@link #header}, if it is currently visible.
		 * 
		 * @chainable
		 */
		hideHeader : function() {
			if( this.header ) {
				this.header.hide();
			} else {
				this.headerHidden = true;  // in case the header hasn't been created yet, we'll use this for when it is
			}
			
			return this;
		}
		
	} );
	
	
	ComponentManager.registerType( 'panel', Panel );
	
	return Panel;
	
} );
/*global define */
define('jqc/Overlay', [
	'jquery',
	'lodash',
	'Class',
	'jqc/Jqc',
	'jqc/anim/Animation',
	'jqc/Component',
	'jqc/panel/Panel',
	'jquery-ui.position'  // jQuery UI's `position` plugin
], function( jQuery, _, Class, Jqc, Animation, Component, Panel ) {
	
	/**
	 * @abstract
	 * @class jqc.Overlay
	 * @extends jqc.panel.Panel
	 *
	 * Base class for UI elements that "float" on top of the document (most notably: {@link jqc.window.Window}).
	 * This can be positioned by {@link #x} and {@link #y} values, or positioned relative to other elements using the 
	 * {@link #anchor} config.
	 */
	var Overlay = Panel.extend( {
		abstractClass : true,
		
		
		/**
		 * @cfg {Boolean} autoShow
		 * 
		 * Set to `true` to automatically show the Overlay when it is instantiated. If false, a call to {@link #method-show} is
		 * required to show the overlay.
		 */
		autoShow : false,
		
		/**
		 * @cfg {Object} showAnim
		 * 
		 * A {@link jqc.anim.Animation} configuration object to animate the "show" transition. You do not need to specify
		 * the {@link jqc.anim.Animation#target} parameter however, as it will be set to this Overlay.
		 * 
		 * This config is to provide a default animation that the Overlay always shows with. If the animation is to be
		 * different for different calls to {@link #method-show}, one may supply the animation config in the `anim` option
		 * to the {@link #method-show} method. Note that an `anim` option provided to the {@link #method-show} method 
		 * always overrides this config for that call.
		 */
		
		/**
		 * @cfg {Object} hideAnim
		 * 
		 * A {@link jqc.anim.Animation} configuration object to animate the "hide" transition. You do not need to specify
		 * the {@link jqc.anim.Animation#target} parameter however, as it will be set to this Overlay.
		 * 
		 * This config is to provide a default animation that the Overlay always hides with. If the animation is to be
		 * different for different calls to {@link #method-hide}, one may supply the animation config in the `anim` option
		 * to the {@link #method-hide} method. Note that an `anim` option provided to the {@link #method-hide} method 
		 * always overrides this config for that call
		 * 
		 * This config is especially useful with the {@link jqc.window.Window#closeOnEscape} config of the
		 * {@link jqc.window.Window Window} subclass, as the call to the {@link #method-hide} method is made behind the scenes 
		 * in this case.
		 */
	
	
	
		// Positioning Configs
	
		/**
		 * @cfg {Object} anchor
		 * An anchoring configuration object, to anchor the overlay to another element on the page.
		 * This is an object with the following properties:
		 *
		 * @cfg {String} anchor.my
		 *   Where on the overlay itself to position against the target `element`. Accepts a string in the
		 *   form of "horizontal vertical". A single value such as "right" will default to "right center", "top"
		 *   will default to "center top" (following CSS convention). Acceptable values: "top", "center", "bottom",
		 *   "left", "right". Example: "left top" or "center center".  So, if "left top", the top left of the overlay
		 *   will be positioned to the target `element`. Defaults to "left top".
		 *
		 * @cfg {String} anchor.at
		 *   Where at the target `element` the overlay should be positioned against. Accepts a string in the
		 *   form of "horizontal vertical". A single value such as "right" will default to "right center", "top"
		 *   will default to "center top" (following CSS convention). Acceptable values: "top", "center", "bottom",
		 *   "left", "right". Example: "left top" or "center center".  So, if "left bottom", the overlay will be
		 *   positioned against the bottom left of the target `element`. Defaults to "left bottom".
		 *
		 * @cfg {HTMLElement/jQuery/jqc.Component} anchor.of
		 *   The HTMLElement or {@link jqc.Component} to anchor the overlay to. Can either be defined as either "of" (following
		 *   jQuery UI) or "element". Required unless the `element` property is provided.
		 *
		 * @cfg {HTMLElement/jQuery/jqc.Component} [anchor.element]
		 *   Synonym of `of` property, which may replace it where it makes more sense in calling code.
		 *
		 * @cfg {String} [anchor.offset]
		 *   Adds these left-top values to the calculated position. Ex: "50 50" (left top). A single value
		 *   given in the string will apply to both left and top values.
		 *
		 * @cfg {String} [anchor.collision]
		 *   When the positioned element overflows the window in some direction, move it to an alternative position. Similar to `my` and `at`,
		 *   this accepts a single value or a pair for horizontal/vertical, eg. "flip", "fit", "fit flip", "fit none". Defaults to 'flip'.
		 *
		 *   - __flip__: (the default) to the opposite side and the collision detection is run again to see if it will fit. If it won't fit in either position, the center option should be used as a fall back.
		 *   - __fit__: so the element keeps in the desired direction, but is re-positioned so it fits.
		 *   - __flipfit__: first flips, then tries to fit as much as possible on the screen.
		 *   - __none__: do not do collision detection.
		 */
	
		/**
		 * @cfg {Number/String} x
		 * 
		 * The initial x position of the Overlay. This can be a number defining how many pixels from the left of the screen,
		 * or one of the strings that the jQuery UI Positioning plugin accepts ('center', 'left', 'right', 'top', 'bottom').
		 * This can also be a negative integer, in which case it will be taken as the number of pixels from the right side of
		 * the screen. Ex: A value of -50 will position the right side of the Overlay 50px from the right side of the screen.
		 *
		 * Note that this config will not be used if {@link #anchor} is provided.
		 */
	
		/**
		 * @cfg {Number/String} y
		 * 
		 * The initial y position of the Overlay. This can be a number defining how many pixels from the top of the screen,
		 * or one of the strings that the jQuery UI Positioning plugin accepts ('center', 'left', 'right', 'top', 'bottom').
		 * This can also be a negative integer, in which case it will be taken as the number of pixels from the bottom of
		 * the screen. Ex: A value of -50 will position the bottom of the Overlay 50px from the bottom of the screen.
		 *
		 * Note that this config will not be used if {@link #anchor} is provided.
		 */
		
		/**
		 * @cfg {Boolean} constrainToViewport
		 * 
		 * When using {@link #x}/{@link #y} positioning, this config makes sure that the Overlay is constrained to be in the 
		 * viewable area of the browser's viewport (at least as much as possible).
		 */
		constrainToViewport : true,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Overlay',
		
		/**
		 * @hide
		 * @cfg {jQuery/HTMLElement} renderTo
		 * 
		 * This config should not be specified for this subclass. The Overlay will
		 * automatically be rendered into the document body when it is opened.
		 */
		
		
		/**
		 * @protected
		 * @property {jQuery} $contentContainer
		 * 
		 * The inner overlay container, where either content HTML or child {@link jqc.Component Components} are added.
		 */
	
		/**
		 * @private
		 * @property {Function} windowResizeHandler
		 * 
		 * The scope wrapped function for handling window resizes (which calls the method to resize the overlay accordingly).
		 * This is needed as a property so that we can unbind the window's resize event from the Overlay when the Overlay
		 * is destroyed.
		 */
	
	
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// Call superclass initComponent
			this._super( arguments );
			
			// Overlays are always hidden to start, as they rely on the show() logic to be properly shown w/ a position and size
			this.hidden = true;
	
			// If the autoShow config has been set to true, show the overlay immediately
			if( this.autoShow ) {
				this.show();
			}
		},
	
	
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );			
			
			// Set up an event handler for the window's resize event, to re-size and re-position the overlay based on the
			// new viewport's size.  The handler for this event is "debounced" just a little, so that the many resize events
			// that are fired while a window is being dragged don't cause the resize calculations to run each and every time.
			// Need to store the resize handler itself so that we can unbind it in the destroy() method when the Overlay is 
			// destroyed.
			this.windowResizeHandler = _.debounce( _.bind( this.onWindowResize, this ), 150 );
			jQuery( window ).on( 'resize', this.windowResizeHandler );
		},
	
	
		// -----------------------------------------
	
		
		/**
		 * Shows the Overlay, rendering it if it has not yet been rendered. This method inherits all of the `options` of
		 * its superclass method, and adds Overlay-specific ones as well.
		 *
		 * @param {Object} [options] An object which may contain the following properties, in addition to the options available
		 *   from its superclass. Note that providing any options that are configs as well will overwrite those configs of the same 
		 *   name.
		 * @param {Object} [options.anchor] An {@link #anchor} config to set on the call to open. Note that subsequent calls to
		 *   open() will use this config unless changed by a call to {@link #setAnchor}.
		 * @param {Number/String} [options.x] An {@link #x} config to set on the call to open. Note that subsequent calls to open()
		 *   will use this config unless changed by a call to {@link #setPosition}. See {@link #x} for more details. Note that
		 *   providing an `anchor` will override this value.
		 * @param {Number/String} [options.y] A {@link #y} config to set on the call to open. Note that subsequent calls to open()
		 *   will use this config unless changed by a call to {@link #setPosition}.  See {@link #y} for more details. Note that
		 *   providing an `anchor` will override this value.
		 * @param {Object/Boolean} [options.anim] An {@link jqc.anim.Animation Animation} config object (minus the 
		 *   {@link jqc.anim.Animation#target target} property) for animating the showing of the Overlay. If this is not provided,
		 *   it defaults to using the {@link #showAnim} config.
		 *   
		 *   This property may also be set to the boolean `false` to prevent the {@link #showAnim} from running on this call to 
		 *   `show`. (`true` will allow the {@link #showAnim} to run as usual.) If set to a config object, the config object will only
		 *   be used for this call to `show` only. It does not overwrite the {@link #showAnim} config.
		 */
		show : function( options ) {
			options = options || {};
			
			var anim = options.anim;
			if( anim === false ) {
				delete options.anim;
			} else if( anim === undefined || anim === true ) {
				options.anim = this.showAnim;
			}
			
			// If the overlay has not been rendered yet, render it now to the document body
			if( !this.rendered ) {
				this.render( document.body );
			}
			
			this._super( [ options ] );
		},
		
		
		/**
		 * Implementation of hook method from superclass, which positions the Overlay, and updates any configs
		 * provided in the `options` object to {@link #method-show}.
		 * 
		 * @protected
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onShow : function( options ) {
			this._super( arguments );
			
			// Position the overlay now that it is shown. If new positioning information was provided, use that.
			// Otherwise, position based on the last set values.
			if( options.anchor ) {
				this.setAnchor( options.anchor );

			} else if( options.hasOwnProperty( 'x' ) || options.hasOwnProperty( 'y' ) ) {
				var x = ( typeof options.x !== 'undefined' ) ? options.x : this.x;  // if one was provided, but not the other,
				var y = ( typeof options.y !== 'undefined' ) ? options.y : this.y;  // use the current value for the other
				this.setPosition( x, y );

			} else {
				// No new `anchor` or x/y configs provided in the call to this method, position the Overlay based on any 
				// pre-configured values
				this.updatePosition();
			}
		},
		
		
		/**
		 * Sets the position of the Overlay (more specifically, the {@link #x} and {@link #y} configs), and refreshes the Overlay's
		 * position (if it is currently open). Note: by running this method, any {@link #anchor} config is nulled out.
		 *
		 * @param {Number/String} x The new x position of the Overlay. See the {@link #x} config for details.
		 * @param {Number/String} y The new y position of the Overlay. See the {@link #y} config for details.
		 */
		setPosition : function( x, y ) {
			// Store the variables in case the dialog is not yet open, and for later use if the browser window is resized.
			// (This is mainly needed for when this method is called externally, and not from within the Overlay.)
			this.x = x;
			this.y = y;
	
			// Make sure there is no 'anchor' if we want x/y positioning
			this.anchor = null;
	
			this.updatePosition();
		},
		
	
		/**
		 * Retrieves the position of the Overlay. This can only be retrieved if the Overlay is currently {@link #isVisible visible}. 
		 * If the Overlay is not visible, all values will be 0.
		 * 
		 * @return {Object} An object with the following properties:
		 * @return {Number} return.x The position of the left side of the dialog, relative to the left side of the screen. Same as `left`.
		 * @return {Number} return.y The position of the top of the dialog, relative to the top of the screen. Same as `top`.
		 * @return {Number} return.left The position of the left side of the dialog, relative to the left side of the screen. Same as `x`.
		 * @return {Number} return.top The position of the left side of the dialog, relative to the left side of the screen. Same as `y`.
		 * @return {Number} return.right The position of the right side of the dialog, relative to the right side of the screen.
		 * @return {Number} return.bottom The position of the bottom of the dialog, relative to the bottom of the screen.
		 */
		getPosition : function() {
			if( this.isHidden() ) {
				return {
					x      : 0,
					y      : 0,
					left   : 0,
					top    : 0,
					right  : 0,
					bottom : 0
				};
				
			} else {
				var $window  = jQuery( window ),
				    position = this.$el.position(),
				    left     = position.left,
				    top      = position.top,
				    right    = $window.width() - ( position.left + this.getWidth() ),
				    bottom   = $window.height() - ( position.top + this.getHeight() );
				
				return {
					x      : left,
					y      : top,
					left   : left,
					top    : top,
					right  : right,
					bottom : bottom
				};
			}
		},
	
	
		/**
		 * Sets the {@link #anchor} config, and refreshes the Overlay's position (if it is currently open).
		 *
		 * @param {Object} anchor See the {@link #anchor} config for details.
		 */
		setAnchor : function( anchor ) {
			this.anchor = anchor;
			this.updatePosition();
		},
	
	
		/**
		 * Resets the position of the Overlay to match the {@link #anchor} config if one exists, or otherwise uses the
		 * {@link #x} and {@link #y} configs.
		 *
		 * @protected
		 */
		updatePosition : function() {
			if( this.isVisible() ) {
				var my, at, of, collision,
				    $el = this.$el;
	
				if( this.anchor ) {
					// Anchor config provided, or set with setAnchor(), use that
					var anchor = this.anchor,
					    offset = anchor.offset;  // to support legacy config
					
					my = anchor.my || 'left top';
					at = anchor.at || 'left bottom';
					
					if( offset ) {
						// The new jQuery UI Position plugin does not accept an 'offset' option. Instead, it expects
						// the offsets to be placed inline with the 'my' option. Example `my`: "left+100 top+200"
						my = my.split( /\s+/ );
						offset = offset.split( /\s+/ ); 
						
						my[ 0 ] += '+' + offset[ 0 ];
						my[ 1 ] += '+' + offset[ 1 ] || offset[ 0 ];  // if there is no second value, use the first value again
						my = my.join( " " );  // rejoin with a space, to separate the horizontal/vertical values
					}
					
					of = anchor.element || anchor.of;  // accept either 'element' or 'of' from the anchor config
					collision = anchor.collision || 'flip';  // even though this seems to be the default 'collision' value in jQuery UI, we need this default value for a later if statement to check if 'flip' was used (as a short circuit to checking the classes on the element itself)
	
					// Handle the anchor element being a jqc.Component, by grabbing the Component's DOM element
					if( of instanceof Component ) {
						of = of.getEl();
					}
	
				} else {
					// no 'anchor' config provided, use x/y relative to the window
					var x = this.x,
					    y = this.y,
					    xSide = x,  // default these to the values of the 'x' and 'y' configs, in the case that
					    ySide = y,  // they are strings. They will be overwritten with side+offset if numbers
					    atXSide = 'center',
					    atYSide = 'center';
					
					if( typeof x === 'number' ) {
					    xSide = ( x > 0 ? 'left' : 'right' ) + '+' + x;  // Position from right if this.x < 0. Forms a string like: "left+100"
					    atXSide = 'left';
					}
					if( typeof y === 'number' ) {
					    ySide = ( y > 0 ? 'top' : 'bottom' ) + '+' + y;  // Position from bottom if this.y < 0. Forms a string like: "top+100"
					    atYSide = 'top';
					}
					
					my = xSide + ' ' + ySide;      // forms a string like: "left+200 top+100" or "center center"
					at = atXSide + ' ' + atYSide;  // forms a string like: "center center" or "left top"
					of = window;
					
					if( this.constrainToViewport ) {
						collision = 'fit';
					}
				}
				
				// Position the Overlay
				$el.position( {
					my: my,
					at: at,
					of: of,
					collision: collision
				} );
			}
		},
	
	
		/**
		 * Event handler for the browser window's resize event, in which the Overlay is re-positioned.
		 *
		 * @protected
		 */
		onWindowResize : function() {
			this.updatePosition();
		},
		
		
		// -----------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			// Unbind our window resize handler, but only if it's rendered, as the windowResizeHandler is set up in onRender(). 
			// Otherwise, if the windowResizeHandler is undefined when we call unbind, we'd end up unbinding *all* window resize handlers!)
			if( this.rendered ) {
				jQuery( window ).off( 'resize', this.windowResizeHandler );
			}
	
			this._super( arguments );
		}
	
	} );
	
	return Overlay;

} );
/*global define */
define('jqc/layout/Fit', [
	'Class',
	'jqc/Component',
	'jqc/Container',
	'jqc/layout/Layout'
], function( Class, Component, Container, Layout ) {

	/**
	 * @class jqc.layout.Fit
	 * @extends jqc.layout.Layout
	 * @alias layout.fit
	 * 
	 * A layout that renders a {@link jqc.Container Container's} child component to full height and width of the container. 
	 * A FitLayout only renders the first {@link jqc.Container#items child component} of a {@link jqc.Container Container}.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'fit'.
	 */
	var FitLayout = Layout.extend( {
		
		/**
		 * @cfg {Boolean} browserManagedWidth
		 * True to have the FitLayout simply set width: 100% to size the width, false to use the exact pixel
		 * size of the $targetEl element.
		 */
		browserManagedWidth : false,
		
		/**
		 * @cfg {Boolean} browserManagedHeight
		 * True to have the FitLayout simply set height: 100% to size the height, false to use the exact pixel
		 * size of the $targetEl element.
		 */
		browserManagedHeight : false,
		
		
		/**
		 * @protected
		 * @property {jqc.Component} lastRenderedComponent
		 * 
		 * Keeps track of the last component that was rendered by the FitLayout. This has to do with caching
		 * the size (stored by {@link #lastRenderedSize}). We don't want to cache the size of another component
		 * that is no longer being shown by the FitLayout. 
		 */
		lastRenderedComponent : null,
		
		/**
		 * @protected
		 * @property {Object} lastRenderedSize
		 * 
		 * A hashmap of `width` and `height` properties that holds the last size that the {@link #lastRenderedComponent}
		 * was set to.
		 */
		
	
		/**
		 * Implementation of the FitLayout, which sizes the {@link #container container's} first {@link jqc.Container#items child component}
		 * to be the full height and width of the {@link #container container's} element.
		 * 
		 * @protected
		 * @method onLayout
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {
			this._super( arguments );
			
			var numChildComponents = childComponents.length;
			
			// Now render the child Component
			if( numChildComponents > 0 ) {
				var childComponent = childComponents[ 0 ],
				    targetWidth = ( this.browserManagedWidth ) ? '100%' : $targetEl.width(),
				    targetHeight = ( this.browserManagedHeight ) ? '100%' : $targetEl.height();
				
				// Detach all other child Components in the Container, just in case they are rendered into the $targetEl from another layout run,
				// or the components have been reordered in the container
				for( var i = 1; i < numChildComponents; i++ ) {
					childComponents[ i ].detach();
				}
				
				// Render the component (note: it will only be rendered if it is not yet rendered, or is not a child of the $targetEl)
				this.renderComponent( childComponent, $targetEl );
				
				if( childComponent !== this.lastRenderedComponent ) {
					this.lastRenderedSize = {};  // clear the results of the last rendered size, from any other component that was rendered by the layout, now that we have a new component being rendered / laid out
					this.lastRenderedComponent = childComponent;
				}
				
				// We can now size it, since it has been rendered. (sizeComponent needs to calculate the margin/padding/border on the child component)
				// Only size it if need be, however.
				var lastRenderedSize = this.lastRenderedSize;
				if( targetWidth !== lastRenderedSize.width || targetHeight !== lastRenderedSize.height ) {
					this.sizeComponent( childComponent, targetWidth, targetHeight );
					
					this.lastRenderedSize = { width: targetWidth, height: targetHeight };
				}
			}
		}
		
	} );
	
	
	// Register the layout type with the jqc.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'fit', FitLayout );

	return FitLayout;
	
} );
/*global define */
define('jqc/Viewport', [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/Container',
	'jqc/layout/Fit'  // used by layout 'type'
], function( jQuery, _, ComponentManager, Container ) {

	/**
	 * @class jqc.Viewport
	 * @extends jqc.Container
	 * @alias type.viewport
	 *  
	 * A special {@link jqc.Container Container} which keeps itself at the size of its parent element, and responds to window resizes
	 * to re-layout its child {@link jqc.Component Components}.
	 * 
	 * Ideally, there should only be one Viewport on a page, and it should automatically be rendered into the document body.
	 * However, until everything uses the UI framework, this is used on an individual basis in some areas. 
	 * 
	 * Note that a Viewport should not contain another Viewport though. A set of parent/child relationships should end at the
	 * top with a Viewport, and all children should simply be {@link jqc.Container Containers}. If they need to be sized to 100% height/width,
	 * their parent {@link jqc.Container Container} should be configured with a {@link jqc.layout.Fit FitLayout}.
	 */
	var Viewport = Container.extend( {
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		layout : 'fit',
		
		
		/**
		 * @private
		 * @property {Function} onWindowResizeDelegate
		 * 
		 * The delegate function which is a handler of the window resize event. This reference must
		 * be stored so that it can be unbound when the Viewport is destroyed.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			this.setStyle( {
				'position'   : 'relative',
				'overflow-x' : 'hidden',
				'overflow-y' : 'auto'
			} );
			
			this.onWindowResizeDelegate = _.debounce( _.bind( this.onWindowResize, this ), 150 );
			jQuery( window ).bind( 'resize', this.onWindowResizeDelegate );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.recalcDimensions();
		},
		
		
		/**
		 * Recalculates and sets the dimensions of the Viewport to the size of its parent element.
		 * 
		 * @private
		 */
		recalcDimensions : function() {
			if( this.rendered ) {
				var $el = this.$el,
				    $parent = $el.parent();
				    
				$el.css( {
					//width: $parent.width(),  -- let width be handled by the browser
					height: $parent.height()
				} );
			}
		},
		
		
		/**
		 * Handler for when the window is resized. Re-calculates the dimensions of the Viewport,
		 * and runs {@link #doLayout}.
		 * 
		 * @protected
		 */
		onWindowResize : function() {
			if( !this.destroyed ) {  // just in case the viewport has been destroyed, but a window resize had previously been deferred
				this.doResize();
			}
		},
		
		
		/**
		 * Performs a resize of the Viewport and a layout of its {@link #childComponents} in response to the buffered
		 * window resize task.
		 * 
		 * @protected
		 * @method doResize
		 */
		doResize : function() {
			this.recalcDimensions();
			this.doLayout();
		},
		
		
		// -----------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			jQuery( window ).unbind( 'resize', this.onWindowResizeDelegate );
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the class so it can be created by the type string 'viewport'
	ComponentManager.registerType( 'viewport', Viewport );
	
	return Viewport;
	
} );
/*global define */
define('jqc/app/EventBus', [
	'lodash',
	'Class',
	'jqc/Component'
], function( _, Class, Component ) {
	
	/**
	 * @class jqc.app.EventBus
	 * @extends Object
	 * @singleton
	 * 
	 * Singleton class which allows any subscriber to listen to all events from all {@link jqc.Component Component}
	 * instances (including {@link jqc.Component Component} subclass instances).
	 */
	var EventBus = new Class( {
		
		/**
		 * @protected
		 * @property {Object[]} callbacks
		 * 
		 * An array of Objects (maps), each of which have properties `callback` and `scope`. Callbacks are subscribed
		 * using the {@link #subscribe} method.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} fireEventPatched
		 * 
		 * Flag which is set to `true` once Observable's {@link Observable#fireEvent fireEvent} method has been wrapped in an
		 * interceptor function on {@link jqc.Component Component's} prototype, which provides the hook to be able to listen
		 * for all Component events.
		 * 
		 * Without this, we would need to subscribe an 'all' event listener to every instantiated component, and then remove that 
		 * listener when the components are {@link jqc.Component#method-destroy destroyed}. This would really just be extra processing 
		 * and memory usage.
		 */
		fireEventPatched : false,
		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			this.callbacks = [];
		},
		
		
		/**
		 * Subscribes a callback to all events from all components. The callback is provided the following arguments:
		 * 
		 * - component ({@link jqc.Component}) : The Component that fired the event.
		 * - eventName (String) : The name of the event that was fired.
		 * - fireEventArgs (Mixed[]) : The array of arguments that were passed to the original {@link Observable#fireEvent fireEvent}
		 *   call. This does not include the event name.
		 * 
		 * For example:
		 * 
		 *     var handlerFn = function( component, eventName ) {
		 *         console.log( "Component " + component.getId() + " fired the event '" + eventName + 
		 *             "' with args: ", Array.prototype.slice.call( arguments, 2 ) );
		 *     };
		 * 
		 *     EventBus.subscribe( handlerFn );
		 * 
		 * 
		 * @param {Function} callback The callback function to subscribe.
		 * @param {Object} [scope=window] The scope (`this` reference) to call the `callback` in.
		 */
		subscribe : function( callback, scope ) {
			this.patchFireEvent();  // only patches if it isn't already patched
			
			if( this.findCallback( callback, scope ) === -1 ) {
				this.callbacks.push( { callback: callback, scope: scope } );
			}
		},
		
		
		/**
		 * Unsubscribes a callback subscribed with {@link #subscribe}.
		 * 
		 * @param {Function} callback The callback function to unsubscribe.
		 * @param {Object} [scope=window] The scope (`this` reference) which the `callback` was set to be called with.
		 */
		unsubscribe : function( callback, scope ) {
			var callbackIdx = this.findCallback( callback, scope );
			if( callbackIdx !== -1 ) {
				this.callbacks.splice( callbackIdx, 1 );
			}
		},
		
		
		/**
		 * Finds the index of the provided `callback` and `scope` in the {@link #callbacks} array. If none exists,
		 * returns -1.
		 * 
		 * @protected
		 * @param {Function} callback The callback to look for.
		 * @param {Object} scope The scope that the callback is attached to.
		 * @return {Number} The index in the {@link #callbacks} array, or -1 for "not found".
		 */
		findCallback : function( callback, scope ) {
			return _.findIndex( this.callbacks, function( cbObj ) { return ( cbObj.callback === callback && cbObj.scope === scope ); } );
		},
		
		
		/**
		 * Handles an event being fired on a {@link jqc.Component}, by dispatching the event to all subscribed callbacks.
		 * The arguments that are passed to the callback are documented in {@link #subscribe}.
		 * 
		 * @protected
		 * @param {jqc.Component} component The Component that fired the event.
		 * @param {String} eventName The event name that was fired.
		 * @param {Mixed[]} fireEventArgs The arguments provided to the original {@link Observable#fireEvent fireEvent} call.
		 *   This does not include the event name.
		 */
		dispatchEvent : function( component, eventName, fireEventArgs ) {
			var callbackObjs = this.callbacks,
			    ret;
			
			for( var i = 0, len = callbackObjs.length; i < len; i++ ) {
				var callResult = callbackObjs[ i ].callback.call( callbackObjs[ i ].scope, component, eventName, fireEventArgs );
				if( callResult === false )
					ret = false;
			}
			
			return ret;
		},
		
		
		/**
		 * Patches Observable's {@link Observable#fireEvent fireEvent} method on {@link jqc.Component Component's} prototype, using
		 * an interceptor function which provides the hook to be able to listen for all Component events.
		 * 
		 * Without this, we would need to subscribe an 'all' event listener to every instantiated component, and then remove that 
		 * listener when the components are {@link jqc.Component#method-destroy destroyed}. This would just be extra processing 
		 * and memory usage, when this method is much simpler.
		 * 
		 * This method will only be executed once. Once the interceptor method has been placed, it does not need to be added again.
		 * 
		 * @protected
		 */
		patchFireEvent : function() {
			if( !this.fireEventPatched ) {
				var me = this,
				    prototype = Component.prototype,
				    origFireEvent = prototype.fireEvent;
				
				prototype.fireEvent = function( eventName ) {
					var returnVal = origFireEvent.apply( this, arguments );
					
					if( returnVal !== false ) {
					    returnVal = me.dispatchEvent( this, eventName, Array.prototype.slice.call( arguments, 1 ) );
					}
					
					return returnVal;
				};
				
				this.fireEventPatched = true;
			}
		}
		
		
	} );
	
	
	// Return singleton instance
	return new EventBus();
	
} );
/*global define */
define('jqc/app/Controller', [
	'lodash',
	'Observable',
	'jqc/Jqc',
	'jqc/ComponentQuery',
	'jqc/app/EventBus'
], function( _, Observable, Jqc, ComponentQuery, EventBus ) {
	
	/**
	 * @class jqc.app.Controller
	 * @extends Observable
	 * 
	 * Base class Controller which should be extended by implementations to implement controller logic.
	 * 
	 * The Controller must be provided the {@link #view view(s)} ({@link jqc.Component Components}) that it is to work with. 
	 * It uses this to query for components, and listen to events from. This may be one Component (most likely an outer
	 * {@link jqc.Viewport} or {@link jqc.Container}), or multiple components to reference and listen to events from. The
	 * Component(s) provided to the {@link #view} config give the scope of the Controllers reach, where both those components
	 * and their descendant components may be manipulated / listened to.
	 * 
	 * 
	 * ## View Component References
	 * 
	 * A Controller may set up {@link #cfg-refs} to easily retrieve references to components, based on a 
	 * {@link jqc.ComponentQuery ComponentQuery} selector. Alternatively, the {@link #addRef} method may also be used to 
	 * dynamically add references. 
	 * 
	 * References to component(s) are retrieved using the {@link #getRef} method. The {@link #getRef} accepts the reference
	 * name, and returns the component, or array of components (if the `multiple` flag was set to true), for that reference. 
	 * For example, defining a Controller implementation subclass:
	 * 
	 *     define( [
	 *         'jqc/Controller'
	 *     ], function( Controller ) {
	 *     
	 *         var UserController = Controller.extend( {
	 *             
	 *             refs : {
	 *                 'userPanel'      : '#mainUserPanel',
	 *                 'userTextFields' : { selector: 'textfield', multiple: true }
	 *             },
	 *         
	 *             init : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 // (If we wanted to retrieve the components right here in the init() method...)
	 *                 this.getRef( 'userPanel' );      // --> Retrieves the Panel instance with an id of 'mainUserPanel'
	 *                 this.getRef( 'userTextFields' ); // --> Retrieves the array of {@link jqc.form.field.Text} components
	 *             }
	 *         
	 *         } );
	 *         
	 *         
	 *         return UserController;
	 *         
	 *     } );
	 * 
	 * The selector query for a reference is only executed the first time that it is called for from {@link #getRef}. The 
	 * component(s) that matched the selector are then cached for subsequent calls to {@link #getRef}. This behavior may
	 * be overridden by either passing the `forceQuery` option to {@link #getRef}, or if the reference is defined with
	 * the `noCache` option set to `true`. A reason this may be useful is if components are dynamically added to the {@link #view}
	 * that this Controller is working with, in which case you may want to retrieve the latest list of components.
	 * 
	 * See the {@link #cfg-refs} config for more details on setting up references.
	 * 
	 * 
	 * ## Listening to Events
	 * 
	 * A Controller may set up listeners based on {@link jqc.ComponentQuery ComponentQuery} selectors, to be able to respond to
	 * events from components living under its configured {@link #view}. The {@link #listen} method handles this functionality,
	 * and listeners are usually set up from the {@link #init} hook method. For example:
	 * 
	 *     define( [
	 *         'jqc/Controller'
	 *     ], function( Controller ) {
	 *     
	 *         var UserController = Controller.extend( {
	 *             
	 *             init : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 this.listen( {
	 *                     '#userPanel' : {
	 *                         'show' : this.onUserPanelShow,
	 *                         'hide' : this.onUserPanelHide
	 *                     },
	 *                     '#submitButton' : {
	 *                         'click' : this.onSubmitClick
	 *                     }
	 *                 } );
	 *             },
	 *             
	 *             
	 *             this.onUserPanelShow : function( panel ) {
	 *                 console.log( "User panel has been shown" );
	 *             },
	 *             
	 *             this.onUserPanelHide : function( panel ) {
	 *                 console.log( "User panel has been hidden" );
	 *             },
	 *             
	 *             this.onSubmitClick : function( button ) {
	 *                 console.log( "Submit button has been clicked" );
	 *             }
	 *         
	 *         } );
	 *         
	 *         
	 *         return UserController;
	 *         
	 *     } );
	 * 
	 * All event handler methods are called in the scope of the Controller. See {@link #listen} for more details.
	 */
	var Controller = Observable.extend( {
		
		inheritedStatics : {
			
			// Subclass-specific setup
			/**
			 * @ignore
			 */
			onClassExtended : function( NewController ) {
				// Extend `refs` config from superclass
				var proto = NewController.prototype,
				    superclassProto = NewController.superclass,
				    superclassRefs = superclassProto.refs;
				
				if( !proto.hasOwnProperty( 'refs' ) ) {
					proto.refs = _.clone( superclassRefs ) || {};
				} else {
					proto.refs = _.assign( {}, superclassRefs, proto.refs );  // the refs on the new class's prototype take precedence
				}
			}
			
		},
		
		
		/**
		 * @cfg {jqc.Component} view (required)
		 * 
		 * The view Component that the Controller should manage. {@link #cfg-refs References} retrieved for components, and events 
		 * listened to must either be on the Component provided to this config, or a descendant of the component (which
		 * in this case is a {@link jqc.Container Container}) provided to this config.
		 * 
		 * Most often, this config will be the the page's outermost {@link jqc.Viewport Viewport} (which itself is a 
		 * {@link jqc.Container Container} subclass). However, this may also be any 
		 * {@link jqc.Component Component}/{@link jqc.Container Container}, which will limit the scope of what component(s) the 
		 * Controller controls.
		 * 
		 * As an example setup for a page:
		 * 
		 *     require( [
		 *         'jquery',
		 *         'jqc/Viewport',
		 *         'my/app/Controller'  // your own jqc.app.Controller subclass, which implements your page's logic
		 *     ], function( $, Viewport, Controller ) {
		 *         
		 *         var viewport = new Viewport( {
		 *             items : [ 
		 *                 // all of the page's view components go here,
		 *                 // in their nested hierarchy
		 *             ]
		 *         } );
		 *             
		 *         var controller = new Controller( {
		 *             view : viewport   // pass the Viewport as the view that the Controller controls
		 *         } );
		 *         
		 *         
		 *         // Render the Viewport on doc ready
		 *         $( document ).ready( function() {
		 *             viewport.render( 'body' );
		 *         } );
		 *         
		 *     } );
		 */
		
		/**
		 * @cfg {Object} refs
		 * 
		 * An Object (map) for component references that the Controller should set up. This config should be added to the
		 * **prototype** of the Controller, in a Controller subclass. See the documentation of this class for an example of
		 * how to create a Controller subclass.
		 * 
		 * References are based on a {@link jqc.ComponentQuery ComponentQuery} selector, and make it easy to retrieve matching 
		 * component(s) throughout the Controller's code using {@link #getRef}.
		 * 
		 * This Object should be keyed by the ref names, and whose values are Objects with the following properties:
		 * - **selector** (String) : The selector string for the ref.
		 * - **multiple** (Boolean) : (Optional) `true` if this is a multi-component selector (in which case an array is returned
		 *   when retrieving the ref), or `false` if the selector returns a single component. Defaults to `false`.
		 * - **noCache** (Boolean) : (Optional) `true` if this ref should not cache its result, and instead re-query the {@link #view}
		 *   when the ref is requested again. Defaults to `false`.
		 * 
		 * The values may also simply be a string, where the string is taken as the selector.
		 * 
		 * Example:
		 * 
		 *     refs : {
		 *         'myComponent1' : '#myComponent1',  // shorthand use with just a selector
		 *         'myComponent2' : { selector: '#myComponent2' },
		 *         'myTextFields' : { selector: 'textfield', multiple: true },  // matches all TextField components
		 *         'myButtons'    : { selector: 'button', multiple: true, noCache: true }
		 *     }
		 *     
		 * `refs` extend to subclasses, but any refs defined in a subclass with the same name as one in a superclass
		 * will overwrite the superclass's ref.
		 */
		
		
		
		/**
		 * @protected
		 * @property {Object} refs
		 * 
		 * An Object (map) which is keyed by the ref names, and whose values are Objects with the following properties:
		 * 
		 * - **selector** (String) : The selector string for the ref.
		 * - **multiple** (Boolean} : `true` if this is a multi-component selector (in which case an array is returned
		 *   when retrieving the ref), or `false` if the selector returns a single component.
		 * - **noCache** (Boolean) : `true` if this ref should not cache its result, and instead re-query the {@link #view}
		 *   when the ref is requested again.
		 * - **cachedComponents** (jqc.Component[]) : An array of the cached component references. This is populated after the
		 *   first use of the ref.
		 */
		
		/**
		 * @protected
		 * @property {Object} listeners
		 * 
		 * An Object (map) which stores the listeners registered from {@link #listen}.
		 * 
		 * This Object is keyed by the event names which are registered, and its values are an array of objects, each of which
		 * have properties: `selector` and `handlerFn`.
		 * 
		 * An example of what this map looks like is this:
		 * 
		 *     {
		 *         'click' : [
		 *             { selector: '#myCmp1', handlerFn: this.onMyCmp1Click },
		 *             { selector: 'button',  handlerFn: this.onButtonClick }
		 *         ],
		 *         'keyup' : [
		 *             { selector: '#searchTextField', handlerFn: this.onSearchFieldKeyUp }
		 *         ]
		 *     }
		 */
		
		/**
		 * @protected
		 * @property {Boolean} eventBusSubscribed
		 * 
		 * Flag which is set to true once this controller has subscribed to the {@link jqc.app.EventBus}, to listen for all
		 * {@link jqc.Component} events.
		 */
		
		
		/**
		 * @constructor
		 * @param {Object} cfg Any of the configuration options of this class, specified in an Object (map).
		 */
		constructor : function( cfg ) {
			_.assign( this, cfg );
			this._super( arguments );
			
			this.addEvents(
				/**
				 * Fires when the Controller has been destroyed.
				 * 
				 * @event destroy
				 * @param {jqc.app.Controller} controller This Controller instance.
				 */
				'destroy'
			);
			
			// <debug>
			if( !this.view ) throw new Error( "`view` cfg required" );
			// </debug>
			
			var refsConfig = this.refs;
			this.refs = {};  // reset `refs` property for how refs will be stored internally
			
			if( refsConfig ) {
				this.addRef( refsConfig );
			}
			
			this.listeners = {};
			
			this.init();
		},
		
		
		/**
		 * Hook method which should be overridden in subclasses to implement the Controller's initialization logic.
		 * 
		 * @protected
		 * @template
		 * @method init
		 */
		init : Jqc.emptyFn,
		
		
		// ------------------------------------
		
		// References (Refs) Functionality
		
		
		/**
		 * Adds a reference to one or more components that can be retrieved easily by name. A reference is related
		 * to a {@link jqc.ComponentQuery ComponentQuery} selector, which is executed when the reference is retrieved
		 * (via {@link #getRef}).
		 * 
		 * After the first retrieval of a reference with {@link #getRef}, the result is cached for subsequent {@link #getRef}
		 * calls.
		 * 
		 * This method accepts an alternative arguments list other than the one documented. It accepts an Object as the first
		 * (and only) argument, for a configuration object of ref(s) to add. This configuration object should matche the form that 
		 * the {@link #cfg-refs refs config} accepts. Example:
		 * 
		 *     this.addRef( {
		 *         'myComponent'  : '#myComponent',
		 *         'myTextFields' : { selector: 'textfield' },
		 *         'myButtons'    : { selector: 'button', multiple: true, noCache: true }
		 *     } );
		 * 
		 * @protected
		 * @param {String/Object} ref The reference name, or a configuration object for one or more refs. If providing a configuration
		 *   object, the rest of the parameters of this method are ignored.
		 * @param {String} selector The selector string to select components by.
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Boolean} [options.multiple=false] `true` to create a reference which returns multiple
		 *   components. The return from {@link #getRef} will be an array of {@link jqc.Component Components}
		 *   if this option is set to `true`. By default, a ref only retrieves a single component, and its
		 *   instance is directly returned by {@link #getRef}. 
		 * @param {Boolean} [options.noCache=true] `false` to prevent the caching of the retrieved components after they
		 *   are retrieved with {@link #getRef}. This is useful for `multiple` refs (selectors which are to retrieve multiple 
		 *   components), where the number of components may change due to additions or removals from the page.
		 */
		addRef : function( ref, selector, options ) {
			if( typeof ref === 'string' ) {
				options = options || {};
				
				this.refs[ ref ] = {
					selector : selector,
					multiple : !!options.multiple,
					noCache  : !!options.noCache
				};
				
			} else {  // configuration object for the refs
				var refs = ref;  // for clarity, that this is an object which may have multiple refs
				
				refs = _.forOwn( refs, function( refCfg, refName, refs ) {
					if( typeof refCfg === 'string' )  // if the value was simply a selector string, convert it to an object now
						refCfg = { selector: refCfg };
					
					// Apply default properties for missing ones in the ref config
					refs[ refName ] = _.defaults( refCfg, {
						multiple : false,
						noCache  : false
					} );
				} );
				
				// Assign the new refs to the current map of refs
				_.assign( this.refs, refs );
			}
		},
		
		
		/**
		 * Retrieves a {@link jqc.Component Component} by ref name (or multiple {@link jqc.Component Components}, if the 
		 * `multiple` flag was set to `true` when {@link #addRef adding the ref}).
		 * 
		 * @param {String} refName
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Boolean} [options.forceQuery=false] `true` to force the reference to re-query for the component(s),
		 *   even if the component references have previously been cached. This may be useful for "multi-component"
		 *   references, if the components on the page have changed, and a new query for them must be made. (Single
		 *   component references are automatically handled if the component has been 
		 *   {@link jqc.Component#method-destroy destroyed}.)
		 * @return {jqc.Component/jqc.Component[]} A single component (in the case of singular references, which are
		 *   the default), or an array if the `multiple` flag was provided for the reference in {@link #addRef}.
		 */
		getRef : function( refName, options ) {
			var ref = this.refs[ refName ];
			
			// <debug>
			if( !ref ) throw new Error( "A ref with name: '" + refName + "' was not defined using addRef()" );
			// </debug>
			
			options = options || {};
			
			var cachedComponents = ref.cachedComponents;
			if( cachedComponents === undefined || options.forceQuery || ref.noCache ) {
				ref.cachedComponents = cachedComponents = ComponentQuery.query( ref.selector, this.view );
			}
			
			return ( ref.multiple ) ? cachedComponents : cachedComponents[ 0 ] || null;
		},
		
		
		// ------------------------------------
		
		// Event Listening Functionality
		
		/**
		 * Adds event listeners to components selected via {@link jqc.ComponentQuery} selectors. The `selectors` argument accepts an 
		 * Object (map) of component selector strings as its keys, and a map of event names -&gt; handler functions as its values.
		 * 
		 * For example, in this controller, we may want to handle the click event of all {@link jqc.button.Button} components which 
		 * exist under the {@link #view}, as well as a {@link jqc.Anchor} component with the id "myAnchor".
		 * 
		 *     define( [
		 *         'jqc/app/Controller'
		 *     ], function( Controller ) {
		 *         
		 *         var MyController = Controller.extend( {
		 *             
		 *             init : function() {
		 *                 this._super( arguments );
		 *                 
		 *                 this.listen( {
		 *                     'button' : {   // select all Button components
		 *                         'click' : this.onButtonClick
		 *                     },
		 *                     '#myAnchor' : {   // select component by id
		 *                         'click' : this.onAnchorClick
		 *                     }
		 *                 } );
		 *             },
		 *             
		 *             
		 *             onButtonClick : function( button ) {
		 *                 console.log( "clicked the button with text: ", button.text );
		 *             },
		 *             
		 *             
		 *             onAnchorClick : function( anchor ) {
		 *                 console.log( "you clicked the anchor" );
		 *             }
		 *             
		 *         } );
		 *     
		 *     } );
		 * 
		 * Note that handlers are always called in the scope (`this` reference) of the Controller.
		 * 
		 * See {@link jqc.ComponentQuery} for more information on component selector strings.
		 * 
		 * @param {Object} selectors An Object (map) where the keys are component selector strings, and the values are Objects (maps)
		 *   which map event names to handler functions. See the description of this method for details.
		 */
		listen : function( selectors ) {
			if( !this.eventBusSubscribed )
				EventBus.subscribe( this.onComponentEvent, this );
			
			var listeners = this.listeners;
			
			// Create the internal `listeners` map keyed by event names, and whose values are arrays of objects. Each object
			// has properties: `selector` and `handlerFn`.
			_.forOwn( selectors, function( listenersCfg, selector ) {
				_.forOwn( listenersCfg, function( handlerFn, eventName ) {
					var eventListeners = listeners[ eventName ] = listeners[ eventName ] || [];
					
					eventListeners.push( {
						selector  : selector,
						handlerFn : handlerFn
					} );
				} );
			} );
		},
		
		
		/**
		 * Handles an event being fired by a component, from the {@link jqc.app.EventBus EventBus}. Calls the handlers
		 * that are registered for the particular `eventName`, and that match the selector which was set up in {@link #listen}.
		 * 
		 * @protected
		 * @param {jqc.Component} component The Component which fired the event.
		 * @param {String} eventName The name of the event which was fired.
		 * @param {Mixed[]} fireEventArgs The arguments provided to the original {@link Observable#fireEvent fireEvent} call.
		 *   This does not include the event name.
		 */
		onComponentEvent : function( component, eventName, fireEventArgs ) {
			var eventListeners = this.listeners[ eventName ],
			    ret;
			
			if( eventListeners ) {  // if there are any listeners for this event name
				var controllerView = this.view;
				
				for( var i = 0, len = eventListeners.length; i < len; i++ ) {
					var selector = eventListeners[ i ].selector;
					
					// If the Component that fired the event matches a registered selector, and that Component is either the `view`
					// that the controller is working with or a descendant of it, then call the handler function.
					if( ComponentQuery.is( component, selector ) && ( component === controllerView || component.isDescendantOf( controllerView ) ) ) {
						var callResult = eventListeners[ i ].handlerFn.apply( this, fireEventArgs );  // call the handler function
						if( callResult === false ) {
							ret = false;  // `false` return to cancel the default action (if any). This is used in 'before' events, where returning false will cancel the actual event's action
						}
					}
				}
			}
			
			return ret;
		},
		
		
		// ------------------------------------
		
		
		/**
		 * Destroys the Controller by removing all {@link #property-refs references}, and removing any {@link #property-listeners}
		 * that have been set up.
		 * 
		 * Subclasses should not override this method, but instead override the {@link #onDestroy} hook method
		 * to implement any subclass-specific destruction processing. Subclass overrides of {@link #onDestroy}
		 * should call the superclass method at the end of their subclass-specific processing.
		 */
		destroy : function() {
			this.onDestroy();
			
			this.fireEvent( 'destroy', this );
			this.purgeListeners();  // Note: purgeListeners() must be called after 'destroy' event has fired!
			
			if( this.eventBusSubscribed )
				EventBus.unsubscribe( this.onComponentEvent, this );
		},
		
		
		/**
		 * Hook method which should be overridden by subclasses to implement their own subclass-specific
		 * destruction logic. The superclass method should be called after any subclass-specific processing.
		 * 
		 * @protected
		 * @method onDestroy
		 */
		onDestroy : Jqc.emptyFn
		
	} );
	
	
	return Controller;
	
} );
/*global define */
define('jqc/form/field/Field', [
	'jquery',
	'lodash',
	'Class',
	'jqc/Component',
	'jqc/template/Template',
	'jqc/template/LoDash'
], function( jQuery, _, Class, Component, Template, LoDashTpl ) {
	
	/**
	 * @abstract
	 * @class jqc.form.field.Field
	 * @extends jqc.Component
	 * 
	 * Abstract base class for form fields, which lays out a label and a container for form field(s), while also 
	 * providing the base functionality and other common field related tasks.
	 * 
	 * Each concrete subclass must implement the {@link #setValue} and {@link #getValue} methods.
	 */
	var Field = Component.extend( {
		abstractClass : true,
		
		/**
		 * @cfg {String} inputName
		 * 
		 * The name to give the input. This will be set as the input's "name" attribute. This is really only useful if
		 * the form that the component exists under is going to be submitted using a standard form submission (as opposed 
		 * to simply having its value retrieved, and handling it elsewhere). Defaults to the value of the 
		 * {@link #inputId} property.
		 */
		
		/**
		 * @cfg {String} label
		 * 
		 * The field's label. If empty, no space will be reserved for the field's label. Defaults to an empty string.  If 
		 * it is required that the label space be reserved, but should look empty, set to a non-breaking space (&amp;nbsp;)
		 * 
		 * Note that setting the label at a later time using {@link #setLabel} will re-reserve the necessary label space
		 * if the label was originally empty.
		 */
		label : "",
		
		/**
		 * @cfg {String} labelAlign
		 * 
		 * A string that specifies where the field's label should be placed. Valid values are:
		 * "left" and "top". Defaults to 'left'.
		 */
		labelAlign : 'left',
		
		/**
		 * @cfg {String} labelWidth
		 * 
		 * A number specifying how wide the label should be. This is only valid if the {@link #labelAlign} config 
		 * is set to 'left'.
		 */
		labelWidth : 75,
		
		/**
		 * @cfg {String} extraMsg 
		 * 
		 * A tip explaining the field to the user, or provides an example, which gets placed below the {@link #$inputContainerEl}. Defaults to an empty string.
		 */
		extraMsg : "",
		
		/**
		 * @cfg {Mixed} value
		 * 
		 * The initial value for the Field, if any.
		 */
		 
		
		/**
		 * @protected
		 * @property {String} inputId
		 * 
		 * The ID that will be used for the Component's input element. This is a combination of the Component's
		 * {@link jqc.Component#elId elId} and, the suffix "-input". The label element (if {@link #label} is specified) 
		 * will be created with a `for` attribute with this id.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $labelEl
		 * 
		 * The &lt;label&gt; element that gets filled with the label text.  Set HTML content to this element with {@link #setLabel},
		 * or retrieve the element itself for any custom implementation with {@link #getLabelEl}.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $inputContainerWrapEl
		 * 
		 * The &lt;div&gt; element that wraps the {@link #getInputContainerEl}.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $inputContainerEl
		 * 
		 * The &lt;div&gt; element that wraps the input field.  Retrieve this element for any custom implementation 
		 * with {@link #getInputContainerEl}.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $extraMsgEl
		 * 
		 * The &lt;div&gt; element that wraps the "extra message" text.  Set HTML content to this element with {@link #setExtraMsg}.
		 */
		
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-form-Field',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		elType : 'table',
		
		
		/**
		 * @cfg {String/String[]/Function/jqc.template.Template} labelRenderTpl
		 * 
		 * The template to use as the HTML template for the Field's label.
		 * 
		 * This config may be a string, an array of strings, a compiled Lo-Dash template function, or a {@link jqc.template.Template} 
		 * instance. For the string, array of strings, or function form, a {@link jqc.template.LoDash LoDash template} instance will be 
		 * created when the Component is rendered. To use another Template type, pass in an instance of a {@link jqc.template.Template} 
		 * subclass to this config. 
		 * 
		 * For more information on Lo-Dash templates (the default type), see: [http://lodash.com/docs#template](http://lodash.com/docs#template) 
		 */
		labelRenderTpl : new LoDashTpl( [
			'<label id="<%= elId %>-label" for="<%= inputId %>" class="<%= baseCls %>-label"><%= label %></label>'
		] ),
		
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		renderTpl : new LoDashTpl( [
			'<% if( labelAlign === "top" ) { %>',
				'<tr>',
					'<td id="<%= elId %>-topLabelCell" class="<%= baseCls %>-topLabelCell" colspan="2">',
						'<%= labelMarkup %>',
					'</td>',
				'</tr>',
			'<% } %>',
			'<tr>',
				'<td id="<%= elId %>-leftLabelCell" class="<%= baseCls %>-leftLabelCell" width="<%= labelWidth %>">',
					'<% if( labelAlign === "left" ) { %>',
						'<%= labelMarkup %>',
					'<% } %>',
				'</td>',
				'<td id="<%= elId %>-inputCell" class="<%= baseCls %>-inputCell" width="100%">',
					'<div id="<%= elId %>-inputContainer" class="<%= baseCls %>-inputContainer" style="position: relative;"></div>',
				'</td>',
			'</tr>',
			'<tr>',
				'<td></td>',
				'<td class="<%= baseCls %>-extraMsgCell">',
					'<div id="<%= elId %>-extraMsg" class="<%= baseCls %>-extraMsg"><%= extraMsg %></div>',
				'</td>',
			'</tr>'
		] ),
		
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires when the input field has been changed.
				 * 
				 * @event change
				 * @param {jqc.form.field.Field} field This Field object.
				 * @param {Object} newValue The new value of the field.
				 */
				'change',
				
				/**
				 * Fires when the input field has been focused.
				 * 
				 * @event focus
				 * @param {jqc.form.field.Field} field This Field object.
				 */
				'focus',
				
				/**
				 * Fires when the input field has been blurred.
				 * 
				 * @event blur
				 * @param {jqc.form.field.Field} field This Field object.
				 */
				'blur'
			);
			
			// Create the inputId based on the Component's element id
			this.inputId = this.elId + '-input';
			
			// Fix labelAlign to be lowercase for use with setting the class name (just in case),
			// and apply the appropriate CSS class for the label state
			var labelAlign = this.labelAlign = this.labelAlign.toLowerCase(),
			    labelCls = this.baseCls + '-' + ( !this.label ? 'noLabel' : labelAlign + 'Label' );  // ex: 'jqc-form-Field-noLabel' if there is no label, or 'jqc-form-Field-leftLabel' or 'jqc-form-Field-topLabel' if there is one
			this.addCls( labelCls );
			
			
			// Default the inputName to the inputId, if not provided.
			this.inputName = ( typeof this.inputName !== 'undefined' ) ? this.inputName : this.inputId;  // allowing for the possibility of providing an empty string for inputName here (so the field isn't submitted), so not using the || operator
			
			
			// Call superclass initComponent
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		getRenderTplData : function() {
			var labelAlign = this.labelAlign,
			    labelRenderTpl = ( this.labelRenderTpl instanceof Template ) ? this.labelRenderTpl : new LoDashTpl( this.labelRenderTpl ),
			    labelMarkup = labelRenderTpl.apply( this.getLabelRenderTplData() );
			
			// Add properties to the object provided by the superclass, and return
			return _.assign( this._super( arguments ), {
				inputId   : this.inputId,
				inputName : this.inputName,
				
				labelAlign  : labelAlign,
				labelWidth  : ( this.label && labelAlign === 'left' ) ? this.labelWidth : 0,  // labelWidth only valid when using a "left" side label (as opposed to "top")
				labelMarkup : labelMarkup,
				extraMsg    : this.extraMsg || ""
			} );
		},
		
		
		/**
		 * Retrieves the data to provide to the {@link #labelRenderTpl}.
		 * 
		 * @protected
		 * @return {Object}
		 */
		getLabelRenderTplData : function() {
			return {
				elId    : this.elId,
				baseCls : this.baseCls,
				inputId : this.inputId,
				label   : this.label || ""
			};
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			// Retrieve references from generated HTML/DOM append
			var elId = this.elId;
			this.$labelEl = jQuery( '#' + elId + '-label' );   // from the labelTpl
			this.$inputContainerEl = jQuery( '#' + elId + '-inputContainer' );
			this.$extraMsgEl = jQuery( '#' + elId + '-extraMsg' );
		},
		
		
		// --------------------------------------
		
		
		/**
		 * Sets the {@link #label} for the field.
		 * 
		 * @param {String} label
		 * @chainable
		 */
		setLabel : function( label ) {
			this.label = label;
				
			if( this.rendered ) {
				// If a label was specified, make sure the "noLabel" class has been removed. Otherwise, add it.
				this.$el[ !label ? 'addClass' : 'removeClass' ]( this.baseCls + '-noLabel' );
				this.$labelEl.html( label );
			}
			return this;
		},
		
		
		/**
		 * Retrieves the current {@link #label}.
		 * 
		 * @return {String}
		 */
		getLabel : function() {
			return this.label;
		},
		
		
		/**
		 * Sets the {@link #extraMsg "extra message"} text for the Field.
		 * 
		 * @param {String} extraMsg
		 * @chainable
		 */
		setExtraMsg : function( extraMsg ) {
			this.extraMsg = extraMsg;
				
			if( this.rendered ) {
				this.$extraMsgEl.html( extraMsg );
			}
			return this;
		},
		
		
		/**
		 * Retrieves the current {@link #extraMsg "extra message"} text.
		 * 
		 * @return {String}
		 */
		getExtraMsg : function() {
			return this.extraMsg;
		},
		
		
		/**
		 * Retrieves the label element. This is useful if you want to add other HTML elements into the label element itself
		 * in a Field subclass.
		 * 
		 * @protected
		 * @return {jQuery} The element, in a jQuery wrapped set.
		 */
		getLabelEl : function() {
			return this.$labelEl;
		},
		
		
		/**
		 * Retrieves the div element that is meant to wrap the input element. This is useful if you want to add other HTML 
		 * elements into the input container element itself in a Field subclass.
		 * 
		 * @protected
		 * @return {jQuery} The element, in a jQuery wrapped set.
		 */
		getInputContainerEl : function() {
			return this.$inputContainerEl;
		},
		
		
		
		/**
		 * Sets the value for the field.
		 * 
		 * @abstract
		 * @method setValue
		 * @param {Mixed} value The value to set to the field.
		 */
		setValue : Class.abstractMethod,
		
		
		/**
		 * Retrieves the current value from the field.
		 * 
		 * @abstract
		 * @method getValue
		 * @return {Mixed} The value of the field.
		 */
		getValue : Class.abstractMethod,
	    
		
		/**
		 * Template method for handling a change to the field. Extensions of this method should call this superclass method
		 * after their processing is complete.
		 * 
		 * @protected
		 * @param {Mixed} newValue The new value of the field.
		 */
		onChange : function( newValue ) {
			this.fireEvent( 'change', this, newValue );
		},
		
		
		/**
		 * Focuses the field.
		 * 
		 * @chainable
		 */
		focus : function() {
			this.onFocus();
			
			return this;
		},
		
		
		/**
		 * Hook method for handling the input field being focused. Extensions of this method should call this superclass 
		 * method after their processing is complete.
		 * 
		 * @protected
		 * @template
		 */
		onFocus : function() {
			this.addCls( this.baseCls + '-focused' );
			
			this.fireEvent( 'focus', this );
		},
		
		
		/**
		 * Blurs the field.
		 * 
		 * @chainable
		 */
		blur : function() {
			this.onBlur();
			
			return this;
		},
		
		
		/**
		 * Hook method for handling the input field being blurred. Extensions of this method should call this superclass 
		 * method after their processing is complete.
		 * 
		 * @protected
		 * @template
		 */
		onBlur : function() {
			this.removeCls( this.baseCls + '-focused' );
			
			this.fireEvent( 'blur', this );
		}
		
	} );

	return Field;
	
} );
/*global define */
define('jqc/form/field/Checkbox', [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/form/field/Field'
], function( jQuery, _, ComponentManager, Field ) {
	
	/**
	 * @class jqc.form.field.Checkbox
	 * @extends jqc.form.field.Field
	 * @alias type.checkbox
	 * @alias type.checkboxfield
	 *  
	 * Checkbox field component.
	 */
	var CheckboxField = Field.extend( {
		
		/**
		 * @cfg {String} checkboxLabel
		 * 
		 * The label for the checkbox itself, which will be placed to the right of the checkbox. This config is to differentiate from
		 * the {@link jqc.form.field.Field#label label} provided by {@link jqc.form.field.Field Field} (the one which
		 * affects all form field components uniformly).  Defaults to an empty string.
		 * 
		 * Note that if the checkbox should be aligned with other form fields that have "left side" labels (see 
		 * {@link jqc.form.field.Field#labelAlign}, then set its {@link jqc.form.field.Field#label label} config to
		 * a non-breaking space (&amp;nbsp;).
		 */
		checkboxLabel : "",
		
		/**
		 * @cfg {String/Function} value
		 * 
		 * The initial value for the field, if any. Any truthy value will initialize the checkbox as checked.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-form-CheckboxField',
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			// Create the input element, and append it to the $inputContainerEl
			this.$inputEl = jQuery( '<input type="checkbox" class="' + this.componentCls + '-input" id="' + this.inputId + '" name="' + this.inputName + '"' + ( this.value ? ' checked' : '' ) + ' />' )
				.appendTo( this.$inputContainerEl );
			
			// Create the checkbox label element, which comes up on the right side of the checkbox.
			this.$checkboxLabelEl = jQuery( '<label for="' + this.inputId + '" class="' + this.componentCls + '-label" />&nbsp;' + ( this.checkboxLabel || "" ) )
				.appendTo( this.$inputContainerEl );
			
			// Add event handlers to the input element
			this.$inputEl.on( {
				'change' : _.bind( function() {
					this.onChange( this.getValue() );  // call onChange() with the new value.
				}, this )
			} );
		},
		
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * 
		 * @param {Boolean} value The value of the field. If truthy, the checkbox will be checked. If falsy, the checkbox will be unchecked.
		 */
		setValue : function( value ) {
			if( !this.rendered ) {
				this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
			} else {
				this.$inputEl.prop( 'checked', !!value );
			}
		},
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s getValue() method, which returns the value of the field.
		 * 
		 * @return {Boolean} The value of the field (true if it's checked, false otherwise).
		 */
		getValue : function() {
			if( !this.rendered ) {
				return !!this.value;  // If the value was set before the Component has been rendered (i.e. before the Field has been created), return that. Make sure it returns a Boolean as well.
			} else {
				return this.$inputEl.prop( "checked" );
			}
		}
		
	} );
	
	
	ComponentManager.registerType( 'checkbox', CheckboxField );
	ComponentManager.registerType( 'checkboxfield', CheckboxField );
	
	return CheckboxField;
	
} );
/*global define */
define('jqc/util/OptionsStore', [
	'lodash',
	'Class'
], function( _, Class ) {
	
	/**
	 * @class jqc.util.OptionsStore
	 * @extends Object
	 * 
	 * Helper utility class used for making the management of text/value "options" data easy, for any classes that rely on this format 
	 * of data. This is used as used, for example, by {@link jqc.form.field.Dropdown Dropdowns}. The purpose of this class 
	 * was to not duplicate functionality for the classes that use this format of data.
	 * 
	 * This class is currently used by {@link jqc.form.field.Dropdown} and {@link jqc.form.field.Radio}, which use it for 
	 * managing the options that they provide.
	 */
	var OptionsStore = Class.extend( Object, {
		
		/**
		 * @protected
		 * @property {Object[]} options
		 * 
		 * The internal array of options held by the OptionsStore.
		 */
		
		
		/**
		 * Instantiates an OptionsStore.
		 * 
		 * @constructor
		 * @param {String[]/Object[]} [options] The initial set of options to provide to the OptionsStore, if any. 
		 *   See the `options` parameter in {@link #setOptions} for accepted formats of this parameter.
		 */
		constructor : function( options ) {
			this.setOptions( options || [] );
		},
		
		
		/**
		 * Normalizes the given array of options into text/value options.
		 * 
		 * @protected
		 * @param {String[]/Object[]} options See the `options` argument of {@link #setOptions}.
		 * @return {Object[]} The options normalized to objects with `text` and `value` properties.
		 */
		normalizeOptions : function( options ) {
			return _.map( options, function( opt ) { return this.normalizeOption( opt ); }, this );
		},
		
		
		/**
		 * Normalizes a single option into an object with `text` and `value` properties. 
		 * 
		 * - If a String is provided as the argument, that string will be used as both the `text` and `value` properties. 
		 * - If an Object is provided, it must at least have a `text` property, which will also be used for the `value` 
		 *   property should no `value` of its own exist.
		 * 
		 * @protected
		 * @param {String/Object} option
		 * @return {Object} A normalized object with `text` and `value` properties.
		 */
		normalizeOption : function( option ) {
			if( typeof option === 'object' ) {
				option = _.clone( option );  // make a shallow copy, as to not affect the original
				
				// If no value is specified, use the `text` property as the value.
				if( option.value === undefined ) {
					option.value = option.text;
				}
				
				return option;
				
			} else {
				// String `option` arg: use it for both `text` and `value` properties on the returned object
				return { text: option, value: option };
			}
		},
		
		
		/**
		 * Sets the options for the store. 
		 * 
		 * Normalizes the options into an Array of Objects, where each Object has the properties `text` and `value`. Any extra 
		 * properties on the objects are left unchanged.
		 * 
		 * @param {String[]/Object[]} options The options for the OptionsStore. If this is a flat array of strings, the values will be 
		 *   used as both the `text` and `value` properties of the options.  Ex: 
		 *   
		 *       [ "Option 1", "Option 2", "Option 3" ]
		 * 
		 *   If you want to customize the value and text separately for each option, provide an Array of Objects, where the Object 
		 *   has two properties: `text` and `value`. Ex: 
		 *   
		 *       [ 
		 *           { "text": "Option 1", "value": 1 },
		 *           { "text": "Option 2", "value": 2 }
		 *       ]
		 *   
		 *   Extra properties may also be added if needed in this form, and will not be affected by the OptionsStore.  These properties
		 *   may be used by whichever implementation is using the OptionsStore. Ex: 
		 *   
		 *       [
		 *           { "text": "Option 1", "value": 1, "cls" : "myCssClass" },
		 *           { "text": "Option 2", "value": 2, "cls" : "myCssClass2" }
		 *       ]
		 */
		setOptions : function( options ) {
			this.options = this.normalizeOptions( options );
		},
		
		
		/**
		 * Adds an option to the OptionsStore.
		 * 
		 * @param {String/Object} A string, which will be used for both the text/value, or an object with `text` and `value` properties.
		 * @param {Number} [index] The index to add the option at. Defaults to appending the option.
		 */
		addOption : function( option, index ) {
			var options = this.options;
			
			option = this.normalizeOption( option );
			index = ( typeof index !== 'undefined' ) ? index : options.length;
			
			// Splice the option in at the index
			options.splice( index, 0, option );
		},
		
		
		/**
		 * Removes an option from the OptionsStore by its text.
		 * 
		 * @param {Mixed} text The text of the option to remove.
		 */
		removeOptionByText : function( text ) {
			var options = this.options,
			    idx = _.findIndex( options, { text: text } );
			
			if( idx !== -1 ) {
				options.splice( idx, 1 );  // remove the option
			}
		},
		
		
		/**
		 * Removes an option from the OptionsStore by its value.
		 * 
		 * @param {Mixed} value The value of the option to remove.
		 */
		removeOptionByValue : function( value ) {
			var options = this.options,
			    idx = _.findIndex( this.options, { value: value } );
			
			if( idx !== -1 ) {
				options.splice( idx, 1 );  // remove the option
			}
		},
		
		
		// --------------------------------
		
		// Retrieval methods
		
		/**
		 * Retrives all of the options objects held by the OptionsStore. Each options object has properties: `text` and `value`.
		 * 
		 * @return {Object[]} An array of the options objects, each of which has properties `text` and `value`.
		 */
		getOptions : function() {
			return this.options;
		},
		
		
		/**
		 * Retrieves the number of options held by the OptionsStore.
		 * 
		 * @return {Number} The number of options currently held by the OptionsStore.
		 */
		getCount : function() {
			return this.options.length;
		},
		
		
		/**
		 * Retrieves an option based on its index position (0-based).
		 * 
		 * @param {Number} index
		 * @return {Object} The option object with properties `text` and `value`, or `null` if the index was out of range.
		 */
		getAtIndex : function( index ) {
			return this.options[ index ] || null;
		},
		
		
		/**
		 * Retrieves an option based on its `text`. An option object has properties `text` and `value`.
		 * 
		 * @param {String} text
		 * @return {Object} The option object with properties `text` and `value`, or `null` if no option was found.
		 */
		getByText : function( text ) {
			return _.find( this.options, { text: text } ) || null;
		},
		
		
		/**
		 * Retrieves an option based on its `value`. An option object has properties `text` and `value`.
		 * 
		 * @param {Mixed} value
		 * @return {Object} The option object with properties `text` and `value`, or `null` if no option was found.
		 */
		getByValue : function( value ) {
			return _.find( this.options, { value: value } ) || null;
		}
	
	} );
	
	return OptionsStore;
	
} );
/*global define */
define('jqc/form/field/Dropdown', [
	'jquery',
	'lodash',
	'jqc/util/Css',
	'jqc/ComponentManager',
	'jqc/form/field/Field',
	'jqc/template/LoDash',
	'jqc/util/OptionsStore'
], function( jQuery, _, Css, ComponentManager, Field, LoDashTpl, OptionsStore ) {
	
	/**
	 * @class jqc.form.field.Dropdown
	 * @extends jqc.form.field.Field
	 * @alias type.dropdown
	 * @alias type.dropdownfield
	 * 
	 * Dropdown list where only one item may be selected.
	 */
	var DropdownField = Field.extend( {
		
		/**
		 * @cfg {Array/Function} options
		 * 
		 * The options for the dropdown. See the description of the {@link jqc.util.OptionsStore#setOptions} method for accepted formats.
		 * 
		 * Note that along with 'text' and 'value' properties, options can have the extra properties of 'cls' and 'style', which can specify the
		 * css class name(s) to style the dropdown option with, or a hash of styles to style the dropdown option with, repectively. Ex:
		 * 
		 *     [ { text: "Option 1", value: 1, cls: "myCssClass", "style": { "font-weight": "bold", "font-size": "14px" } } ]
		 * 
		 * 
		 * A DropdownField may be instantiated with 0 options, and may have options added at a later time using the 
		 * {@link #setOptions} and {@link #addOption} methods.
		 */
		
		/**
		 * @cfg {String} menuCls
		 * 
		 * Any additional css class(es) to add to the dropdown menu itself. The dropdown menu is appended to the document body, and therefore can not be
		 * styled by regular descendant css rules. Use this config to add one or more custom css classes (separated by spaces) for the styling of the dropdown menu. 
		 */
		menuCls : "",
		
		/**
		 * @cfg {String} menuCollisionStrategy
		 * 
		 * The strategy to use to re-position the dropdown menu when it collides with the edge of the screen.  Can be one of the following values:
		 * 'flip', 'fit', or 'none'.  See the 'collision' option of jQuery UI's position utility for details. http://jqueryui.com/demos/position/  
		 * Defaults to 'flip'.
		 */
		menuCollisionStrategy : 'flip',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-form-DropdownField',
		
		
		/**
		 * @private
		 * @property {jqc.util.OptionsStore} optionsStore
		 * 
		 * The OptionsStore instance used for managing the DropdownField's options.
		 */
		
		/**
		 * @private
		 * @property {Boolean} optionsMenuOpen
		 * 
		 * Flag that stores whether or not the options menu is open or closed.
		 */
		optionsMenuOpen : false,
	
	
		
		statics : {
			
			/**
			 * @private
			 * @static
			 * @property {String} dropdownRenderTpl
			 * 
			 * The template to use to render the dropdown's elements. Note: The hidden input is to allow this field to be submitted
			 * as a regular form field.
			 */
			dropdownRenderTpl : new LoDashTpl( [
				'<input type="hidden" id="<%= inputId %>" name="<%= inputName %>" value="<%= initialValue %>" />',  // populated upon selection for standard form submission
				'<div id="<%= elId %>-dropdownContainer" class="<%= componentCls %>-dropdownContainer">',
					'<div id="<%= elId %>-selectText" class="<%= componentCls %>-selectText">',
						'<div class="<%= optionClass %>" style="<%= optionStyles %>"><%= optionText %></div>',
					'</div>',
					'<div id="<%= elId %>-openButton" class="<%= componentCls %>-openButton" />',
				'</div>'
			] ),
			
			
			/**
			 * @private
			 * @static
			 * @property {String} optionsMenuRenderTpl
			 * 
			 * The template to use to render the dropdown's options menu elements.
			 */
			optionsMenuRenderTpl : new LoDashTpl( [
				'<li data-elem="jqc-form-DropdownField-menu-item" class="<%= componentCls %>-menu-item <%= menuItemCls %>" style="<%= menuItemStyle %>">',
					'<%= text %>',
				'</li>'
			] )
			
		},
		
	
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			this.options = this.options || [];  // default to an empty array
			
			// Create the OptionsStore for managing the DropdownField's options data
			this.optionsStore = new OptionsStore( this.options );
					
			// Initialize the dropdown's value
			this.initValue();
		},
		
		
		
		/**
		 * Initializes the Dropdown's {@link #value}. If the {@link #value} property is undefined, or it doesn't match any of the values in the 
		 * {@link #options} provided to the DropdownField, it is initialized to the first {@link #options option's} value.  This guarantees that 
		 * the DropdownField's initial value is always set to a valid option value. This method may be extended by subclasses for any pre/post 
		 * processing that they may need to add.
		 * 
		 * @protected
		 */
		initValue : function() {
			var optionsStore = this.optionsStore,
			    options = optionsStore.getOptions(),
			    numOptions = options.length;
			
			if( typeof this.value === 'undefined' ) {
				// No 'value' config provided, set the value to the value of the first option (if one exists).
				// Otherwise, just leave it as undefined.
				if( numOptions > 0 ) {
					this.value = options[ 0 ].value;
				}
			} else {
				// Value config was provided, make sure it is in the options store. If not, set
				// it to the value of the first option. This guarantees that the Dropdown's value
				// is always set to a valid option. If there are no options, set it back to undefined.
				if( optionsStore.getByValue( this.value ) === null ) {
					this.value = ( numOptions > 0 ) ? options[ 0 ].value : undefined;
				}
			}
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function( container ) {
			// Call superclass onRender() first, to render this Component's element
			this._super( arguments );
			
			// Note: eventually we want the custom dropdown implementation to be able to be tabbed to in the browser, which may involve creating
			// an actual dropdown field (<select> element). Leaving this (old) code here for now.  
			/*
			// Create the dropdown
			this.$inputEl = jQuery( '<select id="' + this.inputId + '" name="' + this.inputName + '" class="jqc-corner-all dropdown"></select>' )
				.bind( {
					change : _.bind( function() { this.onChange( this.getValue() ); }, this ),  // Call onChange() with the new value
					focus  : _.bind( this.onFocus, this ),
					blur   : _.bind( this.onBlur, this )
				} )
				.appendTo( this.$inputContainerEl );  // Append the dropdown to the input container
			
			// Fill the options
			this.redrawOptions();
			*/
			
			
			var elId = this.elId,
			    inputId = this.inputId,
			    $inputContainerEl = this.$inputContainerEl,
			    dropdownRenderTpl = DropdownField.dropdownRenderTpl,
			    fieldValue = this.getValue(),
			    option = this.optionsStore.getByValue( fieldValue );
			
			var dropdownMarkup = dropdownRenderTpl.apply( {
				componentCls  : this.componentCls,
				
				elId          : elId,
				inputId       : inputId,
				inputName     : this.inputName,
				initialValue  : fieldValue,
				
				// For the initially selected option
				optionText    : ( option ) ? option.text : "",
				optionClass   : ( option && option.cls ) ? option.cls : "",
				optionStyles  : ( option && option.style ) ? Css.mapToString( option.style ) : ""
			} );
			$inputContainerEl.append( dropdownMarkup );
			
			// Assign references to created elements
			this.$inputEl = jQuery( '#' + inputId );
			this.$dropdownContainer = jQuery( '#' + elId + '-dropdownContainer' );
			this.$selectText = jQuery( '#' + elId + '-selectText' );
			this.$openButton = jQuery( '#' + elId + '-openButton' );
			
			// Apply a click handler to the dropdown's "select text" and open button, for showing the dropdownMenu
			var onDropdownClickDelegate = _.bind( this.onDropdownClick, this );
			this.$selectText.click( onDropdownClickDelegate );
			this.$openButton.click( onDropdownClickDelegate );
			
			
			// Create the dropdown menu, which is a <ul> element that holds the dropdown list. This is appended to the document body.
			this.$optionsMenu = jQuery( '<ul class="' + this.componentCls + '-menu ' + this.menuCls + '" />' ).hide().appendTo( 'body' );
			
			// TODO: Add IE iframe shim
			/*if ($.browser.msie && jQuery.browser.version < 7) {
				$select.after($('<iframe src="javascript:\'\';" class="jqc-dropdownField-shim" marginwidth="0" marginheight="0" align="bottom" scrolling="no" tabIndex="-1" frameborder="0"></iframe>').css({ height: $select.height()+4 +'px' }));
			}*/
			
			// Now, draw the initial set of options
			this.redrawOptions();
			
			
			// Add the key listener
			/*
			$select.keydown(function(e){
				var selectedIndex = this.selectedIndex;
				switch(e.keyCode){
					case 40: // Down
						if (selectedIndex < this.options.length - 1){ selectedIndex+=1; }
						break;
					case 38: // Up
						if (selectedIndex > 0){ selectedIndex-=1; }
						break;
					default:
						return;
				}
				$('ul a', $wrapper).removeClass('selected').eq(selectedIndex).addClass('selected');
				$('span:eq(0)', $wrapper).html($('option:eq('+ selectedIndex +')', $select).attr('selected', 'selected').text());
				return false;
			}).focus(function(){ $wrapper.addClass('jNiceFocus'); }).blur(function(){ $wrapper.removeClass('jNiceFocus'); });
			*/
			
			
			// Add a handler to check for a click on the document. If the click wasn't over the dropdown's element
			// or its menu, the dropdown's menu will be hidden.
			this.documentClickHandler = _.bind( this.onDocumentClick, this );   // save a reference to the wrapped function so we can remove it later in onDestroy 
			jQuery( document ).bind( 'mousedown', this.documentClickHandler );
			
		},  // eo onRender
		
		
		
		/**
		 * Method that is run as a click handler on the document body, which tests if a click was made away
		 * from the dropdown itself or its menu, which will close the dropdown's menu if that is the case.
		 * 
		 * @private
		 * @param {jQuery.Event} evt
		 */
		onDocumentClick : function( evt ) {
			if( this.optionsMenuOpen ) {  // quick test to prevent the following (more expensive) logic from running if there is no need for it
				var parents = jQuery( evt.target ).parents().andSelf(),  // andSelf() needed to include the element that was clicked on as well, because it may be the <ul> element itself (such as when clicking on its scrollbar), and the menu should not be hidden in this case  
				    dropdownContainerEl = this.$dropdownContainer[ 0 ],
				    optionsMenuEl = this.$optionsMenu[ 0 ],
				    found = false;
					
				for( var i = 0, len = parents.length; i < len; i++ ) {
					if( parents[ i ] === dropdownContainerEl || parents[ i ] === optionsMenuEl ) {
						found = true;
						break;
					}
				}
				
				// The dropdownContainerEl was not found as a parent of the element that was clicked, hide the options menu
				if( !found ) {
					this.hideOptionsMenu();
				}
			}
		},
		
		
		/**
		 * Method that is run when the dropdown itself, or the "open" button, is clicked. This opens the dropdown's options menu.
		 * 
		 * @private
		 * @param {jQuery.Event} evt
		 */
		onDropdownClick : function( evt ) {
			evt.preventDefault();
			
			// Slide down the menu if it is not open, up if it is
			this.toggleOptionsMenu();
			
			// Scroll to the currently selected option
			var $optionsMenu = this.$optionsMenu,
			    itemOffsetTop = jQuery( 'li.' + this.componentCls + '-menu-item-selected', $optionsMenu ).offset().top,
			    offset = itemOffsetTop - $optionsMenu.offset().top;
			$optionsMenu.animate( { scrollTop: offset } );
		},
		
		
		
		/**
		 * Handles when an option is clicked in the dropdown's menu.
		 * 
		 * @private
		 * @param {jQuery.Event} evt
		 */
		onOptionClick : function( evt ) {
			evt.preventDefault();
			
			var $targetEl = jQuery( evt.target ),
			    currentValue = this.getValue(),
			    newValue = $targetEl.data( 'value' );
			
			// Only make a change if the newly selected value is different from the current value
			if( currentValue !== newValue ) {
				// Set the new value
				this.setValue( newValue );
				
				// Run onChange with the new value
				this.onChange( this.getValue() );
			}
			
			// Hide the dropdown menu
			this.hideOptionsMenu();
		},
		
		
		
		// --------------------------------------
		
		
		// Options management methods
		
		/**
		 * Sets the options for the dropdown. Normalizes the options into an array of objects, where each object
		 * has the properties 'text' and 'value'.  See the {@link #options} config for accepted formats to the `options`
		 * parameter. 
		 * 
		 * @param {Array/Function} options See the {@link #options} config for the accepted formats of this parameter.
		 */
		setOptions : function( options ) {
			// Store the options in the OptionsStore
			this.optionsStore.setOptions( options );
			
			this.onOptionsChange();
			this.redrawOptions();  // Update the dropdown's options based on the newly set options (if the dropdown field is rendered)
		},
		
		
		/**
		 * Adds an option to the DropdownField, optionally at an `index`.
		 * 
		 * @param {Object} option The option to add to the DropdownField. For the acceptable format of an option object,
		 *   see {@link #options}.
		 * @param {Number} [index] The index to add the option to in the list. Defaults to appending the new option.
		 */
		addOption : function( option, index ) {
			this.optionsStore.addOption( option, index );
			
			this.onOptionsChange();
			this.redrawOptions();  // Update the dropdown's options based on the newly set options (if the dropdown field is rendered)
		},
		
		
		/**
		 * Removes an option from the DropdownField by its value.
		 * 
		 * @param {Mixed} value The value of the option to remove.
		 */
		removeOptionByValue : function( value ) {
			this.optionsStore.removeOptionByValue( value );
			
			this.onOptionsChange();
			this.redrawOptions();  // Update the dropdown's options based on the newly set options (if the dropdown field is rendered)
		},
		
		
		/**
		 * Removes an option from the DropdownField by its text.
		 * 
		 * @param {Mixed} text The text of the option to remove.
		 */
		removeOptionByText : function( text ) {
			this.optionsStore.removeOptionByText( text );
			
			this.onOptionsChange();
			this.redrawOptions();  // Update the dropdown's options based on the newly set options (if the dropdown field is rendered)
		},
	
	
		/**
		 * Handler to react to the changing of the options/optionsStore, after the value is normalized, but
		 * before the field is redrawn.  Can be extended by subclasses.
		 * 
		 * @protected
		 */
		onOptionsChange : function() {
			var currentValue = this.getValue(),
			    optionsStore = this.optionsStore;
			
			// When the options are changed, make sure that there is at least one option left. It is an error condition to remove 
			// all of the options from the dropdown.
			if( optionsStore.getCount() === 0 ) {
				throw new Error( "Error: no 'options' remain in the DropdownField after options modification. This is an error condition." );
			}
			
			// Check if the current value still exists within the options. If it doesn't, revert the dropdown
			// to the value of the first option.
			if( optionsStore.getByValue( currentValue ) === null ) {
				this.setValue( optionsStore.getAtIndex( 0 ).value );  // because it is an error condition for no options to exist, this line is ok that it directly accesses .value from the object returned by getAtIndex(0), because it can't be null if options exist
			}
		},
		
		
		/**
		 * Retrieves the options of the dropdown. This returns an array of objects, where the objects have 
		 * properties `text` and `value`. Example of a returned array:
		 * 
		 *     [ { text: "Option 1", value: "1" }, { text: "Option 2", value: "2" } ]
		 * 
		 * Note that even if the options' values are specified as numbers, they will be converted to strings
		 * (as strings are the only allowable values for the option tag).
		 *
		 * @return {Object[]}
		 */
		getOptions : function() {
			return this.optionsStore.getOptions();
		},
		
		
		
		/**
		 * Updates the displayed options in the dropdown, based on the current options set by setOptions().
		 * 
		 * @private
		 */
		redrawOptions : function() {
			if( this.rendered ) {
				var options = this.getOptions(),
					numOptions = options.length,
				    $optionsMenu = this.$optionsMenu,
				    optionsMenuRenderTpl = DropdownField.optionsMenuRenderTpl,
					currentFieldValue = this.getValue(),
					i, option;
				
				// Populate the dropdown menu with its options
				$optionsMenu.empty();
				
				
				// Append the markup all at once (for performance, instead of one element at a time)
				var optionsMarkup = [];
				for( i = 0; i < numOptions; i++ ) {
					option = options[ i ];
					
					var menuItemCls = ( option.cls || "" );
					if( option.value === currentFieldValue ) {
						menuItemCls += ' ' + this.componentCls + '-menu-item-selected';
					}
					
					optionsMarkup.push(
						optionsMenuRenderTpl.apply( {
							componentCls  : this.componentCls,
							
							menuItemCls   : menuItemCls,
							menuItemStyle : ( option.style ) ? Css.mapToString( option.style ) : '', 
							text          : option.text
						} )
					);
				}
				$optionsMenu.append( optionsMarkup.join( "" ) );	
				
				
				// Now that the markup is appended and DOM nodes have been created, assign the values to the menu item
				// elements using .data() (so that values of any datatype may be assigned)
				var $itemEls = $optionsMenu.find( '[data-elem="jqc-form-DropdownField-menu-item"]' );
				for( i = 0; i < numOptions; i++ ) {
					// Add the "value" as data (instead of an attribute), so that any datatype can be stored for the value
					$itemEls.eq( i ).data( 'value', options[ i ].value );
				}
				
				// Attach a click handler to each of the menu items
				$itemEls.click( _.bind( this.onOptionClick, this ) );
			}
		},
		
		
		// --------------------------------------
		
		
		/**
		 * Expands and shows the options menu.
		 */
		showOptionsMenu : function() {
			this.optionsMenuOpen = true;
			
			this.$optionsMenu.show();
			
			// Size the width of the menu based on the width of the dropdown's elements
			this.$optionsMenu.width( this.$selectText.width() );
			
			// Position the menu against the dropdown's elements
			this.$optionsMenu.position( {
				my : 'left center',
				at : 'left center',
				of : this.$selectText,
				collision : this.menuCollisionStrategy
			} );
		},
		
		
		/**
		 * Hides the options menu.
		 */
		hideOptionsMenu : function( anim ) {
			this.optionsMenuOpen = false;
			
			this.$optionsMenu.hide();
		},
		
		
		/**
		 * Toggles the options menu. If it is currently open, it will be closed. If it is currently
		 * closed, it will be opened.
		 */
		toggleOptionsMenu : function() {
			if( this.optionsMenuOpen ) {
				this.hideOptionsMenu();
			} else {
				this.showOptionsMenu();
			}
		},
		
		
		
		
		// --------------------------------------
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * If the provided `value` is not an option, the value of the field will remain unchanged.
		 * 
		 * @param {String} value The value of the field.
		 */
		setValue : function( value ) {
			if( typeof value === 'undefined' || value === null ) {
				return;
			}
			
			// If there is an option with the provided value, set it. Otherwise, don't set anything.
			var option = this.optionsStore.getByValue( value );
			if( option ) {
				this.value = value;
				
				if( this.rendered ) {
					// Create a new element for the $selectText's html, which will be styled based on the option's cls and/or style properties.
					var $div = jQuery( '<div class="' + option.cls + '" style="' + ( option.style ? Css.mapToString( option.style ) : '' ) + '">' + option.text + '</div>' );					
					// Set the $selectText's html
					this.$selectText.html( $div );
					
					
					// Update the options menu
					var $optionsMenu = this.$optionsMenu,
					    selectedCls = this.componentCls + '-menu-item-selected';
					$optionsMenu.find( 'li.' + selectedCls ).removeClass( selectedCls );  // De-select any currently selected item in the dropdown menu
					
					// Select the item with the given value
					var $itemEls = $optionsMenu.find( 'li[data-elem="jqc-form-DropdownField-menu-item"]' );
					for( var i = 0, len = $itemEls.length; i < len; i++ ) {
						var $item = $itemEls.eq( i );
						if( $item.data( 'value' ) === value ) {
							$item.addClass( selectedCls );
							break;
						}
					}
					
					
					// Update the hidden field
					this.$inputEl.val( value );
				}
			}
		},
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s getValue() method, which returns the value of the field.
		 * 
		 * @return {String} The value of the option that is selected in the dropdown.
		 */
		getValue : function() {
			// Note: If the Dropdown is not rendered, this will return the configured value. If there was no configured value
			// or an invalid configured value, it defaults to the value of the first option in initComponent().  Otherwise,
			// this property is updated when there is a new selection in the dropdown.
			return this.value;
		},
		
		
		/**
		 * Convenience method for setting the selected option in the dropdown by its text (as opposed to its value). Use {@link #setValue}
		 * to select by option value.  If the provided `text` is not an option, the field will remain unchanged.
		 * 
		 * @param {String} text The text of the option that should be selected in the dropdown.
		 */
		setText : function( text ) {
			// If there is an option with the provided text, set the value based on it. Otherwise, we don't set anything.
			var option = this.optionsStore.getByText( text );
			if( option ) {
				this.setValue( option.value );
			}
		},
		
		
		/**
		 * Convenience method for getting the text of the dropdown's selected option. Use {@link #getValue} to retrieve the selected option's value.
		 * 
		 * @return {String} The text of the selected option in the dropdown. 
		 */
		getText : function() {
			var option = this.optionsStore.getByValue( this.getValue() );
			return option.text;
		},
		
		
		/**
		 * Returns true if the dropdown has an {@link #options option} with the given value.
		 * 
		 * @param {Mixed} value The value to check for.
		 * @return {Boolean} True if the dropdown has an option with the provided `value`, false otherwise.
		 */
		hasOptionValue : function( value ) {
			var options = this.getOptions();
			for( var i = 0, len = options.length; i < len; i++ ) {
				if( options[ i ].value === value ) {
					return true;
				}
			}
			return false;
		},
		
		
		// ---------------------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			if( this.rendered ) {
				// Remove the document click handler, which hides the dropdown menu when its not clicked
				jQuery( document ).unbind( 'mousedown', this.documentClickHandler );
				
				// Remove the optionsMenu element from the document body
				this.$optionsMenu.remove();
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'dropdown', DropdownField );
	ComponentManager.registerType( 'dropdownfield', DropdownField );
	
	return DropdownField;
	
} );
/*global define */
define('jqc/form/field/Hidden', [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/form/field/Field'
], function( jQuery, _, ComponentManager, Field ) {
	
	/**
	 * @class jqc.form.field.Hidden
	 * @extends jqc.form.field.Field
	 * @alias type.hidden
	 * @alias type.hiddenfield
	 * 
	 * A hidden input. This class does not have any visible display.
	 */
	var HiddenField = Field.extend( {
		
		/**
		 * @hide
		 * @cfg {String} label
		 */
		
		/**
		 * @hide
		 * @cfg {String} extraMsg
		 */
		
		/**
		 * @hide
		 * @cfg {Boolean} hidden
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// Make sure there is no label and extraMsg text
			this.label = "";
			this.extraMsg = "";
			
			// Make sure the outer element (created by jqc.Component) is hidden, as there should be no visible indication of the field
			this.hidden = true;
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function( container ) { 
			// Call superclass onRender() first, to render this Component's element
			this._super( arguments );
			
			// Create and append the hidden field
			this.$inputEl = jQuery( '<input type="hidden" id="' + this.inputId + '" name="' + this.inputName + '" value="' + ( this.value || "" ) + '" />' )
				.appendTo( this.$inputContainerEl );
		},
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * 
		 * @param {String} value The value of the field.
		 */
		setValue : function( value ) {
			if( !this.rendered ) {
				this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
			} else {
				this.$inputEl.val( value );
			}
		},
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s getValue() method, which returns the value of the field.
		 * 
		 * @return {String} The value of the field.
		 */
		getValue : function() {
			if( !this.rendered ) {
				return this.value;  // If the value was set before the Component has been rendered (i.e. before the Field has been created), return that.
			} else {
				return this.$inputEl.val();
			}
		}
		
	} );
	
	
	ComponentManager.registerType( 'hidden', HiddenField );
	ComponentManager.registerType( 'hiddenfield', HiddenField );
	
	return HiddenField;
	
} );
/*global define */
define('jqc/form/field/Radio', [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/form/field/Field',
	'jqc/template/LoDash',
	'jqc/util/OptionsStore'
], function( jQuery, _, ComponentManager, Field, LoDashTpl, OptionsStore ) {
	
	/**
	 * @class jqc.form.field.Radio
	 * @extends jqc.form.field.Field
	 * @alias type.radio
	 * @alias type.radiofield
	 * 
	 * Set of radio buttons (buttons where only one selection can be made at a time).
	 */
	var RadioField = Field.extend( {
		
		/**
		 * @cfg {Boolean} stacked 
		 * 
		 * `true` if the radio buttons should be stacked instead of spread out horizontally across the line.
		 */
		stacked : false,
		
		/**
		 * @cfg {Array/Function} options (required)
		 * 
		 * The options for the RadioField, which creates the radio button based on this config. This config is required.
		 * 
		 * If this is a flat array, the values will be used as both the value and text
		 * of the ButtonSet options.  Ex: `[ "Yes", "No" ]`
		 * 
		 * If you want to customize the value and text separately for each option (recommended), provide an array of objects, where the object has two
		 * properties: `text` and `value`. Ex: `[ { "text": "Yes", "value": "yes" }, { "text": "No", "value": "no" } ]`
		 * 
		 * If this config is specified as a function, the function will be executed, and its return will be used as the options. Its return should match one of
		 * the array forms defined above.
		 */
		
		/**
		 * @cfg {String} inputName
		 * 
		 * The name to give the input. This will be set as the input's "name" attribute.  This is really only useful if
		 * the form that the component exists in is going to be submitted by a standard form submission (as opposed to just
		 * having its values retrieved, which are handled elsewhere). Defaults to the value of the 
		 * {@link #inputId} property.
		 * 
		 * Note that because radio fields rely on their "name" attributes being the same, this should not be set to an
		 * empty string (or another non-unique string).  If an explicit name is not needed, let this config default to the
		 * {@link #inputId} property.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-form-RadioField',
		
		
		/**
		 * @protected
		 * @property {String} radioTpl
		 * 
		 * The HTML template to use to create the radio elements.
		 */
		radioTpl : new LoDashTpl( [
			'<input type="radio" id="<%= name %>-<%= num %>" name="<%= name %>" class="<%= componentCls %>-input" value="<%= inputValue %>" <% if( checked ) { %>checked<% } %>>',
			'<label for="<%= name %>-<%= num %>" class="<%= componentCls %>-label"><%= text %></label>'
		] ),
		
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// Create the OptionsStore for managing the 'options'
			this.optionsStore = new OptionsStore( this.options );
			
			// Make sure that options were provided
			// <debug>
			if( this.optionsStore.getOptions().length === 0 ) {
				throw new Error( "Error: The ButtonSet's 'options' was not configured." );
			}
			// </debug>
			
			if( typeof this.value === 'undefined' ) {
				// No 'value' config provided, set the value to the value of the first option
				this.value = this.optionsStore.getOptions()[ 0 ].value;
				
			} else {
				// Value config was provided, make sure it is in the options store. If not, 
				// set it to the value of the first option. This guarantees that the RadioField's
				// value is always set to a valid option
				if( this.optionsStore.getByValue( this.value ) === null ) {
					this.value = this.optionsStore.getOptions()[ 0 ].value;
				}
			}
			
			
			// Call superclass initComponent
			this._super( arguments );
			
			
			// Make sure there is an inputName. This is needed for the radio functionality. It should have been created by Field if it wasn't provided,
			// but this will make sure just in case.
			// <debug>
			if( !this.inputName ) {
				throw new Error( "Error: RadioField must have a valid `inputName`. Make sure that the `inputName` has not been set to an empty string or other falsy value." );
			}
			// </debug>
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function( container ) {
			// Call superclass onRender() first, to render this Component's element
			this._super( arguments );
			
			var options = this.optionsStore.getOptions(),
			    radioTpl = this.radioTpl,
				inputName = this.inputName,
				$inputContainerEl = this.$inputContainerEl,
				stacked = this.stacked,
				fieldValue = this.value,
				markup = [];
			
			for( var i = 0, len = options.length; i < len; i++ ) {
				var option = options[ i ];
				
				// Append the radio
				markup.push( 
					radioTpl.apply( {
						componentCls : this.componentCls,
						
						name         : inputName,
						num          : i,
						inputValue   : option.value,
						text         : option.text,
						checked      : ( fieldValue === option.value )
					} )
				);
				if( stacked ) {
					markup.push( '<br />' );     // If the radio's are to be stacked, append a line break
				}
			}
			
			// Append the markup
			$inputContainerEl.append( markup.join( "" ) );
			
			// Assign event handler to the container element, taking advantage of event bubbling
			$inputContainerEl.on( {
				'change' : _.bind( function() { this.onChange( this.getValue() ); }, this )  // Call onChange() with the new value
			} );
		},
		
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * 
		 * @param {String} value The value of the field.
		 */
		setValue : function( value ) {
			// If there is an option with the provided value, set it. Otherwise, don't set anything.
			var option = this.optionsStore.getByValue( value );
			
			if( option !== null ) {
				if( !this.rendered ) {
					this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
					
				} else {
					this.$inputContainerEl.find( ':radio[value=' + value + ']' ).prop( 'checked', true );
				}
			}
		},
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s getValue() method, which returns the value of the field.
		 * 
		 * @return {String} The value of the field.
		 */
		getValue : function() {
			if( !this.rendered ) {
				return this.value;  // If the value was set before the Component has been rendered (i.e. before the Field has been created), return that.
			} else {
				return this.$inputContainerEl.find( ':radio:checked' ).val();
			}
		}
		
	} );
	
	
	ComponentManager.registerType( 'radio', RadioField );
	ComponentManager.registerType( 'radiofield', RadioField );
	
	return RadioField;
	
} );
/*global define */
define('jqc/form/field/Text', [
	'jquery',
	'lodash',
	'jqc/util/Html',
	'jqc/ComponentManager',
	'jqc/form/field/Field'
], function( jQuery, _, Html, ComponentManager, Field ) {
	
	/**
	 * @class jqc.form.field.Text
	 * @extends jqc.form.field.Field
	 * @alias type.textfield
	 * 
	 * Text field component.
	 */
	var TextField = Field.extend( {
		
		/**
		 * @cfg {Boolean} selectOnFocus
		 * 
		 * True to have the field's text automatically selected when the field is focused. Defaults to false. 
		 */
		selectOnFocus : false,
		
		/**
		 * @cfg {String} emptyText
		 * 
		 * The text to show in the field when the field is empty. When the user enters something into the field, this 
		 * text will be removed. If the field becomes empty again, this text will be re-shown.
		 * 
		 * The implementation of the emptyText itself is an element that is placed over the field when the field is empty.
		 * This is done instead of putting in "placeholder" text so that the emptyText can easily be styled, and so that
		 * on older browsers that don't support the HTML5 "placeholder" attribute (IE8), the field doesn't need to have a
		 * value of the {@link #emptyText}.
		 */
		emptyText : "",
		
		/**
		 * @cfg {String} value
		 * 
		 * The initial value for the field, if any.
		 */
		
		/**
		 * @cfg {Boolean} readOnly
		 * 
		 * True to mark the Field as "read only" in the HTML. This prevents the user from editing the Field.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-form-TextField',
		
		
		/**
		 * @protected
		 * @property {jQuery} $inputEl
		 * 
		 * The &lt;input&gt; element; the text field. Will only be available after render.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} focused
		 * 
		 * Flag which is set to `true` while the TextField is focused.
		 */
		focused : false,
		
		/**
		 * @protected
		 * @property {jQuery} $emptyTextEl
		 * 
		 * The element that holds the {@link #emptyText}, which is shown over the {@link #$inputEl}
		 * when the field is empty.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			this.addEvents(
				/**
				 * Fires when a key is pressed down in the field.
				 * 
				 * @event keydown
				 * @param {jqc.form.field.Field} field This TextField object.
				 * @param {jQuery.Event} evt The jQuery event object for the event.
				 */
				'keydown',
				
				/**
				 * Fires when a key is pressed and let up in the field.
				 * 
				 * @event keyup
				 * @param {jqc.form.field.Field} field This TextField object.
				 * @param {jQuery.Event} evt The jQuery event object for the event.
				 */
				'keyup',
				
				/**
				 * Fires when a key is pressed in the field.
				 * 
				 * @event keypress
				 * @param {jqc.form.field.Field} field This TextField object.
				 * @param {jQuery.Event} evt The jQuery event object for the event.
				 */
				'keypress'
			);
			
			// If a value was provided, and it is not a string, convert it to one now. normalizeValue handles all datatypes.
			this.value = this.normalizeValue( this.value );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function( container ) {
			// Call superclass onRender()
			this._super( arguments );
			
			// Create the input field, and append it to the $inputContainerEl with the 'text' css class
			var $inputEl = this.$inputEl = this.createInputEl().appendTo( this.$inputContainerEl );
			
			// Add event handlers to the input element
			$inputEl.on( {
				change   : _.bind( function( evt ) { this.onChange( this.getValue() ); }, this ),  // Call onChange() with the new value
				focus    : _.bind( this.onFocus, this ),
				blur     : _.bind( this.onBlur, this ),
				keydown  : _.bind( this.onKeyDown, this ),
				keyup    : _.bind( this.onKeyUp, this ),
				keypress : _.bind( this.onKeyPress, this )
			} );
			
			// Set up the empty text element. This element is absolutely positioned in the inputContainer, and is initially hidden.
			this.$emptyTextEl = jQuery( '<div class="' + this.componentCls + '-emptyText">' + this.emptyText + '</div>' )
				.on( 'click', function() { $inputEl.focus(); } )  // when the emptyText itself is clicked, focus the text field
				.appendTo( this.$inputContainerEl );
			
			this.handleEmptyText();
		},
		
		
		/**
		 * Overridable method for creating the input element for the TextField. This may be overrided in a subclass for
		 * a different implementation than the regular &lt;input type="text"&gt; element.  The implementation should
		 * add the field's "id" ({@link #inputId}) and "name" ({@link #inputName}) properties, and populate the field's
		 * initial {@link #value}.
		 * 
		 * @protected
		 * @return {jQuery}
		 */
		createInputEl : function() {
			var value = Html.encode( this.value || "" );
			return jQuery( [ 
				'<input type="text"',
				' id="' + this.inputId + '"',
				' name="' + this.inputName + '"',
				' class="' + this.componentCls + '-input"',
				' value="' + value + '"',
				( this.readOnly ? ' readonly="readonly"' : '' ),
				'/>'
			].join( "" ) );
		},
		
		
		/**
		 * Retrieves the input element from the TextField. Use only if absolutely needed however, otherwise relying on the public
		 * interface to this class to perform common tasks such as getting/setting the value, or focusing/blurring the field.  
		 * This is mainly an accessor for the bevhavior state objects that operate on this class. The input element will not be
		 * available until the TextField has been rendered.
		 * 
		 * @return {jQuery} The input element if the component is rendered, or null if it is not.
		 */
		getInputEl : function() {
			return this.$inputEl || null;
		},
		
		
		/**
		 * Normalizes the value provided to a valid TextField value. Converts undefined/null into an empty string,
		 * and numbers/booleans/objects into their string form.
		 * 
		 * @protected
		 * @param {Mixed} value
		 * @return {String}
		 */
		normalizeValue : function( value ) {
			// Normalize undefined/null to an empty string, and numbers/booleans/objects to their string representation.
			// Otherwise, return string values unchanged.
			if( typeof value === 'undefined' || value === null ) {
				return "";
			} else if( typeof value !== 'string' ) {
				return value.toString();
			} else {
				return value;
			}
		},
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * 
		 * @param {String} value The value of the field.
		 */
		setValue : function( value ) {
			value = this.normalizeValue( value );
			
			if( !this.rendered ) {
				this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.
				
			} else {
				this.$inputEl.val( value );
			}
			
			// Run onchange, to notify listeners of a change
			this.onChange( value );
		},
		
		
		/**
		 * Implementation of {@link jqc.form.field.Field Field}'s getValue() method, which returns the value of the field.
		 * 
		 * @return {String} The value of the field.
		 */
		getValue : function() {
			if( !this.rendered ) {
				// If the value was set before the Component has been rendered (i.e. before the Field has been created), return that.
				return this.value;
				
			} else {
				return this.$inputEl.val();
			}
		},
		
		
		/**
		 * Sets the {@link #emptyText} for the Field.
		 * 
		 * @param {Mixed} emptyText The empty text to set to the Field.
		 */
		setEmptyText : function( emptyText ) {
			this.emptyText = emptyText;
			
			if( this.rendered ) {
				this.$emptyTextEl.html( emptyText );
			}
		},
		
		
		/**
		 * Retrieves the {@link #emptyText} of the Field.
		 * 
		 * @return {Mixed} The {@link #emptyText} that was specified for the Field, or set using {@link #setEmptyText}.
		 */
		getEmptyText : function() {
			return this.emptyText;
		},
		
		
		/**
		 * Selects the text in the TextField.
		 */
		select : function() {
			this.$inputEl.select();
		},
		
		
		/**
		 * Extension of onChange template method used to handle the {@link #emptyText}.
		 *
		 * @protected
		 */
		onChange : function() {
			this.handleEmptyText();
			
			this._super( arguments );
		},
		
		
		/**
		 * Focuses the text field.
		 * 
		 * @chainable
		 */
		focus : function() {
			this.$inputEl.focus();
			
			return this._super( arguments );
		},
		
		
		/**
		 * Blurs the text field.
		 * 
		 * @chainable
		 */
		blur : function() {
			this.$inputEl.blur();
			
			return this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onFocus : function() {
			this.focused = true;
			this.handleEmptyText();
			
			// If the selectOnFocus config is true, select the text
			if( this.selectOnFocus ) {
				this.select();
			}
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onBlur : function() {
			this.focused = false;
			this.handleEmptyText();
			
			this._super( arguments );
		},
		
		
		/**
		 * Determines if the TextField is currently focused.
		 * 
		 * @return {Boolean} `true` if the TextField is currently focused, false otherwise.
		 */
		isFocused : function() {
			return this.focused;
		},
		
		
		/**
		 * Handles a keydown event in the text field. 
		 * 
		 * @protected
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyDown : function( evt ) {
			this.fireEvent( 'keydown', this, evt ); 
		},
		
		
		/**
		 * Handles a keyup event in the text field. 
		 * 
		 * @protected
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyUp : function( evt ) {
			this.fireEvent( 'keyup', this, evt );
		},
		
		
		/**
		 * Handles a keypress in the text field. 
		 * 
		 * @protected
		 * @param {jQuery.Event} evt The jQuery event object for the event.
		 */
		onKeyPress : function( evt ) {
			this.fireEvent( 'keypress', this, evt ); 
		},
		
		
		// ---------------------------------------
		
		// Empty Text Handling Utility Methods
		
		/**
		 * Checks the TextField to see if it's empty, and if so shows the {@link #emptyText}.
		 * 
		 * @protected
		 */
		handleEmptyText : function() {
			if( this.rendered ) {
				// Field is not focused and its value is empty, show the empty text. Otherwise, hide it.
				this.$emptyTextEl[ ( !this.focused && this.getValue() === "" ) ? 'show' : 'hide' ]();
			}
		}
		
	} );
	
	
	ComponentManager.registerType( 'textfield', TextField );

	return TextField;
	
} );
/*global define */
define('jqc/form/field/TextArea', [
	'jquery',
	'lodash',
	'jqc/util/Css',
	'jqc/ComponentManager',
	'jqc/form/field/Text'
], function( jQuery, _, Css, ComponentManager, TextField ) {
	
	/**
	 * @class jqc.form.field.TextArea
	 * @extends jqc.form.field.Text
	 * @alias type.textarea
	 * @alias type.textareafield
	 * 
	 * TextArea field component.
	 */
	var TextAreaField = TextField.extend( {
		
		/**
		 * @cfg {Boolean} autoGrow
		 * True to auto-grow the text field as the user types into it. Defaults to false.
		 * 
		 * Note that if autoGrow is true, the textarea will be given the "resize: none" style for Chrome and Safari, so that
		 * the resize handle is removed. The resize handle does not make sense for auto-grow textareas because the textarea size
		 * is recalculated and applied on every key press (so if they drag it bigger, and then keep typing, it
		 * will just be resized back to its calculated height.
		 */
		autoGrow : false,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-form-TextAreaField',
		
		
		/**
		 * @protected
		 * @property {jQuery} $inputEl
		 * 
		 * The &lt;input&gt; element; the textarea field.
		 */
		
		/**
		 * @private
		 * @property {String[]} autoGrowMimicStyles
		 * 
		 * An array of the CSS properties that should be applied to the div that will mimic the textarea's text when {@link #autoGrow}
		 * is true.
		 */
		autoGrowMimicStyles : [ 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontSize', 'lineHeight', 'fontFamily', 'width', 'fontWeight' ],
		
		/**
		 * @private
		 * @property {jQuery} $autoGrowTwinDiv
		 * 
		 * A div element that is created if the {@link #autoGrow} config is true, to be a "twin" of the textarea. The content of the textarea will be copied to
		 * this div so that it can be measured for its height, and then that height value can be applied to the textarea itself to "autogrow" it.
		 */
		
		/**
		 * @private
		 * @property {Object} autoGrowComputedStyles
		 * 
		 * An object that holds the computed styles for the {@link #autoGrow} feature.
		 */
		
		/**
		 * @private 
		 * @property {Function} autoGrowPasteHandler
		 * 
		 * A reference to the function created as the document paste handler, for when {@link #autoGrow} is true. This reference is maintained so that
		 * the document level handler can be removed when the field is destroyed.
		 */
		
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			
			// If there was a 'height' configured on the Component, size the actual textarea element according to the heights
			// of the other elements that are part of the field.
			if( 'height' in this ) {
				var inputElHeight = this.height;
				
				// Leave room for a "top" label
				if( this.labelAlign === 'top' ) {
					inputElHeight -= this.$labelEl.outerHeight( /* includeMargin */ true );
				}
				
				// Minus off the top/bottom margin/padding of the $inputContainerEl and the $inputEl itself
				inputElHeight -= Css.getMargin( this.$inputContainerEl, 'tb' ) + Css.getPadding( this.$inputContainerEl, 'tb' );
				inputElHeight -= Css.getMargin( this.$inputEl, 'tb' ) + Css.getPadding( this.$inputEl, 'tb' );
				
				// And finally, minus off the height of the "extraMsg" element (if there is actually 'extraMsg' text)
				if( this.extraMsg ) {
					inputElHeight -= this.$extraMsgEl.outerHeight( /* includeMargin */ true );
				}
				
				this.$inputEl.css( 'height', inputElHeight + 'px' );
			}
			
			
			// Handle autogrowing textareas
			if( this.autoGrow ) {
				var mimicStyles = this.autoGrowMimicStyles,
				    $textarea   = this.$inputEl,
				    $twin       = jQuery( '<div />' ).css( { 'position': 'absolute', 'display': 'none', 'word-wrap': 'break-word' } ),
				    lineHeight  = parseInt( $textarea.css( 'line-height' ), 10 ) || parseInt( $textarea.css( 'font-size' ), 10 ),
				    minHeight   = parseInt( $textarea.css( 'height' ), 10 ) || lineHeight * 3,
				    maxHeight   = parseInt( $textarea.css( 'max-height' ), 10 ) || Number.MAX_VALUE;
				
				// Opera returns max-height of -1 if not set
				if( maxHeight < 0 ) {
					maxHeight = Number.MAX_VALUE;
				}
				
				// For Chrome and Safari, remove the browser-inserted "resize" handle. It doesn't make sense for auto-grow textareas
				// because the size is recalculated and applied on every key press (so if they drag it bigger, and then keep typing, it
				// will just be resized back to its calculated height.
				$textarea.css( 'resize', 'none' );
				
				// Store the lineHeight, minHeight, and maxHeight values
				this.autoGrowComputedStyles = {
					lineHeight : lineHeight,
					minHeight  : minHeight,
					maxHeight  : maxHeight
				};
				
				
				// Append the twin to the DOM
				// We are going to measure the height of this, not the textarea.
				$twin.appendTo( $textarea.parent() );
				
				// Copy the essential styles (mimics) from the textarea to the twin
				var i = mimicStyles.length;
				while( i-- ) {
					$twin.css( mimicStyles[ i ], $textarea.css( mimicStyles[ i ] ) );
				}
				
				
				// Hide scrollbars, but make sure that the height of the $textarea doesn't shrink when setting to overflow: hidden
				$textarea.css( 'minHeight', minHeight );
				$textarea.css( 'overflow', 'hidden' );
				
				
				
				// Update textarea size on cut and paste
				$textarea.on( 'cut paste', _.bind( function() { this.updateAutoGrowHeight(); }, this ) );
				
				
				// Attempt to catch the browser paste event.
				var me = this;  // for closure
				this.autoGrowPasteHandler = function() {   
					setTimeout( function() { me.updateAutoGrowHeight(); }, 250 );  // need timeout because the paste event fires just *before* the paste is done
				};
				$textarea.on( 'paste input', this.autoGrowPasteHandler );
				
				// Save a reference to the twin element
				this.$autoGrowTwinDiv = $twin;
				
				// Run the sizing routine now that we're all set up
				this.updateAutoGrowHeight();
			}
		},
		
		
		/**
		 * Overridden method for creating the input element for the TextAreaField. This implementation
		 * creates a &lt;textarea&gt; element. See {@link jqc.form.field.Text#createInputEl} for more information.
		 * 
		 * @protected
		 * @return {jQuery}
		 */
		createInputEl : function() {
			return jQuery( [ 
				'<textarea',
				' id="' + this.inputId + '"',
				' name="' + this.inputName + '"',
				' class="' + this.componentCls + '-input"',
				( this.readOnly ? ' readonly="readonly"' : '' ),
				'>',
					( this.value || "" ),
				'</textarea>'
			].join( "" ) );  
		},
		
		
		// ----------------------------------------
		
		// AutoGrow Methods
		
		
		/**
		 * Utility method for the {@link #autoGrow} functionality. Sets a given `height` and `overflow` state on the textarea.
		 * 
		 * @private
		 * @param {Number} height
		 * @param {String} overflow
		 */ 
		setHeightAndOverflow : function( height, overflow ) {
			var $textarea = this.$inputEl,
			    curatedHeight = Math.floor( parseInt( height, 10 ) );
			    
			if( $textarea.height() !== curatedHeight ) {
				$textarea.css( { 'height': curatedHeight + 'px', 'overflow': overflow } );
			}
		},
		
		
		
		/**
		 * Utility method for the {@link #autoGrow} functionality. Update the height of the textarea, if necessary.
		 * 
		 * @private
		 */
		updateAutoGrowHeight : function() {
			if( this.rendered ) {
				var $textarea = this.$inputEl,
				    $twin = this.$autoGrowTwinDiv,
				    computedStyles = this.autoGrowComputedStyles;
				
				// Get curated content from the textarea.
				var textareaContent = $textarea.val().replace( /&/g,'&amp;' ).replace( / {2}/g, '&nbsp;' ).replace( /<|>/g, '&gt;' ).replace( /\n/g, '<br />' );
				
				// Compare curated content with curated twin.
				var twinContent = $twin.html().replace( /<br>/ig, '<br />' );
				if( textareaContent + '&nbsp;' !== twinContent ) {
					// Add an extra white space so new rows are added when you are at the end of a row.
					$twin.html( textareaContent + '&nbsp;' );
					
					// Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
					if( Math.abs( $twin.height() + computedStyles.lineHeight - $textarea.height() ) > 3 ) {
						var goalHeight = $twin.height() + computedStyles.lineHeight;
						
						if( goalHeight >= computedStyles.maxHeight ) {
							this.setHeightAndOverflow( computedStyles.maxHeight, 'auto' );
							
						} else if( goalHeight <= computedStyles.minHeight ) {
							this.setHeightAndOverflow( computedStyles.minHeight, 'hidden' );
							
						} else {
							this.setHeightAndOverflow( goalHeight, 'hidden' );
						}
					}
				}
			}
		},
		
		
		// protected
		setValue : function() {
			this._super( arguments );
			
			// After the value is set, update the "auto grow" height
			if( this.autoGrow ) {
				this.updateAutoGrowHeight();
			}
		},
		
		
		// protected
		onChange : function() {
			this._super( arguments );
			
			if( this.autoGrow ) {
				this.updateAutoGrowHeight();
			}
		},
		
		
		// protected
		onKeyUp : function( evt ) {
			this._super( arguments );
			
			if( this.autoGrow ) {
				this.updateAutoGrowHeight();
			}
		},
		
		
		// protected
		onBlur : function() {
			this._super( arguments );
			
			// Compact textarea on blur (if the autoGrow config is true)
			if( this.autoGrow ) {
				var $textarea = this.$inputEl,
				    $twin = this.$autoGrowTwinDiv,
				    computedStyles = this.autoGrowComputedStyles;
				
				if( $twin.height() < computedStyles.maxHeight ) {
					if( $twin.height() > computedStyles.minHeight ) {
						$textarea.height( $twin.height() );
					} else {
						$textarea.height( computedStyles.minHeight );
					}
				}
			}
		},
		
		
		// ----------------------------------------
		
		
		// protected
		onDestroy : function() {
			if( this.autoGrow && this.rendered ) {
				// Remove the sizing div
				this.$autoGrowTwinDiv.remove();
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'textarea', TextAreaField );
	ComponentManager.registerType( 'textareafield', TextAreaField );
	
	return TextAreaField;
	
} );
/*global define */
define('jqc/form/field/autocomplete/Menu', [
	'jqc/Overlay'
], function( Overlay ) {
	
	/**
	 * @abstract
	 * @class jqc.form.field.autocomplete.Menu
	 * @extends jqc.Overlay
	 * 
	 * Base class for the actual menu that is displayed to the user as they type, in the 
	 * {@link jqc.form.field.autocomplete.Autocomplete Autocomplete} field.
	 */
	var AutocompleteMenu = Overlay.extend( {
		abstractClass : true,
		
		/**
		 * @cfg {data.Collection} collection (required)
		 * 
		 * The Collection which is used to provide the suggestions.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires when an item has been selected. This event is listened to by the {@link jqc.form.field.autocomplete.Autocomplete Autocomplete}
				 * field, for its own {@link jqc.form.field.autocomplete.Autocomplete#select select} event, and select actions.
				 * 
				 * @event select
				 * @param {jqc.form.field.autocomplete.Menu} menu This Menu instance.
				 */
				'select'
			);
			
			this._super( arguments );
		}
		
	} );
	
	
	return AutocompleteMenu;
	
} );
/*global define */
define('jqc/form/field/autocomplete/ListMenu', [
	'jqc/form/field/autocomplete/Menu'
], function( AutocompleteMenu ) {
	
	/**
	 * @class jqc.form.field.autocomplete.Menu
	 * @extends jqc.Overlay
	 * 
	 * Implements a list-style menu for the {@link jqc.form.field.autocomplete.Autocomplete Autocomplete} field.
	 * This is the default class that will be instantiated for an Autocomplete field, if no other instance is provided
	 * to the Autocomplete's {@link jqc.form.field.autocomplete.Autocomplete#menu} config.
	 */
	var AutocompleteListMenu = AutocompleteMenu.extend( {
		
		
		
	} );
	
	
	return AutocompleteListMenu;
	
} );
/*global define */
define('jqc/form/field/autocomplete/Autocomplete', [
	'jqc/form/field/Text',
	'jqc/form/field/autocomplete/Menu',
	'jqc/form/field/autocomplete/ListMenu'  // the default implementation
], function( TextField, AutocompleteMenu, AutocompleteListMenu ) {
	
	/**
	 * @class jqc.form.field.autocomplete.Autocomplete
	 * @extends jqc.form.field.Text
	 * 
	 * Field which allows a user to begin typing in a value, and then is presented with suggestions in an 
	 * overlay that appears below the field.
	 */
	var Autocomplete = TextField.extend( {
		
		/**
		 * @cfg {data.Collection} collection (required)
		 * 
		 * The Collection which is used to provide the suggestions. This may be used with local data that is already
		 * populated in the collection, or it may be loaded from a remote data source using the Collection's configured
		 * {@link data.Collection#proxy proxy}.
		 */
		
		/**
		 * @cfg {Object/jqc.form.field.autocomplete.Menu} menu
		 * 
		 * The Autocomplete Menu that displays the suggestions to the user while he/she types.
		 * 
		 * This may be either a configuration object for the {@link jqc.form.field.autocomplete.Menu} that will be internally 
		 * instantiated, or a {@link jqc.form.field.autocomplete.Menu Menu} instance. 
		 */
		
		/**
		 * @cfg {Number} minChars
		 * 
		 * The minimum number of characters that must be typed before the Autocomplete's suggestion {@link #menu} is shown.
		 */
		
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			this.addEvents(
				/**
				 * Fires when an item has been selected in the Autocomplete's {@link #menu}.
				 * 
				 * @event select
				 * @param {jqc.form.field.autocomplete.Autocomplete} autocomplete This Autocomplete instance.
				 */
				'select'
			);
			
			// If the `menu` provided was an anonymous configuration object, instantiate a ListMenu
			if( !this.menu instanceof AutocompleteMenu ) {
				this.menu = new AutocompleteListMenu( this.menu );
			}
		}
		
	} );
	
	return Autocomplete;
	
} );
/*global define */
define('jqc/layout/Card.Transition', [
	'Class',
	'jqc/Jqc'
], function( Class, Jqc ) {
	
	/**
	 * @abstract
	 * @class jqc.layout.Card.AbstractTransition
	 * @extends Object
	 * 
	 * Defines the interface for all {@link jqc.layout.Card} strategies for changing the active card.
	 */
	var CardTransition = Class.extend( Object, {
		abstractClass : true,
		
		
		/**
		 * Sets the active item that should be transitioned to.
		 * 
		 * @abstract
		 * @method setActiveItem
		 * @param {jqc.layout.Card} cardsLayout The CardsLayout instance that is using this transition strategy.
		 * @param {jqc.Component} currentItem The currently active item. This may be null if the CardsLayout does not currently have an active item.
		 * @param {jqc.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
		 * @param {Object} options An object which may contain options for the given AbstractTransition subclass that is being used.
		 */
		setActiveItem : Class.abstractMethod,
		
		
		/**
		 * Destroys the CardsLayout transition strategy. Subclasses should extend the onDestroy method to implement 
		 * any destruction process they specifically need.
		 * 
		 * @method destroy
		 */
		destroy : function() {
			this.onDestroy();
		},
		
		
		/**
		 * Template method that subclasses should extend to implement their own destruction process.
		 * 
		 * @protected
		 * @template
		 * @method onDestroy
		 */
		onDestroy : Jqc.emptyFn
		
	} );
	
	return CardTransition;
	
} );
/*global define */
define('jqc/layout/Card.SwitchTransition', [
	'jqc/Container',
	'jqc/layout/Card.Transition'
], function( Container, CardTransition ) {
	
	/**
	 * @class jqc.layout.Card.SwitchTransition
	 * @extends jqc.layout.Card.AbstractTransition
	 * 
	 * {@link jqc.layout.Card} transition strategy for switching cards immediately by simply hiding the "currently active" card
	 * and then showing the new card. This is the default {@link jqc.layout.Card CardsLayout} transition strategy for changing
	 * the active card.
	 */
	var CardSwitchTransition = CardTransition.extend( {
		
		/**
		 * Sets the active item that should be transitioned to.
		 * 
		 * @method setActiveItem
		 * @param {jqc.layout.Card} cardsLayout The CardsLayout instance that is using this transition strategy.
		 * @param {jqc.Component} currentItem The currently active item. This may be null if the CardsLayout does not currently have an active item.
		 * @param {jqc.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
		 * @param {Object} options There are no options for this {@link jqc.layout.Card.AbstractTransition} subclass, so this argument is ignored.
		 */
		setActiveItem : function( cardsLayout, currentItem, newItem, options ) {
			// First, hide the currently active item, if the currently active item is an instantiated component (i.e. not null)
			if( currentItem ) {
				currentItem.hide();
			}
			
			// Now show the newly active item (if it is not null)
			if( newItem ) {
				newItem.show();
				
				if( newItem instanceof Container ) {
					newItem.doLayout();
				}
			}
		}
		
	} );
	
	return CardSwitchTransition;
	
} );
/*global define */
define('jqc/layout/Card', [
	'jqc/Component',
	'jqc/Container',
	'jqc/layout/Layout',
	'jqc/layout/Card.SwitchTransition'
], function( Component, Container, Layout, SwitchTransition ) {
	
	/**
	 * @class jqc.layout.Card
	 * @extends jqc.layout.Layout
	 * @alias layout.card
	 * 
	 * A layout that renders a {@link jqc.Container Container's} child components where only one child (card) can be shown 
	 * at a time (such as showing only the top card in a deck of cards).  Methods are available in this class to control
	 * which card is shown.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'card'.
	 */
	var CardLayout = Layout.extend( {
		
		/**
		 * @cfg {Number/jqc.Component} activeItem
		 * 
		 * The item number or {@link jqc.Component} reference to set as the initially active item. Defaults to 0 (for the first item). 
		 * If this is a {@link jqc.Component}, it should be a {@link jqc.Component Component} that exists in the {@link #container}.
		 */
		activeItem : 0,
		
		/**
		 * @cfg {Boolean} fit
		 * 
		 * By default, the CardLayout lets each child component determine its own size ("auto" or "content" sizing), but this 
		 * config may be set to `true` to have the width/height of the child component be sized to take up the available space 
		 * in the target element (much like the {@link jqc.layout.Fit Fit} layout would do).
		 */
		fit : false,
		
		/**
		 * @cfg {jqc.layout.Card.AbstractTransition} transition The {@link jqc.layout.Card.AbstractTransition AbstractTransition} subclass to use
		 * for switching between cards. The default transition is the {@link jqc.layout.Card.SwitchTransition SwitchTransition}, which simply hides
		 * the currently active card, and shows the new card. This may be changed to provide a different method of changing cards, such as to implement
		 * animation. 
		 */
		
		/**
		 * @cfg {Boolean} deferredRender
		 * True to only render a child {@link jqc.Component component} once it is shown, false to render all child components immediately.
		 * Leaving this as true can improve initial rendering time, as only the shown component's rendering routine is actually performed.
		 * However, switching to a new component the first time may be slightly delayed as that component must be rendered and laid out.
		 */
		deferredRender : true,
		
		
		/**
		 * @protected
		 * @property {Object} componentSizeCache
		 * 
		 * A hashmap of component's uuid's (retrieved with {@link jqc.Component#getUuid}) and an inner hashmap
		 * with width and height properties, which stores the last set width/height for each component in the CardLayout.
		 */
		
		
		
		/**
		 * @inheritdoc
		 */
		initLayout : function() {
			this.addEvents(
				/**
				 * Fires when the active item has been changed.
				 * 
				 * @event cardchange
				 * @param {jqc.layout.Card} cardLayout This CardLayout instance.
				 * @param {jqc.Component} card The {@link jqc.Component} instance of the card that was activated. If no card has
				 *   been activated (either by a null argument to {@link #setActiveItem}, or an index out of range), then this
				 *   will be null.
				 * @param {jqc.Component} previousCard The previously active card ({@link jqc.Component}), if there was one.
				 *   If there was no previously active card, then this will be `null`.
				 */
				'cardchange'
			);
			
			this.componentSizeCache = {};
			
			// Create the default transition strategy object if none was provided 
			if( !this.transition ) {
				this.transition = new SwitchTransition();
			}
			
			// Call superclass initLayout
			this._super( arguments );
		},
		
		
		/**
		 * Layout implementation for CardLayout, which renders each child component into the Container's content target 
		 * (see {@link jqc.Component#getContentTarget}), and then hides them.  The one given by the {@link #activeItem}
		 * config is then shown.
		 * 
		 * @protected
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {
			this._super( arguments );
			
			// First normalize the activeItem config to the jqc.Component it refers to.
			if( typeof this.activeItem === 'number' ) {
				this.activeItem = this.getContainer().getItemAt( this.activeItem );
			}
			
			
			var targetWidth = $targetEl.width(),
			    targetHeight = $targetEl.height();
			
			if( this.deferredRender ) {
				if( this.activeItem !== null ) {
					this.renderAndSizeCard( this.activeItem, $targetEl, targetWidth, targetHeight );
				}
				
			} else {
				// We're not doing deferred rendering, so render all child Components, and just hide them if they are not the activeItem.
				for( var i = 0, len = childComponents.length; i < len; i++ ) {
					// render the child Component into the Container's content target element, and size it
					this.renderAndSizeCard( childComponents[ i ], $targetEl, targetWidth, targetHeight );
					
					// Hide the child Component if it is not the activeItem.
					// This sets the initial state of the CardLayout to show the activeItem, while all others are hidden.
					if( this.activeItem !== childComponents[ i ] ) {
						childComponents[ i ].hide();
					}
				}
			}
		},
		
		
		/**
		 * Renders (if need be) and sizes the given `component` to the size of the `targetWidth` and `targetHeight`.
		 * 
		 * @protected
		 * @param {jqc.Component} component The card ({@link jqc.Component}) which is to be rendered and sized.
		 * @param {jQuery} $targetEl The target element where the component is to be rendered.
		 * @param {Number} targetWidth The width to size the card component to (if the {@link #fit} config is `true`).
		 * @param {Number} targetHeight The height to size the card component to (if the {@link #fit} config is `true`).
		 */
		renderAndSizeCard : function( component, $targetEl, targetWidth, targetHeight ) {
			// Render the component (note: this will only be done if the component is not yet rendered, or needs to be moved into the $targetEl)
			this.renderComponent( component, $targetEl );
			
			// Size the child component to the full size of the target width and height if the `fit` config has been set 
			// to true (and it's not currently the same size). Can only do this now that the component has been rendered, 
			// as the sizeComponent() method needs to account for the component's padding/border/margin.
			if( this.fit ) {
				var componentUuid = component.getUuid(),
				    componentSizeCache = this.componentSizeCache,
				    lastComponentSize = componentSizeCache[ componentUuid ] || {};
				
				// Note: letting the browser manage widths at this point. Components take up full widths by default.
				if( /*targetWidth !== lastComponentSize.width ||*/ targetHeight !== lastComponentSize.height ) {
					this.sizeComponent( component, /*targetWidth*/ undefined, targetHeight );
					
					componentSizeCache[ componentUuid ] = {
						//width  : targetWidth,  -- letting widths be managed by the browser
						height : targetHeight
					};
				}
			}
		},
		
		
		// --------------------------------
		
		
		/**
		 * Sets the active item.
		 * 
		 * @param {jqc.Component/Number} item The jqc.Component to set as the active item, or the item index to set as the active item (0 for the first item).
		 *   Note that if a jqc.Component is provided, it must be an *instantiated* jqc.Component, and not the anonymous config object used to create the jqc.Component.
		 * @param {Object} options (optional) An object which will be passed along as options to the CardLayout {@link #transition}. See the setActiveItem method in the
		 *   {jqc.layout.Card.AbstractTransition AbstractTransition} subclass that you are using for a list of valid options (if any).
		 */
		setActiveItem : function( item, options ) {
			// Item was provided as a number, find the Component
			if( typeof item === 'number' ) {
				item = this.container.getItemAt( item );
				
			} else if( item instanceof Component && !this.container.has( item ) ) {
				item = null;  // if the item is not in the Container, set to null. Shouldn't switch to a Component that is not in the Container.
			}
			
			var previousActiveItem;
			
			if( !this.container.isRendered() ) {
				// The Container that this layout belongs to is not rendered, just set the activeItem config to the requested item.
				// This method will be run again as soon as the Container is rendered, and its layout is done.
				if( this.activeItem !== item ) {
					previousActiveItem = this.activeItem;
					
					this.activeItem = item;
					this.fireEvent( 'cardchange', this, item, previousActiveItem );
				}
				
			} else {
				// Make a change to the cards if:
				//  1) The new item is null -- we must remove the currently active item
				//  2) The new item is a component, but different from the activeItem -- we must switch the cards
				//  3) The new item is a component and is the activeItem, but is hidden -- we must show it
				if( !item || this.activeItem !== item || !item.isRendered() || item.isHidden() ) {
					
					// Delegate to the transition strategy for the change in cards (active item)
					// Make sure the activeItem is passed in only if it is an instantiated jqc.Component (i.e. not null, and not the numbered config)
					previousActiveItem = this.activeItem;
					if( !( previousActiveItem instanceof Component ) ) {
						previousActiveItem = null;
					}
					
					// Render the card (Component) if it is not yet rendered (and of course, exists)
					if( item !== null ) {
						var $targetEl = this.container.getContentTarget();
						this.renderAndSizeCard( item, $targetEl, $targetEl.width(), $targetEl.height() );
					}
					
					// Then delegate to the transition to make the change
					this.transition.setActiveItem( this, previousActiveItem, item, options );
					
					// store the new currently active item (even if it is null), and fire the event
					this.activeItem = item;
					this.fireEvent( 'cardchange', this, item, previousActiveItem );
				}
			}
		},
		
		
		/**
		 * Gets the currently active item. Returns null if there is no active item. 
		 * 
		 * @return {jqc.Component} The Component that is currently shown as the active item. Returns null if there is no active item.
		 */
		getActiveItem : function() {
			var activeItem = this.activeItem;
			
			if( activeItem instanceof Component || activeItem === null ) {
				return activeItem;
			} else {
				return this.container.getItemAt( activeItem );
			}
		},
		
		
		/**
		 * Gets the active item index (i.e. the 0-based tab number that is currently selected). If there is no currently active item, returns -1.
		 * If the layout has not yet executed, this will return the value of the activeItem config if it is a number.
		 * 
		 * @return {Number} The index of the item that is currently shown as the active item. Returns -1
		 *   if there is no active item.
		 */
		getActiveItemIndex : function() {
			var activeItem = this.activeItem;
			
			if( activeItem === null ) {
				return -1;
			} else if( activeItem instanceof Component ) {
				return this.container.getItemIndex( activeItem );
			} else {
				return activeItem;  // still a number config (i.e. the layout hasn't been run), return that
			}
		},
		
		
		// --------------------------------------------
		
		
		/**
		 * Extended onDestroy method for the CardLayout to destroy its CardLayout {@link jqc.layout.Card.AbstractTransition} object.
		 * 
		 * @protected
		 */
		onDestroy : function() {
			// Destroy the transition strategy object
			this.transition.destroy();
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the layout type with the jqc.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'card', CardLayout );
	
	return CardLayout;

} );
/*global define */
define('jqc/layout/Column', [
	'Class',
	'jqc/Component',
	'jqc/Container',
	'jqc/layout/Layout'
], function( Class, Component, Container, Layout ) {

	/**
	 * @class jqc.layout.Column
	 * @extends jqc.layout.Layout
	 * @alias layout.column
	 * 
	 * A layout that renders a {@link jqc.Container Container's} child components into columns. Each child component
	 * in the Container should have a special property named `columnWidth`, that determines how wide the column
	 * should be.  This property can either be a number, or any css width value.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'column'.
	 */
	var ColumnLayout = Layout.extend( {
		
		/**
		 * @protected
		 * @property {jQuery} $columnDivEls
		 * 
		 * The set of the divs created to place each of the child components into.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} columnsLayoutInitialized
		 * 
		 * True if the columns layout has been initialized from a first layout run.
		 */
		
		
		/**
		 * Layout implementation for ColumnsLayout, which renders each child component as columns into the 
		 * Container's content target (see {@link jqc.Component#getContentTarget).  Each child component in the
		 * Container should have a special property named `columnWidth`, that determines how wide the column
		 * should be.  This property can either be a number, or any css width value.
		 * 
		 * @protected
		 * @method onLayout
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {		
			this._super( arguments );
			
			if( !this.columnsLayoutInitialized ) {
				this.initColumnsLayout( childComponents, $targetEl );
				this.columnsLayoutInitialized = true;
			} else {
				this.updateColumnsLayout( childComponents, $targetEl );
			}
		},
		
		
		/**
		 * Initializes the ColumnsLayout for its first layout run.  Subsequent layout runs
		 * are handled by {@link #updateColumnsLayout}.
		 * 
		 * @method initColumnsLayout
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		initColumnsLayout : function( childComponents, $targetEl ) {
			// Note: Concatenating the markup and appending it all at once for performance. This method is faster than appending each
			// one at a time, even with the extra step it takes to jQuery the divs afterward. Appending each one at a time
			// is ~65% slower. 
			var renderHTML = "",
			    numChildComponents = childComponents.length,
			    i;
			    
			for( i = 0; i < numChildComponents; i++ ) {
				var columnWidth = childComponents[ i ].columnWidth;
				if( typeof columnWidth !== 'undefined' ) {
					// If the columnWidth doesn't have a % sign at the end, add 'px'
					if( String( columnWidth ).lastIndexOf( '%' ) === -1 ) {
						columnWidth += "px";
					}
				} else {
					columnWidth = 'auto';  // default to 'auto'
				}
				
				// Create a div element for the column content
				renderHTML += '<div style="float: left; width: ' + columnWidth + '" />';
			}
			
			// Add clearing div for anything that comes under the columns
			renderHTML += '<div style="clear: both;" />';
			
			// Now append all of the HTML at once to the target element
			$targetEl.append( renderHTML );
			
			// Finally, render each of the child components into their div containers
			var $divs = this.$columnDivEls = $targetEl.find( 'div' );
			for( i = 0; i < numChildComponents; i++ ) {
				this.renderComponent( childComponents[ i ], $divs[ i ] );
			}
		},
		
		
		
		/**
		 * Updates the ColumnsLayout for each layout run after the first (which is handled by {@link #initColumnsLayout}.
		 * 
		 * @method updateColumnsLayout
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		updateColumnsLayout : function( childComponents, $targetEl ) {
			// TODO: Implement when needed
		},
		
		
		// -----------------------------
		
		
		// protected
		onDestroy : function() {
			if( this.columnsLayoutInitialized ) {
				this.$columnDivEls.remove();
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the layout type with the jqc.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'column', ColumnLayout );
	
	return ColumnLayout;
	
} );
/*global define */
define('jqc/layout/VBox', [
	'jqc/Container',
	'jqc/layout/Layout'
], function( Container, Layout ) {

	/**
	 * @class jqc.layout.VBox
	 * @extends jqc.layout.Layout
	 * @alias layout.vbox
	 * 
	 * A layout that renders its {@link #container container's} child components using a "flexbox" scheme. Each child component
	 * in the Container that should have a flexible height that proportionally should take up the remaining area of its parent
	 * element should have a special property named {@link #flex}, that determines how tall the box should be in relation to the
	 * available area.  This property is a number, relative to other children. If a {@link #flex} not provided, the layout uses 
	 * the component's height instead.
	 */
	var VBoxLayout = Layout.extend( {
		
		/**
		 * @cfg {Number} flex
		 * This config is to be placed on **child components** of the {@link #container}. The number is a ratio
		 * of how much space the child component should take up in relation to the remaining space in the target
		 * element, and based on other child components' flex values.
		 * 
		 * For example, the following configuration would make component #1 have ~33% height, and component #2 have
		 * ~67% height.
		 * 
		 *     layout : 'vbox',
		 *     items : [
		 *         {
		 *             flex : 1,
		 *             html : "I'm at 33% height"
		 *         },
		 *         {
		 *             flex : 2,
		 *             html : "I'm at 67% height"
		 *         }
		 *     ]
		 * 
		 * Other components may also exist in the {@link #container} that do not have a {@link #flex} value. These will be sized,
		 * and components *with* a {@link #flex} value will be flexed into the *remaining* space that is not taken up by the other
		 * components. Example:
		 * 
		 *     height : 100,    // not necessary, but just for example purposes
		 *     layout : 'vbox',
		 *     
		 *     items : [
		 *         {
		 *             html : "I will be sized based on my content. Let's say my height is 20px though, for argument's sake"
		 *         },
		 *         {
		 *             flex : 1,
		 *             html : "Since the previous component is 20px high, I will take up the remaining 80px of space"
		 *         }
		 *     ]
		 */
		
		
		/**
		 * Hook method for subclasses to override to implement their layout strategy. Implements the VBoxLayout algorithm.
		 * 
		 * @protected
		 * @template
		 * @method onLayout
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {
			this._super( arguments );
			
			
			var flexedComponents = [],
			    totalFlex = 0,
			    totalUnflexedHeight = 0,
			    i, len, childComponent, numChildComponents = childComponents.length;
			
			// First, render and lay out each of the child components that don't have a 'flex' value.
			// While we're at it, we'll add up the total flex that components which *do* have a flex value have.
			for( i = 0; i < numChildComponents; i++ ) {
				childComponent = childComponents[ i ];
				
				// Render the component (note: it is only rendered if it is not yet rendered already, or in the wrong position in the DOM)
				this.renderComponent( childComponent, $targetEl, { position: i } );
				
				// Only process the child component if it is not hidden
				if( !childComponent.isHidden() ) {
					if( !childComponent.flex ) {
						// Not a flexed component, do its layout
						childComponent.doLayout();
						totalUnflexedHeight += childComponent.getOuterHeight( /* includeMargin */ true );
						
					} else {
						// Flexed component: push it onto the flexed components processing array for the next step
						flexedComponents.push( childComponent );
						totalFlex += childComponent.flex;
					}
				}
			}
			
			// Now go through and size the other child components based on their flex values and the remaining space.
			if( totalFlex > 0 ) {
				var targetWidth = '100%', //$targetEl.width(),
				    targetHeight = $targetEl.height(),
				    remainingTargetHeight = targetHeight - totalUnflexedHeight,
				    trimmedPixels = 0;  // Stores the decimal values resulting in the division of the remainingTargetHeight divided by the flex value. 
				                        // The pixels that are trimmed off of each of the child components is added to the last item to fill the extra space.
				
				for( i = 0, len = flexedComponents.length; i < len; i++ ) {
					childComponent = flexedComponents[ i ];
					
					// Now size the flexed component based on the flex value
					var newChildHeight = ( childComponent.flex / totalFlex ) * remainingTargetHeight;
					trimmedPixels += newChildHeight % 1;            // take the decimal value from the child height. Ex: 3.25 % 1 == 0.25  (We'll use this later).
					newChildHeight = Math.floor( newChildHeight );  // and do the actual trimming off of the decimal for the new child height
					
					// If sizing the last component, add in (the smallest whole number of) the decimal value pixels that were trimmed from previous components
					if( i === len - 1 ) {
						newChildHeight += Math.floor( trimmedPixels );
					}
					
					this.sizeComponent( childComponent, targetWidth, newChildHeight );
				}
			}
		}
		
	} );
	
	
	// Register the layout type with the jqc.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'vbox', VBoxLayout );
	
	return VBoxLayout;
	
} );

/*global define */
define('jqc/tab/Tab', [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/button/Button',
	'jqc/template/LoDash'
], function( jQuery, _, ComponentManager, Button, LoDashTpl ) {

	/**
	 * @class jqc.tab.Tab
	 * @extends jqc.button.Button
	 * @alias type.tab
	 *
	 * A specialized button used as the tabs of a {@link jqc.tab.Panel TabPanel}.
	 */
	var Tab = Button.extend( {
		
		/**
		 * @cfg {jqc.panel.Panel} correspondingPanel (required)
		 * 
		 * The Panel that this tab has been created for, and corresponds to. The Panel is a child item of the parent
		 * {@link jqc.tab.Panel TabPanel}, and is needed to map the Tab to the Panel it shows.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-TabPanel-Tab',
		
		
		/**
		 * @protected
		 * @property {Boolean} active
		 * 
		 * Flag which is set to `true` when this is the active Tab. The active Tab is the one whose {@link #correspondingPanel}
		 * is the one shown in the parent {@link jqc.tab.Panel TabPanel}.
		 */
		active : false,
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// <debug>
			if( !this.correspondingPanel ) throw new Error( "`correspondingPanel` cfg required" );
			// </debug>
			
			this._super( arguments );
		},
		
		
		/**
		 * Retrieves the {@link jqc.panel.Panel Panel} that this Tab corresponds to in the parent {@link jqc.tab.Panel TabPanel}.
		 * 
		 * @return {jqc.panel.Panel}
		 */
		getCorrespondingPanel : function() {
			return this.correspondingPanel;
		},
		
		
		/**
		 * Sets the tab as the "active" tab. The active Tab is the one whose {@link #correspondingPanel}
		 * is the one shown in the parent {@link jqc.tab.Panel TabPanel}.
		 * 
		 * @chainable
		 */
		setActive : function() {
			if( !this.active ) {
				this.active = true;
				this.addCls( this.componentCls + '-active' );
			}
			
			return this;
		},
		
		
		/**
		 * Sets the tab as an "inactive" tab. This is for when the {@link #correspondingPanel} is made invisible
		 * in the parent {@link jqc.tab.Panel TabPanel}.
		 * 
		 * @chainable
		 */
		setInactive : function() {
			if( this.active ) {
				this.active = false;
				this.removeCls( this.componentCls + '-active' );
			}
			
			return this;
		},
		
		
		/**
		 * Determines if the tab is the "active" tab. The active Tab is the one whose {@link #correspondingPanel}
		 * is the one shown in the parent {@link jqc.tab.Panel TabPanel}.
		 * 
		 * @return {Boolean}
		 */
		isActive : function() {
			return this.active;
		}
		
	} );
	
	
	ComponentManager.registerType( 'tab', Tab );
	
	return Tab;
	
} );
		
/*global define */
define('jqc/tab/Bar', [
	'jqc/ComponentManager',
	'jqc/Container',
	'jqc/tab/Tab'
], function( ComponentManager, Container, Tab ) {
	
	/**
	 * @class jqc.tab.Bar
	 * @extends jqc.Container
	 * @alias type.tabbar
	 * 
	 * Specialized container for a {@link jqc.tab.Panel Tab Panel's} tabs.
	 */
	var TabBar = Container.extend( {
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		defaultType : 'tab',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-TabPanel-Bar',
		
		
		/**
		 * Sets the "active" tab based on the given activated {@link jqc.panel.Panel Panel} which corresponds
		 * to it. All other tabs will be set to "inactive".
		 * 
		 * @param {jqc.panel.Panel} panel The Panel that corresponds to the Tab that should be made active.
		 *   If `null` is provided, or a Panel that does not have a corresponding Tab, then all tabs will
		 *   be set to their "inactive" state.
		 * @chainable
		 */
		setActiveTab : function( panel ) {
			var tabs = this.getItems(), 
			    tab;
			
			for( var i = 0, len = tabs.length; i < len; i++ ) {
				tab = tabs[ i ];
				
				tab[ ( tab.getCorrespondingPanel() === panel ) ? 'setActive' : 'setInactive' ]();
			}
			return this;
		}
		
	} );
	
	
	ComponentManager.registerType( 'tabbar', TabBar );
	
	return TabBar;
	
} );
/*global define */
define('jqc/tab/Panel', [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/Component',
	'jqc/Container',
	'jqc/panel/Panel',
	'jqc/tab/Bar',
	'jqc/tab/Tab',
	'jqc/template/LoDash',
	'jqc/layout/Card'
], function( jQuery, _, ComponentManager, Component, Container, Panel, TabBar, Tab, LoDashTpl ) {

	/**
	 * @class jqc.tab.Panel
	 * @extends jqc.panel.Panel
	 * @alias type.tabpanel
	 *
	 * A basic tab container panel. Child {@link #items} must be {@link jqc.panel.Panel Panels} or Panel subclasses,
	 * as their {@link jqc.panel.Panel#title title} property is read to create the tabs.
	 * 
	 * The Tab Panel is internally configured with a {@link jqc.layout.Card Card} layout, which switches between
	 * the panels when the tabs are clicked.
	 * 
	 * By default, each child Panel has its header hidden, and takes its {@link jqc.panel.Panel#title} config
	 * to use as the tab's title. To not hide each panel's header, set the {@link #hideChildPanelHeaders} config
	 * to `false`.
	 */
	var TabPanel = Panel.extend( {
		
		/**
		 * @cfg {Number/jqc.Component} activeTab
		 * 
		 * The tab number, or {@link jqc.Component} instance to set as the initially active tab. Defaults to 0 
		 * (for the first tab). If this is a {@link jqc.Component} instance, it must exist within the TabPanel.
		 */
		activeTab : 0,
		
		/**
		 * @cfg {Boolean} hideChildPanelHeaders
		 * 
		 * `true` to hide each child panel's {@link jqc.panel.Panel#header header} when added to the Tab Panel.
		 * The headers are hidden because the tabs that are created will have the panels' titles, and having
		 * the header would just be showing that information twice. Set to `false` to disable this behavior.
		 */
		hideChildPanelHeaders : true,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		defaultType : 'panel',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		layout : 'card',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-TabPanel',
		
		
		/**
		 * @protected
		 * @property {jqc.tab.Bar} tabBar
		 * 
		 * The Container that holds the TabPanel's tabs.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires before the {@link #activeTab} is changed.
				 * 
				 * @event beforetabchange
				 * @param {jqc.tab.Panel} tabPanel This TabPanel instance.
				 * @param {jqc.panel.Panel} panel The Panel instance for the tab is to be activated.
				 * @param {jqc.panel.Panel} oldPanel The Panel instance of the tab that is to be de-activated. 
				 *   Will be null if there is no currently activated tab.
				 * @preventable
				 */
				'beforetabchange',
				
				/**
				 * Fires when the {@link #activeTab} has been changed. 
				 * 
				 * @event tabchange
				 * @param {jqc.tab.Panel} tabPanel This TabPanel instance.
				 * @param {jqc.panel.Panel} panel The Panel instance for the tab that was activated.
				 * @param {jqc.panel.Panel} oldPanel The Panel instance of the tab that was de-activated. 
				 *   Will be null if there was no previously activated tab.
				 */
				'tabchange'
			);
			
			this.tabBar = this.createTabBar();
			
			this._super( arguments );
			
			this.setActiveTab( this.activeTab );
			this.layout.on( 'cardchange', this.onTabChange, this );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.tabBar.render( this.$el, /* insert before */ this.$bodyEl );
		},
		
		
		/**
		 * Factory method to create the TabPanel's {@link #tabBar}.
		 * 
		 * @protected
		 * @return {jqc.tab.Bar}
		 */
		createTabBar : function() {
			return new TabBar();
		},
		
		
		/**
		 * Factory method used to create a {@link jqc.tab.Tab Tab} for the {@link #tabBar}.
		 * 
		 * @protected
		 * @param {jqc.panel.Panel} The Panel which a Tab is being created for. 
		 * @return {jqc.tab.Tab}
		 */
		createTab : function( panel ) {
			return new Tab( {
				text  : panel.getTitle(),
				correspondingPanel : panel
			} );
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onAdd : function( panel, idx ) {
			this._super( arguments );
			
			// <debug>
			if( !( panel instanceof Panel ) ) {
				throw new Error( "Child components added to the TabPanel must be a jqc.panel.Panel instance, or subclass" );
			}
			// </debug>
			
			
			// Create a Tab for the panel
			var tab = this.createTab( panel );
			tab.on( 'click', this.onTabClick, this );
			
			this.tabBar.insert( tab, idx );
			
			// And finally, hide the panel's header (which is done by default)
			if( this.hideChildPanelHeaders ) {
				panel.hideHeader();
			}
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRemove : function( panel, idx ) {
			// Remove the tab that corresponds to the panel from the TabBar
			var tab = this.tabBar.removeAt( idx );
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onReorder : function( panel, newIdx, oldIdx ) {
			this._super( arguments );
			
			// Reorder the Tab in the TabBar to correspond to the Panel reordering
			var tabBar = this.tabBar,
			    tab = tabBar.getItemAt( oldIdx );
			tabBar.insert( tab, newIdx );
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * Sets the active tab {@link jqc.panel.Panel Panel}.
		 * 
		 * @param {jqc.panel.Panel/Number} panel The Panel to activate in the TabPanel, or the index of the Panel in the TabPanel
		 *   (0 for the first Panel). Note that if a {@link jqc.panel.Panel Panel} is provided, it must be an *instantiated* Panel,
		 *   and not the anonymous config object used to create the Panel.
		 */
		setActiveTab : function( panel ) {
			if( typeof panel === 'number' ) {
				panel = this.getItemAt( panel );
			}
			
			var previousActiveTab = this.getActiveTab();
			if( this.fireEvent( 'beforetabchange', this, panel, previousActiveTab ) !== false ) {
				this.layout.setActiveItem( panel );
				
				this.tabBar.setActiveTab( panel );  // set the active tab based on the corresponding active Panel
			}
		},
		
		
		/**
		 * Gets the active tab ({@link jqc.panel.Panel Panel}).
		 * 
		 * @return {jqc.panel.Panel} The Panel that is currently shown as the active tab, or `null` if there is no active tab.
		 */
		getActiveTab : function() {
			return this.layout.getActiveItem();
		},
		
		
		/**
		 * Gets the {@link #activeTab} index (i.e. the 0-based tab number that is currently selected).
		 * 
		 * @return {Number} The index of the tab that is currently shown as the active tab, or -1 if there is no active tab.
		 */
		getActiveTabIndex : function() {
			return this.layout.getActiveItemIndex();
		},
		
		
		/**
		 * Handles a click to a {@link jqc.tab.Tab Tab} in the TabBar.
		 *
		 * @protected
		 * @param {jqc.tab.Tab} tab The Tab that was clicked.
		 */
		onTabClick : function( tab ) {
			this.setActiveTab( tab.getCorrespondingPanel() );  // show the Panel that corresponds to the tab
		},
		
		
		/**
		 * Method that is run after a new tab has been activated (shown).
		 * 
		 * @protected
		 * @param {jqc.layout.Card} cardLayout
		 * @param {jqc.panel.Panel} newPanel The newly activated Panel.
		 * @param {jqc.panel.Panel} oldPanel The previously activated Panel.
		 */
		onTabChange : function( cardLayout, newPanel, oldPanel ) {
			this.fireEvent( 'tabchange', this, newPanel, oldPanel );
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			this.tabBar.destroy();
			
			this._super( arguments );
		}
		
	} );
	
	ComponentManager.registerType( 'tabpanel', TabPanel );
	
	return TabPanel;
	
} );
/*global define */
define('jqc/util/CollectionBindable', [
	'lodash',
	'Class',
	'jqc/Jqc'
], function( _, Class, Jqc ) {
	
	/**
	 * @class jqc.util.CollectionBindable
	 * @extends Object
	 * 
	 * This class is intended to be used as a mixin. It allows any class that it is mixed into (the "target" class in these docs) to have 
	 * a {@link data.Collection} bound to it by providing the common functionality to allow a collection's events to be listened to and handled.
	 * These same event listeners are also removed when the collection is unbound, and the class provides the functionality to make sure that
	 * the same collection isn't bound over itself.
	 * 
	 * This mixin provides the basic method to {@link #bindCollection bind a collection}, which automatically unbinds any previously-bound 
	 * {@link data.Collection Collection} in the process. Classes using this mixin should implement the {@link #getCollectionListeners} method, 
	 * to specify which listeners should automatically be attached when a collection is bound, and unattached when the collection is unbound.
	 * 
	 * The target class may also implement the {@link #onCollectionBind} method, to detect and handle when a new {@link data.Collection} has
	 * been bound, and/or when the currently-bound collection has been unbound.
	 * 
	 * Here is an example of mixing this class into a {@link jqc.Component Component}, to make the Component data-bound to a Collection:
	 * 
	 *     define( [
	 *         'jqc/Component',
	 *         'jqc/util/CollectionBindable'
	 *     ], function( Component, CollectionBindable ) {
	 *         
	 *         var MyBindableComponent = Component.extend( {
	 *             mixins : [ CollectionBindable ],
	 *             
	 *             
	 *             initComponent : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 // Call CollectionBindable's constructor, in the scope of this object.
	 *                 // Even though there is no implementation in the CollectionBindable constructor 
	 *                 // at this time, it is a good idea in case an implementation is added in the future.
	 *                 CollectionBindable.call( this );
	 *             }
	 *             
	 *             // ...
	 *             
	 *             
	 *             // Specifies the listeners that will be added to the collection
	 *             getCollectionListeners : function( collection ) {
	 *                 return {
	 *                     'load'   : this.onLoad,          // listen to `load` and `change`
	 *                     'change' : this.onModelChange,   // events of the bound collection
	 *                     scope    : this
	 *                 };
	 *             },
	 *             
	 *             
	 *             onLoad : function( collection ) {
	 *                 // handle the collection's `load` event here
	 *             },
	 *             
	 *             onModelChange : function( collection ) {
	 *                 // handle a model in the bound collection changing here
	 *             },
	 *             
	 *             
	 *             // ...
	 *             
	 *             
	 *             onDestroy : function() {
	 *                 // Don't forget to unbind any currently-bound collection when the Component 
	 *                 // is destroyed!
	 *                 this.unbindCollection();
	 *                 
	 *                 this._super( arguments );
	 *             }
	 *             
	 *         } );
	 *         
	 *         return MyBindableComponent;
	 *         
	 *     } );
	 */
	var CollectionBindable = new Class( {
		
		/**
		 * @protected
		 * @cfg {String} collectionProp
		 * 
		 * The name of the property which stores the {@link data.Collection} that is bound to this object
		 * (i.e. the object that this class is mixed into).
		 * 
		 * This property can be specified by the mixed-into class, to change the property name that it stores
		 * the collection under.
		 */
		collectionProp : 'collection',
		
		
		/**
		 * @private
		 * @property {Object} collectionListeners
		 * 
		 * The listeners that were bound to the currently stored {@link data.Collection}, in the {@link #bindCollectionListeners}
		 * method. If there has been no Collection bound to this view yet, this will be `undefined`.
		 */
		
		/**
		 * @private
		 * @property {Boolean} firstCollectionBindComplete
		 * 
		 * Property which is set to true after an initial collection bind has been made.
		 */
		
		
		/**
		 * Binds a {@link data.Collection} to this object. The collection will be set to the property specified by
		 * the {@link #collectionProp}. Any previous collection will be unbound.
		 * 
		 * @param {data.Collection} collection The Collection to bind. To unbind the currently-bound collection,
		 *   either pass `null`, or call {@link #unbindCollection} instead.
		 */
		bindCollection : function( collection ) {
			var collectionProp = this.collectionProp,
			    currentCollection = this[ collectionProp ] || null;  // normalize `undefined` to `null`, for the comparison against the `collection` arg (should the `collection` arg be null)
			
			// Only bind a new collection if it is different than the currently-bound collection. However, always accept the 
			// collection if no collection has been bound yet. This covers if the class has a config option that matches the 
			// `collectionProp` name (for instance, "collection"), in which case that initial collection should be bound. This
			// would be the case if a class calls bindCollection() with that initial collection from its constructor function.
			// The 'first bind' functionality should only happen if there is actually a collection to bind however. Don't 
			// accept `null` in this case.
			if( currentCollection !== collection || ( !this.firstCollectionBindComplete && collection ) ) {
				// If there is a current collection, and there have been listeners bound to it (i.e. it is not the initial bind
				// call from having a `collection` config), then unbind its listeners in preparation to bind a new Collection
				if( currentCollection ) {
					this.unbindCollectionListeners();
				}
				
				this[ collectionProp ] = collection;  // store the new collection
				if( collection ) {
					this.bindCollectionListeners();
				}
				this.firstCollectionBindComplete = true;
				
				// Figure out the correct "old" (previously-bound) collection. If the new collection is the same as the old 
				// collection (for the case of binding a pre-configured collection), then set that to `null` for the method
				// call (as there really was no previously-bound collection).
				var oldCollection = ( currentCollection === collection ) ? null : currentCollection || null;
				this.onCollectionBind( collection, oldCollection );
			}
		},
		
		
		/**
		 * Unbinds the currently-bound {@link data.Collection}, if there is one. Removes its event listeners (which are
		 * specified by the {@link #getCollectionListeners} method), and then sets the reference to the collection (governed 
		 * by the {@link #collectionProp} config) to `null`.
		 */
		unbindCollection : function() {
			var collectionProp = this.collectionProp,
			    currentCollection = this[ collectionProp ];
			
			if( currentCollection ) {
				this.unbindCollectionListeners();
				this[ collectionProp ] = null;
				
				this.onCollectionBind( null, /* the old collection */ currentCollection );
			}
		},
		
		
		/**
		 * Hook method which is called when a new {@link data.Collection} has been bound to this object using 
		 * {@link #bindCollection}. Also called when a {@link data.Collection} is unbound from this object, either
		 * by `null` being passed to {@link #bindCollection}, or {@link #unbindCollection} being called.
		 * 
		 * @protected
		 * @template
		 * @method onCollectionBind
		 * @param {data.Collection} collection The newly bound collection. Will be `null` if the previous collection was
		 *   simply unbound (i.e. `null` was passed to {@link #bindCollection}, or {@link #unbindCollection} was called). 
		 * @param {data.Collection} oldCollection The collection that was just unbound. Will be `null` if there was no
		 *   previously-bound collection.
		 */
		onCollectionBind : Jqc.emptyFn,
		
		
		/**
		 * Binds listeners to the current collection, so that the view can refresh itself upon changes. The listeners 
		 * that are set up are defined by the {@link #getCollectionListeners} method, which should be overridden by 
		 * the target class to listen for the events that are needed.
		 * 
		 * @private
		 */
		bindCollectionListeners : function() {
			var collection = this[ this.collectionProp ],
			    listeners = _.clone( this.getCollectionListeners( collection ) );  // shallow copy of the listeners
			
			collection.on( listeners );
			this.collectionListeners = listeners;
		},
		
		
		/**
		 * Retrieves an Object (map) of the listeners that should be set up on the collection when one is bound to this object. 
		 * This method should be overridden by the target class to add the events that should be listened for. Example:
		 * 
		 *     require( [
		 *         'Class',
		 *         'jqc/util/CollectionBindable'
		 *     ], function( Class, CollectionBindable ) {
		 *         
		 *         var MyBindableClass = new Class( {
		 *             mixins : [ CollectionBindable ],
		 *             
		 *             // ...
		 *             
		 *             getCollectionListeners : function( collection ) {
		 *                 return {
		 *                     'load'   : this.onLoad,
		 *                     'change' : this.onModelChange,
		 *                     scope    : this
		 *                 };
		 *             },
		 *             
		 *             
		 *             onLoad : function() {
		 *                 // ...
		 *             },
		 *             
		 *             onModelChange : function() {
		 *                 // ...
		 *             }
		 *             
		 *         } );
		 *         
		 *     } );
		 * 
		 * Note that the handler functions should always be references to functions defined in the class, not anonymous
		 * functions. The same function references are needed to unbind the collection later, and providing an anonymous
		 * function as a handler for an event will not allow the event listener to be removed.
		 * 
		 * @protected
		 * @param {data.Collection} collection The Collection being bound. Note that listeners should not be attached here,
		 *   but the Collection instance is provided in case it needs to be queried for any reason (such as for a particular 
		 *   Collection subclass type).
		 * @return {Object} An {@link Observable#addListener addListener} config object for the listeners to be added.
		 */
		getCollectionListeners : function( collection ) {
			return {};
		},
		
		
		/**
		 * Unbinds the currently-bound collection's listeners, which were set up in {@link #bindCollectionListeners}.
		 * 
		 * @private
		 */
		unbindCollectionListeners : function() {
			var currentCollection = this[ this.collectionProp ];
			if( currentCollection && this.collectionListeners ) {
				currentCollection.un( this.collectionListeners );  // the Collection listener's set up in bindCollectionListeners()
			}
		}
		
	} );
	
	return CollectionBindable;
	
} );
/*global define */
define('jqc/view/Collection', [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/Component',
	'jqc/util/CollectionBindable'
], function( jQuery, _, ComponentManager, Component, CollectionBindable ) {
	
	/**
	 * @class jqc.view.Collection
	 * @extends jqc.Component
	 * @mixins jqc.util.CollectionBindable
	 * @alias type.collectionview
	 * 
	 * A view of the {@link data.Model Models} in a {@link data.Collection}. The view uses the {@link #tpl} config, which 
	 * is automatically passed the {@link #collection collection's} models to populate the template. When the 
	 * {@link #collection} changes, or any of its {@link data.Model Models} change, the Collection View is 
	 * automatically refreshed to reflect the change.  
	 * 
	 * This view is similar to the {@link jqc.view.Model Model View}, but instead of showing a single {@link data.Model Model},
	 * it shows a {@link data.Collection Collection} of them.
	 */
	var CollectionView = Component.extend( {
		mixins : [ CollectionBindable ],
		
		
		/**
		 * @cfg {data.Collection} collection (required)
		 * 
		 * The Collection to work with. This is required to populate the Component's {@link #tpl}, but
		 * does not need to be provided upon instantiation. It may be provided at a later time with the
		 * {@link #bindCollection} method.
		 * 
		 * The Collection is monitored for changes, and the view is refreshed when they occur.
		 */
		
		/**
		 * @cfg {String/String[]/Function/jqc.template.Template} tpl (required)
		 * 
		 * The template which will be used to populate the Collection View. By default, this template will be provided
		 * the variable `models`, which is an array of the {@link data.Model Models} that should be rendered
		 * from the currently-bound {@link #collection}. This array may be the full array of models that exist
		 * in the {@link #collection}, or it may just be a particular range of models that the Collection View
		 * needs to render or re-render due to a change. The name of the variable provided to the {@link #tpl}
		 * that holds the models may be configured using the {@link #modelsVar} config.
		 * 
		 * For example, if we had a "User" model, which had fields `id`, `firstName`, and `lastName`, then we
		 * might want to display this information in a template as such: (using a {@link jqc.template.LoDash Lo-Dash template}
		 * in this case)
		 * 
		 *     tpl : new LoDashTpl( [
		 *         '<% _.forEach( models, function( model ) { %>',
		 *             '<div>',
		 *                 'User: <%= model.get( "lastName" ) %>, <%= model.get( "firstName" ) %> (<%= model.get( "id" ) %>)',
		 *             '</div>'
		 *         '<% } ) %>'
		 *     ] )
		 *     
		 * If we wanted to convert all of the {@link data.Model Model} attributes to a plain JavaScript Object (map)
		 * before working with them, we can call {@link data.Model#getData getData} on each beforehand. For example:
		 * 
		 *     tpl : new LoDashTpl( [
		 *         '<% _.forEach( models, function( model ) { %>',
		 *             '<% var data = model.getData() %>
		 *             '<div>',
		 *                 'User: <%= data.lastName %>, <%= data.firstName %> (<%= data.id %>)',
		 *             '</div>'
		 *         '<% } ) %>'
		 *     ] )
		 * 
		 * While the above example may be more readable than the example before it, it may involve more processing and
		 * conversions being executed behind the scenes for attribute retrieval than are needed by the template. If only 
		 * a subset of the attributes in a {@link data.Model Model} are needed for the template, it would be more efficient 
		 * to only retrieve those particular attributes using {@link data.Model#get}.
		 * 
		 * ### Notes
		 * 
		 * Some notes to keep in mind when writing the tpl:
		 * 
		 * 1. The models should always be looped over in the order that they are given. This is because the Collection View
		 *    needs to match up the elements that are created for the models, with the models themselves. It can only do this
		 *    after the models' markup is generated, and by element position.
		 * 2. Following on the first point, all models that are provided to the template should be rendered by the template.
		 *    That is, do not use `if` statements to filter out certain models. If this needs to be done, do so in an overridden
		 *    {@link #collectModels} method instead, so the Collection View knows what it's working with.
		 * 
		 * For more information on templates themselves, see the {@link jqc.Component#tpl tpl} config in the superclass, 
		 * {@link jqc.Component Component}.
		 */
		
		/**
		 * @cfg {String} modelSelector (required)
		 * 
		 * The CSS selector string used by the Collection View to determine which elements (created by the {@link #tpl})
		 * wrap the models of the {@link #collection}.
		 * 
		 * This is needed so that the corresponding HTML element may be found, given a {@link data.Model Model} instance,
		 * and vice-versa.
		 * 
		 * For example:
		 * 
		 *     tpl : new LoDashTpl( [
		 *         '<% _.forEach( users, function( user ) { %>',
		 *             '<div data-elem="userEl">',
		 *                 'User: <%= user.get( "lastName" ) %>, <%= user.get( "firstName" ) %>',
		 *             '</div>'
		 *         '<% } ) %>'
		 *     ] ),
		 *     modelsVar : 'users',
		 *     
		 *     modelSelector: 'div[data-elem="userEl"]'
		 * 
		 * This would specify to the Collection View that each div element with a `data-elem` attribute of "userEl" wraps
		 * a User model. The corresponding User model can be found given the "userEl" or one of its descendant elements 
		 * using {@link #getModelFromElement}, and the "userEl" element can be found given its model instance using
		 * {@link #getElementFromModel}.
		 */
		
		/**
		 * @cfg {String} modelsVar
		 * 
		 * The name of the variable that will be provided to the {@link #tpl} that holds the {@link data.Model models}
		 * that are to be rendered by it. 
		 * 
		 * This may be used to provide a variable name that makes more sense inside the template for the type of models 
		 * being used. For example, if the Collection View is working with "User" models, one might want to
		 * set this config to `users`. Example: (using a {@link jqc.template.LoDash Lo-Dash template} in this case)
		 * 
		 *     modelsVar : 'users',
		 *     tpl : new LoDashTpl( [
		 *         '<% _.forEach( users, function( user ) {',
		 *             '<span>The current user is: <%= user.get( "name" ) %></span>',
		 *         '<% } ) %>'
		 *     ] )
		 */
		modelsVar : 'models',
		
		/**
		 * @cfg {Boolean} maskOnLoad
		 * 
		 * True to automatically mask the Collection View while the backing {@link #collection} is loading. The mask that is shown
		 * can be configured with the {@link #maskConfig} configuration option, or defaults to showing the message "Loading..."
		 */
		maskOnLoad : true,
		
		/**
		 * @cfg {Number} loadingHeight
		 * 
		 * A minimum height to give the CollectionView while its {@link #collection} is loading. This is useful to prevent the 
		 * CollectionView from collapsing to 0 height while the load mask is being shown, and there is no content in the view.
		 * 
		 * This is only used if the {@link #maskOnLoad} config is `true`. It is also only applied if the CollectionView's height
		 * is less than this number.
		 */
		
		
		/**
		 * @protected
		 * @property {Object} modelElCache
		 * 
		 * An Object (map) which is keyed by models' {@link data.Model#getClientId clientId}, and which stores the
		 * HTML element (wrapped in a jQuery set) which relates to it in the view. Ex:
		 * 
		 *     {
		 *         1 : jQuery,   // inside is the element which encapsulates the model
		 *         2 : jQuery
		 *     }
		 * 
		 * Where `1` and `2` are the models' clientIds, and the values are jQuery instances, each which wrap the HTMLElement
		 * that corresponds to that model.
		 */
		
		/**
		 * @private
		 * @property {Boolean} hasLoadingHeight
		 * 
		 * Flag which is set to true when the {@link #loadingHeight} is applied, and set back to `false` after the
		 * {@link #loadingHeight} has been removed.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			// <debug>
			if( !this.tpl ) throw new Error( "`tpl` config required" );
			if( !this.modelSelector ) throw new Error( "`modelSelector` config required" );
			// </debug>
			
			this.modelElCache = {};
			if( this.collection ) {
				this.bindCollection( this.collection );
			} else {
				this.refresh();  // do an initial refresh if no collection, which simply sets up the CollectionView to not show anything (and not run the template, since we don't have models to run it with)
			}
			
			// Set up the maskConfig if there is not a user-defined one. This is for masking the component
			// while the collection is loading.
			this.maskConfig = this.maskConfig || { spinner: true, msg: "Loading..." };
		},
		
		
		/**
		 * @inheritdoc
		 */
		onAfterRender : function() {
			this._super( arguments );
			
			var collection = this.collection;
			if( collection ) {
				this.collectModelElements( this.collectModels() );  // need to determine the initial set of models that were rendered (if any)
				
				// Mask the view if the Collection is currently loading when the view is rendered
				if( collection.isLoading() ) {
					this.applyLoadingHeight();
					this.mask();
				}
			}
		},
		
		
		/**
		 * Retrieves the {@link #collection} which is currently bound to the CollectionView.
		 * 
		 * @return {data.Collection} The Collection which is currently bound to the CollectionView, or `null`
		 *   if there is no currently-bound Collection.
		 */
		getCollection : function() {
			return this.collection || null;
		},
		
		
		// -----------------------------------
		
		// Implementation of CollectionBindable mixin methods
		
		/**
		 * Implementation of {@link jqc.util.CollectionBindable} mixin method used to retrieve the Object (map) of the listeners 
		 * that should be set up on the {@link #collection}, when a {@link data.Collection} is bound to the view. This method may 
		 * be overridden in a subclass to add events that should be listened for.
		 * 
		 * @protected
		 * @param {data.Collection} collection The Collection being bound.
		 * @return {Object} An {@link Observable#addListener addListener} config object for the listeners.
		 */
		getCollectionListeners : function( collection ) {
			return {
				'loadbegin' : this.onLoadBegin,
				'load'      : this.onLoadComplete,
				'addset'    : this.refresh,
				'removeset' : this.refresh,
				'reorder'   : this.refresh,
				'changeset' : this.refresh,
				scope : this
			};
		},
		
		
		/**
		 * Implementation of {@link jqc.util.CollectionBindable} mixin method. Handles when a new {@link #collection} has been 
		 * bound to the view.
		 * 
		 * @protected
		 * @param {data.Collection} collection The newly bound collection. Will be `null` if the previous collection was
		 *   simply unbound (i.e. `null` was passed to {@link #bindCollection}, or {@link #unbindCollection} was called). 
		 * @param {data.Collection} oldCollection The collection that was just unbound. Will be `null` if there was no
		 *   previously-bound collection.
		 */
		onCollectionBind : function( collection ) {
			this.refresh();
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Handles the {@link #collection} starting to load, by displaying the "loading" mask over the Collection View
		 * if the {@link #maskOnLoad} config is true.
		 * 
		 * @protected
		 */
		onLoadBegin : function() {
			if( this.maskOnLoad && this.rendered ) {
				this.applyLoadingHeight();
				
				this.mask();
			}
		},
		
		
		/**
		 * Handles the {@link #collection} completing its load, by removing the "loading" mask from the Collection View,
		 * which was shown by {@link #onLoadBegin} if the {@link #maskOnLoad} config was true.
		 * 
		 * Note: The view will be refreshed due to the addition/removal of models, and doesn't need to be refreshed
		 * from this method.
		 * 
		 * @protected
		 */
		onLoadComplete : function() {
			if( this.maskOnLoad && this.rendered ) {
				this.unMask();
				
				this.removeLoadingHeight();
			}
		},
		
		
		/**
		 * Applies the {@link #loadingHeight} to the CollectionView's {@link #$el element}, if the current height of the
		 * CollectionView is less than the configured {@link #loadingHeight}. It also only applies the {@link #loadingHeight}
		 * if the {@link #maskOnLoad} config is `true`.
		 * 
		 * This is called when the {@link #collection} is in its loading state.
		 * 
		 * @protected
		 */
		applyLoadingHeight : function() {
			var loadingHeight = this.loadingHeight,
			    $el = this.$el;
			
			if( loadingHeight > this.getHeight() ) {
				this.hasLoadingHeight = true;
				$el.css( 'min-height', loadingHeight + 'px' );
			}
		},
		
		
		/**
		 * Removes the {@link #loadingHeight} from the CollectionView's {@link #$el element}, restoring any {@link #minHeight} that
		 * the CollectionView has configured. This is only done if the {@link #loadingHeight} was applied in {@link #applyLoadingHeight}.
		 * 
		 * This is called when the {@link #collection} has finished loading.
		 * 
		 * @protected
		 */
		removeLoadingHeight : function() {
			if( this.hasLoadingHeight ) {
				var minHeight = ( this.minHeight ) ? this.minHeight + 'px' : '';
				this.$el.css( 'min-height', minHeight );  // re-apply any configured `minHeight` to the component's element
				
				this.hasLoadingHeight = false;
			}
		},
		
		
		/**
		 * Refreshes the view by {@link #update updating} the Component's markup, based on the {@link #tpl}
		 * and the current state of the {@link #collection}. This method should normally not need to be called 
		 * directly, as the view will automatically be updated when changes are detected on the {@link #collection}.
		 */
		refresh : function() {
			if( !this.collection ) {
				this.update( "" );  // don't display anything (and don't run the template which uses a variable we don't have, i.e. the collection's models)
				
			} else {
				var models = this.collectModels();
				this.update( this.prepareTplData( models ) );
				
				if( this.rendered ) {
					this.collectModelElements( models );
				}
			}
		},
		
		
		/**
		 * Retrieves the data that will be {@link jqc.template.Template#apply applied} to the {@link #tpl} upon 
		 * {@link #refresh}. 
		 * 
		 * This method may be overridden by subclasses to add additional properties which will be provided
		 * to the {@link #tpl}.
		 * 
		 * @protected
		 * @param {data.Model[]} models The models that are to be rendered by the {@link #tpl} (collected from 
		 *   {@link #collectModels}).
		 * @return {Object} An Object (map) of the properties which will be {@link jqc.template.Template#apply applied}
		 *   to the {@link #tpl}, to produce the output.
		 */
		prepareTplData : function( models ) {
			var data = {};
			data[ this.modelsVar ] = models;
			
			return data;
		},
		
		
		/**
		 * Returns the array of {@link data.Model Models} which will be provided to the {@link #tpl}. This method
		 * may be overridden in subclasses for different implementations (such as to support paging).
		 * 
		 * @protected
		 * @return {data.Model[]} The array of models which will be processed by the {@link #tpl}.
		 */
		collectModels : function() {
			return ( this.collection ) ? this.collection.getModels() : [];
		},
		
		
		/**
		 * Collects the rendered elements that hold the markup for models, and stores them in the {@link #modelElCache}. 
		 * These elements are determined from the rendered markup by the {@link #modelSelector}.
		 * 
		 * This method also attaches a data attribute which holds the corresponding {@link data.Model Model's}
		 * {@link data.Model#getClientId clientId}. 
		 * 
		 * @private
		 * @param {data.Model[]} models The models that were rendered by the {@link #tpl} (collected from 
		 *   {@link #collectModels}).
		 */
		collectModelElements : function( models ) {
			var modelElCache = this.modelElCache = {};    // clear the modelElCache to start
			
			var $els = this.getContentTarget().find( this.modelSelector );
			for( var i = 0, len = $els.length; i < len; i++ ) {
				var $el = $els.eq( i ),
				    clientId = models[ i ].getClientId();
				
				$el.attr( 'data-CollectionView-clientId', clientId );
				modelElCache[ clientId ] = $el;
			}
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Retrieves the corresponding {@link data.Model Model} for the given HTMLElement, or descendant HTMLElement,
		 * of the element that is presenting the Model in the markup. This is the element that wraps the Model's
		 * display, and matches the {@link #modelSelector}.
		 * 
		 * @protected
		 * @param {HTMLElement/jQuery} element The HTMLElement or jQuery set which wraps the HTMLElement in the
		 *   model's markup. If a descendant element of the model's element is provided, the DOM tree will be walked
		 *   up until a model's element is found. If the element provided is *not* a model-encapsulating element or
		 *   one of its descendant elements, the method returns null.
		 * @return {data.Model} The Model that corresponds to the `element` provided, or `null` if there was no
		 *   model-encapsulating element for the `element` provided.
		 */
		getModelFromElement : function( element ) {
			var $modelEl = this.getModelParentElement( element );
			return this.collection.getByClientId( $modelEl ? $modelEl.attr( 'data-CollectionView-clientId' ) : -1 );
		},
		
		
		/**
		 * Retrieves the HTMLElement that represents a {@link data.Model} in the markup, given a child element. The 
		 * DOM tree will be walked up until the model's encapsulating element is found. If the model's element
		 * itself is provided, it will simply be returned.
		 * 
		 * @protected
		 * @param {HTMLElement/jQuery} childEl The child element to find its encapsulating model element from.
		 * @return {jQuery} The HTMLElement for the model, wrapped in a jQuery set, of `null` if the `childEl`
		 *   was not a child element of a model-encapsulating element.
		 */
		getModelParentElement : function( childEl ) {
			var $modelEl = jQuery( childEl ).closest( this.modelSelector );
			return ( $modelEl.length > 0 ) ? $modelEl : null;
		},
		
		
		/**
		 * Retrieves the element which encapsulates a {@link data.Model Model's} data, given the {@link data.Model Model}.
		 * 
		 * @protected
		 * @param {data.Model} model The Model to retrieve the corresponding element for.
		 * @return {jQuery} The HTMLElement, wrapped in a jQuery set, which encapsulates the model's display. Returns
		 *   null if there was no such HTMLElement for the given `model` (or the Collection View is not yet rendered).
		 */
		getElementFromModel : function( model ) {
			return ( !this.rendered ) ? null : this.modelElCache[ model.getClientId() ] || null;
		},
		
		
		// ---------------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			this.unbindCollection();  // unbind any bound collection
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'collectionview', CollectionView );
	
	return CollectionView;
	
} );
/*global define */
define('jqc/view/Model', [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/Component'
], function( jQuery, _, ComponentManager, Component ) {
	
	/**
	 * @class jqc.view.Model
	 * @extends jqc.Component
	 * @alias type.modelview
	 * 
	 * A view of the data in a single {@link data.Model}. The view uses the {@link #tpl} config, which 
	 * is automatically passed the {@link #model} to populate the template. When any of the {@link #model model's} 
	 * attributes change, the Model View is automatically refreshed to reflect the change.  
	 * 
	 * This view is similar to the {@link jqc.view.Collection Collection View}, which shows a {@link data.Collection Collection}
	 * of {@link data.Model Models} instead of a single one.  
	 */
	var ModelView = Component.extend( {
		
		/**
		 * @cfg {data.Model} model (required)
		 * 
		 * The Model to work with. This is required to populate the Component's {@link #tpl}, but
		 * does not need to be provided upon instantiation. It may be provided at a later time with the
		 * {@link #bindModel} method.
		 * 
		 * The Model is monitored for changes, and the view is refreshed when they occur.
		 */
		
		/**
		 * @cfg {String/String[]/Function/jqc.template.Template} tpl (required)
		 * 
		 * The template which will be used to populate the Model View. By default, this template will be provided
		 * the variable `model`, which is the {@link #model} instance bound to this Model View. The name of the 
		 * variable provided to the {@link #tpl} that holds the models may be configured using the {@link #modelVar} config.
		 * 
		 * For example, if we had a "User" model, which had fields `id`, `firstName`, and `lastName`, then we
		 * might want to display this information in a template as such: (using a {@link jqc.template.LoDash Lo-Dash template}
		 * in this case)
		 * 
		 *     tpl : new LoDashTpl( [
		 *         '<div>',
		 *             'Current User: <%= model.get( "lastName" ) %>, <%= model.get( "firstName" ) %> (<%= model.get( "id" ) %>)',
		 *         '</div>'
		 *     ] )
		 *     
		 * If we wanted to convert all of the {@link data.Model Model's} attributes to a plain JavaScript Object (map)
		 * before working with them, we can call {@link data.Model#getData getData} on it beforehand. For example:
		 * 
		 *     tpl : new LoDashTpl( [
		 *         '<% var data = model.getData() %>
		 *         '<div>',
		 *             'Current User: <%= data.lastName %>, <%= data.firstName %> (<%= data.id %>)',
		 *         '</div>'
		 *     ] )
		 * 
		 * While the above example may be more readable than the example before it, it may involve more processing and
		 * conversions being executed behind the scenes for attribute retrieval than are needed by the template. If only 
		 * a subset of the attributes in the {@link data.Model Model} are needed for the template, it would be more efficient 
		 * to only retrieve those particular attributes using {@link data.Model#get}.
		 * 
		 * For more information on templates themselves, see the {@link jqc.Component#tpl tpl} config in the superclass, 
		 * {@link jqc.Component Component}.
		 */
		
		/**
		 * @cfg {String} modelVar
		 * 
		 * The name of the variable that will be provided to the {@link #tpl} that holds the {@link #model} that
		 * is to be rendered by it. 
		 * 
		 * This may be used to provide a variable name that makes more sense inside the template for the type of model 
		 * being used. For example, if the Model View is working with a "User" model, one might want to
		 * set this config to `user`. Example: (using a {@link jqc.template.LoDash Lo-Dash template} in this case)
		 * 
		 *     modelVar : 'user',
		 *     tpl : new LoDashTpl( [
		 *         '<span>The current user is: <%= user.get( "name" ) %></span>',
		 *     ] )
		 */
		modelVar : 'model',
		
		/**
		 * @cfg {Boolean} maskOnLoad
		 * 
		 * True to automatically mask the Model View while the backing {@link #model} is loading. The mask that is shown
		 * can be configured with the {@link #maskConfig} configuration option, or defaults to showing the message "Loading..."
		 * 
		 * This really only applies to a {@link data.Model Model} that is being {@link data.Model#method-load reloaded} from 
		 * its backing data source (ex: a web server).
		 */
		maskOnLoad : true,
		
		
		
		/**
		 * @private
		 * @property {Boolean} firstBindComplete
		 * 
		 * Property which is set to true when the initial bind (called from {@link #initComponent} is complete.
		 */
		
		/**
		 * @private
		 * @property {Object} modelListeners
		 * 
		 * The listeners that were bound to the current {@link #model} in the {@link #bindModelListeners} method. 
		 * If there has been no model bound to this view yet, this will be `undefined`.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			// <debug>
			if( !this.tpl ) throw new Error( "`tpl` config required" );
			// </debug>
			
			this.bindModel( this.model || null );
			
			// Set up the maskConfig if there is not a user-defined one. This is for masking the component
			// while the model is loading.
			this.maskConfig = this.maskConfig || { msg: "Loading..." };
		},
		
		
		/**
		 * @inheritdoc
		 */
		onAfterRender : function() {
			this._super( arguments );
			
			// Mask the view if the Model is currently loading when the view is rendered
			/*var model = this.model;
			if( model && this.maskOnLoad && model.isLoading() ) {
				this.mask();
			}*/
		},
		
		
		/**
		 * Retrieves the {@link #model} which is currently bound to the ModelView
		 * 
		 * @return {data.Model} The Model which is currently bound to the ModelView, or `null`
		 *   if there is no currently-bound Model.
		 */
		getModel : function() {
			return this.model || null;
		},
		
		
		// -----------------------------------
		
		// Model binding methods
		
		
		/**
		 * Binds a {@link data.Model} to the view. The Model will be used to populate the {@link #tpl},
		 * and will also be monitored for changes to refresh the view as well.
		 * 
		 * Any previous {@link #model} will be unbound from the view.
		 * 
		 * @param {data.Model} model The Model to bind. To unbind the currently-bound Model,
		 *   pass `null`.
		 */
		bindModel : function( model ) {
			if( this.model !== model || !this.firstBindComplete ) {
				// If there is a current model, and there have been listeners bound to it (i.e. it is not the initial bind
				// call from having a `model` config), then unbind its listeners in preparation to bind a new Model
				if( this.model ) {
					this.unbindModelListeners();
				}
				
				this.model = model;
				if( model ) {
					this.bindModelListeners();
				}
				this.firstBindComplete = true;
				
				this.refresh();
			}
		},
		
		
		/**
		 * Binds listeners to the current {@link #model}, so that the view can refresh itself upon
		 * changes. The listeners that are set up are created by the {@link #getModelListeners} method,
		 * which may be overridden to listen to other events that a particular {@link data.Model} subclass
		 * may fire.
		 * 
		 * @private
		 */
		bindModelListeners : function() {
			var model = this.model,
			    listeners = _.clone( this.getModelListeners( model ) );  // shallow copy of the listeners
			
			model.on( listeners );
			this.modelListeners = listeners;
		},
		
		
		/**
		 * Retrieves an Object (map) of the listeners that should be set up on the {@link #model}, when 
		 * a {@link data.Model} is bound to the view. This method may be overridden in a subclass to add 
		 * events that should be listened for.
		 * 
		 * @protected
		 * @param {data.Model} model The Model being bound.
		 * @return {Object} An {@link Observable#addListener addListener} config object for the listeners.
		 */
		getModelListeners : function( model ) {
			return {
				'loadbegin' : this.onLoadBegin,
				'load'      : this.onLoadComplete,
				'changeset' : this.refresh,
				'rollback'  : this.refresh,
				scope : this
			};
		},
		
		
		/**
		 * Unbinds the current {@link #model model's} listeners, which were bound by
		 * {@link #bindModelListeners}.
		 * 
		 * @private
		 */
		unbindModelListeners : function() {
			if( this.model && this.modelListeners ) {
				this.model.un( this.modelListeners );  // the Model listener's set up in bindModelListeners()
			}
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Handles the {@link #model} starting to load, by displaying the "loading" mask over the Model View
		 * if the {@link #maskOnLoad} config is true.
		 * 
		 * @protected
		 */
		onLoadBegin : function() {
			if( this.maskOnLoad ) {
				this.mask();
			}
		},
		
		
		/**
		 * Handles the {@link #model} completing its load, by removing the "loading" mask from the Model View,
		 * which was shown by {@link #onLoadBegin} if the {@link #maskOnLoad} config was true.
		 * 
		 * Note: The view will be refreshed due to the addition/removal of models, and doesn't need to be refreshed
		 * from this method.
		 * 
		 * @protected
		 */
		onLoadComplete : function() {
			if( this.maskOnLoad ) {
				this.unMask();
			}
		},
		
		
		/**
		 * Refreshes the view by {@link #update updating} the Component's markup, based on the {@link #tpl}
		 * and the current state of the {@link #model}. This method should normally not need to be called 
		 * directly, as the view will automatically be updated when changes are detected on the {@link #model}.
		 */
		refresh : function() {
			if( !this.model ) {
				this.update( "" );  // don't display anything
				
			} else {
				this.update( this.prepareTplData( this.model ) );
			}
		},
		
		
		/**
		 * Retrieves the data that will be {@link jqc.template.Template#apply applied} to the {@link #tpl} upon 
		 * {@link #refresh}. 
		 * 
		 * This method may be overridden by subclasses to add additional properties which will be provided
		 * to the {@link #tpl}.
		 * 
		 * @protected
		 * @param {data.Model} model The model that is to be rendered by the {@link #tpl}.
		 * @return {Object} An Object (map) of the properties which will be {@link jqc.template.Template#apply applied}
		 *   to the {@link #tpl}, to produce the output.
		 */
		prepareTplData : function( model ) {
			var data = {};
			data[ this.modelVar ] = model;
			
			return data;
		},
		
		
		// ---------------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			if( this.model ) {
				this.unbindModelListeners();
				delete this.model;
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'modelview', ModelView );
	
	return ModelView;
	
} );
/*global define */
define('jqc/window/Window', [
	'jqc/ComponentManager',
	'jqc/Overlay'
], function( ComponentManager, Overlay ) {
	
	/**
	 * @class jqc.window.Window
	 * @extends jqc.Overlay
	 * @alias type.window
	 * 
	 * Basic class for creating a window (also known as a dialog). As a subclass of {@link jqc.panel.Panel Panel}, the Window
	 * may accept a {@link #title}, and it also adds a {@link #closeButton close button} to the top right  
	 */
	var Window = Overlay.extend( {
		
		/**
		 * @cfg {Boolean} closeButton
		 * 
		 * `true` to show the close button on the top right, `false` to hide it.
		 */
		closeButton : true,
		
		/**
		 * @cfg {String} closeAction
		 * 
		 * The action to take when the {@link #closeButton} is clicked, or the Window is closed by the 'esc' button.
		 * Acceptable values are: 
		 * 
		 * - `'{@link #method-destroy}'`: Destroys the Window for automatic cleanup from the DOM. The Window will not be available to
		 *   be shown again using the {@link #method-show} method.
		 *    
		 * - `'{@link #method-hide}'`: Hides the Window. The Window will be available to be shown again using the {@link #method-show} method.
		 *   The Window must be manually {@link #method-destroy destroyed} when it is no longer needed.
		 */
		closeAction : 'destroy',
		
		/**
		 * @cfg {Boolean} closeOnEscape
		 * 
		 * `true` to have the Window close when the 'esc' key is pressed. Set to `false` to disable this behavior. The action taken (whether
		 * the Window is {@link #method-destroy destroyed} or simply {@link #method-hide hidden}) is governed by the {@Link #closeAction} config.
		 */
		closeOnEscape : true,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Window',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		x : 'center',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		y : 'center',
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// Add the close button if the config is true
			if( this.closeButton ) {
				this.toolButtons = ( this.toolButtons || [] ).concat( {
					toolType : 'close',
					
					handler  : this.doClose,
					scope    : this
				} );
			}
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			// If the closeOnEscape config is true, set up a keydown event for it to close the overlay.
			if( this.closeOnEscape ) {
				var me = this;  // for closure
				this.$el.keyup( function( evt ) {
					if( evt.keyCode === 27 && me.closeOnEscape ) {  // 27 == 'esc' char
						me.doClose();
					}
				} );
			}
		},
		
		
		/**
		 * Protected method which handles the {@link #closeAction} of the Window.
		 * 
		 * @protected
		 */
		doClose : function() {
			this.hide();
				
			if( this.closeAction === 'destroy' ) {
				if( this.hiding )  // in the process of hiding (i.e. animating its hide), then wait until it's complete before destroying
					this.on( 'afterhide', function() { this.destroy(); }, this );  // don't call destroy() with any arguments
				else 
					this.destroy();
			}
		}
		
	} );
	
	
	ComponentManager.registerType( 'window', Window );
	
	return Window;
	
} );
require(["jqc/Anchor", "jqc/Component", "jqc/ComponentManager", "jqc/ComponentQuery", "jqc/Container", "jqc/Image", "jqc/Jqc", "jqc/Label", "jqc/Mask", "jqc/Overlay", "jqc/Viewport", "jqc/anim/Animation", "jqc/app/Controller", "jqc/app/EventBus", "jqc/button/Button", "jqc/form/field/Checkbox", "jqc/form/field/Dropdown", "jqc/form/field/Field", "jqc/form/field/Hidden", "jqc/form/field/Radio", "jqc/form/field/Text", "jqc/form/field/TextArea", "jqc/form/field/autocomplete/Autocomplete", "jqc/form/field/autocomplete/ListMenu", "jqc/form/field/autocomplete/Menu", "jqc/layout/Auto", "jqc/layout/Card.SwitchTransition", "jqc/layout/Card.Transition", "jqc/layout/Card", "jqc/layout/Column", "jqc/layout/Fit", "jqc/layout/HBox", "jqc/layout/Layout", "jqc/layout/VBox", "jqc/panel/Header", "jqc/panel/Panel", "jqc/panel/ToolButton", "jqc/plugin/Plugin", "jqc/tab/Bar", "jqc/tab/Panel", "jqc/tab/Tab", "jqc/template/LoDash", "jqc/template/Template", "jqc/util/CollectionBindable", "jqc/util/Css", "jqc/util/Html", "jqc/util/OptionsStore", "jqc/view/Collection", "jqc/view/Model", "jqc/window/Window"]);
