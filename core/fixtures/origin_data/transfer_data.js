"use strict";
// eslint-disable-next-line
const XLSX = require("xlsx");
// eslint-disable-next-line
const path = require("path");
// eslint-disable-next-line
const fs = require("fs");

const workbook = XLSX.readFile(path.join(__dirname, "data.xlsx"));
// eslint-disable-next-line
const first_sheet_name = workbook.SheetNames[0];
const worksheet = workbook.Sheets[first_sheet_name];

const data = XLSX.utils.sheet_to_json(worksheet);

fs.writeFileSync(path.join(__dirname, "../heros.json"), JSON.stringify(data, null, 2));
