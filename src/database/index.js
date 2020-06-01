const mongo = require('mongodb');
const mongoClient = mongo.MongoClient;
const environment = require('../../environments/development.json');

class Database {
	constructor(name, url) {
		this.name = name;
		this.url = url;
		this.openConnection();
	}

	openConnection() {
		const self = this;

		console.error("Trying to connect to server: " + this.url);
		mongoClient.connect(this.url, {useNewUrlParser: true, useUnifiedTopology: true},
			function(err, connection) {
				if (err) {
					console.error(err);
					setTimeout(() => {
						self.openConnection();
					}, 5000);
				} else {
					self.setConnection(connection);
					return 0;
				}
			}
		);
		return 0;
	}

	setConnection(connection) {
		if (connection == undefined) {
			console.error("Connection isn't alive.");
			return 84;
		}
		this.connection = connection;
		this.database = connection.db(this.name);
		console.error("Using database: " + this.name);
		return 0;
	}

	closeConnection() {
		console.error("Closing down connection with: " +
			this.name + "...");
		if (this.connection != undefined) {
			this.connection.close();
			console.error("Connection successfully closed.");
			return;
		}
		console.error("Couldn't close connection with: " +
			this.name + "...");
		return;
	}

	setDatabase(connection) {
		if (connection == undefined) {
			console.error("Couldn't assign database to handler.");
			return;
		}
		this.connection = connection;
		this.database = connection.db(this.name);
		console.error("Database successfully assigned to handler.");
		console.error("Successfully connected to: " +
			this.name + '.');
		createCollections();
		return;
	}

	createCollection(collectionName) {
		console.error("Creating collection: " + collectionName);
		if (this.database == undefined) {
			console.error("Couldn't create collection.");
			return;
		}
		this.database.createCollection(collectionName,
			function(err, result) {
				if (err) {
					throw err;
				}
				console.error(collectionName +
					" successfully created.");
			}
		);
		return;
	}

	insertInCollection(collectionName, data, callback) {
		let collection = undefined;

		console.error("Inserting value in collection: " +
			collectionName);
		if (this.database == undefined || collectionName == undefined
			|| this.connection == undefined || data == undefined) {
			console.error("Couldn't insert value in collection.");
			return;
		}
		collection = this.database.collection(collectionName);
		if (collection == undefined) {
			console.error("Collection doesn't exists. " +
				"Couldn't insert value.");
			return;
		}
		collection.insertOne(data, callback);
		return;
	}

	distinctInCollection(collectionName, field, query, callback) {
		let collection = undefined;

		console.error("Finding distinct values in collection: "
			+ collectionName);
		if (this.database == undefined || collectionName == undefined
			|| this.connection == undefined || query == undefined) {
			console.error("Couldn't find distinct " +
				"values in collection.");
			return;
		}
		collection = this.database.collection(collectionName);
		if (collection == undefined) {
			console.error("Collection doesn't exists."+
			" Couldn't find value.");
			return;
		}
		collection.distinct(field, query, callback);
	}

	findOneInCollection(collectionName, query, callback) {
		let collection = undefined;

		console.error("Finding value in collection: " + collectionName);
		if (this.database == undefined || collectionName == undefined
			|| this.connection == undefined || query == undefined) {
			console.error("Couldn't find value in collection.");
			return;
		}
		console.error(query);
		collection = this.database.collection(collectionName);
		if (collection == undefined) {
			console.error("Collection doesn't exists." +
				"Couldn't find value.");
			return;
		}
		collection.findOne(query, callback);
	}

	findInCollection(collectionName, query, callback) {
		let collection = undefined;

		console.error("Finding value in collection: " + collectionName);
		if (this.database == undefined || collectionName == undefined
			|| this.connection == undefined || query == undefined) {
			console.error("Couldn't find value in collection.");
			return;
		}
		console.error(query);
		collection = this.database.collection(collectionName);
		if (collection == undefined) {
			console.error("Collection doesn't exists." +
				"Couldn't find value.");
			return;
		}
		collection.find(query).toArray(callback);
	}

	findSortInCollection(collectionName, query, sort, callback) {
		let collection = undefined;

		console.error("Finding and sorting value in collection: " +
			collectionName);
		if (this.database == undefined || collectionName == undefined ||
			this.connection == undefined || query == undefined
			|| sort == undefined) {
			console.error("Couldn't find and sort value "
				+ "in collection.");
			return;
		}
		console.error(query, sort);
		collection = this.database.collection(collectionName);
		if (collection == undefined) {
			console.error("Collection doesn't exists. "
			+ "Couldn't find value.");
			return;
		}
		collection.find(query).sort(sort).toArray(callback);
	}

	removeOneInCollection(collectionName, query, callback) {
		let collection = undefined;

		console.error("Deleting value in collection: " + collectionName);
		if (this.database == undefined || collectionName == undefined ||
			this.connection == undefined || query == undefined) {
			console.error("Couldn't delete value in collection.");
			return;
		}
		collection = this.database.collection(collectionName);
		if (collection == undefined) {
			console.error("Collection doesn't exists. "
				+ "Couldn't delete value.");
			return;
		}
		collection.deleteOne(query, callback);
	}

	removeInCollection(collectionName, query, callback) {
		let collection = undefined;

		console.error("Deleting value in collection: " + collectionName);
		if (this.database == undefined || collectionName == undefined ||
			this.connection == undefined || query == undefined) {
			console.error("Couldn't delete "
				+ "value in collection.");
			return;
		}
		collection = this.database.collection(collectionName);
		if (collection == undefined) {
			console.error("Collection doesn't exists. "
				+ "Couldn't delete value.");
			return;
		}
		collection.deleteMany(query, callback);
	}

	updateInCollection(collectionName, query, data, callback) {
		let collection = undefined;

		console.error("Updating value in collection: " + collectionName);
		if (this.database == undefined || collectionName == undefined ||
			this.connection == undefined || query == undefined
			|| data == undefined) {
			console.error("Couldn't update value in collection.");
			return;
		}
		collection = this.database.collection(collectionName);
		if (collection == undefined) {
			console.error("Collection doesn't exists. "
				+ "Couldn't update value.");
			return;
		}
		collection.updateMany(query, data, callback);
	}

	updateOneInCollection(collectionName, query, data, callback) {
		let collection = undefined;

		console.error("Updating value in collection: " + collectionName);
		if (this.database == undefined || collectionName == undefined ||
			this.connection == undefined || query == undefined
			|| data == undefined) {
			console.error("Couldn't update value in collection.");
			return;
		}
		collection = this.database.collection(collectionName);
		if (collection == undefined) {
			console.error("Collection doesn't exists. "
				+ "Couldn't update value.");
			return;
		}
		collection.updateOne(query, data, callback);
	}
}

let database = null;
if (process.env.MONGODB_NAME)
	database = new Database(process.env.MONGODB_NAME, process.env.MONGODB_URI);
else {
	console.log("OFFLINE ! ");
	database = new Database(environment.database.name, environment.database.link + environment.database.name);
}

function createCollections() {
}

module.exports = database;