const express = require("express");
const router = express.Router();
const platformAPIClient = require("../services/platformAPIClient");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const logger = require("../../logger");


// handle the user auth accordingly
router.post("/signin", async (req, res) => {
  const auth = req.body.authResult;

  try {
    const me = await platformAPIClient.get(`/v2/me`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });

    logger.info("User details from /me endpoint:", me.data);
  } catch (err) {
    logger.error("Invalid access token:", err.message);
    return res.status(401).json({ error: "Invalid access token" });
  }

  try {
    // Check if the user already exists in the database if not i will create new user
    let currentUser = await User.findOne({ uid: auth.user.uid });

    if (currentUser) {
      // Update the existing user's accessToken
      await User.updateOne(
        { _id: currentUser._id },
        { $set: { accessToken: auth.accessToken } }
      );
    } else {
      // Create a new user if user doesnt exist in my db
      const newUser = new User({
        username: auth.user.username,
        uid: auth.user.uid,
        roles: auth.user.roles,
        accessToken: auth.accessToken,
      });

      const savedUser = await newUser.save();
      currentUser = savedUser;
    }
    // Issuing token for succesful login 
    const token = jwt.sign({userId:currentUser.uid},process.env.JWT_SECRET,{expiresIn:"20m"})
    logger.info("User signed in successfully:", currentUser.uid);
    // Sending current user with hsi token in my fronted
    return res.status(200).json({currentUser,token});
  } catch (error) {
    logger.error("User sign in failed", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/signout", async (req, res) => {
  // Clear currentUser from the session upon signout
  logger.info("User signed out");
  return res.status(200).json({ message: "User signed out" });
});


// token verifying fujction that will auto login user when his token is still valid 
//this is called in my fronted when app did mount(for initial loading)
router.post("/verify-token", async (req, res) => {
  try {
    const token = req.body.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findOne({ uid: decoded.userId });

    if (currentUser) {
      logger.info("User token verified successfully:", currentUser.uid);
      return res.status(200).json({ currentUser });
    } else {
      logger.warn("Invalid access token");
      return res.status(401).json({ error: "Invalid access token" });
    }
  } catch (error) {
    logger.error("User access token expired; User needs to login");
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
