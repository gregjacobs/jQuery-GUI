/*global jQuery, Ext, Y, Kevlar */
Ext.test.Session.addSuite( {
	
	name: 'Kevlar',
	
	
	items : [
	
		/*
		 * Test apply()
		 */
		{
			name : "Test apply()",
			
			
			test_apply: function(){
				var o1 = Kevlar.apply({}, {
					foo: 1,
					bar: 2
				});
				Y.ObjectAssert.hasKeys(o1, {
					foo: 1,
					bar: 2
				}, 'Test simple apply, with a return value');
				
				var o2 = {};
				Kevlar.apply(o2, {
					opt1: 'x',
					opt2: 'y'
				});
				Y.ObjectAssert.hasKeys(o2, {
					opt1: 'x',
					opt2: 'y'
				}, 'Test that the reference is changed');
				
				var o3 = Kevlar.apply({}, {
					prop1: 1
				});
				Y.Assert.isUndefined(o3.prop2, 'Test to ensure no extra properties are copied');
				
				var o4 = Kevlar.apply({
					foo: 1,
					baz: 4
				}, {
					foo: 2,
					bar: 3
				});
				Y.ObjectAssert.hasKeys(o4, {
					foo: 2,
					bar: 3,
					baz: 4
				}, 'Ensure that properties get overwritten by defaults');
				
				var o5 = {};
				Kevlar.apply(o5, {
					foo: 'new',
					exist: true
				}, {
					foo: 'old',
					def: true
				});
				Y.ObjectAssert.hasKeys(o5, {
					foo: 'new',
					def: true,
					exist: true
				}, 'Test using defaults');
				
				var o6 = Kevlar.apply({}, {
					foo: 'foo',
					bar: 'bar'
				}, {
					foo: 'oldFoo',
					bar: 'oldBar'
				});
				Y.ObjectAssert.hasKeys(o6, {
					foo: 'foo',
					bar: 'bar'
				}, 'Test to ensure all defaults get overridden');
				
				Y.Assert.isNull(Kevlar.apply(null, {}), 'Test null first argument');
			}
		},
			
		
		/*
		 * Test applyIf()
		 */
		{
			name : "Test applyIf()",
			
			
			test_applyIf: function(){
				var o1 = Kevlar.applyIf({}, {
					foo: 'foo',
					bar: 'bar'
				});
				Y.ObjectAssert.hasKeys(o1, {
					foo: 'foo',
					bar: 'bar'
				}, 'Test with an empty destination object');
				
				var o2 = Kevlar.applyIf({
					foo: 'foo'
				}, {
					foo: 'oldFoo'
				});
				Y.ObjectAssert.hasKeys(o2, {
					foo: 'foo'
				}, 'Ensure existing properties don\'t get overridden');
				
				var o3 = Kevlar.applyIf({
					foo: 1,
					bar: 2
				}, {
					bar: 3,
					baz: 4
				});
				Y.ObjectAssert.hasKeys(o3, {
					foo: 1,
					bar: 2,
					baz: 4
				}, 'Test mixing properties to be overridden');
				
				var o4 = {};
				Kevlar.applyIf(o4, {
					foo: 2
				}, {
					foo: 1
				});
				Y.ObjectAssert.hasKeys(o4, {
					foo: 2
				}, 'Test that the reference of the object is changed');
				
				Y.Assert.isNull(Kevlar.applyIf(null, {}), 'Test null first argument');
			}
		},
			
			
		
		/*
		 * Test Kevlar.copyTo()
		 */
		{
			name : "Test copyTo()",
				
			test_copyTo: function(){
				var from = {
					x: 50,
					y: 100,
					width: 'auto',
					height: 200
				};
				
				var o1 = Kevlar.copyTo({}, from, 'x,y');
				Y.ObjectAssert.hasKeys(o1, {
					x: 50,
					y: 100
				}, 'Test simple copy with string');
				
				var o2 = Kevlar.copyTo({}, from, '');
				Y.Assert.isUndefined(o2.x, 'Test with empty string as properties');
				Y.Assert.isUndefined(o2.y, 'Test with empty string as properties');
				Y.Assert.isUndefined(o2.width, 'Test with empty string as properties');
				Y.Assert.isUndefined(o2.height, 'Test with empty string as properties');
				
				var o3 = {};
				Kevlar.copyTo(o3, from, 'width');
				Y.ObjectAssert.hasKeys(o3, {
					width: 'auto'
				}, 'Test copy ensuring that the original reference is changed');
				
				var o4 = Kevlar.copyTo({
					x: 1
				}, from, ['x', 'y']);
				Y.ObjectAssert.hasKeys(o4, {
					x: 50,
					y: 100
				}, 'Test with array as properties, also with an existing value in the destination object');
			}
		},
			
			
		
		/*
		 * Test Kevlar.each()
		 */
		{
			name : "Test each()",
			
			test_each: function(){
				var sum = 0;
				Kevlar.each([1, 2, 3, 4], function(val){
					sum += val;
				});
				Y.Assert.areEqual(10, sum, 'Simple each on an array of numbers');
					
				var s = '';
				Kevlar.each(['T', 'e', 's', 't', 'i', 'n', 'g'], function(c){
					s += c;
				});
				Y.Assert.areEqual('Testing', s, 'Simple each on array of strings');
					
				sum = 0;
				Kevlar.each(5, function(num){
					sum += num;
				});
				Y.Assert.areEqual(5, sum, 'Test with a non array parameter, number');
					
				var hit = false;
				Kevlar.each([], function(){
					hit = true;
				});
				Y.Assert.isFalse(hit, 'Test with empty array parameter');
					
				hit = false;
				Kevlar.each(null, function(){
					hit = true;
				});
				Y.Assert.isFalse(hit, 'Test with null parameter');
					
				hit = false;
				Kevlar.each(document.getElementsByTagName('body'), function(){
					hit = true;
				});
				Y.Assert.isTrue(hit, 'Test iteration over NodeLists');
					
				var arr = [];
				Kevlar.each([1, 2, 3, 4, 5, 6], function(val, idx){
					arr.push(idx);
				});
				Y.ArrayAssert.itemsAreEqual([0, 1, 2, 3, 4, 5], arr, 'Test index is passed correctly');
					
				sum = 0;
				Kevlar.each([1, 2, 3, 4, 5, 6], function(val){
					if(val > 4){
						return false;
					}
					sum += val;
				});
				Y.Assert.areEqual(10, sum, 'Test that returning false stops iteration');
					
				sum = 0;
				var scope = {value: 3};
				Kevlar.each([1, 2, 3], function(val){
					sum += val * this.value;
				}, scope);
				Y.Assert.areEqual(18, sum, 'Test scope argument #1');
					
				sum = 0;
				scope = {value: 5};
				Kevlar.each([1, 2, 3], function(val){
					sum += val * this.value; //value should be 5
				}, scope);
				Y.Assert.areEqual(30, sum, 'Test scope argument #2');
			}
		},
			
			
		
		/*
		 * Test Kevlar.escapeRe()
		 */
		{
			name : "Test escapeRe()",
			
			
			/*
			 * Test Kevlar.escapeRe()
			 */
			test_escapeRe: function(){
				Y.Assert.areEqual('\\-', Kevlar.escapeRe('-'), 'Test with single char');
				Y.Assert.areEqual('\\*\\.', Kevlar.escapeRe('*.'), 'Test with multiple characters next to each other');
				Y.Assert.areEqual('foo', Kevlar.escapeRe('foo'), 'Test with no escapeable chars');
				Y.Assert.areEqual('\\{baz\\}', Kevlar.escapeRe('{baz}'), 'Test with mixed set');
				Y.Assert.areEqual('\\-\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\/\\\\', Kevlar.escapeRe('-.*+?^${}()|[]/\\'), 'Test with every character');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isArray()
		 */
		{
			name : "Test isArray()",
			
			test_isArray: function() {
				var C = Kevlar.extend(Object, {
					length: 1
				});
				Y.Assert.isTrue(Kevlar.isArray([]), 'Test with empty array');
				Y.Assert.isTrue(Kevlar.isArray([1, 2, 3, 4]), 'Test with filled array');
				Y.Assert.isFalse(Kevlar.isArray(false), 'Test with boolean #1');
				Y.Assert.isFalse(Kevlar.isArray(true), 'Test with boolean #2');
				Y.Assert.isFalse(Kevlar.isArray('foo'), 'Test with string');
				Y.Assert.isFalse(Kevlar.isArray(1), 'Test with number');
				Y.Assert.isFalse(Kevlar.isArray(null), 'Test with null');
				Y.Assert.isFalse(Kevlar.isArray(new Date()), 'Test with a date');
				Y.Assert.isFalse(Kevlar.isArray({}), 'Test with empty object');
				Y.Assert.isFalse(Kevlar.isArray(document.getElementsByTagName('body')), 'Test with node list');
				Y.Assert.isFalse(Kevlar.isArray(jQuery( 'body' )[ 0 ]), 'Test with element');
				Y.Assert.isFalse(Kevlar.isArray(new C()), 'Test with custom class that has a length property');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isBoolean()
		 */
		{
			name : "Test isBoolean()",
			
			test_isBoolean: function() {
				Y.Assert.isTrue(Kevlar.isBoolean(true), 'Test with true');
				Y.Assert.isTrue(Kevlar.isBoolean(false), 'Test with false');
				Y.Assert.isFalse(Kevlar.isBoolean([]), 'Test with empty array');
				Y.Assert.isFalse(Kevlar.isBoolean([1, 2, 3]), 'Test with filled array');
				Y.Assert.isFalse(Kevlar.isBoolean(1), 'Test with number');
				Y.Assert.isFalse(Kevlar.isBoolean(''), 'Test with empty string');
				Y.Assert.isFalse(Kevlar.isBoolean('foo'), 'Test with non empty string');
				Y.Assert.isFalse(Kevlar.isBoolean(jQuery( 'body' )[ 0 ]), 'Test with element');
				Y.Assert.isFalse(Kevlar.isBoolean(null), 'Test with null');
				Y.Assert.isFalse(Kevlar.isBoolean({}), 'Test with object');
				Y.Assert.isFalse(Kevlar.isBoolean(new Date()), 'Test with date');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isDate()
		 */
		{
			name : "Test isDate()",
			
			test_isDate: function() {
				Y.Assert.isTrue(Kevlar.isDate(new Date()), 'Test with simple date');
				Y.Assert.isTrue(Kevlar.isDate(Date.parseDate('2000', 'Y')), 'Test with simple date');
				Y.Assert.isFalse(Kevlar.isDate(true), 'Test with boolean');
				Y.Assert.isFalse(Kevlar.isDate(1), 'Test with number');
				Y.Assert.isFalse(Kevlar.isDate('foo'), 'Test with string');
				Y.Assert.isFalse(Kevlar.isDate(null), 'Test with null');
				Y.Assert.isFalse(Kevlar.isDate([]), 'Test with array');
				Y.Assert.isFalse(Kevlar.isDate({}), 'Test with object');
				Y.Assert.isFalse(Kevlar.isDate(jQuery( 'body' )[ 0 ]), 'Test with element');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isDefined()
		 */
		{
			name : "Test isDefined()",
			
			test_isDefined: function() {
				Y.Assert.isFalse(Kevlar.isDefined(undefined), 'Test with undefined');
				Y.Assert.isTrue(Kevlar.isDefined(null), 'Test with null');
				Y.Assert.isTrue(Kevlar.isDefined({}), 'Test with object');
				Y.Assert.isTrue(Kevlar.isDefined([]), 'Test with array');
				Y.Assert.isTrue(Kevlar.isDefined(new Date()), 'Test with date');
				Y.Assert.isTrue(Kevlar.isDefined(1), 'Test with number');
				Y.Assert.isTrue(Kevlar.isDefined(false), 'Test with boolean');
				Y.Assert.isTrue(Kevlar.isDefined(''), 'Test with empty string');
				Y.Assert.isTrue(Kevlar.isDefined('foo'), 'Test with non-empty string');
				Y.Assert.isTrue(Kevlar.isDefined(jQuery( 'body' )[ 0 ]), 'Test with element');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isElement()
		 */
		{
			name : "Test isElement()",
			
			test_isElement: function() {
				Y.Assert.isTrue(Kevlar.isElement(jQuery( 'body' )[ 0 ]), 'Test with element');
				Y.Assert.isFalse(Kevlar.isElement(null), 'Test with null');
				Y.Assert.isFalse(Kevlar.isElement(1), 'Test with number');
				Y.Assert.isFalse(Kevlar.isElement('foo'), 'Test with string');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isJQuery()
		 */
		{
			name : "Test isJQuery()",
			
			test_isJQuery: function() {
				Y.Assert.isFalse(Kevlar.isJQuery(jQuery( 'body' )[0]), 'Test with element');
				Y.Assert.isFalse(Kevlar.isJQuery(undefined), 'Test with undefined');
				Y.Assert.isFalse(Kevlar.isJQuery(null), 'Test with null');
				Y.Assert.isFalse(Kevlar.isJQuery(1), 'Test with number');
				Y.Assert.isFalse(Kevlar.isJQuery('foo'), 'Test with string');
				Y.Assert.isFalse(Kevlar.isJQuery(false), 'Test with boolean');
				Y.Assert.isFalse(Kevlar.isJQuery({}), 'Test with anonymous object');
				Y.Assert.isFalse(Kevlar.isJQuery(Kevlar.emptyFn), 'Test with function');
				Y.Assert.isFalse(Kevlar.isJQuery([]), 'Test with array');
				Y.Assert.isTrue(Kevlar.isJQuery(jQuery( 'body' )), 'Test with jQuery wrapped set object, with an element');
				Y.Assert.isTrue(Kevlar.isJQuery(jQuery( '#non-existent-element' )), 'Test with jQuery wrapped set object, without any elements');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isFunction()
		 */
		{
			name : "Test isFunction()",
			
			test_isFunction: function() {
				var c = new Kevlar.util.Observable(), o = {
					fn: function(){
					}
				};
				Y.Assert.isTrue(Kevlar.isFunction(function(){
				}), 'Test with anonymous function');
				Y.Assert.isTrue(Kevlar.isFunction(new Function('return "";')), 'Test with new Function syntax');
				Y.Assert.isTrue(Kevlar.isFunction(Kevlar.emptyFn), 'Test with static function');
				Y.Assert.isTrue(Kevlar.isFunction(c.fireEvent), 'Test with instance function');
				Y.Assert.isTrue(Kevlar.isFunction(o.fn), 'Test with function on object');
				Y.Assert.isFalse(Kevlar.isFunction(Kevlar.version), 'Test with class property');
				Y.Assert.isFalse(Kevlar.isFunction(null), 'Test with null');
				Y.Assert.isFalse(Kevlar.isFunction(1), 'Test with number');
				Y.Assert.isFalse(Kevlar.isFunction(''), 'Test with string');
				Y.Assert.isFalse(Kevlar.isFunction(new Date()), 'Test with date');
				Y.Assert.isFalse(Kevlar.isFunction([]), 'Test with array');
				Y.Assert.isFalse(Kevlar.isFunction({}), 'Test with object');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isNumber()
		 */
		{
			name : "Test isNumber()",
			
			test_isNumber: function(){
				Y.Assert.isTrue(Kevlar.isNumber(0), 'Test with 0');
				Y.Assert.isTrue(Kevlar.isNumber(4), 'Test with non-zero integer');
				Y.Assert.isTrue(Kevlar.isNumber(-3), 'Test with negative integer');
				Y.Assert.isTrue(Kevlar.isNumber(7.9), 'Test with positive float');
				Y.Assert.isTrue(Kevlar.isNumber(-4.3), 'Test with negative float');
				Y.Assert.isTrue(Kevlar.isNumber(Number.MAX_VALUE), 'Test with MAX_VALUE');
				Y.Assert.isTrue(Kevlar.isNumber(Number.MIN_VALUE), 'Test with MIN_VALUE');
				Y.Assert.isTrue(Kevlar.isNumber(Math.PI), 'Test with Math.PI');
				Y.Assert.isTrue(Kevlar.isNumber(Number('3.1')), 'Test with Number() constructor');
				Y.Assert.isFalse(Kevlar.isNumber(Number.NaN), 'Test with NaN');
				Y.Assert.isFalse(Kevlar.isNumber(Number.POSITIVE_INFINITY), 'Test with POSITIVE_INFINITY');
				Y.Assert.isFalse(Kevlar.isNumber(Number.NEGATIVE_INFINITY), 'Test with NEGATIVE_INFINITY');
				Y.Assert.isFalse(Kevlar.isNumber(true), 'Test with true');
				Y.Assert.isFalse(Kevlar.isNumber(''), 'Test with empty string');
				Y.Assert.isFalse(Kevlar.isNumber('1.0'), 'Test with string containing a number');
				Y.Assert.isFalse(Kevlar.isNumber(null), 'Test with null');
				Y.Assert.isFalse(Kevlar.isNumber(undefined), 'Test with undefined');
				Y.Assert.isFalse(Kevlar.isNumber([]), 'Test with array');
				Y.Assert.isFalse(Kevlar.isNumber({}), 'Test with object');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isObject()
		 */
		{
			name : "Test isObject()",
			
			test_isObject: function(){
				Y.Assert.isTrue(Kevlar.isObject({}), 'Test with empty object');
				Y.Assert.isTrue(Kevlar.isObject({
					foo: 1
				}), 'Test with object with properties');
				Y.Assert.isTrue(Kevlar.isObject(new Kevlar.util.Observable()), 'Test with object instance');
				Y.Assert.isTrue(Kevlar.isObject(new Object()), 'Test with new Object(  ) syntax');
				Y.Assert.isFalse(Kevlar.isObject(new Date()), 'Test with a date object');
				Y.Assert.isFalse(Kevlar.isObject([]), 'Test with array');
				Y.Assert.isFalse(Kevlar.isObject(new Array()), 'Test with new Array(  ) syntax');
				Y.Assert.isFalse(Kevlar.isObject(1), 'Test with number');
				Y.Assert.isFalse(Kevlar.isObject('foo'), 'Test with string');
				Y.Assert.isFalse(Kevlar.isObject(false), 'Test with boolean');
				Y.Assert.isFalse(Kevlar.isObject(new Number(3)), 'Test with new Number() syntax');
				Y.Assert.isFalse(Kevlar.isObject(new String('foo')), 'Test with new String() syntax');
				Y.Assert.isFalse(Kevlar.isObject(null), 'Test with null');
				Y.Assert.isFalse(Kevlar.isObject(undefined), 'Test with undefined');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isPrimitive()
		 */
		{
			name : "Test isPrimitive()",
			
			test_isPrimitive: function() {
				Y.Assert.isTrue(Kevlar.isPrimitive(1), 'Test with integer');
				Y.Assert.isTrue(Kevlar.isPrimitive(-3), 'Test with negative integer');
				Y.Assert.isTrue(Kevlar.isPrimitive(1.4), 'Test with floating number');
				Y.Assert.isTrue(Kevlar.isPrimitive(Number.MAX_VALUE), 'Test with Number.MAX_VALUE');
				Y.Assert.isTrue(Kevlar.isPrimitive(Math.PI), 'Test with Math.PI');
				Y.Assert.isTrue(Kevlar.isPrimitive(''), 'Test with empty string');
				Y.Assert.isTrue(Kevlar.isPrimitive('foo'), 'Test with non empty string');
				Y.Assert.isTrue(Kevlar.isPrimitive(true), 'Test with boolean true');
				Y.Assert.isTrue(Kevlar.isPrimitive(false), 'Test with boolean false');
				Y.Assert.isFalse(Kevlar.isPrimitive(null), 'Test with null');
				Y.Assert.isFalse(Kevlar.isPrimitive(undefined), 'Test with undefined');
				Y.Assert.isFalse(Kevlar.isPrimitive({}), 'Test with object');
				Y.Assert.isFalse(Kevlar.isPrimitive([]), 'Test with array');
				Y.Assert.isFalse(Kevlar.isPrimitive(new Kevlar.util.Observable()), 'Test with object instance');
			}
		},
			
			
		
		/*
		 * Test Kevlar.isString()
		 */
		{
			name : "Test isString()",
			
			test_isString: function(){
				var s = new String('foo');
				Y.Assert.isTrue(Kevlar.isString(''), 'Test with empty string');
				Y.Assert.isTrue(Kevlar.isString('foo'), 'Test with non empty string');
				Y.Assert.isTrue(Kevlar.isString(String('')), 'Test with String() syntax');
				Y.Assert.isFalse(Kevlar.isString(new String('')), 'Test with new String() syntax'); //should return an object that wraps the primitive
				Y.Assert.isFalse(Kevlar.isString(1), 'Test with number');
				Y.Assert.isFalse(Kevlar.isString(true), 'Test with boolean');
				Y.Assert.isFalse(Kevlar.isString(null), 'Test with null');
				Y.Assert.isFalse(Kevlar.isString(undefined), 'Test with undefined');
				Y.Assert.isFalse(Kevlar.isString([]), 'Test with array');
				Y.Assert.isFalse(Kevlar.isString({}), 'Test with number');
			}
		},
			
			
		
		/*
		 * Test Kevlar.namespace()
		 */
		{
			name : "Test namespace()",
			
			test_namespace: function(){
				var w = window;
				
				Kevlar.namespace('FooTest1');
				Y.Assert.isNotUndefined(w.FooTest1, 'Test creation with a single top-level namespace');
				
				Kevlar.namespace('FooTest2', 'FooTest3', 'FooTest4');
				Y.Assert.isNotUndefined(w.FooTest2, 'Test creation with multiple top level namespaces');
				Y.Assert.isNotUndefined(w.FooTest3, 'Test creation with multiple top level namespaces');
				Y.Assert.isNotUndefined(w.FooTest4, 'Test creation with multiple top level namespaces');
				
				Kevlar.namespace('FooTest5', 'FooTest5.ns1', 'FooTest5.ns1.ns2', 'FooTest5.ns1.ns2.ns3');
				Y.Assert.isNotUndefined(w.FooTest5, 'Test a chain of namespaces, starting from a top-level');
				Y.Assert.isNotUndefined(w.FooTest5.ns1, 'Test a chain of namespaces, starting from a top-level');
				Y.Assert.isNotUndefined(w.FooTest5.ns1.ns2, 'Test a chain of namespaces, starting from a top-level');
				Y.Assert.isNotUndefined(w.FooTest5.ns1.ns2.ns3, 'Test a chain of namespaces, starting from a top-level');
				
				Kevlar.namespace('FooTest6.ns1', 'FooTest7.ns1');
				Y.Assert.isNotUndefined(w.FooTest6.ns1, 'Test creating lower level namespaces without first defining the top level');
				Y.Assert.isNotUndefined(w.FooTest7.ns1, 'Test creating lower level namespaces without first defining the top level');
				
				Kevlar.namespace('FooTest8', 'FooTest8.ns1.ns2');
				Y.Assert.isNotUndefined(w.FooTest8, 'Test creating a lower level namespace without defining the middle level');
				Y.Assert.isNotUndefined(w.FooTest8.ns1, 'Test creating a lower level namespace without defining the middle level');
				Y.Assert.isNotUndefined(w.FooTest8.ns1.ns2, 'Test creating a lower level namespace without defining the middle level');
				
				FooTest8.prop1 = 'foo';
				Kevlar.namespace('FooTest8');
				Y.Assert.areEqual('foo', FooTest8.prop1, 'Ensure existing namespaces are not overwritten');
			}
		},
			
			
		
		/*
		 * Test Kevlar.toArray()
		 */
		{
			name : "Test toArray()",
			
			/*
			 * Test Kevlar.()
			 */
			test_toArray: function(){
				Y.Assert.isArray(Kevlar.toArray(document.getElementsByTagName('body')), 'Test with node list');
			}
		},
		
		
		/*
		 * Test extend()
		 */
		{
			name: 'Test extend()',
	
			
			"extend() should set up simple prototype-chaining inheritance" : function() {
				var Dude = Kevlar.extend(Object, {
					constructor: function(config){
						Kevlar.apply(this, config);
						this.isBadass = false;
					}
				});
				var Aweysome = Kevlar.extend(Dude, {
					constructor: function(){
						Aweysome.superclass.constructor.apply(this, arguments);
						this.isBadass = true;
					}
				});
				
				var david = new Aweysome({
					davis: 'isAwesome'
				});
				Y.Assert.areEqual('isAwesome', david.davis, 'Test if David is awesome');
				Y.Assert.isTrue(david.isBadass, 'Test if David is badass');
				Y.Assert.isFunction(david.override, 'Test if extend added the override method');
				Y.ObjectAssert.areEqual({
					isBadass: true,
					davis: 'isAwesome'
				}, david, 'Test if David is badass and awesome');
			},
			
			
			
			"extend() should add static 'constructor' property to the class (constructor function)" : function() {
				var A = Kevlar.extend( Object, {} );
				Y.Assert.areSame( A.constructor, A, "static 'constructor' property not added to constructor function that refers to constructor function" );
			},
			
			
			
			"extend() should add static 'constructor' property to a subclass (constructor function)" : function() {
				var A = Kevlar.extend( Object, {} );
				var B = Kevlar.extend( A, {} );
				Y.Assert.areSame( B.constructor, B, "static 'constructor' property not added to constructor function that refers to constructor function" );
			},
			
			
			
			"extend() should add static 'superclass' property to a subclass (constructor function) that refers to its superclass prototype" : function() {
				var A = Kevlar.extend( Object, {} );
				var B = Kevlar.extend( A, {} );
				Y.Assert.areSame( B.superclass, A.prototype, "static 'superclass' property not added to constructor function that refers to constructor function" );
			},
			
			
			
			"extend() should be able to add in a single mixin class into another class" : function() {
				var mixinFnExecuted = false; 
				
				var Mixin = Kevlar.extend( Object, {
					mixinFn : function() {
						mixinFnExecuted = true;
					}
				} );
				
				var MyClass = Kevlar.extend( Object, [ Mixin ], {
					// empty
				} );
				
				
				var instance = new MyClass(); 
				instance.mixinFn();   // execute the function
				Y.Assert.isTrue( mixinFnExecuted, "The mixin function was not properly added to MyClass." );
			},
			
			
			
			"extend() should not overwrite a class's methods/properties with a mixin's methods/properties" : function() {
				var data = null; 
				
				var Mixin = Kevlar.extend( Object, {
					testProp : "Mixin defined",
					testMethod : function() {
						data = "Mixin defined";
					}
				} );
				
				var MyClass = Kevlar.extend( Object, [ Mixin ], {
					testProp : "MyClass defined",
					testMethod : function() {
						data = "MyClass defined";
					}
				} );
				
				
				var instance = new MyClass(); 
				Y.Assert.areSame( "MyClass defined", instance.testProp, "The mixin should not overwrite the class's properties" );
				
				instance.testMethod();
				Y.Assert.areSame( "MyClass defined", data, "The mixin's method should not have overwritten the class's method." );
			},
			
			
			
			"extend() should have later-defined mixins take precedence over earlier-defined mixins" : function() {
				var Mixin1 = Kevlar.extend( Object, {
					testProp : "Mixin1 defined"
				} );
				var Mixin2 = Kevlar.extend( Object, {
					testProp : "Mixin2 defined"
				} );
				
				var MyClass = Kevlar.extend( Object, [ Mixin1, Mixin2 ], {
					// empty
				} );
				
				var instance = new MyClass();
				Y.Assert.areSame( "Mixin2 defined", instance.testProp, "The second mixin's properties/methods should take precedence over the first one's." );
			},
			
			
			
			"extend() should have set up the hasMixin() method, which should check the class for a given mixin" : function() {
				var Mixin = Kevlar.extend( Object, {} );
				var SomeOtherMixin = Kevlar.extend( Object, {} );
				
				var MyClass = Kevlar.extend( Object, [ Mixin ], {} );
				
				Y.Assert.isTrue( MyClass.hasMixin( Mixin ), "MyClass should have the mixin 'Mixin'" );
				Y.Assert.isFalse( MyClass.hasMixin( SomeOtherMixin ), "MyClass should *not* have the mixin 'SomeOtherMixin'" );
			},
			
			
			
			"extend() should have set up the hasMixin() method, which should check the class and all of its superclasses for a given mixin" : function() {
				var Mixin = Kevlar.extend( Object, {} );
				var SomeOtherMixin = Kevlar.extend( Object, {} );
				var SomeOtherMixin2 = Kevlar.extend( Object, {} );
				var NobodyHasThisMixin = Kevlar.extend( Object, {} );
				
				var MySuperBaseClass = Kevlar.extend( Object, [ Mixin ], {} );
				var MyBaseClass = Kevlar.extend( MySuperBaseClass, [ SomeOtherMixin ], {} );
				var MyClass = Kevlar.extend( MyBaseClass, [ SomeOtherMixin2 ], {} );
				
				// Looping tests twice. First iteration tests the lookup, second tests that caching is working correctly
				for( var i = 0; i <= 1; i++ ) {
					var pass = ( i === 0 ) ? "initial" : "cached"; 
					Y.Assert.isTrue( MyClass.hasMixin( Mixin ), "MyClass should have the mixin 'Mixin' from its superclass's superclass. pass = " + pass );
					Y.Assert.isTrue( MyClass.hasMixin( SomeOtherMixin ), "MyClass should have the mixin 'SomeOtherMixin' on its superclass. pass = " + pass );
					Y.Assert.isTrue( MyClass.hasMixin( SomeOtherMixin2 ), "MyClass should have the mixin 'SomeOtherMixin2' on itself. pass = " + pass );
					Y.Assert.isFalse( MyClass.hasMixin( NobodyHasThisMixin ), "MyClass should *not* have the mixin 'NobodyHasThisMixin'. pass = " + pass );
				}
			},
			
			
			
			"extend() should have set up the hasMixin() method, which should work with mixins and classes defined by regular functions (not using extend())" : function() {
				var Mixin = function() {};
				var SomeOtherMixin = function() {};
				var NobodyHasThisMixin = function() {};
				
				var MySuperBaseClass = function() {};
				var MyBaseClass = Kevlar.extend( MySuperBaseClass, [ Mixin ], {} );
				var MyClass = Kevlar.extend( MyBaseClass, [ SomeOtherMixin ], {} );
				
				// Looping tests twice. First iteration tests the lookup, second tests that caching is working correctly
				for( var i = 0; i <= 1; i++ ) {
					var pass = ( i === 0 ) ? "initial" : "cached"; 
					Y.Assert.isTrue( MyClass.hasMixin( Mixin ), "MyClass should have the mixin 'Mixin' from its superclass. pass = " + pass );
					Y.Assert.isTrue( MyClass.hasMixin( SomeOtherMixin ), "MyClass should have the mixin 'SomeOtherMixin' on itself. pass = " + pass );
					Y.Assert.isFalse( MyClass.hasMixin( NobodyHasThisMixin ), "MyClass should *not* have the mixin 'NobodyHasThisMixin'. pass = " + pass );
				}
			},
			
			
			"extend() should have set up the hasMixin() method on the subclass's prototype, which should work as the static one on an instance's class" : function() {
				var Mixin = Kevlar.extend( Object, {} );
				var SomeOtherMixin = Kevlar.extend( Object, {} );
				var SomeOtherMixin2 = Kevlar.extend( Object, {} );
				var NobodyHasThisMixin = Kevlar.extend( Object, {} );
				
				var MySuperBaseClass = Kevlar.extend( Object, [ Mixin ], {} );
				var MyBaseClass = Kevlar.extend( MySuperBaseClass, [ SomeOtherMixin ], {} );
				var MyClass = Kevlar.extend( MyBaseClass, [ SomeOtherMixin2 ], {} );
				var instance = new MyClass();
				
				// Looping tests twice. First iteration tests the lookup, second tests that caching is working correctly
				for( var i = 0; i <= 1; i++ ) {
					var pass = ( i === 0 ) ? "initial" : "cached"; 
					Y.Assert.isTrue( instance.hasMixin( Mixin ), "MyClass should have the mixin 'Mixin' from its superclass's superclass. pass = " + pass );
					Y.Assert.isTrue( instance.hasMixin( SomeOtherMixin ), "MyClass should have the mixin 'SomeOtherMixin' on its superclass. pass = " + pass );
					Y.Assert.isTrue( instance.hasMixin( SomeOtherMixin2 ), "MyClass should have the mixin 'SomeOtherMixin2' on itself. pass = " + pass );
					Y.Assert.isFalse( instance.hasMixin( NobodyHasThisMixin ), "MyClass should *not* have the mixin 'NobodyHasThisMixin'. pass = " + pass );
				}
			}
		},
		
		
		/*
		 * Test isInstanceOf()
		 */
		{
			name : "Test isInstanceOf()",
			
			"isInstanceOf() should return false for any primitive type" : function() {
				Y.Assert.isFalse( Kevlar.isInstanceOf( undefined, Object ), "isInstanceOf should have returned false when given undefined" );
				Y.Assert.isFalse( Kevlar.isInstanceOf( null, Object ), "isInstanceOf should have returned false when given null" );
				Y.Assert.isFalse( Kevlar.isInstanceOf( 1, Object ), "isInstanceOf should have returned false when given a number" );
				Y.Assert.isFalse( Kevlar.isInstanceOf( "hi", Object ), "isInstanceOf should have returned false when given a string" );
				Y.Assert.isFalse( Kevlar.isInstanceOf( true, Object ), "isInstanceOf should have returned false when given a boolean" );
			},
			
			
			"isInstanceOf() should return true when testing an anonymous object with the Object constructor" : function() {
				Y.Assert.isTrue( Kevlar.isInstanceOf( {}, Object ), "isInstanceOf should have returned true" );
			},
			
			
			"isInstanceOf() should return true when testing an object of a class" : function() {
				var MyClass = Kevlar.extend( Object, { 
					constructor : function() {}
				} );
				
				var myInstance = new MyClass();
				
				Y.Assert.isTrue( Kevlar.isInstanceOf( myInstance, MyClass ), "Should have been true. myInstance is an instance of MyClass" );
			},
			
			
			"isInstanceOf() should return true when testing an object that is a subclass of a given class" : function() {
				var MyClass = Kevlar.extend( Object, { 
					constructor : function() {}
				} );
				var MySubClass = Kevlar.extend( MyClass, {
					constructor : function() {}
				} );
				
				var myInstance = new MySubClass();
				
				Y.Assert.isTrue( Kevlar.isInstanceOf( myInstance, MyClass ), "Should have been true. myInstance is an instance of MySubClass, which inherits from MyClass" );
			},
			
			
			"isInstanceOf() should return false when testing an object that is not an instance of a given class" : function() {
				var MyClass = Kevlar.extend( Object, { 
					constructor : function() {}
				} );
				
				var SomeOtherClass = Kevlar.extend( Object, {
					constructor : function() {}
				} );
				
				var myInstance = new SomeOtherClass();
				
				Y.Assert.isFalse( Kevlar.isInstanceOf( myInstance, MyClass ), "Should have been false. myInstance is not an instance of MyClass" );
			},
			
			
			"isInstanceOf() should return true when testing an object that has a given mixin class" : function() {
				var MyMixinClass = Kevlar.extend( Object, {
					constructor : function() {}
				} );
				
				var MyClass = Kevlar.extend( Object, [ MyMixinClass ], { 
					constructor : function() {}
				} );
				
				var myInstance = new MyClass();
				
				Y.Assert.isTrue( Kevlar.isInstanceOf( myInstance, MyMixinClass ), "Should have been true. myInstance has the mixin MyMixinClass" );
			},
			
			
			"isInstanceOf() should return true when testing an object that has a given mixin class implemented in its superclass" : function() {
				var MyMixinClass = Kevlar.extend( Object, {
					constructor : function() {}
				} );
				
				var MyClass = Kevlar.extend( Object, [ MyMixinClass ], { 
					constructor : function() {}
				} );
				var MySubClass = Kevlar.extend( MyClass, { 
					constructor : function() {}
				} );
				
				var myInstance = new MySubClass();
				
				Y.Assert.isTrue( Kevlar.isInstanceOf( myInstance, MyMixinClass ), "Should have been true. myInstance has the mixin MyMixinClass through its superclass" );
			},
			
			
			"isInstanceOf() should return true when testing an object that has a given mixin class implemented in its superclass's superclass" : function() {
				var MyMixinClass = Kevlar.extend( Object, {
					constructor : function() {}
				} );
				
				var MyClass = Kevlar.extend( Object, [ MyMixinClass ], { 
					constructor : function() {}
				} );
				var MySubClass = Kevlar.extend( MyClass, { 
					constructor : function() {}
				} );
				var MySubSubClass = Kevlar.extend( MySubClass, { 
					constructor : function() {}
				} );
				
				var myInstance = new MySubSubClass();
				
				Y.Assert.isTrue( Kevlar.isInstanceOf( myInstance, MyMixinClass ), "Should have been true. myInstance has the mixin MyMixinClass through its superclass's superclass" );
			}
		}
	]
	
} );
