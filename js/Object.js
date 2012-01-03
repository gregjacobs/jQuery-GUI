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