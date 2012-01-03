/**
 * @class ui.layouts.CardsLayout.SwitchTransition
 * @extends ui.layouts.CardsLayout.AbstractTransition
 * 
 * {@link ui.layouts.CardsLayout} transition strategy for switching cards immediately by simply hiding the "currently active" card
 * and then showing the new card. This is the default {@link ui.layouts.CardsLayout CardsLayout} transition strategy for changing
 * the active card.
 */
/*global Kevlar, ui */
ui.layouts.CardsLayout.SwitchTransition = Kevlar.extend( ui.layouts.CardsLayout.AbstractTransition, {
	
	/**
	 * @method setActiveItem
	 * @param {ui.layouts.CardsLayout} cardsLayout The CardsLayout instance that is using this transition strategy.
	 * @param {ui.Component} currentItem The currently active item. This may be null if the CardsContainer does not currently have an active item.
	 * @param {ui.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
	 * @param {Object} options There are no options for this {@link ui.layouts.CardsLayout.AbstractTransition} subclass, so this argument is ignored.
	 */
	setActiveItem : function( cardsLayout, currentItem, newItem, options ) {
		ui.layouts.CardsLayout.SwitchTransition.superclass.setActiveItem.apply( this, arguments );
		
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