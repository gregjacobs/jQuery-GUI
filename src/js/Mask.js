/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'jqGui/template/Template',
	'jqGui/template/LoDash',
	'jquery-ui.position'  // jQuery UI's `position` plugin
], 
function( jQuery, _, Class, Template, LoDashTpl ) {
	
	/**
	 * @class jqGui.Mask
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
		 * @property {String/jqGui.template.Template} maskTpl
		 * 
		 * The template to use to create the Mask's elements.
		 */
		maskTpl : new LoDashTpl( [
			'<div data-elem="jqGui-mask-overlay" class="jqGui-mask-overlay" />',
			'<div data-elem="jqGui-mask-content" class="jqGui-mask-content">',
				'<span class="jqGui-mask-spinner" />',
				'<div data-elem="jqGui-mask-msg" class="jqGui-mask-msg" />',
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
		spinnerVisibleCls : 'jqGui-mask-spinner-visible',
		
		/**
		 * @protected
		 * @property {String} msgVisibleCls
		 * 
		 * The CSS class to add to the Mask's {@link #$contentEl} when a {@link #msg} exists.
		 */
		msgVisibleCls : 'jqGui-mask-msg-visible',
		
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
					throw new Error( "If the 'targetEl' argument to the jqGui.Mask constructor is a jQuery wrapped set, it must contain exactly one element." );
				}
				// </debug>
				this.$targetEl = targetEl;
			
			// <debug>
			} else {
				throw new Error( "jqGui.Mask requires the first argument to its constructor to be an HTMLElement, or a jQuery wrapped set" );
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
				this.$overlayEl = $targetEl.find( '[data-elem="jqGui-mask-overlay"]' )
					.on( 'click', onMaskClick );
				this.$contentEl = $targetEl.find( '[data-elem="jqGui-mask-content"]' )
					.on( 'click', onMaskClick );
				this.$msgEl = $targetEl.find( '[data-elem="jqGui-mask-msg"]' );
				
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
				
				// First, add the jqGui-masked css class to the target element, which removes the target element's scroll bars
				$targetEl.addClass( 'jqGui-masked' );
				
				// Next, give the target element a relative positioning context if it currently does not have one (i.e. it 
				// has "position: static"), and the target element not the document body (the document body already has a positioning context)
				if( $targetEl.css( 'position' ) === 'static' && !$targetEl.is( 'body' ) ) {
					$targetEl.addClass( 'jqGui-masked-relative' );
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
						$overlayEl.height( $targetEl.outerHeight() );  // continually make sure that the mask's overlay height is correct, in case the content changes
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
				this.$targetEl.removeClass( 'jqGui-masked' ).removeClass( 'jqGui-masked-relative' );
				
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
