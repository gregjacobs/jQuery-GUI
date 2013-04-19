/*global define */
/*jshint newcap:false */  // For the dynamic constructor: new collectionClass( ... );
define( [
	'require',
	'lodash',
	'Class',
	'data/attribute/Attribute',
	'data/attribute/DataComponent',
	'data/Collection'  // circular dependency, not included in args list
], function( require, _, Class, Attribute, DataComponentAttribute ) {
	
	/**
	 * @class data.attribute.Collection
	 * @extends data.attribute.DataComponent
	 * 
	 * Attribute definition class for an Attribute that allows for a nested {@link data.Collection} value.
	 * 
	 * This class enforces that the Attribute hold a {@link data.Collection Collection} value, or null. However, it will
	 * automatically convert an array of {@link data.Model models} or anonymous data objects into the appropriate 
	 * {@link data.Collection Collection} subclass, using the Collection provided to the {@link #collection} config.
	 * Anonymous data objects in this array will be converted to the model type specified by the {@link #collection collection's} 
	 * {@link data.Collection#model model} config.
	 * 
	 * If the {@link #collection} config is not provided so that automatic data conversion of an array of anonymous objects can
	 * take place, then you must either provide a {@link data.Collection} subclass as the value for the Attribute, or use a custom 
	 * {@link #cfg-set} function to convert any anonymous array into a Collection in the appropriate way. 
	 */
	var CollectionAttribute = Class.extend( DataComponentAttribute, {
			
		/**
		 * @cfg {Array/data.Collection} defaultValue
		 * @inheritdoc
		 * 
		 * Defaults to an empty array, to create an empty Collection of the given {@link #collection} type.
		 */
		//defaultValue : [],  -- Not yet fully implemented on a general level. Can use this in code though.
		
		/**
		 * @cfg {data.Collection/String/Function} collection
		 * 
		 * The specific {@link data.Collection} subclass that will be used in the Collection Attribute. This config is needed
		 * to perform automatic conversion of an array of models or anonymous data objects into the appropriate Collection subclass.
		 * 
		 * This config may be provided as:
		 * 
		 * - A direct reference to a Collection (ex: `myApp.collections.MyCollection`).
		 * - A String which specifies the object path to the Collection, which must be able to be referenced from the global scope. 
		 *   Ex: "myApp.collections.MyCollection".
		 * - A function, which will return a reference to the Collection subclass that should be used. 
		 * 
		 * The reason that this config may be specified as a String or a Function is to allow for "very late binding" to the Collection 
		 * subclass that is used, if the particular {@link data.Collection} subclass is not yet available at the time of Attribute definition.
		 * In this case, the Collection subclass that is used does not need to exist until a value is actually set to the Attribute.
		 * For example, using RequireJS, we may have a circular dependency that needs to be in-line required:
		 *   
		 *     collection : function() {
		 *         return require( 'myApp/collection/MyCollection' );  // will only be resolved once a value is set to the CollectionAttribute
		 *     }
		 */
		
		/**
		 * @cfg {Boolean} embedded
		 * 
		 * Setting this config to true has the parent {@link data.Model Model} treat the child {@link data.Collection Collection} as if it is 
		 * a part of itself. Normally, a child Collection that is not embedded is treated as a "relation", where it is considered as independent 
		 * from the parent Model.
		 * 
		 * What this means is that, when true:
		 * 
		 * - The parent Model is considered as "changed" when a model in the child Collection is changed, or one has been added/removed. This Attribute 
		 *   (the attribute that holds the child collection) is the "change".
		 * - The parent Model's {@link data.Model#change change} event is fired when a model on the child Collection has changed, or one has 
		 *   been added/removed.
		 * - The child Collection's model data is persisted with the parent Collection's data, unless the {@link #persistIdOnly} config is set to true,
		 *   in which case just the child Collection's models' {@link data.Model#idAttribute ids} are persisted with the parent Model.
		 */
		embedded : false,
		
		/**
		 * @cfg {Boolean} persistIdOnly
		 * 
		 * In the case that the {@link #embedded} config is true, set this to true to only have the {@link data.Model#idAttribute id} of the embedded 
		 * collection's models be persisted, rather than all of the collection's model data. Normally, when {@link #embedded} is false (the default), 
		 * the child {@link data.Collection Collection} is treated as a relation, and only its model's {@link data.Model#idAttribute ids} are persisted.
		 */
		persistIdOnly : false,
		
		
		// -------------------------------
		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			this._super( arguments );

			// <debug>
			// Check if the user did not provide a `collection` config, or the value is undefined (which means that they specified
			// a class that either doesn't exist, or doesn't exist yet, and we should give them an error to alert them).
			if( 'collection' in this && this.collection === undefined ) {
				throw new Error( "The `collection` config provided to a Collection Attribute with the name '" + this.getName() + "' either doesn't exist, or doesn't " +
				                 "exist just yet. Consider using the String or Function form of the `collection` config for late binding, if needed." );
			}
			// </debug>
		},
		
		
		/**
		 * Overridden method used to determine if two collections are equal.
		 * @inheritdoc
		 * 
		 * @param {Mixed} oldValue
		 * @param {Mixed} newValue
		 * @return {Boolean} True if the values are equal, and the Model should *not* consider the new value as a 
		 *   change of the old value, or false if the values are different, and the new value should be taken as a change.
		 */
		valuesAreEqual : function( oldValue, newValue ) {
			// If the references are the same, they are equal. Many collections can be made to hold the same models.
			return oldValue === newValue;
		},
		
		
		/**
		 * Overridden `beforeSet` method used to convert any arrays into the specified {@link #collection} subclass. The array
		 * will be provided to the {@link #collection} subclass's constructor.
		 * 
		 * @inheritdoc
		 */
		beforeSet : function( model, newValue, oldValue ) {
			// Now, normalize the newValue to an object, or null
			newValue = this._super( arguments );
			
			if( newValue !== null ) {
				var collectionClass = this.resolveCollectionClass();
				
				if( newValue && typeof collectionClass === 'function' && !( newValue instanceof collectionClass ) ) {
					newValue = new collectionClass( newValue );
				}
			}
			
			return newValue;
		},
		
		
		/**
		 * Overridden `afterSet` method used to subscribe to add/remove/change events on a set child {@link data.Collection Collection}.
		 * 
		 * @inheritdoc
		 */
		afterSet : function( model, value ) {
			var Collection = require( 'data/Collection' );
			
			// Enforce that the value is either null, or a data.Collection
			if( value !== null && !( value instanceof Collection ) ) {
				throw new Error( "A value set to the attribute '" + this.getName() + "' was not a data.Collection subclass" );
			}
			
			return value;
		},
		
		
		/**
		 * Utility method used to retrieve the normalized {@link data.Collection} subclass provided by the {@link #collection} config.
		 * 
		 * - If the {@link #collection} config was provided directly as a class (constructor function), this class is simply returned.
		 * - If the {@link #collection} config was a String, resolve the class (constructor function) by walking down the object tree 
		 *   from the global object.
		 * - If the {@link #collection} config was a Function, resolve the class (constructor function) by executing the function, 
		 *   and taking its return value as the class.
		 * 
		 * If the {@link #collection} config was a String or Function, the resolved class is cached back into the {@link #collection} config
		 * for subsequent calls.
		 * 
		 * @protected
		 * @return {Function} The class (constructor function) for the {@link data.Collection} subclass referenced by the {@link #collection}
		 *   config.
		 */
		resolveCollectionClass : function() {
			var collectionClass = this.collection,
			    Collection = require( 'data/Collection' );  // the Collection constructor function
			
			// Normalize the collectionClass
			if( typeof collectionClass === 'string' ) {
				this.collection = collectionClass = this.resolveGlobalPath( collectionClass );  // changes the string "a.b.c" into the value at `window.a.b.c`
				
				// <debug>
				if( !collectionClass ) {
					throw new Error( "The string value `collection` config did not resolve to a Collection subclass for attribute '" + this.getName() + "'" );
				}
				// </debug>
			} else if( typeof collectionClass === 'function' && !Class.isSubclassOf( collectionClass, Collection ) ) {  // it's not a data.Collection subclass, so it must be an anonymous function. Run it, so it returns the Collection reference we need
				this.collection = collectionClass = collectionClass();
				
				// <debug>
				if( !collectionClass ) {
					throw new Error( "The function value `collection` config did not resolve to a Collection subclass for attribute '" + this.getName() + "'" );
				}
				// </debug>
			}
			
			return collectionClass;
		}
		
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'collection', CollectionAttribute );
	
	return CollectionAttribute;
	
} );