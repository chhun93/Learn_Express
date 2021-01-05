const express = require("express");
const app = express();
const fs = require("fs");
const qs = require("querystring");
const template = require("./lib/template.js");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (request, response) {
  fs.readdir("./data", function (error, filelist) {
    var title = "Welcome";
    var description = "Hello, Node.js";
    var list = template.list(filelist);
    var html = template.HTML(
      title,
      list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.send(html);
  });
});

app.get("/page/:pageId", function (request, response) {
  fs.readdir("./data", function (error, filelist) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ["h1"],
      });
      var list = template.list(filelist);
      var html = template.HTML(
        sanitizedTitle,
        list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a>
                <form action="/delete" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
      );
      response.send(html);
    });
  });
});

app.get("/create", function (request, response) {
  fs.readdir("./data", function (error, filelist) {
    var title = "WEB - create";
    var list = template.list(filelist);
    var html = template.HTML(
      title,
      list,
      `
              <form action="/create" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                  <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
            `,
      ""
    );
    response.send(html);
  });
});

app.post("/create", function (request, response) {
  // var body = "";
  // request.on("data", function (data) {
  //   body = body + data;
  // });
  // request.on("end", function () {
  //   var post = qs.parse(body);
  //   var title = post.title;
  //   var description = post.description;
  //   fs.writeFile(`data/${title}`, description, "utf8", function (err) {
  //     response.redirect(`/page/${title}`);
  //   });
  // });
  //use middleware_bodyParser
  var post = request.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, "utf8", function (err) {
    response.redirect(`/page/${title}`);
  });
});

app.get("/update/:pageId", function (request, response) {
  fs.readdir("./data", function (error, filelist) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, "utf8", function (error2, description) {
      var title = request.params.pageId;
      var list = template.list(filelist);
      var html = template.HTML(
        title,
        list,
        `
            <form action="/update" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
        `<a href="/create">create</a> <a href="/update/${title}">update</a>`
      );
      response.send(html);
    });
  });
});

app.post("/update", function (request, response) {
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      response.redirect(`/page/${title}`);
    });
  });
});

app.post("/create", function (request, response) {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      response.redirect(`/page/${title}`);
    });
  });
});

app.post("/delete", function (request, response) {
  var post = request.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (error) {
      response.redirect("/");
    });
});

app.listen(3000, () => console.log("express app listening on port 3000"));
