/*global window, tests, jQuery, Ext, Y, Jux, ui */
tests.unit.ui.add( new Ext.test.Suite( {
    
    name: 'ui.Component',
	
	
	
	// --------------------------------
	
	items : [
	
	
		/*
		 * Constructor tests
		 */
		{
			name : 'Constructor tests',
			
			
			"The constructor should apply all configs to the Component object" : function() {
				// Test that configs are applied to the Component object
				var component = new ui.Component( {
					testConfig1: "test1",
					testConfig2: "test2"
				} );
				
				Y.Assert.areEqual( "test1", component.testConfig1, "testConfig1 was not applied (copied) to the component object" );
				Y.Assert.areEqual( "test2", component.testConfig2, "testConfig2 was not applied (copied) to the component object" );
			},
				
			
			// TODO: Test that events can be listened to and fired
			
			
			
			// Tests for plugins
			
			"The constructor should always set the 'plugins' property to an array before initComponent is run, with no plugins config" : function() {
				// Test with no plugins config
				var component = new ui.Component( {
					initComponent : function() {  // inline override of initComponent method
						Y.Assert.isArray( this.plugins, "Plugins is not an array when plugins config is not provided" );
					}
				} );
			},
				
			"The constructor should always set the 'plugins' property to an array before initComponent is run, with an empty array for the plugins config" : function() {
				var component = new ui.Component( {
					plugins : [],
					
					initComponent : function() {  // inline override of initComponent method
						Y.Assert.isArray( this.plugins, "Plugins is not an array when plugins config is empty array" );
					}
				} ); 
			},
				
			"The constructor should always set the 'plugins' property to an array before initComponent is run, with a single object for the plugins config" : function() {
				var component = new ui.Component( {
					plugins : new ui.plugins.AbstractPlugin(),
					
					initComponent : function() {  // inline override of initComponent method
						Y.Assert.isArray( this.plugins, "Plugins is not an array when plugins config is a single object" );
					}
				} ); 
			},
				
			"The constructor should always set the 'plugins' property to an array before initComponent is run, with an array of objects for the plugins config" : function() {
				var component = new ui.Component( {
					plugins : [ new ui.plugins.AbstractPlugin(), new ui.plugins.AbstractPlugin() ],
					
					initComponent : function() {  // inline override of initComponent method
						Y.Assert.isArray( this.plugins, "Plugins is not an array when plugins config is an array of plugins" );
					}
				} );
			}
		},
		
		
		
		{
			name : 'General Tests',
			
			
			/*
			 * Test ui.Component.initPlugins()
			 */
			test_initPlugins : function() { 
				// Variables that will be used throughout the test
				var pluginInitCalledCount,
				    pluginComponentRef;
				
				
				// Create a simple plugin for testing
				var MyPlugin = Jux.extend( ui.plugins.AbstractPlugin, {
					initPlugin : function( component ) {
						pluginInitCalledCount++;
						pluginComponentRef = component;
					}
				} );
				
				
				// Test a single plugin at Component construction time.
				pluginInitCalledCount = 0;
				pluginComponentRef = null;
				
				var component = new ui.Component( {
					plugins : new MyPlugin()
				} );
				Y.Assert.areSame( 1, pluginInitCalledCount, "the plugin's initPlugin method should have been called once for instantiating a plugin at component construction time" );
				Y.Assert.areSame( component, pluginComponentRef, "the plugin's initPlugin method should have had the component reference passed in, and set to the local pluginComponentRef variable (for single plugin at construction time)" );
				
				
				// Test multiple plugins at Component construction 
				pluginInitCalledCount = 0;
				pluginComponentRef = null;
				
				var component = new ui.Component( {
					plugins : [ new MyPlugin(), new MyPlugin() ]
				} );
				Y.Assert.areSame( 2, pluginInitCalledCount, "the plugin's initPlugin method should have been called twice for instantiating a plugin at component construction time" );
				Y.Assert.areSame( component, pluginComponentRef, "the plugin's initPlugin method should have had the component reference passed in, and set to the local pluginComponentRef variable (for multiple plugins at construction time)" );
				
				
				
				// Test adding a plugin after Component instantiation.
				pluginInitCalledCount = 0;
				pluginComponentRef = null;
				
				var component = new ui.Component();
				component.initPlugins( new MyPlugin() );
				Y.Assert.areSame( 1, pluginInitCalledCount, "the plugin's initPlugin method should have been called once for instantiating a plugin after component construction time" );
				Y.Assert.areSame( component, pluginComponentRef, "the plugin's initPlugin method should have had the component reference passed in, and set to the local pluginComponentRef variable (for adding a plugin after construction time)" );
						
				
				// Test attempting to add a non ui.plugins.AbstractPlugin object as a plugin. Should error.
				try {
					var component = new ui.Component( {
						plugins : {
							// non ui.plugins.AbstractPlugin implementation. should error
							initPlugin : function() { }
						}
					} );
					
					Y.Assert.fail( "adding a non ui.plugins.AbstractPlugin instance to a component's plugins should error." );
				} catch( e ) {
					// Code above errored, test passes
				}
			},
			
			
			// -------------------------
			
			
			
			/*
			 * Test ui.Component.hide()
			 */
			test_hide : function() {
				// Test hide() method on an unrendered component (which by default, is initially shown)
				var component = new ui.Component();
				Y.Assert.isFalse( component.isHidden(), "initial condition failed. isHidden() should have returned false" );
				component.hide();
				Y.Assert.isTrue( component.isHidden(), "after running hide(), isHidden() should have returned true (on an unrendered component)" );
				
				// now render the component
				component.render( document.body );
				Y.Assert.isTrue( component.isHidden(), "after rendering the component, hidden with hide() when it was unrendered, it should have been rendered hidden" );
				Y.Assert.isFalse( component.getEl().is( ':visible' ), "after rendering the component, hidden with hide() when it was unrendered, confirm that the element itself is hidden (not visible)" );
				
				component.destroy();  // clean up DOM
				
				
				// ------------------------------------
				
				
				// Test hide() method on a rendered component
				var component = new ui.Component( { renderTo: document.body } );
				Y.Assert.isFalse( component.isHidden(), "initial condition failed. isHidden() should have returned false for rendered component" );
				component.hide();
				Y.Assert.isTrue( component.isHidden(), "after running hide(), isHidden() should have returned true (on rendered component)" );
				Y.Assert.isFalse( component.getEl().is( ':visible' ), "after running hide() when it was rendered, confirm that the element itself is hidden (not visible)" );
				
				component.destroy();  // clean up DOM
			},
			
			
			/*
			 * Test ui.Component.show()
			 */
			test_show : function() {
				// Test show() method on an unrendered component which is initially hidden
				var component = new ui.Component( { hidden: true } );
				Y.Assert.isTrue( component.isHidden(), "initial condition failed. isHidden() should have returned true on initially hidden component (in unrendered state)" );
				component.show();
				Y.Assert.isFalse( component.isHidden(), "after running show(), isHidden() should have returned false (on an unrendered component)" );
				
				// now render the component
				component.render( document.body );
				Y.Assert.isFalse( component.isHidden(), "after rendering the component, shown with show() when it was unrendered, it should have been rendered shown (visible)" );
				Y.Assert.isTrue( component.getEl().is( ':visible' ), "after rendering the component, shown with show() when it was unrendered, confirm that the element itself is visible after render" );
				
				component.destroy();  // clean up DOM
				
				
				// ------------------------------------
				
				
				// Test show() method on a rendered component
				var component = new ui.Component( { renderTo: document.body, hidden: true } );
				Y.Assert.isTrue( component.isHidden(), "initial condition failed. isHidden() should have returned true for initially hidden rendered component" );
				component.show();
				Y.Assert.isFalse( component.isHidden(), "after running show(), isHidden() should have returned false (on rendered component)" );
				Y.Assert.isTrue( component.getEl().is( ':visible' ), "after running show() when it was rendered, confirm that the element itself is visible (not hidden)" );
				
				component.destroy();  // clean up DOM
			},
			
			
			/*
			 * Test ui.Component.isHidden()
			 */
			test_isHidden : function() {
				// Test on an unrendered component
				var component = new ui.Component();
				Y.Assert.isFalse( component.isHidden(), "initial condition failed. isHidden() should have returned false (for unrendered component)" );
				component.hide();
				Y.Assert.isTrue( component.isHidden(), "after running hide(), isHidden() should have returned true (on an unrendered component)" );
				component.show();
				Y.Assert.isFalse( component.isHidden(), "after running hide(), isHidden() should have returned false (on an unrendered component)" );
				
				// Test on a rendered component
				var component = new ui.Component( { renderTo: document.body } );
				Y.Assert.isFalse( component.isHidden(), "initial condition failed. isHidden() should have returned false (for rendered component)" );
				Y.Assert.isTrue( component.getEl().is( ':visible' ), "confirm initial condition on rendered component, that the element itself is visible (not hidden)" );
				component.hide();
				Y.Assert.isTrue( component.isHidden(), "after running hide(), isHidden() should have returned true (on a rendered component)" );
				Y.Assert.isFalse( component.getEl().is( ':visible' ), "confirm that the element itself is hidden (not visible) on rendered component" );
				component.show();
				Y.Assert.isFalse( component.isHidden(), "after running show(), isHidden() should have returned false (on a rendered component)" );
				Y.Assert.isTrue( component.getEl().is( ':visible' ), "confirm that the element itself is now visible on rendered component" );
				component.destroy();  // clean up DOM
				
				// Test on a rendered component that has been placed into an element that does not exist in the DOM
				var myDiv = jQuery( '<div />' );
				var component = new ui.Component( { renderTo: myDiv } );
				Y.Assert.isTrue( component.isHidden(), "isHidden() should return true for a Component that is shown, but is rendered as a child of an element that is not attached to the DOM" );
				component.destroy();
				myDiv.remove();
			}
		},
		
		
		// -----------------------------------------------
		
		/*
		 * Test render()
		 */
		{
			name : "Test render()",
			
			"Attributes given to the 'attr' config should be applied to the element" : function() {
				var component = new ui.Component( {
					renderTo : document.body,   // to cause it to render
					attr : {
						attr1 : "value1",
						attr2 : "value2"
					}
				} );
				
				var $el = component.getEl();
				Y.Assert.areSame( "value1", $el.attr( 'attr1' ), "'attr1' should have been applied to the element" );
				Y.Assert.areSame( "value2", $el.attr( 'attr2' ), "'attr2' should have been applied to the element" );
				
				component.destroy();
			},
			
			
			"CSS class names given to the 'cls' config should be applied to the element" : function() {
				var component = new ui.Component( {
					renderTo : document.body,   // to cause it to render
					cls: 'myClass1 myClass2'
				} );
				
				var $el = component.getEl();
				Y.Assert.isTrue( $el.hasClass( "myClass1" ), "'myClass1' should have been applied to the element" );
				Y.Assert.isTrue( $el.hasClass( 'myClass2' ), "'myClass2' should have been applied to the element" );
				
				component.destroy();
			},
			
			
			"style properties given to the 'style' config should be applied to the element" : function() {
				var component = new ui.Component( {
					renderTo : document.body,   // to cause it to render
					style: {
						'fontFamily' : 'Arial', // specified as JS property name
						'font-size'  : '12px'   // specified as CSS property name
					}
				} );
				
				var $el = component.getEl();
				Y.Assert.areSame( 'Arial', $el.css( "font-family" ), "font-family 'Arial' should have been applied to the element" );
				Y.Assert.areSame( '12px', $el.css( "font-size" ), "font-size '12px' should have been applied to the element" );
				
				component.destroy();
			},
			
			
			// -------------------
			
			
			"rendering an element with a numeric position should put that component's element at that position" : function() {
				var $containerEl = jQuery( '<div />' ),
				    component1 = new ui.Component(),
				    component2 = new ui.Component();
				
				Y.Assert.areSame( 0, $containerEl.children().length, "Initial condition: The container shouldn't have any child elements" );
				
				component1.render( $containerEl );
				Y.Assert.areSame( 1, $containerEl.children().length, "There should be 1 child element in the $containerEl now" );
				Y.Assert.areSame( component1.getEl()[ 0 ], $containerEl.children()[ 0 ], "component1's element should be the first element in the $containerEl" );
				
				component2.render( $containerEl, { position: 0 } );  // render it at index 0, before component1
				Y.Assert.areSame( 2, $containerEl.children().length, "There should be 2 child elements in the $containerEl now" );
				Y.Assert.areSame( component1.getEl()[ 0 ], $containerEl.children()[ 1 ], "component1's element should now be the second element in the $containerEl" );
				Y.Assert.areSame( component2.getEl()[ 0 ], $containerEl.children()[ 0 ], "component2's element should become the first element in the $containerEl" );	
			},
			
			
			"rendering an element with a numeric position should simply append the element if the position given is greater than the number of elements in the container element" : function() {
				var $containerEl = jQuery( '<div />' ),
				    component1 = new ui.Component(),
				    component2 = new ui.Component();
				
				Y.Assert.areSame( 0, $containerEl.children().length, "Initial condition: The container shouldn't have any child elements" );
				
				component1.render( $containerEl, { position: 0 } );
				Y.Assert.areSame( 1, $containerEl.children().length, "There should be 1 child element in the $containerEl now" );
				Y.Assert.areSame( component1.getEl()[ 0 ], $containerEl.children()[ 0 ], "component1's element should be the first element in the $containerEl" );
				
				component2.render( $containerEl, { position: 1 } );
				Y.Assert.areSame( 2, $containerEl.children().length, "There should be 2 child elements in the $containerEl now" );
				Y.Assert.areSame( component1.getEl()[ 0 ], $containerEl.children()[ 0 ], "component1's element should be the first element in the $containerEl" );
				Y.Assert.areSame( component2.getEl()[ 0 ], $containerEl.children()[ 1 ], "component2's element should be the second element in the $containerEl" );	
			},
			
			
			"rendering an element that is already rendered, with a numeric position (to move it), should simply append the element if the position given is greater than the number of elements in the container element" : function() {
				var $containerEl = jQuery( '<div />' ),
				    component1 = new ui.Component( { renderTo: $containerEl } ),
				    component2 = new ui.Component( { renderTo: $containerEl } );
				
				Y.Assert.areSame( 2, $containerEl.children().length, "Initial condition: Both components should exist in the $containerEl" );
				
				// Now move component1 from position 0 to the end
				component1.render( $containerEl, { position: 2 } );
				Y.Assert.areSame( 2, $containerEl.children().length, "Both components should still exist in the $containerEl (1)" );
				Y.Assert.areSame( component1.getEl()[ 0 ], $containerEl.children()[ 1 ], "component1's element should now be the second element in the $containerEl" );
				Y.Assert.areSame( component2.getEl()[ 0 ], $containerEl.children()[ 0 ], "component2's element should now be the first element in the $containerEl" );	
				
				// Now move component2 from position 0 to the end
				component2.render( $containerEl, { position: 2 } );
				Y.Assert.areSame( 2, $containerEl.children().length, "Both components should still exist in the $containerEl (2)" );
				Y.Assert.areSame( component1.getEl()[ 0 ], $containerEl.children()[ 0 ], "component1's element should now be the first element in the $containerEl (again)" );
				Y.Assert.areSame( component2.getEl()[ 0 ], $containerEl.children()[ 1 ], "component2's element should now be the second element in the $containerEl (again)" );	
			}
		},
		
		
		
		// -----------------------------------------------
		
		// Attribute, CSS Class, and Element Style related functionality
		
		
		/*
		 * Test setAttr()
		 */
		{
			name : "Test setAttr()",
			
			
			"setAttr() should add an attribute when unrendered" : function() {
				var cmp = new ui.Component();
				cmp.setAttr( 'data-myAttr', 'value' );
				
				cmp.render( 'body' );
				Y.Assert.areSame( 'value', cmp.getEl().attr( 'data-myAttr' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setAttr() should overwrite an attribute when unrendered" : function() {
				var cmp = new ui.Component( { 
					attr: { 'data-myAttr' : 'value' } 
				} );
				cmp.setAttr( 'data-myAttr', 'value2' );
				
				cmp.render( 'body' );
				Y.Assert.areSame( 'value2', cmp.getEl().attr( 'data-myAttr' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setAttr() should add an attribute when rendered" : function() {
				var cmp = new ui.Component( { renderTo: 'body' } );
				
				cmp.setAttr( 'data-myAttr', 'value' );
				Y.Assert.areSame( 'value', cmp.getEl().attr( 'data-myAttr' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setAttr() should overwrite an attribute when rendered" : function() {
				var cmp = new ui.Component( { 
					renderTo: 'body',
					attr: { 'data-myAttr' : 'value' } 
				} );
				
				cmp.setAttr( 'data-myAttr', 'value2' );
				Y.Assert.areSame( 'value2', cmp.getEl().attr( 'data-myAttr' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"setAttr() should add a set of attributes when unrendered" : function() {
				var cmp = new ui.Component();
				
				cmp.setAttr( { 'data-myAttr1': 'value1', 'data-myAttr2': 'value2' } );
				
				cmp.render( 'body' );
				Y.Assert.areSame( 'value1', cmp.getEl().attr( 'data-myAttr1' ) );
				Y.Assert.areSame( 'value2', cmp.getEl().attr( 'data-myAttr2' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setAttr() should overwrite a set of attributes when unrendered" : function() {
				var cmp = new ui.Component( {
					attr: { 'data-myAttr1': 'value1', 'data-myAttr2': 'value2' } 
				} );
				
				cmp.setAttr( { 'data-myAttr1': 'value1_new', 'data-myAttr2': 'value2_new' } );
				
				cmp.render( 'body' );
				Y.Assert.areSame( 'value1_new', cmp.getEl().attr( 'data-myAttr1' ) );
				Y.Assert.areSame( 'value2_new', cmp.getEl().attr( 'data-myAttr2' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setAttr() should add a set of attributes when rendered" : function() {
				var cmp = new ui.Component( {
					renderTo: 'body' 
				} );
				
				cmp.setAttr( { 'data-myAttr1': 'value1', 'data-myAttr2': 'value2' } );
				
				Y.Assert.areSame( 'value1', cmp.getEl().attr( 'data-myAttr1' ) );
				Y.Assert.areSame( 'value2', cmp.getEl().attr( 'data-myAttr2' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setAttr() should overwrite a set of attributes when rendered" : function() {
				var cmp = new ui.Component( {
					renderTo: 'body',
					attr: { 'data-myAttr1': 'value1', 'data-myAttr2': 'value2' } 
				} );
				
				cmp.setAttr( { 'data-myAttr1': 'value1_new', 'data-myAttr2': 'value2_new' } );
				
				Y.Assert.areSame( 'value1_new', cmp.getEl().attr( 'data-myAttr1' ) );
				Y.Assert.areSame( 'value2_new', cmp.getEl().attr( 'data-myAttr2' ) );
				
				cmp.destroy();  // clean up
			}
		},
		
		
		/*
		 * Test addCls()
		 */
		{
			name : "Test addCls()",
			
			
			"addCls() should add a CSS class when unrendered" : function() {
				var cmp = new ui.Component();
				cmp.addCls( 'testCls' );
				
				// Now render and check if the class is on it
				cmp.render( document.body );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"addCls() should add a CSS class when unrendered, and when it has an initial css class" : function() {
				var cmp = new ui.Component( { cls: 'initialCls' } );
				cmp.addCls( 'testCls' );
				
				// Now render and check if the classes are on it
				cmp.render( document.body );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'initialCls' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"addCls() should add multiple, space-delimited CSS classes when unrendered" : function() {
				var cmp = new ui.Component( { cls: 'initialCls' } );
				cmp.addCls( 'testCls1 testCls2' );
				
				// Now render and check if the classes are on it
				cmp.render( document.body );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'initialCls' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls1' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls2' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"addCls() should not add a duplicate CSS class when unrendered" : function() {
				var cmp = new ui.Component( { cls: 'initialCls' } );
				cmp.addCls( 'initialCls' );
				
				// We have to check the private 'cls' property to fully check this
				Y.Assert.areSame( 'initialCls', cmp.cls );
				
				// Now render and check if the class is on it
				cmp.render( document.body );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'initialCls' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"addCls() should not add duplicate CSS classes when unrendered" : function() {
				var cmp = new ui.Component( { cls: 'initialCls' } );
				cmp.addCls( 'testCls1 testCls1 initialCls' );
				
				// We have to check the private 'cls' property to fully check this
				Y.Assert.areSame( 'initialCls testCls1', cmp.cls );
				
				// Now render and check if the classes are on it
				cmp.render( document.body );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'initialCls' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls1' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			
			"addCls() should add a CSS class when rendered" : function() {
				var cmp = new ui.Component( { renderTo: document.body } );
				cmp.addCls( 'testCls' );
				
				// Now check if the class is on it
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"addCls() should add multiple, space-delimited CSS classes when rendered" : function() {
				var cmp = new ui.Component( { renderTo: document.body } );
				cmp.addCls( 'testCls1 testCls2' );
				
				// Now check if the classes are on it
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls1' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls2' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"addCls() should not add a duplicate CSS class when rendered" : function() {
				var cmp = new ui.Component( { renderTo: document.body, cls: 'initialCls' } );
				cmp.addCls( 'initialCls' );
				
				// Need to pull off the className for the element to fully check this
				Y.Assert.areSame( 'initialCls', cmp.getEl()[ 0 ].className );
				
				// Now check if the class is on it
				Y.Assert.isTrue( cmp.getEl().hasClass( 'initialCls' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"addCls() should not add duplicate CSS classes when rendered" : function() {
				var cmp = new ui.Component( { renderTo: document.body, cls: 'initialCls' } );
				cmp.addCls( 'initialCls testCls testCls' );
				
				// Need to pull off the className for the element to fully check this
				Y.Assert.areSame( 'initialCls testCls', cmp.getEl()[ 0 ].className );
				
				// Now check if the classes are on it
				Y.Assert.isTrue( cmp.getEl().hasClass( 'initialCls' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls' ) );
				
				cmp.destroy();  // clean up
			}
		},
		
		
		/*
		 * Test removeCls()
		 */
		{
			name : "Test removeCls()",
			
			"removeCls() should remove a CSS class when unrendered" : function() {
				var cmp = new ui.Component();
				cmp.addCls( 'testCls1 testCls2' );
				cmp.removeCls( 'testCls1' );				
				
				// Now render and check if the correct class(es) are on it
				cmp.render( document.body );
				Y.Assert.isFalse( cmp.getEl().hasClass( 'testCls1' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls2' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"removeCls() should remove a CSS class when unrendered, and when it has an initial css class" : function() {
				var cmp = new ui.Component( { cls: 'initialCls testCls' } );
				cmp.removeCls( 'initialCls' );
				
				// Now render and check if the correct class(es) are on it
				cmp.render( document.body );
				Y.Assert.isFalse( cmp.getEl().hasClass( 'initialCls' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'testCls' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"removeCls() should remove multiple, space-delimited CSS classes when unrendered" : function() {
				var cmp = new ui.Component( { cls: 'initialCls1 initialCls2 initialCls3' } );
				cmp.removeCls( 'initialCls1 initialCls2' );
				
				// Now render and check if the correct class(es) are on it
				cmp.render( document.body );
				Y.Assert.isFalse( cmp.getEl().hasClass( 'initialCls1' ) );
				Y.Assert.isFalse( cmp.getEl().hasClass( 'initialCls2' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'initialCls3' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"removeCls() should remove multiple, space-delimited CSS classes when unrendered (removing the last CSS class)" : function() {
				var cmp = new ui.Component( { cls: 'initialCls1 initialCls2 initialCls3' } );
				cmp.removeCls( 'initialCls1 initialCls3' );
				
				// Now render and check if the correct class(es) are on it
				cmp.render( document.body );
				Y.Assert.isFalse( cmp.getEl().hasClass( 'initialCls1' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'initialCls2' ) );
				Y.Assert.isFalse( cmp.getEl().hasClass( 'initialCls3' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"removeCls() should remove a CSS class when rendered" : function() {
				var cmp = new ui.Component( { renderTo: document.body, cls: 'initialCls1 initialCls2' } );
				cmp.removeCls( 'initialCls1' );
				
				// Now check if the correct class(es) are on it
				Y.Assert.isFalse( cmp.getEl().hasClass( 'initialCls1' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'initialCls2' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"removeCls() should remove multiple, space-delimited CSS classes when rendered" : function() {
				var cmp = new ui.Component( { renderTo: document.body, cls: 'initialCls1 initialCls2 initialCls3' } );
				cmp.removeCls( 'initialCls1 initialCls2' );
				
				// Now check if the correct class(es) are on it
				Y.Assert.isFalse( cmp.getEl().hasClass( 'initialCls1' ) );
				Y.Assert.isFalse( cmp.getEl().hasClass( 'initialCls2' ) );
				Y.Assert.isTrue( cmp.getEl().hasClass( 'initialCls3' ) );
				
				cmp.destroy();  // clean up
			}
		},


		/*
		 * Test toggleCls()
		 */
		{
			name : "Test toggleCls()",
			
			// Tests with simply swapping the css class in and out
			
			"toggleCls() should add a CSS class if it is not yet applied (when the component is unrendered)" : function() {
				var cmp = new ui.Component();
				cmp.toggleCls( 'testCls1' );
				
				Y.Assert.isTrue( cmp.hasCls( 'testCls1' ) );
				
				cmp.destroy();  // clean up
			},
			
			"toggleCls() should add a CSS class if it is not yet applied (when the component is rendered)" : function() {
				var cmp = new ui.Component( { renderTo: document.body } );
				cmp.toggleCls( 'testCls1' );
				
				Y.Assert.isTrue( cmp.hasCls( 'testCls1' ) );
				
				cmp.destroy();  // clean up
			},
			
			"toggleCls() should remove a CSS class if it is already applied (when then component is unrendered)" : function() {
				var cmp = new ui.Component( { cls: 'testCls1' } );
				cmp.toggleCls( 'testCls1' );
				
				Y.Assert.isFalse( cmp.hasCls( 'testCls1' ) );
				
				cmp.destroy();  // clean up
			},
			
			"toggleCls() should remove a CSS class if it is already applied (when then component is rendered)" : function() {
				var cmp = new ui.Component( { renderTo: document.body, cls: 'testCls1' } );
				cmp.toggleCls( 'testCls1' );
				
				Y.Assert.isFalse( cmp.hasCls( 'testCls1' ) );
				
				cmp.destroy();  // clean up
			},
			
			// --------------------------------
			
			
			// Tests with the `flag` argument
			
			"toggleCls() should add a CSS class when flag === true" : function() {
				var cmp = new ui.Component();
				cmp.toggleCls( 'testCls1', /* flag */ true );
				
				Y.Assert.isTrue( cmp.hasCls( 'testCls1' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"toggleCls() should basically leave the CSS class alone if it's already there and flag === true" : function() {
				var cmp = new ui.Component( { cls: 'testCls1' } );
				cmp.toggleCls( 'testCls1', /* flag */ true );
				
				Y.Assert.isTrue( cmp.hasCls( 'testCls1' ) );
				
				// As a double check, test the actual `cls` property
				Y.Assert.areSame( 'testCls1', cmp.cls, "The `cls` property should have exactly 'testCls1'" );
				
				cmp.destroy();  // clean up
			},
			

			"toggleCls() should remove a CSS class when flag === false" : function() {
				var cmp = new ui.Component( { cls: 'testCls1' } );
				cmp.toggleCls( 'testCls1', /* flag */ false );

				Y.Assert.isFalse( cmp.hasCls( 'testCls1' ) );
				
				cmp.destroy();  // clean up
			},
			

			"toggleCls() should basically leave the CSS class alone if it's not there and flag === false" : function() {
				var cmp = new ui.Component();
				cmp.toggleCls( 'testCls1', /* flag */ false );

				Y.Assert.isFalse( cmp.hasCls( 'testCls1' ) );
				
				cmp.destroy();  // clean up
			}
		},
		
		
		/*
		 * Test hasCls()
		 */
		{
			name : "Test hasCls()",
			
			"hasCls() should determine if the component has a class when unrendered" : function() {
				var cmp = new ui.Component( { cls: 'testCls1' } );
				Y.Assert.isTrue( cmp.hasCls( 'testCls1' ) );
				Y.Assert.isFalse( cmp.hasCls( 'testCls2' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"hasCls() should determine if the component has a class when rendered" : function() {
				var cmp = new ui.Component( { renderTo: document.body, cls: 'testCls1' } );
				Y.Assert.isTrue( cmp.hasCls( 'testCls1' ) );
				Y.Assert.isFalse( cmp.hasCls( 'testCls2' ) );
				
				cmp.destroy();  // clean up
			}
		},
		
		
		/*
		 * Test setStyle()
		 */
		{
			name : "Test setStyle()",
			
			
			"setStyle() should add a style property when unrendered" : function() {
				var cmp = new ui.Component();
				cmp.setStyle( 'margin-left', '1px' );
				
				cmp.render( 'body' );
				Y.Assert.areSame( '1px', cmp.getEl().css( 'margin-left' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setStyle() should overwrite a style property when unrendered" : function() {
				var cmp = new ui.Component( { 
					attr: { 'margin-left' : '1px' } 
				} );
				cmp.setStyle( 'margin-left', '2px' );
				
				cmp.render( 'body' );
				Y.Assert.areSame( '2px', cmp.getEl().css( 'margin-left' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setStyle() should add a style property when rendered" : function() {
				var cmp = new ui.Component( { renderTo: 'body' } );
				
				cmp.setStyle( 'margin-left', '1px' );
				Y.Assert.areSame( '1px', cmp.getEl().css( 'margin-left' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setStyle() should overwrite a style property when rendered" : function() {
				var cmp = new ui.Component( { 
					renderTo: 'body',
					attr: { 'margin-left' : '1px' } 
				} );
				
				cmp.setStyle( 'margin-left', '2px' );
				Y.Assert.areSame( '2px', cmp.getEl().css( 'margin-left' ) );
				
				cmp.destroy();  // clean up
			},
			
			
			"setStyle() should add a set of style properties when unrendered" : function() {
				var cmp = new ui.Component();
				
				cmp.setStyle( { 'margin-left': '1px', 'margin-right': '2px' } );
				
				cmp.render( 'body' );
				Y.Assert.areSame( '1px', cmp.getEl().css( 'margin-left' ) );
				Y.Assert.areSame( '2px', cmp.getEl().css( 'margin-right' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setStyle() should overwrite a set of style properties when unrendered" : function() {
				var cmp = new ui.Component( {
					attr: { 'margin-left': '1px', 'margin-right': '2px' } 
				} );
				
				cmp.setStyle( { 'margin-left': '3px', 'margin-right': '4px' } );
				
				cmp.render( 'body' );
				Y.Assert.areSame( '3px', cmp.getEl().css( 'margin-left' ) );
				Y.Assert.areSame( '4px', cmp.getEl().css( 'margin-right' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setStyle() should add a set of style properties when rendered" : function() {
				var cmp = new ui.Component( {
					renderTo: 'body' 
				} );
				
				cmp.setStyle( { 'margin-left': '1px', 'margin-right': '2px' } );
				
				Y.Assert.areSame( '1px', cmp.getEl().css( 'margin-left' ) );
				Y.Assert.areSame( '2px', cmp.getEl().css( 'margin-right' ) );
				
				cmp.destroy();  // clean up
			},
			
			"setStyle() should overwrite a set of style properties when rendered" : function() {
				var cmp = new ui.Component( {
					renderTo: 'body',
					attr: { 'margin-left': '1px', 'margin-right': '2px' } 
				} );
				
				cmp.setStyle( { 'margin-left': '3px', 'margin-right': '4px' } );
				
				Y.Assert.areSame( '3px', cmp.getEl().css( 'margin-left' ) );
				Y.Assert.areSame( '4px', cmp.getEl().css( 'margin-right' ) );
				
				cmp.destroy();  // clean up
			}
		},
		
		
		
		// -------------------------
		
		
		/*
		 * Test setSize()
		 */
		{
			name : "Test setSize()",
			
			setUp : function() {
				this.cmp = new ui.Component();
			},
			
			tearDown : function() {
				this.cmp.destroy();  // clean up
			},
			
			
			"setSize() should set the width and height of the Component in an unrendered state" : function() {
				var cmp = this.cmp;
				cmp.setSize( 10, 20 );
				
				Y.Assert.areSame( 10, cmp.getConfiguredWidth(), "The width should have been set" );
				Y.Assert.areSame( 20, cmp.getConfiguredHeight(), "The height should have been set" );
			},
			
			"setSize() should set the width and height of the Component in a rendered state" : function() {
				var cmp = this.cmp;
				
				cmp.render( 'body' );
				cmp.setStyle( 'position', 'absolute' );
				cmp.setSize( 10, 20 );
				
				Y.Assert.areSame( 10, cmp.getWidth(), "The width should have been set" );
				Y.Assert.areSame( 20, cmp.getHeight(), "The height should have been set" );
			},
			
			
			"setSize() should set the width only if that is the only argument provided to the method" : function() {
				var cmp = this.cmp;
				cmp.setSize( 10, 20 );  // initial
				
				Y.Assert.areSame( 10, cmp.getConfiguredWidth(), "Initial condition: The width should have been set" );
				Y.Assert.areSame( 20, cmp.getConfiguredHeight(), "Initial condition: The height should have been set" );
				
				// Now change with just with width
				cmp.setSize( 42, undefined );  // undefined for height
				Y.Assert.areSame( 42, cmp.getConfiguredWidth(), "The width should have been set" );
				Y.Assert.areSame( 20, cmp.getConfiguredHeight(), "The height should remain unchanged" );
			},
			
			"setSize() should set the height only if that is the only argument provided to the method" : function() {
				var cmp = this.cmp;
				cmp.setSize( 10, 20 );  // initial
				
				Y.Assert.areSame( 10, cmp.getConfiguredWidth(), "Initial condition: The width should have been set" );
				Y.Assert.areSame( 20, cmp.getConfiguredHeight(), "Initial condition: The height should have been set" );
				
				// Now change with just with width
				cmp.setSize( undefined, 42 );  // undefined for width
				Y.Assert.areSame( 10, cmp.getConfiguredWidth(), "The width should remain unchanged" );
				Y.Assert.areSame( 42, cmp.getConfiguredHeight(), "The height should have been set" );
			}
		},
		
		
		
		/*
		 * Test setWidth()
		 */
		{
			name : "Test setWidth()",
			
			setUp : function() {
				this.cmp = new ui.Component();
			},
			
			tearDown : function() {
				this.cmp.destroy();  // clean up
			},
			
			
			"setWidth() should set the width of the Component in an unrendered state" : function() {
				var cmp = this.cmp;
				cmp.setWidth( 10 );
				
				Y.Assert.areSame( 10, cmp.getConfiguredWidth(), "The width should have been set" );
			},
			
			"setWidth() should set the width of the Component in a rendered state" : function() {
				var cmp = this.cmp;
				
				cmp.render( 'body' );
				cmp.setStyle( 'position', 'absolute' );
				cmp.setWidth( 10 );
				
				Y.Assert.areSame( 10, cmp.getWidth(), "The width should have been set" );
			}
		},
		
		
		
		/*
		 * Test setHeight()
		 */
		{
			name : "Test setHeight()",
			
			setUp : function() {
				this.cmp = new ui.Component();
			},
			
			tearDown : function() {
				this.cmp.destroy();  // clean up
			},
			
			
			"setHeight() should set the height of the Component in an unrendered state" : function() {
				var cmp = this.cmp;
				cmp.setHeight( 10 );
				
				Y.Assert.areSame( 10, cmp.getConfiguredHeight(), "The height should have been set" );
			},
			
			"setHeight() should set the height of the Component in a rendered state" : function() {
				var cmp = this.cmp;
				
				cmp.render( 'body' );
				cmp.setStyle( 'position', 'absolute' );
				cmp.setHeight( 10 );
				
				Y.Assert.areSame( 10, cmp.getHeight(), "The height should have been set" );
			}
		},
		
		
		
		// -------------------------
		
		
		/*
		 * Test detach()
		 */
		{
			name : "Test detach()",
			
			"detach() should have no effect on an unrendered Component" : function() {
				var cmp = new ui.Component();
				cmp.detach();
				
				// Test should simply not error (making sure we check the unrendered case before trying to access cmp.$el)
				
				cmp.destroy();  // clean up
			},
			
			
			"detach() should detach the element from the DOM if it is rendered" : function() {
				var cmp = new ui.Component( {
					elId : "__ComponentTest_detachMethod_el",
					renderTo: 'body'
				} );
				
				// Attach a click handler onto the element, to make sure that the element is simply detached, and not removed
				var clickCount = 0;
				cmp.getEl().bind( 'click', function() { clickCount++; } );
				
				Y.Assert.areSame( 1, jQuery( '#__ComponentTest_detachMethod_el' ).length, "Initial condition: The element should be in the DOM" );
				Y.Assert.areSame( 0, clickCount, "Initial condition: the click count should be 0" );
				
				// Now detach
				cmp.detach();
				Y.Assert.areSame( 0, jQuery( '#__ComponentTest_detachMethod_el' ).length, "The element should no longer be in the DOM" );
				
				// And re-attach via render()
				cmp.render( 'body' );
				Y.Assert.areSame( 1, jQuery( '#__ComponentTest_detachMethod_el' ).length, "The element should be in the DOM again after being re-attached" );
				
				// Should still be able to "click" the component (as it was only detached, not removed)
				cmp.getEl().trigger( 'click' );
				Y.Assert.areSame( 1, clickCount, "The element should still have been able to be clicked (as it was only detached, not removed)" );
				
				
				cmp.destroy();  // clean up
			}
		},
		
		
		// -------------------------
		
		
		// TODO: Add masking tests
		
		
		// -------------------------
			
		{	
			/*
			 * Test ui.Component.bubble()
			 */
			test_bubble : function() {
				// Test that the ID's can be compiled from a component's parents
				var component = new ui.Component( {
					id : "component"
				} );
				var container = new ui.Container( {
					id : "container1",
					
					items : {
						id : "container2",
						
						items : component 
					}
				} );
				
				var ids = [];
				component.bubble( function( cmp ) {
					ids.push( cmp.getId() );
				} );
				Y.Assert.isTrue( Jux.areEqual( [ "component", "container2", "container1" ], ids ), "ids not retrieved properly through the bubble. ids var: " + ids.join(',') ); 
				
				
				// Test returning false after "container2" is reached
				var ids = [];
				component.bubble( function( cmp ) {
					ids.push( cmp.getId() );
					if( cmp.getId() === "container2" ) {
						return false;
					}
				} );
				Y.Assert.isTrue( Jux.areEqual( [ "component", "container2" ], ids ), "ids not retrieved properly through the bubble, when attempting to cancel at container2. ids var: " + ids.join(',') ); 
				
			},
			
			
			
			/*
			 * Test ui.Component.findParentBy()
			 */
			test_findParentBy : function() {
				// Test with one level of children, one item
				var child = new ui.Component( {
					id: 'child'
				} );
				var container = new ui.Container( {
					id: 'parent',
					
					items: child
				} );
				
				var parentContainer = child.findParentBy( function( cmp ) {
					if( cmp.getId() === 'parent' ) {
						return true;
					}
				} );
				Y.Assert.isObject( parentContainer, "Container not retrieved from child at first level." );
				Y.Assert.areEqual( container, parentContainer, "parentContainer that was retrieved does not match the actual container." );
				
				
				// Quick test to make sure that searching for a parent container that doesn't exist returns null
				var parentContainer = child.findParentBy( function( cmp ) {
					if( cmp.getId() === 'non-existent' ) { 
						return true;
					}
				} );
				Y.Assert.isNull( parentContainer, "findParentBy returned a non-null value when searching for a non-existent Container" );
				
				
				// ----------------------------
				
				
				// Test with one level of children, multiple items
				var container = new ui.Container( {
					id: 'parent',
					
					items: [
						{ type : 'Text', key : 'myKey1' },
						{ type : 'Text', key : 'myKey2' },
						{ type : 'Text', key : 'myKey3' },
						{ type : 'Text', key : 'myKey4' }
					]
				} );
				
				// Test them all, to make sure the first, the middle ones, and the last one can retrieve their parent
				for( var i = 1; i <= 4; i++ ) {
					var child = container.findByKey( 'myKey' + i );
					var parentContainer = child.findParentBy( function( cmp ) {
						if( cmp.getId() === 'parent' ) {
							return true;
						}
					} );
					Y.Assert.areEqual( container, parentContainer, "child " + i + " could not retrieve its parent from first level children." );
				}
				
				
				// ----------------------------
				
				
				// Test with multiple levels of children, multiple items
				var container = new ui.Container( {
					id: 'parent',
					
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
				
				// Test them all, to make sure that their highest level parent can be retrieved at any level
				for( var i = 1; i <= 7; i++ ) {
					var child = container.findByKey( 'myKey' + i );
					var parentContainer = child.findParentBy( function( cmp ) {
						if( cmp.getId() === 'parent' ) {
							return true;
						}
					} );
					Y.Assert.areEqual( container, parentContainer, "child " + i + " could not retrieve its parent from deep children." );
				}
				
				
				// ----------------------------
				
				
				// Test with multiple levels of children, multiple items, and retrieving parents that may not be the root level parent
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
							id    : 'localParent',
							
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
				
				var parent = container.findById( 'localParent' );
				var child = container.findByKey( 'myKey7' );
				var parentContainer = child.findParentBy( function( cmp ) {
					if( cmp.getId() === 'localParent' ) {
						return true;
					}
				} );
				Y.Assert.areEqual( parent, parentContainer, "looking from deep child to find a parent other than the root parent did not work" );
				
			},
			
			
			
			/*
			 * Test ui.Component.findParentByType
			 */
			test_findParentByType : function() {
				var container = new ui.Container( {
					id: 'parent',
					
					items: [
						{ 
							type  : 'Tabs',
							id    : 'parentTabs',
							
							items : [
								{ type : 'Text', id: "testChild1" },
								{ type : 'Text', id: "testChild2" }
							]
						},
						
						{ type : 'Text', key : 'myKey1' },
						
						{
							type  : 'Container',
							id    : 'parentContainer',
							
							items : [
								{ type : 'Text', key : 'myKey2' },
								{ type : 'Text', key : 'myKey3' },
								{
									type  : 'Container',
									id    : 'parentContainer2',
									items : [
										{ type : 'Text', key : 'myKey4' },
										{ type : 'Text', key : 'myKey5' },
										{ type : 'Text', key : 'myKey6' }
									]
								}
							]
						}
					]
				} );
				
				// Test checking against the actual constructor function
				var myKey1 = container.findByKey( 'myKey1' );
				Y.Assert.areEqual( container, myKey1.findParentByType( ui.Container, "Outer container not found from myKey1" ) );
				
				var parentTabs = container.findById( 'parentTabs' );
				var testChild1 = container.findById( 'testChild1' );
				var testChild2 = container.findById( 'testChild2' );
				Y.Assert.areEqual( parentTabs, testChild1.findParentByType( ui.containers.TabsContainer ), "Parent TabsContainer not found from testChild1" );
				Y.Assert.areEqual( parentTabs, testChild2.findParentByType( ui.containers.TabsContainer ), "Parent TabsContainer not found from testChild2" );
				
				var parentContainer = container.findById( 'parentContainer' );
				var myKey2 = container.findByKey( 'myKey2' );
				Y.Assert.areEqual( parentContainer, myKey2.findParentByType( ui.Container ), "parentContainer not found from myKey2" );
				
				var parentContainer2 = container.findById( 'parentContainer2' );
				var myKey5 = container.findByKey( 'myKey5' );
				Y.Assert.areEqual( parentContainer2, myKey5.findParentByType( ui.Container ), "parentContainer2 not found from myKey5" );
				
				
				// Test checking against the type name
				var myKey1 = container.findByKey( 'myKey1' );
				Y.Assert.areEqual( container, myKey1.findParentByType( 'Container', "Outer container not found from myKey1 by type name" ) );
				
				var parentTabs = container.findById( 'parentTabs' );
				var testChild1 = container.findById( 'testChild1' );
				var testChild2 = container.findById( 'testChild2' );
				Y.Assert.areEqual( parentTabs, testChild1.findParentByType( 'Tabs' ), "Parent TabsContainer not found from testChild1 by type name" );
				Y.Assert.areEqual( parentTabs, testChild2.findParentByType( 'Tabs' ), "Parent TabsContainer not found from testChild2 by type name" );
				
				var parentContainer = container.findById( 'parentContainer' );
				var myKey2 = container.findByKey( 'myKey2' );
				Y.Assert.areEqual( parentContainer, myKey2.findParentByType( 'Container' ), "parentContainer not found from myKey2 by type name" );
				
				var parentContainer2 = container.findById( 'parentContainer2' );
				var myKey5 = container.findByKey( 'myKey5' );
				Y.Assert.areEqual( parentContainer2, myKey5.findParentByType( 'Container' ), "parentContainer2 not found from myKey5 by type name" );
			},
			
			
			
			/*
			 * Test ui.Container.findParentById()
			 */
			test_findParentById : function() {
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
				
				
				// Tests just getting parents
				var myKey1 = container.findByKey( 'myKey1' );
				Y.Assert.areEqual( 'myKey1', myKey1.getKey(), "Error with precondition of retrieving the correct Component (myKey1) with findByKey()" );
				Y.Assert.isNull( myKey1.findParentById( 'non-existent-container-id' ), "Null not returned when finding a parent called non-existent-container-id from myKey1." );
				Y.Assert.areSame( container, myKey1.findParentById( 'top' ), "Top level Container not found from myKey1" );
				Y.Assert.areSame( container.findById( 'first' ), myKey1.findParentById( 'first' ), "Container 'first' not found from myKey1" );
				Y.Assert.isNull( myKey1.findParentById( 'second' ), "Container 'second' was somehow found from myKey1, even though it is not a parent of myKey1." );
				
				var myKey2 = container.findByKey( 'myKey2' );
				Y.Assert.areEqual( 'myKey2', myKey2.getKey(), "Error with precondition of retrieving the correct Component (myKey2) with findByKey()" );
				Y.Assert.areSame( container, myKey2.findParentById( 'top' ), "Top level Container not found from myKey2" );
				Y.Assert.isNull( myKey2.findParentById( 'first' ), "Container 'first' was somehow found from myKey2, even though it is not a parent of myKey2." );
				
				var myKey7 = container.findByKey( 'myKey7' );
				Y.Assert.areEqual( 'myKey7', myKey7.getKey(), "Error with precondition of retrieving the correct Component (myKey7) with findByKey()" );
				Y.Assert.isNull( myKey7.findParentById( 'non-existent-container-id' ), "Null not returned when finding a parent called non-existent-container-id from myKey7." );
				Y.Assert.areSame( container, myKey7.findParentById( 'top' ), "Top level Container not found from myKey7" );
				Y.Assert.isNull( myKey7.findParentById( 'first' ), "Container 'first' was somehow found from myKey7, even though it is not a parent of myKey7." );
				Y.Assert.areSame( container, myKey7.findParentById( 'top' ), "Top level Container not found from myKey1" );
				Y.Assert.areSame( myKey7.findParentById( 'second' ), myKey7.findParentById( 'second' ), "Container 'second' not found from myKey7" );
				Y.Assert.areSame( myKey7.findParentById( 'second_nested' ), myKey7.findParentById( 'second_nested' ), "Container 'second_nested' not found from myKey7" );
			}
		},   // eo "General Tests" test case
		
		
		
		
		
		/*
		 * Test ui.Component.destroy() 
		 */
		{
			name : "Test ui.Component.destroy()",
			
			
			"destroy() should remove all event handlers" : function() {
				var component = new ui.Component( {
					listeners : {
						'render'        : function() {},
						'beforedestroy' : function() {},
						'destroy'       : function() {} 
					}
				} );
				
				Y.Assert.isTrue( component.hasListener( 'render' ), "failed on initial condition. render event should have listener at this point." );
				Y.Assert.isTrue( component.hasListener( 'beforedestroy' ), "failed on initial condition. beforedestroy event should have listener at this point." );
				Y.Assert.isTrue( component.hasListener( 'destroy' ), "failed on initial condition. destroy event should have listener at this point." );
				component.destroy();
				Y.Assert.isFalse( component.hasListener( 'render' ), "error: render event should no longer have any listeners." );
				Y.Assert.isFalse( component.hasListener( 'beforedestroy' ), "error: beforedestroy event should no longer have any listeners." );
				Y.Assert.isFalse( component.hasListener( 'destroy' ), "error: destroy event should no longer have any listeners." );
			},
			
			
			"destroy() should set the 'destroyed' flag to true after destruction" : function() {
				var component = new ui.Component();
				Y.Assert.isFalse( component.destroyed, "failed on initial condition. destroyed flag should be false." );
				
				component.destroy();
				Y.Assert.isTrue( component.destroyed, "destroyed flag should now be true." );
			},
			
			
			"destroy() should set the 'rendered' flag back to false after destruction" : function() {
				var component = new ui.Component( {
					renderTo: jQuery( 'body' )
				} );
				Y.Assert.isTrue( component.rendered, "failed on initial condition. rendered flag should be true." );
				
				component.destroy();
				Y.Assert.isFalse( component.rendered, "rendered flag should now be false." );
			},
			
			
			"A beforedestroy handler should be able to cancel the destruction process" : function() {
				var component = new ui.Component( {
					listeners : {
						'beforedestroy' : function() {
							return false;
						}
					}
				} );
				component.destroy();
				Y.Assert.isFalse( component.destroyed, "the component has been destroyed, even though a beforedestroy handler returned false (which should have canceled the destruction process)" );
			},
			
			
			"destroy() should not destroy the component more than once" : function() {
				var destroyCount = 0;
				var component = new ui.Component( {
					// template method override
					onDestroy : function() {
						ui.Component.prototype.onDestroy.call( this );
						
						destroyCount++;
					}
				} );
				component.destroy();
				Y.Assert.isTrue( component.destroyed, "component should now be destroyed" );
				Y.Assert.areEqual( 1, destroyCount, "destroyCount should now be 1" );
				
				component.destroy();  // attempt to destroy the component again
				Y.Assert.areEqual( 1, destroyCount, "destroyCount should still be 1, not 2. the component should not have been destroyed twice" );
			},
			
			
			"destroy() should remove the Component's element from the DOM (if the Component is rendered)" : function() {
				var component = new ui.Component( {
					renderTo: jQuery( 'body' )
				} );
				var $componentEl = component.getEl();
				
				Y.Assert.isTrue( component.rendered, "Failed on initial condition. Component should be rendered" );
				Y.Assert.isTrue( jQuery( 'body' ).has( $componentEl ).length > 0, "Failed on initial condition. component's element should be in the document body" );
				
				component.destroy();
				Y.Assert.isTrue( jQuery( 'body' ).has( $componentEl ).length === 0, "The component's element should now be removed from the document body" );
			},
			
			
			"destroy() should remove all HTMLElement and jQuery references held by a ui.Component upon destruction" : function() {
				// Create a ui.Component subclass that creates an HTML element and a jQuery wrapped set
				var ComponentSubClass = Jux.extend( ui.Component, {
					initComponent : function() {
						this.$wrappedSet = jQuery( '<div />' );
						this.divElement = document.createElement( 'DIV' );
					}
				} );
				
				var myComponent = new ComponentSubClass();
				
				// Initial conditions
				Y.Assert.isTrue( Jux.isJQuery( myComponent.$wrappedSet ), "$wrappedSet should initially be a jQuery wrapped set" );
				Y.Assert.isTrue( Jux.isElement( myComponent.divElement ), "divElement should initially be an HTMLElement" );
				
				myComponent.destroy();
				
				Y.Assert.isUndefined( myComponent.$wrappedSet, "$wrappedSet property (a jQuery object) should have been deleted from the object" );
				Y.Assert.isUndefined( myComponent.divElement, "divElement property (an HTMLElement) should have been deleted from the object" );
			},
			
			
			"destroy() should remove all HTMLElement and jQuery references held by a ui.Component from the DOM upon destruction" : function() {
				// Create a ui.Component subclass that creates an HTML element and a jQuery wrapped set
				var ComponentSubClass = Jux.extend( ui.Component, {
					initComponent : function() {
						// NOTE: These two elements are intentionally not appended to the Component's element, so that the automatic recursive
						// removal of $el does not effect them. It is possible that Components add elements in other places in the DOM, such as
						// with the overlay dropdown menu in ui.formFields.DropdownField.
						this.$wrappedSet = jQuery( '<div id="ui-component-test-destruction-1" />' )
							.appendTo( document.body );
						
						this.divElement = document.createElement( 'DIV' );
						this.divElement.id = "ui-component-test-destruction-2";
						document.body.appendChild( this.divElement );
					}
				} );
				
				var myComponent = new ComponentSubClass();
				
				// Initial conditions - elements should exist in the DOM
				Y.Assert.isNotNull( document.getElementById( 'ui-component-test-destruction-1' ), "The wrapped set's element ($wrappedSet[0]) should initially exist in the DOM" );
				Y.Assert.isNotNull( document.getElementById( 'ui-component-test-destruction-2' ), "The HTMLElement (divElement) should initially exist in the DOM" );
				
				myComponent.destroy();
				
				Y.Assert.isNull( document.getElementById( 'ui-component-test-destruction-1' ), "The wrapped set's element ($wrappedSet[0]) should no longer exist in the DOM" );
				Y.Assert.isNull( document.getElementById( 'ui-component-test-destruction-2' ), "The HTMLElement (divElement) should no longer exist in the DOM" );
			}
			
		}  // eo destroy() tests
	
	]
	
} ) );
