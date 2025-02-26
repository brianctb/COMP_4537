// Code assisted with ChatGPT

import { en } from "../lang/message/en/user.js";

const people = [
    { name: "Sara Brown", dob: "1901-01-01" },
    { name: "John Smith", dob: "1941-01-01" },
    { name: "Jack Ma", dob: "1961-01-30" },
    { name: "Elon Musk", dob: "1999-01-01" },
];

document.getElementById("DocumentTitle").innerHTML = en.DocumentTitle;
document.getElementById("PageTitle").innerHTML = en.PageTitle;
document.getElementById("DefaultDataTitle").innerHTML = en.DefaultDataTitle;
document.getElementById("DefaultDataButton").innerHTML = en.DefaultDataButton;
document.getElementById("TextAreaTitle").innerHTML = en.TextAreaTitle;
document.getElementById("TextAreaButton").innerHTML = en.TextAreaButton;

class Client {
    constructor() {
        this.defaultDataButton = document.getElementById("DefaultDataButton");
        this.defaultDataMsg = document.getElementById("DefaultDataMsg");
        this.textAreaButton = document.getElementById("TextAreaButton");
        this.textArea = document.getElementById("TextAreaInput");
        this.textAreaResults = document.getElementById("TextAreaResults");
    }

    displayTextAreaSuccessMessage(message) {
        this.textAreaResults.style.color = "black";
        this.textAreaResults.innerHTML = message;
    }

    displayDefaultDataSuccessMessage(message) {
        this.defaultDataMsg.style.color = "black";
        this.defaultDataMsg.innerHTML = message;
    }

    displayTextAreaError(message) {
        this.textAreaResults.style.color = "red";
        this.textAreaResults.innerHTML = `${message}`;
    }

    displayDefaultDataError(message) {
        this.textAreaResults.style.color = "red";
        this.textAreaResults.innerHTML = `${message}`;
    }

    displayRows(rows) {
        this.textAreaResults.style.color = "black";
        // Get the column names from the keys of the first object
        const columns = Object.keys(rows[0]);

        // Create the table headers
        let table = "<table class='SelectResultsTable'><tr>";
        columns.forEach(column => {
            table += `<th>${column}</th>`;
        });
        table += "</tr>";

        // Create the table rows
        rows.forEach(row => {
            table += "<tr>";
            columns.forEach(column => {
                if (column === "dateOfBirth") {
                    row[column] = new Date(row[column]).toLocaleDateString();
                }
                table += `<td>${row[column]}</td>`;
            });
            table += "</tr>";
        });
        table += "</table>";

        this.textAreaResults.innerHTML = table;
    }

    insertDefaultData() {
        const xhttp = new XMLHttpRequest();
        xhttp.open(
            "POST",
            `https://comp-4537-1-xeb8.onrender.com/api/v1/sql`,
            true
        );
        xhttp.setRequestHeader("Content-Type", "application/json");

        xhttp.send(JSON.stringify(people));

        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                this.displayDefaultDataSuccessMessage(response.message);
            } else if (xhttp.readyState == 4 && xhttp.status == 404) {
                let response = JSON.parse(xhttp.responseText);
                this.displayDefaultDataError(response.error);
            }
        };
    }

    submitQuery() {
        let query = this.textArea.value;
        if (query === "") {
            this.displayTextAreaError(en.NoSQLMessage);
            return;
        }

        // check if the query is an insert or select query
        if (query.toLowerCase().includes("insert")) {
            this.insertData(query);
        } else if (query.toLowerCase().includes("select")) {
            this.selectData(query);
        } else {
            this.displayTextAreaError(`Error: ${en.InvalidSQLMessage}`);
        }
    }

    insertData(query) {
        const xhttp = new XMLHttpRequest();
        xhttp.open(
            "POST",
            `https://comp-4537-1-xeb8.onrender.com/api/v1/sql`,
            true
        );
        xhttp.setRequestHeader("Content-Type", "application/json");

        xhttp.send(JSON.stringify(query));

        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                this.displayTextAreaSuccessMessage(response.message);
            } else if (xhttp.readyState == 4 && xhttp.status == 400) {
                let response = JSON.parse(xhttp.responseText);
                this.displayTextAreaError(response.message);
            }
        };
    }

    selectData(query) {
        const xhttp = new XMLHttpRequest();
        xhttp.open(
            "GET",
            `https://comp-4537-1-xeb8.onrender.com/api/v1/sql/?query=${query}`,
            true
        );
        xhttp.send();
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                this.displayRows(response.rows);
            } else if (xhttp.readyState == 4 && xhttp.status == 400) {
                let response = JSON.parse(xhttp.responseText);
                this.displayTextAreaError(response.error);
            } else if (xhttp.readyState == 4 && xhttp.status == 500) {
                let response = JSON.parse(xhttp.responseText);
                this.displayTextAreaError(response.message.message);
            }
        };
    }

    addDefaultDataListener() {
        this.defaultDataButton.addEventListener("click", () => {
            this.insertDefaultData();
        });
    }

    addSubmitQueryListener() {
        this.textAreaButton.addEventListener("click", () => {
            this.submitQuery();
        });
    }
}

const client = new Client();
client.addDefaultDataListener();
client.addSubmitQueryListener();

// SELECT * FROM patients

// INSERT INTO patients (name, dateOfBirth) VALUES ('John Doe', '1990-01-01')

// DROP TABLE patients

// DELETE FROM patients WHERE name = 'John Doe' AND dateOfBirth = '1990-01-01'