/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'lodash',
	'jqc/ComponentQuery',
	
	'jqc/Component',     // type: 'component'
	'jqc/Container',     // type: 'container'
	'jqc/panel/Panel',   // type: 'panel'
	'jqc/button/Button'  // type: 'button'
], function( _, ComponentQuery, Component, Container, Panel, Button ) {
	
	describe( 'jqc.ComponentQuery', function() {
		
		describe( 'query()', function() {
			var cmps, nestedContainer;
			
			beforeEach( function() {
				cmps = [
					new Component( { id: 'cmp1' } ),
				    new Container( { id: 'cmp2' } ),
				    new Panel( { id: 'cmp3' } )
				];
				
				nestedContainer = new Container( {
					items : [
						new Component( { id : 'nestedCmp1' } ),
						new Container( {
							id : 'nestedCmp2',
							items : [
								new Container( {
									id : 'nestedCmp3',
									items : new Component( {
										id : 'nestedCmp4'
									} )
								} ),
								new Container( {  // note: a leaf Container (no children)
									id : 'nestedCmp5'
								} ),
								new Component( {
									id : 'nestedCmp6'
								} )
							]
						} )
					]
				} );
			} );
			
			afterEach( function() {
				_.forEach( cmps, function( cmp ) { cmp.destroy(); } );
				nestedContainer.destroy();
			} );
			
			
			
			it( "should return an array of components for given ID queries", function() {
				var result;
				
				result = ComponentQuery.query( '#nonExistent', cmps );
				expect( result ).toEqual( [] );
				
				result = ComponentQuery.query( '#cmp1', cmps );
				expect( result ).toEqual( [ cmps[ 0 ] ] );
				
				// Check for components nested in a container
				result = ComponentQuery.query( '#nestedCmp3', nestedContainer );
				expect( result.length ).toBe( 1 );
				expect( result[ 0 ].getId() ).toBe( 'nestedCmp3' );
			} );
			
			
			it( "should return an array of components for given `type` queries", function() {
				var result;
				
				result = ComponentQuery.query( 'button', cmps );
				expect( result ).toEqual( [] );
				
				result = ComponentQuery.query( 'container', cmps );
				expect( result ).toEqual( [ cmps[ 1 ], cmps[ 2 ] ] );  // The Container, and Panel instances (a subclass of Container)
				
				
				// Check for components nested in a container
				result = ComponentQuery.query( 'container', nestedContainer );
				expect( result.length ).toBe( 4 );
				expect( result[ 0 ] ).toBe( nestedContainer );  // the outer container itself matched the query
				expect( result[ 1 ].getId() ).toBe( 'nestedCmp2' );
				expect( result[ 2 ].getId() ).toBe( 'nestedCmp3' );
				expect( result[ 3 ].getId() ).toBe( 'nestedCmp5' );
			} );
			
			
			it( "should return an array of the *unique* component references (i.e. duplicates should be removed)", function() {
				var dupArray = cmps.concat( cmps );
				expect( dupArray.length ).toBe( 6 );  // just checking
				
				var result = ComponentQuery.query( 'component', dupArray );
				expect( result.length ).toBe( 3 );
			} );
			
		} );
		
		
		
		describe( 'getDescendants()', function() {
			
			it( "should return an empty array when the Container provided does not have any children", function() {
				var container = new Container(),  // note: no children
				    result = ComponentQuery.getDescendants( container );
				
				expect( result ).toEqual( [] );
				
				container.destroy();  // clean up
			} );
			
			
			it( "should return a flat array of the nested components/containers under a Container", function() {
				var container = new Container( {
					id : 'cmp1',
					items : [
						new Component( { id : 'cmp2' } ),
						new Container( {
							id : 'cmp3',
							items : [
								new Container( {
									id : 'cmp4',
									items : new Component( {
										id : 'cmp5'
									} )
								} ),
								new Container( {  // note: a leaf Container (no children)
									id : 'cmp6'
								} ),
								new Component( {
									id : 'cmp7'
								} )
							]
						} )
					]
				} );
				
				var result = ComponentQuery.getDescendants( container );
				
				// If we mapped each of the resulting descendant components' IDs into an array of the components, 
				// we should see components 2-7 in order. We should not see cmp1, as that is the outer container
				// that we queried for its descendants.
				var resultComponentIds = _.map( result, function( cmp ) { return cmp.getId(); } );
				expect( resultComponentIds ).toEqual( [ 'cmp2', 'cmp3', 'cmp4', 'cmp5', 'cmp6', 'cmp7' ] );
				
				container.destroy();  // clean up
			} );
			
		} );
		
		
		describe( 'filterById', function() {
			var cmps;
			
			beforeEach( function() {
				cmps = [
					new Component(),  // note: no `id` on this one
				    new Component( { id: "testCmp" } )
				];
			} );
			
			afterEach( function() {
				_.forEach( cmps, function( cmp ) { cmp.destroy(); } );
			} );
			
			
			it( "should return an empty array if no components match the provided `id`", function() {
				var result = ComponentQuery.filterById( cmps, "non-existent-component" );
				
				expect( result ).toEqual( [] );
			} );
			
			
			it( "should return an array of the components which match the provided `id`", function() {
				var result = ComponentQuery.filterById( cmps, "testCmp" );
				
				expect( result ).toEqual( [ cmps[ 1 ] ] );
			} );
			
		} );
		
		
		describe( 'filterByType', function() {
			var cmps;
			
			beforeEach( function() {
				cmps = [
					new Component(),
				    new Container(),
				    new Panel()
				];
			} );
			
			afterEach( function() {
				_.forEach( cmps, function( cmp ) { cmp.destroy(); } );
			} );
				
			
			it( "should return an empty array if no components match the provided `type`", function() {
				var result = ComponentQuery.filterByType( cmps, "button" );  // no buttons in the cmps array
				
				expect( result ).toEqual( [] );
			} );
			
			
			it( "should return an array of the components which are an instance of the provided `type` (including subclasses)", function() {
				var result = ComponentQuery.filterByType( cmps, 'container' );
				
				expect( result ).toEqual( [ cmps[ 1 ], cmps[ 2 ] ] );  // the Container, and the Panel (which is a subclass of Container)
			} );
			
			
			it( "should return an array of the components which are an instance of the provided `type` (including mixins)", function() {
				// Note: this subclass makes no sense, but tests the mixin check
				var ComponentWithButton = Component.extend( {
					mixins : [ Button ]
				} );
				
				var cmpWithButton = new ComponentWithButton();
				cmps.push( cmpWithButton );
				
				var result = ComponentQuery.filterByType( cmps, 'button' );
				expect( result ).toEqual( [ cmpWithButton ] );  // should match the ComponentWithButton instance
			} );
			
		} );
		
	} );
	
} );