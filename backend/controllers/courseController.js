const Course = require("../models/Course");

exports.createCourse = async (req, res) => {
  if (req.user.role !== "instructor")
    return res
      .status(403)
      .json({ error: "Only instructors can create courses." });
  try {
    const { title, description, content } = req.body;
    const course = new Course({
      title,
      description,
      content,
      instructor: req.user.id,
    });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCourses = async (req, res) => {
  const courses = await Course.find()
    .populate("instructor", "username email")
    .limit(100);
  res.json(courses);
};

exports.getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id).populate(
    "instructor",
    "username email"
  );
  if (!course) return res.status(404).json({ error: "Course not found." });
  res.json(course);
};

exports.updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (course.instructor.toString() !== req.user.id)
    return res.status(403).json({ error: "Not authorized." });
  Object.assign(course, req.body);
  await course.save();
  res.json(course);
};

exports.deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found." });
  if (course.instructor.toString() !== req.user.id)
    return res.status(403).json({ error: "Not authorized." });
  await course.deleteOne();
  res.json({ message: "Course deleted." });
};

exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found." });
    if (!course.students) course.students = [];
    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ error: "Already enrolled." });
    }
    course.students.push(req.user.id);
    await course.save();
    res.json({ message: "Enrolled successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      enrolledStudents: { $elemMatch: { student: req.user.id } },
    })
      .populate("instructor", "username email createdAt")
      .limit(100);
    res.json(courses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
