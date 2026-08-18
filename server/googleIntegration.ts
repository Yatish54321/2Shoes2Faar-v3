/**
 * Google Form & Google Apps Script Integration Service
 * 
 * Provides:
 * - Real-time onFormSubmit(e) webhook trigger
 * - syncGoogleFormToWebsite() manual historical backfill sync function (no arguments needed)
 * - Dynamic Apps Script (.gs) generator tailored with the current App URL & webhook secret
 * - Automated normalization of Google Form headers
 */

export function generateGoogleAppsScript(appUrl: string, webhookSecret: string): string {
  const targetUrl = `${appUrl.replace(/\/+$/, '')}/api/integrations/google-form/webhook`;

  return `/**
 * ============================================================================
 * 2SHOES2FAAR — GOOGLE FORM & GOOGLE SHEET TO WEBSITE SYNCHRONIZATION SCRIPT
 * ============================================================================
 * Target Form: https://forms.gle/Nj13LtV9ATqHt8EJA
 * Destination Webhook: ${targetUrl}
 * 
 * INSTRUCTIONS:
 * 1. Open the Google Sheet linked to your Google Form.
 * 2. Click Extensions > Apps Script.
 * 3. Replace the code in Code.gs with THIS ENTIRE SCRIPT.
 * 4. Click Save.
 * 
 * --- HOW TO RUN HISTORICAL BACKFILL SYNC ---
 * 1. Select "syncGoogleFormToWebsite" from the function dropdown at the top.
 * 2. Click "Run" (no event parameters needed).
 * 3. View the "Execution log" at the bottom to see row-by-row status and final summary.
 * 4. IDEMPOTENT: You can run it anytime without creating duplicates.
 * 
 * --- HOW TO ENABLE REAL-TIME SYNC FOR FUTURE SUBMISSIONS ---
 * 1. Click Triggers (alarm clock icon on the left).
 * 2. Click "+ Add Trigger":
 *    - Function: onFormSubmit
 *    - Deployment: Head
 *    - Event source: From spreadsheet
 *    - Event type: On form submit
 * 3. Save and authorize when prompted.
 * ============================================================================
 */

var SUPPORTER_WEBHOOK_URL = "${targetUrl}";
var SUPPORTER_WEBHOOK_SECRET = "${webhookSecret}";
var BACKEND_WEBHOOK_URL = SUPPORTER_WEBHOOK_URL;
var WEBHOOK_SECRET = SUPPORTER_WEBHOOK_SECRET;

/**
 * Finds the Google Form response sheet tab in the spreadsheet.
 */
function getFormResponsesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();

  // Look for sheets named "Form Responses", "Form Responses 1", etc.
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName().toLowerCase();
    if (name.indexOf("form response") !== -1 || name.indexOf("form responses") !== -1 || name.indexOf("responses") !== -1) {
      return sheets[i];
    }
  }

  // Fallback to active sheet or first sheet
  return ss.getActiveSheet() || sheets[0];
}

/**
 * MANUAL HISTORICAL BACKFILL SYNC:
 * Reads every existing row in the linked Google Sheet (from Row 2 to the last row),
 * normalizes each record, and sends it to the website backend.
 * Takes NO parameters and runs standalone.
 */
function syncGoogleFormToWebsite() {
  try {
    var sheet = getFormResponsesSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (lastRow < 2) {
      Logger.log("=== HISTORICAL GOOGLE FORM SYNC STARTED ===");
      Logger.log("Sheet name: " + sheet.getName());
      Logger.log("Total data rows: 0 (No response rows found).");
      Logger.log("=== HISTORICAL SYNC SUMMARY ===");
      Logger.log("Total rows: 0");
      Logger.log("Valid responses: 0");
      Logger.log("Imported: 0");
      Logger.log("Already existing: 0");
      Logger.log("Failed: 0");
      return;
    }

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    var totalRows = dataRange.length;
    var validResponses = 0;
    var imported = 0;
    var alreadyExisting = 0;
    var failed = 0;

    Logger.log("=== HISTORICAL GOOGLE FORM SYNC STARTED ===");
    Logger.log("Sheet name: " + sheet.getName());
    Logger.log("Total data rows: " + totalRows);

    for (var r = 0; r < dataRange.length; r++) {
      var rowNumber = r + 2;
      var rowValues = dataRange[r];
      var rowData = {};

      for (var c = 0; c < headers.length; c++) {
        var headerKey = String(headers[c] || "").trim();
        if (headerKey) {
          rowData[headerKey] = rowValues[c];
        }
      }

      var payload = parseRowToPayload(rowData);

      // Skip completely empty rows
      if (!payload.fullName && !payload.email) {
        continue;
      }

      validResponses++;

      try {
        var options = {
          method: "post",
          contentType: "application/json",
          headers: {
            "x-webhook-secret": SUPPORTER_WEBHOOK_SECRET,
            "x-source": "google-apps-script-historical-sync"
          },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        };

        var response = UrlFetchApp.fetch(SUPPORTER_WEBHOOK_URL, options);
        var responseCode = response.getResponseCode();
        var responseBody = response.getContentText();

        var resultStatus = "FAILED";
        if (responseCode === 200) {
          var resJson = {};
          try {
            resJson = JSON.parse(responseBody);
          } catch (jsonErr) {}

          if (resJson.action === "imported" || resJson.isNew === true) {
            imported++;
            resultStatus = "IMPORTED";
          } else {
            alreadyExisting++;
            resultStatus = "ALREADY EXISTS";
          }
        } else {
          failed++;
          resultStatus = "FAILED (" + responseBody + ")";
        }

        Logger.log("[ROW " + rowNumber + "]");
        Logger.log("Name: " + (payload.fullName || "N/A"));
        Logger.log("Email: " + (payload.email || "N/A"));
        Logger.log("HTTP status: " + responseCode);
        Logger.log("Result: " + resultStatus);

      } catch (rowError) {
        failed++;
        Logger.log("[ROW " + rowNumber + "]");
        Logger.log("Name: " + (payload.fullName || "N/A"));
        Logger.log("Email: " + (payload.email || "N/A"));
        Logger.log("HTTP status: ERROR");
        Logger.log("Result: FAILED - " + rowError.toString());
      }
    }

    Logger.log("=== HISTORICAL SYNC SUMMARY ===");
    Logger.log("Total rows: " + totalRows);
    Logger.log("Valid responses: " + validResponses);
    Logger.log("Imported: " + imported);
    Logger.log("Already existing: " + alreadyExisting);
    Logger.log("Failed: " + failed);

  } catch (err) {
    Logger.log("Fatal error in syncGoogleFormToWebsite: " + err.toString());
  }
}

/**
 * Backwards compatibility alias
 */
function syncAllExistingFormResponses() {
  return syncGoogleFormToWebsite();
}

/**
 * Web App GET handler:
 * Triggered whenever the Web App URL (https://script.google.com/macros/s/.../exec) is requested.
 * Automatically runs the sync and also returns the raw responses as JSON.
 */
function doGet(e) {
  try {
    var sheet = getFormResponsesSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (lastRow < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "No data rows in sheet",
        count: 0,
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var allPayloads = [];

    for (var r = 0; r < dataRange.length; r++) {
      var rowValues = dataRange[r];
      var rowData = {};
      for (var c = 0; c < headers.length; c++) {
        var headerKey = String(headers[c] || "").trim();
        if (headerKey) {
          rowData[headerKey] = rowValues[c];
        }
      }
      var payload = parseRowToPayload(rowData);
      if (payload.fullName || payload.email) {
        allPayloads.push(payload);
      }
    }

    // Trigger historical sync to backend in background
    try {
      syncGoogleFormToWebsite();
    } catch (syncErr) {
      Logger.log("doGet background sync error: " + syncErr.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Synced " + allPayloads.length + " responses from Google Sheet",
      count: allPayloads.length,
      responses: allPayloads
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Web App POST handler:
 * Triggered when the Website forwards a new supporter pre-order to the Google Sheet.
 * Appends the new submission row directly into the linked Google Sheet.
 */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var sheet = getFormResponsesSheet();
    var lastCol = Math.max(sheet.getLastColumn(), 1);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // If sheet has no headers yet, initialize default Google Form headers
    if (!headers || headers.length === 0 || !headers[0]) {
      headers = [
        "Timestamp",
        "Your Full Name",
        "Email Address",
        "WhatsApp Number",
        "Instagram Handle",
        "City",
        "State",
        "PIN Code",
        "Complete Address For Book Delivery with Area, City, State, PIN Code",
        'What Makes you "TRAVEL"',
        "Add your Best Travel Pic Featuring You",
        "PAYMENT PROOF",
        "Would you like to Get Featured in the book?",
        "UPI Transaction / UTR Number"
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      lastCol = headers.length;
    }

    // Build row matching headers
    var newRow = [];
    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c] || "").toLowerCase();
      if (h.indexOf("time") !== -1 || h.indexOf("date") !== -1) {
        newRow.push(data.timestamp || new Date().toLocaleString());
      } else if (h.indexOf("name") !== -1) {
        newRow.push(data.fullName || "");
      } else if (h.indexOf("email") !== -1) {
        newRow.push(data.email || "");
      } else if (h.indexOf("whatsapp") !== -1 || h.indexOf("phone") !== -1 || h.indexOf("mobile") !== -1) {
        newRow.push(data.whatsappNumber || "");
      } else if (h.indexOf("insta") !== -1 || h.indexOf("handle") !== -1) {
        newRow.push(data.instagramHandle || "");
      } else if (h.indexOf("city") !== -1 || h.indexOf("town") !== -1) {
        newRow.push(data.city || "");
      } else if (h.indexOf("state") !== -1) {
        newRow.push(data.state || "");
      } else if (h.indexOf("pin") !== -1 || h.indexOf("zip") !== -1) {
        newRow.push(data.pinCode || "");
      } else if (h.indexOf("address") !== -1 || h.indexOf("delivery") !== -1) {
        newRow.push(data.deliveryAddress || "");
      } else if (h.indexOf("travel") !== -1 || h.indexOf("quote") !== -1 || h.indexOf("philosoph") !== -1) {
        newRow.push(data.travelPhilosophy || data.travelComment || "");
      } else if (h.indexOf("pic") !== -1 || h.indexOf("photo") !== -1) {
        newRow.push(data.photoUrl || "");
      } else if (h.indexOf("payment") !== -1 || h.indexOf("proof") !== -1 || h.indexOf("screenshot") !== -1) {
        newRow.push(data.paymentProofUrl || data.paymentRefNumber || "");
      } else if (h.indexOf("feature") !== -1) {
        newRow.push(data.featuredPreference ? "Yes, feature me on India map" : "No, only pre-order book");
      } else if (h.indexOf("utr") !== -1 || h.indexOf("ref") !== -1 || h.indexOf("transaction") !== -1) {
        newRow.push(data.paymentRefNumber || "");
      } else {
        newRow.push("");
      }
    }

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Row appended successfully to Google Sheet",
      row: newRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Triggered automatically every time a new Google Form response is submitted in real-time
 */
function onFormSubmit(e) {
  try {
    var rawData = {};
    
    // Extract from Named Values if available
    if (e && e.namedValues) {
      for (var key in e.namedValues) {
        rawData[key.trim()] = e.namedValues[key][0];
      }
    } else {
      // Fallback: Read latest row from sheet
      var sheet = getFormResponsesSheet();
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var lastRowValues = sheet.getRange(sheet.getLastRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
      for (var i = 0; i < headers.length; i++) {
        rawData[String(headers[i]).trim()] = lastRowValues[i];
      }
    }

    Logger.log("Parsed Real-Time Form Data: " + JSON.stringify(rawData));

    var payload = parseRowToPayload(rawData);

    if (!payload.email && !payload.fullName) {
      Logger.log("Skipping submission: missing both name and email");
      return;
    }

    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-webhook-secret": SUPPORTER_WEBHOOK_SECRET,
        "x-source": "google-apps-script-realtime"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(SUPPORTER_WEBHOOK_URL, options);
    var responseCode = response.getResponseCode();
    var responseBody = response.getContentText();

    Logger.log("Real-time Webhook response [" + responseCode + "]: " + responseBody);
  } catch (err) {
    Logger.log("Error in onFormSubmit: " + err.toString());
  }
}

/**
 * Normalizes Google Form question column names to standard backend payload keys
 */
function parseRowToPayload(rawData) {
  return {
    timestamp: extractValue(rawData, ["Timestamp", "Date", "Time"]) || new Date().toISOString(),
    fullName: extractValue(rawData, ["Your Full Name", "Full Name", "Name", "Your Name", "Full name"]),
    email: extractValue(rawData, ["Email Address", "Email", "Email ID", "Your Email", "Email address"]),
    whatsappNumber: extractValue(rawData, ["WhatsApp Number", "WhatsApp", "Phone Number", "Contact Number", "Mobile", "Phone"]),
    instagramHandle: extractValue(rawData, ["Insta Handle", "Instagram Handle", "Instagram", "Insta", "IG Handle", "IG"]),
    city: extractValue(rawData, ["City", "Town", "Current City", "Your City"]),
    state: extractValue(rawData, ["State / state information", "State", "State / Union Territory", "Province", "Region"]),
    pinCode: extractValue(rawData, ["PIN Code", "Pincode", "Zip Code", "Postal Code", "PIN"]),
    featuredPreference: extractValue(rawData, [
      "Would you like to Get Featured in the book?",
      "Featured preference",
      "Do you want to be featured on the India Mosaic?",
      "Featured on India map",
      "Feature preference",
      "Would you like to be featured on the Living India Mosaic?"
    ]),
    travelPhilosophy: extractValue(rawData, [
      'What Makes you "TRAVEL"',
      "What Makes you TRAVEL",
      "What makes you travel?",
      "Why do you travel?",
      "Travel Philosophy",
      "Travel quote",
      "Your travel story"
    ]),
    deliveryAddress: extractValue(rawData, [
      "Complete Address For Book Delivery with Area, City, State, PIN Code",
      "Complete delivery address",
      "Delivery Address",
      "Shipping Address",
      "Address for book delivery",
      "Postal Address"
    ]),
    photoUrl: extractValue(rawData, [
      "Add your Best Travel Pic Featuring You",
      "Travel photograph",
      "Upload your travel photograph",
      "Photo",
      "Upload Photo",
      "Profile / Travel Photo"
    ]),
    paymentProofUrl: extractValue(rawData, [
      "PAYMENT PROOF",
      "Payment proof",
      "Upload payment screenshot",
      "Payment Screenshot",
      "UPI Transaction Proof",
      "Transaction ID / Screenshot"
    ])
  };
}

/**
 * Helper to match keys case-insensitively with exact, punctuation-normalized, and fuzzy fallback
 */
function extractValue(data, candidateKeys) {
  if (!data || typeof data !== "object") return "";

  function cleanKey(k) {
    return String(k || "").toLowerCase().replace(/["'“”‘’?!:,\-_/]/g, "").replace(/\\s+/g, " ").trim();
  }

  // Pass 1: Direct key match
  for (var i = 0; i < candidateKeys.length; i++) {
    var cKey = candidateKeys[i];
    if (data[cKey] !== undefined && data[cKey] !== null && String(data[cKey]).trim() !== "") {
      return String(data[cKey]).trim();
    }
  }

  // Pass 2: Case-insensitive trimmed match
  for (var i2 = 0; i2 < candidateKeys.length; i2++) {
    var target = String(candidateKeys[i2]).toLowerCase().trim();
    for (var key in data) {
      if (key && key.toLowerCase().trim() === target) {
        var val = data[key];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          return String(val).trim();
        }
      }
    }
  }

  // Pass 3: Cleaned normalized alphanumeric match
  for (var i3 = 0; i3 < candidateKeys.length; i3++) {
    var cleanTarget = cleanKey(candidateKeys[i3]);
    for (var dKey in data) {
      if (dKey && cleanKey(dKey) === cleanTarget) {
        var cVal = data[dKey];
        if (cVal !== undefined && cVal !== null && String(cVal).trim() !== "") {
          return String(cVal).trim();
        }
      }
    }
  }

  // Pass 4: Substring match
  for (var j = 0; j < candidateKeys.length; j++) {
    var subCandidate = cleanKey(candidateKeys[j]);
    if (subCandidate.length < 3) continue;
    for (var sKey in data) {
      if (sKey && cleanKey(sKey).indexOf(subCandidate) !== -1) {
        var sVal = data[sKey];
        if (sVal !== undefined && sVal !== null && String(sVal).trim() !== "") {
          return String(sVal).trim();
        }
      }
    }
  }

  return "";
}
`;
}

