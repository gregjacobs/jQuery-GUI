(function() {
	
	var files = [
		'jqc/Component',
		'jqc/ComponentManager',
		'jqc/Container',
		'jqc/Image',
		'jqc/Jqc',
		'jqc/Label',
		'jqc/Mask',
		'jqc/Overlay',
		'jqc/Viewport',
		'jqc/anim/Animation',
		'jqc/button/Button',
		'jqc/form/field/Checkbox',
		'jqc/form/field/Dropdown',
		'jqc/form/field/Field',
		'jqc/form/field/Hidden',
		'jqc/form/field/Radio',
		'jqc/form/field/Text',
		'jqc/form/field/TextArea',
		'jqc/layout/Auto',
		'jqc/layout/Card',
		'jqc/layout/Card.SwitchTransition',
		'jqc/layout/Card.Transition',
		'jqc/layout/Column',
		'jqc/layout/Fit',
		'jqc/layout/HBox',
		'jqc/layout/Layout',
		'jqc/layout/VBox',
		'jqc/panel/Panel',
		'jqc/panel/ToolButton',
		'jqc/plugin/Plugin',
		'jqc/template/LoDash',
		'jqc/template/Template',
		'jqc/util/Css',
		'jqc/util/Html',
		'jqc/util/OptionsStore',
		'jqc/view/Collection',
		'jqc/view/Model',
		'jqc/window/Window'
	];
	
	return {
		baseUrl: '.',
		out: '../../dist/js/jqc-all.js',
		
		paths : {
			// Dependencies
			'jquery'             : 'empty:',
			'jquery-ui.position' : 'empty:',
			'lodash'             : 'empty:',
			'Class'              : 'empty:',
			'Observable'         : 'empty:',
			'data'               : 'empty:',
			
			// jQuery-Component Library
			'jqc' : '.'
		},
		
		logLevel: 2,  // 0=trace, 1=info, 2=warn, 3=error, 4=silent
		optimize: 'none',
		
		include : files,       // include all files, and
		insertRequire : files  // insert a require() statement at the end of the build file to get all of them
		                       // to execute and initialize, so that classes can be instantiated lazily by their `type`
	};
	
}())