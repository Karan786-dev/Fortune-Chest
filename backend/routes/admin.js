const authAdmin = require("../middleware/authAdmin");
const { db } = require("..");
const router = require("express").Router();

//ROUTE 1: POST /api/admin/getAccounts
router.post("/getAccounts", authAdmin, async (req, res) => {
  try {
    let query = req.body; //Database query , i know its not a good idea but i cant do anything
    let accounts = await db
      .collection("accounts")
      .find(Object.keys(query).length ? query : {}, {
        projection: { password: 0 },
      })
      .toArray();
    res.status(200).send({
      message: `Found all accounts${query ? ` with ${query} Query` : ""}`,
      data: accounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" ,code:'ERROR'});
  }
});

//ROUTE 2: POST /api/admin/editData
router.post("/editData", authAdmin, async (req, res) => {
  try {
    let {
      per_refer,
      maximum_withdraw,
      minimum_withdraw,
      maintaince,
      withdraw_maintaince,
      withdarw_tax,
    } = req.body;
    let updatedData;
    if ("maintaince" in req.body) {
      if (maintaince) {
        updatedData = await db
          .collection("admin")
          .findOneAndUpdate({ admin: 1 }, { $set: { maintaince: true } });
      } else {
        updatedData = await db
          .collection("admin")
          .findOneAndUpdate({ admin: 1 }, { $unset: { maintaince: 1 } });
      }
    }
    if ("withdraw_maintaince" in withdraw_maintaince) {
      if (withdraw_maintaince) {
        updatedData = await db
          .collection("admin")
          .findOneAndUpdate(
            { admin: 1 },
            { $set: { withdraw_maintaince: true } }
          );
      } else {
        await db
          .collection("admin")
          .findOneAndUpdate(
            { admin: 1 },
            { $unset: { withdraw_maintaince: 1 } }
          );
      }
    }
    let newData = {
      per_refer: parseFloat(per_refer || 0),
      maximum_withdraw: parseFloat(maximum_withdraw),
      minimum_withdraw: parseFloat(minimum_withdraw),
      withdarw_tax: parseFloat(withdarw_tax),
    };
    //Removing all null values from newData
    newData = Object.keys(newData).reduce((acc, key) => {
      if (obj[key] !== null) {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
    if (Object.keys(newData).length)
      updatedData = await db
        .collection("admin")
        .findOneAndUpdate({ admin: 1 }, { $set: newData });
    res
      .status(200)
      .send({ message: "Admin data updated in database", updatedData });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" ,code:'ERROR'});
  }
});


//ROUTE 3: POST /api/admin/getData
router.post('/getData', async (req, res) => {
  try {
    // Assuming you have the necessary imports and setup for connecting to the database

    const adminData = await db.collection('admin').findOne({ admin: 1 }) || {}

    // Data without admin auth
    const data_in_response = {
      per_refer: adminData?.per_refer,
      maximum_withdraw: adminData?.maximum_withdraw,
      minimum_withdraw: adminData?.minimum_withdraw,
      withdraw_tax: adminData?.withdraw_tax,
      withdraw_maintenance: adminData?.withdraw_maintenance,
      maintenance: adminData?.maintenance,
      merchant_key: adminData?.merchant_key,
      minimum_recharge: adminData?.minimum_recharge,
      maximum_recharge: adminData?.maximum_recharge
    };

    // Remove null values from data_in_response
    for (const [key, value] of Object.entries(data_in_response)) {
      if (value === null) {
        delete data_in_response[key];
      }
    }


    res.status(200).send({ message: 'Admin data received', data: data_in_response })
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" ,code:'ERROR'});
  }
})


module.exports = router;
