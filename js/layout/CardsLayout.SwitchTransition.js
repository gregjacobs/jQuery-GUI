/**
 * @class ui.layout.CardsLayout.SwitchTransition
 * @extends ui.layout.CardsLayout.AbstractTransition
 * 
 * {@link ui.layout.CardsLayout} transition strategy for switching cards immediately by simply hiding the "currently active" card
 * and then showing the new card. This is the default {@link ui.layout.CardsLayout CardsLayout} transition strategy for changing
 * the active card.
 */
/*global Class, Jux, ui */
ui.layout.CardsLayout.SwitchTransition = Class.extend( ui.layout.CardsLayout.AbstractTransition, {
	
	/**
	 * Sets the active item that should be transitioned to.
	 * 
	 * @method setActiveItem
	 * @param {ui.layout.CardsLayout} cardsLayout The CardsLayout instance that is using this transition strategy.
	 * @param {ui.Component} currentItem The currently active item. This may be null if the CardsLayout does not currently have an active item.
	 * @param {ui.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
	 * @param {Object} options There are no options for this {@link ui.layout.CardsLayout.AbstractTransition} subclass, so this argument is ignored.
	 */
	setActiveItem : function( cardsLayout, currentItem, newItem, options ) {
		// First, hide the currently active item, if the currently active item is an instantiated component (i.e. not null)
		if( currentItem ) {
			currentItem.hide();
		}
		
		// Now show the newly active item (if it is not null)
		if( newItem ) {
			newItem.show();
		}
	}
	
} );