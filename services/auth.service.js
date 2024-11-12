const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient"); 
const { JWT_SECRET_KEY } = process.env;


if (!JWT_SECRET_KEY) {
  throw new Error("JWT Secret Key is not defined in the environment variables");
}

const AuthService = {

  async register({ name, email, password }) {
    try {

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("Email is already registered");
      }


      const hashedPassword = await bcrypt.hash(password, 10);


      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );

      return { user, token };
    } catch (error) {
      console.error("Registration Error:", error.message);
      throw new Error(`Registration failed: ${error.message}`);
    }
  },

  async login({ email, password }) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("User not found");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );

      return { user, token };
    } catch (error) {
      console.error("Login Error:", error.message);
      throw new Error(`Login failed: ${error.message}`);
    }
  },


  async logout(req) {
    return true;
  },

  async isLoggedIn(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return { loggedIn: false };
    }

    const token = authHeader.split(' ')[1];

    try {
      const user = jwt.verify(token, JWT_SECRET_KEY);
      return { loggedIn: true, user };
    } catch (error) {
      console.error("Token verification error:", error.message);
      return { loggedIn: false };
    }
  },
};

module.exports = AuthService;
