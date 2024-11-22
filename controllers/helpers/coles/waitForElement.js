const waitForElement = async (page, selector, options = {}) => {
  const { visible = false, timeout = 10000 } = options;

  try {
    return await page.waitForSelector(selector, { visible, timeout });
  } catch (error) {
    console.error(`Error waiting for selector ${selector}:`, error);
    throw error;
  }
};

export default waitForElement;
