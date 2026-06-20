const User = require("../models/User");

exports.bootstrapAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@nouveau.com";
    const adminPass  = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || "Admin@Nouveau2024!";

    const exists = await User.findOne({ email: adminEmail });
    if (exists) {
      // Ensure admin role is set
      const updates = {};
      if (exists.role !== "admin") updates.role = "admin";

      if (typeof exists.matchPassword === "function") {
        const passwordMatches = await exists.matchPassword(adminPass).catch(() => false);
        if (!passwordMatches) updates.password = adminPass;
      } else {
        updates.password = adminPass;
      }

      if (Object.keys(updates).length > 0) {
        Object.assign(exists, updates);
        await exists.save();
        console.log("✅ Admin account synchronized for", adminEmail);
      }
      return;
    }

    await User.create({
      name:     "Nouveau Admin",
      email:    adminEmail,
      password: adminPass,
      role:     "admin",
    });
    console.log("✅ Admin user created:", adminEmail);
  } catch (err) {
    console.error("⚠️  Bootstrap admin error:", err.message);
  }
};
