const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Course = require("../models/Course");
const ApiUsage = require("../models/ApiUsage");
const axios = require("axios");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Recommend courses based on user prompt
router.post("/courses", auth("student"), async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("prompt: ", prompt);

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const trimmedPrompt = prompt.trim();

    // Check API usage limits
    const canMakeRequest = await ApiUsage.canMakeRequest();
    if (!canMakeRequest) {
      return res.status(429).json({
        error:
          "API usage limit reached for today. Please try again tomorrow or contact admin.",
      });
    }

    // Get current usage for tracking
    const currentUsage = await ApiUsage.getCurrentUsage();

    const courses = await Course.find()
      .populate("instructor", "username")
      .limit(100);

    if (courses.length === 0) {
      return res
        .status(404)
        .json({ error: "No courses available for recommendations." });
    }

    const courseData = courses.map((course) => ({
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      content: course.content,
      instructor: course.instructor?.username || "Unknown",
    }));

    const systemPrompt = `
      You are a helpful educational advisor.
      Your job is to recommend relevant courses to a student based on their input and the available courses.
      Only recommend courses from the given list.
      Respond in strict JSON format as described.
    `;

    const userPrompt = `
      User's Request: "${trimmedPrompt}"

      Available Courses:
      ${courseData
        .map(
          (course, index) => `
      [${index + 1}] ${course.title}
        ID: ${course.id}
        Description: ${course.description}
        Instructor: ${course.instructor}
      `
        )
        .join("\n")}

      Return a JSON object like this:
      {
        "analysis": "Brief analysis of user's goal",
        "recommendations": [
          {
            "courseId": "exact_course_id",
            "title": "Course Title",
            "reason": "Why it's recommended",
            "relevance": "High/Medium/Low"
          }
        ],
        "learningPath": "Suggested order of courses or steps",
        "additionalAdvice": "Any additional tips or considerations"
      }
    `;

    const aiResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiText = aiResponse.data.choices[0].message.content;

    // Increment API usage count after successful request
    await currentUsage.incrementRequest();

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      console.warn("Invalid JSON from OpenAI. Raw response:", aiText);
      return res.json({
        analysis: "Based on your request, here are some relevant courses.",
        recommendations: courses.slice(0, 3).map((course) => ({
          courseId: course._id,
          title: course.title,
          reason: "This course is closely related to your learning goal.",
          relevance: "High",
          course,
        })),
        learningPath:
          "Start with beginner courses and gradually progress to advanced topics.",
        additionalAdvice:
          "Make sure to balance theory with practice. Set learning goals.",
        userPrompt: trimmedPrompt,
        note: "The AI response was not valid JSON. Default recommendations shown.",
      });
    }

    const enrichedRecommendations = parsed.recommendations
      .map((rec) => {
        const foundCourse = courses.find(
          (c) => c._id.toString() === rec.courseId
        );
        return foundCourse ? { ...rec, course: foundCourse } : null;
      })
      .filter(Boolean);

    res.json({
      analysis: parsed.analysis,
      recommendations: enrichedRecommendations,
      learningPath: parsed.learningPath,
      additionalAdvice: parsed.additionalAdvice,
      userPrompt: trimmedPrompt,
    });
  } catch (err) {
    console.error("Recommendation error:", {
      message: err.message,
      ...(err.response && {
        status: err.response.status,
        data: err.response.data,
      }),
    });

    const status = err.response?.status;
    if (status === 401) {
      return res.status(500).json({
        error: "Invalid or missing OpenAI API key. Please check configuration.",
      });
    } else if (status === 429) {
      return res.status(500).json({
        error: "OpenAI rate limit exceeded. Try again shortly.",
      });
    } else if (status === 400) {
      return res.status(500).json({
        error: "Bad request sent to OpenAI API. Check your prompt structure.",
      });
    } else if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error:
          "OpenAI API key not set. Set OPENAI_API_KEY environment variable.",
      });
    }

    return res.status(500).json({
      error: `Failed to generate recommendations: ${err.message}`,
    });
  }
});

// Get quick course suggestions based on keywords
router.get("/suggestions", async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    const courses = await Course.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } },
      ],
    }).populate("instructor", "username");

    res.json({
      keyword,
      suggestions: courses.map((course) => ({
        id: course._id,
        title: course.title,
        description: course.description,
        instructor: course.instructor?.username || "Unknown",
      })),
    });
  } catch (error) {
    console.error("Suggestion error:", error);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

module.exports = router;
