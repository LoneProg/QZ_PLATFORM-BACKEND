// Helper function to validate question input
const validateQuestionInput = (questionType, questionOptions, questionAnswers) => {
    if (!['multipleChoice', 'TrueFalse', 'fillInTheGap'].includes(questionType)) {
        return "Invalid question type.";
    }

    if (questionType === 'multipleChoice' && (!questionOptions || questionOptions.length < 3 || questionOptions.length > 5)) {
        return "Multiple choice questions must have between 3 and 5 options.";
    }

    if (questionType === 'TrueFalse' && (!questionOptions || questionOptions.length !== 2)) {
        return "True or False questions must have exactly 2 options.";
    }

    if (questionType === 'fillInTheGap' && (!questionAnswers || questionAnswers.length === 0)) {
        return "Fill in the gap questions must have answers.";
    }

    return null;
};

module.exports = validateQuestionInput;