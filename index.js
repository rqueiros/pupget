const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Init and output data object
let pupgetInitData = {},
  pupgetOutputData = {};

// Starts scraping
//process.argv[2] ? readFromStdin() : scrape().catch(console.error);

/**
 * Verifies if the JSON file was passed through standard input
 */
function readFromStdin() {
  fs.readFile(process.argv[2], async (err, data) => {
    if (err) throw err;
    pupgetInitData = await JSON.parse(data);
    scrape().catch(console.error);
  });
}

function readFromFile(file) {
  fs.readFile(file, async (err, data) => {
    if (err) throw err;
    pupgetInitData = await JSON.parse(data);
    scrape().catch(console.error);
  });
}

/**
 * Read a JSON text with a valid pupget JSON and fed the main pupget object
 * @param {string} jsonText a valid pupget JSON file
 */
function readFromInnerJson(jsonText) {
  pupgetInitData = JSON.parse(jsonText);
}

/**
 * Creates the output folder
 * @param {string} folder the name of the folder
 */
function createOutputFolder(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}

/**
 * This function will be executed inside the page
 * @param {string} selector
 * @returns CSS selector to use in the DOM query
 */
function myPageFunction(selector) {
  // Find the first thing matching our selector on the page
  const elementNode = document.querySelector(selector);
  // Get the element's innerHTML
  const html = elementNode.innerHTML;
  // Return the innerHTML to the code running in Node
  return html;
}

/**
 * Main function
 */
async function scrape() {
  // Create main results folder
  createOutputFolder(pupgetInitData.output.folder);
  // Create the browser
  const browser = await puppeteer.launch();
  // Main scraping
  try {
    // Create a new page (tab) in the browser
    const page = await browser.newPage();
    // Go to base page
    await page.goto(pupgetInitData.base_page);
    // Main steps cycle
    for (const step of pupgetInitData.steps) {
      if (step.query.results) {
        const hrefs = await page.$$eval(step.query.query, (links) =>
          links.map((a) => a.href)
        );
        let id = 0;
        for (const href of hrefs) {
          pupgetOutputData = { [step.query.output_field]: {} };
          const page = await browser.newPage();
          await page.goto(href);
          const pupgetRoot = pupgetOutputData[step.query.output_field];
          for (const field of step.query.results) {
            pupgetRoot[field.output_field] = await page.evaluate(
              myPageFunction,
              field.query
            );
          }
          // Save file
          fs.writeFileSync(
            path.join(
              __dirname,
              pupgetInitData.output.folder,
              `${pupgetInitData.output.filename}${id++}.json`
            ),
            JSON.stringify(pupgetOutputData)
          );
        }
      }
    }
    // Catch and log errors
  } catch (error) {
    // Handle errors
    console.error(error);
  } finally {
    // Always close the browser
    await browser.close();
  }
}

exports.readFromFile = readFromFile;
exports.readFromInnerJson = readFromInnerJson;
exports.scrape = scrape;
