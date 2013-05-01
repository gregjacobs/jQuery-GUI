/*global define, describe, it, expect */
define( [
	'Class',
	'jqc/util/CollectionBindable'
], 
function( Class, CollectionBindable ) {
	
	describe( 'jqc.util.CollectionBindable', function() {
		
		describe( "configuration options", function() {
			
			it( "The `collectionProp` config should dictate what property name the collection should be stored under when bound", function() {
				
			} );
			
		} );

		
		describe( 'bindCollection()', function() {
			
			it( "should bind a collection, setting its reference to the object, and attaching its listeners (which are provided by getCollectionListeners())", function() {
				
			} );
			
			
			it( "should only bind a new collection if the new collection is different than the currently-bound collection", function() {
				
			} );
			
			
			it( "should allow an initial collection bind of the same collection stored in the `collectionProp`. This is to support the collection being passed in as a config, but not having been bound yet", function() {
				
			} );
			
			
			it( "should unbind any previously-bound collection when a new collection is bound", function() {
				
			} );
			
			
			it( "should unbind a previously-bound collection when passed `null`", function() {
				
			} );
			
			
			it( "should only have an effect when `null` is passed in, if there is a previously-bound collection", function() {
				
			} );
			
			
			it( "should call the onCollectionBind() hook method with both the newly bound and previously bound collections", function() {
				
			} );
			
		} );

		
		describe( 'unbindCollection()', function() {
			
			it( "should unbind the currently-bound collection by removing its listeners, and setting its reference to null", function() {
				
			} );
			
			
			it( "should simply have no effect if there is no currently-bound collection", function() {
				
			} );
			
		} );
		
	} );
	
} );