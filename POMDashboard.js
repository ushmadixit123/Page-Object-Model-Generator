function downloadData(javaCode, val) {

    const textToWrite1 = javaCode;
    console.log("textToWrite1", val);
    // Create a Blob from the text content
    const file = new Blob([textToWrite1], { type: "text/plain" });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(file)
    if (val == 1)
        link.download = "example.java";
    else if(val == 2)
    link.download = "example.py"
    else if(val == 3)
    link.download = "example.js"
    link.click()
    URL.revokeObjectURL(link.href)

}
document.addEventListener("DOMContentLoaded", function () {
    let javaCode = "";


    document.getElementById("fetchDOM").addEventListener("click", function () {
        const selectElement = document.getElementById('mySelect');
        const selectedValue = selectElement.value;
        console.log(`Selected value: ${selectedValue}`);
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs && tabs[0]) {
                const tabId = tabs[0].id;
                console.log("Active Tab ID: " + tabId);

                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: gettingTeamplate,
                    args: [selectedValue]
                });

            }
        });
    });
    function gettingTeamplate(selectedValue) {
        console.log(`Selected value: ${selectedValue}`);
        console.log("function called")

        const bodyContent = document.body.innerHTML;
        const websiteName = extractWebsiteName(window.location.href);
        let url = window.location.href;
        console.log(url)
        function extractWebsiteName(url) {
            // Use a regular expression to match the domain name
            const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([^:/\n?]+)\.com/;
            const match = url.match(domainRegex);

            if (match && match[1]) {
                const websiteName = match[1].replace(/[^a-zA-Z0-9]/g, '');
                // Extracted domain name is in match[1]
                return websiteName;
            }

            // If the extraction fails, you may want to return a default or handle the case accordingly.
            return "UnknownWebsite";
        }
        console.log(websiteName, " website name is ")

        console.log("Body Content in content script:", bodyContent);
        const idArray = [];
        const classArray = [];
        const hrefArray = [];
        const titleSelectors = [];

        // Parse the bodyContent to extract class and href attributes
        const parser = new DOMParser();
        const doc = parser.parseFromString(bodyContent, "text/html");
        const elements = doc.querySelectorAll('*');

        const elementsWithTitles = document.querySelectorAll('*[title]');
        elementsWithTitles.forEach(function (element) {
            const title = element.getAttribute('title');
            if (title) {
                // Create a CSS selector based on tag name and title
                const selector = element.tagName.toLowerCase() + "[title='" + title + "']";
                titleSelectors.push(selector);
            }
        });
        elements.forEach(function (element) {
            const id = element.getAttribute('id');
            if (id) {
                idArray.push(id);
            }

            const tagName = element.tagName.toLowerCase();
            const classNames = element.getAttribute('class');
            if (classNames) {
                const concatenatedClass = [tagName, ...classNames.split(' ')].join('.');
                classArray.push(concatenatedClass);
            }

            if (element.tagName === 'A') {
                const href = element.getAttribute('href');
                if (href) {
                    // Create the CSS selector and push it to the array
                    const cssSelector = `a[href='${href}']`;
                    hrefArray.push(cssSelector);
                }
            }
        });
        console.log("id", idArray);
        console.log("classname", classArray);
        console.log("href", hrefArray)
        console.log("title", titleSelectors)
        // Send the arrays back to the extension popup

        let val = selectedValue;
        if (val == 1) {
            javaCode = `package pageObject;\n

            import org.openqa.selenium.By;\n

            public class WebPage extends WebPage {\n`;

            // Iterate through the CSS selectors and generate the code
            classArray.forEach((selector, index) => {
                const variableName = `cssSelectorWithClass${index + 1}`;
                javaCode += `    protected final By ${variableName} = By.cssSelector("${selector}");\n`;
            });
            idArray.forEach((selector, index) => {
                const variableName = `id${index + 1}`;
                javaCode += `    protected final By ${variableName} = By.cssSelector("${selector}");\n`;
            });
            hrefArray.forEach((selector, index) => {
                const variableName = `hrefElements${index + 1}`;
                javaCode += `    protected final By ${variableName} = By.cssSelector("${selector}");\n`;
            });
            titleSelectors.forEach((selector, index) => {
                const variableName = `titleSelectors${index + 1}`;
                javaCode += `    protected final By ${variableName} = By.cssSelector("${selector}");\n`;
            });

            // Close the Java class definition
            javaCode += "}\n";
            console.log(javaCode);

            // Now you can do something with the generated Java code, e.g., save it to a file or display it.
            console.log(javaCode);
        }
        else if (val == 2) {
            javaCode = `from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\n\nclass ${websiteName}Automation:\n\ndef __init__(self):\nself.data = {}\nself.driver = webdriver.Chrome()\nself.timeout = 15 \n\ndef find_element(self, by, value):\nreturn WebDriverWait(self.driver, self.timeout).until(\nEC.presence_of_element_located((by, value)))\n\ndef navigate_to_geeksforgeeks(self):\nself.driver.get("${url}")\n\n`

            // Iterate through the CSS selectors and generate the code
            classArray.forEach((selector, index) => {
                javaCode += `    self.click_element(By.CSS_SELECTOR,"${selector}");\n`;
            });
            idArray.forEach((selector, index) => {
                javaCode += `    self.click_element(By.CSS_SELECTOR,"${selector}");\n`;
            });
            hrefArray.forEach((selector, index) => {
                javaCode += `    self.click_element(By.CSS_SELECTOR,"${selector}");\n`;
            });
            titleSelectors.forEach((selector, index) => {
                javaCode += `    self.click_element(By.CSS_SELECTOR,"${selector}");\n`;
            });

            // Close the Java class definition
            javaCode += "}\n";
            console.log(javaCode);

        }
        else if (val == 3) {
            javaCode = `Page Object Model generated in Javascript\n\n`

            // Iterate through the CSS selectors and generate the code
            classArray.forEach((selector, index) => {
                const variableName = `cssSelectorWithClass${index + 1}`;
                javaCode += `    let ${variableName} = cy.get("${selector}");\n`;
            });
            idArray.forEach((selector, index) => {
                const variableName = `id${index + 1}`;
                javaCode += `    let ${variableName} = cy.get("#${selector}");\n`;
            });
            hrefArray.forEach((selector, index) => {
                const variableName = `hrefElements${index + 1}`;
                javaCode += `    let ${variableName} = cy.get("${selector}");\n`;
            });
            titleSelectors.forEach((selector, index) => {
                const variableName = `titleSelectors${index + 1}`;
                javaCode += `    let ${variableName} = cy.get("${selector}");\n`;
            });

            // Close the Java class definition
            javaCode += "}\n";
            console.log(javaCode);
        }

        downloadData(javaCode, val);

    }



});


