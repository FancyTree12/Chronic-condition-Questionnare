// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('screeningForm');
    const progressBar = document.getElementById('progressBar');
    
    // Update progress bar as user answers questions
    form.addEventListener('change', (e) => {
      if (e.target.tagName === 'SELECT') {
        const answered = form.querySelectorAll('select:not([value=""])').length;
        progressBar.value = answered;
      }
    });
  
    // Handle form submission
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      calculateScores();
    });
  });
  
  // Condition-specific messages based on risk level
  const conditionMessages = {
    AS: {
      Low: {
        message: "Your symptoms suggest a low risk for Ankylosing Spondylitis. However, if you continue to experience persistent back pain, especially in your lower back and hips, consider discussing these symptoms with your healthcare provider.",
        recommendations: "Consider maintaining good posture and regular exercise."
      },
      Moderate: {
        message: "Your symptoms indicate a moderate risk for Ankylosing Spondylitis. This inflammatory condition primarily affects the spine and sacroiliac joints.",
        recommendations: "It's recommended to consult with a rheumatologist for proper evaluation. Early diagnosis and treatment can help manage symptoms effectively."
      },
      High: {
        message: "Your symptoms strongly suggest characteristics associated with Ankylosing Spondylitis. This is a serious inflammatory condition that requires proper medical attention.",
        recommendations: "Urgent consultation with a rheumatologist is strongly recommended. Early intervention can help prevent long-term complications and manage symptoms effectively."
      }
    },
    RA: {
      Low: {
        message: "Your symptoms suggest a low risk for Rheumatoid Arthritis. Keep monitoring any joint pain or morning stiffness you experience.",
        recommendations: "Maintain a healthy lifestyle and stay physically active."
      },
      Moderate: {
        message: "Your symptoms indicate a moderate risk for Rheumatoid Arthritis. This autoimmune condition can affect multiple joints in your body.",
        recommendations: "Schedule an appointment with a rheumatologist for proper evaluation. Early diagnosis is crucial for effective treatment."
      },
      High: {
        message: "Your symptoms strongly align with Rheumatoid Arthritis patterns. This chronic autoimmune condition requires proper medical management.",
        recommendations: "Immediate consultation with a rheumatologist is strongly advised. Early treatment can help prevent joint damage and manage symptoms."
      }
    },
    Lupus: {
      Low: {
        message: "Your symptoms suggest a low risk for Systemic Lupus Erythematosus (SLE). Continue to monitor any unusual symptoms.",
        recommendations: "Maintain sun protection and a healthy lifestyle."
      },
      Moderate: {
        message: "Your symptoms indicate a moderate risk for Systemic Lupus Erythematosus. This complex autoimmune condition can affect multiple body systems.",
        recommendations: "Consultation with a rheumatologist is recommended for proper evaluation. Early diagnosis can help manage symptoms effectively."
      },
      High: {
        message: "Your symptoms strongly suggest patterns associated with Systemic Lupus Erythematosus. This is a serious autoimmune condition that requires medical attention.",
        recommendations: "Urgent consultation with a rheumatologist is strongly recommended. Proper diagnosis and treatment are essential for managing this condition."
      }
    },
    Gout: {
      Low: {
        message: "Your symptoms suggest a low risk for Gout. Continue monitoring any joint pain or swelling.",
        recommendations: "Maintain a healthy diet and stay hydrated."
      },
      Moderate: {
        message: "Your symptoms indicate a moderate risk for Gout. This condition involves painful inflammation in joints, often starting in the big toe.",
        recommendations: "Consider consulting with a healthcare provider. Diet and lifestyle modifications may help prevent attacks."
      },
      High: {
        message: "Your symptoms strongly suggest patterns associated with Gout. This painful condition requires proper medical management.",
        recommendations: "Prompt medical evaluation is strongly recommended. Treatment can help prevent future attacks and joint damage."
      }
    },
    Pagets: {
      Low: {
        message: "Your symptoms suggest a low risk for Paget's Disease of Bone. Monitor any bone pain or changes in bone structure.",
        recommendations: "Maintain regular physical activity and a calcium-rich diet."
      },
      Moderate: {
        message: "Your symptoms indicate a moderate risk for Paget's Disease of Bone. This condition affects bone remodeling and can lead to bone deformities.",
        recommendations: "Consultation with a specialist is recommended for proper evaluation. Early detection can help prevent complications."
      },
      High: {
        message: "Your symptoms strongly suggest patterns associated with Paget's Disease of Bone. This condition requires proper medical attention.",
        recommendations: "Urgent consultation with a specialist is strongly recommended. Treatment can help manage symptoms and prevent complications."
      }
    }
  };
  
  function calculateScores() {
    const questions = document.querySelectorAll('select');
    
    let scores = {
      AS: { total: 0, max: 0 },
      RA: { total: 0, max: 0 },
      Lupus: { total: 0, max: 0 },
      Gout: { total: 0, max: 0 },
      Pagets: { total: 0, max: 0 }
    };
    
    let allAnswered = true;
  
    questions.forEach((question) => {
      if (question.value === "") {
        allAnswered = false;
        question.style.borderColor = "red";
      } else {
        question.style.borderColor = "";
        
        if (question.value !== "0") {
          const conditionScores = question.value.split(',');
          conditionScores.forEach(score => {
            const [condition, value] = score.split(':');
            scores[condition].total += parseInt(value);
          });
        }
        
        const maxOptions = Array.from(question.options)
          .filter(opt => opt.value !== "" && opt.value !== "0")
          .map(opt => opt.value.split(',').map(score => {
            const [condition, value] = score.split(':');
            return { condition, value: parseInt(value) };
          }));
        
        maxOptions.forEach(optionScores => {
          optionScores.forEach(score => {
            scores[score.condition].max += score.value;
          });
        });
      }
    });
  
    if (!allAnswered) {
      alert('Please answer all questions before submitting.');
      return;
    }
  
    displayResults(scores);
  }
  
  function displayResults(scores) {
    let resultHTML = "<h3>Risk Assessment Results:</h3>";
    let hasHighRisk = false;
    let highRiskConditions = [];
    
    Object.entries(scores).forEach(([condition, score]) => {
      const percentage = (score.total / score.max) * 100;
      let riskLevel = calculateRiskLevel(percentage);
      
      // Store high risk conditions for summary
      if (riskLevel === "High") {
        hasHighRisk = true;
        highRiskConditions.push(condition);
      }
  
      resultHTML += generateDetailedResultText(condition, score.total, percentage, riskLevel);
    });
  
    // Add summary section at the top if there are high-risk conditions
    if (hasHighRisk) {
      resultHTML = `
        <div class="high-risk-summary" style="background-color: #ffe6e6; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h4 style="color: #cc0000; margin-top: 0;">⚠️ Important Notice</h4>
          <p>Your responses indicate a high risk for the following condition(s): 
            <strong>${highRiskConditions.join(", ")}</strong>. 
            Immediate consultation with a healthcare provider is strongly recommended.</p>
        </div>
        ${resultHTML}
      `;
    }
  
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = resultHTML;
    resultDiv.classList.add('show-result');
    resultDiv.style.display = 'block';
  
    // Scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth' });
  }
  
  function calculateRiskLevel(percentage) {
    if (percentage <= 30) return "Low";
    if (percentage <= 70) return "Moderate";
    return "High";
  }
  
  function generateDetailedResultText(condition, score, percentage, riskLevel) {
    const conditionInfo = conditionMessages[condition][riskLevel];
    const percentageFormatted = percentage.toFixed(1);
    
    return `
      <div class="condition-result" style="margin-bottom: 20px; padding: 15px; border-radius: 5px; background-color: ${getBackgroundColor(riskLevel)}">
        <h4 style="margin-top: 0;">${condition} Assessment - ${riskLevel} Risk (${percentageFormatted}%)</h4>
        <p><strong>Analysis:</strong> ${conditionInfo.message}</p>
        <p><strong>Recommendations:</strong> ${conditionInfo.recommendations}</p>
      </div>
    `;
  }
  
  function getBackgroundColor(riskLevel) {
    switch (riskLevel) {
      case "Low": return "#e6ffe6"; // Light green
      case "Moderate": return "#fff4e6"; // Light orange
      case "High": return "#ffe6e6"; // Light red
      default: return "#ffffff";
    }
  }