import waitForElement from './waitForElement.js';

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
const handleSteps = async (page) => {
  const a = await step1(page);
  if (!a) {
    console.log('Retrying step 1...');
    return handleSteps(page); // Retry handleSteps if step1 fails
  }

  const b = await step2(page);
  if (!b) {
    console.log('Retrying step 2...');
    return handleSteps(page); // Retry handleSteps if step2 fails
  }

  const c = await step3(page);
  if (!c) {
    console.log('Retrying step 3...');
    return handleSteps(page); // Retry handleSteps if step3 fails
  }
  await delay(1000);
  const d = await step4(page);
  if (!d) {
    console.log('Retrying step 4...');
    return handleSteps(page); // Retry handleSteps if step4 fails
  }
  const e = await step5(page);
  if (!e) {
    console.log('Retrying step 5...');
    return handleSteps(page); // Retry handleSteps if step5 fails
  }
  const f = await step6(page);
  if (!f) {
    console.log('Retrying step 6...');
    return handleSteps(page); // Retry handleSteps if step6 fails
  }

  return { success: true, status: 201 };
};

const step1 = async (page) => {
  const drawerButtonSelector = '#delivery-selector-button';
  await waitForElement(page, drawerButtonSelector, { visible: true });
  await page.click(drawerButtonSelector);
  console.log('Drawer opened.');
  return true; // Return true when the step succeeds
};

const step2 = async (page) => {
  const clickCollectButtonSelector = 'button[data-testid="tab-collection"]';
  const a = await waitForElement(page, clickCollectButtonSelector, { visible: true });
  if (!a) return false;
  await page.click(clickCollectButtonSelector);
  console.log('Clicked on the "Click & Collect" button.');
  return true; // Return true if the step succeeded
};

const step3 = async (page) => {
  const searchInputSelector = '#suburb-postcode-autocomplete';
  const location = 'Chadstone'; // Replace with the actual location

  const a = await waitForElement(page, searchInputSelector, { visible: true });
  if (!a) return false;
  await page.focus(searchInputSelector);
  await page.type(searchInputSelector, location, { delay: 100 });
  console.log(`Typed location: ${location}`);
  return true; // Return true if the step succeeded
};

const step4 = async (page) => {
  const a = await waitForElement(page, 'div.MuiAutocomplete-popper', { visible: true });
  if (!a) return false;
  const optionName = 'Chadstone, VIC 3148';

  const specificOptionSelector = `li[role="option"]`;
  try {
    const options = await page.$$(specificOptionSelector);
    for (let option of options) {
      const text = await option.evaluate((el) => el.textContent.trim());
      if (text === optionName) {
        await option.click();
        console.log(`Clicked on "${optionName}" suggestion.`);
        return true;
      }
    }
  } catch (error) {
    console.error(`Failed to click on "${optionName}" option:`, error);
  }
};

const step5 = async (page) => {
  const subLocation = 'Coles Chadstone Village (Ashwood) - Drive-through';

  const a = await waitForElement(page, 'div[role="radiogroup"]', { visible: true });
  if (!a) return false;
  try {
    const options = await page.$$('div.coles-targeting-CardRadioContainer');
    console.log('Available Options:');
    for (let option of options) {
      const text = await option.evaluate((el) => el.textContent.trim());
      console.log(text);
    }

    let clicked = false;
    for (let option of options) {
      const text = await option.evaluate((el) => el.textContent.trim());
      if (text.includes(subLocation)) {
        await option.click();
        console.log(`Clicked on sub-location: "${subLocation}"`);
        clicked = true;
        return true;
      }
    }

    if (!clicked) {
      throw new Error(`Sub-location "${subLocation}" not found.`);
    }
  } catch (error) {
    console.error(`Failed to click on sub-location: "${subLocation}"`, error);
  }
};

const step6 = async (page) => {
  const a = await waitForElement(page, 'button[data-testid="cta-secondary"]', { visible: true });
  if (!a) return false;
  await page.click('button[data-testid="cta-secondary"]');
  console.log('Clicked the "Set location" button.');
  return true
};
export default handleSteps;
