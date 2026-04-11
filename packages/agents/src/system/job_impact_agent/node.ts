import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JobImpactState } from "./state";
import { CONFIG } from "../sustainabilty_agent/config"; // Assuming shared config from previous plan
import onetData from "./data/onet_mock.json";
import lmsCourses from "./data/lms_couse.json";
import { ReportOutput } from "./type";

// Initialize LLM
const model = new ChatGoogleGenerativeAI({
  apiKey: CONFIG.GEMINI_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0.2,
});

function extractJsonArray(text: string): any[] {
  if (!text) return [];
  let result;
  try {
    // 1. Try standard parse first (fast path)
    result = JSON.parse(text);
  } catch (e) {
    // 2. If that fails, look for the array brackets []
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        result = JSON.parse(match[0]);
      } catch (err) {
        console.error("Found brackets but failed to parse JSON:", err);
      }
    }
  }

  if (Array.isArray(result)) {
    return result;
  }

  console.error(
    "No JSON array found or parsed result is not an array:",
    text ? text.substring(0, 100) : "empty",
  );
  return [];
}

// Reference: job_impact_agent/agents/onet_agent.py
export async function onetNode(state: typeof JobImpactState.State) {
  // In a real app, this might be an API call. Here we look up from JSON.
  const data = onetData as Record<string, string[]>;
  // 1. Try exact match
  let tasks = data[state.jobRole];
  // 2. Try case-insensitive match
  if (!tasks) {
    const key = Object.keys(data).find(
      (k) => k.toLowerCase() === state.jobRole.toLowerCase(),
    );
    if (key) tasks = data[key];
  }
  // 3. Fallback to ensure demo continuity
  if (!tasks) {
    console.warn(`Job role '${state.jobRole}' not found. Using fallback.`);
    tasks = data["Content Marketing Manager"];
  }
  return { tasks: tasks || [] };
}

// Reference: job_impact_agent/agents/classification_agent.py
export async function classifyNode(state: typeof JobImpactState.State) {
  const prompt = `
You are a labor impact analyst.
Job Role: ${state.jobRole}
AI Capability: ${state.aiToolDescription}
For each task classify as:
- AUTOMATABLE
- AUGMENTABLE
- HUMAN_ONLY
Return ONLY a valid JSON list. Do not include markdown formatting, code blocks, or conversational text.
Structure:
[
  {
    "task": "task text",
    "impact": "category",
    "confidence": 0.5,
    "reasoning": "short explanation"
  }
]
Tasks:
${JSON.stringify(state.tasks, null, 2)}
`;
  const result = await model.invoke(prompt);

  // USE THE NEW HELPER HERE
  const classifiedTasks = extractJsonArray(result.content as string);
  return { classifiedTasks };
}

// Reference: job_impact_agent/agents/upskilling_agent.py
export async function upskillNode(state: typeof JobImpactState.State) {
  const tasks = state.classifiedTasks || [];
  const plan = tasks
    .filter((task) => task.impact === "AUTOMATABLE")
    .map((task) => ({
      gap: task.task,
      recommended_course: (lmsCourses as Record<string, string>).default,
    }));
  return { upskillingPlan: plan };
}

// Reference: job_impact_agent/agents/roi_agent.py
export async function roiNode(state: typeof JobImpactState.State) {
  const tasks = state.classifiedTasks || [];
  // Logic: 2 hours saved for every task that is NOT Human Only
  const hoursSaved = tasks.reduce((acc, task) => {
    return task.impact !== "HUMAN_ONLY" ? acc + 2 : acc;
  }, 0);
  return {
    roi: {
      hours_saved_per_week: hoursSaved,
      cost_saved_weekly: hoursSaved * state.hourlyRateAvg,
    },
  };
}

export async function reportNode(state: typeof JobImpactState.State) {
  const classifiedTasks = state.classifiedTasks || [];
  const upskillingPlan = state.upskillingPlan || [];
  const roi = state.roi || { hours_saved_per_week: 0 };
  const totalTasks = classifiedTasks.length;
  // Helper for percentages
  const pct = (count: number) =>
    totalTasks ? Math.round((count / totalTasks) * 100) : 0;
  const getLevel = (p: number) =>
    p >= 40 ? "High" : p >= 20 ? "Medium" : "Low";
  // 1. Impact Summary
  const automationCount = classifiedTasks.filter(
    (t) => t.impact === "AUTOMATABLE",
  ).length;
  const augmentationCount = classifiedTasks.filter(
    (t) => t.impact === "AUGMENTABLE",
  ).length;
  const humanOnlyCount = classifiedTasks.filter(
    (t) => t.impact === "HUMAN_ONLY",
  ).length;
  const impactSummary = {
    automation_level: `${getLevel(pct(automationCount))} (${pct(automationCount)}% of tasks)`,
    augmentation_level: `${getLevel(pct(augmentationCount))} (${pct(augmentationCount)}% of tasks)`,
    human_centric_level: `${getLevel(pct(humanOnlyCount))} (${pct(humanOnlyCount)}% of tasks)`,
  };
  // 2. Task Breakdown
  const hoursSaved = roi.hours_saved_per_week || 0;
  const automatableTasks = classifiedTasks.filter(
    (t) => t.impact === "AUTOMATABLE",
  );
  const timePerTask = automatableTasks.length
    ? Number((hoursSaved / automatableTasks.length).toFixed(1))
    : 0;
  const taskBreakdown = classifiedTasks.map((task) => {
    const item: any = {
      task: task.task,
      impact: task.impact,
      reasoning: task.reasoning,
    };
    if (task.impact === "AUTOMATABLE") {
      item.time_savings_weekly = timePerTask;
    }
    return item;
  });
  // 3. Core Human Responsibilities
  const coreHumanResponsibilities = classifiedTasks
    .filter((t) => t.impact === "HUMAN_ONLY")
    .map((t) => ({ task: t.task, reasoning: t.reasoning }));
  // 4. Enriched Upskilling Plan (Dummy Metadata)
  const enrichedUpskillingPlan = upskillingPlan.map((u) => ({
    ...u,
    course_metadata: {
      thumbnail_url: "https://img.udemy.com/course/123.jpg",
      course_url: "https://udemy.com/course/prompting",
      duration: "4h 30m",
    },
  }));
  const report: ReportOutput = {
    impact_summary: impactSummary,
    task_breakdown: taskBreakdown,
    upskilling_plan: enrichedUpskillingPlan,
    core_human_responsibilities: coreHumanResponsibilities,
  };
  return { report };
}
