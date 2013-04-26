/*global define, describe, beforeEach, afterEach, it, xit, expect, JsMockito */
define( [
	'jquery',
	'Class',
	'jqc/Component',
	'jqc/Container',
	'jqc/layout/Layout',
	'jqc/layout/Auto'
], function( jQuery, Class, Component, Container, Layout, AutoLayout ) {
	
	describe( 'jqc.Container', function() {
		
		describe( 'initComponent()', function() {
			
			it( "initComponent() should throw an error if the 'acceptType' config does not resolve to a class", function() {
				expect( function() {
					var container = new Container( {
						acceptType : undefined
					} );
				} ).toThrow( "'acceptType' config did not resolve to a constructor function" );
			} );
		} );
		
		
		/*
		 * Test the adding and inserting of Components functionality
		 */
		describe( "Adding and inserting of Components functionality", function() {
			
			it( "Adding a single component should return the component", function() {
				// Test that 
				var container = new Container();
				var component = container.add( new Component( { id: "test1" } ) );
				expect( component.getId() ).toEqual( "test1" );  // add() not returning the component. did not get correct id from getId()
			} );
			
			
			it( "Adding a single component from a config object should return the instantiated component", function() {
				var container = new Container();
				var component = container.add( { id: "test2" } );
				expect( component instanceof Component ).toBe( true );  // add() not returning the instantiated component from a config object
			} );
			
			
			it( "Adding multiple components with add() should return an array of instantiated components", function() {
				var container = new Container();
				var components = container.add( [
					{ id: "test1" },
					{ id: "test2" }
				] );
				expect( components.length ).toBe( 2 );
				expect( components[ 0 ].getId() ).toEqual( "test1" );  // first component returned in array did not return proper id. possibly not being instantiated correctly
				expect( components[ 1 ].getId() ).toEqual( "test2" );  // second component returned in array did not return proper id. possibly not being instantiated correctly 
			} );
			
			
			it( "Adding a component with a beforeadd handler that returns false (to cancel the add) should make add() return null", function() {
				var container = new Container( {
					listeners : {
						'beforeadd' : function() {
							return false;  // cancel the add
						}
					}
				} );
				var component = container.add( new Component( { id: "test5" } ) );
				expect( component ).toBe( null );  // the component returned from add() should have been null with a beforeadd event handler that returns false
			} );
			
			
			
			it( "Adding a child component should set the child component's parentContainer to the container when adding a component to be instantiated by config object", function() {
				var container = new Container();
				var component = container.add( { id: "test2" } );
				expect( component.getParentContainer() ).toBe( container );  // add() not setting the component's parentContainer correctly when instantiating a config object.
			} );
			
			
			it( "Adding a child component should set the child component's parentContainer to the container when adding a component that is already instantiated", function() {
				var container = new Container();
				var component = container.add( new Component( { id: "test1" } ) );
				expect( component.getParentContainer() ).toBe( container );  // add() not setting the component's parentContainer correctly with already-instantiated child component.
			} );
			
			
			
			it( "The doLayout method should be run automatically after adding single child components (one at a time)", function() {
				var doLayoutRuns = 0;
				var container = new Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						Container.prototype.onLayout.apply( this, arguments );
					}
				} );
				expect( doLayoutRuns ).toBe( 1 );  // initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with single addition
				var component1 = container.add( new Component( { id: "test1" } ) );
				expect( doLayoutRuns ).toBe( 2 );  // add() not running doLayout once after single component add, or doLayout is being run too many times.
				var component2 = container.add( new Component( { id: "test2" } ) );
				expect( doLayoutRuns ).toBe( 3 );  // add() not running doLayout once after second (but single) component add, or doLayout is being run too many times.
				
				container.destroy();  // clean up DOM
			} );
			
			
			
			it( "The doLayout method should be run automatically, and only once, after adding multiple child components with an array argument to add()", function() {
				var doLayoutRuns = 0;
				var container = new Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						Container.prototype.onLayout.apply( this, arguments );
					}
				} );
				expect( doLayoutRuns ).toBe( 1 );  // initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with multiple additions
				var componentArr1 = container.add( [
					new Component( { id: "test1" } ),
					new Component( { id: "test2" } ),
					new Component( { id: "test3" } )
				] );
				expect( doLayoutRuns ).toBe( 2 );  // add() not running doLayout after multiple component add, or doLayout is being run too many times (should only be run once).
				var componentArr2 = container.add( [
					new Component( { id: "test4" } ),
					new Component( { id: "test5" } )
				] );
				expect( doLayoutRuns ).toBe( 3 );  // add() not running doLayout after multiple component add, or doLayout is being run too many times (should only be run once).
				container.destroy();  // clean up DOM
			} );
			
			
			
			it( "The beforeadd event should be fired with an instantiated Component object when adding a Component as an anonymous config object", function() {
				var eventFired = false;
				var container = new Container( {
					listeners : {
						'beforeadd' : function( container, component ) {
							eventFired = true;
							
							expect( component instanceof Component ).toBe( true );  // component should be an instantiated jqc.Component, not a config object
						}
					}
				} );
				
				// Add a Component as a config object
				container.add( { type: 'Component' } );
				
				// Make sure that the event was actually fired (i.e. the Assert in the handler actually ran)
				expect( eventFired ).toBe( true );  // The beforeadd event should have fired.
			} );
		} );
	
	
	
		/*
		 * Test the insert() method
		 */
		describe( "Test the insert() method", function() {
			
			it( "insert", function() {
				// Test that insert() returns an instantiated component when given a config object
				var container = new Container();
				var component = container.insert( { id: 'myComponent' } );
				expect( component.getId() ).toEqual( 'myComponent' );  // instantiated component not being returned from insert()
				
				// Test that insert() returns the instantiated component provided to it
				container = new Container();
				component = new Component( { id: 'myComponent' } );
				var returnedComponent = container.insert( component );
				expect( returnedComponent ).toEqual( component );  // insert() not returning the same instantiated component passed to it. 
				
				
				// -----------------------
				
				
				// Test inserting a Component with no initial parent Container
				container = new Container();
				component = new Component();
				
				expect( component.getParentContainer() ).toBe( null );  // Initial condition check failed. component's parentContainer should be null
				container.insert( component, 0 );
				expect( component.getParentContainer() ).toEqual( container );  // component should now have its parent set to container.
				
				
				// -----------------------
				
				
				// Test moving a component that is already in the container
				var component1 = new Component( { id: 1 } );
				var component2 = new Component( { id: 2 } );
				var component3 = new Component( { id: 3 } );
				container = new Container( {
					items : [ component1, component2, component3 ]
				} );
				
				expect( [ component1, component2, component3 ] ).toEqual( container.getItems() );  // initial assert
				
				// move component3 from the end to the beginning
				container.insert( component3, 0 );
				expect( [ component3, component1, component2 ] ).toEqual( container.getItems() );  // new ordering is incorrect. component3 should have been moved to the first slot
				expect( component3.getParentContainer() ).toBe( container );  // error: component3 no longer has the container as its parent, when it originally started in that container. 
				
				// move component1 from the middle to the end
				container.insert( component1, 2 );
				expect( [ component3, component2, component1 ] ).toEqual( container.getItems() );  // new ordering is incorrect. component1 should have been moved to last slot
				expect( component1.getParentContainer() ).toBe( container );  // error: component1 no longer has the container as its parent, when it originally started in that container. 
				
				// move component2 from the middle to the beginning
				container.insert( component2, 0 );
				expect( [ component2, component3, component1 ] ).toEqual( container.getItems() );  // new ordering is incorrect. component2 should have been moved to first slot
				expect( component2.getParentContainer() ).toBe( container );  // error: component2 no longer has the container as its parent, when it originally started in that container. 
				
				// move component2 from the beginning to the end
				container.insert( component2, 2 );
				expect( [ component3, component1, component2 ] ).toEqual( container.getItems() );  // new ordering is incorrect. component2 should have been moved to last slot
				expect( component2.getParentContainer() ).toBe( container );  // error: component2 no longer has the container as its parent, when it originally started in that container. 
				
				
				// -----------------------
				
				
				// Test that moving a Component within the Container fires the 'reorder' event, and not the 'add' event
				var addEventFired = false, reorderEventFired = false, reorderIndex = -1, previousReorderIndex = -1;
				component1 = new Component();
				component2 = new Component();
				component3 = new Component();
				container = new Container( {
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
				expect( addEventFired ).toBe( false );  // The 'add' event should not have been fired when moving a Component within the same Container.
				expect( reorderEventFired ).toBe( true );  // The 'reorder' event should have been fired when moving a Component within the same Container.
				
				// Check the indexes given by the event
				expect( reorderIndex ).toBe( 0 );  // The index given by the 'reorder' event should have been 0, as the component was moved to the first position.
				expect( previousReorderIndex ).toBe( 1 );  // The \"previous\" index given by the 'reorder' event should have been 1, as the component was moved from the second position.
				
				container.destroy();  // clean up DOM
				
				
				// -----------------------
				
				
				// Test moving a component into a new parent Container, when it started out in another Container
				component = new Component(); 
				var sourceContainer = new Container( { items : component } );
				var destinationContainer = new Container();
				
				expect( component.getParentContainer() ).toEqual( sourceContainer );  // initial condition failed. component should be under sourceContainer
				
				destinationContainer.insert( component, 0 );
				expect( component.getParentContainer() ).toEqual( destinationContainer );  // component's parentContainer reference was not set to the destinationContainer.
				expect( sourceContainer.has( component ) ).toBe( false );  // error: sourceContainer should no longer have the component as a child
				expect( destinationContainer.has( component ) ).toBe( true );  // error: destinationContainer should now have the component as a child
				
				
				// -----------------------
				
				
				// Test the bounds checking when inserting a component at a position		
				component1 = new Component();
				component2 = new Component();
				component3 = new Component();
				container = new Container();
				
				container.insert( component1, -9999999 );
				expect( [ component1 ] ).toEqual( container.getItems() );  // new ordering is incorrect. component1 should have been inserted into the first slot with negative position arg
				
				container.insert( component2, -9999999 );
				expect( [ component2, component1 ] ).toEqual( container.getItems() );  // new ordering is incorrect. component2 should have been inserted into the first slot with negative position arg
				
				container.insert( component3, 9999999 );
				expect( [ component2, component1, component3 ] ).toEqual( container.getItems() );  // new ordering is incorrect. component3 should have been inserted into the 3rd slot with out of bounds positive position arg
				
				
				// Test inserting a component at a position one more than the number of items
				component = new Component();
				container = new Container();
				container.insert( component, 1 );
				expect( [ component ] ).toEqual( container.getItems() );  // component should have been inserted into the first slot with position arg one more than the number of items
				
				
				// -----------------------
				
				
				// Test to make sure that when "moving" a Component within a Container, that the Component is not destroyed, even if destroyRemoved config is true
				component1 = new Component();
				component2 = new Component();
				component3 = new Component();
				container = new Container( {
					destroyRemoved : true,
					
					items : [ component1, component2, component3 ]
				} );
				
				container.insert( component3, 0 );
				expect( component3.destroyed ).toBe( false );  // error: component3 being destroyed when moved in its own container
				
				// Move a component from one container to another, and make sure that it is not destroyed 
				destinationContainer = new Container( {
					destroyRemoved : true
				} );
				destinationContainer.insert( component1, 0 );
				expect( component1.destroyed ).toBe( false );  // error: component1 being destroyed when moved from one container to another
				
				
				// -----------------------
				
				
				// Test that adding a component with a beforeadd handler that returns false (to cancel the add) makes insert() return null
				container = new Container( {
					listeners : {
						'beforeadd' : function() {
							return false;  // cancel the add
						}
					}
				} );
				component = container.insert( new Component( { id: "test5" } ) );
				expect( component ).toBe( null );  // the component returned from add() should have been null with a beforeadd event handler that returns false
				
				
				// -----------------------
				
				
				// Test that the doLayout method is run automatically, but only once, after inserting single child components (one at a time)
				var doLayoutRuns = 0;
				container = new Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						Container.prototype.onLayout.apply( this, arguments );
					}
				} );
				expect( doLayoutRuns ).toBe( 1 );  // initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with single insertion
				component = container.insert( new Component( { id: "test1" } ) );
				expect( doLayoutRuns ).toBe( 2 );  // insert() not running doLayout once after component insert, or doLayout is being run too many times.
				component = container.insert( new Component( { id: "test2" } ) );
				expect( doLayoutRuns ).toBe( 3 );  // insert() not running doLayout once after second component insert, or doLayout is being run too many times.
				container.destroy();  // clean up DOM
			} );
		} );
		
		
		/*
		 * Test doInsert()
		 */
		describe( "Test doInsert()", function() {			
			
			it( "doInsert() should throw an error if the 'acceptType' config is set, and the component added was not of this type", function() {
				var ComponentSubType = Component.extend( {} );
				
				var container = new Container( {
					acceptType : ComponentSubType
				} );
				
				expect( function() {
					container.add( new Component() );  // NOT a "ComponentSubType"
				} ).toThrow( "A Component added to the Container was not of the correct class type ('acceptType' config)" );
			} );
			
			
			it( "doInsert should *not* throw an error if the 'acceptType' config is set, and the correct Component or Component subclass is added", function() {
				var ComponentSubType = Component.extend( {} ),
				    ComponentSubSubType = ComponentSubType.extend( {} );
				
				var container = new Container( {
					acceptType : ComponentSubType
				} );
				
				container.add( new ComponentSubType() );
				container.add( new ComponentSubSubType() );
				
				// Test should simply not error
			} );
			
		} );
		
		
	
		/*
		 * Test the getItemAt() method
		 */
		describe( "Test the getItemAt() method", function() {
			
			it( "getItemAt", function() {
				// Test with a single component in the container
				var component = new Component();
				var container = new Container( {
					items : component
				} );
				expect( container.getItemAt( 0 ) ).toBe( component );  // getItemAt() did not return correct index for component in a container with just the component.
				expect( container.getItemAt( 1 ) ).toBe( null );  // getItemAt() should have returned null for the item at index 1 for a container with one component.
				expect( container.getItemAt( -1 ) ).toBe( null );  // getItemAt() should have returned null for the item at index -1 for a container with one component.
				expect( container.getItemAt( 999 ) ).toBe( null );  // getItemAt() should have returned null for the item at index 999 for a container with one component.
				
				
				
				// Test with multiple components in the container
				var component1 = new Component();
				var component2 = new Component();
				var component3 = new Component();
				container = new Container( {
					items : [ component1, component2, component3 ]
				} );
				
				expect( container.getItemAt( 0 ) ).toBe( component1 );  // getItemAt() did not return component1 for index 0.
				expect( container.getItemAt( 1 ) ).toBe( component2 );  // getItemAt() did not return component2 for index 1.
				expect( container.getItemAt( 2 ) ).toBe( component3 );  // getItemAt() did not return component3 for index 2.
				expect( container.getItemAt( 3 ) ).toBe( null );  // getItemAt() should have returned null for the item at index 3 for a container with multiple components 
				expect( container.getItemAt( -1 ) ).toBe( null );  // getItemAt() should have returned null for the item at index -1 for a container with multiple components 
				expect( container.getItemAt( 999 ) ).toBe( null );  // getItemAt() should have returned null for the item at index 999 for a container with multiple components
			} );
		} );
	
		
	
		/*
		 * Test the getItemIndex() method
		 */
		describe( "Test the getItemIndex() method", function() {
			
			it( "getItemIndex", function() {
				// Test with a single component in the container
				var component = new Component();
				var container = new Container( {
					items : component
				} );
				expect( container.getItemIndex( component ) ).toBe( 0 );  // getItemIndex() did not return correct index for component.
				
				
				// Test with multiple components in the container
				var component1 = new Component();
				var component2 = new Component();
				var component3 = new Component();
				container = new Container( {
					items : [ component1, component2, component3 ]
				} );
				
				var randomComponent = new Component();
				
				expect( container.getItemIndex( component1 ) ).toBe( 0 );  // getItemIndex() did not return correct index for component1.
				expect( container.getItemIndex( component2 ) ).toBe( 1 );  // getItemIndex() did not return correct index for component2.
				expect( container.getItemIndex( component3 ) ).toBe( 2 );  // getItemIndex() did not return correct index for component3.
				expect( container.getItemIndex( randomComponent ) ).toBe( -1 );  // getItemIndex() should have returned -1 for randomComponent 
			} );
		} );
	
		
		
		/*
		 * Test the has() method
		 */
		describe( "Test the has() method", function() {
			
	
			it( "has", function() {
				// Test a Component in the Container
				var component = new Component();
				var container = new Container( {
					items : component
				} );
				expect( container.has( component ) ).toBe( true );  // has() method returning false when checking if container has component. should return true
				
				// Test a Component that isn't attached to any Container
				component = new Component();
				container = new Container();
				expect( container.has( component ) ).toBe( false );  // has() method returning true when checking if container has a component that is not attached to any container
				
				// Test a Component that belongs to another Container
				var component1 = new Component();
				var container1 = new Container( { items: component1 } );
				
				var component2 = new Component();
				var container2 = new Container( { items : component2 } );
				expect( container1.has( component2 ) ).toBe( false );  // has() method returning true when checking if container has another container's component
				
				
				// Test the has method with no arguments, falsy arguments, and primitive arguments. All should return false.
				expect( container.has() ).toBe( false );  // has() should return false with undefined argument
				expect( container.has( null ) ).toBe( false );  // has() should return false with null argument
				expect( container.has( 0 ) ).toBe( false );  // has() should return false with the number 0 as its argument
				expect( container.has( 1 ) ).toBe( false );  // has() should return false with the number 1 as its argument
				expect( container.has( "" ) ).toBe( false );  // has() should return false with an empty string as its argument
				expect( container.has( "testing" ) ).toBe( false );  // has() should return false with a string as its argument
			} );
		} );
		
		
		
		describe( 'remove()', function() {
			
			it( "remove", function() {
				// Test removing a single item at a time
				var container = new Container( {
					items : [ { id : "c1" }, { id: "c2" }, { id: "c3" }, { id: "c3" } ]
				} );
				var childCmps = container.getItems();
				var c1 = childCmps[ 0 ], c2 = childCmps[ 1 ], c3 = childCmps[ 2 ], c4 = childCmps[ 3 ];
				
				container.remove( c2 );
				expect( [ c1, c3, c4 ] ).toEqual( container.getItems() );  // 2nd component not removed correctly when removing single item
				
				container.remove( c4 );
				expect( [ c1, c3 ] ).toEqual( container.getItems() );  // last component not removed correctly when removing single item
				
				container.remove( c1 );
				expect( [ c3 ] ).toEqual( container.getItems() );  // first component not removed correctly when removing single item
				
				container.remove( c3 );
				expect( [] ).toEqual( container.getItems() );  // last component left not removed correctly when removing single item
				
				
				// Test removing multiple items
				container = new Container( {
					items : [ { id : "c1" }, { id: "c2" }, { id: "c3" }, { id: "c3" } ]
				} );
				childCmps = container.getItems();
				c1 = childCmps[ 0 ], c2 = childCmps[ 1 ], c3 = childCmps[ 2 ], c4 = childCmps[ 3 ];
				
				container.remove( [ c1, c3 ] );
				expect( [ c2, c4 ] ).toEqual( container.getItems() );  // multiple components not removed correctly
				
				
				// Test that a component being removed has been destroyed when destroyRemoved config is true (the default)
				container = new Container( {
					items : [ { id : "c1" } ]
				} );
				childCmps = container.getItems();
				c1 = childCmps[ 0 ];
				
				container.remove( c1 );
				expect( c1.destroyed ).toBe( true );  // component not destroyed when removed from container with default destroyRemoved config
				
				
				// Test that a component is not destroyed when destroyRemoved config is false
				container = new Container( {
					destroyRemoved : false,
					items : [ { id : "c1" } ]
				} );
				childCmps = container.getItems();
				c1 = childCmps[ 0 ];
				
				container.remove( c1 );
				expect( c1.destroyed ).toBe( false );  // component destroyed when removed from container with destroyRemoved config set to false (should not have been destroyed)
				
				
				// Test that a component is not destroyed when destroyRemove argument is false, but destroyRemoved config is true
				container = new Container( {
					destroyRemoved : true,
					items : [ { id : "c1" } ]
				} );
				childCmps = container.getItems();
				c1 = childCmps[ 0 ];
				
				container.remove( c1, false );
				expect( c1.destroyed ).toBe( false );  // component destroyed when removed from container with destroyRemoved *argument* set to false (should not have been destroyed)
				
						
				// Test that a component that is not destroyed has its element removed from the Container's main div element
				var $el = jQuery( '<div style="display: none;"></div>' ).appendTo( document.body );
				container = new Container( {
					renderTo: $el,  // render the Container, so that its child items get rendered
					
					destroyRemoved : false,    // don't destroy removed Components; we are testing that the removed child component's element is detached.
					items : [ { id : "c1" } ]
				} );
				childCmps = container.getItems();
				c1 = childCmps[ 0 ];
				
				container.remove( c1 );
				var $containerEl = container.getEl();
				expect( $containerEl.has( c1.getEl() ).length > 0 ).toBe( false );  // component's element is not being removed from the container when not being destroyed
				
				container.destroy();  // clean up DOM
				$el.remove();
				
				
				// Test that trying to remove a Component that does *not* exist in the Container is *not* destroyed
				var cmp = new Component( { id : 'c1' } );
				container = new Container( {
					destroyRemoved : true
					// items : cmp  -- Not in the container!
				} );
				container.remove( cmp );
				expect( cmp.destroyed ).toBe( false );  // a Component that was 'removed' from a container that it did not exist in was still destroyed!
				
				
				// -----------------------
						
				
				// Test for a beforeremove handler returning false, to cancel the removal of a component
				container = new Container( {
					items : [ { id : "c1" } ],
					listeners : {
						'beforeremove' : function() {
							return false;  // cancel removal
						}
					}
				} );
				childCmps = container.getItems();
				c1 = childCmps[ 0 ];
				
				container.remove( c1, false );
				expect( container.getItems().length ).toEqual( 1 );  // component being removed from container even though a beforeremove event handler is returning false. 
				expect( container.has( c1 ) ).toBe( true );  // component being removed from container even though a beforeremove event handler is returning false. container does not have component
				
				
				// Test that a beforeremove event handler canceled the removal (by returning false), and that the remove() method returned null in this case
				var component1 = new Component();
				var component2 = new Component();
				var component3 = new Component();
				container = new Container( {
					items : [ component1, component2 ],  // only putting component1 and component2 in here
					
					listeners : {
						'beforeremove' : function() {
							return false;
						}
					}
				} );
				
				var removedComponent = container.remove( component1 );
				expect( container.has( component1 ) ).toBe( true );  // container should still have component1, with a beforeremove handler returning false
				expect( removedComponent ).toBe( null );  // removedComponent should be null, because a beforeremove handler canceled removal
				
				
				// -----------------------
				
				
				// Test to make sure the method returns a reference to the removed Component only when the requested component to be removed was actually in the container, and removed from it
				component1 = new Component();
				component2 = new Component();
				component3 = new Component();
				container = new Container( {
					items : [ component1, component2 ]  // only putting component1 and component2 in here
				} );
				
				removedComponent = container.remove( component1 );
				expect( removedComponent ).toBe( component1 );  // remove() did not properly return the component it removed (component1) 
				
				removedComponent = container.remove( component3 );  // attempt to remove a component that doesn't exist in the container
				expect( removedComponent ).toBe( null );  // remove() should have returned null when attempting to remove a component that wasn't under the container
				
				
				// Test that an array of removed components are returned when an array of components to remove is provided
				component1 = new Component();
				component2 = new Component();
				component3 = new Component();
				container = new Container( {
					items : [ component1, component2, component3 ]
				} );
				
				var removedComponents = container.remove( [ component1, component2 ] );
				expect( [ component1, component2 ] ).toEqual( removedComponents );  // The removed components returned by remove() does not reflect the ones actually removed.
				
				
				// Test that removing multiple components that aren't in the container returns an empty array
				component1 = new Component();
				component2 = new Component();
				component3 = new Component();
				container = new Container( {
					items : [ component1 ]  // only component1 goes in
				} );
				
				removedComponents = container.remove( [ component2, component3 ] );
				expect( [] ).toEqual( removedComponents );  // remove() should have returned an empty array for trying to remove components that weren't in the container
				
				
				// Test that removing more components than were in the container only returns an array of the components removed from the container
				component1 = new Component();
				component2 = new Component();
				component3 = new Component();
				container = new Container( {
					items : [ component1, component2 ]  // only component1 goes in
				} );
				
				removedComponents = container.remove( [ component1, component2, component3 ] );
				expect( [ component1, component2 ] ).toEqual( removedComponents );  // remove() should have returned only the two components that were actually in the container
				
				
				
				// -----------------------
				
				
				// Test that the doLayout method is run automatically after removing a single child components (one at a time)
				var doLayoutRuns = 0;
				var cmp1 = new Component(), 
				    cmp2 = new Component();
					
				container = new Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						Container.prototype.onLayout.apply( this, arguments );
					},
					items : [ cmp1, cmp2 ]
				} );
				expect( doLayoutRuns ).toBe( 1 );  // initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with single removals
				var component = container.remove( cmp1 );
				expect( doLayoutRuns ).toBe( 2 );  // remove() not running doLayout once after single component removal, or doLayout is being run too many times.
				component = container.add( cmp2 );
				expect( doLayoutRuns ).toBe( 3 );  // remove() not running doLayout once after second (but single) component removal, or doLayout is being run too many times.
				container.destroy();  // clean up DOM
				
				
				// Test that the doLayout method is run automatically, and only once, after adding multiple child components with an array argument to add()
				doLayoutRuns = 0;
				cmp1 = new Component(); 
				cmp2 = new Component();
				var cmp3 = new Component(), 
				    cmp4 = new Component(), 
				    cmp5 = new Component();
					
				container = new Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						Container.prototype.onLayout.apply( this, arguments );
					},
					items : [ cmp1, cmp2, cmp3, cmp4, cmp5 ]
				} );
				expect( doLayoutRuns ).toBe( 1 );  // initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with multiple removals
				component = container.remove( [ cmp1, cmp2, cmp3 ] );
				expect( doLayoutRuns ).toBe( 2 );  // remove() not running doLayout after multiple component removal, or doLayout is being run too many times (should only be run once).
				component = container.remove( [ cmp4, cmp5 ] );
				expect( doLayoutRuns ).toBe( 3 );  // remove() not running doLayout after multiple component removal, or doLayout is being run too many times (should only be run once).
				container.destroy();  // clean up DOM
				
				
				// Test that the Component's parentContainer reference is set back to null after removal
				cmp1 = new Component();
				container = new Container( { items : cmp1 } );
				expect( cmp1.getParentContainer() ).toBe( container );  // initial condition: the component should have the container as its parent container
				container.remove( cmp1 );
				expect( cmp1.getParentContainer() ).toBe( null );  // The parentContainer reference should have been set back to null on the component after removal from the container
			} );
		} );
		
		
		describe( 'removeAt()', function() {
			var cmp0,
			    cmp1,
			    cmp2,
			    container;
			
			beforeEach( function() {
				cmp0 = new Component();
				cmp1 = new Component();
				cmp2 = new Component();
				
				container = new Container( {
					items : [ cmp0, cmp1, cmp2 ]
				} );
			} );
			
			
			it( "should remove an item at a given index, and return the removed Component", function() {
				var returnedCmp;
				
				// Initial condition
				expect( container.getItems().length ).toBe( 3 );
				expect( container.getItems()[ 0 ] ).toBe( cmp0 );
				expect( container.getItems()[ 1 ] ).toBe( cmp1 );
				expect( container.getItems()[ 2 ] ).toBe( cmp2 );
				
				returnedCmp = container.removeAt( 2 );
				expect( container.getItems().length ).toBe( 2 );
				expect( container.getItems()[ 0 ] ).toBe( cmp0 );
				expect( container.getItems()[ 1 ] ).toBe( cmp1 );
				expect( returnedCmp ).toBe( cmp2 );
				
				returnedCmp = container.removeAt( 0 );
				expect( container.getItems().length ).toBe( 1 );
				expect( container.getItems()[ 0 ] ).toBe( cmp1 );
				expect( returnedCmp ).toBe( cmp0 );
				
				returnedCmp = container.removeAt( 0 );
				expect( container.getItems().length ).toBe( 0 );
				expect( returnedCmp ).toBe( cmp1 );
			} );
			
			
			it( "should have no effect and return null if there is no child Component at the given `idx`", function() {
				var returnedCmp;
				
				// Initial condition
				expect( container.getItems().length ).toBe( 3 );
				expect( container.getItems()[ 0 ] ).toBe( cmp0 );
				expect( container.getItems()[ 1 ] ).toBe( cmp1 );
				expect( container.getItems()[ 2 ] ).toBe( cmp2 );
				
				returnedCmp = container.removeAt( 3 );  // out of bounds - should have no effect
				expect( container.getItems().length ).toBe( 3 );
				expect( container.getItems()[ 0 ] ).toBe( cmp0 );
				expect( container.getItems()[ 1 ] ).toBe( cmp1 );
				expect( container.getItems()[ 2 ] ).toBe( cmp2 );
				expect( returnedCmp ).toBe( null );
			} );
			
		} );
	
		
		
		/*
		 * Test the removeAll() method
		 */
		describe( "Test the removeAll() method", function() {
			
	
			it( "removeAll", function() {
				var component1 = new Component();
				var component2 = new Component();
				var component3 = new Component();
				var container = new Container( {
					items : [ component1, component2, component3 ]
				} );
				
				expect( container.getItems().length ).toBe( 3 );  // error on intial condition. container should have 3 child components
				container.removeAll();
				expect( container.getItems().length ).toBe( 0 );  // removeAll() failed. container should now have 0 child components
				
				
				// -----------------------
				
				
				// Test that the doLayout method is run automatically, and only once, after removing all child components
				var doLayoutRuns = 0;
				var cmp1 = new Component(), 
				    cmp2 = new Component(), 
				    cmp3 = new Component();
				
				container = new Container( {
					renderTo : document.body,
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						Container.prototype.onLayout.apply( this, arguments );
					},
					items : [ cmp1, cmp2, cmp3 ]
				} );
				expect( doLayoutRuns ).toBe( 1 );  // initial condition failed. doLayout should have only been run once at this point (from initial rendering) for test with multiple removals
				var component = container.removeAll();
				expect( doLayoutRuns ).toBe( 2 );  // remove() not running doLayout after all components have been removed, or doLayout is being run too many times (should only be run once).
				container.destroy();  // clean up DOM
			} );
		} );
	
	
	
		// ----------------------------------
	
		
		
		/*
		 * Test the doLayout() method
		 */
		describe( "Test the doLayout() method", function() {
			
			it( "doLayout", function() {
				// Test that the doLayout method is *not* run when the Container is not rendered
				var doLayoutRuns = 0;
				var container = new Container( {
					// renderTo : document.body,  -- leaving this here as a reminder
					items : [
						new Component()
					],
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						Container.prototype.onLayout.apply( this, arguments );
					}
				} );
				expect( doLayoutRuns ).toBe( 0 );  // doLayout should not have been run since the Container is not rendered
				
				
		
				// Test that the doLayout method is run when the Container *is* rendered
				doLayoutRuns = 0;
				container = new Container( {
					renderTo : document.body,
					items : [
						new Component()
					],
					onLayout : function() {
						doLayoutRuns++;   // override of onLayout to increase the counter
						Container.prototype.onLayout.apply( this, arguments );
					}
				} );
				expect( doLayoutRuns ).toBe( 1 );  // doLayout should have been run once since the Container is rendered
				container.destroy();  // clean up DOM
			
				// -----------------------
				
				
				// TODO: Add more tests
				
				
			} );
		} );
	
		
		
		/*
		 * Test the getLayout() method
		 */
		describe( 'getLayout()', function() {
			var TestLayout = Class.extend( Layout, {} );
			Container.registerLayout( '__getLayoutTest_testLayout', TestLayout );
			
			
			it( "should return a jqc.layout.Auto layout instance when no layout has been configured", function() {
				var container = new Container();
				var layout = container.getLayout();
				expect( layout instanceof AutoLayout ).toBe( true );  // A Auto should have been created on the fly from getLayout() on a Container with no layout
			} );
			
			it( "should return a layout instance of the correct class, when the Container is instantiated with a layout type string", function() {
				// Test on a Container with a given string layout, that the layout was instantiated to the correct class, and returned
				var container = new Container( { layout: '__getLayoutTest_testLayout' } );
				expect( container.getLayout() instanceof TestLayout ).toBe( true );  // A ColumnsLayout should have been returned from getLayout(), as that is what was configured for the Container (by its string type name)
			} );
			
			it( "should return a layout instance of the correct class, when the layout is instantiated by a config object", function() {
				// Test on a Container with a given object layout, that the layout was instantiated to the correct class, and returned
				var container = new Container( { layout: { type : '__getLayoutTest_testLayout' } } );
				expect( container.getLayout() instanceof TestLayout ).toBe( true );  // A ColumnsLayout should have been returned from getLayout(), as that is what was configured for the Container (by its type name in an object)
			} );
			
			it( "should return the exact layout instance that was configured when instantiating the Container", function() {
				// Test on a Container with a given instantiated layout
				var testLayout = new TestLayout();
				var container = new Container( { layout: testLayout } );
				expect( container.getLayout() ).toBe( testLayout );
			} );
		} );
	
		
		
		/*
		 * Test the setLayout() method
		 */
		describe( "Test the setLayout() method", function() {
			var TestLayout = Class.extend( Layout, {} );
			Container.registerLayout( '__setLayoutTest_testLayout', TestLayout );
			
			it( "setLayout() should throw an error if not provided an argument", function() {
				var container = new Container();
				expect( function() {
					container.setLayout();
				} ).toThrow( "Invalid layout argument provided to setLayout. See method description in docs." );
			} );
			
			
			it( "setLayout() should throw an error if given a string that doesn't have an associated Layout class", function() {
				var container = new Container();
				expect( function() {
					container.setLayout( 'non-existent-layout' );
				} ).toThrow( "layout type 'non-existent-layout' is not a registered layout type." );
			} );
			
			
			it( "setLayout() should accept a layout's string name", function() {
				var container = new Container();
				container.setLayout( '__setLayoutTest_testLayout' );
				expect( container.getLayout() instanceof TestLayout ).toBe( true );  // Setting a layout with the string 'columns' should have created a jqc.layout.Column
				expect( container.getLayout().getContainer() ).toEqual( container );  // The layout's Container reference was not set to the Container when instantiated by its string type
			} );
			
			
			it( "setLayout() should default an anonymous object provided to it with no 'type' property to an Auto layout", function() {
				var container = new Container();
				container.setLayout( {} );
				
				expect( container.getLayout() instanceof AutoLayout ).toBe( true );  // Setting a layout with an empty object should have created a jqc.layout.Auto
				expect( container.getLayout().getContainer() ).toEqual( container );  // The layout's Container reference was not set to the Container when instantiated by an object without a 'type' property
			} );
			
			
			it( "setLayout() should accept custom properties on an anonymous object with no 'type' property, by providing them to the Auto", function() {
				var container = new Container();
				container.setLayout( { customProp: 1 } );   // test with a custom property, to make sure it gets applied
				
				expect( container.getLayout() instanceof AutoLayout ).toBe( true );  // Setting a layout with an object with no type property should have created a jqc.layout.Auto
				expect( 1 ).toBe( container.getLayout().customProp );  // setLayout() didn't seem to create the Layout with the config object (customProp wasn't applied)
				expect( container.getLayout().getContainer() ).toEqual( container );  // The layout's Container reference was not set to the Container when instantiated by an object without a 'type' property, and with a custom property
			} );
			
			
			it( "setLayout() should set the correct layout type with an anonymous object argument that has a 'type' property", function() {
				var container = new Container();
				container.setLayout( { type : '__setLayoutTest_testLayout' } );
				
				expect( container.getLayout() instanceof TestLayout ).toBe( true );  // Setting a layout with an object with type 'Columns' should have created a jqc.layout.Column
				expect( container.getLayout().getContainer() ).toEqual( container );  // The layout's Container reference was not set to the Container when instantiated by an object with a 'type' property
			} );
			
			
			it( "setLayout() should set the correct layout type with an anonymous object argument that has a 'type' property, and set any custom properties to it as well", function() {
				var container = new Container();
				container.setLayout( { type : '__setLayoutTest_testLayout', customProp: 1 } );   // test with a custom property, to make sure it gets applied
				
				expect( container.getLayout() instanceof TestLayout ).toBe( true );  // Setting a layout with an object with type 'Columns' should have created a jqc.layout.Column (with a custom property)
				expect( 1 ).toBe( container.getLayout().customProp );  // setLayout() didn't seem to create the Layout with the config object (customProp wasn't applied)
				expect( container.getLayout().getContainer() ).toEqual( container );  // The layout's Container reference was not set to the Container when instantiated by an object with a 'type' property, and with a custom property
			} );
			
			
			it( "setLayout() should set a layout that is provided to it if it is already an instantiated jqc.layout.Layout subclass", function() {
				var container = new Container();
				var myLayout = new TestLayout();
				container.setLayout( myLayout );
				
				expect( container.getLayout() ).toEqual( myLayout );  // Setting an instantiated layout and getting it with getLayout() should have returned the same object.
				expect( myLayout.getContainer() ).toEqual( container );  // myLayout's Container reference was not set to the Container when given an instantiated Layout.
			} );
			
			
			it( "setLayout(), when provided a *new* layout, should destroy the old one", function() {
				var container = new Container();
				
				var layout1 = JsMockito.mock( Class.extend( Layout, {} ) ),
				    layout2 = JsMockito.mock( Class.extend( Layout, {} ) );
				
				
				container.setLayout( layout1 );
				JsMockito.verify( layout1 ).setContainer( container );
				
				container.setLayout( layout2 );
				JsMockito.verify( layout1 ).destroy();
				JsMockito.verify( layout2 ).setContainer( container );
			} );
			
			
			it( "setLayout() should detach all of its child components when setting a new layout, so that they can be re-laid out by the new layout", function() {
				var container = new Container(),
				    cmp1 = JsMockito.mock( Component ),
				    cmp2 = JsMockito.mock( Component ),
				    layout1 = JsMockito.mock( Class.extend( Layout, {} ) ),
				    layout2 = JsMockito.mock( Class.extend( Layout, {} ) );
				
				container.setLayout( layout1 );
				container.add( [ cmp1, cmp2 ] );
				
				// Now set to the new layout. The components should be detached.
				container.setLayout( layout2 );
				JsMockito.verify( cmp1 ).detach();
				JsMockito.verify( cmp2 ).detach();
			} );
		} );
	
		
		// ----------------------------------
	
	
		/*
		 * Test the cascade() method
		 */
		describe( "Test the cascade() method", function() {
			
			xit( "cascade", function() {
				// Test with one level of children, one item
				var container = new Container( {
					items: [
						{
							type : 'component',
							key  : 'myKey'
						}
					]
				} );
				
				// TODO
			} );
		} );
	
	
		
		/*
		 * Test the findById() method
		 */
		describe( "Test the findById() method", function() {
			
	
			it( "findById", function() {
				var container = new Container( {
					id: 'top',
					
					items: [
						{ 
							type  : 'Container', 
							id    : 'first',
							
							items : [
								{ type : 'component' }
							]
						},
						
						{ type : 'component' },
						
						{
							type  : 'Container',
							id    : 'second',
							
							items : [
								{ type : 'component' },
								{ type : 'component' },
								{
									type  : 'Container',
									id    : 'second_nested',
									
									items : [
										{ type : 'component' },
										{ type : 'component' },
										{ type : 'component' }
									]
								}
							]
						}
					]
				} );
				
				var first = container.findById( 'first' );
				expect( first.getId() ).toEqual( "first" );  // Component 'first' not found by id.
				
				var second = container.findById( 'second' );
				expect( second.getId() ).toEqual( "second" );  // Component 'second' not found by id.
				
				var second_nested = container.findById( 'second_nested' );
				expect( second_nested.getId() ).toEqual( "second_nested" );  // Component 'second_nested' not found by id.
				
				var nonExistent = container.findById( 'non-existent' );
				expect( nonExistent ).toBe( null );  // Component with id of 'non-existent' was somehow found (i.e. not null), even though it doesn't exist.
			} );
		} );
		
	
		/*
		 * Test the findBy() method
		 */
		describe( "Test the findBy() method", function() {
			
			it( "findBy", function() {
				// TODO
			} );
		} );
	} );
	
} );