/**
 * @class ui.layouts.CardsLayout.AbstractTransition
 * @extends Object
 * 
 * Defines the interface for all {@link ui.layouts.CardsLayout} strategies for changing the active card.
 */
/*global Kevlar, ui */
ui.layouts.CardsLayout.AbstractTransition = Kevlar.extend( Object, {
	
	/**
	 * @abstract
	 * @method setActiveItem
	 * @param {ui.layouts.CardsLayout} cardsLayout The CardsLayout instance that is using this transition strategy.
	 * @param {ui.Component} currentItem The currently active item. This may be null if the CardsContainer does not currently have an active item.
	 * @param {ui.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
	 * @param {Object} options An object which may contain options for the given AbstractTransition subclass that is being used.
	 */
	setActiveItem : function( cardsLayout, currentItem, newItem, options ) {
		// Abstract Method
	},
	
	
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
	 * @abstract
	 * @method onDestroy
	 */
	onDestroy : function() {
		// Template method
	}
	
} );