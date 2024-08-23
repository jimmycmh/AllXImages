// ==UserScript==
// @name         All X Images
// @namespace    http://tampermonkey.net/
// @version      2024-08-22
// @description  Download all original images on X media time-line
// @author       Jimmy Chen
// @match        https://x.com/*/media*
// @match        https://twitter.com/*/media*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        GM_download
// @run-at       document-idle

// ==/UserScript==

let user = '';
let lastHeight = 0;
let observer = new MutationObserver(resetTimer);
let timer = setTimeout(action, 3000, observer);
let images = {};

function addButton(text, onclick, cssObj, id) {
    const defaultCSS = {position: 'fixed', top: '7%', left:'50%', 'z-index': 3,
                        "background-color": "#57cff7", "color": "white",
                        "padding": "10px", "border": "0px",
                        "font-size": "1rem","font-weight": "bold" }
    cssObj = Object.assign(defaultCSS, cssObj || {} )
    let button = document.createElement('button'), btnStyle = button.style;
    document.body.appendChild(button)
    button.innerHTML = text;
    button.onclick = onclick
    btnStyle.position = 'fixed';
    button.id = id;
    Object.keys(cssObj).forEach(key => btnStyle[key] = cssObj[key]);
    return button;
}

function resetTimer(changes, observer) {
    clearTimeout(timer);
    timer = setTimeout(action, 3000, observer);
    console.log("change detected. document height: " + document.body.scrollHeight);

}

function scrollToBottom() {
    console.log("scroll to " + document.body.scrollHeight);
    window.scrollTo(0, document.body.scrollHeight);
}

function action(observer) {
    scrollToBottom()
    if (lastHeight === document.body.scrollHeight) {
        observer.disconnect();
        downloadAllImgs();
        return;
    }
    lastHeight = document.body.scrollHeight;
    getImageUrl();
}

function getImageUrl() {
    document.querySelectorAll('li[role="listitem"] img').forEach(image => {
        let url = URL.parse(image.src);
        let path = url.pathname.split('/').pop();
        let ext = url.searchParams.get('format');
        let name = user + '-' + path + '.' + ext;
        url.searchParams.set('name', 'large');
        images[name] = url.href;
    });
}

function downloadAllImgs() {
    Object.keys(images).forEach(key => {
        GM_download(images[key], key);
    });
}

function begin() {
    observer.observe(document, {childList: true, subtree: true});
    scrollToBottom();
}

(function() {
    'use strict';

    addButton("download all images", begin, {top: '7%'}, "a-begin-button");


    let fields = window.location.pathname.split('/');
    user = fields[1];
})();
