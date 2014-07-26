/*global define */
/*jshint boss:true */
define( [
	'jquery',
	'lodash',
	'Class',
	
	'gui/ComponentManager'
], function( jQuery, _, Class, ComponentManager ) {

	/**
	 * @class gui.ComponentDomDelegateHandler
	 * @singleton
	 * 
	 * The ComponentDomDelegateHandler class supports the special jQuery-GUI DOM event attributes that may be placed within 
	 * the HTML elements of a {@link gui.Component}. These special attributes include:
	 * 
	 * - gui-click
	 * - gui-dblclick
	 * - gui-mouseenter (jQuery emulated event)
	 * - gui-mouseleave (jQuery emulated event)
	 * - gui-mousedown
	 * - gui-mouseup
	 * - gui-keydown
	 * - gui-keypress
	 * - gui-keyup
	 * - gui-focus    (non-bubbling - only affects the element that it is attached to)
	 * - gui-blur     (non-bubbling - only affects the element that it is attached to)
	 * - gui-focusin  (bubbling 'focus' event)
	 * - gui-focusout (bubbling 'blur' event)
	 * - gui-change
	 * - gui-select
	 * - gui-submit
	 * 
	 * When one of these attributes is placed in an HTML element under a component (say, in a component's 
	 * {@link gui.Component#tpl template}), the event is auto-bound to the Component, and the specified method name (in the
	 * attribute's value) is called on the Component.
	 * 
	 * For example: the attribute `gui-click="onMyElementClick"` will call the `onMyElementClick` method of the 
	 * component when this element is clicked, passing in the `jQuery.Event` object as its first argument.
	 * 
	 * The special 'gui-' attributes may be placed in markup / DOM nodes anywhere under the {@link gui.Component Component},
	 * such as in:
	 * 
	 * 1) The {@link gui.Component#html html} config,
	 * 2) The {@link gui.Component#tpl tpl} config,
	 * 3) The {@link gui.Component#renderTpl renderTpl} config,
	 * 4) Injected HTML at any point via direct DOM manipulation by a method of the {@link gui.Component Component}.
	 * 
	 * HTML with these attributes may be added at any time, as this implementation uses event bubbling to determine
	 * the Component an event should be attached to.
	 * 
	 * 
	 * ## Full Example
	 * 
	 *     require( [
	 *         'gui/Component'
	 *     ], function( Component ) {
	 *     
	 *         var component = new Component( {
	 *             html : '<div gui-click="onDiv1Click">Div 1</div>' + 
	 *                    '<div gui-click="onDiv2Click">Div 2</div>',
	 *             
	 *             onDiv1Click : function( evt ) {
	 *                 alert( "Div 1 Clicked" );
	 *             },
	 *             
	 *             onDiv2Click : function( evt ) {
	 *                 alert( "Div 2 Clicked" );
	 *             }
	 *             
	 *         } );
	 *         
	 *         component.render( 'body' );
	 *     
	 *     } );
	 * 
	 * 
	 * ## Detailed Operation
	 * 
	 * This class sets up global (i.e. document-level) delegate event handlers to support the functionality of the special 
	 * attributes via event bubbling. This has the advantages that:
	 * 
	 * 1) only one set of handlers needs to be set up,
	 * 2) any additional DOM manipulations made by a component are automatically handled, and
	 * 3) only a small set of event handlers are ever set up, and only a small set need to be unbound when the document 
	 *    is unloaded.
	 * 
	 * 
	 * What happens internally when, for example, a 'click' event is captured from an HTML element, this class:
	 * 
	 * A) checks the element and/or its ancestors for a `gui-[eventName]="[methodName]"` attribute. If one is found, 
	 *    it then
	 * B) continues up the DOM tree until it finds the {@link gui.Component Component's} element
	 * 
	 * When these two items are found, the method is called on the component, passing in the `jQuery.Event` object as
	 * its first argument.
	 */
	var ComponentDomDelegateHandler = Class.create( {
		
		/**
		 * @private
		 * @property {String[]} eventNames
		 * 
		 * The event names that can be used by the special 'gui-[eventName]' attributes.
		 */
		eventNames : [
			'click',
			'dblclick',
			'mouseenter',
			'mouseleave', 
			'mousedown',
			'mouseup',
			'keydown',
			'keypress',
			'keyup',
			'focus',
			'blur',
			'focusin',
			'focusout',
			'change',
			'select'
		],
		
		/**
		 * @private
		 * @property {Function} onEventScopedFn
		 * 
		 * A reference to the {@link #onEvent} function, scoped to the singleton instance. This is used to register
		 * the event handling method, and unregister it later in {@link #destroy}.
		 */
		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			this.onEventScopedFn = _.bind( this.onEvent, this );  // bound function for use in init() and destroy()
			
			jQuery( document ).ready( _.bind( this.init, this ) );
			jQuery( window ).on( 'beforeunload', _.bind( this.destroy, this ) );
		},
		
		
		/**
		 * Initializes the ComponentDomDelegateHandler by attaching its event handlers on the document body.
		 * These event handlers will hook up to the components to call methods on them.
		 * 
		 * @private
		 */
		init : function() {
			var eventNames = this.getDelegateEventNames();
			
			jQuery( document.body ).on( eventNames.join( " " ), this.onEventScopedFn );
		},
		
		
		/**
		 * Retrieves the list of event names to subscribe to using the document-level delegate handler. 
		 * 
		 * @private
		 */
		getDelegateEventNames : function() {
			return _.without( this.eventNames, 'focus', 'blur' );  // 'focus' and 'blur' are handled with the 'focusin' and 'focusout' events, since these events do not bubble
		},
		
		
		/**
		 * Handles a listened-to event, looking for any `gui-[eventName]` attributes, and calling the specified
		 * method on the Component which owns the element.
		 * 
		 * @private
		 * @param {jQuery.Event} evt The jQuery event object, which will be passed to the method specified by
		 *   a `gui-[eventName]` attribute.
		 */
		onEvent : function( evt ) {
			var el = evt.target,
			    eventType = evt.type,
			    doc = document;
			
			// Special case for 'focusin' and 'focusout' events, which handle 'gui-focus' and 'gui-blur' attributes.
			// This is because 'focus' and 'blur' events do not bubble, and are therefore not handled by our delegate listener.
			if( el !== doc && ( eventType === 'focusin' || eventType === 'focusout' ) ) {
				this.handleFocusOrBlur( el, eventType, evt );
			}
			
			// Walk up the DOM tree, finding elements with the appropriate `gui-[eventName]` attributes, and calling
			// handler methods on those elements' corresponding Components.
			var evtAttrName = 'gui-' + eventType;
			do {
				var handlerMethodName;
				
				if( el !== doc && ( handlerMethodName = el.getAttribute( evtAttrName ) ) ) {
					this.callHandler( el, handlerMethodName, evt );
				}
			} while( !evt.isPropagationStopped() && ( el = el.parentNode ) );
		},
		
		
		/**
		 * Special case to handle the 'gui-focus' or 'gui-blur' event attributes using the 'focusin' or 'focusout'
		 * events. 
		 * 
		 * 'gui-focus' and 'gui-blur' apply to *only* the evt.target element (assuming one of these attributes exist there).
		 * Normally, 'focus' and 'blur' events are not bubbled by the browser, so we're using 'focusin' and 'focusout' to 
		 * handle these.
		 * 
		 * @private
		 * @param {HTMLElement} el The element that is being processed, which has the special gui-[eventName] event 
		 *   attribute. This is used to resolve the {@link gui.Component} that is associated with the element.
		 * @param {String} eventType The name of the event that occurred. Will be either 'focusin' or 'focusout'.
		 * @param {jQuery.Event} evt The event object.
		 */
		handleFocusOrBlur : function( el, eventType, evt ) {
			var handlerMethodName;
			
			if( eventType === 'focusin' && ( handlerMethodName = el.getAttribute( 'gui-focus' ) ) ) {
				this.callHandler( el, handlerMethodName, evt );
				
			} else if( eventType === 'focusout' && ( handlerMethodName = el.getAttribute( 'gui-blur' ) ) ) {
				this.callHandler( el, handlerMethodName, evt );
			}
		},
		
		
		/**
		 * Calls the handler `method` on the `element`'s associated {@link gui.Component}, passing in the `evt`.
		 * 
		 * @private
		 * @param {HTMLElement} element The element that is being processed, which has the special gui-[eventName] event 
		 *   attribute. This is used to resolve the {@link gui.Component} that is associated with the element.
		 * @param {String} method The name of the handler method to call.
		 * @param {jQuery.Event} evt The event object.
		 */
		callHandler : function( element, method, evt ) {
			evt.currentTarget = element;  // update the current target as the element with the gui-[eventName] attribute, as would be done in normal event bubbling
			
			// call the method on the component
			var component = this.resolveComponent( element ),
			    returnVal = component[ method ]( evt );
			
			if( returnVal === false ) 
				evt.preventDefault();  // prevent default event behavior if a handler returns `false`
		},
		
		
		/**
		 * Resolves the {@link gui.Component} instance from a given input element (`el`). This is either found from the input
		 * `element` itself (using its `id`), or the DOM tree is walked up until a Component element is found.
		 * 
		 * If no Component is able to be resolved, the method returns `null`.
		 * 
		 * @private
		 * @param {HTMLElement} el
		 * @return {gui.Component}
		 */
		resolveComponent : function( el ) {
			do {
				if( el.hasAttribute( 'gui-isComponentEl' ) ) {
					return ComponentManager.getComponentByElId( el.id );
				}
			} while( el = el.parentNode );
			
			return null;
		},
		
		
		
		/**
		 * Destroys the ComponentDomDelegateHandler on window unload by unregistering the event handlers it has
		 * placed on the &lt;body&gt; tag.
		 * 
		 * @private
		 */
		destroy : function() {
			jQuery( document.body ).off( this.getDelegateEventNames().join( " " ), this.onEventScopedFn );
		}
		
	} );
	
	
	// Return singleton instance
	return new ComponentDomDelegateHandler();

} );