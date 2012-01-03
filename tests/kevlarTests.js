/*!
 * Kevlar JS Library
 * Copyright(c) 2011 Gregory Jacobs.
 * MIT Licensed. http://www.opensource.org/licenses/mit-license.php
 */
/*global Ext */
Ext.test.Session.addSuite( 'Kevlar.ui', { name: 'Kevlar.ui.anim' } );
Ext.test.Session.addSuite( 'Kevlar.ui', { name: 'Kevlar.ui.containers' } );
Ext.test.Session.addSuite( 'Kevlar.ui', { name: 'Kevlar.ui.formFields' } );
Ext.test.Session.addSuite( 'Kevlar.ui', { name: 'Kevlar.ui.layouts' } );
Ext.test.Session.addSuite( 'Kevlar.ui', { name: 'Kevlar.ui.utils' } );

/*global Ext */
Ext.test.Session.addSuite( 'Kevlar.ui', { name: 'Kevlar.ui.anim' } );
Ext.test.Session.addSuite( 'Kevlar.ui', { name: 'Kevlar.ui.containers' } );
Ext.test.Session.addSuite( 'Kevlar.ui', { name: 'Kevlar.ui.formFields' } );
Ext.test.Session.addSuite( 'Kevlar.ui', { name: 'Kevlar.ui.layouts' } );
Ext.test.Session.addSuite( 'Kevlar.ui', { name: 'Kevlar.ui.utils' } );

/*global Ext, Y, Kevlar */
Ext.test.Session.addTest( {
	
	name: 'Kevlar.CSS',
	
	"hashToString() should return an empty string when providing an empty hash" : function() {
		Y.Assert.areSame( "", Kevlar.CSS.hashToString( {} ) );
	},
	

	"hashToString() should convert a hash of property/value pairs to a CSS string" : function() {
		var props = {
			'color'     : 'red',
			'font-size' : '12px'
		};
		
		Y.Assert.areSame( "color:red;font-size:12px;", Kevlar.CSS.hashToString( props ) );
	},
	
	
	"hashToString() should convert camelCase style properties to their 'dash' form for the resulting string" : function() {
		var props = {
			'fontFamily' : 'Arial',
			'fontSize'   : '12px'
		};
		
		Y.Assert.areSame( "font-family:Arial;font-size:12px;", Kevlar.CSS.hashToString( props ) );
	}
    
} );

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

/*global jQuery, Ext, Y, Kevlar */
Ext.test.Session.addSuite( {
	
	name : 'Kevlar.Object',
	
	items : [
	
		/*
		 * Test clone()
		 */
		{
			name : "Test clone()",
			
			"clone() should return primitive types as-is" : function() {
				// Tests with primitive types
				Y.Assert.areSame( undefined, Kevlar.Object.clone( undefined ), "clone() not returning undefined when provided undefined." );
				Y.Assert.areSame( null, Kevlar.Object.clone( null ), "clone() not returning null when provided null." );
				Y.Assert.areSame( true, Kevlar.Object.clone( true ), "clone() not returning true when provided true." );
				Y.Assert.areSame( false, Kevlar.Object.clone( false ), "clone() not returning false when provided false." );
				Y.Assert.areSame( 0, Kevlar.Object.clone( 0 ), "clone() not returning 0 when provided 0." );
				Y.Assert.areSame( 1, Kevlar.Object.clone( 1 ), "clone() not returning 1 when provided 1." );
				Y.Assert.areSame( "", Kevlar.Object.clone( "" ), "clone() not returning empty string when provided an empty string." );
				Y.Assert.areSame( "hi", Kevlar.Object.clone( "hi" ), "clone() not returning string 'hi' when provided string 'hi'." );
			},
			
			"clone() should copy an array of primitives" : function() {
				var simpleArr = [ 1, 2, 3, 4, 5 ];
				Y.Assert.areNotSame( simpleArr, Kevlar.Object.clone( simpleArr ), "clone() returning same reference to array." );
				Y.Assert.isTrue( Kevlar.Object.isEqual( [ 1, 2, 3, 4, 5 ], Kevlar.Object.clone( simpleArr ) ), "clone() not properly copying a simple array." );
			},
			
			"clone() should deep copy an array of mixed primitives and objects" : function() {
				var complexArr = [ { a: { inner: 1 }, b: 2 }, 1, "asdf", [ 1, 2, { a: 1 } ] ];
				Y.Assert.areNotSame( complexArr, Kevlar.Object.clone( complexArr ), "clone() returning same reference to complex array." );
				Y.Assert.isTrue( Kevlar.Object.isEqual( [ { a: { inner: 1 }, b: 2 }, 1, "asdf", [ 1, 2, { a: 1 } ] ], Kevlar.Object.clone( complexArr ) ), "clone() not properly deep copying a complex array." );
				Y.Assert.areNotSame( complexArr[ 0 ], Kevlar.Object.clone( complexArr )[ 0 ], "clone() not properly deep copying a complex array. first element has same reference for original and copy." ); 
				Y.Assert.areNotSame( complexArr[ 0 ].a, Kevlar.Object.clone( complexArr )[ 0 ].a, "clone() not properly deep copying a complex array. first element, 'a' object, has same reference for original and copy." ); 
				Y.Assert.areSame( complexArr[ 0 ].a, Kevlar.Object.clone( complexArr, /*deep*/ false )[ 0 ].a, "clone() not properly shallow copying a complex array. first element, 'a' object, does not have same reference for original and copy." ); 
			},
			
			
			"clone() should copy a simple object of primitives" : function() {
				var simpleObj = { a: 1, b: 2 };
				Y.Assert.areNotSame( simpleObj, Kevlar.Object.clone( simpleObj ), "clone() returning same reference to simple object." );
				Y.Assert.isTrue( Kevlar.Object.isEqual( { a: 1, b: 2 }, Kevlar.Object.clone( simpleObj ) ), "clone() not properly copying a simple object." );
			},
			
			"clone() should deep copy an object of primitives, nested arrays, and nested objects" : function() {
				var complexObj = { a: 1, b: { a: 1, b: [1,2,3], c: { a: null, b: undefined, c: true, d: false, e: "ohai" } }, c: [1,[1,2]] };
				Y.Assert.areNotSame( complexObj, Kevlar.Object.clone( complexObj ), "clone() returning same reference to complex object." );
				Y.Assert.isTrue( Kevlar.Object.isEqual( { a: 1, b: { a: 1, b: [1,2,3], c: { a: null, b: undefined, c: true, d: false, e: "ohai" } }, c: [1,[1,2]] }, Kevlar.Object.clone( complexObj ) ), "clone() not properly deep copying a complex object." );
				Y.Assert.areNotSame( complexObj.b, Kevlar.Object.clone( complexObj ).b, "clone() not properly deep copying a complex object. property 'b' has same reference for original and copy." );
				Y.Assert.areNotSame( complexObj.b.c, Kevlar.Object.clone( complexObj ).b.c, "clone() not properly deep copying a complex object. property 'b.c' has same reference for original and copy. Nested object inside nested object not getting copied." );
				Y.Assert.areSame( complexObj.b.c, Kevlar.Object.clone( complexObj, /*deep*/ false ).b.c, "clone() with 'deep' set to false (shallow copy mode) is still deep copying a complex object. property 'b.c' does not have same reference for original and copy." );
			},
			
			
			"clone() should not copy prototype properties of instantiated objects" : function() {
				var MyClass = function() {
					this.ownVar = 1;
				};
				MyClass.prototype.prototypeVar = 2;
				
				var myInstance = new MyClass();
				var copiedInstance = Kevlar.Object.clone( myInstance );
				
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
				var isEqual = Kevlar.Object.isEqual;
				
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
			},
			
			
			"isEqual() should work with deep object comparisons" : function() {
				// Quick reference
				var isEqual = Kevlar.Object.isEqual;
				
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
				
			
			"isEqual() should work with deep array comparisons" : function() {
				// Quick reference
				var isEqual = Kevlar.Object.isEqual;
				
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
				var isEqual = Kevlar.Object.isEqual;
				
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
					returnVal = Kevlar.Object.isEqual( a, b, /*deep*/ false );
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
				Y.Assert.areSame( 0, Kevlar.Object.objLength( obj ) );
			},
			
			"objLength() should return 0 for an empty object, even if the object has prototype properties" : function() {
				var MyClass = function() {};
				MyClass.prototype.prop = "prototype property";
				
				var myInstance = new MyClass();
				Y.Assert.areSame( 0, Kevlar.Object.objLength( myInstance ) );
			},
			
			"objLength() should return the number of owned properties in the object" : function() {
				var obj = {
					prop1 : "1",
					prop2 : "2"
				};
				Y.Assert.areSame( 2, Kevlar.Object.objLength( obj ) );
			},
			
			"objLength() should return the number of owned properties in the object, even if they are undefined or falsy" : function() {
				var obj = {
					prop1 : undefined,
					prop2 : null,
					prop3 : false,
					prop4 : 0,
					prop5 : ""
				};
				Y.Assert.areSame( 5, Kevlar.Object.objLength( obj ) );
			}
		},
		
		
		/*
		 * Test isEmpty()
		 */
		{
			name : "Test isEmpty()",
			
			"isEmpty() should return true for an empty object" : function() {
				var obj = {};
				Y.Assert.isTrue( Kevlar.Object.isEmpty( obj ) );
			},
			
			"isEmpty() should return true for an empty object, even if the object has prototype properties" : function() {
				var MyClass = function() {};
				MyClass.prototype.prop = "prototype property";
				
				var myInstance = new MyClass();
				Y.Assert.isTrue( Kevlar.Object.isEmpty( myInstance ) );
			},
			
			"isEmpty() should return false if the object owns properties" : function() {
				var obj = {
					prop1 : "1",
					prop2 : "2"
				};
				Y.Assert.isFalse( Kevlar.Object.isEmpty( obj ) );
			},
			
			"isEmpty() should return false if the object owns properties, even if the properties are undefined or falsy" : function() {
				var obj = {
					prop1 : undefined,
					prop2 : null,
					prop3 : false,
					prop4 : 0,
					prop5 : ""
				};
				Y.Assert.isFalse( Kevlar.Object.isEmpty( obj ) );
			}
		}
	]
} );

Ext.test.Session.addTest( 'Kevlar.data', {
												 
	name: 'Kevlar.data.Field',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	//        Special Instructions
	// --------------------------------
	_should : {
		error : {
			"Instantiating a Field without a 'name' should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with an undefined 'name' argument should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with an undefined 'name' property should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with a null 'name' argument should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with a null 'name' property should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with an empty 'name' argument should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor",
			"Instantiating a Field with an empty 'name' property should throw an error" : "no 'name' property provided to Kevlar.data.Field constructor"
		}
	},
	
	
	
	// --------------------------------
	//             Tests
	// --------------------------------
	
	
	// Check that the name property was provided
	
	"Instantiating a Field without a 'name' should throw an error" : function() {
		var field = new Kevlar.data.Field();
	},
	
	
	"Instantiating a Field with an undefined 'name' argument should throw an error" : function() {
		var field = new Kevlar.data.Field( undefined );
	},
	
	
	"Instantiating a Field with an undefined 'name' property should throw an error" : function() {
		var field = new Kevlar.data.Field( {
			name : undefined
		} );
	},
	
	
	"Instantiating a Field with a null 'name' argument should throw an error" : function() {
		var field = new Kevlar.data.Field( null );
	},
	
	
	"Instantiating a Field with a null 'name' property should throw an error" : function() {
		var field = new Kevlar.data.Field( {
			name : null
		} );
	},
	
	
	"Instantiating a Field with an empty 'name' argument should throw an error" : function() {
		var field = new Kevlar.data.Field( "" );
	},
	
	
	"Instantiating a Field with an empty 'name' property should throw an error" : function() {
		var field = new Kevlar.data.Field( {
			name : ""
		} );
	},
	
	
	
	// Check that the 'name' property can be retrieved by getName()
	
	"The name property should be retrievable by getName()" : function() {
		var field1 = new Kevlar.data.Field( { name: 'testName' } );
		Y.Assert.areSame( 'testName', field1.getName(), "getName() not properly retriving Field's name. Was looking for 'testName'." );
		
		var field2 = new Kevlar.data.Field( { name: '_' } );
		Y.Assert.areSame( '_', field2.getName(), "getName() not properly retriving Field's name. Was looking for '_'." );
		
		var field3 = new Kevlar.data.Field( { name: "abc" } );
		Y.Assert.areSame( "abc", field3.getName(), "getName() not properly retriving Field's name. Was looking for 'abc'." );
	},
	
	
	// Make sure a number provided to the constructor as the 'name' is converted to a string datatype
	
	"Providing the field name as a number directly to the constructor argument should be converted to a string for the field's name" : function() {
		var field = new Kevlar.data.Field( 0 );
		Y.Assert.areSame( "0", field.getName(), "the field name should have been converted to a string" );
	},
	
	"Providing the field name as a property on the config should be converted to a string for the field's name" : function() {
		var field = new Kevlar.data.Field( {
			name : 0
		} );
		Y.Assert.areSame( "0", field.getName(), "the field name should have been converted to a string" );
	},
	
	
	// --------------------------------------
	
	
	// Check that defaultValue is handled correctly
	
	"A default provided as the keyword 'default' should be accepted properly as defaultValue" : function() {
		var field = new Kevlar.data.Field( {
			name : "TestField",
			'default' : 1
		} );
		
		Y.Assert.areSame( 1, field.defaultValue );
	},
	
	
	"A default provided as the keyword 'default' that is a function should be executed and set properly to defaultValue" : function() {
		var field = new Kevlar.data.Field( {
			name : "TestField",
			'default' : function() { return 1; }
		} );
		
		Y.Assert.areSame( 1, field.defaultValue );
	},
	
	
	"A default provided as defaultValue should be accepted properly" : function() {
		var field = new Kevlar.data.Field( {
			name : "TestField",
			defaultValue : 1
		} );
		
		Y.Assert.areSame( 1, field.defaultValue );
	},
	
	
	"A default provided as defaultValue that is a function should be executed and set properly to defaultValue" : function() {
		var field = new Kevlar.data.Field( {
			name : "TestField",
			defaultValue : function() { return 1; }
		} );
		
		Y.Assert.areSame( 1, field.defaultValue );
	},
	
	
	"A defaultValue provided as an object should be recursed for functions, and those functions' return values should be used in the default" : function() {
		var field = new Kevlar.data.Field( {
			name : 'TestField',
			'default' : { 
				a : "A",
				b : {
					innerB1 : function() {
						return "B1";
					},
					innerB2 : "B2"
				},
				c : {
					innerC1 : "C",
					innerC2 : function() {
						return "C2";
					}
				}
			}
		} );
		var defaultData = field.defaultValue;
		Y.Assert.areSame( "A", defaultData.a, "The 'default' config provided as an object should have had the value 'A' for property 'a'." );
		Y.Assert.areSame( "B1", defaultData.b.innerB1, "The 'default' config provided as an object should have been recursed for functions, and their return values used as the properties." );
		Y.Assert.areSame( "C2", defaultData.c.innerC2, "The 'default' config provided as an object should have been recursed for functions, and their return values used as the properties." );
	}
	
} );

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

