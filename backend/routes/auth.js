const { Router } = require("express");
const { db } = require("..");
const { generate_otp, send_message, send_mail, generateRandomString } = require("../functions");
const router = Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { JWT_SECRET, ADMIN_PASSWORD, app_link } = require("../config");
const { ObjectId } = require("mongodb");
let users = {};

//ROUTE 1: POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    let { phone, password, username, email } = req.body;
    if (!phone || !password || !username || !email) {
      return res.status(400).send({ message: "Information is not completed", code: 'INCORRECT_PARAMS' });
    }
    phone = phone.toString();
    phone.trimEnd();
    email = email.trimEnd().toLowerCase();
    if (phone.length != 10)
      return res.status(400).send({ message: "Incorrect phone number", code: 'INCORRECT_PARAMS' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).send({ message: "Incorrect Email Address", code: 'INCORRECT_PARAMS' });
    let old_data = await db.collection("accounts").findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    if (old_data)
      return res.status(400).send({ message: "Account already registred ", code: 'ALREADY_EXIST' });
    if (users[email]) {
      send_mail(email, `Your verication code: ${users[email].otp.toString()}`);
      return res.status(200).send({ message: "Otp sended to email" });
    }
    users[email] = req.body;
    let otp = generate_otp(4);
    users[email].otp = otp;
    // send_mail(email, `Your verication code: ${users[email].otp.toString()}`);
    // res.status(200).send({ message: "Otp sended on Phone Number" });
    send_message(`Your verication code: ${otp.toString()}`, phone)
      .then((result) => {
        res.status(200).send({ message: "Otp sended on Phone Number" });
      })
      .catch((error) => {
        console.log(error);
        res.status(401).send({ message: "Interval Server Error", code: 'ERROR' });
      });
    // console.log(users);
    next()
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Interval Server Error", code: 'ERROR' });
  }
});

//ROUTE 2:POST /api/auth/verifyOtp
router.post("/verifyOTP", async (req, res, next) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).send({ message: "Information is uncompleted", code: 'INCORRECT_PARAMS' });
    email = email.trimEnd().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).send({ message: "Incorrect Email Address", code: 'INCORRECT_PARAMS' });

    if (!users[email])
      return res.status(400).send({ message: "Please try to register again", code: 'TRY_AGAIN' });
    let old_data = await db.collection("accounts").findOne({
      $or: [{ email: email }, { phone: users[email].phone }],
    });
    if (old_data)
      return res.status(400).send({ message: "Account already registered", code: 'ALREADY_EXIST' });
    if (otp.toString() != users[email].otp.toString())
      return res.status(400).send({ message: "Incorrect Verification Code", code: 'INVALID_CODE' });
    delete users[email].otp;
    let salt = await bcrypt.genSalt(10);
    let password_hash = await bcrypt.hash(
      users[email].password.trimEnd(),
      salt
    );
    users[email].password = password_hash;
    users[email].inviteCode = generateRandomString(6)

    let insertedData = await db.collection("accounts").insertOne(users[email]);
    const id = insertedData.insertedId.toString();
    const data = {
      id: id,
    };
    const token = jwt.sign(data, JWT_SECRET);
    res.status(200).send({ message: "Account registered", token });
    let adminData = await db.collection("admin").findOne({});
    if (adminData?.signup_bonus) {
      db.collection("accounts").updateOne(
        { _id: new ObjectId(data.id) },
        { $inc: { balance: +parseFloat(adminData?.signup_bonus || 0) } }
      );
      await db.collection("transactions").insertOne({
        user_id: new ObjectId(data.id),
        amount: parseFloat(adminData?.signup_bonus || 0),
        type: "credited",
        reason: "Sign up Bonus",
        time: new Date(),
        code: 'SIGNUP_BONUS'
      });
    }
    if (users[email].invitedBy && adminData?.per_refer) {
      //Invite code is user _id
      if (users[email].invitedBy.length == 12) {
        var invitedBy =
          users[email].invitedBy;
        let inviter_data = await db
          .collection("accounts")
          .findOne({ inviteCode: invitedBy });
        if (inviter_data) {
          await db
            .collection("accounts")
            .updateOne(
              { _id: inviter_data._id },
              { $inc: { balance: +parseFloat(adminData?.per_refer) } }
            );
          await db.collection("transactions").insertOne({
            user_id: inviter_data._id,
            amount: parseFloat(adminData?.per_refer),
            type: "credited",
            reason: "Refer reward",
            code: 'REFER_BONUS',
            time: new Date(),
          });
          send_mail(
            inviter_data.email,
            `You got a new refer from ${users[email].username}`,
            "Referall campaign"
          );
        }
      }
    }
    next()
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Interval Server Error", code: 'ERROR' });
  }
});

//ROUTE 3:POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password, phone } = req.body;
    if ((!email && !phone) || !password) {
      return res.status(400).send({ message: "Information not completed", code: 'INCORRECT_PARAMS' });
    }
    const user_data = await db.collection("accounts").findOne({
      $or: [
        { email: email?.trimEnd()?.toLowerCase() },
        { phone: phone?.toString()?.trimEnd() },
      ],
    });
    if (!user_data) {
      return res.status(400).send({ message: "Account not exist", code: 'ACCOUNT_NOT_EXIST' });
    }
    const passwordCompare = await bcrypt.compare(
      password?.trimEnd()?.toLowerCase(),
      user_data.password
    );
    if (!passwordCompare) {
      return res
        .status(400)
        .send({ message: "Please try to login with correct credentials", code: 'PERMISSION_DENIED' });
    }
    const data = {
      id: user_data._id.toString(),
    };
    const token = jwt.sign(data, JWT_SECRET);
    res.status(200).send({ message: "Account found", token });
    next()
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", code: 'ERROR' });
  }
});

//ROUTE 4:POST /api/auth/admin
router.post("/admin", async (req, res, next) => {
  try {
    let { password } = req.body;
    if (!password)
      return res.send(400).send({ message: "Incorrect admin password", code: 'PERMISSION_DENIED' });
    password = password.trimEnd().toLowerCase();
    if (password == ADMIN_PASSWORD.toLowerCase()) {
      res.status(200).send({
        message: "Password matched",
        token: jwt.sign({ admin: true }, ADMIN_PASSWORD),
      });
    } else {
      res.status(400).send({ message: "Incorrect Password", code: 'INVALID_PASSWORD' });
    }
    next()
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Interval Server Error", code: 'ERROR' });
  }
});

//ROUTE 5:POST /api/auth/forget
let verification_token = { 6557631048: "balkaransin888@gmail.com" };
router.post("/forget", async (req, res, next) => {
  try {
    let { detail } = req.body;
    if (!detail)
      return res.status(400).send({
        message:
          "Please provide registered Email Or Phone Number in request body",
        code: 'INCORRECT_PARAMS'
      });
    detail = detail.toString().trimEnd();
    let user_data = await db.collection("accounts").findOne({
      $or: [{ phone: !isNaN(detail) && parseInt(detail) }, { email: detail }],
    });
    if (!user_data)
      return res.status(400).send({ message: "Account not exists", code: 'ACCOUNT_NOT_EXIST' });
    let token = generate_otp(10).toString();
    verification_token[token] = detail;
    send_mail(
      user_data.email,
      `Your verification link: ${app_link}/reset/${token}`
    );
    res
      .status(200)
      .send({ message: `Reset link sended to email: ${user_data.email}` });
    next()
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Interval Server Error", code: 'ERROR' });
  }
});

//ROUTE 5:POST /api/auth/forget/token/{Token}
router.post("/forget/token/:token", async (req, res, next) => {
  try {
    const token = req.params.token;
    let { new_password } = req.body;
    new_password =
      typeof new_password != "string" ? new_password.toString() : new_password;
    let user_detail = verification_token[token];
    if (!user_detail)
      return res.status(400).send({ message: "Incorrect token", code: 'TRY_AGAIN' });
    if (!new_password)
      return res
        .status(400)
        .send({ message: "Please provide new password in request body", code: 'INCORRECT_PARAMS' });
    const user_data = await db
      .collection("accounts")
      .findOne({ $or: [{ phone: user_detail }, { email: user_detail }] });
    delete verification_token[token];
    if (!user_data)
      return res.status(400).send({ message: "Account does not exists", code: 'ACCOUNT_NOT_EXIST' });
    let salt = await bcrypt.genSalt(10);
    let password_hash = await bcrypt.hash(new_password.trimEnd(), salt);
    await db
      .collection("accounts")
      .updateOne(
        { phone: user_data.phone },
        { $set: { password: password_hash } }
      );
    let auth_token = jwt.sign({ id: user_data._id.toString() }, JWT_SECRET);
    res
      .status(200)
      .send({ message: "Password reset succesfully", token: auth_token });
    next()
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Interval Server Error", code: 'ERROR' });
  }
});

//ROUTE 6:POST /api/auth/resendOTP
router.post("/resendOTP", async (req, res, next) => {
  try {
    let { email } = req.body;
    if (!email)
      return res
        .status(400)
        .send({ message: "Must send email in request body", code: 'INCORRECT_PARAMS' });
    let data = users[email];
    if (!data)
      return res.status(400).send({ message: "Please try to register again", code: 'TRY_AGAIN' });
    let otp = generate_otp(4);
    users[email].otp = otp;
    send_mail(email, `Your verication code: ${users[email].otp.toString()}`);
    return res.status(200).send({ message: "Otp sended to email" });
    next()
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Interval Server Error", code: 'ERROR' });
  }
});

module.exports = router;
