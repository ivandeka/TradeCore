const app = require('../app');

const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should;

const api = supertest('http://localhost:3000');

let login = null;
let users = null;
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
				done();
			}).
		catch(done);
	});

	// Correct response format for all users
	for (var users = 1; users < 7; users++) {
		(function (users) {
			it('Correct response format for all users', (done) => {
				api.get('/users/' + users)
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
		})(users);
	}

	// Response format for user accounts
	for (var accounts = 1; accounts < 5; accounts++) {
		(function (accounts) {
			it('Correct format for users that have accounts', (done) => {
				api.get('/users/' + accounts + '/accounts')
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
		})(accounts);
	}

	// Status 200 for users pages
	for (var users = 1; users < 7; users++) {
		(function (users) {
			it('Status 200 for all users', (done) => {
				api.get('/users/' + users)
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
	for (accounts = 1; accounts < 5; accounts++) {
		(function (accounts) {
			it('Status 200 for all accounts', (done) => {
				api.get('/users/' + accounts + '/accounts')
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
				expect(res.text).to.contain("Time lords do not have accounts");
				done();
			}).
			catch(done);
	});
	it('Time Lords do not have accounts', (done) => {
		api.get('/users/6/accounts')
			.set('authorization', login)
			.then((res) => {
				expect(res.text).to.contain("Time lords do not have accounts");
				done();
			}).
			catch(done);
	});
});