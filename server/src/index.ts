import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

/* ROUTES IMPORTS */
import dashboardRoutes from "./routes/dashboardRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import studentFeeRoutes from "./routes/studentFeeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/hello", (req, res) => {
    res.send("Hello World!");
});

/* ROUTES */
app.use("/dashboard", dashboardRoutes); // http://localhost:8000/dashboard?schoolId=1
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/parents", parentRoutes);
app.use("/grades", gradeRoutes);
app.use("/classes", classRoutes);
app.use("/events", eventRoutes);
app.use("/announcements", announcementRoutes);
app.use("/lessons", lessonRoutes);
app.use("/subjects", subjectRoutes);
app.use("/exams", examRoutes);
app.use("/results", resultRoutes);
app.use("/attendances", attendanceRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/fees", feeRoutes);
app.use("/student-fees", studentFeeRoutes);
app.use("/payments", paymentRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});