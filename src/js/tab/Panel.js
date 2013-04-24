/*global define */
define( [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/Container',
	'jqc/panel/Panel',
	'jqc/tab/Bar',
	'jqc/template/LoDash'
], function( jQuery, _, ComponentManager, Container, Panel, TabBar, LoDashTpl ) {

	/**
	 * @class jqc.tab.Panel
	 * @extends jqc.panel.Panel
	 * @alias type.tabpanel
	 *
	 * A basic tab container panel. Child items must be {@link jqc.panel.Panel Panels} or Panel subclasses.
	 * 
	 * By default, each child Panel has its header hidden, and takes its {@link jqc.panel.Panel#title} config
	 * to use as the tab's title.
	 */
	var TabPanel = Panel.extend( {
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Panel',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-TabPanel',
		
		
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
			this.tabBar = new TabBar( { html: "HI!" } );
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.tabBar.render( this.$el, /* insert before */ this.$bodyEl );
		}
		
		
		// ------------------------------------------
		
		
		
		
	} );
	
	ComponentManager.registerType( 'tabpanel', TabPanel );
	
	return TabPanel;
	
} );