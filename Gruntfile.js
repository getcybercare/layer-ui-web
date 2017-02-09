/*eslint-disable */

var fs = require('fs');
var path = require('path');
var version = require('./package.json').version;
var HTML_HEAD = fs.readFileSync('./jsduck-config/head.html').toString();
var CSS = fs.readFileSync('./jsduck-config/style.css').toString();
var babel = require("babel-core");

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      options: {
        separator: ';',
        transform: ['strictify' ],
        browserifyOptions: {
          standalone: 'layerUI'
        }
      },
      build: {
        files: [
          {
            dest: 'build/layer-ui-web.js',
            src: 'index.js'
          }
        ]
      },
      debug: {
        files: [
          {
            dest: 'build/layer-ui-web-test.js',
            src: 'index.js'
          }
        ],
        options: {}
      }
    },
    webcomponents: {
      debug: {
        files: [
          {
            dest: 'lib',
            src: ['src/**/*.js', '!src/**/test.js', '!src/**/tests/*.js']
          }
        ],
        options: {
        }
      }
    },
    less: {
      themes: {
        files: [
          {src: ['themes/src/bubbles-basic/theme.less'], dest: 'themes/build/bubbles-basic.css'},
          {src: ['themes/src/groups-basic/theme.less'], dest: 'themes/build/groups-basic.css'},
          {src: ['themes/src/layerblue/theme.less'], dest: 'themes/build/layerblue.css'}
        ]
      }
    },
    cssmin: {
      build: {
        files: [
          {src: ['themes/build/bubbles-basic.css'], dest: 'themes/build/bubbles-basic.min.css'},
          {src: ['themes/build/groups-basic.css'], dest: 'themes/build/groups-basic.min.css'}
        ]
      }
    },
    /* TODO: This is a crap copy routine as multiple themes using the same template name will overwrite eachother. */
    copy: {
      themes: {
        src: ["themes/src/*/**.html"],
        dest: "themes/build/",
        flatten: true,
        expand: true
      }
    },
    uglify: {
    	options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
    				'<%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap: false,
        screwIE8: true
      },
      build: {
        files: {
          'build/layer-ui-web.min.js': ['build/layer-ui-web.js']
        }
      }
    },

    // Documentation
    jsduck: {
      build: {
        src: ["lib/**/*.js", "node_modules/layer-websdk/lib/**/*.js"],
        dest: 'docs',
        options: {
          'builtin-classes': false,
          'warnings': ['-no_doc', '-dup_member', '-link_ambiguous', '-cat_class_missing'],
          'external': ['HTMLTemplateElement', 'Websocket', 'Blob', 'KeyboardEvent', 'DocumentFragment', 'IDBVersionChangeEvent', 'IDBKeyRange', 'IDBDatabase'],
          'title': 'Layer UI for Web - API Documentation',
          'categories': ['jsduck-config/categories.json'],
          'head-html': HTML_HEAD,
          'css': [CSS],
          'footer': 'Layer UI for Web v' + version
        }
      }
    },

    watch: {
      debug: {
        files: ['index.js', 'src/**', 'Gruntfile.js', '!**/test.js'],
        tasks: ['debug', 'make-npm-link-safe', 'notify:watch'],
        options: {
          interrupt: true
        }
      },
      themes: {
        files: ['themes/src/**'],
        tasks: ['theme', 'make-npm-link-safe'],
        options: {
          interrupt: true
        }
      }
    },
    notify: {
      watch: {
        options: {
          title: 'Watch Build',  // optional
          message: 'Build Complete', //required
        }
      }
    }
  });

  /* npm link causes a second layer-websdk to get built via browserify/webpack.
   * Removing layer-ui-web/node_modules/layer-websdk while using npm link causes errors to be thrown indicating
   * that "layer-websdk" cannot be found (even through its in ~/node_modules/layer-websdk).
   * So now we have to copy a proper looking npm repo, and make sure that all dependencies are present.
   */
  grunt.registerTask('make-npm-link-safe', "Making NPM Link Safe", function() {
    if (grunt.file.exists('npm-link-projects.json')) {
      var projectFolders = require('./npm-link-projects.json');
      projectFolders.forEach(function(project) {
        grunt.file.copy('index.js', project + '/node_modules/layer-ui-web/index.js');
        grunt.file.copy('package.json', project + '/node_modules/layer-ui-web/package.json');
        grunt.file.copy('lib', project + '/node_modules/layer-ui-web/lib');
        grunt.file.copy('themes/build', project + '/node_modules/layer-ui-web/themes/build');
      });
    }
  });

  /* There is some path of using expose and external that should allow us to do a require('layer-websdk')
     without it being in this build, but I do not see it.  So, brute force:
     1. Before browserify, we replace layer-websdk/index.js with `module.exports = global.layer`,
     2. after browserify, we restore index.js
  */
  grunt.registerTask('before-browserify', 'Swap layer-websdk for global', function() {
    var newcode = 'module.exports = global.layer;';
    var contents = grunt.file.read('node_modules/layer-websdk/index.js');
    if (contents != newcode) {
      grunt.file.write('node_modules/layer-websdk/index-stashed.js', contents);
    }
    grunt.file.write('node_modules/layer-websdk/index.js', newcode);
  });

  grunt.registerTask('after-browserify', 'Swap layer-websdk back', function() {
    grunt.file.copy('node_modules/layer-websdk/index-stashed.js', 'node_modules/layer-websdk/index.js');
  });


  grunt.registerTask('wait', 'Waiting for files to appear', function() {
    console.log('Waiting...');
    var done = this.async();

    // There is an inexplicable delay between when grunt writes a file (and confirms it as written) and when it shows up in the file system.
    // This has no affect on subsequent grunt tasks but can severely impact npm publish
    // Note that we can't test if a file exists because grunt reports that it exists even if it hasn't yet been flushed to the file system.
    setTimeout(function() {
      console.log("Waiting...");
      setTimeout(function() {
        console.log("Waiting...");
        setTimeout(function() {
          done();
        }, 1500);
      }, 1500);
    }, 1500);
  });

  grunt.registerMultiTask('webcomponents', 'Building Web Components', function() {
    var options = this.options();

    function createCombinedComponentFile(file, outputPath) {
      try {
      // Extract the class name; TODO: class name should be same as file name.
      var jsFileName = file.replace(/^.*\//, '');
      var className = jsFileName.replace(/\.js$/, '');

      if (jsFileName === 'test.js') return;

      var output = grunt.file.read(file);
      var babelResult = babel.transform(output, {
        presets: ["babel-preset-es2015"]
      });
      output = babelResult.code;

      // Babel sometimes moves our jsduck comments defining the class to the end of the file, causing JSDuck to quack.
      // Move it back to the top so that JSDuck knows what class all the properties and methods belong to
      var indexOfClass = output.indexOf('@class');
      if (indexOfClass !== -1) var indexOfClassCodeBlock = output.lastIndexOf('/**', indexOfClass);
      if (indexOfClassCodeBlock !== -1) {
        var endOfClassCodeBlock = output.indexOf('*/', indexOfClass);
        if (endOfClassCodeBlock !== -1) {
          endOfClassCodeBlock += 2;
          var prefix = output.substring(0, indexOfClassCodeBlock);
          var classComment = output.substring(indexOfClassCodeBlock, endOfClassCodeBlock);
          var postfix =  output.substring(endOfClassCodeBlock);
          output = classComment + prefix + postfix;
        }
      }

      var templateCount = 0;
      var outputFolder = path.dirname(outputPath);

      // Find the template file by checking for an html file of the same name as the js file in the same folder.
      var parentFolder = path.dirname(file);
      var pathToBase = parentFolder.replace(/[/|\bsrc][^/]*/g, "/..").substring(1) + "/lib/base"

      var templates = grunt.file.expand(parentFolder + "/*.html")
      templates.forEach(function(templateFileName) {
      // Stick the entire template into a function comment for easy multi-line string,
      // and feed the resulting function.toString() into buildTemplate() to create and assign a template to the widget.
      // TODO: maybe we should minify the HTML and CSS so it fits on a single line and doesn't need a function comment.
      //       Note: this would require escaping of all strings, which can get messy.
        grunt.log.writeln("Writing template for " + className);
        var contents = grunt.file.read(templateFileName);
        contents = contents.replace(/\/\*[\s\S]*?\*\//mg, '');

        var templates = contents.match(/^\s*<template(\s+id=['"].*?['"]\s*)?>([\s\S]*?)<\/template>/mg);
        templates.forEach(function(templateString) {
          templateCount++;
          var templateMatches = templateString.match(/^\s*<template(\s+id=['"].*?['"]\s*)?>([\s\S]*?)<\/template>/m);
          var templateContents = templateMatches[2];
          var templateId = templateMatches[1] || '';
          if (templateId) templateId = templateId.replace(/^.*['"](.*)['"].*$/, "$1");
          if (!templateId) {
            var templateName = templateFileName.replace(/\.html/, '').replace(/^.*\//, '');
            if (templateName !== className) templateId = templateName;
          }

          // Extracting styles won't be needed once we have shadow dom.  For now, this prevents 500 <layer-message> css blocks
          // from getting added and all applying to all messages.
          var styleMatches = templateContents.match(/<style>([\s\S]*)<\/style>/);
          var style;
          if (styleMatches) {
            style = styleMatches[1].replace(/^\s*/gm, '');
            templateContents = templateContents.replace(/<style>([\s\S]*)<\/style>\s*/, '');
          }

          // Strip out white space between tags
          templateContents = templateContents.replace(/>\s+</g, '><');

          // Generate the <template /> and <style> objects
          output += '\nvar layerUI = require("' + pathToBase + '");\n';
          output += 'layerUI.buildAndRegisterTemplate("' + className + '", ' + JSON.stringify(templateContents.replace(/\n/g,'').trim()) + ', "' + templateId + '");\n';
          output += 'layerUI.buildStyle("' + className + '", ' + JSON.stringify(style.trim()) + ', "' + templateId + '");\n';
        });
      });

      if (!grunt.file.exists(outputFolder)) {
        grunt.file.mkdir(outputFolder);
      }
      grunt.file.write(outputPath, output);
      //grunt.log.writeln("Wrote " + outputPath + "; success: " + grunt.file.exists(outputPath));
      } catch(e) {
        grunt.log.writeln('Failed to process ' + file + '; ', e);
      }
    }

    this.files.forEach(function(fileGroup) {
      grunt.file.delete(fileGroup.dest);
    });

    var files = [];
    // Iterate over each file set and generate the build file specified for that set
    this.files.forEach(function(fileGroup) {
      fileGroup.src.forEach(function(file, index) {
        files.push(file);
        var outputPath = file.replace(/^src/, fileGroup.dest);;
        createCombinedComponentFile(file, outputPath);
      });
    });

    files = files.filter(function(fileName) {
      if (['src/base.js', 'src/components/component.js'].indexOf(fileName) !== -1) return false;
      if (fileName.match(/\/test\.js$/)) return false;
      return true;
    }).map(function(fileName) {
      return fileName.replace(/^src\//, './lib/');
    }).map(function(fileName) {
      return fileName.replace(/\.js$/, "");
    });

  });

  // Building
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-jsduck');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('theme', ['less', 'copy']),
  grunt.registerTask('docs', ['jsduck']);
  grunt.registerTask('debug', ['webcomponents', 'browserify:debug']);
  grunt.registerTask('build', ['webcomponents', 'before-browserify', 'browserify:build', 'after-browserify', 'uglify', 'theme', 'cssmin']);
  grunt.registerTask('default', ['build', 'docs']);
  grunt.registerTask('prepublish', ['build', 'theme', 'wait']);
};
