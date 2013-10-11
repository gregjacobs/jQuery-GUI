/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jqg/util/OptionsStore'
], function( OptionsStore ) {
	
	describe( 'jqg.util.OptionsStore', function() {
		
		describe( "constructor", function() {
			
			it( "should be able to be constructed with no arguments", function() {
				var optionsStore = new OptionsStore();
				
				expect( optionsStore.getOptions() ).toEqual( [] );
			} );
			
			
			it( "should accept an array of initial options", function() {
				var optionsList = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				
				var optionsStore = new OptionsStore( optionsList );
				expect( optionsStore.getOptions() ).toEqual( optionsList );
			} );
			
			
			it( "should accept an array of initial options, normalizing them as well", function() {
				var optionsList = [
					'opt1',
					{ text: 'opt2' },
					{ text: 'opt3', value: 'opt3value' }
				];
				
				var optionsStore = new OptionsStore( optionsList );
				expect( optionsStore.getOptions() ).toEqual( [
					{ text: 'opt1', value: 'opt1' },
					{ text: 'opt2', value: 'opt2' },
					{ text: 'opt3', value: 'opt3value' }
				] );
			} );
			
		} );
		
		
		describe( 'normalizeOptions()', function() {
			
			it( "should take a mixed array of string elements and objects, and return the normalized text/value Object array", function() {
				var optionsStore = new OptionsStore();
				
				var result = optionsStore.normalizeOptions( [
					'opt1',
					{ text: 'opt2' },
					{ text: 'opt3', value: 'opt3value' }
				] );
				
				expect( result ).toEqual( [
					{ text: 'opt1', value: 'opt1' },
					{ text: 'opt2', value: 'opt2' },
					{ text: 'opt3', value: 'opt3value' }
				] );
			} );
			
		} );
		
		
		describe( 'normalizeOption()', function() {
			
			it( "should normalize a simple string to be the `text` and `value` properties of the returned object", function() {
				var optionsStore = new OptionsStore();
				
				var result = optionsStore.normalizeOption( 'opt' );
				expect( result ).toEqual( { text: 'opt', value: 'opt' } );
			} );
			
			
			it( "should normalize an Object with just a `text` property to make that both the `text` and `value` properties", function() {
				var optionsStore = new OptionsStore();
				
				var result = optionsStore.normalizeOption( { text: 'opt' } );
				expect( result ).toEqual( { text: 'opt', value: 'opt' } );
			} );
			
			
			it( "should return an Object with both `text` and `value` properties unchanged", function() {
				var optionsStore = new OptionsStore();
				
				var result = optionsStore.normalizeOption( { text: 'opt', value: 'optValue' } );
				expect( result ).toEqual( { text: 'opt', value: 'optValue' } );
			} );
			
			
			it( "should return an Object with both `text` and `value` properties unchanged, and any extra properties that were defined", function() {
				var optionsStore = new OptionsStore();
				
				var result = optionsStore.normalizeOption( { text: 'opt', value: 'optValue', extraProp1: 1, extraProp2: "2" } );
				expect( result ).toEqual( { text: 'opt', value: 'optValue', extraProp1: 1, extraProp2: "2" } );
			} );
			
		} );
		
		
		describe( 'setOptions()', function() {
			
			it( "should set the options, removing any previous options", function() {
				var optionsStore = new OptionsStore();
				expect( optionsStore.getOptions() ).toEqual( [] );  // initial condition
				
				var optionsSet1 = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				optionsStore.setOptions( optionsSet1 );
				expect( optionsStore.getOptions() ).toEqual( optionsSet1 );
				
				var optionsSet2 = [
					{ text: 'opt3', value: 'opt3value' },
					{ text: 'opt4', value: 'opt4value' },
					{ text: 'opt5', value: 'opt5value' }
				];
				optionsStore.setOptions( optionsSet2 );
				expect( optionsStore.getOptions() ).toEqual( optionsSet2 );
			} );
			
			
			it( "should clear all options when passed an empty array", function() {
				var optionsList = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				
				var optionsStore = new OptionsStore( optionsList );
				expect( optionsStore.getOptions() ).toEqual( optionsList );  // initial condition
				
				// Now clear the options
				optionsStore.setOptions( [] );
				expect( optionsStore.getOptions() ).toEqual( [] );
			} );
			
			
			it( "should make a *copy* of the options passed in, so that modifying the original options array does not affect the options in the store", function() {
				var optionsList = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				
				var optionsStore = new OptionsStore();
				optionsStore.setOptions( optionsList );
				
				expect( optionsStore.getOptions() ).toEqual( optionsList );  // initial condition
				
				// Now modify the original set
				optionsList[ 0 ].text = "opt11111111";
				optionsList[ 1 ].value = "opt22222222value";
				optionsList.push( { text: 'opt3', value: 'opt3value' } );
				
				// And make sure the store still has the original options list
				expect( optionsStore.getOptions() ).toEqual( [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				] );
			} );
			
		} );
		
		
		describe( 'addOption()', function() {
			
			it( "should append a single option to the current list of options, normalizing the option which is added as well", function() {
				var initialOptionsList = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				
				var optionsStore = new OptionsStore( initialOptionsList );
				expect( optionsStore.getOptions() ).toEqual( initialOptionsList );  // initial condition
				
				optionsStore.addOption( 'opt3' );            // should normalize a simple string
				expect( optionsStore.getOptions() ).toEqual( [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' },
					{ text: 'opt3', value: 'opt3' }
				] );
				
				optionsStore.addOption( { text: 'opt4' } );  // should normalize an object with just a `text` property
				expect( optionsStore.getOptions() ).toEqual( [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' },
					{ text: 'opt3', value: 'opt3' },
					{ text: 'opt4', value: 'opt4' }
				] );
				
				optionsStore.addOption( { text: 'opt5', value: 'opt5value' } );
				expect( optionsStore.getOptions() ).toEqual( [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' },
					{ text: 'opt3', value: 'opt3' },
					{ text: 'opt4', value: 'opt4' },
					{ text: 'opt5', value: 'opt5value' }
				] );
			} );
			
			
			it( "should insert an option at a given index when the `index` argument is provided", function() {
				var initialOptionsList = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				
				var optionsStore = new OptionsStore( initialOptionsList );
				expect( optionsStore.getOptions() ).toEqual( initialOptionsList );   // initial condition
				
				optionsStore.addOption( { text: 'opt3', value: 'opt3value' }, 1 );  // insert at index 1
				expect( optionsStore.getOptions() ).toEqual( [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt3', value: 'opt3value' },
					{ text: 'opt2', value: 'opt2value' }
				] );
			} );
			
		} );
		
		
		describe( 'removeOptionByValue()', function() {
			var opts;
			
			beforeEach( function() {
				opts = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' },
					{ text: 'opt3', value: 'opt3value' }
				];
			} );
			
			
			it( "should remove an existing option by its `value` property", function() {
				var optionsStore = new OptionsStore( opts );
				
				optionsStore.removeOptionByValue( 'opt2value' );
				expect( optionsStore.getOptions() ).toEqual( [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt3', value: 'opt3value' }
				] );
			} );
			
			
			it( "should have no effect when there is no option for the given `value`", function() {
				var optionsStore = new OptionsStore( opts );
				
				optionsStore.removeOptionByValue( 'non-existent-value' );
				expect( optionsStore.getOptions() ).toEqual( opts );
			} );
			
		} );
		
		
		describe( 'removeOptionByText()', function() {
			var opts;
			
			beforeEach( function() {
				opts = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' },
					{ text: 'opt3', value: 'opt3value' }
				];
			} );
			
			
			it( "should remove an existing option by its `text` property", function() {
				var optionsStore = new OptionsStore( opts );
				
				optionsStore.removeOptionByText( 'opt2' );
				expect( optionsStore.getOptions() ).toEqual( [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt3', value: 'opt3value' }
				] );
			} );
			
			
			it( "should have no effect when there is no option for the given `text`", function() {
				var optionsStore = new OptionsStore( opts );
				
				optionsStore.removeOptionByText( 'non-existent-text' );
				expect( optionsStore.getOptions() ).toEqual( opts );
			} );
			
		} );
		
		
		describe( 'getOptions()', function() {
			
			it( "should return the current list of options", function() {
				var initialOptionsList = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				
				var optionsStore = new OptionsStore( initialOptionsList );
				expect( optionsStore.getOptions() ).toEqual( initialOptionsList );
				
				
				var newOptionsList = [
					{ text: 'opt3', value: 'opt3value' },
					{ text: 'opt4', value: 'opt4value' }
				];
				optionsStore.setOptions( newOptionsList );
				expect( optionsStore.getOptions() ).toEqual( newOptionsList );
			} );
			
		} );
		
		
		describe( 'getCount()', function() {
			
			it( "should return the current number of options", function() {
				var initialOptionsList = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				
				var optionsStore = new OptionsStore( initialOptionsList );
				expect( optionsStore.getCount() ).toEqual( 2 );
				
				
				var newOptionsList = [
					{ text: 'opt3', value: 'opt3value' },
					{ text: 'opt4', value: 'opt4value' },
					{ text: 'opt5', value: 'opt5value' }
				];
				optionsStore.setOptions( newOptionsList );
				expect( optionsStore.getCount() ).toEqual( 3 );
			} );
			
		} );
		
		
		describe( 'getAtIndex()', function() {
			var opts, optionsStore;
			
			beforeEach( function() {
				opts = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				
				optionsStore = new OptionsStore( opts );
			} );
			
			it( "should return the option object at the given index", function() {
				expect( optionsStore.getAtIndex( 1 ) ).toEqual( { text: 'opt2', value: 'opt2value' } );
			} );
			
			
			it( "should return `null` if there is no option object at the given index", function() {
				expect( optionsStore.getAtIndex( 2 ) ).toBe( null );
			} );
			
		} );
		
		
		describe( 'getByValue()', function() {
			var opts, optionsStore;
			
			beforeEach( function() {
				opts = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				
				optionsStore = new OptionsStore( opts );
			} );
			
			
			it( "should return the option object that matches the provided `value`", function() {
				expect( optionsStore.getByValue( 'opt2value' ) ).toEqual( { text: 'opt2', value: 'opt2value' } );
			} );
			
			
			it( "should return `null` if there is no option object for the provided `value`", function() {
				expect( optionsStore.getByValue( 'non-existent-value' ) ).toBe( null );
			} );
			
		} );
		
		
		describe( 'getByText()', function() {
			var opts, optionsStore;
			
			beforeEach( function() {
				opts = [
					{ text: 'opt1', value: 'opt1value' },
					{ text: 'opt2', value: 'opt2value' }
				];
				
				optionsStore = new OptionsStore( opts );
			} );
			
			
			it( "should return the option object that matches the provided `text`", function() {
				expect( optionsStore.getByText( 'opt2' ) ).toEqual( { text: 'opt2', value: 'opt2value' } );
			} );
			
			
			it( "should return `null` if there is no option object for the provided `text`", function() {
				expect( optionsStore.getByText( 'non-existent-text' ) ).toBe( null );
			} );
			
		} );
		
	} );
	
} );