const session = require("express-session");
const PrismaSessionStore = require('@quixo3/prisma-session-store').PrismaSessionStore; 
const prisma = require("../prismaClient");

const sessionMiddleware = session({
  cookie: {
    maxAge: 20 * 60 * 1000, 
    secure: process.env.NODE_ENV === "production", 
  },
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, 
  }),
  secret: process.env.SESSION_SECRET || 'defaultSecret', 
  resave: false,
  saveUninitialized: false,
});

module.exports = sessionMiddleware;
