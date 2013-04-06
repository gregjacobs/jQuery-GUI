/*!
 * UI.js Library
 * Copyright(c) 2013 Gregory Jacobs.
 * 
 * MIT Licensed. http://www.opensource.org/licenses/mit-license.php
 * https://github.com/gregjacobs/UI
 */

/*global define */
define( [
	'Class',
	'jquery',
	'lodash'
], function( Class, jQuery, _ ) {

	/**
	 * @class UI
	 * @singleton
	 * 
	 * Main singleton class of a few utility functions for the UI library. 
	 * 
	 * This class can be included in implementations by using the RequireJS path of 'ui/UI'. Ex:
	 * 
	 *     require( [ 'ui/UI' ], function( UI ) {
	 *         console.log( "This browser's scrollbar width: ", UI.getScrollbarWidth(), "px" );
	 *     } );
	 */
	var UI = Class.extend( Object, {

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
		 *     $div.css( 'background-image', 'url(' + UI.getBlankImgUrl() + ')' );
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
	return new UI();
	
} );