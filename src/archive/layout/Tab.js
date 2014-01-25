/*global define */
define( [
	'lodash',
	'ui/util/Css',
	'ui/Component',
	'ui/Container',
	'ui/layout/Layout'
], function( _, Css, Component, Container, Layout ) {

	/**
	 * @class ui.layout.Tab
	 * @extends ui.layout.Layout
	 * 
	 * A layout that renders a {@link ui.Container Container's} child components in tabs.  Methods are available in 
	 * this class to control which tab is shown.
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'tabs'.
	 */
	var TabLayout = Layout.extend( {
		
		/**
		 * @cfg {Number/ui.Component} activeTab
		 * The tab number, or ui.Component instance to set as the initially active tab. Defaults to 0 (for the first tab).
		 * If this is a ui.Component instance, it must exist within the {@link #container}.
		 */
		activeTab : 0,
		
		/**
		 * @cfg {String} title
		 * A string of text or HTML which will be used as the content for the tab itself.
		 * 
		 * This config goes on the **child components** that are placed into the {@link ui.Container} that is using the TabsLayout.
		 */
		
		/**
		 * @cfg {String} tabCls
		 * A CSS class to add to the tab element itself. The tab element is an &lt;li&gt; tag.
		 * 
		 * This config goes on the **child components** that are placed into the {@link ui.Container} that is using the TabsLayout.
		 */
		
		/**
		 * @cfg {String} tabContentCls
		 * A CSS class to add to the content panel (i.e. &lt;div&gt; element) that is created to hold the tab's content. This element wraps
		 * the {@link ui.Component} that is in the {@link ui.Container} that is using the TabsLayout.
		 * 
		 * This config goes on the **child components** that are placed into the {@link ui.Container} that is using the TabsLayout.
		 */
		
		
		/**
		 * @protected
		 * @property {Number} activeTab
		 * 
		 * Stores the index of the currently active tab ({@link ui.Component Component}).
		 */
		
		/**
		 * @protected
		 * @property {Boolean} tabsLayoutInitialized
		 * 
		 * Flag which is set to true once the jQuery UI Tabs has been initialized.
		 */
		tabsLayoutInitialized : false,
		
		/**
		 * @protected
		 * @property {jQuery} $tabHeadersContainerEl
		 * 
		 * The &lt;ul&gt; element generated when the jQuery UI tabs are created, which holds
		 * the headers for each of the tabs. 
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $contentDivEls
		 * 
		 * The &lt;div&gt; elements generated when the jQuery UI tabs are created, which holds
		 * the content for each of the tabs. Note that this jQuery object holds multiple &lt;div&gt;
		 * elements; one for each of the child components in the {@link #container}. Also note that
		 * the components themselves are not rendered into these divs, but into the {@link #$contentDivInnerEls}
		 * instead.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $contentDivInnerEls
		 * 
		 * The &lt;div&gt; elements generated when the jQuery UI tabs are created, which holds
		 * the actual component content for each of the tabs. Note that this jQuery object holds 
		 * multiple &lt;div&gt; elements; one for each of the child components in the {@link #container}.
		 */
		
		
		// protected
		initLayout : function() {
			this._super( arguments );
			
			this.addEvents(
				/**
				 * @event tabchange
				 * Fires when the active tab has been changed. 
				 * @param {ui.layout.Tab} tabsLayout This TabsLayout instance.
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
			this._super( arguments );
			
			// First, normalize the activeTab config / property to the index of the component, if it is a number
			var activeTabIndex = this.activeTab = this.normalizeTabIndex( this.activeTab );
			
			if( !this.tabsLayoutInitialized ) {
				this.initTabsLayout( childComponents, $targetEl );
				this.tabsLayoutInitialized = true;
				
			} else {
				this.updateTabsLayout( childComponents, $targetEl );
			}
		},
		
		
		
		/**
		 * Initializes the TabsLayout the first time its {@link #doLayout} method is run. This method sets up the initial
		 * jQuery UI Tabs. Subsequent runs of {@link #doLayout} will simply fix up the tabs based on any changes.
		 * 
		 * @protected
		 * @method initTabsLayout
		 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		initTabsLayout : function( childComponents, $targetEl ) {
			var elId = this.container.elId,
			    tabHeadersMarkup = [],
			    tabBodiesMarkup = [],
			    i, len,
			    numChildComponents = childComponents.length,
			    activeTabIndex = this.activeTab;
			
			
			// Create the render markup, to render the HTML needed for the TabsLayout
			// Note: Concatenating the markup and appending it all at once for performance. This method is faster than appending each
			// element one at a time, even with the extra step it takes to jQuery the divs afterward. Appending each one at a time
			// is ~65% slower. 
			tabHeadersMarkup.push( '<ul data-elem="TabsLayout-HeadersContainer">' );
			for( i = 0; i < numChildComponents; i++ ) {
				var childComponent = childComponents[ i ],
				    title = childComponent.title || "(No title property set on child item)",
				    divClass = ( childComponent.tabContentCls || "" ) + ( ( i !== activeTabIndex ) ? ' ui-tabs-hide' : '' ),   // hide all tabs except the one that is active
				    tabId = elId + '-tab-' + i;
				
				tabHeadersMarkup.push( '<li class="', ( childComponent.tabCls || "" ), '" ><a href="#', tabId, '">', title, '</a></li>' );
				tabBodiesMarkup.push(
					'<div data-elem="TabsLayout-ContentContainer" id="', tabId, '" class="', divClass, '" style="overflow-y: auto;">',
						'<div data-elem="TabsLayout-ContentContainerInner" class="ui-tabs-panel-inner" />',   // An inner div, where the child components will be rendered into. This allows for greater styling flexibility.
					'</div>'
				);
			}
			tabHeadersMarkup.push( '</ul>' );
			
			// Append the renderMarkup (a combination of the tab headers and tab bodies markup) to the target element
			var renderMarkup = tabHeadersMarkup.concat( tabBodiesMarkup );
			$targetEl.append( renderMarkup.join( "" ) );
			
			
			// ------------------------------------
			
			// Create the jQuery UI tabs when all elements have been added
			$targetEl.tabs( {
				selected: activeTabIndex,
				
				// event handlers
				show : _.bind( this.onTabChange, this )
			} );
			
			
			// Find and store references to the elements of the jQuery UI tabs
			this.$tabHeadersContainerEl = $targetEl.children( 'ul[data-elem="TabsLayout-HeadersContainer"]' );
			this.$contentDivEls = $targetEl.children( 'div[data-elem="TabsLayout-ContentContainer"]' );
			this.$contentDivInnerEls = this.$contentDivEls.children( 'div[data-elem="TabsLayout-ContentContainerInner"]' );
			
			// ------------------------------------
			
			// Now that the Tabs have been created and all CSS classes applied, we can measure the tab headers, and size each 
			// of the content divs accordingly
			this.resizeContentDivs( $targetEl );
			
			// Finally, render the child components into the "content div inner elements".
			// These elements should exactly correspond to the childComponents to render (from the renderMarkup)
			var $contentDivInnerEls = this.$contentDivInnerEls;
			for( i = 0, len = childComponents.length; i < len; i++ ) {
				this.renderComponent( childComponents[ i ], $contentDivInnerEls[ i ] );
			}
		},
		
		
		/**
		 * Updates the TabsLayout, for subsequent times that its {@link #doLayout} method is run. (The first time is
		 * handled by {@link #initTabsLayout}.)
		 * 
		 * @protected
		 * @method updateTabsLayout
		 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		updateTabsLayout : function( childComponents, $targetEl ) {
			// TODO: Implement when needed. Tabs need to be removed for child components that no longer exist in the container,
			//       tabs need to be added for new child components, and the reordering of tabs needs to be handled as well.
			//       Don't forget to update the this.$contentDivEls and this.$contentDivInnerEls jQuery sets with any new/removed 
			//       elements (can just re-query for them, with how initTabsLayout() does it), so that all content elements are
			//       resized in the resizeContentDivs() method, and are removed in the onDestroy() method implementation. For now,
			//       justresizing the content divs as the update routine.
			this.resizeContentDivs( $targetEl );
		},
		
		
		/**
		 * Resizes the {@link #$contentDivEls content divs} (or more accurately, the {@link #$contentDivInnerEls content inner divs}) 
		 * of the tabs panel to the correct height, based on the height of the `$targetEl`, and the height of the 
		 * {@link #$tabHeadersContainerEl tab headers}.
		 * 
		 * @protected
		 * @method resizeContentDivs
		 * @param {jQuery} $targetEl The target element, where the TabsLayout's elements are rendered into.
		 */
		resizeContentDivs : function( $targetEl ) {
			// Measure the total height, and the height of the tab headers, and size each of the content divs accordingly
			var $contentDivEls = this.$contentDivEls,
			    tabHeadersHeight = this.$tabHeadersContainerEl.outerHeight(),
			    containerHeight = this.container.height || $targetEl.height(),  // prefer to take any specific height defined on the container first. If none, measure the $targetEl.
			    contentHeight = containerHeight - tabHeadersHeight - Css.getFrameSize( $contentDivEls.filter( ':visible' ), 'tb' );  // measure the content div that is currently visible for padding/margin/borderWidth
			
			$contentDivEls.css( 'height', contentHeight + 'px' );
		},
		
		
		// ------------------------------------
		
		
		/**
		 * Normalizes the given `tab` argument to an integer which represents the index of a {@link ui.Component} in the {@link #container},
		 * for use with the jQuery UI Tabs implementation. This implementation tries to keep a tab selected no matter what, unless there are no
		 * tabs ({@link ui.Component Components}) left in the Container, in which case it returns -1.
		 * 
		 * @protected
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
				
			} else if( tab instanceof Component ) {
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
				container.getLayoutTarget().tabs( 'option', 'selected', newTabIndex );
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
			    newTabIndex = this.activeTab = container.getLayoutTarget().tabs( 'option', 'selected' ),
			    newTab = container.getItemAt( newTabIndex );
			
			// Do the layout in the newly shown tab (if it is a ui.Container)
			if( newTab instanceof Container ) {
				newTab.doLayout();
			}
			
			// fire the tabchange event.
			this.fireEvent( 'tabchange', this, newTab, oldTab );
		},
		
		
		// ------------------------------------
		
		// protected
		onDestroy : function() {
			if( this.tabsLayoutInitialized ) {
				this.container.getLayoutTarget().tabs( 'destroy' );
				
				this.$tabHeadersContainerEl.remove();
				this.$contentDivEls.remove();   // Note: The $contentDivEls hold the $contentDivInnerEls, so removing them removes the $contentDivInnerEls as well
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
	Container.registerLayout( 'tabs', TabLayout );
	
	return TabLayout;
	
} );