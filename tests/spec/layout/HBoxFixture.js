/*global define */
define( [
	'jqg/layout/HBox',
	'spec/layout/LayoutFixture'
], function( HBoxLayout, LayoutFixture ) {
	
	/**
	 * @class spec.layout.HBoxFixture
	 * @extends spec.layout.LayoutFixture
	 * 
	 * Fixture class for the {@link jqg.layout.HBox HBox} layout's tests.
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
		 * Overridden method to create the {@link jqg.layout.HBox HBox} layout.
		 * 
		 * @return {jqg.layout.HBox}
		 */
		createLayout : function() {
			return new HBoxLayout();
		}
		
	} );
	
	return HBoxLayoutFixture;
	
} );