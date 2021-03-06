// ==UserScript==
// @name Skin Dispenser
// @namespace https://steamcommunity.com/
// @author Saša Savić <sasa.savic@protonmail.com>
// @description Accepts all empty trade offers (that make you money).
// @version 1.3.0
// @include https://steamcommunity.com/tradeoffer*
// @include https://steamcommunity.com/tradeoffer/*
// @include https://steamcommunity.com/id/*/tradeoffers*
// @grant window.close()
// ==/UserScript==

console.log("Starting Skin Dispenser.");

// Constants
var checkTradesDelay = 1000 * 1; // miliseconds to recheck trades
var checkTradeDelay = 1000 * 2; // miliseconds to recheck if the trade is loaded
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
var tradeOffersRegexActive = "https?\:\/\/steamcommunity\.com\/id\/[a-zA-Z0-9]+\/tradeoffers\/?\\?dispenser";
var tradeOffersRegex = "https?\:\/\/steamcommunity\.com\/id\/[a-zA-Z0-9]+\/tradeoffers\/?";
var tradeOfferRegex = "https?\:\/\/steamcommunity\.com\/tradeoffer\/[0-9]+[\/]?";
var tradeReceiptRegex = "https?\:\/\/steamcommunity\.com\/trade\/[0-9]+\/receipt";

var pageUrl = window.location.href;

// How many trades have been already checked.
var tradesChecked = 0;

// Execute only if on wanted page
if (pageUrl.match(tradeOffersRegex)) {
    var dispenseUrl = pageUrl + "?dispenser"
    aDispense = document.createElement("a");
    aDispense.id = "dispense-button";
    aDispense.className = "btn_darkblue_white_innerfade btn_medium new_trade_offer_btn responsive_OnClickDismissMenu";
    aDispense.innerHTML = "Start dispenser";
    aDispense.style = "margin-top: 12px";
    aDispense.href = dispenseUrl;
    aDispense.addEventListener("click", function () {
        window.location.href = dispenseUrl;
    });
    document.querySelector(".rightcol_controls_content").appendChild(aDispense);

} else if (pageUrl.match(tradeOffersRegexActive)) {
    console.log("Skin Dispenser (active): on trade offers page.");
    setInterval(function () {
        var httpRequest = new XMLHttpRequest();
        httpRequest.addEventListener("load", checkTrades);
        httpRequest.open("GET", window.location.href, true);
        httpRequest.send();
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
            // Buttons are dynamicaly generated so we need to wait for them
            // to get them appear in the DOM.
            setTimeout(function () {
                var reportedButton = document.querySelector("body>div.newmodal>div.newmodal_content_border>div>div.newmodal_buttons>div.btn_green_white_innerfade.btn_medium");
                if (reportedButton) {
                    // If sender is reported, we don't care. Get 'em all.
                    reportedButton.click();
                    setTimeout(function () {
                        document.querySelector("#trade_confirmbtn").click();
                    }, clickAcceptDelay);
                } else {
                    document.querySelector("#trade_confirmbtn").click();
                }
            }, clickAcceptDelay);
        }
    }, checkTradeDelay);
} else if (pageUrl.match(tradeReceiptRegex)) {
    // This has a chance to close all recipts pages, but it shouldn't (because the script can close only windows it opened).
    window.close();
}

function checkTrades() {
    var htmlParser = new DOMParser();
    var doc = htmlParser.parseFromString(this.responseText, "text/html");

    // Get the list of all the trades.
    var tradeOffers = doc.querySelectorAll(".tradeoffer");
    for (var i = 0; i < (tradeOffers.length - tradesChecked); i++) {
        // Check all the trade offers to find empty ones.
        var tradeOffer = tradeOffers[i];
        var itemsToGive = tradeOffer.querySelectorAll(".secondary>div.tradeoffer_item_list>div.trade_item");
        var itemsToGet = tradeOffer.querySelectorAll(".primary>div.tradeoffer_item_list>div.trade_item");
        if (itemsToGive.length === 0) {
            // Check if the trade is bugged (error 28)
            if (!itemsToGet[0].getAttribute("style") ||
                itemsToGet[0].classList.contains("missing")) {
                // Skip the items if its bugged (described in #1).
                tradesChecked += 1;
                continue;
            } else {
                // We found some free skins. Let's get them.
                var tradeId = tradeOffer.getAttribute("id").split("_")[1];
                console.log("Opening trade with ID: " + tradeId);
                window.open("https://steamcommunity.com/tradeoffer/" + tradeId);
            }
        }
        tradesChecked += 1;
    }
}