"use strict";
exports.__esModule = true;
exports.requests = exports.pageDetails = void 0;
var request_promise_native_1 = require("request-promise-native");
var gzip_size_1 = require("gzip-size");
exports.pageDetails = {
    html: [],
    javascript: [],
    css: [],
    image: [],
    video: [],
    font: [],
    other: []
};
var hasExtension = function (string, extension) {
    var stringArray = string.split("/");
    if (stringArray.length > 0) {
        return stringArray[stringArray.length - 1].includes(extension);
    }
};
var requests = function (request) {
    (0, request_promise_native_1["default"])({
        uri: request.url(),
        resolveWithFullResponse: true
    })
        .then(function (response) {
        var request_url = request.url();
        var request_headers = request.headers();
        var request_post_data = request.postData();
        var response_headers = response.headers;
        var response_size = response_headers["content-length"];
        var response_type = response_headers["content-type"];
        var response_body = response.body;
        // SET totalPageRequests
        // HTML
        if (response_type.includes("text/html")) {
            return addDetail("html");
        }
        // JS
        // console.log(response_type);
        if (response_type.includes("javascript") ||
            hasExtension(request_url, ".js")) {
            return addDetail("javascript");
        }
        // CSS
        if (response_type.includes("text/css")) {
            return addDetail("css");
        }
        // IMG
        if (response_type.includes("image")) {
            return addDetail("image");
        }
        // Video
        if (response_type.includes("video")) {
            return addDetail("video");
        }
        // Font
        if (response_type.includes("font")) {
            return addDetail("font");
        }
        // Other
        return addDetail("other");
        function addDetail(field) {
            exports.pageDetails[field].push({
                url: request_url,
                resourceSize: parseInt(response_size) || 0,
                transferSize: (0, gzip_size_1.gzipSizeSync)(response_body)
            });
            request["continue"]();
        }
    })["catch"](function (error) {
        // console.error(error);
        request.abort();
    });
};
exports.requests = requests;
