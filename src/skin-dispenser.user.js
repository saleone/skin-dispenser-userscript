// ==UserScript==
// @name Skin Dispenser
// @namespace https://steamcommunity.com/
// @author Saša Savić <sasa.savic@protonmail.com>
// @description Accepts all empty trade offers (that make you money).
// @version 1.0.0
// @include https://steamcommunity.com/id/*/tradeoffers/
// @include https://steamcommunity.com/tradeoffers
// @include https://steamcommunity.com/tradeoffer/*
// @include http://steamcommunity.com/id/*/tradeoffers/
// @grant window.close()
// ==/UserScript==

console.log("Starting Skin Dispenser.");

// Constants
var checkTradesDelay = 1000 * 2; // miliseconds to recheck trades
var checkTradeDelay  = 1000 * 2; // miliseconds to recheck if the trade is loaded
var clickAcceptDelay = 1000 * 1; // miliseconds to wait to click the accept button after clicking the confirm button

// Extend array so it can search for values contained in itself
Array.prototype.contains = function (value) {
    for (var i in this) {
        if (this[i] == value) {
            return true;
        }
    }
    return false;
};

// Tracked URLs
var tradeOffersRegex  = "http(s)?\:\/\/steamcommunity\.com\/id\/[a-zA-Z0-9]+\/tradeoffers[\/]?";
var tradeOfferRegex   = "http(s)?\:\/\/steamcommunity\.com\/tradeoffer\/[0-9]+[\/]?";
var tradeReceiptRegex = "http(s)?\:\/\/steamcommunity\.com\/trade\/[0-9]+\/receipt";

var pageUrl = window.location.href;

// Execute only if on wanted page
if (pageUrl.match(tradeOffersRegex)) {
        console.log("Skin Dispenser: on trade offers page.");
        setInterval(function () {
            // Get the list of all the trades.
            var tradeOffers = document.querySelectorAll(".tradeoffer");
            for (var i = 0; i < tradeOffers.length; i++) {
                // Check all the trade offers to find empty ones.
                var tradeOffer  = tradeOffers[i];
                var itemsToGive = tradeOffer.querySelectorAll(".secondary>div.tradeoffer_item_list>div.trade_item");
                var itemsToGet  = tradeOffer.querySelectorAll(".primary>div.tradeoffer_item_list>div.trade_item");
                if (itemsToGive.length === 0) {
                    // Check if the trade is bugged (error 28)
                    if (!itemsToGet[0].getAttribute("style") ||
                        itemsToGet[0].classList.contains("missing")) {
                        // Skip the items if its bugged (described in #1).
                        continue;
                    } else {
                        // We found some free skins. Let's get them.
                        tradeOffer.querySelector(".link_overlay").click();
                    }
                }
            }
            // Reload the page to find new trades.
            location.reload();
        }, checkTradesDelay);
} else if (pageUrl.match(tradeOfferRegex)) {
    console.log("Skin Dispenser: on specific trade page.");
    // Get all the items in the trade.
    if (document.querySelector("#error_msg")) {
         // If there is not offer, close the window.
         window.close();
    }
    setInterval(function () {

        var yourItems = document.querySelectorAll("#trade_yours>div.trade_item_box>div#your_slots>div.has_item");
        if (yourItems.length === 0) {
           document.querySelector("#you_notready").click();
           sleep(clickAcceptDelay);
           var reportedButton = document.querySelector("body>div.newmodal>div.newmodal_content_border>div>div.newmodal_buttons>div.btn_green_white_innerfade.btn_medium");
           if (reportedButton) {
               // If sender is reported, we don't care. Get 'em all.
               reportedButton.click();
               sleep(clickAcceptDelay);
           }
           document.querySelector("#trade_confirmbtn").click();
    }}, checkTradeDelay);
} else if (pageUrl.match(tradeReceiptRegex)) {
    // This has a chance to close all recipts pages, but it shouldn't (because the script can close only windows it opened).
    window.close();
}

function sleep(ms)
{
    // Stop the execution of the script for specified time.
    var dt = new Date();
    dt.setTime(dt.getTime() + ms);
    while (new Date().getTime() < dt.getTime());
}