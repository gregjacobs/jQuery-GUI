/*global require */
require( [
	'jquery',
	
	'gui/Container',
	'gui/window/Window',
	
	// Components created using `type` property
	'gui/Component',
	'gui/panel/Panel',
	'gui/layout/Hbox'
], function( $, Container, Window ) {
	
	var container = new Container( {
		items : [
			{
				type : 'container',
				layout : 'hbox',
				items : [
					{ type: 'panel', title: "Basic Panel", html: "Panel Body", width: 200, height: 150, cls: 'marginComponent' },
					{ type: 'panel', title: "Masked Panel", html: "Panel Body", width: 200, height: 150, masked: true, maskConfig: { msg: "Loading...", spinner: true }, cls: 'marginComponent' },
					{ type: 'component', id: 'windowPlaceholder', width: 200, height: 150, cls: 'marginComponent relative' }  // placeholder for Window
				]
			}
		]
	} );
	
	var window = new Window( {
		title  : "Window",
		html   : "Window Body",
		width  : 200,
		height : 150
	} );
	
	$( document ).ready( function() {
		container.render( '#contentArea' );
		
		window.render( container.findById( 'windowPlaceholder' ).getEl() );
		window.show();
	} );
	
} );