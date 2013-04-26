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
		
		/**
		 * @cfg {jqc.panel.Panel} correspondingPanel (required)
		 * 
		 * The Panel that this tab has been created for, and corresponds to. The Panel is a child item of the parent
		 * {@link jqc.tab.Panel Tab Panel}, and is needed to map the Tab to the Panel it shows.
		 */
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// <debug>
			if( !this.correspondingPanel ) throw new Error( "`correspondingPanel` cfg required" );
			// </debug>
			
			this._super( arguments );
		},
		
		
		/**
		 * Retrieves the {@link #panel} that this Tab corresponds to in the parent {@link jqc.tab.Panel Tab Panel}.
		 * 
		 * @return {jqc.panel.Panel}
		 */
		getCorrespondingPanel : function() {
			return this.correspondingPanel;
		}
		
	} );
	
	
	ComponentManager.registerType( 'tab', Tab );
	
	return Tab;
	
} );
		