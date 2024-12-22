const UserService = require("../services/user.service");

const UserController = {
  async getUser(req, res) {
    const { id } = req.params;

    try {
      const user = await UserService.getUserById(parseInt(id));

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error retrieving user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async updateUser(req, res) {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      salary,
      salary_type,
      salaryDate,
      profileImagePath,
    } = req.body;

    try {
      const updatedUser = await UserService.updateUser(parseInt(id), {
        name,
        email,
        phone,
        salary,
        salary_type,
        salaryDate,
        profileImagePath,
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);

      if (error.code === "P2025") {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = UserController;
