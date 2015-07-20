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
  	this.timeout(10*1000);
  	var fields = ["_id", "content", "date", "featured", "from", "likes", "tags", "time", "title", "writer", "featured_thumbnail", "comments"];
	
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
				console.log(error);
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
		
		it("should allow the user to choose the fields that will be sent by the server", function(done) {
			this.options.path = "/posts/0?fields=likes,_id";
			
			http.request(this.options, function(res){
				getData(res, function(data){
					data = JSON.parse(data);
					
					expect(data.length).to.be.equal(2);
					expect(data).to.have.a.property("_id");
					expect(data).to.have.a.property("likes");
					
					done();
				});
			}).on("error", function() {
			    expect.fail();
			}).end();
		});
		
		it("should have in the JSON response at the maximum the fields: " + fields.toString(), function(done) {
			this.options.path = "/posts/0";
			http.request(this.options, function(res){
				getData(res, function(data){
					data = JSON.parse(data);
					
					expect(data.length).to.be.equal(12);
					
					for (var i in fields) {
						expect(data).to.have.a.property(fields[i]);
					}
					
					done();
				})
			}).on("error", function(){
				expect.fail();
			}).end();
		});
		
		it("should ignore any other query beside the pre-defined fields in the request", function(done) {
			this.options.path = "/posts/0?fields=likes,content,random_field"
			
			http.request(this.options, function(res){
				getData(res, function(data){
					data = JSON.parse(data);
					
					expect(data.length).to.be.equal(2);
					expect(data).to.have.a.property("likes");
					expect(data).to.have.a.property("content");
					
					done();
				})
			}).on("error", function(){
				expect.fail();
			}).end();
		});
	});
	
	describe("/posts", function() {
		it("should return the filters and a collection of nine posts for default", function(done) {
			assert.ok(false);
			done();
		});
		
		describe("Queries", function() {
			describe("Limit", function() {
				it("should be limited by 100 posts maximum", function(done) {
					assert.ok(false);
					done();
				});
				
				it ("should return 9 if 0 or a negative number is passed", function(done) {
					assert.ok(false);
					done();
				});
			});
			
			describe("Sort and Order", function() {
				it("should sort by ID if a invalid field is described in sort.", function(done) {
					assert.ok(false);
					done();
				});
			
				it("should sort by the sort field.", function(done) {
					assert.ok(false);
					done();
				});
			
				it("should have the order ascending if order is equal to 1", function(done) {
					assert.ok(false);
					done();
				});
			
				it("should have the order descending if order is equal to -1", function(done) {
					assert.ok(false);
					done();
				});
			
				it("should have the order ascending (1) if any other value is passed", function(done) {
					assert.ok(false);
					done();
				});
			
			});
			
			it("should return any tag if none tag was passed", function(done) {
				assert.ok(false);
				done();
			});
			
			it("should return only the posts that have all the tags passed included.", function(done) {
				assert.ok(false);
				done();
			});
			
			it("should ignore any other field beside limit, sort, order, tags, fields, writer, start, end", function(done) {
				assert.ok(false);
				done();
			});
		});
	});
});
