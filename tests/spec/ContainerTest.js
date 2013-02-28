/*global tests, JsMockito, Ext, Y, ui */
tests.unit.ui.add( new Ext.test.Suite( {
	               
    name: 'Container',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	
	// Tests
	
	
	items : [
	
		/*
		 * Test initComponent()
		 */
		{
			name : "Test initComponent()",
			
			_should : {
				error : {
					"initComponent() should throw an error if the 'acceptType' config does not resolve to a class" :
						"'acceptType' config did not resolve to a constructor function"
				}
			},
			
			"initComponent() should throw an error if the 'acceptType' config does not resolve to a class" : function() {
				var container = new ui.Container( {
					acceptType : undefined
				} );
				
				Y.Assert.fail( "initComponent() should have thrown an error" );
			}
		},
		
		
		/*
		 * Test the adding and inserting of Components functionality
		 */
		{
			name : "Adding and inserting of Components functionality",
			
			"Adding a single component should return the component" : function() {
				// Test that 
				var container = new ui.Container();
				var component = container.add( new ui.Component( { id: "test1" } ) );
				Y.Assert.areEqual( "test1", component.getId(), "add() not returning the component. did not get correct id from getId()" );
			},
			
			
			"Adding a single component from a config object should return the instantiated component" : function() {
				var container = new ui.Container();
				var component = container.add( { id: "test2" } );
				Y.Assert.isInstanceOf( ui.Component, component, "add() not returning the instantiated component from a config object" );
			},
			
			
			"Adding multiple components with add() should return an array of instantiated components" : function() {
				var container = new ui.Container();
				var components = container.add( [
					{ id: "test1" },
					{ id: "test2" }
				] );
				Y.Assert.isArray( components, "add() did not return an array when adding an array of components" );
				Y.Assert.areEqual( "test1", components[ 0 ].getId(), "first component returned in array did not return proper id. possibly not being instantiated correctly" );
				Y.Assert.areEqual( "test2", components[ 1 ].getId(), "second component returned in array did not return proper id. possibly not being instantiated correctly" ); 
			},
			
			
			"Adding a component with a beforeadd handler that returns false (to cancel the add) should make add() return null" : function() {
				var container = new ui.Container( {
					listeners : {
						'beforeadd' : function() {
							return false;  // cancel the add
						}
					}
				} );
				var component = container.add( new ui.Component( { id: "test5" } ) );
				Y.Assert.isNull( component, "the component returned from add() should have been null with a beforeadd event handler that returns false" );
			},
			
			
			
			"Adding a child component should set the child component's parentContainer to the container when adding a component to be instantiated by config object" : function() {
				var container = new ui.Container();
				var component = container.add( { id: "test2" } );
				Y.Assert.areSame( container, component.getParentContainer(), "add() not setting the component's parentContainer correctly when instantiating a config object." );
			},
			
			
			"Adding a child component should set the child component's parentContainer to the container when adding a component that is already instantiated" : function() {
				var container = new ui.Container();
				var component = container.add( new ui.Component( { id: "test1" } ) );
				Y.Assert.areSame( container, component.getParentContainer(), "add() not setting the component's parentContainer correctly with already-instantiated child component." );
			},
			
			
			
			"The doLayout method should be run automatically after adding single child components (one at a time)" : function() {
				var doLayoutRuns = 0;
				var container = new ui.Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						ui.Container.prototype.onLayout.apply( this, arguments );
					}
				} );
				Y.Assert.areSame( 1, doLayoutRuns, "initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with single addition" );
				var component1 = container.add( new ui.Component( { id: "test1" } ) );
				Y.Assert.areSame( 2, doLayoutRuns, "add() not running doLayout once after single component add, or doLayout is being run too many times." );
				var component2 = container.add( new ui.Component( { id: "test2" } ) );
				Y.Assert.areSame( 3, doLayoutRuns, "add() not running doLayout once after second (but single) component add, or doLayout is being run too many times." );
				
				container.destroy();  // clean up DOM
			},
			
			
			
			"The doLayout method should be run automatically, and only once, after adding multiple child components with an array argument to add()" : function() {
				var doLayoutRuns = 0;
				var container = new ui.Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						ui.Container.prototype.onLayout.apply( this, arguments );
					}
				} );
				Y.Assert.areSame( 1, doLayoutRuns, "initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with multiple additions" );
				var componentArr1 = container.add( [
					new ui.Component( { id: "test1" } ),
					new ui.Component( { id: "test2" } ),
					new ui.Component( { id: "test3" } )
				] );
				Y.Assert.areSame( 2, doLayoutRuns, "add() not running doLayout after multiple component add, or doLayout is being run too many times (should only be run once)." );
				var componentArr2 = container.add( [
					new ui.Component( { id: "test4" } ),
					new ui.Component( { id: "test5" } )
				] );
				Y.Assert.areSame( 3, doLayoutRuns, "add() not running doLayout after multiple component add, or doLayout is being run too many times (should only be run once)." );
				container.destroy();  // clean up DOM
			},
			
			
			
			"The beforeadd event should be fired with an instantiated ui.Component object when adding a Component as an anonymous config object" : function() {
				var eventFired = false;
				var container = new ui.Container( {
					listeners : {
						'beforeadd' : function( container, component ) {
							eventFired = true;
							
							// Note: for some reason, Y.Assert.isInstanceOf() is screwing up the test harness. No idea why... Using a manual if statement and failure assertion instead
							if( !( component instanceof ui.Component ) ) {
								Y.Assert.fail( "The component provided to the beforeadd event handler should be an instantiated ui.Component (i.e. not the config object)" );
							}
						}
					}
				} );
				
				// Add a ui.Component as a config object
				container.add( { type: 'Component' } );
				
				// Make sure that the event was actually fired (i.e. the Assert in the handler actually ran)
				Y.Assert.isTrue( eventFired, "The beforeadd event should have fired." );
			}
		},
	
	
	
		/*
		 * Test the insert() method
		 */
		{
			name : "Test the insert() method",
			
			test_insert : function() {
				// Test that insert() returns an instantiated component when given a config object
				var container = new ui.Container();
				var component = container.insert( { id: 'myComponent' } );
				Y.Assert.areEqual( 'myComponent', component.getId(), "instantiated component not being returned from insert()" );
				
				// Test that insert() returns the instantiated component provided to it
				var container = new ui.Container();
				var component = new ui.Component( { id: 'myComponent' } );
				var returnedComponent = container.insert( component );
				Y.Assert.areEqual( component, returnedComponent, "insert() not returning the same instantiated component passed to it." ); 
				
				
				// -----------------------
				
				
				// Test inserting a Component with no initial parent Container
				var container = new ui.Container();
				var component = new ui.Component();
				
				Y.Assert.isNull( component.getParentContainer(), "Initial condition check failed. component's parentContainer should be null" );
				container.insert( component, 0 );
				Y.Assert.areEqual( container, component.getParentContainer(), "component should now have its parent set to container." );
				
				
				// -----------------------
				
				
				// Test moving a component that is already in the container
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					items : [ component1, component2, component3 ]
				} );
				
				Y.Assert.isTrue( Jux.areEqual( [ component1, component2, component3 ], container.getItems(), /*deep*/ false ), "initial assert" );
				
				// move component3 from the end to the beginning
				container.insert( component3, 0 );
				Y.Assert.isTrue( Jux.areEqual( [ component3, component1, component2 ], container.getItems(), /*deep*/ false ), "new ordering is incorrect. component3 should have been moved to the first slot" );
				Y.Assert.areEqual( container, component3.getParentContainer(), "error: component3 no longer has the container as its parent, when it originally started in that container." ); 
				
				// move component1 from the middle to the end
				container.insert( component1, 2 );
				Y.Assert.isTrue( Jux.areEqual( [ component3, component2, component1 ], container.getItems(), /*deep*/ false ), "new ordering is incorrect. component1 should have been moved to last slot" );
				Y.Assert.areEqual( container, component1.getParentContainer(), "error: component1 no longer has the container as its parent, when it originally started in that container." ); 
				
				// move component2 from the middle to the beginning
				container.insert( component2, 0 );
				Y.Assert.isTrue( Jux.areEqual( [ component2, component3, component1 ], container.getItems(), /*deep*/ false ), "new ordering is incorrect. component2 should have been moved to first slot" );
				Y.Assert.areEqual( container, component2.getParentContainer(), "error: component2 no longer has the container as its parent, when it originally started in that container." ); 
				
				// move component2 from the beginning to the end
				container.insert( component2, 2 );
				Y.Assert.isTrue( Jux.areEqual( [ component3, component1, component2 ], container.getItems(), /*deep*/ false ), "new ordering is incorrect. component2 should have been moved to last slot" );
				Y.Assert.areEqual( container, component2.getParentContainer(), "error: component2 no longer has the container as its parent, when it originally started in that container." ); 
				
				
				// -----------------------
				
				
				// Test that moving a Component within the Container fires the 'reorder' event, and not the 'add' event
				var addEventFired = false, reorderEventFired = false, reorderIndex = -1, previousReorderIndex = -1;
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					renderTo : document.body,
					items : [ component1, component2, component3 ]
				} );
				
				// Note: Must create 'add' listener after the Container has been instantiated, as otherwise it would get fired from adding the initial components
				container.addListener( {
					'add' : function() {
						addEventFired = true;
					},
					'reorder' : function( container, component, index, previousIndex ) {
						reorderEventFired = true;
						reorderIndex = index;
						previousReorderIndex = previousIndex;
					}
				} );
				
				container.insert( component2, 0 );  // reorder the component
				Y.Assert.isFalse( addEventFired, "The 'add' event should not have been fired when moving a Component within the same Container." );
				Y.Assert.isTrue( reorderEventFired, "The 'reorder' event should have been fired when moving a Component within the same Container." );
				
				// Check the indexes given by the event
				Y.Assert.areSame( 0, reorderIndex, "The index given by the 'reorder' event should have been 0, as the component was moved to the first position." );
				Y.Assert.areSame( 1, previousReorderIndex, "The \"previous\" index given by the 'reorder' event should have been 1, as the component was moved from the second position." );
				
				container.destroy();  // clean up DOM
				
				
				// -----------------------
				
				
				// Test moving a component into a new parent Container, when it started out in another Container
				var component = new ui.Component(); 
				var sourceContainer = new ui.Container( { items : component } );
				var destinationContainer = new ui.Container();
				
				Y.Assert.areEqual( sourceContainer, component.getParentContainer(), "initial condition failed. component should be under sourceContainer" );
				
				destinationContainer.insert( component, 0 );
				Y.Assert.areEqual( destinationContainer, component.getParentContainer(), "component's parentContainer reference was not set to the destinationContainer." );
				Y.Assert.isFalse( sourceContainer.has( component ), "error: sourceContainer should no longer have the component as a child" );
				Y.Assert.isTrue( destinationContainer.has( component ), "error: destinationContainer should now have the component as a child" );
				
				
				// -----------------------
				
				
				// Test the bounds checking when inserting a component at a position		
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container();
				
				container.insert( component1, -9999999 );
				Y.Assert.isTrue( Jux.areEqual( [ component1 ], container.getItems(), /*deep*/ false ), "new ordering is incorrect. component1 should have been inserted into the first slot with negative position arg" );
				
				container.insert( component2, -9999999 );
				Y.Assert.isTrue( Jux.areEqual( [ component2, component1 ], container.getItems(), /*deep*/ false ), "new ordering is incorrect. component2 should have been inserted into the first slot with negative position arg" );
				
				container.insert( component3, 9999999 );
				Y.Assert.isTrue( Jux.areEqual( [ component2, component1, component3 ], container.getItems(), /*deep*/ false ), "new ordering is incorrect. component3 should have been inserted into the 3rd slot with out of bounds positive position arg" );
				
				
				// Test inserting a component at a position one more than the number of items
				var component = new ui.Component();
				var container = new ui.Container();
				container.insert( component, 1 );
				Y.Assert.isTrue( Jux.areEqual( [ component ], container.getItems(), /*deep*/ false ), "component should have been inserted into the first slot with position arg one more than the number of items" );
				
				
				// -----------------------
				
				
				// Test to make sure that when "moving" a Component within a Container, that the Component is not destroyed, even if destroyRemoved config is true
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					destroyRemoved : true,
					
					items : [ component1, component2, component3 ]
				} );
				
				container.insert( component3, 0 );
				Y.Assert.isFalse( component3.destroyed, "error: component3 being destroyed when moved in its own container" );
				
				// Move a component from one container to another, and make sure that it is not destroyed 
				var destinationContainer = new ui.Container( {
					destroyRemoved : true
				} );
				destinationContainer.insert( component1, 0 );
				Y.Assert.isFalse( component1.destroyed, "error: component1 being destroyed when moved from one container to another" );
				
				
				// -----------------------
				
				
				// Test that adding a component with a beforeadd handler that returns false (to cancel the add) makes insert() return null
				var container = new ui.Container( {
					listeners : {
						'beforeadd' : function() {
							return false;  // cancel the add
						}
					}
				} );
				var component = container.insert( new ui.Component( { id: "test5" } ) );
				Y.Assert.isNull( component, "the component returned from add() should have been null with a beforeadd event handler that returns false" );
				
				
				// -----------------------
				
				
				// Test that the doLayout method is run automatically, but only once, after inserting single child components (one at a time)
				var doLayoutRuns = 0;
				var container = new ui.Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						ui.Container.prototype.onLayout.apply( this, arguments );
					}
				} );
				Y.Assert.areSame( 1, doLayoutRuns, "initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with single insertion" );
				var component = container.insert( new ui.Component( { id: "test1" } ) );
				Y.Assert.areSame( 2, doLayoutRuns, "insert() not running doLayout once after component insert, or doLayout is being run too many times." );
				var component = container.insert( new ui.Component( { id: "test2" } ) );
				Y.Assert.areSame( 3, doLayoutRuns, "insert() not running doLayout once after second component insert, or doLayout is being run too many times." );
				container.destroy();  // clean up DOM
			}
		},
		
		
		/*
		 * Test doInsert()
		 */
		{
			name : "Test doInsert()",
			
			
			_should : {
				error : {
					"doInsert() should throw an error if the 'acceptType' config is set, and the component added was not of this type" :
						"A Component added to the Container was not of the correct class type ('acceptType' config)"
				}
			},
			
			
			"doInsert() should throw an error if the 'acceptType' config is set, and the component added was not of this type" : function() {
				var ComponentSubType = ui.Component.extend( {} );
				
				var container = new ui.Container( {
					acceptType : ComponentSubType
				} );
				
				container.add( new ui.Component() );  // NOT a "ComponentSubType"
				Y.Assert.fail( "Test should have thrown an error" );
			},
			
			
			"doInsert should *not* throw an error if the 'acceptType' config is set, and the correct Component or Component subclass is added" : function() {
				var ComponentSubType = ui.Component.extend( {} ),
				    ComponentSubSubType = ComponentSubType.extend( {} );
				
				var container = new ui.Container( {
					acceptType : ComponentSubType
				} );
				
				container.add( new ComponentSubType() );
				container.add( new ComponentSubSubType() );
				
				// Test should simply not error
			}
			
		},
		
		
	
		/*
		 * Test the getItemAt() method
		 */
		{
			name : "Test the getItemAt() method",
			
			test_getItemAt : function() {
				// Test with a single component in the container
				var component = new ui.Component();
				var container = new ui.Container( {
					items : component
				} );
				Y.Assert.areSame( component, container.getItemAt( 0 ), "getItemAt() did not return correct index for component in a container with just the component." );
				Y.Assert.isNull( container.getItemAt( 1 ), "getItemAt() should have returned null for the item at index 1 for a container with one component." );
				Y.Assert.isNull( container.getItemAt( -1 ), "getItemAt() should have returned null for the item at index -1 for a container with one component." );
				Y.Assert.isNull( container.getItemAt( 999 ), "getItemAt() should have returned null for the item at index 999 for a container with one component." );
				
				
				
				// Test with multiple components in the container
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					items : [ component1, component2, component3 ]
				} );
				
				Y.Assert.areSame( component1, container.getItemAt( 0 ), "getItemAt() did not return component1 for index 0." );
				Y.Assert.areSame( component2, container.getItemAt( 1 ), "getItemAt() did not return component2 for index 1." );
				Y.Assert.areSame( component3, container.getItemAt( 2 ), "getItemAt() did not return component3 for index 2." );
				Y.Assert.isNull( container.getItemAt( 3 ), "getItemAt() should have returned null for the item at index 3 for a container with multiple components" ); 
				Y.Assert.isNull( container.getItemAt( -1 ), "getItemAt() should have returned null for the item at index -1 for a container with multiple components" ); 
				Y.Assert.isNull( container.getItemAt( 999 ), "getItemAt() should have returned null for the item at index 999 for a container with multiple components" );
			}
		},
	
		
	
		/*
		 * Test the getItemIndex() method
		 */
		{
			name : "Test the getItemIndex() method",
			
			test_getItemIndex : function() {
				// Test with a single component in the container
				var component = new ui.Component();
				var container = new ui.Container( {
					items : component
				} );
				Y.Assert.areSame( 0, container.getItemIndex( component ), "getItemIndex() did not return correct index for component." );
				
				
				// Test with multiple components in the container
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					items : [ component1, component2, component3 ]
				} );
				
				var randomComponent = new ui.Component();
				
				Y.Assert.areSame( 0, container.getItemIndex( component1 ), "getItemIndex() did not return correct index for component1." );
				Y.Assert.areSame( 1, container.getItemIndex( component2 ), "getItemIndex() did not return correct index for component2." );
				Y.Assert.areSame( 2, container.getItemIndex( component3 ), "getItemIndex() did not return correct index for component3." );
				Y.Assert.areSame( -1, container.getItemIndex( randomComponent ), "getItemIndex() should have returned -1 for randomComponent" ); 
			}
		},
	
		
		
		/*
		 * Test the has() method
		 */
		{
			name : "Test the has() method",
			
	
			test_has : function() {
				// Test a Component in the Container
				var component = new ui.Component();
				var container = new ui.Container( {
					items : component
				} );
				Y.Assert.isTrue( container.has( component ), "has() method returning false when checking if container has component. should return true" );
				
				// Test a Component that isn't attached to any Container
				var component = new ui.Component();
				var container = new ui.Container();
				Y.Assert.isFalse( container.has( component ), "has() method returning true when checking if container has a component that is not attached to any container" );
				
				// Test a Component that belongs to another Container
				var component1 = new ui.Component();
				var container1 = new ui.Container( { items: component1 } );
				
				var component2 = new ui.Component();
				var container2 = new ui.Container( { items : component2 } );
				Y.Assert.isFalse( container1.has( component2 ), "has() method returning true when checking if container has another container's component" );
				
				
				// Test the has method with no arguments, falsy arguments, and primitive arguments. All should return false.
				Y.Assert.isFalse( container.has(), "has() should return false with undefined argument" );
				Y.Assert.isFalse( container.has( null ), "has() should return false with null argument" );
				Y.Assert.isFalse( container.has( 0 ), "has() should return false with the number 0 as its argument" );
				Y.Assert.isFalse( container.has( 1 ), "has() should return false with the number 1 as its argument" );
				Y.Assert.isFalse( container.has( "" ), "has() should return false with an empty string as its argument" );
				Y.Assert.isFalse( container.has( "testing" ), "has() should return false with a string as its argument" );
			}
		},
		
		
		
		/*
		 * Test the remove() method
		 */
		{
			name : "Test the remove() method",
			
			test_remove : function() {
				// Test removing a single item at a time
				var container = new ui.Container( {
					items : [ { id : "c1" }, { id: "c2" }, { id: "c3" }, { id: "c3" } ]
				} );
				var childCmps = container.getItems();
				var c1 = childCmps[ 0 ], c2 = childCmps[ 1 ], c3 = childCmps[ 2 ], c4 = childCmps[ 3 ];
				
				container.remove( c2 );
				Y.Assert.isTrue( Jux.areEqual( [ c1, c3, c4 ], container.getItems(), /*deep*/ false ), "2nd component not removed correctly when removing single item" );
				
				container.remove( c4 );
				Y.Assert.isTrue( Jux.areEqual( [ c1, c3 ], container.getItems(), /*deep*/ false ), "last component not removed correctly when removing single item" );
				
				container.remove( c1 );
				Y.Assert.isTrue( Jux.areEqual( [ c3 ], container.getItems(), /*deep*/ false ), "first component not removed correctly when removing single item" );
				
				container.remove( c3 );
				Y.Assert.isTrue( Jux.areEqual( [], container.getItems(), /*deep*/ false ), "last component left not removed correctly when removing single item" );
				
				
				// Test removing multiple items
				var container = new ui.Container( {
					items : [ { id : "c1" }, { id: "c2" }, { id: "c3" }, { id: "c3" } ]
				} );
				var childCmps = container.getItems();
				var c1 = childCmps[ 0 ], c2 = childCmps[ 1 ], c3 = childCmps[ 2 ], c4 = childCmps[ 3 ];
				
				container.remove( [ c1, c3 ] );
				Y.Assert.isTrue( Jux.areEqual( [ c2, c4 ], container.getItems(), /*deep*/ false ), "multiple components not removed correctly" );
				
				
				// Test that a component being removed has been destroyed when destroyRemoved config is true (the default)
				var container = new ui.Container( {
					items : [ { id : "c1" } ]
				} );
				var childCmps = container.getItems();
				var c1 = childCmps[ 0 ];
				
				container.remove( c1 );
				Y.Assert.isTrue( c1.destroyed, "component not destroyed when removed from container with default destroyRemoved config" );
				
				
				// Test that a component is not destroyed when destroyRemoved config is false
				var container = new ui.Container( {
					destroyRemoved : false,
					items : [ { id : "c1" } ]
				} );
				var childCmps = container.getItems();
				var c1 = childCmps[ 0 ];
				
				container.remove( c1 );
				Y.Assert.isFalse( c1.destroyed, "component destroyed when removed from container with destroyRemoved config set to false (should not have been destroyed)" );
				
				
				// Test that a component is not destroyed when destroyRemove argument is false, but destroyRemoved config is true
				var container = new ui.Container( {
					destroyRemoved : true,
					items : [ { id : "c1" } ]
				} );
				var childCmps = container.getItems();
				var c1 = childCmps[ 0 ];
				
				container.remove( c1, false );
				Y.Assert.isFalse( c1.destroyed, "component destroyed when removed from container with destroyRemoved *argument* set to false (should not have been destroyed)" );
				
						
				// Test that a component that is not destroyed has its element removed from the Container's main div element
				var $el = jQuery( '<div style="display: none;"></div>' ).appendTo( document.body );
				var container = new ui.Container( {
					renderTo: $el,  // render the Container, so that its child items get rendered
					
					destroyRemoved : false,    // don't destroy removed Components; we are testing that the removed child component's element is detached.
					items : [ { id : "c1" } ]
				} );
				var childCmps = container.getItems();
				var c1 = childCmps[ 0 ];
				
				container.remove( c1 );
				var $containerEl = container.getEl();
				Y.Assert.isFalse( $containerEl.has( c1.getEl() ).length > 0, "component's element is not being removed from the container when not being destroyed" );
				
				container.destroy();  // clean up DOM
				$el.remove();
				
				
				// Test that trying to remove a Component that does *not* exist in the Container is *not* destroyed
				var cmp = new ui.Component( { id : 'c1' } );
				var container = new ui.Container( {
					destroyRemoved : true
					// items : cmp  -- Not in the container!
				} );
				container.remove( cmp );
				Y.Assert.isFalse( cmp.destroyed, "a Component that was 'removed' from a container that it did not exist in was still destroyed!" );
				
				
				// -----------------------
						
				
				// Test for a beforeremove handler returning false, to cancel the removal of a component
				var container = new ui.Container( {
					items : [ { id : "c1" } ],
					listeners : {
						'beforeremove' : function() {
							return false;  // cancel removal
						}
					}
				} );
				var childCmps = container.getItems();
				var c1 = childCmps[ 0 ];
				
				container.remove( c1, false );
				Y.Assert.areEqual( 1, container.getItems().length, "component being removed from container even though a beforeremove event handler is returning false." ); 
				Y.Assert.isTrue( container.has( c1 ), "component being removed from container even though a beforeremove event handler is returning false. container does not have component" );
				
				
				// Test that a beforeremove event handler canceled the removal (by returning false), and that the remove() method returned null in this case
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					items : [ component1, component2 ],  // only putting component1 and component2 in here
					
					listeners : {
						'beforeremove' : function() {
							return false;
						}
					}
				} );
				
				var removedComponent = container.remove( component1 );
				Y.Assert.isTrue( container.has( component1 ), "container should still have component1, with a beforeremove handler returning false" );
				Y.Assert.isNull( removedComponent, "removedComponent should be null, because a beforeremove handler canceled removal" );
				
				
				// -----------------------
				
				
				// Test to make sure the method returns a reference to the removed Component only when the requested component to be removed was actually in the container, and removed from it
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					items : [ component1, component2 ]  // only putting component1 and component2 in here
				} );
				
				var removedComponent = container.remove( component1 );
				Y.Assert.areSame( component1, removedComponent, "remove() did not properly return the component it removed (component1)" ); 
				
				var removedComponent = container.remove( component3 );  // attempt to remove a component that doesn't exist in the container
				Y.Assert.isNull( removedComponent, "remove() should have returned null when attempting to remove a component that wasn't under the container" );
				
				
				// Test that an array of removed components are returned when an array of components to remove is provided
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					items : [ component1, component2, component3 ]
				} );
				
				var removedComponents = container.remove( [ component1, component2 ] );
				Y.Assert.isTrue( Jux.areEqual( [ component1, component2 ], removedComponents ), "The removed components returned by remove() does not reflect the ones actually removed." );
				
				
				// Test that removing multiple components that aren't in the container returns an empty array
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					items : [ component1 ]  // only component1 goes in
				} );
				
				var removedComponents = container.remove( [ component2, component3 ] );
				Y.Assert.isTrue( Jux.areEqual( [], removedComponents ), "remove() should have returned an empty array for trying to remove components that weren't in the container" );
				
				
				// Test that removing more components than were in the container only returns an array of the components removed from the container
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					items : [ component1, component2 ]  // only component1 goes in
				} );
				
				var removedComponents = container.remove( [ component1, component2, component3 ] );
				Y.Assert.isTrue( Jux.areEqual( [ component1, component2 ], removedComponents ), "remove() should have returned only the two components that were actually in the container" );
				
				
				
				// -----------------------
				
				
				// Test that the doLayout method is run automatically after removing a single child components (one at a time)
				var doLayoutRuns = 0;
				var cmp1 = new ui.Component(), 
				    cmp2 = new ui.Component();
					
				var container = new ui.Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						ui.Container.prototype.onLayout.apply( this, arguments );
					},
					items : [ cmp1, cmp2 ]
				} );
				Y.Assert.areSame( 1, doLayoutRuns, "initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with single removals" );
				var component = container.remove( cmp1 );
				Y.Assert.areSame( 2, doLayoutRuns, "remove() not running doLayout once after single component removal, or doLayout is being run too many times." );
				var component = container.add( cmp2 );
				Y.Assert.areSame( 3, doLayoutRuns, "remove() not running doLayout once after second (but single) component removal, or doLayout is being run too many times." );
				container.destroy();  // clean up DOM
				
				
				// Test that the doLayout method is run automatically, and only once, after adding multiple child components with an array argument to add()
				var doLayoutRuns = 0;
				var cmp1 = new ui.Component(), 
				    cmp2 = new ui.Component(), 
				    cmp3 = new ui.Component(), 
				    cmp4 = new ui.Component(), 
				    cmp5 = new ui.Component();
					
				var container = new ui.Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						ui.Container.prototype.onLayout.apply( this, arguments );
					},
					items : [ cmp1, cmp2, cmp3, cmp4, cmp5 ]
				} );
				Y.Assert.areSame( 1, doLayoutRuns, "initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with multiple removals" );
				var component = container.remove( [ cmp1, cmp2, cmp3 ] );
				Y.Assert.areSame( 2, doLayoutRuns, "remove() not running doLayout after multiple component removal, or doLayout is being run too many times (should only be run once)." );
				var component = container.remove( [ cmp4, cmp5 ] );
				Y.Assert.areSame( 3, doLayoutRuns, "remove() not running doLayout after multiple component removal, or doLayout is being run too many times (should only be run once)." );
				container.destroy();  // clean up DOM
				
				
				// Test that the Component's parentContainer reference is set back to null after removal
				var cmp1 = new ui.Component();
				var container = new ui.Container( { items : cmp1 } );
				Y.Assert.areSame( container, cmp1.getParentContainer(), "initial condition: the component should have the container as its parent container" );
				container.remove( cmp1 );
				Y.Assert.isNull( cmp1.getParentContainer(), "The parentContainer reference should have been set back to null on the component after removal from the container" );
			}
		},
	
		
		
		/*
		 * Test the removeAll() method
		 */
		{
			name : "Test the removeAll() method",
			
	
			test_removeAll : function() {
				var component1 = new ui.Component();
				var component2 = new ui.Component();
				var component3 = new ui.Component();
				var container = new ui.Container( {
					items : [ component1, component2, component3 ]
				} );
				
				Y.Assert.areSame( 3, container.getItems().length, "error on intial condition. container should have 3 child components" );
				container.removeAll();
				Y.Assert.areSame( 0, container.getItems().length, "removeAll() failed. container should now have 0 child components" );
				
				
				// -----------------------
				
				
				// Test that the doLayout method is run automatically, and only once, after removing all child components
				var doLayoutRuns = 0;
				var cmp1 = new ui.Component(), 
				    cmp2 = new ui.Component(), 
				    cmp3 = new ui.Component();
				
				var container = new ui.Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						ui.Container.prototype.onLayout.apply( this, arguments );
					},
					items : [ cmp1, cmp2, cmp3 ]
				} );
				Y.Assert.areSame( 1, doLayoutRuns, "initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with multiple removals" );
				var component = container.removeAll();
				Y.Assert.areSame( 2, doLayoutRuns, "remove() not running doLayout after all components have been removed, or doLayout is being run too many times (should only be run once)." );
				container.destroy();  // clean up DOM
			}
		},
	
	
	
		// ----------------------------------
	
		
		
		/*
		 * Test the doLayout() method
		 */
		{
			name : "Test the doLayout() method",
			
			test_doLayout : function() {
				// Test that the doLayout method is *not* run when the Container is not rendered
				var doLayoutRuns = 0;
				var container = new ui.Container( {
					// renderTo : document.body,  -- leaving this here as a reminder
					items : [
						new ui.Component()
					],
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						ui.Container.prototype.onLayout.apply( this, arguments );
					}
				} );
				Y.Assert.areSame( 0, doLayoutRuns, "doLayout should not have been run since the Container is not rendered" );
				
				
		
				// Test that the doLayout method is run when the Container *is* rendered
				var doLayoutRuns = 0;
				var container = new ui.Container( {
					renderTo : document.body,
					items : [
						new ui.Component()
					],
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						ui.Container.prototype.onLayout.apply( this, arguments );
					}
				} );
				Y.Assert.areSame( 1, doLayoutRuns, "doLayout should have been run once since the Container is rendered" );
				container.destroy();  // clean up DOM
			
				// -----------------------
				
				
				// TODO: Add more tests
				
				
			}
		},
	
		
		
		/*
		 * Test the getLayout() method
		 */
		{
			name : "Test the getLayout() method",
			
			test_getLayout : function() {
				// Test on a Container with no layout 
				var container = new ui.Container();
				var layout = container.getLayout();
				Y.Assert.isInstanceOf( ui.layout.ContainerLayout, layout, "A ContainerLayout should have been created on the fly from getLayout() on a Container with no layout" );
				
				// Test on a Container with a given string layout, that the layout was instantiated to the correct class, and returned
				var container = new ui.Container( { layout: 'columns' } );
				Y.Assert.isInstanceOf( ui.layout.ColumnsLayout, container.getLayout(), "A ColumnsLayout should have been returned from getLayout(), as that is what was configured for the Container (by its string type name)" );
				
				// Test on a Container with a given object layout, that the layout was instantiated to the correct class, and returned
				var container = new ui.Container( { layout: { type : 'columns' } } );
				Y.Assert.isInstanceOf( ui.layout.ColumnsLayout, container.getLayout(), "A ColumnsLayout should have been returned from getLayout(), as that is what was configured for the Container (by its type name in an object)" );
				
				// Test on a Container with a given instantiated layout
				var container = new ui.Container( { layout: new ui.layout.ColumnsLayout() } );
				Y.Assert.isInstanceOf( ui.layout.ColumnsLayout, container.getLayout(), "A ColumnsLayout should have been returned from getLayout(), as that is what was configured for the Container (by an instantiated layout)" );
			}
		},
	
		
		
		/*
		 * Test the setLayout() method
		 */
		{
			name : "Test the setLayout() method",
			
			_should : {
				error : {
					"setLayout() should throw an error if not provided an argument" : 
						"Invalid layout argument provided to setLayout. See method description in docs.",
					"setLayout() should throw an error if given a string that doesn't have an associated Layout class" :
						"layout type 'non-existent-layout' is not a registered layout type."
				}
			},
			
			"setLayout() should throw an error if not provided an argument" : function() {
				var container = new ui.Container();
				container.setLayout();
				
				Y.Assert.fail( "Setting a layout with no argument should have thrown an error." );
			},
			
			
			"setLayout() should throw an error if given a string that doesn't have an associated Layout class" : function() {
				var container = new ui.Container();
				container.setLayout( 'non-existent-layout' );
			
				Y.Assert.fail( "Setting a layout of 'non-existent-layout' should have thrown an error." );
			},
			
			
			"setLayout() should accept a layout's string name" : function() {
				var container = new ui.Container();
				container.setLayout( 'columns' );
				Y.Assert.isInstanceOf( ui.layout.ColumnsLayout, container.getLayout(), "Setting a layout with the string 'columns' should have created a ui.layout.ColumnsLayout" );
				Y.Assert.areEqual( container, container.getLayout().getContainer(), "The layout's Container reference was not set to the Container when instantiated by its string type" );
			},
			
			
			"setLayout() should default an anonymous object provided to it with no 'type' property to a ContainerLayout" : function() {
				var container = new ui.Container();
				container.setLayout( {} );
				
				Y.Assert.isInstanceOf( ui.layout.ContainerLayout, container.getLayout(), "Setting a layout with an empty object should have created a ui.layout.ContainerLayout" );
				Y.Assert.areEqual( container, container.getLayout().getContainer(), "The layout's Container reference was not set to the Container when instantiated by an object without a 'type' property" );
			},
			
			
			"setLayout() should accept custom properties on an anonymous object with no 'type' property, by providing them to the ContainerLayout" : function() {
				var container = new ui.Container();
				container.setLayout( { customProp: 1 } );   // test with a custom property, to make sure it gets applied
				
				Y.Assert.isInstanceOf( ui.layout.ContainerLayout, container.getLayout(), "Setting a layout with an object with no type property should have created a ui.layout.ContainerLayout" );
				Y.Assert.areSame( container.getLayout().customProp, 1, "setLayout() didn't seem to create the Layout with the config object (customProp wasn't applied)" );
				Y.Assert.areEqual( container, container.getLayout().getContainer(), "The layout's Container reference was not set to the Container when instantiated by an object without a 'type' property, and with a custom property" );
			},
			
			
			"setLayout() should set the correct layout type with an anonymous object argument that has a 'type' property" : function() {
				var container = new ui.Container();
				container.setLayout( { type : 'Columns' } );
				
				Y.Assert.isInstanceOf( ui.layout.ColumnsLayout, container.getLayout(), "Setting a layout with an object with type 'Columns' should have created a ui.layout.ColumnsLayout" );
				Y.Assert.areEqual( container, container.getLayout().getContainer(), "The layout's Container reference was not set to the Container when instantiated by an object with a 'type' property" );
			},
			
			
			"setLayout() should set the correct layout type with an anonymous object argument that has a 'type' property, and set any custom properties to it as well" : function() {
				var container = new ui.Container();
				container.setLayout( { type : 'Columns', customProp: 1 } );   // test with a custom property, to make sure it gets applied
				
				Y.Assert.isInstanceOf( ui.layout.ColumnsLayout, container.getLayout(), "Setting a layout with an object with type 'Columns' should have created a ui.layout.ColumnsLayout (with a custom property)" );
				Y.Assert.areSame( container.getLayout().customProp, 1, "setLayout() didn't seem to create the Layout with the config object (customProp wasn't applied)" );
				Y.Assert.areEqual( container, container.getLayout().getContainer(), "The layout's Container reference was not set to the Container when instantiated by an object with a 'type' property, and with a custom property" );
			},
			
			
			"setLayout() should set a layout that is provided to it if it is already an instantiated ui.layout.Layout subclass" : function() {
				var container = new ui.Container();
				var myLayout = new ui.layout.ColumnsLayout();
				container.setLayout( myLayout );
				
				Y.Assert.areEqual( myLayout, container.getLayout(), "Setting an instantiated layout and getting it with getLayout() should have returned the same object." );
				Y.Assert.areEqual( container, myLayout.getContainer(), "myLayout's Container reference was not set to the Container when given an instantiated Layout." );
			},
			
			
			"setLayout(), when provided a *new* layout, should destroy the old one" : function() {
				var container = new ui.Container();
				
				var layout1 = JsMockito.mock( ui.layout.Layout.extend( {} ) ),
				    layout2 = JsMockito.mock( ui.layout.Layout.extend( {} ) );
				
				
				container.setLayout( layout1 );
				
				try {
					JsMockito.verify( layout1 ).setContainer( container );
				} catch( e1 ) {
					Y.Assert.fail( typeof e1 === 'object' ? e1.message : e1 );  // `e1` will be a string if coming from JsMockito, otherwise an Error object
				}
				
				
				container.setLayout( layout2 );
				
				try {
					JsMockito.verify( layout1 ).destroy();
					
					JsMockito.verify( layout2 ).setContainer( container );
				} catch( e2 ) {
					Y.Assert.fail( typeof e2 === 'object' ? e2.message : e2 );  // `e2` will be a string if coming from JsMockito, otherwise an Error object
				}
			},
			
			
			"setLayout() should detach all of its child components when setting a new layout, so that they can be re-laid out by the new layout" : function() {
				var container = new ui.Container(),
				    cmp1 = JsMockito.mock( ui.Component ),
				    cmp2 = JsMockito.mock( ui.Component ),
				    layout1 = JsMockito.mock( ui.layout.Layout.extend( {} ) ),
				    layout2 = JsMockito.mock( ui.layout.Layout.extend( {} ) );
				
				container.setLayout( layout1 );
				container.add( [ cmp1, cmp2 ] );
				
				// Now set to the new layout. The components should be detached.
				container.setLayout( layout2 );
				try {
					JsMockito.verify( cmp1 ).detach();
					JsMockito.verify( cmp2 ).detach();
					
				} catch( e ) {
					Y.Assert.fail( typeof e === 'object' ? e.message : e );  // `e` will be a string if coming from JsMockito, otherwise an Error object
				}
			}
		},
	
		
		// ----------------------------------
		
	
		
		/*
		 * Test the setData() method
		 */
		{
			name : "Test the setData() method",
			
	
			test_setData : function() {
				var TestDataControl = Jux.extend( ui.Component, {
					mixins : [ ui.DataControl ],
					setData : function( data ) { this.data = data; },
					getData : function() { return this.data; } 
				} );
				
				// Test that all classes that have the mixin ui.DataControl are set to the data in the data object
				var container = new ui.Container( {
					items : [
						new TestDataControl( { key : "key1" } ),
						new TestDataControl( { key : "key2" } ),
						new TestDataControl( { key : "key3" } ),
						{
							id: 'someContainer',
							items : [
								new TestDataControl( { key : "key4" } ),
								new TestDataControl( { data : 42 } ),  // No key on this one!!!
								{
									id: 'someNestedContainer',
									items : new TestDataControl( { key : "key5" } )
								}
							]
						}
					]
				} );
				
				var dataObj = { key1: 1, key2: 2, key3: 3, key4: 4, key5: 5 };
				container.setData( dataObj );
				Y.Assert.isTrue( Jux.areEqual( dataObj, container.getData() ), "The data retrieved from the container does not match the expected data" );
				
				
				
				// Test with DataControl's nested within other DataControl's.  The getData() routine should NOT "reach" into DataControl's
				// that happen to be ui.Container's. A DataControl should know how to return its data, regardless of what Components it is 
				// composed of. This logic is so that more complex Components can be created through the composition of Containers, without the "inner"
				// DataControl components being retrieved directly.
				var TestDataContainer = Jux.extend( ui.Container, {
					mixins : [ ui.DataControl ],
					setData : function( data ) { this.data = data; },
					getData : function() { return this.data; } 
				} );
				
				
				// Create the components that will be nested under a TestDataContainer (and should not be affected by the setData call).
				// We'll need this to check the components' data after the test (since we have no way of gaining a reference to them, now that 
				// ui.Container::findByKey() does not "reach" inside parent DataControls for children. 
				var nestedDataControls = [];
				for( var i = 0; i < 4; i++ ) {
					nestedDataControls.push( new TestDataControl( { key : 'nestedKey' + (i+1), data: -1 } ) ); 
				}
				
				
				var container = new ui.Container( {
					items : [
						new TestDataControl( { key : "key1" } ),
						new TestDataControl( { key : "key2" } ),
						new TestDataControl( { key : "key3" } ),
						{
							id: 'someContainer',
							items : [
								new TestDataControl( { key : "key4" } ),
								new TestDataControl( { data : 42 } ),  // No key on this one!!!
								{
									id: 'someNestedContainer',
									items : new TestDataControl( { key : "key5" } )
								}
							]
						},
						
						
						// A couple of DataControl Containers with nested DataControl Components. The nested DataControl Components should not be retrieved!
						new TestDataContainer( {
							key : 'key6',
							items : [
								nestedDataControls[ 0 ],
								nestedDataControls[ 1 ]
							]
						} ),
						
						new TestDataContainer( {
							key : 'key7',
							items : [
								nestedDataControls[ 2 ],
								nestedDataControls[ 3 ]
							]
						} )
					]
				} );
				
				// Set the data, including keys that shouldn't be set by the setData() method (because they are nested in a DataControl Container. setData() shouldn't
				// "reach" into the DataControl Container)
				var dataObj = { key1: 1, key2: 2, key3: 3, key4: 4, key5: 5, key6: 6, key7: 7, nestedKey1 : 1, nestedKey2: 2, nestedKey3: 3, nestedKey4: 4 };
				container.setData( dataObj );
				
				// Check using getData()
				var expectedData = { key1: 1, key2: 2, key3: 3, key4: 4, key5: 5, key6: 6, key7: 7 };
				Y.Assert.isTrue( Jux.areEqual( expectedData, container.getData() ), "The data retrieved from the container does not match the expected data" );
				
				// Check the nested data components directly. They should not have a new data value set.
				for( var i = 0, len = nestedDataControls.length; i < len; i++ ) {
					Y.Assert.areSame( -1, nestedDataControls[ i ].getData(), "nestedKey" + (i+1) + " should not have been set to a new value by the setData() call" );
				}
			}
		},
	
		
		
		/*
		 * Test the getData() method
		 */
		{
			name : "Test the getData() method",
			
			test_getData : function() {
				var TestDataControl = Jux.extend( ui.Component, {
					mixins : [ ui.DataControl ],
					setData : function( data ) { this.data = data; },
					getData : function() { return this.data; } 
				} );
				
				// Test that all classes that have the mixin ui.DataControl are collected into the return data object,
				// if they have a 'key' config
				var container = new ui.Container( {
					items : [
						new TestDataControl( { key : "key1", data : 1 } ),
						new TestDataControl( { key : "key2", data : 2 } ),
						new TestDataControl( { key : "key3", data : 3 } ),
						{
							id: 'someContainer',
							items : [
								new TestDataControl( { key : "key4", data : 4 } ),
								new TestDataControl( { data : 42 } ),  // No key on this one!!!
								{
									id: 'someNestedContainer',
									items : new TestDataControl( { key : "key5", data : 5 } )
								}
							]
						}
					]
				} );
				
				Y.Assert.isTrue( Jux.areEqual( { key1: 1, key2: 2, key3: 3, key4: 4, key5: 5 }, container.getData() ), "The data retrieved from the container does not match the expected data" );
				
				
				
				// Test with DataControl's nested within other DataControl's.  The getData() routine should NOT "reach" into DataControl's
				// that happen to be ui.Container's. A DataControl should know how to return its data, regardless of what Components it is 
				// composed of. This logic is so that more complex Components can be created through the composition of Containers, without the "inner"
				// DataControl components being retrieved directly.
				var TestDataContainer = Jux.extend( ui.Container, {
					mixins : [ ui.DataControl ],
					setData : function( data ) { this.data = data; },
					getData : function() { return this.data; } 
				} );
				
				var container = new ui.Container( {
					items : [
						new TestDataControl( { key : "key1", data : 1 } ),
						new TestDataControl( { key : "key2", data : 2 } ),
						new TestDataControl( { key : "key3", data : 3 } ),
						{
							id: 'someContainer',
							items : [
								new TestDataControl( { key : "key4", data : 4 } ),
								new TestDataControl( { data : 42 } ),  // No key on this one!!!
								{
									id: 'someNestedContainer',
									items : new TestDataControl( { key : "key5", data : 5 } )
								}
							]
						},
						
						
						// A couple of DataControl Containers with nested DataControl Components. The nested DataControl Components should not be retrieved!
						new TestDataContainer( {
							key : 'key6',
							data : 6,
							items : [
								new TestDataControl( { key : 'nestedKey1', data: 1 } ),
								new TestDataControl( { key : 'nestedKey2', data: 2 } )
							]
						} ),
						
						new TestDataContainer( {
							key : 'key7',
							data : 7,
							items : [
								new TestDataControl( { key : 'nestedKey3', data: 3 } ),
								new TestDataControl( { key : 'nestedKey4', data: 4 } )
							]
						} )
					]
				} );
				
				var expectedData = { key1: 1, key2: 2, key3: 3, key4: 4, key5: 5, key6: 6, key7: 7 };
				Y.Assert.isTrue( Jux.areEqual( expectedData, container.getData() ), "The data retrieved from the container does not match the expected data with nested DataControl Containers" );
				
			},
			
			
			/*
			 * Test ui.Container.getDataControls()
			 */
			test_getDataControls : function() {
				var TestDataControl = Jux.extend( ui.Component, {
					mixins : [ ui.DataControl ]
				} );
				
				var dataControls = [];
				dataControls[ 0 ] = new TestDataControl( { key : "key1", data : 1 } );
				dataControls[ 1 ] = new TestDataControl( { key : "key2", data : 2 } );
				dataControls[ 2 ] = new TestDataControl( { key : "key3", data : 3 } );
				dataControls[ 3 ] = new TestDataControl( { key : "key4", data : 4 } );
				dataControls[ 4 ] = new TestDataControl( { key : "key5", data : 5 } );
				dataControls[ 5 ] = new TestDataControl( { key : "key6", data : 6 } );
				
				// Test that all classes that have the mixin ui.DataControl are collected into the return data object,
				// if they have a 'key' config
				var container = new ui.Container( {
					items : [
						dataControls[ 0 ],
						dataControls[ 1 ],
						dataControls[ 2 ],
						{
							id: 'someContainer',
							items : [
								dataControls[ 3 ],
								dataControls[ 4 ],
								{
									id: 'someNestedContainer',
									items : dataControls[ 5 ]
								}
							]
						}
					]
				} );
				
				var retrievedDataControls = container.getDataControls();
				Y.Assert.areSame( dataControls.length, retrievedDataControls.length, "The number of DataControls retrieved from the container was not the same as the provided DataControls." ); 
				
				// Make sure the DataControls match
				for( var i = 0, len = dataControls.length; i < len; i++ ) {
					Y.Assert.areSame( dataControls[ i ], retrievedDataControls[ i ], "Retrieved DataControl " + i + " did not match the expected DataControl." );
				}
				
				
				// ----------------
				
				
				// Test with DataControl's nested within other DataControl's.  The getDataControls() routine should NOT "reach" into DataControl's
				// that happen to be ui.Container's. This logic is so that more complex Components can be created through the composition of Containers, without the "inner"
				// DataControl components being retrieved directly.
				var TestDataContainer = Jux.extend( ui.Container, {
					mixins : [ ui.DataControl ]
				} );
				
				var dataControls = [];
				dataControls[ 0 ] = new TestDataControl( { key : "key1", data : 1 } );
				dataControls[ 1 ] = new TestDataControl( { key : "key2", data : 2 } );
				dataControls[ 2 ] = new TestDataControl( { key : "key3", data : 3 } );
				dataControls[ 3 ] = new TestDataControl( { key : "key4", data : 4 } );
				dataControls[ 4 ] = new TestDataControl( { key : "key5", data : 5 } );
				dataControls[ 5 ] = new TestDataControl( { key : "key6", data : 6 } );
				dataControls[ 6 ] = new TestDataContainer( { 
					key : "key6", 
					data : 6,
					items : [
						new TestDataControl( { key : 'nestedKey1', data: 1 } ),
						new TestDataControl( { key : 'nestedKey2', data: 2 } )
					]
				} );
				dataControls[ 7 ] = new TestDataContainer( { 
					key : "key7", 
					data : 7,
					items : [
						new TestDataControl( { key : 'nestedKey3', data: 3 } ),
						new TestDataControl( { key : 'nestedKey4', data: 4 } )
					]
				} );
				
				
				var container = new ui.Container( {
					items : [
						dataControls[ 0 ],
						dataControls[ 1 ],
						dataControls[ 2 ],
						{
							id: 'someContainer',
							items : [
								dataControls[ 3 ],
								dataControls[ 4 ],
								{
									id: 'someNestedContainer',
									items : dataControls[ 5 ]
								}
							]
						},
						
						
						// A couple of DataControl Containers with nested DataControl Components. The nested DataControl Components should not be retrieved!
						dataControls[ 6 ],  // a TestDataContainer
						dataControls[ 7 ]   // a TestDataContainer
					]
				} );
				
				
				var retrievedDataControls = container.getDataControls();
				Y.Assert.areSame( dataControls.length, retrievedDataControls.length, "The number of DataControls retrieved from the container was not the same as the provided DataControls when testing with DataControl Containers." ); 
				
				// Make sure the DataControls match
				for( var i = 0, len = dataControls.length; i < len; i++ ) {
					Y.Assert.areSame( dataControls[ i ], retrievedDataControls[ i ], "Retrieved DataControl " + i + " did not match the expected DataControl when testing with DataControl Containers." );
				}
			}
		},
	
	
	
		// ----------------------------------
	
	
		
		/*
		 * Test the cascade() method
		 */
		{
			name : "Test the cascade() method",
			
			
			test_cascade : function() {
				// Test with one level of children, one item
				var container = new ui.Container( {
					items: [
						{
							type : 'Text',
							key  : 'myKey'
						}
					]
				} );
				
				// TODO
			}
		},
	
	
		
		/*
		 * Test the findById() method
		 */
		{
			name : "Test the findById() method",
			
	
			test_findById : function() {
				var container = new ui.Container( {
					id: 'top',
					
					items: [
						{ 
							type  : 'Container', 
							id    : 'first',
							
							items : [
								{ type : 'Text', key : 'myKey1' }
							]
						},
						
						{ type : 'Text', key : 'myKey2' },
						
						{
							type  : 'Container',
							id    : 'second',
							
							items : [
								{ type : 'Text', key : 'myKey3' },
								{ type : 'Text', key : 'myKey4' },
								{
									type  : 'Container',
									id    : 'second_nested',
									
									items : [
										{ type : 'Text', key : 'myKey5' },
										{ type : 'Text', key : 'myKey6' },
										{ type : 'Text', key : 'myKey7' }
									]
								}
							]
						}
					]
				} );
				
				var first = container.findById( 'first' );
				Y.Assert.areEqual( "first", first.getId(), "Component 'first' not found by id." );
				
				var second = container.findById( 'second' );
				Y.Assert.areEqual( "second", second.getId(), "Component 'second' not found by id." );
				
				var second_nested = container.findById( 'second_nested' );
				Y.Assert.areEqual( "second_nested", second_nested.getId(), "Component 'second_nested' not found by id." );
				
				var nonExistent = container.findById( 'non-existent' );
				Y.Assert.isNull( nonExistent, "Component with id of 'non-existent' was somehow found (i.e. not null), even though it doesn't exist." );
			}
		},
			
	
	
		/*
		 * Test the findByKey() method
		 */
		{
			name : "Test the findByKey() method",
			
			test_findByKey : function() {
				// Test with one level of children, one item
				var container = new ui.Container( {
					items: [
						{
							type : 'Text',
							key  : 'myKey'
						}
					]
				} );
				
				var cmp = container.findByKey( 'myKey' );
				Y.Assert.isObject( cmp, "Component not retrieved at first level with one child." );
				Y.Assert.areEqual( 'myKey', cmp.getKey(), "myKey not retrieved from found container at first level with one item." );
				
				// Quick test to make sure that searching for a key that doesn't exist returns null
				var cmp = container.findByKey( 'non-existent' );
				Y.Assert.isNull( cmp, "Container returned a non-null value when searching for a non-existent key" );
				
				
				
				// Test with one level of children, multiple items
				var container = new ui.Container( {
					items: [
						{ type : 'Text', key : 'myKey1' },
						{ type : 'Text', key : 'myKey2' },
						{ type : 'Text', key : 'myKey3' },
						{ type : 'Text', key : 'myKey4' }
					]
				} );
				
				// Test them all, to make sure the first, the middle ones, and the last one can be retrieved
				for( var i = 1; i <= 4; i++ ) {
					var cmp = container.findByKey( 'myKey' + i );
					Y.Assert.areEqual( 'myKey' + i, cmp.getKey(), "myKey" + i + " not retrieved from found container at first level with multiple items." );
				}
				
				
				
				// Test with multiple levels of children, multiple items
				var container = new ui.Container( {
					items: [
						{ 
							type  : 'Container', 
							items : [
								{ type : 'Text', key : 'myKey1' }
							]
						},
						
						{ type : 'Text', key : 'myKey2' },
						
						{
							type  : 'Container',
							items : [
								{ type : 'Text', key : 'myKey3' },
								{ type : 'Text', key : 'myKey4' },
								{
									type  : 'Container',
									items : [
										{ type : 'Text', key : 'myKey5' },
										{ type : 'Text', key : 'myKey6' },
										{ type : 'Text', key : 'myKey7' }
									]
								}
							]
						}
					]
				} );
				
				// Test them all, to make sure that they can be retrieved at any level
				for( var i = 1; i <= 7; i++ ) {
					var cmp = container.findByKey( 'myKey' + i );
					Y.Assert.areEqual( 'myKey' + i, cmp.getKey(), "myKey" + i + " not retrieved from found container at first level with multiple items." );
				}
				
				
				// --------------------------------
				
				
				// Test that the findByKey() method does not "reach" into DataControls and retrieve "inner" DataControls that belong to an "outer" DataControl.
				// The "inner" DataControls are under the control of the "outer" DataControl, and should not be externally accessible.
				var TestDataContainer = Jux.extend( ui.Container, {
					mixins : [ ui.DataControl ],
					setData : function( data ) { this.data = data; },
					getData : function() { return this.data; } 
				} );
				
				var TestDataControl = Jux.extend( ui.Component, {
					mixins : [ ui.DataControl ],
					setData : function( data ) { this.data = data; },
					getData : function() { return this.data; } 
				} );
				
				var container = new ui.Container( {
					items : [
						// A couple of DataControl Containers with nested DataControl Components. The nested DataControl Components should not be retrieved!
						new TestDataContainer( {
							key : 'key1',
							items : [
								new TestDataControl( { key : 'nestedKey1', data: -1 } ),
								new TestDataControl( { key : 'nestedKey2', data: -1 } )
							]
						} ),
						
						new TestDataContainer( {
							key : 'key2',
							items : [
								new TestDataControl( { key : 'nestedKey3', data: -1 } ),
								new TestDataControl( { key : 'nestedKey4', data: -1 } )
							]
						} ),
						
						new TestDataControl( { key : 'key3', data: -1 } )
					]
				} );
				
				// Initial tests, make sure key1, key2, and key3 are accessible
				Y.Assert.isInstanceOf( TestDataContainer, container.findByKey( 'key1' ), "key1 should have been found" );
				Y.Assert.isInstanceOf( TestDataContainer, container.findByKey( 'key2' ), "key2 should have been found" );
				Y.Assert.isInstanceOf( TestDataControl, container.findByKey( 'key3' ), "key3 should have been found" );
				
				// Make sure none of the DataControls (TestDataControls) under a TestDataContainer are accessible
				for( var i = 1; i <= 4; i++ ) {
					Y.Assert.isNull( container.findByKey( 'nestedKey' + i ), "nestedKey" + i + " should not have been accessible with findByKey, because it is a child component of a DataControl (TestDataContainer in this case)" );
				}
			}
		},
	
	
		/*
		 * Test the findBy() method
		 */
		{
			name : "Test the findBy() method",
			
			test_findBy : function() {
				// TODO
			}
		}
	]
	
} ) );