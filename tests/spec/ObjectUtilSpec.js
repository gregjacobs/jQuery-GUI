/*global jQuery, Ext, Y, Kevlar, tests */
tests.unit.util.add( new Ext.test.TestSuite( {
	name : 'Kevlar.util.Object',
	
	items : [
	
		/*
		 * Test clone()
		 */
		{
			name : "Test clone()",
			
			"clone() should return primitive types as-is" : function() {
				// Tests with primitive types
				Y.Assert.areSame( undefined, Kevlar.util.Object.clone( undefined ), "clone() not returning undefined when provided undefined." );
				Y.Assert.areSame( null, Kevlar.util.Object.clone( null ), "clone() not returning null when provided null." );
				Y.Assert.areSame( true, Kevlar.util.Object.clone( true ), "clone() not returning true when provided true." );
				Y.Assert.areSame( false, Kevlar.util.Object.clone( false ), "clone() not returning false when provided false." );
				Y.Assert.areSame( 0, Kevlar.util.Object.clone( 0 ), "clone() not returning 0 when provided 0." );
				Y.Assert.areSame( 1, Kevlar.util.Object.clone( 1 ), "clone() not returning 1 when provided 1." );
				Y.Assert.areSame( "", Kevlar.util.Object.clone( "" ), "clone() not returning empty string when provided an empty string." );
				Y.Assert.areSame( "hi", Kevlar.util.Object.clone( "hi" ), "clone() not returning string 'hi' when provided string 'hi'." );
			},
			
			"clone() should copy a Date object" : function() {
				var date = new Date( 2012, 1, 1, 1, 1, 1, 1 );
				var dateCopy = Kevlar.util.Object.clone( date );
				
				Y.Assert.areNotSame( date, dateCopy, "The copy should not be a reference to the original object" );
				Y.Assert.isTrue( Kevlar.util.Object.isEqual( date, dateCopy ), "The copy should have the same date value" );
			},
			
			"clone() should copy a Date object that is nested within another object" : function() {
				var date = new Date( 2012, 1, 1, 1, 1, 1, 1 );
				var obj = { a: date };
				var objCopy = Kevlar.util.Object.clone( obj );
				
				Y.Assert.areNotSame( obj, objCopy, "The copy of the object should not be a reference to the input object" );
				Y.Assert.areNotSame( date, objCopy.a, "The date in the 'a' property should be a copy, not a reference to the same object" );
				
				Y.Assert.isTrue( Kevlar.util.Object.isEqual( obj, objCopy ), "clone() should have copied the object" );
				Y.Assert.isTrue( Kevlar.util.Object.isEqual( date, objCopy.a ), "clone() should have copied the Date object" );
			},
						
			"clone() should copy an array of primitives" : function() {
				var simpleArr = [ 1, 2, 3, 4, 5 ];
				Y.Assert.areNotSame( simpleArr, Kevlar.util.Object.clone( simpleArr ), "clone() returning same reference to array." );
				Y.Assert.isTrue( Kevlar.util.Object.isEqual( [ 1, 2, 3, 4, 5 ], Kevlar.util.Object.clone( simpleArr ) ), "clone() not properly copying a simple array." );
			},
			
			"clone() should deep copy an array of mixed primitives and objects" : function() {
				var complexArr = [ { a: { inner: 1 }, b: 2 }, 1, "asdf", [ 1, 2, { a: 1 } ] ];
				Y.Assert.areNotSame( complexArr, Kevlar.util.Object.clone( complexArr ), "clone() returning same reference to complex array." );
				Y.Assert.isTrue( Kevlar.util.Object.isEqual( [ { a: { inner: 1 }, b: 2 }, 1, "asdf", [ 1, 2, { a: 1 } ] ], Kevlar.util.Object.clone( complexArr ) ), "clone() not properly deep copying a complex array." );
				Y.Assert.areNotSame( complexArr[ 0 ], Kevlar.util.Object.clone( complexArr )[ 0 ], "clone() not properly deep copying a complex array. first element has same reference for original and copy." ); 
				Y.Assert.areNotSame( complexArr[ 0 ].a, Kevlar.util.Object.clone( complexArr )[ 0 ].a, "clone() not properly deep copying a complex array. first element, 'a' object, has same reference for original and copy." ); 
				Y.Assert.areSame( complexArr[ 0 ].a, Kevlar.util.Object.clone( complexArr, /*deep*/ false )[ 0 ].a, "clone() not properly shallow copying a complex array. first element, 'a' object, does not have same reference for original and copy." ); 
			},
			
			
			"clone() should copy a simple object of primitives" : function() {
				var simpleObj = { a: 1, b: 2 };
				Y.Assert.areNotSame( simpleObj, Kevlar.util.Object.clone( simpleObj ), "clone() returning same reference to simple object." );
				Y.Assert.isTrue( Kevlar.util.Object.isEqual( { a: 1, b: 2 }, Kevlar.util.Object.clone( simpleObj ) ), "clone() not properly copying a simple object." );
			},
			
			"clone() should deep copy an object of primitives, nested arrays, and nested objects" : function() {
				var date = new Date( 2011, 1, 1 );
				var complexObj = { a: 1, b: { a: 1, b: [1,2,3], c: { a: null, b: undefined, c: true, d: false, e: "ohai" } }, c: [1,[1,2]], d: date };
				
				Y.Assert.areNotSame( complexObj, Kevlar.util.Object.clone( complexObj ), "clone() returning same reference to complex object." );
				
				Y.Assert.isTrue( Kevlar.util.Object.isEqual( { a: 1, b: { a: 1, b: [1,2,3], c: { a: null, b: undefined, c: true, d: false, e: "ohai" } }, c: [1,[1,2]], d: date }, Kevlar.util.Object.clone( complexObj ) ), "clone() not properly deep copying a complex object." );
				Y.Assert.areNotSame( complexObj.b, Kevlar.util.Object.clone( complexObj ).b, "clone() not properly deep copying a complex object. property 'b' has same reference for original and copy." );
				Y.Assert.areNotSame( complexObj.b.c, Kevlar.util.Object.clone( complexObj ).b.c, "clone() not properly deep copying a complex object. property 'b.c' has same reference for original and copy. Nested object inside nested object not getting copied." );
				Y.Assert.areSame( complexObj.b.c, Kevlar.util.Object.clone( complexObj, /*deep*/ false ).b.c, "clone() with 'deep' set to false (shallow copy mode) is still deep copying a complex object. property 'b.c' does not have same reference for original and copy." );
				Y.Assert.areNotSame( date, Kevlar.util.Object.clone( complexObj ).d, "The Date object in complexObj.d should have been a copy of the Date object, not a reference to the same object" );
			},
			
			
			"clone() should not copy prototype properties of instantiated objects" : function() {
				var MyClass = function() {
					this.ownVar = 1;
				};
				MyClass.prototype.prototypeVar = 2;
				
				var myInstance = new MyClass();
				var copiedInstance = Kevlar.util.Object.clone( myInstance );
				
				// First check that the owned property was copied
				Y.Assert.isTrue( copiedInstance.hasOwnProperty( 'ownVar' ), "clone() did not copy the owned property 'ownVar'" );
				Y.Assert.areSame( 1, copiedInstance.ownVar, "clone() did not copy the owned property 'ownVar' with the correct value" );
				
				// Now check that the prototype property was *not* copied
				Y.Assert.isFalse( copiedInstance.hasOwnProperty( 'prototypeVar' ), "clone() copied the prototype property 'prototypeVar'. It should not have." );
			}
		},
		
		
		
		/*
		 * Test isEqual()
		 */
		{
			name : "Test isEqual()",
			
			
			"isEqual() should work with all datatype comparisons (primitive and array/object)" : function() {
				// Quick reference
				var isEqual = Kevlar.util.Object.isEqual;
				
				Y.Assert.isTrue( isEqual( undefined, undefined ), "Error: undefined !== undefined" );
				Y.Assert.isFalse( isEqual( undefined, null ), "Error: undefined === null"  );
				Y.Assert.isFalse( isEqual( undefined, true ), "Error: undefined === true" );
				Y.Assert.isFalse( isEqual( undefined, false ), "Error: undefined === false" );
				Y.Assert.isFalse( isEqual( undefined, 0 ), "Error: undefined === 0" );
				Y.Assert.isFalse( isEqual( undefined, "" ), "Error: undefined === ''" );
				Y.Assert.isFalse( isEqual( undefined, {} ), "Error: undefined === {}" );
				Y.Assert.isFalse( isEqual( undefined, { a : 1 } ), "Error: undefined === { a : 1 }" );
				Y.Assert.isFalse( isEqual( undefined, [] ), "Error: undefined === []" );
				Y.Assert.isFalse( isEqual( undefined, [ 1,2,3 ] ), "Error: undefined === [ 1,2,3 ]" );
				Y.Assert.isFalse( isEqual( undefined, 42 ), "Error: undefined === 42" );
				Y.Assert.isFalse( isEqual( undefined, "test" ), "Error: undefined === 'test'" );
				
				Y.Assert.isTrue( isEqual( null, null ), "Error: null !== null" );
				Y.Assert.isFalse( isEqual( null, undefined ), "Error: null === undefined" );
				Y.Assert.isFalse( isEqual( null, true ), "Error: null === true" );
				Y.Assert.isFalse( isEqual( null, false ), "Error: null === false" );
				Y.Assert.isFalse( isEqual( null, 0 ), "Error: null === 0" );
				Y.Assert.isFalse( isEqual( null, "" ), "Error: null === ''" );
				Y.Assert.isFalse( isEqual( null, {} ), "Error: null === {}" );
				Y.Assert.isFalse( isEqual( null, { a : 1 } ), "Error: null === { a : 1 }" );
				Y.Assert.isFalse( isEqual( null, [] ), "Error: null === []" );
				Y.Assert.isFalse( isEqual( null, [ 1,2,3 ] ), "Error: null === [ 1,2,3 ]" );
				Y.Assert.isFalse( isEqual( null, 42 ), "Error: null === 42" );
				Y.Assert.isFalse( isEqual( null, "test" ), "Error: null === 'test'" );
				
				Y.Assert.isTrue( isEqual( true, true ), "Error: true !== true" );
				Y.Assert.isTrue( isEqual( false, false ), "Error: false !== true" );
				Y.Assert.isFalse( isEqual( true, false ), "Error: true === false" );
				Y.Assert.isFalse( isEqual( false, true ), "Error: false === true" );
				Y.Assert.isFalse( isEqual( false, 0 ), "Error: false === 0" );
				Y.Assert.isFalse( isEqual( true, 1 ), "Error: true === 1" );
				Y.Assert.isFalse( isEqual( false, "" ), "Error: false === ''" );
				Y.Assert.isFalse( isEqual( true, "true" ), "Error: true === 'true'" );
						
				Y.Assert.isTrue( isEqual( 0, 0 ), "Error: 0 !== 0" );
				Y.Assert.isTrue( isEqual( 1, 1 ), "Error: 1 !== 1" );
				Y.Assert.isTrue( isEqual( -1, -1 ), "Error: -1 !== -1" );
				Y.Assert.isFalse( isEqual( 0, 1 ), "Error: 0 === 1" );
				Y.Assert.isFalse( isEqual( 1, 0 ), "Error: 1 === 0" );
				Y.Assert.isFalse( isEqual( 1, 2 ), "Error: 1 === 2" );
				Y.Assert.isFalse( isEqual( 0, "" ), "Error: 0 === ''" );
				Y.Assert.isFalse( isEqual( 1, "1" ), "Error: 1 === '1'" );
				
				Y.Assert.isTrue( isEqual( "", "" ), "Error: '' !== ''" );
				Y.Assert.isTrue( isEqual( "asdf", "asdf" ), "Error: 'asdf' !== 'asdf'" );
				Y.Assert.isFalse( isEqual( "", 0 ), "Error: '' === 0" );
				Y.Assert.isFalse( isEqual( "asdf", "asdf2" ), "Error: 'asdf' === 'asdf2'" );
				Y.Assert.isFalse( isEqual( 0, "0" ), "Error: 0 === '0'" );
				Y.Assert.isFalse( isEqual( "0", 0 ), "Error: '0' === 0" );
				Y.Assert.isFalse( isEqual( 1, "1" ), "Error: 1 === '1'" );
				Y.Assert.isFalse( isEqual( "1", 1 ), "Error: '1' === 1" );
				
				Y.Assert.isFalse( isEqual( {}, null ), "Error: {} === null" );
				Y.Assert.isFalse( isEqual( {}, undefined ), "Error: {} === undefined" );
				Y.Assert.isFalse( isEqual( {}, true ), "Error: {} === true" );
				Y.Assert.isFalse( isEqual( {}, false ), "Error: {} === false" );
				Y.Assert.isFalse( isEqual( {}, 0 ), "Error: {} === 0" );
				Y.Assert.isFalse( isEqual( {}, 1 ), "Error: {} === 1" );
				Y.Assert.isFalse( isEqual( {}, "" ), "Error: {} === ''" );
				Y.Assert.isFalse( isEqual( {}, "test" ), "Error: {} === 'test'" );
				Y.Assert.isTrue( isEqual( {}, {} ), "Error: {} !== {}" );
				Y.Assert.isFalse( isEqual( {}, { a : 1 } ), "Error: {} === { a : 1 }" );
				Y.Assert.isFalse( isEqual( {}, [] ), "Error: {} === []" );
				Y.Assert.isFalse( isEqual( {}, [ 1,2,3 ] ), "Error: {} === [ 1,2,3 ]" );
				
				Y.Assert.isFalse( isEqual( [], null ), "Error: [] === null" );
				Y.Assert.isFalse( isEqual( [], undefined ), "Error: [] === undefined" );
				Y.Assert.isFalse( isEqual( [], true ), "Error: [] === true" );
				Y.Assert.isFalse( isEqual( [], false ), "Error: [] === false" );
				Y.Assert.isFalse( isEqual( [], 0 ), "Error: [] === 0" );
				Y.Assert.isFalse( isEqual( [], 1 ), "Error: [] === 1" );
				Y.Assert.isFalse( isEqual( [], "" ), "Error: [] === ''" );
				Y.Assert.isFalse( isEqual( [], "test" ), "Error: [] === 'test'" );
				Y.Assert.isFalse( isEqual( [], {} ), "Error: [] === {}" );
				Y.Assert.isFalse( isEqual( [], { a : 1 } ), "Error: [] === { a : 1 }" );
				Y.Assert.isTrue( isEqual( [], [] ), "Error: [] !== []" );
				Y.Assert.isFalse( isEqual( [], [ 1,2,3 ] ), "Error: [] === [ 1,2,3 ]" );
				
				var date = new Date( 2012, 1, 1, 10, 10, 10, 10 );
				Y.Assert.isFalse( isEqual( date, null ), "Error: date === null" );
				Y.Assert.isFalse( isEqual( date, undefined ), "Error: date === undefined" );
				Y.Assert.isFalse( isEqual( date, true ), "Error: date === true" );
				Y.Assert.isFalse( isEqual( date, false ), "Error: date === false" );
				Y.Assert.isFalse( isEqual( date, 0 ), "Error: date === 0" );
				Y.Assert.isFalse( isEqual( date, 1 ), "Error: date === 1" );
				Y.Assert.isFalse( isEqual( date, "" ), "Error: date === ''" );
				Y.Assert.isFalse( isEqual( date, "test" ), "Error: date === 'test'" );
				Y.Assert.isFalse( isEqual( date, {} ), "Error: date === {}" );
				Y.Assert.isFalse( isEqual( date, { a : 1 } ), "Error: date === { a : 1 }" );
				Y.Assert.isFalse( isEqual( date, [] ), "Error: date === []" );
				Y.Assert.isFalse( isEqual( date, [ 1,2,3 ] ), "Error: date === [ 1,2,3 ]" );
				Y.Assert.isFalse( isEqual( date, new Date( 2000, 1, 1, 1, 1, 1, 1 ) ), "Error: date === a date with a different date/time" );
				Y.Assert.isTrue( isEqual( date, new Date( 2012, 1, 1, 10, 10, 10, 10 ) ), "Error: date !== a date with a the same date/time" );
			},
			
			
			"isEqual() should work with deep object comparisons" : function() {
				// Quick reference
				var isEqual = Kevlar.util.Object.isEqual;
				
				var a = {a: 'text', b:[0,1]};
				var b = {a: 'text', b:[0,1]};
				var c = {a: 'text', b: 0};
				var d = {a: 'text', b: false};
				var e = {a: 'text', b:[1,0]};
				var f = {a: 'text', b:[1,0], f: function(){ this.f = this.b; }};
				var g = {a: 'text', b:[1,0], f: function(){ this.f = this.b; }};
				var h = {a: 'text', b:[1,0], f: function(){ this.a = this.b; }};
				var i = {
					a: 'text',
					c: {
						b: [1, 0],
						f: function(){
							this.a = this.b;
						}
					}
				};
				var j = {
					a: 'text',
					c: {
						b: [1, 0],
						f: function(){
							this.a = this.b;
						}
					}
				};
				var k = {a: 'text', b: null};
				var l = {a: 'text', b: undefined};
				
				Y.Assert.isTrue( isEqual( a, b ), "Error w/ object comparison. a !== b" );
				Y.Assert.isFalse( isEqual( a, c ), "Error w/ object comparison. a === c" );
				Y.Assert.isFalse( isEqual( c, d ), "Error w/ object comparison. c === d" );
				Y.Assert.isFalse( isEqual( a, e ), "Error w/ object comparison. a === e" );
				Y.Assert.isTrue( isEqual( f, g ), "Error w/ object comparison. f !== g" );
				Y.Assert.isFalse( isEqual( g, h ), "Error w/ object comparison. g === h" );
				Y.Assert.isTrue( isEqual( i, j ), "Error w/ object comparison. i !== j" );
				Y.Assert.isFalse( isEqual( d, k ), "Error w/ object comparison. d === k" );
				Y.Assert.isFalse( isEqual( k, i ), "Error w/ object comparison. k === i" );
			},
				
			
			"isEqual() should work with shallow array comparisions" : function() {
				// Quick reference
				var isEqual = Kevlar.util.Object.isEqual;
				
				var a = { innerA: 1 }, b = { innerB: 2 }, c = { innerC: 3 };
				
				Y.Assert.isTrue( isEqual( [], [], false ), "[] should equal []" );
				Y.Assert.isTrue( isEqual( [a,b,c], [a,b,c], false ), "[a,b,c] should equal [a,b,c]" );
				
				Y.Assert.isFalse( isEqual( [a,b,c], [a,c,b], false ), "[a,b,c] should not equal [a,c,b]" );
				Y.Assert.isFalse( isEqual( [a,b,c], [a,b], false ), "[a,b,c] should not equal [a,b]" );
				Y.Assert.isFalse( isEqual( [a,b], [a,b,c], false ), "[a,b] should not equal [a,b,c]" );
			},
			
			
			
			"isEqual() should work with deep array comparisons" : function() {
				// Quick reference
				var isEqual = Kevlar.util.Object.isEqual;
				
				var a = [];
				var b = [];
				var c = [1];
				var d = [1];
				var e = [2];
				var f = [2];
				var g = [1,2,3];
				var h = [1,2,3];
				var i = [1,{a:1,b:2},3];
				var j = [1,{a:1,b:2},3];
				var k = [[1,2,3],{a:1,b:2},3];
				var l = [[1,2,3],{a:1,b:2},3];
				var m = [[1,{a:1,b:2,c:3},[1,2,3]],{a:1,b:[1,2]},{c:3}];
				var n = [[1,{a:1,b:2,c:3},[1,2,3]],{a:1,b:[1,2]},{c:3}];
				
				var o = [[1,2,3],{a:1,b:2},4];
				var p = [[1,2,3],{a:11,b:2},4];
				var q = [[1,22,3],{a:1,b:2},4];
				var r = [[1,{a:1,b:2,c:3},[1,1,3]],{a:1,b:[1,2]},{c:3}];
				var s = [[1,{a:1,b:2,c:3},[1,2,3]],{a:1,b:[2,2]},{c:3}];
				
				
				Y.Assert.isTrue( isEqual( a, b ), "Error w/ array comparison. a !== b" );
				Y.Assert.isTrue( isEqual( c, d ), "Error w/ array comparison. c !== d" );
				Y.Assert.isTrue( isEqual( e, f ), "Error w/ array comparison. e !== f" );
				Y.Assert.isTrue( isEqual( g, h ), "Error w/ array comparison. g !== h" );
				Y.Assert.isTrue( isEqual( i, j ), "Error w/ array comparison. i !== j" );
				Y.Assert.isTrue( isEqual( k, l ), "Error w/ array comparison. k !== l" );
				Y.Assert.isTrue( isEqual( m, n ), "Error w/ array comparison. m !== n" );
				
				Y.Assert.isFalse( isEqual( a, c ), "Error w/ array comparison. a === c" );
				Y.Assert.isFalse( isEqual( b, d ), "Error w/ array comparison. b === d" );
				Y.Assert.isFalse( isEqual( c, e ), "Error w/ array comparison. c === e" );
				Y.Assert.isFalse( isEqual( d, f ), "Error w/ array comparison. d === f" );
				Y.Assert.isFalse( isEqual( e, g ), "Error w/ array comparison. e === g" );
				Y.Assert.isFalse( isEqual( f, h ), "Error w/ array comparison. f === h" );
				Y.Assert.isFalse( isEqual( g, i ), "Error w/ array comparison. g === i" );
				Y.Assert.isFalse( isEqual( h, j ), "Error w/ array comparison. h === j" );
				Y.Assert.isFalse( isEqual( i, k ), "Error w/ array comparison. i === k" );
				Y.Assert.isFalse( isEqual( j, l ), "Error w/ array comparison. j === l" );
				Y.Assert.isFalse( isEqual( k, m ), "Error w/ array comparison. k === m" );
				Y.Assert.isFalse( isEqual( l, n ), "Error w/ array comparison. l === n" );
				
				Y.Assert.isFalse( isEqual( i, o ), "Error w/ array comparison. i === o" );
				Y.Assert.isFalse( isEqual( k, p ), "Error w/ array comparison. k === p" );
				Y.Assert.isFalse( isEqual( m, r ), "Error w/ array comparison. m === r" );
				Y.Assert.isFalse( isEqual( n, s ), "Error w/ array comparison. n === s" );
			},
				
			
			// --------------------------------
			
				
			
			"isEqual() should be able to shallow compare, with the 'deep' flag set to false, in case objects refer to each other" : function() {
				// Quick reference
				var isEqual = Kevlar.util.Object.isEqual;
				
				// Have objects that refer to one another, to make sure the comparison doesn't go deep.
				// Will get stack overflow error if they do.
				var obj1 = {};
				var obj2 = {};
				obj1.obj2 = obj2;
				obj2.obj1 = obj1;
				
				var a = [ obj1, obj2 ];
				var b = [ obj1, obj2 ];
				var returnVal;
				try {
					returnVal = Kevlar.util.Object.isEqual( a, b, /*deep*/ false );
				} catch( e ) {
					Y.Assert.fail( "Error w/ shallow array comparison and deep flag set to false. Comparison must be going deep, as this error would come from call stack size being reached." );
				}
				Y.Assert.isTrue( returnVal, "Error w/ shallow array comparison. a !== b" );
			}
		},
		
		
		
		/*
		 * Test objLength()
		 */
		{
			name : "Test objLength()",
			
			"objLength() should return 0 for an empty object" : function() {
				var obj = {};
				Y.Assert.areSame( 0, Kevlar.util.Object.length( obj ) );
			},
			
			"objLength() should return 0 for an empty object, even if the object has prototype properties" : function() {
				var MyClass = function() {};
				MyClass.prototype.prop = "prototype property";
				
				var myInstance = new MyClass();
				Y.Assert.areSame( 0, Kevlar.util.Object.length( myInstance ) );
			},
			
			"objLength() should return the number of owned properties in the object" : function() {
				var obj = {
					prop1 : "1",
					prop2 : "2"
				};
				Y.Assert.areSame( 2, Kevlar.util.Object.length( obj ) );
			},
			
			"objLength() should return the number of owned properties in the object, even if they are undefined or falsy" : function() {
				var obj = {
					prop1 : undefined,
					prop2 : null,
					prop3 : false,
					prop4 : 0,
					prop5 : ""
				};
				Y.Assert.areSame( 5, Kevlar.util.Object.length( obj ) );
			}
		},
		
		
		/*
		 * Test isEmpty()
		 */
		{
			name : "Test isEmpty()",
			
			"isEmpty() should return true for an empty object" : function() {
				var obj = {};
				Y.Assert.isTrue( Kevlar.util.Object.isEmpty( obj ) );
			},
			
			"isEmpty() should return true for an empty object, even if the object has prototype properties" : function() {
				var MyClass = function() {};
				MyClass.prototype.prop = "prototype property";
				
				var myInstance = new MyClass();
				Y.Assert.isTrue( Kevlar.util.Object.isEmpty( myInstance ) );
			},
			
			"isEmpty() should return false if the object owns properties" : function() {
				var obj = {
					prop1 : "1",
					prop2 : "2"
				};
				Y.Assert.isFalse( Kevlar.util.Object.isEmpty( obj ) );
			},
			
			"isEmpty() should return false if the object owns properties, even if the properties are undefined or falsy" : function() {
				var obj = {
					prop1 : undefined,
					prop2 : null,
					prop3 : false,
					prop4 : 0,
					prop5 : ""
				};
				Y.Assert.isFalse( Kevlar.util.Object.isEmpty( obj ) );
			}
		},
		
		
		/*
		 * Test keysToArray()
		 */
		{
			name : "Test keysToArray()",
			
			
			"keysToArray() should return an empty array for an empty object" : function() {
				var obj = {};
				
				var arr = Kevlar.util.Object.keysToArray( obj );
				Y.Assert.areSame( 0, arr.length );
			},
			
			
			"keysToArray() should return an empty array for an object with only prototype properties" : function() {
				var MyClass = function(){};
				MyClass.prototype.prop1 = 1;
				MyClass.prototype.prop2 = 2;
				
				var obj = new MyClass();
				
				var arr = Kevlar.util.Object.keysToArray( obj );
				Y.Assert.areSame( 0, arr.length );
			},
			
			
			"keysToArray() should return an array of the key names of the object" : function() {
				var obj = {
					prop1: 1,
					prop2: 2
				};
				
				var arr = Kevlar.util.Object.keysToArray( obj );
				Y.ArrayAssert.itemsAreSame( [ 'prop1', 'prop2' ], arr );
			},
			
			
			"keysToArray() should return an array of the key names of the object, but ignore prototype properties" : function() {
				var MyClass = function(){
					this.myOwnedProp = 1;
				};
				MyClass.prototype.prop1 = 1;
				MyClass.prototype.prop2 = 2;
				
				var obj = new MyClass();
				
				var arr = Kevlar.util.Object.keysToArray( obj );
				Y.ArrayAssert.itemsAreSame( [ 'myOwnedProp' ], arr );
			}
		}
	]
} ) );