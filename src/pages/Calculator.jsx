import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const allQuestions = [
  {
    id: 'is_working',
    question: "Are you currently working?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes, I am working' },
      { value: 'no', label: 'No, I am not working' }
    ],
    description: "This helps us calculate your 'better-off in work' estimate."
  },
  {
    id: 'num_children',
    question: "How many children do you have living with you?",
    type: 'number',
    placeholder: "Number of children",
    description: "This affects your Universal Credit elements and childcare caps."
  },
  {
    id: 'full_time_residence',
    question: "Do your children live with you full-time?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes, full-time' },
      { value: 'shared', label: 'Shared custody' }
    ],
    description: "UC child elements are typically assigned to the main carer."
  },
  {
    id: 'born_before_2017',
    question: "Was your first child born before 6 April 2017?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    description: "Families with a child born before this date may receive a higher child element in UC."
  },
  // Child 1
  {
    id: 'child_1_age',
    question: "How old is your first child?",
    type: 'number',
    placeholder: "Age in years",
    description: "Benefits vary depending on whether your child is under 16, or 16+."
  },
  {
    id: 'child_1_care',
    question: "Does your first child need significantly more help than others their age?",
    type: 'choice',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
    description: "This helps determine eligibility for DLA or PIP care components."
  },
  {
    id: 'child_1_mobility',
    question: "Does your first child have difficulty walking or getting around?",
    type: 'choice',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
    description: "This checks for the DLA/PIP mobility component."
  },
  {
    id: 'child_1_diagnosis',
    question: "Does your first child have a formal diagnosis from a medical professional?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'in_process', label: 'In process' }
    ],
    description: "A formal diagnosis or being in the process can support benefit applications."
  },
  // Child 2
  {
    id: 'child_2_age',
    question: "How old is your second child?",
    type: 'number',
    placeholder: "Age in years"
  },
  {
    id: 'child_2_care',
    question: "Does your second child need significantly more help than others their age?",
    type: 'choice',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
  },
  {
    id: 'child_2_mobility',
    question: "Does your second child have difficulty walking or getting around?",
    type: 'choice',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
  },
  {
    id: 'child_2_diagnosis',
    question: "Does your second child have a formal diagnosis from a medical professional?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'in_process', label: 'In process' }
    ]
  },
  // Child 3
  {
    id: 'child_3_age',
    question: "How old is your third child?",
    type: 'number',
    placeholder: "Age in years"
  },
  {
    id: 'child_3_care',
    question: "Does your third child need significantly more help than others their age?",
    type: 'choice',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
  },
  {
    id: 'child_3_mobility',
    question: "Does your third child have difficulty walking or getting around?",
    type: 'choice',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
  },
  {
    id: 'child_3_diagnosis',
    question: "Does your third child have a formal diagnosis from a medical professional?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'in_process', label: 'In process' }
    ]
  },
  {
    id: 'other_adults',
    question: "Are there any other adults (18+) living in your household?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    description: "Other adults in the home can result in deductions from your housing support."
  },
  {
    id: 'num_other_adults',
    question: "How many other adults live with you?",
    type: 'number',
    placeholder: "Number of adults",
    description: "Exclude your partner if you are a couple."
  },
  {
    id: 'status',
    question: "What is your relationship status?",
    type: 'choice',
    options: [
      { value: 'single', label: 'Single' },
      { value: 'couple', label: 'Couple' }
    ],
    description: "This helps calculate your Universal Credit standard allowance."
  },
  {
    id: 'housing_costs',
    question: "Do you receive help with housing costs (e.g. through Universal Credit)?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    description: "This affects your UC work allowance and non-dependant deductions."
  },
  {
    id: 'claimant_condition',
    question: "Do you have any health conditions or disabilities yourself?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    description: "You may be entitled to extra support for yourself, such as PIP or a UC health element."
  },
  {
    id: 'claimant_affect_work',
    question: "Does your health condition affect your ability to work?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'partially', label: 'Partially' },
      { value: 'no', label: 'No' }
    ]
  },
  {
    id: 'claimant_work_capability',
    question: "Have you already been assessed by the DWP as having a limited capability for work?",
    type: 'choice',
    options: [
      { value: 'lcwra', label: 'Yes, LCWRA (Highest rate)' },
      { value: 'lcw', label: 'Yes, LCW' },
      { value: 'no', label: 'No / Not yet assessed' }
    ],
    description: "LCWRA adds an extra element to your UC and removes the requirement to look for work."
  },
  {
    id: 'claimant_pip',
    question: "Do you already receive Personal Independence Payment (PIP) or Adult Disability Payment?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]
  },
  {
    id: 'home_adaptations',
    question: "Does your home have an extra bathroom, kitchen, or significant space for indoor wheelchair use to meet a disability need?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    description: "This may qualify you for a Council Tax band reduction."
  },
  {
    id: 'water_meter',
    question: "Do you have a water meter?",
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    description: "Required for the WaterSure bill capping scheme."
  },
  {
    id: 'hours_care',
    question: "How many hours a week do you spend caring for your children?",
    type: 'choice',
    options: [
      { value: 'less_35', label: 'Less than 35 hours' },
      { value: 'more_35', label: '35 hours or more' }
    ],
    description: "Caring for 35+ hours may qualify you for Carer's Allowance."
  },
  {
    id: 'weekly_earnings',
    question: "What are your weekly earnings after tax and expenses?",
    type: 'number',
    placeholder: "£ per week",
    description: "To get Carer's Allowance, you must earn £204 or less a week."
  },
  {
    id: 'household_income',
    question: "What is your total annual household income from work?",
    type: 'number',
    placeholder: "£ per year",
    description: "This is your combined salary/wages before tax. Some grants have an income limit (usually around £35,000). Benefit income is not counted for this."
  },
  {
    id: 'weekly_childcare_costs',
    question: "How much do you spend on childcare per week?",
    type: 'number',
    placeholder: "£ per week",
    description: "Universal Credit can help cover up to 85% of these costs."
  },
  {
    id: 'commuting_method',
    question: "How do you usually get to work?",
    type: 'choice',
    options: [
      { value: 'driving', label: 'Driving' },
      { value: 'other', label: 'Public Transport / Other' }
    ],
    description: "This helps us calculate your commuting costs."
  },
  {
    id: 'weekly_miles',
    question: "How many miles do you drive to work per week?",
    type: 'number',
    placeholder: "Miles per week",
    description: "We use the HMRC rate of 45p per mile."
  },
  {
    id: 'weekly_transport_costs',
    question: "How much do you spend on public transport/other commuting per week?",
    type: 'number',
    placeholder: "£ per week",
    description: "Total weekly spend on travel to and from work."
  }
];

const Calculator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const getVisibleQuestions = () => {
    return allQuestions.filter(q => {
      if (q.id === 'num_other_adults' && answers.other_adults !== 'yes') return false;
      if (q.id === 'claimant_affect_work' && answers.claimant_condition !== 'yes') return false;
      if (q.id === 'claimant_work_capability' && answers.claimant_condition !== 'yes') return false;
      if (q.id === 'claimant_pip' && answers.claimant_condition !== 'yes') return false;
      if (q.id === 'weekly_earnings' && answers.is_working !== 'yes') return false;
      if (q.id === 'weekly_childcare_costs' && answers.is_working !== 'yes') return false;
      if (q.id === 'commuting_method' && answers.is_working !== 'yes') return false;
      if (q.id === 'weekly_miles' && (answers.is_working !== 'yes' || answers.commuting_method !== 'driving')) return false;
      if (q.id === 'weekly_transport_costs' && (answers.is_working !== 'yes' || answers.commuting_method !== 'other')) return false;
      
      if (q.id.startsWith('child_')) {
        const match = q.id.match(/child_(\d+)_/);
        const childIndex = parseInt(match[1]);
        if (childIndex > parseInt(answers.num_children || 0)) return false;
      }
      return true;
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentStep];

  const handleNext = () => {
    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/results', { state: { answers } });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const progress = ((currentStep + 1) / visibleQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center text-sm font-medium text-slate-500">
          <span>Question {currentStep + 1} of {visibleQuestions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {currentQuestion.question}
            </h2>
            {currentQuestion.description && (
              <p className="text-slate-500">
                {currentQuestion.description}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {currentQuestion.type === 'number' && (
              <input
                type="number"
                className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:outline-none text-lg transition-colors"
                placeholder={currentQuestion.placeholder}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
              />
            )}

            {currentQuestion.type === 'choice' && (
              <div className="grid gap-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleAnswer(option.value);
                      // Auto-advance for choices if not at the end
                      // (Optional, but makes it faster)
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      answers[currentQuestion.id] === option.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-50'
                        : 'border-slate-100 hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    {answers[currentQuestion.id] === option.value && (
                      <CheckCircle2 className="w-6 h-6" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-700 px-4 py-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id] && currentQuestion.type !== 'number'} // Allow empty for numbers? No, usually better to require.
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Step
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Calculator;
