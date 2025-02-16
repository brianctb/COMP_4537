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

  displaySuccessMessage(message) {
    this.textAreaResults.style.color = "black";
    this.textAreaResults.innerHTML = message;
  }

  displayError(message) {
    this.textAreaResults.style.color = "red";
    this.textAreaResults.innerHTML = `Error: ${message}`;
  }

  displayRows(rows) {
    this.textAreaResults.style.color = "black";
    let table =
      "<table border='1'><tr><th>Patient ID</th><th>Name</th><th>Date of Birth</th></tr>";
    rows.forEach((row) => {
      table += `<tr>
                        <td>${row.patientid}</td>
                        <td>${row.name}</td>
                        <td>${new Date(
                          row.dateOfBirth
                        ).toLocaleDateString()}</td>
                    </tr>`;
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
        this.displaySuccessMessage(response.message);
      } else if (xhttp.readyState == 4 && xhttp.status == 404) {
        let response = JSON.parse(xhttp.responseText);
        this.displayError(response.error);
      }
    };
  }

  submitQuery() {
    let query = this.textArea.value;
    if (query === "") {
      this.displayError("Please enter a SQL query");
      return;
    }

    // check if the query is an insert or select query
    if (query.toLowerCase().includes("insert")) {
      this.insertData(query);
    } else if (query.toLowerCase().includes("select")) {
      this.selectData(query);
    } else {
      this.displayError("Error: Invalid SQL query");
    }
  }

  insertData(query) {
    const xhttp = new XMLHttpRequest();
    xhttp.open(
      "POST",
      `https://comp-4537-1-xeb8.onrender.com/api/v1/sql/?query=${query}`,
      true
    );
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.send(JSON.stringify(query));

    xhttp.onreadystatechange = () => {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        let response = JSON.parse(xhttp.responseText);
        this.displaySuccessMessage(response.message);
      } else if (xhttp.readyState == 4 && xhttp.status == 400) {
        let response = JSON.parse(xhttp.responseText);
        this.displayError(response.error);
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
        this.displayError(response.error);
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
      console.log("submitting query");
      this.submitQuery();
    });
  }
}

const client = new Client();
client.addDefaultDataListener();
client.addSubmitQueryListener();

// SELECT * FROM patients
