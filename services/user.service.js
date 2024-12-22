const prisma = require("../prismaClient");

const UserService = {
  async getUserById(userId) {
    // Ensure userId is an integer
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      throw new Error("Invalid userId");
    }

    return await prisma.user.findUnique({
      where: { id: userIdInt },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        salary: true,
        salary_type: true,
        createdAt: true,
        salaryDate: true,
        updatedAt: true,
        profileImagePath: true, // Add this line to fetch the profile image path
        profileImageUrl: true, // Add this line to fetch the profile image URL
      },
    });
  },

  async updateUser(userId, data) {
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      throw new Error("Invalid userId");
    }

    // Optional: Validate if the data contains valid profile image URL/path
    if (data.profileImagePath) {
      // If the path is a base64 string, no need to check for "/"
      if (!data.profileImagePath.startsWith("data:image/")) {
        // Only check for "/"" if it's not a base64 string
        if (!data.profileImagePath.startsWith("/")) {
          throw new Error("Invalid profile image path");
        }
      }
    }

    if (data.profileImageUrl && !data.profileImageUrl.startsWith("http")) {
      throw new Error("Invalid profile image URL");
    }

    return await prisma.user.update({
      where: { id: userIdInt },
      data,
    });
  },
};

module.exports = UserService;
