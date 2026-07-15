require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");
const Course = require("./models/Course");
const Message = require("./models/Message");
const Progress = require("./models/Progress");
const Submission = require("./models/Submission");
const Notification = require("./models/Notification");

const runSeed = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.error("Database connection failed. Seed aborted.");
    process.exit(1);
  }

  try {
    console.log("Clearing existing LMS data...");
    await Promise.all([
      Notification.deleteMany({}),
      Submission.deleteMany({}),
      Progress.deleteMany({}),
      Message.deleteMany({}),
      Course.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log("Creating users...");
    const admin = await User.create({
      name: "Arena Admin",
      email: "arena.admin.demo@gmail.com",
      password: "Admin123",
      role: "admin",
      isApproved: true,
      bio: "Primary administrator account for the seeded LMS demo.",
    });

    const teacher = await User.create({
      name: "Sarah Khan",
      email: "sarah.teacher.demo@gmail.com",
      password: "Teacher123",
      role: "teacher",
      uniqueId: "TCH0001",
      isApproved: true,
      bio: "Frontend and full-stack instructor.",
      location: "Lahore",
    });

    const teacher2 = await User.create({
      name: "Usman Ali",
      email: "usman.teacher.demo@gmail.com",
      password: "Teacher123",
      role: "teacher",
      uniqueId: "TCH0002",
      isApproved: true,
      bio: "Data structures and algorithms instructor.",
      location: "Lahore",
    });

    const student1 = await User.create({
      name: "Ali Raza",
      email: "ali.student.demo@gmail.com",
      password: "Student123",
      role: "student",
      uniqueId: "STU0001",
      cohort: "Batch A",
      isApproved: true,
      location: "Lahore",
      bio: "Interested in full-stack development.",
    });

    const student2 = await User.create({
      name: "Ayesha Noor",
      email: "ayesha.student.demo@gmail.com",
      password: "Student123",
      role: "student",
      uniqueId: "STU0002",
      cohort: "Batch A",
      isApproved: true,
      location: "Karachi",
      bio: "Focused on UI/UX and React.",
    });

    const student3 = await User.create({
      name: "Bilal Ahmed",
      email: "bilal.student.demo@gmail.com",
      password: "Student123",
      role: "student",
      uniqueId: "STU0003",
      cohort: "Batch B",
      isApproved: true,
      location: "Islamabad",
      bio: "Exploring algorithms and backend systems.",
    });

    console.log("Creating courses...");
    const course1 = await Course.create({
      title: "Modern Web Development",
      code: "MWD101",
      description:
        "Learn React, Tailwind, APIs, routing, and production-ready frontend architecture.",
      instructor: teacher._id,
      students: [student1._id, student2._id],
      materials: [
        {
          title: "Course Roadmap",
          description: "Weekly breakdown of the web development journey.",
          type: "message",
          messageContent:
            "Week 1-2 HTML/CSS, Week 3-4 JavaScript, Week 5-8 React and Tailwind, Week 9 APIs and deployment.",
        },
        {
          title: "React Fundamentals Slides",
          description: "Slides covering components, props, state, and hooks.",
          type: "link",
          fileUrl: "https://example.com/react-fundamentals-slides",
        },
      ],
      assignments: [
        {
          title: "Portfolio Landing Page",
          description:
            "Build a responsive landing page using React and Tailwind CSS.",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          totalPoints: 100,
        },
        {
          title: "REST API Integration",
          description:
            "Fetch and display data from a public API with loading and error states.",
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          totalPoints: 100,
        },
      ],
    });

    const course2 = await Course.create({
      title: "Data Structures and Algorithms",
      code: "DSA201",
      description:
        "Master arrays, linked lists, stacks, queues, trees, graphs, and problem-solving patterns.",
      instructor: teacher2._id,
      students: [student1._id, student3._id],
      materials: [
        {
          title: "Complexity Analysis Notes",
          description: "Big-O, Big-Theta, and Big-Omega explained.",
          type: "link",
          fileUrl: "https://example.com/complexity-analysis-notes",
        },
        {
          title: "Arrays and Strings Practice",
          description: "Core exercises to warm up before advanced topics.",
          type: "message",
          messageContent:
            "Complete the 10 easy array and string practice problems before the next session.",
        },
      ],
      assignments: [
        {
          title: "Array Problem Set",
          description:
            "Solve five array-based coding problems and upload your solutions.",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalPoints: 100,
        },
      ],
    });

    console.log("Creating progress documents...");
    await Progress.create([
      {
        student: student1._id,
        course: course1._id,
        completedMaterials: [course1.materials[0]._id],
      },
      {
        student: student2._id,
        course: course1._id,
        completedMaterials: [course1.materials[0]._id, course1.materials[1]._id],
      },
      {
        student: student3._id,
        course: course2._id,
        completedMaterials: [course2.materials[0]._id],
      },
    ]);

    console.log("Creating messages...");
    await Message.create([
      {
        title: "Welcome to the LMS",
        content:
          "Please explore your dashboard, course materials, assignments, and profile settings.",
        sender: admin._id,
        targetAudience: "both",
      },
      {
        title: "Student Reminder",
        content:
          "Remember to submit your assignments before the due date and track your progress regularly.",
        sender: admin._id,
        targetAudience: "students",
      },
    ]);

    console.log("Creating sample submissions...");
    const course1Assignment1 = course1.assignments[0];
    const course1Assignment2 = course1.assignments[1];
    const course2Assignment1 = course2.assignments[0];

    await Submission.create([
      {
        course: course1._id,
        assignmentId: course1Assignment1._id.toString(),
        assignmentTitle: course1Assignment1.title,
        student: student1._id,
        submissionText:
          "I built the landing page with sections for hero, features, pricing, and contact.",
        attachmentUrl: "https://example.com/submissions/ali-portfolio",
        status: "graded",
        grade: 92,
        feedback:
          "Great layout and responsive design. Improve spacing consistency in the footer.",
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        course: course1._id,
        assignmentId: course1Assignment2._id.toString(),
        assignmentTitle: course1Assignment2.title,
        student: student2._id,
        submissionText:
          "Integrated a weather API and added loading, retry, and toast feedback.",
        attachmentUrl: "https://example.com/submissions/ayesha-api",
        status: "submitted",
        submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        course: course2._id,
        assignmentId: course2Assignment1._id.toString(),
        assignmentTitle: course2Assignment1.title,
        student: student3._id,
        submissionText:
          "Solved all array challenges in JavaScript with time complexity notes.",
        attachmentUrl: "https://example.com/submissions/bilal-arrays",
        status: "graded",
        grade: 88,
        feedback:
          "Good solutions overall. Add more explanation for edge cases.",
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log("Seed complete. Test accounts:");
    console.log("Admin   -> arena.admin.demo@gmail.com / Admin123");
    console.log("Teacher -> sarah.teacher.demo@gmail.com / Teacher123");
    console.log("Teacher -> usman.teacher.demo@gmail.com / Teacher123");
    console.log("Student -> ali.student.demo@gmail.com / Student123");
    console.log("Student -> ayesha.student.demo@gmail.com / Student123");
    console.log("Student -> bilal.student.demo@gmail.com / Student123");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    const mongoose = require("mongoose");
    await mongoose.disconnect();
    process.exit();
  }
};

runSeed();
