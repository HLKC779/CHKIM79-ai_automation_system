// InsureAI Assistant - Advanced AI Insurance Agent
// Powered by open-source transformers from Hugging Face

// Configuration
const CONFIG = {
    DEBUG_MODE: true,
    MODEL_NAME: 'Xenova/distilbert-base-cased-distilled-squad',
    TYPING_DELAY: 1000
};

// Global variables
let pipeline = null;
let modelInitialized = false;
let modelInitializationAttempted = false;

// Enhanced Insurance Knowledge Base
const INSURANCE_KNOWLEDGE = {
    policy: {
        description: "Your insurance policy is a legally binding contract between you and the insurance company.",
        types: [
            {
                name: "Auto Insurance",
                description: "Protects against financial loss in the event of an accident or theft.",
                typical_coverage: ["Liability", "Collision", "Comprehensive", "Uninsured/Underinsured Motorist", "Medical Payments"]
            },
            {
                name: "Homeowners Insurance",
                description: "Protects your home and personal property against damage or theft.",
                typical_coverage: ["Dwelling", "Other Structures", "Personal Property", "Loss of Use", "Personal Liability"]
            },
            {
                name: "Health Insurance",
                description: "Helps pay for medical expenses including doctor visits, hospital stays, prescriptions.",
                typical_coverage: ["Preventive Care", "Hospitalization", "Prescription Drugs", "Emergency Services"]
            }
        ],
        key_terms: {
            premium: "The amount you pay for your insurance policy, typically monthly or annually.",
            deductible: "The amount you pay out of pocket before your insurance coverage kicks in.",
            coverage_limit: "The maximum amount your insurance will pay for a covered loss.",
            exclusion: "Specific conditions or circumstances that are not covered by your policy.",
            claim: "A formal request to an insurance company asking for a payment based on the terms of the insurance policy."
        }
    },
    claims: {
        process: [
            {
                step: 1,
                description: "Report the incident to your insurance company as soon as possible.",
                details: "Have your policy number ready and be prepared to provide basic information about what happened."
            },
            {
                step: 2,
                description: "Provide all necessary documentation to support your claim.",
                details: "This may include photos/videos of damage, police reports, medical records, receipts for damaged items."
            },
            {
                step: 3,
                description: "An adjuster will be assigned to assess the damage and determine coverage.",
                details: "The adjuster may contact you for more information, inspect the damage in person."
            },
            {
                step: 4,
                description: "Once approved, you'll receive payment minus any applicable deductible.",
                details: "Payment may be issued to you directly or sometimes to repair shops/medical providers."
            }
        ],
        timeline: {
            auto: "Most auto claims are processed within 15-30 days.",
            home: "Home claims typically take 30-60 days.",
            health: "Health insurance claims are usually processed within 30 days."
        },
        tips: [
            "Document everything with photos, videos, and written descriptions.",
            "Keep receipts for any temporary repairs or medical treatments.",
            "Be honest and thorough in your claim description.",
            "Keep a log of all communications with your insurance company."
        ]
    },
    common_questions: {
        "What's covered under my policy?": {
            answer: "Coverage depends on your specific policy type and endorsements. Generally, sudden and accidental damage is covered.",
            follow_up: "Would you like me to explain any specific coverage types?"
        },
        "How can I lower my premiums?": {
            answer: "Consider raising your deductible, bundling multiple policies, maintaining good credit, asking about available discounts.",
            follow_up: "Would you like me to check if you qualify for any discounts?"
        },
        "When does my coverage start?": {
            answer: "For new policies, coverage typically starts after payment is received and the policy is issued, usually within 24-48 hours.",
            follow_up: "Are you asking about a specific type of coverage?"
        }
    },
    resources: {
        contact: {
            customer_service: "1-800-555-INSURANCE (Available 24/7)",
            claims_department: "1-800-555-CLAIMS (Available 24/7)"
        }
    }
};

// Sample user policy data
const USER_POLICY = {
    policy_number: "INS-2024-78901",
    type: "Auto Insurance",
    status: "Active",
    effective_date: "January 1, 2024",
    expiration_date: "January 1, 2025",
    premium: "$1,440 annually ($120/month)",
    payment_method: "Automatic bank draft on the 1st of each month",
    deductible: {
        collision: "$500",
        comprehensive: "$500",
        glass: "$0"
    },
    coverage_limits: {
        bodily_injury: "$100,000 per person / $300,000 per accident",
        property_damage: "$50,000 per accident",
        collision: "Actual Cash Value",
        comprehensive: "Actual Cash Value",
        uninsured_motorist: "$100,000 per person / $300,000 per accident",
        medical_payments: "$5,000 per person"
    },
    discounts: [
        "Multi-policy (10%)",
        "Safe Driver (5%)",
        "Anti-theft Device (5%)"
    ],
    vehicles: [
        {
            make: "Toyota",
            model: "Camry",
            year: "2022",
            vin: "4T1BF1FKXHU123456"
        }
    ],
    agent: {
        name: "Michael Johnson",
        phone: "(555) 123-4567",
        email: "m.johnson@exampleinsurer.com"
    }
};

// Utility functions
function logDebug(message) {
    if (CONFIG.DEBUG_MODE) {
        console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
}

function updateStatus(status, type = 'info') {
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    
    if (statusText) statusText.textContent = status;
    
    if (statusDot) {
        statusDot.className = 'status-dot';
        if (type === 'success') statusDot.classList.add('online');
        else if (type === 'warning') statusDot.classList.add('loading');
        else if (type === 'error') statusDot.classList.add('error');
    }
}

// AI Model Initialization
async function initializeModel() {
    if (modelInitializationAttempted) return;
    modelInitializationAttempted = true;
    
    try {
        logDebug('Starting model initialization...');
        updateStatus('Initializing AI model...', 'warning');
        
        // Show loading state
        setLoadingState(true);
        
        logDebug('Loading pipeline...');
        updateStatus('Loading AI components...', 'warning');
        
        // Import the pipeline function from transformers.js
        const { pipeline: createPipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.0/dist/transformers.min.js');
        
        logDebug('Creating QA pipeline...');
        updateStatus('Initializing knowledge base...', 'warning');
        
        // Create the pipeline
        pipeline = await createPipeline(
            'question-answering',
            CONFIG.MODEL_NAME,
            {
                progress_callback: (progress) => {
                    const percent = Math.round(progress * 100);
                    logDebug(`Model loading progress: ${percent}%`);
                    updateStatus(`Loading model: ${percent}%`, 'warning');
                }
            }
        );
        
        modelInitialized = true;
        logDebug('Model initialized successfully');
        updateStatus('Online', 'success');
        
        // Hide loading state
        setLoadingState(false);
        
        // Add welcome message
        addBotMessage("I'm now fully initialized and ready to assist with your insurance questions. I'm powered by open-source transformers and can help you with policy details, coverage explanations, claims guidance, and much more!");
        
        // Enable quick actions
        enableQuickActions();
        
    } catch (error) {
        console.error('Error initializing model:', error);
        logDebug(`Initialization error: ${error.message}`);
        updateStatus('Limited functionality', 'warning');
        
        addBotMessage("I'm having some technical difficulties with my AI components, but I can still assist with basic insurance questions using my comprehensive knowledge base.");
        
        // Hide loading state
        setLoadingState(false);
        
        // Enable quick actions
        enableQuickActions();
    }
}

function setLoadingState(loading) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    
    if (loadingSpinner) loadingSpinner.style.display = loading ? 'inline-block' : 'none';
    if (sendButton) sendButton.disabled = loading;
    if (userInput) userInput.disabled = loading;
}

function enableQuickActions() {
    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.disabled = false;
    });
}

// Chat functionality
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');

function addUserMessage(message) {
    logDebug(`Adding user message: ${message}`);
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.innerHTML = `
        ${escapeHtml(message)}
        <div class="message-time">${getCurrentTime()}</div>
    `;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

function addBotMessage(message, isTyping = false) {
    if (isTyping) {
        logDebug('Showing typing indicator');
        typingIndicator.style.display = 'flex';
        scrollToBottom();
        return;
    }
    
    logDebug(`Adding bot message: ${message.substring(0, 50)}...`);
    typingIndicator.style.display = 'none';
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    messageElement.innerHTML = `
        ${message}
        <div class="message-time">${getCurrentTime()}</div>
    `;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Message processing
async function processUserMessage(message) {
    logDebug(`Processing user message: ${message}`);
    
    // Show typing indicator
    addBotMessage('', true);
    
    // Simple delay to simulate thinking
    await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_DELAY));
    
    try {
        let response = '';
        
        // Check for greetings
        if (isGreeting(message)) {
            response = "Hello! I'm your advanced AI Insurance Assistant. I'm powered by open-source transformers and can help you with all your insurance needs. How can I assist you today?";
        } 
        // Check for policy number request
        else if (message.toLowerCase().includes('policy number') || message.toLowerCase().includes('my policy')) {
            response = generatePolicyResponse();
        }
        // Check for coverage question
        else if (message.toLowerCase().includes('what does my policy cover') || 
                 message.toLowerCase().includes('coverage') ||
                 message.toLowerCase().includes('what\'s covered')) {
            response = generateCoverageResponse();
        }
        // Check for deductible question
        else if (message.toLowerCase().includes('deductible')) {
            response = generateDeductibleResponse();
        }
        // Check for claims question
        else if (message.toLowerCase().includes('claim') || 
                 message.toLowerCase().includes('file a claim') ||
                 message.toLowerCase().includes('accident')) {
            response = generateClaimsResponse();
        }
        // Check for document request
        else if (message.toLowerCase().includes('document') || 
                 message.toLowerCase().includes('policy document') ||
                 message.toLowerCase().includes('proof of insurance')) {
            response = generateDocumentResponse();
        }
        // Check for payment question
        else if (message.toLowerCase().includes('payment') || 
                 message.toLowerCase().includes('premium') ||
                 message.toLowerCase().includes('bill')) {
            response = generatePaymentResponse();
        }
        // Use AI model for complex questions
        else if (modelInitialized) {
            response = await processWithAI(message);
        } else {
            // Fallback to knowledge base
            response = searchKnowledgeBase(message, true);
        }
        
        addBotMessage(response);
        
    } catch (error) {
        console.error('Error processing message:', error);
        logDebug(`Message processing error: ${error.message}`);
        
        let errorMessage = "I encountered an error processing your request. Please try again or contact customer support for assistance.";
        
        // Try to get at least some answer from knowledge base
        const kbAnswer = searchKnowledgeBase(message, true);
        if (kbAnswer) {
            errorMessage += "<br><br>Here's some general information that might help:<br><br>" + kbAnswer;
        }
        
        addBotMessage(errorMessage);
    }
}

// AI Processing
async function processWithAI(question) {
    logDebug('Using AI model to answer question');
    
    try {
        // First try to find answer in our knowledge base
        const kbAnswer = searchKnowledgeBase(question);
        if (kbAnswer) {
            return kbAnswer;
        }
        
        // If not found in KB, use the AI model
        const context = generateContext();
        logDebug(`Using context: ${context.substring(0, 100)}...`);
        
        const result = await pipeline({
            question: question,
            context: context,
            topk: 3
        });
        
        logDebug(`AI model result:`, result);
        
        if (result.score > 0.3) {
            let response = result.answer;
            
            // Add confidence indicator in debug mode
            if (CONFIG.DEBUG_MODE) {
                response += `<div class="error-message" style="margin-top:10px;font-size:0.7rem;">[AI Confidence: ${Math.round(result.score * 100)}%]</div>`;
            }
            
            return response;
        } else {
            return "I'm not entirely sure about that specific question. For complex insurance matters, I recommend contacting our customer service team at " + 
                   INSURANCE_KNOWLEDGE.resources.contact.customer_service + " for personalized assistance.";
        }
    } catch (error) {
        console.error('AI model error:', error);
        logDebug(`AI model error: ${error.message}`);
        
        // Fall back to knowledge base
        const kbAnswer = searchKnowledgeBase(question, true);
        return kbAnswer || "I encountered an issue processing your question with my AI components. Please contact customer service for assistance.";
    }
}

// Response generators
function generatePolicyResponse() {
    return `Your policy number is <strong>${USER_POLICY.policy_number}</strong>. This is a ${USER_POLICY.type} policy effective from ${USER_POLICY.effective_date} to ${USER_POLICY.expiration_date}.
    
    <div class="policy-details">
        <h3>Policy Details</h3>
        <p><strong>Type:</strong> ${USER_POLICY.type}</p>
        <p><strong>Status:</strong> ${USER_POLICY.status}</p>
        <p><strong>Premium:</strong> ${USER_POLICY.premium}</p>
        <p><strong>Payment Method:</strong> ${USER_POLICY.payment_method}</p>
        <p><strong>Agent:</strong> ${USER_POLICY.agent.name} (${USER_POLICY.agent.phone})</p>
    </div>`;
}

function generateCoverageResponse() {
    if (USER_POLICY.type === 'Auto Insurance') {
        return `Your auto policy includes the following coverages:
        <ul>
            <li><strong>Bodily Injury Liability:</strong> ${USER_POLICY.coverage_limits.bodily_injury}</li>
            <li><strong>Property Damage Liability:</strong> ${USER_POLICY.coverage_limits.property_damage}</li>
            <li><strong>Collision:</strong> ${USER_POLICY.coverage_limits.collision} ($${USER_POLICY.deductible.collision} deductible)</li>
            <li><strong>Comprehensive:</strong> ${USER_POLICY.coverage_limits.comprehensive} ($${USER_POLICY.deductible.comprehensive} deductible)</li>
            <li><strong>Uninsured Motorist:</strong> ${USER_POLICY.coverage_limits.uninsured_motorist}</li>
            <li><strong>Medical Payments:</strong> ${USER_POLICY.coverage_limits.medical_payments}</li>
        </ul>
        
        <p>You also qualify for these discounts: ${USER_POLICY.discounts.join(', ')}</p>`;
    } else {
        return "I can see you have a policy with us, but I need more details about what type of coverage you're asking about. Could you specify if you're asking about auto, home, or health insurance coverage?";
    }
}

function generateDeductibleResponse() {
    if (USER_POLICY.type === 'Auto Insurance') {
        return `Your current auto insurance deductibles are:
        <ul>
            <li><strong>Collision:</strong> $${USER_POLICY.deductible.collision}</li>
            <li><strong>Comprehensive:</strong> $${USER_POLICY.deductible.comprehensive}</li>
            <li><strong>Glass:</strong> $${USER_POLICY.deductible.glass}</li>
        </ul>`;
    } else {
        return "I can check your deductible information, but I need to know which policy you're referring to (auto, home, health, etc.).";
    }
}

function generateClaimsResponse() {
    return `To file a claim:
    <ol>
        <li><strong>Report the incident:</strong> Contact our claims department at ${INSURANCE_KNOWLEDGE.resources.contact.claims_department} or through our website.</li>
        <li><strong>Have your information ready:</strong> Policy number (${USER_POLICY.policy_number}), date/time of incident, and details of what happened.</li>
        <li><strong>Provide documentation:</strong> Photos, police reports, medical records, or repair estimates as applicable.</li>
        <li><strong>Work with your adjuster:</strong> They'll guide you through the process and answer any questions.</li>
    </ol>`;
}

function generateDocumentResponse() {
    showDocumentPreview();
    return "Here's a summary of your current policy documents. You can view the full details below or download them for your records.";
}

function generatePaymentResponse() {
    return `Your current payment information:
    <ul>
        <li><strong>Premium:</strong> ${USER_POLICY.premium}</li>
        <li><strong>Payment Method:</strong> ${USER_POLICY.payment_method}</li>
        <li><strong>Next Payment Due:</strong> ${getNextPaymentDate()}</li>
    </ul>
    <p>You can update your payment method or schedule through your online account or by contacting customer service.</p>`;
}

// Utility functions
function isGreeting(message) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greet => message.toLowerCase().includes(greet));
}

function getNextPaymentDate() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    if (today.getDate() >= 1) {
        return new Date(currentYear, currentMonth + 1, 1).toLocaleDateString();
    } else {
        return new Date(currentYear, currentMonth, 1).toLocaleDateString();
    }
}

function generateContext() {
    let context = "Insurance Knowledge Base:\n\n";
    
    // Policy information
    context += "Policy Information:\n";
    context += INSURANCE_KNOWLEDGE.policy.description + "\n";
    context += "Types of policies:\n";
    INSURANCE_KNOWLEDGE.policy.types.forEach(type => {
        context += `- ${type.name}: ${type.description}\n`;
        context += `  Typical coverages: ${type.typical_coverage.join(', ')}\n\n`;
    });
    
    context += "\nKey Terms:\n";
    for (const [term, definition] of Object.entries(INSURANCE_KNOWLEDGE.policy.key_terms)) {
        context += `${term}: ${definition}\n`;
    }
    
    // Claims information
    context += "\nClaims Information:\n";
    context += "Claims Process:\n";
    INSURANCE_KNOWLEDGE.claims.process.forEach(step => {
        context += `${step.step}. ${step.description}\n`;
        context += `   ${step.details}\n`;
    });
    
    context += "\nTypical Timelines:\n";
    for (const [type, timeline] of Object.entries(INSURANCE_KNOWLEDGE.claims.timeline)) {
        context += `- ${type}: ${timeline}\n`;
    }
    
    context += "\nTips for Filing Claims:\n";
    INSURANCE_KNOWLEDGE.claims.tips.forEach(tip => context += "- " + tip + "\n");
    
    // Common questions
    context += "\nCommon Questions and Answers:\n";
    for (const [question, data] of Object.entries(INSURANCE_KNOWLEDGE.common_questions)) {
        context += `Q: ${question}\nA: ${data.answer}\n`;
        if (data.follow_up) context += `Follow-up: ${data.follow_up}\n`;
        context += "\n";
    }
    
    // User's specific policy information
    context += "\nUser's Policy Information:\n";
    context += `Policy Number: ${USER_POLICY.policy_number}\n`;
    context += `Type: ${USER_POLICY.type}\n`;
    context += `Status: ${USER_POLICY.status}\n`;
    context += `Effective Date: ${USER_POLICY.effective_date}\n`;
    context += `Expiration Date: ${USER_POLICY.expiration_date}\n`;
    context += `Premium: ${USER_POLICY.premium}\n`;
    
    if (USER_POLICY.type === 'Auto Insurance') {
        context += "\nAuto Coverage Details:\n";
        for (const [coverage, limit] of Object.entries(USER_POLICY.coverage_limits)) {
            context += `- ${coverage}: ${limit}\n`;
        }
        
        context += "\nVehicles Covered:\n";
        USER_POLICY.vehicles.forEach(vehicle => {
            context += `- ${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})\n`;
        });
    }
    
    return context;
}

function searchKnowledgeBase(question, includeAll = false) {
    const lowerQuestion = question.toLowerCase();
    
    // Check policy questions
    if (lowerQuestion.includes('policy') || 
        lowerQuestion.includes('what is') || 
        lowerQuestion.includes('mean') ||
        includeAll) {
        
        for (const [term, definition] of Object.entries(INSURANCE_KNOWLEDGE.policy.key_terms)) {
            if (lowerQuestion.includes(term.toLowerCase())) {
                return `In insurance terms, <strong>${term}</strong> refers to ${definition}`;
            }
        }
        
        if (lowerQuestion.includes('type') || lowerQuestion.includes('kind')) {
            let response = "We offer several types of insurance policies:\n";
            INSURANCE_KNOWLEDGE.policy.types.forEach(type => {
                response += `<strong>• ${type.name}:</strong> ${type.description}<br>`;
                response += `<em>Typical coverages:</em> ${type.typical_coverage.join(', ')}<br><br>`;
            });
            return response;
        }
    }
    
    // Check claims questions
    if (lowerQuestion.includes('claim') || 
        lowerQuestion.includes('file') || 
        lowerQuestion.includes('process') ||
        includeAll) {
        
        let response = "<strong>The claims process involves these steps:</strong>\n<ol>";
        INSURANCE_KNOWLEDGE.claims.process.forEach(step => {
            response += `<li>${step.description}<br><em>${step.details}</em></li>`;
        });
        response += "</ol>";
        
        response += "<br><strong>Typical timelines:</strong><br>";
        for (const [type, timeline] of Object.entries(INSURANCE_KNOWLEDGE.claims.timeline)) {
            response += `- ${type}: ${timeline}<br>`;
        }
        
        response += "<br><strong>Tips for filing claims:</strong><br>";
        INSURANCE_KNOWLEDGE.claims.tips.forEach(tip => response += `• ${tip}<br>`);
        
        return response;
    }
    
    // Check common questions
    for (const [q, data] of Object.entries(INSURANCE_KNOWLEDGE.common_questions)) {
        const firstWord = q.toLowerCase().split(' ')[0];
        if (lowerQuestion.includes(firstWord) || 
            (includeAll && lowerQuestion.split(' ').some(word => q.toLowerCase().includes(word)))) {
            
            let response = `<strong>${q}</strong><br>${data.answer}`;
            if (includeAll && data.follow_up) {
                response += `<br><em>${data.follow_up}</em>`;
            }
            return response;
        }
    }
    
    // If includeAll is true and we haven't found anything, return a general response
    if (includeAll) {
        return "I found some general insurance information that might be helpful:<br><br>" +
               "<strong>Key Terms:</strong><br>" +
               Object.entries(INSURANCE_KNOWLEDGE.policy.key_terms)
                   .map(([term, def]) => `<strong>${term}:</strong> ${def}`)
                   .join('<br>') +
               "<br><br><strong>Contact Information:</strong><br>" +
               `Customer Service: ${INSURANCE_KNOWLEDGE.resources.contact.customer_service}<br>` +
               `Claims: ${INSURANCE_KNOWLEDGE.resources.contact.claims_department}`;
    }
    
    return null;
}

function showDocumentPreview() {
    const documentPreview = document.getElementById('documentPreview');
    const documentContent = document.getElementById('documentContent');
    
    let content = `
        <h4>Policy Summary for ${USER_POLICY.policy_number}</h4>
        <p><strong>Policy Holder:</strong> John Doe</p>
        <p><strong>Policy Type:</strong> ${USER_POLICY.type}</p>
        <p><strong>Status:</strong> ${USER_POLICY.status}</p>
        <p><strong>Effective Date:</strong> ${USER_POLICY.effective_date}</p>
        <p><strong>Expiration Date:</strong> ${USER_POLICY.expiration_date}</p>
        <p><strong>Premium:</strong> ${USER_POLICY.premium}</p>
        <p><strong>Payment Method:</strong> ${USER_POLICY.payment_method}</p>
        
        <h4>Coverage Details</h4>
    `;
    
    if (USER_POLICY.type === 'Auto Insurance') {
        content += `
            <p><strong>Vehicles Covered:</strong></p>
            <ul>
                ${USER_POLICY.vehicles.map(v => `<li>${v.year} ${v.make} ${v.model} (VIN: ${v.vin})</li>`).join('')}
            </ul>
            <p><strong>Coverage Limits:</strong></p>
            <ul>
                <li>Bodily Injury Liability: ${USER_POLICY.coverage_limits.bodily_injury}</li>
                <li>Property Damage Liability: ${USER_POLICY.coverage_limits.property_damage}</li>
                <li>Collision: ${USER_POLICY.coverage_limits.collision} ($${USER_POLICY.deductible.collision} deductible)</li>
                <li>Comprehensive: ${USER_POLICY.coverage_limits.comprehensive} ($${USER_POLICY.deductible.comprehensive} deductible)</li>
                <li>Uninsured Motorist: ${USER_POLICY.coverage_limits.uninsured_motorist}</li>
                <li>Medical Payments: ${USER_POLICY.coverage_limits.medical_payments}</li>
            </ul>
            
            <h4>Discounts Applied</h4>
            <ul>
                ${USER_POLICY.discounts.map(d => `<li>${d}</li>`).join('')}
            </ul>
        `;
    }
    
    content += `
        <h4>Agent Information</h4>
        <p>${USER_POLICY.agent.name}<br>
        ${USER_POLICY.agent.phone}<br>
        ${USER_POLICY.agent.email}</p>
    `;
    
    documentContent.innerHTML = content;
    documentPreview.style.display = 'block';
    logDebug('Displayed document preview');
}

// Event listeners setup
function setupEventListeners() {
    logDebug('Setting up event listeners');
    
    // Chat form submission
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const quickActions = document.querySelectorAll('.quick-action');
    
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            addUserMessage(message);
            userInput.value = '';
            await processUserMessage(message);
        }
    });

    // Quick action buttons
    quickActions.forEach(button => {
        button.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            userInput.value = prompt;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    // Resource links
    document.getElementById('policyDocsLink').addEventListener('click', function(e) {
        e.preventDefault();
        userInput.value = "Show me my policy documents";
        chatForm.dispatchEvent(new Event('submit'));
    });

    document.getElementById('claimFormsLink').addEventListener('click', function(e) {
        e.preventDefault();
        userInput.value = "I need to file a claim";
        chatForm.dispatchEvent(new Event('submit'));
    });

    document.getElementById('coverageCalcLink').addEventListener('click', function(e) {
        e.preventDefault();
        userInput.value = "Help me understand my coverage limits";
        chatForm.dispatchEvent(new Event('submit'));
    });

    document.getElementById('faqsLink').addEventListener('click', function(e) {
        e.preventDefault();
        userInput.value = "What are the most common insurance questions?";
        chatForm.dispatchEvent(new Event('submit'));
    });

    document.getElementById('claimStatusLink').addEventListener('click', function(e) {
        e.preventDefault();
        userInput.value = "What's the status of my claim?";
        chatForm.dispatchEvent(new Event('submit'));
    });

    // Knowledge base links
    document.getElementById('coverageGuideLink').addEventListener('click', function(e) {
        e.preventDefault();
        userInput.value = "Explain my coverage options";
        chatForm.dispatchEvent(new Event('submit'));
    });

    document.getElementById('claimsGuideLink').addEventListener('click', function(e) {
        e.preventDefault();
        userInput.value = "Walk me through the claims process";
        chatForm.dispatchEvent(new Event('submit'));
    });

    document.getElementById('paymentsGuideLink').addEventListener('click', function(e) {
        e.preventDefault();
        userInput.value = "What are my payment options?";
        chatForm.dispatchEvent(new Event('submit'));
    });

    document.getElementById('renewalGuideLink').addEventListener('click', function(e) {
        e.preventDefault();
        userInput.value = "When does my policy renew?";
        chatForm.dispatchEvent(new Event('submit'));
    });

    // Document preview buttons
    document.getElementById('closeDocumentButton').addEventListener('click', function() {
        document.getElementById('documentPreview').style.display = 'none';
    });

    document.getElementById('downloadButton').addEventListener('click', function() {
        addBotMessage("I've generated a PDF of your policy documents. Check your downloads folder.");
        logDebug('Policy document download initiated');
        document.getElementById('documentPreview').style.display = 'none';
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    logDebug('DOM fully loaded, starting initialization');
    
    // Initialize the model
    initializeModel();
    
    // Set up event listeners
    setupEventListeners();
    
    logDebug('Application initialized successfully');
});