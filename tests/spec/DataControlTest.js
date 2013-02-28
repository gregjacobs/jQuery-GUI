tests.unit.ui.add( new Ext.test.Case( {
	
	name: 'ui.DataControl',
	
	
	setUp : function() {
		// A Component DataControl with implemented setData() and getData() methods used for testing.
		var TestDataControlComponent = Jux.extend( ui.Component, {
			mixins : [ ui.DataControl ],
			
			initComponent : function() {
				TestDataControlComponent.superclass.initComponent.apply( this, arguments );
				
				// call mixin class constructor
				ui.DataControl.constructor.call( this );
			},
														  
			setData : function( data ) { this.data = data; },
			getData : function() { return this.data; }
		} );
		
		// expose class for tests
		this.TestDataControlComponent = TestDataControlComponent;
		
		
		// A Container DataControl with implemented setData() and getData() methods used for testing.
		var TestDataControlContainer = Jux.extend( ui.Container, {
			mixins : [ ui.DataControl ],
			
			initComponent : function() {
				TestDataControlContainer.superclass.initComponent.apply( this, arguments );
				
				// call mixin class constructor
				ui.DataControl.constructor.call( this );
			},
														  
			setData : function( data ) { this.data = data; },
			getData : function() { return this.data; }
		} );
		
		// expose class for tests
		this.TestDataControlContainer = TestDataControlContainer;
	},
	
	
	// --------------------------------
	
	
	/*
	 * Test ui.DataControl.getKey()
	 */
	test_getKey : function() {
		var TestDataControlComponent = this.TestDataControlComponent;
		
		// Test with no key
		var dataComponent = new TestDataControlComponent();
		Y.Assert.isNull( dataComponent.getKey(), "Creating a DataControl without a 'key' should have returned null." );
		
		// Test with a key
		var dataComponent = new TestDataControlComponent( {
			key : 'testKey'
		} );
		Y.Assert.areSame( 'testKey', dataComponent.getKey(), "The key 'testKey' should have been returned by getKey() when configured with that." );
	}
	
	
	// datachange event tests
	// NOTE: These tests are commented because the datachange event no longer bubbles for performance reasons. However,
	// this performance hit may not be as big as initially thought, and we may want to put this bubbling feature back
	// in place at a later date. Saving the tests (as to not be lost in version control) in case we do re-instate this feature.
	
	/*
	"DataControl's datachange event should bubble to parent Containers" : function() {
		var TestDataControlComponent = this.TestDataControlComponent;
		var datachangeEventFiredOnParent = false;
		
		// A regular ui.Container
		var container = new ui.Container( {
			listeners : {
				'datachange' : function() { datachangeEventFiredOnParent = true; }
			}
		} );
		
		// Add the Test DataControl component to the Container
		var dataComponent = new TestDataControlComponent();
		container.add( dataComponent );
		
		// Fire the event
		dataComponent.fireEvent( 'datachange', dataComponent );
		
		Y.Assert.isTrue( datachangeEventFiredOnParent, "The datachange event should have been fired on the parent Container of the DataControl" );
	},
	
	
	"DataControl's datachange event should NOT bubble to a parent Container that is also a DataControl" : function() {
		var TestDataControlComponent = this.TestDataControlComponent,
		    TestDataControlContainer = this.TestDataControlContainer;
		var datachangeEventFiredOnParent = false;
		
		var dataContainer = new TestDataControlContainer( {
			listeners : {
				'datachange' : function() { datachangeEventFiredOnParent = true; }
			}
		} );
		
		var dataComponent = new TestDataControlComponent();
		dataContainer.add( dataComponent );
		
		// Fire the event
		dataComponent.fireEvent( 'datachange', dataComponent );
		
		Y.Assert.isFalse( datachangeEventFiredOnParent, "The datachange event should not have been fired on the parent Container of the DataControl, as the parent Container is also a DataControl. The event should not propagate to other DataControls" );
	},
	
	
	"DataControl's datachange event should bubble up parent Containers until it hits the Container right before an ancestor DataControl" : function() {
		var TestDataControlComponent = this.TestDataControlComponent,
		    TestDataControlContainer = this.TestDataControlContainer;
			
		var eventFiredOnOutermostParent = false,
		    eventFiredOnSecondParent = false,
		    eventFiredOnFirstParent = false;
		
		var dataComponent = new TestDataControlComponent();
		var parentContainer = new TestDataControlContainer( {
			listeners : {
				'datachange' : function() { eventFiredOnOutermostParent = true; }  // should not be run!
			},
			
			items : [
				{
					listeners : {
						'datachange' : function() { eventFiredOnSecondParent = true; }
					},
					
					items : [
						{
							listeners : {
								'datachange' : function() { eventFiredOnFirstParent = true; }
							},
							
							items : [
								dataComponent   // The DataControl, deeply nested
							]
						}
					]
				}
			]
		} );
		
		
		// Fire the event
		dataComponent.fireEvent( 'datachange', dataComponent );
		
		Y.Assert.isTrue( eventFiredOnFirstParent, "The datachange event should have bubbled to and been fired on the first parent Container (a regular ui.Container)" );
		Y.Assert.isTrue( eventFiredOnSecondParent, "The datachange event should have bubbled to and been fired on the second parent Container (a regular ui.Container)" );
		Y.Assert.isFalse( eventFiredOnOutermostParent, "The datachange event should NOT have bubbled to and been fired on the outermost Container of the DataControl, as that Container is also a DataControl. The event should not propagate to other DataControls." );
	}
	*/
	
} ) );