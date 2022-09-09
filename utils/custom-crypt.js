const axios = require("axios").default;

customConfig = {
  headers: {
    "Content-Type": "application/json",
  },
};

exports.hashPassword = async (password) => {
  try {
    const response = await axios.post(
      "https://hashed-password.herokuapp.com/hash-password",
      JSON.stringify({ password }),
      customConfig
    );
    return response.data.hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

exports.comparePassword = async (hashedPassword, password) => {
  try {
    const response = await axios.post(
      "https://hashed-password.herokuapp.com/check-password",
      JSON.stringify({
        hashedPassword,
        password,
      }),
      customConfig
    );
    return response.data.matches;
  } catch (error) {
    console.log(error);
  }
};
