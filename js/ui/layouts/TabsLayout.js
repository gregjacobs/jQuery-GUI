/**
 * @class ui.layouts.TabsLayout
 * @extends ui.layouts.AbstractLayout
 * 
 * A layout that renders a {@link ui.Container Container's} child components in tabs.  Methods are available in 
 * this class to control which tab is shown.<br><br>
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'tabs'.
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.layouts.TabsLayout = Kevlar.extend( ui.layouts.AbstractLayout, {
	
	/**
	 * @cfg {Number/ui.Component} activeTab
	 * The tab number, or ui.Component instance to set as the initially active tab. Defaults to 0 (for the first tab).
	 * If this is a ui.Component instance, it must exist within the {@link #container}.
	 */
	activeTab : 0,
	
	
	/**
	 * @private
	 * @property activeTab
	 * @type Int
	 * Stores the index of the currently active tab ({@link ui.Component}).
	 */
	
	
	// protected
	initLayout : function() {
		ui.layouts.TabsLayout.superclass.initLayout.call( this );
		
		this.addEvents(
			/**
			 * @event tabchange
			 * Fires when the active tab has been changed. 
			 * @param {ui.layouts.TabsLayout} tabsLayout This TabsLayout instance.
			 * @param {ui.Component} tab The {@link ui.Component} instance of the tab that was activated.
			 * @param {ui.Component} oldTab The {@link ui.Component} instance of the tab that was de-activated. 
			 *   Will be null if there was no previously activated tab.
			 */
			'tabchange'
		);
	},
	
	
	/**
	 * Layout implementation for TabsLayout, used to create a jQuery UI tabs instance (with its required markup), 
	 * and render the Container's child components into it (one in each tab).  The child components should have a special
	 * property called `title`, which is used as the tabs' title. The tab given by the {@link #activeTab} config 
	 * is shown.
	 * 
	 * @protected
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	onLayout : function( childComponents, $targetEl ) {
		ui.layouts.TabsLayout.superclass.onLayout.apply( this, arguments );
		
		
		// First, normalize the activeTab config / property to a ui.Component.
		var activeTabIndex = this.activeTab = this.normalizeTabIndex( this.activeTab );
		
		
		
		// Make sure the content target element is empty, to clear out any elements that may be in there 
		// (such as from previous layouts, or any direct HTML injected in there).
		$targetEl.empty();
		
		
		var container = this.container,
		    elId = container.elId,
		    containerHeight = container.height,
		    tabHeight = ( containerHeight ) ? containerHeight - 40 - 5 : 0,  // minus the height of the tabs, minus 5px for the bottom. couldn't get an accurrate computed value at this point. TODO: need to do after create jQuery UI tabs.
		    tabHeadersMarkup = [],
		    tabBodiesMarkup = [],
		    i,
		    numChildComponents = childComponents.length;
		
		
		// Create the render markup, to render the HTML needed for the TabsLayout
		// Note: Concatenating the markup and appending it all at once for performance. This method is faster than appending each
		// element one at a time, even with the extra step it takes to jQuery the divs afterward. Appending each one at a time
		// is ~65% slower. 
		tabHeadersMarkup.push( '<ul>' );
		for( i = 0; i < numChildComponents; i++ ) {
			var childComponent = childComponents[ i ],
			    title = childComponent.title || "(No title property set on child item)",
			    divClass = ( i !== activeTabIndex ) ? 'ui-tabs-hide' : '',   // hide all tabs except the one that is active
			    divStyle = ( tabHeight > 0 ) ? 'height: ' + tabHeight + 'px; overflow-y: auto;' : '',
			    tabId = elId + '-tab-' + i;
			
			tabHeadersMarkup.push( '<li><a href="#', tabId, '">', title, '</a></li>' );
			tabBodiesMarkup.push(
				'<div id="', tabId, '" class="', divClass, '" style="', divStyle, '">',
					'<div class="ui-tabs-panel-inner" />',   // An inner div, where the child components will be rendered into. This allows for greater styling flexibility.
				'</div>'
			);
		}
		tabHeadersMarkup.push( '</ul>' );
		
		// Append the renderMarkup (a combination of the tab headers and tab bodies markup) to the target element
		var renderMarkup = tabHeadersMarkup.concat( tabBodiesMarkup );
		$targetEl.append( renderMarkup.join( "" ) );
		
		// Now find all of the "ui-tabs-panel-inner" elements, and render the child components into them.
		// These elements should exactly correspond to the childComponents to render (from the renderMarkup)
		var $tabInnerDivs = $targetEl.find( 'div.ui-tabs-panel-inner' );
		for( i = 0; i < numChildComponents; i++ ) { 
			childComponents[ i ].render( $tabInnerDivs[ i ] );
		}
		
		
		// ------------------------------------
		
		// Create the jQuery UI tabs when all elements have been added
		$targetEl.tabs( {
			selected: activeTabIndex,
			
			// event handlers
			show : this.onTabChange.createDelegate( this )
		} );
	},
	
	
	
	/**
	 * Normalizes the given `tab` argument to an integer which represents the index of a {@link ui.Component} in the {@link #container},
	 * for use with the jQuery UI Tabs implementation. This implementation tries to keep a tab selected no matter what, unless there are no
	 * tabs ({@link ui.Component Components}) left in the Container, in which case it returns -1.
	 * 
	 * @private
	 * @method normalizeTabIndex
	 * @param {Number/ui.Component} tab An integer for the index position of the active tab, or the ui.Component instance for the tab itself.
	 * @return {Number} The normalized index. As long as at least one item exists within the {@link #container}, a valid index number will be returned,
	 *   which will be 0 in all invalid cases. If there are no items within the {@link #container}, -1 is returned.
	 */
	normalizeTabIndex : function( tab ) {
		var container = this.container,
		    numItems = container.getItems().length;		
		
		// Convert a string argument to a number first
		if( typeof tab === 'string' ) {
			tab = parseInt( tab, 10 ) || -1;  // If the parsed string came to NaN, use -1, which will cause the method to return null
		}
		
		// If there are no items in the container, set to -1
		if( numItems === 0 ) {
			tab = -1;
			
		} else if( typeof tab === 'number' ) {
			// Make sure the number is contrained within the range of items.
			tab = Math.floor( tab );  // make sure no decimal point. who knows...
			if( tab < 0 ) {
				tab = 0;
			} else if( tab > numItems - 1 ) {
				tab = numItems - 1;
			}
			
		} else if( tab instanceof ui.Component ) {
			tab = container.getItemIndex( tab );
			
			// If the tab was not found within the Container, set to 0
			if( tab === -1 ) {
				tab = 0;
			}
			
		} else {
			// All other cases, set to the first item
			tab = 0;
		}
		
		return tab;
	},
	
	
	
	/**
	 * Sets the active tab.
	 * 
	 * @method setActiveTab
	 * @param {ui.Component/Number} tab The ui.Component to set as the active tab, or the tab number to set as the active tab (0 for the first tab).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 */
	setActiveTab : function( tab ) {
		var container = this.container,
		    oldTabIndex = this.activeTab,
		    newTabIndex = this.activeTab = this.normalizeTabIndex( tab );  // If the tab was provided as a ui.Component, normalize its index to a number, and within range of the number of components in the container
		
		if( !container.rendered ) {
			// Not rendered, fire the event here. If it is rendered, changing the selected tab on the jQuery UI Tabs instance will fire the event
			this.fireEvent( 'tabchange', this, container.getItemAt( newTabIndex ), container.getItemAt( oldTabIndex ) );
			
		} else {
			container.getContentTarget().tabs( "option", "selected", newTabIndex );
		}
	},
	
	
	/**
	 * Gets the active tab ({@link ui.Component}).
	 * 
	 * @method getActiveTab
	 * @return {ui.Component} The Component that is currently shown as the active tab, or null if there is no active tab.
	 */
	getActiveTab : function() {
		return this.container.getItemAt( this.getActiveTabIndex() );
	},
	
	
	/**
	 * Gets the active tab index (i.e. the 0-based tab number that is currently selected).
	 * 
	 * @method getActiveTab
	 * @return {Number} The index of the tab that is currently shown as the active tab, or -1 if there is no active tab.
	 */
	getActiveTabIndex : function() {
		return this.normalizeTabIndex( this.activeTab );   // in case the TabsLayout is not rendered yet
	},
	
	
	// ------------------------------------
	
	
	/**
	 * Method that is run when a new tab is shown from the jQuery UI Tabs instance.
	 * 
	 * @private
	 * @method onTabChange
	 */
	onTabChange : function() {
		var container = this.container,
		    oldTab = this.container.getItemAt( this.activeTab ),  // retrieve the old tab for the event. It is still set to this.activeTab
		    newTabIndex = this.activeTab = container.getContentTarget().tabs( "option", "selected" ),
		    newTab = container.getItemAt( newTabIndex );
		
		// Run the newly active tab's (ui.Component's) onShow method, to tell it that is has just been shown 
		// (mostly for ui.Container's, to make sure they run their layout if a layout has been deferred).
		newTab.onShow();
		
		// fire the tabchange event.
		this.fireEvent( 'tabchange', this, newTab, oldTab );
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'tabs', ui.layouts.TabsLayout );
