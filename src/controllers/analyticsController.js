import Item from "../models/Item.js";

export const getAnalytics = async (req, res) => {
  try {
    const [summary] = await Item.aggregate([
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
    ]);

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
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};