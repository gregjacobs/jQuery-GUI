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
	 * A specialized button used as the tabs of a {@link jqc.tab.Panel TabPanel}.
	 */
	var Tab = Button.extend( {
		
		/**
		 * @cfg {jqc.panel.Panel} correspondingPanel (required)
		 * 
		 * The Panel that this tab has been created for, and corresponds to. The Panel is a child item of the parent
		 * {@link jqc.tab.Panel TabPanel}, and is needed to map the Tab to the Panel it shows.
		 */
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		componentCls : 'jqc-tabPanel-tab',
		
		
		/**
		 * @protected
		 * @property {Boolean} active
		 * 
		 * Flag which is set to `true` when this is the active Tab. The active Tab is the one whose {@link #correspondingPanel}
		 * is the one shown in the parent {@link jqc.tab.Panel TabPanel}.
		 */
		active : false,
		
		
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
		 * Retrieves the {@link jqc.panel.Panel Panel} that this Tab corresponds to in the parent {@link jqc.tab.Panel TabPanel}.
		 * 
		 * @return {jqc.panel.Panel}
		 */
		getCorrespondingPanel : function() {
			return this.correspondingPanel;
		},
		
		
		/**
		 * Sets the tab as the "active" tab. The active Tab is the one whose {@link #correspondingPanel}
		 * is the one shown in the parent {@link jqc.tab.Panel TabPanel}.
		 * 
		 * @chainable
		 */
		setActive : function() {
			if( !this.active ) {
				this.active = true;
				this.addCls( this.componentCls + '-active' );
			}
			
			return this;
		},
		
		
		/**
		 * Sets the tab as an "inactive" tab. This is for when the {@link #correspondingPanel} is made invisible
		 * in the parent {@link jqc.tab.Panel TabPanel}.
		 * 
		 * @chainable
		 */
		setInactive : function() {
			if( this.active ) {
				this.active = false;
				this.removeCls( this.componentCls + '-active' );
			}
			
			return this;
		},
		
		
		/**
		 * Determines if the tab is the "active" tab. The active Tab is the one whose {@link #correspondingPanel}
		 * is the one shown in the parent {@link jqc.tab.Panel TabPanel}.
		 * 
		 * @return {Boolean}
		 */
		isActive : function() {
			return this.active;
		}
		
	} );
	
	
	ComponentManager.registerType( 'tab', Tab );
	
	return Tab;
	
} );
		