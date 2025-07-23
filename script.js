// Salesforce Service Cloud v2 CTI Integration
var sforce = sforce || {};
sforce.cti = sforce.cti || {};

/**
 * Constructs an XML payload from form parameters for Salesforce Service Cloud
 * @param {Object} parameters - Key-value pairs to include in the payload
 * @returns {string} - XML payload as a string
 */
function constructXMLPayload(parameters) {
    var sPayload = "<?xml version=\"1.0\" encoding=\"utf-8\"?><payload>";
    Object.entries(parameters).forEach(([key, value]) => {
        if (key === "Action" && value === "ACCEPT") {
            value = ""; // Leave Action empty for ACCEPT
        }
        if (value && value.trim() !== "") {
            sPayload += `<${key}>${value}</${key}>`;
        }
    });
    sPayload += "</payload>";
    console.log("Constructed Payload:", sPayload);
    return sPayload;
}

/**
 * Sends payload to Salesforce Service Cloud parent window
 * @param {Object} parameters - Form parameters
 */
function sendToSalesforce(parameters) {
    try {
        var payload = constructXMLPayload(parameters);
        
        // Display the payload first
        displayPayloadMessage(payload);
        
        // Send to Salesforce Service Cloud parent window
        if (window.parent && window.parent !== window) {
            // Method 1: PostMessage API (recommended for Service Cloud)
            window.parent.postMessage({
                type: 'CTI_EVENT',
                payload: payload,
                parameters: parameters
            }, '*');
            
            // Method 2: Direct Salesforce CTI API call (if available)
            if (window.parent.sforce && window.parent.sforce.cti) {
                window.parent.sforce.cti.onClickToDial(parameters);
            }
            
            console.log("Payload sent to Salesforce Service Cloud");
        } else {
            console.warn("No parent window found - running in standalone mode");
            alert("Payload constructed successfully (see console for details)");
        }
    } catch (error) {
        console.error("Error sending to Salesforce:", error);
        alert("Error: " + error.message);
    }
}

/**
 * Handles form submission and sends the payload to Salesforce
 * @param {Event} event - Form submission event
 */
function handleSendCall(event) {
    event.preventDefault();
    
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
    
    sendToSalesforce(parameters);
}

/**
 * Generates a random GUID and assigns it to the specified field
 * @param {string} fieldId - ID of the field to populate
 */
function generateRandomGUID(fieldId) {
    var guid = crypto.randomUUID().replace(/-/g, '').toUpperCase().substring(0, 35);
    document.getElementById(fieldId).value = guid;
}

/**
 * Resets the form and clears displayed messages
 */
function resetForm() {
    document.getElementById("callForm").reset();
    document.getElementById("payloadMessage").innerText = "";
}

/**
 * Displays the constructed XML payload
 * @param {string} payload - XML payload to display
 */
function displayPayloadMessage(payload) {
    var payloadDiv = document.getElementById("payloadMessage");
    payloadDiv.innerText = payload;
    payloadDiv.style.display = "block";
}
