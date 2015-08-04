var expect = require("chai").expect;
var assert = require("chai").assert;
var http = require("http");
//var server = require("../server.js"); // find out a way of starting and stoping the server throug methods

// It puts the data streaming together. It works only if the chunk is a object that can be represented as string
// callback(data)
function getData(response, callback) {
	var data = "";
	
	response.on("data", function(chunk){
		data += chunk;
	}).on("end", function(){
		callback(data);
	})
}

describe("Android.me API", function() {
  	this.timeout(20*1000);
  	var fields = ["_id", "content", "date", "featured", "from", "likes", "tags", "time", "title", "writer", "featured_thumbnail", "comments", "cache_expires"];
	var defaultFilters = ["sort", "order", "imit", "start", "writer", "tags"];
	
	beforeEach(function() {
  		
		this.options = {
			hostname: "www.ndroidme.com",
			port: 8080,
			method: "GET",
			path: "/", //It should be changed to each differnt query and path
			header: {
				keepAlive: true
			}
		};
		
	});
	
	describe("/posts/{post_id}", function() {
		it("should only work with get requests", function(done) {
			this.options.method = "POST";
			
			http.request(this.options, function(res) {
				expect(res.statusCode).to.be.equal(400);
				
				done();
			}).on("error", function(){
				expect.fail();
			}).end();
		});

		it("should send a JSON response", function(done){
			http.request(this.options, function(res){
				expect(res.headers).to.have.a.property("content-type");
				expect(res.headers["content-type"]).to.have.string("application/json");
				
				done();
			}).on("error", function(error){
				expect.fail();
			}).end();
		});
		
		it("should retrieve the post of a specific ID", function(done) {
			this.options.path = "/posts/0";
			
			http.request(this.options, function(res){
				getData(res, function(data){
					expect(data).to.have.string("<p>Dear user,</p>  <p>We are very proud and extremely happy to introduce you our new website");
					
					done();
				});
			}).on("error", function() {
			    expect().fail();
			}).end();
		});
		
		it("should allow the user to choose the fields that will be sent by the server. Except the fields _id and cache_expires", function(done) {
			var dones = 0;
			
			this.options.path = "/posts/0?fields=likes,comments";
			http.request(this.options, function(res){
				getData(res, function(data){
					data = JSON.parse(data);
					
					expect(Object.keys(data).length).to.be.equal(4);
					expect(data).to.have.a.property("_id");
					expect(data).to.have.a.property("likes");
					expect(data).to.have.a.property("comments");
					expect(data).to.have.a.property("cache_expires");
					
					if (++dones == 2)
						done();
				});
			}).on("error", function() {
			    expect.fail();
			}).end();
			
			this.options.path = "/posts?fields=_id";
			http.request(this.options, function(res){
				getData(res, function(data){
					data = JSON.parse(data);
					
					for (var i = 0; i < data.posts.length; i++) {
						expect(Object.keys(data.posts[i]).length).to.be.equal(2);
						expect(data.posts[i]).to.have.a.property("_id");
						expect(data.posts[i]).to.have.a.property("cache_expires");
					}
					
					if (++dones == 2)
						done();
				});
			}).on("error", function() {
			    expect.fail();
			}).end();
		});
		
		it("should have in the JSON response at the maximum the fields: " + fields.toString(), function(done) {
			var dones = 0;
			
			this.options.path = "/posts/0";
			http.request(this.options, function(res){
				getData(res, function(data){
					data = JSON.parse(data);
					
					expect(Object.keys(data)).to.have.members(fields);
					
					if (++dones == 2)
						done();
				})
			}).on("error", function(){
				expect.fail();
			}).end();
			
			this.options.path = "/posts";
			http.request(this.options, function(res){
				getData(res, function(data){
					data = JSON.parse(data);
					
					for (var i = 0; i < data.posts.length; i++) {
						expect(Object.keys(data.posts[i])).to.have.members(fields);
					}
					
					if (++dones == 2)
						done();
				})
			}).on("error", function(){
				expect.fail();
			}).end();
		});
		
		it("should ignore any other query beside the defined fields in the request and the necessary fields (_id, cache_expires)", function(done) {
			this.options.path = "/posts/0?sort=date&limit=2&fields=likes"
			
			http.request(this.options, function(res){
				getData(res, function(data){
					data = JSON.parse(data);
					
					expect(Object.keys(data).length).to.be.equal(3);
					expect(data).to.have.a.property("likes");
					expect(data).to.have.a.property("cache_expires");
					expect(data).to.have.a.property("_id");
					
					done();
				})
			}).on("error", function(){
				expect.fail();
			}).end();
		});
	});
	
	describe("/posts", function() {
		it("should return the filters and a collection of nine posts for default", function(done) {
			this.options.path = "/posts"
			
			http.request(this.options, function(res){
				getData(res, function(data){
					data = JSON.parse(data);
					for (var i in this.defaultFilters) {
						expect(data).to.have.a.property(this.defaultFilters[i]);
					}
					
					expect(data.posts.length).to.be.equal(9);
					
					done();
				});
			}).on("error", function(){
				expect.fail();
			}).end();
		});
		
		describe("Queries", function() {
			describe("Limit", function() {
				it("should be limited by 100 posts maximum", function(done) {
					this.options.path = "/posts?limit=200";
					
					http.request(this.options, function(res){
						getData(res, function(data) {
							data = JSON.parse(data);
							
							expect(data.posts.length).to.be.equal(100);
							done();
						});
					}).on("error", function(err) {
						expect.fail();
					}).end();
				});
				
				it ("should return 9 if 0 or a negative number is passed", function(done) {
					var dones = 0;
					
					this.options.path = "/posts?limit=0";
					http.request(this.options, function(res){
						getData(res, function(data) {
							data = JSON.parse(data);
							
							expect(data.posts.length).to.be.equal(9);
							
							if (++dones == 2)
								done();
						});
					}).on("error", function() {
						expect.fail();
					}).end();
					
					this.options.path = "/posts?limit=-10";
					http.request(this.options, function(res){
						getData(res, function(data) {
							data = JSON.parse(data);
							
							expect(data.posts.length).to.be.equal(9);
							
							if (++dones == 2)
								done();
						});
					}).on("error", function() {
						expect.fail();
					}).end();
				});
			});
			
			describe("Sort and Order", function() {
				it("should sort by time if a invalid field is described in sort.", function(done) {
					this.options.path = "/posts?sort=stenio";
					
					http.request(this.options, function(res){
						getData(res, function(data) {
							data = JSON.parse(data);
							
							var previous = -1;
							for (var i in data.posts) {
								if (+data.posts[i].time > previous) {
									previous = +data.posts[i].time;
								} else {
									expect.fail();
								}
							}
							
							done();
						});
					}).on("error", function(){
						expect.fail();
					}).end();
				});
			
				it("should sort by the sort field.", function(done) {
					this.options.path = "/posts?sort=_id";
					
					http.request(this.options, function(res){
						getData(res, function(data) {
							data = JSON.parse(data);
							
							var previous = -1;
							for (var i in data.posts) {
								if (+data.posts[i]._id > previous) {
									previous = +data.posts[i]._id;
								} else {
									expect.fail();
								}
							}
							
							done();
						});
					}).on("error", function(){
						expect.fail();
					}).end();
				});
			
				it("should have the order ascending if order is equal to 1", function(done) {
					this.options.path = "/posts?order=1";
					
					http.request(this.options, function(res){
						getData(res, function(data) {
							data = JSON.parse(data);
							
							var previous = -1;
							for (var i in data.posts) {
								if (+data.posts[i].time > previous) {
									previous = +data.posts[i].time;
								} else {
									expect.fail();
								}
							}
							
							done();
						});
					}).on("error", function(){
						expect.fail();
					}).end();
				});
			
				it("should have the order descending if order is equal to -1", function(done) {
					this.options.path = "/posts?order=-1";
					
					http.request(this.options, function(res){
						getData(res, function(data) {
							data = JSON.parse(data);
							
							var previous = -1;
							for (var i = data.posts.length - 1; i >= 0; i--) {
								if (+data.posts[i].time > previous) {
									previous = +data.posts[i].time;
								} else {
									expect.fail();
								}
							}
							
							done();
						});
					}).on("error", function(){
						expect.fail();
					}).end();
				});
			
				it("should have the order ascending (1) if any other value is passed", function(done) {
					this.options.path = "/posts?order=stenio";
					
					http.request(this.options, function(res){
						getData(res, function(data) {
							data = JSON.parse(data);
							
							var previous = -1;
							for (var i in data.posts) {
								if (+data.posts[i].time > previous) {
									previous = +data.posts[i].time;
								} else {
									expect.fail();
								}
							}
							
							done();
						});
					}).on("error", function(){
						expect.fail();
					}).end();
				});
			
			});
			
			describe("Tags", function() {
				it("should return any tag if none tag was passed", function(done) {
					this.options.path = "/posts";
					
					http.request(this.options, function(res) {
						getData(res, function(data) {
							data = JSON.parse(data);
							
							var m;
							// For every post
							for (var i in data.posts) {
								// verify if any other post
								for (var j in data.posts) {
									// Doesn't have a tag
									m = false; // It means none match was found.
									for (var k in data.posts[j].tags) {
										// That matches with any other post's tags
										for (var l in data.posts[i].tags) {
											if (data.posts[j].tags[k] === data.posts[i].tags[l]) {
												m = true;
												break;
											}
										}
										if (m)
											break;
									}
									if (!m) 
										break;
								}
								if (!m)
									break;
							}
							if (!m)
								done();
							else
								expect.fail();
						});
					}).on("error", function(){
						expect.fail();
					}).end();
				});
				
				it("should return only the posts that have all the tags passed included.", function(done) {
					this.options.path = "/posts?tags=GOOGLE,UPDATE";
					
					http.request(this.options, function(res){
						getData(res, function(data){
							data = JSON.parse(data);
							
							for (var j in data.posts)
								expect(data.posts[j].tags).to.contain.members(["GOOGLE", "UPDATE"]);
								
							done();
						});
					}).on("error", function(){
						expect.fail();
					}).end();
				});
			});
		});
	});
});
