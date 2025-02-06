const { ROUTES } = require("./routes");
const http = require("http");
const url = require("url");

class Dictionary {
  constructor() {
    this.dict = {};
  }

  add_word = (word, definition) => {
    this.dict[word] = definition;
  };

  get_definition = (word) => this.dict?.[word];
}

class APIServer {
  constructor(port) {
    this.port = port || 8080;
    this.dictionary = new Dictionary();
    this.numberOfReq = 0;
    this.routes = {};
  }

  add_route = (route, handler) => {
    this.routes[route] = handler;
  };

  start() {
    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      const routeHandler = this.routes[parsedUrl.pathname];
      if (routeHandler) {
        routeHandler(req, res);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("404 Not Found");
        res.end();
      }
    });

    server.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

const apiServer = new APIServer(8080);
apiServer.add_route(ROUTES.DEFINITION, (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      const word = data.word;
      const definition = data.definition;

      if (!word || !definition) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Word and definition are required" }));
        return;
      }

      if (apiServer.dictionary.dict[word]) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Warning! Such word already exists in the dictionary",
          })
        );
        return;
      }

      apiServer.numberOfReq++;
      apiServer.dictionary.add_word(word, definition);
      const currentDate = new Date();
      const day = currentDate.getDate();
      const month = currentDate.toLocaleString("en-US", { month: "short" });
      const formattedDate = `${month}${day}`;
      const response = `Request # ${apiServer.numberOfReq}
        (updated on ${formattedDate})
        Current dictionary size: ${Object.keys(apiServer.dictionary).length}
      
        New entry recorded:
        
        "${word}:${definition}"`;
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: response,
        })
      );
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error }));
    }
  });
});

apiServer.add_route(ROUTES.DEFINITION + "/", (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const word = parsedUrl.query.word;

  if (!word) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Word parameter is required" }));
    return;
  }

  const definition = apiServer.dictionary.get_definition(word);

  if (definition) {
    apiServer.numberOfReq++;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ [word]: definition, numberOfReq: apiServer.numberOfReq })
    );
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Word not found" }));
  }
});
apiServer.start();
