/*global define */
define( [
	'jqg/ComponentManager',
	'jqg/Container',
	'jqg/tab/Tab'
], function( ComponentManager, Container, Tab ) {
	
	/**
	 * @class jqg.tab.Bar
	 * @extends jqg.Container
	 * @alias type.tabbar
	 * 
	 * Specialized container for a {@link jqg.tab.Panel Tab Panel's} tabs.
	 */
	var TabBar = Container.extend( {
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		defaultType : 'tab',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqg-tabPanel-bar',
		
		
		/**
		 * Sets the "active" tab based on the given activated {@link jqg.panel.Panel Panel} which corresponds
		 * to it. All other tabs will be set to "inactive".
		 * 
		 * @param {jqg.panel.Panel} panel The Panel that corresponds to the Tab that should be made active.
		 *   If `null` is provided, or a Panel that does not have a corresponding Tab, then all tabs will
		 *   be set to their "inactive" state.
		 * @chainable
		 */
		setActiveTab : function( panel ) {
			var tabs = this.getItems(), 
			    tab;
			
			for( var i = 0, len = tabs.length; i < len; i++ ) {
				tab = tabs[ i ];
				
				tab[ ( tab.getCorrespondingPanel() === panel ) ? 'setActive' : 'setInactive' ]();
			}
			return this;
		}
		
	} );
	
	
	ComponentManager.registerType( 'tabbar', TabBar );
	
	return TabBar;
	
} );