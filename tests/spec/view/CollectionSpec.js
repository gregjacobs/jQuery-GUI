/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'jquery',
	'data/Model',
	'data/Collection',
	'jqc/view/Collection',
	'jqc/template/LoDash'
], function( jQuery, Model, Collection, CollectionView, LoDashTpl ) {
	
	describe( 'jqc.view.Collection', function() {
		
		// A simple Model subclass to use for the tests
		var UserModel = Model.extend( {
			attributes : [
				{ name : 'id',        type: 'int' },
				{ name : 'firstName', type: 'string' },
				{ name : 'lastName',  type: 'string' }
			]
		} );
		
		// A properly-configured Collection View which is used to test functionality
		var ConfiguredCollectionView = CollectionView.extend( {
			tpl : new LoDashTpl( [
				'<% _.forEach( models, function( model, idx ) { %>',
					'<div>',
						'<%= model.get( "lastName" ) %>, <%= model.get( "firstName" ) %>',
					'</div>',
				'<% } ) %>'
			] ),
			modelSelector : 'div'
		} );
		
		
		describe( "config options", function() {
			
			describe( "`tpl` config", function() {
				
				it( "should be required", function() {
					expect( function() {
						var collectionView = new CollectionView( {
							// no tpl config
						} );
					} ).toThrow( "`tpl` config required" );
				} );
				
			} );
			
			
			describe( "`modelSelector` config", function() {
				
				it( "should be required", function() {
					expect( function() {
						var collectionView = new CollectionView( {
							tpl : "Testing 123"
							// no modelSelector config
						} );
					} ).toThrow( "`modelSelector` config required" );
				} );
				
			} );
			
			
			describe( "`collection` config", function() {				
				
				it( "should not render anything with no `collection` bound", function() {
					var collectionView = new ConfiguredCollectionView( {
						renderTo : 'body'
						// note: no `collection` config
					} );
					
					expect( collectionView.getEl().html() ).toBe( "" );  // no innerHTML
					
					collectionView.destroy();  // clean up
				} );
				
				
				it( "should render the `tpl` with a `collection` bound", function() {
					var collectionView = new ConfiguredCollectionView( {
						renderTo : 'body',
						
						collection : new Collection( {
							model  : UserModel,
							models : [
								{ id: 1, firstName: "John", lastName: "Smith" },
								{ id: 2, firstName: "Bob",  lastName: "Jones" }
							]
						} )
					} );
					
					// Using toMatch matcher because of additional attributes added by the Collection View to the model element
					expect( collectionView.getEl().html() ).toMatch( /<div.*?>Smith, John<\/div><div.*?>Jones, Bob<\/div>/ );
					
					collectionView.destroy();  // clean up
				} );
			} );
				
				
			describe( "`modelsVar` config", function() {
				var ModelsVarCollectionView = CollectionView.extend( {
					tpl : new LoDashTpl( [
						'<% _.forEach( users, function( user ) { %>',
							'<div><%= user.get( "lastName" ) %>, <%= user.get( "firstName" ) %></div>',
						'<% } ) %>'
					] ),
					modelSelector : 'div'
				} );
				
				it( "should change the name of the variable provided to the template which has the models to render", function() {
					var collectionView = new ModelsVarCollectionView( {
						renderTo  : 'body',
						modelsVar : 'users',
						
						collection : new Collection( {
							model  : UserModel,
							models : [
								{ id: 1, firstName: "John", lastName: "Smith" }
							]
						} )
					} );
					
					// Using toMatch matcher because of additional attributes added by the Collection View to the model element
					expect( collectionView.getEl().html() ).toMatch( /<div.*?>Smith, John<\/div>/ );
					
					collectionView.destroy();  // clean up
				} );
				
			} );
			
		} );
		
		
		describe( 'bindCollection()', function() {
			var SimpleCollectionView = CollectionView.extend( {
				tpl : '<span>Testing 123</span>',
				modelSelector : 'span'
			} );
			
			var collection1,
			    collection2;
			
			beforeEach( function() {
				collection1 = new Collection();
				spyOn( collection1, 'on' ).andCallThrough();
				spyOn( collection1, 'un' ).andCallThrough();
				spyOn( collection1, 'getModels' ).andReturn( [] );
				
				collection2 = new Collection();
				spyOn( collection2, 'on' ).andCallThrough();
				spyOn( collection2, 'un' ).andCallThrough();
				spyOn( collection2, 'getModels' ).andReturn( [] );
			} );
			
			
			it( "should bind a collection to be listened to", function() {
				var collectionView = new SimpleCollectionView();
				
				collectionView.bindCollection( collection1 );
				expect( collection1.on.calls.length ).toBe( 1 );
			} );
			
			
			it( "should unbind the previously-bound collection", function() {
				var collectionView = new SimpleCollectionView();
				
				collectionView.bindCollection( collection1 );
				expect( collection1.on.calls.length ).toBe( 1 );
				expect( collection1.un.calls.length ).toBe( 0 );
				
				collectionView.bindCollection( null );
				expect( collection1.on.calls.length ).toBe( 1 );  // not called again since initial bind
				expect( collection1.un.calls.length ).toBe( 1 );  // should now be unbound
			} );
			
			
			it( "should unbind the previously-bound collection when binding a new collection", function() {
				var collectionView = new SimpleCollectionView();
				
				collectionView.bindCollection( collection1 );
				expect( collection1.on.calls.length ).toBe( 1 );
				expect( collection1.un.calls.length ).toBe( 0 );
				
				collectionView.bindCollection( collection2 );
				expect( collection1.on.calls.length ).toBe( 1 );  // not called again since initial bind
				expect( collection1.un.calls.length ).toBe( 1 );  // should now be unbound
				expect( collection2.on.calls.length ).toBe( 1 );  // collection2 now bound
				expect( collection2.un.calls.length ).toBe( 0 );  // not unbound yet
			} );
			
			
			it( "should not re-bind the already-bound collection", function() {
				var collectionView = new SimpleCollectionView();
				
				collectionView.bindCollection( collection1 );
				expect( collection1.on.calls.length ).toBe( 1 );
				expect( collection1.un.calls.length ).toBe( 0 );
				
				// Attempt to bind the collection again
				collectionView.bindCollection( collection1 );
				expect( collection1.on.calls.length ).toBe( 1 );  // not called again since initial bind
				expect( collection1.un.calls.length ).toBe( 0 );  // should not have been unbound
			} );
			
		} );
		
		
		
		describe( "refresh functionality", function() {
			var collection,
			    collectionView;
			
			beforeEach( function() {
				collection = new Collection( {
					model : UserModel
				} );
				
				collectionView = new ConfiguredCollectionView( {
					renderTo : 'body'
				} );
			} );
			
			afterEach( function() {
				collectionView.destroy();
			} );
			
			
			it( "should refresh the view when a model is added", function() {
				collectionView.bindCollection( collection );
				expect( collectionView.getEl().html() ).toBe( "" );  // initial condition
				
				collection.add( { id: 1, firstName: "John", lastName: "Smith" } );
				expect( collectionView.getEl().html() ).toMatch( /<div.*?>Smith, John<\/div>/ );  // Using toMatch matcher because of additional attributes added by the Collection View to the model element
			} );
			
			
			it( "should refresh the view when a model is removed", function() {
				collection.add( { id: 1, firstName: "John", lastName: "Smith" } );
				collectionView.bindCollection( collection );
				expect( collectionView.getEl().html() ).toMatch( /<div.*?>Smith, John<\/div>/ );  // initial condition. Using toMatch matcher because of additional attributes added by the Collection View to the model element
				
				collection.remove( collection.getAt( 0 ) );
				expect( collectionView.getEl().html() ).toBe( "" );
			} );
			
			
			it( "should refresh the view when a model is reordered", function() {
				collection.add( { id: 1, firstName: "John", lastName: "Smith" } );
				collection.add( { id: 2, firstName: "Bob", lastName: "Jones" } );
				collectionView.bindCollection( collection );
				expect( collectionView.getEl().html() ).toMatch( /<div.*?>Smith, John<\/div><div.*?>Jones, Bob<\/div>/ );  // initial condition
				
				collection.add( collection.getAt( 0 ), { at: 1 } );
				expect( collectionView.getEl().html() ).toMatch( /<div.*?>Jones, Bob<\/div><div.*?>Smith, John<\/div>/ );
			} );
			
			
			it( "should refresh the view when a model is changed", function() {
				collection.add( { id: 1, firstName: "John", lastName: "Smith" } );
				collection.add( { id: 2, firstName: "Bob", lastName: "Jones" } );
				collectionView.bindCollection( collection );
				expect( collectionView.getEl().html() ).toMatch( /<div.*?>Smith, John<\/div><div.*?>Jones, Bob<\/div>/ );  // initial condition
				
				collection.getAt( 1 ).set( 'firstName', "Whosie-whatsit" );
				expect( collectionView.getEl().html() ).toMatch( /<div.*?>Smith, John<\/div><div.*?>Jones, Whosie-whatsit<\/div>/ );
			} );
			
			
			it( "should refresh the view when a new collection is bound", function() {
				var collection1 = new Collection( { model: UserModel } ),
				    collection2 = new Collection( { model: UserModel } );
				
				collection1.add( [
					{ id: 1, firstName: "John", lastName: "Smith" },
					{ id: 2, firstName: "Bob", lastName: "Jones" }
				] );
				collection2.add( { id: 3, firstName: "Jane", lastName: "Doe" } );
				
				collectionView.bindCollection( collection1 );
				expect( collectionView.getEl().html() ).toMatch( /<div.*?>Smith, John<\/div><div.*?>Jones, Bob<\/div>/ );  // initial condition
				
				collectionView.bindCollection( collection2 );
				expect( collectionView.getEl().html() ).toMatch( /<div.*?>Doe, Jane<\/div>/ );
			} );

			
			// -----------------------------------
			
			
			it( "collectModels() should be able to be overridden to supply a different array of models to be rendered", function() {
				var model0 = new UserModel( { id: 1, firstName: "John", lastName: "Smith" } ),
				    model1 = new UserModel( { id: 2, firstName: "Jane", lastName: "Doe" } );
				collection.add( [ model0, model1 ] );
				
				var MyCollectionView = ConfiguredCollectionView.extend( {
					collectModels : function() {
						return [ this.collection.getAt( 1 ) ];  // only return the second model, model1
					}
				} );
				
				var collectionView = new MyCollectionView( { 
					renderTo: 'body',
					collection : collection
				} );
				var $el = collectionView.getEl();
				
				expect( $el.html() ).toMatch( /<div.*?>Doe, Jane<\/div>/ );  // should only see the data for model1
				
				// Methods like getModelFromElement() and getElementFromModel() should still work with the subset of rendered models
				var divEl = $el.find( collectionView.modelSelector )[ 0 ];
				expect( collectionView.getModelFromElement( divEl ) ).toBe( model1 );
				expect( collectionView.getElementFromModel( model1 )[ 0 ] ).toBe( divEl );
				
				collectionView.destroy();  // clean up
			} );
			
		} );
		
		
		describe( 'getModelFromElement()', function() {
			var collection0,
			    collection1,
			    model0,
			    model1,
			    model2,
			    collectionView;
			
			beforeEach( function() {
				collection0 = new Collection( {
					model : UserModel
				} );
				collection1 = new Collection( {
					model : UserModel
				} );
				
				model0 = new UserModel( { id: 1, firstName: "John", lastName: "Smith" } );
				model1 = new UserModel( { id: 2, firstName: "Jane", lastName: "Doe" } );
				model2 = new UserModel( { id: 3, firstName: "Bob", lastName: "Jones" } );
				
				// note: `collectionView` var is created in the tests, but destroyed in afterEach
			} );
			
			afterEach( function() {
				collectionView.destroy();
				collectionView = null;
			} );
			
			
			it( "should retrieve the model that corresponds to a model-encapsulating element", function() {
				collectionView = new ConfiguredCollectionView( {
					renderTo   : 'body',
					collection : collection0
				} );
				
				collection0.add( [ model0, model1 ] );
				
				var $divEl = collectionView.getEl().find( collectionView.modelSelector ).eq( 1 ),  // second div element, for the second model
				    resultModel = collectionView.getModelFromElement( $divEl );
				expect( resultModel.getId() ).toBe( model1.getId() );  // comparing ID's for simple diffing upon failure
			} );
			
			
			it( "should retrieve the model that corresponds to the model-encapsulating element of a descendant element", function() {
				collectionView = new ConfiguredCollectionView( {
					renderTo   : 'body',
					collection : collection0,
					
					// Overwrite the template on this one to give it a descendant element (the <span> tag)
					tpl : new LoDashTpl( [
						'<% _.forEach( models, function( model, idx ) { %>',
							'<div>',
								'<span><%= model.get( "lastName" ) %>, <%= model.get( "firstName" ) %></span>',
							'</div>',
						'<% } ) %>'
					] ),
					modelSelector : 'div'
				} );
				
				collection0.add( [ model0, model1 ] );
				
				var $spanEl1 = collectionView.getEl().find( collectionView.modelSelector ).eq( 1 ).find( 'span' ),  // the span under the second model element
				    resultModel = collectionView.getModelFromElement( $spanEl1 );
				expect( resultModel.getId() ).toBe( model1.getId() );  // comparing ID's for simple diffing upon failure
			} );
			
			
			it( "should return null when the element is not a model-encapsulating element or one of its descendants", function() {
				collectionView = new ConfiguredCollectionView( {
					renderTo   : 'body',
					collection : collection0
				} );
				collection0.add( [ model0, model1 ] );
				
				// Check an element that doesn't exist within the CollectionView
				var $divEl = jQuery( '<div/>' ).appendTo( 'body' );
				expect( collectionView.getModelFromElement( $divEl ) ).toBe( null );
				
				$divEl.remove();  // clean up
			} );
			
			
			// -----------------------------------
			
			
			it( "should work after the initial rendering process", function() {
				collection0.add( [ model0, model1 ] );  // add models *before* the Collection View is rendered
				
				collectionView = new ConfiguredCollectionView( {
					renderTo   : 'body',
					collection : collection0
				} );
				
				var $divEl = collectionView.getEl().find( collectionView.modelSelector ).eq( 1 ),  // second div element, for the second model
				    resultModel = collectionView.getModelFromElement( $divEl );
				expect( resultModel.getId() ).toBe( model1.getId() );  // comparing ID's for simple diffing upon failure
			} );
			
			
			it( "should still work after the Collection View is refreshed", function() {
				collection0.add( [ model0, model1 ] );  // add models *before* the Collection View is rendered
				collectionView = new ConfiguredCollectionView( {
					renderTo   : 'body',
					collection : collection0
				} );
				
				collectionView.refresh();  // manual refresh of the view
				
				var $divEl = collectionView.getEl().find( collectionView.modelSelector ).eq( 1 ),  // second div element, for the second model
				    resultModel = collectionView.getModelFromElement( $divEl );
				expect( resultModel.getId() ).toBe( model1.getId() );  // comparing ID's for simple diffing upon failure
			} );
			
			
			it( "should work after a new Collection has been bound to the Collection View", function() {
				collection0.add( [ model0, model1 ] );  // add models *before* the Collection View is rendered
				collection1.add( [ model2 ] );
				
				collectionView = new ConfiguredCollectionView( {
					renderTo   : 'body',
					collection : collection1
				} );
				
				collectionView.bindCollection( collection1 );  // bind the second collection
				
				var $divEl = collectionView.getEl().find( collectionView.modelSelector ).eq( 0 ),  // first div element, which should be the only one
				    resultModel = collectionView.getModelFromElement( $divEl );
				expect( resultModel.getId() ).toBe( model2.getId() );  // comparing ID's for simple diffing upon failure
			} );
			
		} );
		
		
		describe( 'getElementFromModel()', function() {
			var collection,
			    model0, model1, model2,
			    collectionView;
			
			beforeEach( function() {
				collection = new Collection( { model: UserModel } );
				
				model0 = new UserModel( { id: 1, firstName: "John", lastName: "Smith" } );
				model1 = new UserModel( { id: 2, firstName: "Jane", lastName: "Doe" } );
				model2 = new UserModel( { id: 3, firstName: "Bob", lastName: "Jones" } );
			} );
			
			afterEach( function() { 
				collectionView.destroy(); 
			} );
			
				
			it( "should retrieve the HTML element for a given model", function() {
				collection.add( [ model0, model1 ] );
				collectionView = new ConfiguredCollectionView( {
					renderTo   : 'body',
					collection : collection
				} );
				
				var $resultModelEl = collectionView.getElementFromModel( model0 );
				expect( $resultModelEl[ 0 ] ).toBe( collectionView.getEl().find( collectionView.modelSelector )[ 0 ] );
			} );
			
			
			it( "should return null for a model that does not exist within the view's collection", function() {
				collection.add( [ model0, model1 ] );
				collectionView = new ConfiguredCollectionView( {
					renderTo   : 'body',
					collection : collection
				} );
				
				var $resultModelEl = collectionView.getElementFromModel( model2 );
				expect( $resultModelEl ).toBe( null );
			} );
			
		} );
		
	} );
	
} );