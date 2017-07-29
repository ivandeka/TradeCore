'use strict';

const app = require('../app');

const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();

const api = supertest('http://localhost:3000');

let login = null;
let users = null;
let accounts = null;
let userID = [];
let wrongToken = 'wrong token';

describe('Tests', () => {

	// Check if Homepage si properly displayed and has status 200
	it('Proper HomePage', (done) => {
		api.get('/')
			.then((res) => {
				expect(res.text).to.be.equal('Hello World!');
				expect(res.statusCode).to.be.equal(200);
				done();
			}).
			catch(done);
	});

	// Test logging in with wrong password
	it('Bad log in - wrong password', (done) => {
		api.post('/sign-in')
			.send({
				password: 'wrong-password',
				email: 'email',
			})
			.then((res) => {
				expect(res.body).to.have.property("error", true);
				expect(res.body).not.to.have.property("access_token", res.body.access_token);
				done();	
			}).
			catch(done);
	});

	// Test logging in with wrong email
	it('Bad log in - wrong email', (done) => {
		api.post('/sign-in')
			.send({
				password: 'password',
				email: 'wrong-email',
			})
			.then((res) => {
				expect(res.body).not.to.have.property("access_token", res.body.access_token);
				done();	
			}).
			catch(done);
	});

	// Test logging in with wrong password AND email
	it('Bad log in - wrong email and wrong password', (done) => {
		api.post('/sign-in')
			.send({
				password: '',
				email: '',
			})
			.then((res) => {
				expect(res.body).to.have.property("error", true);
				expect(res.body).not.to.have.property("access_token", res.body.access_token);
				done();	
			}).
			catch(done);
	});

	// Login user to the system and fetch access token
	it('Login user', (done) => {
		api.post('/sign-in')
			.send({
				password: 'password',
				email: 'email',
			})
			.then((res) => {
				login = res.body.access_token;
				done();
			}).
			catch(done);
	});

	// Get a list of all users
	it('Get users list', (done) => {
		api.get('/users')
			.set('authorization', login)
			.then((res) => {
				// we expect that there is 6 users. You can check/confirm that in app code.
				expect(res.body.length).to.be.equal(6);
				for(var i = 0; i < res.body.length; i++) {
					userID[i] = res.body[i].user_id;
                }
                done();
			}).
		catch(done);
	});

	// Testing correct response format for all users
	for (var i = 0; i < 6; i++) {
		(function (i) {
			it('Correct response format for all users', (done) => {
				api.get('/users/' + userID[i])
					.set('authorization', login)
					.then((res) => {
						expect(res.text).to.contain("user_id");
						expect(res.text).to.contain("name");
						expect(res.text).to.contain("title");
						expect(res.text).to.contain("active");
						done();
					}).
					catch(done);
			});
		})(i);
	}

	// Testing with wrong token
	it('Unable to get user list with wrong token', (done) => {
		api.get('/users')
			.set('authorization', wrongToken)
			.then((res) => {
				expect(res.body).to.have.property("error", true);
				expect(res.body).to.have.property("message", "Missing authorization token");
				done();
			}).
		catch(done);
	});


	// Response format for user accounts
	for (var i = 0; i < 4; i++) {
		(function (i) {
			it('Correct response format for all accounts', (done) => {
				api.get('/users/' + userID[i] + '/accounts')
					.set('authorization', login)
					.then((res) => {
						expect(res.text).to.contain("account_id");
						expect(res.text).to.contain("name");
						expect(res.text).to.contain("active");
						expect(res.text).to.contain("money");
						done();
					}).
					catch(done);
			});
		})(i);
	}

	// Getting users with wrong token
	for (var users = 1; users < 7; users++) {
		(function (users) {
			it('Unable to get users with wrong token', (done) => {
				api.get('/users/' + userID[users])
					.set('authorization', wrongToken)
					.then((res) => {
						expect(res.body).to.have.property("error", true);
						expect(res.body).to.have.property("message", "Missing authorization token");
						done();
					}).
					catch(done);
			});
		})(users);
	}

	// Getting accounts with wrong token
	for (var accounts = 1; accounts < 5; accounts++) {
		(function (accounts) {
			it('Unable to get accounts with wrong token', (done) => {
				api.get('/users/' + userID[accounts] + '/accounts')
					.set('authorization', wrongToken)
					.then((res) => {
						expect(res.body).to.have.property("error", true);
						expect(res.body).to.have.property("message", "Missing authorization token");
						done();
					}).
					catch(done);
			});
		})(accounts);
	}

	// Status 200 for users pages
	for (var users = 0; users < 6; users++) {
		(function (users) {
			it('Status 200 for all users', (done) => {
				api.get('/users/' + userID[users])
					.set('authorization', login)
					.then((res) => {
						expect(res.statusCode).to.be.equal(200);
						expect(res.text).to.contain("user_id"); //check if page is indeed user page
						done();
					}).
					catch(done);
			});
		})(users);
	}

	// Status 200 for accounts
	for (accounts = 0; accounts < 4; accounts++) {
		(function (accounts) {
			it('Status 200 for all accounts', (done) => {
				api.get('/users/' + userID[accounts] + '/accounts')
					.set('authorization', login)
					.then((res) => {
						expect(res.statusCode).to.be.equal(200);
						expect(res.text).to.contain("account_id"); //check if page is indeed account page
						done();
					}).
					catch(done);
			});
		})(accounts);
	}

	// Check if user 2 has 2 accounts
	it('User 2 has 2 accounts', (done) => {
		api.get('/users/2/accounts')
			.set('authorization', login)
			.then((res) => {
				expect(res.body.length).to.be.equal(2);
				done();
			}).
			catch(done);
	});

	// Check if Time Lords do not have account
	it('Time Lords do not have accounts', (done) => {
		api.get('/users/5/accounts')
			.set('authorization', login)
			.then((res) => {
				expect(res.body).to.have.property("error", true);
				expect(res.body).to.have.property("message", "Time lords do not have accounts");
				done();
			}).
			catch(done);
	});
	it('Time Lords do not have accounts', (done) => {
		api.get('/users/6/accounts')
			.set('authorization', login)
			.then((res) => {
				expect(res.body).to.have.property("error", true);
				expect(res.body).to.have.property("message", "Time lords do not have accounts");
				done();
			}).
			catch(done);
	});


});