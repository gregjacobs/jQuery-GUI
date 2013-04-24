/*global define */
define( [
	'jqc/ComponentManager',
	'jqc/Container',
	'jqc/tab/Tab'
], function( ComponentManager, Container, Tab ) {
	
	/**
	 * @class jqc.tab.Bar
	 * @extends jqc.Container
	 * @alias type.tabbar
	 * 
	 * Specialized container for a {@link jqc.tab.Panel Tab Panel's} tabs.
	 */
	var TabBar = Container.extend( {
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		defaultType : 'tab'
		
	} );
	
	
	ComponentManager.registerType( 'tabbar', TabBar );
	
	return TabBar;
	
} );