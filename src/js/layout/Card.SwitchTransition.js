/*global define */
define( [
	'jqGui/Container',
	'jqGui/layout/Card.Transition'
], function( Container, CardTransition ) {
	
	/**
	 * @class jqGui.layout.Card.SwitchTransition
	 * @extends jqGui.layout.Card.AbstractTransition
	 * 
	 * {@link jqGui.layout.Card} transition strategy for switching cards immediately by simply hiding the "currently active" card
	 * and then showing the new card. This is the default {@link jqGui.layout.Card CardsLayout} transition strategy for changing
	 * the active card.
	 */
	var CardSwitchTransition = CardTransition.extend( {
		
		/**
		 * Sets the active item that should be transitioned to.
		 * 
		 * @method setActiveItem
		 * @param {jqGui.layout.Card} cardsLayout The CardsLayout instance that is using this transition strategy.
		 * @param {jqGui.Component} currentItem The currently active item. This may be null if the CardsLayout does not currently have an active item.
		 * @param {jqGui.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
		 * @param {Object} options There are no options for this {@link jqGui.layout.Card.AbstractTransition} subclass, so this argument is ignored.
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