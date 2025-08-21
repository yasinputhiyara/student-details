const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerStudent = async (req, res) => {
  try {
    const { name, age, class: className, admissionNumber, email, password } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      name,
      age,
      class: className,
      admissionNumber,
      email,
      password: hashed,
      profilePic: req.file ? req.file.filename : "",
    });

    await newStudent.save();
    const token = jwt.sign(
      { id: newStudent._id, email: newStudent.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: "Student registered successfully",
      token, // ✅ send the token
      user: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
        admissionNumber: newStudent.admissionNumber,
        profilePic: newStudent.profilePic,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        profilePic: student.profilePic,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentProfile = async (req, res) => {
    try {
      res.json(req.student);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  const updateStudentProfile = async (req, res) => {
    try {
      const student = await Student.findById(req.student._id);
      if (!student) return res.status(404).json({ message: "Student not found" });
  
      student.name = req.body.name || student.name;
      student.age = req.body.age || student.age;
      student.class = req.body.class || student.class;
      student.email = req.body.email || student.email;
      student.admissionNumber = req.body.admissionNumber || student.admissionNumber;
  
      if (req.file) {
        student.profilePic= req.file.filename;
      }
  
      if (req.body.password) {
        student.password = await bcrypt.hash(req.body.password, 10);
      }
  
      const updated = await student.save();
  
      res.json({
        message: "Profile updated",
        student: {
          id: updated._id,
          name: updated.name,
          email: updated.email,
          profilePic: updated.profilePic,
        },
      });
    } catch (error) {
      console.log('----------------')
      console.error("Update Error:", error.message); 
      res.status(500).json({ message: error.message });
    }
  };
  
  // Export all
  module.exports = {
    registerStudent,
    loginStudent,
    getStudentProfile,
    updateStudentProfile,
  };
