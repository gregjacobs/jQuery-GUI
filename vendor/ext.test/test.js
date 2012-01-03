/**
 * @class Ext.test.Test
 * Simple wrapper class for encapsulating individual tests within a TestCase
 *
 * @param {String} name The name of the test
 * @param {Ext.test.TestCase} testCase The TestCase that this test belongs to.
 * @param {Function} fn The test's function.
 */
Ext.test.Test = function( name, testCase, fn ) {
	this.name = name;
	this.testCase = testCase;
	this.fn = fn;
}