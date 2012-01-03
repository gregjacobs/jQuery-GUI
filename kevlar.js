/*!
 * Kevlar JS Library
 * Copyright(c) 2011 Gregory Jacobs.
 * MIT Licensed. http://www.opensource.org/licenses/mit-license.php
 */
// Note: Kevlar license header automatically injected by build process.

/*!
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * 
 * Parts of this library are from Ext-Core.
 * 
 * MIT Licensed - http://extjs.com/license/mit.txt
 */

/*global window, jQuery */
/*jslint forin: true */
/**
 * @class Kevlar
 * @singleton
 * 
 * Main singleton class for the Kevlar library. 
 */
var Kevlar = function() {
	
	// Set up environment info
	this.uA             = window.navigator.userAgent.toLowerCase();
	this.browserVersion = parseFloat(this.uA.match(/.+(?:rv|it|ml|ra|ie)[\/: ]([\d.]+)/)[1]);
	this.isSafari       = /webkit/.test( this.uA );
	this.isOpera        = /opera/.test( this.uA );
	this.isIE           = /msie/.test( this.uA ) && !( /opera/.test( this.uA ) );
	this.isMoz          = /mozilla/.test( this.uA ) && !( /(compatible|webkit)/.test( this.uA ) );
	this.isWebKit       = /applewebkit/.test( this.uA );
	this.isGecko        = /gecko/.test( this.uA ) && ( /khtml/.test( this.uA ) === false );
	this.isKHTML        = /khtml/.test( this.uA );
	this.isMobileSafari = !!this.uA.match( /apple.*mobile.*safari/ );
	
	this.isMac          = /mac/.test( this.uA );
	this.isWindows      = /win/.test( this.uA );
	this.isLinux        = /linux/.test( this.uA );
	this.isUnix         = /x11/.test( this.uA );
};


Kevlar.prototype = {
	constructor : Kevlar,   // fix constructor property
	
	
	/**
	 * An empty function. This can be referred to in cases where you want a function
	 * but do not want to create a new function object. Used for performance and clarity
	 * reasons.
	 *
	 * @method emptyFn
	 */
	emptyFn : function() {},
	
	
	/**
	 * An abstract function (method). This can be referred to in cases where you want a function
	 * that is abstract, but do not want to create a new function object with a new thrown
	 * error string (which can bloat the code when repeated over many abstract classes/functions).
	 * One should check the call stack when this error is thrown to determine which abstract
	 * method they forgot to implement. 
	 * 
	 * Ex in a class's prototype object literal definition:
	 *     someMethod: Kevlar.abstractFn
	 *
	 * @method abstractFn
	 */
	abstractFn : function() {
		throw new Error( "method must be implemented in subclass" );
	},
	
	
	// --------------------------------
	

	/**
	 * Generates a new id. The id is a sequentially increasing number, starting with
	 * the first returned number being 1.
	 * 
	 * @method newId
	 * @return {Number} The new id.
	 */
	newId : (function() {
		var id = 0;
		return function() {
			return ++id;	
		};
	})(),
	
	
	// --------------------------------
	
	
	/**
	 * Copies all the properties of config to obj.
	 *
	 * @method apply
	 * @param {Object} obj The receiver of the properties
	 * @param {Object} config The source of the properties
	 * @param {Object} defaults A different object that will also be applied for default values
	 * @return {Object} returns obj
	 */
	apply : function( o, c, defaults ) {
		if( defaults ) {
			Kevlar.apply(o, defaults);  // no "this" reference for friendly out of scope calls
		}
		if( o && c && typeof c == 'object' ) {
			for( var p in c ) {
				o[ p ] = c[ p ];
			}
		}
		return o;
	},
	
	
	/**
	 * Copies all the properties of config to obj if they don't already exist.
	 *
	 * @method applyIf
	 * @param {Object} obj The receiver of the properties
	 * @param {Object} config The source of the properties
	 * @return {Object} returns obj
	 */
	applyIf : function( o, c ) {
		if( o ) {
			for( var p in c ) {
				if( !Kevlar.isDefined( o[ p ] ) ) {  // no "this" reference for friendly out of scope calls
					o[ p ] = c[ p ];
				}
			}
		}
		return o;
	},
	
	
	/**
	 * Copies a set of named properties fom the source object to the destination object.
	 * <p>example:<pre><code>
ImageComponent = Kevlar.extend(ui.Component, {
	initComponent: function() {
		MyComponent.superclass.initComponent.apply(this, arguments);
		this.initialBox = Kevlar.copyTo({}, this.initialConfig, 'x,y,width,height');
	}
});
	 * </code></pre>
	 * 
	 * @method copyTo
	 * @param {Object} dest The destination object.
	 * @param {Object} source The source object.
	 * @param {Array/String} names Either an Array of property names, or a comma-delimited list
	 * of property names to copy.
	 * @return {Object} The modified object.
	*/
	copyTo : function( dest, source, names ) {
		if( typeof names == 'string' ) {
			names = names.split(/[,;\s]/);
		}
		Kevlar.each( names, function( name ) {
			if( source.hasOwnProperty( name ) ) {
				dest[ name ] = source[ name ];
			}
		}, this );
		return dest;
	},
	
	
	/**
	 * <p>Extends one class to create a subclass of it based on a passed literal (`overrides`), and optionally any mixin 
	 * classes that are desired.</p>
	 * 
	 * <p>
	 *   This method adds a few methods to the class that it creates:
	 *   <div class="mdetail-params">
	 *     <ul>
	 *       <li><b>override</b>
	 *         <div class="sub-desc">Method that can be used to override members of the class with a passed object literal.</div>
	 *       </li>
	 *       <li><b>extend</b>
	 *         <div class="sub-desc">Method that can be used to extend the class, without calling Kevlar.extend(). Accepts the 2nd and 3rd arguments to this method (Kevlar.extend).</div>
	 *       </li>
	 *       <li><b>hasMixin</b>
	 *         <div class="sub-desc">
	 *           Method that can be used to find out if the class (or any of its superclasses) implement a given mixin. Accepts one argument: the class (constructor function) of the mixin. 
	 *           Note that it is preferable to check if a given object is an instance of another class or has a mixin by using the {@link Kevlar#isInstanceOf} method. This hasMixin() method will just
	 *           determine if the class has a given mixin, and not if it is an instance of a superclass, or even an instance of itself.
	 *         </div>
	 *       </li>
	 *     </ul>
	 *   </div>
	 * </p>
	 * 
	 * For example, to create a subclass of Kevlar.util.Observable, which will provide Observable events for the class:
	 * <pre><code>
MyComponent = Kevlar.extend( Kevlar.util.Observable, {
	
	constructor : function( config ) {
		// apply the properties of the config to the object
		Kevlar.apply( this, config );
		
		// Call superclass constructor
		MyComponent.superclass.constructor.call( this );
		
		// Your postprocessing here
	},
	
	// extension of another method (assuming Observable had this method)
	someMethod : function() {
		// some preprocessing, if needed
	
		MyComponent.superclass.someMethod.apply( this, arguments );  // send all arguments to superclass method
		
		// some post processing, if needed
	},

	// a new method for this subclass (not an extended method)
	yourMethod: function() {
		// etc.
	}
} );
</code></pre>
	 *
	 * This is an example of creating a class with a mixin called MyMixin:
	 * <pre><code>
MyComponent = Kevlar.extend( Kevlar.util.Observable, [ MyMixin ], {
	
	constructor : function( config ) {
		// apply the properties of the config to the object
		Kevlar.apply( this, config );
		
		// Call superclass constructor
		MyComponent.superclass.constructor.call( this );
		
		// Call the mixin's constructor
		MyMixin.constructor.call( this );
		
		// Your postprocessing here
	},
	
	
	// properties/methods of the mixin will be added automatically, if they don't exist already on the class
	
	
	// method that overrides or extends a mixin's method
	mixinMethod : function() {
		// call the mixin's method, if desired
		MyMixin.prototype.mixinMethod.call( this );
		
		// post processing
	}
	
} );
</code></pre>
	 *
	 * @param {Function} superclass The constructor function of the class being extended.
	 * @param {Array} mixins (optional) Any mixin classes (constructor functions) that should be mixed into the new subclass
	 *   after it is extended from the superclass.  Mixin properties/methods will <em>not</em> overwrite class methods, and
	 *   mixins are taken in the supplied order for later-defined mixins to take precedence over earlier-defined mixins in the array.
	 *   This argument is the second argument to allow client code to be clean and readable.
	 * @param {Object} overrides <p>An object literal with members that make up the subclass's properties/method. These are copied into the subclass's
	 *   prototype, and are therefore shared between all instances of the new class.</p> <p>This may contain a special member named
	 *   `<b>constructor</b>`, which is used to define the constructor function of the new subclass. If this property is <i>not</i> specified,
	 *   a constructor function is generated and returned which just calls the superclass's constructor, passing on its parameters.</p>
	 *   <p><b>It is essential that you call the superclass constructor in any provided constructor. See example code.</b></p>
	 * @return {Function} The subclass constructor from the `overrides` parameter, or a generated one if not provided.
	 */
	extend : (function() {
		// Set up some vars that will be used with the extend() method
		var classIdCounter = 0,  // a variable used for assigning a unique ID to each function, for use with the hasMixin() method that is attached to subclasses. Will be incremented for each new function.
		    objectConstructor = Object.prototype.constructor;
		
		// inline overrides function
		var inlineOverride = function( o ) {
			for( var m in o ) {
				this[ m ] = o[ m ];
			}
		};

		// extend() method itself
		return function( superclass, mixins, overrides ) {
			// mixins is an optional argument. it is at the 2nd argument position to allow client code to be clean and readable
			if( !Kevlar.isArray( mixins ) ) {
				overrides = mixins;
				mixins = [];   // empty mixins array. Needed because it will be attached to the subclass Function object.
			}
			
			var subclass = overrides.constructor != objectConstructor ? overrides.constructor : function() { superclass.apply( this, arguments ); },
			    F = function(){},
			    subclassPrototype,
			    superclassPrototype = superclass.prototype;
			
			F.prototype = superclassPrototype;
			subclassPrototype = subclass.prototype = new F();  // set up prototype chain
			subclassPrototype.constructor = subclass;          // fix constructor property
			subclass.superclass = superclassPrototype;
			
			// If the superclass is Object, set its constructor property to itself
			if( superclassPrototype.constructor == objectConstructor ) {
				superclassPrototype.constructor = superclass;
			}
			
			// Attach extra methods to subclass
			subclass.override = function( o ){
				Kevlar.override( subclass, o );
			};
			subclassPrototype.superclass = subclassPrototype.supr = ( function() {
				return superclassPrototype;
			} );
			subclassPrototype.override = inlineOverride;   // inlineOverride function defined above
			
			// Add the properties/methods defined in the "overrides" config (which is basically the subclass's 
			// properties/methods) onto the subclass prototype now
			Kevlar.override( subclass, overrides );
			
			subclass.extend = function( mixins, object ) { return Kevlar.extend( subclass, mixins, object ); };
			
			// Expose the constructor property on the class itself (as opposed to only on its prototype, which is normally only
			// available to instances of the class)
			subclass.constructor = subclassPrototype.constructor;
			
			
			// -----------------------------------
			
			
			// Handle mixins by applying their methods/properties to the subclass prototype. Methods defined by
			// the class itself will not be overwritten, and the later defined mixins take precedence over earlier
			// defined mixins. (Moving backwards through the mixins array to have the later mixin's methods/properties take priority)
			for( var i = mixins.length-1; i >= 0; i-- ) {
				var mixinPrototype = mixins[ i ].prototype;
				for( var prop in mixinPrototype ) {
					// Do not overwrite properties that already exist on the prototype
					if( typeof subclassPrototype[ prop ] === 'undefined' ) {
						subclassPrototype[ prop ] = mixinPrototype[ prop ];
					}
				}
			}
			
			// Store which mixin classes the subclass has. This is used in the hasMixin() method
			subclass.mixins = mixins;
						
			var mixinCache = {};  // cache used for caching results of if the given class has a mixin
			
			// Create the hasMixin() method as a static method on the subclass, and on the subclass's prototype, for determining 
			// if a given class/subclass has a mixin on itself, or any of its superclasses
			subclass.hasMixin = subclassPrototype.hasMixin = function( mixinClass, /* optional arg for the method itself, which defaults to the subclass */ nextParentClass ) {
				// Assign the mixinClass (the class we're looking for as a mixin) an ID if it doesn't yet have one
				var mixinClassId = mixinClass._classId;
				if( !mixinClassId ) {
					mixinClassId = mixinClass._classId = ++classIdCounter;  // classIdCounter is from the closure of the extend() method
				}
				
				// If we have the results of a call to this method for this mixin already, returned the cached result
				if( typeof mixinCache[ mixinClassId ] !== 'undefined' ) {
					return mixinCache[ mixinClassId ];
				
				} else {
					// No cached result from a previous call to this method for the mixin, do the lookup
					var currentClass = nextParentClass || subclass,  // subclass is from closure
					    mixins = currentClass.mixins;
					
					// The current class (which must be a super class of the subclass in this case) was not set up using extend(), and doesn't 
					// have the 'mixins' property. Return false immediately.
					if( !mixins ) {
						mixinCache[ mixinClassId ] = false;
						return false;
					}
					
					
					// Look for the mixin on the current class we're processing
					for( var i = 0, len = mixins.length; i < len; i++ ) {
						if( mixins[ i ] === mixinClass ) {
							// mixin was found, cache the result and return true now
							mixinCache[ mixinClassId ] = true;
							return true;
						}
					}
					
					// mixin wasn't found, check its superclass for the mixin (if it has one)
					if( currentClass.superclass && currentClass.superclass.constructor && currentClass.superclass.constructor !== Object ) {
						var returnValue = arguments.callee( mixinClass, currentClass.superclass.constructor );
						mixinCache[ mixinClassId ] = returnValue;  // cache the result from the call to its superclass
						return returnValue;
						
					} else {
						// mixin wasn't found, and the class has no superclass, cache the result and return false
						mixinCache[ mixinClassId ] = false;
						return false;
					}
				}
			};
			
			return subclass;
		};
	})(),
	
	
	/**
	 * Determines if a given object (`obj`) is an instance of a given class (`jsClass`). This method will
	 * return true if the `obj` is an instance of the `jsClass` itself, if it is a subclass of the `jsClass`,
	 * or if the `jsClass` is a mixin on the `obj`. For more information about classes and mixins, see the
	 * {@link #extend} method.
	 * 
	 * @method isInstanceOf
	 * @param {Mixed} obj The object to test.
	 * @param {Function} jsClass The class (constructor function) to see if the obj is an instance of, or has a mixin
	 * @return {Boolean} True if the obj is an instance of the jsClass (it is a direct instance of it, 
	 *   it inherits from it, or the jsClass is a mixin of it)
	 */
	isInstanceOf : function( obj, jsClass ) {
		if( typeof jsClass !== 'function' ) {
			throw new Error( "jsClass argument of isInstanceOf method expected a Function (constructor function) for a JavaScript class" );
		}
		
		if( !Kevlar.isObject( obj ) ) {   // note: no 'this' reference on Kevlar.isObject() for friendly out-of-scope calls (i.e. method is called when reference is locally cached)
			return false;
		} else if( obj instanceof jsClass ) {
			return true;
		} else if( obj.hasMixin && obj.hasMixin( jsClass ) ) {  // make sure it has the hasMixin method first. It will have this method if the object was set up with Kevlar.extend()
			return true;
		} else {
			return false;
		}
	},


	/**
	 * Adds a list of functions to the prototype of an existing class, overwriting any existing methods with the same name.
	 * Usage:<pre><code>
Kevlar.override(MyClass, {
	newMethod1: function(){
		// etc.
	},
	newMethod2: function(foo){
		// etc.
	}
});
</code></pre>
	 * @param {Object} origclass The class to override
	 * @param {Object} overrides The list of functions to add to origClass.  This should be specified as an object literal
	 * containing one or more methods.
	 * @method override
	 */
	override : function( origclass, overrides ) {
		if( overrides ){
			var p = origclass.prototype;
			Kevlar.apply( p, overrides );
			if( Kevlar.isIE && overrides.hasOwnProperty( 'toString' ) ){
				p.toString = overrides.toString;
			}
		}
	},
	
	

	/**
	 * Creates namespaces to be used for scoping variables and classes so that they are not global.
	 * Specifying the last node of a namespace implicitly creates all other nodes. Usage:
	 * <pre><code>
Kevlar.namespace('Company', 'Company.data');
Kevlar.namespace('Company.data'); // equivalent and preferable to above syntax
Company.Widget = function() { ... }
Company.data.CustomStore = function(config) { ... }
</code></pre>
	 * @param {String} namespace1
	 * @param {String} namespace2
	 * @param {String} etc...
	 * @return {Object} The namespace object. (If multiple arguments are passed, this will be the last namespace created)
	 * @method namespace
	 */
	namespace : function(){
		var o, d;
		Kevlar.each( arguments, function(v) {
			d = v.split( "." );
			o = window[ d[ 0 ] ] = window[ d[ 0 ] ] || {};
			Kevlar.each( d.slice( 1 ), function( v2 ) {
				o = o[ v2 ] = o[ v2 ] || {};
			} );
		} );
		return o;
	},

	/**
	 * Converts any iterable (numeric indices and a length property) into a true array
	 * Don't use this on strings. IE doesn't support "abc"[0] which this implementation depends on.
	 * For strings, use this instead: "abc".match(/./g) => [a,b,c];
	 * @param {Array/Arguments/NodeList} a The iterable object to be turned into a true Array.
	 * @return {Array} The array.
	 */
	toArray : function( a, i, j, res ) {  // used in Kevlar.util.Observable
		if( Kevlar.isIE ) {
			res = [];
			for( var x = 0, len = a.length; x < len; x++ ) {
				res.push( a[ x ] );
			}
			return res.slice( i || 0, j || res.length );
		} else {
			return Array.prototype.slice.call( a, i || 0, j || a.length );
		}
	},
	

	/**
	 * Iterates an array calling the supplied function.
	 * @param {Array/NodeList/Mixed} array The array to be iterated. If this
	 * argument is not really an array, the supplied function is called once.
	 * @param {Function} fn The function to be called with each item. If the
	 * supplied function returns false, iteration stops and this method returns
	 * the current <code>index</code>. This function is called with
	 * the following arguments:
	 * <div class="mdetail-params"><ul>
	 * <li><code>item</code> : <i>Mixed</i>
	 * <div class="sub-desc">The item at the current <code>index</code>
	 * in the passed <code>array</code></div></li>
	 * <li><code>index</code> : <i>Number</i>
	 * <div class="sub-desc">The current index within the array</div></li>
	 * <li><code>allItems</code> : <i>Array</i>
	 * <div class="sub-desc">The <code>array</code> passed as the first
	 * argument to <code>Kevlar.each</code>.</div></li>
	 * </ul></div>
	 * @param {Object} scope The scope (<code>this</code> reference) in which the specified function is executed.
	 * Defaults to the <code>item</code> at the current <code>index</code>
	 * within the passed <code>array</code>.
	 * @return {Mixed} See description for the fn parameter.
	 */
	each : function( array, fn, scope ){   // needed for Kevlar.DelayedTask, and Kevlar.Observable
		if( Kevlar.isEmpty( array, true ) ) {
			return;
		}
		if( typeof array.length === 'undefined' || Kevlar.isPrimitive( array ) ) {
			array = [ array ];
		}
		for( var i = 0, len = array.length; i < len; i++ ) {
			if( fn.call( scope || array[i], array[i], i, array ) === false ) {
				return i;
			}
		}
	},
	
	
	// --------------------------------
	
	
	/**
	 * An accurate way of checking whether a given value is an Array.
	 *
	 * @method isArray
	 * @param {Mixed} a The value to check.
	 * @return {Boolean}
	 */
	isArray : function( v ) {
		return !!v && Object.prototype.toString.apply( v ) === '[object Array]';
	},
	
	/**
	 * Whether a given value is an Object.
	 *
	 * @method isObject
	 * @param {Mixed} v The value to check.
	 * @return {Boolean}
	 */
	isObject : function( v ) {
		return !!v && Object.prototype.toString.call( v ) === '[object Object]';  
	},
	
	/**
	 * Whether a given value is a Function.
	 *
	 * @method isFunction
	 * @param {Mixed} v The value to check.
	 * @return {Boolean}
	 */
	isFunction : function( v ) {
		return !!v && v.constructor === Function;  
	},
	
	
	/**
	 * Returns true if the passed object is a JavaScript date object, otherwise false.
	 *
	 * @param {Object} object The object to test
	 * @return {Boolean}
	 */
	isDate : function( v ) {
		return Object.prototype.toString.apply( v ) === '[object Date]';
	},
	
	
	/**
	 * Whether a given value is a String.
	 *
	 * @method isString
	 * @param {Mixed} v The value to check.
	 * @return {Boolean}
	 */
	isString : function( v ) {
		return typeof v === 'string';
	},
	
	/**
	 * Whether a given value is a Number.
	 *
	 * @method isNumber
	 * @param {Mixed} v The value to check.
	 * @return {Boolean}
	 */
	isNumber : function( v ) {
		return typeof v === 'number' && isFinite( v ); 
	},
	
	/**
	 * Whether a given value is a Boolean.
	 *
	 * @method isBoolean
	 * @param {Mixed} v The value to check.
	 * @return {Boolean}
	 */
	isBoolean : function( v ) {
		return typeof v === 'boolean';
	},
	  
	/**
	 * Whether a given value is a Regular Expression.
	 *
	 * @method isRegExp
	 * @param {Mixed} v The value to check.
	 * @return {Boolean}
	 */
	isRegExp : function( v ) {
		return !!v && v.constructor === RegExp;  
	},
	
	/**
	 * Whether a given value is an DOM element.
	 *
	 * @method isElement
	 * @param {Mixed} v The value to check.
	 * @return {Boolean}
	 */
	isElement : function( v ) {
		return v ? v.nodeType === 1 : false;
	},
	
	/**
	 * Returns true if the given `value` is a jQuery wrapped set object.
	 * 
	 * @method isJQuery
	 * @param {Mixed} value The value to check.
	 * @return {Boolean}
	 */
	isJQuery : function( value ) {
		return value instanceof jQuery;
	},
	
	/**
	 * Returns true if the passed value is not undefined.
	 *
	 * @param {Mixed} value The value to test
	 * @return {Boolean}
	 */
	isDefined : function( v ) {
		return typeof v !== 'undefined';
	},
	
	/**
	 * Whether a given value is undefined.
	 *
	 * @method isUndefined
	 * @param  {Mixed} v The value to check
	 * @return {Boolean}
	 */
	isUndefined : function( v ) {
		return typeof v === 'undefined';
	},
	
	/**
	 * Returns true if the passed value is a JavaScript 'primitive' (i.e. a string, number, or boolean).
	 *
	 * @param {Mixed} value The value to test.
	 * @return {Boolean}
	 */
	isPrimitive : function( v ) {
		return Kevlar.isString( v ) || Kevlar.isNumber( v ) || Kevlar.isBoolean( v );
	},
	
	/**
	 * <p>Returns true if the passed value is empty.</p>
	 * <p>The value is deemed to be empty if it is<div class="mdetail-params"><ul>
	 * <li>null</li>
	 * <li>undefined</li>
	 * <li>an empty array</li>
	 * <li>a zero length string (Unless the `allowBlank` parameter is `true`)</li>
	 * </ul></div>
	 * @param {Mixed} value The value to test
	 * @param {Boolean} [allowBlank=false] True to allow empty strings.
	 * @return {Boolean}
	 */
	isEmpty : function( v, allowBlank ) {
		return v === null || v === undefined || ((Kevlar.isArray( v ) && !v.length)) || (!allowBlank ? v === '' : false);
	},
	
	
	
	// --------------------------------
	

	/**
	 * Escapes the passed string for use in a regular expression.
	 * @param {String} str
	 * @return {String}
	 */
	escapeRe : function(s) {
		return s.replace(/([\-.*+?\^$\{\}\(\)|\[\]\/\\])/g, "\\$1");
	}
	
};


// Create global Kevlar singleton over class
Kevlar = new Kevlar();

/*global Kevlar */
Kevlar.namespace(
	'Kevlar.data',
	'Kevlar.util'
);

/*global window, Kevlar */
/*jslint forin: true */
(function(){

var KevlarUTIL = Kevlar.util,
    TOARRAY = Kevlar.toArray,
    EACH = Kevlar.each,
    ISOBJECT = Kevlar.isObject,
    TRUE = true,
    FALSE = false;
	
/**
 * @class Kevlar.util.Observable
 * Base class that provides a common interface for publishing events. Subclasses are expected to
 * to have a property "events" with all the events defined, and, optionally, a property "listeners"
 * with configured listeners defined.<br>
 * For example:
 * <pre><code>
Employee = Kevlar.extend(Kevlar.util.Observable, {
    constructor: function(config){
        this.name = config.name;
        this.addEvents({
            "fired" : true,
            "quit" : true
        });

        // Copy configured listeners into *this* object so that the base class&#39;s
        // constructor will add them.
        this.listeners = config.listeners;

        // Call our superclass constructor to complete construction process.
        Employee.superclass.constructor.call(config)
    }
});
</code></pre>
 * This could then be used like this:<pre><code>
var newEmployee = new Employee({
    name: employeeName,
    listeners: {
        quit: function() {
            // By default, "this" will be the object that fired the event.
            alert(this.name + " has quit!");
        }
    }
});
</code></pre>
 */
KevlarUTIL.Observable = function(){
    /**
     * @cfg {Object} listeners (optional) <p>A config object containing one or more event handlers to be added to this
     * object during initialization.  This should be a valid listeners config object as specified in the
     * {@link #addListener} example for attaching multiple handlers at once.</p>
     * To access DOM events directly from a Component's HTMLElement, listeners must be added to the <i>{@link ui.Component#getEl Element}</i> 
     * after the Component has been rendered. A plugin can simplify this step:<pre><code>
// Plugin is configured with a listeners config object.
// The Component is appended to the argument list of all handler functions.
DomObserver = Kevlar.extend(Object, {
    constructor: function(config) {
        this.listeners = config.listeners ? config.listeners : config;
    },

    // Component passes itself into plugin&#39;s init method
    initPlugin: function(c) {
        var p, l = this.listeners;
        for (p in l) {
            if (Kevlar.isFunction(l[p])) {
                l[p] = this.createHandler(l[p], c);
            } else {
                l[p].fn = this.createHandler(l[p].fn, c);
            }
        }

        // Add the listeners to the Element immediately following the render call
        c.render = c.render.{@link Function#createSequence createSequence}(function() {
            var e = c.getEl();
            if (e) {
                e.on(l);
            }
        });
    },

    createHandler: function(fn, c) {
        return function(e) {
            fn.call(this, e, c);
        };
    }
});

var combo = new Kevlar.form.ComboBox({

    // Collapse combo when its element is clicked on
    plugins: [ new DomObserver({
        click: function(evt, comp) {
            comp.collapse();
        }
    })],
    store: myStore,
    typeAhead: true,
    mode: 'local',
    triggerAction: 'all'
});
     * </code></pre></p>
     */
    var me = this, e = me.events;
    me.events = e || {};
    if(me.listeners){
        me.on(me.listeners);
        delete me.listeners;
    }
};

KevlarUTIL.Observable.prototype = {
    // private
    filterOptRe : /^(?:scope|delay|buffer|single)$/,

    /**
     * <p>Fires the specified event with the passed parameters (minus the event name).</p>
     * <p>An event may be set to bubble up an Observable parent hierarchy (See {@link ui.Component#getBubbleTarget})
     * by calling {@link #enableBubble}.</p>
     * @param {String} eventName The name of the event to fire.
     * @param {Object...} args Variable number of parameters are passed to handlers.
     * @return {Boolean} returns false if any of the handlers return false otherwise it returns true.
     */
    fireEvent : function() {
        var args = TOARRAY(arguments),
            eventName = args[0].toLowerCase(),
            me = this,
            ret = TRUE,
            ce = me.events[eventName],
            q,
            parentComponent;
			
        if (me.eventsSuspended === TRUE) {
			q = me.eventQueue;
            if (q) {
                q.push(args);
            }
			
        } else if( ISOBJECT(ce) && ce.bubble ) {
            if( ce.fire.apply( ce, args.slice( 1 ) ) === false ) {
                return FALSE;
            }
			
			// Firing of the event on this Observable didn't return false, check the bubbleFn for permission (if the event has one).
			// If the bubbleFn returns false, we return here and don't bubble
			var bubbleFn = ce.bubbleFn,
			    bubbleFnScope = ce.bubbleFnScope;
				
			if( bubbleFn && bubbleFn.call( bubbleFnScope, this ) === false ) {
				return false;
			}
			
			
			// fire the event on the "parent" Observable (i.e. the "bubble target" observable)
            parentComponent = me.getBubbleTarget && me.getBubbleTarget();
            if( parentComponent && parentComponent.enableBubble ) {  // test for if parentComponent is an Observable?
				// If the parentComponent doesn't have the bubbled event, 
				// or the bubbled event on the parentComponent is not yet an Event object, 
				// or the bubbled event on the parentComponent doesn't have the bubble flag set to true,
				// or the bubbled event on the parentComponent doesn't have a bubbleFn, but this one does
				// then run enableBubble for the event on the parentComponent
                if( !parentComponent.events[ eventName ] || !Kevlar.isObject( parentComponent.events[ eventName ] ) || !parentComponent.events[ eventName ].bubble || ( !parentComponent.events[ eventName ].bubbleFn && bubbleFn ) ) {
                    parentComponent.enableBubble( {
						eventName: eventName,
						bubbleFn: bubbleFn,
						scope: bubbleFnScope
					} );
                }
                return parentComponent.fireEvent.apply( parentComponent, args );
            }
			
        } else {
            if( ISOBJECT( ce ) ) {
                args.shift();
                ret = ce.fire.apply( ce, args );
            }
        }
		
        return ret;
    },

    /**
     * Appends an event handler to this object.
     * @param {String}   eventName The name of the event to listen for.
     * @param {Function} handler The method the event invokes.
     * @param {Object}   scope (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b>
     * @param {Object}   options (optional) An object containing handler configuration.
     * properties. This may contain any of the following properties:<ul>
     * <li><b>scope</b> : Object<div class="sub-desc">The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b></div></li>
     * <li><b>delay</b> : Number<div class="sub-desc">The number of milliseconds to delay the invocation of the handler after the event fires.</div></li>
     * <li><b>single</b> : Boolean<div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
     * <li><b>buffer</b> : Number<div class="sub-desc">Causes the handler to be scheduled to run in an {@link Kevlar.util.DelayedTask} delayed
     * by the specified number of milliseconds. If the event fires again within that time, the original
     * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
     * <li><b>target</b> : Observable<div class="sub-desc">Only call the handler if the event was fired on the target Observable, <i>not</i>
     * if the event was bubbled up from a child Observable.</div></li>
     * </ul><br>
     * <p>
     * <b>Combining Options</b><br>
     * Using the options argument, it is possible to combine different types of listeners:<br>
     * <br>
     * A delayed, one-time listener.
     * <pre><code>
myDataView.on('click', this.onClick, this, {
single: true,
delay: 100
});</code></pre>
     * <p>
     * <b>Attaching multiple handlers in 1 call</b><br>
     * The method also allows for a single argument to be passed which is a config object containing properties
     * which specify multiple handlers.
     * <p>
     * <pre><code>
myGridPanel.on({
'click' : {
    fn: this.onClick,
    scope: this,
    delay: 100
},
'mouseover' : {
    fn: this.onMouseOver,
    scope: this
},
'mouseout' : {
    fn: this.onMouseOut,
    scope: this
}
});</code></pre>
 * <p>
 * Or a shorthand syntax:<br>
 * <pre><code>
myGridPanel.on({
'click' : this.onClick,
'mouseover' : this.onMouseOver,
'mouseout' : this.onMouseOut,
 scope: this
});</code></pre>
     */
    addListener : function(eventName, fn, scope, o){
        var me = this,
            e,
            oe,
            isF,
            ce;
			
        if (ISOBJECT(eventName)) {
            o = eventName;
            for (e in o){
                oe = o[e];
                if (!me.filterOptRe.test(e)) {
                    me.addListener(e, oe.fn || oe, oe.scope || o.scope, oe.fn ? oe : o);
                }
            }
        } else {
            eventName = eventName.toLowerCase();
            ce = me.events[eventName] || TRUE;
            if (Kevlar.isBoolean(ce)) {
                me.events[eventName] = ce = new KevlarUTIL.Event(me, eventName);
            }
            ce.addListener(fn, scope, ISOBJECT(o) ? o : {});
        }
    },

    /**
     * Removes an event handler.
     * @param {String}   eventName The type of event the handler was associated with.
     * @param {Function} handler   The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object}   scope     (optional) The scope originally specified for the handler.
     */
    removeListener : function( eventName, fn, scope ) {
        var ce = this.events[ eventName.toLowerCase() ];
        if ( ISOBJECT( ce ) ) {
            ce.removeListener( fn, scope );
        }
    },
	

    /**
     * Removes all listeners for this object
     */
    purgeListeners : function() {
        var events = this.events,
            evt,
            key;
		
        for( key in events ) {
            evt = events[ key ];
            if( ISOBJECT( evt ) ) {
                evt.clearListeners();
            }
        }
    },
	

    /**
     * Adds the specified events to the list of events which this Observable may fire.
     * @param {Object/String} o Either an object with event names as properties with a value of <code>true</code>
     * or the first event name string if multiple event names are being passed as separate parameters.
     * @param {String} Optional. Event name if multiple event names are being passed as separate parameters.
     * Usage:<pre><code>
this.addEvents('storeloaded', 'storecleared');
</code></pre>
     */
    addEvents : function(o){
        var me = this;
        me.events = me.events || {};
        if (Kevlar.isString(o)) {
            var a = arguments,
                i = a.length;
            while(i--) {
                me.events[a[i]] = me.events[a[i]] || TRUE;
            }
        } else {
            Kevlar.applyIf(me.events, o);
        }
    },

    /**
     * Checks to see if this object has any listeners for a specified event
     * @param {String} eventName The name of the event to check for
     * @return {Boolean} True if the event is being listened for, else false
     */
    hasListener : function(eventName){
        var e = this.events[eventName];
        return ISOBJECT(e) && e.listeners.length > 0;
    },


    /**
     * Suspend the firing of all events. (see {@link #resumeEvents})
     * @param {Boolean} queueSuspended Pass as true to queue up suspended events to be fired
     * after the {@link #resumeEvents} call instead of discarding all suspended events;
     */
    suspendEvents : function(queueSuspended){
        this.eventsSuspended = TRUE;
        if(queueSuspended && !this.eventQueue){
            this.eventQueue = [];
        }
    },

    /**
     * Resume firing events. (see {@link #suspendEvents})
     * If events were suspended using the `<b>queueSuspended</b>` parameter, then all
     * events fired during event suspension will be sent to any listeners now.
     */
    resumeEvents : function(){
        var me = this,
            queued = me.eventQueue || [];
        me.eventsSuspended = FALSE;
        delete me.eventQueue;
        EACH(queued, function(e) {
            me.fireEvent.apply(me, e);
        });
    },
	
	
	/**
     * Relays selected events from the specified Observable as if the events were fired by `<b>this</b>`.
     * @param {Object} o The Observable whose events this object is to relay.
     * @param {Array} events Array of event names to relay.
     */
    relayEvents : function(o, events){
        var me = this;
        function createHandler(eventName){
            return function(){
                return me.fireEvent.apply(me, [eventName].concat(Array.prototype.slice.call(arguments, 0)));
            };
        }
        for(var i = 0, len = events.length; i < len; i++){
            var eventName = events[i];
            me.events[eventName] = me.events[eventName] || true;
            o.on(eventName, createHandler(eventName), me);
        }
    },
	
	
	/**
     * <p>Enables events fired by this Observable to bubble up an owner hierarchy by calling {@link #getBubbleTarget} to determine
     * the object's owner. The default implementation of {@link #getBubbleTarget} in this class is just to return null, which specifies no owner.
     * This method should be overridden by subclasses to provide this if applicable.</p>
     * <p>This is commonly used by {@link ui.Component ui.Components} to bubble events to owner {@link ui.Container iu.Containers}. 
     * See {@link ui.Component#getBubbleTarget}. The default implementation in {@link ui.Component} returns the Component's immediate owner, 
     * but if a known target is required, this can be overridden to access that target more quickly.</p>
     * <p>Example:</p><pre><code>
MyClass = Kevlar.extend( Kevlar.util.Observable, {

	constructor : function() {
		...
		
		this.addEvents( 'myBubbledEvent' );
		this.enableBubble( 'myBubbledEvent' );  // enable the bubble
	},


	getBubbleTarget : function() {
		// return a reference to some component that is the target for bubbling. this component may be listened to directly for the 'myBubbledEvent' event
	}

} );
</code></pre>
	 * @param {Array/String.../Object...} events The event name to bubble, Array of event names, or one argument per event name. This may also
	 *   be an array of objects, where the objects have the following properties:<div class="mdetail-params"><ul>
	 *   <li><b>eventName</b> : String<div class="sub-desc">The name of the event to enable bubbling for.</div></li>
	 *   <li>
	 *     <b>bubbleFn</b> : Function
	 *     <div class="sub-desc">
	 *       A function that determines, at every level in the hierarchy, if bubbling should continue. If this function returns false
	 *       at any point, the bubbling of the event is stopped. The function is given one argument: the Observable that the event
	 *       has just been fired for.  This function can be used to test for some condition, and then stop bubbling based on that condition.
	 *     </div>
	 *   </li>
	 *   <li>
	 *     <b>scope</b> : Object
	 *     <div class="sub-desc">The scope to run the bubbleFn in. Defaults to the Observable that the event bubbling was enabled on.</div>
	 *   </li>
	 * </ul></div>
	 */
	enableBubble: function( events ) {
		var me = this;
		if( !Kevlar.isEmpty( events ) ) {
			events = Kevlar.isArray( events ) ? events : Kevlar.toArray( arguments );
			
			Kevlar.each( events, function( eventArg ) {
				var eventName, bubbleFn, scope;  // the last 2 vars are for if an argument was specified as an object, and these were included
				
				// an object with the key 'eventName' is accepted for the enableBubble method
				if( typeof eventArg === 'object' ) {
					eventName = eventArg.eventName;
					bubbleFn = eventArg.bubbleFn;
					scope = eventArg.scope;
				} else {
					eventName = eventArg;  // string event argument
				}
				
				eventName = eventName.toLowerCase();
				var ce = me.events[ eventName ] || true;
				if( Kevlar.isBoolean( ce ) ) {
					ce = new KevlarUTIL.Event( me, eventName );
					me.events[ eventName ] = ce;
				}
				ce.bubble = true;
				
				// Add the bubbleFn, if provided by an object argument to enableBubble
				if( typeof bubbleFn === 'function' ) {
					ce.bubbleFn = bubbleFn;
					ce.bubbleFnScope = scope || me;  // default to the Observable's scope
				}
			} );
		}
	},
	
	
	/**
	 * Specifies the Observable that is the target of the event's bubbling, if bubbling is enabled for
	 * events by the {@link #enableBubble} method. This default implementation returns null, and should
	 * be overridden by subclasses to specify their bubbling target.
	 * 
	 * @protected
	 * @method getBubbleTarget
	 * @return {Kevlar.util.Observable} The Observable that is the target for event bubbling, or null if none.
	 */
	getBubbleTarget : function() {
		return null;
	}
	
};

var OBSERVABLE = KevlarUTIL.Observable.prototype;
/**
 * Appends an event handler to this object (shorthand for {@link #addListener}.)
 * @param {String}   eventName     The type of event to listen for
 * @param {Function} handler       The method the event invokes
 * @param {Object}   scope         (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
 * <b>If omitted, defaults to the object which fired the event.</b>
 * @param {Object}   options       (optional) An object containing handler configuration.
 * @method
 */
OBSERVABLE.on = OBSERVABLE.addListener;
/**
 * Removes an event handler (shorthand for {@link #removeListener}.)
 * @param {String}   eventName     The type of event the handler was associated with.
 * @param {Function} handler       The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
 * @param {Object}   scope         (optional) The scope originally specified for the handler.
 * @method
 */
OBSERVABLE.un = OBSERVABLE.removeListener;

/**
 * Removes <b>all</b> added captures from the Observable.
 * @param {Kevlar.util.Observable} o The Observable to release
 * @static
 */
KevlarUTIL.Observable.releaseCapture = function(o){
    o.fireEvent = OBSERVABLE.fireEvent;
};

function createTargeted(h, o, scope){
    return function(){
        if(o.target == arguments[0]){
            h.apply(scope, TOARRAY(arguments));
        }
    };
}

function createBuffered(h, o, l, scope){
    l.task = new KevlarUTIL.DelayedTask();
    return function(){
        l.task.delay(o.buffer, h, scope, TOARRAY(arguments));
    };
}

function createSingle(h, e, fn, scope){
    return function(){
        e.removeListener(fn, scope);
        return h.apply(scope, arguments);
    };
}

function createDelayed(h, o, l, scope){
    return function(){
        var task = new KevlarUTIL.DelayedTask();
        if(!l.tasks) {
            l.tasks = [];
        }
        l.tasks.push(task);
        task.delay(o.delay || 10, h, scope, TOARRAY(arguments));
    };
}



KevlarUTIL.Event = function(obj, name){
    this.name = name;
    this.obj = obj;
    this.listeners = [];
	
	// this object may also get the properties 'bubble', 'bubbleFn', and 'bubbleFnScope' if Observable's enableBubble() method is run for it
};

KevlarUTIL.Event.prototype = {
    addListener : function(fn, scope, options){
        var me = this,
            l;
        scope = scope || me.obj;
        if(!me.isListening(fn, scope)){
            l = me.createListener(fn, scope, options);
            if(me.firing){ // if we are currently firing this event, don't disturb the listener loop
                me.listeners = me.listeners.slice(0);
            }
            me.listeners.push(l);
        }
    },

    createListener: function(fn, scope, o){
        o = o || {};
		scope = scope || this.obj;
		
        var l = {
            fn: fn,
            scope: scope,
            options: o
        }, h = fn;
        if(o.target){
            h = createTargeted(h, o, scope);
        }
        if(o.delay){
            h = createDelayed(h, o, l, scope);
        }
        if(o.single){
            h = createSingle(h, this, fn, scope);
        }
        if(o.buffer){
            h = createBuffered(h, o, l, scope);
        }
        l.fireFn = h;
        return l;
    },

    findListener : function(fn, scope){
        var list = this.listeners,
            i = list.length,
            l,
            s;
        while(i--) {
            l = list[i];
            if(l) {
                s = l.scope;
                if(l.fn == fn && (s == scope || s == this.obj)){
                    return i;
                }
            }
        }
        return -1;
    },

    isListening : function(fn, scope){
        return this.findListener(fn, scope) != -1;
    },

    removeListener : function(fn, scope){
        var index,
            l,
            k,
            me = this,
            ret = FALSE;
        if((index = me.findListener(fn, scope)) != -1){
            if (me.firing) {
                me.listeners = me.listeners.slice(0);
            }
            l = me.listeners[index];
            if(l.task) {
                l.task.cancel();
                delete l.task;
            }
            k = l.tasks && l.tasks.length;
            if(k) {
                while(k--) {
                    l.tasks[k].cancel();
                }
                delete l.tasks;
            }
            me.listeners.splice(index, 1);
            ret = TRUE;
        }
        return ret;
    },

    // Iterate to stop any buffered/delayed events
    clearListeners : function(){
        var me = this,
            l = me.listeners,
            i = l.length;
        while(i--) {
            me.removeListener(l[i].fn, l[i].scope);
        }
    },

    fire : function() {
        var me = this,
            args = TOARRAY(arguments),
            listeners = me.listeners,
            len = listeners.length,
            i = 0,
            l,
		    handlerReturnedFalse = false;  // added code

        if(len > 0){
            me.firing = TRUE;
            for (; i < len; i++) {
                l = listeners[i];
                if(l && l.fireFn.apply(l.scope || me.obj || window, args) === FALSE) {
					handlerReturnedFalse = true;
                    //return (me.firing = FALSE);  -- old code, prevented other handlers from running if one returned false
                }
            }
        }
        me.firing = FALSE;
        //return TRUE;  -- old code
        return ( handlerReturnedFalse ) ? false : true;  // if any of the event handlers returned false, return false from this method. otherwise, return true
    }
};
})();

/**
 * @abstract
 * @class Kevlar.data.AbstractProxy
 * @extends Kevlar.util.Observable
 * 
 * AbstractProxy is the base class for subclasses that perform CRUD (Create, Read, Update, and Delete) operations on the server.
 * 
 * @constructor
 * @param {Object} config The configuration options for this class, specified in an object (hash).
 */
/*global Kevlar */
Kevlar.data.AbstractProxy = Kevlar.extend( Kevlar.util.Observable, {
	
	constructor : function( config ) {
		// Apply the config
		Kevlar.apply( this, config );
	},
	
	
	/**
	 * Creates a Model on the server.
	 * 
	 * @abstract
	 * @method create
	 * @param {Kevlar.data.Model} model The Model instance to create on the server.
	 */
	create : Kevlar.abstractFn,
	
	
	/**
	 * Reads a Model from the server.
	 * 
	 * @abstract
	 * @method read
	 * @param {Kevlar.data.Model} model The Model instance to read from the server.
	 */
	read : Kevlar.abstractFn,
	
	
	/**
	 * Updates the Model on the server, using the provided `data`.  
	 * 
	 * @abstract
	 * @method update
	 * @param {Object} data The data, provided in an Object, to persist to the server.
	 */
	update : Kevlar.abstractFn,
	
	
	/**
	 * Destroys (deletes) the Model on the server. This method is not named "delete" as "delete" is a JavaScript reserved word.
	 * 
	 * @abstract
	 * @method destroy
	 * @param {Kevlar.data.Model} model The Model instance to delete on the server.
	 */
	destroy : Kevlar.abstractFn,
	
	
	// ---------------------------------------------
	
	
	/**
	 * Method used by {@link Kevlar.data.Model Model's} to determine if the Proxy supports incremental updates. If the proxy does,
	 * it is only provided the set of changed data to its {@link #update} method, instead of the full set of data in the Model.
	 * This method must be implemented by subclasses.
	 * 
	 * @abstract
	 * @method supportsIncrementalUpdates
	 * @return {Boolean} True if the Proxy supports incremental updates, false otherwise.
	 */
	supportsIncrementalUpdates : Kevlar.abstractFn
	
} );

/*global Kevlar */
Kevlar.namespace( 
	'ui',
	'ui.anim',
	'ui.bits',
	'ui.layouts',
	'ui.containers',
	'ui.formFields',
	'ui.toolButtons',
	'ui.plugins',
	'ui.utils'
 );

/**
 * @class ui.ComponentManager
 *
 * Object used to manage {@link ui.Component} "types", and handles instantiating them based on the string that is specified
 * for them in the manifest.  
 *
 * @singleton
 */
/*global ui */
ui.ComponentManager = {
	/**
	 * @private
	 * @property componentClasses
	 * A map of the {@link ui.Component} classes, keyed by their type name.
	 * @type Object
	 */
	componentClasses : {},
   
   
	/**
	 * Registers a given class with a `type` name. This is used to map the type names specified in Bit manifests
	 * to the class that should be instantiated.  Note that type names are case-insensitive.<br><br>
	 * 
	 * This method will throw an error if a type name is already registered, to assist in making sure that we don't get
	 * unexpected behavior from a type name being overwritten.
	 * 
	 * @method registerType
	 * @param {String} type The type name of registered class.
	 * @param {Function} jsClass The class (constructor function) to register.
	 */
	registerType : function( type, jsClass ) {
		type = type.toLowerCase();
		
		if( !this.componentClasses[ type ] ) { 
			this.componentClasses[ type ] = jsClass;
		} else {
			throw new Error( "Error: ui.ComponentManager already has a type '" + type + "'" );
		}
	},
	
	
	/**
	 * Retrieves the Component class (constructor function) that has been registered by the supplied `type` name. 
	 * 
	 * @method getType
	 * @param {String} type The type name of the registered class.
	 * @return {Function} The class (constructor function) that has been registered under the given type name.
	 */
	getType : function( type ) {
		return this.componentClasses[ type.toLowerCase() ];
	},
	
	
	/**
	 * Determines if the ComponentManager has (i.e. can instantiate) a given `type`.
	 * 
	 * @method hasType
	 * @param {String} type
	 * @return {Boolean} True if the ComponentManager has the given type.
	 */
	hasType : function( type ) {
		if( !type ) {  // any falsy type value given, return false
			return false;
		} else {
			return !!this.componentClasses[ type.toLowerCase() ];
		}
	},
	
	
	/**
	 * Creates (instantiates) a {@link ui.Component Component} based on its type name, given
	 * a configuration object that has a `type` property. If an already-instantiated 
	 * {@link ui.Component Component} is provided, it will simply be returned unchanged.
	 * 
	 * @method create
	 * @param {Object} config The configuration object for the Component. Config objects should have the property `type`, 
	 *   which determines which type of {@link ui.Component Component} will be instantiated. If the object does not
	 *   have a `type` property, it will default to "container", which makes it simple to create things like tab containers. 
	 *   Note that already-instantiated {@link ui.Component Components} will simply be returned unchanged. 
	 * @return {ui.Component} The instantiated Component.
	 */
	create : function( config ) {
		var type = config.type ? config.type.toLowerCase() : undefined;
		
		if( config instanceof ui.Component ) {
			// Already a Component instance, return it
			return config;
			
		} else if( this.hasType( type || "container" ) ) {
			return new this.componentClasses[ type || "container" ]( config );
			
		} else {
			// No registered type with the given type, throw an error
			throw new Error( "ComponentManager.create(): Unknown type: '" + type + "'" );
		}
	}
};

/**
 * @class ui.Component
 * @extends Kevlar.util.Observable
 * 
 * <p>Generalized component that defines a displayable item that can be placed onto a page. Provides a base element (by default, a div),
 * and a framework for the instantiation, rendering, and (eventually) the destruction process, with events that can be listened to
 * each step of the way.</p>
 * 
 * <p>Components can be constructed via anonymous config objects, based on their `type` property. This is useful for defining components in a
 * manifest. This is the list of all pre-defined Component types that may be instantiated in this manner. Note that type names are case-insensitive.
 * <pre>
type                  Class
-------------         ------------------
component             {@link ui.Component}
container             {@link ui.Container}
button                {@link ui.Button}
buttonset             {@link ui.ButtonSet}
colorpicker           {@link ui.ColorPicker}
label | introduction  {@link ui.Label}
fieldset              {@link ui.FieldSet}
slider                {@link ui.Slider}

Containers
---------------------------------------
accordion             {@link ui.containers.AccordionContainer}
cards                 {@link ui.containers.CardsContainer}
columns               {@link ui.containers.ColumnsContainer}
section               {@link ui.containers.SectionContainer}
tabs                  {@link ui.containers.TabsContainer}

Form Field Components
---------------------------------------
checkbox | boolean    {@link ui.formFields.CheckboxField}
date                  {@link ui.formFields.DateField}
dropdown              {@link ui.formFields.DropdownField}
hidden                {@link ui.formFields.HiddenField}
link | linktextfield  {@link ui.formFields.LinkTextField}
radio                 {@link ui.formFields.RadioField}
textarea              {@link ui.formFields.TextAreaField}
text | string         {@link ui.formFields.TextField}

Tool Buttons
---------------------------------------
toolbutton            {@link ui.toolButtons.ToolButton}
closebutton           {@link ui.toolButtons.CloseButton}
editbutton            {@link ui.toolButtons.EditButton}
upbutton              {@link ui.toolButtons.UpButton}
downbutton            {@link ui.toolButtons.DownButton}
hidebutton            {@link ui.toolButtons.HideButton}
deletebutton          {@link ui.toolButtons.DeleteButton}
</pre>
 * </p>
 * 
 * <p>Some other things to note about Component and its subclasses are:
 * <div class="mdetail-params">
 *   <ul>
 *     <li>
 *       Any configuration options that are provided to its constructor are automatically applied (copied) onto the new Component object. This
 *       makes them available as properties, and allows them to be referenced in subclasses as `this.configName`.  However, unless the
 *       configuration options are also listed as public properties, they should not be used externally.
 *     </li>
 *     <li>
 *       Components directly support masking and un-masking their viewable area.  See the {@link #maskConfig} configuration option, and the {@link #mask} and
 *       {@link #unMask} methods.
 *     </li>
 *     <li>
 *       When a Component is {@link #destroy} destroyed, a number of automatic cleanup mechanisms are executed. See {@link #destroy} for details. 
 *     </li>
 *   </ul>
 * </div></p>
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.Component = Kevlar.extend( Kevlar.util.Observable, { 
	
	/**
	 * @cfg {String} id 
	 * The id that identifies this Component. Defaults to a unique id, 
	 * and may be retrieved by {@link #getId}.
	 */
	 
	/**
	 * @cfg {String} elId
	 * The id that should be used for the Component's element. Defaults to a unique id.
	 */
	
	/**
	 * @cfg {String} elType
	 * The element type that should be created as the Component's HTML element. For example, the string
	 * 'div' will create a &lt;div&gt; element for the Component. Any HTML element type can be used,
	 * and subclasses may override the default for a different implementation.
	 */
	elType : 'div',
	 
	/**
	 * @cfg {jQuery/HTMLElement} renderTo The HTML element to render this component to. If specified, 
	 * the component will be rendered immediately upon creation.
	 */
	
	/**
	 * @cfg {Boolean} hidden True to initially render the Component hidden.
	 */
	hidden : false,
	
	/**
	 * @cfg {Object} attr
	 * Any additional html attributes to apply to the outer div element. Should be an object where the keys are the attribute names, and the values are the attribute values.
	 */
	
	/**
	 * @cfg {String} cls
	 * Any additional CSS class(es) to add to this component's element. If multiple, they should be separated by a space. 
	 * Useful for styling Components and their inner elements (if any) based on regular CSS rules.
	 * (Note that this is named 'cls' instead of 'class', as 'class' is a JavaScript reserved word.)
	 */
	cls: '',
	
	/**
	 * @cfg {Object} style
	 * Any additional styles to apply to the outer div element. Should be an object where the keys are the css property names, and the values are the css values.
	 */
	
	
	/**
	 * @cfg {String} html
	 * Any explicit HTML to attach to the Component at render time.<br><br>
	 * 
	 * Note that this config, in the end, has the same effect as the {@link #contentEl} config, but is more clear 
	 * from the client code's side for adding explict HTML to the Component.
	 */
	
	/**
	 * @cfg {HTMLElement/jQuery} contentEl
	 * An existing element or jQuery wrapped set to place into the Component when it is rendered, which will become
	 * the "content" of the Component.  The element will be moved from its current location in the DOM to inside this
	 * Component's element.<br><br>
	 * 
	 * Note that this config, in the end, has the same effect as the {@link #html} config, but is more clear from the
	 * client code's side for adding DOM elements to the Component.
	 */
	
	
	/**
	 * @cfg {Number/String} height
	 * A height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	/**
	 * @cfg {Number/String} width
	 * A width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	/**
	 * @cfg {Number/String} minHeight
	 * A minimum height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	/**
	 * @cfg {Number/String} minWidth
	 * A minimum width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	/**
	 * @cfg {Number/String} maxHeight
	 * A maximum height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	/**
	 * @cfg {Number/String} maxWidth
	 * A maximum width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	
	/**
	 * @cfg {Object} maskConfig A configuration object for the default mask that will be shown when the {@link #mask} method is called (if {@link #mask mask's}
	 * argument is omitted), or if the {@link #masked} configuration option is true (in which a mask will be shown over the Component, using this maskConfig, 
	 * when it is first rendered).  This default maskConfig can be overrided when calling {@link #mask} by passing a configuration object for its argument.<br><br>
	 * 
	 * Masks are shown and hidden using the {@link #mask} and {@link #unMask} methods. If this configuration option is not provided, the configuration
	 * options default to the default values of the configuration options for {@link ui.Mask}.
	 */
	
	/**
	 * @cfg {Boolean} masked True to instantiate the Component with its mask shown (the {@link #mask} method is automatically run when the Component
	 * is rendered).
	 */
	masked : false,
	
	
	/**
	 * @cfg {ui.plugins.AbstractPlugin/ui.plugins.AbstractPlugin[]} plugins
	 * A single plugin or array of plugins to attach to the Component. Plugins must extend the class {@link ui.plugins.AbstractPlugin}.
	 * See {@link ui.plugins.AbstractPlugin} for details on creating plugins.<br><br>
	 * 
	 * Note that Component will normalize this config into an array, converting a single plugin into a one-element array, or creating
	 * an empty array if no plugins were provided.  This is done so that subclasses may add plugins by pushing them directly
	 * onto the plugins array in their implementation of {@link #initComponent}. 
	 */
	
	
	
	/**
	 * @private
	 * @cfg {ui.Container} parentContainer
	 * The parent {@link ui.Container Container} of this Component (if any). This is set by the {@link ui.Container} that is adding this Component
	 * as a child, and should not be supplied directly.
	 */
	parentContainer: null,
	
	/**
	 * @private
	 * @property initialConfig
	 * Stores the initial configuration options provided to this component. This is currently used by ui.bits.BitWrapper
	 * to pass the initial configuration of the Component into the EditUIBitInstance that it is creating, and may be used
	 * for other purposes in the future as well.
	 * @type Object
	 */
 
	/**
	 * @property {Boolean} rendered (readonly)
	 * 
	 * Property that can be used to determine if the Component has been rendered.  
	 * Will be set to true after the render method has been executed.
	 */
	rendered: false,
	
	/**
	 * @private
	 * @property {Boolean} hidden (readonly)
	 * 
	 * Property that stores the 'hidden' state of the Component. Note that the component may be 
	 * considered "hidden" by its element's visibility (i.e. it will be considered hidden if its parent
	 * element is hidden), in which case the {@link #isHidden} method will return true. But this property
	 * stores the state of if the Component is supposed to be still hidden when its parent element is shown.
	 */
	
	/**
	 * @protected
	 * @property {Boolean} masked
	 * 
	 * Flag to store the current state of if the Component is masked or not. This is also a config option.
	 */
	
	/**
	 * @private
	 * @property {Boolean} deferMaskShow
	 * 
	 * Flag that is set to true if the {@link #mask} method is run, but the Component is currently hidden.
	 * The Component must be in a visible state to show the mask, as the ui.Mask class makes a calculation of 
	 * the height of the mask target element.  When the Component's {@link #show} method runs, this flag will be
	 * tested to see if it is true, and if so, will run the {@link #mask} method at that time.
	 */
	deferMaskShow : false,
	
	/**
	 * @private
	 * @property {ui.Mask} _mask
	 * 
	 * The ui.Mask instance that the Component is currently using to mask over the Component. This will be null
	 * if no ui.Mask has been created (i.e. the {@link #mask} method has never been called). 
	 */
	
	/**
	 * @private
	 * @property deferredMaskConfig
	 * @type Object
	 * If the masking of the Component needs to be deferred (either because the Component is not yet rendered, or because
	 * the Component is currently hidden), then the configuration options to show the mask with are stored in this property,
	 * for when the mask does in fact get shown.
	 */
	
	
	/**
	 * @property destroyed (readonly)
	 * Initially false, and will be set to true after the {@link #destroy} method executes.
	 * @type Boolean
	 */
	destroyed: false,
	
	/**
	 * @private
	 * @property $el
	 * The main element that is created for the Component (determined by the {@link #elType} config). 
	 * This will be available after the Component is rendered, and may be retrieved using {@link #getEl}
	 * @type jQuery
	 */	
	
	
	constructor : function( config ) {
		// Apply the properties of the configuration object onto this object, and the initialConfig object
		Kevlar.apply( this, config );
		this.initialConfig = Kevlar.apply( {}, config );
		
		
		// Call superclass (observable) constructor. Must be done after config has been applied.
		ui.Component.superclass.constructor.call( this );
		
        
		// Add events that this class will fire
		this.addEvents( 
			/**
			 * @event render
			 * Fires when this component has been rendered.
			 * @param {ui.Component} component This component.
			 */
			'render',
			
			/**
			 * @event show
			 * Fires when the component has been shown, using the {@link #show} method. Only fires
			 * if the Component has been rendered.
			 * @param {ui.Component} component This component.
			 */
			'show',
			
			/**
			 * @event hide
			 * Fires when the component has been hidden, using the {@link #hide} method. Only fires
			 * if the Component has been rendered.
			 * @param {ui.Component} component This component.
			 */
			'hide',
					
			/**
			 * @event beforedestroy
			 * Fires just before this component is destroyed. A handler of this event may return false to cancel 
			 * the destruction process for the Component.
			 * @param {ui.Component} component This component. 
			 */
			'beforedestroy',
			
			/**
			 * @event destroy
			 * Fires when this component has been destroyed.
			 * @param {ui.Component} component This component.
			 */
			'destroy'
		);
		
		
		// Workaround: manifests can specify an onRender function, which would shadow the prototype onRender function. Executing
		// it in a listener and removing the property to prevent this from happening.
		if( this.hasOwnProperty( 'onRender' ) ) {
			var providedOnRender = this.onRender;
			this.addListener( {
				'render' : function( component ) {
					// Call the provided onRender function in the scope of this object
					providedOnRender.call( this, component );
				},
				scope: this
			} );
			delete this.onRender;  // delete the provided (ownProperty) onRender to un-shadow the prototype's onRender.
		}
		
		
		// Generate a unique ID for this component, and a unique element ID for the component's div element, if not provided.
		this.id = this.id || 'ui-cmp-' + Kevlar.newId();
		this.elId = this.elId || 'ui-cmp-' + Kevlar.newId();
		
		// Normalize the 'plugins' config into an array before calling initComponent, so that subclasses may just push any
		// plugins that they wish directly onto the array without extra processing.
		this.plugins = this.plugins || [];
		if( Kevlar.isObject( this.plugins ) ) {
			this.plugins = [ this.plugins ];
		}
        
		
		// Call template method for the initialization of subclasses of this Component
		this.initComponent();
		
		
		// Initialize any plugins provided to the Component
		if( this.plugins.length > 0 ) {
			this.initPlugins( this.plugins );
		}
		
		// Render the component immediately if a 'renderTo' element is specified
		if( this.renderTo ) {
			this.render( this.renderTo );
			delete this.renderTo;   // no longer needed
		}
	},
	
	
	/**
	 * Template method for initialization. This method should replace constructor for subclasses
	 * of Component.
	 * 
	 * @protected
	 * @method initComponent
	 */
	initComponent : function() {
		// Template Method
	},
	
	
	/**
	 * Initializes the plugins for the Component.
	 * 
	 * @private
	 * @method initPlugins
	 * @param {ui.plugins.AbstractPlugin/ui.plugins.AbstractPlugin[]} plugin A single plugin, or array of plugins to initialize.
	 */
	initPlugins : function( plugin ) {
		if( Kevlar.isArray( plugin ) ) {
			for( var i = 0, len = plugin.length; i < len; i++ ) {
				this.initPlugins( plugin[ i ] ); 
			}
			return;  // array has been processed, return
		}
		
		if( !( plugin instanceof ui.plugins.AbstractPlugin ) ) {
			throw new Error( "error: a plugin provided to this Component was not of type ui.plugins.AbstractPlugin" );
		}
		
		// Initialize the plugin, passing a reference to this Component into it.
		plugin.initPlugin( this );
	},
	
	
	/**
	 * Renders the component into a containing HTML element.  Starts by creating the base div element for this component, and then 
	 * calls the template method {@link #onRender} to allow subclasses to add their own functionality/elements into the rendering process.
	 *
	 * @method render
	 * @param {HTMLElement/jQuery} containerEl The HTML element to render this component into.
	 */
	render : function( containerEl ) {
		var $containerEl = jQuery( containerEl );
		
		if( this.rendered ) {
			// Component is already rendered, just append it to the supplied container element
			this.$el.appendTo( $containerEl );
			
		} else {
			// First, handle any additional attributes (the 'attr' config) that were specified to add
			var additionalAttributes = [], 
			    attr = this.attr;
			if( attr ) {
				for( var attribute in attr ) {
					if( attr.hasOwnProperty( attribute ) ) {
						additionalAttributes.push( attribute + '="' + attr[ attribute ] + '"' );
					}
				}
			}
			
			// Create a CSS string of any specified styles (the 'style' config)
			var styles = "";
			if( this.style ) {
				styles = Kevlar.CSS.hashToString( this.style );
			}
			
			// Create the main (outermost) element for the Component. By default, creates a div element, such as:
			// <div id="someID" />
			this.$el = jQuery( '<' + this.elType + ' id="' + this.elId + '" class="' + this.cls + '" style="' + styles + '" ' + additionalAttributes.join( " " ) + ' />' );
			
			
			// Appending the element to the container before the call to onRender. It is necessary to do things in this order (and not rendering children and then appending)
			// for things like the jQuery UI tabs, which requires that their wrapping elements be attached to the DOM when they are instantiated.
			// Otherwise, those items require their instantiation to be placed into a setTimeout(), which causes a flicker on the screen (especially for the jQuery UI tabs). 
			$containerEl.append( this.$el );
			
			// Setting the render flag before the call to onRender so that onRender implementations can call methods that check this flag (such as setters
			// that handle the case of the Component not yet being rendered).
			this.rendered = true;
			
			// Call onRender template method for subclasses to add their own elements, and whatever else they need 
			this.onRender( $containerEl );
			
			
			
			
			// Attach any specified HTML or content element to the Component's content target. The content target is by default,
			// the Component's element, but may be overridden by subclasses that generate a more complex HTML structure.
			var $contentTarget = this.getContentTarget(); 
			if( this.html ) {
				$contentTarget.append( this.html );
			}
			if( this.contentEl ) {
				$contentTarget.append( this.contentEl );
			}
			
			// Apply any custom sizing
			if( typeof this.height !== 'undefined' ) { this.$el.height( this.height ); }
			if( typeof this.width !== 'undefined' ) { this.$el.width( this.width ); }
			if( typeof this.minHeight !== 'undefined' ) { this.$el.css( { minHeight: this.minHeight } ); }
			if( typeof this.minWidth !== 'undefined' ) { this.$el.css( { minWidth: this.minWidth } ); }
			if( typeof this.maxHeight !== 'undefined' ) { this.$el.css( { maxHeight: this.maxHeight } ); }
			if( typeof this.maxWidth !== 'undefined' ) { this.$el.css( { maxWidth: this.maxWidth } ); }
			
			
			// If the Component was configured with hidden = true, hide it now. This must be done after onRender,
			// because some onRender methods change the 'display' style of the outer element.
			if( this.hidden ) {
				this.$el.hide();
			}
			
			// If the Component was configured with masked = true, show the mask now.
			if( this.masked ) {
				this.mask( this.deferredMaskConfig );  // deferredMaskConfig will be defined if a call to mask() has been made before the Component has been rendered. Otherwise, it will be undefined.
			}
			
			// Call the afterRender template method
			this.afterRender( $containerEl );
			
			// Finally, fire the render event
			this.fireEvent( 'render', this );
		}
	},
	
	
	/**
	 * Template method that runs when a Component is being rendered, after the Component's base element has been created and appended
	 * to its parent element.
	 * 
	 * @protected
	 * @method onRender
	 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component is being rendered into.
	 */
	onRender : function( $containerEl ) { 
		// Template method
	},
	
	
	/**
	 * Template method that runs when a Component has been completely rendered (i.e. the base element has been created,
	 * the {@link #onRender} template method has run, the content/html has been appended, the sizing configs have been set,
	 * and the element has had its initial {@link #hidden} state set).
	 * 
	 * @protected
	 * @method afterRender
	 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component has been rendered into.
	 */
	afterRender : function( $containerEl ) { 
		// Template method
	},
	
	
	/**
	 * Updates the HTML of the component directly. Will handle the unrendered an rendered states of the Component.
	 *
	 * @method update
	 * @param {String/HTMLElement/jQuery} content The HTML content as a string, an HTML element, or a jQuery wrapped set of 
	 *   elements to update the component with.
	 */
	update : function( content ) {
		if( !this.rendered ) {
			// Remove this config, just in case it was specified. Setting the 'html' config (next) has the same effect as 'contentEl'.
			delete this.contentEl;
			
			// Set the 'html' config, for when the Component is rendered.
			this.html = content;
			
		} else {
			this.getContentTarget().empty().append( content );
		}
	},
	
	
	// ----------------------------
	
	
	/**
	 * Retrieves the element that should be the target for the Component's content (html).  For ui.Component, this is just the Component's
	 * base element (see {@link #$el}), but this method can be overridden in subclasses that define a more complex structure, where their
	 * content should be placed elsewhere. 
	 * 
	 * @method getContentTarget
	 * @return {jQuery} The element (jQuery wrapped set) where HTML content should be placed. The {@link #html} and {@link #contentEl} 
	 *   configs will be attached to this element.
	 */
	getContentTarget : function() {
		return this.getEl();
	},
	
	
	/**
	 * Returns the id this component.  See {@link #id}.
	 * 
	 * @method getId
	 * @return {String}
	 */
	getId : function() {
		return this.id;
	},
		
	
	/**
	 * Returns the container element for this component, wrapped in a jQuery object.  This element will only
	 * be available after the component has been rendered by {@link #render}.  The element that will be returned
	 * will be the one created for the Component in the {@link #render} method, and its type is dependent on the
	 * {@link #elType} config.
	 * 
	 * @method getEl
	 * @return {jQuery}
	 */
	getEl : function() {
		return this.$el;
	},
	
	
	/**
	 * Returns a <i>copy</i> of the original configuration options provided to this Component. This copy is only
	 * a shallow copy however, and object references will be maintained.
	 * 
	 * @method getInitialConfig
	 * @return {Object}
	 */
	getInitialConfig : function() {
		return this.initialConfig;
	},
	
	
	// ------------------------------------
	
	
	/**
	 * Shows the Component. 
	 *
	 * @method show
	 * @param {Object} [animConfig] A {@link ui.anim.Animation} config object (minus the {@link ui.anim.Animation#target target) property) 
	 *   for animating the showing of the Component. Note that this will only be run if the Component is currently {@link #rendered}.
	 */
	show : function( animConfig ) {
		this.hidden = false;  // set flag regardless of if the Component is rendered or not. If not yet rendered, this flag will be tested for in the render() method.
		
		if( this.rendered ) {
			// If a show animation was specified, run that now. Otherwise, simply show the element
			if( typeof animConfig === 'object' ) {
				animConfig.target = this;
				
				this.currentAnimation = new ui.anim.Animation( animConfig );    
				//this.currentAnimation.addListener( 'afteranimate', this.showComplete, this );  // adding a listener instead of providing in config, in case there is already a listener in the config
				this.currentAnimation.start();
			} else {
				this.$el.show();
			}
			
			// Call template method, and fire the event
			this.onShow();
			this.fireEvent( 'show', this );
		}
	},
	
	
	/**
	 * Hook method for handling the component being shown. This will only be called when the 
	 * Component is shown after it is rendered. Note that this method is called immediately after
	 * any animation is started by providing the `animConfig` argument to {@link #show}.
	 * 
	 * @protected
	 * @method onShow
	 */
	onShow : function() {
		// If a mask show request has been made while the Component was hidden, show the mask now, with the configuration requested when the call to mask() was made (if any).
		if( this.deferMaskShow ) {
			this.mask( this.deferredMaskConfig );
		}
	},
	
	
	/**
	 * Hides the Component.
	 *
	 * @method hide
	 * @param {Object} [animConfig] A {@link ui.anim.Animation} config object (minus the {@link ui.anim.Animation#target target) property) 
	 *   for animating the hiding of the Component. Note that this will only be run if the Component is currently {@link #rendered}.
	 */
	hide : function( animConfig ) {
		this.hidden = true;  // set flag regardless of if the Component is rendered or not. If not yet rendered, this flag will be tested for in the render() method, and the Component will be hidden.
		
		if( this.rendered ) {
			// If a show animation was specified, run that now. Otherwise, simply show the element
			if( typeof animConfig === 'object' ) {
				animConfig.target = this;
				
				this.currentAnimation = new ui.anim.Animation( animConfig );    
				//this.currentAnimation.addListener( 'afteranimate', this.hideComplete, this );  // adding a listener instead of providing in config, in case there is already a listener in the config
				this.currentAnimation.start();
			} else {
				this.$el.hide();
			}
			
			this.onHide();
			this.fireEvent( 'hide', this );
		}
	},
	
	
	/**
	 * Hook method for handling the component being hidden. This will only be called when the 
	 * Component is hidden after it is rendered. Note that this method is called immediately after
	 * any animation is started by providing the `animConfig` argument to {@link #hide}.
	 * 
	 * @protected
	 * @method onHide
	 */
	onHide : Kevlar.emptyFn,
	
	
	/**
	 * Tests to see if the Component is hidden. Note that this method tests for the Component's element visibility
	 * (after it has been rendered), and will return true if 1) the element itself is set as "display: none", 2) a parent 
	 * element of the Component is set to "display: none", or 3) the element is not attached to the document.  To determine 
	 * if the Component's element itself is set as hidden, regardless of the visibility of parent elements or being attached
	 * to the document, check the {@link #hidden} property.
	 * 
	 * @method isHidden
	 * @return {Boolean}
	 */
	isHidden : function() {
		if( !this.rendered ) {
			return this.hidden;  // not yet rendered, return the current state of the 'hidden' config
			
		} else {
			// NOTE: Cannot simply use the jQuery :hidden selector. jQuery determines if an element is hidden by if it
			// has any computed height or width > 0. The Component's element can be shown, but if it's not taking up 
			// any space because it has no content, it would still be considered hidden by jQuery. We instead want to see
			// if the Component, or any of its ancestor elements are hidden via "display: none", to determine if it's hidden.
			// The Component must also be attached to the document to be considered "shown".
			//return this.$el.is( ':hidden' );  -- intentionally left here as a reminder not to use
			
			// Find out if the component itself, or any of its ancestor elements has "display: none".
			if( this.$el.css( 'display' ) === 'none' ) {    // slight optimization by testing the Component's element itself first, before grabbing parent elements to test
				return true;
				
			} else {
				var $parents = this.$el.parents(),
				    numParents = $parents.length;
				
				
				// If the element is not attached to the document (it has no parents, or the top level ancestor is not the <html> tag), then it must be hidden
				if( numParents === 0 || $parents[ numParents - 1 ].tagName.toLowerCase() !== 'html' ) {
					return true;
				}

				// Element is attached to the DOM, check all parents for one that is not displayed
				for( var i = 0, len = $parents.length; i < len; i++ ) {
					if( jQuery( $parents[ i ] ).css( 'display' ) === 'none' ) {
						return true;
					}
				}
			}
			
			// Passed checks, element must not be hidden
			return false;
		}
	},
	
	
	// -------------------------------------
	
	
	/**
	 * Masks the component with a {@link ui.Mask}. Uses the default mask configuration provided by the {@link #maskConfig} configuration object,
	 * or optionally, the provided `maskConfig` argument.
	 * 
	 * @method mask
	 * @param {Object} maskConfig (optional) The explicit configuration options to set the {@link ui.Mask} that will mask over the Component.
	 *   If not provided, will use the default options provided by the {@link #maskConfig} configuration option.
	 */
	mask : function( maskConfig ) {
		maskConfig = maskConfig || this.maskConfig;  // use the provided argument if it exists, or the defaults provided by the config option otherwise
		
		// Set the flag for the isMasked method. Also, if the Component is not rendered, this is updated so that the mask will show on render time.
		this.masked = true;   
		
		if( !this.rendered ) {
			this.deferredMaskConfig = maskConfig;  // set the maskConfig to use when the Component is rendered
			
		} else {
			// If the Component is currently hidden when the mask() request is made, we need to defer
			// it to when the Component's show() method is run. This is because ui.Mask has to make a calculation
			// of the mask target's height. 
			if( this.isHidden() ) {
				this.deferMaskShow = true;
				this.deferredMaskConfig = maskConfig;  // set the maskConfig to use when the Component is shown
				
			} else {
				// Component is rendered and is shown (i.e. not hidden), then we can show the mask
				
				// If there is not yet a mask instance for this Component, create one now.
				// Otherwise, just update its config.
				if( !this._mask ) {
					this._mask = new ui.Mask( this.getMaskTarget(), maskConfig );
				} else {
					this._mask.updateConfig( maskConfig );
				}
				this._mask.show();
				
				// mask has been shown, make sure deferMaskShow flag is set back to false
				this.deferMaskShow = false;
				delete this.deferredMaskConfig;  // in case this exists from a previous deferred mask, remove it now
			}
		}
	},
	
	
	/**
	 * Hides the mask (shown with the {@link #mask} method) from the Component's element.
	 * 
	 * @method unMask
	 */
	unMask : function() {
		this.masked = false;
		
		// in case there was a show request while hidden: set deferMaskShow back to false, and remove the deferredMaskConfig (as we're now hiding the mask)
		this.deferMaskShow = false;  
		delete this.deferredMaskConfig;
		
		if( this.rendered && this._mask ) {
			this._mask.hide();
		}
	},
	
	
	/**
	 * Determines if the Component is currently masked.  See the {@link #mask} method for details on showing the Component's mask.
	 * 
	 * @method isMasked
	 * @return {Boolean}
	 */
	isMasked : function() {
		return this.masked;
	},
	
	
	/**
	 * Method that defines which element the Component's mask should be shown over. For ui.Component,
	 * this is the Component's base {@link #$el element}, but this may be redefined by subclasses.
	 * 
	 * @protected
	 * @method getMaskTarget
	 * @return {jQuery}
	 */
	getMaskTarget : function() {
		return this.getEl();
	},
	
	
	// -------------------------------------
	
	
	/**
	 * Sets the Container that owns (i.e. is a parent of) this Component.
	 * 
	 * @method setParentContainer
	 * @param {ui.Container} container
	 */
	setParentContainer : function( container ) {
		this.parentContainer = container;
	},
	
	
	/**
	 * Gets the Container that owns (i.e. is a parent of) this Component.
	 * 
	 * @method getParentContainer
	 * @return {ui.Container} The Container that owns this Component, or null if there is none.
	 */
	getParentContainer : function() {
		return this.parentContainer;
	},
	
	
	// -------------------------------------
	
	
	/**
	 * Bubbles up the Component/Container heirarchy, calling the specified function with each parent Container, starting
	 * with this Component. The scope (this) of function call will be the scope provided or the current Component. The arguments 
	 * to the function will be the `args` provided or the current component. If the function returns false at any point,
	 * the bubble is stopped.
	 * 
	 * @method bubble
	 * @param {Function} fn The function to call.
	 * @param {Object} scope (optional) The scope of the function (defaults to current node)
	 * @param {Array} args (optional) The args to call the function with (default to passing the current component)
	 */
	bubble : function( fn, scope, args ) {
		var p = this;
		while( p ) {
			if( fn.apply( scope || p, args || [p] ) === false) {
				break;
			}
			p = p.parentContainer;
		}
	},
	
	
	/**
	 * Finds a {@link ui.Container Container} above this Component at any level by a custom function. If the passed function returns
	 * true, the {@link ui.Container Container} will be returned.
	 * 
	 * @method findParentBy
	 * @param {Function} fn The custom function to call with the arguments (Container, this Component).
	 * @return {ui.Container} The first Container for which the custom function returns true.
	 */
	findParentBy : function( fn ) {
		for( var p = this.parentContainer; (p !== null) && !fn( p, this ); p = p.parentContainer ) { /* Empty */ }
		return p || null;
	},
	
	
	/**
	 * Finds a {@link ui.Container Container} above this Component at any level by {@link #id}.  If there is no parent Container
	 * with the supplied `id`, this method returns null.
	 * 
	 * @method findParentById
	 * @param {String} id The {@link #id} of the parent Container to look for.
	 * @return {ui.Container} The first Container which matches the supplied {@link #id}.
	 *   If no Container for the supplied {@link #id} is found, this method returns null.
	 */
	findParentById : function( id ) {
		for( var p = this.parentContainer; p && p.id !== id; p = p.parentContainer ) { /* Empty */ }
		return p || null;
	},
	
	
	/**
	 * Finds the closest {@link ui.Container Container} above this Component by Container `type`.  The Container `type` can be either
	 * the type name that is registered to the {@link ui.ComponentManager ComponentManager} (see the description of this class), or the JavaScript
	 * class (constructor function) of the Container.
	 * 
	 * @method findParentByType
	 * @param {Function} type The type name registered with the {@link ui.ComponentManager ComponentManager}, or the constructor function (class) of the Container.
	 * @return {ui.Container} The first Container which is an instance of the supplied type. 
	 */
	findParentByType : function( type ) {
		if( typeof type === 'string' ) {
			type = ui.ComponentManager.getType( type );
			
			// No type found for the given type name, return null immediately
			if( !type ) {
				return null;
			}
		}
		
		// Find the parent by type (js class / constructor function)
		for( var p = this.parentContainer; p && !(p instanceof type); p = p.parentContainer ) { /* Empty */ }
		return p || null;
	},
	
	
	/**
	 * Override of Kevlar.util.Observable's {@link Kevlar.util.Observable#getBubbleTarget getBubbleTarget} method, which specifies
	 * that the Component's {@link #parentContainer} is the bubble target for events.
	 * 
	 * @method getBubbleTarget
	 * @return {Kevlar.util.Observable} The Component's parent {@link ui.Container} if it is part of a Container hierarchy, or null if it is not.
	 */
	getBubbleTarget : function() {
		return this.parentContainer;
	},
	
	
	/**
	 * Destroys the Component. Frees (i.e. deletes) all references that the Component held to HTMLElements or jQuery wrapped sets
	 * (so as to prevent memory leaks) and removes them from the DOM, removes the Component's {@link #mask} if it has one, purges 
	 * all event {@link #listeners} from the object, and removes the Component's element ({@link #$el}) from the DOM, if the Component 
	 * is rendered.<br><br>
	 *
	 * Fires the {@link #beforedestroy} event, which a handler can return false from to cancel the destruction process,
	 * and the {@link #destroy} event.
	 * 
	 * @method destroy
	 */
	destroy : function() {
		if( !this.destroyed ) {
			if( this.fireEvent( 'beforedestroy', this ) !== false ) {
				// Run template method for subclasses first, to allow them to handle their processing
				// before the Component's element is removed
				this.onDestroy();
				
				// Destroy the mask, if it is an instantiated ui.Mask object (it may not be if the mask was never used)
				if( this._mask instanceof ui.Mask ) {
					this._mask.destroy();
				}
				
				// Remove any HTMLElement or jQuery wrapped sets used by the Component from the DOM, and free 
				// the references so that we prevent memory leaks.
				// Note: This includes the Component's $el reference (if it has been created by the Component being rendered).
				for( var prop in this ) {
					if( this.hasOwnProperty( prop ) ) {
						var propValue = this[ prop ];
						
						if( Kevlar.isElement( propValue ) ) {
							// First, wrap the raw HTMLElement in a jQuery object, for easy removal. Then delete the reference.
							jQuery( propValue ).remove();
							delete this[ prop ];
						} else if( Kevlar.isJQuery( propValue ) ) {
							propValue.remove();
							delete this[ prop ];
						}
					}
				}
				
				this.rendered = false;  // the Component is no longer rendered; it's $el has been removed (above)
				this.destroyed = true;
				this.fireEvent( 'destroy', this );
				this.purgeListeners();  // Note: Purge listeners must be called after 'destroy' event fires!
			}
		}
	},
	
	
	/**
	 * Template method for subclasses to extend that is called during the Component's destruction process.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		// Template Method
	}
	
} );


// Register the type so it can be created by the string 'Component' in the manifest
ui.ComponentManager.registerType( 'Component', ui.Component );

/**
 * @class ui.Container
 * @extends ui.Component
 * 
 * Base class for a component that holds other child components. Provides a default
 * container layout that just adds child components directly into it with no layout.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.Container = Kevlar.extend( ui.Component, {	
	
	/**
	 * @cfg {String} defaultType
	 * The default Component 'type' to instantiate when child {@link #items} are specified as anonymous config objects 
	 * without a `type` property of their own. See {@link ui.Component} for a list of types. Defaults to "Container", 
	 * which makes it simple to create tab containers and such. 
	 */
	defaultType : 'Container',
	
	/**
	 * @cfg {Boolean} destroyRemoved
	 * True if the Container should automatically destroy child Components that have been removed from it.
	 */
	destroyRemoved : true,
	
	/**
	 * @cfg {String/Object/ui.layouts.AbstractLayout} layout
	 * The layout strategy object to use for laying out (displaying) the Container's child items.  This can either be a string with the 
	 * type name of the layout, an object which should have the property `type` (for the layout's type name) and any other layout 
	 * configuration options, or an instantiated {@link ui.layouts.AbstractLayout} subclass.
	 */
	
	/**
	 * @cfg {Array/Object} items
	 * Any Components/Containers that will become children of this Container, and will be instantiated at 
	 * construction time.  These can be retrieved from the Container using {@link #getItems}.<br><br>
	 * 
	 * Note that specifying child items is mutually exclusive with setting the {@link ui.Component#html} and 
	 * {@link ui.Component#contentEl} configs, and will take precedence over them.
	 */
	
	/**
	 * @cfg {Object} data
	 * The data to recursively set to each of the {@link ui.DataControl DataControls} (see {@link #items}) in this Container after
	 * their instantiation.  This can be an object (hash) where the object's keys 
	 * are the DataControl keys, and the values are the data values themselves.
	 */
	
	
	/**
	 * @private
	 * @property deferLayout
	 * Will be set to true if a layout is requested (i.e. the {@link #doLayout} method is run), but the Container
	 * cannot be laid out at that time due to the Container being hidden.  This flag is tested for when the Container
	 * is then shown, and if true, will run {@link #doLayout} then.
	 * @type Boolean
	 */
	deferLayout : false,
	
	
	// protected
	initComponent : function() {
		// If the items config has a value, remove any html and contentEl configs, as the items config takes precedence.
		if( this.items ) {
			this.html = undefined;
			this.contentEl = undefined;
		}
		
		
		this.addEvents(
			/**
			 * Fires before a Component has been added to this Container. A handler of
			 * this event may return false to cancel the addition of the Component.
			 * 
			 * @event beforeadd
			 * @param {ui.Container} container This Container.
			 * @param {ui.Component} component The Component that is to be added.
			 */
			'beforeadd',
			
			/**
			 * Fires after a Component has been added to this Container. This event bubbles.
			 * 
			 * @event add
			 * @bubbles
			 * @param {ui.Container} container This Container.
			 * @param {ui.Component} component The Component that was added.
			 * @param {Number} index The index in this Container's child items array that the Component was added to.
			 */
			'add',
			
			/**
			 * Fires when a Component has been reordered within the Container (i.e. its index has changed).
			 * This is fired by the {@link #insert} method if it notices that the Component being "inserted" is
			 * already in this Container, but at a different index. If the Component was previously in a different
			 * Container, then the {@link #add} event is fired. 
			 * 
			 * @event reorder
			 * @param {ui.Container} container This Container.
			 * @param {ui.Component} component The Component that was reordered within the Container.
			 * @param {Number} index The new index of the Component in this Container's child items array.
			 * @param {Number} previousIndex The previous index of the Component in this Container's child items array.
			 */
			'reorder',
			
			/**
			 * Fires before a Component has been removed from this Container. A handler of
			 * this event may return false to cancel the removal of the Component.
			 * 
			 * @event beforeremove
			 * @param {ui.Container} container This Container.
			 * @param {ui.Component} component The Component that is to be removed.
			 */
			'beforeremove',
			
			/**
			 * Fires after a Component has been removed from this Container. This event bubbles.
			 * 
			 * @event remove
			 * @bubbles
			 * @param {ui.Container} container This Container.
			 * @param {ui.Component} component The Component that was removed.
			 * @param {Number} index The index in this Container's child items array that the Component was removed from.
			 */
			'remove',
		
			/**
			 * Fires after the Container's {@link #doLayout} method has executed,
			 * which lays out and renders all child Components.  Note that this event 
			 * will fire after the {@link #render} event fires.
			 * 
			 * @event afterlayout
			 * @param {ui.Container} container This Container.
			 */
			'afterlayout'
		);
		
		// Enable bubbling for the "add" and "remove" events
		this.enableBubble( 'add', 'remove' );
		
		
		// Call superclass initComponent
		ui.Container.superclass.initComponent.call( this );
		
		
		/**
		 * @private
		 * @property childComponents
		 * An array of child components. Created from the "items" config, or call(s) to the {@link #add} method.
		 * @type ui.Component[]
		 */
		this.childComponents = [];
		
		// Add child Components if specified in an items config
		if( this.items ) {
			this.add( this.items );
			delete this.items;  // no longer needed, instantiated item components have been put into this.childComponents
		}
		
		
		// Set any provided layout.
		if( this.layout ) {
			this.setLayout( this.layout );
		}
		
		
		// If initial data was provided for child Components, set it now.
		if( this.data ) {
			this.setData( this.data );
		}
	},
	
	
	
	// ----------------------------------------
	
	// Child Component Manipulation Methods
	
    
    /**
     * Creates a Component from a configuration object. Automatically adds the parentContainer property to the supplied
     * `config` object that refers to this Container, and adds the {@link #defaultType} to the `config` object
     * if no `type` property was specified.
     * 
     * @protected
     * @method createComponent
     * @param {Object} config The configuration object for the Component.
     * @return {ui.Component} The instantiated Component.
     */
    createComponent : function( config ) {
        // Set the Component's parentContainer property to this Container, and use the default component 'type' if one wasn't specified
        // in the provided config. Adding in the 'parentContainer' and 'type' properties onto a new object, because we 
        // don't want to modify the original configuration object (as that object may be used multiple times, or elsewhere).        
        config = Kevlar.apply( {}, config, {   // 3rd arg is "defaults" to apply 
            parentContainer: this,
            type: this.defaultType 
        } );
        
        return ui.ComponentManager.create( config );
    },
	
	
	/**
	 * Adds child {@link ui.Component Component(s)} to this Container, instantiating them into their appropriate
	 * ui.Component subclass.  When all Components are added, this method automatically calls {@link #doLayout} to
	 * refresh the layout.<br><br>
	 * 
	 * Note that if multiple Components are being added, it is recommended that they all be provided to this method
	 * in one call, using the array form of the `cmp` argument.  A call to {@link #doLayout} will only be done
	 * after all Components are added (and not once for each add).<br><br>
	 * 
	 * This method fires the 'add' event for each Component that is added.
	 * 
	 * 
	 * @method add
	 * @param {ui.Component/Object/ui.Component[]/Array} cmp A single child {@link ui.Component} or config object, or an array of 
	 *   child {@link ui.Component Components} or config objects.
	 * @return {ui.Component/ui.Component[]} Returns the Component that was added, or an array of the Components that were added, depending on
	 *   the type provided to the `cmp` argument.  Single Component addition returns a single Component; array addition returns an array. See
	 *   the return value of {@link #insert}.
	 */
	add : function( cmp ) {
		var returnVal;
		
		if( Kevlar.isArray( cmp ) ) {
			returnVal = [];
			for( var i = 0, numItems = cmp.length; i < numItems; i++ ) {
				returnVal.push( this.doInsert( cmp[ i ] ) ); 
			}
			
		} else {
			returnVal = this.doInsert( cmp );  // note: will append the component when not specifying the "position" argument
		}
		
		// Redraw the layout after all Components have been added
		this.doLayout();
		
		return returnVal;
	},
	
	
	/**
	 * Inserts (or moves) a {@link ui.Component Component} into this Container.
	 * 
	 * @method insert
	 * @param {ui.Component/Object} cmp The Component or config object of a Component to insert.
	 * @param {Number} position (optional) The position (index) to insert the Component at. If omitted, the component will be appended to the Container. 
	 * @return {ui.Component} The Component that was inserted, or null if the Component was not added because a beforeadd event handler returned false.
	 */
	insert : function( cmp, position ) {
		cmp = this.doInsert( cmp, position );
		
		// Redraw the layout after the Component has been inserted
		this.doLayout();
		
		return cmp;
	},
	
	
	/**
	 * Private method that does the actual add or insert of the Component.  This is called by both {@link #add} and {@link #insert} methods, and exists
	 * so that those methods can call {@link #doLayout} after their processing is complete.
	 * 
	 * @private
	 * @method doInsert
	 * @param {ui.Component/Object} component The Component or config object of a Component to insert.
	 * @param {Number} position (optional) The position (index) to insert the Component at. If omitted, the component will be appended to the Container. 
	 * @return {ui.Component} The Component that was inserted, or null if the component was not added because a beforeadd event handler returned false.
	 */
	doInsert : function( component, position ) {
		// First, fix position if it is out of the bounds of the childComponents array
		if( typeof position !== 'number' ) {
			position = this.childComponents.length;  // append by default
		} else if( position < 0 ) {
			position = 0;
		} else if( position > this.childComponents.length ) {
			position = this.childComponents.length;
		}
		
		
		var isInstantiatedComponent = ( component instanceof ui.Component ),   // if the component argument is an actual instantiated ui.Component, and not just a configuration object
		    isReorder = isInstantiatedComponent && this.has( component );  // Determines if this is an actual addition of the Component to the Container, or a reorder of the Component within the Container
		
		
		if( isReorder ) {
			// Component is currently in this Container, remove its reference from its current location in the childComponents array.
			// It will be re-added to the childComponents array next.
			var childComponents = this.childComponents;
			for( var i = 0, len = childComponents.length; i < len; i++ ) {
				if( childComponents[ i ] === component ) {
					this.childComponents.splice( i, 1 );  // remove component from array. will re-add later
					break;
				}
			}
			
			// Add the component to the new position in the childComponents array
			this.childComponents.splice( position, 0, component );
			
			// Call the onReorder template method, and fire the 'reorder' event
			this.onReorder( component, position, i );  // Component, new index, previous index
			this.fireEvent( 'reorder', this, component, position, i );  // Container, Component, new index, previous index
			
			return component;
			
		} else {
			// If the component is not yet a ui.Component instance at this point (i.e. it is a configuration object), instantiate it now so 
			// we can provide it to the beforeadd event
			if( !isInstantiatedComponent ) {
				component = this.createComponent( component );
			}
			
			if( this.fireEvent( 'beforeadd', this, component ) !== false ) {
				// If the component currently has a parent Container other than this one, remove the component from it. We will set its parent to this Container next.
				var currentParentContainer = component.getParentContainer();
				if( currentParentContainer !== null ) {
					currentParentContainer.remove( component, /* destroyRemoved */ false );
				}
				
				// Set the component to have this Container as its parent container (regardless of if it has a current parent Container or not)
				component.setParentContainer( this );
				
				// Add the component to the new position in the childComponents array
				this.childComponents.splice( position, 0, component );
				
				// Run template method, and fire the event
				this.onAdd( component, position );
				this.fireEvent( 'add', this, component, position );
				
				return component;
				
			} else {
				// a beforeadd event handler returned false, return null from this method
				return null;
			}
		}
	},
	
	
	/**
	 * Template method that is run when a Component is added or inserted into the Container.
	 * 
	 * @protected
	 * @method onAdd
	 * @param {ui.Component} component The component that was added or inserted into this Container.
	 * @param {Number} index The index in this Container's child items array where the new Component was added.
	 */
	onAdd : Kevlar.emptyFn,
	
	
	/**
	 * Template method that is run when a Component is reordered within the Container.
	 * 
	 * @protected
	 * @method onReorder
	 * @param {ui.Component} component The Component that was reordered within the Container.
	 * @param {Number} index The new index of the Component in this Container's child items array.
	 * @param {Number} previousIndex The previous index of the Component in this Container's child items array.
	 */
	onReorder : Kevlar.emptyFn,
	
	
	
	/**
	 * Removes child {@link ui.Component Component(s)} from this Container.  Removed {@link ui.Component Components} will automatically have 
	 * their destroy() method called if the {@link #destroyRemoved} config is true (the default), or if the `destroyRemoved` argument is explicitly set to true.  
	 * If the Component is not destroyed, its main {@link ui.Component#$el element} is detached from this Container.  When all Components are removed, 
	 * this method automatically calls {@link #doLayout} to refresh the layout.<br><br>
	 * 
	 * Note that if multiple Components are being removed, it is recommended that they all be provided to this method
	 * in one call, using the array form of the `cmp` argument.  A call to {@link #doLayout} will only be done
	 * after all Components have been removed (and not once for each Component that is removed).<br><br>
	 * 
	 * The 'remove' event will be fired for each Component that is successfully removed (i.e. the Component was found in the Container, and a 
	 * {@link #beforeremove} event handler did not return false for it).
	 * 
	 * @method remove
	 * @param {ui.Component/ui.Component[]} cmp A single child {@link ui.Component Component}, or an array of child Components.
	 * @param {Boolean} destroyRemoved (optional) True to automatically destroy the removed component. Defaults to the value of this Container's {@link #destroyRemoved} config.
	 * @return {ui.Component/ui.Component[]} Returns the Component that was removed, or an array of the Components that were removed, depending on
	 *   the type provided to the `cmp` argument.  Single Component removal returns a single Component (or null if the Component was not removed); 
	 *   array removal returns an array of the Components that were successfully removed.
	 */
	remove : function( cmp, destroyRemoved ) {
		var returnVal;
		
		if( Kevlar.isArray( cmp ) ) {
			returnVal = [];
			for( var i = 0, numItems = cmp.length; i < numItems; i++ ) {
				var removedComponent = this.doRemove( cmp[ i ], destroyRemoved );
				if( removedComponent ) {
					returnVal.push( removedComponent );
				} 
			}
			
		} else {
			returnVal = this.doRemove( cmp, destroyRemoved );  // note: will append the component when not specifying the "position" argument
		}
		
		// Refresh the layout
		this.doLayout();
		
		return returnVal;
	},
	
	
	/**
	 * Removes all child Component(s) from this Container.
	 * 
	 * @method removeAll
	 * @param {Boolean} destroyRemoved (optional) True to automatically destroy the removed components. Defaults to the value of this Container's {@link #destroyRemoved} config.
	 */
	removeAll : function( destroyRemoved ) {
		var childComponents = this.childComponents;
		for( var i = childComponents.length-1; i >= 0; i-- ) {
			this.doRemove( childComponents[ i ], destroyRemoved );
		}
		
		// Refresh the layout
		this.doLayout();
	},
	
	
	/**
	 * Removes a child {@link ui.Component Component(s)} from this Container.  If a Component is successfully removed, the 'remove' event will be fired.
	 * Removed {@link ui.Component Components} will automatically have their destroy() method called if the {@link #destroyRemoved} config is true, or
	 * if the `destroyRemoved` argument is explicitly set to true.  If the Component is not destroyed, its main {@link ui.Component.getEl element} is
	 * detached from this Container. 
	 * 
	 * @private
	 * @method doRemove
	 * @param {ui.Component/ui.Component[]} cmp A single child {@link ui.Component Component}, or an array of child Components.
	 * @param {Boolean} destroyRemoved (optional) True to automatically destroy the removed component. Defaults to the value of this Container's {@link #destroyRemoved} config.
	 * @return {ui.Component} The Component that was removed, or null if no Component was removed (i.e. a {@link #beforeremove} 
	 *   event handler returned false, or the Component to be removed was not found).
	 */
	doRemove : function( cmp, destroyRemoved ) {
		var i, len;
		
		// If an array was passed to remove(), remove each one-by-one
		if( Kevlar.isArray( cmp ) ) { 
			for( i = 0, len = cmp.length; i < len; i++ ) {
				this.remove( cmp[ i ], destroyRemoved );
			}
			return;  // array has been processed, return
		}
		
		
		var childComponents = this.childComponents,
			idx = -1;
		
		// default the destroyRemoved argument to the Container's destroyRemoved config if not provided (i.e. undefined)
		destroyRemoved = ( typeof destroyRemoved === 'undefined' ) ? this.destroyRemoved : destroyRemoved;  
		
		// Find the component in this Container
		for( i = 0, len = childComponents.length; i < len; i++ ) {
			if( childComponents[ i ] === cmp ) {
				idx = i;
				break;
			}
		}
		
		// Make sure the component exists in this container before continuing
		if( idx !== -1 ) {
			if( this.fireEvent( 'beforeremove', this, cmp ) !== false ) {
				// Remove the parentContainer reference from the child Component. It was set to this Container when the Component was added.
				cmp.setParentContainer( null );
				
				// First, detach the Component's element. This is done first so that the onRemove() template method, and subscribers of the 'remove'
				// event, can process their code without the element still being in the DOM. This is also done so that if the Component is not being
				// destroyed (destroyRemoved flag is false), that it is still at least removed from the Container's DOM (as a call to destroy() would
				// normally do the same thing).
				if( cmp.rendered ) {
					cmp.getEl().detach();  // detach the Component's element from the Container's element (if it's rendered)
				}
				
				childComponents.splice( idx, 1 );  // remove the Component from the Container's childComponents array
				
				// Run template method, and fire the event
				this.onRemove( cmp, idx );
				this.fireEvent( 'remove', this, cmp, idx );
				
				// Destroy the Component if the destroyRemoved flag is true at this point. Doing this after the remove event so that subscribers can
				// process the removal before the Component is possibly put into a state where say, its data can no longer be retrieved.
				if( destroyRemoved ) {
					cmp.destroy();
				}
				
				return cmp;  // successful removal, return a reference to the removed Component
			}
		}
		
		return null;  // unsuccessful removal, return null
	},
	
	
	/**
	 * Template method that is run when a Component is removed from the Container.
	 * 
	 * @protected
	 * @method onRemove
	 * @param {ui.Component} component The component that was removed.
	 * @param {Number} index The index in this Container's child items array where the Component was removed from.
	 */
	onRemove : Kevlar.emptyFn,
	
	
	
	// ----------------------------------------
	
	// Child Component Accessor Methods
	
	
	/**
	 * Retrieves the child items ({@link ui.Component components}) that are currently held by this Container.
	 *
	 * @method getItems
	 * @return {ui.Component[]}
	 */
	getItems : function() {
		return this.childComponents;
	},
	
	
	/**
	 * Retrieves the child item ({@link ui.Component Component} at the specified `index`. If the 
	 * index is out of range of the child items, this method returns null.
	 * 
	 * @method getItemAt
	 * @param {Number} index
	 * @return {ui.Component} The child item ({@link ui.Component Component}) at the specified index, or null if the index is out of range.
	 */
	getItemAt : function( index ) {
		return this.childComponents[ index ] || null;
	},
	
	
	/**
	 * Retrieves the index of the given child item ({@link ui.Component Component}). Returns -1 if the if the item
	 * is not found.
	 * 
	 * @method getItemIndex
	 * @param {ui.Component} item The item to get the index of.
	 * @return {Number} The index of the item (component), or -1 if it was not found.
	 */
	getItemIndex : function( item ) {
		var childComponents = this.childComponents;
		for( var i = 0, len = childComponents.length; i < len; i++ ) {
			if( childComponents[ i ] === item ) {
				return i;
			}
		}
		return -1;  // item not found
	},
	
	
	/**
	 * Determine if this Container has a given `component` as a direct child component of this Container.
	 *
	 * @method has
	 * @param {ui.Component} component The {@link ui.Component Component} to look for as a child of this Container.
	 * @return {Boolean} True if the Component is found as a direct child of this Container, false otherwise.
	 */
	has : function( component ) {
		return this.getItemIndex( component ) !== -1;
	},
	
	
	
	// ----------------------------------------
	
	
	
	/**
	 * Extension of afterRender (not onRender) used to call the Container's {@link #doLayout} method when the entire
	 * rendering process has been completed.
	 *
	 * @protected
	 * @method afterRender
	 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component has been rendered into.
	 */
	afterRender : function( $containerEl ) {
		// Call superclass afterRender
		ui.Container.superclass.afterRender.apply( this, arguments );
		
		// Run the Container's doLayout, which implements how child components will be laid
		// out within this Container
		this.doLayout();
	},
	
	
	/**
	 * Extension of onShow method used to test if a layout request has been deferred on the Container due
	 * to the Container being hidden at the time.  If a layout request was deferred, {@link #doLayout}
	 * will be run.
	 */
	onShow : function() {
		// Call superclass onShow
		ui.Container.superclass.onShow.apply( this, arguments );
		
		// If a layout has been deferred from a call to doLayout() while this Container was hidden, 
		// we'll run the layout now.
		if( this.deferLayout ) {
			this.doLayout();
		}
		
		// Go through all child Component's, notifying them that they have been shown (if they are not hidden)
		var childComponents = this.childComponents;
		for( var i = 0, len = childComponents.length; i < len; i++ ) {
			var childComponent = childComponents[ i ];
			if( !childComponent.hidden ) {   // check hidden flag, which stores the state that the Component is supposed to be in (not necessarily in depending on the DOM, which isHidden() relies on)
				childComponents[ i ].onShow();
			}
		}
	},
	
	
	
	// ----------------------------------------
	
	// Layout Methods
	
	
	/**
	 * Lays out the Container's child components ({@link #items}) using the configured {@link #layout} strategy object.
	 * If no {@link #layout} has been configured, the default {@link ui.layouts.ContainerLayout} is used.
	 * 
	 * Note that a layout can only be done if the Container is rendered and visible. This method will automatically 
	 * be run when the Container's {@link #render} method runs. If the Container isn' visible when this method is called,
	 * the layout will be deferred until the {@link #show} method is called.
	 *  
	 * @method doLayout
	 */
	doLayout : function() {
		if( !this.canLayout() ) {
			// If the Container is currently hidden, set this flag to true so that
			// when the show() method is run, a layout is triggered.
			this.deferLayout = true;
			
		} else {
			// Make sure the deferLayout flag is false, now that a layout is about to be run
			this.deferLayout = false;
			
			// Run the layout strategy, which will lay the child components out into this Container, 
			// using the layout target returned by the getContentTarget() method.
			this.getLayout().doLayout();
			
			// run the template method after layout has been run, and fire the afterlayout event
			this.onLayout();  
			this.fireEvent( 'afterlayout', this );
		}
	},
	
	
	/**
	 * Template method that is executed after doLayout() has been executed.
	 *
	 * @method onLayout
	 */
	onLayout : Kevlar.emptyFn,
	
	
	/**
	 * Determines if the Container can be laid out at this time. The Container must be rendered, and visible.
	 * It must be visible because for some layouts, especially those that use jQuery UI components or that 
	 * need to calculate the size of elements, we can not lay out their child {@link ui.Component Components} 
	 * when the Container's element is hidden (i.e. no css visibility/display).<br><br>
	 * 
	 * This method is basically used to determine if we can lay the child Components out, and if not, a layout
	 * will be deferred until the Container is shown.  All Containers/Components within a Dialog are a case for 
	 * this, where their child Components are requested to be laid out before the Dialog is shown.
	 * 
	 * @private
	 * @method canLayout
	 * @return {Boolean}
	 */
	canLayout : function() {
		return this.rendered && !this.isHidden();  // not hidden, we can run the layout
	},
	
	
	
	/**
	 * Retrieves the {@link ui.layouts.AbstractLayout Layout} object that the Container is currently
	 * configured to use.  If no {@link #layout} is currently configured for the Container, this method
	 * creates a {@link ui.layouts.ContainerLayout} to use for this Container, and returns that. 
	 * 
	 * @method getLayout
	 */
	getLayout : function() {
		if( !this.layout ) {
			this.setLayout( new ui.layouts.ContainerLayout() );
		}
		return this.layout;
	},
	
	
	/**
	 * Sets a new layout strategy object for the Container. Any previous layout will be detached from
	 * the Container (its container reference set to null).
	 * 
	 * @method setLayout
	 * @param {String/Object/ui.layouts.AbstractLayout} layout See the {@link #layout} config. 
	 */
	setLayout : function( layout ) {
		// Orphan the current layout if we have a new one
		if( this.layout instanceof ui.layouts.AbstractLayout && this.layout !== layout ) {
			this.layout.setContainer( null );  
		}
		
		
		if( layout instanceof ui.layouts.AbstractLayout ) {
			// The new layout is already an AbstractLayout instance
			this.layout = layout;
			layout.setContainer( this );
			
		} else {  
			// The new layout is a string or config object
			var layoutType,
			    layoutConfig = { container: this };
			
			if( typeof layout === 'string' ) {
				layoutType = layout;
				
			} else if( typeof layout === 'object' ) { // config object
				layoutType = layout.type || 'container';   // default to 'container' layout
				layoutConfig = Kevlar.apply( {}, layoutConfig, layout );
				delete layoutConfig.type;  // remove the 'type' property from the config object now, as to not shadow the Layout object's prototype 'type' property when applied
				
			} else {
				// Not a ui.layouts.AbstractLayout, String, or Object...
				throw new Error( "Invalid layout argument provided to setLayout. See method description in docs." );
			}
			
			// Layout types should be case-insensitive
			layoutType = layoutType.toLowerCase();
			
			// Check that the layout type given is a registered layout type
			if( !ui.Container.LAYOUTS[ layoutType ] ) {
				throw new Error( "layout type '" + layoutType + "' is not a registered layout type." );
			}
			
			// Create the layout strategy object if all is well
			this.layout = new ui.Container.LAYOUTS[ layoutType ]( layoutConfig );
		}
	},
	
	
	
	// ----------------------------------------
	
	
	/**
	 * Recursively sets the data for each child {@link ui.Component} which has the {@link ui.DataControl} mixin.  Searches and sets
	 * data at all levels.  Accepts an object literal of keys and values. Ex: <pre><code>setData( { field1: "value1", field2: "value2" } );</code></pre><br><br>
	 * 
	 * Note that this method will not "reach" into a given {@link ui.DataControl} and set data on the "inner" DataControls that the outer DataControl may be composed of.
	 * {@link ui.DataControl DataControls} know how to set their own inner {@link ui.DataControl} components, and those will not be affected by this method.
	 * 
	 * @method setData
	 * @param {Object} data An object (hash) where the object's keys are the data keys, and the values are the data values themselves.
	 */
	setData : function( data ) {
		var dataControls = this.getDataControls();
		for( var i = 0, len = dataControls.length; i < len; i++ ) {
			var dataControl = dataControls[ i ],
			    key = dataControl.getKey();
			    
			if( typeof data[ key ] !== 'undefined' ) {  // If the component's key is defined in the data to set
				dataControl.setData( data[ key ] );
			}
		}
	},
	
	
	/**
	 * Recursively collects the data from all child {@link ui.Component Components} which have the {@link ui.DataControl} mixin.
	 * Searches all levels, and returns the data as an object (hash) keyed by the DataControl's {@link ui.DataControl#key keys}, 
	 * and having their data (the return from the {@link ui.DataControl#getData} method) as the value. Be sure that each DataControl 
	 * has a unique key, or keys may be overwritten in the returned data.<br><br>
	 * 
	 * Note that this method will not "reach" into a given {@link ui.DataControl} and get the data from any "inner" DataControls that the outer DataControl may be composed of.
	 * {@link ui.DataControl DataControls} know how to get and return the data from their own inner {@link ui.DataControl} components, and therefore those will not be retrieved 
	 * directly by this method.
	 * 
	 * @method getData
	 * @return {Object} The collected data as a hash.
	 */
	getData : function() {
		var data = {},
		    dataControls = this.getDataControls();
		
		for( var i = 0, len = dataControls.length; i < len; i++ ) {
			var dataControl = dataControls[ i ],
			    key = dataControl.getKey();
			    
			if( key ) {
				data[ key ] = dataControl.getData();
			}
		}
		return data;
	},
	
	
	/**
	 * Retrieves all {@link ui.DataControl DataControls from the Container at all levels.<br><br>
	 * 
     * Note that this method will not "reach" into a given {@link ui.DataControl} and retrieve the "inner" DataControls that the outer 
     * DataControl may be composed of. Child {@link ui.DataControl DataControls} that are part of the parent {@link ui.DataControl} component 
     * should not (usually) be retrieved as individual {@link ui.DataControl DataControls}.
     * 
	 * @method getDataControls
	 * @return {ui.DataControl[]} An array of the {@link ui.DataControl DataControls} retrieved from the Container.
	 */
	getDataControls : function() {
		var dataControls = [];
		
		this.cascade( function dataControlsCascade( component ) {
			if( Kevlar.isInstanceOf( component, ui.DataControl ) ) {
				dataControls.push( component );
				
				// Return false so we don't recurse into children of the DataControl (if the DataControl is a ui.Container as well).
				// See note in method description.
				return false;
			}
		}, this );
		
		return dataControls;
	},
	
	
	// ----------------------------------------
			
	
	
	/**
	 * Cascades down the Component/Container heirarchy from this Container (called first), calling the specified 
	 * function with each Component. The scope (<i>this</i> reference) of the function call will be the scope provided,
	 * or the current Component that is being processed.  The arguments to the function will be the `args` provided, 
	 * or the current Component.<br><br>
	 * 
	 * If the function returns false at any point, the cascade does not continue down that branch. However, siblings of the Container 
	 * that was being processed when the function returned false are still processed.
	 *
	 * @method cascade
	 * @param {Function} fn The function to call
	 * @param {Object} scope (optional) The scope of the function (defaults to current {@link ui.Component Component})
	 * @param {Array} args (optional) The args to call the function with (defaults to passing in the current {@link ui.Component Component} as the only argument)
	 */
	cascade : function( fn, scope, args ) {
		if( fn.apply( scope || this, args || [this] ) !== false ) {
			var childComponents = this.childComponents;
			if( childComponents.length > 0 ) {
				for( var i = 0, len = childComponents.length; i < len; i++ ) {
					if( childComponents[ i ].cascade ) {
						childComponents[ i ].cascade( fn, scope, args );
					} else {
						fn.apply( scope || childComponents[ i ], args || [ childComponents[ i ] ] );
					}
				}
			}
		}
	},
	
	
	/**
	 * Finds a Component under this container at any level by {@link ui.Component#id id}.
	 *
	 * @method findById
	 * @param {String} id The ID of the Component to search for.
	 * @return {ui.Component} The component with the given `id`, or null if none was found.
	 */
	findById : function( id ) {
		var returnVal = null, 
		    thisContainer = this;
				
		this.cascade( function( component ) {
			if( component !== thisContainer && component.id === id ) {
				returnVal = component;
				return false;
			}
		} );
		return returnVal;
	},
	
	
	/**
	 * Finds a {@link ui.DataControl} under this Container at any level by {@link ui.DataControl#key key}. Note however that this method will not "reach"
	 * into {@link ui.DataControl DataControls} to find any "inner" DataControls that the outer DataControl may be composed of. These {@link ui.DataControl DataControls}
	 * are under the control of the outer {@link ui.DataControl DataControl}, and should not be externally accessible. 
	 *
	 * @method findByKey
	 * @param {String} key The key of the {@link ui.DataControl} to search for.
	 * @return {ui.DataControl} The DataControl with the given `key`, or null if one was not found.
	 */
	findByKey : function( key ) {
		if( !key ) {
			return null;
		}
		
		var returnVal = null, 
		    thisContainer = this,
		    isInstanceOf = Kevlar.isInstanceOf,  // quick reference to method
			DataControlClass = ui.DataControl;   // quick reference to class
				
		this.cascade( function( component ) {
			if( component !== thisContainer && isInstanceOf( component, DataControlClass ) ) {
				if( component.getKey() === key ) {
					returnVal = component;
				}
				
				// Do not "reach" into DataControls and look for their "inner" DataControls. See note in method description.
				return false;
			}
		} );
		return returnVal;
	},
	
	
	/**
	 * Finds a Component under this container at any level by a custom function. If the passed function returns
	 * true, the component will be included in the results.
	 *
	 * @method findBy
	 * @param {Function} fn The function to call. The function will be called with the arguments: (component, this container)
	 * @param {Object} scope (optional) The scope to call the function in. 
	 * @return {ui.Component[]} Array of {@link ui.Component Components}
	 */
	findBy : function( fn, scope ) {
		var returnVal = [], 
		    thisContainer = this;
		
		this.cascade( function( component ) {
			if( component != thisContainer && fn.call( scope || component, component, thisContainer ) === true ) {
				returnVal.push( component );
			}
		} );
		return returnVal;
	},
	
	
	// ----------------------------------------
	
	
	/**
	 * Destroys each child Component in the Container. Called when the Component's destroy() method is called.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		// Destroy all child components
		var childComponents = this.childComponents;
		for( var i = 0, len = childComponents.length; i < len; i++ ) {
			childComponents[ i ].destroy();
		}
		
		// Destroy the Container's layout, if it has one
		if( this.layout instanceof ui.layouts.AbstractLayout ) {
			this.layout.destroy();
		}
		
		ui.Container.superclass.onDestroy.apply( this, arguments );
	}
	
} );


/**
 * @static
 * @private
 * @property LAYOUTS
 * Hash object that stores "registered" layout types. The layouts are in the {@link ui.layout} package, and each
 * specifies a type name that is used to instantiate them.
 * @type Object
 */
ui.Container.LAYOUTS = {};

/**
 * Registers a {@link ui.layouts.AbstractLayout Layout} with the Container class, allowing {@link #layout layouts} 
 * to be specified by their string `typeName`. 
 * 
 * @static
 * @method registerLayout
 * @param {String} typeName The type name for the Layout.
 * @param {Function} layoutClass A ui.layouts.AbstractLayout subclass.
 */
ui.Container.registerLayout = function( typeName, layoutClass ) {
	ui.Container.LAYOUTS[ typeName.toLowerCase() ] = layoutClass;
};


// Register the type so it can be created by the string 'Container' in the manifest
ui.ComponentManager.registerType( 'Container', ui.Container );

/**
 * @class ui.DataControl
 * @extends Kevlar.util.Observable
 * 
 * Generalized class that is intended to be used as a mixin class (pretty much just as an interface) with a {@link ui.Component},
 * that is to be part of the general data-collection routine defined by {@link ui.Container#getData} and {@link ui.Container#setData} methods.
 * 
 * This class itself does not provide any mechanism for data storage, but instead defines the {@link #getData} and {@link #setData} interface
 * that must be implemented by classes that it is mixed with. It also defines the {@link #datachange} event, for generalized handling of changes to
 * a DataControl's data. Subclasses are expected to call the {@link #onDataChange} method when they want this event to be fired.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.DataControl = Kevlar.extend( Kevlar.util.Observable, {
	
	/**
	 * @cfg {String} key
	 * The key to store the data (value) for this DataControl under. When data is collected from Containers using the DataControl,
	 * the key is the property name in the resulting hash.  If the DataControl does not have a key, its data will not be collected. 
	 * See {@link ui.Container#getData}.
	 */
	key: null,
	
	
	constructor : function() {
		// Call observable constructor
		ui.DataControl.superclass.constructor.call( this );
		
		this.addEvents(
			/**
			 * @event datachange
			 * @bubbles
			 * Fires when the data for the DataControl has changed. For performance reasons,
			 * it is up to the subscriber to retrieve the data.
			 * @param {ui.DataControl} dataObject This DataControl instance (the component in which data has changed).
			 */
			/*
			 * *** Comment for if the datachange is ever changed to bubble again. Uncomment "enableBubble" code below for this feature.
			 * 
			 * Note that even though this event bubbles, it has the special behavior of not bubbling up to another DataControl
			 * that is a parent/ancestor of this DataControl. This is to facilitate the building of more complex DataControls,
			 * by allowing them to be composed of one or more child DataControls. External code should not know anything about 
			 * these "inner" DataControls, as they are part of the "outer" DataControl's implementation. The "outer" DataControl 
			 * knows how to retrieve its data, and listen to the events of its "inner" DataControls, and should therefore fire its own
			 * 'datachange' event when it sees fit.  Therefore, the "outer" DataControl should be the only Component that should be 
			 * listened to for its 'datachange' event from external code, not the "inner" ones.
			 * 
			 */
			'datachange'
		);
		
		// Enable bubbling for the datachange event
		// Commented out for now, as this was taken out for performance reasons. However, the performance gain expected by taking
		// this out was not that much, and this feature may be re-enabled at a later date. However, it does involve a lot of function
		// calls as this event bubbles up a big hierarchy, esp with needing to call Kevlar.isInstanceOf() at each parent Container.
		/*this.enableBubble( {
			eventName : 'datachange',
			
			// provide a bubbleFn, which determines if the event should continue to bubble at each level in a hierarchy it hits
			bubbleFn  : function( observableObj ) {
				var bubbleTarget = observableObj.getBubbleTarget();
				
				// If the next component to bubble to in the hierarchy is a ui.DataControl instance, stop bubbling now.
				// See the documentation of the 'datachange' event (above) for details.
				if( Kevlar.isInstanceOf( bubbleTarget, ui.DataControl ) ) {
					return false;
				}
			}
		} );*/
	},
	
	
	/**
	 * Retrieves the key for this field.  Used with data storage.
	 * 
	 * @method getKey
	 * @return {String} This DataControl's key. Returns null if no {@link #key} config was specified.
	 */
	getKey : function() {
		return this.key;
	},
	
	
	/**
	 * Gets the data held by this DataControl. Subclasses are expected to implement this method.
	 *
	 * @abstract
	 * @method getData
	 * @return {Mixed}
	 */
	getData : function() {
		throw new Error( "ui.DataControl::getData() must be implemented in subclass." );
	},
	
	
	/**
	 * Sets the data to be held by this DataControl. Subclasses are expected to implement this method.
	 * 
	 * @abstract
	 * @method setData
	 * @param {Mixed} data The data to set.
	 */
	setData : function( data ) {
		throw new Error( "ui.DataControl::setData() must be implemented in subclass." );
	},
	
	
	/**
	 * Method that is to be run when data has changed in the component. Subclasses are expected
	 * to call this method when data has been updated.
	 * 
	 * @protected
	 * @method onDataChange
	 */
	onDataChange : function() {
		this.fireEvent( 'datachange', this );
	}
	
} );

/**
 * @abstract
 * @class ui.AbstractOverlay
 * @extends ui.Container
 *
 * Base class for UI elements that "float" on top of the document (most notably: {@link ui.Overlay}, and {@link ui.Dialog}).
 * This can be positioned by {@link #x} and {@link #y} values, or positioned relative to other elements using the {@link #anchor}
 * config.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global window, jQuery, Kevlar, ui */
ui.AbstractOverlay = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {Boolean} autoDestroy
	 * True by default, the Overlay is destroyed when it is closed for automatic DOM/memory management. However, if
	 * the Overlay is to be reused between many opens/closes (to avoid the overhead of creating new ones), this can be set 
	 * to false so that it can be re-opened after it is closed.  A call to {@link #destroy} must be done manually however
	 * once the Overlay is no longer needed, to clean up its elements and event handlers (which includes its window resize
	 * handler).  
	 */
	autoDestroy : true,

	
	/**
	 * @cfg {Boolean} autoOpen
	 * Set to true to automatically open the overlay when it is instantiated. If false, a call to {@link #open} is
	 * required to open the overlay.
	 */
	autoOpen : false,
	
	
	/**
	 * @cfg {Boolean} closeOnEscape
	 * True to have the Overlay close when the 'esc' key is pressed. Set to false to disable this behavior.
	 */
	closeOnEscape : true,
	
	
	/**
	 * @cfg {Object} openAnim
	 * A {@link ui.anim.Animation} configuration object to animate the "opening" transition. You do not need to specify
	 * the {@link ui.anim.Animation#target} parameter however, as it will be set to this Overlay.
	 */
	
	/**
	 * @cfg {Object} closeAnim
	 * A {@link ui.anim.Animation} configuration object to animate the "closing" transition. You do not need to specify
	 * the {@link ui.anim.Animation#target} parameter however, as it will be set to this Overlay.
	 */
	
	
	
	// Positioning Configs
	
	/**
	 * @cfg {Object} anchor
	 * An anchoring configuration object, to anchor the overlay to another element on the page.
	 * This is an object with the following properties:
	 * 
	 * @cfg {String} anchor.my
	 *   Where on the overlay itself to position against the target `element`. Accepts a string in the
	 *   form of "horizontal vertical". A single value such as "right" will default to "right center", "top" 
	 *   will default to "center top" (following CSS convention). Acceptable values: "top", "center", "bottom",
	 *   "left", "right". Example: "left top" or "center center".  So, if "left top", the top left of the overlay
	 *   will be positioned to the target `element`. Defaults to "left top".
	 * 
	 * @cfg {String} anchor.at
	 *   Where at the target `element` the overlay should be positioned against. Accepts a string in the
	 *   form of "horizontal vertical". A single value such as "right" will default to "right center", "top" 
	 *   will default to "center top" (following CSS convention). Acceptable values: "top", "center", "bottom",
	 *   "left", "right". Example: "left top" or "center center".  So, if "left bottom", the overlay will be
	 *   positioned against the bottom left of the target `element`. Defaults to "left bottom".
	 * 
	 * @cfg {HTMLElement/jQuery/ui.Component} anchor.of
	 *   The HTMLElement or {@link ui.Component} to anchor the overlay to. Can either be defined as either "of" (following 
	 *   jQuery UI) or "element". Required unless the `element` property is provided.
	 * 
	 * @cfg {HTMLElement/jQuery/ui.Component} [anchor.element]
	 *   Synonym of `of` property, which may replace it where it makes more sense in calling code.
	 * 
	 * @cfg {String} [anchor.offset]
	 *   Adds these left-top values to the calculated position. Ex: "50 50" (left top). A single value
	 *   given in the string will apply to both left and top values.
	 * 
	 * @cfg {String} [anchor.collision]
	 *   When the positioned element overflows the window in some direction, move it to an alternative position. Similar to `my` and `at`, 
	 *   this accepts a single value or a pair for horizontal/vertical, eg. "flip", "fit", "fit flip", "fit none". Defaults to 'flip'.
	 *   
	 *   - __flip__: (the default) to the opposite side and the collision detection is run again to see if it will fit. If it won't fit in either position, the center option should be used as a fall back.
	 *   - __fit__: so the element keeps in the desired direction, but is re-positioned so it fits.
	 *   - __none__: do not do collision detection.
	 */
	
	/**
	 * @cfg {Number/String} x
	 * The initial x position of the Overlay. This can be a number defining how many pixels from the left of the screen,
	 * or one of the strings that the jQuery UI Positioning plugin accepts ('center', 'left', 'right', 'top', 'bottom'). 
	 * This can also be a negative integer, in which case it will be taken as the number of pixels from the right side of 
	 * the screen. Ex: A value of -50 will position the right side of the Overlay 50px from the right side of the screen.<br><br>
	 *
	 * Note that this config will not be used if {@link #anchor} is provided. 
	 */
	
	/**
	 * @cfg {Number/String} y
	 * The initial y position of the Overlay. This can be a number defining how many pixels from the top of the screen,
	 * or one of the strings that the jQuery UI Positioning plugin accepts ('center', 'left', 'right', 'top', 'bottom'). 
	 * This can also be a negative integer, in which case it will be taken as the number of pixels from the bottom of 
	 * the screen. Ex: A value of -50 will position the bottom of the Overlay 50px from the bottom of the screen.<br><br>
	 *
	 * Note that this config will not be used if {@link #anchor} is provided. 
	 */
	
	
	/**
	 * @cfg {Number/String} maxHeight
	 * A maximum height to give the Overlay. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing,
	 * but will be constrained to the browser's viewport.  If a maxHeight is given that is larger than the browser's viewport, then the browser's
	 * viewport height will be preferred. 
	 */
	
	/**
	 * @cfg {Number/String} maxWidth
	 * A maximum width to give the Overlay. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing,
	 * but will be constrained to the browser's viewport.  If a maxWidth is given that is larger than the browser's viewport, then the browser's
	 * viewport width will be preferred.
	 */

	
	
	/**
	 * @hide 
	 * @cfg {jQuery/HTMLElement} renderTo 
	 * This config should not be specified for this subclass. The Overlay will
	 * automatically be rendered into the document body when it is opened. 
	 */
	
	
	/**
	 * @private
	 * @property opened
	 * @type Boolean
	 * Flag that is set to true when the Overlay is opened. Is set to false when the Overlay is closed. Note that this
	 * is set to true immediately when the Overlay is opened (even while it is {@link #opening}), and set to false immediately
	 * when the Overlay is closed (even while it is {@link #closing}). This is for the fact that even if the Overlay is opening,
	 * it is already shown, and therefore considered opened.
	 */
	opened : false,
	
	/**
	 * @private
	 * @property opening
	 * @type Boolean
	 * Flag that is set to true while the Overlay is opening (i.e. its {@link #openAnim} animation is running). It is set to false
	 * when the Overlay has fully opened.
	 */
	opening : false,
	
	/**
	 * @private
	 * @property closing
	 * @type Boolean
	 * Flag that is set to true when the Overlay is closing (i.e. its {@link #closeAnim} animation is running). It is set to false
	 * when the Overlay has fully closed.
	 */
	closing : false,
	
	/**
	 * @private
	 * @property currentAnimation
	 * @type ui.anim.Animation
	 * The currently running open or close animation (see {@link #openAnim}/{@link #closeAnim}), if any. Will be null if the Overlay 
	 * is not currently in the process of opening or closing.
	 */
	currentAnimation : null,
	
	/**
	 * @private
	 * @property $contentContainer
	 * @type jQuery
	 * The inner overlay container, where either content HTML or child {@link ui.Component Components} are added.
	 */
	
	/**
	 * @private
	 * @property windowResizeHandler
	 * @type Function
	 * The scope wrapped function for handling window resizes (which calls the method to resize the overlay accordingly).
	 * This is needed as a property so that we can unbind the window's resize event from the Overlay when the Overlay
	 * is destroyed. 
	 */
	
	
	
	// protected
	initComponent : function() {
		// Call superclass initComponent
		ui.AbstractOverlay.superclass.initComponent.call( this );
		
		
		this.addEvents(
			/**
			 * Fires before the Overlay is opened. Handlers of this event may cancel
			 * the opening of the Overlay by returning false. 
			 * 
			 * @event beforeopen
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'beforeopen',
			
			/**
			 * Fires when the Overlay has opened, or if an {@link #openAnim} config was provided, has <b>started</b> to open.
			 * To find out when an {@link #openAnim} animation has finished, listen to the {@link #opencomplete} event.<br><br>
			 * 
			 * Note that this event fires as soon as the Overlay is starting to open because handlers most likely expect to do something 
			 * with the Overlay immediately, before an animation is run on it. So for handlers of Overlays that first don't have 
			 * any {@link #openAnim}, and then are given one, they will still work as expected (as opposed to the behavior of if this event 
			 * fired at the end of the animation).
			 * 
			 * @event open
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'open',
			
			/**
			 * An alias of the {@link #open} event, which can make handler-adding code more consistent and clear. 
			 * Having a 'begin' event for 'open' maintains consistency with {@link #closebegin}.
			 * 
			 * @event openbegin
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'openbegin',
			
			/**
			 * Fires when the overlay has fully opened, after an {@link #openAnim} animation has finished. Note that this 
			 * event will fire regardless of if an {@link #openAnim} config was provided or not.<br><br>
			 * 
			 * @event opencomplete
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'opencomplete',
			
			/**
			 * Fires just before the Overlay would be closed due to the Overlay "losing focus" (i.e.
			 * a click was made in the document outside of the overlay. This fires before the {@link #beforeclose}
			 * event, and handlers of this event may cancel the closing of the Overlay by returning false.
			 * 
			 * @event beforeblurclose
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 * @param {jQuery.Event} evt The click event on the document, outside of the Overlay's elements.
			 */
			'beforeblurclose',
			
			/**
			 * Fires before the Overlay is closed. Handlers of this event may cancel
			 * the closing of the Overlay by returning false. 
			 * 
			 * @event beforeclose
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'beforeclose',
			
			/**
			 * Fires when the overlay is beginning to close. This event is useful if a {@link #closeAnim} is specified,
			 * as it fires just before the animation starts. The {@link #close} event will fire when the animation is complete,
			 * and the Overlay has completely closed. Note that this event will fire regardless of if a {@link #closeAnim} config
			 * is provided or not.<br><br>
			 * 
			 * For the reason that this event is 'closebegin' instead of making an 'closecomplete' (to be consistent with
			 * 'opencomplete'), see the note in the {@link #close} event. 
			 * 
			 * @event closebegin
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'closebegin',
			
			/**
			 * Fires when the Overlay has closed, or if a {@link #closeAnim} config was provided, has <b>finished</b> closing.
			 * To find out when a {@link #closeAnim} animation has started, listen to the {@link #closebegin} event.<br><br>
			 * 
			 * Note that this event fires only after the Overlay has fully closed because handlers most likely expect to do something 
			 * after the Overlay is hidden from the DOM. So for handlers of Overlays that first don't have any {@link #closeAnim}, and 
			 * then are given one, they will still work as expected (as opposed to the behavior of if this event fired at the start
			 * of the animation).
			 * 
			 * @event close
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'close',
			
			/**
			 * An alias of the {@link #close} event, which can make handler-adding code more consistent and clear. 
			 * Having a 'complete' event for 'close' maintains consistency with {@link #opencomplete}.
			 * 
			 * @event closecomplete
			 * @param {ui.AbstractOverlay} overlay This Overlay instance.
			 */
			'closecomplete'
		);
		
		
		// If the autoOpen config has been set to true, open the overlay immediately
		if( this.autoOpen ) {
			this.open();
		}
	},
	
	
	/**
	 * Extension of onRender which is used to create Overlay and its inner overlay content.
	 * 
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		ui.AbstractOverlay.superclass.onRender.apply( this, arguments );
		
		
		// Create the content div container, which will hold the overlay's HTML or child components.
		// This is a separate container so that the "arrow" can be appended inside the same overlay 
		// container (in ui.Overlay), and is also for an extra layer of styling.
		this.$contentContainer = jQuery( '<div class="ui-overlay-content" />' ).appendTo( this.$el );
		
		
		// ------------------------------------------------
		
		
		// If the closeOnEscape config is true, set up a keydown event for it to close the overlay.
		if( this.closeOnEscape ) {
			this.$el.keydown( function( evt ) {
				if( evt.keyCode === jQuery.ui.keyCode.ESCAPE ) {
					this.close();
				}
			}.createDelegate( this ) );
		}
		
		
		// ------------------------------------------------
		
		
		// Set up an event handler for the window's resize event, to re-size and re-position the overlay based on the
		// new viewport's size.  The handler for this event is "buffered" just a little, so that the many resize events 
		// that get fired while a window is being dragged don't cause the resize calculations to run each and every time. 
		// Need to store the resize handler itself so that we can unbind it in the destroy() method when the Overlay is destroyed.
		var delayedTask = new Kevlar.util.DelayedTask( function() { this.onWindowResize(); }, this );
		this.windowResizeHandler = function() {	delayedTask.delay( 150 ); };
		jQuery( window ).bind( 'resize', this.windowResizeHandler );
	},
	
	
	/**
	 * Retrieves the element that should be the target for the Component's content (html) or child components.  For this subclass, 
	 * this is the {@link #$contentContainer}.
	 * 
	 * @method getContentTarget
	 * @return {jQuery} The element (jQuery wrapped set) where HTML content or child components should be placed.
	 */
	getContentTarget : function() {
		return this.$contentContainer;	
	},
	
	
	// -----------------------------
	
	
	
	/**
	 * Opens the Overlay, rendering it if it has not yet been rendered. The overlay is rendered here
	 * so all Components can be added to it first before rendering it.
	 * 
	 * @method open
	 * @param {Object} [options] An object which may contain the following properties. Note that providing any
	 *   properties that are configuration options will overwrite those configuration options of the same name.
	 * @param {Object} [options.anchor] An {@link #anchor} config to set on the call to open. Note that subsequent calls to
	 *   open() will use this config unless changed by a call to {@link #setAnchor}.
	 * @param {Number/String} [options.x] An {@link #x} config to set on the call to open. Note that subsequent calls to open() 
	 *   will use this config unless changed by a call to {@link #setPosition}. See {@link #x} for more details. Note that 
	 *   providing an `anchor` will override this value.
	 * @param {Number/String} [options.y] A {@link #y} config to set on the call to open. Note that subsequent calls to open() 
	 *   will use this config unless changed by a call to {@link #setPosition}.  See {@link #y} for more details. Note that 
	 *   providing an `anchor` will override this value.
	 * @param {Boolean} [options.animate] True by default, set to false to skip any {@link #openAnim} that is defined from running 
	 *   its animation (on this call to `open()` only).
	 */
	open : function( options ) {
		options = options || {};
		if( typeof options.animate === 'undefined' ) {
			options.animate = true;
		}
		
		// If the Overlay is currently in the process of being animated closed when the call to this method is made, finish it up
		// so we can open it again.
		if( this.closing ) {
			this.currentAnimation.end();  // ends the "closing" animation, and runs closeComplete()
		}
		
		// if the overlay isn't opened already, and a beforeopen handler doesn't return false
		if( !this.opened && this.fireEvent( 'beforeopen', this ) !== false ) {
			this.opened = true;
			this.opening = true;  // will only be true while any 'openAnim' animation is running
			
			// If the overlay has not been rendered yet, render it now to the document body
			if( !this.rendered ) {
				this.render( document.body );
			}
			
			// Call the show() method of the Component superclass when the Overlay is opened, so that the onShow() hook method runs, and the 'show' event fires. 
			// Note that this should be done before setting the Overlay's position, as that relies on the Overlay's inner content. 
			this.show();
			
			
			// Call hook method
			this.onBeforeOpen( options );
			
			// ---------------------------------
			
			
			// Set any of the config options provided as the options to this method
						
			// Position the overlay now that it is shown. If new positioning information was provided, use that.
			// Otherwise, position based on the last set values.
			if( options.anchor ) {
				this.setAnchor( options.anchor );
				
			} else if( options.hasOwnProperty( 'x' ) || options.hasOwnProperty( 'y' ) ) {
				var x = ( typeof options.x !== 'undefined' ) ? options.x : this.x;  // if one was provided, but not the other,
				var y = ( typeof options.y !== 'undefined' ) ? options.y : this.y;  // use the current value for the other
				this.setPosition( x, y );
				
			} else {
				// No new anchor or x/y configs provided in the call to this method, position the Overlay based on any pre-configured values
				this.updatePosition();
			}
			
			
			// ---------------------------------
			
			// Run hook method, and fire the 'open' event, before any animation is run. See the 'open' and the 'opencomplete'
			// event description for details on why this is done now, and not when the open animation (if any) is complete.
			this.onOpen();
			this.fireEvent( 'openbegin', this );
			this.fireEvent( 'open', this );
			
			// If an open animation was specified, run that now. Otherwise, call the 'openComplete' method immediately.
			if( this.openAnim && options.animate ) {  // note: options.animate is true by default
				var animConfig = Kevlar.apply( {}, { target: this }, this.openAnim );  // the 'openAnim' config provides defaults. We specify the target explicitly.
				
				this.currentAnimation = new ui.anim.Animation( animConfig );    
				this.currentAnimation.addListener( 'afteranimate', this.openComplete, this );  // adding a listener instead of providing in config, in case there is already a listener in the config
				this.currentAnimation.start();
			} else {
				this.openComplete();
			}
		}
	},
	
	
	/**
	 * Hook method that is run before the Overlay has been opened (before any {@link #openAnim} has started).
	 * 
	 * @protected
	 * @method onBeforeOpen
	 * @param {Object} options The options object provided to the {@link #open} method.
	 */
	onBeforeOpen : Kevlar.emptyFn,
	
	
	/**
	 * Private method that is run when the Overlay has fully opened. This may be delayed from the call to {@link #open} if an 
	 * {@link #openAnim} config exists, or may be called immediately if not. Sets private properties to the state they should
	 * be in when the Overlay has fully opened.
	 * 
	 * @private
	 * @method openComplete
	 */
	openComplete : function() {
		this.opening = false;
		this.currentAnimation = null;  // remove the reference to the "opening" animation
		
		this.fireEvent( 'opencomplete', this );
	},
	
	
	/**
	 * Hook method that is run when the Overlay has been opened, after any {@link #openAnim} has completed.
	 * 
	 * @protected
	 * @method onOpen
	 */
	onOpen : Kevlar.emptyFn,
	
	
	/**
	 * Determines if this Overlay is currently open, or in the process of opening (with an {@link #openAnim}. 
	 * If the overlay is currently closing (with a {@link #closeAnim}, it will <b>not</b> be considered open. 
	 * 
	 * @method isOpen
	 * @return {Boolean} True if the Overlay is open, or in the process of opening. Returns false otherwise.
	 */
	isOpen : function() {
		return this.opened;
	},
	
	
	/**
	 * Retrieves the height of the Overlay itself. The Overlay must be open for this calculation.
	 * 
	 * @method getHeight
	 * @return {Number} The height of the Overlay if it is open, or 0 if it is not.
	 */
	getHeight : function() {
		if( this.isOpen() ) {
			return this.$el.outerHeight();
		} else {
			return 0;
		}
	},
	
	
	/**
	 * Retrieves the width of the Dialog itself. The dialog must be open for this calculation.
	 * 
	 * @method getWidth
	 * @return {Number} The width of the Dialog if it is open, or 0 if it is not.
	 */
	getWidth : function() {
		if( this.isOpen() ) {
			return this.$el.outerWidth();
		} else {
			return 0;
		}
	},
	
	
	/**
	 * Sets the position of the Overlay (more specifically, the {@link #x} and {@link #y} configs), and refreshes the Overlay's 
	 * position (if it is currently open). Note: by running this method, any {@link #anchor} config is nulled out.
	 * 
	 * @method setPosition
	 * @param {Number/String} x The new x position of the Overlay. See the {@link #x} config for details.
	 * @param {Number/String} y The new y position of the Overlay. See the {@link #y} config for details.
	 */
	setPosition : function( x, y ) {
		// Store the variables in case the dialog is not yet open, and for later use if the browser window is resized.
		// (This is mainly needed for when this method is called externally, and not from within the Overlay.)
		this.x = x;
		this.y = y;
		
		// Make sure there is no 'anchor' if we want x/y positioning
		this.anchor = null;
		
		this.updatePosition();	
	},
	
	
	/**
	 * Sets the {@link #anchor} config, and refreshes the Overlay's position (if it is currently open).
	 * 
	 * @method setAnchor
	 * @param {Object} anchor See the {@link #anchor} config for details.
	 */
	setAnchor : function( anchor ) {
		this.anchor = anchor;
		this.updatePosition();
	},
	
	
	/**
	 * Resets the position of the Overlay to match the {@link #anchor} config if one exists, or otherwise uses the
	 * {@link #x} and {@link #y} configs.
	 * 
	 * @private
	 * @method updatePosition
	 */
	updatePosition : function() {
		if( this.isOpen() ) {  
			var my, at, of, offset, collision,
			    $el = this.$el;
			 
			if( this.anchor ) {
				// Anchor config provided, or set with setAnchor(), use that
			    var anchor = this.anchor;
			    
				my = anchor.my || 'left top';
				at = anchor.at || 'left bottom';
			    of = anchor.element || anchor.of;  // accept either 'element' or 'of' from the anchor config
				offset = anchor.offset;
				collision = anchor.collision || 'flip';  // even though this seems to be the default 'collision' value in jQuery UI, we need this default value for a later if statement to check if 'flip' was used (as a short circuit to checking the classes on the element itself)
				
				// Handle the anchor element being a ui.Component, by grabbing the Component's DOM element
				if( of instanceof ui.Component ) {
					of = of.getEl();
				}
				
			} else {
				// no 'anchor' config provided, use x/y relative to the document body
				var xSide = ( this.x > 0 ) ? 'left' : 'right';  // Position from right if this.x < 0
				var ySide = ( this.y > 0 ) ? 'top' : 'bottom';  // Position from bottom if this.y < 0
				my = at = xSide + ' ' + ySide;
				of = document.body;
				offset = this.x + ' ' + this.y;
			}
			
			// Position the Overlay
			$el.position( {
				my: my,
				at: at,
				of: of,
				offset: offset,
				collision: collision
			} );
			
			// Check if there was a collision with the window
			this.checkCollision();
		}
	},
	
	
	/**
	 * Checks if the Overlay has collided with the window in some way. If so, calls the {@link #onCollision} method
	 * with information about the collision.
	 * 
	 * @private
	 * @method checkCollision
	 */
	checkCollision : function() {
		var anchor = this.anchor;
		if( anchor ) {
			var collision = anchor.collision || 'flip';   // "flip" is the default for jQuery UI's position utility, so if it has not been specified, that is what was used
			if( collision.indexOf( 'flip' ) > -1 ) {
				var cssClass = this.$el.attr( 'class' );
				
				if( /(^| )ui-flipped-(top|bottom|left|right)( |$)/.test( cssClass ) ) {
					this.onCollision( 'flip', {
						top    : /(^| )ui-flipped-bottom( |$)/.test( cssClass ),  // these are opposites,
						bottom : /(^| )ui-flipped-top( |$)/.test( cssClass ),     // as the position it was flipped
						left   : /(^| )ui-flipped-right( |$)/.test( cssClass ),   // to is the opposite position
						right  : /(^| )ui-flipped-left( |$)/.test( cssClass )     // it collided with the window
					} );
				}
			}
		}
	},
	
	
	/**
	 * Hook method that is executed after the Overlay has been positioned using the {@link #anchor} config, but
	 * has collided with the window boundaries in some direction. This implementation reverses any {@link #anchor}
	 * `offset` when flipped. 
	 * 
	 * @protected
	 * @method onCollision
	 * @param {String} collisionType The value of the `collision` option of the {@link #anchor} config.
	 * 
	 * @param {Object} collisionDirections An object (hash) of where the Overlay collided with the window. Has properties:
	 * @param {Boolean} collisionDirections.top True if the Overlay collided with the top of the window, false otherwise.
	 * @param {Boolean} collisionDirections.bottom True if the Overlay collided with the bottom of the window, false otherwise.
	 * @param {Boolean} collisionDirections.left True if the Overlay collided with the left side of the window, false otherwise.
	 * @param {Boolean} collisionDirections.right True if the Overlay collided with the right side of the window, false otherwise.
	 */
	onCollision : function( collisionType, collisionDirections ) {
		/* Not sure we need all of this code... jQuery UI might take care of it after all
		var anchor = this.anchor;
		if( collisionType === 'flip' && anchor && anchor.offset ) {
			// Reverse the offsets of the anchor in the appropriate direction, if it had offsets
			var offsets = anchor.offset.split( ' ' ),   // will make an array of 'left' and 'top' offsets (unless there is only one value, which will be normalized next)
			    newXOffset = 0, newYOffset = 0;
			    
			// Normalize the 'offsets' if only one value was provided
			if( offsets.length === 1 ) {
				offsets[ 1 ] = offsets[ 0 ];
			}
			
			if( collisionDirections.left || collisionDirections.right ) {
				newXOffset = ( -1 * +offsets[ 0 ] );  // apply the offset on the opposite side of where it was going originally (before the collision)
			}
			if( collisionDirections.top || collisionDirections.bottom ) {
				newYOffset = ( -1 * +offsets[ 1 ] );  // apply the offset on the opposite side of where it was going originally (before the collision)
			}
			
			if( newXOffset !== 0 || newYOffset !== 0 ) {
				this.$el.css( {
					left : ( parseInt( this.$el.css( 'left' ), 10 ) + newXOffset ) + 'px',
					top  : ( parseInt( this.$el.css( 'top' ), 10 ) + newYOffset ) + 'px'
				} );
			}
		}*/
	},
	
	
	
	/**
	 * Event handler for the browser window's resize event, in which the Overlay is re-positioned.
	 * 
	 * @private
	 * @method onWindowResize
	 */
	onWindowResize : function() {
		this.updatePosition();
	},
	
	
	/**
	 * Closes the overlay.
	 * 
	 * @method close
	 * @param {Object} options (optional) An object which may contain the following properties:
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li>
	 *       <b>animate</b> : Boolean
	 *       <div class="sub-desc">
	 *         True by default, set to false to skip any {@link #closeAnim} that is defined from running its animation (on this call to `close()` only).
	 *       </div>
	 *     </li>
	 *   </ul>
	 * </div>
	 */
	close : function( options ) {
		options = options || {};
		if( typeof options.animate === 'undefined' ) {
			options.animate = true;
		}
		
		if( this.opening ) {
			this.currentAnimation.end();  // ends the "opening" animation, and runs openComplete()
		}
		
		// If the Overlay is open, and is not currently in the process of closing, close it now.
		if( this.opened && !this.closing && this.fireEvent( 'beforeclose', this ) !== false ) {
			this.opened = false;
			this.closing = true;  // will only be true while any openAnim animation is running
			
			// Call hook method
			this.onBeforeClose( options );
			
			this.fireEvent( 'closebegin', this );
			
			// If a close animation was specified, run that now. Otherwise, call the 'closeCompleteCallback' immediately.
			if( this.closeAnim && options.animate ) {  // note: options.animate is true by default
				var animConfig = Kevlar.apply( {}, { target: this }, this.closeAnim );
				
				this.currentAnimation = new ui.anim.Animation( animConfig );
				this.currentAnimation.addListener( 'afteranimate', this.closeComplete, this );  // adding a listener instead of providing in config, in case there is already a listener in the config
				this.currentAnimation.start();
			} else {
				this.closeComplete();
			}
		}
	},
	
	
	/**
	 * Hook method that is run just before the Overlay is to be closed (before any {@link #closeAnim} has started).
	 * 
	 * @protected
	 * @method onBeforeClose
	 * @param {Object} options The options object provided to the {@link #close} method.
	 */
	onBeforeClose : Kevlar.emptyFn,
	
	
	/**
	 * Private method that is run when the Overlay has fully closed. This may be delayed from the call to {@link #close} if a 
	 * {@link #closeAnim} config exists, or may be called immediately if not. Hides the Overlay (if it is not already hidden),
	 * runs the {@link #onClose} hook method, and fires the {@link #close} event. If the {@link #autoDestroy} config is true,
	 * destroys the Overlay as well.
	 * 
	 * @private
	 * @method closeComplete
	 */
	closeComplete : function() {
		this.closing = false;
		this.currentAnimation = null;  // remove the reference to the "closing" animation
		
		this.hide();
		
		// Run hook method, and fire the 'close' event
		this.onClose();  
		this.fireEvent( 'close', this );
		this.fireEvent( 'closecomplete', this );
		
		// Destroy this Overlay when closed for DOM/memory management, if the autoDestroy config is true
		if( this.autoDestroy ) {
			this.destroy();
		}
	},
	
	
	
	/**
	 * Hook method that is run when the Overlay has been closed (after any {@link #closeAnim} has completed).
	 * 
	 * @protected
	 * @method onClose
	 */
	onClose : Kevlar.emptyFn,
	
	
	// protected
	onDestroy : function() {
		// Make sure the Overlay is closed, and all of that functionality has run, before destroying the overlay. 
		if( this.isOpen() ) {
			this.close( { animate: false } );
		}
		
		// unbind our window resize handler
		jQuery( window ).unbind( 'resize', this.windowResizeHandler );
		this.windowResizeHandler = null;
		
		ui.AbstractOverlay.superclass.onDestroy.apply( this, arguments );
	}

} );

/**
 * @class ui.Button
 * @extends ui.Component
 * 
 * A generic button class (which is a wrapper for a jQuery UI button) that calls its {@link #handler} when clicked.  
 * This Component's element (see {@link ui.Component#getEl}) becomes the jQuery UI button itself.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.Button = Kevlar.extend( ui.Component, {
	
	/**
	 * @cfg {String} primaryIcon
	 * The css class name for the icon to show on the left side of the button. Defaults to undefined, for no icon. 
	 */
	
	/**
	 * @cfg {String} secondaryIcon
	 * The css class name for the icon to show on the right side of the button. Defaults to undefined, for no icon.
	 */
	
	/**
	 * @cfg {String} iconSrc
	 * The src (url) of an icon to place into the button, using an img tag. It is preferred to use the {@link #primaryIcon}
	 * config when possible however. Defaults to an empty string, which will place no icon into the button.
	 */
	iconSrc : "",
	
	/**
	 * @cfg {String} text 
	 * The text for the button.
	 */
	text : "",

	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element.
	 */
	tooltip: "",
	
	/**
	 * @cfg {String} priority
	 * The button's visual priority in a group of buttons. Valid values are: "primary", "normal", and "secondary",
	 * which are ordered here in order of button importance.
	 */
	priority : "normal",
	 
	/**
	 * @cfg {Function} handler
	 * A function to run when the button is clicked. 
	 */
	
	/**
	 * @cfg {Object} scope
	 * The scope to run the {@link #handler} function in. Defaults to the ui.Button object.
	 */
	
	/**
	 * @cfg {Boolean} disabled
	 * Set to true to have the button be initially disabled.
	 */
	disabled : false,
	
	/**
	 * @cfg {Boolean} removeHoverStateOnClick
	 * True to have the button remove its "hover" state (the 'ui-state-hover' css class) when it is clicked.  This is useful
	 * for buttons like the 'up' and 'down' buttons in the ListManager bit, where their parent DOM elements are moved when 
	 * they are clicked, and their ui-state-hover css class is not removed because the 'mouseleave' event never fires.
	 */
	removeHoverStateOnClick : false,
	
	
	
	// Component config
	elType : 'button',
	
	
	initComponent : function() {
		// Call superclass initComponent
		ui.Button.superclass.initComponent.call( this );
		
		
		// Create the events that this class will fire
		this.addEvents(
			/**
			 * @event click
			 * Fires when the button has been clicked.
			 * @param {ui.Button} button This ui.Button instance.
			 */
			'click',
			
			/**
			 * @event mouseenter
			 * Fires when the mouse has entered (hovered over) the button. Equivalent to the jQuery mouseenter event.
			 * @param {ui.Button} button This ui.Button instance.
			 */
			'mouseenter',
			
			/**
			 * @event mouseleave
			 * Fires when the mouse has left (no longer hovered over) the button. Equivalent to the jQuery mouseleave event.
			 * @param {ui.Button} button This ui.Button instance.
			 */
			'mouseleave'
		);
		
		
		// Backward compatibility: The button's text was specified with the label config, but I am thinking that at some point, buttons
		// may be placed elsewhere where they can have a label in front of it (like the form fields), so I'm changing the property for the
		// button's text it to 'text'.
		if( this.label ) {
			this.text = this.label;
			delete this.label;
		}
			
				
		// Backward compatibility: manifests can specify an onClick function, which would shadow the prototype onClick function. 
		// Setting it to the handler config, and deleting it to unshadow the prototype's onClick.
		if( this.hasOwnProperty( 'onClick' ) ) {
			this.handler = this.onClick;
			delete this.onClick;  // delete the provided onClick to un-shadow the prototype's onClick
		}
	},
	
	
	/**
	 * Extended onRender method which implements the creation and placement of the button itself.
	 * 
	 * @protected
	 * @method onRender
	 * @param {jQuery} $containerEl
	 */
	onRender : function( $containerEl ) { 
		// Call superclass onRender() first, to render this Component's element
		ui.Button.superclass.onRender.apply( this, arguments );
				
		// Append the text to the button element before making a jQuery UI button out of it.
		if( this.text ) {  
			this.$el.append( this.text );
		}

		// Add the title attribute, which acts as its tooltip
		if( this.tooltip ) {
			this.$el.attr( 'title', this.tooltip );
		}
		
		
		// Create the jQuery UI button itself out of the Component's element
		var buttonConfig = {
			icons    : { primary: null, secondary: null },  // default for icons
			text     : ( this.text !== "" ) ? true : false,
			disabled : this.disabled
		};
		if( this.primaryIcon ) {
			buttonConfig.icons.primary = this.primaryIcon;
		}
		if( this.secondaryIcon ) {
			buttonConfig.icons.secondary = this.secondaryIcon;
		}
		
		this.$el.button( buttonConfig );  // jQuery UI Button
		if( this.priority === 'primary' ) {
			this.$el.addClass( 'ui-priority-primary' );
		} else if( this.priority === 'secondary' ) {
			this.$el.addClass( 'ui-priority-secondary' );
		}
		
		// If an icon src (url) was specified, add it as an image before the button's text
		if( this.iconSrc ) {
			var $img = jQuery( '<img src="' + this.iconSrc + '" style="margin-right: 5px; vertical-align: middle;" />' );
			this.$el.find( 'span' ).prepend( $img );  // jQuery UI Button creates a span element for the button's content
		}
		
		
		// Add Event Handlers
		this.$el.bind( {
			mouseenter : this.onMouseEnter.createDelegate( this ),
			mouseleave : this.onMouseLeave.createDelegate( this ),
			click      : this.onClick.createDelegate( this )
		} );
	},
	
	
	/**
	 * Sets the text on the button. Accepts HTML as well.
	 * 
	 * @method setText
	 * @param {String} text
	 */
	setText : function( text ) {
		if( !this.rendered ) {
			this.text = text;
		} else {
			// Update the span element that the jQuery UI Button creates for the button's content
			this.$el.find( 'span' ).empty().append( text );
		}
	},
	
	
	/**
	 * Disables the button.
	 * 
	 * @method disable
	 */
	disable : function() {
		if( !this.rendered ) {
			this.disabled = true;
		} else {
			this.$el.button( 'disable' );
		}
	},
	
	
	/**
	 * Enables the button (if it was previously disabled).
	 * 
	 * @method enable
	 */
	enable : function() {
		if( !this.rendered ) {
			this.disabled = false;
		} else {
			this.$el.button( 'enable' );
		}
	},
	
	
	/**
	 * Method for handling a click to the button.
	 * 
	 * @protected
	 * @method onClick
	 */
	onClick : function() {
		// If the "remove hover state on-click" config is true, remove the button's 'ui-state-hover' css class.
		// This is useful for when the 'mouseleave' event doesn't fire on a button (usually when its parent DOM 
		// container has been moved), and we need the hover state to be removed in this case.
		if( this.removeHoverStateOnClick ) {
			this.$el.removeClass( 'ui-state-hover' );
		}
		
		if( typeof this.handler === 'function' ) {
			this.handler.call( this.scope || this, this );  // run the handler in the scope of this Button if no scope config was provided, and provide this button instasnce as the first arg
		}
		
		this.fireEvent( 'click', this );
	},
	
	
	/**
	 * Method that is run when mouse hovers over the button.
	 * 
	 * @protected
	 * @method onMouseEnter
	 */
	onMouseEnter : function() {
		this.fireEvent( 'mouseenter', this );
	},
	
	
	/**
	 * Method that is run when mouse un-hovers the button.
	 * 
	 * @protected
	 * @method onMouseLeave
	 */
	onMouseLeave : function() {
		this.fireEvent( 'mouseleave', this );
	}
	
	
} );


// Register the type so it can be created by the string 'Button' in the manifest
// For backward compatibility, register the 'ChoiceButton' type as well
ui.ComponentManager.registerType( 'Button', ui.Button );  
ui.ComponentManager.registerType( 'ChoiceButton', ui.Button );  

/**
 * @abstract
 * @class ui.formFields.AbstractField
 * @extends ui.Component
 * @mixin ui.DataControl
 *  
 * Abstract base class for form fields, which lays out a label, a container for form field(s), and a container
 * for help text, while also providing the base functionality validation and other common field related tasks.
 */
/*global Kevlar, ui */
ui.formFields.AbstractField = Kevlar.extend( ui.Component, [ ui.DataControl ], {
	
	/**
	 * @cfg {String} inputId 
	 * The id that should be used for the Component's input element. The label element (if {@link #label} is specified) will be created 
	 * with a `for` attribute with this id.  Defaults to a uniquely generated id.
	 */
	
	/**
	 * @cfg {String} inputName
	 * The name to give the input. This will be set as the input's "name" attribute.  This is really only useful if
	 * the form that the component exists in is going to be submitted by a standard form submission (as opposed to just
	 * having its values retrieved, which are handled elsewhere). Defaults to the value of the 
	 * {@link #inputId} config.
	 */
	
	/**
	 * @cfg {String} label 
	 * The field's label. If empty, no space will be reserved for the field's label. Defaults to an empty string.  If 
	 * it is required that the label space be reserved, but should look empty, set to a non-breaking space (&amp;nbsp;)<br><br>
	 * 
	 * Note that setting the label at a later time using {@link #setLabel} will re-reserve the necessary label space
	 * if the label was originally empty.
	 */
	label : "",
	
	/**
	 * @cfg {String} labelPosition
	 * A string that specifies where the field's label should be placed. Valid values are:
	 * "left" and "top". Defaults to 'left'.
	 */
	labelPosition : 'left',
	
	/**
	 * @cfg {String} labelWidth
	 * A string specifying the percentage (with the trailing '%' sign) of how wide the label should be in relation to the rest
	 * of the field.  This is only valid if the {@link #labelPosition} config is set to 'left'. Defaults to "19%".<br><br>
	 * 
	 * Note that this must currently be a percentage because of limitations with div elements.  A future implementation
	 * may incorporate calculations to allow this config to be a number (specifying the number of pixels).
	 */
	labelWidth : '19%',
	
	/**
	 * @cfg {String} help 
	 * A help tip explaining the field to the user, which gets placed below the {@link #$inputContainerEl}. Defaults to an empty string.
	 */
	help : "",
	
	/** 
	 * @cfg {Function} validator 
	 * The function to use to validate the field. Function should return true if the field validates, false if it does not.
	 */
		
	/**
	 * @cfg {Mixed} value
	 * The initial value for the field, if any. If this is a function, the function will be executed and its return value used for the value.
	 */
	 
	
	/**
	 * The &lt;label&gt; element that gets filled with the label text.  Set HTML content to this element with {@link #setLabel},
	 * or retrieve the element itself for any custom implementation with {@link #getLabelEl}.
	 *
	 * @protected
	 * @property $labelEl
	 * @type jQuery
	 */
	
	/**
	 * The &lt;div&gt; element that wraps the input field.  Retrieve this element for any custom implementation 
	 * with {@link #getInputContainerEl}.
	 *
	 * @protected
	 * @property $inputContainerEl
	 * @type jQuery
	 */
	
	/**
	 * The &lt;div&gt; element that wraps the help text.  Set HTML content to this element with {@link #setHelp},
	 * or retrieve the element itself for any custom implementation with {@link #getHelpEl}.
	 *
	 * @protected
	 * @property $helpEl
	 * @type jQuery
	 */
	
	/**
	 * Stores the value that last fired the {@link #datachange} event (using the {@link #onDataChange} method). This is a workaround
	 * for {@link ui.formFields.TextField TextFields} so that the {@link #datachange} event being fired from an onkeyup event does not also
	 * cause the {@link #datachange} event to be fired again when the field is blurred.<br><br>
	 *  
	 * This also solves the problem of previously firing the {@link #datachange} event when modifier keys like shift, or ctrl, are pressed. 
	 * 
	 * @protected
	 * @property lastDataChangeValue
	 * @type String
	 */
		
	
	// protected
	initComponent : function() {
		this.addEvents(
			/**
			 * @event change
			 * Fires when the input field has been changed.
			 * @param {ui.formFields.AbstractField} field This Field object.
			 * @param {Object} newValue The new value of the field.
			 */
			'change',
			
			/**
			 * @event focus
			 * Fires when the input field has been focused.
			 * @param {ui.formFields.AbstractField} field This Field object.
			 */
			'focus',
			
			/**
			 * @event blur
			 * Fires when the input field has been blurred.
			 * @param {ui.formFields.AbstractField} field This Field object.
			 */
			'blur'
		);
		
		
		// Add the dialog-formField class, which creates a margin around form fields, and is the ancestor selector for all form field styling.
		this.cls += ' dialog-formField';
		
		
		// If the value is a function, execute it, and use its return value as the value. This is to provide a little backward compatibility for
		// some fields that use it, and need a new (i.e. different) return value for each new instance.
		if( typeof this.value === 'function' ) {
			this.value = this.value();
		}
		
		
		// Fix labelPosition to be lower case
		this.labelPosition = this.labelPosition.toLowerCase();
		
		
		// Apply other appropriate CSS classes to the outer element
		if( this.label === "" ) {
			this.cls += ' dialog-formField-noLabel';
		} else {
			this.cls += ' dialog-formField-' + this.labelPosition + 'Label';  // will add the 'dialog-formField-leftLabel' or 'dialog-formField-topLabel' css classes
		}
		
		
		// Give the input a unique ID, if one was not provided
		this.inputId = this.inputId || 'ui-cmp-input-' + Kevlar.newId();
		
		// Default the inputName to the inputId, if not provided.
		this.inputName = ( typeof this.inputName !== 'undefined' ) ? this.inputName : this.inputId;  // allowing for the possibility of providing an empty string for inputName here (so the field isn't submitted), so not using the || operator
		
		
		// Call superclass initComponent
		ui.formFields.AbstractField.superclass.initComponent.call( this );
		
		// Call mixin class constructor
		ui.DataControl.constructor.call( this );
	},
	
	
	/**
	 * Handles the basic rendering for all field subclasses. Takes care of adding a label (if specified), the
	 * containing div for the input element, and the input element itself if specified.
	 * 
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		ui.formFields.AbstractField.superclass.onRender.apply( this, arguments );
		
		var $el = this.$el,
		    renderTpl = ui.formFields.AbstractField.renderTpl,  // static property
		    labelWrapStyles = "",
		    inputContainerWrapStyles = "",
		    helpStyles = "";
		
		// Size the label and input container elements (based on the labelWidth config) if the labelPosition is 'left', and there is an actual label.
		if( this.label !== "" && this.labelPosition === 'left' ) {
			// Make the percentage label width into a number (i.e. change "15%" to 15)
			var labelWidth = parseInt( this.labelWidth, 10 );
			
			labelWrapStyles += 'width: ' + labelWidth + '%;';
			inputContainerWrapStyles += 'width: ' + ( 100 - labelWidth ) + '%;';  // the remaining width: 100% - minus the label width
			
			// Set the help element to line up with the field's input container
			helpStyles += 'padding-left: ' + labelWidth + '%;';
		}
		
		// Single DOM append of the render template
		var renderHTML = Kevlar.util.tmpl( renderTpl, {
			inputId : this.inputId,
			
			label : this.label || "",
			help  : this.help || "",
			
			labelWrapStyles          : labelWrapStyles,
			inputContainerWrapStyles : inputContainerWrapStyles,
			helpStyles               : helpStyles
		} );
		$el.append( renderHTML );
		
		// Retrieve references from generated HTML/DOM append
		this.$labelEl = $el.find( 'label.dialog-formField-label' );
		this.$inputContainerEl = $el.find( 'div.dialog-formField-inputContainer' );
		this.$helpEl = $el.find( 'div.dialog-formField-help' );
	},
	
	
	/**
	 * Sets the label text for the field.
	 * 
	 * @method setLabel
	 * @param {String} label
	 */
	setLabel : function( label ) {
		if( !this.rendered ) {
			this.label = label;
			
		} else {
			// If a label was specified, make sure the dialog-formField-noLabel class has been removed. Otherwise, add it.
			if( label !== "" ) {
				this.$el.removeClass( 'dialog-formField-noLabel' );
			} else {
				this.$el.addClass( 'dialog-formField-noLabel' );
			}
			
			this.$labelEl.empty().append( label );
		}
	},
	
	
	/**
	 * Sets the help text for the field.
	 * 
	 * @method setHelp
	 * @param {String} helpText
	 */
	setHelp : function( helpText ) {
		if( !this.rendered ) {
			this.help = helpText;
			
		} else {
			this.$helpEl.html( helpText );
		}
	},
	
	
	/**
	 * Retrieves the label element. This is useful if you want to add other HTML elements into the label element itself.
	 * Returns the element in a jQuery wrapper.
	 * 
	 * @method getLabelEl
	 * @return {jQuery}
	 */
	getLabelEl : function() {
		return this.$labelEl;
	},
	
	
	/**
	 * Retrieves the div element that is meant to wrap the input element. This is useful if you want to add other HTML elements
	 * into the input container element itself. Returns the element in a jQuery wrapper.
	 * 
	 * @method getInputContainerEl
	 * @return {jQuery}
	 */
	getInputContainerEl : function() {
		return this.$inputContainerEl;
	},
	
	
	/**
	 * Retrieves the help div element. This is useful if you want to add other HTML elements into the help element itself.
	 * Returns the element in a jQuery wrapper.
	 * 
	 * @method getHelpEl
	 * @return {jQuery}
	 */
	getHelpEl : function() {
		return this.$helpEl;
	},
	
	
	
	/**
	 * Sets the value for the field.
	 * 
	 * @abstract
	 * @method setValue
	 * @param {Mixed} value The value to set to the field.
	 */
	setValue : function( value ) {
		throw new Error( "setValue() must be implemented in AbstractField subclass" );
	},
	
	
	/**
	 * Retrieves the current value from the field.
	 * 
	 * @abstract
	 * @method getValue
	 * @return {Mixed} The value of the field.
	 */
	getValue : function() {
		throw new Error( "getValue() must be implemented in AbstractField subclass" );
	},
    
	
	/**
	 * Template method for handling a change to the field. Extensions of this method should call this superclass method
	 * after their processing is complete.
	 * 
	 * @protected
	 * @method onChange
	 * @param {Mixed} newValue The new value of the field.
	 */
	onChange : function( newValue ) {
		this.fireEvent( 'change', this, newValue );
		
		// Only fire the event if the value is different from the last value we fired the datachange event with.
		// See lastDataChangeValue property doc for details. 
		if( this.lastDataChangeValue !== newValue ) {
			this.lastDataChangeValue = newValue;  // update the lastDataChangeValue 
			this.onDataChange();  // call method in DataControl mixin to fire the datachange event
		}
	},
	
	
	/**
	 * Focuses the field.
	 * 
	 * @protected
	 * @method focus
	 */
	focus : function() {
		this.onFocus();
	},
	
	
	/**
	 * Template method for handling the input field being focused. Extensions of this method should call this superclass method
	 * after their processing is complete.
	 * 
	 * @protected
	 * @method onFocus
	 */
	onFocus : function() {
		this.fireEvent( 'focus', this );
	},
	
	
	/**
	 * Blurs the field.
	 * 
	 * @protected
	 * @method blur
	 */
	blur : function() {
		this.onBlur();
	},
	
	
	/**
	 * Template method for handling the input field being blurred. Extensions of this method should call this superclass method
	 * after their processing is complete.
	 * 
	 * @protected
	 * @method onBlur
	 */
	onBlur : function() {
		this.fireEvent( 'blur', this );
	},
	
	
	// --------------------------------
	
	
	// Implementation of ui.DataControl mixin interface
	setData : function() {
		this.setValue.apply( this, arguments );
	},
	getData : function() {
		return this.getValue();
	}
	
} );


// Add static properties
Kevlar.apply( ui.formFields.AbstractField, {
	
	/**
	 * @private
	 * @static
	 * @property renderTpl
	 * @type String
	 * The template to use to render the AbstractField's elements.
	 */
	renderTpl : [
		'<div class="dialog-formField-labelWrap" style="<%= labelWrapStyles %>">',
			'<label for="<%= inputId %>" class="dialog-formField-label"><%= label %></label>',
		'</div>',
		'<div class="dialog-formField-inputContainerWrap" style="<%= inputContainerWrapStyles %>">',
			'<div class="dialog-formField-inputContainer" style="position: relative;" />',
		'</div>',
		'<div class="dialog-formField-help" style="<%= helpStyles %>"><%= help %></div>'
	].join( "" )
	
} );

/**
 * @abstract
 * @class ui.formFields.WrappedInputField
 * @extends ui.formFields.AbstractField
 * 
 * Abstract base class for form fields which handles making a div element look like a form field, so that
 * elements (including an input) may be placed inside to look like they are all in the form field, but really
 * they are separate. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.formFields.WrappedInputField = Kevlar.extend( ui.formFields.AbstractField, {	
	
	/**
	 * Handles the basic rendering for all field subclasses. Takes care of adding a label (if specified), the
	 * containing div for the input element, and the input element itself if specified.
	 * 
	 * @protected
	 * @method onRender
	 */
	onRender : function( $container ) {
		ui.formFields.WrappedInputField.superclass.onRender.apply( this, arguments );
		
		this.$inputContainerEl.addClass( 'dialog-formField-wrappedInputField' );
	},
	
	
	/**
	 * Template method for handling the input field being focused. This extension of the method
	 * adds the "glow" to the input's container while the field has focus.
	 * 
	 * @protected
	 * @method onFocus
	 */
	onFocus : function() {
		this.$inputContainerEl.addClass( 'dialog-formField-wrappedInputField-focus' );
		
		ui.formFields.WrappedInputField.superclass.onFocus.apply( this, arguments );
	},
	
	
	/**
	 * Template method for handling the input field being blurred. This extension of the method
	 * removes the "glow" from the input's container.
	 * 
	 * @protected
	 * @method onBlur
	 */
	onBlur : function() {
		this.$inputContainerEl.removeClass( 'dialog-formField-wrappedInputField-focus' );
		
		ui.formFields.WrappedInputField.superclass.onBlur.apply( this, arguments );
	}
	
} );

/**
 * @class ui.formFields.TextField
 * @extends ui.formFields.WrappedInputField
 * 
 * Text (string) field component for the editor.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.formFields.TextField = Kevlar.extend( ui.formFields.WrappedInputField, {
	
	/**
	 * @cfg {Boolean} selectOnFocus
	 * True to have the field's text automatically selected when the field is focused. Defaults to false. 
	 */
	selectOnFocus : false,
	
	/**
	 * @cfg {String} labelPosition
	 * A string that specifies where the field's label should be placed. Valid values are: "left", "top", 
	 * and "infield". The "infield" label position places the label inside the text field itself, which 
	 * is then hidden when the user starts typing into the field. Defaults to 'left'.<br><br>
	 * 
	 * Note that a labelPosition set to "infield" is not compatible with the {@link #emptyText} 
	 * config. The provided {@link #emptyText} will not be used in this case. 
	 */
	
	/**
	 * @cfg {String} emptyText
	 * The text to show in the field when the field is empty. When the user focuses the field, this text
	 * will be removed, allowing the user to type their value. If provided, and no {@link #value} is provided,
	 * the {@link #value} will be set to this.<br><br>
	 * 
	 * Note that this is not compatible with the {@link #labelPosition} config set to "infield". See the description of {@link #labelPosition}.
	 */
	
	/**
	 * @cfg {Boolean} restoreEmptyText
	 * True to enable the restoration of the {@link #emptyText} (if any) when the field loses focus (is blurred), and is empty.
	 * If this is true, the {@link #emptyText} will be re-applied to the field when it has no value (i.e. it's an
	 * empty string).  If this is false, the {@link #emptyText} will not be re-applied to the field when it loses 
	 * focus. Defaults to true.<br><br>
	 * 
	 * Note: This only applies when the {@link #labelPosition} config is not "infield". Infield labels cannot have
	 * an {@link #emptyText} value.
	 */
	restoreEmptyText : true,
	
	/**
	 * @cfg {String} value
	 * The initial value for the field, if any.
	 */
	
	
	/**
	 * @protected
	 * @property $inputEl
	 * The &lt;input&gt; element; the text field. Will only be available after render.
	 * @type jQuery
	 */
	
	/**
	 * @private
	 * @property behaviorState
	 * The {@link ui.formFields.TextField.AbstractBehavior} object that governs the TextField's behavior.
	 * This currently applies to either the TextField having a {@link ui.formFields.AbstractField#default default} value, 
	 * or the TextField having an "infield" {@link #labelPosition}.
	 * @type ui.formFields.TextField.AbstractBehavior
	 */
	
	
	// protected
	initComponent : function() {
		ui.formFields.TextField.superclass.initComponent.call( this );
		
		this.addEvents(
			/**
			 * @event keydown
			 * Fires when a key is pressed down in the field.
			 * @param {ui.formFields.AbstractField} field This TextField object.
			 * @param {jQuery.Event} evt The jQuery event object for the event.
			 */
			'keydown',
			
			/**
			 * @event keyup
			 * Fires when a key is pressed and let up in the field.
			 * @param {ui.formFields.AbstractField} field This TextField object.
			 * @param {jQuery.Event} evt The jQuery event object for the event.
			 */
			'keyup',
			
			/**
			 * @event keypress
			 * Fires when a key is pressed in the field.
			 * @param {ui.formFields.AbstractField} field This TextField object.
			 * @param {jQuery.Event} evt The jQuery event object for the event.
			 */
			'keypress'
		);
		
		// Set the TextField's behavior "state", based on if it is set to have an "infield" label or not.
		// "infield" labels are incompatible with having a regular default value (i.e. the default showing on top
		// of the "infield" label does not look right), and thus are mutually exclusive behaviors.
		if( this.labelPosition === 'infield' ) {
			this.behaviorState = new ui.formFields.TextField.InfieldLabelBehavior();
		} else {
			this.behaviorState = new ui.formFields.TextField.EmptyTextBehavior();
		}
		
		// If a value was provided, and it is not a string, convert it to one now. normalizeValue handles all datatypes.
		this.value = this.normalizeValue( this.value );
		
		// If the value is an empty string, and there was emptyText provided, initialize it to the emptyText.
		// That is what will be displayed in the field (with the appropriate CSS class to make it look like the emptyText).
		if( this.value === "" && this.emptyText ) {
			this.value = this.emptyText;
		}
	},
	
	
	
	// protected
	onRender : function( container ) {
		// Call superclass onRender()
		ui.formFields.TextField.superclass.onRender.apply( this, arguments );
		
		// Create the input field, and append it to the $inputContainerEl with the 'text' css class
		this.$inputEl = this.createInputEl().appendTo( this.$inputContainerEl );
		
		// Add event handlers to the input element
		this.$inputEl.bind( {
			change   : function( evt ) { this.onChange( this.getValue() ); }.createDelegate( this ),  // Call onChange() with the new value
			focus    : this.onFocus.createDelegate( this ),
			blur     : this.onBlur.createDelegate( this ),
			keydown  : this.onKeyDown.createDelegate( this ),
			keyup    : this.onKeyUp.createDelegate( this ),
			keypress : this.onKeyPress.createDelegate( this )
		} );
		
		// Call state object's onRender to allow it to implement whatever processing is necessary
		this.behaviorState.onRender( this );
	},
	
	
	/**
	 * Overridable method for creating the input element for the TextField. This may be overrided in a subclass for
	 * a different implementation than the regular &lt;input type="text"&gt; element.  The implementation should
	 * add the field's "id" ({@link #inputId}) and "name" ({@link #inputName}) properties, and populate the field's
	 * initial {@link #value}.
	 * 
	 * @protected
	 * @method createInputEl
	 * @return {jQuery}
	 */
	createInputEl : function() {
		var value = ( this.value ) ? Kevlar.util.Html.encode( this.value ) : "";
		return jQuery( '<input type="text" class="text" id="' + this.inputId + '" name="' + this.inputName + '" value="' + value + '" />' );  
	},
	
	
	/**
	 * Retrieves the input element from the TextField. Use only if absolutely needed however, otherwise relying on the public
	 * interface to this class to perform common tasks such as getting/setting the value, or focusing/blurring the field.  
	 * This is mainly an accessor for the bevhavior state objects that operate on this class. The input element will not be
	 * available until the TextField has been rendered.
	 * 
	 * @method getInputEl
	 * @return {jQuery} The input element if the component is rendered, or null if it is not.
	 */
	getInputEl : function() {
		return this.$inputEl || null;
	},
	
	
	/**
	 * Normalizes the value provided to a valid TextField value. Converts undefined/null into an empty string,
	 * and numbers/booleans/objects into their string form.
	 * 
	 * @private
	 * @method normalizeValue
	 * @param {Mixed} value
	 * @return {String}
	 */
	normalizeValue : function( value ) {
		// Normalize undefined/null to an empty string, and numbers/booleans/objects to their string representation.
		// Otherwise, return string values unchanged.
		if( typeof value === 'undefined' || value === null ) {
			return "";
		} else if( typeof value !== 'string' ) {
			return value.toString();
		} else {
			return value;
		}
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s setValue() method, which sets the value to the field.
	 * 
	 * @method getValue
	 * @param {String} value The value of the field.
	 */
	setValue : function( value ) {
		value = this.normalizeValue( value );
		
		if( !this.rendered ) {
			this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.
			
		} else {
			this.$inputEl.val( value );
			
			// Allow the TextField's behaviorState to handle the value being set
			this.behaviorState.onSetValue( this, value );
		}
		
		// Run onchange, to notify listeners of a change
		this.onChange( value );
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s getValue() method, which returns the value of the field.
	 * 
	 * @method getValue
	 * @return {String} The value of the field.
	 */
	getValue : function() {
		if( !this.rendered ) {
			// If the value was set before the Component has been rendered (i.e. before the Field has been created), return that.
			return this.value;
			
		} else {
			return this.$inputEl.val();
		}
	},
	
	
	/**
	 * Sets the {@link #emptyText} for the Field.
	 * 
	 * @method setEmptyText
	 * @param {Mixed} emptyText The empty text to set to the Field.
	 */
	setEmptyText : function( emptyText ) {
		this.emptyText = emptyText;
	},
	
	
	/**
	 * Retrieves the {@link #emptyText} of the Field.
	 * 
	 * @method getEmptyText
	 * @return {Mixed} The {@link #emptyText} that was specified for the Field, or set using {@link #setEmptyText}.
	 */
	getEmptyText : function() {
		return this.emptyText;
	},
	
	
	/**
	 * Selects the text in the TextField.
	 * 
	 * @method select
	 */
	select : function() {
		this.$inputEl.select();
	},
	
	
	/**
	 * Extension of onChange template method used to allow the {@link #behaviorState} to handle
	 * the change event.
	 *
	 * @protected
	 * @method onChange
	 */
	onChange : function() {
		// Allow the TextField's behaviorState to handle the change event
		this.behaviorState.onChange( this );
		
		ui.formFields.TextField.superclass.onChange.apply( this, arguments );
	},
	
	
	/**
	 * Focuses the text field.
	 * 
	 * @method focus
	 */
	focus : function() {
		this.$inputEl.focus();
		
		ui.formFields.TextField.superclass.focus.apply( this, arguments );
	},
	
	
	/**
	 * Blurs the text field.
	 * 
	 * @method blur
	 */
	blur : function() {
		this.$inputEl.blur();
		
		ui.formFields.TextField.superclass.blur.apply( this, arguments );
	},
	
	
	// protected
	onFocus : function() {
		// Allow the TextField's behaviorState to handle the focus event
		this.behaviorState.onFocus( this );
		
		// If the selectOnFocus config is true, select the text
		if( this.selectOnFocus ) {
			this.select();
		}
		
		ui.formFields.TextField.superclass.onFocus.apply( this, arguments );
	},
	
	
	// protected
	onBlur : function() {
		// Allow the TextField's behaviorState to handle the blur event
		this.behaviorState.onBlur( this );
		
		ui.formFields.TextField.superclass.onBlur.apply( this, arguments );
	},
	
	
	/**
	 * Handles a keydown event in the text field. 
	 * 
	 * @protected
	 * @method onKeyDown
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyDown : function( evt ) {
		// Allow the TextField's behaviorState to handle the keydown event
		this.behaviorState.onKeyDown( this, evt );
		
		this.fireEvent( 'keydown', this, evt ); 
	},
	
	
	/**
	 * Handles a keyup event in the text field. 
	 * 
	 * @protected
	 * @method onKeyUp
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyUp : function( evt ) {
		// Allow the TextField's behaviorState to handle the keyup event
		this.behaviorState.onKeyUp( this, evt );
		
		this.fireEvent( 'keyup', this, evt ); 
		
		// Call the onDataChange method in DataControl mixin, which fires the 'datachange' event. This is also done
		// in the onChange() method of AbstractField, but this was added for "live updates" in the juxer Palette.
		// We only want to fire the event if the value is different from the last value we fired the datachange
		// event with, however. See lastDataChangeValue property doc for details (in AbstractField). 
		var newValue = this.getValue();
		if( this.lastDataChangeValue !== newValue ) {
			this.lastDataChangeValue = newValue;  // update the lastDataChangeValue
			this.onDataChange();  // call method in DataControl mixin to fire the datachange event
		}
	},
	
	
	/**
	 * Handles a keypress in the text field. 
	 * 
	 * @protected
	 * @method onKeyPress
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyPress : function( evt ) {
		// Allow the TextField's behaviorState to handle the keypress event
		this.behaviorState.onKeyPress( this, evt );
		
		this.fireEvent( 'keypress', this, evt ); 
	}
	
} );


// Register the type so it can be created by the string 'Text' in the manifest
ui.ComponentManager.registerType( 'Text', ui.formFields.TextField );

/**
 * @class ui.layouts.AbstractLayout
 * @extends Kevlar.util.Observable
 * @abstract 
 * 
 * Defines the public interface of all Layout subclasses. Layouts are strategy objects that are used
 * by {@link ui.Container}s to implement how their child items are displayed.<br><br>
 * 
 * The default layout that is used for a {@link ui.Container Container} is the {@link ui.layouts.ContainerLayout}, 
 * which simply puts each child component into their own div element, and does no further sizing or formatting.
 *
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.layouts.AbstractLayout = Kevlar.extend( Kevlar.util.Observable, {
	
	/**
	 * @cfg {ui.Container} container
	 * The {@link ui.Container} that this Layout object belongs to. Defaults to null, and can be set
	 * after instantiation with {@link #setContainer}. 
	 */
	container : null,
	
	/**
	 * @protected
	 * @property container
	 * The {@link ui.Container} that this Layout object belongs to, set by either the config option,
	 * or the {@link #setContainer} method.
	 * @type {ui.Container}
	 */
	
	
	constructor : function( config ) {
		this.addEvents(
			/**
			 * @event destroy
			 * Fires when this layout is destroyed.
			 * @param {ui.layouts.AbstractLayout} layout This AbstractLayout instance.
			 */
			'destroy'
		);
		
		// Apply the properties of the configuration object onto this object
		Kevlar.apply( this, config );
		
		// Call Observable's constructor
		ui.layouts.AbstractLayout.superclass.constructor.call( this );
		
		// Call template method for layout initialization
		this.initLayout();
	},
	
	
	/**
	 * Template method which should be extended to provide the Layout's constructor logic. 
	 * 
	 * @abstract
	 * @method initLayout
	 */
	initLayout : function() {
		// template method
	},
	
	
	/**
	 * Sets the {@link ui.Container} instance that this Layout belongs to.
	 * 
	 * @method setContainer
	 * @param {ui.Container} container
	 */
	setContainer : function( container ) {
		this.container = container;
	},
	
	
	/**
	 * Gets the {@link ui.Container} instance that this Layout belongs to.
	 * 
	 * @method getContainer
	 * @return {ui.Container} The container
	 */
	getContainer : function() {
		return this.container;
	},
	
	
	/**
	 * Performs the layout strategy. First detaches any rendered components from their parent, and then
	 * calls the {@link #onLayout} template method for subclasses to perform the necessary layout processing.
	 * 
	 * @method doLayout
	 */
	doLayout : function() {
		var container = this.container,
		    childComponents = this.container.getItems(),
		    numChildComponents = childComponents.length,
			$targetEl = container.getContentTarget();
		
		// First, detatch any child components' elements that have already been rendered. They will be placed in the correct
		// position next (when the layout subclass executes its onLayout method).
		for( var i = 0; i < numChildComponents; i++ ) {
			if( childComponents[ i ].rendered ) {
				childComponents[ i ].getEl().detach();
			}
		}
		
		// Call template method for subclasses
		this.onLayout( childComponents, $targetEl );
	},
	
	
	/**
	 * Template method for subclasses to override to implement their layout strategy.
	 * 
	 * @protected
	 * @abstract
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	onLayout : function( childComponents, $targetEl ) {
		// Template Method
	},
	
	
	/**
	 * Destroys the layout by cleaning up its event listeners. Subclasses should extend the onDestroy method to implement 
	 * any destruction process they specifically need.
	 * 
	 * @method destroy
	 */
	destroy : function() {
		this.onDestroy();
		this.fireEvent( 'destroy', this );
		
		// purge listeners after the destroy event has been fired
		this.purgeListeners();
	},
	
	
	/**
	 * Template method that subclasses should extend to implement their own destruction process.
	 * 
	 * @protected
	 * @abstract
	 * @method onDestroy
	 */
	onDestroy : function() {
		// Template method
	}
	
} );

/**
 * @class ui.layouts.CardsLayout
 * @extends ui.layouts.AbstractLayout
 * 
 * A layout that renders a {@link ui.Container Container's} child components where only one child (card) can be shown 
 * at a time (such as showing only the top card in a deck of cards).  Methods are available in this class to control
 * which card is shown.<br><br>
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'cards'.
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.layouts.CardsLayout = Kevlar.extend( ui.layouts.AbstractLayout, {
	
	/**
	 * @cfg {Number/ui.Component} activeItem
	 * The item number or {@link ui.Component} reference to set as the initially active item. Defaults to 0 (for the first item). 
	 * If this is a {@link ui.Component}, it should be a {@link ui.Component Component} that exists in the {@link ui.Container Container}.
	 */
	activeItem : 0,
	
	
	/**
	 * @cfg {ui.layouts.CardsLayout.AbstractTransition} transition The {@link ui.layouts.CardsLayout.AbstractTransition AbstractTransition} subclass to use
	 * for switching between cards. The default transition is the {@link ui.layouts.CardsLayout.SwitchTransition SwitchTransition}, which simply hides
	 * the currently active card, and shows the new card. This may be changed to provide a different method of changing cards, such as to implement
	 * animation. 
	 */
	
	
	/**
	 * @private
	 * @property activeItem
	 * Stores the currently active item ({@link ui.Component}), after the layout's onLayout method has run.
	 * @type ui.Component
	 */
	
	
	
	// protected
	initLayout : function() {
		this.addEvents(
			/**
			 * @event cardchange
			 * Fires when the active item has been changed. 
			 * @param {ui.Component} card The {@link ui.Component} instance of the card that was activated. If no card has
			 *   been activated (either by a null argument to {@link #setActiveItem}, or an index out of range), then this
			 *   will be null.
			 */
			'cardchange'
		);
		
		// Create the default transition strategy object if none was provided 
		if( !this.transition ) {
			this.transition = new ui.layouts.CardsLayout.SwitchTransition();
		}
		
		// Call superclass initLayout
		ui.layouts.CardsLayout.superclass.initLayout.call( this );
	},
	
	
	/**
	 * Layout implementation for CardsLayout, which renders each child component into the Container's content target 
	 * (see {@link ui.Component#getContentTarget}), and then hides them.  The one given by the {@link #activeItem}
	 * config is then shown.
	 * 
	 * @protected
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	onLayout : function( childComponents, $targetEl ) {
		ui.layouts.CardsLayout.superclass.onLayout.apply( this, arguments );
		
		// First normalize the activeItem config to the ui.Component it refers to.
		if( typeof this.activeItem === 'number' ) {
			this.activeItem = this.getContainer().getItemAt( this.activeItem );
		}
		
		// Now render the child Components, hiding them if they are not the activeItem.
		// Note: Was just rendering only the activeItem and then lazily rendering the others once they were requested,
		// but this caused a big performance issue with the SlideTransition. I believe the problem was rendering it and then hiding
		// it on demand, instead of being able to render it hidden.  Possibly need to figure out a way to do that so the lazy
		// rendering can be done.  Just rendering all components and then hiding the non-activeItem ones for now.
		for( var i = 0, len = childComponents.length; i < len; i++ ) {			
			// render the child Component into the Container's content target element
			childComponents[ i ].render( $targetEl );  
			
			// Hide the child Component if it is not the activeItem.
			// This sets the initial state of the CardsLayout to show the activeItem, while all others are hidden.
			if( this.activeItem !== childComponents[ i ] ) {
				childComponents[ i ].hide();
			}
		}
	},
	
	
	
	/**
	 * Sets the active item.
	 * 
	 * @method setActiveItem
	 * @param {ui.Component/Number} item The ui.Component to set as the active item, or the item index to set as the active item (0 for the first item).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 * @param {Object} options (optional) An object which will be passed along as options to the CardsLayout {@link #transition}. See the setActiveItem method in the
	 *   {ui.layouts.CardsLayout.AbstractTransition AbstractTransition} subclass that you are using for a list of valid options (if any).
	 */
	setActiveItem : function( item, options ) {
		// Item was provided as a number, find the Component
		if( typeof item === 'number' ) {
			item = this.container.getItemAt( item );
			
		} else if( item instanceof ui.Component && !this.container.has( item ) ) {
			item = null;  // if the item is not in the Container, set to null. Shouldn't switch to a Component that is not in the Container.
		}
		
		if( !this.getContainer().rendered ) {
			// The Container that this layout belongs to is not rendered, just set the activeItem config to the requested item.
			// This method will be run again as soon as the Container is rendered, and its layout is done.
			this.activeItem = item;
			
		} else {
			// Make a change to the cards if:
			//  1) The new item is null -- we must remove the currently active item
			//  2) The new item is a component, but different from the activeItem -- we must switch the cards
			//  3) The new item is a component and is the activeItem, but is hidden -- we must show it
			if( !item || this.activeItem !== item || item.isHidden() ) {
				
				// Delegate to the transition strategy for the change in cards (active item)
				// Make sure the activeItem is passed in only if it is an instantiated ui.Component (i.e. not null, and not the numbered config)
				var activeItem = this.activeItem;
				if( !( activeItem instanceof ui.Component ) ) {
					activeItem = null;
				}
				this.transition.setActiveItem( this, activeItem, item, options );
				
				// store the new currently active item (even if it is null), and fire the event
				this.activeItem = item;
				this.fireEvent( 'cardchange', item );
			}
		}
	},
	
	
	/**
	 * Gets the currently active item. Returns null if there is no active item. 
	 * 
	 * @method getActiveItem
	 * @return {ui.Component} The Component that is currently shown as the active item. Returns null if there is no active item.
	 */
	getActiveItem : function() {
		var activeItem = this.activeItem;
		
		if( activeItem instanceof ui.Component || activeItem === null ) {
			return activeItem;
		} else {
			return this.container.getItemAt( activeItem );
		}
	},
	
	
	/**
	 * Gets the active item index (i.e. the 0-based tab number that is currently selected). If there is no currently active item, returns -1.
	 * If the layout has not yet executed, this will return the value of the activeItem config if it is a number.
	 * 
	 * @method getActiveItemIndex
	 * @return {Number} The index of the item that is currently shown as the active item. Returns -1
	 *   if there is no active item.
	 */
	getActiveItemIndex : function() {
		var activeItem = this.activeItem;
		
		if( activeItem === null ) {
			return -1;
		} else if( activeItem instanceof ui.Component ) {
			return this.container.getItemIndex( activeItem );
		} else {
			return activeItem;  // still a number config (i.e. the layout hasn't been run), return that
		}
	},
	
	
	/**
	 * Extended onDestroy method for the CardsLayout to destroy its CardsLayout {@link ui.layouts.CardsLayout.AbstractTransition} object.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		// Destroy the transition strategy object
		this.transition.destroy();
		
		ui.layouts.CardsLayout.superclass.onDestroy.apply( this, arguments );
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'cards', ui.layouts.CardsLayout );

/**
 * @class ui.plugins.AbstractPlugin
 * @extends Kevlar.util.Observable
 * @abstract
 * 
 * Abstract base class for plugins.  All plugins that are created should extend from this class.  Concrete plugin implementations
 * must implement the method {@link #initPlugin}, which is called by a {@link ui.Component} when it initializes the plugin. See
 * {@link #initPlugin} for more details.<br><br>
 * 
 * See the ui.plugins package for examples on building plugins.
 * 
 * @constructor
 * @param {Object} config The configuration options for the plugin, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.plugins.AbstractPlugin = Kevlar.extend( Kevlar.util.Observable, {
	
	constructor : function( config ) {
		// Apply the properties of the configuration object onto this object
		Kevlar.apply( this, config );
		
		// Call superclass (Observable) constructor. Must be done after config has been applied.
		ui.plugins.AbstractPlugin.superclass.constructor.call( this );
	},
	
	
	/**
	 * Abstract method that must be implemented by subclasses to provide the functionality of the plugin. This method
	 * is called by the {@link ui.Component} that the plugin has been provided to when the Component initializes its plugins. 
	 * This method is given a reference to the {@link ui.Component Component} as the first argument so that the Component's
	 * events can be subscribed to and its methods can be overridden/extended to implement the plugin's functionality.
	 * 
	 * @method initPlugin
	 * @param {ui.Component} component A reference to the {@link ui.Component} that this plugin belongs to. 
	 */
	initPlugin : function( component ) {
		// Template Method
	}
	
} );

/**
 * @class ui.toolButtons.ToolButton
 * @extends ui.Button
 * 
 * Renders a ToolButton.  A ToolButton is a small button (~16x16) that is used to perform an action. Some examples include
 * an {@link ui.toolButtons.EditButton EditButton}, a {@link ui.toolButtons.HideButton HideButton}, and 
 * a {@link ui.toolButtons.DeleteButton DeleteButton}. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.ToolButton = Kevlar.extend( ui.Button, {
	
	/**
	 * @cfg {String} size
	 * The size of the tool button. At this time, this can be either 'tiny', 'small', or 'large'. Defaults to 'large'
	 * now that we seem to be using all large icons on the site (used to default to 'small'). Note that some buttons
	 * may not support each type. TODO: CSS classes should be added for each.
	 */
	size : 'large',
	
	
	// protected
	initComponent : function() {
		this.cls += ' ui-toolButton ui-toolButton-' + this.size;  // size will be 'tiny', 'small', or 'large'
				
		ui.toolButtons.ToolButton.superclass.initComponent.call( this );
	}
	
} );

// Register the type so it can be created by the string 'ToolButton' in the manifest
ui.ComponentManager.registerType( 'ToolButton', ui.toolButtons.ToolButton );


/**
 * @class Kevlar.CSS
 * @singleton
 * 
 * General CSS manipulation/reading functionality.  Allows the dynamic modification of 
 * style sheets, reading of values, etc. Also has some utility methods for working with CSS.
 */
/*global Kevlar */
Kevlar.CSS = {
	
	/**
	 * Given a hash of CSS property/value pairs, will return a string that can be placed directly
	 * into the "style" attribute of an element. camelCased CSS property names will be converted to 
	 * dashes. Ex: "fontSize" will be converted to "font-size".
	 * 
	 * @method hashToString
	 * @param {Object} cssProperties An object (hash) of CSS property/value pairs. Ex: { color: 'red', fontSize: '10px;' }
	 * @return {String} The CSS string that can be used directly in an element's "style" attribute, or when using it
	 *   to update an existing element's styles, can be used directly on the .style.cssText property.
	 */
	hashToString : function( cssProperties ) {
		var replaceRegex = /([A-Z])/g,
		    cssString = "",
		    normalizedProp;
		    
		for( var prop in cssProperties ) {
			if( cssProperties.hasOwnProperty( prop ) ) {
				normalizedProp = prop.replace( replaceRegex, '-$1' ).toLowerCase();
				cssString += normalizedProp + ':' + cssProperties[ prop ] + ';';
			}
		}
		return cssString;
	}
	
};


/**
 * @class Kevlar.data.Field
 * @extends Object
 * 
 * Field definition object for {@link Kevlar.data.Model Models}. The Field itself does not store data, but instead simply
 * defines the behaviors of a {@link Kevlar.data.Model Model's} fields.  A {@link Kevlar.data.Model Model} is made up of Fields. 
 * 
 * @constructor
 * @param {Object/String} config The field object's config, which is its definition. Can also be its field name provided directly as a string.
 */
/*global Kevlar */
Kevlar.data.Field = Kevlar.extend( Object, {
	
	/**
	 * @cfg {String} name (required)
	 * The name for the field, which is used by the owner Model to reference it.
	 */
	name : "",
	
	/**
	 * @cfg {String} type
	 * Currently unused, but specifies the type of the Field. In the future, this may be implemented to do type checking
	 * on field data.
	 * 
	 * This may be one of the following values:
	 * <ul>
	 *   <li>auto (default, no type checking is done)</li>
	 *   <li>int</li>
	 *   <li>float</li>
	 *   <li>string</li>
	 *   <li>boolean</li>
	 *   <li>date</li>
	 *   <li>object</li>
	 *   <li>array</li>
	 * </ul>
	 */
	
	/**
	 * @cfg {Mixed/Function} defaultValue
	 * The default value for the Field, if it has no value of its own. This can also be specified as the config 'default', 
	 * but must be wrapped in quotes as `default` is a reserved word in JavaScript.<br><br>
	 *
	 * If the defaultValue is a function, the function will be executed, and its return value used as the defaultValue.
	 */
	
	/**
	 * @cfg {Function} convert
	 * A function that can be used when the Field is created to convert its value. This function is passed two arguments:
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li>
	 *       <b>value</b> : Mixed
	 *       <div class="sub-desc">
	 *         The provided data value to the field. If the field had no initial data value, its {@link #defaultValue} will be provided. 
	 *         If it has no data, and no {@link #defaultValue}, it will be undefined.
	 *       </div>
	 *     </li>
	 *     <li>
	 *       <b>model</b> : Kevlar.data.Model
	 *       <div class="sub-desc">The Model instance that this Field belongs to.</div>
	 *     </li>
	 *   </ul>
	 * </div>
	 * 
	 * This function should return the value that the Field should hold. Ex:
	 * <pre><code>convert : function( value, model ) { return model.get( 'someOtherField' ) * value; }</code></pre>
	 * 
	 * Note that this function is called in the order of the field definitions, and doesn't resolve dependencies on the 'convert' of
	 * other fields, so keep this in mind.
	 */
	
	/**
	 * @cfg {Object} scope
	 * The scope to call the {@link #convert} function in. 
	 */
	
	/**
	 * @cfg {Boolean} persist
	 * True if the field should be persisted by its {@link Kevlar.data.Model Model} using the Model's {@link Kevlar.data.Model#proxy proxy}.
	 * Set to false to prevent the field from being persisted.
	 */
	persist : true,
	
	
	constructor : function( config ) {
		// If the argument wasn't an object, it must be its field name
		if( typeof config !== 'object' ) {
			config = { name: config };
		}
		
		// Copy members of the field definition (config) provided onto this object
		Kevlar.apply( this, config );
		
		
		// Each Field must have a name.
		var name = this.name;
		if( name === undefined || name === null || name === "" ) {
			throw new Error( "no 'name' property provided to Kevlar.data.Field constructor" );
			
		} else if( typeof this.name === 'number' ) {  // convert to a string if it is a number
			this.name = name.toString();
		}
		
		
		// Handle defaultValue
		if( this[ 'default' ] ) {  // accept the key as simply 'default'
			this.defaultValue = this[ 'default' ];
		}
		if( typeof this.defaultValue === "function" ) {
			this.defaultValue = this.defaultValue();
		}
		
		// If defaultValue is an object, recurse through it and execute any functions, using their return values as the defaults
		if( typeof this.defaultValue === 'object' ) {
			(function recurse( obj ) {
				for( var prop in obj ) {
					if( obj.hasOwnProperty( prop ) ) {
						if( typeof obj[ prop ] === 'function' ) {
							obj[ prop ] = obj[ prop ]();
						} else if( typeof obj[ prop ] === 'object' ) {
							recurse( obj[ prop ] );
						}
					}
				}
			})( this.defaultValue );
		}
		
	},
	
	
	/**
	 * Retrieves the name for the Field.
	 * 
	 * @method getName()
	 */
	getName : function() {
		return this.name;
	}
	
} );

/**
 * @class Kevlar.data.Model
 * @extends Kevlar.util.Observable
 * 
 * Data storage and persistence facility for Quark data. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this class, specified in an object (hash).
 */
/*global window, Kevlar */
Kevlar.data.Model = Kevlar.extend( Kevlar.util.Observable, {
	
	/**
	 * @cfg {Object} data
	 * The initial data to populate the Model with.
	 */
	
	/**
	 * @cfg {Kevlar.data.AbstractProxy} proxy
	 * The proxy to use (if any) to persist the data to the server.
	 */
	
	
	
	/**
	 * A hash that holds the current data for the {@link Kevlar.data.Field Fields}. The property names in this object match 
	 * the field names.  This hash holds the current data as it is modified by {@link #set}.
	 *
	 * @private
	 * @property data
	 * @type Object
	 */
	
	/**
	 * Flag for quick-testing if the Model currently has un-committed data.
	 * 
	 * @private
	 * @property dirty
	 * @type Boolean
	 */
	dirty : false,
	
	/**
	 * A hash that serves two functions:<br> 
	 * 1) Properties are set to it when a field is modified. The property name is the field {@link Kevlar.data.Field#name}. 
	 * This allows it to be used to determine which fields have been modified. 
	 * 2) The <b>original</b> (non-committed) data of the field (before it was {@link #set}) is stored as the value of the 
	 * property. When rolling back changes (via {@link #rollback}), these values are copied back onto the {@link #data} object
	 * to overwrite the data to be rolled back.
	 * 
	 * @private
	 * @property modifiedData
	 * @type {Object}
	 */
	
	/**
	 * Set to true after the Model's initialization (instantiation) process. This flag is tested against, and is used to prevent 
	 * the firing of events while the Model is still initializing. Events should only be fired after the initialization process,
	 * including the setting of the initial data, is complete.
	 *
	 * @private
	 * @property initialized
	 * @type Boolean
	 */
	initialized : false,
	
	
	/**
	 * Array of {@link Kevlar.data.Field Field} declarations. These are objects with any number of properties, but they
	 * must have the property 'name'. See {@link Kevlar.data.Field} for more information. They will become instantiated
	 * {@link Kevlar.data.Field} objects upon instantiation.<br><br>
	 * 
	 * Fields defined on the prototype of a Model (like below), and its subclasses, are concatenated together come
	 * instantiation time. This means that the Kevlar.data.Model base class can define the 'id' field, and then subclasses
	 * can define their own fields to append to it.  So if a subclass defined the fields `[ 'name', 'phone' ]`, then the
	 * final concatenated array of fields for the subclass would be `[ 'id', 'name', 'phone' ]`. This works for however many
	 * levels of subclasses there are.<br><br>
	 * 
	 * This array will become an object (hash) come instantiation time, with the keys as the field names, and the values as
	 * the instantiated {@link Kevlar.data.Field} objects that represent them.
	 *
	 * @protected
	 * @property fields
	 * @type Array/Object
	 */
	fields : [],
	
	
	
	constructor : function( config ) {
		Kevlar.apply( this, config );
		
		// Call superclass constructor
		Kevlar.data.Model.superclass.constructor.call( this );
		
		
		this.addEvents(
			/**
			 * Fires when a {@link Kevlar.data.Field} in the Model has changed its value.
			 * 
			 * @event datachange
			 * @param {Kevlar.data.Model} Model This Model instance.
			 * @param {String} fieldName The field name for the Field that was changed.
			 * @param {Mixed} value The new value.
			 */
			'datachange'
		);
		
		
		// Initialize the 'fields' array, which gets turned into an object (hash)
		this.initFields();
		
		
		// Default the data to an empty object
		var data = this.data || {};
		
		// Set the default values for fields that don't have a value.
		// Note: This has the side effect of putting the 'undefined' value into the 'data' hash for field data that wasn't
		// provided, and doesn't have a default. This allows 'convert' fields that weren't specified with a value to get their
		// initial value when the call to this.set() is made later in this method.
		var fields = this.fields;  // this.fields is now a hash of the Field objects, keyed by their name
		for( var name in fields ) {
			if( data[ name ] === undefined ) {
				data[ name ] = fields[ name ].defaultValue;
			}
		}
		
		// Initialize the data 
		this.data = {};  // re-initialize the instance property (formerly a config) to an empty hash. This will be populated by the call to set()
		this.modifiedData = {};
		
		this.set( data );
		this.commit();  // because we are initializing, the data is not dirty
		this.initialized = true;  // to enable the firing of events, now that the Model is fully initialized with its initial data set
	},
	
	
	/**
	 * Initializes the Model's {@link #fields} by walking up the prototype change from the current Model subclass
	 * up to this (the base) class, collecting their fields and combining them into one single fields hash. 
	 * See {@link fields} for more information.
	 * 
	 * @private
	 * @method initFields
	 */
	initFields : function() {
		this.fields = {};
		
		// Define concatenated fields array from all subclasses
		var fieldsObjects = [],
		    currentConstructor = this.constructor,
		    currentProto = currentConstructor.prototype;
		
		// Walk up the prototype chain from the current object, collecting 'fields' objects as we go along
		do {
			if( currentProto.hasOwnProperty( 'fields' ) && Kevlar.isArray( currentProto.fields ) ) {    // skip over any prototype that doesn't define 'fields' itself
				fieldsObjects = fieldsObjects.concat( currentProto.fields );
			}
		} while( currentConstructor = ( currentProto = currentConstructor.superclass ) && currentProto.constructor );
		
		// After we have the array of fields, go backwards through them, which allows fields from subclasses to override those in superclasses
		for( var i = fieldsObjects.length; i--; ) {
			var field = new Kevlar.data.Field( fieldsObjects[ i ] );
			this.fields[ field.getName() ] = field;
		}
	},
	
	
	
	/**
	 * Retrieves the value for the field given by `key`.
	 * 
	 * @method get
	 * @param {String} fieldName The name of the Field whose value to retieve.
	 * @return {Mixed} The value of the field given by `key`, or undefined if the key was not found. 
	 */
	get : function( key ) {
		if( !( key in this.data ) ) {
			throw new Error( "Kevlar.data.Model::get() error: provided key '" + key + "' was not found in the Model." );
		}
		return this.data[ key ];
	},
	
	
	/**
	 * Retrieves the values for all of the fields in the Model. Note: returns a shallow copy of the data so that the object
	 * retrieved from this method may be modified.
	 * 
	 * @methods getAll
	 * @return {Object} A hash of the data, where the property names are the keys, and the values are the {@link Kevlar.data.Field Field} values.
	 */
	getAll : function() {
		return Kevlar.Object.clone( this.data, /* deep = */ false );
	},
	
	
	/**
	 * Sets the value for a {@link Kevlar.data.Field Field} given its `name`, and a `value`. For example, a call could be made as this:
	 * <pre><code>model.set( 'field1', 'value1' );</code></pre>
	 * 
	 * As an alternative form, multiple valuse can be set at once by passing an Object into the first argument of this method. Ex:
	 * <pre><code>model.set( { key1: 'value1', key2: 'value2' } );</code></pre>
	 * Note that in this form, the method will ignore any property in the object (hash) that don't have associated Fields.<br><br>
	 * 
	 * When fields are set, their {@link Kevlar.data.Field#convert} method is run, if they have one defined.
	 * 
	 * @method set
	 * @param {String/Object} fieldName The field name for the Field to set, or an object (hash) of name/value pairs.
	 * @param {Mixed} value (optional) The value to set to the field. Required if the `fieldName` argument is a string (i.e. not a hash). 
	 */
	set : function( fieldName, value ) {
		var fields = this.fields,
		    fieldsWithConverts = [];
		
		if( typeof fieldName === 'object' ) {
			// Hash provided 
			var values = fieldName;  // for clarity, and so we can reuse the fieldName variable
			
			for( fieldName in values ) {
				// filter out prototype properties of the provided object (hash), and make sure there is an associated field for the property
				// (i.e. ignore any properties that don't have an associated Field).
				if( values.hasOwnProperty( fieldName ) && ( fieldName in fields ) ) {
					
					// Fields with converts have to be deferred for their set() call until all fields without converts
					// have been processed, to guarantee that they have access to all non-converted data first.
					if( typeof fields[ fieldName ].convert === 'function' ) {
						fieldsWithConverts.push( fieldName );  // push it onto the array, to be handled later
					} else {
						this.set( fieldName, values[ fieldName ] );
					}
					
				}
			}
			
			// After all fields without a 'convert' function have been set, we can now set the ones with a 'convert' function.
			// This is done so that fields with a convert function have access to the data for fields without a 'convert' function
			// before their 'convert' function is run.
			for( var i = 0, len = fieldsWithConverts.length; i < len; i++ ) {
				fieldName = fieldsWithConverts[ i ];
				this.set( fieldName, values[ fieldName ] );
			}
			
		} else {
			// fieldName and value provided
			var field = fields[ fieldName ];
			if( !field ) {
				throw new Error( "Kevlar.data.Model.set(): A field with the fieldName '" + fieldName + "' was not found." );
			}
			
			// Get the current value of the field
			var currentValue = this.data[ fieldName ];
			
			// If the field has a 'convert' function defined, call it to convert the data
			if( typeof field.convert === 'function' ) {
				value = field.convert.call( field.scope || window, value, this );  // provided the value, and the Model instance
			}
			
			// Store the field's *current* value (not the new value) into the "modifiedData" fields hash.
			// This should only happen the first time the field is set, so that the field can be rolled back even if there are multiple
			// set() calls to change it.
			if( !( fieldName in this.modifiedData ) ) {
				this.modifiedData[ fieldName ] = currentValue;
			}
			this.data[ fieldName ] = value;
			this.dirty = true;
			
			// Only fire the event if the Model has been fully initialized (i.e. this isn't a call to set() from the constructor).
			if( this.initialized ) {
				this.fireEvent( 'datachange', this, fieldName, value );
			}
		}
	},
	
	
	/**
	 * Returns the default value specified for a Field.
	 * 
	 * @method getDefault
	 * @param {String} fieldName The field name to retrieve the default value for.
	 * @return {Mixed} The default value for the field.
	 */
	getDefault : function( fieldName ) {
		return this.fields[ fieldName ].defaultValue;
	},
	
	
	/**
	 * Determines if the Model has a given field (attribute).
	 * 
	 * @method has
	 * @param {String} fieldName The name of the field (attribute) name to test for.
	 * @return {Boolean} True if the Model has the given field name.
	 */
	has : function( fieldName ) {
		return !!this.fields[ fieldName ];
	},
	
	
	// --------------------------------
	
	
	/**
	 * Determines if the Model currently has un-committed (i.e. changed) data.
	 * 
	 * @method isDirty
	 * @return {Boolean}
	 */
	isDirty : function() {
		return this.dirty;
	},
	
	
	/**
	 * Determines if a given field has been modified since the last {@link #commit} or {@link #rollback}.
	 * 
	 * @method isModified
	 * @param {String} fieldName
	 * @return {Boolean} True if the field has been modified, false otherwise.
	 */
	isModified : function( fieldName ) {
		return this.modifiedData.hasOwnProperty( fieldName );
	},
	
	
	/**
	 * Retrieves all {@link Kevlar.data.Field Field} values held by the Model whose values have been changed since the last
	 * {@link #commit} or {@link #rollback}.
	 * 
	 * @method getChanges
	 * @return {Object} A hash of the fields that have been changed since the last {@link #commit} or {@link #rollback}.
	 *   The hash's property names are the field names, and the hash's values are the new values.
	 */
	getChanges : function() {
		var modifiedData = this.modifiedData,
		    changes = {};
			
		for( var fieldName in modifiedData ) {
			if( modifiedData.hasOwnProperty( fieldName ) ) {
				changes[ fieldName ] = this.get( fieldName );
			}
		}		
		return changes;
	},
	
	
	/**
	 * Commits dirty fields' data. Data can no longer be reverted after a commit has been performed. Note: When developing with a {@link #proxy},
	 * this method should normally not need to be called explicitly, as it will be called upon the successful persistence of the Model's data
	 * to the server.
	 * 
	 * @method commit
	 */
	commit : function() {
		this.modifiedData = {};  // reset the modifiedData hash. There is no modified data.
		this.dirty = false;
	},
	
	
	/**
	 * Rolls back the Model fields that have been changed since the last commit or rollback.
	 * 
	 * @method rollback
	 */
	rollback : function() {
		// Loop through the modifiedData hash, which holds the *original* values, and set them back to the data hash.
		var modifiedData = this.modifiedData;
		for( var fieldName in modifiedData ) {
			if( modifiedData.hasOwnProperty( fieldName ) ) {
				this.data[ fieldName ] = modifiedData[ fieldName ];
			}
		}
		
		this.modifiedData = {};
		this.dirty = false;
	},
	
	
	// --------------------------------
	
	
	/**
	 * Sets the {@link #proxy} to use to persist the Model's data.
	 * 
	 * @method setProxy
	 * @param {Kevlar.data.AbstractProxy} proxy
	 */
	setProxy : function( proxy ) {
		this.proxy = proxy;
	},
	
	
	/**
	 * Persists the Model data to the backend, using the configured {@link #proxy}. If the request to persist the Model's data is successful,
	 * the Model's data will be {@link #commit committed}.
	 * 
	 * @method save
	 * @param {Object} [options] An object which may contain the following properties:
	 * @param {Boolean} [options.async=true] True to make the request asynchronous, false to make it synchronous.
	 * @param {Function} [options.success] Function to call if the save is successful.
	 * @param {Function} [options.failure] Function to call if the save fails.
	 * @param {Function} [options.complete] Function to call when the operation is complete, regardless of a success or fail state.
	 * @param {Object} [options.scope=window] The object to call the `success`, `failure`, and `complete` callbacks in.
	 */
	save : function( options ) {
		options = options || {};
		
		// No proxy, cannot save. Throw an error
		if( !this.proxy ) {
			throw new Error( "Kevlar.data.Model::save() error: Cannot save. No configured proxy." );
		}
		
		
		var changedData = this.getChanges(),
		    allData = this.getAll();   // note: returns a shallow copy of the data so that we can modify the object's properties
		
		
		// Set the data to persist, based on if the proxy supports incremental updates or not
		var dataToPersist;
		if( this.proxy.supportsIncrementalUpdates() ) {
			dataToPersist = changedData;  // supports incremental updates, we can just send it the changes
		} else {
			dataToPersist = allData;      // does not support incremental updates, provide all data
		}
		
		
		// Remove properties from the dataToPersist that relate to the fields that have persist: false.
		var fields = this.fields;
		for( var fieldName in fields ) {
			if( fields.hasOwnProperty( fieldName ) && fields[ fieldName ].persist === false ) {
				delete dataToPersist[ fieldName ];
				delete changedData[ fieldName ];   // used to determine if we need to persist the data at all (next). This will be the same object in the case that the proxy supports incremental updates, but no harm in doing this.
			}
		}
		
		
		// Short Circuit: If there is no changed data in any of the fields that are to be persisted, there is no need to run a request. Run the 
		// success callback and return out.
		if( Kevlar.Object.isEmpty( changedData, /* filterPrototype */ true ) ) {
			if( typeof options.success === 'function' ) {
				options.success.call( options.scope || window );
			}
			if( typeof options.complete === 'function' ) {
				options.complete.call( options.scope || window );
			}
			return;
		}
		
		
		// Store a "snapshot" of the data that is being persisted. This is used to compare against the Model's current data at the time of when the persistence operation 
		// completes. Anything that does not match this persisted snapshot data must have been updated while the persistence operation was in progress, and the Model must 
		// be marked as dirty for those fields after its commit() runs. This is a bit roundabout that a commit() operation runs when the persistence operation is complete
		// and then data is manually modified, but this is also the correct time to run the commit() operation, as we still want to see the changes if the request fails. 
		// So, if a persistence request fails, we should have all of the data still marked as dirty, both the data that was to be persisted, and any new data that was set 
		// while the persistence operation was being attempted.
		var persistedData = Kevlar.Object.clone( this.data );
		
		var successCallback = function() {
			// The request to persist the data was successful, commit the Model
			this.commit();
			
			// Loop over the persisted snapshot data, and see if any Model attributes were updated while the persistence request was taking place.
			// If so, those fields should be marked as modified, with the snapshot data used as the "originals". See the note above where persistedData was set. 
			var currentData = this.getAll();
			for( var fieldName in persistedData ) {
				if( persistedData.hasOwnProperty( fieldName ) && !Kevlar.Object.isEqual( persistedData[ fieldName ], currentData[ fieldName ] ) ) {
					this.modifiedData[ fieldName ] = persistedData[ fieldName ];   // set the last persisted value on to the "modifiedData" object. Note: "modifiedData" holds *original* values, so that the "data" object can hold the latest values. It is how we know a field is modified as well.
					this.dirty = true;
				}
			}
			
			
			if( typeof options.success === 'function' ) {
				options.success.call( options.scope || window );
			}
		};
		
		var failureCallback = function() {
			if( typeof options.failure === 'function' ) {
				options.failure.call( options.scope || window );
			}
		};
		
		var completeCallback = function() {
			if( typeof options.complete === 'function' ) {
				options.complete.call( options.scope || window );
			}
		};
		
		var proxyOptions = {
			async    : ( typeof options.async === 'undefined' ) ? true : options.async,   // defaults to true
			success  : successCallback,
			failure  : failureCallback,
			complete : completeCallback,
			scope    : this
		};
		
		// Make a request to update the data on the server
		this.proxy.update( dataToPersist, proxyOptions );
	}
	
} );

/**
 * @class Kevlar.data.RestProxy
 * @extends Kevlar.data.AbstractProxy
 * 
 * RestProxy is responsible for performing CRUD operations in a RESTful manner for a given Model on the server.
 * 
 * @constructor
 * @param {Object} config The configuration options for this class, specified in an object (hash).
 */
/*global window, jQuery, Kevlar */
Kevlar.data.RestProxy = Kevlar.extend( Kevlar.data.AbstractProxy, {
	
	/**
	 * @cfg {String} url
	 * The url to use in a RESTful manner to perform CRUD operations.
	 */
	url : "",
	
	/**
	 * @cfg {String} wrapperProperty
	 * If PUT'ing to the server requires the data to be wrapped in a property of its own, use this config
	 * to specify it. Ex: PUT'ing a Blockquote's data needs to look like this:<pre><code>
{
	"blockquote" : {
		"text" : "hello",
		"picture" : {
			"url" : "http://..."
		}
	}
}
	 * </pre></code>
	 * 
	 * This config should be set to "blockquote" in this case.
	 */
	
	
	/**
	 * Creates a Model on the server.
	 * 
	 * @method create
	 * @param {Kevlar.data.Model} The Model instance to create on the server.
	 */
	create : function() {
		throw new Error( "create() not yet implemented" );
	},
	
	
	/**
	 * Reads a Model from the server.
	 * 
	 * @method read
	 * @param {Kevlar.data.Model} The Model instance to read from the server.
	 */
	read : function() {
		throw new Error( "read() not yet implemented" );
	},
	
	
	/**
	 * Updates the given Model on the server.  This method uses "incremental" updates, in which only the changed fields of the `model`
	 * are persisted.
	 * 
	 * @method update
	 * @param {Object} data The data, provided in an Object, to persist to the server. This should only be the "changed" properties in the Model,
	 *   as RestProxy supports incremental updates.
	 * @param {Object} [options] An object which may contain the following properties:
	 * @param {Boolean} [options.async=true] True to make the request asynchronous, false to make it synchronous.
	 * @param {Function} [options.success] Function to call if the update is successful.
	 * @param {Function} [options.failure] Function to call if the update fails.
	 * @param {Function} [options.complete] Function to call regardless of if the update is successful or fails.
	 * @param {Object} [options.scope=window] The object to call the `success`, `failure`, and `complete` callbacks in.
	 */
	update : function( data, options ) {
		options = options || {};
		
		var dataToPersist;
		
		// Handle needing a "wrapper" object for the data
		if( this.wrapperProperty ) {
			dataToPersist = {};
			dataToPersist[ this.wrapperProperty ] = data;
		} else {
			dataToPersist = data;
		}
		
		jQuery.ajax( {
			async: ( typeof options.async === 'undefined' ) ? true : options.async,  // async defaults to true.
			
			url : this.url,
			type : 'PUT',
			headers : {
				// NOTE: not providing this, as the server doesn't actually return JSON, causing jQuery to not call the 'success' callback due to it 
				// not being able to parse the JSON. Only uncomment temporarily if getting a 422 - "unprocessable entity" status code, to see the 
				// actual errors on the server.
				//'Accept' : 'application/json' 
			},
			contentType: "application/json",
			data : JSON.stringify( dataToPersist ),
			
			success  : options.success  || Kevlar.emptyFn,
			error    : options.failure  || Kevlar.emptyFn,
			complete : options.complete || Kevlar.emptyFn,
			context  : options.scope    || window
		} );
	},
	
	
	/**
	 * Destroys (deletes) the Model on the server. This method is not named "delete" as "delete" is a JavaScript reserved word.
	 * 
	 * @method destroy
	 * @param {Kevlar.data.Model} The Model instance to delete on the server.
	 */
	destroy : function() {
		throw new Error( "destroy() not yet implemented" );
	},
	
	
	// ---------------------------------------------
	
	
	/**
	 * Method used by {@link Kevlar.data.Model Model's} to determine if the Proxy supports incremental updates. This proxy returns true,
	 * so that it is only provided the set of changed data to its {@link #update} method, instead of the full set of data in the Model.
	 * 
	 * @method supportsIncrementalUpdates
	 * @return {Boolean} True if the Proxy supports incremental updates, false otherwise.
	 */
	supportsIncrementalUpdates : function() {
		return true;
	}
	
} );

/**
 * @class Kevlar.Object
 * @singleton
 * 
 * Utility class for methods relating to Object functionality.
 */
/*global Kevlar */
Kevlar.Object = {
	
	/**
	 * Clones an object.  Will only clone regular objects and arrays, and not objects created from a constructor
	 * function (unless the constructor function takes no arguments).
	 * 
	 * @method clone
	 * @param {Object} obj
	 * @param {Boolean} [deep=true] True to make a deep (recursive) copy. Set to false if only a shallow copy is desired.
	 * @return {Object} The cloned object.
	 */
	clone : function( obj, deep ) {
		// 'deep' argument missing, assume true
		if( typeof deep === 'undefined' ) {
			deep = true;
		}
		
		var c;
		// Non objects aren't passed by reference, so just send it back.
		if( typeof obj !== 'object' || obj === null ) {
			return obj;
		}
		
		c = new obj.constructor(); 
		
		// copy properties owned by the object (do not copy prototype properties)
		for( var p in obj ) {
			if( obj.hasOwnProperty( p ) ) {
				c[p] = deep ? Kevlar.Object.clone( obj[p], true ) : obj[p];  // note: no 'this' reference (as in this.clone()), for friendly out of scope calls
			}
		}
		
		return c;
	},
	
	
	/** 
	 * Tests if `a` and `b` are equal.
	 * 
	 * @method isEqual
	 * @param {Object} a
	 * @param {Object} b
	 * @param {Boolean} [deep=true] If true, will do a deep compare of objects/arrays. Set to false for a shallow compare.
	 * @return {Boolean}
	 */
	isEqual: function( a, b, deep ) {
		if( typeof deep === 'undefined' ) {
			deep = true;
		}
		
		if( typeof a !== typeof b ) { return false; }
		
		if( typeof a !== 'object' ) {
			// simple types
			if( a !== b ) { return false; }
			
		} else {
			if( a === null && a !== b ) { return false; }
			
			// Make sure there are the same number of keys in each object
			var objLength = Kevlar.Object.objLength;  // no 'this' reference for friendly out of scope calls
			if( objLength( a ) !== objLength( b ) ) { return false; }
			
			for (var p in a) {
				if(typeof(a[p]) !== typeof(b[p])) { return false; }
				if((a[p]===null) !== (b[p]===null)) { return false; }
				switch (typeof(a[p])) {
					case 'undefined':
						if (typeof(b[p]) != 'undefined') { return false; }
						break;
					case 'object':
						if( a[p]!==null && b[p]!==null && ( a[p].constructor.toString() !== b[p].constructor.toString() || ( deep ? !Kevlar.Object.isEqual(a[p], b[p] ) : false ) ) ) {  // NOTE: full call to Kevlar.Object.isEqual (instead of this.isEqual) to allow for friendly out-of-scope calls 
							return false;
						}
						break;
					case 'function':
						if(a[p].toString() != b[p].toString()) { return false; }
						break;
					default:
						if (a[p] !== b[p]) {
							return false;
						}
				}
			}
		}
		return true;
	},
	
	
	/**
	 * Returns the number of properties that are in a given object. Does not include
	 * the number of properties on the object's prototype.
	 * 
	 * @method objLength
	 * @param {Object} obj
	 * @return {Number}
	 */
	objLength: function( obj ) {
		var result = 0;
		for( var item in obj ) {
			if( obj.hasOwnProperty( item ) ) {
				result++;
			}
		}
		return result;
	},
	
	
	
	/**
	 * Tests if an object is empty (i.e. has no "owned" properties). Properties
	 * on the object's prototype will not be included in the check.
	 * 
	 * @method isEmpty
	 * @param {Object} obj
	 * @return {Boolean}
	 */
	isEmpty : function( obj ) {
		for( var i in obj ) {
			if( obj.hasOwnProperty( i ) ) {
				return false;
			}
		}
		return true;
	}
	
};

/**
 * @class ui.anim.Animation
 * @extends Kevlar.util.Observable
 * 
 * A class that encapsulates a single animation of a given HTMLElement, jQuery wrapped set, or {@link ui.Component}.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.anim.Animation = Kevlar.extend( Kevlar.util.Observable, {
	
	/**
	 * @cfg {HTMLElement/jQuery/ui.Component} target (required)
	 * The target element(s) to animate. In the case of a {@link ui.Component}, the Component's {@link ui.Component#getEl getEl}
	 * method is run to retrieve the element to animate.  
	 */
	
	/**
	 * @cfg {String/Object} effect (required)
	 * One of the jQuery UI effects to use for the animation. See 
	 * <a href="http://docs.jquery.com/UI/Effects">http://docs.jquery.com/UI/Effects</a> for a list of
	 * effects.<br><br>
	 * 
	 * If specific options are required for the effect, this config may be specified as an object (hash) of keys/values.
	 * The key 'type' is required in this case, for the name of the effect. For a list of options for effects, see the link for the 
	 * particular {@link #effect} you are using here: <a href="http://docs.jquery.com/UI/Effects">http://docs.jquery.com/UI/Effects</a>, 
	 * and then scroll down to the 'Arguments' section for the additional options that can be used in this hash. Ex:
	 * <pre><code>effect : { type: 'slide', direction: 'up', mode: 'show' }</code></pre>
	 * 
	 * Note: This config is mutually exclusive with the {@link #to} config, and override it if provided.
	 */
	
	/**
	 * @cfg {Object} from
	 * A hash of CSS properties to start the animation from (i.e. these are set at the start of the animation). If
	 * none are provided, the animation animates from the element's current CSS state. 
	 */
	
	/**
	 * @cfg {Object} to (required)
	 * A hash of CSS properties to animate to. Note: this config is mutually exclusive with the {@link #effect} 
	 * config, and will be overridden if an {@link #effect} config is provided.
	 */
	
	/**
	 * @cfg {Number} duration
	 * The duration in milliseconds to run the animation.
	 */
	duration : 250,
	
	/**
	 * @cfg {String} easing
	 * The name of the easing to use to run the animation. Only used if using the {@link #to} config. For a full list 
	 * of available options, see <http://jqueryui.com/demos/effect/#easing>. 
	 */
	easing : 'linear',
	
	/**
	 * @cfg {Function} callback
	 * Callback to run when the animation is complete. This function is called with this Animation instance as its first argument.
	 */
	
	/**
	 * @cfg {Object} scope
	 * The scope to run the {@link #callback} in. Defaults to `window`.
	 */
	
	
	/**
	 * @private
	 * @property $target
	 * @type jQuery
	 * The jQuery wrapped set for the {@link #target}.
	 */
	
	/**
	 * @private
	 * @property running
	 * @type Boolean
	 * Flag to determine if the animation is currently running. Because this class's {@link #target} can be multiple elements, and
	 * because jQuery's animate() function calls its complete() callback once per each element, we need this flag to be able to set
	 * it back to false when the first complete() call is made. We don't want to run the {@link #end} method once for each element,
	 * just once for all elements as a whole.  
	 */
	running : false,
	
	/**
	 * @private
	 * @property complete
	 * @type Boolean
	 * Flag that is set to true once the animation is complete.
	 */
	complete : false,
	
	
	constructor : function( config ) {
		Kevlar.apply( this, config );
		
		// Call the superclass (Observable) constructor
		ui.anim.Animation.superclass.constructor.call( this );
		
		
		this.addEvents(
			/**
			 * @event beforeanimate
			 * Fires just before the animation starts. Handlers of this event may return false to
			 * prevent the animation from starting.
			 * @param {ui.anim.Animation} animation This Animation instance.
			 */
			'beforeanimate',
			
			/**
			 * @event afteranimate
			 * Fires when the animation completes.
			 * @param {ui.anim.Animation} animation This Animation instance.
			 */
			'afteranimate'
		);
		
		// Make sure there is a 'target' config, and normalize it if need be
		if( !this.target ) {
			throw new Error( "ui.anim.Animation: Error. No 'target' config provided" );
		} else if( this.target instanceof ui.Component ) {
			this.$target = jQuery( this.target.getEl() );
		} else {
			this.$target = jQuery( this.target );
		}
		delete this.target;
		
		// Make sure there is a 'to' config, or an 'effect' config
		if( !this.to && !this.effect ) {
			throw new Error( "ui.anim.Animation: Error. No 'to' or 'effect' config provided" );
		}
	},
	
	
	/**
	 * Starts the animation.
	 * 
	 * @method start
	 */
	start : function() {
		if( !this.running && !this.complete && this.fireEvent( 'beforeanimate', this ) !== false ) {
			this.running = true;
			
			// If the 'from' config was provided with CSS properties, apply them now
			if( this.from ) {
				this.$target.css( this.from );
			}
			
			// If the 'effect' config was provided, use that. Otherwise, animate to the 'to' config.
			if( this.effect ) {
				var effectType, effectOptions;
				if( typeof this.effect === 'object' ) {
					effectType = this.effect.type;
					effectOptions = this.effect;  // can just use the object itself with the 'type' property. 'type' be ignored by jQuery UI 
					
				} else {  // 'effect' was provided as a string
					effectType = this.effect;
					effectOptions = {};
				}
				
				// Run the effect
				this.$target.effect( effectType, effectOptions, this.duration, this.onLastFrame.createDelegate( this ) );
				
			} else {
				this.$target.animate( this.to, {
					duration : this.duration,
					easing   : this.easing,
					complete : this.onLastFrame.createDelegate( this )  // run the 'end' method in the scope of this class, not the DOM element that has completed its animation
				} );
			}
		}
	},
	
	
	/**
	 * Determines if the animation is currently running.
	 * 
	 * @method isRunning
	 * @return {Boolean} True if the animation is currently running, false otherwise.
	 */
	isRunning : function() {
		return this.running;
	},
	
	
	/**
	 * Determines if the animation is complete.
	 * 
	 * @method isComplete
	 * @return {Boolean} True if the animation has completed.
	 */
	isComplete : function() {
		return this.complete;
	},
	
	
	/**
	 * Pre-emptively ends the animation, if it is running, jumping the {@link #target} element(s) to their 
	 * "end of animation" state.
	 * 
	 * @method end
	 */
	end : function() {
		if( this.running ) {
			this.$target.stop( /* clearQueue */ false, /* jumpToEnd */ true );
			
			this.onLastFrame();
		}
	},
	
	
	/**
	 * Cleans up the Animation object after the last frame has been reached, and calls the {@link #callback} if one
	 * was provided.
	 * 
	 * @private
	 * @method onLastFrame
	 */
	onLastFrame : function() {
		if( this.running ) {
			// set this flag first, so stopping the animation does not enter this block again from another call to this method 
			// (in case the animation is stopped before it is complete, and we don't need it called for each element that is animated)
			this.running = false;
			this.complete = true;
			
			if( typeof this.callback === 'function' ) {
				this.callback.call( this.scope || window, this );
			}
			this.fireEvent( 'afteranimate', this );
			
			// Remove references to elements
			delete this.$target;
		}
	}
	
} );

/**
 * @class ui.ButtonSet
 * @extends ui.Component
 * @mixin ui.DataControl
 * 
 * A ButtonSet component used basically as a set of radio buttons, where only one can be toggled.<br><br>
 * 
 * The ButtonSet's options acts much like a Dropdown (select element), where each option has a 'text' property, and a 'value' property.
 * This is to make the changing of the displayed option robust for data management, where the 'value' is independent from 'text' and 
 * can remain the same when the 'text' is changed.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.ButtonSet = Kevlar.extend( ui.Component, [ ui.DataControl ], {
	
	/**
	 * @cfg {Array/Function} options (required) 
	 * The options for the ButtonSet, which creates the buttons based on this config. This config is required.<br><br>
	 * 
	 * If this is a flat array, the values will be used as both the value and text
	 * of the ButtonSet options.  Ex: <pre><code>[ "Yes", "No" ]</code></pre>
	 * 
	 * If you want to customize the value and text separately for each option (recommended), provide an array of objects, where the object has two
	 * properties: `text` and `value`. Ex: <pre><code>[ { "text": "Yes", "value": "yes" }, { "text": "No", "value": "no" } ]</code></pre>
	 * 
	 * If this config is specified as a function, the function will be executed, and its return will be used as the options. Its return should match one of
	 * the array forms defined above.
	 */
		
	/**
	 * @cfg {Mixed} value
	 * The initial selected value (button) for the ButtonSet. Must match an option given by the {@link #options} config. If this config is
	 * not provided, this will default to the value of the first option defined in the {@link #options} config. 
	 */	
	
	
	/**
	 * @private
	 * @property buttonSetTpl
	 * @type String
	 * The template for the HTML to create for each of the buttons.
	 */
	buttonSetTpl : '<input type="radio" id="<%=id%>_<%=num%>" name="buttonSet_<%=id%>" value="<%=value%>" title="<%=text%>" <% if( checked ) { %>checked<% } %>><label for="<%=id%>_<%=num%>"><%=text%></label>',
	
	
	/**
	 * @private
	 * @property optionsStore
	 * The OptionsStore instance used for managing the ButtonSet's options.
	 * @type ui.utils.OptionsStore
	 */

	// protected
	initComponent : function() {		
		this.addEvents( 
			/**
			 * @event change
			 * Fires when the ButtonSet's state has changed.
			 * @param {ui.ButtonSet} ButtonSet This ButtonSet instance.
			 * @param {String} value The new value of the ButtonSet.
			 */
			'change'
		);
		
		// Create the OptionsStore for managing the 'options'
		this.optionsStore = new ui.utils.OptionsStore( this.options );
		
		// Make sure that options were provided
		if( this.optionsStore.getOptions().length === 0 ) {
			throw new Error( "Error: The ButtonSet's 'options' was not configured." );
		}
		
				
		if( typeof this.value === 'undefined' ) {
			// No 'value' provided, set the value to the value of the first option
			this.value = this.optionsStore.getOptions()[ 0 ].value;
			
		} else {
			// A 'value' was provided, make sure it is in the options store. If not, 
			// set it to the value of the first option. This guarantees that the ButtonSet's
			// value is always set to a valid option
			if( this.optionsStore.getByValue( this.value ) === null ) {
				this.value = this.optionsStore.getOptions()[ 0 ].value;
			}
		}
		
		
		// Call superclass initComponent
		ui.ButtonSet.superclass.initComponent.call( this );
		
		// Call mixin class constructors
		ui.DataControl.constructor.call( this );
	},


	// protected
	onRender : function() {
		ui.ButtonSet.superclass.onRender.apply( this, arguments );
		
		// Add the 'change' handler to the element, which will be run when any of the buttons (radios) are clicked on
		this.$el.change( this.onChange.createDelegate( this ) );
		
		// Create the initial options html
		this.redrawOptions();
	},
	
	
	/**
	 * Handles a change (click) to the selected button in the button set.
	 * 
	 * @private
	 * @method onChange
	 * @param {jQuery.Event} evt
	 */
	onChange : function( evt ) {
		this.fireEvent( 'change', this, this.getValue() );
		this.onDataChange();    // call method from DataControl mixin, which will fire the datachange event for the DataControl.
	},
	
	
	// ------------------------------------------
	
	
	/**
	 * Sets the options for the ButtonSet. Normalizes the options into an array of objects, where each object
	 * has the properties 'text' and 'value'.  See the {@link #options} config for accepted formats to the `options`
	 * parameter. 
	 * 
	 * @method setOptions
	 * @param {Array/Function} options See the {@link #options} config for the accepted formats of this parameter.
	 */
	setOptions : function( options ) {
		// Store the options in the OptionsStore
		this.optionsStore.setOptions( options );
		
		// Update the ButtonSet's options based on the newly set options (if the ButtonSet field is rendered)
		this.redrawOptions();
	},
	
	
	/**
	 * Retrieves the options of the ButtonSet. This returns an array of objects, where the objects have 
	 * properties `text` and `value`. Example of a returned array:
	 * <pre><code>[ { text: "Option 1", value: "1" }, { text: "Option 2", value: "2" } ]</code></pre><br>
	 * 
	 * Note that even if the options' values are specified as numbers, they will be converted to strings
	 * (as strings are the only allowable values for the option tag).
	 *
	 * @method getOptions
	 * @return {Array}
	 */
	getOptions : function() {
		return this.optionsStore.getOptions();
	},
	
	
	/**
	 * Redraws the displayed options in the buttonset, based on the current options set by setOptions().
	 * 
	 * @private
	 * @method redrawOptions
	 */
	redrawOptions : function() {
		if( this.rendered ) {
			var options = this.getOptions(),
			    buttonSetTpl = this.buttonSetTpl,
			    $el = this.$el,
			    i, len;
			
			// Destroy the jQuery UI buttonset on the element, if it exists, and then remove all elements
			$el.buttonset( "destroy" );
			$el.empty();
			
			var markup = "";
			for( i = 0, len = options.length; i < len; i++ ) {
				var option = options[ i ],
				    tplData = {
						id      : this.id,
						num     : i,
						text    : option.text,
						value   : 'radio' + i, // NOTE: using .data() (below) to store the actual value, so that a value of any datatype can be stored (not just a string). However, the value attribute is required for radio inputs. 
						checked : ( option.value === this.value )  // the radio should be "checked" if its value matches the 'value' config/property
					};
				
				markup += Kevlar.util.tmpl( buttonSetTpl, tplData );
			}
			
			// Append the new markup (radio buttons) to the div
			$el.append( markup );
			
			// Now add the data to each of the radio input elements for their value (now that they are appended and created into DOM elements).
			// Using .data() to be able to store a value of any datatype, not just a string.
			var $inputs = $el.find( 'input' );
			for( i = 0, len = $inputs.length; i < len; i++ ) {
				jQuery( $inputs[ i ] ).data( 'value', options[ i ].value );
			}
			
			// (Re)initialize the jQuery UI buttonset
			$el.buttonset();
		}
	},
	
	
	/**
	 * Sets the button that is to be selected. If the provided `value` is not an option, the ButtonSet will remain unchanged.
	 * 
	 * @method setValue
	 * @param {String} value The value of the button that is to be selected in the ButtonSet.
	 */
	setValue : function( value ) {
		if( typeof value === 'undefined' || value === null ) {
			return;
		}
		
		// If there is an option with the provided value, set it. Otherwise, we don't set anything.
		var option = this.optionsStore.getByValue( value );
		if( option !== null ) {
			// store the value regardless of if the Component has been rendered or not
			this.value = value;
			
			if( !this.rendered ) {
				// buttonset is not rendered, call onChange directly, to fire the events
				this.onChange();
				
			} else {
				// First, reset all of the radios to unchecked. Then, set the checked attribute on
				// the correct hidden input itself, and simulate a change event on it so that the buttonset is updated (if it's rendered), 
				// and the onLinkTypeChange method runs (which updates the overlay to the correct form-fields state).
				var $radios = this.$el.find( ':radio' );
				$radios.prop( 'checked', false );
				
				for( var i = 0, len = $radios.length; i < len; i++ ) {
					var $radio = jQuery( $radios[ i ] );
					
					if( $radio.data( 'value' ) === value ) {
						$radio.prop( 'checked', true );
						$radio.change();  // simulated event to get the jQuery UI buttonset to trigger a change
						
						break;
					}
				}
			}
		}
	},
	
	
	/**
	 * Retrieves the value of the currently selected button (option) in the ButtonSet.
	 * 
	 * @method getValue
	 * @return {String} The value of the button (option) that is selected in the ButtonSet.
	 */
	getValue : function() {
		if( !this.rendered ) {
			// Buttonset is not rendered, return the configured value. If there was no configured value
			// or an invalid configured value, it defaults to the value of the first option 
			return this.value;
			
		} else {
			// Buttonset is rendered, we can return the value right from the radio itself
			return this.$el.find( ':radio:checked' ).data( 'value' );
		}
	},
	
	
	// --------------------------------
	
	
	// Implementation of ui.DataControl mixin interface
	setData : function() {
		this.setValue.apply( this, arguments );
	},
	getData : function() {
		return this.getValue();
	}

} );


// Register the type so it can be created by the string 'ButtonSet' in the manifest
ui.ComponentManager.registerType( 'ButtonSet', ui.ButtonSet );

/**
 * @class ui.ColorPicker
 * @extends ui.Component
 * @mixin ui.DataControl
 * 
 * A ColorPicker component that uses the jQuery ColorPicker plugin behind the scenes.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.ColorPicker = Kevlar.extend( ui.Component, [ ui.DataControl ], {
	
	/**
	 * @cfg {String} color
	 * The color value (in hex) for the initial color, including the '#' sign. 
	 * Defaults to "#0000FF" (blue).
	 */
	color : '#0000FF',
	

	// protected
	initComponent : function() {
		this.addEvents( 
			/**
			 * @event change
			 * Fires when the color has changed.
			 * @param {ui.ColorPicker} colorPicker This ui.ColorPicker instance.
			 * @param {String} color The new color value, in hex, including the # sign. Ex: "#0000FF"
			 */
			'change'
		);
		
		this.cls += ' ui-colorPicker';
		
		// Normalize the provided color config
		if( this.color ) {
		    this.color = this.normalizeColorValue( this.color );
		}
		
		
		// Call superclass initComponent
		ui.ColorPicker.superclass.initComponent.call( this );
		
		// Call mixin class constructors
		ui.DataControl.constructor.call( this );
	},


	// protected
	onRender : function() {
		ui.ColorPicker.superclass.onRender.apply( this, arguments );
		
		var $el = this.$el;

		// Create the "selected color" element, which shows the currently selected color
		this.$selectedColorEl = jQuery( '<div class="ui-colorPicker-selectedColor" style="background-color: ' + this.color + '" />' )
			.appendTo( $el );
	   
		
		// Create the jQuery UI ColorPicker plugin on the main (outer) element
		$el.ColorPicker( {
			color: this.color,
			
			onShow: function( colorPickerEl ) {
				jQuery( colorPickerEl ).fadeIn( 500 );
				return false;
			},
			onHide: function( colorPickerEl ) {
				jQuery( colorPickerEl ).fadeOut( 500 );
				return false;
			},
			onChange: this.onChange.createDelegate( this )
		} );
	},
	
	
	/**
	 * Handles a change to the color by the user from the colorpicker plugin itself.
	 * 
	 * @private
	 * @method onChange
	 * @param {Object} hsb The hsb value of the color, inside an object with properties 'h', 's', and 'b'.
	 * @param {String} hex The hex value of the color, without its prefixed '#' sign.
	 * @param {String} rgb The RGB value of the color, inside an object with properties 'r', 'g', and 'b'.
	 */
	onChange : function( hsb, hex, rgb ) {
		this.updateStoredColorValue( '#' + hex );
	},
	
	
	// --------------------------------------------
	
	
	/**
	 * Private helper method to normalize a color value, adding the '#' sign if it is missing, and converting shorthand
	 * colors (i.e. "#FFF") to longhand form (i.e. "#FFFFFF")
	 * 
	 * @private
	 * @method normalizeColorValue
	 * @param {String} color The color to normalize.
	 * @return {String} The normalized color value.
	 */
	normalizeColorValue : function( color ) {
	    // Add the # if it wasn't provided
        if( color.charAt( 0 ) !== '#' ) {
            color = '#' + color;
        }
        
        // If the color has been specified as the shorthand 3 hex value color (ex: "#FFF"), expand it into the 6 hex 
        // value color (i.e. "#FFFFFF") for the ColorPicker plugin
        if( color.length === 4 ) {
            var shortHexColor = color.substr( 1 );  // get the 3 hex values
            color = "#";  // reset the color string back to just its start '#' sign.
            
            // "double up" the shorthand hex color values
            for( var i = 0; i < 3; i++ ) {
                var hexVal = shortHexColor[ i ].toString();   // note: need to convert shorthand hex numbers to strings, so they get concatenated instead of added
                color += hexVal + hexVal;
            }
        }
        
        return color;
	},
	
	
	/**
	 * Private helper method which stores the color value, updates the color of the ui.ColorPicker control itself (not
	 * the colorpicker plugin; the "swatch" that the user clicks on), and notifies subscribers of the change by firing 
	 * the {@link #change} and {@link ui.DataControl#datachange} events.  This method is called when {@link #setColor} 
	 * is called, and when the user changes the color value in the colorpicker itself (via the {@link #onChange} method).
	 * 
	 * @private
	 * @method updateStoredColorValue
	 * @param {String} color The hex value of the color, including the '#' sign.
	 */
	updateStoredColorValue : function( color ) {
		this.color = color;  // Note: no need to normalize the color value here. This method is always called with the normalized value.
		
		if( this.rendered ) {
			// Update the ColorPicker's "selected color" element, if the Component is rendered
			this.$selectedColorEl.css( 'background-color', color );
		}
		
		this.fireEvent( 'change', this, color );
		this.onDataChange();  // call method in DataControl mixin, which fires its 'datachange' event
	},
	
	
	// --------------------------------------------
	
	
	/**
	 * Sets the color in the ColorPicker.
	 * 
	 * @method setColor
	 * @param {String} color The hex value of the color, including the '#' sign. Accepts shorthand colors as well (ex: "#FFF")
	 */
	setColor : function( color ) {
	    // First, normalize the color value
		color = this.normalizeColorValue( color );
		
		if( this.rendered ) {
			// Update the color picker plugin itself when this public-facing method is called
			this.$el.ColorPickerSetColor( color );
		}
		
		// Store the value, and fire the events
		this.updateStoredColorValue( color );
	},
	
	
	/**
	 * Retrieve the currently selected color, in hex.
	 * 
	 * @method getColor
	 * @return {String} The hex value of the color, including the '#' sign.
	 */
	getColor : function() {
		return this.color;
	},
	
	
	
	// protected
	onDestroy : function() {
		if( this.rendered ) {
			this.$el.ColorPickerDestroy();
		}
		
		ui.ColorPicker.superclass.onDestroy.apply( this, arguments );
	},
	
	
	// --------------------------------
	
	
	// Implementation of ui.DataControl mixin interface
	setData : function() {
		this.setColor.apply( this, arguments );
	},
	getData : function() {
		return this.getColor();
	}

} );


// Register the type so it can be created by the string 'ColorPicker' in the manifest
ui.ComponentManager.registerType( 'ColorPicker', ui.ColorPicker );

/**
 * @class ui.containers.AccordionContainer
 * @extends ui.Container
 *  
 * Convenience Container class that is pre-configured to use a {@link ui.layouts.AccordionLayout}.  
 * This Container provides easy configuration, and delegation methods to easily use the internal AccordionLayout.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.containers.AccordionContainer = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {Number/ui.Component} activeItem
	 * The item number to set as the initially active item. Defaults to 0 (for the first item). Can also be 
	 * an instantiated {@link ui.Component} that exists in the Container.
	 */
	activeItem : 0,
	
	/**
	 * @cfg {Object} icons
	 * See {@link ui.layouts.AccordionLayout#icons}.
	 */
	
	/**
	 * @cfg {String} iconPosition
	 * See {@link ui.layouts.AccordionLayout#iconPosition}.
	 */
	
	/**
	 * @hide
	 * @cfg {String/Object/ui.layouts.AbstractLayout} layout
	 * A {@link ui.layouts.AccordionLayout} is automatically configured for this subclass.
	 */
	
	
	
	// protected
	initComponent : function() {
		this.addEvents(
			/**
			 * @event itemchange
			 * Fires when the active item has been changed.
			 * @param {ui.containers.AccordionContainer} AccordionContainer This AccordionContainer instance.
			 * @param {ui.Component} item The {@link ui.Component} instance of the item that was activated (shown). 
			 */
			'itemchange'
		);
		
		// Create the AccordionLayout for the Container
		this.layout = new ui.layouts.AccordionLayout( {
			activeItem : this.activeItem,
			
			icons : this.icons,
			iconPosition: this.iconPosition,
			
			listeners : {
				'itemchange' : function( item ) {
					// relay the event from the layout
					this.fireEvent( 'itemchange', this, item );
				},
				scope : this
			}
		} );
		
		ui.containers.AccordionContainer.superclass.initComponent.call( this );
	},
	
	
	/**
	 * Sets the active item on the AccordionLayout.
	 * 
	 * @method setActiveItem
	 * @param {ui.Component/Number} item The ui.Component to set as the active item, or the item index to set as the active item (0 for the first item).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 */
	setActiveItem : function( item ) {
		this.getLayout().setActiveItem( item );
	},
	
	
	/**
	 * Gets the active item from the AccordionLayout.
	 * 
	 * @method getActiveItem
	 * @return {ui.Component} The Component that is currently shown as the active item. Returns null if there is no active item.
	 */
	getActiveItem : function() {
		return this.getLayout().getActiveItem();
	},
	
	
	/**
	 * Gets the active item index from the AccordionLayout (i.e. the 0-based tab number that is currently selected).
	 * 
	 * @method getActiveItemIndex
	 * @return {Number} The index of the item that is currently shown as the active item. Returns -1
	 *   if there is no active item.
	 */
	getActiveItemIndex : function() {
		return this.getLayout().getActiveItemIndex();
	}
	
} );


// Register the type so it can be created by the string 'Accordion' in the manifest
ui.ComponentManager.registerType( 'Accordion', ui.containers.AccordionContainer );

/**
 * @class ui.containers.CardsContainer
 * @extends ui.Container
 *  
 * Convenience Container class that is pre-configured to use a {@link ui.layouts.CardsLayout} (see description of {@link ui.layouts.CardsLayout CardsLayout).  
 * This Container provides easy configuration, and delegation methods to easily use the internal CardsLayout.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.containers.CardsContainer = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {Number/ui.Component} activeItem
	 * The item number to set as the initially active item. Defaults to 0 (for the first item). Can also be 
	 * an instantiated {@link ui.Component} that exists in the Container.
	 */
	activeItem : 0,
	
	/**
	 * @hide
	 * @cfg {String/Object/ui.layouts.AbstractLayout} layout
	 * A {@link ui.layouts.CardsLayout} is automatically configured for this subclass.
	 */
	
	
	
	// protected
	initComponent : function() {
		this.addEvents(
			/**
			 * @event cardchange
			 * Fires when the active item has been changed.
			 * @param {ui.containers.CardsContainer} cardsContainer This CardsContainer instance.
			 * @param {ui.Component} card The {@link ui.Component} instance of the card that was activated (shown). 
			 */
			'cardchange'
		);
		
		// Create the CardsLayout for the Container
		this.layout = new ui.layouts.CardsLayout( {
			activeItem : this.activeItem,
			
			listeners : {
				'cardchange' : function( card ) {
					// relay the event from the CardsLayout
					this.fireEvent( 'cardchange', this, card );
				},
				scope : this
			}
		} );
		
		ui.containers.CardsContainer.superclass.initComponent.call( this );
	},
	
	
	/**
	 * Sets the active item on the CardsLayout.
	 * 
	 * @method setActiveItem
	 * @param {ui.Component/Number} item The ui.Component to set as the active item, or the item index to set as the active item (0 for the first item).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 */
	setActiveItem : function( item ) {
		this.getLayout().setActiveItem( item );
	},
	
	
	/**
	 * Gets the active item from the CardsLayout.
	 * 
	 * @method getActiveItem
	 * @return {ui.Component} The Component that is currently shown as the active item. Returns null if there is no active item.
	 */
	getActiveItem : function() {
		return this.getLayout().getActiveItem();
	},
	
	
	/**
	 * Gets the active item index from the CardsLayout (i.e. the 0-based tab number that is currently selected).
	 * 
	 * @method getActiveItemIndex
	 * @return {Number} The index of the item that is currently shown as the active item. Returns -1
	 *   if there is no active item.
	 */
	getActiveItemIndex : function() {
		return this.getLayout().getActiveItemIndex();
	}
	
} );


// Register the type so it can be created by the string 'Cards' in the manifest
ui.ComponentManager.registerType( 'Cards', ui.containers.CardsContainer );

/**
 * @class ui.containers.ColumnsContainer
 * @extends ui.Container
 *  
 * A convenience Container class that is automatically created with a {@link ui.layouts.ColumnsLayout}, to 
 * render child containers in columns.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.containers.ColumnsContainer = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {Number/String} columnWidth
	 * A number of pixels, or any valid CSS width for the column.  This config is to be applied to <b>*child items*</b> of the ColumnsContainer,
	 * and not the ColumnsContainer itself. Defaults to 'auto'.
	 */
	
	/**
	 * @hide
	 * @cfg {String/Object/ui.layouts.AbstractLayout} layout
	 * A {@link ui.layouts.ColumnsLayout} is automatically configured for this subclass.
	 */
	
	// protected
	initComponent : function() {
		this.layout = new ui.layouts.ColumnsLayout();
		
		ui.containers.ColumnsContainer.superclass.initComponent.call( this );
	}

} );


// Register the type so it can be created by the string 'Columns' in the manifest
ui.ComponentManager.registerType( 'Columns', ui.containers.ColumnsContainer );

/**
 * @class ui.containers.SectionContainer
 * @extends ui.Container
 *  
 * Container class that renders a section for child containers.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.containers.SectionContainer = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {String} title 
	 * The title for the section. Defaults to an empty string (for no title).
	 */
	title : "",
	
	/**
	 * @cfg {Object} titleStyle
	 * Any additional styles to apply to the title element. Should be an object where the keys are the css property names, and the values are the css values.
	 */
	
	
	/**
	 * @private
	 * @property {jQuery} $contentEl
	 * The element that holds the Section's content.
	 */
	
	
	// protected
	initComponent : function() {
		// Add the "section" class to the Component's outer element
		this.cls += ' dialog-section';
		
		ui.containers.SectionContainer.superclass.initComponent.call( this );
	},
	
	
	// protected
	onRender : function() {
		ui.containers.SectionContainer.superclass.onRender.apply( this, arguments );
		
		// Create an inner element for styling (initially detached - will append after other elements are appended)
		var $innerEl = jQuery( '<div class="dialog-section-inner" />' );
		
		// If a title was specified, add that now
		if( this.title ) {
			var $titleDiv = jQuery( '<div class="dialog-section-title">' + this.title + '</div>' ).prependTo( $innerEl );
			if( this.titleStyle ) {
				$titleDiv.css( this.titleStyle );
			}
		}
		
		// Create the element for the section's content
		this.$contentEl = jQuery( '<div class="dialog-section-content" />' ).appendTo( $innerEl );
		
		// Finally, append the $innerEl
		$innerEl.appendTo( this.$el );
	},
	
	
	/**
	 * Override of {@link ui.Component#getContentTarget} to specify where html content and child components should
	 * be rendered into.  This should be the {@link #$contentEl} for this subclass.
	 * 
	 * @method getContentTarget
	 * @return {jQuery}
	 */
	getContentTarget : function() {
		return this.$contentEl;
	}
	
} );


// Register the type so it can be created by the string 'Section' in the manifest
ui.ComponentManager.registerType( 'Section', ui.containers.SectionContainer );

/**
 * @class ui.containers.TabsContainer
 * @extends ui.Container
 *  
 * Convenience Container class that is pre-configured to use a {@link ui.layouts.TabsLayout}.  
 * This Container provides easy configuration, and delegation methods to easily use the internal TabsLayout.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.containers.TabsContainer = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {Number/ui.Component} activeTab
	 * The tab number, or ui.Component instance to set as the initially active tab. See {@link ui.layouts.TabsLayout} for details.
	 */
	
	/**
	 * @hide
	 * @cfg {String/Object/ui.layouts.AbstractLayout} layout
	 * A {@link ui.layouts.TabsLayout} is automatically configured for this subclass.
	 */
	
	
	// protected
	initComponent : function() {
		this.addEvents(
			/**
			 * @event tabchange
			 * Fires when the active tab has been changed.
			 * @param {ui.containers.TabsContainer} tabsContainer This TabsContainer instance.
			 * @param {ui.Component} tab The {@link ui.Component} instance of the tab that was activated. 
			 */
			'tabchange'
		);
		
		// Create the TabsLayout for the Container
		this.layout = new ui.layouts.TabsLayout( {
			activeTab : this.activeTab,
			
			listeners : {
				'tabchange' : this.onTabChange,
				scope : this
			}
		} );
		
		ui.containers.TabsContainer.superclass.initComponent.call( this );
	},
	
	
	/**
	 * Sets the active tab.
	 * 
	 * @method setActiveTab
	 * @param {ui.Component/Number} tab The ui.Component to set as the active tab, or the tab number to set as the active tab (0 for the first tab).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 */
	setActiveTab : function( tab ) {
		this.getLayout().setActiveTab( tab );
	},
	
	
	/**
	 * Gets the active tab.
	 * 
	 * @method getActiveTab
	 * @return {ui.Component} The Component that is currently shown as the active tab.
	 */
	getActiveTab : function() {
		this.getLayout().getActiveTab();
	},
	
	
	/**
	 * Gets the active tab index (i.e. the 0-based tab number that is currently selected).
	 * 
	 * @method getActiveTab
	 * @return {Number} The index of the tab that is currently shown as the active tab.
	 */
	getActiveTabIndex : function() {
		this.getLayout().getActiveTabIndex();
	},
	
	
	/**
	 * Method that is run when a tab is changed in the {@link #layout}.
	 *
	 * @protected
	 * @method onTabChange
	 * @param {ui.layouts.TabsLayout} tabsLayout The TabsLayout instance.
	 * @param {ui.Component} tab The new tab that was selected (i.e. changed to).
	 * @param {ui.Component} oldTab The old tab that was de-selected (i.e. changed from).
	 */
	onTabChange : function( tabsLayout, tab, oldTab ) {
		// relay the event from the TabsLayout
		this.fireEvent( 'tabchange', this, tab, oldTab );
	}
	
} );


// Register the type so it can be created by the string 'Tabs' in the manifest
ui.ComponentManager.registerType( 'Tabs', ui.containers.TabsContainer );

/**
 * @class ui.Dialog
 * @extends ui.Container
 * 
 * Wrapper for the jQuery UI Dialog, which also provides the functionality
 * of a {@link ui.Container} that may hold child {@link ui.Component Components}, and a few other features such as:
 * <div class="mdetail-params"><ul>
 *   <li>Automatic cleanup of the dialog when it is closed (see the {@link #autoDestroy} config}.</li>
 *   <li>Management of a "content" area, and a bottom bar (which may be used as a footer and/or buttons bar).</li>
 *   <li>
 *     Better management of the {@link #closeOnEscape} feature that jQuery UI normally provides. In regular jQuery UI dialogs, this config
 *     has the effect of when the 'esc' key is pressed, *all* open dialogs are closed (such as when one is opened on top of another), while 
 *     the implementation in this class only closes the dialog that has focus when the 'esc' key is pressed.
 *   </li>
 *   <li>
 *     Automatic dialog sizing based on the window's viewport (the dialog is constrained to the viewport's size), and a window resize handler 
 *     to automatically resize the Dialog when the window size changes.
 *   </li>
 *   <li>A configuration option to easily hide the top-right "close" button that jQuery UI dialogs create. See {@link #closeButton}.</li>
 *   <li>The ability to make the modal overlay be transparent on a per-dialog basis, via configuration. See {@link #overlay}.</li>
 *   <li>
 *     The ability to position the dialog based on an offset from the right side or bottom of the screen. See the {@link #x} and {@link #y}
 *     configs, noting the ability to provide a negative integer to them (which signifies to position from the right side or bottom of the screen).
 *   </li>
 * </ul></div>
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global window, jQuery, Kevlar, ui */
ui.Dialog = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {Boolean} autoDestroy
	 * True by default, the Dialog is destroyed when it is closed for automatic DOM/memory management. However, if
	 * the Dialog is to be reused between many opens/closes (to avoid the overhead of creating new ones), this can be set 
	 * to false so that it can be re-opened after it is closed.  A call to {@link #destroy} must be done manually however
	 * once the Dialog is no longer needed, to clean up its elements and event handlers (which includes its window resize
	 * handler).  
	 */
	autoDestroy : true,
	
	
	/**
	 * @cfg {Boolean} autoOpen
	 * Set to true to automatically open the dialog when it is instantiated. If false, a call to {@link #open} is
	 * required to open the dialog.
	 */
	autoOpen : false,
	
	
	/**
	 * @cfg {Boolean} modal
	 * True to create the dialog as a modal dialog (i.e. everything behind the dialog will be inaccessible).
	 */
	modal : false,
	
	
	/**
	 * @cfg {Boolean} overlay
	 * If the {@link #modal} config is true, this may be set to false to hide the modal's overlay that normally shows behind the
	 * dialog.  The overlay itself won't actually hidden (therefore still making the dialog a modal dialog), but made completely 
	 * transparent instead.<br><br>
	 *
	 * NOTE/TODO: This currently has issues with multiple jQueryUI dialogs with different opacities set, possibly due to other dialogs
	 * (esp. ones created directly, without using this class) changing all overlay opacities, and jQuery UI remembering these states
	 * and re-using them for some reason. Have to investigate.
	 */
	overlay : true,
	
	
	/**
	 * @cfg {Number/String} x
	 * The initial x position of the Dialog. This can be a number defining how many pixels from the left of the screen,
	 * or one of the strings that the jQuery UI Dialog accepts ('center', 'left', 'right', 'top', 'bottom').  This can also be a negative
	 * integer, in which case it will be taken as the number of pixels from the right side of the screen. Ex: A value of -50 will position the 
	 * right side of the dialog 50px from the right side of the screen.
	 */
	x : 'center',
	
	/**
	 * @cfg {Number/String} y
	 * The initial y position of the Dialog. This can be a number defining how many pixels from the top of the screen,
	 * or one of the strings that the jQuery UI Dialog accepts ('center', 'left', 'right', 'top', 'bottom').  This can also be a negative
	 * integer, in which case it will be taken as the number of pixels from the bottom of the screen. Ex: A value of -50 will position the 
	 * bottom of the dialog 50px from the bottom of the screen. 
	 */
	y : 'center',
	
	
	/**
	 * @cfg {Number/String} height
	 * A height to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string.
	 */
	height : 'auto',
	
	/**
	 * @cfg {Number/String} width
	 * A width to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string.
	 */
	width : 'auto',
	
	/**
	 * @cfg {Number/String} minHeight
	 * A minimum height to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string.
	 */
	minHeight : 10,
	
	/**
	 * @cfg {Number/String} minWidth
	 * A minimum width to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string.
	 */
	minWidth : 'auto',
	
	/**
	 * @cfg {Number/String} maxHeight
	 * A maximum height to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing,
	 * but will be constrained to the browser's viewport.  If a maxHeight is given that is larger than the browser's viewport, then the browser's
	 * viewport height will be preferred. 
	 */
	
	/**
	 * @cfg {Number/String} maxWidth
	 * A maximum width to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing,
	 * but will be constrained to the browser's viewport.  If a maxWidth is given that is larger than the browser's viewport, then the browser's
	 * viewport width will be preferred.
	 */
	
	
	/**
	 * @cfg {String/HTMLElement/jQuery/ui.Component} title 
	 * The title for the dialog box to use. Can be a string of text, a string of HTML, a jQuery wrapped set, or a 
	 * {@link ui.Component}.
	 */
	title: '',
	
	
	/**
	 * @cfg {Boolean/ui.Button} closeButton
	 * True to create a close button in the top right of the dialog. When clicked, this button closes the dialog.
	 * Set to false to hide this button.  This config also accepts a ui.Button instance for the button,
	 * but this button must set up its own handler for what to do when clicked (it will simply be placed in the close 
	 * button's position).
	 */
	closeButton : true,
	
	/**
	 * @cfg {Boolean} closeOnEscape
	 * True to have the dialog close when the 'esc' key is pressed. Set to false to disable this behavior. If this config is
	 * true, and the 'esc' key is pressed, the Dialog will close.
	 */
	closeOnEscape : true,
	
	
	/**
	 * @cfg {ui.Button[]} buttons
	 * An array of {@link ui.Button} configs for the main dialog buttons (the buttons that display on the bottom
	 * right of the dialog box). Defaults to an empty array, for no buttons.<br><br>
	 * 
	 * Note that if anonymous config objects are provided to this config, and they do not specify a 'type', they are assumed 
	 * to be of type {@link ui.Button}.
	 */
	buttons : [],
	
	/**
	 * @cfg {String/HTMLElement/jQuery/ui.Component} footer
	 * An HTML string, HTML Element, jQuery wrapped set, or {@link ui.Component} (most likely a {@link ui.Container}) to put
	 * into the footer of the dialog.  The content for the footer will go on the left side of the footer (as Dialog buttons
	 * are pushed to the right side).
	 */
	
	
	/**
	 * @hide 
	 * @cfg {jQuery/HTMLElement} renderTo 
	 * This config should not be specified for this subclass. The Dialog will
	 * automatically be rendered into the document body when it is opened. 
	 */
	
	
	
	/**
	 * @private
	 * @property $dialog
	 * The jQuery UI dialog instance element.
	 * @type jQuery
	 */
	
	/**
	 * @protected
	 * @property $dialogOuter
	 * The dialog's outer element. This will be added after the jQuery UI dialog has been instantiated.
	 * @type jQuery
	 */
		
	/**
	 * @private
	 * @property $dialogInner
	 * The dialog's inner wrapper element, used as an extra layer for styling the dialog's border.
	 * It will be added after the jQuery UI dialog has been instantiated, and positioned directly
	 * inside the outer dialog element (the element created by jQuery UI for the dialog).
	 * @type jQuery
	 */
		
	/**
	 * @private
	 * @property $contentContainer
	 * The content container, where either content HTML or child {@link ui.Component Components} are added.
	 * This is actually just an alias of {@link ui.Component#$el the Component's element}, as the
	 * {@link ui.Component Component's} element is what is used for the dialog's content.
	 * @type jQuery
	 */
	
	/**
	 * @private
	 * @property bottomBarContainer
	 * The {@link ui.Container} instance for holding the {@link #footerContainer} and the {@link #buttonsContainer}, at
	 * the bottom of the Dialog.  This may or may not be shown, depending on if the {@link #footer} or {@link #buttons}
	 * configs are set (if neither are set, the bottom bar will not be shown).  Note that the {@link #buttons} config has
	 * a default however.  To display no buttons, set `buttons: []`
	 * @type ui.Container  
	 */
	
	/**
	 * @private
	 * @property footerContainer
	 * The {@link ui.Container} instance for holding footer content / {@link ui.Component Components}, in the {@link #bottomBarContainer}.
	 * @type ui.Container
	 */
	
	/**
	 * @private
	 * @property buttonsContainer
	 * The {@link ui.Container} instance for holding the main Dialog {@link ui.Button Buttons}, in the {@link #bottomBarContainer}.
	 * @type ui.Container
	 */
	
	/**
	 * @private
	 * @property $overlayEl
	 * The overlay element that jQuery UI creates for modal dialogs. This element will exist only if the {@link #modal}
	 * config is set to true, and after the dialog has been opened.
	 */
	
	/**
	 * @private
	 * @property windowResizeHandler
	 * The scope wrapped function for handling window resizes (which calls the method to resize the dialog accordingly).
	 * This is needed as a property so that we can unbind the window's resize event from the Dialog when the Dialog
	 * is destroyed. 
	 * @type Function
	 */
	
	
	// protected
	initComponent : function() {
		// Workaround for jQuery UI Dialog. Because the jQuery UI Dialog is what should be sized by the width/height configs,
		// and because the jQuery UI Dialog wraps the ui.Component's div element with its own, we don't want the div element 
		// that ui.Component creates to be sized; just the UI Dialog.  So, setting these configs to private dialog-only variables 
		// which will be used when the jQuery UI Dialog is instantiated, and then removing them before calling the superclass 
		// initComponent so that the (now inner) div element created by ui.Component is not affected by sizing.  "Removing" the 
		// original configs by setting them to undefined rather than deleting them, for the case of subclasses that override
		// the properties on their prototype.
		this.dialogHeight = this.height;        this.height = undefined;
		this.dialogWidth = this.width;          this.width = undefined;
		this.dialogMinHeight = this.minHeight;  this.minHeight = undefined;
		this.dialogMinWidth = this.minWidth;    this.minWidth = undefined;
		this.dialogMaxHeight = this.maxHeight;  this.maxHeight = undefined;
		this.dialogMaxWidth = this.maxWidth;    this.maxWidth = undefined;
		
		
		this.addEvents(
			/**
			 * @event beforeopen
			 * Fires before the dialog has opened. Handlers of this event may prevent
			 * the opening of the dialog by returning false. 
			 * @param {ui.Dialog} dialog This dialog instance.
			 */
			'beforeopen',
			
			/**
			 * @event open
			 * Fires when the dialog has opened.
			 * @param {ui.Dialog} dialog This dialog instance.
			 */
			'open',
			
			/**
			 * @event beforeclose
			 * Fires before the dialog has closed. Handlers of this event may prevent
			 * the closing of the dialog by returning false. 
			 * @param {ui.Dialog} dialog This dialog instance.
			 */
			'beforeclose',
			
			/**
			 * @event close
			 * Fires when the dialog has closed.
			 * @param {ui.Dialog} dialog This dialog instance.
			 */
			'close',
			
			/**
			 * @event keypress
			 * Fires when a key is pressed in the Dialog.
			 * @param {ui.Dialog} dialog This Dialog object.
			 * @param {jQuery.Event} evt The jQuery event object for the event.
			 */
			'keypress'
		);
		
		
		// Add the css class to the element created by ui.Component. This element will be the dialog's content, as the Dialog itself is created
		// with another div. Doing this here instead of in onRender so that it is applied immediately when the Component's element is created.
		this.cls += ' dialog-content';
		
		
		// Run the setTitle() logic on the provided raw config. setTitle() re-sets the 'title' property on this object
		this.setTitle( this.title );
		
		
		// ----------------------------------------------
		
		// Set up the bottom bar
		
		
		// Create a Container for the footer (which renders to the left side of the bottom bar). This is created regardless
		// of it is has any content at instantiation time because it may be filled later with the setFooter() method.
		// The footer may have direct HTML content, or child ui.Components.
		var footerIsHTMLContent = false,
		    footer = this.footer;
		if( Kevlar.isString( footer ) || Kevlar.isElement( footer ) || Kevlar.isJQuery( footer ) ) {
			footerIsHTMLContent = true;
		}
		this.footerContainer = new ui.Container( {
			cls       : 'dialog-bottom-content-left',
			style     : { display: 'inline-block' },
			
			contentEl : ( footerIsHTMLContent ) ? footer : undefined,  // HTML elements / jQuery wrapped sets: append directly to the Container's div element
			items     : ( footerIsHTMLContent ) ? undefined : footer   // ui.Component/config object(s): add as child items
		} );
		
		
		// Create a Container for the "main" dialog buttons. This is created regardless of it is has buttons at instantiation 
		// time because it may be filled later with the setButtons() method.
		this.buttonsContainer = new ui.Container( {
			defaultType : 'Button',
			
			cls      : 'dialog-bottom-content-right',
			style    : { display: 'inline-block' },
			items    : this.buttons
		} );
		
		
		// Create the Container for the bottom bar itself, which holds both the footer and the dialog buttons. This 
		// will only be initially shown if the 'footer' config has been set, and/or the 'buttons' config has been set, 
		// but may be shown after a call to setFooter() or setButtons().
		this.bottomBarContainer = new ui.Container( {
			cls : 'dialog-bottom-content ui-corner-all',
			hidden : true,  // initially hidden.  Will be shown in the open() method
			
			items : [
				this.footerContainer,
				this.buttonsContainer
			]
		} );
		
		
		// ----------------------------------------------
		
		
		// Call superclass initComponent
		ui.Dialog.superclass.initComponent.call( this );
		
		
		// ----------------------------------------------
		
		
		// If the autoOpen config has been set to true, open the dialog immediately
		if( this.autoOpen ) {
			this.open();
		}
	},
	
	
	/**
	 * Extension of onRender which is used to create jQuery UI Dialog and its inner dialog content.
	 * 
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		ui.Dialog.superclass.onRender.apply( this, arguments );
		
		// Create a wrapping element for the dialog's content and bottom bar
		this.$dialog = jQuery( '<div />' );
		
		
		// The ui.Component's div element becomes the content div container, which will hold the dialog's HTML or child components.
		this.$contentContainer = this.$el  // aliasing for clarity
		  .appendTo( this.$dialog );
		
		
		// Because jQuery UI has some issues with opening multiple dialogs and setting the minHeight and minWidth configs
		// on it, I'm temporarily setting them here right on the $contentContainer to guarantee that they are set.
		if( typeof this.dialogMinWidth !== 'undefined' ) {
			this.$contentContainer.css( 'min-width', this.dialogMinWidth );
		}
		if( typeof this.dialogMinHeight !== 'undefined' ) {
			this.$contentContainer.css( 'min-height', this.dialogMinHeight );
		}
		
		
		// Render the bottomBarContainer into the $dialog element
		this.bottomBarContainer.render( this.$dialog );
		
		
		// ------------------------------------
		
		
		// Create the jQuery UI dialog instance out of the new dialog div element
		this.$dialog.dialog( {
			dialogClass: 'jux-dialog jux ' + this.cls,
			title: this.title,
			modal: this.modal,
			draggable: true,
			autoOpen: false,
			resizable: false,
			closeOnEscape: false, // we want to explicitly disable this here, so that if the esc key is pressed, the ui.Dialog's destroy() method gets run, 
			                      // removing event handlers and the window resize handler. Will re-implement this behavior next, in this method. This is also to 
								  // to prevent the default jQuery UI Dialog behavior of if two dialogs are open (one on top of the other), both are closed when
								  // 'esc' is pressed! The implementation of the 'esc' key in this method only closes the Dialog that has focus.
			
			//position: [ this.x, this.y ],      -- Doing this after the dialog has opened, and after the content area has been sized.
			
			// No need for the following 'max' configs (nor do they really work either), as we handle the max width of the dialog's $contentContainer when the dialog is opened.
			// Leaving these here as a reminder, though.
			//maxWidth: this.dialogMaxWidth,  
			//maxHeight: this.dialogMaxHeight,
			
			// Due to bugs in jQuery UI with opening multiple dialogs, the min width/height doesn't always get applied correctly for subsequent dialog openings when
			// set to the actual values provided to ui.Dialog (i.e. this.minHeight and this.maxHeight). So, these are explicitly set to 0 here to override the jQuery UI 
			// defaults of 150. Otherwise, the actual min width/height are handled by setting them directly on the $contentContainer, in the resizeContentContainer() method.
			minWidth: 0,       
			minHeight: 0,  
			
			width: this.dialogWidth,
			height: this.dialogHeight,
			
			// event handlers
			dragStop : this.onDragStop.createDelegate( this )
		} );
		
		// Store the "outer" dialog element (i.e. the element that jQuery UI creates for the Dialog).
		var $dialogOuter = this.$dialogOuter = this.$dialog.dialog( 'widget' );
		
		
		// Create the inner dialog wrapper element. This is used as an extra layer for styling the dialog's border.
		// We add our inner wrapper directly inside the outer dialog element, and then need to retrieve it again to set
		// it to this.$dialogInner because jQuery creates brand new elements with wrapInner(), preventing us from 
		// creating the element and storing it as a reference first.
		$dialogOuter.wrapInner( '<div class="dialog-innerWrap" />' );
		this.$dialogInner = $dialogOuter.find( '.dialog-innerWrap' ); 
		
		
		// ------------------------------------------------
		
		// Handle the titlebar's button, by removing jQuery UI's, and replacing it with our own
		
		// Find the title bar, to add the button into it
		var $titleBar = $dialogOuter.find( 'div.ui-dialog-titlebar' );
		
		// Get the "close button" element that jQuery UI provides in the top right of the dialog, and remove it.
		// We'll add our own next.
		var $closeLink = $titleBar.find( 'a.ui-dialog-titlebar-close' );
		$closeLink.remove();
		
		// If the closeButton config is explicitly true, create a ui.CloseButton instance that will close the Dialog when clicked
		if( this.closeButton === true ) {
			this.closeButton = new ui.toolButtons.CloseButton( {
				handler : function() { 
					this.close();
				},
				scope : this
			} );
		}
		
		// If the closeButton config is a ui.Button instance at this point (
		if( this.closeButton instanceof ui.Button ) {
			this.closeButton.render( $titleBar );
			this.closeButton.getEl().addClass( 'ui-dialog-titlebar-close' );
		}
		
		
		// ------------------------------------------------
		
		
		// Set up the keypress listener on the dialog, to run the template method, and fire the keypress event.
		this.$contentContainer.bind( 'keypress', this.onKeyPress.createDelegate( this ) );
		
		
		// ------------------------------------------------
		
		
		// Set up an event handler for the window's resize event, to re-size and re-position the dialog based on the
		// new viewport's size.  The handler for this event is "buffered" just a little, so that the many resize events 
		// that get fired while a window is being dragged don't cause the resize calculations to run each and every time. 
		// Need to store the resize handler itself so that we can unbind it in the destroy() method when the Dialog is destroyed.
		var resizeTask = new Kevlar.util.DelayedTask( function() {
			this.onWindowResize();
		}, this );
		this.windowResizeHandler = function() {	resizeTask.delay( 150 ); };
		jQuery( window ).bind( 'resize', this.windowResizeHandler );
		
	},  // eo onRender
	
	
	/**
	 * Opens the dialog, rendering it if it has not yet been rendered. The dialog is rendered here
	 * so all Components can be added to it first before rendering it.
	 */
	open : function() {
		if( this.fireEvent( 'beforeopen', this ) !== false ) {
			// If the dialog has not been rendered yet, render it now to the document body
			if( !this.rendered ) {
				this.render( document.body );
			}
			
			// Open the jQuery UI Dialog
			this.$dialog.dialog( 'open' );
			
			
			// If this dialog is a modal dialog, get its overlay element (the one created by jQuery UI for this Dialog) 
			if( this.modal === true ) {
				this.$overlayEl = jQuery( 'body div.ui-widget-overlay:last' );
				
				// If the 'overlay' config is set to false, set the overlay element to be completely transparent.
				if( this.overlay === false ) {
					this.$overlayEl.css( 'opacity', 0 );
				}
			}
			
			
			// Workaround for jQuery UI Dialog: call the show() method of the Component superclass when the Dialog is
			// opened, so that the onShow() template method runs, and the 'show' event fires. This would most likely be
			// done if the Dialog was implemented directly (i.e. not using jQuery UI), and is expected by the ui.Container
			// superclass, which implements onShow().  Note that this should be done before setting the dialog's position, 
			// as that relies on the dialog's inner content. 
			this.show();
			
			// Now that the dialog is open (i.e. shown), show the bottomBarContainer if the 'footer' and/or 'buttons' 
			// configs were actually specified with content. Must do before we resize the container.
			if( this.footer || this.buttons.length > 0 ) {
				this.bottomBarContainer.show();
			}
			
			// Now that the dialog is opened (and its elements have been created), we can make calculations and size
			// the $contentContainer appropriately, based on the maxHeight/maxWidth configs, or the browser's viewport.
			this.resizeContentContainer();
			
			// We can now set the Dialog's position, which will reflect the dynamically sized $contentContainer.
			// This is needed to be done after the setting of $contentContainer especially for 'x' and 'y' config
			// values of 'center'. 
			this.setPosition( this.x, this.y );
			
			// Run template method, and fire the 'open' event
			this.onOpen();
			this.fireEvent( 'open', this );
		}
	},
	
	
	/**
	 * Template method that is run when the Dialog has been opened.
	 * 
	 * @protected
	 * @method onOpen
	 */
	onOpen : Kevlar.emptyFn,
	
	
	/**
	 * Determines if this Dialog is currently open.
	 * 
	 * @method isOpen
	 * @return {Boolean} True if the Dialog is open, false otherwise.
	 */
	isOpen : function() {
		return this.rendered && this.$dialog.dialog( 'isOpen' );   // make sure the Dialog has been rendered first, otherwise this.$dialog won't exist
	},
	
	
	/**
	 * Retrieves the height of the Dialog itself. The dialog must be open for this calculation.
	 * 
	 * @method getHeight
	 * @return {Number} The height of the Dialog if it is open, or 0 if it is not.
	 */
	getHeight : function() {
		if( this.isOpen() ) {
			return this.$dialog.dialog( 'widget' ).outerHeight();
		} else {
			return 0;
		}
	},
	
	
	/**
	 * Retrieves the width of the Dialog itself. The dialog must be open for this calculation.
	 * 
	 * @method getWidth
	 * @return {Number} The width of the Dialog if it is open, or 0 if it is not.
	 */
	getWidth : function() {
		if( this.isOpen() ) {
			return this.$dialog.dialog( 'widget' ).outerWidth();
		} else {
			return 0;
		}
	},
	
	
	/**
	 * Sets the Dialog's title.
	 * 
	 * @method setTitle
	 * @param {String/HTMLElement/jQuery/ui.Component} title The title for the dialog box to use. Can be a string of text, a string of 
	 *   HTML, an HTMLElement, a jQuery wrapped set, or a {@link ui.Component}. 
	 */
	setTitle : function( title ) {
		// If the title is a ui.Component, render its HTML into a document fragment for setting it as the title.
		if( title instanceof ui.Component ) {
			var docFrag = document.createDocumentFragment();
			title.render( docFrag );
			title = title.getEl();  // grab the element from the ui.Component
		}
		this.title = title;   // save the title in case the Dialog is not yet rendered
		
		// It is possible that the inner jQuery dialog may not exist yet when this is called, if the 
		// Dialog has not yet been rendered.  Only set the title on the jQuery dialog itself if it does.
		if( this.$dialog ) {  
			this.$dialog.dialog( 'option', 'title', title );
		}
	},
	
	
	/**
	 * Sets (replaces) the footer content. See the {@link #footer} config for more information on the footer.
	 * 
	 * @method setFooter
	 * @param {String/HTMLElement/jQuery/ui.Component} footer A string of HTML, an HTMLElement, or a jQuery wrapped set to put into the
	 *   footer. Also accepts a ui.Component instance.
	 */
	setFooter : function( footer ) {
		// If the bottom bar container is not set to be shown (it is set to be hidden), show it now.
		if( this.bottomBarContainer.isHidden() ) {
			this.bottomBarContainer.show();
		}
		
		// Now, replace the footer content in the footerContainer
		this.footerContainer.removeAll();
		this.footerContainer.getEl().empty();
		if( footer instanceof ui.Component ) {
			this.footerContainer.add( footer );
		} else {
			this.footerContainer.getEl().append( footer );
		}
	},
	
	
	/**
	 * Sets (replaces) the Dialog's buttons. See the {@link #buttons} config for more information on buttons.
	 *
	 * @method setButtons
	 * @param {ui.Button/ui.Button[]} buttons A single button to replace the buttons with, or an array of buttons. Can also be button config objects.
	 */
	setButtons : function( buttons ) {
		// If the bottom bar container is not set to be shown (it is set to be hidden), show it now.
		if( this.bottomBarContainer.isHidden() ) {
			this.bottomBarContainer.show();
		}
		
		// Now, replace the buttons in the buttonsContainer
		this.buttonsContainer.removeAll();
		this.buttonsContainer.add( buttons );
	},
	
	
	/**
	 * Sets the position of the Dialog.
	 * 
	 * @method setPosition
	 * @param {Number/String} x The x position of the Dialog. This can be a number defining how many pixels from the left of the screen,
	 *   or one of the strings that the jQuery UI Dialog accepts ('center', 'left', 'right', 'top', 'bottom'). This can also be a negative
	 *   integer, in which case it will be taken as the number of pixels from the right side of the screen. Ex: A value of -50 will position the 
	 *   right side of the dialog 50px from the right side of the screen.
	 * @param {Number/String} y The y position of the Dialog. This can be a number defining how many pixels from the top of the screen,
	 *   or one of the strings that the jQuery UI Dialog accepts ('center', 'left', 'right', 'top', 'bottom').  This can also be a negative
	 *   integer, in which case it will be taken as the number of pixels from the bottom of the screen. Ex: A value of -50 will position the 
	 *   bottom of the dialog 50px from the bottom of the screen.
	 */
	setPosition : function( x, y ) {
		// Store the variables in case the dialog is not yet open, and for later use if the browser window is resized.
		// (This is mainly needed for when this method is called externally, and not from within the Dialog.)
		this.x = x;
		this.y = y;
		
		if( this.isOpen() ) {
			// Convert any negative x and y values to "from the right" and "from the bottom" values.  These calculations create positive left/top
			// values for x and y, which are what the jQuery UI dialog expects. Note: these need the dialog to be open, as they measure the dialog's size.
			if( x < 0 || y < 0 ) {
				var $window = jQuery( window );
				if( x < 0 ) {
					x = $window.width() - this.getWidth() - (-x);  // the right of the window, minus the width of the dialog, minus the negative value of x (to continue moving it left)
					// note: not saving this.x to the new positive value of x, so that if the window is resized, the x position is still relative to the right side of the screen
				}
				if( y < 0 ) {
					y = $window.height() - this.getHeight() - (-y);  // the bottom of the window, minus the height of the dialog, minus the negative value of y (to continue moving it up)
					// note: not saving this.y to the new positive value of y, so that if the window is resized, the y position is still relative to the bottom of the screen
				}
			}
			
			this.$dialog.dialog( 'option', 'position', [x, y] );
		}
	},
	
	
	/**
	 * Gets the position of the Dialog. This can only be retrieved if the dialog is currently open. If the dialog is not open,
	 * all values will return 0.
	 * 
	 * @method getPosition
	 * @return {Object} An object with the following properties:
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li><b>x</b> : Int<div class="sub-desc">The position of the left side of the dialog, relative to the left side of the screen. Same as `left`.</div>
	 *     <li><b>y</b> : Int<div class="sub-desc">The position of the top of the dialog, relative to the top of the screen. Same as `top`.</div>
	 *     <li><b>left</b> : Int<div class="sub-desc">The position of the left side of the dialog, relative to the left side of the screen. Same as `x`.</div>
	 *     <li><b>top</b> : Int<div class="sub-desc">The position of the left side of the dialog, relative to the left side of the screen. Same as `y`.</div>
	 *     <li><b>right</b> : Int<div class="sub-desc">The position of the right side of the dialog, relative to the right side of the screen.</div>
	 *     <li><b>bottom</b> : Int<div class="sub-desc">The position of the bottom of the dialog, relative to the bottom of the screen.</div>
	 *   </ul>
	 * </div>
	 */
	getPosition : function() {
		if( !this.isOpen() ) {
			return {
				x      : 0,
				y      : 0,
				left   : 0,
				top    : 0,
				right  : 0,
				bottom : 0
			};
			
		} else {
			var $window  = jQuery( window ),
			    position = this.$dialog.dialog( 'widget' ).position(),
			    left     = position.left,
			    top      = position.top,
			    right    = $window.width() - ( position.left + this.getWidth() ),
			    bottom   = $window.height() - ( position.top + this.getHeight() );
			
			return {
				x      : left,
				y      : top,
				left   : left,
				top    : top,
				right  : right,
				bottom : bottom
			};
		}
	},
	
	
	/**
	 * Sizes the {@link #$contentContainer} of the dialog (the container that holds the dialog's content) to constrain its
	 * size to the {@link #maxHeight} and {@link #maxWidth} configs, OR the browser's viewport size; whichever is smaller.
	 * This is to keep the Dialog's size constrained to the browser's viewport size, which otherwize may hide things like the 
	 * bottom button bar.<br><br>
	 * 
	 * This method makes calculations based on the dimensions of the dialog's title bar and button bar, and sizes the content 
	 * container appropriately to honor the {@link #maxHeight} and {@link #maxWidth} configs, or to be constrained to the 
	 * browser's viewport. Note that the Dialog must be currently be open for these calculations to be made, and this method
	 * is automatically called from the {@link #open} method.
	 * 
	 * @method resizeContentContainer
	 */
	resizeContentContainer : function() {
		// We can only do these calculations (and only want to do these calculations) if the dialog is currently open
		if( this.isOpen() ) {
			var $window = jQuery( window ),
			    $dialogOuter = this.$dialog.dialog( 'widget' ),  // access the jQuery UI Dialog's outer element
			    $dialogInner = this.$dialogInner,                // the inner wrapping element used to style the dialog's border. This sits directly inside of the outer element. 
			    $dialogContentWrap = this.$dialog,               // the element that wraps the dialog's content, and bottom bar.
			    $titleBar = $dialogOuter.find( 'div.ui-dialog-titlebar' ),
				$bottomBar = this.bottomBarContainer.getEl(),
				$contentContainer = this.$contentContainer;
			    
			
			// local function to calculated margins, borders, and padding, and return an object {height,width}
			var calculateElementSurround = function( $el ) {
				return {
					height : parseInt( $el.css( 'marginTop' ), 10 ) + parseInt( $el.css( 'borderTopWidth' ), 10 ) + parseInt( $el.css( 'paddingTop' ), 10 ) +
				             parseInt( $el.css( 'marginBottom' ), 10 ) + parseInt( $el.css( 'borderBottomWidth' ), 10 ) + parseInt( $el.css( 'paddingBottom' ), 10 ),
				
					width  : parseInt( $el.css( 'marginLeft' ), 10 ) + parseInt( $el.css( 'borderLeftWidth' ), 10 ) + parseInt( $el.css( 'paddingLeft' ), 10 ) +
				             parseInt( $el.css( 'marginRight' ), 10 ) + parseInt( $el.css( 'borderRightWidth' ), 10 ) + parseInt( $el.css( 'paddingRight' ), 10 )
				};
			};
			
			
			// We need the total height/width that the dialog takes up, without the content area. This includes margins, borders,
			// and paddings ("surround") of the outer element containers ($dialogOuter, $dialogInner, and $dialogContentWrap), as well as
			// the heights (but not widths) of $titleBar and $bottomBar.
			var dialogOuterSurround = calculateElementSurround( $dialogOuter ),
			    dialogInnerSurround = calculateElementSurround( $dialogInner ),
			    dialogContentWrapSurround = calculateElementSurround( $dialogContentWrap ),
				
				totalOuterHeight = dialogOuterSurround.height + dialogInnerSurround.height + dialogContentWrapSurround.height + $titleBar.outerHeight( true ) + $bottomBar.outerHeight( true ),
				totalOuterWidth = dialogOuterSurround.width + dialogInnerSurround.width + dialogContentWrapSurround.width,
			
			    // Find the maximum height and width available for the dialog. Use the configured maxHeight and maxWidth
			    // if they will fit, or use the max height/width that the browser viewport is currently providing (whichever is smaller).
			    calculatedMaxHeight = Math.min( +this.dialogMaxHeight || Number.POSITIVE_INFINITY, $window.height() - 20 ), // the given maxHeight config (converted to a number), or the window's height - 20px; whichever is smaller
			    calculatedMaxWidth = Math.min( +this.dialogMaxWidth || Number.POSITIVE_INFINITY, $window.width() - 20 ),    // the given maxWidth config (converted to a number), or the window's width - 20px; whichever is smaller
			
			    // Find the max height/width that we can make the content area, based on the calculated available max height/width
			    calculatedMaxContentHeight = calculatedMaxHeight - totalOuterHeight,
			    calculatedMaxContentWidth = calculatedMaxWidth - totalOuterWidth;
			
			
			// Set the maxHeight and maxWidth on the outer dialog element itself. This is for when the regular height/width configs have been explicitly
			// set, and the dialog should shrink past those if the viewport's size (or dialog's maxHeight/maxWidth configs) can't support that size.
			$dialogOuter.css( 'maxHeight', Math.max( calculatedMaxHeight - dialogOuterSurround.height, 0 ) );  // don't let these go negative,
			$dialogOuter.css( 'maxWidth', Math.max( calculatedMaxWidth - dialogOuterSurround.width, 0 ) );     // in case the browser is *really* small
			$dialogInner.css( 'maxHeight', Math.max( calculatedMaxHeight - dialogOuterSurround.height - dialogInnerSurround.height, 0 ) );  // don't let these go negative,
			$dialogInner.css( 'maxWidth', Math.max( calculatedMaxWidth - dialogOuterSurround.width - dialogInnerSurround.width, 0 ) );      // in case the browser is *really* small
			
			
			// Set the max height/width on the $contentContainer (which is inside the $dialogContentWrap element)
			$contentContainer.css( 'maxHeight', Math.max( calculatedMaxContentHeight, 0 ) );  // don't let these go negative,
			$contentContainer.css( 'maxWidth', Math.max( calculatedMaxContentWidth, 0 ) );    // in case the browser is *really* small
			
			
			// If the Dialog's mask (inherited form ui.Component) is supposed to be shown, we may need to recalculated its height. 
			// Running the mask() method will do this.
			if( this.masked ) {
				this.mask();
			}
		}
	},
	
	
	/**
	 * Event handler for the browser window's resize event, in which the Dialog's {@link #$contentContainer} is resized,
	 * and its position is reset.
	 * 
	 * @private
	 * @method onWindowResize
	 */
	onWindowResize : function() {
		this.resizeContentContainer();
		this.setPosition( this.x, this.y );
	},
	
	
	/**
	 * Method that is run when the Dialog has finished being dragged from one position to another. This method
	 * handles the dragStop event from the jQuery UI dialog.  This method stores the new position ({@link #x} and {@link #y} values)
	 * for if the window is resized, the dialog will try to be repositioned in the same place. See the {@link #onWindowResize} method.
	 * 
	 * @private
	 * @method onDragStop
	 * @param {jQuery.Event} event
	 * @param {Object} ui An object with properties `offset` and `position`. Each of these has a `left` and `top` property.
	 */
	onDragStop : function( event, ui ) {
		// Store the new x and y values when the Dialog is dragged for if the window is resized, the dialog will try to be repositioned in the same place.
		var position = ui.position;
		this.x = position.left;
		this.y = position.top;
	},
	
	
	/**
	 * Method that is run when there is a keypress event in the dialog.  This method fires the {@link #keypress}
	 * event, and if the {@link #closeOnEscape} config is true, this method closes the dialog if the key is 'esc'.
	 * 
	 * @protected
	 * @method onKeyPress
	 * @param {jQuery.Event} evt
	 */
	onKeyPress : function( evt ) {
		this.fireEvent( 'keypress', this, evt );
		
		// If the closeOnEscape config is true, and the key pressed was 'esc', close the dialog.
		if( this.closeOnEscape && evt.keyCode === jQuery.ui.keyCode.ESCAPE ) {
			this.close();
		}
	},
	
	
	/**
	 * Closes the dialog.
	 * 
	 * @method close
	 */
	close : function() {
		if( this.rendered && this.fireEvent( 'beforeclose', this ) !== false ) {
			this.onBeforeClose();
			
			// If this dialog was a modal dialog, and the overlay was hidden, remove its 'opacity'
			// style at this time before the jQuery UI Dialog is closed. jQuery UI does weird things 
			// if the opacity is still set when the dialog closes, by opening up any new dialogs 
			// with weird overlay opacity values.
			if( this.modal && this.overlay === false ) {
				this.$overlayEl.css( 'opacity', '' );
			}
			this.$overlayEl = null;  // dialog is closing, it will remove its own overlay element. Remove this reference now.
			
			// Close the jQuery UI Dialog
			this.$dialog.dialog( 'close' );
			
			
			// Run template method, and fire the 'close' event
			this.onClose();  
			this.fireEvent( 'close', this );
			
			// Destroy this Dialog when closed for DOM/memory management, if the autoDestroy config is true
			if( this.autoDestroy ) {
				this.destroy();
			}
		}
	},
	
	
	/**
	 * Template method that is run before the dialog has been closed, but after the {@link #beforeclose} event
	 * has fired (as a {@link #beforeclose} handler may return false, and prevent the dialog from closing).
	 * 
	 * @protected
	 * @method onBeforeClose 
	 */
	onBeforeClose : Kevlar.emptyFn,
	
	
	/**
	 * Template method that is run when the Dialog has been closed.
	 * 
	 * @protected
	 * @method onClose
	 */
	onClose : Kevlar.emptyFn,
	
	
	/**
	 * Method that runs when the Dialog is being destroyed.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		if( this.isOpen() ) {
			this.close();
		}
		
		// Destroy other Containers used by the Dialog
		this.bottomBarContainer.destroy();
		
		if( this.rendered ) {
			// unbind our window resize handler (which is set up in onRender)
			jQuery( window ).unbind( 'resize', this.windowResizeHandler );
		
			// destroy the dialog and its elements
			this.$dialog.dialog( 'destroy' );  // returns the inner element to its pre-init state
			this.$dialog.unbind();
		}

		
		ui.Dialog.superclass.onDestroy.apply( this, arguments );
	},
	
	
	// -----------------------------
	
	
	/**
	 * Override of {@link ui.Component#getMaskTarget} used to redefine the mask target as the Dialog's "inner" element, 
	 * which covers everything but the border.
	 * 
	 * @method getMaskTarget
	 * @return {jQuery}
	 */
	getMaskTarget : function() {
		return this.$dialogInner;
	},
	
	
	// -----------------------------
	
	
	/**
	 * Extensions of {@link ui.Container ui.Container's} "cascade" method to include the bottomBarContainer of the Dialog in the cascade.
	 * See {@link ui.Container#cascade} for details on this method.<br><br>
	 * 
	 * @devNote All of the Container "child processing" methods use this method (like the findBy, findById, findByKey, 
	 * setData, and getData methods), so extending this effectively "updates" these methods as well for the Dialog
	 * to include the bottomBarContainer.
	 * 
	 * @method cascade
	 * @param {Function} fn The function to call
	 * @param {Object} scope (optional) The scope of the function (defaults to current Component)
	 * @param {Array} args (optional) The args to call the function with (defaults to passing the current Component)
	 */
	cascade : function() {
		// First call the superclass method to handle the processing of this Container's items (the Dialog's items)
		ui.Dialog.superclass.cascade.apply( this, arguments );
		
		// Now call the method on the bottomBarContainer to process that as well
		this.bottomBarContainer.cascade.apply( this.bottomBarContainer, arguments );
	}
	
	
} );

/**
 * @class ui.Dialog
 * @extends ui.AbstractOverlay
 * 
 * This class is now a complete replacement for jQuery UI's Dialog. (Historically, it used to wrap jQuery UI's Dialog.) 
 * It provides new functionality over jQuery UI's Dialog, and also doesn't have some of the issues involved with jQuery UI's Dialog 
 * and multiple instances. Some of these features are:
 * <div class="mdetail-params"><ul>
 *   <li>Automatic cleanup of the dialog when it is closed (see the {@link #autoDestroy} config}.</li>
 *   <li>Management of a "content" area, and a bottom bar (which may be used as a footer and/or buttons bar).</li>
 *   <li>
 *     Better management of the {@link #closeOnEscape} feature that jQuery UI normally provides. In regular jQuery UI dialogs, this config
 *     has the effect of when the 'esc' key is pressed, *all* open dialogs are closed (such as when one is opened on top of another), while 
 *     the implementation in this class only closes the dialog that has focus when the 'esc' key is pressed.
 *   </li>
 *   <li>
 *     Automatic dialog sizing based on the window's viewport (the dialog is constrained to the viewport's size), and a window resize handler 
 *     to automatically resize the Dialog when the window's size changes.
 *   </li>
 *   <li>
 *     A configuration option to easily remove the top-right "close" button (jQuery UI Dialogs normally create one without being able 
 *     to remove it through configuration). See {@link #closeButton}.
 *   </li>
 *   <li>The ability to make the modal overlay be transparent on a per-dialog basis, via configuration. See {@link #overlay}.</li>
 *   <li>
 *     The ability to position the dialog based on an offset from the right side or bottom of the screen. See the {@link #x} and {@link #y}
 *     configs, noting the ability to provide a negative integer to them (which signifies to position from the right side, or bottom of the screen).
 *   </li>
 * </ul></div>
 *
 * This class provides the functionality of a {@link ui.Container} as well (i.e. it may hold child {@link ui.Component Components}).
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global window, jQuery, Kevlar, ui */
ui.Dialog = Kevlar.extend( ui.AbstractOverlay, {
	
	
	/**
	 * @cfg {Boolean} modal
	 * True to create the dialog as a modal dialog (i.e. everything behind the dialog will be inaccessible). Defaults to true.
	 */
	modal : true,
	
	
	/**
	 * @cfg {Boolean} overlay
	 * If the {@link #modal} config is true, this may be set to false to hide the modal's overlay that normally shows behind the
	 * dialog.  The overlay itself won't actually hidden (therefore still making the dialog a modal dialog), but made completely 
	 * transparent instead. Defaults to true.<br><br>
	 *
	 * NOTE/TODO: This currently has issues with multiple jQueryUI dialogs with different opacities set, possibly due to other dialogs
	 * (esp. ones created directly, without using this class) changing all overlay opacities, and jQuery UI remembering these states
	 * and re-using them for some reason. Have to investigate.
	 */
	overlay : true,
	
	
	/**
	 * @cfg {Number/String} x
	 * See {@link ui.AbstractOverlay#x} for details. Defaults to 'center'.
	 */
	x : 'center',
	
	/**
	 * @cfg {Number/String} y
	 * See {@link ui.AbstractOverlay#y} for details. Defaults to 'center'.
	 */
	y : 'center',
	
	
	/**
	 * @cfg {Number/String} maxHeight
	 * A maximum height to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing,
	 * but will be constrained to the browser's viewport.  If a maxHeight is given that is larger than the browser's viewport, then the browser's
	 * viewport height will be preferred. 
	 */
	
	/**
	 * @cfg {Number/String} maxWidth
	 * A maximum width to give the Dialog. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing,
	 * but will be constrained to the browser's viewport.  If a maxWidth is given that is larger than the browser's viewport, then the browser's
	 * viewport width will be preferred.
	 */
	
	
	/**
	 * @cfg {String/HTMLElement/jQuery/ui.Component} title 
	 * The title for the dialog box to use. Can be a string of text, a string of HTML, a jQuery wrapped set, or a 
	 * {@link ui.Component}.  Defaults to an empty string.
	 */
	title: '',
	
	
	/**
	 * @cfg {Boolean/ui.Button} closeButton
	 * True to create a close button in the top right of the dialog. When clicked, this button closes the dialog.
	 * Set to false to hide this button.  This config also accepts a ui.Button instance for the button,
	 * but this button must set up its own handler for what to do when clicked (it will simply be placed in the close 
	 * button's position). Defaults to true.
	 */
	closeButton : true,
	
	/**
	 * @cfg {ui.Button[]} buttons
	 * An array of {@link ui.Button} configs for the main dialog buttons (the buttons that display on the bottom
	 * right of the dialog box). Defaults to undefined, for no buttons.<br><br>
	 * 
	 * Note that if anonymous config objects are provided to this config, and they do not specify a 'type', they are assumed 
	 * to be of type {@link ui.Button}.
	 */
	
	
	/**
	 * @cfg {String/HTMLElement/jQuery/ui.Component} footer
	 * An HTML string, HTML Element, jQuery wrapped set, or {@link ui.Component} (most likely a {@link ui.Container}) to put
	 * into the footer of the dialog.  The content for the footer will go on the left side of the footer (as Dialog buttons
	 * are pushed to the right side).
	 */
	
	
	/**
	 * @hide 
	 * @cfg {jQuery/HTMLElement} renderTo 
	 * This config should not be specified for this subclass. The Dialog will
	 * automatically be rendered into the document body when it is opened. 
	 */
	
	
	
	/**
	 * @private
	 * @property $dialogInnerEl
	 * @type jQuery
	 * The dialog's inner wrapper element, used as an extra layer for styling the dialog's border.
	 * This element is appended directly inside the outer dialog element ({@link #el}).
	 */
	
	/**
	 * @private
	 * @property $titleEl
	 * @type jQuery
	 * The dialog's title element, used for setting and updating the title.
	 */
		
	/**
	 * @private
	 * @property $contentEl
	 * @type jQuery
	 * The content element, where either content HTML or child {@link ui.Component Components} are added.
	 */
	
	
	
	/**
	 * @private
	 * @property bottomBarContainer
	 * The {@link ui.Container} instance for holding the {@link #footerContainer} and the {@link #buttonsContainer}, at
	 * the bottom of the Dialog.  This may or may not be shown, depending on if the {@link #footer} or {@link #buttons}
	 * configs are set (if neither are set, the bottom bar will not be shown).  Note that the {@link #buttons} config has
	 * a default however.  To display no buttons, set `buttons: []`
	 * @type ui.Container  
	 */
	
	/**
	 * @private
	 * @property footerContainer
	 * The {@link ui.Container} instance for holding footer content / {@link ui.Component Components}, in the {@link #bottomBarContainer}.
	 * @type ui.Container
	 */
	
	/**
	 * @private
	 * @property buttonsContainer
	 * The {@link ui.Container} instance for holding the main Dialog {@link ui.Button Buttons}, in the {@link #bottomBarContainer}.
	 * @type ui.Container
	 */
	
	/**
	 * @private
	 * @property $overlayEl
	 * The overlay element that is created for {@link #modal} dialogs. This element will exist only if the {@link #modal}
	 * config is set to true, and after the dialog has been opened.
	 */
	
	/**
	 * @private
	 * @property windowResizeHandler
	 * The scope wrapped function for handling window resizes (which calls the method to resize the dialog accordingly).
	 * This is needed as a property so that we can unbind the window's resize event from the Dialog when the Dialog
	 * is destroyed. 
	 * @type Function
	 */
	
	
	// protected
	initComponent : function() {
		this.addEvents(
			/**
			 * @event keypress
			 * Fires when a key is pressed in the Dialog.
			 * @param {ui.Dialog} dialog This Dialog object.
			 * @param {jQuery.Event} evt The jQuery event object for the event.
			 */
			'keypress'
		);
		
		
		// Add the css classes to the outer element created by ui.Component.
		this.cls += ' ui-dialog ui-widget ui-widget-content ui-corner-all ui-draggable';
		
		
		// Run the setTitle() logic on the provided raw config. setTitle() re-sets the 'title' property on this object
		this.setTitle( this.title );
		
		
		// ----------------------------------------------
		
		// Set up the bottom bar
		
		
		// Create a Container for the footer (which renders to the left side of the bottom bar). This is created regardless
		// of it is has any content at instantiation time because it may be filled later with the setFooter() method.
		// The footer may have direct HTML content, or child ui.Components.
		var footerIsHTMLContent = false,
		    footer = this.footer;
		if( Kevlar.isString( footer ) || Kevlar.isElement( footer ) || Kevlar.isJQuery( footer ) ) {
			footerIsHTMLContent = true;
		}
		this.footerContainer = new ui.Container( {
			cls       : 'dialog-bottom-content-left',
			style     : { display: 'inline-block' },
			
			contentEl : ( footerIsHTMLContent ) ? footer : undefined,  // HTML elements / jQuery wrapped sets: append directly to the Container's div element
			items     : ( footerIsHTMLContent ) ? undefined : footer   // ui.Component/config object(s): add as child items
		} );
		
		
		// Create a Container for the "main" dialog buttons. This is created regardless of it is has buttons at instantiation 
		// time because it may be filled later with the setButtons() method.
		this.buttonsContainer = new ui.Container( {
			defaultType : 'Button',
			
			cls      : 'dialog-bottom-content-right',
			style    : { display: 'inline-block' },
			items    : this.buttons
		} );
		
		
		// Create the Container for the bottom bar itself, which holds both the footer and the dialog buttons. This 
		// will only be initially shown if the 'footer' config has been set, and/or the 'buttons' config has been set, 
		// but may be shown after a call to setFooter() or setButtons().
		this.bottomBarContainer = new ui.Container( {
			cls : 'dialog-bottom-content ui-corner-all',
			hidden : true,  // initially hidden.  Will be shown in the open() method
			
			items : [
				this.footerContainer,
				this.buttonsContainer
			]
		} );
		
		
		// ----------------------------------------------
		
		
		// Call superclass initComponent
		ui.Dialog.superclass.initComponent.call( this );
	},
	
	
	/**
	 * Extension of onRender which is used to create jQuery UI Dialog and its inner dialog content.
	 * 
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		ui.Dialog.superclass.onRender.apply( this, arguments );
		
		var $el = this.$el;
		
		// Render the dialog content, and pull out the elements
		$el.append( ui.Dialog.renderTpl );
		
		this.$dialogInnerEl = $el.find( 'div.dialog-innerWrap' );
		var $titleBarEl = this.$dialogInnerEl.find( 'div.ui-dialog-titlebar' );  // for use later in the method
		this.$titleEl = $titleBarEl.find( 'span.ui-dialog-title' );
		this.$contentEl = $el.find( 'div.ui-dialog-content' );
		
		
		// If the closeButton config is explicitly true, create a ui.CloseButton instance that will close the Dialog when clicked
		if( this.closeButton === true ) {
			this.closeButton = new ui.toolButtons.CloseButton( {
				handler : function() { 
					this.close();
				},
				scope : this
			} );
		}
		
		// If the closeButton config is a ui.Button instance at this point (
		if( this.closeButton instanceof ui.Button ) {
			this.closeButton.render( $titleBarEl );
			this.closeButton.getEl().addClass( 'ui-dialog-titlebar-close' );
		}
		
		
		// Render the bottomBarContainer into the $dialog element
		this.bottomBarContainer.render( this.$el );
		
		
		// ------------------------------------------------
		
		
		// Set up the keypress listener on the dialog, to run the template method, and fire the keypress event.
		this.$contentEl.bind( 'keypress', this.onKeyPress.createDelegate( this ) );
	},  // eo onRender
	
	
	/**
	 * Opens the dialog, rendering it if it has not yet been rendered. The dialog is rendered here
	 * so all Components can be added to it first before rendering it.
	 */
	open : function() {
		if( this.fireEvent( 'beforeopen', this ) !== false ) {
			// If the dialog has not been rendered yet, render it now to the document body
			if( !this.rendered ) {
				this.render( document.body );
			}
			
			// Open the jQuery UI Dialog
			this.$dialog.dialog( 'open' );
			
			
			// If this dialog is a modal dialog, get its overlay element (the one created by jQuery UI for this Dialog) 
			if( this.modal === true ) {
				this.$overlayEl = jQuery( 'body div.ui-widget-overlay:last' );
				
				// If the 'overlay' config is set to false, set the overlay element to be completely transparent.
				if( this.overlay === false ) {
					this.$overlayEl.css( 'opacity', 0 );
				}
			}
			
			
			// Workaround for jQuery UI Dialog: call the show() method of the Component superclass when the Dialog is
			// opened, so that the onShow() template method runs, and the 'show' event fires. This would most likely be
			// done if the Dialog was implemented directly (i.e. not using jQuery UI), and is expected by the ui.Container
			// superclass, which implements onShow().  Note that this should be done before setting the dialog's position, 
			// as that relies on the dialog's inner content. 
			this.show();
			
			// Now that the dialog is open (i.e. shown), show the bottomBarContainer if the 'footer' and/or 'buttons' 
			// configs were actually specified with content. Must do before we resize the container.
			if( this.footer || this.buttons.length > 0 ) {
				this.bottomBarContainer.show();
			}
			
			// Now that the dialog is opened (and its elements have been created), we can make calculations and size
			// the $contentEl appropriately, based on the maxHeight/maxWidth configs, or the browser's viewport.
			this.resizeContentContainer();
			
			// We can now set the Dialog's position, which will reflect the dynamically sized $contentEl.
			// This is needed to be done after the setting of $contentEl especially for 'x' and 'y' config
			// values of 'center'. 
			this.setPosition( this.x, this.y );
			
			// Run template method, and fire the 'open' event
			this.onOpen();
			this.fireEvent( 'open', this );
		}
	},
	
	
	/**
	 * Retrieves the height of the Dialog itself. The dialog must be open for this calculation.
	 * 
	 * @method getHeight
	 * @return {Number} The height of the Dialog if it is open, or 0 if it is not.
	 */
	getHeight : function() {
		if( this.isOpen() ) {
			return this.$el.outerHeight();
		} else {
			return 0;
		}
	},
	
	
	/**
	 * Retrieves the width of the Dialog itself. The dialog must be open for this calculation.
	 * 
	 * @method getWidth
	 * @return {Number} The width of the Dialog if it is open, or 0 if it is not.
	 */
	getWidth : function() {
		if( this.isOpen() ) {
			return this.$el.outerWidth();
		} else {
			return 0;
		}
	},
	
	
	/**
	 * Sets the Dialog's title.
	 * 
	 * @method setTitle
	 * @param {String/HTMLElement/jQuery/ui.Component} title The title for the dialog box to use. Can be a string of text, a string of 
	 *   HTML, an HTMLElement, a jQuery wrapped set, or a {@link ui.Component}. 
	 */
	setTitle : function( title ) {
		// If the title is a ui.Component, render its HTML into a document fragment for setting it as the title.
		if( title instanceof ui.Component ) {
			var docFrag = document.createDocumentFragment();
			title.render( docFrag );
			title = title.getEl();  // grab the element from the ui.Component
		}
		this.title = title;   // save the title in case the Dialog is not yet rendered
		
		if( this.rendered ) {  
			this.$titleEl.empty().append( title );
		}
	},
	
	
	/**
	 * Sets (replaces) the footer content. See the {@link #footer} config for more information on the footer.
	 * 
	 * @method setFooter
	 * @param {String/HTMLElement/jQuery/ui.Component} footer A string of HTML, an HTMLElement, or a jQuery wrapped set to put into the
	 *   footer. Also accepts a ui.Component instance.
	 */
	setFooter : function( footer ) {
		// If the bottom bar container is not set to be shown (it is set to be hidden), show it now.
		if( this.bottomBarContainer.isHidden() ) {
			this.bottomBarContainer.show();
		}
		
		// Now, replace the footer content in the footerContainer
		this.footerContainer.removeAll();
		this.footerContainer.getEl().empty();
		if( footer instanceof ui.Component ) {
			this.footerContainer.add( footer );
		} else {
			this.footerContainer.getEl().append( footer );
		}
	},
	
	
	/**
	 * Sets (replaces) the Dialog's buttons. See the {@link #buttons} config for more information on buttons.
	 *
	 * @method setButtons
	 * @param {ui.Button/ui.Button[]} buttons A single button to replace the buttons with, or an array of buttons. Can also be button config objects.
	 */
	setButtons : function( buttons ) {
		// If the bottom bar container is not set to be shown (it is set to be hidden), show it now.
		if( this.bottomBarContainer.isHidden() ) {
			this.bottomBarContainer.show();
		}
		
		// Now, replace the buttons in the buttonsContainer
		this.buttonsContainer.removeAll();
		this.buttonsContainer.add( buttons );
	},
	
	
	
	/**
	 * Gets the position of the Dialog. This can only be retrieved if the dialog is currently open. If the dialog is not open,
	 * all values will return 0.
	 * 
	 * @method getPosition
	 * @return {Object} An object with the following properties:
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li><b>x</b> : Int<div class="sub-desc">The position of the left side of the dialog, relative to the left side of the screen. Same as `left`.</div>
	 *     <li><b>y</b> : Int<div class="sub-desc">The position of the top of the dialog, relative to the top of the screen. Same as `top`.</div>
	 *     <li><b>left</b> : Int<div class="sub-desc">The position of the left side of the dialog, relative to the left side of the screen. Same as `x`.</div>
	 *     <li><b>top</b> : Int<div class="sub-desc">The position of the left side of the dialog, relative to the left side of the screen. Same as `y`.</div>
	 *     <li><b>right</b> : Int<div class="sub-desc">The position of the right side of the dialog, relative to the right side of the screen.</div>
	 *     <li><b>bottom</b> : Int<div class="sub-desc">The position of the bottom of the dialog, relative to the bottom of the screen.</div>
	 *   </ul>
	 * </div>
	 */
	getPosition : function() {
		if( !this.isOpen() ) {
			return {
				x      : 0,
				y      : 0,
				left   : 0,
				top    : 0,
				right  : 0,
				bottom : 0
			};
			
		} else {
			var $window  = jQuery( window ),
			    position = this.$dialog.dialog( 'widget' ).position(),
			    left     = position.left,
			    top      = position.top,
			    right    = $window.width() - ( position.left + this.getWidth() ),
			    bottom   = $window.height() - ( position.top + this.getHeight() );
			
			return {
				x      : left,
				y      : top,
				left   : left,
				top    : top,
				right  : right,
				bottom : bottom
			};
		}
	},
	
	
	/**
	 * Sizes the {@link #$contentEl} of the dialog (the container that holds the dialog's content) to constrain its
	 * size to the {@link #maxHeight} and {@link #maxWidth} configs, OR the browser's viewport size; whichever is smaller.
	 * This is to keep the Dialog's size constrained to the browser's viewport size, which otherwize may hide things like the 
	 * bottom button bar.<br><br>
	 * 
	 * This method makes calculations based on the dimensions of the dialog's title bar and button bar, and sizes the content 
	 * container appropriately to honor the {@link #maxHeight} and {@link #maxWidth} configs, or to be constrained to the 
	 * browser's viewport. Note that the Dialog must be currently be open for these calculations to be made, and this method
	 * is automatically called from the {@link #open} method.
	 * 
	 * @method resizeContentContainer
	 */
	resizeContentContainer : function() {
		// We can only do these calculations (and only want to do these calculations) if the dialog is currently open
		if( this.isOpen() ) {
			var $window = jQuery( window ),
			    $dialogOuter = this.$dialog.dialog( 'widget' ),  // access the jQuery UI Dialog's outer element
			    $dialogInnerEl = this.$dialogInnerEl,                // the inner wrapping element used to style the dialog's border. This sits directly inside of the outer element. 
			    $dialogContentWrap = this.$dialog,               // the element that wraps the dialog's content, and bottom bar.
			    $titleBar = $dialogOuter.find( 'div.ui-dialog-titlebar' ),
				$bottomBar = this.bottomBarContainer.getEl(),
				$contentEl = this.$contentEl;
			    
			
			// local function to calculated margins, borders, and padding, and return an object {height,width}
			var calculateElementSurround = function( $el ) {
				return {
					height : parseInt( $el.css( 'marginTop' ), 10 ) + parseInt( $el.css( 'borderTopWidth' ), 10 ) + parseInt( $el.css( 'paddingTop' ), 10 ) +
				             parseInt( $el.css( 'marginBottom' ), 10 ) + parseInt( $el.css( 'borderBottomWidth' ), 10 ) + parseInt( $el.css( 'paddingBottom' ), 10 ),
				
					width  : parseInt( $el.css( 'marginLeft' ), 10 ) + parseInt( $el.css( 'borderLeftWidth' ), 10 ) + parseInt( $el.css( 'paddingLeft' ), 10 ) +
				             parseInt( $el.css( 'marginRight' ), 10 ) + parseInt( $el.css( 'borderRightWidth' ), 10 ) + parseInt( $el.css( 'paddingRight' ), 10 )
				};
			};
			
			
			// We need the total height/width that the dialog takes up, without the content area. This includes margins, borders,
			// and paddings ("surround") of the outer element containers ($dialogOuter, $dialogInnerEl, and $dialogContentWrap), as well as
			// the heights (but not widths) of $titleBar and $bottomBar.
			var dialogOuterSurround = calculateElementSurround( $dialogOuter ),
			    dialogInnerSurround = calculateElementSurround( $dialogInnerEl ),
			    dialogContentWrapSurround = calculateElementSurround( $dialogContentWrap ),
				
				totalOuterHeight = dialogOuterSurround.height + dialogInnerSurround.height + dialogContentWrapSurround.height + $titleBar.outerHeight( true ) + $bottomBar.outerHeight( true ),
				totalOuterWidth = dialogOuterSurround.width + dialogInnerSurround.width + dialogContentWrapSurround.width,
			
			    // Find the maximum height and width available for the dialog. Use the configured maxHeight and maxWidth
			    // if they will fit, or use the max height/width that the browser viewport is currently providing (whichever is smaller).
			    calculatedMaxHeight = Math.min( +this.dialogMaxHeight || Number.POSITIVE_INFINITY, $window.height() - 20 ), // the given maxHeight config (converted to a number), or the window's height - 20px; whichever is smaller
			    calculatedMaxWidth = Math.min( +this.dialogMaxWidth || Number.POSITIVE_INFINITY, $window.width() - 20 ),    // the given maxWidth config (converted to a number), or the window's width - 20px; whichever is smaller
			
			    // Find the max height/width that we can make the content area, based on the calculated available max height/width
			    calculatedMaxContentHeight = calculatedMaxHeight - totalOuterHeight,
			    calculatedMaxContentWidth = calculatedMaxWidth - totalOuterWidth;
			
			
			// Set the maxHeight and maxWidth on the outer dialog element itself. This is for when the regular height/width configs have been explicitly
			// set, and the dialog should shrink past those if the viewport's size (or dialog's maxHeight/maxWidth configs) can't support that size.
			$dialogOuter.css( 'maxHeight', Math.max( calculatedMaxHeight - dialogOuterSurround.height, 0 ) );  // don't let these go negative,
			$dialogOuter.css( 'maxWidth', Math.max( calculatedMaxWidth - dialogOuterSurround.width, 0 ) );     // in case the browser is *really* small
			$dialogInnerEl.css( 'maxHeight', Math.max( calculatedMaxHeight - dialogOuterSurround.height - dialogInnerSurround.height, 0 ) );  // don't let these go negative,
			$dialogInnerEl.css( 'maxWidth', Math.max( calculatedMaxWidth - dialogOuterSurround.width - dialogInnerSurround.width, 0 ) );      // in case the browser is *really* small
			
			
			// Set the max height/width on the $contentEl (which is inside the $dialogContentWrap element)
			$contentEl.css( 'maxHeight', Math.max( calculatedMaxContentHeight, 0 ) );  // don't let these go negative,
			$contentEl.css( 'maxWidth', Math.max( calculatedMaxContentWidth, 0 ) );    // in case the browser is *really* small
			
			
			// If the Dialog's mask (inherited form ui.Component) is supposed to be shown, we may need to recalculated its height. 
			// Running the mask() method will do this.
			if( this.masked ) {
				this.mask();
			}
		}
	},
	
	
	/**
	 * Event handler for the browser window's resize event, in which the Dialog's {@link #$contentEl} is resized,
	 * and its position is reset.
	 * 
	 * @private
	 * @method onWindowResize
	 */
	onWindowResize : function() {
		this.resizeContentContainer();
		
		ui.Dialog.superclass.onWindowResize.apply( this, arguments );
	},
	
	
	/**
	 * Method that is run when the Dialog has finished being dragged from one position to another. This method
	 * handles the dragStop event from the jQuery UI dialog.  This method stores the new position ({@link #x} and {@link #y} values)
	 * for if the window is resized, the dialog will try to be repositioned in the same place. See the {@link #onWindowResize} method.
	 * 
	 * @private
	 * @method onDragStop
	 * @param {jQuery.Event} event
	 * @param {Object} ui An object with properties `offset` and `position`. Each of these has a `left` and `top` property.
	 */
	onDragStop : function( event, ui ) {
		// Store the new x and y values when the Dialog is dragged for if the window is resized, the dialog will try to be repositioned in the same place.
		var position = ui.position;
		this.x = position.left;
		this.y = position.top;
	},
	
	
	/**
	 * Method that is run when there is a keypress event in the dialog.  This method fires the {@link #keypress}
	 * event, and if the {@link #closeOnEscape} config is true, this method closes the dialog if the key is 'esc'.
	 * 
	 * @protected
	 * @method onKeyPress
	 * @param {jQuery.Event} evt
	 */
	onKeyPress : function( evt ) {
		this.fireEvent( 'keypress', this, evt );
		
		// If the closeOnEscape config is true, and the key pressed was 'esc', close the dialog.
		if( this.closeOnEscape && evt.keyCode === jQuery.ui.keyCode.ESCAPE ) {
			this.close();
		}
	},
	
	
	/**
	 * Closes the dialog.
	 * 
	 * @method close
	 */
	close : function() {
		if( this.fireEvent( 'beforeclose', this ) !== false ) {
			this.onBeforeClose();
			
			// If this dialog was a modal dialog, and the overlay was hidden, remove its 'opacity'
			// style at this time before the jQuery UI Dialog is closed. jQuery UI does weird things 
			// if the opacity is still set when the dialog closes, by opening up any new dialogs 
			// with weird overlay opacity values.
			if( this.modal && this.overlay === false ) {
				this.$overlayEl.css( 'opacity', '' );
			}
			this.$overlayEl = null;  // dialog is closing, it will remove its own overlay element. Remove this reference now.
		}
	},
	
	
	/**
	 * Template method that is run before the dialog has been closed, but after the {@link #beforeclose} event
	 * has fired (as a {@link #beforeclose} handler may return false, and prevent the dialog from closing).
	 * 
	 * @protected
	 * @method onBeforeClose 
	 */
	onBeforeClose : Kevlar.emptyFn,
	
	
	/**
	 * Template method that is run when the Dialog has been closed.
	 * 
	 * @protected
	 * @method onClose
	 */
	onClose : Kevlar.emptyFn,
	
	
	/**
	 * Method that runs when the Dialog is being destroyed.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		if( this.isOpen() ) {
			this.close();
		}
		
		// Destroy other Containers used by the Dialog
		this.bottomBarContainer.destroy();
		
		if( this.rendered ) {
			// unbind our window resize handler (which is set up in onRender)
			jQuery( window ).unbind( 'resize', this.windowResizeHandler );
		
			// destroy the dialog and its elements
			this.$dialog.dialog( 'destroy' );  // returns the inner element to its pre-init state
			this.$dialog.unbind();
		}

		
		ui.Dialog.superclass.onDestroy.apply( this, arguments );
	},
	
	
	// -----------------------------
	
	
	/**
	 * Override of {@link ui.Component#getMaskTarget} used to redefine the mask target as the Dialog's "inner" element, 
	 * which covers everything but the border.
	 * 
	 * @method getMaskTarget
	 * @return {jQuery}
	 */
	getMaskTarget : function() {
		return this.$dialogInnerEl;
	},
	
	
	// -----------------------------
	
	
	/**
	 * Extensions of {@link ui.Container ui.Container's} "cascade" method to include the bottomBarContainer of the Dialog in the cascade.
	 * See {@link ui.Container#cascade} for details on this method.<br><br>
	 * 
	 * @devNote All of the Container "child processing" methods use this method (like the findBy, findById, findByKey, 
	 * setData, and getData methods), so extending this effectively "updates" these methods as well for the Dialog
	 * to include the bottomBarContainer.
	 * 
	 * @method cascade
	 * @param {Function} fn The function to call
	 * @param {Object} scope (optional) The scope of the function (defaults to current Component)
	 * @param {Array} args (optional) The args to call the function with (defaults to passing the current Component)
	 */
	cascade : function() {
		// First call the superclass method to handle the processing of this Container's items (the Dialog's items)
		ui.Dialog.superclass.cascade.apply( this, arguments );
		
		// Now call the method on the bottomBarContainer to process that as well
		this.bottomBarContainer.cascade.apply( this.bottomBarContainer, arguments );
	}
	
	
} );


// Static Properties
Kevlar.apply( ui.Dialog, {
	
	/**
	 * @private
	 * @static
	 * @property renderTpl
	 * @type String
	 * The template to use to render the Dialog.
	 */
	renderTpl : [
		'<div class="dialog-innerWrap">',
			'<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">',
				'<span class="ui-dialog-title"></span>',
			'</div>',
			'<div class="ui-dialog-content ui-widget-content" scrolltop="0" scrollleft="0" />',
		'</div>'
	].join( "" )
	
} ); 

/**
 * @class ui.FieldSet
 * @extends ui.Container
 * 
 * Renders a FieldSet container, which has a title, and holds child Components.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.FieldSet = Kevlar.extend( ui.Container, {
	
	/**
	 * @cfg {String} title
	 * The title for the FieldSet, which may include html. Defaults to an empty string (for no title).
	 */
	title : "",
	
	
	/**
	 * @cfg {String} elType
	 * @inheritdoc
	 */
	elType : 'fieldset',
	
	
	/**
	 * @private
	 * @property $legendEl
	 * The &lt;legend&gt; element within the &lt;fieldset&gt;.
	 * @type jQuery
	 */
	
	
	// protected
	initComponent : function() {
		this.cls += ' dialog-fieldSet';
		
		ui.FieldSet.superclass.initComponent.call( this );
	},
	
	
	// protected
	onRender : function() {
		ui.FieldSet.superclass.onRender.apply( this, arguments );
		
		this.$legendEl = jQuery( '<legend>' + this.title + '</legend>' ).appendTo( this.$el );
	},
	
	
	/**
	 * Sets the title of the FieldSet.
	 * 
	 * @method setTitle
	 * @param {String} title
	 */
	setTitle : function( title ) {
		if( !this.rendered ) {
			this.title = title;
		} else {
			this.$legendEl.empty().append( title );
		}
	}
	
} );


// Register the type so it can be created by the string 'FieldSet' in the manifest
ui.ComponentManager.registerType( 'FieldSet', ui.FieldSet );

/**
 * @class ui.formFields.CheckboxField
 * @extends ui.formFields.AbstractField
 *  
 * Checkbox field component.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.formFields.CheckboxField = Kevlar.extend( ui.formFields.AbstractField, {
	
	/**
	 * @cfg {String} checkboxLabel
	 * The label for the checkbox itself, which will be placed to the right of the checkbox. This config is to differentiate from
	 * the {@link ui.formFields.AbstractField#label label} provided by {@link ui.formFields.AbstractField AbstractField} (the one which
	 * affects all form field components uniformly).  Defaults to an empty string.<br><br>
	 * 
	 * Note that if the checkbox should be aligned with other form fields that have "left side" labels (see 
	 * {@link ui.formFields.AbstractField#labelPosition}, then set its {@link ui.formFields.AbstractField#label label} config to
	 * a non-breaking space (&amp;nbsp;).
	 */
	checkboxLabel : "",
	
	/**
	 * @cfg {String/Function} value
	 * The initial value for the field, if any. Any truthy value will initialize the checkbox as checked.
	 */
	
	
	// protected
	onRender : function() {
		// Call superclass onRender()
		ui.formFields.CheckboxField.superclass.onRender.apply( this, arguments );
		
		
		// Create the input element, and append it to the $inputContainerEl
		this.$inputEl = jQuery( '<input type="checkbox" class="checkbox" id="' + this.inputId + '" name="' + this.inputName + '"' + ( this.value ? ' checked' : '' ) + ' />' )
			.appendTo( this.$inputContainerEl );
		
		// Create the checkbox label element, which comes up on the right side of the checkbox.
		this.$checkboxLabelEl = jQuery( '<label for="' + this.inputId + '" class="dialog-formField-label" />&nbsp;' + ( this.checkboxLabel || "" ) )
			.appendTo( this.$inputContainerEl );
		
		// Add event handlers to the input element
		this.$inputEl.bind( {
			change : function() { this.onChange( this.getValue() ); }.createDelegate( this )   // call onChange() with the new value.
		} );
	},
	
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s setValue() method, which sets the value to the field.
	 * 
	 * @method getValue
	 * @param {Boolean} value The value of the field. If truthy, the checkbox will be checked. If falsy, the checkbox will be unchecked.
	 */
	setValue : function( value ) {
		if( !this.rendered ) {
			this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
		} else {
			this.$inputEl.prop( 'checked', !!value );
		}
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s getValue() method, which returns the value of the field.
	 * 
	 * @method getValue
	 * @return {Boolean} The value of the field (true if it's checked, false otherwise).
	 */
	getValue : function() {
		if( !this.rendered ) {
			return !!this.value;  // If the value was set before the Component has been rendered (i.e. before the Field has been created), return that. Make sure it returns a Boolean as well.
		} else {
			return this.$inputEl.prop( "checked" );
		}
	}
	
} );


// Register the type so it can be created by the string 'Checkbox' in the manifest
// For backward compatibility, register the type 'Boolean' as well.
ui.ComponentManager.registerType( 'Checkbox', ui.formFields.CheckboxField );  
ui.ComponentManager.registerType( 'Boolean', ui.formFields.CheckboxField ); 

/**
 * @class ui.formFields.DateField
 * @extends ui.formFields.TextField
 * 
 * Date input field, which uses a jQuery UI DatePicker when the field has focus.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.formFields.DateField = Kevlar.extend( ui.formFields.TextField, {
	
	/**
	 * @cfg {String} emptyText
	 * The text to show in the field when the field is empty. When the user focuses the field, this text
	 * will be removed, allowing the user to type their value.<br><br>
	 * 
	 * For DateField, this accepts the special string "now", which can be used to set the field's emptyText to the current date.<br><br>
	 * 
	 * Note that this is not compatible with the {@link #labelPosition} config set to "infield". See the description of {@link #labelPosition}.
	 */
	
	/**
	 * @cfg {String/Function} value
	 * The initial value for the field, if any. The special string "now" can be used to set the field to the current date.
	 */
	 
	// protected
	initComponent : function() {
		ui.formFields.DateField.superclass.initComponent.apply( this, arguments );
		
		// Handle the string "now" on the emptyText
		this.emptyText = this.handleDateValue( this.emptyText );
		
		// Handle the string "now" on the value
		this.value = this.handleDateValue( this.value );
	},
	
	
	// protected
	onRender : function( container ) { 
		// Call superclass onRender() first, to render this Component's element
		ui.formFields.DateField.superclass.onRender.apply( this, arguments );
		
		// Create a jQuery UI Datepicker instance for the field
		this.$inputEl.datepicker( {
            dateFormat: 'mm/dd/yy'
        } );
	},
	
	
	/**
	 * Extension of {@link ui.formFields.TextField#setValue}, to accept the special value "now", and replace it with the current date.
	 * 
	 * @method setValue
	 * @param {String} value The value for the field. Accepts the special value "now", which will be replaced by the current date (in mm/dd/yyyy format).
	 */
	setValue : function( value ) {
		value = this.handleDateValue( value );
		
		ui.formFields.DateField.superclass.setValue.call( this, value );
	},
	
	
	/**
	 * Extension of {@link ui.formFields.TextField#setEmptyText}, to accept the special value "now", and replace it with the current date.
	 * 
	 * @method setEmptyText
	 * @param {Mixed} emptyText The empty text to set to the Field.
	 */
	setEmptyText : function( emptyText ) {
		emptyText = this.handleDateValue( emptyText );
		
		ui.formFields.DateField.superclass.setEmptyText.call( this, emptyText );
	},
	
	
	/**
	 * Converts the given `value` to the appropriate value for the DateField. If the special value "now" is provided, it will be replaced with the
	 * current date.
	 * 
	 * @private
	 * @method handleDateValue
	 * @param {String} value The value to convert if it is the string "now".
	 * @return {String}
	 */
	handleDateValue : function( value ) {		
		return ( value === "now" ) ? jQuery.datepicker.formatDate( 'mm/dd/yy', new Date() ) : value;
	},
	
	
	/**
	 * Destroys the jQuery UI datepicker instance on the field upon field destruction.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		if( this.rendered ) {
			this.$inputEl.datepicker( 'destroy' );
		}
		
		ui.formFields.DateField.superclass.onDestroy.apply( this, arguments );
	}
	
} );


// Register the type so it can be created by the string 'Date' in the manifest
ui.ComponentManager.registerType( 'Date', ui.formFields.DateField );

/**
 * @class ui.formFields.DateTimeField
 * @extends ui.formFields.TextField
 * 
 * Date input field, which uses the jQuery datetimeEntry plugin when the field has focus.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.formFields.DateTimeField = Kevlar.extend( ui.formFields.TextField, {
	
	/**
	 * @cfg {String} emptyText
	 * The text to show in the field when the field is empty. When the user focuses the field, this text
	 * will be removed, allowing the user to type their value.<br><br>
	 * 
	 * For DateTimeField, this accepts the special string "now", which can be used to set the field's emptyText to the current date.<br><br>
	 * 
	 * Note that this is not compatible with the {@link #labelPosition} config set to "infield". See the description of {@link #labelPosition}.
	 */
	
	/**
	 * @cfg {String/Function} value
	 * The initial value for the field, if any. The special string "now" can be used to set the field to the current date.
	 */
	 
	// protected
	initComponent : function() {
		ui.formFields.DateTimeField.superclass.initComponent.apply( this, arguments );
		
		// Handle the string "now" on the emptyText
		this.emptyText = this.handleDateValue( this.emptyText );
		
		// Handle the string "now" on the value
		this.value = this.handleDateValue( this.value );
	},
	
	
	// protected
	onRender : function( container ) { 
		// Call superclass onRender() first, to render this Component's element
		ui.formFields.DateTimeField.superclass.onRender.apply( this, arguments );
		
		this.$inputEl.datetimeEntry( { datetimeFormat: 'Y/O/D H:M' } );
	},
	
	
	/**
	 * Extension of {@link ui.formFields.TextField#setValue}, to accept the special value "now", and replace it with the current date.
	 * 
	 * @method setValue
	 * @param {String} value The value for the field. Accepts the special value "now", which will be replaced by the current date.
	 */
	setValue : function( value ) {
		value = this.handleDateValue( value );
		
		ui.formFields.DateTimeField.superclass.setValue.call( this, value );
	},
	
	
	/**
	 * Extension of {@link ui.formFields.TextField#setEmptyText}, to accept the special value "now", and replace it with the current date.
	 * 
	 * @method setEmptyText
	 * @param {Mixed} emptyText The empty text to set to the Field.
	 */
	setEmptyText : function( emptyText ) {
		emptyText = this.handleDateValue( emptyText );
		
		ui.formFields.DateTimeField.superclass.setEmptyText.call( this, emptyText );
	},
	
	
	/**
	 * Converts the given `value` to the appropriate value for the DateTimeField. If the special value "now" is provided, it will be replaced with the
	 * current date.
	 * 
	 * @private
	 * @method handleDateValue
	 * @param {String} value The value to convert if it is the string "now".
	 * @return {String}
	 */
	handleDateValue : function( value ) {		
		return ( value === "now" ) ? new Date() : value;
	},
	
	
	/**
	 * Destroys the jQuery datetimeEntry instance on the field upon field destruction.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		if( this.rendered ) {
			this.$inputEl.datetimeEntry( 'destroy' );
		}
		
		ui.formFields.DateTimeField.superclass.onDestroy.apply( this, arguments );
	}
	
} );


// Register the type so it can be created by the string 'Date' in the manifest
ui.ComponentManager.registerType( 'DateTime', ui.formFields.DateTimeField );

/**
 * @class ui.formFields.DropdownField
 * @extends ui.formFields.WrappedInputField
 * 
 * Dropdown list where only one item may be selected.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.formFields.DropdownField = Kevlar.extend( ui.formFields.WrappedInputField, {
	
	/**
	 * @cfg {Array/Function} options (required) 
	 * The options for the dropdown. See the description of the {@link ui.utils.OptionsStore#setOptions} method for accepted formats.<br><br>
	 * 
	 * Note that along with 'text' and 'value' properties, options can have the extra properties of 'cls' and 'style', which can specify the
	 * css class name(s) to style the dropdown option with, or a hash of styles to style the dropdown option with, repectively. Ex:
	 * <pre><code>[ { text: "Option 1", "value": 1, cls: "myCssClass", "style": { "font-weight": "bold", "font-size": "14px" } } ]</code></pre> 
	 */
	
	/**
	 * @cfg {String} menuCls
	 * Any additional css class(es) to add to the dropdown menu itself. The dropdown menu is appended to the document body, and therefore can not be
	 * styled by regular descendant css rules. Use this config to add one or more custom css classes (separated by spaces) for the styling of the dropdown menu. 
	 */
	menuCls : "",
	
	/**
	 * @cfg {String} menuCollisionStrategy
	 * The strategy to use to re-position the dropdown menu when it collides with the edge of the screen.  Can be one of the following values:
	 * 'flip', 'fit', or 'none'.  See the 'collision' option of jQuery UI's position utility for details. http://jqueryui.com/demos/position/  
	 * Defaults to 'flip'.
	 */
	menuCollisionStrategy : 'flip',
	
	/**
	 * @private
	 * @property optionsStore
	 * The OptionsStore instance used for managing the DropdownField's options.
	 * @type ui.utils.OptionsStore
	 */
	
	/**
	 * @private
	 * @property optionsMenuOpen
	 * Flag that stores whether or not the options menu is open or closed.
	 * @type Boolean
	 */
	optionsMenuOpen : false,


	
	// protected
	initComponent : function() {
		ui.formFields.DropdownField.superclass.initComponent.call( this );
		
		// Create the OptionsStore for managing the DropdownField's options data
		this.optionsStore = new ui.utils.OptionsStore( this.options );
		
		// Make sure an options (or choices) config was provided (or a function provided for options returned a value)
		if( this.optionsStore.getOptions().length === 0 ) {
			throw new Error( "Error: 'options' not provided to DropdownField configuration, or a generating 'options' function didn't return any options." );
		}
		
		// Initialize the dropdown's value
		this.initValue();
	},
	
	
	
	/**
	 * Initializes the Dropdown's {@link #value}. If the {@link #value} property is undefined, or it doesn't match any of the values in the 
	 * {@link #options} provided to the DropdownField, it is initialized to the first {@link #options option's} value.  This guarantees that 
	 * the DropdownField's initial value is always set to a valid option value. This method may be extended by subclasses for any pre/post 
	 * processing that they may need to add.
	 * 
	 * @protected
	 * @method initValue
	 */
	initValue : function() {
		if( typeof this.value === 'undefined' ) {
			// No 'value' config provided, set the value to the value of the first option
			this.value = this.optionsStore.getOptions()[ 0 ].value;
		} else {
			// Value config was provided, make sure it is in the options store. If not, 
			// set it to the value of the first option. This guarantees that the Dropdown's
			// value is always set to a valid option
			if( this.optionsStore.getByValue( this.value ) === null ) {
				this.value = this.optionsStore.getOptions()[ 0 ].value;
			}
		}
	},
	
	
	// protected
	onRender : function( container ) {
		// Call superclass onRender() first, to render this Component's element
		ui.formFields.DropdownField.superclass.onRender.apply( this, arguments );
		
		// Note: eventually we want the custom dropdown implementation to be able to be tabbed to in the browser, which may involve creating
		// an actual dropdown field (<select> element). Leaving this (old) code here for now.  
		/*
		// Create the dropdown
		this.$inputEl = jQuery( '<select id="' + this.inputId + '" name="' + this.inputName + '" class="ui-corner-all dropdown"></select>' )
			.bind( {
				change : function() { this.onChange( this.getValue() ); }.createDelegate( this ),  // Call onChange() with the new value
				focus  : this.onFocus.createDelegate( this ),
				blur   : this.onBlur.createDelegate( this )
			} )
			.appendTo( this.$inputContainerEl );  // Append the dropdown to the input container
		
		// Fill the options
		this.redrawOptions();
		*/
				
		
		var $inputContainerEl = this.$inputContainerEl,
		    dropdownRenderTpl = ui.formFields.DropdownField.dropdownRenderTpl,
		    fieldValue = this.getValue(),
		    option = this.optionsStore.getByValue( fieldValue );
		
		var dropdownMarkup = Kevlar.util.tmpl( dropdownRenderTpl, {
			inputName     : this.inputName,
			initialValue  : fieldValue,
			
			// For the initially selected option
			optionText    : option.text,
			optionClass   : ( option.cls ) ? option.cls : '',
			optionStyles  : ( option.style ) ? Kevlar.CSS.hashToString( option.style ) : ''
		} );
		$inputContainerEl.append( dropdownMarkup );
		
		// Assign references to created elements
		this.$inputEl = $inputContainerEl.find( 'input[name="' + this.inputName + '"]' );
		this.$dropdownContainer = $inputContainerEl.find( 'div.ui-dropdownField' );
		this.$selectText = this.$dropdownContainer.find( 'div.ui-dropdownField-selectText' );
		this.$openButton = this.$dropdownContainer.find( 'div.ui-dropdownField-openButton' );
		
		// Apply a click handler to the dropdown's "select text" and open button, for showing the dropdownMenu
		this.$selectText.click( this.onDropdownClick.createDelegate( this ) );
		this.$openButton.click( this.onDropdownClick.createDelegate( this ) );
		
		
		// Create the dropdown menu, which is a <ul> element that holds the dropdown list. This is appended to the document body.
		this.$optionsMenu = jQuery( '<ul class="ui-dropdownField-menu ' + this.menuCls + '" />' ).hide().appendTo( document.body );
		
		// TODO: Add IE iframe shim
		/*if ($.browser.msie && jQuery.browser.version < 7) {
			$select.after($('<iframe src="javascript:\'\';" class="ui-dropdownField-shim" marginwidth="0" marginheight="0" align="bottom" scrolling="no" tabIndex="-1" frameborder="0"></iframe>').css({ height: $select.height()+4 +'px' }));
		}*/
		
		// Now, draw the initial set of options
		this.redrawOptions();
		
		
		// Add the key listener
		/*
		$select.keydown(function(e){
			var selectedIndex = this.selectedIndex;
			switch(e.keyCode){
				case 40: // Down
					if (selectedIndex < this.options.length - 1){ selectedIndex+=1; }
					break;
				case 38: // Up
					if (selectedIndex > 0){ selectedIndex-=1; }
					break;
				default:
					return;
			}
			$('ul a', $wrapper).removeClass('selected').eq(selectedIndex).addClass('selected');
			$('span:eq(0)', $wrapper).html($('option:eq('+ selectedIndex +')', $select).attr('selected', 'selected').text());
			return false;
		}).focus(function(){ $wrapper.addClass('jNiceFocus'); }).blur(function(){ $wrapper.removeClass('jNiceFocus'); });
		*/
		
		
		// Add a handler to check for a click on the document. If the click wasn't over the dropdown's element
		// or its menu, the dropdown's menu will be hidden.
		this.documentClickHandler = this.onDocumentClick.createDelegate( this );   // save a reference to the wrapped function so we can remove it later in onDestroy 
		jQuery( document ).bind( 'mousedown', this.documentClickHandler );
		
	},  // eo onRender
	
	
	
	/**
	 * Method that is run as a click handler on the document body, which tests if a click was made away
	 * from the dropdown itself or its menu, which will close the dropdown's menu if that is the case.
	 * 
	 * @private
	 * @method onDocumentClick
	 * @param {jQuery.Event} evt
	 */
	onDocumentClick : function( evt ) {
		if( this.optionsMenuOpen ) {  // quick test to prevent the following (more expensive) logic from running if there is no need for it
			var parents = jQuery( evt.target ).parents().andSelf(),  // andSelf() needed to include the element that was clicked on as well, because it may be the <ul> element itself (such as when clicking on its scrollbar), and the menu should not be hidden in this case  
			    dropdownContainerEl = this.$dropdownContainer[ 0 ],
			    optionsMenuEl = this.$optionsMenu[ 0 ],
			    found = false;
				
			for( var i = 0, len = parents.length; i < len; i++ ) {
				if( parents[ i ] === dropdownContainerEl || parents[ i ] === optionsMenuEl ) {
					found = true;
					break;
				}
			}
			
			// The dropdownContainerEl was not found as a parent of the element that was clicked, hide the options menu
			if( !found ) {
				this.hideOptionsMenu();
			}
		}
	},
	
	
	/**
	 * Method that is run when the dropdown itself, or the "open" button, is clicked. This opens the dropdown's options menu.
	 * 
	 * @private
	 * @method onDropdownClick
	 * @param {jQuery.Event} evt
	 */
	onDropdownClick : function( evt ) {
		evt.preventDefault();
		
		// Slide down the menu if it is not open, up if it is
		this.toggleOptionsMenu();
		
		// Scroll to the currently selected option
		var $optionsMenu = this.$optionsMenu,
		    offSet = jQuery( 'a.selected', $optionsMenu ).offset().top - $optionsMenu.offset().top;
		$optionsMenu.animate( { scrollTop: offSet } );
	},
	
	
	
	/**
	 * Handles when an option is clicked in the dropdown's menu.
	 * 
	 * @private
	 * @method onOptionClick
	 * @param {jQuery.Event} evt
	 */
	onOptionClick : function( evt ) {
		evt.preventDefault();
		
		var $targetEl = jQuery( evt.target ),
		    currentValue = this.getValue(),
		    newValue = $targetEl.data( 'value' );
		
		// Only make a change if the newly selected value is different from the current value
		if( currentValue !== newValue ) {
			// Set the new value
			this.setValue( newValue );
			
			// Run onChange with the new value
			this.onChange( this.getValue() );
		}
		
		// Hide the dropdown menu
		this.hideOptionsMenu();
	},
	
	
	
	// --------------------------------------
	
	
	
	/**
	 * Sets the options for the dropdown. Normalizes the options into an array of objects, where each object
	 * has the properties 'text' and 'value'.  See the {@link #options} config for accepted formats to the `options`
	 * parameter. 
	 * 
	 * @method setOptions
	 * @param {Array/Function} options See the {@link #options} config for the accepted formats of this parameter.
	 */
	setOptions : function( options ) {
		// Store the options in the OptionsStore
		this.optionsStore.setOptions( options );
		
		// Update the dropdown's options based on the newly set options (if the dropdown field is rendered)
		this.redrawOptions();
	},
	
	
	/**
	 * Retrieves the options of the dropdown. This returns an array of objects, where the objects have 
	 * properties `text` and `value`. Example of a returned array:
	 * <pre><code>[ { text: "Option 1", value: "1" }, { text: "Option 2", value: "2" } ]</code></pre><br>
	 * 
	 * Note that even if the options' values are specified as numbers, they will be converted to strings
	 * (as strings are the only allowable values for the option tag).
	 *
	 * @method getOptions
	 * @return {Array}
	 */
	getOptions : function() {
		return this.optionsStore.getOptions();
	},
	
	
	
	/**
	 * Updates the displayed options in the dropdown, based on the current options set by setOptions().
	 * 
	 * @private
	 * @method redrawOptions
	 */
	redrawOptions : function() {
		if( this.rendered ) {
			var options = this.getOptions(),
				numOptions = options.length,
			    $optionsMenu = this.$optionsMenu,
			    optionsMenuRenderTpl = ui.formFields.DropdownField.optionsMenuRenderTpl,
				currentFieldValue = this.getValue(),
				i, option;
			
			// Populate the dropdown menu with its options
			$optionsMenu.empty();
			
			
			// Append the markup all at once (for performance, instead of one element at a time)
			var optionsMarkup = "";
			for( i = 0; i < numOptions; i++ ) {
				option = options[ i ];
				
				optionsMarkup += Kevlar.util.tmpl( optionsMenuRenderTpl, {
					anchorClass : ( option.cls || "" ) + ( ( option.value === currentFieldValue ) ? ' selected' : '' ),
					anchorStyle : ( option.style ) ? Kevlar.CSS.hashToString( option.style ) : '', 
					text : option.text  
				} );
			}
			$optionsMenu.append( optionsMarkup );	
			
			
			// Now that the markup is appended and DOM nodes have been created, assign the values to the anchor tags using .data() (so that values of any datatype may be assigned)
			var $anchors = $optionsMenu.find( 'a' );
			for( i = 0; i < numOptions; i++ ) {
				// Add the "value" as data (instead of an attribute), so that any datatype can be stored for the value
				jQuery( $anchors[ i ] ).data( 'value', options[ i ].value );
			}
			
			// Attach a click handler to each of the options
			$optionsMenu.find( 'a' ).click( this.onOptionClick.createDelegate( this ) );
		}
	},
	
	
	// --------------------------------------
	
	
	/**
	 * Expands and shows the options menu.
	 * 
	 * @method showOptionsMenu 
	 */
	showOptionsMenu : function() {
		this.optionsMenuOpen = true;
		
		this.$optionsMenu.show();
		
		// Size the width of the menu based on the width of the dropdown's elements
		this.$optionsMenu.width( this.$selectText.width() );
		
		// Position the menu against the dropdown's elements
		this.$optionsMenu.position( {
			my : 'left top',
			at : 'left bottom',
			of : this.$selectText,
			collision : this.menuCollisionStrategy
		} );
	},
	
	
	/**
	 * Hides the options menu.
	 * 
	 * @method hideOptionsMenu 
	 */
	hideOptionsMenu : function( anim ) {
		this.optionsMenuOpen = false;
		
		this.$optionsMenu.hide();
	},
	
	
	/**
	 * Toggles the options menu. If it is currently open, it will be closed. If it is currently
	 * closed, it will be opened.
	 * 
	 * @method toggleOptionsMenu
	 */
	toggleOptionsMenu : function() {
		if( this.optionsMenuOpen ) {
			this.hideOptionsMenu();
		} else {
			this.showOptionsMenu();
		}
	},
	
	
	
	
	// --------------------------------------
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s setValue() method, which sets the value to the field.
	 * If the provided `value` is not an option, the value of the field will remain unchanged.
	 * 
	 * @method setValue
	 * @param {String} value The value of the field.
	 */
	setValue : function( value ) {
		if( typeof value === 'undefined' || value === null ) {
			return;
		}
		
		// If there is an option with the provided value, set it. Otherwise, don't set anything.
		var option = this.optionsStore.getByValue( value );
		if( option !== null ) {
			this.value = value;
			
			if( this.rendered ) {
				// Create a new element for the $selectText's html, which will be styled based on the option's cls and/or style properties.
				var $div = jQuery( '<div class="' + option.cls + '" style="' + ( option.style ? Kevlar.CSS.hashToString( option.style ) : '' ) + '">' + option.text + '</div>' );
				
				// Set the $selectText's html
				this.$selectText.empty().append( $div );
				
				
				// Update the options menu
				var $optionsMenu = this.$optionsMenu;
				$optionsMenu.find( 'a.selected' ).removeClass( 'selected' );  // De-select any currently selected item in the dropdown menu
				
				// Select the item with the given value
				var $anchors = $optionsMenu.find( 'a' );
				for( var i = 0, len = $anchors.length; i < len; i++ ) {
					var $a = jQuery( $anchors[ i ] );
					if( $a.data( 'value' ) === value ) {
						$a.addClass( 'selected' );
						break;
					}
				}
				
				
				// Update the hidden field
				this.$inputEl.val( value );
			}
		}
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s getValue() method, which returns the value of the field.
	 * 
	 * @method getValue
	 * @return {String} The value of the option that is selected in the dropdown.
	 */
	getValue : function() {
		// Note: If the Dropdown is not rendered, this will return the configured value. If there was no configured value
		// or an invalid configured value, it defaults to the value of the first option in initComponent().  Otherwise,
		// this property is updated when there is a new selection in the dropdown.
		return this.value;
	},
	
	
	/**
	 * Convenience method for setting the selected option in the dropdown by its text (as opposed to its value). Use {@link #setValue}
	 * to select by option value.  If the provided `text` is not an option, the field will remain unchanged.
	 * 
	 * @method setText
	 * @param {String} text The text of the option that should be selected in the dropdown.
	 */
	setText : function( text ) {
		// If there is an option with the provided text, set the value based on it. Otherwise, we don't set anything.
		var option = this.optionsStore.getByText( text );
		if( option ) {
			this.setValue( option.value );
		}
	},
	
	
	/**
	 * Convenience method for getting the text of the dropdown's selected option. Use {@link #getValue} to retrieve the selected option's value.
	 * 
	 * @method getText
	 * @return {String} The text of the selected option in the dropdown. 
	 */
	getText : function() {
		var option = this.optionsStore.getByValue( this.getValue() );
		return option.text;
	},
	
	
	// protected
	onDestroy : function() {
		if( this.rendered ) {
			// Remove the document click handler, which hides the dropdown menu when its not clicked
			jQuery( document ).unbind( 'mousedown', this.documentClickHandler );
			
			// Remove the optionsMenu element from the document body
			this.$optionsMenu.remove();
		}
		
		ui.formFields.DropdownField.superclass.onDestroy.call( this );
	}
	
} );


// Add static properties
Kevlar.apply( ui.formFields.DropdownField, {
	
	/**
	 * @private
	 * @static
	 * @property dropdownRenderTpl
	 * @type String
	 * The template to use to render the dropdown's elements. Note: The hidden input is to allow this field to be submitted
	 * as a regular form field.
	 */
	dropdownRenderTpl : [
		'<input type="hidden" name="<%= inputName %>" value="<%= initialValue %>" />',
		'<div class="ui-dropdownField">',
			'<div class="ui-dropdownField-selectText">',
				'<div class="<%= optionClass %>" style="<%= optionStyles %>"><%= optionText %></div>',
			'</div>',
			'<div class="ui-dropdownField-openButton" />',
		'</div>'
	].join( " " ),
	
	
	/**
	 * @private
	 * @static
	 * @property optionsMenuRenderTpl
	 * @type String
	 * The template to use to render the dropdown's options menu elements.
	 */
	optionsMenuRenderTpl : [
		'<li>',
			'<a href="#" class="<%= anchorClass %>" style="<%= anchorStyle %>"><%= text %></a>',
		'</li>'
	].join( " " )
	
} );


// Register the type so it can be created by the string 'Dropdown' in the manifest
ui.ComponentManager.registerType( 'Dropdown', ui.formFields.DropdownField );

/**
 * @class ui.formFields.HiddenField
 * @extends ui.formFields.AbstractField
 * 
 * A hidden input.  This class does not have any visible display. 
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.formFields.HiddenField = Kevlar.extend( ui.formFields.AbstractField, {
	
	/**
	 * @hide
	 * @cfg {String} label
	 */
	
	/**
	 * @hide
	 * @cfg {String} help
	 */
	
	/**
	 * @hide
	 * @cfg {Boolean} hidden
	 */
	
	
	
	// protected
	initComponent : function() {
		// Make sure there is no label and help text
		this.label = "";
		this.help = "";
		
		// Make sure the outer element (created by ui.Component) is hidden, as there should be no visible indication of the field
		this.hidden = true;
		
		// Call superclass initComponent
		ui.formFields.HiddenField.superclass.initComponent.call( this );
	},
	
	
	// protected
	onRender : function( container ) { 
		// Call superclass onRender() first, to render this Component's element
		ui.formFields.HiddenField.superclass.onRender.apply( this, arguments );
		
		// Create and append the hidden field
		this.$inputEl = jQuery( '<input type="hidden" id="' + this.inputId + '" name="' + this.inputName + '" value="' + ( this.value || "" ) + '" />' )
			.appendTo( this.$inputContainerEl );
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s setValue() method, which sets the value to the field.
	 * 
	 * @method getValue
	 * @param {String} value The value of the field.
	 */
	setValue : function( value ) {
		if( !this.rendered ) {
			this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
		} else {
			this.$inputEl.val( value );
		}
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s getValue() method, which returns the value of the field.
	 * 
	 * @method getValue
	 * @return {String} The value of the field.
	 */
	getValue : function() {
		if( !this.rendered ) {
			return this.value;  // If the value was set before the Component has been rendered (i.e. before the Field has been created), return that.
		} else {
			return this.$inputEl.val();
		}
	}
	
} );


// Register the type so it can be created by the string 'Hidden' in the manifest
ui.ComponentManager.registerType( 'Hidden', ui.formFields.HiddenField );  

/**
 * @class ui.formFields.LinkTextField
 * @extends ui.formFields.TextField
 * 
 * A {@link ui.formFields.TextField TextField} implementation that also provides the ability to link the text, if desired.
 * Shows a "Link" button at the right side of the text field.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.formFields.LinkTextField = Kevlar.extend( ui.formFields.TextField, {
	
	/**
	 * @cfg {String/Function} default
	 * The default value for the field. If a function is provided, then the function is called and the return
	 * value from the function is used. This should match the format of the {@link #value} config.
	 */
	
	/**
	 * @cfg {String/Object} value
	 * The initial value (data) to put into the Link Text Field. If the value is a string, it is assumed that the string
	 * is the text for the field, and it is not linked anywhere.  If the value is an object, it may have the following properties (all optional):
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li>
	 *       <b>text</b> : String
	 *       <div class="sub-desc">The text for the field (i.e. the link to show on the page).</div>
	 *     </li>
	 *     <li>
	 *       <b>pageid</b> : Int
	 *       <div class="sub-desc">
	 *         The pageid of a page within bitmix that the link points to. This is only valid for links that point to other pages within the site.
	 *         If this is defined, and not null, then the link-picker overlay will be set to "page" when it is opened.
	 *       </div>
	 *     </li>
	 *     <li>
	 *       <b>url</b> : String
	 *       <div class="sub-desc">
	 *         The url that the link points to. This is used for both "page" and "url" selections.
	 *         If this has a value, and `pageid` is either undefined or null, then the link-picker overlay will be set to "url" when it is opened.
	 *       </div>
	 *     </li>
	 *   </ul>
	 * </div>
	 */
	
	
	
	// protected
	initComponent : function() {
		// Add the 'linkTextField' css classes to this Component's element
		this.cls += ' linkTextField';
		
		// Create the popup overlay for linking the field's text
		this.linkPickerOverlay = new ui.components.LinkPickerOverlay();
		
		// Call the superclass's initComponent
		ui.formFields.LinkTextField.superclass.initComponent.call( this );
	},
	
	
	
	// protected
	onRender : function( container ) {
		// Call superclass onRender()
		ui.formFields.LinkTextField.superclass.onRender.apply( this, arguments );
		
		// Now that the field is rendered, we can set the overlay's anchor to the text field's element.
		// When it is opened, it will be positioned up against the text field.
		this.linkPickerOverlay.setAnchor( {
			element : this.$inputEl,
			offset  : "0 10"
		} );
		
		
		// Create the "link" button that goes inside the text field, which when clicked, opens up the overlay
		this.$linkButton = jQuery( '<button class="linkTextField-linkButton">Link</button>' ).button();
		this.$linkButton.appendTo( this.$inputContainerEl );
		this.$linkButton.bind( {
			'click' : function() {
				this.linkPickerOverlay.open();
			}.createDelegate( this )
		} );
	},
	
	
	
	/**
	 * Override of {@link ui.formFields.TextField#setValue} method, which sets the value to the field based
	 * on the LinkTextField's data object (instead of TextField's string). See {@link #value} for more information.
	 * 
	 * @method getValue
	 * @param {Object} value The value of the field. This is an object, with properties for the link. See {@link #value}.
	 */
	setValue : function( value ) {
		// Handle a string argument, by putting it in an object under the key 'text'
		if( typeof value === 'string' ) {
			value = { text: value };
		}
		
		
		if( !this.rendered ) {
			this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
			
		} else {
			var dataObj = value || {},  // naming dataObj for clarity that the value is an object
			    text = dataObj.text || "";
			
			// Set the text field
			this.$inputEl.val( text );
			
			// If the value being set is the default, add the ui-hint-text class.  Not sure if this should definitely be like this, but it should work 
			// for most cases (i.e. every case except when the user saves actual data that is the default). Otherwise, make sure that the ui-hint-text class 
			// is removed on set.
			var defaultValue = this.getDefaultValue();
			if( typeof defaultValue === 'object' && text === defaultValue.text ) {
				this.$inputEl.addClass( 'ui-hint-text' );
			} else {
				this.$inputEl.removeClass( 'ui-hint-text' );
			}
			
			
			// Set the LinkPickerOverlay's state based on the url and pageid
			this.linkPickerOverlay.setState( {
				url    : dataObj.url,
				pageid : dataObj.pageid
			} );
		}
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s getValue() method, which returns the value of the field.
	 * 
	 * @method getValue
	 * @return {Object} The value of the field, which is an object with the properties outlined by the {@link #value} config.
	 */
	getValue : function() {
		var dataObj = {};
		
		if( !this.rendered ) {
			// If the value was set before the Component has been rendered (i.e. before the Field has been created), put its properties onto the return object (if any).
			Kevlar.apply( dataObj, typeof this.value === 'string' ? { text: this.value } : this.value );
			
		} else {
			var linkObj = this.linkPickerOverlay.getState();
			dataObj.url = linkObj.url;
			dataObj.pageid = linkObj.pageid;
			dataObj.target = linkObj.target;
			dataObj.text = this.$inputEl.val();
        }
		
		return dataObj;
	},
	
	
	/**
	 * Cleans up the LinkTextField field when it is destroyed.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		this.linkPickerOverlay.destroy();
		
		ui.formFields.LinkTextField.superclass.onDestroy.apply( this, arguments );
	}
	
} );


// Register the type so it can be created by the string 'Link' or 'LinkTextField' in the manifest
ui.ComponentManager.registerType( 'Link', ui.formFields.LinkTextField );
ui.ComponentManager.registerType( 'LinkTextField', ui.formFields.LinkTextField );

/**
 * @class ui.formFields.RadioField
 * @extends ui.formFields.AbstractField
 * 
 * Set of radio buttons (buttons where only one selection can be made at a time).
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.formFields.RadioField = Kevlar.extend( ui.formFields.AbstractField, {
		
	/**
	 * @cfg {Boolean} stacked True if the radio buttons should be stacked instead of spread out horizontally across the line. Defaults to false.
	 */
	stacked : false,
	
	/**
	 * @cfg {Array/Function} options (required) 
	 * The options for the RadioField, which creates the radio button based on this config. This config is required.<br><br>
	 * 
	 * If this is a flat array, the values will be used as both the value and text
	 * of the ButtonSet options.  Ex: <pre><code>[ "Yes", "No" ]</code></pre>
	 * 
	 * If you want to customize the value and text separately for each option (recommended), provide an array of objects, where the object has two
	 * properties: `text` and `value`. Ex: <pre><code>[ { "text": "Yes", "value": "yes" }, { "text": "No", "value": "no" } ]</code></pre>
	 * 
	 * If this config is specified as a function, the function will be executed, and its return will be used as the options. Its return should match one of
	 * the array forms defined above.
	 */
	
	/**
	 * @cfg {String} inputName
	 * The name to give the input. This will be set as the input's "name" attribute.  This is really only useful if
	 * the form that the component exists in is going to be submitted by a standard form submission (as opposed to just
	 * having its values retrieved, which are handled elsewhere). Defaults to the value of the 
	 * {@link ui.formFields.AbstractField#inputId} config.<br><br>
	 * 
	 * Note that because radio fields rely on their "name" attributes being the same, this should not be set to an
	 * empty string (or another non-unique string).  If an explicit name is not needed, let this config default to the
	 * {@link ui.formFields.AbstractField#inputId} config.
	 */
	
	
	/**
	 * @private
	 * @property radioTpl
	 * @type String
	 * The HTML template to use to create the radio elements.
	 */
	radioTpl : [
		'<input type="radio" id="<%= name %>-<%= num %>" name="<%= name %>" class="radio" value="<%= inputValue %>" <% if( checked ) { %>checked<% } %>>',
		'<label for="<%= name %>-<%= num %>" ><%= text %></label>'
	].join( "" ),
	
	
	// protected
	initComponent : function() {
		// Create the OptionsStore for managing the 'options'
		this.optionsStore = new ui.utils.OptionsStore( this.options );
		
		// Make sure that options were provided
		if( this.optionsStore.getOptions().length === 0 ) {
			throw new Error( "Error: The ButtonSet's 'options' was not configured." );
		}
		
		if( typeof this.value === 'undefined' ) {
			// No 'value' config provided, set the value to the value of the first option
			this.value = this.optionsStore.getOptions()[ 0 ].value;
			
		} else {
			// Value config was provided, make sure it is in the options store. If not, 
			// set it to the value of the first option. This guarantees that the RadioField's
			// value is always set to a valid option
			if( this.optionsStore.getByValue( this.value ) === null ) {
				this.value = this.optionsStore.getOptions()[ 0 ].value;
			}
		}
		
		
		// Call superclass initComponent
		ui.formFields.RadioField.superclass.initComponent.call( this );	
		
		
		// Make sure there is an inputName. This is needed for the radio functionality. It should have been created by AbstractField if it wasn't provided,
		// but this will make sure just in case.
		if( !this.inputName ) {
			throw new Error( "Error: RadioField must have a valid inputName. Make sure that the inputName and inputId configs have not been set to an empty string or other falsy value." );
		}
	},
	
	
	// protected
	onRender : function( container ) {
		// Call superclass onRender() first, to render this Component's element
		ui.formFields.RadioField.superclass.onRender.apply( this, arguments );
		
		var options = this.optionsStore.getOptions(),
		    radioTpl = this.radioTpl,
			inputName = this.inputName,
			$inputContainerEl = this.$inputContainerEl,
			stacked = this.stacked,
			fieldValue = this.value;

		var markup = "";
		for( var i = 0, len = options.length; i < len; i++ ) {
			var option = options[ i ];
			
			// Append the radio
			markup += 
				Kevlar.util.tmpl( radioTpl, {
					name: inputName,
					num: i,
					inputValue: option.value,
					text: option.text,
					checked: ( fieldValue === option.value )
				} ) + 
				( stacked ? '<br />' : '' );   // If the radio's are to be stacked, append a line break
		}
		
		// Append the markup
		$inputContainerEl.append( markup );
		
		// Assign event handler to the container element, taking advantage of event bubbling
		$inputContainerEl.bind( {
			change : function() { this.onChange( this.getValue() ); }.createDelegate( this )  // Call onChange() with the new value
		} );
	},
	
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s setValue() method, which sets the value to the field.
	 * 
	 * @method getValue
	 * @param {String} value The value of the field.
	 */
	setValue : function( value ) {
		// If there is an option with the provided value, set it. Otherwise, don't set anything.
		var option = this.optionsStore.getByValue( value );
		
		if( option !== null ) {
			if( !this.rendered ) {
				this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
				
			} else {
				this.$inputContainerEl.find( ':radio[value=' + value + ']' ).prop( 'checked', true );
			}
		}
	},
	
	
	/**
	 * Implementation of {@link ui.formFields.AbstractField AbstractField}'s getValue() method, which returns the value of the field.
	 * 
	 * @method getValue
	 * @return {String} The value of the field.
	 */
	getValue : function() {
		if( !this.rendered ) {
			return this.value;  // If the value was set before the Component has been rendered (i.e. before the Field has been created), return that.
		} else {
			return this.$inputContainerEl.find( ':radio:checked' ).val();
		}
	}
	
} );


// Register the type so it can be created by the string 'Radio' in the manifest
ui.ComponentManager.registerType( 'Radio', ui.formFields.RadioField );  

/**
 * @class ui.formFields.TextAreaField
 * @extends ui.formFields.TextField
 * 
 * Textarea field component.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.formFields.TextAreaField = Kevlar.extend( ui.formFields.TextField, {
	
	/**
	 * @cfg {Boolean} autoGrow
	 * True to auto-grow the text field as the user types into it. Defaults to false.<br><br>
	 * 
	 * Note that if autoGrow is true, the textarea will be given the "resize: none" style for Chrome and Safari, so that
	 * the resize handle is removed. The resize handle does not make sense for auto-grow textareas because the textarea size
	 * is recalculated and applied on every key press (so if they drag it bigger, and then keep typing, it
	 * will just be resized back to its calculated height.
	 */
	autoGrow : false,
	
	
	/**
	 * @protected
	 * @property $inputEl
	 * The &lt;input&gt; element; the textarea field.
	 * @type jQuery
	 */
	
	
	/**
	 * @private
	 * @property autoGrowMimicStyles
	 * @type String[]
	 * An array of the CSS properties that should be applied to the div that will mimic the textarea's text when {@link #autoGrow}
	 * is true.
	 */
	autoGrowMimicStyles : [ 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontSize', 'lineHeight', 'fontFamily', 'width', 'fontWeight' ],
	
	/**
	 * @private
	 * @property $autoGrowTwinDiv
	 * @type jQuery
	 * A div element that is created if the {@link #autoGrow} config is true, to be a "twin" of the textarea. The content of the textarea will be copied to
	 * this div so that it can be measured for its height, and then that height value can be applied to the textarea itself to "autogrow" it.
	 */
	
	/**
	 * @private
	 * @property autoGrowComputedStyles
	 * @type Object
	 * An object that holds the 
	 */
	
	/**
	 * @private 
	 * @property autoGrowPasteHandler
	 * @type Function
	 * A reference to the function created as the document paste handler, for when {@link #autoGrow} is true. This reference is maintained so that
	 * the document level handler can be removed when the field is destroyed.
	 */
	
	
	
	/**
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		ui.formFields.TextAreaField.superclass.onRender.apply( this, arguments );
		
		
		// Handle autogrowing textareas
		if( this.autoGrow ) {
			var mimicStyles = this.autoGrowMimicStyles,
			    $textarea   = this.$inputEl,
			    $twin       = jQuery( '<div />' ).css( { 'position': 'absolute', 'display': 'none', 'word-wrap': 'break-word' } ),
			    lineHeight  = parseInt( $textarea.css( 'line-height' ), 10 ) || parseInt( $textarea.css( 'font-size' ), 10 ),
			    minHeight   = parseInt( $textarea.css( 'height' ), 10 ) || lineHeight * 3,
			    maxHeight   = parseInt( $textarea.css( 'max-height' ), 10 ) || Number.MAX_VALUE;
			
			// Opera returns max-height of -1 if not set
			if( maxHeight < 0 ) {
				maxHeight = Number.MAX_VALUE;
			}
			
			// For Chrome and Safari, remove the browser-inserted "resize" handle. It doesn't make sense for auto-grow textareas
			// because the size is recalculated and applied on every key press (so if they drag it bigger, and then keep typing, it
			// will just be resized back to its calculated height.
			$textarea.css( 'resize', 'none' );
			
			// Store the lineHeight, minHeight, and maxHeight values
			this.autoGrowComputedStyles = {
				lineHeight : lineHeight,
				minHeight  : minHeight,
				maxHeight  : maxHeight
			};
			
			
			// Append the twin to the DOM
			// We are going to measure the height of this, not the textarea.
			$twin.appendTo( $textarea.parent() );
			
			// Copy the essential styles (mimics) from the textarea to the twin
			var i = mimicStyles.length;
			while( i-- ) {
				$twin.css( mimicStyles[ i ], $textarea.css( mimicStyles[ i ] ) );
			}
			
			
			// Hide scrollbars, but make sure that the height of the $textarea doesn't shrink when setting to overflow: hidden
			$textarea.css( 'minHeight', minHeight );
			$textarea.css( 'overflow', 'hidden' );
			
			
			
			// Update textarea size on cut and paste
			$textarea.bind( 'cut paste', function() {
				this.updateAutoGrowHeight(); 
			}.createDelegate( this ) );
			
			
			// Catch the browser paste event.
			// Save a reference to this handler, so we can remove it when the field is destroyed.
			this.autoGrowPasteHandler = function() {   
				this.updateAutoGrowHeight.defer( 250, this );
			}.createDelegate( this );
			$textarea.live( 'input', this.autoGrowPasteHandler );  // live events seem to need to 
			$textarea.live( 'paste', this.autoGrowPasteHandler );  // be separate... (i.e. not space delimited)
			
			// Save a reference to the twin element
			this.$autoGrowTwinDiv = $twin;
			
			// Run the sizing routine now that we're all set up
			this.updateAutoGrowHeight();
		}
	},
	
	
	/**
	 * Overridden method for creating the input element for the TextAreaField. This implementation
	 * creates a &lt;textarea&gt; element. See {@link ui.formFields.TextField#createInputEl} for more information.
	 * 
	 * @protected
	 * @method createInputEl
	 * @return {jQuery}
	 */
	createInputEl : function() {
		return jQuery( '<textarea id="' + this.inputId + '" name="' + this.inputName + '">' + ( this.value || "" ) + '</textarea>' );  
	},
	
	
	// ----------------------------------------
	
	
	// AutoGrow Methods
	
	
	/**
	 * Utility method for the {@link #autoGrow} functionality. Sets a given `height` and `overflow` state on the textarea.
	 * 
	 * @private
	 * @method setHeightAndOverflow
	 * @param {Number} height
	 * @param {String} overflow
	 */ 
	setHeightAndOverflow : function( height, overflow ) {
		var $textarea = this.$inputEl,
		    curatedHeight = Math.floor( parseInt( height, 10 ) );
		    
		if( $textarea.height() != curatedHeight ) {
			$textarea.css( { 'height': curatedHeight + 'px', 'overflow': overflow } );
		}
	},
	
	
	
	/**
	 * Utility method for the {@link #autoGrow} functionality. Update the height of the textarea, if necessary.
	 * 
	 * @private
	 * @method updateAutoGrowHeight
	 */
	updateAutoGrowHeight : function() {
		if( this.rendered ) {
			var $textarea = this.$inputEl,
			    $twin = this.$autoGrowTwinDiv,
			    computedStyles = this.autoGrowComputedStyles;
			
			// Get curated content from the textarea.
			var textareaContent = $textarea.val().replace( /&/g,'&amp;' ).replace( / {2}/g, '&nbsp;' ).replace( /<|>/g, '&gt;' ).replace( /\n/g, '<br />' );
			
			// Compare curated content with curated twin.
			var twinContent = $twin.html().replace( /<br>/ig, '<br />' );
			
			if( textareaContent + '&nbsp;' != twinContent ) {
				// Add an extra white space so new rows are added when you are at the end of a row.
				$twin.html( textareaContent + '&nbsp;' );
				
				// Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
				if( Math.abs( $twin.height() + computedStyles.lineHeight - $textarea.height() ) > 3 ) {
					var goalHeight = $twin.height() + computedStyles.lineHeight;
					
					if( goalHeight >= computedStyles.maxHeight ) {
						this.setHeightAndOverflow( computedStyles.maxHeight, 'auto' );
						
					} else if( goalHeight <= computedStyles.minHeight ) {
						this.setHeightAndOverflow( computedStyles.minHeight, 'hidden' );
						
					} else {
						this.setHeightAndOverflow( goalHeight, 'hidden' );
					}
				}
			}
		}
	},
	
	
	// protected
	setValue : function() {
		ui.formFields.TextAreaField.superclass.setValue.apply( this, arguments );
		
		// After the value is set, update the "auto grow" height
		if( this.autoGrow ) {
			this.updateAutoGrowHeight();
		}
	},
	
	
	// protected
	onChange : function() {
		ui.formFields.TextAreaField.superclass.onChange.apply( this, arguments );
		
		if( this.autoGrow ) {
			this.updateAutoGrowHeight();
		}
	},
	
	
	// protected
	onKeyUp : function( evt ) {
		ui.formFields.TextAreaField.superclass.onKeyUp.apply( this, arguments );
		
		if( this.autoGrow ) {
			this.updateAutoGrowHeight();
		}
	},
	
	
	// protected
	onBlur : function() {
		ui.formFields.TextAreaField.superclass.onBlur.apply( this, arguments );
		
		// Compact textarea on blur (if the autoGrow config is true)
		if( this.autoGrow ) {
			var $textarea = this.$inputEl,
			    $twin = this.$autoGrowTwinDiv,
			    computedStyles = this.autoGrowComputedStyles;
			
			if( $twin.height() < computedStyles.maxHeight ) {
				if( $twin.height() > computedStyles.minHeight ) {
					$textarea.height( $twin.height() );
				} else {
					$textarea.height( computedStyles.minHeight );
				}
			}
		}
	},
	
	
	// protected
	onDestroy : function() {
		if( this.autoGrow && this.rendered ) {
			var $textarea = this.$inputEl;
			
			// kill the autoGrowPasteHandler live events
			$textarea.die( 'input', this.autoGrowPasteHandler );  // The call to 'die' for live events seem to need to 
			$textarea.die( 'paste', this.autoGrowPasteHandler );  // be separate... (i.e. not space delimited)
			
			// Remove the sizing div
			this.$autoGrowTwinDiv.remove();
		}
		
		ui.formFields.TextAreaField.superclass.onDestroy.apply( this, arguments );
	}
	
} );


// Register the type so it can be created by the string 'String' in the manifest
ui.ComponentManager.registerType( 'TextArea', ui.formFields.TextAreaField );

/**
 * @class ui.formFields.TextField.AbstractBehavior
 * @extends Object
 * 
 * Defines the interface for the strategy TextField behavior pattern implementation in {@link ui.formFields.TextField}.
 *
 * @constructor
 */
/*global Kevlar, ui */
ui.formFields.TextField.AbstractBehavior = Kevlar.extend( Object, {
		
	/**
	 * Called when the TextField is rendered.
	 * 
	 * @abstract
	 * @method onRender
	 * @param {ui.formFields.TextField} textField
	 */
	onRender : Kevlar.emptyFn,
	
		
	/**
	 * Called when the TextField's setValue() method is called (if the TextField is rendered)
	 * 
	 * @abstract
	 * @method onSetValue
	 * @param {ui.formFields.TextField} textField
	 * @param {String} value
	 */
	onSetValue : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField has been changed.
	 * 
	 * @abstract
	 * @method onChange
	 * @param {ui.formFields.TextField} textField
	 */
	onChange : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField has been focused.
	 * 
	 * @abstract
	 * @method onFocus
	 * @param {ui.formFields.TextField} textField
	 */
	onFocus : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField has been blurred.
	 * 
	 * @abstract
	 * @method onBlur
	 * @param {ui.formFields.TextField} textField
	 */
	onBlur : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField gets a keydown event.
	 * 
	 * @abstract
	 * @method onKeyDown
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyDown : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField gets a keyup event.
	 * 
	 * @abstract
	 * @method onKeyUp
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyUp : Kevlar.emptyFn,
	
	
	/**
	 * Called when the TextField gets a keypress event.
	 * 
	 * @abstract
	 * @method onKeyPress
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyPress : Kevlar.emptyFn
	
} );

/**
 * @class ui.formFields.TextField.EmptyTextBehavior
 * @extends ui.formFields.TextField.AbstractBehavior
 * 
 * Handles a {ui.formFields.TextField TextField} when it is in the "default" state (i.e. it is displaying a default value
 * when empty).  This is opposed to when it is using the {@link ui.formFields.TextField.InfieldLabelBehavior InfieldLabelBehavior}, 
 * which is incompatible with the field having emptyText.
 *
 * @constructor
 */
/*global Kevlar, ui */
ui.formFields.TextField.EmptyTextBehavior = Kevlar.extend( ui.formFields.TextField.AbstractBehavior, {
	
	/**
	 * @private
	 * @property emptyTextCls
	 * The CSS class that should be applied when showing the {@link ui.formFields.TextField#emptyText emptyText}.
	 * @type String
	 */
	emptyTextCls : 'ui-hint-text',
	
	
	/**
	 * Called when the TextField's setValue() method is called (if the TextField is rendered), which handles
	 * the {@link ui.formFields.TextField#emptyText emptyText}.
	 * 
	 * @method onSetValue
	 * @param {ui.formFields.TextField} textField
	 * @param {String} value
	 */
	onSetValue : function( textField, value ) {
		// If the value being set is the emptyText, add the ui-hint-text class.  Not sure if this should definitely be like this, but it should work 
		// for most cases (i.e. every case except when the user sets actual data that is the emptyText). Otherwise, make sure that the ui-hint-text class 
		// is removed on set.
		if( value === textField.getEmptyText() ) {
			textField.getInputEl().addClass( this.emptyTextCls );
		} else {
			textField.getInputEl().removeClass( this.emptyTextCls );
		}
	},
	
	
	/**
	 * Called when the TextField has been focused, which removes the {@link ui.formFields.TextField#emptyText emptyText} in the TextField
	 * if that is what is currently set.
	 * 
	 * @method onFocus
	 * @param {ui.formFields.TextField} textField
	 */
	onFocus : function( textField ) {		
		// make sure the "empty text" css class is removed
		textField.getInputEl().removeClass( this.emptyTextCls );
		
		// If the current value is the emptyText value, clear the field.
		if( textField.getValue() === textField.getEmptyText() ) {
			textField.setValue( "" );
		}
	},
	
	
	/**
	 * Called when the TextField has been blurred, to set the {@link ui.formFields.TextField#emptyText emptyText} 
	 * back into the field if the field has been left empty. This action is only performed however if the 
	 * {@link ui.formFields.TextField#restoreEmptyText restoreEmptyText} config is true on the 
	 * {@link ui.formFields.TextField TextField}.
	 * 
	 * @method onBlur
	 * @param {ui.formFields.TextField} textField
	 */
	onBlur : function( textField ) {
		// If the field is empty when blurred, and its restoreEmptyText config is true, then put in the 
		// emptyText back in (which will add the appropriate css class).
		if( textField.restoreEmptyText && textField.getValue() === "" ) {
			textField.setValue( textField.getEmptyText() || "" );
		}
	}
	
} );

/**
 * @class ui.formFields.TextField.InfieldLabelBehavior
 * @extends ui.formFields.TextField.AbstractBehavior
 * 
 * Handles a {@link ui.formFields.TextField TextField} when it is in the "infield label" state (i.e. it is displaying a label that
 * is shown inside the field itself).  This is opposed to when it is using the {@link ui.formFields.TextField.EmptyTextBehavior EmptyTextBehavior}, 
 * which is incompatible with the field having an "infield" label.<br><br>
 * 
 * This implementation is based off of the jquery.infield labels plugin. http://fuelyourcoding.com/scripts/infield/
 *
 * @constructor
 */
/*global Kevlar, ui */
ui.formFields.TextField.InfieldLabelBehavior = Kevlar.extend( ui.formFields.TextField.AbstractBehavior, {
	
	/**
	 * @cfg {Number} fadeOpacity
	 * Once the field has focus, how transparent should the label be.
	 * Should be a number between 0 and 1. Defaults to 0.5.
	 */
	fadeOpacity : 0.5, 
	
	/**
	 * @cfg {Number} fadeDuration
	 * The duration (in milliseconds) to fade the label element. Defaults to 300.
	 */
	fadeDuration : 300,
	
	
	/**
	 * Flag to store whether the label is currently shown or not.
	 *
	 * @private 
	 * @property labelShown
	 * @type Boolean
	 */
	labelShown : true,
	
	
	/**
	 * Called when the TextField is rendered.
	 * 
	 * @method onRender
	 * @param {ui.formFields.TextField} textField
	 */
	onRender : function( textField ) {
		// "infield" labels move the label element into the input container. It is absolutely positioned from there.
		textField.getInputContainerEl().append( textField.getLabelEl() );
		textField.getInputEl().attr( 'autocomplete', 'false' );  // set autocomplete="false" on the field to fix issues with browser autocomplete and "infield" labels
		
		this.checkForEmpty( textField );
	},
	
	
	/**
	 * Called when the TextField's setValue() method is called (if the TextField is rendered)
	 * 
	 * @method onSetValue
	 * @param {ui.formFields.TextField} textField
	 * @param {String} value
	 */
	onSetValue : function( textField, value ) {
		if( textField.rendered ) {
			this.checkForEmpty( textField );
		}
	},
	
	
	/**
	 * Called when the TextField has been changed.
	 * 
	 * @abstract
	 * @method onChange
	 * @param {ui.formFields.TextField} textField
	 */
	onChange : function( textField ) {
		if( textField.rendered ) {
			this.checkForEmpty( textField );
		}
	},
	
	
	/**
	 * Called when the TextField has been focused.
	 * 
	 * @method onFocus
	 * @param {ui.formFields.TextField} textField
	 */
	onFocus : function( textField ) {
		// If the label is currently shown, fade it to the fadeOpacity config
		if( textField.rendered && this.labelShown ) {
			this.setLabelOpacity( textField.getLabelEl(), this.fadeOpacity ); 
		}
	},
	
	
	/**
	 * Called when the TextField has been blurred.
	 * 
	 * @method onBlur
	 * @param {ui.formFields.TextField} textField
	 */
	onBlur : function( textField ) {
		if( textField.rendered ) {
			this.checkForEmpty( textField );
		}
	},
	
	
	/**
	 * Called when the TextField gets a keydown event.
	 * 
	 * @method onKeyDown
	 * @param {ui.formFields.TextField} textField
	 * @param {jQuery.Event} evt The jQuery event object for the event.
	 */
	onKeyDown : function( textField, evt ) {
		if( textField.rendered ) {
			// Skip Shift and Tab keydowns
			if( evt.keyCode === 16 || evt.keyCode === 9 ) {
				return;
			}
			
			if( this.labelShown ) {
				textField.getLabelEl().hide();
				this.labelShown = false;
			}
		}
	},
	
	
	// ------------------------------
	
	
	/**
	 * Animates the label element's opacity of the TextField to the provided `opacity`.
	 * 
	 * @private
	 * @method setLabelOpacity
	 * @param {jQuery} $labelEl The label element.
	 * @param {Number} opacity
	 */
	setLabelOpacity : function( $labelEl, opacity ) {
		$labelEl.stop().animate( { opacity: opacity }, this.fadeDuration );
		this.labelShown = ( opacity > 0.0 );
	},
	
	
	/**
	 * @private
	 * @method prepLabelForShow
	 * @param {jQuery} $labelEl The label element.
	 */
	prepLabelForShow : function( $labelEl ) {
		if( !this.labelShown ) {
			$labelEl.css( { opacity: 0.0 } ).show();
		}
	},
	
	
	/**
	 * Checks the TextField to see if it's empty, and if so shows the infield label.
	 * If it's not empty, 
	 * 
	 * @private
	 * @method checkForEmpty
	 * @param {ui.formFields.TextField} textField
	 */
	checkForEmpty : function( textField ) {
		var $labelEl = textField.getLabelEl();
		
		if( textField.getValue() === "" ) {
			this.prepLabelForShow( $labelEl );
			this.setLabelOpacity( $labelEl, 1.0 );
		} else {
			this.setLabelOpacity( $labelEl, 0.0 );
		}
	}

} );

/**
 * @class ui.Label
 * @extends ui.Component
 * 
 * Creates a label (piece of text) in a UI hierarchy. This class is used for the legacy type "Introduction" as well.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.Label = Kevlar.extend( ui.Component, {

	/**
	 * @cfg {String/HTMLElement/jQuery} text
	 * The label's text. Accepts HTML, DOM nodes, and jQuery wrapper objects as well.
	 */
	text : "",
	

	// protected
	initComponent : function() {
		this.cls += ' ui-label';
		
		ui.Label.superclass.initComponent.call( this );
		
		// Backward compatibility: accept 'help' config as the label's text
		if( this.help ) {
			this.text = this.help;
		}
		// Backward compatibility: accept 'label' config as the label's text
		if( this.label ) {
			this.text = this.label;
		}
	},


	// protected
	onRender : function() {
		ui.Label.superclass.onRender.apply( this, arguments );
		
		this.$el.append( this.text || "" );
	},
	
	
	/**
	 * Sets the label's text.  Accepts HTML, DOM nodes, and jQuery wrapper objects as well.
	 * 
	 * @method setText
	 * @param {String/HTMLElement/jQuery} text The text, HTML, or DOM element to set to the label. 
	 */
	setText : function( text ) {
		if( !this.rendered ) {
			this.text = text;  // set the config. will be used when rendered
		} else {
			this.$el.empty().append( text );
		}
	},
	
	
	/**
	 * Gets the label's text.  Will return the HTML of the label if it has any.
	 * 
	 * @method getText
	 * @return {String}
	 */
	getText : function() {
		if( !this.rendered ) {
			return this.text || "";  // return the current value of the config
		} else {
			return this.$el.html();
		}
	}

} );


// Register the type so it can be created by the string 'Label' in the manifest
// For backward compatibility, register the 'Introduction' type as well.
ui.ComponentManager.registerType( 'Label', ui.Label );  
ui.ComponentManager.registerType( 'Introduction', ui.Label );  

/**
 * @class ui.layouts.AccordionLayout
 * @extends ui.layouts.AbstractLayout
 * 
 * A layout that renders a {@link ui.Container Container's} child components in an accordion, where only
 * one child component will be shown at a time.  Methods are available in this class to control which component
 * is shown.<br><br>
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'accordion'.
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.layouts.AccordionLayout = Kevlar.extend( ui.layouts.AbstractLayout, {
	
	/**
	 * @cfg {Number/ui.Component} activeItem
	 * The item number or {@link ui.Component} reference to set as the initially active item. Defaults to 0 (for the first item). 
	 * If this is a {@link ui.Component}, it should be a {@link ui.Component Component} that exists in the {@link ui.Container Container}.
	 */
	activeItem : 0,
	
	/**
	 * @cfg {Object} icons
	 * An object that defines the css classes for the "collapsed" icon states when an accordion panel is expanded or contracted. 
	 * Should have properties "header" and "headerSelected". Ex:
	 * <pre><code>{ 'header': 'ui-icon-triangle-1-e', 'headerSelected': 'ui-icon-triangle-1-s' }</code></pre><br><br>
	 * 
	 * Defaults to false, for no icons.
	 */
	icons : false,
	
	/**
	 * @cfg {String} iconPosition
	 * The position on the accordion panels' title bar that the icon should be placed. Can be set to either 'left'
	 * or 'right'. Defaults to 'left'.
	 */
	iconPosition : 'left',
	
	
	// protected
	initLayout : function() {
		this.addEvents(
			/**
			 * @event itemchange
			 * Fires when the active item has been changed. 
			 * @param {ui.Component} item The {@link ui.Component} instance of the item that was activated (shown).
			 */
			'itemchange'
		);
		
		ui.layouts.AccordionLayout.superclass.initLayout.call( this );
	},
	
	
	/**
	 * Layout implementation for AccordionLayout, used to create a jQuery UI accordion instance (with its required markup), 
	 * and render the Container's child components into it.  The child components should have a special property
	 * called `title`, which is used as the items' title in the accordion. The item given by the {@link #activeItem} 
	 * config is shown.
	 * 
	 * @protected
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	onLayout : function( childComponents, $targetEl ) {
		ui.layouts.AccordionLayout.superclass.onLayout.apply( this, arguments );
		
		
		// Make sure the content target element is empty, to clear out any elements that may be in there 
		// (such as from previous layouts, or any direct HTML injected in there).
		$targetEl.empty().addClass( 'ui-accordion ui-widget' );  // adding the css classes immediately (before jQuery UI processes these elements) to prevent a flash of unstyled content, and also so that things in child components are sized appropriately from the beginning when they are rendered
		
		// Note: Concatenating the markup and appending it all at once for performance. This method is faster than appending each
		// one at a time, even with the extra step it takes to jQuery the divs afterward. Appending each one at a time
		// is ~65% slower. 
		var accordionMarkup = "",
		    numChildComponents = childComponents.length,
		    i;
		    
		for( i = 0; i < numChildComponents; i++ ) {
			var title = childComponents[ i ].title || "(No title property set on child item)";
			
			// Create an h3 element for the accordion panel label. This element will get the 
			// 'ui-accordion-header' css class when the accordion itself is created.
			// Adding some css classes early (before jQuery UI processes these elements) to prevent a flash of unstyled content, and also so that things in child components are sized appropriately from the beginning when they are rendered
			accordionMarkup += '<h3 class="ui-accordion-header ui-helper-reset ui-state-default ui-corner-top"><a href="#">' + title + '</a></h3>';
			
			// Create a div element for the child item's content. 
			// Adding some css classes early (before jQuery UI processes these elements) to prevent a flash of unstyled content, and also so that things 
			// in child components are sized appropriately from the beginning when they are rendered.
			// The element itself needs display: block; for the initial rendering process, so that child components can be rendered into it. 
			// The 'ui-accordion-content' css class sets "display: none;", so that would prevent the rendering of the child component (as the
			// component's parent is hidden).  This display: block; will be removed after the component is rendered. 
			accordionMarkup += '<div class="ui-accordion-content ui-widget-content ui-helper-reset ui-corner-bottom ui-accordion-content-active" style="display: block;" />';
		}
		$targetEl.append( accordionMarkup );
		
		// Now query for the divs that have just been added, and render the child components into them
		var $divs = $targetEl.find( 'div' );
		for( i = 0; i < numChildComponents; i++ ) {
			// Render the child component into the div
			childComponents[ i ].render( $divs[ i ] );
			
			// Now remove the explicitly set display: block; css property. See above note where the div is created for details.
			jQuery( $divs[ i ] ).css( 'display', '' ); 
		}
		
		
		// Create the jQuery UI Accordion when all elements have been added
		$targetEl.accordion( {
			active: this.activeItem,
			
			fillSpace  : true,    // The accordion will fit to the height of its container
			autoHeight : false,   // Must set to false, as it is incompatible with the fillSpace config. Setting this explicitly as a reminder.
			
			icons: this.icons,
			
			// event handlers
			change : this.onActiveItemChange.createDelegate( this )
		} );
		
		
		// If 'icons' were specified, add the appropriate 'iconPosition' css class
		if( this.icons ) {
			if( this.iconPosition === 'right' ) {
				$targetEl.addClass( 'ui-accordion-iconsRight' );
			} else {
				$targetEl.addClass( 'ui-accordion-iconsLeft' );
			} 
		}
	},
	
	
	
	
	/**
	 * Sets the active item.
	 * 
	 * @method setActiveItem
	 * @param {ui.Component/Number} item The ui.Component to set as the active item, or the item number to set as the active item (0 for the first item).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 */
	setActiveItem : function( item ) {
		// Item was provided as a ui.Component, find its index
		if( item instanceof ui.Component ) {
			item = this.container.getItemIndex( item );
		}
		
		// At this point, the item must be a number to be set as the active item
		item = parseInt( item, 10 );   // parseInt just in case it's a number inside a string
		if( !isNaN( item ) && item !== -1 ) {
			if( !this.container.rendered ) {
				this.activeItem = item;	// Not rendered yet, set for when it is rendered
			} else {
				this.container.getContentTarget().accordion( "activate", item );
			}
		}
	},
	
	
	/**
	 * Gets the active item.
	 * 
	 * @method getActiveItem
	 * @return {ui.Component} The Component that is currently shown as the active item.
	 */
	getActiveItem : function() {
		if( !this.container.rendered ) {
			return this.container.getItemAt( this.activeItem );
		} else {
			return this.container.getItemAt( this.container.getContentTarget().accordion( "option", "active" ) );
		}
	},
	
	
	/**
	 * Gets the active item index (i.e. the 0-based item number that is currently selected).
	 * 
	 * @method getActiveItem
	 * @return {Number} The index of the item that is currently shown as the active item.
	 */
	getActiveItemIndex : function() {
		if( !this.container.rendered ) {
			return this.activeItem;
		} else {
			return this.container.getContentTarget().accordion( "option", "active" );
		}
	},
	
	
	// --------------------------
	
	
	onActiveItemChange : function() {
		var activeItem = this.getActiveItem();
		
		// Run the newly active item's onShow method, to tell it that is has just been shown 
		// (mostly for ui.Container's, to make sure they run their layout if a layout has been deferred).
		activeItem.onShow();
		
		// when an item is shown, fire the itemchange event.
		this.fireEvent( 'itemchange', activeItem );
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'accordion', ui.layouts.AccordionLayout );

/**
 * @class ui.layouts.CardsLayout.AbstractTransition
 * @extends Object
 * 
 * Defines the interface for all {@link ui.layouts.CardsLayout} strategies for changing the active card.
 */
/*global Kevlar, ui */
ui.layouts.CardsLayout.AbstractTransition = Kevlar.extend( Object, {
	
	/**
	 * @abstract
	 * @method setActiveItem
	 * @param {ui.layouts.CardsLayout} cardsLayout The CardsLayout instance that is using this transition strategy.
	 * @param {ui.Component} currentItem The currently active item. This may be null if the CardsContainer does not currently have an active item.
	 * @param {ui.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
	 * @param {Object} options An object which may contain options for the given AbstractTransition subclass that is being used.
	 */
	setActiveItem : function( cardsLayout, currentItem, newItem, options ) {
		// Abstract Method
	},
	
	
	/**
	 * Destroys the CardsLayout transition strategy. Subclasses should extend the onDestroy method to implement 
	 * any destruction process they specifically need.
	 * 
	 * @method destroy
	 */
	destroy : function() {
		this.onDestroy();
	},
	
	
	/**
	 * Template method that subclasses should extend to implement their own destruction process.
	 * 
	 * @protected
	 * @abstract
	 * @method onDestroy
	 */
	onDestroy : function() {
		// Template method
	}
	
} );

/**
 * @class ui.layouts.CardsLayout.SlideTransition
 * @extends ui.layouts.CardsLayout.AbstractTransition
 * 
 * {@link ui.layouts.CardsLayout} transition strategy for switching cards by sliding the currently active item out, while sliding the newly active item in.
 */
/*global window, jQuery, Kevlar, ui */
ui.layouts.CardsLayout.SlideTransition = Kevlar.extend( ui.layouts.CardsLayout.AbstractTransition, {
	
	/**
	 * @private
	 * @property animRunning
	 * @type Boolean
	 * Flag to store if the animation is currently running.
	 */
	animRunning : false,
	
	
	/**
	 * @private
	 * @property $viewportEl
	 * @type jQuery
	 * The element created to manage the size of the "viewport" for the cards. This element always starts at the currentItem's size,
	 * and is animated to the newItem's size, while the items are slid in.  This element is lazily created by {@link #setActiveItem}.
	 */
	
	/**
	 * @private
	 * @property $slideEl
	 * @type jQuery
	 * The element created to slide the currentItem out, while sliding the newItem in. This element is attached to the
	 * {@link #$viewportEl}, and is lazily created by {@link #setActiveItem}.  Both the currentItem and newItem get attached
	 * to this element, side by side, and then just the 
	 */
	
	
	/**
	 * @method setActiveItem
	 * @param {ui.layouts.CardsLayout} cardsLayout The CardsLayout instance that is using this transition strategy.
	 * @param {ui.Component} currentItem The currently active item. This may be null if the CardsContainer does not currently have an active item.
	 * @param {ui.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
	 * @param {Object} options An object which may contain the following properties:
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li>
	 *       <b>direction</b> : String
	 *       <div class="sub-desc">The direction to slide the new item in from. Can be either 'right' or 'left'. Defaults to 'right'.</div>
	 *     </li>
	 *     <li>
	 *       <b>duration</b> : Int
	 *       <div class="sub-desc">The time to take, in milliseconds, to slide the new item into view. Defaults to 600.</div>
	 *     </li>
	 *     <li>
	 *       <b>onStep</b> : Function
	 *       <div class="sub-desc">
	 *         A function to run after each step of the animation. This function is called with one argument: the fx
	 *         object that jQuery provides to the 'step' callback function on its animate() method.  
	 *         See http://api.jquery.com/animate/#step for more information.  Some properties of interest however are:<div class="mdetail-params">
	 *           <ul>
	 *             <li>elem</li> : HTMLElement<div class="sub-desc">The HTML element being animated.</div>
	 *             <li>prop</li> : String<div class="sub-desc">The name of the css property on the HTML element (`elem`) that is currently being modified.</div>
	 *             <li>start</li> : String<div class="sub-desc">The starting value of the css property (`prop`) being modified. It's original value.</div>
	 *             <li>end</li> : String<div class="sub-desc">The final value of the css property (`prop`) being modified. The value that will be reached at the end of the animation.</div>
	 *             <li>now</li> : String<div class="sub-desc">The current value of the css property (`prop`) being modified, at the current point in the animation.</div>
	 *             <li>pos</li> : String<div class="sub-desc">The decimal percentage of how far along the animation is complete. Will be a number between 0 and 1.</div>
	 *           <ul>
	 *         </div>
	 *       </div>
	 *     </li>
	 *     <li>
	 *       <b>onComplete</b> : Function
	 *       <div class="sub-desc">
	 *         A function to run when the animation has completed. This function is guaranteed to run, even if the animation is stopped
	 *         early by another request to set the active item.
	 *       </div>
	 *     </li>
	 *     <li>
	 *       <b>scope</b> : Object
	 *       <div class="sub-desc">The scope to run the onStep and onComplete callbacks in. Defaults to window.</div>
	 *     </li>
	 *   </ul>
	 * </div>
	 */
	setActiveItem : function( cardsLayout, currentItem, newItem, options ) {
		ui.layouts.CardsLayout.SlideTransition.superclass.setActiveItem.apply( this, arguments );
		
		
		if( this.animRunning ) {
			// If the animation is currently running, and this method is called again, skip the previous animation to the end
			// in preparation for another animation. Can possibly implement some sort of transition in the future, but that
			// will be fairly complex.
			this.endAnimation();
		}
		
		// Handle conditions that cannot (or at least should not) be animated
		if( !currentItem && newItem ) {
			// No current item, just show the new item. No transition. This is for the initial card setting.
			newItem.show();
			return;
			
		} else if( currentItem && !newItem ) {
			// No new item, just hide the current item. No transition.
			currentItem.hide();
			return;
			
		} else if( !currentItem && !newItem ) {
			// neither a currentItem nor a newItem, can't do anything. Just return out.
			return;
		}
		
		
		// ---------------------------------------
		
		options = options || {};
		options.direction = options.direction || 'right';
		options.duration = ( typeof options.duration !== 'undefined' ) ? options.duration : 600; // default to 600, but allow 0
		
		// Lazily create the elements needed to implement the transition the first time the transition is run
		if( !this.$viewportEl ) {
			this.$viewportEl = jQuery( '<div style="margin: 0; padding: 0; border: 0; white-space: nowrap;" />' );
			this.$slideEl = jQuery( '<div style="margin: 0; padding: 0; border: 0; white-space: nowrap;" />' ).appendTo( this.$viewportEl );
		}
		
		
		// Get quick references to the elements
		var $viewportEl = this.$viewportEl;
		var $slideEl = this.$slideEl;
		
		
		var container = cardsLayout.getContainer(),
		    $containerEl = container.getEl();
		    
		// Vars to use for the initial, and target size of the element after it is finished animating
		var initialSize = {
			height      : 0,
			width       : 0,
			outerHeight : 0,
			outerWidth  : 0
		};
		var targetSize = {
			height      : 0,
			width       : 0,
			outerHeight : 0,
			outerWidth  : 0
		};
		
		
		// First, get the size of the currentItem. This will be used for the initial size of the viewport div.
		var $currentItemEl = currentItem.getEl();
		initialSize.height = $currentItemEl.height();
		initialSize.width = $currentItemEl.width();
		initialSize.outerHeight = $currentItemEl.outerHeight( /* include margin */ true );
		initialSize.outerWidth = $currentItemEl.outerWidth( /* include margin */ true );
		
		
		// Now get the size of the newItem. This will be used for the target size of the viewport div.
		var $newItemEl = newItem.getEl(),
		    originalPositionStyle = $newItemEl[ 0 ].style.position;  // save the original position style. We're going to apply position: absolute; for measuring 
		   
		// NOTE: The $newItemEl should still be hidden at this point (display: none), because it is not the active item
		// in the CardsLayout. Using the display:none/position:absolute technique to measure the item while it's hidden,
		// so as not to get a flicker from showing it.
		$newItemEl.css( 'position', 'absolute' );  // set its position to absolute so we can measure its actual size while 1) it's hidden, and 2) without any bounds put on it by its current parent element's size
		
		// Get the dimensions of the newItem
		targetSize.height = $newItemEl.height();
		targetSize.width = $newItemEl.width();
		targetSize.outerHeight = $newItemEl.outerHeight( /* include margin */ true );
		targetSize.outerWidth = $newItemEl.outerWidth( /* include margin */ true );
		
		// Restore the $newItemEl's original 'position' style (the 'position' style before we set it to position: absolute;) 
		$newItemEl.css( 'position', originalPositionStyle );
		
		// For debugging:
		//console.log( 'using slide transition. container: ', container, '  currentItem: ', currentItem, '  newItem: ', newItem );
		//console.log( 'initialSize: ', initialSize, '   targetSize: ', targetSize );
		
		
		// --------------------------------------------
		
		
		// Add the viewport element to the container's element itself, and set its size to the size of the currentItem.
		// This element will animate from the size of the currentItem to the size of the newItem.
		$viewportEl
			.css( {
				height   : initialSize.outerHeight + "px",
				width    : initialSize.outerWidth + "px",
				overflow : 'visible'
			} )
			.appendTo( $containerEl );
		
		
		
		// Set the slide element's original left margin, based on the direction the sliding will be taking place.
		$slideEl.css( {
			'margin-left' : ( options.direction === 'left' ) ? -targetSize.outerWidth : 0
		} );
		
		
		
		// Add the currently active item into the slide div, show it, and set its styles
		$slideEl.append( $currentItemEl );
		
		// Create an object to store the currentItem's original styles, so that we can re-apply them after the animation.
		var currentItemElStyle = $currentItemEl[ 0 ].style;
		var currentItemElOriginalStyles = {
			display : currentItemElStyle.display,
			width : currentItemElStyle.width,
			height : currentItemElStyle.height,
			verticalAlign : currentItemElStyle.verticalAlign,
			overflow : currentItemElStyle.overflow
		};
		$currentItemEl.css( 'display', 'inline-block' );   // make sure its set to inline-block first, before its other styles. Otherwise, the width and height could be set while it is still 'display: block'
		$currentItemEl.css( {
			'width' : initialSize.width + "px",    // force the element to stay at its
			'height' : initialSize.height + "px",  // current size
			'vertical-align' : 'top',
			'overflow' : 'visible'
		} );
		
		
		
		// Add the newly active item to the slide div. The slide div is the element that will be animated from left
		// to right, or right to left, to show the actual "slide" animation (as opposed to the viewport div, which handles the sizing).
		if( options.direction === 'left' ) {
			$slideEl.prepend( $newItemEl );
		} else {
			$slideEl.append( $newItemEl );
		}
		
		
		// Show the item in the $slideEl. This is to give the element its original 'display' style back, so we can save it to be re-applied later.
		// TODO: Possibly read the olddisplay property directly from the jQuery object that is stored on the element as data.  jQuery puts this object on
		// the element under a key starting with 'jQuery', but that ends up looking something like this: jQuery1604248712578. I guess they don't want
		// people accessing the object, as perhaps its properties are subject to change between versions? Still, might be the most efficient way to get
		// the old display property, without actually showing the newItem until its display: inline-block; property is set.  Could possibly access
		// this object with:
		// var data = $newItemEl.data(), olddisplay;
		// for( var prop in data ) {
		//     if( prop.indexOf( 'jQuery' ) === 0 ) {
		//         olddisplay = data[ prop ].olddisplay;
		//         break;
		//     }
		// }
		// If this is added, we should add a unit test for "Assumptions" under the "Global" tests, that makes sure that jQuery still stores the 'olddisplay'
		// property like this as we upgrade jQuery versions, to know immediately if the read of this property ever stops working.
		newItem.show();

		// Create an object to store the newItem's original styles, so that we can re-apply them after the animation.
		var newItemElStyle = $newItemEl[ 0 ].style;
		var newItemElOriginalStyles = {
			display : newItemElStyle.display,   // this is available now because we have shown the newItem (above)
			width : newItemElStyle.width,
			height : newItemElStyle.height,
			verticalAlign : newItemElStyle.verticalAlign,
			overflow : newItemElStyle.overflow
		};
		$newItemEl.css( 'display', 'inline-block' );       // make sure its set to inline-block first, before its other styles. Otherwise, the width and height could be set while it is still 'display: block'
		$newItemEl.css( {
			'width' : targetSize.width,     // force the element to stay at its current size (the
			'height' : targetSize.height,   // size we measured the $viewportEl's transition to animate to)
			'vertical-align' : 'top'
		} );
		
		
		// ----------------------------------------------
		
		
		this.animRunning = true;
		
		// Animate the $viewportEl, keeping the $slideEl in sync
		$viewportEl.animate( {
			height : targetSize.outerHeight + "px",
			width  : targetSize.outerWidth + "px"
		}, {
			duration: options.duration,
			
			// The 'step' function here is to synchronize the "slide" itself with the sizing of the viewport's height and width
			step : function( now, fx ) {
				if( fx.prop === 'width' ) {   // only do the calculation when the width has changed (not the height)
					if( options.direction === 'left' ) {
						// Going left, we start at a negative value (ex: -300), and need to move toward 0.
						// fx.pos is the percentage (in decimal between 0 and 1) of how far along the animation is
						// So for example, going from -300 to 0, at 10% we need it to be 270, so we make fx.pos 90% (1-fx.pos)
						$slideEl.css( 'margin-left', -targetSize.outerWidth * ( 1 - fx.pos ) );
					} else {
						// Going right, we start at 0, and move toward the negative value. So if we're starting at 0,
						// and have a target of -300, at 10% we need it to be -30px.  -300 * .1 == -30
						$slideEl.css( 'margin-left', -initialSize.outerWidth * fx.pos );
					}
				}
				
				// Call any provided onStep callback given in the options to the setActiveItem method
				if( typeof options.onStep === 'function' ) {
					options.onStep.call( options.scope || window, fx );
				}
			},
			
			complete : function() {
				// When complete, restore the elements to their original state, and back into their original locations in the DOM
				$viewportEl.detach();   // take out the viewportEl (and subsequently the slideEl), as we are now replacing the original elements in its place
				
				// Append the current item back to the container, and reset its css properties that we changed.
				$currentItemEl.appendTo( $containerEl );
				$currentItemEl.css( {
					'display' : currentItemElOriginalStyles.display,
					'width' : currentItemElOriginalStyles.width,
					'height' : currentItemElOriginalStyles.height,
					'vertical-align' : currentItemElOriginalStyles.verticalAlign,
					'overflow' : currentItemElOriginalStyles.overflow
				} );
				currentItem.hide();
				
				// Append the new item back to the container, and reset its css properties that we changed.
				$newItemEl.css( {
					'display' : newItemElOriginalStyles.display,
					'width' : newItemElOriginalStyles.width,
					'height' : newItemElOriginalStyles.height,
					'vertical-align' : newItemElOriginalStyles.verticalAlign,
					'overflow' : newItemElOriginalStyles.overflow
				} );
				$newItemEl.appendTo( $containerEl );
				
				// Reset the animating flag
				this.animRunning = false;
				
				// Call any provided onComplete callback given in the options to the setActiveItem method
				if( typeof options.onComplete === 'function' ) {
					options.onComplete.call( options.scope || window );
				}
			}.createDelegate( this )
		} );
	},
	
	
	
	/**
	 * Ends the current animation which is in progress (if any). This is used for if {@link #setActiveItem} is called again while
	 * a previous animation is running, or if the {@link #onDestroy} method is run while the animation is running.
	 * 
	 * @private
	 * @method endAnimation
	 */
	endAnimation : function() {
		if( this.$viewportEl ) {
			// This line will skip the animation to its end, and run its 'complete' function. 
			this.$viewportEl.stop( /* clearQueue */ true, /* jumpToEnd */ true );
			this.animRunning = false;
		}
	},
	
	
	
	/**
	 * Extended onDestroy method for the SlideTransition to clean up the elements it creates.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		if( this.animRunning ) {
			this.endAnimation();
		}
		
		// The viewport element (and the slide element) have been created, remove them.
		if( this.$viewportEl ) {
			this.$viewportEl.remove();
			this.$slideEl.remove();
		}
		
		ui.layouts.CardsLayout.superclass.onDestroy.apply( this, arguments );
	}
	
} );

/**
 * @class ui.layouts.CardsLayout.SwitchTransition
 * @extends ui.layouts.CardsLayout.AbstractTransition
 * 
 * {@link ui.layouts.CardsLayout} transition strategy for switching cards immediately by simply hiding the "currently active" card
 * and then showing the new card. This is the default {@link ui.layouts.CardsLayout CardsLayout} transition strategy for changing
 * the active card.
 */
/*global Kevlar, ui */
ui.layouts.CardsLayout.SwitchTransition = Kevlar.extend( ui.layouts.CardsLayout.AbstractTransition, {
	
	/**
	 * @method setActiveItem
	 * @param {ui.layouts.CardsLayout} cardsLayout The CardsLayout instance that is using this transition strategy.
	 * @param {ui.Component} currentItem The currently active item. This may be null if the CardsContainer does not currently have an active item.
	 * @param {ui.Component} newItem The item to activate. This may be null if there is no new item to activate (for just hiding the currentItem).
	 * @param {Object} options There are no options for this {@link ui.layouts.CardsLayout.AbstractTransition} subclass, so this argument is ignored.
	 */
	setActiveItem : function( cardsLayout, currentItem, newItem, options ) {
		ui.layouts.CardsLayout.SwitchTransition.superclass.setActiveItem.apply( this, arguments );
		
		// First, hide the currently active item, if the currently active item is an instantiated component (i.e. not null)
		if( currentItem ) {
			currentItem.hide();
		}
		
		// Now show the newly active item (if it is not null)
		if( newItem ) {
			newItem.show();
		}
	}
	
} );

/**
 * @class ui.layouts.ColumnsLayout
 * @extends ui.layouts.AbstractLayout
 * 
 * A layout that renders a {@link ui.Container Container's} child components into columns. Each child component
 * in the Container should have a special property named `columnWidth`, that determines how wide the column
 * should be.  This property can either be a number, or any css width value.<br><br>
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'columns'.
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.layouts.ColumnsLayout = Kevlar.extend( ui.layouts.AbstractLayout, {
	
	/**
	 * Layout implementation for ColumnsLayout, which renders each child component as columns into the 
	 * Container's content target (see {@link ui.Component#getContentTarget).  Each child component in the
	 * Container should have a special property named `columnWidth`, that determines how wide the column
	 * should be.  This property can either be a number, or any css width value.
	 * 
	 * @protected
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	onLayout : function( childComponents, $targetEl ) {		
		ui.layouts.CardsLayout.superclass.onLayout.apply( this, arguments );
		
		// Make sure the content target element is empty, to clear out any elements that may be in there 
		// (such as from previous layouts, or any direct HTML injected in there).
		$targetEl.empty();
		
		// Note: Concatenating the markup and appending it all at once for performance. This method is faster than appending each
		// one at a time, even with the extra step it takes to jQuery the divs afterward. Appending each one at a time
		// is ~65% slower. 
		var renderHTML = "",
		    numChildComponents = childComponents.length,
		    i;
		    
		for( i = 0; i < numChildComponents; i++ ) {
			var columnWidth = childComponents[ i ].columnWidth;
			if( typeof columnWidth !== 'undefined' ) {
				// If the columnWidth doesn't have a % sign at the end, add 'px'
				if( String( columnWidth ).lastIndexOf( '%' ) === -1 ) {
					columnWidth += "px";
				}
			} else {
				columnWidth = 'auto';  // default to 'auto'
			}
			
			// Create a div element for the column content
			renderHTML += '<div style="float: left; width: ' + columnWidth + '" />';
		}
		
		// Add clearing div for anything that comes under the columns
		renderHTML += '<div style="clear: both;" />';
		
		// Now append all of the HTML at once to the target element
		$targetEl.append( renderHTML );
		
		// Finally, render each of the child components into their div containers
		var $divs = $targetEl.find( 'div' );
		for( i = 0; i < numChildComponents; i++ ) {
			childComponents[ i ].render( $divs[ i ] );
		}
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'columns', ui.layouts.ColumnsLayout );

/**
 * @class ui.layouts.ContainerLayout
 * @extends ui.layouts.AbstractLayout
 * 
 * The default layout that is used for a {@link ui.Container Container}, which simply
 * renders each child component into their own div element, and does no further sizing or formatting.<br><br>
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'container' (or
 * by not giving the {@link ui.Container Container} any {@link ui.Container#layout layout} config).
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.layouts.ContainerLayout = Kevlar.extend( ui.layouts.AbstractLayout, {
	
	/**
	 * Layout implementation for ContainerLayout, which simply renders each child component directly into the 
	 * Container's content target (see {@link ui.Component#getContentTarget). 
	 * 
	 * @protected
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	onLayout : function( childComponents, $targetEl ) {
		ui.layouts.CardsLayout.superclass.onLayout.apply( this, arguments );
		
		for( var i = 0, len = childComponents.length; i < len; i++ ) {
			childComponents[ i ].render( $targetEl );  // render the child component into the Container's content target element
		}
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'container', ui.layouts.ContainerLayout );

/**
 * @class ui.layouts.TabsLayout
 * @extends ui.layouts.AbstractLayout
 * 
 * A layout that renders a {@link ui.Container Container's} child components in tabs.  Methods are available in 
 * this class to control which tab is shown.<br><br>
 * 
 * This class is usually not meant to be instantiated directly, but created by its layout type name 'tabs'.
 * 
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.layouts.TabsLayout = Kevlar.extend( ui.layouts.AbstractLayout, {
	
	/**
	 * @cfg {Number/ui.Component} activeTab
	 * The tab number, or ui.Component instance to set as the initially active tab. Defaults to 0 (for the first tab).
	 * If this is a ui.Component instance, it must exist within the {@link #container}.
	 */
	activeTab : 0,
	
	
	/**
	 * @private
	 * @property activeTab
	 * @type Int
	 * Stores the index of the currently active tab ({@link ui.Component}).
	 */
	
	
	// protected
	initLayout : function() {
		ui.layouts.TabsLayout.superclass.initLayout.call( this );
		
		this.addEvents(
			/**
			 * @event tabchange
			 * Fires when the active tab has been changed. 
			 * @param {ui.layouts.TabsLayout} tabsLayout This TabsLayout instance.
			 * @param {ui.Component} tab The {@link ui.Component} instance of the tab that was activated.
			 * @param {ui.Component} oldTab The {@link ui.Component} instance of the tab that was de-activated. 
			 *   Will be null if there was no previously activated tab.
			 */
			'tabchange'
		);
	},
	
	
	/**
	 * Layout implementation for TabsLayout, used to create a jQuery UI tabs instance (with its required markup), 
	 * and render the Container's child components into it (one in each tab).  The child components should have a special
	 * property called `title`, which is used as the tabs' title. The tab given by the {@link #activeTab} config 
	 * is shown.
	 * 
	 * @protected
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	onLayout : function( childComponents, $targetEl ) {
		ui.layouts.TabsLayout.superclass.onLayout.apply( this, arguments );
		
		
		// First, normalize the activeTab config / property to a ui.Component.
		var activeTabIndex = this.activeTab = this.normalizeTabIndex( this.activeTab );
		
		
		
		// Make sure the content target element is empty, to clear out any elements that may be in there 
		// (such as from previous layouts, or any direct HTML injected in there).
		$targetEl.empty();
		
		
		var container = this.container,
		    elId = container.elId,
		    containerHeight = container.height,
		    tabHeight = ( containerHeight ) ? containerHeight - 40 - 5 : 0,  // minus the height of the tabs, minus 5px for the bottom. couldn't get an accurrate computed value at this point. TODO: need to do after create jQuery UI tabs.
		    tabHeadersMarkup = [],
		    tabBodiesMarkup = [],
		    i,
		    numChildComponents = childComponents.length;
		
		
		// Create the render markup, to render the HTML needed for the TabsLayout
		// Note: Concatenating the markup and appending it all at once for performance. This method is faster than appending each
		// element one at a time, even with the extra step it takes to jQuery the divs afterward. Appending each one at a time
		// is ~65% slower. 
		tabHeadersMarkup.push( '<ul>' );
		for( i = 0; i < numChildComponents; i++ ) {
			var childComponent = childComponents[ i ],
			    title = childComponent.title || "(No title property set on child item)",
			    divClass = ( i !== activeTabIndex ) ? 'ui-tabs-hide' : '',   // hide all tabs except the one that is active
			    divStyle = ( tabHeight > 0 ) ? 'height: ' + tabHeight + 'px; overflow-y: auto;' : '',
			    tabId = elId + '-tab-' + i;
			
			tabHeadersMarkup.push( '<li><a href="#', tabId, '">', title, '</a></li>' );
			tabBodiesMarkup.push(
				'<div id="', tabId, '" class="', divClass, '" style="', divStyle, '">',
					'<div class="ui-tabs-panel-inner" />',   // An inner div, where the child components will be rendered into. This allows for greater styling flexibility.
				'</div>'
			);
		}
		tabHeadersMarkup.push( '</ul>' );
		
		// Append the renderMarkup (a combination of the tab headers and tab bodies markup) to the target element
		var renderMarkup = tabHeadersMarkup.concat( tabBodiesMarkup );
		$targetEl.append( renderMarkup.join( "" ) );
		
		// Now find all of the "ui-tabs-panel-inner" elements, and render the child components into them.
		// These elements should exactly correspond to the childComponents to render (from the renderMarkup)
		var $tabInnerDivs = $targetEl.find( 'div.ui-tabs-panel-inner' );
		for( i = 0; i < numChildComponents; i++ ) { 
			childComponents[ i ].render( $tabInnerDivs[ i ] );
		}
		
		
		// ------------------------------------
		
		// Create the jQuery UI tabs when all elements have been added
		$targetEl.tabs( {
			selected: activeTabIndex,
			
			// event handlers
			show : this.onTabChange.createDelegate( this )
		} );
	},
	
	
	
	/**
	 * Normalizes the given `tab` argument to an integer which represents the index of a {@link ui.Component} in the {@link #container},
	 * for use with the jQuery UI Tabs implementation. This implementation tries to keep a tab selected no matter what, unless there are no
	 * tabs ({@link ui.Component Components}) left in the Container, in which case it returns -1.
	 * 
	 * @private
	 * @method normalizeTabIndex
	 * @param {Number/ui.Component} tab An integer for the index position of the active tab, or the ui.Component instance for the tab itself.
	 * @return {Number} The normalized index. As long as at least one item exists within the {@link #container}, a valid index number will be returned,
	 *   which will be 0 in all invalid cases. If there are no items within the {@link #container}, -1 is returned.
	 */
	normalizeTabIndex : function( tab ) {
		var container = this.container,
		    numItems = container.getItems().length;		
		
		// Convert a string argument to a number first
		if( typeof tab === 'string' ) {
			tab = parseInt( tab, 10 ) || -1;  // If the parsed string came to NaN, use -1, which will cause the method to return null
		}
		
		// If there are no items in the container, set to -1
		if( numItems === 0 ) {
			tab = -1;
			
		} else if( typeof tab === 'number' ) {
			// Make sure the number is contrained within the range of items.
			tab = Math.floor( tab );  // make sure no decimal point. who knows...
			if( tab < 0 ) {
				tab = 0;
			} else if( tab > numItems - 1 ) {
				tab = numItems - 1;
			}
			
		} else if( tab instanceof ui.Component ) {
			tab = container.getItemIndex( tab );
			
			// If the tab was not found within the Container, set to 0
			if( tab === -1 ) {
				tab = 0;
			}
			
		} else {
			// All other cases, set to the first item
			tab = 0;
		}
		
		return tab;
	},
	
	
	
	/**
	 * Sets the active tab.
	 * 
	 * @method setActiveTab
	 * @param {ui.Component/Number} tab The ui.Component to set as the active tab, or the tab number to set as the active tab (0 for the first tab).
	 *   Note that if a ui.Component is provided, it must be an *instantiated* ui.Component, and not the anonymous config object used to create the ui.Component.
	 */
	setActiveTab : function( tab ) {
		var container = this.container,
		    oldTabIndex = this.activeTab,
		    newTabIndex = this.activeTab = this.normalizeTabIndex( tab );  // If the tab was provided as a ui.Component, normalize its index to a number, and within range of the number of components in the container
		
		if( !container.rendered ) {
			// Not rendered, fire the event here. If it is rendered, changing the selected tab on the jQuery UI Tabs instance will fire the event
			this.fireEvent( 'tabchange', this, container.getItemAt( newTabIndex ), container.getItemAt( oldTabIndex ) );
			
		} else {
			container.getContentTarget().tabs( "option", "selected", newTabIndex );
		}
	},
	
	
	/**
	 * Gets the active tab ({@link ui.Component}).
	 * 
	 * @method getActiveTab
	 * @return {ui.Component} The Component that is currently shown as the active tab, or null if there is no active tab.
	 */
	getActiveTab : function() {
		return this.container.getItemAt( this.getActiveTabIndex() );
	},
	
	
	/**
	 * Gets the active tab index (i.e. the 0-based tab number that is currently selected).
	 * 
	 * @method getActiveTab
	 * @return {Number} The index of the tab that is currently shown as the active tab, or -1 if there is no active tab.
	 */
	getActiveTabIndex : function() {
		return this.normalizeTabIndex( this.activeTab );   // in case the TabsLayout is not rendered yet
	},
	
	
	// ------------------------------------
	
	
	/**
	 * Method that is run when a new tab is shown from the jQuery UI Tabs instance.
	 * 
	 * @private
	 * @method onTabChange
	 */
	onTabChange : function() {
		var container = this.container,
		    oldTab = this.container.getItemAt( this.activeTab ),  // retrieve the old tab for the event. It is still set to this.activeTab
		    newTabIndex = this.activeTab = container.getContentTarget().tabs( "option", "selected" ),
		    newTab = container.getItemAt( newTabIndex );
		
		// Run the newly active tab's (ui.Component's) onShow method, to tell it that is has just been shown 
		// (mostly for ui.Container's, to make sure they run their layout if a layout has been deferred).
		newTab.onShow();
		
		// fire the tabchange event.
		this.fireEvent( 'tabchange', this, newTab, oldTab );
	}
	
} );


// Register the layout type with the ui.Container class, which is used to be able to instantiate the layout via its type name.
ui.Container.registerLayout( 'tabs', ui.layouts.TabsLayout );

/**
 * @class ui.Mask
 * 
 * Generalized class that can create a mask over any given element, and provides a simple interface
 * to show, hide, and add content to it. 
 * 
 * @constructor
 * @param {HTMLElement/jQuery} targetEl The element or jQuery wrapped set that the mask is to mask over. This
 *   may only be one element in the case of a jQuery wrapped set. 
 * @param {Object} config Any additional configuration options for the Mask, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.Mask = Kevlar.extend( Object, {
	
	/**
	 * @cfg {Boolean} spinner
	 * True to display a spinner image in the {@link #$contentEl} element when the mask is shown. Set to false to hide the spinner.
	 */
	spinner : true,
	
	/**
	 * @cfg {String/HTMLElement/jQuery} msg
	 * A message (or any content) to display in the center of the mask. If this is specified, the {@link #$contentEl} will be
	 * made to look like an opaque box, so that text inside of it is easily readable. Defaults to an empty string, for no message.
	 */
	msg : "",
	
	
	/**
	 * @private
	 * @property spinnerURL
	 * The URL of the spinner image to use when the {@link #spinner} config is true.
	 * @type String
	 */
	spinnerURL : "assets/spinner2e2d2d.gif",
	
	
	/**
	 * @private
	 * @property $targetEl
	 * The element to mask, wrapped in a jQuery wrapped set.
	 * @type jQuery
	 */
	
	/**
	 * @private
	 * @property {Boolean} rendered
	 * Will be true once the Mask's elements have been rendered ({@link initMaskElements} has been run). Initially false.
	 */
	rendered : false,
	
	/**
	 * @private
	 * @property {jQuery} $maskEl
	 * The masking element itself. This is lazily created in the {@link #initMaskElements} method when the mask is to
	 * be shown.
	 */
	
	/**
	 * @private
	 * @property {jQuery} $contentEl
	 * The content element that sits on top of the Mask to display the {@link #msg} and/or {@link #spinner}. This is lazily 
	 * created in the {@link #initMaskElements} method when the mask is to be shown.
	 */
	
	/**
	 * @private
	 * @property [jQuery} $msgEl
	 * The element that is used to display the {@link #msg}.
	 */
	
	/**
	 * @private
	 * @property {Boolean} shown
	 * Stores if the mask is currently being shown or not. Retrieve with {@link #isShown}.
	 */
	shown : false,
	
	
	constructor : function( targetEl, config ) {
		if( Kevlar.isElement( targetEl ) ) {
			this.$targetEl = jQuery( targetEl );
			
		} else if( Kevlar.isJQuery( targetEl ) ) {
			if( targetEl.length !== 1 ) {
				throw new Error( "If the 'targetEl' argument to the ui.Mask constructor is a jQuery wrapped set, it must contain exactly one element." );
			}
			this.$targetEl = targetEl;
			
		} else {
			throw new Error( "ui.Mask requires the first argument to its constructor to be an HTMLElement, or a jQuery wrapped set" );
		}
		
		// Apply any additional configuration properties onto this object
		this.updateConfig( config );
	},
	
	
	
	/**
	 * Updates the configuration of the mask. Accepts an object with the configuration options for this class,
	 * and updates the Mask accordingly.  Note that all configuration options that are not provided in the
	 * `config` argument will be reset to their defaults. 
	 * 
	 * @method updateConfig
	 * @param {Object} config The new configuration options for the Mask. See the "config options" section of the docs for details. 
	 */
	updateConfig : function( config ) {
		// Remove any previously set configuration options
		delete this.spinner;
		delete this.msg;
		
		// Apply the new config
		Kevlar.apply( this, config );
		
		// If the mask is already rendered, update the elements accordingly
		if( this.rendered ) {
			this.updateMaskElements();
		}
	},
	
	
	/**
	 * Creates the masking elements (the {@link #$maskEl} and {@link #$contentEl}) if they have not yet been created. When creating
	 * the elements, they are appended to the target element (note that they are absolutely positioned so they do not affect document flow).
	 * 
	 * @private
	 * @method initMaskElements
	 */
	initMaskElements : function() {
		// Create the mask elements if they do not yet exist, and append it to the target element
		if( !this.rendered ) {
			var $targetEl = this.$targetEl;
			
			this.$maskEl = jQuery( '<div class="ui-mask" />' )
				.click( function( evt ) { evt.stopPropagation(); } )   // the mask should swallow any click events to it, to prevent any behavior from the bubbling of the event
				.appendTo( $targetEl );
			
			this.$contentEl = jQuery( '<div class="ui-mask-content" />' )
				.append( '<img class="ui-mask-content-spinner" src="' + this.spinnerURL + '" />' )  // This image will only be shown if the spinner config is true (i.e. the $contentEl has the 'ui-mask-spinnerEnabled' css class)
				.click( function( evt ) { evt.stopPropagation(); } )   // the mask should swallow any click events to it, to prevent any behavior from the bubbling of the event
				.appendTo( $targetEl );
			
			this.$msgEl = jQuery( '<div class="ui-mask-msg" />' ).appendTo( this.$contentEl );
			
			this.rendered = true;
			this.updateMaskElements();
		}
	},
	
	
	/**
	 * Updates the mask elements with the current values of the configuration options (which may be set after instantiation time
	 * with the {@link #updateConfig} method.
	 * 
	 * @private
	 * @method updateMaskElements
	 */
	updateMaskElements : function() {
		if( this.rendered ) {
			// Update the spinner
			if( this.spinner ) {
				this.$contentEl.addClass( 'ui-mask-spinnerEnabled' );
			} else {
				this.$contentEl.removeClass( 'ui-mask-spinnerEnabled' );
			}
			
			// Update the message
			this.$msgEl.empty();
			if( this.msg ) {
				// Add the ui-mask-contentBox css class if there is actually a message. This css class
				// creates an opaque "box" that is shown in the middle of the mask where text can be placed
				// and easily read. Then append the message itself to the $msgEl.
				this.$contentEl.addClass( 'ui-mask-contentBox' );
				this.$msgEl.append( this.msg );
			} else {
				this.$contentEl.removeClass( 'ui-mask-contentBox' );
			}
		}
	},
	
	
	
	
	// -------------------------------------
	
	
	/**
	 * Shows the mask over the target element.<br><br>
	 * 
	 * Note that if the mask is already shown, and its height needs to be recalculated because the underlying element's 
	 * size has changed, this method may be called again to redraw the mask.
	 * 
	 * @method show
	 */
	show : function() {
		// First, make sure the masking elements have been created (lazily created upon showing the mask, not in the constructor)
		this.initMaskElements();
		
		
		var $targetEl = this.$targetEl,
		    $maskEl = this.$maskEl,
		    $contentEl = this.$contentEl;
		
		// First, add the ui-masked css class to the target element, which removes the target element's scroll bars
		$targetEl.addClass( 'ui-masked' );
		
		// Next, give the target element a relative positioning context if it currently does not have one (i.e. it 
		// has "position: static"), and the target element not the document body (the document body already has a positioning context)
		if( $targetEl.css( 'position' ) === 'static' && !$targetEl.is( 'body' ) ) {
			$targetEl.addClass( 'ui-masked-relative' );
		}
		
		
		// Now show the masking element.
		$maskEl.show();
		
		// IE will not expand full height automatically if it has auto height. Just doing this calc for all browsers for now,
		// instead of worrying about browser detection (determining which versions of IE are affected) or attempting 
		// a feature detection for this.
		$maskEl.height( $targetEl.outerHeight() );
		
		
		// Center the $contentEl within the mask
		$contentEl.show();  // show if previously hidden
		
		// Set flag
		this.shown = true;
		
		// Position the content element ($contentEl) in the center of the $targetEl, and set it to continually reposition it on an interval.
		// The interval is for when elements on the page may resize themselves, we need to adjust the content element's position. The interval
		// will be cleared once the mask is hidden.
		this.repositionContentEl();
		var repositionIntervalId = setInterval( function() {
			if( this.isShown() ) {
				this.repositionContentEl();
			} else {
				clearInterval( repositionIntervalId );  // When no longer shown, clear the interval
			}
		}.createDelegate( this ), 100 );
	},
	
	
	/**
	 * Repositions the {@link $contentEl} to be in the center of the {@link $targetEl}.
	 * 
	 * @private
	 * @method repositionContentEl
	 */
	repositionContentEl : function() {
		// using jQuery UI positioning utility to center the content element
		this.$contentEl.position( {
			my: 'center center',
			at: 'center center',
			of: this.$targetEl
		} );
	},
	
	
	/**
	 * Hides the mask.
	 * 
	 * @method hide
	 */
	hide : function() {
		// Should only hide if the mask is currently shown.
		if( this.isShown() ) {
			// Hide the mask and the content element (if it exists), and restore the target element 
			// to its original state (i.e. scrollbars allowed, and no positioning context if it didn't have one)
			this.$maskEl.hide();
			this.$contentEl.hide();
			this.$targetEl.removeClass( 'ui-masked' ).removeClass( 'ui-masked-relative' );
			
			this.shown = false;
		}
	},
	
	
	/**
	 * Determines if the Mask is currently shown (visible).
	 * 
	 * @method isShown
	 * @return {Boolean} True if the mask is currently shown (visible).
	 */
	isShown : function() {
		return this.shown;
	},
	
	
	// -------------------------------------
	
	
	/**
	 * Destroys the mask by cleaning up its elements.
	 * 
	 * @method destroy
	 */
	destroy : function() {
		// Make sure the mask has been hidden, to restore the target element to its original state
		this.hide();
		
		if( this.rendered ) {
			this.$msgEl.remove();
			this.$contentEl.remove();
			this.$maskEl.remove();
		}
	}
	
} );

/**
 * @class ui.Overlay
 * @extends ui.AbstractOverlay
 * 
 * A simple overlay panel that can sit on top of other elements and be easily positioned based on x/y positioning, or the location
 * of other elements.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global window, jQuery, Kevlar, ui */
ui.Overlay = Kevlar.extend( ui.AbstractOverlay, {
		
	/**
	 * @cfg {Object} arrow
	 * A position for an arrow on the overlay. This is an object (hash) which should have the following properties:
	 * @cfg {String} arrow.side The side that the arrow should be placed on the overlay. This can be one of: `top`, `bottom`, `right`, `left`. 
	 * @cfg {Number} [arrow.offset=10] Where to position the arrow on the `side`. Positive values come from the top or left,
	 *   while negative values come from the bottom or right (depending on the `side` specified).
	 * 
	 * Example config:
	 *     {
	 *         side : 'top',
	 *         offset : -20
	 *     }
	 * 
	 * This will place the arrow at the top of the Overlay, 20 pixels from the right.
	 * 
	 * NOTE: At this time, only 'top' and 'bottom' are accepted for the `side`.
	 * 
	 * Note that the position of the arrow may be changed after the initial rendering using the {@link #setArrowPosition} method. 
	 */
	arrow : null,
	
	
	/**
	 * @cfg {String/HTMLElement/jQuery} dontCloseOn
	 * A selector, element, or jQuery wrapped set of elements that when clicked on, should prevent the automatic-closing feature
	 * of the Overlay. Normally, when the user clicks anywhere outside of the Overlay, the Overlay is automatically closed. Providing
	 * this will make sure that the Overlay is not closed when these element(s) (outside of the Overlay's markup) are clicked on.
	 * Clicking anywhere else in the document besides the Overlay itself, and these element(s), will close the overlay.
	 */
	
	
	
	// protected
	initComponent : function() {
		// Add the ui-overlay class and the jux/jux-dialog classes to this component's element. 
		// jux and jux-dialog are needed for form fields and such to be styled correctly within it.
		this.cls += ' ui-overlay';
		
		// Overlay should be instantiated hidden (ui.Component config)
		this.hidden = true;
		
		// Run setArrow() to normalize any arrow value
		if( this.value ) {
			this.setArrow( this.arrow );
		}
		
		// Call superclass initComponent
		ui.Overlay.superclass.initComponent.call( this );
	},
	
	
	/**
	 * Extension of onRender which is used to create Overlay and its inner overlay content.
	 * 
	 * @protected
	 * @method onRender
	 */
	onRender : function() {
		ui.Overlay.superclass.onRender.apply( this, arguments );
		
		// Create a div element for the arrow, if one was specified
		if( this.arrow ) {
			this.renderArrow( this.arrow );
		}
	},
	
	
	/**
	 * Renders the arrow at the given `position` on the Overlay. The `position`
	 * parameter is the same format as the {@link #arrow} config.
	 * 
	 * @private
	 * @method renderArrow
	 * @param {Object} arrow An {@link #arrow} config to render an arrow with. This is passed in so it can be different from the
	 *   actual {@link #arrow} config in case of a collision (see {@link #onCollision}). 
	 */
	renderArrow : function( arrow ) {
		// Remove any previous arrow
		if( this.$arrow ) {
			this.$arrow.remove();
			this.$arrow = null;
		}
		
		if( arrow ) {
			var arrowOffset = arrow.offset,
			    offsetProp = ( arrowOffset < 0 ? 'right: ' : 'left: ' ) + Math.abs( arrowOffset ) + 'px';
			
			this.$arrow = jQuery( '<div class="ui-overlay-arrow ui-overlay-arrow-' + arrow.side + '" style="' + offsetProp + '"></div>' )
				.prependTo( this.$el );
		}
	},
	
	
	// ------------------------------------------
	
	
	
	/**
	 * Opens the Overlay, rendering it if it has not yet been rendered. The overlay is rendered here
	 * so all Components can be added to it first before rendering it.<br><br>
	 *
	 * See the superclass {@link ui.AbstractOverlay#open} method for more details.  
	 * 
	 * @method open
	 * @param {Object} options (optional) Any of the options provided by the superclass {@link ui.AbstractOverlay#open} method, 
	 * as well as any of the following properties for this subclass:
	 * <div class="mdetail-params">
	 *   <ul>
	 *     <li>
	 *       <b>dontCloseOn</b> : String|HTMLElement|jQuery
	 *       <div class="sub-desc">
	 *         A {@link #dontCloseOn} config to set on the call to open. Note that subsequent calls to open() will use 
	 *         this config unless changed by a call to {@link #setDontCloseOn}.  See {@link #dontCloseOn} for more details.
	 *       </div>
	 *     </li>
	 *   </ul>
	 * </div>
	 */
	open : function( options ) {
		options = options || {};
		
		// Set any dontCloseOn config provided
		if( options.dontCloseOn ) {
			this.dontCloseOn = options.dontCloseOn;
		}
		
		// Call the superclass open method
		ui.Overlay.superclass.open.call( this, options );
		
		
		// Set up an event handler to close the overlay if the user clicks somewhere other than the overlay
		this.docBodyClickHandler = function( evt ) { this.onDocBodyClick( evt ); }.createDelegate( this );
		window.setTimeout( function() {   // must be done after the overlay has opened and the original mousedown event has finished bubbling, or the handler will immediately close the Overlay
			jQuery( document.body ).bind( 'mousedown touchend', this.docBodyClickHandler );
		}.createDelegate( this ), 10 );
	},
	
	
	/**
	 * Sets the {@link #arrow}.
	 * 
	 * @method setArrow
	 * @param {Object} arrow See the {@link #arrow} config for details. Pass null to remove the arrow completely. 
	 */
	setArrow : function( arrow ) {
		this.arrow = arrow;
		
		// Set default value for offset (if it is not null)
		if( arrow && typeof arrow.offset === 'undefined' ) {
			arrow.offset = 10;
		}
		
		if( this.rendered ) {
			this.renderArrow( arrow );
		}
	},
	
	
	/**
	 * Sets the {@link #dontCloseOn} config value after instantiation. The the {@link #dontCloseOn} config for details.
	 * 
	 * @method setDontCloseOn
	 * @param {String/HTMLElement/jQuery} dontCloseOn See the {@link #dontCloseOn} config for details.
	 */
	setDontCloseOn : function( dontCloseOn ) {
		this.dontCloseOn = dontCloseOn;
	},
	
	
	/**
	 * @protected
	 * @method onCollision
	 * @inheritdoc
	 */
	onCollision : function( collisionType, collisionDirections ) {
		ui.Overlay.superclass.onCollision.apply( this, arguments );
		
		// Determine if the Overlay has been "flipped" (by collision === 'flip', which is also the default). If so, we need to 
		// move the arrow to the other side (if there is an arrow)
		var arrow = Kevlar.Object.clone( this.arrow );  // make a copy. don't actually want to overwrite the config if it is re-positioned again
		if( arrow && collisionType === 'flip' ) {
			var arrowSide = arrow.side;
			    
			if( collisionDirections.top || collisionDirections.bottom ) {
				if( arrowSide === 'top' || arrowSide === 'bottom' ) {
					arrow.side = ( arrowSide === 'top' ) ? 'bottom' : 'top';
				}
				
				if( arrowSide === 'left' || arrowSide === 'right' ) {
					arrow.offset *= -1;  // reverse the arrow
				}
			}
			
			if( collisionDirections.left || collisionDirections.right ) {
				if( arrowSide === 'left' || arrowSide === 'right' ) {
					arrow.side = ( arrowSide === 'left' ) ? 'right' : 'top';
				}
				
				if( arrowSide === 'top' || arrowSide === 'bottom' ) {
					arrow.offset *= -1;  // reverse the arrow
				}
			}
			
			this.renderArrow( arrow );
		}
	},
	
	
	
	/**
	 * Tests if the click to the document body was outside of the Overlay. If it was, the Overlay is closed. 
	 * The Overlay will not be closed however if the element clicked on was the {@link #dontCloseOn} element(s).
	 * Fires the {@link #beforeblurclose} event if the Overlay is to be closed.
	 * 
	 * @private
	 * @method onDocBodyClick
	 * @param {jQuery.Event} evt The click event.
	 */
	onDocBodyClick : function( evt ) {
		// there was a click to some other place in the document than the overlay, then close the overlay
		var $parentEls = jQuery( evt.target ).parents().andSelf();  // make sure the element that was clicked on itself is included
		
		// If one of the parent elements is not the Overlay element, and one of the parents is not any dontCloseOn element(s) provided,
		// then the user must have clicked somewhere else in the document. Close the Overlay in this case.
		if( !$parentEls.is( this.$el ) && !$parentEls.is( this.dontCloseOn ) ) {
			if( this.fireEvent( 'beforeblurclose', this, evt ) !== false ) {   // allow handlers to cancel the closing of the Overlay from a document click, based on their own conditions
				this.close();
			}
		}
	},
	
	
	/**
	 * Template method that is run just before the Overlay is to be closed (before any {@link #closeAnim} has started).
	 * 
	 * @protected
	 * @method onBeforeClose
	 */
	onBeforeClose : function() {
		// Remove the document body handler, which closes the overlay when clicking off of it
		jQuery( document.body )
			.unbind( 'mousedown', this.docBodyClickHandler )
			.unbind( 'touchend', this.docBodyClickHandler );
		this.docBodyClickHandler = null;
	}
	
} );

/**
 * @class ui.plugins.DragAndDropSort
 * @extends ui.plugins.AbstractPlugin
 * 
 * Plugin that can be added to any {@link ui.Container} to make the Container's items drag and drop sortable.
 * 
 * @constructor
 * @param {Object} config The configuration options for the plugin, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.plugins.DragAndDropSort = Kevlar.extend( ui.plugins.AbstractPlugin, {
	
	/**
	 * @cfg {String} itemsSelector
	 * The selector that specifies which HTMLElements inside the Container should be sortable. Defaults to: "> *" (for all children).
	 * In terms of a {@link ui.Container}, this will allow every child {@link ui.Container#items item} (Component) to be sortable.<br><br>
	 *   
	 * This config can be specified, for example, to ignore certain items based on a css class name. It would look something like this:
	 * <pre><code>"> *:not( .ignore-class )"</code></pre> 
	 */
	itemsSelector : "> *",
	
	
	/**
	 * @private
	 * @property draggedItem
	 * Private variable that will keep track of the item that is being dragged for drag and drop operations.
	 * Initially null.
	 * @type ui.Component
	 */
	draggedItem : null,
	
	
	/**
	 * Initializes the DragAndDropSort plugin. This method is called by the Container that the plugin
	 * is added to, and should not be called directly.
	 * 
	 * @method initPlugin
	 * @param {ui.Container} container
	 */
	initPlugin : function( container ) {
		if( !( container instanceof ui.Container ) ) {
			throw new Error( "error: DragAndDropSort plugin can only be added as a plugin to a ui.Container, or ui.Container subclass" );
		} 
		
		// Store a reference to the container in the plugin
		this.container = container;
		
		// Add the plugin's onRender method to execute after the container's onRender method
		container.onRender = container.onRender.createSequence( this.onRender, this );
	},
	
	
	/**
	 * After the Container has rendered, this method will add the drag and drop functionality.
	 * 
	 * @private
	 * @method onRender
	 */
	onRender : function() {
		var container = this.container,
		    $contentEl = container.getContentTarget();  // only make the Container's "content area" have draggable items
		
		$contentEl.addClass( 'juxUI-draggable' );
		$contentEl.sortable( {
			containment : 'parent',
			tolerance   : 'pointer',
			items       : this.itemsSelector,
			
			start : function( event, ui ) {
				// On start, grab a reference to the AbstractItem instance that is being dragged
				var idx = $contentEl.children().index( ui.item );       // find the index of the dragged element,
				this.draggedItem = container.getItems()[ idx ];  // and use it to retrieve the ui.Component
			}.createDelegate( this ),
			
			beforeStop : function( event, ui ) {
				// This is a bit of a workaround for jQuery UI sortable.  First, sortable will not properly cancel the sort by 
				// returning false from this handler (jQuery UI errors out), which we would have wanted because we need to
				// re-order the Components within the ui.Container instance anyway.  So, the index is retrieved where it
				// is dropped, and then the ui.Container is to updated for its internal childComponents array. Basically it
				// involves two DOM accesses: the first by jQuery UI that drops the element (for some reason, uncancelable),
				// and the second by ui.Container. 
				var newIndex = $contentEl.children().index( ui.item );
				container.insert( this.draggedItem, newIndex );
				
				this.draggedItem = null;
				
				// return false;  -- purposefully commented. See above note
			}.createDelegate( this )
		} );
	}
	
} );

/**
 * @class ui.Slider
 * @extends ui.Component
 * @mixin ui.DataControl
 * 
 * A slider component that uses jQuery UI's Slider behind the scenes.  Because jQuery UI's Slider is a very rudimentary implementation
 * which simply sets the slider position based on a 'left' position percentage from 0%-100%, it normally has styling so that the slider
 * itself overlaps the slide area. This implementation adds a helper element to account for this shortcoming, which will retain the 
 * slider within the slide area.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global window, jQuery, Kevlar, ui */
ui.Slider = Kevlar.extend( ui.Component, [ ui.DataControl ], {

	/**
	 * @cfg {Number} min
	 * The minimum value for the slider.
	 */
	min : 0,
	
	/**
	 * @cfg {Number} max
	 * The maximum value for the slider.
	 */
	max : 100,
	
	/**
	 * @cfg {Number} step
	 * Determines the size or amount of each interval or step the slider takes between {@link #min} and {@link #max}. The full 
	 * specified value range of the slider ({@link #max} - {@link #min}) needs to be evenly divisible by the step.
	 */
	step : 1,
	
	/**
	 * @cfg {Number[]} handlePositions
	 * The position of the slider handles between the {@link #min} and the {@link #max}. If multiple slider handles, this config should be
	 * an array with multiple integer values, one for each handle position.  Defaults to a single array item with the value of the {@link #min} 
	 * config.
	 */
	
	
	/**
	 * @private
	 * @property handlePositions
	 * @type Number[]
	 * Stores the current values of the handle positions, when they are changed on the slider. Normally, {@link #getData} would ask
	 * for the slider positions directly from the jQuery UI Slider instance (using the "values" method), but for some reason, it does not always
	 * report them correctly. However, the jQuery UI Slider does report the values correctly when the event is fired (perhaps they use some timeout 
	 * to update what the .slider( "values" ) method reports?), so when the event is fired, it saves the values into this variable.
	 */
	
	/**
	 * @private
	 * @property $handleHelper
	 * @type jQuery
	 * The inner "wrapper" element that is sized to the slider width, minus the width of the handle. This element is used
	 * to make the handle itself visually remain "inside" the slider (instead of overlapping the outsides as in the original
	 * jQuery UI implementation). 
	 */
	
	/**
	 * @private
	 * @property $handles
	 * @type jQuery
	 * The handle element(s) themselves.
	 */
	

	// protected
	initComponent : function() {
		this.addEvents( 
			/**
			 * @event change
			 * Fires when a handle has been slid.
			 * @param {ui.Slider} slider This Slider instance.
			 * @param {Number[]} handlePositions The new positions of the handles in the slider.
			 */
			'change'
		);
		
		// This component's class must be named ui-sliderComponent as not to conflict with jQuery UI's ui-slider css class.
		this.cls += ' ui-sliderComponent';
		
		
		if( !this.handlePositions ) {
			// No handle positions, set to an array with one element: the configured (or default) minimum value
			this.handlePositions = [ this.min ];
			
		} else if ( !Kevlar.isArray( this.handlePositions ) ) {
			// not an array, make it one
			this.handlePositions = [ this.handlePositions ];
		}
		
		// Call superclass initComponent
		ui.Slider.superclass.initComponent.call( this );
		
		// Call mixin class constructors
		ui.DataControl.constructor.call( this );
	},


	// protected
	onRender : function() {
		ui.Slider.superclass.onRender.apply( this, arguments );
		
		var $el = this.$el,
		    $sliderEl = jQuery( '<div />' ).appendTo( $el );
		
		// Create the jQuery UI Slider
		$sliderEl.slider( {
			min  : this.min,
			max  : this.max,
			step : this.step,
			values : this.handlePositions,
			
			// Event handlers
			slide : this.onSlideChange.createDelegate( this )
		} );
		
		// After we have created the slider, add an inner wrapper element which will be sized to make the handles 
		// visually remain "inside" the slider (not overlapping the outside of it).
		$sliderEl.wrapInner( '<div class="ui-slider-handleHelper" />' );
		this.$handleHelper = $sliderEl.find( '.ui-slider-handleHelper' );  // need to find it after wrapInner() call, as wrapInner duplicates elements (i.e. we cannot create it first, and then wrap it inside the slider element)
		
		
		// -----------------------------------------
		
		// Get a reference to the handle(s) themselves.
		this.$handles = $sliderEl.find( '.ui-slider-handle' );
		
		
		// The following event handlers here are a fix for the handle "jumping" when initially grabbed while using the handleHelper (created above). The idea for this
		// was taken from the jQuery UI slider example for a scrollbar (which does not get that "jump"), which basically uses the same method of visually keeping
		// the handles of the slider "within" the slider (see the $handleHelper property description). Link: http://jqueryui.com/demos/slider/#side-scroll
		this.$handles.bind( {
			'mousedown' : function() {
				// resize the slider itself to the width of the handle helper, so they are equivalent and mouse position / slider position remains in sync
				// This must be on mousedown of the handle itself, instead of a slider 'start' handler because it does not work correctly when in a 'start' handler.
				$sliderEl.width( this.$handleHelper.width() );
			}.createDelegate( this )//,
			
			// Note: This mouseup handler doesn't always get executed, such as if the mouseup happens off of the window viewport. 
			// Executing this code instead in a 'slidestop' handler of the slider itself (below)
			//'mouseup' : function() {
			//	$sliderEl.width( "100%" );  
			//}.createDelegate( this )
		} );
		
		$sliderEl.bind( 'slidestop', function() {
			// resize back to 100% when done sliding. This re-enables the slider to be direct-clicked anywhere (other than the handle) to move the handle
			$sliderEl.width( "100%" );   
		} );
		
		
		// -----------------------------------------
		
		
		// Save reference to the slider element
		this.$sliderEl = $sliderEl;
		
		// Seems to initially need to be done in a timeout for some browsers
		window.setTimeout( function() {
			this.sizeHandleHelper();
		}.createDelegate( this ), 10 );
	},
	
	
	// protected
	onShow : function() {
		ui.Slider.superclass.onShow.apply( this, arguments );
		
		// When the component is shown from a hidden state, re-size the handle helper
		this.sizeHandleHelper();
	},
	
	
	/**
	 * Private method that sizes the slider "helper" element, which will visually "contain" the handles within the actual slider area. 
	 * The original jQuery UI implementation allows the handles to be moved "past" (overlapping) the actual slider area on the left 
	 * and right (because handles are "moved" within the slider by the css 'left' property between 0% and 100%). This extra "helper"
	 * element will be sized to the width of the slider area - the width of the handle, and centered, so that the handles look like 
	 * they ara contained within the slider area, despite this simple %-based positioning.
	 * 
	 * @private
	 * @method sizeHandleHelper
	 */
	sizeHandleHelper : function() {
		// Because this method is run in a setTimeout for the initial sizing, we want to make sure that the Slider hasn't first been destroyed
		// and its element references removed. This can happen if the Slider is (for some reason) destroyed before it initializes in the timeout.
		if( !this.destroyed ) {
			// Size the "handle helper" element so that it is the full width of the slider, minus the handle's width.  This element is centered
			// within the slider area. This way, when the handle's css 'left' property is set to 100%, it's position + 1/2 it's width will make 
			// it look like it is dragged up against the right side of the slider, and vice-versa for the left side. 
			var $sliderEl = this.$sliderEl,
			    $handleHelper = this.$handleHelper,
			    $handles = this.$handles,  // note: may be more than one handle, but they are most likely sized to all be the same width
			    handleWidth = $handles.outerWidth();  // grabs the outer width of the first handle
			
			$handles.css( 'margin-left', -handleWidth / 2 );
			$handleHelper.width( "" ).width( $sliderEl.innerWidth() - handleWidth );
		}
	},
	
	
	
	/**
	 * Method that is run when a slide position has changed. Fires the {@link #change} event.
	 * 
	 * @private
	 * @method onSlideChange
	 */
	onSlideChange : function( evt, ui ) {
		// When the slider has been changed, update the handlePositions array with the values from
		// the event. These values are accurate, as opposed to running the jQuery UI slider "values" method.
		this.handlePositions = ui.values;
		
		this.notifyOfChange();
	},
	
	
	/**
	 * Notifies listeners that the slider has changed its handle positions by firing the {@link #change}
	 * event, and running the {@link ui.DataControl#onDataChange} method of the DataControl mixin.
	 * 
	 * @private
	 * @method notifyOfChange
	 */
	notifyOfChange : function() {
		this.fireEvent( 'change', this, this.getHandlePositions() );
		this.onDataChange();  // call method in DataControl mixin, which fires its 'datachange' event
	},
	
	
	// ---------------------------------
	
	
	/**
	 * Sets the handle positions on the slider.
	 * 
	 * @method setHandlePositions
	 * @param {Number[]} An array of the handle positions. If only one handle, this should be a one element array.
	 */
	setHandlePositions : function( positions ) {
		if( !Kevlar.isArray( positions ) ) {
			positions = [ positions ];
		}
		
		// Store the new handle positions
		this.handlePositions = positions;
		
		// Update the jQuery UI slider instance itself, if it is rendered
		if( this.rendered ) { 
			this.$sliderEl.slider( 'values', positions );
		}
		
		// Notify of a change to event listeners
		this.notifyOfChange();
	},
	
	
	/**
	 * Retrieves the current handle positions on the Slider. 
	 * 
	 * @method getHandlePositions
	 * @return {Number[]} An array of the handle positions. If only one handle, it will be a one element array.
	 */
	getHandlePositions : function() {
		// Always simply return the handlePositions array. Would normally ask for the values from the slider directly using
		// this.$el.slider( 'values' ), but for some reason, it doesn't always report the correct values. So instead, the
		// handlePositions array is updated when the slider's position is changed by the user (the event fires with the correct
		// values), and this method simply returns that array.
		return this.handlePositions;
	},
	
	
	// --------------------------------
	
	// Implementation of ui.DataControl mixin interface
	setData : function() {
		this.setHandlePositions.apply( this, arguments );
	},
	getData : function() {
		return this.getHandlePositions();
	}

} );


// Register the type so it can be created by the string 'Slider' in the manifest
ui.ComponentManager.registerType( 'Slider', ui.Slider );

/**
 * @class ui.toolButtons.CloseButton
 * @extends ui.toolButtons.ToolButton
 * 
 * Renders a "Close" Button, which is a button with an "X" as its icon. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.CloseButton = Kevlar.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element. Defaults to "Close" for this subclass.
	 */
	tooltip: "Close",
	
	
	// protected
	initComponent : function() {
		// determine the primaryIcon config based on the 'size' config
		if( this.size === 'tiny' ) {
			this.primaryIcon = 'jux-icon-x-dkgray-sm';
		} else if( this.size === 'small' ) {
			this.primaryIcon = 'ui-icon-delete';
		} else {
			this.primaryIcon = 'jux-icon-close';
		}
		
		ui.toolButtons.CloseButton.superclass.initComponent.call( this );
	}

} );

// Register the type so it can be created by the string 'CloseButton' in the manifest
ui.ComponentManager.registerType( 'CloseButton', ui.toolButtons.CloseButton );

/**
 * @class ui.toolButtons.DeleteButton
 * @extends ui.toolButtons.ToolButton
 * 
 * Renders a "Delete" Button, which is a small button with an "X" as its icon. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.DeleteButton = Kevlar.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element. Defaults to "Delete" for this subclass.
	 */
	tooltip: "Delete",
	
	
	// protected
	initComponent : function() {
		// determine the primaryIcon config based on the 'size' config
		if( this.size === 'tiny' ) {
			this.primaryIcon = 'jux-icon-x-ltgray-sm';
		} else if( this.size === 'small' ) {
			this.primaryIcon = 'ui-icon-delete';
		} else {
			this.primaryIcon = 'jux-icon-x-circle-lg';
		}
		
		ui.toolButtons.DeleteButton.superclass.initComponent.call( this );
	}

} );

// Register the type so it can be created by the string 'DeleteButton' in the manifest
ui.ComponentManager.registerType( 'DeleteButton', ui.toolButtons.DeleteButton );

/**
 * @class ui.toolButtons.DownButton
 * @extends ui.toolButtons.ToolButton
 * 
 * Renders a "Move Down" Button, which is a small button with a down arrow as its icon. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.DownButton = Kevlar.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element. Defaults to "Move Down" for this subclass.
	 */
	tooltip: "Move Down",
	
	
	// protected
	initComponent : function() {
		// determine the primaryIcon config based on the 'size' config
		if( this.size === 'small' ) {
			this.primaryIcon = 'ui-icon-arrowthick-1-s';
		} else {
			this.primaryIcon = 'jux-icon-arrow-circle-s-lg';
		}
		
		ui.toolButtons.DownButton.superclass.initComponent.call( this );
	}

} );

// Register the type so it can be created by the string 'DownButton' in the manifest
ui.ComponentManager.registerType( 'DownButton', ui.toolButtons.DownButton );

/**
 * @class ui.toolButtons.EditButton
 * @extends ui.toolButtons.ToolButton
 * 
 * Renders an "Edit" Button, which is a small button with a pencil as its icon. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.EditButton = Kevlar.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element. Defaults to "Edit" for this subclass.
	 */
	tooltip: "Edit",
	
	
	// protected
	initComponent : function() {
		// determine the primaryIcon config based on the 'size' config
		if( this.size === 'small' ) {
			this.primaryIcon = 'ui-icon-pencil';
		} else {
			this.primaryIcon = 'ui-icon-pencil-lg';
		}
		
		ui.toolButtons.EditButton.superclass.initComponent.call( this );
	}

} );

// Register the type so it can be created by the string 'EditButton' in the manifest
ui.ComponentManager.registerType( 'EditButton', ui.toolButtons.EditButton );

/**
 * @class ui.toolButtons.HideButton
 * @extends ui.toolButtons.ToolButton
 * 
 * A specialized subclass that renders a "Hide" Button, which is a small button with an eye as its icon, used to allow the toggling of some 
 * item to be shown (visible) or hidden. Also includes functionality for toggling the "visible" and "hidden" states of 
 * the icon on the button, and retrieving which is currently set.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.HideButton = Kevlar.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @hide
	 * @cfg {String} secondaryIcon
	 */
	
	/**
	 * @hide
	 * @cfg {String} tooltip
	 */
 
	
	/**
	 * @cfg {String} buttonState
	 * The initial state that the button is showing.  This can be either "visible" or "hidden". Defaults to "visible", 
	 * meaning for the user that: the item that the button is representing is going to be shown.
	 */
	buttonState : 'visible',
	
	/**
	 * @cfg {String} visibleTooltip
	 * The text to use for the tooltip of the button when the state of the button is "visibile".
	 * Defaults to "Hide" (telling the user that if they click the button, it will go to the "hidden" state).
	 */
	visibleTooltip : "Hide",
	
	/**
	 * @cfg {String} hiddenTooltip
	 * The text to use for the tooltip of the button when the state of the button is "hidden".
	 * Defaults to "Show" (telling the user that if they click the button, it will go to the "visible" state).
	 */
	hiddenTooltip : "Show",
	
	

	/**
	 * @private
	 * @property visibleIconCls
	 * The css class that shows the "visible" state icon.
	 */
	
	/**
	 * @private
	 * @property hiddenIconCls
	 * The css class that shows the "hidden" state icon.
	 */
	
	
	

	// protected
	initComponent : function() {
		if( this.buttonState !== 'visible' && this.buttonState !== 'hidden' ) {
			throw new Error( "Invalid buttonState config. Must be either 'visible' or 'hidden'." );
		}
		
		// determine the "visible" and "hidden" icon css classes based on the 'size' config
		if( this.size === 'small' ) {
			this.visibleIconCls = 'ui-icon-eyeopen';
			this.hiddenIconCls = 'ui-icon-eyeclosed';
		} else {
			this.visibleIconCls = 'jux-icon-show-lg';
			this.hiddenIconCls = 'jux-icon-hide-lg';
		}
		
		// Set the initial icon and set the initial 'title' config based on the buttonState
		if( this.buttonState === 'visible' ) {
			this.primaryIcon = this.visibleIconCls;
			this.tooltip = this.visibleTooltip;
		} else {
			this.primaryIcon = this.hiddenIconCls;
			this.tooltip = this.hiddenTooltip;
		}
		
		// Call superclass initComponent after ToolButton configs have been set
		ui.toolButtons.HideButton.superclass.initComponent.call( this );
	},
	
	
	/**
	 * Extension of onClick template method used to toggle the show/hide state of the button.
	 *
	 * @protected
	 * @method onClick
	 */
	onClick : function() {
		// Toggle the button to the next state
		this.toggleButtonState();
		
		// Call the superclass method
		ui.toolButtons.HideButton.superclass.onClick.apply( this, arguments );
	},
	
	
	/**
	 * Toggles the button's state back and forth, from visible->hidden if it is currently 'visible', or hidden->visible if it
	 * is currently 'hidden'. 
	 * 
	 * @method toggleButtonState
	 */
	toggleButtonState : function() {
		if( this.buttonState === 'visible' ) {
			this.setButtonState( 'hidden' );
		} else {
			this.setButtonState( 'visible' );
		}
	},
	
	
	/**
	 * Sets the button's visible/hidden state.  Accepts the strings 'visible' or 'hidden'.
	 *
	 * @method setButtonState
	 * @param {String} buttonState Either 'visible' or 'hidden'.
	 */
	setButtonState : function( buttonState ) {
		if( buttonState !== 'visible' && buttonState !== 'hidden' ) {
			throw new Error( "Invalid buttonState argument. Must be either 'visible' or 'hidden'." );
		}
		
		this.buttonState = buttonState;
		
		// Modify the state by setting the option on the jQuery UI Button
		if( buttonState === 'visible' ) {
			this.$el.button( 'option', 'icons', { primary: this.visibleIconCls, secondary: null } );
			this.$el.attr( 'title', this.visibleTooltip );
		} else {
			this.$el.button( 'option', 'icons', { primary: this.hiddenIconCls, secondary: null } );
			this.$el.attr( 'title', this.hiddenTooltip );
		}
	},
	
	
	/**
	 * Retrieves the current button state. Will return either 'visible' or 'hidden'.
	 *
	 * @method getButtonState
	 * @return {String} Either 'visible' or 'hidden', depending on the button's current state.
	 */
	getButtonState : function() {
		return this.buttonState;
	}
	 
} );

// Register the type so it can be created by the string 'HideButton' in the manifest
ui.ComponentManager.registerType( 'HideButton', ui.toolButtons.HideButton );

/**
 * @class ui.toolButtons.UpButton
 * @extends ui.toolButtons.ToolButton
 * 
 * Renders a "Move Up" Button, which is a small button with an up arrow as its icon. 
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.toolButtons.UpButton = Kevlar.extend( ui.toolButtons.ToolButton, {
	
	/**
	 * @hide
	 * @cfg {String} primaryIcon
	 */
	
	/**
	 * @cfg {String} tooltip
	 * The text to use as the button's tooltip for when the mouse is hovered over the button. Currently just sets the title 
	 * attribute of the button element. Defaults to "Move Up" for this subclass.
	 */
	tooltip: "Move Up",
	
	
	// protected
	initComponent : function() {
		// determine the primaryIcon config based on the 'size' config
		if( this.size === 'small' ) {
			this.primaryIcon = 'ui-icon-arrowthick-1-n';
		} else {
			this.primaryIcon = 'jux-icon-arrow-circle-n-lg';
		}
		
		ui.toolButtons.UpButton.superclass.initComponent.call( this );
	}

} );

// Register the type so it can be created by the string 'UpButton' in the manifest
ui.ComponentManager.registerType( 'UpButton', ui.toolButtons.UpButton );

/**
 * @class ui.utils.OptionsStore
 * @extends Object
 * 
 * Helper utility class used for making the management of 'options' data easy, for any classes that use this format of data.
 * "Options data" in this context simply means "text/value" pairs, such as used by dropdowns. The purpose of this class 
 * was to not duplicate functionality for classes that use this format of data.
 * 
 * This class is currently used by {@link ui.formFields.DropdownField}, {@link ui.formFields.RadioField}, and {@link ui.ButtonSet}, 
 * which use it for managing the options that they provide.  
 * 
 * @constructor
 * @param {Array/Function} options See the `options` parameter in {@link #setOptions} for accepted formats of this parameter.
 */
/*global Kevlar, ui */
ui.utils.OptionsStore = Kevlar.extend( Object, {
	
	constructor : function( options ) {
		this.setOptions( options || [] );
	},
	
	
	/**
	 * Sets the options for the store. Normalizes the options into an array of objects, where each object
	 * has the properties 'text' and 'value'.  Extra properties may be added however, when following the recommended format (an
	 * array of objects).
	 * 
	 * @method setOptions
	 * @param {Array/Function} options The options for the OptionsStore. If this is a flat array, the values will be used as both the 'value' and 'text'
	 *   of the options.  Ex: <pre><code>[ "Option 1", "Option 2", "Option 3" ]</code></pre>
	 * 
	 *   If you want to customize the value and text separately for each option (recommended), provide an array of objects, where the object has two
	 *   properties: `text` and `value`. 
	 *   Ex: <pre><code>[ { "text": "Option 1", "value": 1 }, { "text": "Option 2", "value": 2 } ]</code></pre>
	 *   
	 *   Extra properties may also be added if needed in this form, and will not be affected by the OptionsStore.  These properties
	 *   may be used by whichever implementation is using the OptionsStore.
	 *   Ex:<pre><code>[ { "text": "Option 1", "value": 1, "cls" : "myCssClass" }, { "text": "Option 2", "value": 2, "cls" : "myCssClass2" } ]</code></pre>
	 * 
	 *   If this config is specified as a function, the function will be executed, and its return will be used as the options. Its return should match one of
	 *   the forms defined above.
	 */
	setOptions : function( options ) {
		// If the options were provided as a function, execute the function and use its return as the options array
		if( typeof options === 'function' ) {
			options = options();
		}
		
		var normalizedOptions = [];
		
		// Backward compatibility: Accept the options as an object where the keys are the text, and the values are the <option> values.
		// Changed this to an array because there is no way guarantee that looping over the properties will iterate them out in the same order 
		// that they were added.
		if( Kevlar.isObject( options ) ) {
			for( var name in options ) {
				if( options.hasOwnProperty( name ) ) {  // filter out any prototype properties, just in case
					normalizedOptions.push( { text: name, value: options[ name ] } );
				}
			}
			
		} else {
			// Options were provided as an array...
			
			// If the options are an array of strings, use them for both the 'text' and the 'value'
			for( var i = 0, numOptions = options.length; i < numOptions; i++ ) {
				var option = options[ i ],
				    normalizedOption = {};
				
				if( typeof option === 'object' ) {
					normalizedOption.value = ( typeof option.value !== 'undefined' ) ? option.value : option.text;  // If no value is specified, use the text as the value.
					normalizedOption.text = option.text;
					
					// Add any extra properties that may have been provided to the normalizedOption object.
					for( var prop in option ) {
						// Filter out the 'text' and 'value' properties (they have been handled above), and filter out any prototype properties
						if( prop !== 'text' && prop !== 'value' && option.hasOwnProperty( prop ) ) {
							normalizedOption[ prop ] = option[ prop ];
						} 
					}
					
				} else {
					// String option: use it for both value and text
					normalizedOption.value = option; 
					normalizedOption.text = option;
				}
				
				normalizedOptions.push( normalizedOption );
			}
		}
		
		// Store the normalized options
		this.options = normalizedOptions;
	},
	
	
	/**
	 * Retrives all of the options objects held by the OptionsStore. Each options object has properties: 'text' and 'value'.
	 * 
	 * @method getOptions
	 * @return {Object[]} An array of the options objects, each of which has properties 'text' and 'value'.
	 */
	getOptions : function() {
		return this.options;
	},
	
	
	/**
	 * Retrieves an option based on its index position (0-based).
	 * 
	 * @method getAtIndex
	 * @param {Number} index
	 * @return {Object} The option object with properties 'text' and 'value', or null if the index was out of range.
	 */
	getAtIndex : function( index ) {
		return this.options[ index ] || null;
	},
	
	
	/**
	 * Retrieves an option based on its `value`. An option object has properties 'text' and 'value'.
	 * 
	 * @method getByValue
	 * @param {Mixed} value
	 * @return {Object} The option object with properties 'text' and 'value', or null if no option was found.
	 */
	getByValue : function( value ) {
		var options = this.options;
			
		for( var i = 0, len = options.length; i < len; i++ ) {
			if( options[ i ].value === value ) {
				return options[ i ];
			}
		}
		return null;  // return null if no option was found
	},
	
	
	/**
	 * Retrieves an option based on its `text`. An option object has properties 'text' and 'value'.
	 * 
	 * @method getByText
	 * @param {String} text
	 * @return {Object} The option object with properties 'text' and 'value', or null if no option was found.
	 */
	getByText : function( text ) {
		var options = this.options;
			
		for( var i = 0, len = options.length; i < len; i++ ) {
			if( options[ i ].text === text ) {
				return options[ i ];
			}
		}
		return null;  // return null if no option was found
	}

} );

/**
 * @class Kevlar.util.DelayedTask
 *
 * <p> The DelayedTask class provides a convenient way to "buffer" the execution of a method,
 * performing setTimeout where a new timeout cancels the old timeout. When called, the
 * task will wait the specified time period before executing. If durng that time period,
 * the task is called again, the original call will be cancelled. This continues so that
 * the function is only called a single time for each iteration.</p>
 * <p>This method is especially useful for things like detecting whether a user has finished
 * typing in a text field. An example would be performing validation on a keypress. You can
 * use this class to buffer the keypress events for a certain number of milliseconds, and
 * perform only if they stop for that amount of time.  Usage:</p><pre><code>
var task = new Kevlar.util.DelayedTask(function(){
	alert(Kevlar.getDom('myInputField').value.length);
});
// Wait 500ms before calling our function. If the user presses another key 
// during that 500ms, it will be cancelled and we'll wait another 500ms.
Kevlar.get('myInputField').on('keypress', function(){
	task.{@link #delay}(500); 
});
 * </code></pre> 
 * <p>Note that we are using a DelayedTask here to illustrate a point. The configuration
 * option `buffer` for {@link Kevlar.util.Observable#addListener addListener/on} will
 * also setup a delayed task for you to buffer events.</p> 
 * @constructor The parameters to this constructor serve as defaults and are not required.
 * @param {Function} fn (optional) The default function to call.
 * @param {Object} scope (optional) The default scope (The <code><b>this</b></code> reference) in which the
 * function is called. If not specified, <code>this</code> will refer to the browser window.
 * @param {Array} args (optional) The default Array of arguments.
 */
/*global Kevlar */
Kevlar.util.DelayedTask = function(fn, scope, args){
	var me = this,
	    id,
	    call = function(){
	        clearInterval(id);
	        id = null;
	        fn.apply(scope, args || []);
		};
		
	/**
	 * Cancels any pending timeout and queues a new one
	 * @param {Number} delay The milliseconds to delay
	 * @param {Function} newFn (optional) Overrides function passed to constructor
	 * @param {Object} newScope (optional) Overrides scope passed to constructor. Remember that if no scope
	 * is specified, <code>this</code> will refer to the browser window.
	 * @param {Array} newArgs (optional) Overrides args passed to constructor
	 */
	me.delay = function(delay, newFn, newScope, newArgs){
		me.cancel();
		fn = newFn || fn;
		scope = newScope || scope;
		args = newArgs || args;
		id = setInterval(call, delay);
	};

	/**
	 * Cancel the last queued timeout
	 */
	me.cancel = function(){
		if(id){
			clearInterval(id);
			id = null;
		}
	};
	
	/**
	 * Determines if there is currently a pending timeout
	 */
	me.isPending = function() {
		return !!id;
	};
	
};

/**
 * @class Kevlar.util.Html
 * @singleton
 * 
 * Utility class for doing image html/text transformations.
 */
/*global Kevlar */
Kevlar.util.Html = {
	
	/**
	 * Converts certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages, and for
	 * using HTML strings within HTML attributes.
	 * 
	 * @method encode
	 * @param {String} value The string to encode
	 * @return {String} The encoded text
	 */
	encode : function( value ) {
		return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
	},
	
	
	/**
	 * Converts certain characters (&, <, >, and ') from their HTML character equivalents.
	 * 
	 * @method decode
	 * @param {String} value The string to decode
	 * @return {String} The decoded text
	 */
	decode : function( value ) {
		return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
	},
	
	
	/**
	 * Returns the html with all tags stripped.
	 * 
	 * @method stripTags
	 * @param {String} v The html to be stripped.
	 * @return {String} The resulting text.
	 */
	stripTags : function(v) {
        return !v ? v : String( v ).replace( /<\/?[^>]+>/gi, "" );
	},
	
	
    /**
     * Replace newlines with &lt;br /&gt; tags
     * 
     * @method nl2br
     * @param {String} text The text to convert newlines into &lt;br /&gt; tags.
     * @return {String} The converted text.
     */
    nl2br : function( text ) {
        return text.replace( /\n/gim, "<br />" );
    }
    
};


