const safeNavigate = async (page, url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url);
      return;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed: ${error}`);
      if (i === retries - 1) throw error;
    }
  }
};

export default safeNavigate;
