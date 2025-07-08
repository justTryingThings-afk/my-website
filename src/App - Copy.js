import React, { useState, useRef, useEffect, useCallback } from 'react';

// Main App component for the website
const App = () => {
  // State to manage which page is currently displayed
  // 'initial', 'initialOptions', 'wiseChoice', 'thirdPage', 'fulfillmentDate', 'dealEvaluation'
  const [currentPage, setCurrentPage] = useState('initial');
  // State for the 'No' button's position (x, y coordinates)
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  // Ref to the 'No' button element for measuring its size
  const noButtonRef = useRef(null);
  // Ref to the main container to get its dimensions for 'No' button positioning
  const containerRef = useRef(null);
  // State to hold the value of the text input on the third page
  const [dealProposal, setDealProposal] = useState('');
  // State to hold the selected fulfillment date on the fourth page
  const [selectedFulfillmentDate, setSelectedFulfillmentDate] = useState('');
  // State to determine which final page to show based on deal length
  const [showGoodDealPage, setShowGoodDealPage] = useState(false);
  // State for displaying validation messages
  const [validationMessage, setValidationMessage] = useState('');
  // State for displaying email sending status
  const [emailStatus, setEmailStatus] = useState('');

  // IMPORTANT: Replace this with your actual email address
  const yourEmailAddress = 'sandeep2682006@gmail.com';

  // Function to handle the click on the 'Yes' button
  const handleYesClick = () => {
    setCurrentPage('wiseChoice');
  };

  // Function to handle the click on the 'Next' button on the 'Wise choice' page
  const handleNextClickFromWiseChoice = () => {
    setCurrentPage('thirdPage'); // Transition to the new third page
    setValidationMessage(''); // Clear any previous validation messages
  };

  // Function to handle the click on the 'Next' button on the 'Third Page'
  const handleNextClickFromThirdPage = () => {
    if (dealProposal.trim() === '') {
      setValidationMessage('Please describe your deal!');
      return; // Stop execution if field is empty
    }
    setValidationMessage(''); // Clear message if valid
    setCurrentPage('fulfillmentDate'); // Transition to the new fourth page
  };

  // Function to handle the click on the 'Next' button on the 'Fulfillment Date' page
  const handleNextClickFromFulfillmentDate = () => {
    if (selectedFulfillmentDate === '') {
      setValidationMessage('Please select a date madam ji'); // Updated validation message
      return; // Stop execution if field is empty
    }
    setValidationMessage(''); // Clear message if valid

    // Logic to determine which final page to show based on dealProposal length
    if (dealProposal.length > 50) {
      setShowGoodDealPage(true);
    } else {
      setShowGoodDealPage(false);
    }
    setCurrentPage('dealEvaluation'); // Transition to the new final page
  };

  // Effect to handle email sending when the dealEvaluation page is reached
  useEffect(() => {
    if (currentPage === 'dealEvaluation') {
      setEmailStatus('Sending email...');
      const emailData = {
        to: yourEmailAddress,
        subject: 'New Deal Proposal from Your Girlfriend!',
        body: `
          Your girlfriend has submitted a new deal proposal!

          Proposed Deal:
          "${dealProposal}"

          Fulfillment Date:
          ${selectedFulfillmentDate}

          Please review and revert back with an answer.
        `,
      };

      // Simulate API call to your backend for sending email
      // IMPORTANT: This 'fetch' call will only work if you have a backend server
      // listening at '/api/send-email' that handles actual email sending.
      // This is a placeholder for demonstration purposes.
      fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })
        .then(response => {
          if (response.ok) {
            setEmailStatus('Email sent successfully!');
          } else {
            setEmailStatus('Failed to send email. (Check your backend setup)');
          }
        })
        .catch(error => {
          console.error('Error sending email:', error);
          setEmailStatus('Failed to send email. (Network error or backend issue)');
        })
        .finally(() => {
          // Clear the status message after a few seconds
          setTimeout(() => setEmailStatus(''), 5000);
        });
    }
  }, [currentPage, dealProposal, selectedFulfillmentDate, yourEmailAddress]); // Dependencies for useEffect

  // Function to calculate and set a new random position for the 'No' button
  const setRandomNoButtonPos = useCallback(() => {
    if (containerRef.current && noButtonRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const noButtonRect = noButtonRef.current.getBoundingClientRect();

      // Calculate random positions within the container bounds
      // Ensure the button is fully visible and doesn't go out of bounds
      const newX = Math.random() * (containerRect.width - noButtonRect.width);
      const newY = Math.random() * (containerRect.height - noButtonRect.height);
      setNoButtonPos({ x: newX, y: newY });
    }
  }, []);

  // Effect to set initial random position for the 'No' button when it becomes visible
  // and to handle the initial page transition
  useEffect(() => {
    if (currentPage === 'initial') {
      // After 2 seconds, transition to the page with options
      const timer = setTimeout(() => {
        setCurrentPage('initialOptions');
      }, 2000); // 2-second delay
      return () => clearTimeout(timer); // Cleanup the timer
    } else if (currentPage === 'initialOptions') {
      // Set random position for 'No' button when initialOptions page loads
      setRandomNoButtonPos();
    }
  }, [currentPage, setRandomNoButtonPos]);

  // --- Mouse Evasion Logic (for desktop) ---
  const handleMouseMove = (e) => {
    if (currentPage === 'initialOptions' && noButtonRef.current && containerRef.current) {
      const noButtonRect = noButtonRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      const noButtonCenterX = noButtonPos.x + noButtonRect.width / 2;
      const noButtonCenterY = noButtonPos.y + noButtonRect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX - noButtonCenterX, 2) + Math.pow(mouseY - noButtonCenterY, 2)
      );

      const evasionRadius = 100; // Radius within which the button will evade

      if (distance < evasionRadius) {
        let newX = noButtonPos.x;
        let newY = noButtonPos.y;

        const angle = Math.atan2(noButtonCenterY - mouseY, noButtonCenterX - mouseX);
        const moveDistance = 20; // How far to move each time

        newX += Math.cos(angle) * moveDistance;
        newY += Math.sin(angle) * moveDistance;

        // Ensure button stays within container bounds
        newX = Math.max(0, Math.min(newX, containerRect.width - noButtonRect.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - noButtonRect.height));

        setNoButtonPos({ x: newX, y: newY });
      }
    }
  };

  // --- Touch Evasion Logic (for mobile) ---
  const handleNoButtonTouch = (e) => {
    e.preventDefault(); // Prevent default touch behavior (e.g., scrolling)
    setRandomNoButtonPos(); // Jump to a new random position on touch
  };

  // --- Date Calculation for Fulfillment Date Page ---
  const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const minDate = getFormattedDate(today);
  const maxDate = getFormattedDate(tomorrow);

  return (
    // Main container for the application, centered and full height/width
    // onMouseMove for desktop, touch events handled directly on the button
    <div
      ref={containerRef}
      className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 to-purple-300 p-4 font-inter overflow-hidden"
      onMouseMove={handleMouseMove} // For mouse evasion on desktop
    >
      {currentPage === 'initial' && (
        // First page: Only text, then animates to initialOptions
        <div className="flex flex-col items-center justify-center text-center z-10 p-4 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white text-shadow-lg mb-6 leading-tight">
            Would you like to apologize to yours truly?
          </h1>
          {/* Mazak text is now ONLY on the initialOptions page */}
        </div>
      )}

      {currentPage === 'initialOptions' && (
        // Intermediate page: "Soch lo" with Yes/No buttons and mazak
        <>
          <div className="flex flex-col items-center justify-center text-center z-10 p-4 animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white text-shadow-lg mb-10 leading-tight">
              Soch lo, you might get "it" back
            </h1>
            {/* Yes button: Centered and prominent */}
            <button
              onClick={handleYesClick}
              className="bg-white text-pink-600 font-bold py-4 px-10 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 flex items-center justify-center space-x-3 text-lg md:text-xl animate-bounce-in"
            >
              <span>Yes</span>
              <span role="img" aria-label="heart">❤️</span>
            </button>
            {/* "mazak" text now appears here, bigger */}
            <p className="text-white text-2xl md:text-3xl mt-4 opacity-80 animate-pulse font-bold">
              (mazak)
            </p>
          </div>

          {/* No button: Actively evades the cursor (mouse) or jumps on touch (mobile) */}
          <button
            ref={noButtonRef}
            onTouchStart={handleNoButtonTouch}
            className="absolute bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-full shadow-md cursor-not-allowed pointer-events-none opacity-60 text-sm z-0 transition-transform duration-100 ease-out"
            style={{
              left: `${noButtonPos.x}px`,
              top: `${noButtonPos.y}px`,
              transform: 'scale(0.9) rotate(-5deg)',
            }}
          >
            No
          </button>
        </>
      )}

      {currentPage === 'wiseChoice' && (
        // Second page content: Wise choice message, image, and Next button
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center transform transition-all duration-500 hover:scale-105 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
            Wise choice
          </h1>
          {/* Image with fallback in case the URL fails */}
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBSwgxzmPsbxhBOULn4skQpSSfKnrab4fGmQ&s"
            alt="A cute illustration of a happy couple or a heart"
            className="w-full h-auto rounded-2xl mb-6 shadow-md object-cover animate-image-pop"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x250/FFC0CB/FFFFFF?text=Love";
            }}
          />
          {/* Next button - now with onClick handler to go to the third page */}
          <button
            onClick={handleNextClickFromWiseChoice}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 w-full animate-bounce-in"
          >
            Next
          </button>
        </div>
      )}

      {currentPage === 'thirdPage' && (
        // Third page content: What will I get??? with text input
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center transform transition-all duration-500 hover:scale-105 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
            What will I get???
          </h1>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-y focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-700 placeholder-gray-400"
            rows="5"
            placeholder="Describe your 'crazier' deal here..."
            value={dealProposal}
            onChange={(e) => {
              setDealProposal(e.target.value);
              setValidationMessage(''); // Clear message when typing
            }}
          ></textarea>
          {validationMessage && (
            <p className="text-red-500 text-sm mb-2 animate-pulse">{validationMessage}</p>
          )}
          <p className="text-gray-600 text-sm mb-6 leading-tight font-semibold">
            Your offer must transcend the ordinary, a symphony of sheer brilliance, or it risks fading into the echo of 'no deal.'
          </p>
          <button
            onClick={handleNextClickFromThirdPage}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 w-full"
          >
            Next
          </button>
        </div>
      )}

      {currentPage === 'fulfillmentDate' && (
        // Fourth page content: When will this deal be fulfilled? with date selector
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center transform transition-all duration-500 hover:scale-105 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
            When will this deal be fulfilled?
          </h1>
          <input
            type="date"
            className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-700"
            value={selectedFulfillmentDate}
            onChange={(e) => {
              setSelectedFulfillmentDate(e.target.value);
              setValidationMessage(''); // Clear message when selecting
            }}
            min={minDate} // Restrict minimum date to today
            max={maxDate} // Restrict maximum date to tomorrow
          />
          {validationMessage && (
            <p className="text-red-500 text-sm mb-2 animate-pulse">{validationMessage}</p>
          )}
          <button
            onClick={handleNextClickFromFulfillmentDate}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 w-full"
          >
            Next
          </button>
        </div>
      )}

      {currentPage === 'dealEvaluation' && (
        // Fifth page content: Deal processing based on proposal length
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center transform transition-all duration-500 hover:scale-105 animate-fade-in">
          {showGoodDealPage ? (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
                Hmmm, processing your deal
              </h1>
              <p className="text-gray-600 mb-6">
                You will be reverted back with an answer depending on your deal
              </p>
              <img
                src="https://media1.tenor.com/m/olTVP9rBLuoAAAAC/you-naughty-naughty-pointing.gif"
                alt="Naughty pointing GIF"
                className="w-full h-auto rounded-2xl mb-6 shadow-md object-cover"
              />
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
                Hmmm, processing your deal
              </h1>
              <p className="text-gray-600 mb-3">
                You will be reverted back with an answer depending on your deal
              </p>
              <p className="text-gray-500 text-sm italic mb-6">
                (Utni achi nahi lag rahi deal)
              </p>
              <img
                src="https://media1.tenor.com/m/PQ0Ujjs7KgAAAAAd/maybe-we-could-try-again-try-again.gif"
                alt="Try again GIF"
                className="w-full h-auto rounded-2xl mb-6 shadow-md object-cover"
              />
            </>
          )}
          {emailStatus && (
            <p className={`text-sm mt-4 ${emailStatus.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
              {emailStatus}
            </p>
          )}
        </div>
      )}

      {/* Tailwind CSS Customizations (Animations) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.5); }
          60% { opacity: 1; transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounceIn 0.8s ease-out forwards;
        }

        @keyframes imagePop {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-image-pop {
          animation: imagePop 0.6s ease-out forwards;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }

        .text-shadow-lg {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default App;
