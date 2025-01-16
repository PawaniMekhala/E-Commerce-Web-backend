const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user-routes");
const contactRoutes = require("./routes/contact-routes");
const productRoutes = require("./routes/product-routes");
const reviewRoutes = require("./routes/review-routes");
const cartRoutes = require("./routes/cart-routes");
const orderRoutes = require("./routes/order-routes");
const dashboardRoutes = require("./routes/dashboard-routes");
const shippingRoutes = require("./routes/shipping-routes");
const adminRoutes = require("./routes/admin-routes");
const searchRoutes = require("./routes/search-routes");
const homeRoutes = require("./routes/home-routes");
const errorHandler = require("./middleware/error-handler");
const assignRequestId = require('./middleware/assign-request-id'); // Middleware to assign request ID
const path = require("path");



dotenv.config();
const app = express();

// Middleware to generate a unique request ID
app.use(assignRequestId);

// Add some test routes
// app.get('/', (req, res) => {
//   res.send({ message: 'Request ID Middleware is working!', requestId: req.id });
// });

// Add a route to trigger an error
// app.get('/error', (req, res, next) => {
//   const error = new Error('Testing error handling');
//   next(error);
// });

const allowedOrigins = [
  "https://ecom-project-t2.netfy.app", // Production frontend
  "http://127.0.0.1:5504", // Local frontend for development
];



// Enable CORS for all routes
app.use(
  cors({
    // origin: "http://127.0.0.1:5504",
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the origin
      } else {
        callback(new Error("Not allowed by CORS")); // Reject the origin
      }
    },
    credentials: true,
  })
);

// Apply Helmet for basic security
app.use(helmet()); // This applies a set of default security headers




app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the root route
app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce Backend API");
});


// Serve static files (for image uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/home", homeRoutes);

// Use the global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5500;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});
