// netlify/functions/login.js
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { username, password } = JSON.parse(event.body);

  // ✅ แก้ตรงนี้
  const CORRECT_USER = "rakbaipor";
  const CORRECT_PASS = "baiporlnwza";

  if (username === CORRECT_USER && password === CORRECT_PASS) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Welcome back!" }),
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Login Failed" }),
    };
  }
};