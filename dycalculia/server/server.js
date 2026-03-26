import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("AI Server is running 🚀");
});

// MAIN AI ROUTE
app.post("/summary", async (req, res) => {
  try {
    const { dot, line, arithmetic, prediction } = req.body;

    const prompt = `
You are a friendly and supportive learning assistant.

A student completed some math-related cognitive tests.

Here are their results:
Dot Accuracy: ${dot.accuracy}
Response Time: ${dot.avgTime}
Number Line Error: ${line.avgError}
Arithmetic Accuracy: ${arithmetic.accuracy}
Memory Issue: ${arithmetic.memoryFail}
Difficulty Level: ${prediction}

TASK:
Write a short, friendly message to the student.

STYLE RULES:
- Talk like a supportive friend or teacher
- Keep it simple and encouraging
- Do NOT use technical words
- Do NOT list points or numbers
- Write like a short paragraph (3–4 lines)
- Give gentle suggestions for improvement

Make the student feel motivated and comfortable.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();
    res.json({ text: data.response });

  } catch (err) {
    console.error(err);
    res.json({ text: "AI failed" });
  }
});

// 🚀 IMPORTANT PART
app.listen(5000, () => {
  console.log("✅ Server running at http://localhost:5000");
});