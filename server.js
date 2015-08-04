//Implement tests to this file.

var http = require("http");
var https = require("https");
var url = require("url");
var mongo = require("mongodb").MongoClient;

var parseResponse = function(response, type, object) {
	if ("json") {
		response.setHeader("Content-Type", "application/json; charset=utf-8");
		response.setHeader("Cache-Control", "max-age=1800");
		
		response.end(JSON.stringify(object));
	} else {
		throw "There are no alternatives besides JSON";
	}
}

var addThumbnail = function (post) {
	if (post.featured_thumbnail === undefined && post.featured !== undefined) {
                post.featured_thumbnail = post.featured;
		post.featured = post.featured !== "" ? post.featured.replace("/", "/large_") : "";
	}
}

// It puts the data streaming together. It works only if the chunk is a object that can be represented as string
// callback(data)
var getData = function (response, callback) {
	var data = "";
	
	response.on("data", function(chunk){
		data += chunk;
	}).on("end", function(){
		callback(data);
	})
}

// post is an element in an array. If it is changed the array therefore will be changed.
var addComments = function(post, callback) {
	https.request("https://disqus.com/api/3.0/threads/listPosts.json?forum=droidme&api_key=bMJIKpzdru3dfTmSA02QcGe55tvIlR28tLfS80BiqBmSdbUzNTMo105CmvRweUgN&thread=link:http://ndroidme.com/news.php?article=" + post._id, function(response) {
		getData(response, function(data) {
			data = JSON.parse(data);
			
			if (data.response.length !== 103) // If it is not an disqus error
				post.comments = data.response.length;
			
			callback(post);
		});
	}).on("error", function(){}).end();
}

var apiGET = function(req, res, db) {
	// Improve the regular expression matches
	var posts = db.collection("posts");
	var urlRequest = url.parse(req.url, true);
	var acceptedFields = {};
	var options = {}; //the options to the find method
	
	if (urlRequest.query.fields) {
		var fields = urlRequest.query.fields.toLowerCase().split(",");

		acceptedFields["_id"] = 0; // for default it always is shown. In this API it is only show if the user specify
		for (var i = 0; i < fields.length; i++) {
			acceptedFields[fields[i]] = 1;
		}
		
		options["fields"] = acceptedFields;
	}
	
	if (req.url.match("/posts/[0-9]+")) {
		// TO-DO: Implement the comments
		// Get post by id, show all the information: _id, title, writer, date, thumbnail_image, image content, tags, likes, qnt_comments, 
		
		var id = +url.parse(req.url, true).pathname.match("[0-9]+$")[0];
		posts.findOne({_id: id}, options, function(err, post) {
			if (err) {
				console.error(err);
				res.statusCode = 500;
				parseResponse(res, "json", {error: "It was not possible to retrieve the post(s)."})
				return;
			}
			
			addThumbnail(post);
			
			if ((!options.fields || options.fields.comments)
				&& (!post.cache_expires || new Date().getTime() > +post.cache_expires)) {
				addComments(post, function(post){
					posts.updateOne({_id: post._id}, {$set:{comments: post.comments, cache_expires: new Date().getTime() + 30*60*1000}});
					parseResponse(res, "json", post); // It doesn't need to wait the response from the database
				});
				
			} else {
				parseResponse(res, "json", post);
			}

		});
	} else if (req.url.match("^/posts\??")) {
		// TO-DO: Implement the validation of the requests. only some words are acceptable
		
		// Get a colletion of posts. It should be filtered and sorted by the data received.
		// The response should have: 
		//     sort (default time), order default(1 ascending), limit (default 9, max 100), start (default 0), end (default last post date)

		var urlQuery = urlRequest.query;
		if (urlQuery.tags)
			urlQuery.tags = urlQuery.tags.toUpperCase().split(",");
		
		var fields = ["_id", "content", "date", "featured", "from", "likes", "tags", "time", "title", "writer", "featured_thumbnail", "comments"];
		
		var sort = "time";
		if (urlQuery.sort)
			sort = fields.indexOf(urlQuery.sort.toLowerCase()) !== -1 ? urlQuery.sort.toLowerCase() : sort;
		var order = +((urlQuery.order && urlQuery.order.match("-?[1]") || [1])[0]);
		var limit = +urlQuery.limit > 0 ? +urlQuery.limit : 9; limit = limit > 100 ? 100 : limit;
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
			
		posts.find({"$and": query}, options).sort(sorting).limit(limit).toArray(function(err, documents) {
			if (err) {
				console.error(err);
				res.statusCode = 500;
				parseResponse(res, "json", {error: "It was not possible to retrieve the post(s)."})
				return;
			}
			
			var result = new Object();
			result.sort = sort;
			result.order = order;
			result.limit = limit;
			result.start = start;
			result.end = end;
			result.posts = documents;
			
			
			var postCount = 1; // it starts in 1 because it is ALMOST impossible to be equal updatedPosts at the first iteration.
			var updatedPosts = 0;
			var notUpdated = true;
			for (var i = 0 ; i < documents.length; i++) {
				addThumbnail(documents[i]);
				
				if ((!options.fields || options.fields.comments)
				&& (!result.posts[i].cache_expires || new Date().getTime() > +result.posts[i].cache_expires)) {
					notUpdated = false;
					
					++postCount; // it counts how many posts need to be updated.
					
					addComments(result.posts[i], function(post){
						posts.updateOne({_id: post._id}, {$set:{comments: post.comments, cache_expires: new Date().getTime() + 30*60*1000}});
						if (postCount == ++updatedPosts)
							parseResponse(res, "json", result); // It doesn't need to wait the response from the database
					});
					
				} else {
					continue;
				} --postCount;
			}
			
			if (notUpdated) 
				parseResponse(res, "json", result);
		});
	} else {
		res.statusCode = 400;
		parseResponse(res, "json", {error: "The path is not a valid resource"});
	}
}

// The server start is inside the db start because otherwise it would be necessary to connect the database each time a client connect to the server.
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
