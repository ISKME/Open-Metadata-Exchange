// ==UserScript==
// @name         OME Integration
// @namespace    http://tampermonkey.net/
// @version      2024-08-03
// @description  try to take over the world!
// @author       You
// @match        http://oercommons.localhost:8000/courses/*
// @match        http://oercommons.localhost:8000/courseware/lesson/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=oercommons.localhost
// @grant        none
// ==/UserScript==

$(function() {
    'use strict';

    $("a.view-resource-link").parent().append("<a class='ome-share-btn btn btn-primary' href='#'>Share on OME</a>");

    $("a.ome-share-btn").click(function() {
        var meta = {
            "title": $("h1.material-title a").text(),
            "url": $("a.view-resource-link").attr("href"),
            "description": $("dd[itemprop=description]").text(),
            "subject": $("span[itemprop=about]").text(),
            "author": $("span[itemprop=name]").text(),
            "alignment_tags": $("a.alignment-tag-link").map(function() { return $(this).text(); }).get(),
            "keywords": $("li.tag-instance.keyword a").map(function() { return $(this).text(); }).get()
        };

        var data = {
            "channels": [
                "oer.public",
            ],
            "subject": meta["title"],
            "body": meta
        };
        $.ajax({
            type: 'post',
            url: "//localhost:5001/api/publish",
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            traditional: true,
            success: function (data) {
                console.log("Posted...");
            }
        });
        return false;
    });
});
