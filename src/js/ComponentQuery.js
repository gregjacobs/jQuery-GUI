/*global define */
define( [
	'lodash',
	'Class',
	'gui/Container',
	'gui/ComponentManager'
], function( _, Class, Container, ComponentManager ) {
	
	/**
	 * @class gui.ComponentQuery
	 * @extends Object
	 * @singleton
	 * 
	 * Singleton class which implements a simple querying mechanism in order to find components.
	 * 
	 * At this time, the selectors that are available are limited to:
	 * 
	 * - **id** : For referencing a Component by {@link gui.Component#id}. Example: "#myComponent".
	 * - **type** : For referencing one or more Components by their string 'type' name. Example: "button" would
	 *   find all {@link gui.button.Button} instances, and any subclasses of Button instances. It will also find
	 *   instances which implementing the type name as a mixin.
	 * 
	 * No child or descendant selectors are available yet at this time, but this class will be extended to do
	 * so in the near future.
	 */
	var ComponentQuery = Class.extend( Object, {
		
		/**
		 * Queries for components in the `context` array of components, using the `selector`. Returns the array of matching
		 * components. See the description of this class for valid selectors.
		 * 
		 * @param {String} selector The selector to query components by.
		 * @param {gui.Component/gui.Component[]} context The component(s) to query the `selector` for. If one
		 *   or more of the components match the selector, they will be included. Components that are 
		 *   {@link gui.Container Containers} will be recursively queried to determine if their descendant 
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
			
			return this.filterBySelector( workingSet, selector );
		},
		
		
		/**
		 * Determines if a given `component` is matched by the provided `selector`.
		 * 
		 * @param {gui.Component} component The Component(s) to test.
		 * @param {String} selector The selector string to test the `component` against.
		 * @return {Boolean} `true` if the Component matches the selector, `false` otherwise.
		 */
		is : function( component, selector ) {
			var components = [ component ];
			return ( this.filterBySelector( components, selector ).length === 1 );  // returns true if the length is still 1 after applying the selector as a filter  
		},
		
		
		/**
		 * Applies the given `selector` against a set of `components`. The components array will be filtered based
		 * on the selector, and the resulting array returned.
		 * 
		 * @protected
		 * @param {gui.Component[]} The list of components which is to be filtered by the selector.
		 * @param {String} selector The selector string to apply to the set of components.
		 * @return {gui.Component[]} The unique set of Components that matched the selector. Duplicates are removed.
		 */
		filterBySelector : function( components, selector ) {
			if( selector.charAt( 0 ) === '#' ) {  // ID selector
				components = this.filterById( components, selector.substr( 1 ) );
			} else {
				components = this.filterByType( components, selector );
			}
			return _.unique( components );  // return only the unique set of components (i.e. duplicates removed)
		},
		
		
		/**
		 * Filters the given set of `components` by returning only the ones that have an {@link gui.Component#id id}
		 * matching the provided `id`.
		 * 
		 * @protected
		 * @param {gui.Component[]} components
		 * @param {String} id The ID of the component to return.
		 * @return {gui.Component[]} The filtered array of components.
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
		 * If the `type` provided is not a registered type name, then an empty array is returned, as no component
		 * could possibly match it. This is done instead of throwing an error for the case that a certain type has 
		 * not yet been loaded in yet when using the {@link #query} or {@link #is} methods, or when a
		 * {@link gui.app.Controller} listens for events on a certain component type which hasn't been loaded yet.
		 * 
		 * @protected
		 * @param {gui.Component[]} components
		 * @param {String} type The component `type`, which will be resolved to a component class to test each
		 *   component against.
		 * @return {gui.Component[]} The filtered array of components.
		 */
		filterByType : function( components, type ) {
			if( !ComponentManager.hasType( type ) ) {
				return [];
				
			} else {
				// Resolve `type` string to its corresponding class
				type = ComponentManager.getType( type );
				
				var _Class = Class;  // local ref to be closer to the below closure
				return _.filter( components, function( component ) { return _Class.isInstanceOf( component, type ); } );
			}
		},
		
		
		/**
		 * Retrieves the descendants of the provided {@link gui.Container Container}.
		 * 
		 * @protected
		 * @param {gui.Container} container
		 * @param {gui.Component[]} All of the descendant components of the `container`. 
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
		}
		
	} );
	
	
	// Return singleton instance
	return new ComponentQuery();
	
} );