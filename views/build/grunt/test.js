module.exports = function(grunt) {

    var qunit       = grunt.config('qunit') || {};
    var testUrl     = 'http://127.0.0.1:' + grunt.option('testPort');

    /**
     * tests to run
     */
    qunit.taoqtiitemtest = {
        options : {
            console : true,
            urls : [
                testUrl + '/taoQtiItem/views/js/test/qtiCommonRenderer/interactions/associate/test.html',
                testUrl + '/taoQtiItem/views/js/test/qtiCommonRenderer/interactions/choice/test.html',
                testUrl + '/taoQtiItem/views/js/test/qtiCommonRenderer/interactions/gapMatch/test.html',
                testUrl + '/taoQtiItem/views/js/test/qtiCommonRenderer/interactions/inlineChoice/test.html',
                testUrl + '/taoQtiItem/views/js/test/qtiCommonRenderer/interactions/match/test.html',
                testUrl + '/taoQtiItem/views/js/test/qtiCommonRenderer/interactions/order/test.html',
                testUrl + '/taoQtiItem/views/js/test/runner/interactions/choice/test.html',
                testUrl + '/taoQtiItem/views/js/test/runner/interactions/textentry/test.html',
                testUrl + '/taoQtiItem/views/js/test/runner/provider/test.html',
                testUrl + '/taoQtiItem/views/js/test/runner/qtiItemRunner/test.html'
            ]
        }
    };

    grunt.config('qunit', qunit);

    // bundle task
    grunt.registerTask('taoqtiitemtest', ['qunit:taoqtiitemtest']);
};
