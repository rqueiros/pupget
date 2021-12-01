const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

fs.readFile(process.argv[2], async (err, data) => {
  if (err) throw err;
  const giveme = JSON.parse(data);

  // Create folder
  const dir = `${giveme.output.folder}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();
  await page.goto(giveme.page);

  const giveme_output = { [giveme.output_field]: {} };

  const hrefs = await page.$$eval(giveme.query, (links) =>
    links.map((a) => a.href)
  );

  let id = 0;
  for (const href of hrefs) {
    const page = await browser.newPage();
    await page.goto(href);

    // Run the queries in the each property of giveme index
    for (const field of giveme.each) {
      // Find the first h1 on the page
      const elementHandle = await page.$(field.query);
      // Get the element's innerHTML as JS handle
      const jsHandle = await elementHandle.getProperty("innerHTML");
      // Deserialize our value from the JS handle
      const plainValue = await jsHandle.jsonValue();

      // Store in output object
      const giveme_root = giveme_output[giveme.output_field];
      giveme_root[field.output_field] = plainValue;
    }

    // Save file
    fs.writeFileSync(
      path.join(
        __dirname,
        giveme.output.folder,
        `${giveme.output.filename}${id++}.json`
      ),
      JSON.stringify(giveme_output)
    );
  }
  await browser.close();
});