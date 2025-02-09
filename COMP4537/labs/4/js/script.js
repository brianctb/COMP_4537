import { en } from "../lang/messages/en/user.js";

class Search {
    constructor() {
        this.word = document.getElementById("SearchInput");
        this.searchButton = document.getElementById("SearchButton");
        this.searchResults = document.getElementById("SearchResults");
    }

    displayResults(word, definition) {
        this.searchResults.style.color = "black";
        this.searchResults.innerHTML = `Word: ${word}<br>Definition: ${definition}`;
    }

    displayError(message) {
        this.searchResults.style.color = "red";
        this.searchResults.innerHTML = `Error: ${message}`
    }

    search() {
        let word = this.word.value;
        if (word === "") {
            this.displayError(en.SearchErrorMessage);
            return;
        }

        if (/\d/.test(word)) {
            this.displayError(`Word ${en.NumberErrorMessage}`);
            return;
        }

        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", `https://comp-4537-qdmp.onrender.com/api/definitions/?word=${word}`, true);
        xhttp.send();
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                this.displayResults(response.word, response.definition);

            } else if (xhttp.readyState == 4 && xhttp.status == 404) {
                let response = JSON.parse(xhttp.responseText);
                this.displayError(response.message);
            }
        };
    }

    addSearchListener() {
        this.searchButton.addEventListener("click", () => {
            this.search();
        });
    }
}

class Store {
    constructor() {
        this.word = document.getElementById("StoreWordInput");
        this.definition = document.getElementById("StoreDefinitionInput");
        this.storeButton = document.getElementById("StoreButton");
        this.storeResults = document.getElementById("StoreResults");
    }

    displaySuccess(message) {
        this.storeResults.style.color = "black";
        this.storeResults.innerHTML = `Success: ${message}`;
    }

    displayError(message) {
        this.storeResults.style.color = "red";
        this.storeResults.innerHTML = `Error: ${message}`;
    }

    store() {
        let word = this.word.value;
        let definition = this.definition.value;
        if (word === "" || definition === "") {
            this.displayError(en.StoreErrorMessage);
            return;
        }

        if (/\d/.test(word) || /\d/.test(definition)) {
            this.displayError(`Word and Definition ${en.NumberErrorMessage}`);
            return;
        }

        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", "https://comp-4537-qdmp.onrender.com/api/definitions", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify({ word: word, definition: definition }));
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 201) {
                let response = JSON.parse(xhttp.responseText);
                this.displaySuccess(response.message);
            } else if (xhttp.readyState == 4 && xhttp.status == 400) {
                let response = JSON.parse(xhttp.responseText);
                this.displayError(response.error);
            }
        };
    }

    addStoreListener() {
        this.storeButton.addEventListener("click", () => {
            this.store();
        });
    }
}

document.getElementById("DocumentTitle").innerHTML = en.DocumentTitle;

document.getElementById("PageTitle").innerHTML = en.PageTitle;
document.getElementById("SearchTitle").innerHTML = en.SearchTitle;
document.getElementById("SearchWordLabel").innerHTML = en.WordLabel;
document.getElementById("SearchButton").innerHTML = en.SearchButton;

document.getElementById("StoreTitle").innerHTML = en.StoreTitle;
document.getElementById("StoreWordLabel").innerHTML = en.WordLabel;
document.getElementById("StoreDefinitionLabel").innerHTML = en.DefinitionLabel;
document.getElementById("StoreButton").innerHTML = en.StoreButton;

const search = new Search();
search.addSearchListener();

const store = new Store();
store.addStoreListener();