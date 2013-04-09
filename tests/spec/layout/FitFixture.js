/*global define, JsMockito */
define( [
	'jquery',
	'jqc/Component',
	'jqc/layout/Fit',
	'spec/layout/LayoutFixture'
], function( jQuery, Component, FitLayout, LayoutFixture ) {
	
	/**
	 * @class spec.layout.FitFixture
	 * @extends spec.layout.LayoutFixture
	 * 
	 * Fixture class for the {@link jqc.layout.Fit Fit} layout's tests.
	 */
	var FitLayoutFixture = LayoutFixture.extend( {
		
		/**
		 * @protected
		 * @property {jqc.Component} childCmp
		 * 
		 * A mock {@link jqc.Component} instance which is set up for tests. It defaults to having
		 * zero margin/border/padding, but may be overridden in tests.
		 */
		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			this._super( arguments );
			
			this.childCmp = JsMockito.mock( Component );
			JsMockito.when( this.childCmp ).getPadding().thenReturn( 0 );       // default implementation, can be overridden
			JsMockito.when( this.childCmp ).getMargin().thenReturn( 0 );        // default implementation, can be overridden
			JsMockito.when( this.childCmp ).getBorderWidth().thenReturn( 0 );   // default implementation, can be overridden
		},
		
		
		/**
		 * Overridden method to create the {@link jqc.layout.Fit Fit} layout.
		 * 
		 * @return {jqc.layout.Fit}
		 */
		createLayout : function() {
			return new FitLayout();
		},
		
		
		/**
		 * Retrieves the {@link #childCmp}.
		 * 
		 * @return {jqc.Component} The child component mocked for tests.
		 */
		getChildCmp : function() {
			return this.childCmp;
		}
		
	} );
	
	return FitLayoutFixture;
	
} );