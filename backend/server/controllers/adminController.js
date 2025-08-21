const Admin = require("../models/admin");
const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    // const isMatch = await bcrypt.compare(password, admin.password);
    // if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (password !== 'admin123') {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
            { admissionNumber: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const students = await Student.find(keyword).select("-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single student
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student by admin
const updateStudentByAdmin = async (req, res) => {
  try {

    console.log("UPDATE REQ BODY:", req.body);
console.log("UPDATE FILE:", req.file);

    const { name, age,  email, admissionNumber ,password } = req.body;
    const className = req.body.class;

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.name = name || student.name;
    student.age = age || student.age;
    student.class = className || student.class;
    student.email = email || student.email;
    student.admissionNumber = admissionNumber || student.admissionNumber;

    
    if (password) {
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      student.profilePic = req.file.filename;
    }

    const updated = await student.save();

    res.json({
      message: "Student updated",
      student: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        class: updated.class,
        age: updated.age,
        admissionNumber: updated.admissionNumber,
      },
    });
  } catch (error) {
    console.error("UPDATE ERROR STACK:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create student by admin
const createStudentByAdmin = async (req, res) => {
  try {

    console.log("Body:", req.body);
    console.log("File:", req.file); 

    const { name, age, class: className, email, admissionNumber, password } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: "Student already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePic = req.file ? req.file.filename : null;

    const student = new Student({
      name,
      age,
      class: className,
      email,
      admissionNumber,
      password: hashedPassword,
      profilePic,
    });

    await student.save();

    res.status(201).json({ message: "Student created successfully", student });
  } catch (error) {
    // res.status(500).json({ message: error.message });
    console.error("Error creating student:", error);  // Log full error stack
    res.status(500).json({ message: "Failed to create student", error: error.message })
  }
};


module.exports = {
  loginAdmin,
  getAllStudents,
  getStudentById,
  deleteStudent,
  updateStudentByAdmin,
  createStudentByAdmin,
};
