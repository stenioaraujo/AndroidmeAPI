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

		it("should only accepts queries that are in the right format", function(done) {
			assert.ok(false);
			done();
		});
	});
	describe("/posts", function() {
		it("should have to have the tests created by Stenio Still", function(done) {
			done();
		});
	});
});
