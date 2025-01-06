import React, { useState, useEffect } from "react";

const QuestionModal = ({ onClose, onSubmit, cabinsQuestions, selectedCategory }) => {
  // Map categories to their respective types
  const typeMapping = {
    Flooring: "flooring type",
    HVAC: "AC type",
    "Partitions / Ceilings": "partition/ceiling type"
  };

  // Get the current category type
  const currentCategory = selectedCategory;
  const currentType = typeMapping[currentCategory] || "default type";

  // Define questions for different scenarios
  const heightQuestion = [
    {
      name: 'officeHeight',
      label: 'What is the height of your office?',
      type: 'number',
    }
  ]
  const flooringQuestions = [
    {
      name: "flooringStatus",
      label: "What is the flooring status?",
      options: [
        { value: "bareShell", label: "Bare Shell" },
        { value: "basicTiling", label: "Basic Tiling Done" },
      ],
    },
    // {
    //   name: "flooringArea",
    //   label: "Do you want the carpet/tile in all area or in selected area?",
    //   options: [
    //     { value: "allArea", label: "All Area" },
    //     { value: "customizeAreas", label: "Customize Areas" },
    //   ],
    // },
  ];

  const cabinRelatedQuestions = [
    {
      name: "cabinFlooring",
      label: `Do you want the same ${currentType} for all rooms or different for each room?`,
      options: [
        { value: "Same", label: "Same" },
        { value: "Customize", label: "Customize" },
      ],
    },
  ];

  const hvacQuestions = [
    {
      name: "hvacType",
      label: "Do you want full centralized AC or a combination?",
      options: [
        { value: "Centralized", label: "Centralized" },
        { value: "Combination", label: "Combination" },
      ],
    },
  ];

  const partitionQuestions = [
    {
      name: "partitionArea",
      label: "Do you want the same partition to all areas or customize?",
      options: [
        { value: "allArea", label: "All Area" },
        { value: "customizeAreas", label: "Customize Areas" },
      ],
    },
  ];

  // State variables for questions, answers, and question navigation
  const [questions, setQuestions] = useState(flooringQuestions);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Load saved answers from localStorage when the component mounts
  useEffect(() => {
    const savedAnswers = localStorage.getItem("answers");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    // Update questions based on the category or cabin-related flag
    if (cabinsQuestions) {
      setQuestions(cabinRelatedQuestions);
    } else if (selectedCategory === "Flooring") {
      setQuestions(flooringQuestions);
    } else if (selectedCategory === "HVAC") {
      setQuestions(hvacQuestions);
    } else if (selectedCategory === "Partitions / Ceilings") {
      setQuestions(partitionQuestions);
    }
  }, [cabinsQuestions, selectedCategory]); // Re-run when cabinsQuestions or category changes

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Update answers dynamically
    const updatedAnswers = {
      ...answers,
      [name]:
        type === "checkbox"
          ? { ...(answers[name] || {}), [value]: checked }
          : value,
    };
    setAnswers(updatedAnswers);

    // Save answers to localStorage
    localStorage.setItem("answers", JSON.stringify(updatedAnswers));

    // Add additional questions dynamically based on answers
    if (name === "flooringStatus" && value === "basicTiling") {
      const flooringExists = questions.some(
        (q) => q.name === "demolishTile"
      );
      if (!flooringExists) {
        const updatedQuestions = [
          ...questions,
          {
            name: "demolishTile",
            label: "Do you want to demolish the existing tile?",
            options: [
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ],
          },
        ];
        setQuestions(updatedQuestions);
      }
    }
    else if (name === "hvacType" && value === "Centralized") {
      const hvacCombExists = questions.some(
        (q) => q.name === "hvacCentralized"
      );
      if (!hvacCombExists) {
        const updatedQuestions = [
          ...questions,
          {
            name: "hvacCentralized",
            label: "Select HVAC model:",
            options: [
              { value: "Split AC", label: "Split AC" },
              { value: "Duct AC", label: "Duct AC" },
            ],
          },
        ];
        setQuestions(updatedQuestions);
      }
    } else if (name === "partitionArea" && value === "allArea") {
      const partitionTypeExists = questions.some(
        (q) => q.name === "partitionType"
      );
      if (!partitionTypeExists) {
        const updatedQuestions = [
          ...questions,
          {
            name: "partitionType",
            label: "Select partition type for all areas:",
            options: [
              { value: "Glass Partition", label: "Glass" },
              { value: "Gypsum Partition", label: "Gypsum" },
              { value: "Wood Partition", label: "Wood" },
              { value: "Concrete Partition", label: "Concrete" },
            ],
          },
        ];
        setQuestions(updatedQuestions);
      }
    }
  };

  // Handle form submission for multi-step navigation
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.name === "demolishTile" && answers[currentQuestion.name] === "yes") {
      setShowDisclaimer(true);
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      // Move to the next question
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      // Submit final answers and close modal
      console.log("Final Answers:", answers);
      onSubmit(answers);
      onClose();
    }
  };
  const handleDisclaimerClose = () => {
    setShowDisclaimer(false);

    // Ensure we do not go out of bounds
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      onSubmit(answers); // Submit answers if all questions are done
      onClose(); // Close the modal
    }
  };

  // Get the current question
  const currentQuestion = questions[currentQuestionIndex];
  const handlePreviousClick = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };
  // Render the modal
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content question-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        {!showDisclaimer ? (
          <div className="text-center">
            <h2 className="text-lg font-bold mb-4">Answer These Questions</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700">
                  {currentQuestionIndex + 1}. {currentQuestion?.label}
                </label>
                <div className="mt-2 space-y-2 flex justify-around mb-14">
                  {currentQuestion?.options.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={currentQuestion.name}
                        value={option.value}
                        onChange={handleInputChange}
                        checked={answers[currentQuestion.name] === option.value}
                        required
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-around">
                <button
                  type="button"
                  onClick={handlePreviousClick}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {currentQuestionIndex < questions.length - 1 ? "Next" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-lg font-bold mb-4">Disclaimer</h2>
            <p className="mb-4">Demolishment charges might depend upon the location.</p>
            <button
              onClick={handleDisclaimerClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Okay
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuestionModal;

