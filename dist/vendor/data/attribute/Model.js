/*global define */
/*jshint newcap:false */  // For the dynamic constructor: new modelClass( ... );
define( [
	'require',
	'lodash',
	'Class',
	'data/attribute/Attribute',
	'data/attribute/DataComponent',
	'data/Model'  // circular dependency, not included in args list
], function( require, _, Class, Attribute, DataComponentAttribute ) {
	
	/**
	 * @class data.attribute.Model
	 * @extends data.attribute.DataComponent
	 * 
	 * Attribute definition class for an Attribute that allows for a nested {@link data.Model} value.
	 * 
	 * This class enforces that the Attribute hold a {@link data.Model Model} value, or null. However, it will
	 * automatically convert an anonymous data object into the appropriate {@link data.Model Model} subclass, using
	 * the Model constructor function (class) provided to the {@link #model} config. 
	 * 
	 * Otherwise, you must either provide a {@link data.Model} subclass as the value, or use a custom {@link #cfg-set} 
	 * function to convert any anonymous object to a Model in the appropriate way. 
	 */
	var ModelAttribute = Class.extend( DataComponentAttribute, {
		
		/**
		 * @cfg {data.Model/String/Function} model
		 * 
		 * The specific {@link data.Model} subclass that will be used in the Model Attribute. This config can be provided
		 * to perform automatic conversion of anonymous data objects into the appropriate {@link data.Model Model} subclass.
		 * 
		 * This config may be provided as:
		 * 
		 * - A direct reference to a Model (ex: `myApp.models.MyModel`).
		 * - A String which specifies the object path to the Model, which must be able to be referenced from the global scope. 
		 *   Ex: "myApp.models.MyModel".
		 * - A function, which will return a reference to the Model subclass that should be used. 
		 * 
		 * The reason that this config may be specified as a String or a Function is to allow for "very late binding" to the Model 
		 * subclass that is used, if the particular {@link data.Model} subclass is not yet available at the time of Attribute definition.
		 * In this case, the Model subclass that is used does not need to exist until a value is actually set to the Attribute.
		 * For example, using RequireJS, we may have a circular dependency that needs to be in-line required:
		 *   
		 *     model : function() {
		 *         return require( 'myApp/model/MyOtherModel' );  // will only be resolved once a value is set to the ModelAttribute
		 *     }
		 */
		
		/**
		 * @cfg {Boolean} embedded
		 * 
		 * Setting this config to true has the parent {@link data.Model Model} treat the child {@link data.Model Model} as if it is a part of itself. 
		 * Normally, a child Model that is not embedded is treated as a "relation", where it is considered as independent from the parent Model.
		 * 
		 * What this means is that, when true:
		 * 
		 * - The parent Model is considered as "changed" when an attribute in the child Model is changed. This Attribute (the attribute that holds the child
		 *   model) is the "change".
		 * - The parent Model's {@link data.Model#change change} event is fired when an attribute on the child Model has changed.
		 * - The child Model's data is persisted with the parent Model's data, unless the {@link #persistIdOnly} config is set to true,
		 *   in which case just the child Model's {@link data.Model#idAttribute id} is persisted with the parent Model.
		 */
		embedded : false,
		
		/**
		 * @cfg {Boolean} persistIdOnly
		 * 
		 * In the case that the {@link #embedded} config is true, set this to true to only have the {@link data.Model#idAttribute id} of the embedded 
		 * model be persisted, rather than all of the Model data. Normally, when {@link #embedded} is false (the default), the child {@link data.Model Model}
		 * is treated as a relation, and only its {@link data.Model#idAttribute id} is persisted.
		 */
		persistIdOnly : false,
		
		
		// -------------------------------
		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			this._super( arguments );

			// <debug>
			// Check if the user provided a `model`, but the value is undefined. This means that they specified
			// a class that either doesn't exist, or doesn't exist yet, and we should give them a warning.
			if( 'model' in this && this.model === undefined ) {
				throw new Error( "The `model` config provided to a Model Attribute with the name '" + this.getName() + "' either doesn't exist, or doesn't " +
				                 "exist just yet. Consider using the String or Function form of the `model` config for late binding, if needed." );
			}
			// </debug>
		},
		
		
		/**
		 * Overridden method used to determine if two models are equal.
		 * 
		 * @inheritdoc
		 * @param {Mixed} oldValue
		 * @param {Mixed} newValue
		 * @return {Boolean} True if the values are equal, and the Model should *not* consider the new value as a 
		 *   change of the old value, or false if the values are different, and the new value should be taken as a change.
		 */
		valuesAreEqual : function( oldValue, newValue ) {
			// We can't instantiate two different Models with the same id that have different references, so if the references are the same, they are equal
			return oldValue === newValue;
		},
		
		
		/**
		 * Overridden `beforeSet` method used to convert any anonymous objects into the specified {@link #model} subclass. The anonymous 
		 * object will be provided to the {@link #model} subclass's constructor.
		 * 
		 * @inheritdoc
		 */
		beforeSet : function( model, newValue, oldValue ) {
			// Now, normalize the newValue to an object, or null
			newValue = this._super( arguments );
			
			if( newValue !== null ) {
				var modelClass = this.resolveModelClass();
				
				if( newValue && typeof modelClass === 'function' && !( newValue instanceof modelClass ) ) {
					newValue = new modelClass( newValue );
				}
			}
			
			return newValue;
		},
		
		
		/**
		 * Overridden `afterSet` method used to subscribe to change events on a set child {@link data.Model Model}.
		 * 
		 * @inheritdoc
		 */
		afterSet : function( model, value ) {
			var Model = require( 'data/Model' );
			
			// Enforce that the value is either null, or a data.Model
			if( value !== null && !( value instanceof Model ) ) {
				throw new Error( "A value set to the attribute '" + this.getName() + "' was not a data.Model subclass" );
			}
			
			return value;
		},
		
		
		/**
		 * Utility method used to retrieve the normalized {@link data.Model} subclass provided by the {@link #model} config.
		 * 
		 * - If the {@link #model} config was provided directly as a class (constructor function), this class is simply returned.
		 * - If the {@link #model} config was a String, resolve the class (constructor function) by walking down the object tree 
		 *   from the global object.
		 * - If the {@link #model} config was a Function, resolve the class (constructor function) by executing the function, 
		 *   and taking its return value as the class.
		 * 
		 * If the {@link #model} config was a String or Function, the resolved class is cached back into the {@link #model} config
		 * for subsequent calls.
		 * 
		 * @protected
		 * @return {Function} The class (constructor function) for the {@link data.Model} subclass referenced by the {@link #model}
		 *   config.
		 */
		resolveModelClass : function() {
			var modelClass = this.model,
			    Model = require( 'data/Model' );  // the Model constructor function
			
			if( typeof modelClass === 'string' ) {
				this.model = modelClass = this.resolveGlobalPath( modelClass );  // changes the string "a.b.c" into the value at `window.a.b.c`
				
				// <debug>
				if( !modelClass ) {
					throw new Error( "The string value `model` config did not resolve to a Model subclass for attribute '" + this.getName() + "'" );
				}
				// </debug>
			} else if( typeof modelClass === 'function' && !Class.isSubclassOf( modelClass, Model ) ) {  // it's not a data.Model subclass, so it must be an anonymous function. Run it, so it returns the Model reference we need
				this.model = modelClass = modelClass();
				
				// <debug>
				if( !modelClass ) {
					throw new Error( "The function value `model` config did not resolve to a Model subclass for attribute '" + this.getName() + "'" );
				}
				// </debug>
			}
			
			return modelClass;
		}
		
	} );
	
	
	// Register the Attribute type
	Attribute.registerType( 'model', ModelAttribute );
	
	return ModelAttribute;
	
} );