const { ObjectId } = require("mongodb");
const authUserorAdmin = require("../backend/middleware/authUserorAdmin");
const { db } = require("../backend");

const router = require("express").Router();


//ROUTE 1:POST /api/user/getAccount
router.post("/getAccount/:id?", authUserorAdmin, async (req, res) => {
  try {
    //Remember to delete secret details from data we want to send
    if (req.is_admin)
      req.user = {
        data: await db.collection("accounts").findOne({
          _id:
            typeof req.params.id == "string"
              ? new ObjectId(req.params.id)
              : req.params.id,
        }),
      };
    let user_data = req.user.data;
    console.log(user_data, req.is_admin)
    delete user_data.password;
    res
      .status(200)
      .send({ message: "User account data found", data: user_data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

//ROUTE 2:POST /api/user/edit
router.post("/edit", authUserorAdmin, async (req, res) => {
  try {
    const { balance, password, block, unblock } = req.body;
    let newData = {};
    if (req.user?.is_admin) {
      if (balance) {
        newData.balance = parseFloat(balance);
        await db.collection("transactions").insertOne({
          user_id: new ObjectId(req.user.id),
          amount: parseFloat(adminData?.per_refer),
          reason: "By Admin",
          code: 'BYADMIN',
          time: new Date(),
        });
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password.trimEnd(), salt);
        newData.password = password_hash;
      }
      if (block) {
        await db
          .collection("accounts")
          .updateOne(
            { _id: new ObjectId(req.user.id) },
            { $set: { block: true } }
          );
      } else if (unblock) {
        await db
          .collection("accounts")
          .updateOne(
            { _id: new ObjectId(req.user.id) },
            { $unset: { block: 1 } }
          );
      }
    }
    if (Object.keys(newData).length) {
      await db
        .collection("accounts")
        .updateOne({ _id: new ObjectId(req.user.id) }, { $set: newData });
    }
    res.status(200).send({ message: "Data Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

//ROUTE 3:POST /api/user/getTransactions/:id  Pass user id if you are admin
router.post("/getTransactions/:id", authUserorAdmin, async (req, res) => {
  try {
    const { quary } = req.body;
    if (req.is_admin && !ObjectId.isValid(req.params.id)) return res
      .status(400)
      .send({ message: "Please provide a valid user ID" });
    let final_quary = {}
    for (i in Object.keys(quary)) {
      let key = Object.keys(quary)[i]
      let value = quary[key]
      final_quary[key] = value
    }
    final_quary[user] = req.user?._id || ObjectId(req.params.id)//To prevent user to get other user tranacstions
    const transactions = await db
      .collection("transactions")
      .find(final_quary)
      .toArray();
    res.status(200).send({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

//ROUTE 4:POST /api/user/recharge
router.post('/recharge', async (req, res) => {
  try {
    let adminData = await db.collection('admin').findOne({ admin: 1 }, { projection: { _id: 0, merchant_key: 1, secret_key: 1 } }) || {}
    // if (!adminData.merchant_key || !adminData.secret_key) {
    //   return res.status(400).send({ message: 'Accept payment gateway is not completed by admin' })
    // }
    let response = { order_id: `UPI` + (Math.floor(Math.random() * 9000000000) + 1000000000).toString(), merchant_key: adminData.merchant_key }
    await db.collection('order_ids').updateOne({ user: req.user?.id }, { $set: { order_id: response.order_id } }, { $upsert: true })
    res.status(200).send({ message: 'Order id created', data: response })
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
})

module.exports = router;
