/*global define */
define( [
	'jquery',
	'lodash',
	'Class'
], 
function( jQuery, _, Class ) {
	
	/**
	 * @class ui.Mask
	 * 
	 * Generalized class that can create a mask over any given element, and provides a simple interface
	 * to show, hide, and add content to it.
	 */
	var Mask = Class.extend( Object, {
		
		/**
		 * @cfg {Boolean} spinner
		 * 
		 * True to display a spinner image in the {@link #$contentEl} element when the mask is shown. Set to false to hide the spinner.
		 */
		spinner : true,
		
		/**
		 * @cfg {String/HTMLElement/jQuery} msg
		 * 
		 * A message (or any content) to display in the center of the mask. If this is specified, the {@link #$contentEl} will be
		 * made to look like an opaque box, so that text inside of it is easily readable. Defaults to an empty string, for no message.
		 */
		msg : "",
		
		
		/**
		 * @private
		 * @property {String} spinnerURL
		 * 
		 * The URL of the spinner image to use when the {@link #spinner} config is true.
		 */
		//spinnerURL : "assets/spinner2e2d2d.gif",
		
		
		/**
		 * @private
		 * @property {jQuery} $targetEl
		 * 
		 * The element to mask, wrapped in a jQuery wrapped set.
		 */
		
		/**
		 * @private
		 * @property {Boolean} rendered
		 * 
		 * Will be true once the Mask's elements have been rendered ({@link #initMaskElements} has been run). Initially false.
		 */
		rendered : false,
		
		/**
		 * @private
		 * @property {jQuery} $maskEl
		 * 
		 * The masking element itself. This is lazily created in the {@link #initMaskElements} method when the mask is to
		 * be shown.
		 */
		
		/**
		 * @private
		 * @property {jQuery} $contentEl
		 * 
		 * The content element that sits on top of the Mask to display the {@link #msg} and/or {@link #spinner}. This is lazily 
		 * created in the {@link #initMaskElements} method when the mask is to be shown.
		 */
		
		/**
		 * @private
		 * @property [jQuery} $msgEl
		 * 
		 * The element that is used to display the {@link #msg}.
		 */
		
		/**
		 * @private
		 * @property {Boolean} shown
		 * 
		 * Stores if the mask is currently being shown or not. Retrieve with {@link #isShown}.
		 */
		shown : false,
		
		
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
				if( targetEl.length !== 1 ) {
					throw new Error( "If the 'targetEl' argument to the ui.Mask constructor is a jQuery wrapped set, it must contain exactly one element." );
				}
				this.$targetEl = targetEl;
				
			} else {
				throw new Error( "ui.Mask requires the first argument to its constructor to be an HTMLElement, or a jQuery wrapped set" );
			}
			
			// Apply any additional configuration properties onto this object
			this.updateConfig( config );
		},
		
		
		
		/**
		 * Updates the configuration of the mask. Accepts an object with the configuration options for this class,
		 * and updates the Mask accordingly.  Note that all configuration options that are not provided in the
		 * `config` argument will be reset to their defaults. 
		 * 
		 * @method updateConfig
		 * @param {Object} config The new configuration options for the Mask. See the "config options" section of the docs for details. 
		 */
		updateConfig : function( config ) {
			// Remove any previously set configuration options
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
		 * Creates the masking elements (the {@link #$maskEl} and {@link #$contentEl}) if they have not yet been created. When creating
		 * the elements, they are appended to the target element (note that they are absolutely positioned so they do not affect document flow).
		 * 
		 * @private
		 * @method initMaskElements
		 */
		initMaskElements : function() {
			// Create the mask elements if they do not yet exist, and append it to the target element
			if( !this.rendered ) {
				var $targetEl = this.$targetEl;
				
				this.$maskEl = jQuery( '<div class="ui-mask" />' )
					.click( function( evt ) { evt.stopPropagation(); } )   // the mask should swallow any click events to it, to prevent any behavior from the bubbling of the event
					.appendTo( $targetEl );
				
				this.$contentEl = jQuery( '<div class="ui-mask-content" />' )
					.append( '<img class="ui-mask-content-spinner" src="' + this.spinnerURL + '" />' )  // This image will only be shown if the spinner config is true (i.e. the $contentEl has the 'ui-mask-spinnerEnabled' css class)
					.click( function( evt ) { evt.stopPropagation(); } )   // the mask should swallow any click events to it, to prevent any behavior from the bubbling of the event
					.appendTo( $targetEl );
				
				this.$msgEl = jQuery( '<div class="ui-mask-msg" />' ).appendTo( this.$contentEl );
				
				this.rendered = true;
				this.updateMaskElements();
			}
		},
		
		
		/**
		 * Updates the mask elements with the current values of the configuration options (which may be set after instantiation time
		 * with the {@link #updateConfig} method.
		 * 
		 * @private
		 * @method updateMaskElements
		 */
		updateMaskElements : function() {
			if( this.rendered ) {
				// Update the spinner
				if( this.spinner ) {
					this.$contentEl.addClass( 'ui-mask-spinnerEnabled' );
				} else {
					this.$contentEl.removeClass( 'ui-mask-spinnerEnabled' );
				}
				
				// Update the message
				this.$msgEl.empty();
				if( this.msg ) {
					// Add the ui-mask-contentBox css class if there is actually a message. This css class
					// creates an opaque "box" that is shown in the middle of the mask where text can be placed
					// and easily read. Then append the message itself to the $msgEl.
					this.$contentEl.addClass( 'ui-mask-contentBox' );
					this.$msgEl.append( this.msg );
				} else {
					this.$contentEl.removeClass( 'ui-mask-contentBox' );
				}
			}
		},
		
		
		
		
		// -------------------------------------
		
		
		/**
		 * Shows the mask over the target element.<br><br>
		 * 
		 * Note that if the mask is already shown, and its height needs to be recalculated because the underlying element's 
		 * size has changed, this method may be called again to redraw the mask.
		 * 
		 * @method show
		 */
		show : function() {
			// First, make sure the masking elements have been created (lazily created upon showing the mask, not in the constructor)
			this.initMaskElements();
			
			
			var $targetEl = this.$targetEl,
			    $maskEl = this.$maskEl,
			    $contentEl = this.$contentEl;
			
			// First, add the ui-masked css class to the target element, which removes the target element's scroll bars
			$targetEl.addClass( 'ui-masked' );
			
			// Next, give the target element a relative positioning context if it currently does not have one (i.e. it 
			// has "position: static"), and the target element not the document body (the document body already has a positioning context)
			if( $targetEl.css( 'position' ) === 'static' && !$targetEl.is( 'body' ) ) {
				$targetEl.addClass( 'ui-masked-relative' );
			}
			
			
			// Now show the masking element.
			$maskEl.show();
			
			// IE will not expand full height automatically if it has auto height. Just doing this calc for all browsers for now,
			// instead of worrying about browser detection (determining which versions of IE are affected) or attempting 
			// a feature detection for this.
			$maskEl.height( $targetEl.outerHeight() );
			
			
			// Center the $contentEl within the mask
			$contentEl.show();  // show if previously hidden
			
			// Set flag
			this.shown = true;
			
			// Position the content element ($contentEl) in the center of the $targetEl, and set it to continually reposition it on an interval.
			// The interval is for when elements on the page may resize themselves, we need to adjust the content element's position. The interval
			// will be cleared once the mask is hidden.
			this.repositionContentEl();
			var repositionIntervalId = setInterval( function() {
				if( this.isShown() ) {
					this.repositionContentEl();
				} else {
					clearInterval( repositionIntervalId );  // When no longer shown, clear the interval
				}
			}.createDelegate( this ), 100 );
		},
		
		
		/**
		 * Repositions the {@link #$contentEl} to be in the center of the {@link #$targetEl}.
		 * 
		 * @private
		 * @method repositionContentEl
		 */
		repositionContentEl : function() {
			// using jQuery UI positioning utility to center the content element
			this.$contentEl.position( {
				my: 'center center',
				at: 'center center',
				of: this.$targetEl
			} );
		},
		
		
		/**
		 * Hides the mask.
		 * 
		 * @method hide
		 */
		hide : function() {
			// Should only hide if the mask is currently shown.
			if( this.isShown() ) {
				// Hide the mask and the content element (if it exists), and restore the target element 
				// to its original state (i.e. scrollbars allowed, and no positioning context if it didn't have one)
				this.$maskEl.hide();
				this.$contentEl.hide();
				this.$targetEl.removeClass( 'ui-masked' ).removeClass( 'ui-masked-relative' );
				
				this.shown = false;
			}
		},
		
		
		/**
		 * Determines if the Mask is currently shown (visible).
		 * 
		 * @method isShown
		 * @return {Boolean} True if the mask is currently shown (visible).
		 */
		isShown : function() {
			return this.shown;
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Destroys the mask by cleaning up its elements.
		 * 
		 * @method destroy
		 */
		destroy : function() {
			// Make sure the mask has been hidden, to restore the target element to its original state
			this.hide();
			
			if( this.rendered ) {
				this.$msgEl.remove();
				this.$contentEl.remove();
				this.$maskEl.remove();
			}
		}
		
	} );
	
	return Mask;
} );
