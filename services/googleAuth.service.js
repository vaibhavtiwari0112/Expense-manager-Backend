const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || "",
  process.env.GOOGLE_CLIENT_SECRET || "",
);

const GoogleAuthService = {
  async googleAuthRedirect() {
    try {
      return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=email profile`;
    } catch (error) {
      throw new Error("Error generating Google Auth redirect URL");
    }
  },

  async googleCallback(code) {
    try {
      const { tokens } = await client.getToken({
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      });

      if (!tokens.id_token) {
        throw new Error("ID token not received from Google");
      }

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const { email, name, picture } = ticket.getPayload();

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: { email, name, picture, password: "" },
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );

      return { user, token };
    } catch (error) {
      console.error("Google Auth Callback Error:", error.message);
      throw new Error("Error processing Google authentication");
    }
  },
};

module.exports = GoogleAuthService;
