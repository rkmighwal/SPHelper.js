/// <reference path="_references.js" />

var SPHelper = SPHelper || {}; // SPHelper namespace

SPHelper.common = function () { // SPHelper.common class
    'use strict'; // Strict mode on

    /* Private Members */
    /* Properties */

    var _checkJQuery = (function () {
        return window && window.jQuery;
    }());

    /* Methods */

    var _logError = function (error) {
        error = JSON.stringify(error);
        console.log(error);
        alert(error);
    };

    var _sendAJAXCall = function (callURL, callback) {
        return jQuery.ajax({
            url: callURL,
            type: "GET",
            headers: { "accept": "application/json;odata=verbose" },
            success: callback,
            error: _logError
        });
    };

    // Method to get query string parameter values
    var _getURLParameterValueByName = function (name, url) {

        if (!url) url = window.location.href;

        name = name.replace(/[\[\]]/g, "\\$&");

        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);

        if (!results) return null;

        if (!results[2]) return '';

        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    var _logErrorJSOM = function (sender, args) {
        _logError(args.get_message() + '\n' + args.get_stackTrace());
    };

    var _daysDifference = function (start, end) {
        //Get 1 day in milliseconds
        var day = 1000 * 60 * 60 * 24;

        // Convert both dates to milliseconds
        var start_ms = start.getTime(),
            end_ms = end.getTime();

        // Calculate the difference in milliseconds
        var difference_ms = end_ms - start_ms;

        // Convert back to days and return
        return Math.round(difference_ms / day);
    };

    var _formattedDate = function (date, format) {
        if (typeof date !== "undefined" && date && typeof format === "string" && format) {
            var formatPatterns = format.split(/\W+/g),
            dateString = format,
            regex = new RegExp(/^\W/g),
            getDateValue = function (pattern) {
                var output = "",
                shortMonths = ["Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                switch (pattern) {
                    case "d":
                        output = date.getDate();
                        break;
                    case "dd":
                        var _date = date.getDate();
                        output = _date < 10 ? "0" + _date : _date;
                        break;
                    case "M":
                        output = date.getMonth() + 1;
                        break;
                    case "MM":
                        var _month = date.getMonth() + 1;
                        output = _month < 10 ? "0" + _month : _month;
                        break;
                    case "MMM":
                        output = shortMonths[date.getMonth()];
                        break;
                    case "yy":
                        output = String(date.getFullYear()).substring(2);
                        break;
                    case "yyyy":
                        output = date.getFullYear();
                        break;
                    case "h":
                        output = date.getHours();
                        break;
                    case "hh":
                        var _hours = date.getHours();
                        output = _hours < 10 ? "0" + _hours : _hours;
                        break;
                    case "m":
                        output = date.getMinutes();
                        break;
                    case "mm":
                        var _minutes = date.getMinutes();
                        output = _minutes < 10 ? "0" + _mintues : _minutes;
                        break;
                    case "s":
                        output = date.getSeconds();
                        break;
                    case "ss":
                        var _seconds = date.getSeconds();
                        output = _seconds < 10 ? "0" + _seconds : _seconds;
                        break;
                    default:
                        output = "";
                }
                return output;
            };

            if (formatPatterns.length > 0) {
                for (var i = 0; i < formatPatterns.length; i++)
                    dateString = dateString.replace(formatPatterns[i], getDateValue(formatPatterns[i]));
            }

            return dateString;
        }
        else
            return "Invalid Parameter values.";
    };

    /* Public Members */
    /* Properties */

    this.isjQueryExists = _checkJQuery(); // Check jQuery loaded or not

    /* Methods */

    this.logError = _logError; // Logging Method
    this.logErrorJSOM = _logErrorJSOM; // Logging Method for JSOM calls
    this.sendAJAXCall = _sendAJAXCall; // Send AJAX call using jQuery
    this.getDaysDifference = _daysDifference; // Get Days count between start and end date
    this.getFormattedDate = _formattedDate; // Get Date String, as per format
    this.getURLParameterValueByName = _getURLParameterValueByName; // Get Parameter value from URL, by passing Name

    /* Object settings */
    Object.seal(this); // Seal Object, prevent properties changes
    Object.preventExtensions(this); // Prevent Extension
};