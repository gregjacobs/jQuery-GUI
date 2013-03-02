/*global Ext, Y, JsMockito, jQuery, Class, tests, Jux, ui */
ui.layout.FitLayoutTest = Class.extend( ui.layout.LayoutTest, {
	
	
	setUp : function() {
		this._super( arguments );
		
		
		this.childCmp = JsMockito.mock( ui.Component );
		JsMockito.when( this.childCmp ).getPadding().thenReturn( 0 );       // default implementation, can be overridden
		JsMockito.when( this.childCmp ).getMargin().thenReturn( 0 );        // default implementation, can be overridden
		JsMockito.when( this.childCmp ).getBorderWidth().thenReturn( 0 );   // default implementation, can be overridden
	},
	
	
	/**
	 * Creates the appropriate layout for the test subclass.
	 * 
	 * This method must be overridden in each TestCase subclass.
	 * 
	 * @method createLayout
	 * @return {ui.layout.FitLayout}
	 */
	createLayout : function() {
		return new ui.layout.FitLayout();
	}
	
} );


tests.unit.ui.layout.add( new Ext.test.Suite( {
	
	name: 'FitLayout',
	
	
	items : [
	
		/*
		 * Test doLayout()
		 */
		new ui.layout.FitLayoutTest( {
			name : "Test doLayout()",
			
			
			"When there are no child components, doLayout() should simply return out" : function() {
				var layout = this.layout;
				layout.doLayout();
				
				// Test should simply not error
			},
			
			
			"doLayout() should do an initial render of the container's child component with the correct size, taking into account margin/border/padding" : function() {
				var childCmp = this.childCmp;
				JsMockito.when( childCmp ).isRendered().thenReturn( false );  // Not yet rendered
				
				var lrPadding = 1, lrMargin = 2, lrBorderWidth = 3,
				    tbPadding = 2, tbMargin = 3, tbBorderWidth = 4;
				
				JsMockito.when( childCmp ).getPadding( 'lr' ).thenReturn( lrPadding );
				JsMockito.when( childCmp ).getPadding( 'tb' ).thenReturn( tbPadding );
				JsMockito.when( childCmp ).getMargin( 'lr' ).thenReturn( lrMargin );
				JsMockito.when( childCmp ).getMargin( 'tb' ).thenReturn( tbMargin );
				JsMockito.when( childCmp ).getBorderWidth( 'lr' ).thenReturn( lrBorderWidth );
				JsMockito.when( childCmp ).getBorderWidth( 'tb' ).thenReturn( tbBorderWidth );
				
				JsMockito.when( this.container ).getItems().thenReturn( [ childCmp ] );
				
				var layout = this.layout;
				layout.doLayout();
				
				try {
					JsMockito.verify( childCmp ).render( this.$targetEl );
					JsMockito.verify( childCmp ).setSize( this.targetWidth - lrPadding - lrMargin - lrBorderWidth, this.targetHeight - tbPadding - tbMargin - tbBorderWidth );
				} catch( e ) {
					Y.Assert.fail( ( typeof e === 'string' ) ? e : e.message );  // `e` will be a string coming from JsMockito, or an actual Error object for legitimate errors
				}
			},
			
			
			"doLayout() should move the container's child component if it is already rendered, but elsewhere" : function() {
				var childCmp = this.childCmp,
				    $cmpEl = jQuery( '<div />' ).appendTo( 'body' );
				JsMockito.when( childCmp ).isRendered().thenReturn( true );  // Already rendered
				JsMockito.when( childCmp ).getEl().thenReturn( $cmpEl );
				
				JsMockito.when( this.container ).getItems().thenReturn( [ childCmp ] );
				
				var layout = this.layout;
				layout.doLayout();
				
				try {
					JsMockito.verify( childCmp ).setSize( this.targetWidth, this.targetHeight );
					JsMockito.verify( childCmp ).render( this.$targetEl );   // Call render(), to make sure the component is in the correct place
				} catch( e ) {
					Y.Assert.fail( ( typeof e === 'string' ) ? e : e.message );  // `e` will be a string coming from JsMockito, or an actual Error object for legitimate errors
				}
				
				$cmpEl.remove();
			},
			
			
			"doLayout() should *not* move the container's child component if it is already rendered in the FitLayout" : function() {
				var childCmp = this.childCmp;
				
				// Simulate that the component's element was created and added to the $targetEl
				var $cmpEl = jQuery( '<div />' );
				this.$targetEl.append( $cmpEl );
				JsMockito.when( childCmp ).isRendered().thenReturn( true );
				JsMockito.when( childCmp ).getEl().thenReturn( $cmpEl );
				
				JsMockito.when( this.container ).getItems().thenReturn( [ childCmp ] );
				
				var layout = this.layout;
				layout.doLayout();
				
				try {
					JsMockito.verify( childCmp, JsMockito.Verifiers.never() ).render( this.$targetEl );
				} catch( e ) {
					Y.Assert.fail( ( typeof e === 'string' ) ? e : e.message );  // `e` will be a string coming from JsMockito, or an actual Error object for legitimate errors
				}
			},
			
			
			"doLayout() should *not* move the container's child component if it is already rendered in the FitLayout, but should fix its size if the Container's contentTargetEl's size has changed" : function() {
				var childCmp = this.childCmp;
				JsMockito.when( childCmp ).isRendered().thenReturn( false );
				
				JsMockito.when( this.container ).getItems().thenReturn( [ childCmp ] );
				
				var layout = this.layout;
				layout.doLayout();  // initial layout
				
				// Need to pretend the component is rendered now, and change the size of the target element 
				// before running the layout again
				JsMockito.when( childCmp ).isRendered().thenReturn( true );
				JsMockito.when( childCmp ).getEl().thenReturn( jQuery( '<div />' ).appendTo( this.$targetEl ) );
				this.$targetEl.width( 42 );
				this.$targetEl.height( 7 );
				layout.doLayout();
				
				try {
					JsMockito.verify( childCmp, JsMockito.Verifiers.once() ).render( this.$targetEl );   // should only be rendered the first time
					
					JsMockito.verify( childCmp ).setSize( this.targetWidth, this.targetHeight );   // verify that it was set to the initial size first
					JsMockito.verify( childCmp ).setSize( 42, 7 );                                 // verify that it was set to the new size as well
				} catch( e ) {
					Y.Assert.fail( ( typeof e === 'string' ) ? e : e.message );  // `e` will be a string coming from JsMockito, or an actual Error object for legitimate errors
				}
			}
		} )
		
	]
	
} ) );