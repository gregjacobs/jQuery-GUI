/*global define */
define( [
	'ui/Component',
	'ui/Container',
	'ui/layout/Layout',
	'ui/layout/Card.SwitchTransition'
], function( Component, Container, Layout, SwitchTransition ) {
	
	/**
	 * @class ui.layout.Card
	 * @extends ui.layout.Layout
	 * 
	 * A layout that renders a {@link ui.Container Container's} child components where only one child (card) can be shown 
	 * at a time (such as showing only the top card in a deck of cards).  Methods are available in this class to control
	 * which card is shown.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'cards'.
	 */
	var CardLayout = Layout.extend( {
		
		/**
		 * @cfg {Number/ui.Component} activeItem
		 * 
		 * The item number or {@link ui.Component} reference to set as the initially active item. Defaults to 0 (for the first item). 
		 * If this is a {@link ui.Component}, it should be a {@link ui.Component Component} that exists in the {@link ui.Container Container}.
		 */
		activeItem : 0,
		
		/**
		 * @cfg {Boolean} autoSize
		 * 
		 * By default, the CardsLayout tries to make each child component of the {@link #container} take up the available space in the target
		 * element (much like the {@link ui.layout.Fit}, but this may be set to true to simply allow the child components to determine their own size.
		 */
		autoSize : false,
		
		/**
		 * @cfg {ui.layout.Card.AbstractTransition} transition The {@link ui.layout.Card.AbstractTransition AbstractTransition} subclass to use
		 * for switching between cards. The default transition is the {@link ui.layout.Card.SwitchTransition SwitchTransition}, which simply hides
		 * the currently active card, and shows the new card. This may be changed to provide a different method of changing cards, such as to implement
		 * animation. 
		 */
		
		/**
		 * @cfg {Boolean} deferredRender
		 * True to only render a child {@link ui.Component component} once it is shown, false to render all child components immediately.
		 * Leaving this as true can improve initial rendering time, as only the shown component's rendering routine is actually performed.
		 * However, switching to a new component the first time may be slightly delayed as that component must be rendered and laid out.
		 */
		deferredRender : true,
		
		
		/**
		 * @protected
		 * @property {Object} componentSizeCache
		 * 
		 * A hashmap of component's uuid's (retrieved with {@link ui.Component#getUuid}) and an inner hashmap
		 * with width and height properties, which stores the last set width/height for each component in the CardsLayout.
		 */
		
		
		
		// protected
		initLayout : function() {
			this.addEvents(
				/**
				 * Fires when the active item has been changed.
				 * 
				 * @event cardchange
				 * @param {ui.Component} card The {@link ui.Component} instance of the card that was activated. If no card has
				 *   been activated (either by a null argument to {@link #setActiveItem}, or an index out of range), then this
				 *   will be null.
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
		 * Layout implementation for CardsLayout, which renders each child component into the Container's content target 
		 * (see {@link ui.Component#getContentTarget}), and then hides them.  The one given by the {@link #activeItem}
		 * config is then shown.
		 * 
		 * @protected
		 * @method onLayout
		 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {
			this._super( arguments );
			
			// First normalize the activeItem config to the ui.Component it refers to.
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
					// This sets the initial state of the CardsLayout to show the activeItem, while all others are hidden.
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
		 * @method renderAndSizeCard
		 * @param {ui.Component} component The card ({@link ui.Component}) which is to be rendered and sized.
		 * @param {jQuery} $targetEl The target element where the component is to be rendered.
		 * @param {Number} targetWidth The width to size the card component to (if the {@link #autoSize} config is false).
		 * @param {Number} targetHeight The height to size the card component to (if the {@link #autoSize} config is false).
		 */
		renderAndSizeCard : function( component, $targetEl, targetWidth, targetHeight ) {
			// Render the component (note: this will only be done if the component is not yet rendered, or needs to be moved into the $targetEl)
			this.renderComponent( component, $targetEl );
			
			// Size the child component to the full size of the target width and height (unless autoSize has been set to true, or it's the same size)
			// Can only do this now that the component has been rendered, as the sizeComponent() method needs to account for the component's padding/borderWidth/margin.
			var componentUuid = component.getUuid(),
			    lastComponentSize = this.componentSizeCache[ componentUuid ] || {};
			 
			if( !this.autoSize && ( /*targetWidth !== lastComponentSize.width ||*/ targetHeight !== lastComponentSize.height ) ) {
				this.sizeComponent( component, /*targetWidth*/ undefined, targetHeight );
				
				this.componentSizeCache[ componentUuid ] = {
					//width  : targetWidth,
					height : targetHeight
				};
			}
		},
		
		
		// --------------------------------
		
		
		/**
		 * Sets the active item.
		 * 
		 * @method setActiveItem
		 * @param {ui.Component/Number} item The ui.Component to set as the active item, or the item index to set as the active item (0 for the first item).
		 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
		 * @param {Object} options (optional) An object which will be passed along as options to the CardsLayout {@link #transition}. See the setActiveItem method in the
		 *   {ui.layout.Card.AbstractTransition AbstractTransition} subclass that you are using for a list of valid options (if any).
		 */
		setActiveItem : function( item, options ) {
			// Item was provided as a number, find the Component
			if( typeof item === 'number' ) {
				item = this.container.getItemAt( item );
				
			} else if( item instanceof Component && !this.container.has( item ) ) {
				item = null;  // if the item is not in the Container, set to null. Shouldn't switch to a Component that is not in the Container.
			}
			
			if( !this.container.isRendered() ) {
				// The Container that this layout belongs to is not rendered, just set the activeItem config to the requested item.
				// This method will be run again as soon as the Container is rendered, and its layout is done.
				this.activeItem = item;
				
			} else {
				// Make a change to the cards if:
				//  1) The new item is null -- we must remove the currently active item
				//  2) The new item is a component, but different from the activeItem -- we must switch the cards
				//  3) The new item is a component and is the activeItem, but is hidden -- we must show it
				if( !item || this.activeItem !== item || !item.isRendered() || item.isHidden() ) {
					
					// Delegate to the transition strategy for the change in cards (active item)
					// Make sure the activeItem is passed in only if it is an instantiated ui.Component (i.e. not null, and not the numbered config)
					var activeItem = this.activeItem;
					if( !( activeItem instanceof Component ) ) {
						activeItem = null;
					}
					
					// Render the card (component) if it is not yet rendered (and of course, it exists!)
					if( item !== null ) {
						var $targetEl = this.container.getContentTarget();
						this.renderAndSizeCard( item, $targetEl, $targetEl.width(), $targetEl.height() );
					}
					
					// Then delegate to the transition to make the change
					this.transition.setActiveItem( this, activeItem, item, options );
					
					// store the new currently active item (even if it is null), and fire the event
					this.activeItem = item;
					this.fireEvent( 'cardchange', item );
				}
			}
		},
		
		
		/**
		 * Gets the currently active item. Returns null if there is no active item. 
		 * 
		 * @method getActiveItem
		 * @return {ui.Component} The Component that is currently shown as the active item. Returns null if there is no active item.
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
		 * @method getActiveItemIndex
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
		 * Extended onDestroy method for the CardsLayout to destroy its CardsLayout {@link ui.layout.Card.AbstractTransition} object.
		 * 
		 * @protected
		 * @method onDestroy
		 */
		onDestroy : function() {
			// Destroy the transition strategy object
			this.transition.destroy();
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'card', CardLayout );
	
	return CardLayout;

} );