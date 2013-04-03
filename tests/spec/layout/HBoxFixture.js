/*global define, JsMockito */
define( [
	'ui/layout/HBox',
	'spec/layout/LayoutFixture'
], function( HBoxLayout, LayoutFixture ) {
	
	/**
	 * @class spec.layout.HBoxFixture
	 * @extends spec.layout.LayoutFixture
	 * 
	 * Fixture class for the {@link ui.layout.HBox HBox} layout's tests.
	 */
	var HBoxLayoutFixture = LayoutFixture.extend( {		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			this._super( arguments );
			
			// No specific implementation, yet
		},
		
		
		/**
		 * Overridden method to create the {@link ui.layout.HBox HBox} layout.
		 * 
		 * @return {ui.layout.HBox}
		 */
		createLayout : function() {
			return new HBoxLayout();
		}
		
	} );
	
	return HBoxLayoutFixture;
	
} );