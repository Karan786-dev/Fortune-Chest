const { ObjectId } = require("mongodb");
const { db } = require("../backend");

module.exports = async (req, res, next) => {
  try {
    const { id: user_id } = req.user;
    if (!user_id) {
      throw new Error(
        "Please use authUser middleware before userDataToRequest middleware"
      );
    } 
    const user_data = await db.collection("accounts").findOne({
      _id: typeof user_id === "string" ? new ObjectId(user_id) : user_id,
    });
    if (!user_data) {
      return res.status(400).send({ message: "User account not found",code:'ACCOUNT_NOT_EXIST' });
    }
    req.user.data = user_data;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Internal server error" ,code:'ERROR'});
  }
};
