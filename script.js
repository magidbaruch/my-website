// SAP Service Cloud v2 CTI Integration - Based on Official SAP Documentation
console.log("SAP Service Cloud v2 CTI Widget Loading (Official Pattern)...");

// Define the global object for Service Cloud v2 CTI integration (adapted from C4C)
var servicecloud = servicecloud || {};
servicecloud.cti = servicecloud.cti || {};
servicecloud.cti.integration = function () { };

/**
 * Construct the payload in XML format (Official SAP Method - Adapted for Service Cloud v2)
 * @param {Object} parameters - Key-value pairs for the payload
 * @returns {string} payload in xml format
 * @private
 */
servicecloud.cti.integration.prototype._formXMLPayload = function(parameters){
    var sPayload = "<?xml version='1.0' encoding='utf-8' ?><payload>";
    for(var key in parameters){
        if(parameters[key] && parameters[key].toString().trim() !== ""){
            var tag = "<" + key + ">" + parameters[key] + "</" + key + ">";
            sPayload = sPayload + tag;
        }
    }
    sPayload = sPayload + "</payload>";
    console.log("Official SAP payload constructed:", sPayload);
    return sPayload;
};

/**
 * Send information to Service Cloud v2 (Adapted from C4C method)
 * @param {Object} parameters - Form parameters
 */
servicecloud.cti.integration.prototype.sendIncomingCalltoServiceCloud = function (parameters) {
    console.log("Sending to Service Cloud v2 using official SAP method:", parameters);
    var payload = this._formXMLPayload(parameters);
    this._doCall(payload);
};

/**
 * Post to parent window (Official SAP Method)
 * @param {string} sPayload - XML payload to send
 * @private
 */
servicecloud.cti.integration.prototype._doCall = function (sPayload) {
    console.log("Official SAP _doCall method - sending to parent:", sPayload);
    try {
        window.parent.postMessage(sPayload, "*");
        console.log("Message sent successfully via official SAP method");
    } catch (error) {
        console.error("Error in official SAP _doCall method:", error);
    }
};

/**
 * Initialize Service Cloud v2 Integration
 */
function initializeServiceCloudIntegration() {
    console.log("Initializing Service Cloud v2 integration (official SAP pattern)...");
    
    if (window.parent && window.parent !== window) {
        console.log("Running in Service Cloud v2 environment");
        setupPhoneNumberLookup();
        setupServiceCloudEventListeners();
    } else {
        console.log("Standalone mode - no parent window");
    }
}

/**
 * Setup phone number lookup for customer search
 */
function setupPhoneNumberLookup() {
    const aniField = document.getElementById("ani");
    if (aniField) {
        console.log("Setting up ANI field for customer lookup");
        
        aniField.addEventListener('blur', function() {
            const phoneNumber = this.value.trim();
            if (phoneNumber && phoneNumber.length >= 7) {
                console.log("ANI field blur - looking up customer:", phoneNumber);
                lookupCustomer(phoneNumber);
            }
        });
    }
}

/**
 * Lookup customer using Service Cloud v2 pattern
 * @param {string} phoneNumber - Phone number to lookup
 */
function lookupCustomer(phoneNumber) {
    console.log("Looking up customer in Service Cloud v2:", phoneNumber);
    
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    
    // Create integration instance
    var integration = new servicecloud.cti.integration();
    
    // Send lookup call using official SAP pattern
    const lookupParameters = {
        Type: 'CALL',
        EventType: 'INBOUND',
        Action: 'NOTIFY',
        ANI: cleanPhone
    };
    
    console.log("Sending customer lookup with official SAP method");
    integration.sendIncomingCalltoServiceCloud(lookupParameters);
}

/**
 * Setup event listeners for Service Cloud responses
 */
function setupServiceCloudEventListeners() {
    window.addEventListener('message', function(event) {
        console.log("Received message from Service Cloud parent:", event.data);
        
        // Handle responses from Service Cloud
        if (event.data && typeof event.data === 'object') {
            if (event.data.type === 'CUSTOMER_FOUND') {
                console.log("Customer found:", event.data);
                populateCustomerData(event.data.customer);
            }
        }
    });
}

/**
 * Populate form with customer data
 * @param {Object} customer - Customer information
 */
function populateCustomerData(customer) {
    console.log("Populating customer data:", customer);
    
    if (customer.email) {
        document.getElementById("email").value = customer.email;
    }
    if (customer.name) {
        document.getElementById("subject").value = "Call with " + customer.name;
    }
}

/**
 * Handle form submission using official SAP method
 * @param {Event} event - Form submission event
 */
function handleSendCall(event) {
    event.preventDefault();
    console.log("Form submitted - using official SAP integration method");
    
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
    
    console.log("Parameters for official SAP method:", parameters);
    
    // Use official SAP integration method
    var integration = new servicecloud.cti.integration();
    integration.sendIncomingCalltoServiceCloud(parameters);
    
    // Display payload for debugging
    var payload = integration._formXMLPayload(parameters);
    displayPayloadMessage(payload);
    
    // Show success message
    setTimeout(() => {
        showSuccessMessage("Payload sent using official SAP method!");
    }, 500);
}

/**
 * Manual customer lookup triggered by button
 */
function manualLookup() {
    const phoneNumber = document.getElementById("ani").value.trim();
    if (phoneNumber) {
        console.log("Manual lookup triggered with official SAP method:", phoneNumber);
        lookupCustomer(phoneNumber);
        
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - initializing official SAP Service Cloud v2 integration");
    initializeServiceCloudIntegration();
});

console.log("Official SAP Service Cloud v2 CTI integration loaded successfully");
