module.exports = function(grunt) {

    var qunit       = grunt.config('qunit') || {};
    var testUrl     = 'http://127.0.0.1:' + grunt.option('testPort');
    var root        = grunt.option('root');

    //extract unit tests
    var extractTests = function extractTests(){
        return grunt.file.expand([ root + '/taoQtiItem/views/js/test/**/test.html']).map(function(path){
            return path.replace(root, testUrl);
        });
    };

    /**
     * tests to run
     */
    qunit.taoqtiitemtest = {
        options : {
            console : true,
            urls : extractTests()
        }
    };

    grunt.config('qunit', qunit);

    // bundle task
    grunt.registerTask('taoqtiitemtest', ['qunit:taoqtiitemtest']);
};
