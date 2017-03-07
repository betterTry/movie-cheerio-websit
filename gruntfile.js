module.exports = function(grunt){
	grunt.initConfig({
		watch: {
			jade: {
				files: ['views/**'],
				options: {
					livereload: true
				}
			},
			js: {
				files: ['public/js/**', 'models/**/*.js', 'schemas/**/*.js'],
				options: {
					livereload: true
				}
			},
			css: {
				files : ['public/css/*.css'],
				options: {
					livereload: true
				}
			}
		},
		nodemon: {
			dev: {
				script: 'app.js',
				options: {
					args: [],
					ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
					watchedExtensions: ['js'],
					watchFolders: ['app', 'config'],
					debug: true,
					delayTime: 1000,
					env: {
						PORT: 3100
					},
					cwd: __dirname
				}
			}
		},
		concurrent: {
			tasks: ['nodemon' , 'watch'],
			options: {
				logConcurrentOutput: true
			}
		},
		jshint : {
		    options : {
		        jshintrc : '.jshintrc',
		        ignores : ['public/libs/**/*.js']
		    },
		    all : ['public/js/*.js' , 'test/**/*.js' , 'app/**/*.js']
	    },
	    copy: {
	    	main: {
	    		expand: true,
	    		cwd: './app/views/pages',
    			src: '*',
    			dest: './app/views/m_pages/',
    			flatten: true,
    			filter: 'isFile'
	    	},
	    	css: {
	    		expand: true,
	    		cwd: './public/css',
	    		src: '*',
	    		dest: './public/m_css'
	    	}
	    }

	})
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.option('force', true)
	grunt.registerTask('default', ['concurrent'])
	grunt.registerTask('test', ['mochaTest']);
}