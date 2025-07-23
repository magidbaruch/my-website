// Define the global c4c object for CTI integration
var c4c = c4c || {};
c4c.cti = c4c.cti || {};
c4c.cti.integration = function () { };

/**
 * Constructs an XML payload from form parameters
 *  {Object} parameters - Key-value pairs to include in the payload
 * @returns {string} - XML payload as a string
 */
c4c.cti.integration.prototype._formXMLPayload = function (parameters) {
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
};

/**
 * Handles form submission and sends the payload to the parent window
 *  {Event} event - Form submission event
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
        ExternalReferenceID: document.getElementById("externalReferenceID").value || "",
        RecordingId: document.getElementById("recordingId").value || ""
    };

    var integration = new c4c.cti.integration();
    integration.sendIncomingCalltoC4C(parameters);
}

/**
 * Generates a random GUID and assigns it to the specified field
 *  {string} fieldId - ID of the field to populate
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
 *  {string} payload - XML payload to display
 */
function displayPayloadMessage(payload) {
    var payloadDiv = document.getElementById("payloadMessage");
    payloadDiv.innerText = payload;
    payloadDiv.style.display = "block";
}