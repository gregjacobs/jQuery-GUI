/**
 * @class Kevlar.util.Object
 * @singleton
 * 
 * Utility class for methods relating to Object functionality.
 */
/*global Kevlar */
/*jslint forin:true */
Kevlar.util.Object = {
	
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
		
		// Non objects aren't passed by reference, so just send it back.
		if( typeof obj !== 'object' || obj === null ) {
			return obj;
		}
		
		// If the type is one of the built in classes that has a copy constructor, use that
		switch( obj.constructor ) {
			case Date : case RegExp : case String : case Number : case Boolean :
				return new obj.constructor( obj );
		}
		
		var c = new obj.constructor(); 
		
		// copy properties owned by the object (do not copy prototype properties)
		for( var p in obj ) {
			if( obj.hasOwnProperty( p ) ) {
				c[p] = deep ? Kevlar.util.Object.clone( obj[p], true ) : obj[p];  // note: no 'this' reference (as in this.clone()), for friendly out of scope calls
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
			// Double equals on a and b == null, but strict comparison on the actual comparison of the falsy's
			if( a == null || b == null ) { return a === b; }
			
			// Arrays have to be handled separately... Otherwise {} could be considered the same as []
			if( Kevlar.isArray( a ) !== Kevlar.isArray( b ) ) {
				return false;
			}
			
			var className = Object.prototype.toString.call( a );
			if( className != Object.prototype.toString.call( b ) ) { return false; }
			switch( className ) {
				case '[object String]' :
					return a === String( b );
					
				case '[object Number]' :
					return a !== +a ? b !== +b : (a === 0 ? 1 / a === 1 / b : a === +b);
					
				case '[object Date]' : 
				case '[object Boolean]' :
					return +a === +b;
					
				case '[object RegExp]' :
					return a.source === b.source &&
					       a.global === b.global &&
					       a.multiline === b.multiline &&
					       a.ignoreCase === b.ignoreCase;
			}
			
			
			// Make sure there are the same number of keys in each object
			var objLength = Kevlar.util.Object.length;  // no 'this' reference for friendly out of scope calls
			if( objLength( a ) !== objLength( b ) ) { return false; }
			
			for( var p in a ) {
				if(typeof(a[p]) !== typeof(b[p])) { return false; }
				if((a[p]===null) !== (b[p]===null)) { return false; }
				switch (typeof(a[p])) {
					case 'undefined':
						if (typeof(b[p]) != 'undefined') { return false; }
						break;
					case 'object':
						if( a[p]!==null && b[p]!==null && ( a[p].constructor.toString() !== b[p].constructor.toString() || ( deep ? !Kevlar.util.Object.isEqual(a[p], b[p] ) : a[p] !== b[p] ) ) ) {  // NOTE: full call to Kevlar.util.Object.isEqual (instead of this.isEqual) to allow for friendly out-of-scope calls 
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
	 * Returns the number of properties that belong to a given object. Does not include
	 * the number of properties on the object's prototype.
	 * 
	 * @method length
	 * @param {Object} obj
	 * @return {Number}
	 */
	length: function( obj ) {
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
	},
	
	
	/**
	 * Takes each of the keys (property names) of an object, and returns them in an array.
	 * 
	 * @method keysToArray
	 * @param {Object} obj
	 * @return {String[]} An array of the key (property) names.
	 */
	keysToArray : function( obj ) {
		var arr = [],
		    key;
		    
		for( key in obj ) {
			if( obj.hasOwnProperty( key ) ) {
				arr.push( key );
			}
		}
		return arr;
	}
	
};