/*global define */
define( [
	'jqc/Container',
	'jqc/layout/Card.Transition'
], function( Container, CardTransition ) {
	
	/**
	 * @class jqc.layout.Card.SwitchTransition
	 * @extends jqc.layout.Card.AbstractTransition
	 * 
	 * {@link jqc.layout.Card} transition strategy for switching cards immediately by simply hiding the "currently active" card
	 * and then showing the new card. This is the default {@link jqc.layout.Card CardsLayout} transition strategy for changing
	 * the active card.
	 */
	var CardSwitchTransition = CardTransition.extend( {
		
		/**
		 * Sets the active item that should be transitioned to.
		 * 
		 * @method setActiveItem
		 * @param {jqc.layout.Card} cardsLayout The CardsLayout instance that is using this transition strategy.
		 * @param {jqc.Component} currentItem The currently active item. This may be null if the CardsLayout does not currently have an active item.
		 * @param {jqc.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
		 * @param {Object} options There are no options for this {@link jqc.layout.Card.AbstractTransition} subclass, so this argument is ignored.
		 */
		setActiveItem : function( cardsLayout, currentItem, newItem, options ) {
			// First, hide the currently active item, if the currently active item is an instantiated component (i.e. not null)
			if( currentItem ) {
				currentItem.hide();
			}
			
			// Now show the newly active item (if it is not null)
			if( newItem ) {
				newItem.show();
				
				if( newItem instanceof Container ) {
					newItem.doLayout();
				}
			}
		}
		
	} );
	
	return CardSwitchTransition;
	
} );