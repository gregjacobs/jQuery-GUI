/**
 * @class ui.layouts.CardsLayout
 * @extends ui.layouts.AbstractLayout
 * 
 * A layout that renders a {@link ui.Container Container's} child components where only one child (card) can be shown 
 * at a time (such as showing only the top card in a deck of cards).  Methods are available in this class to control
 * which card is shown.<br><br>
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'cards'.
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.layouts.CardsLayout = Kevlar.extend( ui.layouts.AbstractLayout, {
	
	/**
	 * @cfg {Number/ui.Component} activeItem
	 * The item number or {@link ui.Component} reference to set as the initially active item. Defaults to 0 (for the first item). 
	 * If this is a {@link ui.Component}, it should be a {@link ui.Component Component} that exists in the {@link ui.Container Container}.
	 */
	activeItem : 0,
	
	
	/**
	 * @cfg {ui.layouts.CardsLayout.AbstractTransition} transition The {@link ui.layouts.CardsLayout.AbstractTransition AbstractTransition} subclass to use
	 * for switching between cards. The default transition is the {@link ui.layouts.CardsLayout.SwitchTransition SwitchTransition}, which simply hides
	 * the currently active card, and shows the new card. This may be changed to provide a different method of changing cards, such as to implement
	 * animation. 
	 */
	
	
	/**
	 * @private
	 * @property activeItem
	 * Stores the currently active item ({@link ui.Component}), after the layout's onLayout method has run.
	 * @type ui.Component
	 */
	
	
	
	// protected
	initLayout : function() {
		this.addEvents(
			/**
			 * @event cardchange
			 * Fires when the active item has been changed. 
			 * @param {ui.Component} card The {@link ui.Component} instance of the card that was activated. If no card has
			 *   been activated (either by a null argument to {@link #setActiveItem}, or an index out of range), then this
			 *   will be null.
			 */
			'cardchange'
		);
		
		// Create the default transition strategy object if none was provided 
		if( !this.transition ) {
			this.transition = new ui.layouts.CardsLayout.SwitchTransition();
		}
		
		// Call superclass initLayout
		ui.layouts.CardsLayout.superclass.initLayout.call( this );
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
		ui.layouts.CardsLayout.superclass.onLayout.apply( this, arguments );
		
		// First normalize the activeItem config to the ui.Component it refers to.
		if( typeof this.activeItem === 'number' ) {
			this.activeItem = this.getContainer().getItemAt( this.activeItem );
		}
		
		// Now render the child Components, hiding them if they are not the activeItem.
		// Note: Was just rendering only the activeItem and then lazily rendering the others once they were requested,
		// but this caused a big performance issue with the SlideTransition. I believe the problem was rendering it and then hiding
		// it on demand, instead of being able to render it hidden.  Possibly need to figure out a way to do that so the lazy
		// rendering can be done.  Just rendering all components and then hiding the non-activeItem ones for now.
		for( var i = 0, len = childComponents.length; i < len; i++ ) {			
			// render the child Component into the Container's content target element
			childComponents[ i ].render( $targetEl );  
			
			// Hide the child Component if it is not the activeItem.
			// This sets the initial state of the CardsLayout to show the activeItem, while all others are hidden.
			if( this.activeItem !== childComponents[ i ] ) {
				childComponents[ i ].hide();
			}
		}
	},
	
	
	
	/**
	 * Sets the active item.
	 * 
	 * @method setActiveItem
	 * @param {ui.Component/Number} item The ui.Component to set as the active item, or the item index to set as the active item (0 for the first item).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 * @param {Object} options (optional) An object which will be passed along as options to the CardsLayout {@link #transition}. See the setActiveItem method in the
	 *   {ui.layouts.CardsLayout.AbstractTransition AbstractTransition} subclass that you are using for a list of valid options (if any).
	 */
	setActiveItem : function( item, options ) {
		// Item was provided as a number, find the Component
		if( typeof item === 'number' ) {
			item = this.container.getItemAt( item );
			
		} else if( item instanceof ui.Component && !this.container.has( item ) ) {
			item = null;  // if the item is not in the Container, set to null. Shouldn't switch to a Component that is not in the Container.
		}
		
		if( !this.getContainer().rendered ) {
			// The Container that this layout belongs to is not rendered, just set the activeItem config to the requested item.
			// This method will be run again as soon as the Container is rendered, and its layout is done.
			this.activeItem = item;
			
		} else {
			// Make a change to the cards if:
			//  1) The new item is null -- we must remove the currently active item
			//  2) The new item is a component, but different from the activeItem -- we must switch the cards
			//  3) The new item is a component and is the activeItem, but is hidden -- we must show it
			if( !item || this.activeItem !== item || item.isHidden() ) {
				
				// Delegate to the transition strategy for the change in cards (active item)
				// Make sure the activeItem is passed in only if it is an instantiated ui.Component (i.e. not null, and not the numbered config)
				var activeItem = this.activeItem;
				if( !( activeItem instanceof ui.Component ) ) {
					activeItem = null;
				}
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
		
		if( activeItem instanceof ui.Component || activeItem === null ) {
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
		} else if( activeItem instanceof ui.Component ) {
			return this.container.getItemIndex( activeItem );
		} else {
			return activeItem;  // still a number config (i.e. the layout hasn't been run), return that
		}
	},
	
	
	/**
	 * Extended onDestroy method for the CardsLayout to destroy its CardsLayout {@link ui.layouts.CardsLayout.AbstractTransition} object.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		// Destroy the transition strategy object
		this.transition.destroy();
		
		ui.layouts.CardsLayout.superclass.onDestroy.apply( this, arguments );
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'cards', ui.layouts.CardsLayout );
