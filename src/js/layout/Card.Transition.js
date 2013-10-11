/*global define */
define( [
	'Class',
	'jqg/JqGui'
], function( Class, JqGui ) {
	
	/**
	 * @abstract
	 * @class jqg.layout.Card.AbstractTransition
	 * @extends Object
	 * 
	 * Defines the interface for all {@link jqg.layout.Card} strategies for changing the active card.
	 */
	var CardTransition = Class.extend( Object, {
		abstractClass : true,
		
		
		/**
		 * Sets the active item that should be transitioned to.
		 * 
		 * @abstract
		 * @method setActiveItem
		 * @param {jqg.layout.Card} cardsLayout The CardsLayout instance that is using this transition strategy.
		 * @param {jqg.Component} currentItem The currently active item. This may be null if the CardsLayout does not currently have an active item.
		 * @param {jqg.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
		 * @param {Object} options An object which may contain options for the given AbstractTransition subclass that is being used.
		 */
		setActiveItem : Class.abstractMethod,
		
		
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
		 * @template
		 * @method onDestroy
		 */
		onDestroy : JqGui.emptyFn
		
	} );
	
	return CardTransition;
	
} );