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