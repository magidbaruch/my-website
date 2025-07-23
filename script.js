// SAP Service Cloud v2 CTI Integration - ZBM Provider
console.log("SAP Service Cloud v2 CTI Widget Loading...");

// Initialize SAP Service Cloud integration
var SAPServiceCloud = SAPServiceCloud || {};
SAPServiceCloud.cti = SAPServiceCloud.cti || {};

/**
 * Initialize SAP Service Cloud v2 Integration
 */
function initializeSAPIntegration() {
    console.log("Initializing SAP Service Cloud v2 integration...");
    
    // Check if we're running inside SAP Service Cloud
    if (window.parent && window.parent !== window) {
        console.log("Parent window detected - SAP Service Cloud v2 environment");
        setupPhoneNumberLookup();
        setupSAPEventListeners();
    } else {
        console.log("Standalone mode - no parent window");
    }
}

/**
 * Setup phone number lookup for SAP Service Cloud
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
        
        // Also trigger on blur (when user clicks away)
        aniField.addEventListener('blur', function() {
            const phoneNumber = this.value.trim();
            if (phoneNumber && phoneNumber.length >= 7) {
                lookupContactInSAP(phoneNumber);
            }
        });
    }
}

/**
 * Lookup contact in SAP Service Cloud v2
 * @param {string} phoneNumber - Phone number to lookup
 */
function lookupContactInSAP(phoneNumber) {
    console.log("Looking up contact for phone:", phoneNumber);
    
    try {
        // SAP Service Cloud v2 specific lookup message
        const lookupMessage = {
            type: 'CTI_LOOKUP',
            action: 'SEARCH_CONTACT',
            ani: phoneNumber,
            provider: 'ZBM_TEST',
            timestamp: new Date().toISOString()
        };
        
        // Send to parent SAP window
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage(lookupMessage, '*');
            console.log("Lookup message sent to SAP:", lookupMessage);
        }
        
        // Also try SAP specific methods if available
        if (window.parent.SAPServiceCloud) {
            window.parent.SAPServiceCloud.lookupContact(phoneNumber);
        }
        
    } catch (error) {
        console.error("Error during SAP contact lookup:", error);
    }
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
                    console.log("Contact not found");
                    break;
                case 'CTI_ERROR':
                    console.error("CTI Error:", event.data.error);
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
 * Constructs XML payload for SAP Service Cloud v2
 * @param {Object} parameters - Form parameters
 * @returns {string} - XML payload
 */
function constructSAPPayload(parameters) {
    var sPayload = "<?xml version=\"1.0\" encoding=\"utf-8\"?><payload>";
    
    // Add provider information
    sPayload += "<Provider>ZBM_TEST</Provider>";
    sPayload += "<Timestamp>" + new Date().toISOString() + "</Timestamp>";
    
    Object.entries(parameters).forEach(([key, value]) => {
        if (key === "Action" && value === "ACCEPT") {
            value = ""; // Leave Action empty for ACCEPT
        }
        if (value && value.trim() !== "") {
            sPayload += `<${key}>${value}</${key}>`;
        }
    });
    
    sPayload += "</payload>";
    console.log("SAP Payload constructed:", sPayload);
    return sPayload;
}

/**
 * Send payload to SAP Service Cloud v2
 * @param {Object} parameters - Form parameters
 */
function sendToSAPServiceCloud(parameters) {
    console.log("Sending payload to SAP Service Cloud v2:", parameters);
    
    try {
        var payload = constructSAPPayload(parameters);
        
        // Display the payload
        displayPayloadMessage(payload);
        
        // SAP Service Cloud v2 specific message
        const sapMessage = {
            type: 'CTI_EVENT',
            action: parameters.Action,
            eventType: parameters.EventType,
            provider: 'ZBM_TEST',
            payload: payload,
            parameters: parameters,
            timestamp: new Date().toISOString()
        };
        
        // Send to parent SAP window
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(sapMessage, '*');
            console.log("Message sent to SAP Service Cloud:", sapMessage);
            
            // Show success message
            setTimeout(() => {
                alert("Payload sent to SAP Service Cloud v2 successfully!");
            }, 500);
        } else {
            console.warn("No parent window - standalone mode");
            alert("Running in standalone mode. Payload constructed successfully.");
        }
        
    } catch (error) {
        console.error("Error sending to SAP Service Cloud:", error);
        alert("Error: " + error.message);
    }
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
    console.log("DOM loaded - initializing SAP integration");
    initializeSAPIntegration();
});

// Also try to initialize immediately
initializeSAPIntegration();
