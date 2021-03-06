﻿/// <reference path="_references.js" />

var SPHelper = SPHelper || {}; // SPHelper namespace

SPHelper.listItem = function () { // SPHelper.listItem class
    'use strict'; // Strict mode on

    /* Private Members */
    /* Local Variables */
    var _common = new SPHelper.common(), // create SPHelper.common object for use within class
        _fileName = "SPHelper.js";

    /* Properties */

    /* Methods */

    // Method to get list items from SharePoint List using REST API
    var _getListItems = function (siteURL, listName, itemId, queryString, callback) {
        if (_common.isjQueryExists && listName && (typeof callback != "undefined" && callback !== null && jQuery.isFunction(callback))) {
            siteURL = siteURL || _spPageContextInfo.webServerRelativeUrl; // set default Site URL

            var restApiURL = "/_api/web/lists/GetByTitle('" + listName + "')/items" + (itemId ? "(" + itemId + ")" : ""),
                callURL = (siteURL === "/" ? "" : siteURL) + restApiURL, // Add Site URL with REST API URL
                listItemsCallbackData = [], // Used to store data between multiple AJAX calls
                itemsLimit = null, // Store items limit
                handleCallback = function (data) {
                    if (typeof data != "undefined" && data !== null && data.d.results !== null && data.d.results.length > 0) {
                        jQuery.each(data.d.results, function (index, item) { // Traverse & store data
                            listItemsCallbackData.push(item);
                        });

                        if ((!itemsLimit || (!!itemsLimit && listItemsCallbackData.length < parseInt(itemsLimit))) && data.d.__next && data.d.__next !== "") {
                            _common.sendAJAXCall(data.d.__next, handleCallback);
                            return false;
                        } else {

                            if (!!itemsLimit) {
                                itemsLimit = parseInt(itemsLimit); // Parse to Number

                                if (listItemsCallbackData.length > itemsLimit) // Remove exceeded items
                                    listItemsCallbackData.splice(itemsLimit, (listItemsCallbackData.length - itemsLimit));
                            }

                            callback(listItemsCallbackData);
                        }
                    } else
                        callback(null); // Send null, if no data exists
                };

            if (queryString !== null && typeof queryString == "string") {
                callURL += (queryString.indexOf('?') === 0 ? "" : "?") + queryString; // add query string contains filter, select and other REST parameters
                itemsLimit = _common.getURLParameterValueByName("\\$top", callURL);
            }

            _common.sendAJAXCall(callURL, handleCallback); // Send AJAX call, and return promise
        } else
            throw new SyntaxError("Invalid Parameters.", _fileName);
    };

    // Get Metadata Type
    var _getMetadataType = function (listName) {
        listName = String(listName).replace(/ /g, "_x0020_");
        return "SP.Data." + listName + "ListItem";
    };

    // Method to save list item into SharePoint list using REST API
    var _saveListItem = function (siteURL, listName, data, callback) {
        if (_common.isjQueryExists && listName && (typeof callback != "undefined" && callback !== null && jQuery.isFunction(callback)) && data) {
            siteURL = siteURL || _spPageContextInfo.webServerRelativeUrl; // set default Site URL

            var requestDigest = jQuery("#__REQUESTDIGEST").val(),
                restApiURL = "/_api/web/lists/GetByTitle('" + listName + "')/items",
                callURL = (siteURL === "/" ? "" : siteURL) + restApiURL; // Add Site URL with REST API URL

            data['__metadata'] = { 'type': _getMetadataType(listName) }; // Add Metadata Type

            return jQuery.ajax({
                url: callURL,
                type: "POST",
                headers: { "accept": "application/json;odata=verbose", "content-Type": "application/json;odata=verbose", "X-RequestDigest": requestDigest },
                data: JSON.stringify(data),
                success: callback,
                error: _common.logError
            });
        } else
            throw new SyntaxError("Invalid Parameters.", _fileName);
    };

    // Method to save multiple list items into SharePoint list using JSOM
    var _saveListItems = function (siteURL, listName, data, callback) {
        if (_common.isjQueryExists && listName && (typeof callback != "undefined" && callback !== null && jQuery.isFunction(callback)) && (data && jQuery.isArray(data))) {
            var clientContext = siteURL ? (new SP.ClientContext(siteURL)) : (new SP.ClientContext.get_current()),
               list = clientContext.get_web().get_lists().getByTitle(listName);

            jQuery.each(data, function (index, item) { // Traverse & add items
                var itemCreateInfo = new SP.ListItemCreationInformation(),
                    listItem = list.addItem(itemCreateInfo);

                for (var property in item) {
                    if (item.hasOwnProperty(property) && !jQuery.isFunction(item[property]) && !jQuery.isArray(item[property]))
                        listItem.set_item(property, item[property]); // Set field values
                }

                listItem.update();
                clientContext.load(listItem);
            });

            clientContext.executeQueryAsync(callback, Function.createDelegate(this, _common.logErrorJSOM));
        } else
            throw new SyntaxError("Invalid Parameters.", _fileName);
    };

    // Method to update list item into SharePoint list using REST API
    var _updateListItem = function (siteURL, listName, itemId, data, callback) {
        if (_common.isjQueryExists && listName && (typeof itemId != "undefined" && itemId !== null) && (typeof callback != "undefined" && callback !== null && jQuery.isFunction(callback)) && data) {
            siteURL = siteURL || _spPageContextInfo.webServerRelativeUrl; // set default Site URL

            data['__metadata'] = { 'type': _getMetadataType(listName) }; // Add Metadata Type

            var requestDigest = jQuery("#__REQUESTDIGEST").val(),
                restApiURL = "/_api/web/lists/GetByTitle('" + listName + "')/items",
                callURL = (siteURL === "/" ? "" : siteURL) + restApiURL, // Add Site URL with REST API URL
                updateData = data, // Store local to remove conflict
                updateItem = function (data) {
                    jQuery.ajax({
                        url: data.d.__metadata.uri,
                        type: "POST",
                        contentType: "application/json;odata=verbose",
                        data: JSON.stringify(updateData),
                        headers: {
                            "Accept": "application/json;odata=verbose",
                            "X-RequestDigest": requestDigest,
                            "X-HTTP-Method": "MERGE",
                            "If-Match": data.d.__metadata.etag
                        },
                        success: callback,
                        error: _common.logError
                    });
                };

            _getListItems(siteURL, listName, itemId, null, updateItem); // Call Get List Item then update it
        } else
            throw new SyntaxError("Invalid Parameters.", _fileName);
    };

    // Method to update multiple list items into SharePoint list using JSOM
    var _updateListItems = function (siteURL, listName, data, callback) {
        if (_common.isjQueryExists && listName && (typeof callback != "undefined" && callback !== null && jQuery.isFunction(callback)) && (data && jQuery.isArray(data))) {
            var clientContext = siteURL ? (new SP.ClientContext(siteURL)) : (new SP.ClientContext.get_current()),
               list = clientContext.get_web().get_lists().getByTitle(listName);

            jQuery.each(data, function (index, item) { // Traverse & add items
                if (item.hasOwnProperty("ID") && item.hasOwnProperty("data") && (item.ID && (typeof item.ID == "number" || typeof item.ID == "string")) && (item.data && jQuery.isArray(item.data))) {
                    var listItem = list.getItemById(parseInt(item.ID).toString()),
                        itemData = item.data;

                    for (var property in itemData) {
                        if (itemData.hasOwnProperty(property) && !jQuery.isFunction(itemData[property]) && !jQuery.isArray(itemData[property]))
                            listItem.set_item(property, itemData[property]); // Set field values
                    }

                    listItem.update();
                }
            });

            clientContext.executeQueryAsync(callback, Function.createDelegate(this, _common.logErrorJSOM));
        } else
            throw new SyntaxError("Invalid Parameters.", _fileName);
    };

    // Method to delete list item from SharePoint list using REST API
    var _deleteListItem = function (siteURL, listName, itemId, callback) {
        if (_common.isjQueryExists && listName && (typeof itemId != "undefined" && itemId !== null) && (typeof callback != "undefined" && callback !== null && jQuery.isFunction(callback))) {
            siteURL = siteURL || _spPageContextInfo.webServerRelativeUrl; // set default Site URL

            var requestDigest = jQuery("#__REQUESTDIGEST").val(),
                restApiURL = "/_api/web/lists/GetByTitle('" + listName + "')/items(" + itemId + ")",
                callURL = (siteURL === "/" ? "" : siteURL) + restApiURL; // Add Site URL with REST API URL

            jQuery.ajax({
                url: callURL,
                type: "POST",
                contentType: "application/json;odata=verbose",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": requestDigest,
                    "X-HTTP-Method": "DELETE",
                    "If-Match": "*"
                },
                success: callback,
                error: _common.logError
            });
        } else
            throw new SyntaxError("Invalid Parameters.", _fileName);
    };

    // Method to delete multiple list items from SharePoint list using JSOM
    var _deleteListItems = function (siteURL, listName, itemIds, callback) {
        if (_common.isjQueryExists && listName && (typeof itemIds != "undefined" && itemIds !== null && jQuery.isArray(itemIds)) && (typeof callback != "undefined" && callback !== null && jQuery.isFunction(callback))) {
            var clientContext = siteURL ? (new SP.ClientContext(siteURL)) : (new SP.ClientContext.get_current()),
                list = clientContext.get_web().get_lists().getByTitle(listName);

            for (var i = 0; i < itemIds.length; i++) {
                var listItem = list.getItemById(itemIds[i]); // Load Item
                listItem.deleteObject(); // Delete Item
            }

            clientContext.executeQueryAsync(callback, Function.createDelegate(this, _common.logErrorJSOM));
        } else
            throw new SyntaxError("Invalid Parameters.", _fileName);
    };

    /* Public Members */
    /* Properties */

    /* Methods */
    this.getListItem = function (siteURL, listName, itemId, queryString, callback) { // Method to get single list item, using itemId
        if (itemId && (typeof itemId == "number" || typeof itemId == "string"))
            _getListItems(siteURL, listName, parseInt(itemId), queryString, callback);
        else
            throw new SyntaxError("Invalid ID parameter, it could be String or number.", _fileName);
    };

    this.getListItems = function (siteURL, listName, queryString, callback) { // Method to get multiple list items
        _getListItems(siteURL, listName, null, queryString, callback);
    };

    this.saveListItem = _saveListItem; // Method to save list item

    this.saveListItems = _saveListItems; // Method to save multiple list items

    this.updateListItem = _updateListItem; // Method to update list item

    this.updateListItems = _updateListItems; // Method to update multiple list items

    this.deleteListItem = _deleteListItem; // Method to delete list item

    this.deleteListItems = _deleteListItems; // Method to delete multiple list items

    /* Object settings */
    Object.seal(this); // Seal Object, prevent properties changes
    Object.preventExtensions(this); // Prevent Extension
};