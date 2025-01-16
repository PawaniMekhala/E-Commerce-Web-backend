const express = require("express");
const router = express.Router();
const {
  addReview,
  getAllReviews,
  deleteReview,
  deleteReviewForUser,
  updateReview,
  sendReplyEmail,
} = require("../controllers/review-controller");
const { authenticateUser } = require("../middleware/auth-middleware");

// route to add a review
router.post("/add-review", authenticateUser, addReview);

// route to fetch all reviews
router.get("/get-reviews", getAllReviews);

// route to delete a review by ReviewID, accessible only to admin
router.delete("/:reviewId", deleteReview);

// route for user to delete their own review
router.delete("/user/:reviewId", authenticateUser, deleteReviewForUser);

// route to update a review, accessible only to the review owner
router.put("/user/:reviewId", authenticateUser, updateReview);

// router to send back the userId and role of the authenticated user
router.get("/user/user-info", authenticateUser, (req, res) => {
  res.json({ userId: req.user.userId, role: req.user.role });
});

// route to send a reply email
router.post("/:reviewId", sendReplyEmail);

module.exports = router;
