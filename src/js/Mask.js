/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'gui/template/Template',
	'gui/template/LoDash',
	'jquery-ui/position'  // jQuery UI's `position` plugin
], function( jQuery, _, Class, Template, LoDashTpl ) {
	
	/**
	 * @class gui.Mask
	 * 
	 * Generalized Mask class that can create an overlay over any given element, effectively disabling it. It may also be
	 * shown with a {@link #spinner} image, and an optional {@link #msg}.
	 * 
	 * The class provides an easy way to mask any HTMLElement or {@link gui.Component}, and provides a simple interface
	 * to {@link #show}, {@link #hide}, and add content to it.
	 * 
	 * The only required configuration option is the {@link #target} configuration option. It is not required at instantiation
	 * time, but must be at least provided using {@link #setTarget} before {@link #show} is called.
	 * 
	 * Example:
	 * 
	 *     @example
	 *     require( [
	 *         'jquery',
	 *         'gui/Mask'
	 *     ], function( jQuery, Mask ) {
	 *         
	 *         var $contentDiv = jQuery( '<div style="width: 200px; height: 200px; border: 1px solid #000;">Some Content</div>' )
	 *             .appendTo( 'body' );
	 *         
	 *         var mask = new Mask( { target: $contentDiv, spinner: true, msg: "Loading..." } );
	 *         
	 *         // Links to show/hide the mask
	 *         jQuery( '<a href="javascript:;">Show Mask</a>' ).click( function() { mask.show(); } ).appendTo( 'body' );
	 *         jQuery( '<br />' ).appendTo( 'body' );
	 *         jQuery( '<a href="javascript:;">Hide Mask</a>' ).click( function() { mask.hide(); } ).appendTo( 'body' );
	 *         
	 *     } );
	 */
	var Mask = Class.create( {

		/**
		 * @cfg {HTMLElement/jQuery/gui.Component} target (required)
		 * 
		 * The target of the Mask. This may be an HTMLElement, a jQuery wrapped set, of a {@link gui.Component}.
		 * 
		 * - In the case of a jQuery wrapped set, the set must only contain one element.
		 * - In the case of a {@link gui.Component}, the Mask will mask over the Component's 
		 *   {@link gui.Component#getMaskTarget mask target} element. It will also wait for the Component to be rendered
		 *   if it has not been rendered yet.
		 * 
		 * Note: It is not required that this config be set at instantiation time, but it must be set before calling
		 * {@link #show}. The {@link #setTarget) method may be used to set the Mask's target after instantiation time. 
		 */
		
		/**
		 * @cfg {Boolean} spinner
		 * 
		 * `true` to display a spinner image in the {@link #$contentEl} element when the mask is shown.
		 */
		spinner : false,
		
		/**
		 * @cfg {String/HTMLElement/jQuery} msg
		 * 
		 * A message (or any HTML content) to display in the content area of the mask. If this is specified, the {@link #$contentEl} 
		 * will be made to look like an opaque box, so that text inside of it is easily readable. Defaults to an empty string, for 
		 * no message.
		 */
		msg : "",
		
		/**
		 * @cfg {String} overlayCls
		 * 
		 * Any additional space-delimited CSS class(es) to add to the Mask's {@Link #$overlayEl overlay element}. This is the element
		 * that forms the mask itself. 
		 * 
		 * To style the Mask's {@link #spinner} or {@link #msg}, use {@link #contentCls}.
		 */
		
		/**
		 * @cfg {String} contentCls
		 * 
		 * Any additional space-delimited CSS class(es) to add to the Mask's {@Link #$contentEl content element}. This is the element
		 * that holds the {@link #spinner} and {@link #msg}.
		 * 
		 * To style the Mask's overlay, use {@link #overlayCls}.
		 */
		
		/**
		 * @cfg {Object} contentPosition
		 * 
		 * Defines where the {@link #$contentEl content element} will be placed within the Mask. 
		 * 
		 * This config is an Object (map) which must have two properties: `my` and `at`. These properties relate to the 'my' 
		 * and 'at' configs that are accepted by the jQuery UI Position utility (see: http://jqueryui.com/position/), and may take 
		 * any Position utility values.
		 * 
		 * For example:
		 * 
		 *     {
		 *         my: 'right-20 bottom-20',
		 *         at: 'right bottom'
		 *     }
		 * 
		 * 
		 * Defaults to centering the content element within the mask, using the following config:
		 * 
		 *     {
		 *         my: 'center center',
		 *         at: 'center center'
		 *     }
		 */
		

		/**
		 * @protected
		 * @property {String/gui.template.Template} maskTpl
		 * 
		 * The template to use to create the Mask's elements.
		 */
		maskTpl : new LoDashTpl( [
			'<div data-elem="gui-mask-overlay" class="gui-mask-overlay<%= ( overlayCls ? " " + overlayCls : "" ) %>" />',
			'<div data-elem="gui-mask-content" class="gui-mask-content<%= ( spinner ? " " + spinnerVisibleCls : "" ) %><%= ( msg ? " " + msgVisibleCls : "" ) %><%= ( contentCls ? " " + contentCls : "" ) %>">',
				'<span class="gui-mask-spinner" />',
				'<div data-elem="gui-mask-msg" class="gui-mask-msg"><%= msg %></div>',
			'</div>'
		] ),
		
		/**
		 * @protected
		 * @property {Boolean} rendered
		 * 
		 * Will be true once the Mask's elements have been rendered ({@link #renderMaskElements} has been run). Initially false.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $overlayEl
		 * 
		 * The masking element itself. This is lazily created in the {@link #renderMaskElements} method when the mask is to
		 * be shown.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $contentEl
		 * 
		 * The content element that sits on top of the Mask to display the {@link #msg} and/or {@link #spinner}. This is lazily 
		 * created in the {@link #renderMaskElements} method when the mask is to be shown.
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
		spinnerVisibleCls : 'gui-mask-spinner-visible',
		
		/**
		 * @protected
		 * @property {String} msgVisibleCls
		 * 
		 * The CSS class to add to the Mask's {@link #$contentEl} when a {@link #msg} exists.
		 */
		msgVisibleCls : 'gui-mask-msg-visible',
		
		/**
		 * @protected
		 * @property {Boolean} visible
		 * 
		 * Stores if the mask is currently being shown or not (visible). Retrieve with {@link #isVisible}.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} elementsAttached
		 * 
		 * Flag which is set `true` while the elements of the Mask ({@link #$overlayEl} and {@link #$contentEl}) are attached
		 * to the {@link #target} element.
		 */
		
		/**
		 * @protected
		 * @property {Number} repositionIntervalId
		 * 
		 * The ID of the interval which constantly repositions the mask and its content element over the {@link #target}.
		 * This is done in case the {@link #target} changes size at any point.
		 */
		
		
		/**
		 * @constructor
		 * @param {Object} [cfg] The configuration options for the Mask, specified in an Object (map).
		 */
		constructor : function( cfg ) {
			_.assign( this, cfg );
			
			if( this.target ) {
				var target = this.target;
				delete this.target;  // so setTarget() won't think there's a "previous" target
				
				this.setTarget( target );
			}
		},
		
		
		/**
		 * Resets the configuration of the mask, optionally with a brand new configuration object. All configuration options 
		 * (with the exception of {@link #target}) will be either replaced with the new configuration options, or restored to 
		 * their defaults. 
		 * 
		 * A new {@link #target} may be provided to this method in the `newCfg` object however, which will in turn change the 
		 * target for the Mask. This configuration option is simply left as-is if not provided.
		 * 
		 * @param {Object} [newCfg] An Object (map) of the new configuration options for the Mask, if any. See the "config options" 
		 *   section of the docs for accepted properties. 
		 */
		resetConfig : function( cfg ) {
			cfg = cfg || {};
			
			// First, set the new content position. This will be used in calls to setSpinner() and setMsg() if changes are made
			// to those configs, which may make it more performant to set first.
			this.contentPosition = cfg.contentPosition; 
			
			if( cfg.target ) this.setTarget( cfg.target );
			
			// Remove any previous CSS classes from the elements (if they are rendered), and add the new ones (if any)
			if( this.rendered ) {
				this.$overlayEl.removeClass( this.overlayCls ).addClass( cfg.overlayCls );
				this.$contentEl.removeClass( this.contentCls ).addClass( cfg.contentCls );
			}
			this.overlayCls = cfg.overlayCls;
			this.contentCls = cfg.contentCls;
			
			this.setSpinner( cfg.spinner || false );
			this.setMsg( cfg.msg || "" );
			
			// Note: must run positionContentEl() in case there was a change to only the `contentPosition` config.
			// Otherwise, this would have been called by setSpinner() or setMsg() if changes were made to the spinner/msg state.
			if( this.isAttached() ) this.positionContentEl();
		},
		
		
		/**
		 * Sets (or moves) the {@link #target} for the Mask.
		 * 
		 * @param {HTMLElement/jQuery/gui.Component} target The new target of the Mask. See {@link #target} for details.
		 */
		setTarget : function( target ) {
			var currentlyVisible = this.isVisible();
			if( currentlyVisible ) this.hide();  // hide, to restore the old Mask target element's state
			
			var prevTarget = this.target;
			if( prevTarget && prevTarget.isGuiComponent ) {
				this.unsubscribeToRender( prevTarget );
			}
			
			this.target = this.normalizeTarget( target );
			
			if( target.isGuiComponent ) {
				this.subscribeToRender( target );
			}
			
			if( currentlyVisible ) this.show();  // now show again using the new `this.target` reference
		},
		
		
		/**
		 * Normalizes the provided `target` (for the {@link #target} config) to a jQuery wrapped set if it was an HTML element.
		 * 
		 * @protected
		 * @param {HTMLElement/jQuery/gui.Component} target
		 * @return {jQuery/gui.Component}
		 */
		normalizeTarget : function( target ) {
			if( _.isElement( target ) ) {
				return jQuery( target );
			
			// <debug>
			} else if( target instanceof jQuery && target.length !== 1 ) {
				throw new Error( "`target` jQuery object must hold exactly one element" );
			// </debug>
			}
			
			return target;
		},
		
		
		/**
		 * Subscribes to the {@link gui.Component#event-render render} event of the given `component`. 
		 * 
		 * This is used when an unrendered {@link gui.Component} is used as the Mask's {@link #target}.
		 * 
		 * @private
		 * @param {gui.Component} component
		 */
		subscribeToRender : function( component ) {
			component.on( 'render', this.onTargetComponentRender, this );
		},
		
		
		/**
		 * Unsubscribes from the {@link gui.Component#event-render render} event of the given `component`. 
		 * 
		 * This is used when an unrendered {@link gui.Component} is used as the Mask's {@link #target}.
		 * 
		 * @private
		 * @param {gui.Component} component
		 */
		unsubscribeToRender : function( component ) {
			component.un( 'render', this.onTargetComponentRender, this );
		},
		
		
		/**
		 * Handles a {@link #target} of a {@link gui.Component} becoming rendered. The Mask is not actually rendered 
		 * and shown until the Component has become rendered (i.e. created its elements).
		 * 
		 * @protected
		 * @param {gui.Component} component
		 */
		onTargetComponentRender : function( component ) {
			if( this.isVisible() ) {
				this.unsubscribeToRender( component );  // remove event listener since no longer needed
				
				this.show();  // calling this now will show the Mask due to the `deferredShow` property being set to true
			}
		},
		
		
		/**
		 * Sets the {@link #spinner spinner's} visibility.
		 * 
		 * @param {Boolean} visible `true` to make the spinner visible, `false` to hide it.
		 */
		setSpinner : function( visible ) {
			if( this.spinner === visible ) return;  // return out if already in the given `visible` state
			
			this.spinner = visible;
			
			if( this.rendered ) {
				this.$contentEl.toggleClass( this.spinnerVisibleCls, visible );
				
				// Update the position of the content element to account for the change in spinner visibility
				if( this.isAttached() )
					this.positionContentEl();  
			}
		},
		
		
		/**
		 * Sets the {@link #msg message} for the Mask.
		 * 
		 * @param {String} msg The message. Accepts HTML. To remove the message, provide an empty string.
		 */
		setMsg : function( msg ) {
			if( this.msg === msg ) return;  // return out if we already have the given `msg`
			
			this.msg = msg;
			
			if( this.rendered ) {
				this.$contentEl.toggleClass( this.msgVisibleCls, !!msg );
				this.$msgEl.html( msg );
				
				// Update the position of the content element to account for a possible change in message size
				if( this.isAttached() )
					this.positionContentEl();  // the Mask's elements are currently attached and shown, position
			}
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Initializes (creates) the masking elements (the {@link #$overlayEl} and {@link #$contentEl}), and appends them to the
		 * {@link #target} element.
		 * 
		 * Note that these elements are absolutely positioned so they do not affect document flow.
		 * 
		 * @protected
		 */
		renderMaskElements : function() {
			if( !this.rendered ) {
				this.attachElementsToTargetEl();
				
				var $targetEl = this.getTargetEl(),
				    onMaskClick = _.bind( this.onMaskClick, this );
				
				this.$overlayEl = $targetEl.find( '[data-elem="gui-mask-overlay"]' ).on( 'click', onMaskClick );
				this.$contentEl = $targetEl.find( '[data-elem="gui-mask-content"]' ).on( 'click', onMaskClick );
				this.$msgEl = $targetEl.find( '[data-elem="gui-mask-msg"]' );
				
				this.rendered = true;
			}
		},
		
		
		/**
		 * Determines if Mask has been rendered.
		 * 
		 * The Mask will only be rendered once {@link #show shown}. If {@link #target} is a {@link gui.Component}, the
		 * Component must also be {@link gui.Component#isRendered rendered}.
		 */
		isRendered : function() {
			return !!this.rendered;
		},
		
		
		/**
		 * Retrieves the target element for the Mask.
		 * 
		 * @protected
		 * @return {jQuery}
		 */
		getTargetEl : function() {
			var target = this.target;
			
			return ( target.isGuiComponent ) ? target.getMaskTarget() : target;
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Shows the mask over the target element.
		 * 
		 * Note that if the mask is already visible, and its height needs to be recalculated because the underlying element's 
		 * size has changed, this method may be called again to redraw the mask.
		 */
		show : function() {
			// Only show the Mask if it is not already shown (or if it's show routine was deferred because of an unrendered target gui.Component)
			if( !this.isVisible() || this.deferredShow ) {
				// <debug>
				if( !this.target ) throw new Error( "Cannot show Mask, no `target` specified" );
				// </debug>
				
				this.visible = true;
				
				// If the Mask can't be shown because the `target` is a gui.Component that is not yet rendered, then defer until
				// the Component is rendered.
				if( !this.canShow() ) {
					this.deferredShow = true;
					return;
				} else {
					delete this.deferredShow;  // we're showing the mask, no longer deferred
				}
				
				if( !this.rendered ) this.renderMaskElements();  // Lazily render the Mask's elements if not yet rendered
				
				this.prepareTargetElForMask();
				this.attachElementsToTargetEl();  // effectively "shows" the Mask's elements, since they are detached when the Mask is hidden
				this.positionAndSizeElements();
				
				// Set up an interval to continually make sure that the Mask's elements are always sized and positioned to be in
				// sync with the `target` element.
				this.repositionIntervalId = setInterval( _.bind( this.positionAndSizeElements, this ), 100 );
			}
		},
		
		
		/**
		 * Determines if the Mask can be shown. 
		 * 
		 * The Mask can be shown if:
		 * 
		 * 1. The {@link #target} is an element (normalized to a jQuery wrapped set), or 
		 * 2. The {@link #target} is a {@link gui.Component} that is {@link gui.Component#isRendered *rendered*}.
		 * 
		 * This method will return `false` if the {@link #target} is a {@link gui.Component} that is not yet rendered.
		 * 
		 * @protected
		 * @return {Boolean} `true` if the Mask can be shown, `false` otherwise.
		 */
		canShow : function() {
			var target = this.target;
			return ( target instanceof jQuery ) || ( target && target.isGuiComponent && target.isRendered() ); 
		},
		
		
		/**
		 * Appends the Mask's elements (the {@link #$overlayEl and the {@link #$contentEl}) to the {@link #target target's} 
		 * element.
		 * 
		 * If the Mask's elements have not yet been created, they will be created lazily by executing the {@link #maskTpl}
		 * the first time this method is run.
		 * 
		 * @protected
		 */
		attachElementsToTargetEl : function() {
			var $targetEl = this.getTargetEl();
			
			if( !this.rendered ) {  // Not yet rendered, run the template to append the elements for the first time
				var tplData = this.getMaskTplData();
				$targetEl.append( this.maskTpl.apply( tplData ) );
				
			} else {
				this.$overlayEl.appendTo( $targetEl );
				this.$contentEl.appendTo( $targetEl );
			}
			this.elementsAttached = true;
		},
		
		
		/**
		 * Retrieves the data that will be used by the {@link #maskTpl} when the template is executed.
		 * 
		 * @protected
		 */
		getMaskTplData : function() {
			return {
				spinner : this.spinner,
				spinnerVisibleCls : this.spinnerVisibleCls,
				
				msg : this.msg,
				msgVisibleCls : this.msgVisibleCls,
				
				overlayCls : this.overlayCls,
				contentCls : this.contentCls
			};
		},
		
		
		/**
		 * Prepares the {@link #target} for showing the Mask by giving it a positioning context if it doesn't yet have one,
		 * and removing its scrollbars.
		 * 
		 * @protected
		 */
		prepareTargetElForMask : function() {
			var $targetEl = this.getTargetEl();
			
			// First, add the gui-masked css class to the target element, which removes the target element's scroll bars
			$targetEl.addClass( 'gui-masked' );
			
			// Next, give the target element a relative positioning context if it currently does not have one (i.e. it's static), 
			// and the target element is not the document body (which already has a positioning context)
			if( $targetEl.css( 'position' ) === 'static' && !$targetEl.is( 'body' ) ) {
				$targetEl.addClass( 'gui-masked-relative' );
			}
		},
		
		
		/**
		 * Positions and sizes the Mask's elements. This method is called continually while the Mask is {@link #show shown} in order
		 * to always account for the possibility of the {@link #target} element changing size.
		 * 
		 * @protected
		 */
		positionAndSizeElements : function() {
			this.sizeOverlayEl();
			this.positionContentEl();
		},
		
		
		/**
		 * Sizes the {@link #$overlayEl} to be the height of the {@link #target} element.
		 * 
		 * Note: Old IE will not always expand full height automatically if it has a CSS-driven 100% height. Just doing this 
		 * calculation for all browsers for simplicity for now, instead of a hybrid solution.
		 * 
		 * @protected
		 */
		sizeOverlayEl : function() {
			this.$overlayEl.height( this.getTargetEl().outerHeight() );
		},
		
		
		/**
		 * Repositions the {@link #$contentEl} to be at the {@link #contentPosition}.
		 * 
		 * @protected
		 */
		positionContentEl : function() {
			if( this.isContentElVisible() ) {
				var contentPosition = this.contentPosition || {},
				    $targetEl = this.getTargetEl();
				
				this.$contentEl.position( {  // use jQuery UI positioning utility to position the content element
					my: contentPosition.my || 'center center',
					at: contentPosition.at || 'center center',
					of: $targetEl,
					collision: 'none'  // if clients want to move their content element outside of the Mask area, they are welcome to do so
				} );
			}
		},
		
		
		/**
		 * Used internally by the Mask, determines if the {@link #$contentEl} is visible.
		 * 
		 * @protected
		 * @return {Boolean} `true` if the {@link #$contentEl} is visible, `false` otherwise.
		 */
		isContentElVisible : function() {
			return ( this.spinner || !!this.msg );  // it's visible if the Mask has either a spinner, or a message
		},
		
		
		/**
		 * Hides the mask.
		 */
		hide : function() {
			if( this.isVisible() ) {  // Should only hide if the mask is currently visible.
				
				// If the Mask was being deferred from showing, then we do not need to perform these actions since show() never fully executed
				if( !this.deferredShow ) {
					clearInterval( this.repositionIntervalId );
					
					this.detachElementsFromTargetEl();  // effectively hides the Mask's elements
					this.restoreTargetEl();             // restore scrollbars (if any) and remove the Mask-given positioning context
				}
					
				this.visible = false;
			}
		},
		
		
		/**
		 * Detaches the Mask's elements (the {@link #$overlayEl and the {@link #$contentEl}) from the {@link #target target's}
		 * element. This effectively hides the Mask's elements.
		 * 
		 * @protected
		 */
		detachElementsFromTargetEl : function() {
			this.$overlayEl.detach();
			this.$contentEl.detach();
			
			this.elementsAttached = false;
		},
		
		
		/**
		 * Restores the {@link #target} for hiding the Mask by removing its Mask-given positioning context (if it was given one),
		 * and restoring its scrollbars.
		 * 
		 * @protected
		 */
		restoreTargetEl : function() {
			this.getTargetEl().removeClass( 'gui-masked gui-masked-relative' );
		},
		
		
		/**
		 * Determines if the Mask is currently shown (visible).
		 * 
		 * @return {Boolean} `true` if the Mask is currently shown (visible), `false` otherwise.
		 */
		isVisible : function() {
			return !!this.visible;
		},
		
		
		/**
		 * Determines if the Mask's elements are attached to the {@link #target} element. 
		 * 
		 * It is possible that the Mask is considered {@link #isVisible visible}, but its elements have not yet been attached because the 
		 * {@link #target} is an unrendered {@link gui.Component}. It is still considered visible in this case because as soon as the
		 * Component is {@link gui.Component#event-render rendered}, the Mask will be shown.
		 * 
		 * @return {Boolean} `true` if the Mask is currently visible, and the Mask's elements are attached to the {@link #target} element. 
		 *   Returns `false` otherwise.
		 */
		isAttached : function() {
			return this.elementsAttached;
		},
		
		
		// -------------------------------------
		
		// Event Handlers
		
		
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
		 * Destroys the Mask by cleaning up its elements.
		 */
		destroy : function() {
			// Make sure the mask has been hidden, to restore the target element to its original state, and clear
			// the reposition interval
			this.hide();
			
			// Make sure that if the `target` is a gui.Component, that we unsubscribe from any 'render' listener we added
			if( this.target && this.target.isGuiComponent ) {
				this.unsubscribeToRender( this.target );
			}
			
			if( this.rendered ) {
				this.$overlayEl.remove();
				this.$contentEl.remove();
			}
		}
		
	} );
	
	return Mask;
	
} );
