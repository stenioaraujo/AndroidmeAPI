var expect = require("chai").expect;
var assert = require("chai").assert;
var server = require("../server.js"); // find out a way of starting and stoping the server throug methods

describe("Android.me API", function() {
	describe("/posts/{post_id}", function() {
		it("should only work with get requests", function(done) {
			assert.ok(false);
			done();
		});

		it("should send a JSON response", function(done){
			assert.ok(false);
			done();
		});
		
		it("should retrieve the post of a specific ID", function(done) {
			assert.ok(false);
			done();
		});
		
		it("should allow the user to choose the fields that will be sent by the server", function(done) {
			assert.ok(false);
			done();
		});
		
		it("should ignore any other query beside fields in the request", function(done) {
			assert.ok(false);
			done();
		});
	});
	
	describe("/posts", function() {
		it("should return the utilized filters and a collection of posts", function(done) {
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
			}
		});
	});
});
