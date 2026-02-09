import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://socialgame-d2zq.onrender.com",
      "https://socialgame-api.onrender.com/api",
      "https://socialgame-api.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/social-events")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400",
  },
  favoriteSports: [
    {
      type: String,
    },
  ],
  interests: [
    {
      type: String,
    },
  ],
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  profileComplete: {
    type: Boolean,
    default: false,
  },
  dismissedProfilePrompt: {
    type: Boolean,
    default: false,
  },
  createdEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  registeredEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  likedEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

// Event Schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
  time: {
    type: Date,
    required: true,
  },
  sportType: {
    type: String,
    required: true,
    enum: [
      "Volleyball",
      "Basketball",
      "Soccer",
      "Tennis",
      "Yoga",
      "Running",
      "Cycling",
      "Swimming",
      "Other",
    ],
  },
  images: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  maxAttendees: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model("Event", eventSchema);

// Bug Report Schema
const bugReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  screenshots: [String],
  userEmail: String,
  userName: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  userAgent: String,
  status: {
    type: String,
    enum: ['pending', 'working', 'resolved'],
    default: 'pending'
  }
});

const BugReport = mongoose.model("BugReport", bugReportSchema);

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key-change-this",
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = user;
      next();
    },
  );
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this",
      (err, user) => {
        if (!err) {
          req.user = user;
        }
      },
    );
  }
  next();
};

// Auto-delete expired events (past 24 hours)
const deleteExpiredEvents = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Event.deleteMany({
      time: { $lt: twentyFourHoursAgo },
    });
    if (result.deletedCount > 0) {
      console.log(`🗑️  Deleted ${result.deletedCount} expired events`);
    }
  } catch (error) {
    console.error("Error deleting expired events:", error);
  }
};

// Run cleanup every hour
setInterval(deleteExpiredEvents, 60 * 60 * 1000);
// Run on startup
deleteExpiredEvents();

// ==================== IMAGE UPLOAD ROUTES ====================

app.post(
  "/api/upload",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "Gathr",
        resource_type: "auto",
      });

      res.json({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res
        .status(500)
        .json({ message: "Failed to upload image", error: error.message });
    }
  },
);

app.post(
  "/api/upload-multiple",
  authenticateToken,
  upload.array("eventImages", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      if (req.files.length > 5) {
        return res.status(400).json({ message: "Maximum 5 images allowed" });
      }

      const uploadPromises = req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "Gathr/events",
          resource_type: "auto",
        });
        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      });

      const results = await Promise.all(uploadPromises);
      res.json(results);
    } catch (error) {
      console.error("Upload error:", error);
      res
        .status(500)
        .json({ message: "Failed to upload images", error: error.message });
    }
  },
);

// ==================== AUTH ROUTES ====================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, name, interests, location } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
      });
    }

    // Check if profile is complete
    const profileComplete = !!(interests && interests.length > 0 && location && location.address);

    const user = new User({ 
      username, 
      email, 
      password, 
      name,
      interests: interests || [],
      location: location || {},
      profileComplete,
      dismissedProfilePrompt: false
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key-change-this",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        interests: user.interests,
        location: user.location,
        profileComplete: user.profileComplete,
        dismissedProfilePrompt: user.dismissedProfilePrompt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key-change-this",
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        favoriteSports: user.favoriteSports,
        interests: user.interests,
        location: user.location,
        profileComplete: user.profileComplete,
        dismissedProfilePrompt: user.dismissedProfilePrompt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("createdEvents")
      .populate("registeredEvents");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== USER ROUTES ====================

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("createdEvents")
      .populate("registeredEvents");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { name, bio, avatar, favoriteSports, interests, location, dismissedProfilePrompt } = req.body;
    
    // Check if profile is complete
    const profileComplete = !!(interests && interests.length > 0 && location && location.address);
    
    const updateData = {
      name,
      bio,
      avatar,
      favoriteSports,
    };
    
    // Only update these fields if they're provided
    if (interests !== undefined) updateData.interests = interests;
    if (location !== undefined) updateData.location = location;
    if (dismissedProfilePrompt !== undefined) updateData.dismissedProfilePrompt = dismissedProfilePrompt;
    if (profileComplete !== undefined) updateData.profileComplete = profileComplete;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ==================== EVENT ROUTES ====================

app.get("/api/events", authenticateToken, async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .populate("creator", "username name avatar")
      .populate("attendees", "username name avatar");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("creator", "username name avatar bio")
      .populate("attendees", "username name avatar");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/events", authenticateToken, async (req, res) => {
  try {
    // Validate max 5 images
    if (req.body.images && req.body.images.length > 5) {
      return res.status(400).json({ message: "Maximum 5 images allowed" });
    }

    const eventData = {
      ...req.body,
      creator: req.user.userId,
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $push: { createdEvents: savedEvent._id },
    });

    const populatedEvent = await Event.findById(savedEvent._id).populate(
      "creator",
      "username name avatar",
    );

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE EVENT - CRITICAL FIX FOR 404 ERROR
app.put("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the creator
    if (event.creator && event.creator.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Only the event creator can update this event" });
    }

    // Validate max 5 images
    if (req.body.images && req.body.images.length > 5) {
      return res.status(400).json({ message: "Maximum 5 images allowed" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    )
      .populate("creator", "username name avatar")
      .populate("attendees", "username name avatar");

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the creator
    if (event.creator && event.creator.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Only the event creator can delete this event" });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Remove from user's created events
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { createdEvents: req.params.id },
    });

    // Remove from all attendees' registered events
    await User.updateMany(
      { registeredEvents: req.params.id },
      { $pull: { registeredEvents: req.params.id } },
    );

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/events/:id/register", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.attendees.includes(req.user.userId)) {
      return res
        .status(400)
        .json({ message: "Already registered for this event" });
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: "Event is full" });
    }

    event.attendees.push(req.user.userId);
    await event.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $push: { registeredEvents: event._id },
    });

    const updatedEvent = await Event.findById(event._id)
      .populate("creator", "username name avatar")
      .populate("attendees", "username name avatar");

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/events/:id/unregister", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== req.user.userId,
    );
    await event.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { registeredEvents: event._id },
    });

    const updatedEvent = await Event.findById(event._id)
      .populate("creator", "username name avatar")
      .populate("attendees", "username name avatar");

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/events/:id/like", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { increment } = req.body;
    event.likes += increment ? 1 : -1;
    event.likes = Math.max(0, event.likes);

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== BUG REPORT ROUTES ====================

// Submit bug report
app.post("/api/bugs", authenticateToken, async (req, res) => {
  try {
    const bug = new BugReport({
      ...req.body,
      userId: req.user.userId,
      status: 'pending'
    });
    await bug.save();
    res.status(201).json(bug);
  } catch (error) {
    console.error("Bug submission error:", error);
    res.status(500).json({ message: "Error submitting bug report", error: error.message });
  }
});

// Get all bugs
app.get("/api/bugs", authenticateToken, async (req, res) => {
  try {
    const bugs = await BugReport.find()
      .populate("userId", "username email")
      .sort({ timestamp: -1 });
    res.json(bugs);
  } catch (error) {
    console.error("Fetch bugs error:", error);
    res.status(500).json({ message: "Error fetching bugs", error: error.message });
  }
});

// Update bug status
app.put("/api/bugs/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const bug = await BugReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(bug);
  } catch (error) {
    console.error("Update bug status error:", error);
    res.status(500).json({ message: "Error updating bug status", error: error.message });
  }
});

// Delete bug
app.delete("/api/bugs/:id", authenticateToken, async (req, res) => {
  try {
    await BugReport.findByIdAndDelete(req.params.id);
    res.json({ message: "Bug deleted" });
  } catch (error) {
    console.error("Delete bug error:", error);
    res.status(500).json({ message: "Error deleting bug", error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});
