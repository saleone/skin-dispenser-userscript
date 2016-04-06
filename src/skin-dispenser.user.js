// ==UserScript==
// @name Skin Dispenser
// @namespace https://steamcommunity.com/
// @author Saša Savić <sasa.savic@protonmail.com>
// @description Accepts all empty trade offers (that make you money).
// @version 0.0.1
// @include https://steamcommunity.com/id/*/tradeoffers/
// @include https://steamcommunity.com/tradeoffer/*
// @grant none
// ==/UserScript==

console.log("Starting Skin Dispenser.");

// Tracked URLs
var tradeOffersRegex = "http(s)?\:\/\/steamcommunity\.com\/id\/[a-zA-Z0-9]+\/tradeoffers[\/]?";
var tradeOfferRegex  = "http(s)?\:\/\/steamcommunity\.com\/tradeoffer\/[0-9]+[\/]?";

var pageUrl = window.location.href

// Execute only if on wanted page
if (pageUrl.match(tradeOffersRegex)) {
    alert("On trades page.");

} else if (pageUrl.match(tradeOfferRegex)) {
    alert("On single trade page.");

}

