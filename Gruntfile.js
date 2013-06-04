/*global require, module */
/*jshint devel:true */
var execFile = require( 'child_process' ).execFile;

module.exports = function( grunt ) {

	// Register main tasks
	grunt.registerTask( 'default', "Default task runs JSHint and then builds the project.", [ 'build' ] );
	grunt.registerTask( 'build', "Builds the distribution JavaScript files, which will be located in dist/.",
		[ 'jshint', 'requirejs:compile', 'copy:afterRequirejs', 'concat:afterRequirejs', 'uglify:dist' ] );
	grunt.registerTask( 'doc', "Builds the JavaScript documentation.", [ 'build', 'compileDocs' ] );
	
	
	// Register sub-tasks. These aren't meant to be called directly, but are used as part of the main tasks.
	grunt.registerTask( 'compileDocs', compileDocsTask );
	
	
	// -----------------------------------
	
	// Plugin Configurations
	
	var banner = [
		'/*!',
		' * <%= pkg.name %>',
		' * Version <%= pkg.version %>',
		' *',
		' * Copyright(c) 2013 Gregory Jacobs.',
		' * MIT Licensed. http://www.opensource.org/licenses/mit-license.php',
		' *',
		' * <%= pkg.homepage %>',
		' */\n'
	].join( '\n' );
	
	
	/*
	 * Put together the list of jQuery-Component source files, for the RequireJS optimizer "includes" list. 
	 * 
	 * After retrieving the list of files, prepend "jqc/", and remove their .js extensions.
	 * This will create us the RequireJS includes list. 
	 * 
	 * Ex: 'Component.js' becomes 'jqc/Component'
	 *     'button/Button.js' becomes "jqc/button/Button'
	 */
	var allSrcFiles = createRequiresList( 'src/js', 'jqc' );
	
	
	// Project configuration
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		
		jshint: {
			files: [ 'Gruntfile.js', 'src/js/**/*.js', 'tests/spec/**/*.js' ],
			
			options : {
				'smarttabs' : true,
				'undef'     : true,
				'browser'   : true
			}
		},

		
		requirejs : {
			'compile' : {
				// Accepts same options as RequireJS optimizer build file.
				// Example of all available options at: https://github.com/jrburke/r.js/blob/master/build/example.build.js
				options : {
					baseUrl: 'src/js',
					out : "dist/js/jqc-all.js",
					
					// Note: Paths relative to the baseUrl, `src/js`. This is so that when the files
					// are optimized, they are defined in the output file as 'jqc/Xyz', instead of 'src/jqc/Xyz'.
					paths : {
						'jquery'             : 'empty:',  // included separately
						'lodash'             : 'empty:',  // included separately
						'jquery-ui.position' : 'empty:',
						'Class'              : 'empty:',
						'Observable'         : 'empty:',
						'data'               : 'empty:',
						
						'jqc'                : '.'
					},
					
					logLevel: 2,       // 0=trace, 1=info, 2=warn, 3=error, 4=silent
					optimize: 'none',  // We'll minify later, in `uglify` task
				
					include : allSrcFiles,        // include all source files, and
					insertRequire : allSrcFiles   // add a require() statement at the end of the build file for the library's
					                              // files, so that its classes can be instantiated lazily based on their `type` property
				}
			}
		},
		
		
		copy : {
			'afterRequirejs' : {
				files : [
					{ src : [ 'vendor/require/**' ],            dest: 'dist/' },
					{ src : [ 'vendor/jquery/**' ],             dest: 'dist/' },
					{ src : [ 'vendor/lodash/**' ],             dest: 'dist/' },
					{ src : [ 'vendor/jquery-ui.position/**' ], dest: 'dist/' },
					{ src : [ 'vendor/class/**' ],              dest: 'dist/' },
					{ src : [ 'vendor/observable/**' ],         dest: 'dist/' },
					{ src : [ 'vendor/data/**' ],               dest: 'dist/' }
				]
			}
		},
		
		concat : {			
			'afterRequirejs' : {
				options : {
					banner: banner
				},
				src  : [ 'dist/js/jqc-all.js' ],  // simply adding the banner
				dest : 'dist/js/jqc-all.js'       // to the output file
			}
		},
		
		
		uglify : {
			'dist' : {
				options: {
					preserveComments : 'some'  // preserve license header comments
				},
				files : {
					'dist/js/jqc-all-min.js' : [ 'dist/js/jqc-all.js' ]
				}
			}
		}
	} );

	// These plugins provide the tasks.
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-requirejs' );

	
	
	// -----------------------------------
	
	// Other Functions / Tasks
	
	
	/**
	 * Compiles the JavaScript documentation JSDuck, as part of the 'doc' task.
	 * 
	 * Unfortunately, we can't use the 'grunt-jsduck' plugin because installing the JSDuck gem on Windows
	 * using `gem install` first involves a long set of installation steps to install the developer build 
	 * tools needed to be able to compile the Ruby extensions needed by JSDuck's dependent libraries.
	 * 
	 * Hence, it is much easier for developers to get set up by not doing anything at all (i.e., simply
	 * running the packaged JSDuck executable in the repository).
	 */
	function compileDocsTask() {
		var done = this.async();
		
		var executable = 'vendor/jsduck/jsduck-4.7.1.exe';
		var args = [
			'--output=docs',
			'--external=jQuery,jQuery.Event,jQuery.Deferred,jQuery.Promise',
			'--title=jQuery-Component API Docs',
			
			'src/js',
			'vendor/class/',
			'vendor/observable/',
			'vendor/data/'
		];
		
		execFile( executable, args, function( err, stdout, stderr ) {
			if( stdout ) console.log( stdout );
			if( stderr ) console.log( stderr );
			
			if( err ) {
				// JSDuck command itself failed
				grunt.log.error( "Documentation generation failed: " + err );
				
				done( false );
				return;
			}
			
			if( stdout || stderr ) {
				// JSDuck produced errors/warnings
				grunt.log.error( "Documentation generation produced warnings/errors. Please fix them, and try again." );
				
				done( false );
				return;
			}
			
			grunt.log.writeln( "Documentation generated successfully." );
			grunt.log.writeln( "To publish the docs on github, copy the /docs folder into a checkout of the gh-pages branch, commit, and push that branch." );
			done();
		} );
	}
	
	
	
	/**
	 * Puts together the list of source files for a given directory, which will be used for the RequireJS 
	 * optimizer "includes" list.
	 * 
	 * This helper function takes a source directory, and compiles a list (array) of of all *.js files
	 * inside it. It will then remove the '.js' suffix, and prepend the provided `prefix` library name.
	 * 
	 * For example, when putting together the list of Data.js source files, the arguments to this method
	 * would be: `'src/', 'data'`. This will create a returned list something along the lines of this,
	 * which will be the RequireJS includes list:
	 * 
	 *     [
	 *         'data/Collection',
	 *         'data/Model',
	 *         ...
	 *         
	 *         'data/persistence/proxy/Ajax',
	 *         ...
	 *     ]
	 * 
	 * As another point of example: "Model.js" becomes "data/Model" in the above output.
	 * 
	 * @param {String} directory
	 * @param {String} prefix
	 * @return {String[]} The list of RequireJS paths to use in the optimizer's "includes" list.
	 */
	function createRequiresList( directory, prefix ) {
		var srcFiles = grunt.file.expand( { cwd: directory }, '**/*.js' );  // get a list relative to the provided directory
		return srcFiles.map( function( filename ) { return prefix + "/" + filename.replace( /\.js$/, '' ); } );
	}
	
};
