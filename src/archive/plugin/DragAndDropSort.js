/**
 * @class ui.plugin.DragAndDropSort
 * @extends ui.plugin.Plugin
 * 
 * Plugin that can be added to any {@link ui.Container} to make the Container's items drag and drop sortable. 
 * 
 * When a {@link ui.Component Component} is dragged, its element receieves the special "ui-dragged" CSS class, to allow for different
 * styling of the dragged Component.
 * 
 * Note that individual {@link ui.Component Components} within the Container may be prevented from being sorted by setting the 
 * {@link ui.Component#dragAndDropSortable dragAndDropSortable} config to `false` on them.
 * 
 * @constructor
 * @param {Object} config The configuration options for the plugin, specified in an object (hash).
 */
/*global Class, Jux, ui */
ui.plugin.DragAndDropSort = Class.extend( ui.plugin.Plugin, {
	
	/**
	 * @cfg {String} itemsSelector
	 * The selector that specifies which HTMLElements inside the Container should be sortable. Defaults to: "> *:not( [data-dragAndDropSortable="false"] )" 
	 * (for all children that haven't had the `data-dragAndDropSortable="false"` attribute added).
	 * 
	 * In terms of a {@link ui.Container}, this will allow every child {@link ui.Container#items item} ({@link ui.Component}) to be sortable by default. 
	 * The `data-dragAndDropSortable="false"` attribute is added to components which have been configured with the
	 * {@link ui.Component#dragAndDropSortable dragAndDropSortable} config set to `false` (making them un-draggable).
	 *   
	 * This config can be specified, for example, to ignore other items based on, for example, a css class name. It would look something like this:
	 * `"> *:not( .ignore-class )"`. However, it is not recommended that you change this selector, or at least if you do, keep the default value of
	 * this config as part of your custom selector, so that the {@link ui.Component#dragAndDropSortable dragAndDropSortable} config continues to function.
	 */
	itemsSelector : '> *:not( [data-dragAndDropSortable="false"] )',

	/**
	 * @cfg {String} axis
	 * Defines if items can be dragged only horizontally or vertically. Possible values: 'x', 'y'.
	 */
	axis : false,
	
	
	/**
	 * @private
	 * @property {ui.Component} draggedItem
	 * 
	 * Private variable that will keep track of the item that is being dragged for drag and drop operations.
	 */
	draggedItem : null,
	
	
	/**
	 * Initializes the DragAndDropSort plugin. This method is called by the Container that the plugin
	 * is added to, and should not be called directly.
	 * 
	 * @method init
	 * @param {ui.Container} container
	 */
	init : function( container ) {
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
		    $contentEl = container.getLayoutTarget();  // only make the Container's "content area" have draggable items
		
		$contentEl.addClass( 'juxUI-draggable' );
		$contentEl.sortable( {
			containment : 'parent',
			tolerance   : 'pointer',
			items       : this.itemsSelector,
			axis        : this.axis,
			
			start : function( event, ui ) {
				// On start, grab a reference to the ui.Component instance that is being dragged
				var idx = $contentEl.children().index( ui.item );  // find the index of the dragged element,
				this.draggedItem = container.getItemAt( idx );     // and use it to retrieve the ui.Component
				
				// Add the "dragged" CSS class to the dragged component
				this.draggedItem.addCls( 'ui-dragged' );
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
				
				// Remove the "dragged" CSS class from the dragged component
				this.draggedItem.removeCls( 'ui-dragged' );
				
				this.draggedItem = null;
				
				// return false;  -- purposefully commented. See above note
			}.createDelegate( this )
		} );
	}
	
} );