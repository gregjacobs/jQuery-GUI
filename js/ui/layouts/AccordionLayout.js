/**
 * @class ui.layouts.AccordionLayout
 * @extends ui.layouts.AbstractLayout
 * 
 * A layout that renders a {@link ui.Container Container's} child components in an accordion, where only
 * one child component will be shown at a time.  Methods are available in this class to control which component
 * is shown.<br><br>
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'accordion'.
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.layouts.AccordionLayout = Kevlar.extend( ui.layouts.AbstractLayout, {
	
	/**
	 * @cfg {Number/ui.Component} activeItem
	 * The item number or {@link ui.Component} reference to set as the initially active item. Defaults to 0 (for the first item). 
	 * If this is a {@link ui.Component}, it should be a {@link ui.Component Component} that exists in the {@link ui.Container Container}.
	 */
	activeItem : 0,
	
	/**
	 * @cfg {Object} icons
	 * An object that defines the css classes for the "collapsed" icon states when an accordion panel is expanded or contracted. 
	 * Should have properties "header" and "headerSelected". Ex:
	 * <pre><code>{ 'header': 'ui-icon-triangle-1-e', 'headerSelected': 'ui-icon-triangle-1-s' }</code></pre><br><br>
	 * 
	 * Defaults to false, for no icons.
	 */
	icons : false,
	
	/**
	 * @cfg {String} iconPosition
	 * The position on the accordion panels' title bar that the icon should be placed. Can be set to either 'left'
	 * or 'right'. Defaults to 'left'.
	 */
	iconPosition : 'left',
	
	
	// protected
	initLayout : function() {
		this.addEvents(
			/**
			 * @event itemchange
			 * Fires when the active item has been changed. 
			 * @param {ui.Component} item The {@link ui.Component} instance of the item that was activated (shown).
			 */
			'itemchange'
		);
		
		ui.layouts.AccordionLayout.superclass.initLayout.call( this );
	},
	
	
	/**
	 * Layout implementation for AccordionLayout, used to create a jQuery UI accordion instance (with its required markup), 
	 * and render the Container's child components into it.  The child components should have a special property
	 * called `title`, which is used as the items' title in the accordion. The item given by the {@link #activeItem} 
	 * config is shown.
	 * 
	 * @protected
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	onLayout : function( childComponents, $targetEl ) {
		ui.layouts.AccordionLayout.superclass.onLayout.apply( this, arguments );
		
		
		// Make sure the content target element is empty, to clear out any elements that may be in there 
		// (such as from previous layouts, or any direct HTML injected in there).
		$targetEl.empty().addClass( 'ui-accordion ui-widget' );  // adding the css classes immediately (before jQuery UI processes these elements) to prevent a flash of unstyled content, and also so that things in child components are sized appropriately from the beginning when they are rendered
		
		// Note: Concatenating the markup and appending it all at once for performance. This method is faster than appending each
		// one at a time, even with the extra step it takes to jQuery the divs afterward. Appending each one at a time
		// is ~65% slower. 
		var accordionMarkup = "",
		    numChildComponents = childComponents.length,
		    i;
		    
		for( i = 0; i < numChildComponents; i++ ) {
			var title = childComponents[ i ].title || "(No title property set on child item)";
			
			// Create an h3 element for the accordion panel label. This element will get the 
			// 'ui-accordion-header' css class when the accordion itself is created.
			// Adding some css classes early (before jQuery UI processes these elements) to prevent a flash of unstyled content, and also so that things in child components are sized appropriately from the beginning when they are rendered
			accordionMarkup += '<h3 class="ui-accordion-header ui-helper-reset ui-state-default ui-corner-top"><a href="#">' + title + '</a></h3>';
			
			// Create a div element for the child item's content. 
			// Adding some css classes early (before jQuery UI processes these elements) to prevent a flash of unstyled content, and also so that things 
			// in child components are sized appropriately from the beginning when they are rendered.
			// The element itself needs display: block; for the initial rendering process, so that child components can be rendered into it. 
			// The 'ui-accordion-content' css class sets "display: none;", so that would prevent the rendering of the child component (as the
			// component's parent is hidden).  This display: block; will be removed after the component is rendered. 
			accordionMarkup += '<div class="ui-accordion-content ui-widget-content ui-helper-reset ui-corner-bottom ui-accordion-content-active" style="display: block;" />';
		}
		$targetEl.append( accordionMarkup );
		
		// Now query for the divs that have just been added, and render the child components into them
		var $divs = $targetEl.find( 'div' );
		for( i = 0; i < numChildComponents; i++ ) {
			// Render the child component into the div
			childComponents[ i ].render( $divs[ i ] );
			
			// Now remove the explicitly set display: block; css property. See above note where the div is created for details.
			jQuery( $divs[ i ] ).css( 'display', '' ); 
		}
		
		
		// Create the jQuery UI Accordion when all elements have been added
		$targetEl.accordion( {
			active: this.activeItem,
			
			fillSpace  : true,    // The accordion will fit to the height of its container
			autoHeight : false,   // Must set to false, as it is incompatible with the fillSpace config. Setting this explicitly as a reminder.
			
			icons: this.icons,
			
			// event handlers
			change : this.onActiveItemChange.createDelegate( this )
		} );
		
		
		// If 'icons' were specified, add the appropriate 'iconPosition' css class
		if( this.icons ) {
			if( this.iconPosition === 'right' ) {
				$targetEl.addClass( 'ui-accordion-iconsRight' );
			} else {
				$targetEl.addClass( 'ui-accordion-iconsLeft' );
			} 
		}
	},
	
	
	
	
	/**
	 * Sets the active item.
	 * 
	 * @method setActiveItem
	 * @param {ui.Component/Number} item The ui.Component to set as the active item, or the item number to set as the active item (0 for the first item).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 */
	setActiveItem : function( item ) {
		// Item was provided as a ui.Component, find its index
		if( item instanceof ui.Component ) {
			item = this.container.getItemIndex( item );
		}
		
		// At this point, the item must be a number to be set as the active item
		item = parseInt( item, 10 );   // parseInt just in case it's a number inside a string
		if( !isNaN( item ) && item !== -1 ) {
			if( !this.container.rendered ) {
				this.activeItem = item;	// Not rendered yet, set for when it is rendered
			} else {
				this.container.getContentTarget().accordion( "activate", item );
			}
		}
	},
	
	
	/**
	 * Gets the active item.
	 * 
	 * @method getActiveItem
	 * @return {ui.Component} The Component that is currently shown as the active item.
	 */
	getActiveItem : function() {
		if( !this.container.rendered ) {
			return this.container.getItemAt( this.activeItem );
		} else {
			return this.container.getItemAt( this.container.getContentTarget().accordion( "option", "active" ) );
		}
	},
	
	
	/**
	 * Gets the active item index (i.e. the 0-based item number that is currently selected).
	 * 
	 * @method getActiveItem
	 * @return {Number} The index of the item that is currently shown as the active item.
	 */
	getActiveItemIndex : function() {
		if( !this.container.rendered ) {
			return this.activeItem;
		} else {
			return this.container.getContentTarget().accordion( "option", "active" );
		}
	},
	
	
	// --------------------------
	
	
	onActiveItemChange : function() {
		var activeItem = this.getActiveItem();
		
		// Run the newly active item's onShow method, to tell it that is has just been shown 
		// (mostly for ui.Container's, to make sure they run their layout if a layout has been deferred).
		activeItem.onShow();
		
		// when an item is shown, fire the itemchange event.
		this.fireEvent( 'itemchange', activeItem );
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'accordion', ui.layouts.AccordionLayout );
