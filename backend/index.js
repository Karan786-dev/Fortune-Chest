const { MongoClient, ServerApiVersion } = require("mongodb");
const { MONGO_URL } = require("./config");

const client = new MongoClient(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

client
  .connect()
  .then((client) => {
    const db = client.db("DailyChest@");

    // Create index for frequently searched fields
    db.collection("accounts").createIndex(
      { email: 1, phone: 1 },
      { name: "Index for users account...." },
      (err) => {
        if (err) console.error("Error creating index:", err);
      }
    );
    exports.db = db
    // Start the server
    require("./server");
    console.log("Connected to MongoDB database");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB database:", err);
  });
