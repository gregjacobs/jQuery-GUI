/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'data/Collection',
	'jqc/util/CollectionBindable'
], 
function( Collection, CollectionBindable ) {
	
	describe( 'jqc.util.CollectionBindable', function() {
		var TestCollectionBindable = CollectionBindable.extend( {
			collectionProp : 'myCollection',  // to test this config with all methods
			
			getCollectionListeners : function() {
				return {
					'add' : this.onAdd,
					scope : this
				};
			},
			
			// Empty handler of the collection's `add` event
			onAdd : function() {}
		} );
			
		
		var collectionBindable,
		    collection1,
		    collection2;
		
		beforeEach( function() {
			collectionBindable = new TestCollectionBindable();
			collection1 = new Collection();
			collection2 = new Collection();
			
			spyOn( collectionBindable, 'onCollectionBind' ).andCallThrough();
			spyOn( collection1, 'on' ).andCallThrough();
			spyOn( collection1, 'un' ).andCallThrough();
			spyOn( collection2, 'on' ).andCallThrough();
			spyOn( collection2, 'un' ).andCallThrough();
		} );
		
		
		describe( "configuration options", function() {
			
			it( "The `collectionProp` config should dictate what property name the collection should be stored under when bound", function() {
				collectionBindable.bindCollection( collection1 );  // this instance is configured with a `collectionProp` config of 'myCollection'
				
				expect( collectionBindable.myCollection ).toBe( collection1 );
			} );
			
		} );

		
		describe( 'bindCollection()', function() {
			
			it( "should bind a collection, setting its reference to the object, and attaching its listeners (which are provided by getCollectionListeners())", function() {
				collectionBindable.bindCollection( collection1 );
				
				// Make sure the collection was stored under the correct property name
				expect( collectionBindable.myCollection ).toBe( collection1 );
				
				// Make sure event handlers were added to the collection
				expect( collection1.on.calls.length ).toBe( 1 );
				expect( collection1.on ).toHaveBeenCalledWith( collectionBindable.getCollectionListeners() );
				
				// Make sure the onCollectionBind hook method has been called
				expect( collectionBindable.onCollectionBind.calls.length ).toBe( 1 );
				expect( collectionBindable.onCollectionBind ).toHaveBeenCalledWith( collection1, null );
			} );
			
			
			it( "should only bind a new collection if the new collection is different than the currently-bound collection", function() {
				collectionBindable.bindCollection( collection1 );
				collectionBindable.bindCollection( collection1 );  // try to bind twice
				
				// Make sure event handlers were added to the collection only once
				expect( collection1.on.calls.length ).toBe( 1 );
				expect( collection1.on ).toHaveBeenCalledWith( collectionBindable.getCollectionListeners() );
				
				// Make sure the onCollectionBind hook method has been called only once
				expect( collectionBindable.onCollectionBind.calls.length ).toBe( 1 );
				expect( collectionBindable.onCollectionBind ).toHaveBeenCalledWith( collection1, null );
			} );
			
			
			it( "should allow an initial collection bind of the same collection stored in the `collectionProp`. This is to support the collection being passed in as a config, but not having been bound yet", function() {
				collectionBindable.myCollection = collection1;  // as if the collection has been set via config
				
				// Make sure we can still bind this collection, even if the property is already set (but it's never been actually bound)
				collectionBindable.bindCollection( collection1 );
				
				expect( collection1.on.calls.length ).toBe( 1 );
				expect( collection1.on ).toHaveBeenCalledWith( collectionBindable.getCollectionListeners() );
				expect( collectionBindable.onCollectionBind.calls.length ).toBe( 1 );
				expect( collectionBindable.onCollectionBind ).toHaveBeenCalledWith( collection1, null );  // there really is no "previously-bound" collection in this case, so the second arg should be null
			} );
			
			
			it( "should unbind any previously-bound collection when a new collection is bound", function() {
				collectionBindable.bindCollection( collection1 );
				expect( collection1.un.calls.length ).toBe( 0 );  // initial condition
				
				// Now bind the second collection and check
				collectionBindable.bindCollection( collection2 );
				expect( collection1.un.calls.length ).toBe( 1 );
				expect( collection1.un ).toHaveBeenCalledWith( collectionBindable.getCollectionListeners() );
				expect( collection2.on.calls.length ).toBe( 1 );
				expect( collection2.on ).toHaveBeenCalledWith( collectionBindable.getCollectionListeners() );
				expect( collectionBindable.onCollectionBind.calls.length ).toBe( 2 );
				expect( collectionBindable.onCollectionBind.mostRecentCall.args ).toEqual( [ collection2, collection1 ] );
			} );
			
			
			it( "should unbind a previously-bound collection when passed `null`", function() {
				collectionBindable.bindCollection( collection1 );
				collectionBindable.bindCollection( null );
				
				expect( collection1.un.calls.length ).toBe( 1 );
				expect( collection1.un ).toHaveBeenCalledWith( collectionBindable.getCollectionListeners() );
				expect( collectionBindable.onCollectionBind.calls.length ).toBe( 2 );
				expect( collectionBindable.onCollectionBind.mostRecentCall.args ).toEqual( [ null, collection1 ] );
			} );
			
			
			it( "when `null` is passed in, it should not have an effect if there was no previously-bound collection (CollectionBindable assumes an `undefined` collection is `null`)", function() {
				collectionBindable.bindCollection( null );
				
				expect( collectionBindable.onCollectionBind.calls.length ).toBe( 0 );
			} );
			
		} );

		
		describe( 'unbindCollection()', function() {
			
			it( "should unbind the currently-bound collection by removing its listeners, and setting its reference to null", function() {
				collectionBindable.bindCollection( collection1 );
				
				collectionBindable.unbindCollection();
				
				expect( collection1.un.calls.length ).toBe( 1 );
				expect( collection1.un ).toHaveBeenCalledWith( collectionBindable.getCollectionListeners() );
				expect( collectionBindable.onCollectionBind.calls.length ).toBe( 2 );
				expect( collectionBindable.onCollectionBind.mostRecentCall.args ).toEqual( [ null, collection1 ] );
			} );
			
			
			it( "should simply have no effect if there is no currently-bound collection", function() {
				collectionBindable.unbindCollection();
				
				expect( collectionBindable.onCollectionBind.calls.length ).toBe( 0 );
			} );
			
		} );
		
	} );
	
} );