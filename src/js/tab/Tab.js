/*global define */
define( [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/button/Button',
	'jqc/template/LoDash'
], function( jQuery, _, ComponentManager, Button, LoDashTpl ) {

	/**
	 * @class jqc.tab.Tab
	 * @extends jqc.button.Button
	 * @alias type.tab
	 *
	 * A specialized button used as the tabs of a {@link jqc.tab.Panel Tab Panel}.
	 */
	var Tab = Button.extend( {
		
	} );
	
	
	ComponentManager.registerType( 'tab', Tab );
	
	return Tab;
	
} );
		