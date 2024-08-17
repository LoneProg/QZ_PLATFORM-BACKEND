const asyncHandler = require("express-async-handler");
const Test = require('../models/tests');
const express = require('express');

//@Desc Create a new test
//@Route POST /api/tests
//@Access Public
const createTest = async (req, res) => {
    try {
        const { testName, description, category, createdBy, instructions} = req.body;
        const newTest = new Test({
            testName,
            description,
            category,
            createdBy,
            instructions,
        });

        const saveTest = await newTest.save();
        res.status(201).json({message: "New Test Created" , savedTest});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

const createTestAndContinue = async (req, res) => {
    try {
        const { testName, description, category, createdBy, instructions} = req.body;
        const newTest = new Test({
            testName,
            description,
            category,
            createdBy,
            instructions,
        });

        const saveTest = await newTest.save();
        res.status(201).json({
            message: "New Created Successfully, proceed to add question" , 
            testId: savedTest_id,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
//@Desc Get all tests
//@Route GET /api/tests
//@Access Public
const getTests = async (req, res) => {
    try{
        const tests = await Test.find().populate('createdBy');
        res.status(200).json(tests)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//@Desc Get a test by id
//@Route GET /api/tests/:id
//@Access Public
const getTestById = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)
            .populate('createdBy')
            .populate('questions');
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//@Desc Update a test by id
//@Route PUT /api/tests/:id
//@Access Public
const updateTest = async (req, res) => {
    try {
        const { testName, description, category, instructions, questions } = req.body;

        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        test.testName = testName || test.testName;
        test.description = description || test.description;
        test.category = category || test.category;
        test.instructions = instructions || test.instructions;
        test.questions = questions || test.questions;
        test.updatedAt = Date.now();

        const updatedTest = await test.save();
        res.status(200).json(updatedTest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



//@Desc Delete a test by id
//@Route DELETE /api/tests/:id
//@Access Public
const deleteTest = async (req, res) => {
    try {
        const test = await Test.findByIdAndDelete(req.params.id);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createTest,
    createTestAndContinue,
    getTests,
    getTestById,
    updateTest,
    deleteTest,
};