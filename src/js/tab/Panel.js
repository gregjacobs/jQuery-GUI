/*global define */
define( [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/Component',
	'jqc/Container',
	'jqc/panel/Panel',
	'jqc/tab/Bar',
	'jqc/tab/Tab',
	'jqc/template/LoDash',
	'jqc/layout/Card'
], function( jQuery, _, ComponentManager, Component, Container, Panel, TabBar, Tab, LoDashTpl ) {

	/**
	 * @class jqc.tab.Panel
	 * @extends jqc.panel.Panel
	 * @alias type.tabpanel
	 *
	 * A basic tab container panel. Child {@link #items} must be {@link jqc.panel.Panel Panels} or Panel subclasses,
	 * as their {@link jqc.panel.Panel#title title} property is read to create the tabs.
	 * 
	 * The Tab Panel is internally configured with a {@link jqc.layout.Card Card} layout, which switches between
	 * the panels when the tabs are clicked.
	 * 
	 * By default, each child Panel has its header hidden, and takes its {@link jqc.panel.Panel#title} config
	 * to use as the tab's title. To not hide each panel's header, set the {@link #hideChildPanelHeaders} config
	 * to `false`.
	 */
	var TabPanel = Panel.extend( {
		
		/**
		 * @cfg {Number/jqc.Component} activeTab
		 * 
		 * The tab number, or {@link jqc.Component} instance to set as the initially active tab. Defaults to 0 
		 * (for the first tab). If this is a {@link jqc.Component} instance, it must exist within the TabPanel.
		 */
		activeTab : 0,
		
		/**
		 * @cfg {Boolean} hideChildPanelHeaders
		 * 
		 * `true` to hide each child panel's {@link jqc.panel.Panel#header header} when added to the Tab Panel.
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
		layout : 'card',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-TabPanel',
		
		
		/**
		 * @protected
		 * @property {jqc.tab.Bar} tabBar
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
				 * @param {jqc.tab.Panel} tabPanel This TabPanel instance.
				 * @param {jqc.panel.Panel} panel The Panel instance for the tab is to be activated.
				 * @param {jqc.panel.Panel} oldPanel The Panel instance of the tab that is to be de-activated. 
				 *   Will be null if there is no currently activated tab.
				 * @preventable
				 */
				'beforetabchange',
				
				/**
				 * Fires when the {@link #activeTab} has been changed. 
				 * 
				 * @event tabchange
				 * @param {jqc.tab.Panel} tabPanel This TabPanel instance.
				 * @param {jqc.panel.Panel} panel The Panel instance for the tab that was activated.
				 * @param {jqc.panel.Panel} oldPanel The Panel instance of the tab that was de-activated. 
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
		 * @return {jqc.tab.Bar}
		 */
		createTabBar : function() {
			return new TabBar();
		},
		
		
		/**
		 * Factory method used to create a {@link jqc.tab.Tab Tab} for the {@link #tabBar}.
		 * 
		 * @protected
		 * @param {jqc.panel.Panel} The Panel which a Tab is being created for. 
		 * @return {jqc.tab.Tab}
		 */
		createTab : function( panel ) {
			return new Tab( {
				text  : panel.getTitle(),
				correspondingPanel : panel
			} );
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onAdd : function( panel, idx ) {
			this._super( arguments );
			
			// <debug>
			if( !( panel instanceof Panel ) ) {
				throw new Error( "Components added to the TabPanel must be an instance of jqc.panel.Panel or a subclass of it" );
			}
			// </debug>
			
			
			// Create a Tab for the panel
			var tab = this.createTab( panel );
			tab.on( 'click', this.onTabClick, this );
			
			this.tabBar.insert( tab, idx );
			
			// And finally, hide the panel's header (which is done by default)
			if( this.hideChildPanelHeaders ) {
				panel.hideHeader();
			}
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRemove : function( panel, idx ) {
			// Remove the tab that corresponds to the panel from the TabBar
			var tab = this.tabBar.removeAt( idx );
			
			this._super( arguments );
		},
		
		
		// ------------------------------------------
		
		
		/**
		 * Sets the active tab {@link jqc.panel.Panel Panel}.
		 * 
		 * @param {jqc.panel.Panel/Number} panel The Panel to activate in the TabPanel, or the index of the Panel in the TabPanel
		 *   (0 for the first Panel). Note that if a {@link jqc.panel.Panel Panel} is provided, it must be an *instantiated* Panel,
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
		 * Gets the active tab ({@link jqc.panel.Panel Panel}).
		 * 
		 * @return {jqc.panel.Panel} The Panel that is currently shown as the active tab, or `null` if there is no active tab.
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
		 * Handles a click to a {@link jqc.tab.Tab Tab} in the TabBar.
		 *
		 * @protected
		 * @param {jqc.tab.Tab} tab The Tab that was clicked.
		 */
		onTabClick : function( tab ) {
			this.setActiveTab( tab.getCorrespondingPanel() );  // show the Panel that corresponds to the tab
		},
		
		
		/**
		 * Method that is run after a new tab has been activated (shown).
		 * 
		 * @protected
		 * @param {jqc.layout.Card} cardLayout
		 * @param {jqc.panel.Panel} newPanel The newly activated Panel.
		 * @param {jqc.panel.Panel} oldPanel The previously activated Panel.
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