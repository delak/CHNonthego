////////////////////////////////////////////////////////////////////////////////
//
//  Copyright 2012-2015 Default
//  All Rights Reserved.
//
//  NOTICE: codebender permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    //cache the current context
    //use it when in a function
    var self = this;

    //lets export the Default object for require as a module
    var Default;
    if (typeof exports !== 'undefined') {
        Default = exports;
    } else {
        Default = self.Default = {};
    }

    //lets create global functions like constants
    //using capital case

    /**
     * Default version number
     * @type {string}
     */
    Default.VERSION = '0.3.0';

    /**
     * the top level element of the Defaultliction
     * used by MVC frameworks for routing
     * @type {string}
     */
    Default.EL = 'body';

    /**
     * the root of the Defaultlication
     * used by MVC frameworks for navigation
     * @type {string}
     */
    Default.ROOT = '/';

    /**
     * the width of the current device
     * used to position elements absolutely on screen
     * also used to set elements width to match the current device width
     * @type {*}
     */
    Default.WIDTH = $(window).width();

    /**
     * the height of the current device
     * used to position elements absolutely on screen
     * also used to set elements height to match the current device height
     * @type {*}
     */
    Default.HEIGHT = $(window).height();

    /**
     * store the user profile in memory
     * when its available via signin/signup or local storage
     * @type {*}
     */
    Default.PROFILE = {};

    /**
     * lets assign the $ object to which ever library is present
     * @type {jQuery|*|jQuery|Zepto|Function|$}
     */
    Default.$ = self.jQuery || self.Zepto || self.$;


    //get the current event from the windows object, so we can enable touch events for android
    //and click events for desktop Defaults //touchstart
    Default.CURRENT_EVENT = 'ontouchstart' in window ? "click" : "click";


    /**
     * lets log section of the Defaultlication
     * using console.log
     * doing it directly will be too verbose
     * this will enable us to disable all logs on production
     * also we can toggle between console.log and the native alert
     * at any time
     * @param message
     */
    Default.log = function (message) {

        console.log(message);
        //alert(message);

    };

    /**
     * converts a JSONArray to a string and parses it line by line for readability
     * @param json the list to be parsed
     * @returns {string|void}
     */
    Default.logJSON = function (json) {

        //convert params to string and parse it on a different line
        //this can be used with console.log to better understand the data output
        return JSON.stringify(json).replace(/,/g, "\n");

    };

    //TODO comment
    /*
     Default.save({
     key:"key",
     values:"json string",
     type:"",
     success:function(){},
     error:function(){}
     });
     */
    Default.save = function (opt) {

        opt.type = opt.type || "one";

        if (window.localStorage) {

            if (opt.type === "one") {

                window.localStorage.setItem(opt.key, opt.values);
                opt.success(opt.value);

            } else if (opt.type === "json") {

                window.localStorage.setItem(opt.key, JSON.stringify(opt.values));
                opt.success(opt.values);

            }

        } else {

            var _msg = {
                message: "localstorage unavailable on this device",
                code: "102"
            };
            opt.error(_msg);

        }
    };

    /**
     * check to see if the provided key is in local storage
     * @param key the name of the item stored
     * @return true if the key exists in local storage or false otherwise
     */
    Default.cached = function (key) {
        var storage = window.localStorage;
        var value = false;
        if (storage) {
            value = storage.getItem(key) ? true : false;
        }
        return value;
    };

    Default.createName = function (name) {

        return name + Math.ceil(Math.random() * 14000);
    };

    Default.hash = function () {

        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    Default.createHash = function () {

        return (Default.hash() + Default.hash() + "-" + Default.hash() + "-" + Default.hash() + "-" + Default.hash() + "-" + Default.hash() + Default.hash() + Default.hash());

    };

    Default.megabytes = function (bytes) {

        var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Bytes';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i == 0) return bytes + ' ' + sizes[i];
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];

    };

    Default.capsLock = function (string) {

        return string.toUpperCase();

    };

    Default.capitaliseFirstLetter = function (string) {

        return string.charAt(0).toUpperCase() + string.slice(1);

    };

    Default.capitaliseLetters = function (str) {

        var _str = [];
        _.each(str.split(/\s+/g), function (s) {
            _str.push(s[0].toUpperCase() + s.slice(1));
        });
        return _str.join(' ');
    };

    //TODO Comment and check if css is available using modernizr
    //TODO add scroll to top
    Default.scrollToAnchor = function (aid, offset) {

        offset = offset || 0;

        try {

            var aTag = $("a[name='" + aid + "']");
            $('html,body').animate({scrollTop: aTag.offset().top - offset}, 'slow');

        } catch (e) {

            console.log("Transfer to Library Failed");

        }
    };

    //TODO move all functions into a utility file
    //TODO comment probably
    //TODO remove the backbone dependency
    /**
     * this method brings back all cached objects
     * on a users device
     * @param opt the name of the cached object
     * @return {*} returns the value of the cached object when key is found
     * or returns null when nothing is found
     */
    Default.find = function (opt) {

        //lets set the get item type
        //one for just single type like string, number etc
        //json for a json object
        opt.type = opt.type || "one";

        //lets create a variable for the returned value
        var val;

        //check to see if the user has the local storage API
        if (window.localStorage) {

            //if the key is not null
            if (window.localStorage.getItem(opt.key) !== null) {

                if (opt.type === "one") {

                    val = window.localStorage.getItem(opt.key);

                } else if (opt.type === "json") {

                    //lets store the value found
                    //lets parse it and convert into readable format
                    val = JSON.parse(window.localStorage.getItem(opt.key));

                }

                //use Backbone utility function
                //to make sure the val found is not empty
                if (_.isObject(val) && _.isEmpty(val)) {

                    //if the value found is empty
                    return null;
                }

                //return the value
                return val;
            }
        }

        //always return null if the above cases fail
        return null;
    };

    //clear all cached items from the users browser
    Default.clear = function () {

        if (window.localStorage) {

            window.localStorage.clear();

        }
    };

    /*
     Default.filter({
     data:"the object you want to search against",
     item:"a string rep of the data object in context",
     object:"a key/value pair of an element e.g data.id"
     },
     function(item,count){}
     );
     */
    Default.filter = function (opt, callback) {

        var count = 0;

        _.find(_.clone(opt.data), function (item) {

            count++;
            if (item[opt.item] === opt.object) {
                callback({
                    item: item,
                    count: count - 1
                });
            } else {
                callback({
                    item: null,
                    count: 0
                });
            }
        });

    };


    /**
     * center any element absolutely positioned on screen using device width or height
     * @param el a jquery|zepto|endo object
     * @param type is either "w" = "left" or "h" = "top" this is how the calculation is done
     * @param callback after the element is positioned.
     * @returns {{height: number, width: number}} if you want the calculation in return,
     *  you can using Default.centerUI.width or Default.centerUI.height
     */
    Default.centerUI = function (el, type, callback) {

        var wW = Default.WIDTH;
        var wH = Default.HEIGHT;
        var objW = $(el).width();
        var objH = $(el).height();
        var centerW = (wW - objW) * 0.5;
        var centerH = (wH - objH) * 0.5;

        if (type === "w") {

            $(el).css({
                "left": centerW
            });
        }

        if (type === "h") {

            $(el).css({
                "top": centerH
            });

        }

        if (typeof(callback) === "function") {

            callback();
        }

        return {
            height: centerH,
            width: centerW
        }
    };

    /**
     * this method depends on jquery to show and hide elements.
     * i have also added classes .hide{display:none} and .show{display:block}
     * so i can check and hide the element as needed
     * @param el a jquery|zepto object
     * @callback function to determine is an object is showing or hiding
     */
    Default.displayUI = function (el, callback) {
        var _el = $(el);
        if (_el.hasClass('hide')) {
            _el.addClass('show').removeClass('hide');
            if (typeof callback === "function") {
                callback("showing")
            }
        } else {
            _el.addClass('hide').removeClass('show');
            if (typeof callback === "function") {
                callback("hiding")
            }
        }
    };

    /**
     * set an element to device size
     * @param el a jquery|zepto|endo object
     */
    Default.setToDeviceSize = function (el) {

        $(el).width(Default.WIDTH).height(Default.HEIGHT);

    };

    /**
     * position an element using half of the devices width
     * @param el a jquery|zepto|endo object
     */
    Default.setToDeviceCenterX = function (el) {

        $(el).css({"left": (Default.WIDTH * 0.5) + "px"});

    };

    /**
     * position an element using half of the devices height
     * @param el a jquery|zepto|endo object
     */
    Default.setToDeviceCenterY = function (el) {

        $(el).css({"top": (Default.HEIGHT * 0.5) + "px"});

    };

    /**
     * position an element off the screen using the devices full width
     * @param el a jquery|zepto|endo object
     */
    Default.setToDeviceOffsetX = function (el) {

        $(el).css({"left": (Default.WIDTH) + "px"});
    };

    /**
     * position an element off the screen using the devices full height
     * @param el a jquery|zepto|endo object
     */
    Default.setToDeviceOffsetY = function (el) {

        $(el).css({"top": (Default.HEIGHT) + "px"});
    };


    /**
     * expose the Default object to the windows object;
     * this makes it public
     * doing this doesn't pollute the global scope
     * @type {*}
     */
    window.Default = Default;

}).call(this);

//serialize form objects
$.fn.serializeObject = function () {
    var arr = this.serializeArray();
    var n = [];
    return _.reduce(arr, function (memo, f) {
        var objField = _.reduceRight(f.name.replace(/\[/g, ".").replace(/\]/g, "").split("."), function (memo, p) {
            if (/^[0-9]+$/.test(p)) {
                n = []
            } else {
                n = {}
            }
            n[p] = memo;
            return n
        }, f.value);
        $.extend(true, memo, objField);
        return memo
    }, {});
};