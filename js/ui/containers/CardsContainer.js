/**
 * @class ui.containers.CardsContainer
 * @extends ui.Container
 *  
 * Convenience Container class that is pre-configured to use a {@link ui.layouts.CardsLayout} (see description of {@link ui.layouts.CardsLayout CardsLayout).  
 * This Container provides easy configuration, and delegation methods to easily use the internal CardsLayout.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.containers.CardsContainer = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {Number/ui.Component} activeItem
	 * The item number to set as the initially active item. Defaults to 0 (for the first item). Can also be 
	 * an instantiated {@link ui.Component} that exists in the Container.
	 */
	activeItem : 0,
	
	/**
	 * @hide
	 * @cfg {String/Object/ui.layouts.AbstractLayout} layout
	 * A {@link ui.layouts.CardsLayout} is automatically configured for this subclass.
	 */
	
	
	
	// protected
	initComponent : function() {
		this.addEvents(
			/**
			 * @event cardchange
			 * Fires when the active item has been changed.
			 * @param {ui.containers.CardsContainer} cardsContainer This CardsContainer instance.
			 * @param {ui.Component} card The {@link ui.Component} instance of the card that was activated (shown). 
			 */
			'cardchange'
		);
		
		// Create the CardsLayout for the Container
		this.layout = new ui.layouts.CardsLayout( {
			activeItem : this.activeItem,
			
			listeners : {
				'cardchange' : function( card ) {
					// relay the event from the CardsLayout
					this.fireEvent( 'cardchange', this, card );
				},
				scope : this
			}
		} );
		
		ui.containers.CardsContainer.superclass.initComponent.call( this );
	},
	
	
	/**
	 * Sets the active item on the CardsLayout.
	 * 
	 * @method setActiveItem
	 * @param {ui.Component/Number} item The ui.Component to set as the active item, or the item index to set as the active item (0 for the first item).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 */
	setActiveItem : function( item ) {
		this.getLayout().setActiveItem( item );
	},
	
	
	/**
	 * Gets the active item from the CardsLayout.
	 * 
	 * @method getActiveItem
	 * @return {ui.Component} The Component that is currently shown as the active item. Returns null if there is no active item.
	 */
	getActiveItem : function() {
		return this.getLayout().getActiveItem();
	},
	
	
	/**
	 * Gets the active item index from the CardsLayout (i.e. the 0-based tab number that is currently selected).
	 * 
	 * @method getActiveItemIndex
	 * @return {Number} The index of the item that is currently shown as the active item. Returns -1
	 *   if there is no active item.
	 */
	getActiveItemIndex : function() {
		return this.getLayout().getActiveItemIndex();
	}
	
} );


// Register the type so it can be created by the string 'Cards' in the manifest
ui.ComponentManager.registerType( 'Cards', ui.containers.CardsContainer );