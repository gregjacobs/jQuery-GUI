/**
 * @class ui.containers.TabsContainer
 * @extends ui.Container
 *  
 * Convenience Container class that is pre-configured to use a {@link ui.layout.TabsLayout}.  
 * This Container provides easy configuration, and delegation methods to easily use the internal TabsLayout.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, Jux, ui */
ui.containers.TabsContainer = Class.extend( ui.Container, {
	
	/**
	 * @cfg {Number/ui.Component} activeTab
	 * The tab number, or ui.Component instance to set as the initially active tab. See {@link ui.layout.TabsLayout} for details.
	 */
	
	/**
	 * @hide
	 * @cfg {String/Object/ui.layout.Layout} layout
	 * A {@link ui.layout.TabsLayout} is automatically configured for this subclass.
	 */
	
	
	// protected
	initComponent : function() {
		this.addEvents(
			/**
			 * @event tabchange
			 * Fires when the active tab has been changed.
			 * @param {ui.containers.TabsContainer} tabsContainer This TabsContainer instance.
			 * @param {ui.Component} tab The {@link ui.Component} instance of the tab that was activated. 
			 */
			'tabchange'
		);
		
		// Create the TabsLayout for the Container
		this.layout = new ui.layout.TabsLayout( {
			activeTab : this.activeTab,
			
			listeners : {
				'tabchange' : this.onTabChange,
				scope : this
			}
		} );
		
		ui.containers.TabsContainer.superclass.initComponent.call( this );
	},
	
	
	/**
	 * Sets the active tab.
	 * 
	 * @method setActiveTab
	 * @param {ui.Component/Number} tab The ui.Component to set as the active tab, or the tab number to set as the active tab (0 for the first tab).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 */
	setActiveTab : function( tab ) {
		this.getLayout().setActiveTab( tab );
	},
	
	
	/**
	 * Gets the active tab.
	 * 
	 * @method getActiveTab
	 * @return {ui.Component} The Component that is currently shown as the active tab.
	 */
	getActiveTab : function() {
		this.getLayout().getActiveTab();
	},
	
	
	/**
	 * Gets the active tab index (i.e. the 0-based tab number that is currently selected).
	 * 
	 * @method getActiveTab
	 * @return {Number} The index of the tab that is currently shown as the active tab.
	 */
	getActiveTabIndex : function() {
		this.getLayout().getActiveTabIndex();
	},
	
	
	/**
	 * Method that is run when a tab is changed in the {@link #layout}.
	 *
	 * @protected
	 * @method onTabChange
	 * @param {ui.layout.TabsLayout} tabsLayout The TabsLayout instance.
	 * @param {ui.Component} tab The new tab that was selected (i.e. changed to).
	 * @param {ui.Component} oldTab The old tab that was de-selected (i.e. changed from).
	 */
	onTabChange : function( tabsLayout, tab, oldTab ) {
		// relay the event from the TabsLayout
		this.fireEvent( 'tabchange', this, tab, oldTab );
	}
	
} );


// Register the type so it can be created by the string 'Tabs' in the manifest
ui.ComponentManager.registerType( 'Tabs', ui.containers.TabsContainer );