// SAP Service Cloud v2 CTI Integration - CORS Safe Version
console.log("SAP Service Cloud v2 CTI Widget Loading (CORS Safe)...");

/**
 * Initialize SAP Service Cloud v2 Integration (CORS Safe)
 */
function initializeSAPIntegration() {
    console.log("Initializing CORS-safe SAP Service Cloud v2 integration...");
    
    // Check if we're in an iframe (embedded in SAP)
    if (window.parent && window.parent !== window) {
        console.log("Running in iframe - SAP Service Cloud v2 environment detected");
        setupPhoneNumberLookup();
        setupSAPEventListeners();
        
        // Send initialization message to parent
        sendToParent({
            type: 'CTI_WIDGET_READY',
            provider: 'ZBM_TEST',
            timestamp: new Date().toISOString()
        });
    } else {
        console.log("Standalone mode - no parent window");
    }
}

/**
 * CORS-safe method to send messages to parent window
 * @param {Object} message - Message to send
 */
function sendToParent(message) {
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, '*');
            console.log("Message sent to parent:", message);
        } else {
            console.log("No parent window available");
        }
    } catch (error) {
        console.error("Error sending message to parent:", error);
    }
}

/**
 * Setup phone number lookup
 */
function setupPhoneNumberLookup() {
    const aniField = document.getElementById("ani");
    if (aniField) {
        console.log("Setting up ANI field listener");
        
        // Listen for phone number changes
        aniField.addEventListener('input', function() {
            const phoneNumber = this.value.trim();
            if (phoneNumber && phoneNumber.length >= 7) {
                console.log("Phone number entered:", phoneNumber);
                lookupContactInSAP(phoneNumber);
            }
        });
        
        // Also trigger on blur
        aniField.addEventListener('blur', function() {
            const phoneNumber = this.value.trim();
            if (phoneNumber && phoneNumber.length >= 7) {
                lookupContactInSAP(phoneNumber);
            }
        });
    }
}

/**
 * Lookup contact in SAP Service Cloud v2 (Enhanced for customer recognition)
 * @param {string} phoneNumber - Phone number to lookup
 */
function lookupContactInSAP(phoneNumber) {
    console.log("Looking up contact for phone:", phoneNumber);
    
    // Clean phone number (remove spaces, format consistently)
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    
    // Send multiple lookup message formats to ensure SAP recognizes it
    const lookupMessages = [
        // Standard CTI lookup
        {
            type: 'CTI_LOOKUP',
            action: 'SEARCH_CONTACT',
            ani: cleanPhone,
            provider: 'ZBM_TEST',
            timestamp: new Date().toISOString()
        },
        // SAP Service Cloud specific lookup
        {
            type: 'INBOUND_CALL',
            eventType: 'NOTIFY',
            ani: cleanPhone,
            provider: 'ZBM_TEST'
        },
        // Customer search by phone
        {
            type: 'CUSTOMER_LOOKUP',
            phoneNumber: cleanPhone,
            searchType: 'ANI'
        }
    ];
    
    // Send all lookup formats
    lookupMessages.forEach((message, index) => {
        setTimeout(() => {
            sendToParent(message);
            console.log(`Lookup message ${index + 1} sent:`, message);
        }, index * 200); // Small delay between messages
    });
}

/**
 * Setup event listeners for SAP Service Cloud responses
 */
function setupSAPEventListeners() {
    window.addEventListener('message', function(event) {
        console.log("Received message from parent:", event.data);
        
        if (event.data && event.data.type) {
            switch (event.data.type) {
                case 'CTI_CONTACT_FOUND':
                    console.log("Contact found:", event.data);
                    populateContactData(event.data.contact);
                    break;
                case 'CTI_CONTACT_NOT_FOUND':
                    console.log("Contact not found for ANI");
                    break;
                case 'CTI_ERROR':
                    console.error("CTI Error:", event.data.error);
                    break;
                case 'CTI_ACKNOWLEDGMENT':
                    console.log("SAP acknowledged message:", event.data);
                    break;
                default:
                    console.log("Unknown message type:", event.data.type);
            }
        }
    });
}

/**
 * Populate form with contact data from SAP
 * @param {Object} contact - Contact information
 */
function populateContactData(contact) {
    console.log("Populating contact data:", contact);
    
    if (contact.email) {
        document.getElementById("email").value = contact.email;
    }
    if (contact.name) {
        document.getElementById("subject").value = "Call with " + contact.name;
    }
    if (contact.account) {
        document.getElementById("text").value = "Account: " + contact.account;
    }
}

/**
 * Constructs XML payload EXACTLY like the demo (NO Provider, NO Timestamp)
 * @param {Object} parameters - Form parameters
 * @returns {string} - XML payload
 */
function constructSAPPayload(parameters) {
    var sPayload = "<?xml version=\"1.0\" encoding=\"utf-8\"?><payload>";
    
    // DEMO STYLE - NO Provider, NO Timestamp tags!
    
    Object.entries(parameters).forEach(([key, value]) => {
        if (key === "Action" && value === "ACCEPT") {
            value = ""; // Leave Action empty for ACCEPT
        }
        if (value && value.trim() !== "") {
            // Clean the value - remove extra spaces
            var cleanValue = value.trim();
            
            // For ANI field, ensure no spaces in phone numbers
            if (key === "ANI") {
                cleanValue = cleanValue.replace(/\s/g, '');
            }
            
            // Simple XML escaping (minimal, like demo)
            cleanValue = cleanValue
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
                
            sPayload += `<${key}>${cleanValue}</${key}>`;
        }
    });
    
    sPayload += "</payload>";
    console.log("DEMO-STYLE payload (no Provider/Timestamp):", sPayload);
    return sPayload;
}

/**
 * Send payload to SAP Service Cloud v2 (Enhanced with customer lookup)
 * @param {Object} parameters - Form parameters
 */
function sendToSAPServiceCloud(parameters) {
    console.log("Sending payload to SAP Service Cloud v2:", parameters);
    
    try {
        // First, trigger customer lookup if ANI is provided
        if (parameters.ANI && parameters.ANI.trim()) {
            console.log("Triggering customer lookup before sending payload...");
            lookupContactInSAP(parameters.ANI);
            
            // Wait a moment for lookup, then send the main payload
            setTimeout(() => {
                sendMainPayload(parameters);
            }, 1000);
        } else {
            // No ANI, send payload immediately
            sendMainPayload(parameters);
        }
        
    } catch (error) {
        console.error("Error in payload process:", error);
        showErrorMessage("Error: " + error.message);
    }
}

/**
 * Send the main CTI payload
 * @param {Object} parameters - Form parameters
 */
function sendMainPayload(parameters) {
    try {
        var payload = constructSAPPayload(parameters);
        
        // Display the payload
        displayPayloadMessage(payload);
        
        // SAP Service Cloud v2 specific message (CORS Safe)
        const sapMessage = {
            type: 'CTI_EVENT',
            action: parameters.Action,
            eventType: parameters.EventType,
            provider: 'ZBM_TEST',
            payload: payload,
            parameters: parameters,
            timestamp: new Date().toISOString(),
            widgetSource: 'https://magidbaruch.github.io/my-website/'
        };
        
        // Send using CORS-safe PostMessage
        sendToParent(sapMessage);
        
        // Show success message
        setTimeout(() => {
            console.log("Payload successfully sent to SAP Service Cloud v2");
            showSuccessMessage("Payload sent to SAP Service Cloud v2!");
        }, 500);
        
    } catch (error) {
        console.error("Error sending main payload:", error);
        showErrorMessage("Error: " + error.message);
    }
}

/**
 * Show success message in the UI
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    const payloadDiv = document.getElementById("payloadMessage");
    const originalContent = payloadDiv.innerText;
    
    payloadDiv.style.backgroundColor = "#d4edda";
    payloadDiv.style.color = "#155724";
    payloadDiv.innerText = message;
    
    // Restore original content after 3 seconds
    setTimeout(() => {
        payloadDiv.style.backgroundColor = "#e8e8e8";
        payloadDiv.style.color = "#333";
        payloadDiv.innerText = originalContent;
    }, 3000);
}

/**
 * Show error message in the UI
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    const payloadDiv = document.getElementById("payloadMessage");
    payloadDiv.style.backgroundColor = "#f8d7da";
    payloadDiv.style.color = "#721c24";
    payloadDiv.innerText = message;
}

/**
 * Handle form submission
 * @param {Event} event - Form submission event
 */
function handleSendCall(event) {
    event.preventDefault();
    console.log("Form submitted");
    
    var parameters = {
        Type: document.getElementById("type").value,
        EventType: document.getElementById("eventType").value,
        Action: document.getElementById("action").value,
        ANI: document.getElementById("ani").value,
        Email: document.getElementById("email").value || "",
        Subject: document.getElementById("subject").value || "",
        Text: document.getElementById("text").value || "",
        Transcript: document.getElementById("transcript").value || "",
        ExternalReferenceID: document.getElementById("externalReferenceID").value || "",
        RecordingId: document.getElementById("recordingId").value || "",
        ExternalOriginalReferenceID: document.getElementById("externalOriginalReferenceID").value || "",
        CustomField1: document.getElementById("customField1").value || "",
        CustomField2: document.getElementById("customField2").value || "",
        CustomField3: document.getElementById("customField3").value || "",
        CustomField4: document.getElementById("customField4").value || ""
    };
    
    console.log("Parameters:", parameters);
    sendToSAPServiceCloud(parameters);
}

/**
 * Manual customer lookup triggered by button
 */
function manualLookup() {
    const phoneNumber = document.getElementById("ani").value.trim();
    if (phoneNumber) {
        console.log("Manual lookup triggered for:", phoneNumber);
        lookupContactInSAP(phoneNumber);
        
        // Visual feedback
        const button = event.target;
        const originalText = button.innerText;
        button.innerText = "Looking up...";
        button.disabled = true;
        
        setTimeout(() => {
            button.innerText = originalText;
            button.disabled = false;
        }, 3000);
    } else {
        alert("Please enter a phone number first");
    }
}

/**
 * Generate random GUID
 * @param {string} fieldId - Field ID to populate
 */
function generateRandomGUID(fieldId) {
    var guid = crypto.randomUUID().replace(/-/g, '').toUpperCase().substring(0, 35);
    document.getElementById(fieldId).value = guid;
    console.log("Generated GUID for", fieldId, ":", guid);
}

/**
 * Reset form
 */
function resetForm() {
    document.getElementById("callForm").reset();
    document.getElementById("payloadMessage").innerText = "";
    console.log("Form reset");
}

/**
 * Display payload message
 * @param {string} payload - XML payload to display
 */
function displayPayloadMessage(payload) {
    var payloadDiv = document.getElementById("payloadMessage");
    payloadDiv.innerText = payload;
    payloadDiv.style.display = "block";
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - initializing CORS-safe SAP integration");
    initializeSAPIntegration();
});

// Prevent CORS errors by avoiding direct parent window property access
console.log("CORS-safe widget loaded successfully");
