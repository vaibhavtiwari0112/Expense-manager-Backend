const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require("jsonwebtoken");

async function googleLogin(req, res) {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: "", // Google login, no password needed
        },
      });
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ user, token: jwtToken });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(400).send("Google login failed");
  }
}

module.exports = { googleLogin };
