const { default: axios } = require("axios");
const { FULL2SMS_KEY, mail, mail_password, ADMIN_MAIL } = require("./config");
var nodemailer = require("nodemailer");
const { db } = require(".");

exports.generate_otp = (length) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.generateRandomString = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}


exports.send_message = async (
  message,
  number,
  sender_id = "FTWSMS",
  flash = 0
) => {
  return axios.post(
    "https://www.fast2sms.com/dev/bulkV2",
    {
      route: "v3",
      sender_id: sender_id,
      message: message,
      language: "english",
      flash: flash,
      numbers: number,
    },
    {
      headers: {
        authorization: FULL2SMS_KEY,
        "Content-Type": "application/json",
      },
    }
  );
};

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mail,
    pass: mail_password,
  },
});

exports.send_mail = (
  to,
  text = "Hello World",
  subject = "Email from application"
) => {
  return transporter.sendMail(
    {
      from: mail,
      to: to,
      subject: subject,
      text: text,
    },
    function (error, info) {
      if (error) {
        console.log(error);
      }
    }
  );
};

exports.add_plans_reward_in_users_accounts = async (day) => {
  try {
    // Use a projection to only fetch documents that have the plan field
    let users_with_plans = await db
      .collection("accounts")
      .find({ plan: { $exists: true } })
      .toArray();
    let plans_query = day ? { "specific_days": { $in: [day] } } : { "specific_days": { $exists: false } }; // Use an empty query to fetch all plans if day is not specified
    let plans = await db.collection("plans").find(plans_query).toArray();
    let plans_object = {};
    // Convert plans array data into an object (plans_object) with _id of plan as key
    plans.forEach((plan) => {
      plans_object[plan._id.toString()] = plan;
    });
    let promises = users_with_plans.map(async (user_data) => {
      let days_left_in_db = user_data.plan.days_left;
      let plan_data = plans_object[user_data.plan.id]; // Plan id from user data, field plan.id
      let reward =
        (user_data.plan.amount * plan_data.profit) / 100; // Profit to be added in user account
      let updatedData = await db
        .collection("accounts")
        .updateOne(
          { _id: user_data._id },
          { $inc: { balance: +parseFloat(reward), "plan.days_left": -1 } }
        ); // Added reward
      db.collection('transactions').insertOne({ user_id: user_data._id, type: 'credited', amount: parseFloat(reward), reason: 'Comission/Profit from plan', time: new Date(), code: 'CHEST_COMMISSION' })
      // Sending mail to user
      let mailBody = `Dear investor,\n\nYour daily profit has arrived.\n\nPlan Details:\n`;
      if ((days_left_in_db - 1) > 0) {
        mailBody += `\tDays Left: ${(days_left_in_db - 1)}\n`;
      }
      mailBody += `\tProfit: ${plan_data.profit}% (${reward})\n\nYour commission has been added to your account.`;
      await this.send_mail(user_data.email, mailBody, "PROFIT ARRIVED");

      // If days left or period is updated to 0 then remove plan from user data and send an alert on email
      if ((days_left_in_db - 1) < 1) {
        await this.send_mail(
          user_data.email,
          `Dear investor,\n\nYour Plan with id ${plan_data._id.toString()} has expired.`,
          "PLAN EXPIRED"
        );
        await db.collection("accounts").updateOne(
          { _id: user_data._id },
          {
            $unset: { plan: 1 },
          }
        );
      }
    });
    // Sending alert to admin
    await this.send_mail(
      ADMIN_MAIL,
      `Dear Admin, we have started rewarding users.\n\nThere are ${users_with_plans.length} users with active plans.`
    );

    // Running all promises
    await Promise.all(promises);
  } catch (error) {
    // Sending alert to admin if any error happened
    await this.send_mail(
      ADMIN_MAIL,
      `Dear Admin,\n\nAn error happened while distributing rewards to investors.\n\nError:\n\n${error}`
    );
    console.log(error);
  }
};

