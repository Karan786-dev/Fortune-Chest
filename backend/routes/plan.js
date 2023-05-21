const { Router } = require("express");
const { ObjectId } = require("mongodb");
const { db } = require("../backend");
const { send_mail } = require("../backend/functions");
const authAdmin = require("../backend/middleware/authAdmin");
const authUser = require("../backend/middleware/authUser");
const checkBan = require("../backend/middleware/checkBan");
const userDataToRequest = require("../backend/middleware/userDataToRequest");
const multerImage = require("../../../../campaign_panel/backend/middleware/multerImage");
const router = Router();

//ROUTE 1:POST /api/plan/create
router.post(
  "/create",
  authAdmin,
  multerImage.single("image"),
  async (req, res) => {
    try {
      const { profit, period, commision, specific_days, maximum, minimum } =
        req.body;

      if (!profit || !period || !commision || !maximum || !maximum) {
        return res
          .status(400)
          .send({ message: "Please provide all parameters", code: 'INCORRECT_PARAMS' });
      }

      if (
        Number.isNaN(profit) ||
        Number.isNaN(period) ||
        Number.isNaN(commision) ||
        Number.isNaN(maximum) ||
        Number.isNaN(minimum)
      ) {
        return res.status(400).send({
          message: `Parameter must be an integer`, code: 'INCORRECT_PARAMS'
        });
      }
      let dataToInsert = {
        profit,
        period,
        commision,
        maximum,
        minimum,
      };
      if (specific_days && specific_days.length) {
        dataToInsert.specific_days = specific_days;
      }
      if (req.file?.filename) {
        if (
          req.file.mimetype == "image/png" ||
          req.file.mimetype == "image/jpg" ||
          req.file.mimetype == "image/jpeg"
        ) {
          dataToInsert.image = {};
          dataToInsert.image.data = fs.readFileSync(
            path.join(__dirname, "../images", req.file.filename)
          );
          dataToInsert.image.ext = req.file.filename.split(".").pop();
        } else {
          return res
            .status(400)
            .send({ message: "Only .png, .jpg and .jpeg format allowed!", code: 'FILE_ERROR' });
        }
      }
      const insertedData = await db.collection("plans").insertOne(dataToInsert);
      dataToInsert._id = insertedData.insertedId.toString();
      res.status(200).send({
        message: "New plan created",
        data: dataToInsert,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error", code: 'ERROR' });
    }
  }
);

//ROUTE 2:POST /api/plan/delete
router.post("/delete/:id", authAdmin, async (req, res) => {
  try {
    let { id } = req.params;
    const { refund } = req.body;
    if (!id) {
      return res
        .status(400)
        .send({ message: "Must provide plan id to delete", code: 'INCORRECT_PARAMS' });
    }
    id = ObjectId.isValid(id) ? new ObjectId(id) : id;
    await db.collection("plans").deleteOne({ _id: id });
    res.status(200).send({ message: `Plan removed with id: ${id}` });
    if (refund) {
      let plan_data = await db.collection("plans").findOne({ _id: id });
      let users_with_this_plan = await db
        .collection("accounts")
        .find(
          { "plan.id": plan_data._id.toString() },
          { projection: { email: 1, _id: 0, plan: 1 } }
        )
        .toArray();
      for (let user of users_with_this_plan) {
        let user_data = user;
        let invested_amount = plan.amount
        let commission_transaction = await db.collection('transactions').find({ user_id: user_data._id, type: 'credited', code: 'CHEST_COMMISSION', [`data.plan_id`]: plan_data._id }).toArray()
        let earned_by_chest = 0
        for (i in commission_transaction) {
          earned_by_chest += commission_transaction[i].amount
        }
        if (invested_amount <= earned_by_chest) {
          send_mail(
            user_data.email,
            `Sorry we removed our chest ${id}\n\nBut you have earned ${earned_by_chest - invested_amount}\n\nSo we cant give you refund`,
            "Notice from Fortune Chest"
          );
        } else {
          send_mail(
            user_data.email,
            `Sorry we removed our plan ${id}\n\nRefund added to your account => ${price} Rs`,
            "Refund from Fortune Chest"
          );
          await db
            .collection("accounts")
            .updateOne(
              { _id: user_data._id },
              { $inc: { balance: +parseFloat(price) }, $unset: { plan: 1 } }
            );
          await db.collection("transactions").insertOne({
            user_id: user_data._id,
            amount: parseFloat(price),
            type: "credited",
            reason: "Refund from removed chest",
            code: 'REFUND',
            time: new Date(),
          });
        }

      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error", code: 'INCORRECT_PARAMS' });
  }
});

//ROUTE 3:POST /api/plan/buy
router.post(
  "/buy/:plan_id",
  authUser,
  userDataToRequest,
  checkBan,
  async (req, res) => {
    try {
      const { plan_id, amount } = req.params;
      if (!plan_id || Number.isNaN(amount))
        return res.status(400).send({ message: "Must provide Valid params", code: 'INCORRECT_PARAMS' });

      let plan_data = await db.collection("plans").findOne({
        _id: typeof plan_id === "string" ? new ObjectId(plan_id) : plan_id,
      });

      if (!plan_data)
        return res.status(400).send({ message: "Plan not found with id", id, code: 'INCORRECT_PARAMS' });
      let minimumPlanPrice = parseFloat(plan_data.minimum);
      let maximumPlanPrice = parseFloat(plan_data.maximum);
      if (parseFloat(amount) < minimumPlanPrice)
        return res
          .status(400)
          .send({ message: `You must invest minimum ${minimumPlanPrice} Rs`, code: 'INVALID_AMOUNT' });
      if (parseFloat(amount) > maximumPlanPrice)
        return res.status(400).send({
          message: `You can't invest more then ${maximumPlanPrice} Rs`, code: 'INVALID_AMOUNT'
        });
      let user_data = req.user.data;
      let balance = parseFloat(user_data.balance || 0);

      if (balance < parseFloat(amount || 0))
        return res
          .status(400)
          .send({ message: "User account doesn't have enough balance",code:'NOT_ENOUGH_BALANCE' });

      if (user_data.plan)
        return res
          .status(200)
          .send({ message: "User already has an activated plan" ,code:'PERMISSION_DENIED'});

      await db.collection("accounts").findOneAndUpdate(
        { _id: user_data._id },
        {
          $inc: { balance: -parseFloat(amount) },
          $set: {
            plan: {
              id: plan_data._id.toString(),
              days_left: parseInt(plan_data.period),
              amount: parseFloat(amount),
            },
          },
        },
        { returnOriginal: false }
      );
      await db.collection("transactions").insertOne({
        user_id: user_data._id,
        amount: parseFloat(amount),
        type: "debited",
        reason: "Invested in a plan",
        code: 'INVEST_IN_CHEST',
        time: new Date(),
      });
      res.status(200).send({
        message: `Plan activated on account ${user_data._id.toString()}`,
      });
      //Adding commission to inviter if exists
      if (req.user.data.inviteCode && plan_data.commision) {
        let inviteCode =
          typeof req.user.data.inviteCode == "string"
            ? new ObjectId(req.user.data.inviteCode)
            : req.user.data.inviteCode; //Invite code is inviter _id
        let commision = parseFloat(plan_data.commision) || 0;
        let inviter_data = await db
          .collection("accounts")
          .findOneAndUpdate(
            { _id: inviteCode },
            { $inc: { balance: +((parseFloat(amount) * commision) / 100) } }
          );
        await db.collection("transactions").insertOne({
          user_id: inviteCode,
          amount: (parseFloat(amount) * commision) / 100,
          type: "credited",
          reason: "Referall Comsission",
          time: new Date(),
          code: 'REFERALL_CHEST_COMMISSION'
        });
        send_mail(
          inviter_data.email,
          `Your refer bought a plan and you got ${commision}% or ${(parseFloat(amount) * commision) / 100
          } rs in your account`,
          "Commision"
        );
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal server error" ,code:'ERROR'});
    }
  }
);

/// ROUTE 4: POST /api/plan/getAll
router.post("/getAll", async (req, res) => {
  try {
    const all_plans = await db.collection("plans").find().toArray();
    res.status(200).send({ message: "All Plans Data", data: all_plans });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error",code:'ERROR' });
  }
});

// ROUTE 5: POST /api/plan/get/:id
router.post("/get/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid plan id" ,code:'INCORRECT_PARAMS'});
    }
    const plan_data = await db
      .collection("plans")
      .findOne({ _id: new ObjectId(id) });
    if (!plan_data) {
      return res.status(404).send({ message: "Plan not found" ,code:'INCORRECT_PARAMS'});
    }
    res.status(200).send({ message: "Plan found", data: plan_data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error",code:'ERROR' });
  }
});

//ROUTE 6:POST /api/plan/edit/{Plan id}
router.post("/edit/:id", authAdmin, async (req, res) => {
  try {
    const { profit, period, commision, specific_days, minimum, maximum } =
      req.body;
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid plan id" ,code:'INCORRECT_PARAMS'});
    }

    const updateObj = {};

    if (typeof profit === "number") updateObj.profit = profit;

    if (typeof period === "number") updateObj.period = period;

    if (typeof commision === "number") updateObj.commision = commision;

    if (typeof minimum === "number") updateObj.minimum = parseFloat(minimum);

    if (typeof maximum === "number") updateObj.maximum = parseFloat(maximum);
    if (Array.isArray(specific_days)) updateObj.specific_days = specific_days;
    const updatedPlan = await db
      .collection("plans")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateObj },
        { returnOriginal: false }
      );

    res.status(200).send({ message: "Plan updated", updatedPlan });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" ,code:'ERROR'});
  }
});

module.exports = router;
