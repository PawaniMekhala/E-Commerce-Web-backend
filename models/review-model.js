const db = require("../config/db");

const Review = {
  // model to create review
  create: async (userId, comment) => {
    const query = "INSERT INTO review (UserID, Comment) VALUES (?, ?)";
    const [result] = await db.query(query, [userId, comment]);
    return result; // Return the result which contains the insertId
  },

  //model to get all reviews
  findAll: async () => {
    const query =
      "SELECT r.ReviewID, r.UserID, r.Comment, u.FirstName, u.LastName, u.ProfilePicture  FROM review r JOIN user u ON r.UserID = u.UserID";
    const [reviews] = await db.query(query);
    return reviews;
  },

  // model to delete a review by ReviewID only for admin
  deleteById: async (reviewId) => {
    const query = "DELETE FROM review WHERE ReviewID = ?";
    const [result] = await db.query(query, [reviewId]);
    return result;
  },

  // model to delete review by ReviewID and UserID to ensure only owner can delete
  deleteByUserAndId: async (reviewId, userId) => {
    const query = "DELETE FROM review WHERE ReviewID = ? AND UserID = ?";
    const [result] = await db.query(query, [reviewId, userId]);
    return result;
  },

  // model to update a review by ReviewID and UserID to ensure only the owner can update
  updateReviewById: async (reviewId, userId, newComment) => {
    const query =
      "UPDATE review SET Comment = ? WHERE ReviewID = ? AND UserID = ?";
    const [result] = await db.query(query, [newComment, reviewId, userId]);
    return result;
  },

  // model to find a review by ID and UserID
  findReviewByIdAndUserId: async (reviewId, userId) => {
    const query = "SELECT * FROM review WHERE ReviewID = ? AND UserID = ?";
    const [results] = await db.query(query, [reviewId, userId]);
    return results[0];
  },

  // model to fetch user email and name based on ReviewID and UserID
  getUserEmailByReviewId: async (reviewId) => {
    const query =
      "SELECT u.Email, u.FirstName, u.LastName FROM review r JOIN user u ON r.UserID = u.UserID WHERE r.ReviewID = ?";
    const [result] = await db.query(query, [reviewId]);
    return result;
  },
};

module.exports = Review;
