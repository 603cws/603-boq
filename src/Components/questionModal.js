import React, { useState, useEffect } from "react";

const QuestionModal = ({ onClose, onSubmit,cabinsQuestions, category }) => {
  // console.log("category in modal",category)
  const flooringQuestions = [
    {
      name: "flooringStatus",
      label: "What is the flooring status?",
      options: [
        { value: "bareShell", label: "Bare Shell" },
        { value: "basicTiling", label: "Basic Tiling Done" },
      ],
    },
    {
      name: "flooringArea",
      label: "Do you want the carpet/tile in all area or in selected area?",
      options: [
        { value: "allArea", label: "All Area" },
        { value: "customizeAreas", label: "Customize Areas" },
      ],
    },
  ];
  const cabinRelatedQuestions = [
    {
      name: "cabinFlooring",
      label: "Do you want same tile/carpet for all rooms or different for each room?",
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

  const [questions, setQuestions] = useState(flooringQuestions);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Load answers from localStorage when the component mounts
  useEffect(() => {
    // Load answers from localStorage when the component mounts
    const savedAnswers = localStorage.getItem("answers");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    // If cabinsQuestions is available, it will set the questions (keep this part unchanged)
    if (cabinsQuestions) {
      setQuestions(cabinRelatedQuestions);
    }
    // Set questions based on category
    if (category === "Flooring") {
      setQuestions(flooringQuestions); // Flooring related questions
    } else if (category === "HVAC") {
      setQuestions(hvacQuestions); // HVAC related questions
    }
  }, [cabinsQuestions, category]); // Ensure that the effect runs when either cabinsQuestions or category changes
  
  // Handle input changes and update answers state
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updatedAnswers = {
      ...answers,
      [name]: type === "checkbox"
        ? { ...(answers[name] || {}), [value]: checked }
        : value,
    };

    setAnswers(updatedAnswers);

    localStorage.setItem("answers", JSON.stringify(updatedAnswers));

    if (name === "flooringArea" && value === "allArea" ) {
      const flooringTypeExists = questions.some(
        (q) => q.name === "flooringType"
      );
      if (!flooringTypeExists) {
        const updatedQuestions = [
          ...questions,
          {
            name: "flooringType",
            label: "Select flooring type for all areas:",
            options: [
              { value: "Carpet", label: "Carpet" },
              { value: "Tile", label: "Tile" },
              { value: "Vinyl", label: "Vinyl" },
            ],
          },
        ];
        setQuestions(updatedQuestions);
      }
    }
      else if ( name === "hvacType" && value === "Centralized"){
        const hvacCombExists = questions.some(
          (q) => q.name === "hvacCentralized"
        );
      if (!hvacCombExists){
        const updatedQuestions = [
          ...questions,
          {
            name: "hvacCentralized",
            label: "Select HVAC model:",
            options: [
              {value : "Fully covered" , label : "Fully covered split AC"},
              {value : "fullOfficeVRV" , label : "Full office VRV"},
            ]
          }
        ]
        setQuestions(updatedQuestions);
      }
    }
    
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      console.log("Final Answers:", answers);
      onSubmit(answers);
      onClose();
    }
  };

  // Get the current question
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content question-modal"
        onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
      >
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">Answer These Questions</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700">
              {currentQuestionIndex + 1}. {currentQuestion.label}
            </label>
            <div className="mt-2 space-y-2">
              {currentQuestion.options.map((option) => (
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

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;
