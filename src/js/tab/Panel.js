/*global define */
define( [
	'jquery',
	'lodash',
	'gui/ComponentManager',
	'gui/Component',
	'gui/Container',
	'gui/panel/Panel',
	'gui/tab/Bar',
	'gui/tab/Tab',
	'gui/template/LoDash',
	'gui/layout/Card'
], function( jQuery, _, ComponentManager, Component, Container, Panel, TabBar, Tab, LoDashTpl ) {

	/**
	 * @class gui.tab.Panel
	 * @extends gui.panel.Panel
	 * @alias type.tabpanel
	 *
	 * A basic tab container panel. Child {@link #items} must be {@link gui.panel.Panel Panels} or Panel subclasses,
	 * as their {@link gui.panel.Panel#title title} property is read to create the tabs.
	 * 
	 * The Tab Panel is internally configured with a {@link gui.layout.Card Card} layout, which switches between
	 * the panels when the tabs are clicked.
	 * 
	 * By default, each child Panel has its header hidden, and takes its {@link gui.panel.Panel#title} config
	 * to use as the tab's title. To not hide each panel's header, set the {@link #hideChildPanelHeaders} config
	 * to `false`.
	 */
	var TabPanel = Panel.extend( {
		
		/**
		 * @cfg {Number/gui.Component} activeTab
		 * 
		 * The tab number, or {@link gui.Component} instance to set as the initially active tab. Defaults to 0 
		 * (for the first tab). If this is a {@link gui.Component} instance, it must exist within the TabPanel.
		 */
		activeTab : 0,
		
		/**
		 * @cfg {Boolean} hideChildPanelHeaders
		 * 
		 * `true` to hide each child panel's {@link gui.panel.Panel#property-header header} when added to the Tab Panel.
		 * The headers are hidden because the tabs that are created will have the panels' titles, and having
		 * the header would just be showing that information twice. Set to `false` to disable this behavior.
		 */
		hideChildPanelHeaders : true,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		defaultType : 'panel',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		acceptType : Panel,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		layout : 'card',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'gui-tabPanel',
		
		/**
		 * @cfg {String} childPanelCls
		 * 
		 * The CSS class to add to the *child* {@link gui.panel.Panel Panels} of this TabPanel, when they are added.
		 * This allows for custom styling of the Panels which are direct children of the TabPanel.
		 * 
		 * This CSS class, plus the string '-body' is also added to the child Panel's {@link gui.panel.Panel#$bodyEl body}
		 * element. An example of this would be if this config was 'gui-tabPanel-childPanel', then the body element of the child
		 * Panel would get the CSS class: 'gui-tabPanel-childPanel-body'.
		 */
		childPanelCls : 'gui-tabPanel-childPanel',
		
		
		/**
		 * @protected
		 * @property {gui.tab.Bar} tabBar
		 * 
		 * The Container that holds the TabPanel's tabs.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this.addEvents(
				/**
				 * Fires before the {@link #activeTab} is changed.
				 * 
				 * @event beforetabchange
				 * @param {gui.tab.Panel} tabPanel This TabPanel instance.
				 * @param {gui.panel.Panel} panel The Panel instance for the tab is to be activated.
				 * @param {gui.panel.Panel} oldPanel The Panel instance of the tab that is to be de-activated. 
				 *   Will be null if there is no currently activated tab.
				 * @preventable
				 */
				'beforetabchange',
				
				/**
				 * Fires when the {@link #activeTab} has been changed. 
				 * 
				 * @event tabchange
				 * @param {gui.tab.Panel} tabPanel This TabPanel instance.
				 * @param {gui.panel.Panel} panel The Panel instance for the tab that was activated.
				 * @param {gui.panel.Panel} oldPanel The Panel instance of the tab that was de-activated. 
				 *   Will be null if there was no previously activated tab.
				 */
				'tabchange'
			);
			
			this.tabBar = this.createTabBar();
			
			this._super( arguments );
			
			this.setActiveTab( this.activeTab );
			this.layout.on( 'cardchange', this.onTabChange, this );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.tabBar.render( this.$el, /* insert before */ this.$bodyEl );
		},
		
		
		/**
		 * Factory method to create the TabPanel's {@link #tabBar}.
		 * 
		 * @protected
		 * @return {gui.tab.Bar}
		 */
		createTabBar : function() {
			return new TabBar();
		},
		
		
		/**
		 * Retrieves the TabPanel's internal {@link gui.tab.Bar TabBar} instance. 
		 * 
		 * Normally, the {@link #tabBar} is managed solely by the TabPanel itself, but this accessor allows for 
		 * the ability to manipulate the {@link #tabBar} directly to support certain scenarios.
		 */
		getTabBar : function() {
			return this.tabBar;
		},
		
		
		/**
		 * Factory method used to create a {@link gui.tab.Tab Tab} for the {@link #tabBar}.
		 * 
		 * @protected
		 * @param {gui.panel.Panel} The Panel which a Tab is being created for. 
		 * @return {gui.tab.Tab}
		 */
		createTab : function( panel ) {
			return new Tab( {
				text : panel.getTitle(),
				correspondingPanel : panel
			} );
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * Handler for when a child Panel is added to the TabPanel.
		 * 
		 * @inheritdoc
		 */
		onAdd : function( panel, idx ) {
			this._super( arguments );
			
			// Create a Tab for the panel
			var tab = this.createTab( panel );
			tab.on( 'click', this.onTabClick, this );
			this.tabBar.insert( tab, idx );
			
			// Add the "Tab Panel Child" CSS classes to the Panel
			panel.addCls( this.childPanelCls );
			panel.addBodyCls( this.childPanelCls + '-body' );
			
			// And finally, hide the panel's header (which is done by default)
			if( this.hideChildPanelHeaders ) {
				panel.hideHeader();
			}
		},
		
		
		/**
		 * Handler for when a child Panel is removed from the TabPanel.
		 * 
		 * @inheritdoc
		 */
		onRemove : function( panel, idx ) {
			// Remove the tab that corresponds to the panel from the TabBar
			this.tabBar.removeAt( idx );
			
			// Remove the "Tab Panel Child" CSS classes from the Panel
			panel.removeCls( this.childPanelCls );
			panel.removeBodyCls( this.childPanelCls + '-body' );
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onReorder : function( panel, newIdx, oldIdx ) {
			this._super( arguments );
			
			// Reorder the Tab in the TabBar to correspond to the Panel reordering
			var tabBar = this.tabBar,
			    tab = tabBar.getItemAt( oldIdx );
			tabBar.insert( tab, newIdx );
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * Sets the active tab {@link gui.panel.Panel Panel}.
		 * 
		 * @param {gui.panel.Panel/Number} panel The Panel to activate in the TabPanel, or the index of the Panel in the TabPanel
		 *   (0 for the first Panel). Note that if a {@link gui.panel.Panel Panel} is provided, it must be an *instantiated* Panel,
		 *   and not the anonymous config object used to create the Panel.
		 */
		setActiveTab : function( panel ) {
			if( typeof panel === 'number' ) {
				panel = this.getItemAt( panel );
			}
			
			var previousActiveTab = this.getActiveTab();
			if( this.fireEvent( 'beforetabchange', this, panel, previousActiveTab ) !== false ) {
				this.layout.setActiveItem( panel );
				
				this.tabBar.setActiveTab( panel );  // set the active tab based on the corresponding active Panel
			}
		},
		
		
		/**
		 * Gets the active tab ({@link gui.panel.Panel Panel}).
		 * 
		 * @return {gui.panel.Panel} The Panel that is currently shown as the active tab, or `null` if there is no active tab.
		 */
		getActiveTab : function() {
			return this.layout.getActiveItem();
		},
		
		
		/**
		 * Gets the {@link #activeTab} index (i.e. the 0-based tab number that is currently selected).
		 * 
		 * @return {Number} The index of the tab that is currently shown as the active tab, or -1 if there is no active tab.
		 */
		getActiveTabIndex : function() {
			return this.layout.getActiveItemIndex();
		},
		
		
		/**
		 * Handles a click to a {@link gui.tab.Tab Tab} in the TabBar.
		 *
		 * @protected
		 * @param {gui.tab.Tab} tab The Tab that was clicked.
		 */
		onTabClick : function( tab ) {
			this.setActiveTab( tab.getCorrespondingPanel() );  // show the Panel that corresponds to the tab
		},
		
		
		/**
		 * Method that is run after a new tab has been activated (shown).
		 * 
		 * @protected
		 * @param {gui.layout.Card} cardLayout
		 * @param {gui.panel.Panel} newPanel The newly activated Panel.
		 * @param {gui.panel.Panel} oldPanel The previously activated Panel.
		 */
		onTabChange : function( cardLayout, newPanel, oldPanel ) {
			this.fireEvent( 'tabchange', this, newPanel, oldPanel );
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			this.tabBar.destroy();
			
			this._super( arguments );
		}
		
	} );
	
	ComponentManager.registerType( 'tabpanel', TabPanel );
	
	return TabPanel;
	
} );