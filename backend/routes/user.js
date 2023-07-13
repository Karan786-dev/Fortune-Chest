const { ObjectId } = require("mongodb");
const authUserorAdmin = require("../middleware/authUserorAdmin");
const { db } = require("..");

const router = require("express").Router();


//ROUTE 1:POST /api/user/getAccount
router.post("/getAccount/:info?", authUserorAdmin, async (req, res) => {
  try {
    //Remember to delete secret details from data we want to send
    if (req.is_admin) {
      let userData = await db.collection("accounts").findOne({
        $or: [
          {
            _id: typeof req.params.info == "string" && ObjectId.isValid(req.params.info)
              ? new ObjectId(req.params.info)
              : req.params.info,
          },
          {
            inviteCode: req.params.info,
          },
          { email: req.params.info },
          { phone: req.params.info },
        ]
      })
      if (!userData) return res.status(401).send({ error: true, message: 'Account data not found', code: 'NOT_FOUND' })
      req.user = {
        data: userData
      };
    }
    let user_data = req.user.data;
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
router.post("/edit/:info?", authUserorAdmin, async (req, res) => {
  try {
    const { balance, password, block, unblock } = req.body;
    let newData = {};
    let user_data
    let updatedData = {}
    if (req.is_admin) {
      user_data = await db.collection('accounts').findOne({
        $or: [
          {
            _id: typeof req.params.info == "string" && ObjectId.isValid(req.params.info)
              ? new ObjectId(req.params.info)
              : req.params.info,
          },
          {
            inviteCode: req.params.info,
          },
          { email: req.params.info },
          { phone: req.params.info },
        ]
      })
      if (balance) {
        newData.balance = parseFloat(balance);
        await db.collection("transactions").insertOne({
          user_id: user_data._id,
          amount: parseFloat(balance),
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
        updatedData = (await db
          .collection("accounts")
          .findOneAndUpdate(
            { _id: user_data._id },
            { $set: { block: true } },
            { returnOriginal: false }
          )).value
      } else if (unblock) {
        updatedData = (await db
          .collection("accounts")
          .findOneAndUpdate(
            { _id: user_data._id },
            { $unset: { block: 1 } },
            { returnOriginal: false }
          )).value
      }
    }
    if (Object.keys(newData).length) {
      updatedData = (await db
        .collection("accounts")
        .findOneAndUpdate({ _id: req.user?.is_admin ? new ObjectId(req.user.id) : user_data._id }, { $set: newData }, { returnOriginal: false })).value;
    }
    res.status(200).send({ message: "Data Updated", data: updatedData });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

//ROUTE 3:POST /api/user/getTransactions/:id  Pass user id if you are admin
router.post("/getTransactions/:id?", authUserorAdmin, async (req, res) => {
  try {
    const { quary } = req.body;
    if (req.is_admin && !ObjectId.isValid(req.params.id)) return res
      .status(400)
      .send({ message: "Please provide a valid user ID" });
    let final_quary = {}
    for (i in Object.keys(quary || {})) {
      let key = Object.keys(quary || {})[i]
      let value = (quary || {})[key]
      final_quary[key] = value
    }

    final_quary.user_id = new ObjectId(req.user?.id || req.params.id)//To prevent user to get other user transactions
    console.log(final_quary)
    const transactions = await db
      .collection("transactions")
      .find(final_quary)
      .toArray();
    res.status(200).send({ data: transactions });
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

//ROUTE 5:POST /api/user/bind_bank
router.post('/bind_bank', authUserorAdmin, async (req, res) => {
  try {
    let { number, holder, ifsc } = req.body;
    if (!number || !holder || !ifsc) {
      return res.status(400).send({
        error: true,
        message: "Please send (number, holder, ifsc) in the request body",
        code: 'INVALID_PARAMS'
      });
    }
    let id = req.user.id;
    console.log(id)
    await db.collection('accounts').findOneAndUpdate({ _id: new ObjectId(id) }, {
      $set: {
        bank: {
          number,
          holder,
          ifsc
        }
      }
    });
    res.status(200).send({ message: 'Bank Details Updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});


module.exports = router;
