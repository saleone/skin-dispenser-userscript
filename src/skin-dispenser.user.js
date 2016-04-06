// ==UserScript==
// @name Skin Dispenser
// @namespace https://steamcommunity.com/
// @author Saša Savić <sasa.savic@protonmail.com>
// @description Accepts all empty trade offers (that make you money).
// @version 1.0.0
// @include https://steamcommunity.com/id/*/tradeoffers/
// @include https://steamcommunity.com/tradeoffer/*
// @include http://steamcommunity.com/id/*/tradeoffers/
// @grant none
// ==/UserScript==

console.log("Starting Skin Dispenser.");

// TODO: Sometimes after the trade is accepted receipt page is shown, make a handler to close it 
//       or leave it for info (Users of the script what should I do ???).

// Constants
var checkTradesDelay = 1000 * 2; // miliseconds to recheck trades
var checkTradeDelay  = 1000 * 2; // miliseconds to recheck if the trade is loaded
var clickAcceptDelay = 1000 * 1; // miliseconds to wait to click the accept button after clicking the confirm button

// Tracked URLs
var tradeOffersRegex = "http(s)?\:\/\/steamcommunity\.com\/id\/[a-zA-Z0-9]+\/tradeoffers[\/]?";
var tradeOfferRegex  = "http(s)?\:\/\/steamcommunity\.com\/tradeoffer\/[0-9]+[\/]?";

var pageUrl = window.location.href;

// Execute only if on wanted page
if (pageUrl.match(tradeOffersRegex)) {
        console.log("Skin Dispenser: on trade offers page.");
        setInterval(function () {
            // Get the list of all the trades.
            var tradeOffers = document.querySelectorAll(".tradeoffer");
            for (var i = 0; i < tradeOffers.length; i++) {
                // Check all the trade offers to find empty ones.
                var tradeOffer = tradeOffers[i];
                var itemsToGet = tradeOffer.querySelectorAll(".secondary>div.tradeoffer_item_list>div.trade_item");
                if (itemsToGet.length === 0) {
                    // We found some free skins. Let's get them.
                    tradeOffer.querySelector(".link_overlay").click();
                }
            }
            // Reload the page to find new trades.
            location.reload();
        }, checkTradesDelay);
} else if (pageUrl.match(tradeOfferRegex)) {
    console.log("Skin Dispenser: on specific trade page.");
    // Get all the items in the trade.
    setInterval(function () {
        var yourItems = document.querySelectorAll("#trade_yours>div.trade_item_box>div#your_slots>div.has_item");
        if (yourItems.length === 0) { 
           document.querySelector("#you_notready").click();
           sleep(clickAcceptDelay); // TODO: Add automatic check to see if the confirmation was done correctly.
           document.querySelector("#trade_confirmbtn").click();
    }}, checkTradeDelay); 
    // NOTE: This works in tests, but it's not robust as I would like for it to be. 
    //       Find a way to just check if all items we're loaded.

}

function sleep(ms)
{
    // Stop the execution of the script for specified time.
    var dt = new Date();
    dt.setTime(dt.getTime() + ms);
    while (new Date().getTime() < dt.getTime());
}
