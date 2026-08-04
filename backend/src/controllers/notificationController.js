import { Notification } from "../models/Notification.js";

// @desc    Create new notification (Publish or Draft)
// @route   POST /api/v1/notifications
// @access  Admin
export const createNotification = async (req, res, next) => {
  try {
    const { language, msgEn, msgHi, link, status } = req.body;

    if (language === "English" && !msgEn) {
      return res.status(400).json({ success: false, message: "English message is required" });
    }
    if (language === "Hindi" && !msgHi) {
      return res.status(400).json({ success: false, message: "Hindi message is required" });
    }

    const nowStr = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const notification = await Notification.create({
      language: language || "Both",
      msgEn: msgEn || "",
      msgHi: msgHi || "",
      link: link || "",
      status: status || "Sent",
      sentOn: nowStr,
    });

    return res.status(201).json({
      success: true,
      message: status === "Draft" ? "Notification saved to draft" : "Notification published successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notifications for admin dashboard
// @route   GET /api/v1/notifications
// @access  Admin / Public
export const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get published notifications for frontend ticker bar
// @route   GET /api/v1/notifications/published
// @access  Public
export const getPublishedNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      status: { $in: ["Sent", "Published"] },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification
// @route   PUT /api/v1/notifications/:id
// @access  Admin
export const updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language, msgEn, msgHi, link, status } = req.body;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (language !== undefined) notification.language = language;
    if (msgEn !== undefined) notification.msgEn = msgEn;
    if (msgHi !== undefined) notification.msgHi = msgHi;
    if (link !== undefined) notification.link = link;
    if (status !== undefined) notification.status = status;

    notification.sentOn = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Admin
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
