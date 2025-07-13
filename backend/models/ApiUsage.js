const mongoose = require("mongoose");

const ApiUsageSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    totalRequests: {
      type: Number,
      default: 0,
      required: true,
    },
    maxRequests: {
      type: Number,
      default: 250,
      required: true,
    },
    requestsToday: {
      type: Number,
      default: 0,
      required: true,
    },
    lastReset: {
      type: Date,
      default: Date.now,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient date-based queries
ApiUsageSchema.index({ date: 1 });

// Method to check if API limit is reached
ApiUsageSchema.methods.isLimitReached = function () {
  return this.requestsToday >= this.maxRequests;
};

// Method to increment request count
ApiUsageSchema.methods.incrementRequest = function () {
  this.requestsToday += 1;
  this.totalRequests += 1;
  return this.save();
};

// Method to reset daily count
ApiUsageSchema.methods.resetDailyCount = function () {
  this.requestsToday = 0;
  this.lastReset = new Date();
  return this.save();
};

// Static method to get current usage
ApiUsageSchema.statics.getCurrentUsage = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let usage = await this.findOne({
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (!usage) {
    // Create new usage record for today
    usage = new this({
      date: today,
      requestsToday: 0,
      totalRequests: 0,
      maxRequests: 250,
      lastReset: today,
      isActive: true,
    });
    await usage.save();
  }

  return usage;
};

// Static method to check if API is available
ApiUsageSchema.statics.canMakeRequest = async function () {
  const usage = await this.getCurrentUsage();
  return usage.isActive && !usage.isLimitReached();
};

module.exports = mongoose.model("ApiUsage", ApiUsageSchema);
