"use strict";
// eslint-disable-next-line
const XLSX = require("xlsx");
// eslint-disable-next-line
const path = require("path");
// eslint-disable-next-line
const fs = require("fs");

const workbook = XLSX.readFile(path.join(__dirname, "阴阳师式神信息表V3.1.6.xlsx"));
// eslint-disable-next-line
const first_sheet_name = workbook.SheetNames[0];
const worksheet = workbook.Sheets[first_sheet_name];

const data = XLSX.utils.sheet_to_json(worksheet);
const heros = require(path.join(__dirname, "../heros.json"));

heros.forEach(hero => {
    const matched = data.find((d) => d['名称'] === hero.name);
    hero.name_jp = '';
    hero.name_en = '';
    hero.name_roma = '';
    hero.name_kana = '';

    hero.id = 0;

    if (matched) {
        hero.name_jp = matched.__EMPTY_1 || '';
        hero.name_kana = matched.__EMPTY_2 || '';
        hero.name_roma = matched.__EMPTY_3 || '';
        hero.name_en = matched.__EMPTY_4 || '';
        hero.id = Number(matched.ID) || 0;
    }

});

console.log( JSON.stringify(heros, null, 2));
fs.writeFileSync(path.join(__dirname, "../heros.json"), JSON.stringify(heros, null, 2));