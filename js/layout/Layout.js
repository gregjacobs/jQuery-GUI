/*global define */
define( [
	'lodash',
	'Class',
	'ui/UI',
	'ui/util/Observable'
], function( _, Class, UI, Observable ) {
	
	/**
	 * @abstract 
	 * @class ui.layout.Layout
	 * @extends ui.util.Observable
	 * 
	 * Base class Layout that defines the public interface of all Layout subclasses. Layouts are stateful strategy objects 
	 * that are used by {@link ui.Container ui.Containers} to implement how their child items are displayed. Because of their 
	 * stateful nature, the same layout may not be used by multiple {@link ui.Container ui.Containers}.
	 * 
	 * The default layout that is used for a {@link ui.Container Container} is the {@link ui.layout.Auto}, 
	 * which simply renders each child component directly into the {@link ui.Container ui.Container's} 
	 * {@link ui.Component#getContentTarget content target element}, and does no further sizing or formatting.
	 * 
	 * 
	 * ## Building a Layout
	 * 
	 * Layout subclasses should implement the {@link #onLayout} hook method to implement their layout routine.
	 * They should first call the superclass `onLayout` method, and then implement the code to perform the desired layout.
	 * Note the following items:
	 * 
	 * - {@link #onLayout} and {@link #afterLayout} will be executed each time the {@link #container container's} 
	 *   {@link ui.Container#doLayout} method is executed. This means that {@link #onLayout} and {@link #afterLayout}
	 *   may be called multiple times during the lifetime of the Layout, and this should be handled. Some layouts choose
	 *   to have completely separate "first run" and "update layout" methods.
	 * - Use the helper methods in this Layout class to {@link #renderComponent render} and {link #sizeComponent size}
	 *   child components of the {@link #container}. They take into account details of the Layout system, and sizing details
	 *   (such as accounting for child component padding/margin/border) that aren't handled elsewhere. See the 
	 *   {@link #renderComponent} and {@link #sizeComponent} methods for details.
	 * - Layouts should handle the case of the {@link #container} they are laying out having 0 child components, and it should
	 *   also handle the cases where child components are added, removed, or reordered. However, try not execute the
	 *   {@link #renderComponent} method (and thus the {@link ui.Component#render} method) when the component is already
	 *   rendered and in the correct position. This adds DOM overhead, and can cause some weird behavior such as having
	 *   {@link ui.formFields.TextField TextFields to lose focus if a layout runs that does this.
	 * - Browser window resize events should not be handled within the Layout. The top level {@link ui.Viewport} will
	 *   call its {@link ui.Container#doLayout doLayout} method to fix the layout automatically, on resize.
	 * 
	 * Layouts are required to manage any HTML elements that they create, and should clean up after themselves
	 * when they are done. This includes cleaning up old HTML elements when {@link #doLayout} (and therefore,
	 * {@link #onLayout}) is run again, and when the Layout is {@link #destroy destroyed}. Subclasses should
	 * implement the {@link #onDestroy} method to implement their clean up as part of the destruction process.
	 * Note that a layout may be destroyed by a {@link ui.Container} if another layout is set to it, and therefore
	 * it cannot be relied on that the Container will clean up any stray elements that a Layout has created.
	 *
	 * 
	 * @constructor
	 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
	 */
	var Layout = Class.extend( Observable, {
		abstractClass : true,
		
		
		/**
		 * @cfg {ui.Container} container
		 * 
		 * The {@link ui.Container} that this Layout object belongs to. Defaults to null, and can be set
		 * after instantiation with {@link #setContainer}. 
		 */
		container : null,
		
		/**
		 * @protected
		 * @property {ui.Container} container
		 * 
		 * The {@link ui.Container} that this Layout object belongs to, set by either the config option,
		 * or the {@link #setContainer} method.
		 */
		
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
		 * Flag which is set to true once the layout has been {@link #destroy destroyed}.
		 */
		destroyed : false,
		
		
		constructor : function( config ) {
			this.addEvents(
				/**
				 * Fires when this layout is destroyed.
				 * 
				 * @event destroy
				 * @param {ui.layout.Layout} layout This AbstractLayout instance.
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
		initLayout : UI.emptyFn,
		
		
		/**
		 * Sets the {@link ui.Container} instance that this Layout belongs to.
		 * 
		 * @method setContainer
		 * @param {ui.Container} container
		 */
		setContainer : function( container ) {
			this.container = container;
			this.onContainerSet( container );
		},
		
		
		/**
		 * Gets the {@link ui.Container} instance that this Layout belongs to.
		 * 
		 * @method getContainer
		 * @return {ui.Container} The container
		 */
		getContainer : function() {
			return this.container;
		},
		
		
		/**
		 * Hook method which is executed when the {@link #container} is set to the Layout.
		 * This is executed upon initialization if the {@link #container} config was provided (but
		 * after {@link #initLayout} is executed), or when {@link #setContainer} is called.
		 * 
		 * Note that this method is guaranteed to run before {@link #doLayout} runs, and subclasses
		 * should call the superclass method first.
		 * 
		 * @protected
		 * @template
		 * @method onContainerSet
		 * @param {ui.Container} container The Container that was set.
		 */
		onContainerSet : UI.emptyFn,
		
		
		/**
		 * Performs the layout strategy. Calls the {@link #onLayout} hook method for subclasses to perform the 
		 * necessary layout processing.
		 * 
		 * @method doLayout
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
			
			
			// Now that each child ui.Component has been rendered, we need to run the layouts on each component 
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
		 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : UI.emptyFn,
		
		
		/**
		 * Hook method for subclasses to override to implement any layout finalization strategy. This method
		 * is called after {@link #onLayout}, and after all child components which needed to be laid out, have
		 * been laid out.
		 * 
		 * @protected
		 * @template
		 * @method afterLayout
		 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		afterLayout : UI.emptyFn,
		
		
		/**
		 * Handles when a child component is laid out manually in a Layout subclass, during the layout routine
		 * ({@link #doLayout}/{@link #onLayout}). This is so that we know that we don't have to lay out components
		 * that have already been manually laid out.
		 * 
		 * @method markLayoutComplete
		 * @param {ui.Component} component The Component that a layout was performed on.
		 */
		markLayoutComplete : function( component ) {
			this.needsLayoutMap[ component.getUuid() ] = false;
		},
		
		
		// ------------------------------------------------
		
		
		/**
		 * Utility method used to render a child {@link ui.Component} into the layout's target element. This method renders
		 * the child component, deferring any layout of child {@link ui.Container containers} until after the layout process 
		 * is complete.
		 * 
		 * This method lazily renders the provided `component`. A call to the component's {@link ui.Component#render render}
		 * method will only be made if:
		 * 
		 * 1) The `component` is not yet {@link ui.Component#render rendered}.
		 * 2) The `component` is rendered, but not a child of the `$targetEl`. Calling {@link ui.Component#render render} here
		 *    will move it.
		 * 3) The `component` is not at the provided `position` in the $targetEl. Basically if the `position` option is provided, 
		 *    an extra check will be made to determine if the component already exists at that position, and if so, no call to 
		 *    {@link ui.Component#render render} will be made.
		 * 
		 * The main reason that this method checks to see if the {@link ui.Component#render} method needs to be called before
		 * doing so is so that we do not end up moving components around the DOM when they don't need to be. Doing so will
		 * make the browser do more work, and can also cause unwanted side effects. One of these side effects could be if the user 
		 * is editing a {@link ui.formFields.TextAreaField TextAreaField}, and the field resizes, triggering a layout routine 
		 * (see {@link ui.formFields.TextAreaField#autoGrow}). If a parent layout of the TextAreaField moves a component in the DOM, 
		 * the TextAreaField will lose focus, and the user would have to click into it again to continue editing.
		 * 
		 * @protected
		 * @method renderComponent
		 * @param {ui.Component} component The component to render.
		 * @param {jQuery} $targetEl The target element to render the `component` into.
		 * @param {Object} [options] Any additional options to provide to the `options` argument of the 
		 *   `component`'s {@link ui.Component#render} method. 
		 * @param {Number/String/HTMLElement/jQuery} [options.position] This property is handled in particular 
		 *   by this method (if provided), to determine if the `component` needs to be moved (by way
		 *   of the {@link ui.Component#render render} method). If provided, an extra test will check if
		 *   the component is already in the correct position, or else no call to {@link ui.Component#render}
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
		 * Utility method used to size a child {@link ui.Component} to the given `width` and `height`, based on the `component`'s 
		 * margin/padding/border widths. This method should only be called after the `component` has already been rendered, so that 
		 * it can access the margin/padding/border widths on the `component`.
		 * 
		 * @protected
		 * @method sizeComponent
		 * @param {ui.Component} component The {@link ui.Component component} to size.
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
		 * 
		 * @method destroy
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
		onDestroy : UI.emptyFn
		
	} );

	return Layout;
} );