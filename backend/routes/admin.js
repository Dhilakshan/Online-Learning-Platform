const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ApiUsage = require("../models/ApiUsage");

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Get current API usage statistics
router.get("/api-usage", auth("admin"), adminAuth, async (req, res) => {
  try {
    const currentUsage = await ApiUsage.getCurrentUsage();

    // Get historical data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const historicalData = await ApiUsage.find({
      date: { $gte: sevenDaysAgo },
    }).sort({ date: 1 });

    // Calculate statistics
    const totalRequests = historicalData.reduce(
      (sum, day) => sum + day.requestsToday,
      0
    );
    const averageRequests =
      historicalData.length > 0
        ? Math.round(totalRequests / historicalData.length)
        : 0;

    res.json({
      currentUsage: {
        requestsToday: currentUsage.requestsToday,
        maxRequests: currentUsage.maxRequests,
        remainingRequests:
          currentUsage.maxRequests - currentUsage.requestsToday,
        isLimitReached: currentUsage.isLimitReached(),
        isActive: currentUsage.isActive,
        lastReset: currentUsage.lastReset,
        adminNotes: currentUsage.adminNotes,
      },
      statistics: {
        totalRequests: totalRequests,
        averageRequestsPerDay: averageRequests,
        daysTracked: historicalData.length,
      },
      historicalData: historicalData.map((day) => ({
        date: day.date,
        requestsToday: day.requestsToday,
        maxRequests: day.maxRequests,
      })),
    });
  } catch (error) {
    console.error("Error fetching API usage:", error);
    res.status(500).json({ error: "Failed to fetch API usage statistics" });
  }
});

// Update API usage settings (admin only)
router.put(
  "/api-usage/settings",
  auth("admin"),
  adminAuth,
  async (req, res) => {
    try {
      const { maxRequests, isActive, adminNotes } = req.body;

      const currentUsage = await ApiUsage.getCurrentUsage();

      // Update settings
      if (maxRequests !== undefined) {
        currentUsage.maxRequests = Math.max(1, Math.min(1000, maxRequests)); // Limit between 1-1000
      }

      if (isActive !== undefined) {
        currentUsage.isActive = isActive;
      }

      if (adminNotes !== undefined) {
        currentUsage.adminNotes = adminNotes;
      }

      await currentUsage.save();

      res.json({
        message: "API usage settings updated successfully",
        currentUsage: {
          requestsToday: currentUsage.requestsToday,
          maxRequests: currentUsage.maxRequests,
          remainingRequests:
            currentUsage.maxRequests - currentUsage.requestsToday,
          isLimitReached: currentUsage.isLimitReached(),
          isActive: currentUsage.isActive,
          adminNotes: currentUsage.adminNotes,
        },
      });
    } catch (error) {
      console.error("Error updating API usage settings:", error);
      res.status(500).json({ error: "Failed to update API usage settings" });
    }
  }
);

// Reset daily API usage count
router.post("/api-usage/reset", auth("admin"), adminAuth, async (req, res) => {
  try {
    const currentUsage = await ApiUsage.getCurrentUsage();
    await currentUsage.resetDailyCount();

    res.json({
      message: "Daily API usage count reset successfully",
      currentUsage: {
        requestsToday: currentUsage.requestsToday,
        maxRequests: currentUsage.maxRequests,
        remainingRequests:
          currentUsage.maxRequests - currentUsage.requestsToday,
        lastReset: currentUsage.lastReset,
      },
    });
  } catch (error) {
    console.error("Error resetting API usage:", error);
    res.status(500).json({ error: "Failed to reset API usage count" });
  }
});

// Get detailed API usage history
router.get("/api-usage/history", auth("admin"), adminAuth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const history = await ApiUsage.find({
      date: { $gte: daysAgo },
    }).sort({ date: -1 });

    res.json({
      history: history.map((day) => ({
        date: day.date,
        requestsToday: day.requestsToday,
        maxRequests: day.maxRequests,
        totalRequests: day.totalRequests,
        isActive: day.isActive,
        adminNotes: day.adminNotes,
        createdAt: day.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching API usage history:", error);
    res.status(500).json({ error: "Failed to fetch API usage history" });
  }
});

// Get API usage summary for dashboard
router.get("/api-usage/summary", auth("admin"), adminAuth, async (req, res) => {
  try {
    const currentUsage = await ApiUsage.getCurrentUsage();

    // Get this month's data
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyData = await ApiUsage.find({
      date: { $gte: startOfMonth },
    });

    const monthlyRequests = monthlyData.reduce(
      (sum, day) => sum + day.requestsToday,
      0
    );
    const averageDailyRequests =
      monthlyData.length > 0
        ? Math.round(monthlyRequests / monthlyData.length)
        : 0;

    res.json({
      summary: {
        currentDay: {
          requests: currentUsage.requestsToday,
          maxRequests: currentUsage.maxRequests,
          remaining: currentUsage.maxRequests - currentUsage.requestsToday,
          percentage: Math.round(
            (currentUsage.requestsToday / currentUsage.maxRequests) * 100
          ),
        },
        thisMonth: {
          totalRequests: monthlyRequests,
          averageDailyRequests: averageDailyRequests,
          daysTracked: monthlyData.length,
        },
        status: {
          isActive: currentUsage.isActive,
          isLimitReached: currentUsage.isLimitReached(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching API usage summary:", error);
    res.status(500).json({ error: "Failed to fetch API usage summary" });
  }
});

module.exports = router;
