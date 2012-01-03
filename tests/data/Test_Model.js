/*global window, Ext, Y, Kevlar */
Ext.test.Session.addSuite( 'Kevlar.data', {
                                                 
	name: 'Kevlar.data.Model',
	
	
	items : [
	
		{
			/*
			 * Test Fields Inheritance
			 */
			name: 'Test Fields Inheritance',
			
	
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
			
			
			
			/*
			 * Utility method to remove duplicates from an array. Used by {@link #assertFieldsHashCorrect} for its check for the number of
			 * fields that should exist.  Uses a hash to remove duplicates.
			 * 
			 * @method removeArrayDuplicates 
			 * @param {Array} arr
			 */
			removeArrayDuplicates : function( arr ) {
				var out=[], obj={};
				
				for( var i = 0, len = arr.length; i < len; i++ ) {
					obj[ arr[ i ] ] = 0;
				}
				for( i in obj ) { if( obj.hasOwnProperty( i ) ) { out.push( i ); } }
				
				return out;
			},
			
			
			/*
			 * Given a Model (provided as the last arg), and its superclasses, asserts that the number of fields found on the prototypes of each Model
			 * matches the number of keys in the final {@link Kevlar.data.Model#fields} hash, and that there is one key for each Field
			 * found in the 'fields' prototype arrays.
			 * 
			 * Basically asserts that the final hash that the Kevlar.data.Model compiles from itself, and all of its superclasses, is correct.
			 * 
			 * @method assertFieldsHashCorrect
			 * @param {Kevlar.data.Model...} One or more Model classes, starting with the highest level Model (the "highest superclass" Model),
			 *   going all the way down to the lowest subclass Model.  Ex of args: Model, SubClassModel, SubSubClassModel. In this example,
			 *   the SubSubClassModel is the Model that will be tested.  
			 */
			assertFieldsHashCorrect : function( /* ... */ ) {
				var models = Kevlar.toArray( arguments ),
				    i, len;
				
				// Get the full array of prototype fields (from the Model, SubClassModel, SubSubClassModel, etc), and the expected number of fields
				var prototypeFields = [];
				for( i = 0, len = models.length; i < len; i++ ) {
					var currentPrototype = models[ i ].prototype;
					if( currentPrototype.hasOwnProperty( 'fields' ) ) {
						prototypeFields = prototypeFields.concat( models[ i ].prototype.fields );
					}
				}
				
				// Convert the array to a duplicates-removed array of field names
				var fieldNames = [];
				for( i = 0, len = prototypeFields.length; i < len; i++ ) {
					var fieldName = new Kevlar.data.Field( prototypeFields[ i ] ).getName();
					fieldNames.push( fieldName );
				}
				fieldNames = this.removeArrayDuplicates( fieldNames );
				var expectedFieldCount = fieldNames.length;
				
				
				// Check the instance fields of the Model under test now
				var instance = new models[ models.length - 1 ](),  // the last Model class provided to the method. It is assumed that all previous arguments are its superclasses
				    instanceFields = instance.fields;
				
				var fieldCount = Kevlar.Object.objLength( instanceFields, /* filter prototype */ true );
				Y.Assert.areSame( expectedFieldCount, fieldCount, "There should be the same number of resulting fields in the 'instanceFields' hash as the original 'fields' arrays of the Model classes." );
				
				// Check that all of the fields defined by each Model's prototype exist in the final 'fields' hash
				for( i = 0, len = fieldNames.length; i < len; i++ ) {
					Y.ObjectAssert.hasKey( fieldNames[ i ], instanceFields, "The Model (last arg to assertFieldsHashCorrect) should have defined the '" + fieldNames[ i ] + "' field in its final 'fields' hash" );
				}
			},
			
			// ---------------------------
			
			
			// Tests
			
			
			"The Kevlar.data.Model class itself (i.e. no superclass Model) should just have the fields defined on its prototype." : function() {
				var Model = Kevlar.data.Model;
				
				// Run the test code
				this.assertFieldsHashCorrect( Model );
			},
			
			
			"Fields should inherit from a Model subclass's superclass when the subclass defines no fields of its own" : function() {
				var Model = Kevlar.data.Model;
				var SubClassModel = Kevlar.extend( Model, {} );
				
				// Run the test code
				this.assertFieldsHashCorrect( Model, SubClassModel );
			},
			
			
			"Fields should inherit from a Model subclass's superclass when the subclass does define fields of its own" : function() {
				// Reference the base class, and create a subclass
				var Model = Kevlar.data.Model;
				var SubClassModel = Kevlar.extend( Model, {
					fields : [ 'a', 'b' ]
				} );
				
				// Run the test code
				this.assertFieldsHashCorrect( Model, SubClassModel );
				
				// As a sanity check for the assertFieldsHashCorrect test code, assert that at least the fields defined by subclasses are there 
				// (not asserting anything against the base Kevlar.data.Model's fields array, as they are subject to change).
				var instanceFields = (new SubClassModel()).fields;
				Y.ObjectAssert.hasKey( 'a', instanceFields, "SubClassModel should have the 'a' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'b', instanceFields, "SubClassModel should have the 'b' field defined in its final 'fields' hash." );
			},
			
			
			"Fields should inherit from a Model subclass's superclass, and its superclass as well (i.e. more than one level up)" : function() {
				// Reference the base class, and create two subclasses
				var Model = Kevlar.data.Model;
				var SubClassModel = Kevlar.extend( Model, {
					fields : [ 'a', 'b' ]
				} );
				var SubSubClassModel = Kevlar.extend( SubClassModel, {
					fields : [ 'c', 'd', 'e' ]
				} );
				
				// Run the test code
				this.assertFieldsHashCorrect( Model, SubClassModel, SubSubClassModel );
				
				// As a sanity check for the assertFieldsHashCorrect test code, assert that at least the fields defined by subclasses are there 
				// (not asserting anything against the base Kevlar.data.Model's fields array, as they are subject to change).
				var instanceFields = (new SubSubClassModel()).fields;
				Y.ObjectAssert.hasKey( 'a', instanceFields, "SubSubClassModel should have the 'a' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'b', instanceFields, "SubSubClassModel should have the 'b' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'c', instanceFields, "SubSubClassModel should have the 'c' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'd', instanceFields, "SubSubClassModel should have the 'd' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'e', instanceFields, "SubSubClassModel should have the 'e' field defined in its final 'fields' hash." );
			},
			
			
			"Fields should inherit from a Model subclass's superclass, and all of its superclasses (i.e. more than two levels up)" : function() {
				// Reference the base class, and create two subclasses
				var Model = Kevlar.data.Model;
				var SubClassModel = Kevlar.extend( Model, {
					fields : [ 'a', 'b' ]
				} );
				var SubSubClassModel = Kevlar.extend( SubClassModel, {
					fields : [ 'c', 'd', 'e' ]
				} );
				var SubSubSubClassModel = Kevlar.extend( SubSubClassModel, {
					fields : [ 'f' ]
				} );
				
				// Run the test code
				this.assertFieldsHashCorrect( Model, SubClassModel, SubSubClassModel, SubSubSubClassModel );
				
				// As a sanity check for the assertFieldsHashCorrect test code, assert that at least the fields defined by subclasses are there 
				// (not asserting anything against the base Kevlar.data.Model's fields array, as they are subject to change).
				var instanceFields = (new SubSubSubClassModel()).fields;
				Y.ObjectAssert.hasKey( 'a', instanceFields, "SubSubSubClassModel should have the 'a' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'b', instanceFields, "SubSubSubClassModel should have the 'b' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'c', instanceFields, "SubSubSubClassModel should have the 'c' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'd', instanceFields, "SubSubSubClassModel should have the 'd' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'e', instanceFields, "SubSubSubClassModel should have the 'e' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'f', instanceFields, "SubSubSubClassModel should have the 'f' field defined in its final 'fields' hash." );
			},
			
			
			"Field definitions defined in a subclass should take precedence over field definitions in a superclass" : function() {
				var Model = Kevlar.data.Model;
				var SubClassModel = Kevlar.extend( Model, {
					fields : [ { name : 'a', defaultValue: 1 } ]
				} );
				var SubSubClassModel = Kevlar.extend( SubClassModel, {
					fields : [ { name : 'a', defaultValue: 2 }, 'b' ]
				} );
				
				// Run the test code
				this.assertFieldsHashCorrect( Model, SubClassModel, SubSubClassModel );
				
				// As a sanity check for the assertFieldsHashCorrect test code, assert that at least the fields defined by subclasses are there 
				// (not asserting anything against the base Kevlar.data.Model's fields array, as they are subject to change).
				var instanceFields = (new SubSubClassModel()).fields;
				Y.ObjectAssert.hasKey( 'a', instanceFields, "SubSubSubClassModel should have the 'a' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'b', instanceFields, "SubSubSubClassModel should have the 'b' field defined in its final 'fields' hash." );
				
				// Check that the default value of the Field 'a' is 2, not 1 (as the Field in the subclass should have overridden its superclass Field)
				Y.Assert.areSame( 2, instanceFields[ 'a' ].defaultValue, "The field in the subclass should have overridden its superclass" ); 
			},
			
			
			"A subclass that doesn't define any fields should inherit all of them from its superclass(es)" : function() {
				// Reference the base class, and create two subclasses
				var Model = Kevlar.data.Model;
				var SubClassModel = Kevlar.extend( Model, {
					fields : [ 'a', 'b' ]
				} );
				var SubSubClassModel = Kevlar.extend( SubClassModel, {} );
				
				// Run the test code
				this.assertFieldsHashCorrect( Model, SubClassModel, SubSubClassModel );
				
				// As a sanity check for the assertFieldsHashCorrect test code, assert that at least the fields defined by subclasses are there 
				// (not asserting anything against the base Kevlar.data.Model's fields array, as they are subject to change).
				var instanceFields = (new SubSubClassModel()).fields;
				Y.ObjectAssert.hasKey( 'a', instanceFields, "SubSubClassModel should have the 'a' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'b', instanceFields, "SubSubClassModel should have the 'b' field defined in its final 'fields' hash." );
			},
			
			
			"A superclass that doesn't define any fields should be skipped for fields, but the subclass should still inherit from superclasses above it" : function() {
				// Reference the base class, and create two subclasses
				var Model = Kevlar.data.Model;
				var SubClassModel = Kevlar.extend( Model, {} );  // one that doesn't define any fields
				var SubSubClassModel = Kevlar.extend( SubClassModel, {
					fields : [ 'a', 'b' ]
				} );
				
				// Run the test code
				this.assertFieldsHashCorrect( Model, SubClassModel, SubSubClassModel );
				
				// As a sanity check for the assertFieldsHashCorrect test code, assert that at least the fields defined by subclasses are there 
				// (not asserting anything against the base Kevlar.data.Model's fields array, as they are subject to change).
				var instanceFields = (new SubSubClassModel()).fields;
				Y.ObjectAssert.hasKey( 'a', instanceFields, "SubSubClassModel should have the 'a' field defined in its final 'fields' hash." );
				Y.ObjectAssert.hasKey( 'b', instanceFields, "SubSubClassModel should have the 'b' field defined in its final 'fields' hash." );
			}
		},
		
		
		
		{
			/*
			 * Test Initialization
			 */
			name: 'Test Initialization',
			ttype : 'testsuite',
			
			
			items : [
				{
					/*
					 * Test datachange event upon initialization
					 */
					name : "Test datachange event upon initialization",
					
					setUp : function() {
						this.TestModel = Kevlar.extend( Kevlar.data.Model, {
							fields: [
								{ name: 'field1' },
								{ name: 'field2', defaultValue: "field2's default" },
								{ name: 'field3', defaultValue: function() { return "field3's default"; } },
								{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
								{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
							]
						} );
					},
					
					
					
					"The Model should not fire its 'datachange' event during the set of the initial data" : function() {
						var datachangeEventFired = false;
						var model = new this.TestModel( {
							data : {
								field1: "field1 value"
							},
							
							listeners : {
								'datachange' : function() {
									datachangeEventFired = true;
								}
							}
						} );
						
						Y.Assert.isFalse( datachangeEventFired, "The datachange event should not have fired during the set of the initial data" );
					},
					
					"The Model should fire its 'datachange' event when a field's data is set externally" : function() {
						var datachangeEventFired = false;
						var model = new this.TestModel( {
							listeners : {
								'datachange' : function() {
									datachangeEventFired = true;
								}
							}
						} );
						
						// Set the value
						model.set( 'field1', 'value1' );
						Y.Assert.isTrue( datachangeEventFired, "The datachange event should have been fired during the set of the new data" );
					}
				},
			
			
				{
					/*
					 * Test that the initial default values are applied
					 */
					name : "Test that the initial default values are applied",
					
					setUp : function() {
						this.TestModel = Kevlar.extend( Kevlar.data.Model, {
							fields: [
								{ name: 'field1' },
								{ name: 'field2', defaultValue: "field2's default" },
								{ name: 'field3', defaultValue: function() { return "field3's default"; } },
								{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
								{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
							]
						} );
					},
			
					// Test that default values are applied to field values
					
					"A field with a defaultValue but no provided data should have its defaultValue when retrieved" : function() {
						var model = new this.TestModel();  // no data provided
						
						Y.Assert.areSame( "field2's default", model.get( 'field2' ) );
					},
					
					"A field with a defaultValue that is a function, but no provided data should have its defaultValue when retrieved" : function() {
						var model = new this.TestModel();  // no data provided
						
						Y.Assert.areSame( "field3's default", model.get( 'field3' ) );  // field3 has a defaultValue that is a function
					},
					
					"A field with a defaultValue and also provided data should have its provided data when retrieved" : function() {
						var model = new this.TestModel( {
							data : {
								field2 : "field2's data"
							}
						} );
						
						Y.Assert.areSame( "field2's data", model.get( 'field2' ), "The 'default' specified on the Field should *not* have been applied, since it has a value." );
					}
				}
			]
		},
		
		
		{
			/*
			 * Test get()
			 */
			name: 'Test get()',
	
	
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
			
			
			"running get() on a field with no initial value and no default value should return undefined" : function() {
				var model = new this.TestModel();
				Y.Assert.isUndefined( model.get( 'field1' ) );  // field1 has no default value
			},
			
			"running get() on a field with an initial value and no default value should return the initial value" : function() {
				var model = new this.TestModel( {
					data : { field1 : "initial value" }
				} );
				Y.Assert.areSame( "initial value", model.get( 'field1' ) );  // field1 has no default value
			},
			
			"running get() on a field with no initial value but does have a default value should return the default value" : function() {
				var model = new this.TestModel();
				Y.Assert.areSame( "field2's default", model.get( 'field2' ) );  // field2 has a default value
			},
			
			"running get() on a field with an initial value and a default value should return the initial value" : function() {
				var model = new this.TestModel( {
					data : { field2 : "initial value" }
				} );
				Y.Assert.areSame( "initial value", model.get( 'field2' ) );  // field2 has a default value
			},
			
			"running get() on a field with no initial value but does have a default value which is a function should return the default value" : function() {
				var model = new this.TestModel();
				Y.Assert.areSame( "field3's default", model.get( 'field3' ) );  // field3 has a defaultValue that is a function
			}
		},
		
		
		{
			/*
			 * Test getAll()
			 */
			name: 'Test getAll()',
	
	
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
			
			
			"getAll() should return a shallow copy of the data, so that the returned object may be modified without messing up the Model" : function() {
				var testModel = new this.TestModel( {
					data : { field1: "field1data" }
				} );
				
				// Retrieve all the data, and modify a field
				var allData = testModel.getAll();
				allData.field1 = "newfield1data";
				
				// Make sure that the original field data in the Model was not modified
				Y.Assert.areSame( "field1data", testModel.get( 'field1' ), "field1 in the testModel should not have been modified. getAll() not returning at least a shallow copy of the data?" );
			}
			
		},
				
		
		{
			/*
			 * Test set()
			 */
			name: 'Test set()',
	
	
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
				
			
			/*
			 * Utility method to set the given field to all data types, including falsy values, and asserts that the operation was successful
			 * (i.e. the field returns the same exact value it was set to).
			 * 
			 * @method assertFieldAcceptsAll
			 * @param {Kevlar.data.Model} model
			 * @param {String} fieldName
			 */
			assertFieldAcceptsAll : function( model, fieldName ) {
				model.set( fieldName, undefined );
				Y.Assert.isUndefined( model.get( fieldName ), fieldName + "'s value should have the value set by set() (undefined)." );
				
				model.set( fieldName, null );
				Y.Assert.isNull( model.get( fieldName ), fieldName + "'s value should have the value set by set() (null)." );
				
				model.set( fieldName, true );
				Y.Assert.isTrue( model.get( fieldName ), fieldName + "'s value should have the value set by set() (true)." );
				
				model.set( fieldName, false );
				Y.Assert.isFalse( model.get( fieldName ), fieldName + "'s value should have the value set by set() (false)." );
				
				model.set( fieldName, 0 );
				Y.Assert.areSame( 0, model.get( fieldName ), fieldName + "'s value should have the value set by set() (0)." );
				
				model.set( fieldName, 1 );
				Y.Assert.areSame( 1, model.get( fieldName ), fieldName + "'s value should have the value set by set() (1)." );
				
				model.set( fieldName, "" );
				Y.Assert.areSame( "", model.get( fieldName ), fieldName + "'s value should have the value set by set() ('')." );
				
				model.set( fieldName, "Hello" );
				Y.Assert.areSame( "Hello", model.get( fieldName ), fieldName + "'s value should have the value set by set() ('Hello')." );
				
				model.set( fieldName, {} );
				Y.Assert.isObject( model.get( fieldName ), fieldName + "'s value should have the value set by set() (object)." );
				
				model.set( fieldName, [] );
				Y.Assert.isArray( model.get( fieldName ), fieldName + "'s value should have the value set by set() (array)." );
			},
			
			
			"set() should accept all datatypes including falsy values" : function() {
				var model = new this.TestModel();
				
				this.assertFieldAcceptsAll( model, 'field1' );
			},
			
			"set() should accept all datatypes, and still work even with a default value" : function() {
				// Test with regular values, given a default value
				var model = new this.TestModel();
				
				this.assertFieldAcceptsAll( model, 'field2' );  // field2 has a default value
			},
			
			"set() should accept all datatypes, and still work even with a given value" : function() {
				// Test with regular values, given a default value
				var model = new this.TestModel( {
					data : { field2 : "initial value" }
				} );
				
				this.assertFieldAcceptsAll( model, 'field2' );  // field2 has a given value in this test ("initial value")
			},
			
			
			// ------------------------------
			
			
			// Test set() with conversions
			
			"set() should convert a field that has no initial data of its own" : function() {
				var TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2default" },
						{ name: 'field3', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } }
					]
				} );
				
				var model = new TestModel( {
					data : {
						field1 : "field1val"
					}
				} );
				
				Y.Assert.areSame( "field1val field2default", model.get( 'field3' ), "field3 should be the concatenation of field1, a space, and field2" );
			},
			
			
			"set() should convert a field that does have initial data of its own" : function() {
				var TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', convert : function( value, model ) { return value + " " + model.get( 'field1' ); } }
					]
				} );
				var model = new TestModel( {
					data : {
						field1 : "field1val",
						field2 : "field2val"
					}
				} );
				
				Y.Assert.areSame( "field2val field1val", model.get( 'field2' ), "field2 should be the concatenation of its own value, a space, and field1" );
			},
			
			
			"set() should convert a field with a 'convert' function when it is set() again" : function() {
				var TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', convert : function( value, model ) { return value + " " + model.get( 'field1' ); } }
					]
				} );
				var model = new TestModel( {
					data : {
						field1 : "field1val",
						field2 : "field2val"
					}
				} );
				
				// This call should cause field2's convert() function to run
				model.set( 'field2', "newfield2value" );
				
				Y.Assert.areSame( "newfield2value field1val", model.get( 'field2' ), "field2 should be the concatenation of its own value, a space, and field2" );
			}
		},
		
		
		{
			/*
			 * Test getDefault()
			 */
			name: 'Test getDefault()',
	
	
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
			
			
			// Test that the default values of fields can be retrieved
			
			"A field with no defaultValue should return undefined when trying to retrieve its default value" : function() {
				var model = new this.TestModel();
				Y.Assert.isUndefined( model.getDefault( 'field1' ) );  // field1 has no default value
			},
			
			"A defaultValue should be able to be retrieved directly when the field has one" : function() {
				var model = new this.TestModel();
				Y.Assert.areSame( "field2's default", model.getDefault( 'field2' ) );  // field2 has a defaultValue of a string
			},
			
			"A defaultValue should be able to be retrieved directly when the defaultValue is a function that returns its default" : function() {
				var model = new this.TestModel();
				Y.Assert.areSame( "field3's default", model.getDefault( 'field3' ) );  // field2 has a defaultValue that is a function that returns a string
			}
		},	
			
		
		
		{
			/*
			 * Test isDirty()
			 */
			name: 'Test isDirty()',
	
	
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
			
			
			
			"isDirty() should return false after instantiating a Model with no data" : function() {
				var model = new this.TestModel();
				Y.Assert.isFalse( model.isDirty() );
			},
			
			"isDirty() should return false after instantiating a Model with initial data" : function() {
				var model = new this.TestModel( { data: { field1: 1, field2: 2 } } );
				Y.Assert.isFalse( model.isDirty() );
			},
			
			"isDirty() should return true after setting a field's data" : function() {
				var model = new this.TestModel();
				model.set( 'field1', 1 );
				Y.Assert.isTrue( model.isDirty() );
			},
			
			"isDirty() should return false after setting a field's data, and then rolling back the data" : function() {
				var model = new this.TestModel();
				model.set( 'field1', 1 );
				model.rollback();
				Y.Assert.isFalse( model.isDirty() );
			},
			
			"isDirty() should return false after setting a field's data, and then committing the data" : function() {
				var model = new this.TestModel();
				model.set( 'field1', 1 );
				model.commit();
				Y.Assert.isFalse( model.isDirty() );
			}
		},
		
		
		
		{
			/*
			 * Test isModified()
			 */
			name: 'Test isModified()',
	
	
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
			
			
			"isModified() should return false for fields that have not been changed" : function() {
				var model = new this.TestModel();
				Y.Assert.isFalse( model.isModified( 'field1' ), "field1, with no defaultValue, should not be modified" );
				Y.Assert.isFalse( model.isModified( 'field2' ), "field2, with a defaultValue, should not be modified" );
			},
			
			
			"isModified() should return true for fields that have been changed" : function() {
				var model = new this.TestModel();
				
				model.set( 'field1', "new value 1" );
				model.set( 'field2', "new value 2" );
				Y.Assert.isTrue( model.isModified( 'field1' ), "field1 should be marked as modified" );
				Y.Assert.isTrue( model.isModified( 'field2' ), "field2 should be marked as modified" );
			},
			
			
			"isModified() should return false for fields that have been changed, but then committed" : function() {
				var model = new this.TestModel();
				
				model.set( 'field1', "new value 1" );
				model.set( 'field2', "new value 2" );
				model.commit();
				Y.Assert.isFalse( model.isModified( 'field1' ), "field1 should have been committed, and therefore not marked as modified" );
				Y.Assert.isFalse( model.isModified( 'field2' ), "field2 should have been committed, and therefore not marked as modified" );
			},
			
			
			"isModified() should return false for fields that have been changed, but then rolled back" : function() {
				var model = new this.TestModel();
				
				model.set( 'field1', "new value 1" );
				model.set( 'field2', "new value 2" );
				model.rollback();
				Y.Assert.isFalse( model.isModified( 'field1' ), "field1 should have been rolled back, and therefore not marked as modified" );
				Y.Assert.isFalse( model.isModified( 'field2' ), "field2 should have been rolled back, and therefore not marked as modified" );
			}
		},
		
		
		{
			/*
			 * Test getChanges()
			 */
			name: 'Test getChanges()',
	
	
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
			
			
			"getChanges() should return a single field that has had its value changed" : function() {
				var model = new this.TestModel();
				model.set( 'field1', "new value" );
				
				var changes = model.getChanges();
				Y.Assert.areSame( 1, Kevlar.Object.objLength( changes ), "The changes hash retrieved should have exactly 1 property" );
				Y.Assert.areSame( "new value", changes.field1, "The change to field1 should have been 'new value'." );
			},
			
			"getChanges() should return multiple fields that have had their values changed" : function() {
				var model = new this.TestModel();
				model.set( 'field1', "new value 1" );
				model.set( 'field2', "new value 2" );
				
				var changes = model.getChanges();
				Y.Assert.areSame( 2, Kevlar.Object.objLength( changes ), "The changes hash retrieved should have exactly 2 properties" );
				Y.Assert.areSame( "new value 1", changes.field1, "The change to field1 should have been 'new value 1'." );
				Y.Assert.areSame( "new value 2", changes.field2, "The change to field2 should have been 'new value 2'." );
			}
		},
		
		
		{
			/*
			 * Test commit()
			 */
			name: 'Test commit()',
	
	
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
				
			
			"committing changed data should cause the 'dirty' flag to be reset to false, and getChanges() to return an empty object" : function() {
				var model = new this.TestModel();
				model.set( 'field1', "new value 1" );
				model.set( 'field2', "new value 2" );
				model.commit();
				
				var changes = model.getChanges();
				Y.Assert.areSame( 0, Kevlar.Object.objLength( changes ), "The changes hash retrieved should have exactly 0 properties" );
				
				Y.Assert.isFalse( model.isDirty(), "The model should no longer be marked as 'dirty'" );
			},
			
			
			"committing changed data should cause rollback() to have no effect" : function() {
				var model = new this.TestModel();
				model.set( 'field1', "new value 1" );
				model.set( 'field2', "new value 2" );
				model.commit();
				
				// Attempt a rollback, even though the data was committed. Should have no effect.
				model.rollback();
				Y.Assert.areSame( "new value 1", model.get( 'field1' ), "field1 should have been 'new value 1'. rollback() should not have had any effect." );
				Y.Assert.areSame( "new value 2", model.get( 'field2' ), "field2 should have been 'new value 2'. rollback() should not have had any effect." );
			}
		},
			
			
		
		{
			/*
			 * Test rollback()
			 */
			name: 'Test rollback()',
	
	
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
				
				
			"rollback() should revert the model's values back to default values if before any committed set() calls" : function() {
				// No initial data. 
				// field1 should be undefined
				// field2 should have the string "field2's default"
				var model = new this.TestModel();
				
				// Set, and then rollback
				model.set( 'field1', "new value 1" );
				model.set( 'field2', "new value 2" );
				Y.Assert.isTrue( model.isDirty(), "The 'dirty' flag should be true." );
				model.rollback();
				
				// Check that they have the original values
				Y.Assert.isUndefined( model.get( 'field1' ) );
				Y.Assert.areSame( "field2's default", model.get( 'field2' ) );
				
				// Check that isDirty() returns false
				Y.Assert.isFalse( model.isDirty(), "The 'dirty' flag should be false after rollback." );
			},
			
			
			"rollback() should revert the model's values back to their pre-set() values" : function() {
				var model = new this.TestModel( {
					data : {
						field1 : "original field1",
						field2 : "original field2"
					}
				} );
				
				// Set, check the 'dirty' flag, and then rollback
				model.set( 'field1', "new value 1" );
				model.set( 'field2', "new value 2" );
				Y.Assert.isTrue( model.isDirty(), "The 'dirty' flag should be true." );
				model.rollback();
				
				// Check that they have the original values
				Y.Assert.areSame( "original field1", model.get( 'field1' ) );
				Y.Assert.areSame( "original field2", model.get( 'field2' ) );
				
				// Check that isDirty() returns false
				Y.Assert.isFalse( model.isDirty(), "The 'dirty' flag should be false after rollback." );
			},
			
			
			"rollback() should revert the model's values back to their pre-set() values, when more than one set() call is made" : function() {
				var model = new this.TestModel( {
					data : {
						field1 : "original field1",
						field2 : "original field2"
					}
				} );
				
				// Set twice, and then rollback
				model.set( 'field1', "new value 1" );
				model.set( 'field2', "new value 2" );
				model.set( 'field1', "new value 1 - even newer" );
				model.set( 'field2', "new value 2 - even newer" );
				Y.Assert.isTrue( model.isDirty(), "The 'dirty' flag should be true." );
				model.rollback();
				
				// Check that they have the original values after rollback (that the 2nd set of set() calls didn't overwrite the original values) 
				Y.Assert.areSame( "original field1", model.get( 'field1' ) );
				Y.Assert.areSame( "original field2", model.get( 'field2' ) );
				
				// Check that isDirty() returns false
				Y.Assert.isFalse( model.isDirty(), "The 'dirty' flag should be false after rollback." );
			}
			
		},
		
		
		
		{
			/*
			 * Test save()
			 */
			name: 'Test save()',
			
			setUp : function() {
				this.TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default" },
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); } }
					]
				} );
			},
			
			
			// Special instructions
			_should : {
				error : {
					"save() should throw an error if there is no configured proxy" : "Kevlar.data.Model::save() error: Cannot save. No configured proxy."
				}
			},
			
			
			"save() should throw an error if there is no configured proxy" : function() {
				var model = new this.TestModel( {
					// note: no configured proxy
				} );
				model.save();
				Y.Assert.fail( "save() should have thrown an error with no configured proxy" );
			},
			
			
			"save() should call its proxy's update() method when a field has been changed" : function() {
				var updateCallCount = 0;
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					update : function( data, options ) {
						updateCallCount++;
					},
					supportsIncrementalUpdates : function() { return true; }
				} );
				
				var model = new this.TestModel( {
					proxy : new MockProxy()
				} );
				
				// Change a field first (so that it has changes), then save
				model.set( 'field1', 'newfield1value' );
				model.save();
				
				Y.Assert.areSame( 1, updateCallCount, "The proxy's update() method should have been called exactly once" );
			},
			
			
			
			"save() should NOT call its proxy's update() method when no fields have been changed" : function() {
				var updateCallCount = 0;
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					update : function( data, options ) {
						updateCallCount++;
					},
					supportsIncrementalUpdates : function() { return true; }
				} );
				
				var model = new this.TestModel( {
					proxy : new MockProxy()
				} );
				
				// Note: do not change any fields before calling save()
				model.save();
				
				Y.Assert.areSame( 0, updateCallCount, "The proxy's update() method should not have not been called, since there are no changes" );
			},
			
			
			"The 'success' callback provided to save() should be called if no fields have been changed, and the proxy's update() method does not need to be called" : function() {
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					supportsIncrementalUpdates : function() { return true; }
				} );
				
				var model = new this.TestModel( {
					proxy : new MockProxy()
				} );
				
				// Note: do not change any fields before calling save()
				var successCallCount = 0;
				model.save( {
					success : function() { successCallCount++; }
				} );
				
				Y.Assert.areSame( 1, successCallCount, "The 'success' callback provided to save() method should have been called even though there are no changes and the proxy didn't need to persist anything" );
			},
			
			
			// -----------------------			
			
			// Tests surrounding incremental updates
			
			
			"save() should provide the full set of data if the proxy does not support incremental updates" : function() {
				var dataToPersist;
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					update : function( data, options ) {
						dataToPersist = data;
					},
					supportsIncrementalUpdates : function() { return false; }
				} );
				var model = new this.TestModel( {
					proxy : new MockProxy()
				} );
				
				
				// Change a field first (so that it has changes), then save
				model.set( 'field1', 'newfield1value' );
				model.save();
				
				Y.Assert.areEqual( 5, Kevlar.Object.objLength( dataToPersist ), "The dataToPersist should only have exactly 5 keys, one for each of the fields" );
				Y.ObjectAssert.ownsKeys( [ 'field1','field2','field3','field4','field5' ], dataToPersist );
			},
			
			
			
			"save() should provide only the changed data if the proxy does in fact support incremental updates" : function() {
				var dataToPersist;
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					update : function( data, options ) {
						dataToPersist = data;
					},
					supportsIncrementalUpdates : function() { return true; }
				} );
				var model = new this.TestModel( {
					proxy : new MockProxy()
				} );
				
				
				// Change a field first (so that it has changes), then save
				model.set( 'field1', 'newfield1value' );
				model.save();
				
				Y.Assert.areEqual( 1, Kevlar.Object.objLength( dataToPersist ), "The dataToPersist should only have one key, the one that was changed" );
				Y.ObjectAssert.ownsKeys( [ 'field1' ], dataToPersist, "The dataToPersist should have 'field1'" );
			},
			
			
			// -----------------------			
			
			// Tests surround the 'persist' property of fields
			
			
			"save() should provide only 'persist' fields out of all of its data to the proxy's update() method when the proxy does not support incremental updates" : function() {
				var dataToPersist;
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					update : function( data, options ) {
						dataToPersist = data;
					},
					supportsIncrementalUpdates : function() { return false; }
				} );
				
				var TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default", persist: false },   // not persisted
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); }, persist: false }   // not persisted
					]
				} );
				var model = new TestModel( {
					proxy : new MockProxy()
				} );
				
				
				// Change a field first (so that it has changes), then save
				model.set( 'field1', 'newfield1value' );
				model.save();
				
				Y.Assert.areEqual( 3, Kevlar.Object.objLength( dataToPersist ), "The dataToPersist should only have 3 keys, the fields that are persisted (i.e. that don't have persist:false)" );
				Y.ObjectAssert.ownsKeys( [ 'field1','field3','field4' ], dataToPersist, "The dataToPersist should only have persisted fields" );
			},
			
			
			
			"save() should provide only 'persist' fields of the changed fields to the proxy's update() method when the proxy supports incremental updates" : function() {
				var dataToPersist;
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					update : function( data, options ) {
						dataToPersist = data;
					},
					supportsIncrementalUpdates : function() { return true; }
				} );
				
				var TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', defaultValue: "field2's default", persist: false },   // not persisted
						{ name: 'field3', defaultValue: function() { return "field3's default"; } },
						{ name: 'field4', convert : function( value, model ) { return model.get( 'field1' ) + " " + model.get( 'field2' ); } },
						{ name: 'field5', convert : function( value, model ) { return value + " " + model.get( 'field2' ); }, persist: false }   // not persisted
					]
				} );
				var model = new TestModel( {
					proxy : new MockProxy()
				} );
				
				
				// Change some fields first (so that it has changes), then save
				model.set( 'field2', 'newfield2value' );
				model.set( 'field3', 'newfield3value' );
				model.set( 'field4', 'newfield4value' );
				model.set( 'field5', 'newfield5value' );
				model.save();
				
				Y.Assert.areEqual( 2, Kevlar.Object.objLength( dataToPersist ), "The dataToPersist should only have 2 keys, the fields that are persisted (i.e. that don't have persist:false), out of the 4 that were modified" );
				Y.ObjectAssert.ownsKeys( [ 'field3','field4' ], dataToPersist, "The dataToPersist should only have persisted fields" );
			},
			
						
			
			"save() should NOT call its proxy's update() method when only fields that are not to be persisted have been changed" : function() {
				var TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1' },
						{ name: 'field2', persist: false }
					]
				} );
				
				var updateCallCount = 0;
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					update : function( data, options ) {
						updateCallCount++;
					},
					supportsIncrementalUpdates : function() { return false; }
				} );
				
				var model = new TestModel( {
					proxy : new MockProxy(),
					data : { field1: "field1value", field2: "field2value" }
				} );
				
				// Make a change to a non-persisted field
				model.set( 'field2', "newfield2value" );
				model.save();
				
				Y.Assert.areSame( 0, updateCallCount, "The proxy's update() method should not have not been called, since there are no changes to persisted fields" );
			},
			
			
			
			// NOTE: This test is commented for now, as the behavior is not yet implemented in the Model
			/*
			"save() should in fact call its proxy's update() method when a field that is not to be persisted has changed, but a convert field uses that field and is persisted" : function() {
				var TestModel = Kevlar.extend( Kevlar.data.Model, {
					fields: [
						{ name: 'field1', persist: false },
						{ name: 'field2', convert : function( val, model ) { return model.get( 'field1' ); } }
					]
				} );
				
				var updateCallCount = 0;
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					update : function( data, options ) {
						updateCallCount++;
					},
					supportsIncrementalUpdates : function() { return false; }
				} );
				
				var model = new TestModel( {
					proxy : new MockProxy(),
					data : { field1: "field1value", field2: "field2value" }
				} );
				
				// Make a change to a non-persisted field
				model.set( 'field1', "newfield1value" );
				model.save();
				
				Y.Assert.areSame( 1, updateCallCount, "The proxy's update() method should have been called, since a field with a convert that IS persisted was updated by the non-persisted field" );
			},*/
			
			
			
			// ---------------------------------
			
			// TODO: Test that if a model attribute is modified twice after a persistence operation is started, it should be able to be reverted to its original value
			
			
			// Test that model attributes that are updated during a persistence request do not get marked as committed
			
			"Model attributes that are updated (via set()) while a persistence request is in progress should not be marked as committed when the persistence request completes" : function() {
				var test = this;
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					update : function( data, options ) {
						// update method just calls 'success' callback in 50ms
						window.setTimeout( function() {
							options.success.call( options.scope || window );
						}, 50 );
					},
					supportsIncrementalUpdates : function() { return true; }
				} );
				
				var model = new this.TestModel( {
					proxy : new MockProxy()
				} );
				
				// Initial set
				model.set( 'field1', "origValue1" );
				model.set( 'field2', "origValue2" );
				
				// Begin persistence operation
				model.save( {
					success : function() {
						test.resume( function() {
							Y.Assert.isTrue( model.isDirty(), "The model should still be dirty after the persistence operation. field1 was set after the persistence operation began." );
							
							Y.Assert.isTrue( model.isModified( 'field1' ), "field1 should be marked as modified (dirty). It was updated (set) after the persistence operation began." );
							Y.Assert.isFalse( model.isModified( 'field2' ), "field2 should not be marked as modified. It was not updated after the persistence operation began." );
							
							Y.Assert.areSame( "newValue1", model.get( 'field1' ), "a get() operation on field1 should return the new value." );
							Y.Assert.areSame( "origValue2", model.get( 'field2' ), "a get() operation on field2 should return the persisted value. It was not updated since the persistence operation began." );
						} );
					}
				} );
				
				
				// Now set the field while the async persistence operation is in progress. Test will resume when the timeout completes
				model.set( 'field1', "newValue1" );
				// note: not setting field2 here
				
				// Wait for the setTimeout in the MockProxy
				test.wait( 100 );
			},
			
			
			
			"Model attributes that have been persisted should not be persisted again if they haven't changed since the last persist" : function() {
				var dataToPersist;
				var MockProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
					update : function( data, options ) {
						dataToPersist = data;
						options.success.call( options.scope );
					},
					supportsIncrementalUpdates : function() { return true; }
				} );
				var model = new this.TestModel( {
					proxy : new MockProxy()
				} );
				
				
				// Change field1 first (so that it has changes), then save
				model.set( 'field1', 'newfield1value' );
				model.save();
				
				Y.Assert.areEqual( 1, Kevlar.Object.objLength( dataToPersist ), "The dataToPersist should only have one key after field1 has been changed" );
				Y.ObjectAssert.ownsKeys( [ 'field1' ], dataToPersist, "The dataToPersist should have 'field1'" );
				
				
				// Now change field2. The dataToPersist should not include field1, since it has been persisted
				model.set( 'field2', 'newfield2value' );
				model.save();
				
				Y.Assert.areEqual( 1, Kevlar.Object.objLength( dataToPersist ), "The dataToPersist should only have one key after field2 has been changed" );
				Y.ObjectAssert.ownsKeys( [ 'field2' ], dataToPersist, "The dataToPersist should have 'field2'" );
			}
		}
		
	]
	
} );
