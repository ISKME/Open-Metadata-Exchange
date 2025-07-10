// ==UserScript==
// @name         BioQuestCUBES
// @namespace    http://tampermonkey.net/
// @version      2025-06-09
// @description  Export to the OME
// @author       You
// @match        https://qubeshub.org/publications/*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
    'use strict';

    $("div.title h2").append("<a class='ome-share-btn btn btn-primary' href='#'>Share on OME</a>");

    $("a.ome-share-btn").click(function() {
        console.log("Submit URL: " + document.location);
        var data = {
            "url": document.location.href,
        };

        GM.xmlHttpRequest({
            method: "POST",
            url: "http://localhost:4000/api/publish_url",
            data: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            onload: function(response) {
                console.log("Posted...");
                console.log(data);
            },
            onerror: function(response) {
                console.log("Error...");
            }
        });

        return false;
    });
})();
