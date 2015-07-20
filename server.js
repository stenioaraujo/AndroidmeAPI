//Implement tests to this file.

var http = require("http");
var url = require("url");
var mongo = require("mongodb").MongoClient;

var parseResponse = function(response, type, object) {
	if ("json") {
		response.setHeader("Content-Type", "application/json; charset=utf-8");
		
		response.end(JSON.stringify(object));
	} else {
		throw "There are no alternatives besides JSON";
	}
}

var apiGET = function(req, res, db) {
	// Improve the regular expression matches
	var posts = db.collection("posts");
	
	if (req.url.match("/posts/[0-9]+")) {
		// TO-DO: Implement the qnt_comments
		// Get post by id, show all the information: _id, title, writer, date, thumbnail_image, image content, tags, likes, qnt_comments, 

		var id = +req.url.match("[0-9]+$")[0];
		posts.findOne({_id: id}, function(err, post) {
			post.featured_thumbnail = post.featured;
			post.featured = post.featured.replace("/", "/large_");
			
			parseResponse(res, "json", post);
		});
	} else if (req.url.match("^/posts\??")) {
		// TO-DO: Implement the validation of the requests. only some words are acceptable
		
		// Get a colletion of posts. It should be filtered and sorted by the data received.
		// The response should have: 
		//     sort (default time), order default(1 ascending), limit (default 9, max 100), start (default 0), end (default last post date)
		
		var urlQuery = url.parse(req.url, true).query;
		if (urlQuery.tags)
			urlQuery.tags = urlQuery.tags.toUpperCase().split(",");
		
		var sort = (urlQuery.sort || "time").toLowerCase();
		var order = +((urlQuery.order && urlQuery.order.match("-?[1]") || [1])[0]);
		var limit = +urlQuery.limit || 9;
		var start = +urlQuery.start || 0;
		var end = +urlQuery.end || new Date().getTime();
		var tags = urlQuery.tags || [];
		var writer = (urlQuery.writer || "").toLowerCase();
		
		var sorting = {};
			sorting[sort] = order;
		
		var query = []; // Read about $elemMatch and $and on Mongo's documentation.
			query.push({date: {"$gte": start, "$lte": end}});
		if (writer)
			query.push({writer: writer});
		if (tags.length > 0) {
			tags.forEach(function(tag) {
				query.push({tags: tag}); // It will select only the posts that has all the tags 
			});
		}
			
		posts.find({"$and": query}).sort(sorting).limit(limit).toArray(function(err, documents) {
			var result = new Object();
			result.sort = sort;
			result.order = order;
			result.limit = limit;
			result.start = start;
			result.end = end;
			result.posts = documents;
			
			parseResponse(res, "json", result);
		});
	} else {
		res.statusCode = 400;
		parseResponse(res, "json", {error: "The path is not a valid resource"});
	}
}

// The the server starts is inside the db starts because otherwise it would be necessary to connect the database each time a client connect to the server.
// process.argv[3] is the second argument when one starts the script.
var mongoServer = process.argv[3] ? process.argv[3] : "mongodb://localhost:27017/posts";
mongo.connect(mongoServer, function(err, db) {
	if (err) throw err;
	
	var server = http.createServer(function(req, res) {
		if (req.method === "GET") {
			apiGET(req, res, db);
		} else {
			res.statusCode = 400;
			parseResponse(res, "json", {error: "The server only accepts GET requests."});
		}
	});

	//It listen the port 8080 for default. It is the first argument when one starts the script.
	var port = process.argv[2] ? Number(process.argv[2]) : 8080;
	server.listen(port);
	
	console.log("You may change the port of the server and the Mongo database by changing the second and third argument when initializing the server respectively. ");
	console.log("nodejs server.js 8080 mongodb://localhost:27017/posts");
	console.log();
	console.log("Server listening the port " + port + "\nSuccessful connected! to the DB at  " + mongoServer);
});
