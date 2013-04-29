/*global define */
define( [
	'jqc/Container',
	'jqc/panel/Panel',
	'jqc/layout/Layout'
], function( Container, Panel, Layout ) {
	
	/**
	 * @class jqc.layout.Accordion
	 * @extends jqc.layout.Layout
	 * @alias layout.accordion
	 * 
	 * An accordion layout for {@link jqc.panel.Panel Panels}. The {@link #container} using this particular layout must
	 * have all child components ({@link jqc.Container#items items}) as either {@link jqc.panel.Panel} instances, or Panel
	 * subclasses.
	 * 
	 *     @example
	 *     require( [ 
	 *         'jqc/Container',
	 *         'jqc/panel/Panel',
	 *         'jqc/layout/Accordion'
	 *     ], function( Container ) {
	 *         
	 *         var container = new Container( {
	 *             renderTo: 'body',
	 *             
	 *             layout: 'accordion',
	 *             items : [
	 *                 {
	 *                     type  : 'panel',
	 *                     
	 *                     title : "Panel 1",
	 *                     html  : "Panel 1 Content"
	 *                 },{
	 *                     type  : 'panel',
	 *                     
	 *                     title : "Panel 2",
	 *                     html  : "Panel 2 Content"
	 *                 },{
	 *                     type  : 'panel',
	 *                     
	 *                     title : "Panel 3",
	 *                     html  : "Panel 3 Content"
	 *                 }
	 *             ]
	 *         } );
	 *         
	 *     } );
	 * 
	 * This class is usually not meant to be instantiated directly, but created by its layout type name 'accordion'.
	 */
	var AccordionLayout = Layout.extend( {
		
		/**
		 * @cfg {Number/jqc.panel.Panel} activeItem
		 * 
		 * The initially active (expanded) item. Defaults to expanding the first Panel. Set to `null` to initially
		 * run the layout with all Panels collapsed.
		 * 
		 * - If providing a number, it is the index of the Panel to expand.
		 * - If providing a Panel, it must be the instantiated {@link jqc.panel.Panel} instance; not an anonymous 
		 *   configuration object. The Panel must also exist in the {@link #container}.
		 */
		activeItem : 0,
		
		
		/**
		 * @protected
		 * @property {Object} configuredMap
		 * 
		 * A map of Component {@link jqc.Component#getUuid uuid's} -> 
		 */
		
		
		/**
		 * Layout implementation for the AccordionLayout. 
		 * 
		 * @protected
		 * @param {jqc.Component[]} childComponents The child components that should be rendered and laid out.
		 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
		 */
		onLayout : function( childComponents, $targetEl ) {
			this._super( arguments );
			
			for( var i = 0, len = childComponents.length; i < len; i++ ) {
				var childComponent = childComponents[ i ];
				
				// <debug>
				if( !( childComponent instanceof Panel ) ) {
					throw new Error( "A child component of a Container configured with an Accordion layout was not a Panel or Panel subclass" );
				}
				// </debug>
				
				
				
				// Render the child component (note: it will only be rendered if it is not yet rendered, or not in the correct position in the $targetEl)
				this.renderComponent( childComponents[ i ], $targetEl, { position: i } );
			}
		},
		
		
		/**
		 * 
		 */
		
	} );
	
	
	Container.registerLayout( 'accordion', AccordionLayout );

	return AccordionLayout;
	
} );