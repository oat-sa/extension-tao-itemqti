module.exports = function (grunt) {
    'use strict';

    var sass    = grunt.config('sass') || {};
    var watch   = grunt.config('watch') || {};
    var notify  = grunt.config('notify') || {};
    var root    = grunt.option('root') + '/taoQtiItem/views/';

    // Override include paths
    sass.taoqtiitem = {
        options : {},
        files : {}
    };

    //files goes heres
    sass.taoqtiitem.files[root + 'css/item-creator.css'] = root + 'scss/item-creator.scss';
    sass.taoqtiitem.files[root + 'css/qti-runner.css'] = root + 'scss/qti-runner.scss';
    sass.taoqtiitem.files[root + 'css/themes/default.css'] = root + 'scss/themes/default.scss';


    watch.taoqtiitemsass = {
        files : [root + 'scss/**/*.scss'],
        tasks : ['sass:taoqtiitem', 'notify:taoqtiitemsass'],
        options : {
            debounceDelay : 1000
        }
    };

    notify.taoqtiitemsass = {
        options: {
            title: 'Grunt SASS',
            message: 'SASS files compiled to CSS'
        }
    };

    grunt.config('sass', sass);
    grunt.config('watch', watch);
    grunt.config('notify', notify);

    //register an alias for main build
    grunt.registerTask('taoqtiitemsass', ['sass:taoqtiitem']);
};
