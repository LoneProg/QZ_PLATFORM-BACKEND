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
const get




//@Desc Get a test by id
//@Route GET /api/tests/:id
//@Access Public



//@Desc Update a test by id
//@Route PUT /api/tests/:id
//@Access Public


//@Desc Delete a test by id
//@Route DELETE /api/tests/:id
//@Access Public