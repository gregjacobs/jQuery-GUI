/*global define */
define( [
	'jqGui/layout/HBox',
	'spec/layout/LayoutFixture'
], function( HBoxLayout, LayoutFixture ) {
	
	/**
	 * @class spec.layout.HBoxFixture
	 * @extends spec.layout.LayoutFixture
	 * 
	 * Fixture class for the {@link jqGui.layout.HBox HBox} layout's tests.
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
		 * Overridden method to create the {@link jqGui.layout.HBox HBox} layout.
		 * 
		 * @return {jqGui.layout.HBox}
		 */
		createLayout : function() {
			return new HBoxLayout();
		}
		
	} );
	
	return HBoxLayoutFixture;
	
} );