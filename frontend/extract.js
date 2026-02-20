require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: ["@babel/plugin-transform-modules-commonjs"],
  ignore: [/node_modules/],
});

const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { convert } = require("html-to-text");
const XLSX = require("xlsx");

// Mock browser globals
global.window = {};
global.document = { createElement: () => ({ style: {} }) };

const faqList = require("./src/static/faq-content.js").default;
const impressumFn = require("./src/static/impressum-content.js").default;
const definitionObj = require("./src/static/definition-content.js").default;

function extractString(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val.trim();
  if (React.isValidElement(val)) {
    try {
      const html = ReactDOMServer.renderToStaticMarkup(val);
      return convert(html, {
        wordwrap: false,
        selectors: [{ selector: "a", options: { ignoreHref: true } }],
      }).trim();
    } catch (e) {
      console.error(e);
      return "Error extracting text";
    }
  }
  return String(val);
}

const faqRecords = [];
const impRecords = [];
const defRecords = [];

// 1. FAQ
const faqEn = faqList.en;
const faqDe = faqList.de;
const maxFaq = Math.max(faqEn.length, faqDe.length);
for (let i = 0; i < maxFaq; i++) {
  faqRecords.push({
    "Item Identifier": `FAQ Item ${i + 1}`,
    "EN Title": faqEn[i] ? extractString(faqEn[i].h) : "",
    "EN Content": faqEn[i] ? extractString(faqEn[i].c) : "",
    "DE Title": faqDe[i] ? extractString(faqDe[i].h) : "",
    "DE Content": faqDe[i] ? extractString(faqDe[i].c) : "",
  });
}

// 2. Impressum
const impEn = impressumFn(() => {}).en.list;
const impDe = impressumFn(() => {}).de.list;
const maxImp = Math.max(impEn.length, impDe.length);
for (let i = 0; i < maxImp; i++) {
  impRecords.push({
    "Item Identifier": `Impressum Section ${i + 1}`,
    "EN Title": impEn[i] ? extractString(impEn[i].h) : "",
    "EN Content": impEn[i] ? extractString(impEn[i].c) : "",
    "DE Title": impDe[i] ? extractString(impDe[i].h) : "",
    "DE Content": impDe[i] ? extractString(impDe[i].c) : "",
  });
}

// 3. Definitions
const defEn = definitionObj.en || [];
const defDe = definitionObj.de || [];
const defKeys = [
  ...new Set([...defEn.map((x) => x.i), ...defDe.map((x) => x.i)]),
];

for (const k of defKeys) {
  const enObj = defEn.find((x) => x.i === k);
  const deObj = defDe.find((x) => x.i === k);

  defRecords.push({
    "Item Identifier": k,
    "EN Title": enObj ? extractString(enObj.t) : "",
    "EN Content": enObj ? extractString(enObj.d) : "",
    "DE Title": deObj ? extractString(deObj.t) : "",
    "DE Content": deObj ? extractString(deObj.d) : "",
  });
}

const wb = XLSX.utils.book_new();

const faqWs = XLSX.utils.json_to_sheet(faqRecords);
XLSX.utils.book_append_sheet(wb, faqWs, "FAQ");

const impWs = XLSX.utils.json_to_sheet(impRecords);
XLSX.utils.book_append_sheet(wb, impWs, "Impressum");

const defWs = XLSX.utils.json_to_sheet(defRecords);
XLSX.utils.book_append_sheet(wb, defWs, "Definitions");

XLSX.writeFile(wb, "content-export.xlsx");
console.log("Successfully extracted contents to content-export.xlsx");

// Verification step
console.log("\n--- Verification ---");
const verificationWb = XLSX.readFile("content-export.xlsx");
console.log("Sheets created:", verificationWb.SheetNames.join(", "));

const expectedLengths = {
  FAQ: faqRecords.length,
  Impressum: impRecords.length,
  Definitions: defRecords.length,
};

for (const sheetName of verificationWb.SheetNames) {
  const ws = verificationWb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws);
  const expected = expectedLengths[sheetName];

  if (data.length === expected) {
    console.log(
      `✅ Sheet '${sheetName}' has ${data.length} records, matching expected script length.`,
    );
  } else {
    console.error(
      `❌ Sheet '${sheetName}' has ${data.length} records, but expected ${expected} records!`,
    );
  }
}
console.log("--------------------");

process.exit(0);
