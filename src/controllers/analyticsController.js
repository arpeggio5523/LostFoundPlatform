import Item from "../models/Item.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res) => {
  try {
    const currentMonth = new Date();
    const firstMonth = new Date(Date.UTC(
      currentMonth.getUTCFullYear(),
      currentMonth.getUTCMonth() - 11,
      1,
    ));
    const regularUsers = { role: { $ne: "Admin" } };
    const [[summary], totalUsers, monthlyUserResults] = await Promise.all([
      Item.aggregate([
        {
          $group: {
            _id: null,
            lostPosts: { $sum: { $cond: [{ $eq: ["$type", "Lost"] }, 1, 0] } },
            foundPosts: { $sum: { $cond: [{ $eq: ["$type", "Found"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
            deleted: { $sum: { $cond: [{ $eq: ["$status", "Deleted"] }, 1, 0] } },
          },
        },
      ]),
      User.countDocuments(regularUsers),
      User.aggregate([
        {
          $match: {
            ...regularUsers,
            createdAt: { $gte: firstMonth },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    const registrationsByMonth = new Map(
      monthlyUserResults.map(({ _id, count }) => [_id, count]),
    );
    const monthlyRegistrations = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Date.UTC(
        firstMonth.getUTCFullYear(),
        firstMonth.getUTCMonth() + index,
        1,
      ));
      const month = date.toISOString().slice(0, 7);
      return { month, count: registrationsByMonth.get(month) || 0 };
    });

    return res.status(200).json({
      data: {
        totalPosts: summary?.lostPosts + summary?.foundPosts || 0,
        lostPosts: summary?.lostPosts || 0,
        foundPosts: summary?.foundPosts || 0,
        statuses: {
          pending: summary?.pending || 0,
          approved: summary?.approved || 0,
          rejected: summary?.rejected || 0,
          deleted: summary?.deleted || 0,
        },
        users: {
          total: totalUsers,
          monthlyRegistrations,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};