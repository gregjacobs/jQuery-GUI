/**
 * @class ui.layout.AccordionLayout
 * @extends ui.layout.Layout
 * 
 * A layout that renders a {@link ui.Container Container's} child components in an accordion, where only
 * one child component will be shown at a time.  Methods are available in this class to control which component
 * is shown.
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'accordion'.
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Class, jQuery, Jux, ui */
ui.layout.AccordionLayout = Class.extend( ui.layout.Layout, {
	
	/**
	 * @cfg {Number/ui.Component} activeItem
	 * The item number or {@link ui.Component} reference to set as the initially active item. Defaults to 0 (for the first item). 
	 * If this is a {@link ui.Component}, it should be a {@link ui.Component Component} that exists in the {@link ui.Container Container}.
	 */
	activeItem : 0,
	
	/**
	 * @cfg {Object} icons
	 * An object that defines the css classes for the icon states when an accordion panel is expanded or contracted. 
	 * Should have properties `header` and `headerSelected`. Example of a {@link ui.Container} layout config:
	 * 
	 *     layout: {
	 *         type: 'accordion',
	 *         icons: { 'header': 'ui-icon-triangle-1-e', 'headerSelected': 'ui-icon-triangle-1-s' }
	 *     }
	 * 
	 * Defaults to null, for no icons.
	 * 
	 * To set this on a global level in your application, set it on the prototype of this layout. Example:
	 * 
	 *     ui.layout.AccordionLayout.prototype.icons = { 'header': 'ui-icon-triangle-1-e', 'headerSelected': 'ui-icon-triangle-1-s' };
	 */
	icons : null,
	
	/**
	 * @cfg {String} iconPosition
	 * The position on the accordion panels' title bar that the icon should be placed. Can be set to either 'left'
	 * or 'right'.
	 */
	iconPosition : 'left',
	
	/**
	 * @cfg {String} title
	 * This config is to be set on **child items** of the {@link ui.Container Container}. This will be the title 
	 * displayed on the accordion header for the given child {@link ui.Component component}.
	 */
	
	
	/**
	 * @protected
	 * @property {Boolean} accordionLayoutInitialized
	 * 
	 * Flag which is set to true once the jQuery UI Accordion has been initialized.
	 */
	accordionLayoutInitialized : false,
	
	/**
	 * @protected
	 * @property {jQuery} $contentDivs
	 * 
	 * The &lt;div&gt; elements created for the content areas of the jQuery UI Accordion. There will be one
	 * of these for each child component. This property is initialized in the {@link #initAccordionLayout} method.
	 */
	
	
	// protected
	initLayout : function() {
		this._super( arguments );
		
		this.addEvents(
			/**
			 * Fires when the active (visible) item has been changed.
			 * 
			 * @event itemchange
			 * @param {ui.Component} item The {@link ui.Component} instance of the item that was activated (shown).
			 */
			'itemchange'
		);
		
		this.contentContainerEls = {};
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
		this._super( arguments );
		
		if( !this.accordionLayoutInitialized ) {
			this.initAccordionLayout( childComponents, $targetEl );
			this.accordionLayoutInitialized = true;
			
		} else {
			this.updateAccordionLayout( childComponents, $targetEl );
		}
	},
	
	
	/**
	 * Initializes the AccordionLayout the first time its {@link #doLayout} method is run. This method sets up the initial
	 * jQuery UI Accordion. Subsequent runs of {@link #doLayout} will simply fix up the accordion based on any changes.
	 * 
	 * @protected
	 * @method initAccordionLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	initAccordionLayout : function( childComponents, $targetEl ) {
		// Make sure the layout target element is empty, to clear out any elements that may be in there 
		// (such as from previous layouts, or any direct HTML injected in there).
		$targetEl.addClass( 'ui-accordion ui-widget' );  // adding the css classes immediately (before jQuery UI processes these elements) to prevent a flash of unstyled
		                                                 // content, and also so that things in child components are sized appropriately from the beginning when they are rendered
		
		// If 'icons' were specified, add the appropriate 'iconPosition' css class
		if( this.icons ) {
			$targetEl.addClass( ( this.iconPosition === 'right' ) ? 'ui-accordion-iconsRight' : 'ui-accordion-iconsLeft' );
		}
		
		
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
			accordionMarkup += '<div class="ui-accordion-content ui-widget-content ui-helper-reset ui-corner-bottom ui-accordion-content-active" />';
		}
		$targetEl.append( accordionMarkup );
		
		
		// Now query for the divs that have just been added, so that we can render the child components into them after the jQuery UI accordion has been created
		var $contentDivs = this.$contentDivs = $targetEl.find( 'div' );
		
		// Create the jQuery UI Accordion when all elements have been added
		$targetEl.accordion( {
			active: this.activeItem,
			
			fillSpace  : true,    // The accordion will fit to the height of its container
			autoHeight : false,   // Must set to false, as it is incompatible with the fillSpace config. Setting this explicitly as a reminder.
			
			icons: this.icons || false,  // jQuery UI expects `false` config if not providing icons
			
			// event handlers
			changestart : this.onBeforeActiveItemChange.createDelegate( this ),
			change : this.onActiveItemChange.createDelegate( this )
		} );
		
		
		// Render the child components into the divs created for them, and set their size
		for( i = 0; i < numChildComponents; i++ ) {
			var $div = $contentDivs.eq( i ),
			    divWidth, //$div.width(), -- letting the browser manage width for now
			    divHeight = $div.height();
			
			// Store a reference to the div keyed by the component's uuid
			this.contentContainerEls[ childComponents[ i ].getUuid() ] = $div;
			
			this.renderComponent( childComponents[ i ], $div );
			this.sizeComponent( childComponents[ i ], divWidth, divHeight );  // Note: can only be called after the child component has been rendered
		}
	},	
	
	
	/**
	 * Updates the AccordionLayout, for subsequent times that its {@link #doLayout} method is run. (The first time is
	 * handled by {@link #initAccordionLayout}.)
	 * 
	 * @protected
	 * @method updateAccordionLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	updateAccordionLayout : function( childComponents, $targetEl ) {
		// TODO: Implement... (when needed)
	},
	
	
	/**
	 * @inheritdoc
	 * 
	 * @protected
	 * @method afterLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	afterLayout : function( childComponents, $targetEl ) {
		this._super( arguments );
		
		//this.adjustChildForScrollbar( this.getActiveItem() );
	},
	
	
	/**
	 * Utility method for the AccordionLayout to determine if a given {@link #$contentDivs content div} has a greater
	 * scroll height than its height (meaning it has a scrollbar), and to resize the child component inside that div
	 * to account for it. This prevents a horizontal scrollbar from appearing.
	 * 
	 * @protected
	 * @method adjustChildForScrollbar
	 * @param {ui.Component} component The component to adjust, if a scrollbar exists in its content div.
	 */
	adjustChildForScrollbar : function( component ) {
		/*var $contentDiv = this.$contentDivs.eq( this.container.getItemIndex( component ) ),
		    contentDivHeight = $contentDiv.height(),
		    contentDivWidth = $contentDiv.width(),
		    scrollbarWidth;
		
		if( $contentDiv.get( 0 ).scrollHeight > contentDivHeight && ( scrollbarWidth = Jux.getScrollbarWidth() ) ) {
			var newWidth = contentDivWidth - scrollbarWidth;
			
			this.sizeComponent( component, newWidth, contentDivHeight );
		} else {
			this.sizeComponent( component, contentDivWidth, contentDivHeight );
		}
		
		// We have to do the layout again whether or not the div has a scrollbar. We need to do it both when the div 
		// does receive a scrollbar, and when it loses its scrollbar. Also, we may need to call it anyway for any child
		// components that couldn't lay out because it was hidden.
		component.doLayout();*/
	},
	
	
	
	// ------------------------------------
	
	
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
				this.container.getLayoutTarget().accordion( "activate", item );
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
			return this.container.getItemAt( this.container.getLayoutTarget().accordion( "option", "active" ) );
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
			return this.container.getLayoutTarget().accordion( "option", "active" );
		}
	},
	
	
	/**
	 * Handler for before the active item has changed. Lays out the child component
	 * (container) that is being activated before it is shown, so that we see it "slide in".
	 * 
	 * @protected
	 * @method onBeforeActiveItemChange
	 */
	onBeforeActiveItemChange : function() {
		var activeItem = this.getActiveItem();
		
		// Run the newly active item's layout (if it is a ui.Container).
		if( activeItem instanceof ui.Container ) {
			// Quickly show the container of the active item, layout the active item, and then hide it so that the jQuery UI Accordion can do its thing
			var $contentEl = this.contentContainerEls[ activeItem.getUuid() ];
			
			$contentEl.show();
			activeItem.doLayout();
			//this.adjustChildForScrollbar( activeItem );  // After laying the component out, adjust it in case of scrollbar
			$contentEl.hide();
		}
	},
	
	
	
	/**
	 * Handler for when the active item has changed. Fires the {@link #itemchange} event.
	 * 
	 * @protected
	 * @method onActiveItemChange
	 */	
	onActiveItemChange : function() {
		var activeItem = this.getActiveItem();
		
		// Run the newly active item's layout, just to make sure it is correct. This is done in onBeforeActiveItemChange(), 
		// but it is possible that the sizes need to be fixed just a little from there. This also fixes layouts for if the 
		// component was hidden and couldn't lay out previously.
		activeItem.doLayout();
		//this.adjustChildForScrollbar( activeItem );  // this should cover the above, as it runs doLayout() itself, and fixes for the scrollbar
		
		// when an item is shown, fire the itemchange event.
		this.fireEvent( 'itemchange', activeItem );
	},
	
	
	// ------------------------------------
	
	
	// protected
	onDestroy : function() {
		if( this.accordionLayoutInitialized ) {
			this.container.getLayoutTarget().accordion( "destroy" );
		}
		
		this._super( arguments );
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'accordion', ui.layout.AccordionLayout );
