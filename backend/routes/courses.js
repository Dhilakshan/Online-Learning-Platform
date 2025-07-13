const express = require("express");
const Course = require("../models/Course");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();
const courseController = require("../controllers/courseController");

// Create course (Instructor only)
router.post("/", auth("instructor"), async (req, res) => {
  try {
    const course = new Course({ ...req.body, instructor: req.user.id });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "username")
      .limit(100);

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all courses for instructor
router.get("/instructor", auth("instructor"), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate("instructor", "username")
      .limit(100);

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll in course (Student only)
router.post("/:id/enroll", auth("student"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Check if already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
      (entry) => entry.student.toString() === req.user.id
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ error: "Already enrolled" });
    }

    // Enroll student
    course.enrolledStudents.push({
      student: req.user.id,
      enrolledAt: new Date(),
    });
    await course.save();

    // Add course to user's enrolled courses
    const user = await User.findById(req.user.id);
    if (!user.enrolledCourses.includes(course._id)) {
      user.enrolledCourses.push(course._id);
      await user.save();
    }

    res.json({ message: "Enrollment successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Update course (Instructor only)
router.put("/:id", auth("instructor"), courseController.updateCourse);

// Delete course (Instructor only)
router.delete("/:id", auth("instructor"), courseController.deleteCourse);

// Get enrolled courses for the logged-in student
router.get("/enrolled", auth("student"), courseController.getEnrolledCourses);

// Get enrolled students for a course (Instructor only)
router.get("/:id/students", auth("instructor"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("enrolledStudents.student", "username email") // ✅ populate nested
      .populate("instructor", "username");

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if the instructor owns this course
    if (course.instructor._id.toString() !== req.user.id) {
      return res.status(403).json({
        error: "Not authorized to view this course's students",
      });
    }

    // Format the response
    const students = course.enrolledStudents.map((entry) => ({
      id: entry.student._id,
      username: entry.student.username,
      email: entry.student.email,
      enrolledAt: entry.enrolledAt,
    }));

    res.json({
      courseTitle: course.title,
      totalStudents: students.length,
      students: students,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
