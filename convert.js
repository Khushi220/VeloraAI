const XLSX = require("xlsx");
const fs = require("fs");

// Read Excel file
const workbook = XLSX.readFile("public/data/database.xlsx");

// Get first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(sheet);

// Save JSON file
fs.writeFileSync(
  "public/data/database.json",
  JSON.stringify(data, null, 2)
);

console.log("✅ Excel converted to JSON successfully!");