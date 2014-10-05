module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            dev: {
                src: [
                    'Gruntfile.js',
                    'dev/parse/public/script/app.js'
                ]
            },
            prod: {
                src: [
                    '',
                    ''
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    //define the default task
    grunt.registerTask('default', ['jshint:dev']);

};