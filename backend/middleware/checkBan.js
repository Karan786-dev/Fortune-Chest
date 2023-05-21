
module.exports = async (req, res, next) => {
  try {
    let user_id = req.user?.id;
    if (!user_id || !req.user?.data) {
      return res.status(400).send({message:'Did not found data in backend please try again',code:'TRY_AGAIN'})
    }

    if (req.user.data.block) {
      return res.status(400).send({ message: "User account is blocked" ,code:"PERMISSION_DENIED"});
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Internal server error",code:'ERROR' });
  }
};
