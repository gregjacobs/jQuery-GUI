/*global define */
define( [
	'lodash',
	'Class',
	'jqc/Container',
	'jqc/ComponentManager'
], function( _, Class, Container, ComponentManager ) {
	
	/**
	 * @class jqc.ComponentQuery
	 * @extends Object
	 * @singleton
	 * 
	 * Singleton class which implements a simple querying mechanism in order to find components.
	 * 
	 * At this time, the selectors that are available are limited to:
	 * 
	 * - **id** : For referencing a Component by {@link jqc.Component#id}. Example: "#myComponent".
	 * - **type** : For referencing one or more Components by their string 'type' name. Example: "button" would
	 *   find all {@link jqc.button.Button} instances, and any subclasses of Button instances. It will also find
	 *   instances which implementing the type name as a mixin.
	 * 
	 * No child or descendant selectors are available yet at this time, but this class will be extended to do
	 * so in the near future.
	 */
	var ComponentQuery = Class.extend( Object, {
		
		/**
		 * @param {String} selector The selector to query components by.
		 * @param {jqc.Component/jqc.Component[]} context The component(s) to query the `selector` for. If one
		 *   or more of the components match the selector, they will be included. Components that are 
		 *   {@link jqc.Container Containers} will be recursively queried to determine if their descendant 
		 *   components match the `selector` as well.
		 */
		query : function( selector, context ) {
			context = [].concat( context );  // normalize to array
			
			var workingSet = _.flatten( context, /* isShallow */ true ),
			    i, len;
			
			// Compile the working set of components
			for( i = 0, len = context.length; i < len; i++ ) {
				if( context[ i ] instanceof Container ) {
					workingSet.push.apply( workingSet, this.getDescendants( context[ i ] ) );
				}
			}
			
			var result;
			if( selector.charAt( 0 ) === '#' ) {  // ID selector
				result = this.filterById( workingSet, selector.substr( 1 ) );
			} else {
				result = this.filterByType( workingSet, selector );
			}
			
			return _.unique( result );  // return only the unique set of components (i.e. duplicates removed)
		},
		
		
		/**
		 * Retrieves the descendants of the provided {@link jqc.Container Container}.
		 * 
		 * @protected
		 * @param {jqc.Container} container
		 * @param {jqc.Component[]} All of the descendant components of the `container`. 
		 */
		getDescendants : function( container ) {
			var items = container.getItems(),
			    result = [];
			
			for( var i = 0, len = items.length; i < len; i++ ) {
				var item = items[ i ];
				
				result.push( item );
				if( item instanceof Container ) {
					result.push.apply( result, this.getDescendants( item ) );
				}
			}
			return result;
		},
		
		
		/**
		 * Filters the given set of `components` by returning only the ones that have an {@link jqc.Component#id id}
		 * matching the provided `id`.
		 * 
		 * @protected
		 * @param {jqc.Component[]} components
		 * @param {String} id The ID of the component to return.
		 * @return {jqc.Component[]} The filtered array of components.
		 */
		filterById : function( components, id ) {
			return _.filter( components, function( component ) { return ( component.getId() === id ); } );
		},
		
		
		/**
		 * Filters the given set of `components` by returning only the ones that are of the `type` provided.
		 * The `type` name is resolved to the component's class, in which each component is tested to be an
		 * instance of that class (i.e. a direct instance of that class, an instance of a subclass of that
		 * type, or an instance of a class that implements the `type` as a mixin).
		 * 
		 * @protected
		 * @param {jqc.Component[]} components
		 * @param {String} type The component `type`, which will be resolved to a component class to test each
		 *   component against.
		 * @return {jqc.Component[]} The filtered array of components.
		 */
		filterByType : function( components, type ) {
			// Resolve `type` string to its corresponding class
			type = ComponentManager.getType( type );
			
			var _Class = Class;  // local ref to be closer to the below closure
			return _.filter( components, function( component ) { return _Class.isInstanceOf( component, type ); } );
		}
		
	} );
	
	
	// Return singleton instance
	return new ComponentQuery();
	
} );