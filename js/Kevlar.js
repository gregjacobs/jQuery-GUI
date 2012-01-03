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
