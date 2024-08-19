const Test = require("../models/testModel");
const generatePasscode = require("../utils/generatePasscode");


const createTest = async (req, res) => {
  const { title, questions, isGroupTest, categories } = req.body;

  try {
    const newTest = new Test({
      title,
      creator: req.user.id,
      passcode: generatePasscode(),
      questions,
      isGroupTest,
      categories,
    });

    await newTest.save();
    res
      .status(201)
      .json({ message: "Test created successfully", test: newTest });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTestByPasscode = async (req, res) => {
  const { passcode } = req.params;

  try {
    const test = await Test.findOne({ passcode });
    if (!test) return res.status(404).json({ message: "Test not found" });

    res.status(200).json(test);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
module.exports ={createTest, getTestByPasscode}

