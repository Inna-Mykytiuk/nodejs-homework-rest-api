const bcryptjs = require("bcryptjs");
const gravatar = require("gravatar");
const { User } = require("../../models/user");
const { HttpError, sendEmail } = require("../../helpers");
const { nanoid } = require("nanoid");

require("dotenv").config();

const { BASE_URL } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcryptjs.hash(password, 10);
  // const newUser = await User.create({ ...req.body, password: hashPassword });
  const avatarUrl = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarUrl,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
    avatar: newUser.avatarUrl,
  });
};

module.exports = register;
