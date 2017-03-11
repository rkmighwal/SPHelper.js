/// <reference path="_references.js" />

var SPHelper = SPHelper || {}; // SPHelper namespace

SPHelper.list = function () { // SPHelper.list class
    'use strict'; // Strict mode on

    /* Private Members */
    /* Local Variables */
    var _common = new SPHelper.common(), // create SPHelper.common object for use within class
        _fileName = "SPHelper.js";

    /* Properties */

    /* Methods */

    // Method to get list fields from SharePoint List using REST API
    var _getListFields = function (siteURL, listName, queryString, callback) {
        if (_common.isjQueryExists && listName && (typeof callback != "undefined" && callback !== null && jQuery.isFunction(callback))) {
            siteURL = siteURL || _spPageContextInfo.webServerRelativeUrl; // set default Site URL

            var restApiURL = "/_api/web/lists/GetByTitle('" + listName + "')/fields",
                callURL = (siteURL === "/" ? "" : siteURL) + restApiURL, // Add Site URL with REST API URL
                listFieldsCallbackData = [], // Used to store data between multiple AJAX calls
                handleCallback = function (data) {
                    if (typeof data != "undefined" && data !== null && data.d.results !== null && data.d.results.length > 0) {
                        jQuery.each(data.d.results, function (index, item) { // Traverse & store data
                            listFieldsCallbackData.push(item);
                        });

                        if (data.d.__next && data.d.__next !== "") {
                            _common.sendAJAXCall(data.d.__next, handleCallback);
                            return false;
                        } else
                            callback(listFieldsCallbackData);
                    } else
                        callback(null); // Send null, if no data exists
                };

            if (queryString !== null && typeof queryString == "string")
                callURL += (queryString.indexOf('?') === 0 ? "" : "?") + queryString; // add query string contains filter, select and other REST parameters

            _common.sendAJAXCall(callURL, handleCallback); // Send AJAX call, and return promise
        } else
            throw new SyntaxError("Invalid Parameters.", _fileName);
    };

    /* Public Members */
    /* Properties */

    /* Methods */
    this.getListFields = _getListFields; // Method to get list fields

    /* Object settings */
    Object.seal(this); // Seal Object, prevent properties changes
    Object.preventExtensions(this); // Prevent Extension
};