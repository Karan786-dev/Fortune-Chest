const { Router } = require("express");
const { ObjectId } = require("mongodb");
const { db } = require("..");
const { send_mail } = require("../functions");
const authAdmin = require("../middleware/authAdmin");
const authUser = require("../middleware/authUser");
const checkBan = require("../middleware/checkBan");
const userDataToRequest = require("../middleware/userDataToRequest");
const multerImage = require("../middleware/multerImage");
const multipleRequestBlocker = require('../middleware/multipleRequestBlocker')
const router = Router();
const fs = require('fs');
const path = require("path");

//ROUTE 1:POST /api/plan/create
router.post(
  "/create",
  async (req, res, next) => {
    try {
      const { profit, period, commision, specific_days, maximum, minimum, image_link } =
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
      if ('image_link' in req.body) {
        dataToInsert.image = image_link
      }
      //Converting Numbers values to float type to prevent errors in future
      for (i in Object.keys(dataToInsert)) {
        let key = Object.keys(dataToInsert)[i]
        let value = dataToInsert[key]
        dataToInsert[key] = isNaN(value) ? value : parseFloat(value)
      }
      const insertedData = await db.collection("plans").insertOne(dataToInsert);
      dataToInsert._id = insertedData.insertedId.toString();
      res.status(200).send({
        message: "New plan created",
        data: dataToInsert,
      });
      next()
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error", code: 'ERROR' });
    }
  }
);

//ROUTE 2:POST /api/plan/delete
router.post("/delete/:id", authAdmin, async (req, res, next) => {
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
    next()
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
  multipleRequestBlocker,
  async (req, res, next) => {
    try {
      const { plan_id } = req.params;
      const { amount } = req.body
      if (!plan_id || isNaN(amount || null))
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
      if (balance < parseFloat(amount))
        return res
          .status(400)
          .send({ message: "User account doesn't have enough balance", code: 'NOT_ENOUGH_BALANCE' });

      if (user_data.plan)
        return res
          .status(400)
          .send({ message: "User already has an activated plan", code: 'PERMISSION_DENIED' });

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
        data: { plan_id: plan_data._id }
      });
      //Adding commission to inviter if exists
      if (req.user.data.invitedBy && plan_data.commision) {
        let invitedBy =
          req.user.data.invitedBy; //Invite code is inviter _id
        let commision = parseFloat(plan_data.commision) || 0;
        let inviter_data = (await db.collection("accounts").findOneAndUpdate(
          { inviteCode: invitedBy },
          { $inc: { balance: parseFloat(amount) * commision / 100 } },
          { returnOriginal: false }
        )).value
        console.log(inviter_data)
        await db.collection("transactions").insertOne({
          user_id: inviter_data._id,
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

      res.status(200).send({
        message: `Plan activated on account ${user_data._id.toString()}`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Internal server error", code: 'ERROR' });
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
    res.status(500).send({ message: "Internal server error", code: 'ERROR' });
  }
});

// ROUTE 5: POST /api/plan/get/:id
router.post("/get/:id", async (req, res) => {
  try {
    const id = req.params.id
    console.log(id)
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid plan id", code: 'INCORRECT_PARAMS' });
    }
    const plan_data = await db
      .collection("plans")
      .findOne({ _id: new ObjectId(id) });
    if (!plan_data) {
      return res.status(404).send({ message: "Plan not found", code: 'INCORRECT_PARAMS' });
    }
    res.status(200).send({ message: "Plan found", data: plan_data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error", code: 'ERROR' });
  }
});

//ROUTE 6:POST /api/plan/edit/{Plan id}
router.post("/edit/:id", authAdmin, async (req, res) => {
  try {
    const { profit, period, commision, specific_days, minimum, maximum, image_link } =
      req.body;
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid plan id", code: 'INCORRECT_PARAMS' });
    }

    const updateObj = {};

    if (typeof profit === "number") updateObj.profit = profit;

    if (typeof period === "number") updateObj.period = period;

    if (typeof commision === "number") updateObj.commision = commision;

    if (typeof minimum === "number") updateObj.minimum = parseFloat(minimum);

    if (typeof maximum === "number") updateObj.maximum = parseFloat(maximum);
    if (typeof image_link === "string" && (image_link.startsWith('http://') || image_link.startsWith('https://'))) updateObj.image_link = image_link
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
    res.status(500).send({ message: "Internal server error", code: 'ERROR' });
  }
});

module.exports = router;
