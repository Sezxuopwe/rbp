const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
  // รับค่า Email และ Password จากหน้าเว็บ
  const { email, password } = JSON.parse(event.body);
  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    // ไปค้นในตาราง users ที่เราสร้างไว้ใน Neon
    const user = await sql`SELECT * FROM users WHERE username = ${email} AND password = ${password}`;

    if (user.length > 0) {
      return { statusCode: 200, body: JSON.stringify({ message: "Welcome back!" }) };
    } else {
      return { statusCode: 401, body: JSON.stringify({ message: "Login Failed" }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};