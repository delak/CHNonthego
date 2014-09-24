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
    //and click events for desktop Defaults touchstart
    App.CURRENT_EVENT = 'ontouchstart' in window ? "click" : "click";

    // helper arrays for managing view animation in the main application
    App.VIEW_MANAGER = ['home'];
    App.REMOVED_VIEWS = [];

    //lets cache the top-section height for views using the carousel
    App.TS_HEIGHT = 0;

    // the view stack index
    App.Z_INDEX = 0;

    //override underscore template tags
    _.templateSettings = {
        evaluate: /\{\{(.+?)\}\}/g,
        interpolate: /\{\{=(.+?)\}\}/g,
        escape: /\{\{-(.+?)\}\}/g
    };


    App.init = function () {

        //this is a javascript plugin that removes the 300m delay on native web views.
        //this plugin can be found in script/vendor/fastclick.min.js
        FastClick.attach(document.body);

        //load the home page
        require(['script/text!templates.html', 'script/text!home.html'], function (template, home) {

            $(App.EL).append(template);
            $(App.EL).append(home);
            //after the view successfully loads
            //lets resize it to the current device size
            var home = "#home";
            App.setToDeviceSize(home);
            App.innerViews(home);
            App.carousel(home);

            //resize all view ports
            $(window).resize(function () {

                //set view port width and height to device width and height
                $('.canvas').width($(window).width()).height($(window).height());

            });

            //lets call the navigation view initializer on application start
            App.navigationView();

            //lets call modal view event delegation on app start
            App.modalView();
            App.imageModal();

            //lets call the pop manager on application start
            App.back();

        });
    };

    //lets detect and initial a carousel if a view requests it
    App.carousel = function (id) {
        var _carousel = $(id).find('.carousel');
        if (_carousel.length >= 1) {
            if (typeof $.fn.slick !== 'undefined') {

                var slideOpt = {
                    'lazyLoad': 'progressive',
                    'touchMove': true,
                    infinite: true,
                    'dots': true,
                    'arrows': false,
                    'autoplay': false,
                    speed: 300
                };
                $(_carousel).slick(slideOpt);

                if (App.TS_HEIGHT !== 0) {
                    //  var slick_list = $(id).find('.slick-list');
                    //  $(slick_list).height(App.TS_HEIGHT);
                }
            }
        }
    };

    //lets find the inner views within a specific view container
    //by providing a jquery id
    App.innerViews = function (id) {
        var top_section = $(id).find('.top-section');
        var bottom_section = $(id).find('.bottom-section');
        if (bottom_section.length >= 1 && top_section.length >= 1) {
            var _top = $(top_section);
            var _bottom = $(bottom_section);
            var window_height = $(window).height();
            var ts_height = (window_height - _bottom.height()) - 4;
            App.TS_HEIGHT = _top.height();
            _top.height(ts_height - 6);
        }
    };

    //function to show and load content into a modal dialog
    App.modalView = function () {


        //look for all class names with the name navigation-view
        //attach an event to them
        //extract the data object
        $(document).delegate('.modal-view', App.CURRENT_EVENT, function (e) {

            e.preventDefault();
            var _view = $(this).data('view');
            var _type = $(this).data('type');

            var _template = ['script/text!templates/' + _view];
            if (typeof _view === 'undefined') {
                alert("Error Loading Modal");
            } else {
                if (typeof _type !== 'undefined' && typeof _type === 'image') {
                    _template = ['script/text!' + _view];
                }
                require(_template, function (template) {
                    var _json = {
                        template: template
                    };
                    var temp = _.template($("script.modal-view").html(), _json);
                    $('body').append(temp);
                    var content = '.modal_content';
                    window.setTimeout(function () {
                        console.log($(content).height());
                        $(content).css('margin-top', (($(window).height() - $(content).height())) / 2).show();
                    }, 160)
                    $('.modal-close').off().on(App.CURRENT_EVENT, function (e) {
                        $('.modal').fadeOut(function () {
                            $(this).remove();
                        });
                    });
                });
            }
        });
    };

    App.imageModal = function () {


        //look for all class names with the name navigation-view
        //attach an event to them
        //extract the data object
        $(document).delegate('.image-view', App.CURRENT_EVENT, function (e) {
            e.preventDefault();
            var _json = {
                template: $(this).html()
            };
            var temp = _.template($("script.image-view").html(), _json);
            $('body').append(temp);
            var content = '.modal_content';
            console.log($(window).height());
            window.setTimeout(function () {
                $(content).css('margin-top', (($(window).height() - $(content).height())) / 2).fadeIn();
            }, 100)
            $('.modal-close').off().on(App.CURRENT_EVENT, function (e) {
                $('.modal').fadeOut(function () {
                    $(this).remove();
                });
            });

        });
    };

    //function for loading and animation navigation views
    App.navigationView = function () {

        //look for all class names with the name navigation-view
        //attach an event to them
        //extract the data object
        $(document).delegate('.navigation-view', App.CURRENT_EVENT, function (e) {

            e.preventDefault();
            var _view = $(this).data('view');
            var temp_id = "view" + App.createHash();
            var _id = App.HASH_TAG + temp_id;
            if (typeof _view === 'undefined') {
                alert("Error Loading Page");
            } else {
                require(['script/text!templates/' + _view], function (template) {


                    var _json = {
                        template: template,
                        id: temp_id,
                        index: App.Z_INDEX++
                    };
                    var temp = _.template($("script.fullscreen-view").html(), _json);
                    $(App.EL).append(temp);
                    App.VIEW_MANAGER.push(_id);
                    App.clearViews();
                    App.setToDeviceOffsetX(_id);
                    App.setToDeviceSize(_id);
                    $(window).trigger('resize');
                    App.screenxReverse(_id);
                    App.innerViews(_id);
                    App.carousel(_id);

                });
            }
        });
    };

    //remove a view from the view stack
    App.back = function () {

        //this event removes the next object in the view stack
        //you can attach the .back-button class to remove the immediate view in the stack
        $(document).delegate('.back-button', App.CURRENT_EVENT, function () {
            // alert("event");
            var _lastView = App.VIEW_MANAGER[App.VIEW_MANAGER.length - 1];
            if (App.VIEW_MANAGER.length !== 0) {
                App.screenx(_lastView);
                App.REMOVED_VIEWS.push(_lastView);
                App.VIEW_MANAGER.pop();
            }
        });
    };

    App.clearViews = function () {
        if (App.REMOVED_VIEWS.length) {
            _.each(App.REMOVED_VIEWS, function (view) {
                $(view).remove();
            });
        }
    };

    /**
     * function for animating elements which are positioned below the screen
     * @param el
     * @constructor
     */
    App.screenxReverse = function (el) {

        // $(el).animate({ y: -(App.HEIGHT)}, 1000, 'ease');
        tram(el).add('transform 0.5s ease').start({x: -(App.WIDTH)});

    };

    App.screenx = function (el, callback) {

        // $(el).animate({ y: -(App.HEIGHT)}, 1000, 'ease');
        tram(el).add('transform 1.2s ease').start({x: (App.WIDTH)}, function () {
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
        tram(el).add('transform 2s ease').start({x: -(App.WIDTH + App.WIDTH)});

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

    App.createName = function (name) {

        return name + Math.ceil(Math.random() * 14000);
    };

    App.hash = function () {

        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    App.createHash = function () {

        return (App.hash() + App.hash() + "-" + App.hash() + "-" + App.hash() + "-" + App.hash() + "-" + App.hash() + App.hash() + App.hash());

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




