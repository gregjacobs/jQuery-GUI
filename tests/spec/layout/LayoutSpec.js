/*global Ext, Y, JsMockito, jQuery, Class, tests, Jux, ui */
ui.layout.LayoutTest = Class.extend( Ext.test.TestCase, {
	
	/**
	 * @protected
	 * @property {jQuery} $targetEl
	 * 
	 * A mock element which is the target element of the layout. This is the parent
	 * element of what the layout is rendering/sizing things into.
	 */
	
	/**
	 * @protected
	 * @property {ui.Container} container
	 * 
	 * A mock container instance.
	 */
	
	/**
	 * @protected
	 * @property {ui.layout.Layout} layout
	 * 
	 * The layout created via {@link #createLayout} for the TestCase subclass, and configured with the
	 * mock {@link #container}.
	 */
	
	/**
	 * @protected
	 * @property {Number} targetWidth
	 * 
	 * The {@link #$targetEl target element's} reported width.
	 */
	targetWidth : 100,
	
	/**
	 * @protected
	 * @property {Number} targetHeight
	 * 
	 * The {@link #$targetEl target element's} reported height.
	 */
	targetHeight : 200,
	
	
	
	setUp : function() {
		// A mock Content target element
		this.$targetEl = jQuery( '<div style="width: ' + this.targetWidth + 'px; height: ' + this.targetHeight + 'px;" />' );
		
		// A mock Container, which uses the $targetEl as its content target
		this.container = JsMockito.mock( ui.Container );
		JsMockito.when( this.container ).getContentTarget().thenReturn( this.$targetEl );
		JsMockito.when( this.container ).getCount().thenReturn( 0 );      // initially 0. Override in tests.
		JsMockito.when( this.container ).getItems().thenReturn( [] );     // initially empty. Override in tests.
		JsMockito.when( this.container ).getItemAt().thenReturn( null );  // all calls to getItemAt() (with any argument) should return null by default. 
		                                                                  // Specific argument values can be overridden in tests to return actual objects.
		JsMockito.when( this.container ).isRendered().thenReturn( true ); // must be rendered for the layout routine to run
		
		
		// Create a layout for testing, and set its 'container' to the mock Container
		// Check the validity of the createLayout method first though, to make sure each subclass implements its own
		if( !this.constructor.prototype.hasOwnProperty( 'createLayout' ) ) {
			throw new Error( "createLayout() must be implemented in each AbstractLayoutTest subclass" );
		}
		this.layout = this.createLayout();
		this.layout.setContainer( this.container );
	},
	
	
	tearDown : function() {
		this.layout.destroy();
		
		this.$targetEl.remove();
	},
	
	
	/**
	 * Creates the appropriate layout for the test subclass.
	 * 
	 * This method must be overridden in each TestCase subclass.
	 * 
	 * @method createLayout
	 * @return {ui.layout.Layout} A concrete AbstractLayout subclass for use with the tests.
	 */
	createLayout : function() {
		var Layout = ui.layout.Layout.extend( {} );  // concrete subclass
		return new Layout();
	},
	
	
	/**
	 * Utility method for tests to be able to create mock child components with some default implementations
	 * for common methods (such as {@link ui.Component#getPadding}, {@link ui.Component#getMargin}, and {@link ui.Component#getBorderWidth}.
	 * 
	 * @protected
	 * @method createChildComponents
	 * @param {Number} howMany How many components to create.
	 * @return {ui.Component[]} An array of the mocked {@link ui.Component components}.
	 */
	createChildComponents : function( howMany ) {
		var childComponents = [],
		    childComponent;
		
		for( var i = 0; i < howMany; i++ ) {
			childComponent = childComponents[ i ] = JsMockito.mock( ui.Component );
			
			// Note: All mock returns can be overridden
			JsMockito.when( childComponent ).getPadding().thenReturn( 0 );
			JsMockito.when( childComponent ).getMargin().thenReturn( 0 );
			JsMockito.when( childComponent ).getBorderWidth().thenReturn( 0 );
			
			JsMockito.when( childComponent ).getHeight().thenReturn( this.targetHeight );
			JsMockito.when( childComponent ).getInnerHeight().thenReturn( this.targetHeight );
			JsMockito.when( childComponent ).getOuterHeight().thenReturn( this.targetHeight );
			JsMockito.when( childComponent ).getWidth().thenReturn( this.targetWidth );
			JsMockito.when( childComponent ).getInnerWidth().thenReturn( this.targetWidth );
			JsMockito.when( childComponent ).getOuterWidth().thenReturn( this.targetWidth );
		}
		return childComponents;
	}
	
} );


tests.unit.ui.layout.add( new Ext.test.Suite( {
	
	name: 'Layout',
	
	
	items : [
	
		/*
		 * Test doLayout()
		 */
		new ui.layout.LayoutTest( {
			name : "Test doLayout()",
			
			
			"doLayout() should call onLayout() for subclasses" : function() {
				var layout = this.layout,
				    onLayoutCallCount = 0;
				
				layout.onLayout = function() { onLayoutCallCount++; };  // override for test
				layout.doLayout();
				
				Y.Assert.areSame( 1, onLayoutCallCount );
			},
			
			
			"doLayout() should call doLayout() on each of the container's child components, to recalculate their layout" : function() {
				var childCmp1 = JsMockito.mock( ui.Component ),
				    childCmp2 = JsMockito.mock( ui.Component ),
				    childCmp3 = JsMockito.mock( ui.Component );
				
				JsMockito.when( childCmp1 ).getUuid().thenReturn( 1 );
				JsMockito.when( childCmp1 ).getUuid().thenReturn( 2 );
				JsMockito.when( childCmp1 ).getUuid().thenReturn( 3 );
				JsMockito.when( this.container ).getItems().thenReturn( [ childCmp1, childCmp2, childCmp3 ] );
				
				var layout = this.layout;
				layout.doLayout();
				
				try { 
					JsMockito.verify( childCmp1 ).doLayout();
					JsMockito.verify( childCmp2 ).doLayout();
					JsMockito.verify( childCmp3 ).doLayout();
				} catch( e ) {
					Y.Assert.fail( ( typeof e === 'string' ) ? e : e.message );  // `e` will be a string coming from JsMockito, or an actual Error object for legitimate errors
				}
			},
			
			
			"doLayout should *not* call doLayout on a child component that is manually laid out by the layout routine implemented in a Layout subclass" : function() {
				var childCmp1 = JsMockito.spy( new ui.Component() ),  // Note: using actual
				    childCmp2 = JsMockito.spy( new ui.Component() ),  // ui.Components here,
				    childCmp3 = JsMockito.spy( new ui.Component() );  // because we need their events
				
				JsMockito.when( this.container ).getItems().thenReturn( [ childCmp1, childCmp2, childCmp3 ] );
				
				var layout = this.layout;
				
				// Overwrite onLayout for this layout, to manually lay out childCmp2
				layout.onLayout = function() {
					childCmp2.doLayout();
				};
				
				layout.doLayout();
				
				try { 
					JsMockito.verify( childCmp1 ).doLayout();
					JsMockito.verify( childCmp2 ).doLayout();  // should only happen once!
					JsMockito.verify( childCmp3 ).doLayout();
				} catch( e ) {
					Y.Assert.fail( ( typeof e === 'string' ) ? e : e.message );  // `e` will be a string coming from JsMockito, or an actual Error object for legitimate errors
				}
			}
			
		} ),
		
		
		/*
		 * Test renderComponent()
		 */
		new ui.layout.LayoutTest( {
			name : "Test renderComponent()",
			
			setUp : function() {
				ui.layout.LayoutTest.prototype.setUp.apply( this, arguments );
				
				// Redefine the $targetEl to be a regular jQuery object, not a spy (spy is messing it up for some reason)
				this.$targetEl = jQuery( '<div />' );
				
				this.unrenderedComponent = JsMockito.mock( ui.Component );
				JsMockito.when( this.unrenderedComponent ).isRendered().thenReturn( false );
				
				this.renderedComponent = JsMockito.mock( ui.Component );
				this.$componentEl = jQuery( '<div />' );
				JsMockito.when( this.renderedComponent ).isRendered().thenReturn( true );
				JsMockito.when( this.renderedComponent ).getEl().thenReturn( this.$componentEl );
			},
			
			tearDown : function() {
				this.$componentEl.remove();
				
				ui.layout.LayoutTest.prototype.tearDown.apply( this, arguments );
			},
			
			
			"renderComponent() should render the component if the component is not yet rendered" : function() {
				var $targetEl = this.$targetEl,
				    cmp = this.unrenderedComponent;
				
				var layout = this.layout;
				layout.renderComponent( cmp, $targetEl );
				
				try {
					JsMockito.verify( cmp ).render();
					
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			},
			
			"renderComponent() should render the component if the component is rendered, but not a child of the $targetEl (no `position` option provided)" : function() {
				var $targetEl = this.$targetEl,
				    cmp = this.renderedComponent,
				    $cmpEl = this.$componentEl;
				
				// Pretend the component is already rendered, but not in the $targetEl
				$( 'body' ).append( $cmpEl );
				
				var layout = this.layout;
				layout.renderComponent( cmp, $targetEl );
				
				try {
					JsMockito.verify( cmp ).render();
					
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			},
			
			"renderComponent() should render the component if the component is rendered, but not in the correct position in the $targetEl (`position` provided as number)" : function() {
				var $targetEl = this.$targetEl,
				    cmp = this.renderedComponent,
				    $cmpEl = this.$componentEl,
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, but in the wrong position in the $targetEl
				$targetEl.append( $otherCmpEl );
				$targetEl.append( $cmpEl );
				
				var layout = this.layout;
				layout.renderComponent( cmp, $targetEl, { position: 0 } );  // the component is supposed to be the first element, but $otherCmpEl is
				
				try {
					JsMockito.verify( cmp ).render();
					
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			},
			
			"renderComponent() should render the component if the component is rendered, but not in the correct position in the $targetEl (`position` provided as HTMLElement)" : function() {
				var $targetEl = this.$targetEl,
				    cmp = this.renderedComponent,
				    $cmpEl = this.$componentEl,
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, but in the wrong position in the $targetEl
				$targetEl.append( $otherCmpEl );
				$targetEl.append( $cmpEl );
				
				var layout = this.layout;
				layout.renderComponent( cmp, $targetEl, { position: $otherCmpEl[ 0 ] } );  // the component is supposed to be before $otherCmpEl, but it is currently after it
				
				try {
					JsMockito.verify( cmp ).render();
					
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			},
			
			"renderComponent() should render the component if the component is rendered, but not in the correct position in the $targetEl (`position` provided as jQuery set)" : function() {
				var $targetEl = this.$targetEl,
				    cmp = this.renderedComponent,
				    $cmpEl = this.$componentEl,
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, but in the wrong position in the $targetEl
				$targetEl.append( $otherCmpEl );
				$targetEl.append( $cmpEl );
				
				var layout = this.layout;
				layout.renderComponent( cmp, $targetEl, { position: $otherCmpEl } );  // the component is supposed to be before $otherCmpEl, but it is currently after it
				
				try {
					JsMockito.verify( cmp ).render();
					
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			},
			
			// -----------------------------------------------------
			
			"renderComponent() should *not* render the component if the component is rendered, and already a child of the $targetEl (no `position` option provided)" : function() {
				var $targetEl = this.$targetEl,
				    cmp = this.renderedComponent,
				    $cmpEl = this.$componentEl;
				
				// Pretend the component is already rendered, already in the $targetEl
				$( $targetEl ).append( $cmpEl );
				
				var layout = this.layout;
				layout.renderComponent( cmp, $targetEl );
				
				try {
					JsMockito.verify( cmp, JsMockito.Verifiers.never() ).render();
					
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			},
			
			"renderComponent() should *not* render the component if the component is rendered, and already in the correct position (`position` provided as number)" : function() {
				var $targetEl = this.$targetEl,
				    cmp = this.renderedComponent,
				    $cmpEl = this.$componentEl,
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, already in the $targetEl, in the correct position
				$( $targetEl ).append( $cmpEl );
				$( $targetEl ).append( $otherCmpEl );
				
				var layout = this.layout;
				layout.renderComponent( cmp, $targetEl, { position: 0 } );
				
				try {
					JsMockito.verify( cmp, JsMockito.Verifiers.never() ).render();
					
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			},
			
			"renderComponent() should *not* render the component if the component is rendered, and already in the correct position (`position` provided as HTMLElement)" : function() {
				var $targetEl = this.$targetEl,
				    cmp = this.renderedComponent,
				    $cmpEl = this.$componentEl,
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, already in the $targetEl, in the correct position
				$( $targetEl ).append( $cmpEl );
				$( $targetEl ).append( $otherCmpEl );
				
				var layout = this.layout;
				layout.renderComponent( cmp, $targetEl, { position: $otherCmpEl[ 0 ] } );
				
				try {
					JsMockito.verify( cmp, JsMockito.Verifiers.never() ).render();
					
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			},
			
			"renderComponent() should *not* render the component if the component is rendered, and already in the correct position (`position` provided as jQuery set)" : function() {
				var $targetEl = this.$targetEl,
				    cmp = this.renderedComponent,
				    $cmpEl = this.$componentEl,
				    $otherCmpEl = jQuery( '<div />' );
				
				// Pretend the component is already rendered, already in the $targetEl, in the correct position
				$( $targetEl ).append( $cmpEl );
				$( $targetEl ).append( $otherCmpEl );
				
				var layout = this.layout;
				layout.renderComponent( cmp, $targetEl, { position: $otherCmpEl } );
				
				try {
					JsMockito.verify( cmp, JsMockito.Verifiers.never() ).render();
					
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			}
		} )
	]
	
} ) );