////////////////////////////////////////////////////////////////////////////////
//
//  Copyright 2012-2015 App
//  All Rights Reserved.
//
////////////////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //cache the current context
    //use it when in a function
    var self = this;


    //lets export the App object for require as a module
    var App;
    if (typeof exports !== 'undefined') {
        App = exports;
    } else {
        App = self.App = {};
    }

    //lets create global functions like constants
    //using capital case

    /**
     * application version number
     * @type {string}
     */
    App.VERSION = '0.0.1';


    /**
     * the top level element of the appliction
     * used by MVC frameworks for routing
     * @type {string}
     */
    App.EL = 'body';

    /**
     * the root of the application
     * used by MVC frameworks for navigation
     * @type {string}
     */
    App.ROOT = '/';

    /**
     * jquery ID initializer
     * @type {string}
     */
    App.HASH_TAG = '#';

    /**
     * the width of the current device
     * used to position elements absolutely on screen
     * also used to set elements width to match the current device width
     * @type {*}
     */
    App.WIDTH = $(window).width();

    /**
     * the height of the current device
     * used to position elements absolutely on screen
     * also used to set elements height to match the current device height
     * @type {*}
     */
    App.HEIGHT = $(window).height();

    //get the current event from the windows object, so we can enable touch events for android
    //and click events for desktop Defaults
    App.CURRENT_EVENT = 'ontouchstart' in window ? "touchstart" : "click";

    // helper array for managing view animation in the main application
    App.VIEW_MANAGER = ['home'];

    // the view stack index
    App.Z_INDEX = 0;

    //lets reset all views
    //and take the application back to the homepage
    App.home = function () {

        //remove all cached views
        App.VIEW_MANAGER = ['home'];

    };

    //add a view to the view stack
    App.nextView = function (opt) {

    };

    //function for loading and animation navigation views
    App.navigationView = function () {

        //look for all class names with the name navigation-view
        //attach an event to them
        //extract the data object
        $(document).delegate('.navigation-view', App.CURRENT_EVENT, function (e) {

            var _view = $(this).data('view');
            var _title = $(this).data('title');
            var _type = $(this).data('type');
            if (typeof _title === 'undefined' || _title === '') {
                _title = 'CHN On the Go';
            }
            if (typeof _type === 'undefined' || _type === '') {
                _type = 'center-view';
            }
            var _id = App.HASH_TAG + $(this).data('id');
            var temp_id = $(this).data('id');
            if (typeof _view === 'undefined') {
                alert("Error Loading Page");
            } else {
                require(['script/text!templates/' + _view], function (template) {

                    _.templateSettings = {
                        evaluate: /\{\{(.+?)\}\}/g,
                        interpolate: /\{\{=(.+?)\}\}/g,
                        escape: /\{\{-(.+?)\}\}/g
                    };

                    var _json = {
                        title: _title,
                        template: template,
                        id: temp_id,
                        index: App.Z_INDEX++
                    };
                    var temp = _.template($("script." + _type).html(), _json);
                    $(App.EL).append(temp);
                    App.VIEW_MANAGER.push(_id);
                    App.setToDeviceOffsetX(_id);
                    App.setToDeviceSize(_id);
                    $(window).trigger('resize');
                    App.screenxReverse(_id);

                });
            }
        });
    };

    //remove a view from the view stack
    App.back = function () {

        //this event removes the next object in the view stack
        //you can attach the .back-button class to remove the immediate view in the stack
        $(document).delegate('.back-button', App.CURRENT_EVENT, function (e) {
            // alert("event");
            var _lastView = App.VIEW_MANAGER[App.VIEW_MANAGER.length - 1];
            if (App.VIEW_MANAGER.length !== 0) {
                App.screenx(_lastView);
                window.setTimeout(function () {
                    $(_lastView).remove();
                    App.VIEW_MANAGER.pop();
                }, 1000)
            }
        });
    };

    App.init = function () {

        //this is a javascript plugin that removes the 300m delay on native web views.
        //this plugin can be found in script/vendor/fastclick.min.js
        FastClick.attach(document.body);

        //load the home page
        require(['script/text!home.html'], function (template) {

            $(App.EL).append(template);
            //after the view successfully loads
            //lets resize it to the current device size
            App.setToDeviceSize("#home");

            //resize all view ports
            $(window).resize(function () {

                //set view port width and height to device width and height
                $('.canvas').width($(window).width()).height($(window).height());

            });

            //lets call the navigation view initializer on application start
            App.navigationView();

            //lets call the pop manager on application start
            App.back();


        });
    };

    /**
     * function for animating elements which are positioned below the screen
     * @param obj
     * @constructor
     */
    App.screenxReverse = function (el) {

        // $(el).animate({ y: -(App.HEIGHT)}, 1000, 'ease');
        tram(el).add('transform 0.5s ease').start({ x: -(App.WIDTH)});

    };

    App.screenx = function (el, callback) {

        // $(el).animate({ y: -(App.HEIGHT)}, 1000, 'ease');
        tram(el).add('transform 0.8s ease').start({ x: (App.WIDTH)}, function () {
            if (typeof callback === 'function') {
                callback();
            }
        });

    };

    /**
     * remove DOM element using jquery
     * @param el
     */
    App.destroyUI = function (el) {

        $(el).remove();

    };

    /**
     * function for animating elements out of screen position
     * @param obj a
     * @constructor
     */
    App.offscreenUI = function (el) {

        // $(el).animate({ y: -(App.HEIGHT + App.HEIGHT)}, 1000, 'ease');
        tram(el).add('transform 2s ease').start({ x: -(App.WIDTH + App.WIDTH)});

    };

    /**
     * set an element to device size
     * @param el a jquery|zepto|endo object
     */
    App.setToDeviceSize = function (el) {

        $(el).width(App.WIDTH).height(App.HEIGHT);

    };

    /**
     * position an element using half of the devices width
     * @param el a jquery|zepto|endo object
     */
    App.setToDeviceCenterX = function (el) {

        $(el).css({"left": (App.WIDTH * 0.5) + "px"});

    };

    /**
     * position an element using half of the devices height
     * @param el a jquery|zepto|endo object
     */
    App.setToDeviceCenterY = function (el) {

        $(el).css({"top": (App.HEIGHT * 0.5) + "px"});

    };

    /**
     * position an element off the screen using the devices full width
     * @param el a jquery|zepto|endo object
     */
    App.setToDeviceOffsetX = function (el) {

        $(el).css({"left": (App.WIDTH) + "px"});
    };

    /**
     * position an element off the screen using the devices full height
     * @param el a jquery|zepto|endo object
     */
    App.setToDeviceOffsetY = function (el) {

        $(el).css({"top": (App.HEIGHT) + "px"});
    };

    /**
     * expose the App object to the windows object;
     * this makes it public
     * doing this doesn't pollute the global scope or namespace
     * @type {*}
     */
    window.App = App;

}.call(this));

//initialise application
$(document).ready(App.init);




