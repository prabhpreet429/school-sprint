import { PrismaClient, UserSex, Day } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data (delete children first, then parents)
  // Order: Delete tables with foreign keys first, then parent tables
  console.log("🗑️  Clearing existing data...");
  await prisma.attendance.deleteMany().catch(() => {});
  await prisma.result.deleteMany().catch(() => {});
  await prisma.exam.deleteMany().catch(() => {});
  await prisma.assignment.deleteMany().catch(() => {});
  await prisma.lesson.deleteMany().catch(() => {});
  await prisma.event.deleteMany().catch(() => {});
  await prisma.announcement.deleteMany().catch(() => {});
  await prisma.student.deleteMany().catch(() => {});
  await prisma.class.deleteMany().catch(() => {});
  await prisma.grade.deleteMany().catch(() => {});
  await prisma.subject.deleteMany().catch(() => {});
  await prisma.teacher.deleteMany().catch(() => {});
  await prisma.parent.deleteMany().catch(() => {});
  await prisma.admin.deleteMany().catch(() => {});
  // Delete School last (it's the parent of all other tables)
  await prisma.school.deleteMany().catch(() => {});
  console.log("✅ Cleared existing data\n");

  // ==========================================
  // SEED ORDER: Create parent tables first
  // ==========================================
  
  // 1. Seed School FIRST (no dependencies - all other tables depend on it)
  console.log("🏫 Seeding School (must be created first)...");
  const school = await prisma.school.create({
    data: {
      name: "Springfield Elementary School",
      address: "123 Education Street, Springfield",
      phone: "555-1000",
      email: "info@springfield-elem.edu",
      country: "United States",
      timezone: "America/New_York",
    },
  });
  console.log(`✅ Created school: ${school.name} (ID: ${school.id})\n`);

  // 2. Seed Admins (needs schoolId) - RIGHT AFTER School is created
  console.log("👤 Seeding Admins...");
  const adminsData = [
    { username: "admin_main" },
    { username: "admin_secondary" },
  ];
  const createdAdmins = [];
  for (const admin of adminsData) {
    const created = await prisma.admin.create({
      data: {
        ...admin,
        schoolId: school.id,
      },
    });
    createdAdmins.push(created);
  }
  console.log(`✅ Created ${createdAdmins.length} admins`);

  // 3. Seed Grades (needs schoolId)
  console.log("📚 Seeding Grades...");
  const grades = [1, 2, 3, 4, 5, 6];
  const createdGrades = [];
  for (const level of grades) {
    const grade = await prisma.grade.create({
      data: {
        level,
        schoolId: school.id,
      },
    });
    createdGrades.push(grade);
  }
  console.log(`✅ Created ${createdGrades.length} grades`);

  // 4. Seed Subjects (needs schoolId)
  console.log("📖 Seeding Subjects...");
  const subjects = [
    "Mathematics",
    "English",
    "Science",
    "History",
    "Geography",
    "Art",
    "Physical Education",
  ];
  const createdSubjects = [];
  for (const name of subjects) {
    const subject = await prisma.subject.create({
      data: {
        name,
        schoolId: school.id,
      },
    });
    createdSubjects.push(subject);
  }
  console.log(`✅ Created ${createdSubjects.length} subjects`);

  // 5. Seed Parents (needs schoolId)
  console.log("👨‍👩‍👧 Seeding Parents...");
  const parentsData = [
    {
      username: "parent_john",
      name: "John",
      surname: "Smith",
      email: "john.smith@email.com",
      phone: "555-0101",
      address: "123 Main St, City",
    },
    {
      username: "parent_mary",
      name: "Mary",
      surname: "Johnson",
      email: "mary.johnson@email.com",
      phone: "555-0102",
      address: "456 Oak Ave, City",
    },
    {
      username: "parent_robert",
      name: "Robert",
      surname: "Williams",
      email: "robert.williams@email.com",
      phone: "555-0103",
      address: "789 Pine Rd, City",
    },
    {
      username: "parent_lisa",
      name: "Lisa",
      surname: "Brown",
      email: "lisa.brown@email.com",
      phone: "555-0104",
      address: "321 Elm St, City",
    },
    {
      username: "parent_david",
      name: "David",
      surname: "Jones",
      email: "david.jones@email.com",
      phone: "555-0105",
      address: "654 Maple Dr, City",
    },
  ];
  const createdParents = [];
  for (const parent of parentsData) {
    const created = await prisma.parent.create({
      data: {
        ...parent,
        schoolId: school.id,
      },
    });
    createdParents.push(created);
  }
  console.log(`✅ Created ${createdParents.length} parents`);

  // 6. Seed Teachers (needs schoolId) - AFTER School is created
  console.log("👨‍🏫 Seeding Teachers...");
  const teachersData = [
    {
      username: "teacher_alice",
      name: "Alice",
      surname: "Anderson",
      email: "alice.anderson@school.com",
      phone: "555-0201",
      address: "100 Teacher Lane, City",
      bloodType: "A+",
      sex: UserSex.FEMALE,
      birthday: new Date("1985-05-15"),
    },
    {
      username: "teacher_bob",
      name: "Bob",
      surname: "Martinez",
      email: "bob.martinez@school.com",
      phone: "555-0202",
      address: "200 Educator Blvd, City",
      bloodType: "O+",
      sex: UserSex.MALE,
      birthday: new Date("1980-08-20"),
    },
    {
      username: "teacher_carol",
      name: "Carol",
      surname: "Taylor",
      email: "carol.taylor@school.com",
      phone: "555-0203",
      address: "300 Instructor St, City",
      bloodType: "B+",
      sex: UserSex.FEMALE,
      birthday: new Date("1988-03-10"),
    },
    {
      username: "teacher_daniel",
      name: "Daniel",
      surname: "Wilson",
      email: "daniel.wilson@school.com",
      phone: "555-0204",
      address: "400 Professor Ave, City",
      bloodType: "AB+",
      sex: UserSex.MALE,
      birthday: new Date("1982-11-25"),
    },
  ];
  const createdTeachers = [];
  for (const teacher of teachersData) {
    const created = await prisma.teacher.create({
      data: {
        ...teacher,
        schoolId: school.id,
      },
    });
    createdTeachers.push(created);
  }
  console.log(`✅ Created ${createdTeachers.length} teachers`);

  // Connect Teachers to Subjects (many-to-many)
  console.log("🔗 Connecting Teachers to Subjects...");
  if (createdTeachers.length >= 4 && createdSubjects.length >= 7) {
    // Teacher 1 teaches Math, English, Science
    await prisma.teacher.update({
      where: { id: createdTeachers[0]!.id },
      data: {
        subjects: {
          connect: createdSubjects.slice(0, 3).map((s) => ({ id: s.id })),
        },
      },
    });

    // Teacher 2 teaches History, Geography
    await prisma.teacher.update({
      where: { id: createdTeachers[1]!.id },
      data: {
        subjects: {
          connect: createdSubjects.slice(3, 5).map((s) => ({ id: s.id })),
        },
      },
    });

    // Teacher 3 teaches Art, PE
    await prisma.teacher.update({
      where: { id: createdTeachers[2]!.id },
      data: {
        subjects: {
          connect: createdSubjects.slice(5, 7).map((s) => ({ id: s.id })),
        },
      },
    });

    // Teacher 4 teaches Math, Science
    await prisma.teacher.update({
      where: { id: createdTeachers[3]!.id },
      data: {
        subjects: {
          connect: [createdSubjects[0]!, createdSubjects[2]!].map((s) => ({
            id: s.id,
          })),
        },
      },
    });
  }
  console.log("✅ Connected teachers to subjects");

  // Seed Classes (needs gradeId, schoolId, optional supervisorId)
  console.log("🏫 Seeding Classes...");
  const classesData = [
    {
      name: "Grade 1-A",
      capacity: 25,
      gradeId: createdGrades[0]!.id,
      supervisorId: createdTeachers[0]!.id,
    },
    {
      name: "Grade 1-B",
      capacity: 24,
      gradeId: createdGrades[0]!.id,
      supervisorId: createdTeachers[1]!.id,
    },
    {
      name: "Grade 2-A",
      capacity: 26,
      gradeId: createdGrades[1]!.id,
      supervisorId: createdTeachers[2]!.id,
    },
    {
      name: "Grade 3-A",
      capacity: 25,
      gradeId: createdGrades[2]!.id,
      supervisorId: createdTeachers[3]!.id,
    },
  ];
  const createdClasses = [];
  for (const classData of classesData) {
    const created = await prisma.class.create({
      data: {
        ...classData,
        schoolId: school.id,
      },
    });
    createdClasses.push(created);
  }
  console.log(`✅ Created ${createdClasses.length} classes`);

  // Seed Students (needs parentId, classId, gradeId, schoolId)
  console.log("👨‍🎓 Seeding Students...");
  const studentsData = [
    {
      username: "student_emma",
      name: "Emma",
      surname: "Smith",
      email: "emma.smith@student.com",
      phone: "555-0301",
      address: "123 Main St, City",
      bloodType: "A+",
      sex: UserSex.FEMALE,
      parentId: createdParents[0]!.id,
      classId: createdClasses[0]!.id,
      gradeId: createdGrades[0]!.id,
      birthday: new Date("2017-01-15"),
    },
    {
      username: "student_james",
      name: "James",
      surname: "Johnson",
      email: "james.johnson@student.com",
      phone: "555-0302",
      address: "456 Oak Ave, City",
      bloodType: "O+",
      sex: UserSex.MALE,
      parentId: createdParents[1]!.id,
      classId: createdClasses[0]!.id,
      gradeId: createdGrades[0]!.id,
      birthday: new Date("2017-03-20"),
    },
    {
      username: "student_sophia",
      name: "Sophia",
      surname: "Williams",
      email: "sophia.williams@student.com",
      phone: "555-0303",
      address: "789 Pine Rd, City",
      bloodType: "B+",
      sex: UserSex.FEMALE,
      parentId: createdParents[2]!.id,
      classId: createdClasses[1]!.id,
      gradeId: createdGrades[0]!.id,
      birthday: new Date("2017-05-10"),
    },
    {
      username: "student_michael",
      name: "Michael",
      surname: "Brown",
      email: "michael.brown@student.com",
      phone: "555-0304",
      address: "321 Elm St, City",
      bloodType: "A-",
      sex: UserSex.MALE,
      parentId: createdParents[3]!.id,
      classId: createdClasses[2]!.id,
      gradeId: createdGrades[1]!.id,
      birthday: new Date("2016-07-25"),
    },
    {
      username: "student_olivia",
      name: "Olivia",
      surname: "Jones",
      email: "olivia.jones@student.com",
      phone: "555-0305",
      address: "654 Maple Dr, City",
      bloodType: "O-",
      sex: UserSex.FEMALE,
      parentId: createdParents[4]!.id,
      classId: createdClasses[3]!.id,
      gradeId: createdGrades[2]!.id,
      birthday: new Date("2015-09-12"),
    },
  ];
  const createdStudents = [];
  for (const student of studentsData) {
    const created = await prisma.student.create({
      data: {
        ...student,
        schoolId: school.id,
      },
    });
    createdStudents.push(created);
  }
  console.log(`✅ Created ${createdStudents.length} students`);

  // Seed Lessons (needs subjectId, classId, teacherId, schoolId)
  console.log("📝 Seeding Lessons...");
  const lessonsData = [
    {
      name: "Math Basics",
      day: Day.MONDAY,
      startTime: new Date("2024-01-15T09:00:00Z"),
      endTime: new Date("2024-01-15T10:00:00Z"),
      subjectId: createdSubjects[0]!.id,
      classId: createdClasses[0]!.id,
      teacherId: createdTeachers[0]!.id,
    },
    {
      name: "English Reading",
      day: Day.MONDAY,
      startTime: new Date("2024-01-15T10:30:00Z"),
      endTime: new Date("2024-01-15T11:30:00Z"),
      subjectId: createdSubjects[1]!.id,
      classId: createdClasses[0]!.id,
      teacherId: createdTeachers[0]!.id,
    },
    {
      name: "Science Lab",
      day: Day.TUESDAY,
      startTime: new Date("2024-01-16T09:00:00Z"),
      endTime: new Date("2024-01-16T10:30:00Z"),
      subjectId: createdSubjects[2]!.id,
      classId: createdClasses[1]!.id,
      teacherId: createdTeachers[0]!.id,
    },
    {
      name: "History Class",
      day: Day.WEDNESDAY,
      startTime: new Date("2024-01-17T09:00:00Z"),
      endTime: new Date("2024-01-17T10:00:00Z"),
      subjectId: createdSubjects[3]!.id,
      classId: createdClasses[2]!.id,
      teacherId: createdTeachers[1]!.id,
    },
    {
      name: "Art Workshop",
      day: Day.THURSDAY,
      startTime: new Date("2024-01-18T14:00:00Z"),
      endTime: new Date("2024-01-18T15:30:00Z"),
      subjectId: createdSubjects[5]!.id,
      classId: createdClasses[3]!.id,
      teacherId: createdTeachers[2]!.id,
    },
  ];
  const createdLessons = [];
  for (const lesson of lessonsData) {
    const created = await prisma.lesson.create({
      data: {
        ...lesson,
        schoolId: school.id,
      },
    });
    createdLessons.push(created);
  }
  console.log(`✅ Created ${createdLessons.length} lessons`);

  // Seed Exams (needs lessonId, schoolId)
  console.log("📋 Seeding Exams...");
  const examsData = [
    {
      title: "Math Midterm",
      startTime: new Date("2024-02-15T09:00:00Z"),
      endTime: new Date("2024-02-15T11:00:00Z"),
      lessonId: createdLessons[0]!.id,
    },
    {
      title: "English Final",
      startTime: new Date("2024-03-20T09:00:00Z"),
      endTime: new Date("2024-03-20T11:00:00Z"),
      lessonId: createdLessons[1]!.id,
    },
    {
      title: "Science Test",
      startTime: new Date("2024-02-25T09:00:00Z"),
      endTime: new Date("2024-02-25T10:30:00Z"),
      lessonId: createdLessons[2]!.id,
    },
  ];
  const createdExams = [];
  for (const exam of examsData) {
    const created = await prisma.exam.create({
      data: {
        ...exam,
        schoolId: school.id,
      },
    });
    createdExams.push(created);
  }
  console.log(`✅ Created ${createdExams.length} exams`);

  // Seed Assignments (needs lessonId, schoolId)
  console.log("📄 Seeding Assignments...");
  const assignmentsData = [
    {
      title: "Math Homework - Chapter 1",
      startDate: new Date("2024-01-15T00:00:00Z"),
      dueDate: new Date("2024-01-22T23:59:59Z"),
      lessonId: createdLessons[0]!.id,
    },
    {
      title: "English Essay",
      startDate: new Date("2024-01-20T00:00:00Z"),
      dueDate: new Date("2024-02-05T23:59:59Z"),
      lessonId: createdLessons[1]!.id,
    },
    {
      title: "Science Project",
      startDate: new Date("2024-02-01T00:00:00Z"),
      dueDate: new Date("2024-02-28T23:59:59Z"),
      lessonId: createdLessons[2]!.id,
    },
  ];
  const createdAssignments = [];
  for (const assignment of assignmentsData) {
    const created = await prisma.assignment.create({
      data: {
        ...assignment,
        schoolId: school.id,
      },
    });
    createdAssignments.push(created);
  }
  console.log(`✅ Created ${createdAssignments.length} assignments`);

  // Seed Results (needs studentId, examId or assignmentId, schoolId)
  console.log("📊 Seeding Results...");
  const resultsData = [
    {
      score: 85,
      studentId: createdStudents[0]!.id,
      examId: createdExams[0]!.id,
    },
    {
      score: 92,
      studentId: createdStudents[1]!.id,
      examId: createdExams[0]!.id,
    },
    {
      score: 78,
      studentId: createdStudents[0]!.id,
      examId: createdExams[1]!.id,
    },
    {
      score: 88,
      studentId: createdStudents[2]!.id,
      assignmentId: createdAssignments[0]!.id,
    },
    {
      score: 95,
      studentId: createdStudents[3]!.id,
      assignmentId: createdAssignments[1]!.id,
    },
  ];
  for (const result of resultsData) {
    await prisma.result.create({
      data: {
        ...result,
        schoolId: school.id,
      },
    });
  }
  console.log(`✅ Created ${resultsData.length} results`);

  // Seed Attendance (needs studentId, lessonId, schoolId)
  console.log("✅ Seeding Attendance...");
  const now = new Date();
  const attendanceData = [
    {
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      present: true,
      studentId: createdStudents[0]!.id,
      lessonId: createdLessons[0]!.id,
    },
    {
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      present: true,
      studentId: createdStudents[1]!.id,
      lessonId: createdLessons[0]!.id,
    },
    {
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      present: false,
      studentId: createdStudents[0]!.id,
      lessonId: createdLessons[1]!.id,
    },
    {
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      present: true,
      studentId: createdStudents[2]!.id,
      lessonId: createdLessons[2]!.id,
    },
    {
      date: new Date(now.getTime()), // Today
      present: true,
      studentId: createdStudents[3]!.id,
      lessonId: createdLessons[3]!.id,
    },
    {
      date: new Date(now.getTime()), // Today
      present: true,
      studentId: createdStudents[0]!.id,
      lessonId: createdLessons[0]!.id,
    },
    {
      date: new Date(now.getTime()), // Today
      present: false,
      studentId: createdStudents[1]!.id,
      lessonId: createdLessons[1]!.id,
    },
  ];
  for (const att of attendanceData) {
    await prisma.attendance.create({
      data: {
        ...att,
        schoolId: school.id,
      },
    });
  }
  console.log(`✅ Created ${attendanceData.length} attendance records`);

  // Seed Events (needs classId, schoolId)
  console.log("📅 Seeding Events...");
  const eventsData = [
    {
      title: "School Field Trip",
      description: "Visit to the Science Museum",
      startTime: new Date("2024-02-10T08:00:00Z"),
      endTime: new Date("2024-02-10T15:00:00Z"),
      classId: createdClasses[0]!.id,
    },
    {
      title: "Parent-Teacher Meeting",
      description: "Quarterly review meeting",
      startTime: new Date("2024-03-05T14:00:00Z"),
      endTime: new Date("2024-03-05T16:00:00Z"),
      classId: createdClasses[1]!.id,
    },
    {
      title: "Sports Day",
      description: "Annual school sports competition",
      startTime: new Date("2024-04-15T09:00:00Z"),
      endTime: new Date("2024-04-15T17:00:00Z"),
      classId: null,
    },
  ];
  for (const event of eventsData) {
    await prisma.event.create({
      data: {
        ...event,
        schoolId: school.id,
      },
    });
  }
  console.log(`✅ Created ${eventsData.length} events`);

  // Seed Announcements (needs classId, schoolId)
  console.log("📢 Seeding Announcements...");
  const announcementsData = [
    {
      title: "Welcome Back to School",
      description: "Welcome all students back for the new academic year!",
      date: new Date("2024-01-08T00:00:00Z"),
      classId: createdClasses[0]!.id,
    },
    {
      title: "Homework Reminder",
      description: "Please remember to submit your assignments on time.",
      date: new Date("2024-01-20T00:00:00Z"),
      classId: createdClasses[1]!.id,
    },
    {
      title: "School Holiday Notice",
      description: "School will be closed on February 14th for a public holiday.",
      date: new Date("2024-02-01T00:00:00Z"),
      classId: null,
    },
  ];
  for (const announcement of announcementsData) {
    await prisma.announcement.create({
      data: {
        ...announcement,
        schoolId: school.id,
      },
    });
  }
  console.log(`✅ Created ${announcementsData.length} announcements`);

  console.log("\n🎉 Database seeding completed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   School: 1`);
  console.log(`   Grades: ${createdGrades.length}`);
  console.log(`   Subjects: ${createdSubjects.length}`);
  console.log(`   Parents: ${createdParents.length}`);
  console.log(`   Admins: ${createdAdmins.length}`);
  console.log(`   Teachers: ${createdTeachers.length}`);
  console.log(`   Classes: ${createdClasses.length}`);
  console.log(`   Students: ${createdStudents.length}`);
  console.log(`   Lessons: ${createdLessons.length}`);
  console.log(`   Exams: ${createdExams.length}`);
  console.log(`   Assignments: ${createdAssignments.length}`);
  console.log(`   Results: ${resultsData.length}`);
  console.log(`   Attendance: ${attendanceData.length}`);
  console.log(`   Events: ${eventsData.length}`);
  console.log(`   Announcements: ${announcementsData.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    if (typeof process !== "undefined") {
      process.exit(1);
    }
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
