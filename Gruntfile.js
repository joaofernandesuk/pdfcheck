module.exports = function(grunt) {
  'use strict';

  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    // reference the package.json
    pkg: grunt.file.readJSON('package.json'),

    //  JS linting
    jshint: {
      dist: {
        options: {
          curly: true, // always put curly braces around blocks in loops and conditionals
          eqeqeq: true, // use === and !== instead of == and != to avoid value coercion
          eqnull: true, // suppress warnings about == null comparisons
          browser: true, // defines globals exposed by modern browsers
          globals: {
            jQuery: true // defines globals exposed by jQuery
          }
        },
        files: {
          // Lint our gruntfile and any project-specific JS files
          // Add new project-specific JS files to this array for linting
          src: ['Gruntfile.js', 'pdfcheck.js']
        }
      }
    },

    //  Update grunt dependencies
    //  --------------------------------------
    devUpdate: {
      main: {
        options: {
          updateType: 'prompt', // user prompt for update
          reportUpdated: false,
          semver: false,
          packages: {
            devDependencies: true,
            dependencies: false
          },
          packageJson: null
        }
      }
    }

  });

  //  Grunt Tasks
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('update', ['devUpdate']);

  // Task for TravisCI to run for build validation
  grunt.registerTask('travis', ['jshint']);

};
