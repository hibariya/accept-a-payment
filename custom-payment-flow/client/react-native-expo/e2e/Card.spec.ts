describe('Payment with card', function () {
  async function launchApp() {
    const pkg = 'host.exp.exponent';
    const activity = '.experience.HomeActivity';
    await browser.startActivity(pkg, activity);
    await browser.execute('mobile:deepLink', { url: 'exp://127.0.0.1:19000', package: pkg });
  }

  // FIXME: This is unnecessary if we can pass a boolean extra value EXKernelDisableNuxDefaultsKey to the app
  async function dismissDevDialog(retry = 5) {
    try {
      await launchApp();

      const dialogCloseButton = await $(`android=new UiSelector().text("Got it")`);
      await dialogCloseButton.click();
      await $(`android=new UiSelector().text("react-native-expo")`);
    } catch (e) {
      if (retry > 0) {
        await dismissDevDialog(retry - 1);
      } else {
        await takeScreenshot('failedToDismissDevDialog');
        throw e;
      }
    }
  }

  async function takeScreenshot(name: string) {
    require('fs').writeFileSync(
      `tmp/screenshots/${name}.png`,
      Buffer.from(await browser.takeScreenshot(), 'base64'),
      'binary'
    );
  }

  async function elementByText(text: string) {
    return await $(`android=new UiSelector().text("${text}")`);
  }

  async function elementByResourceId(id: string) {
    return await $(`//*[contains(@resource-id,"${id}")]`);
  }

  async function clickOn(finder: Promise<WebdriverIO.Element>) {
    const el = await finder;
    await el.click();
  }

  async function fillIn(finder: Promise<WebdriverIO.Element>, value: string) {
    const el = await finder;
    await el.setValue(value);
  }

  before(async () => {
    await dismissDevDialog();
  });

  beforeEach(async () => {
    await launchApp();
  });

  afterEach(async function () {
    if (this.currentTest && this.currentTest.isPassed) {
      await takeScreenshot(this.currentTest.fullTitle().replace(/\s+/g, '_'));
    }
  });

  it("Happy path", async () => {
    await clickOn(elementByText("Card"));
    await fillIn(elementByText("Name"), "Saul Goodman");
    await fillIn(elementByResourceId("card_number_edit_text"), "4242424242424242");

    await fillIn(elementByResourceId("expiry_date_edit_text"), "12/25");
    await fillIn(elementByResourceId("cvc_edit_text"), "123");

    await fillIn(elementByResourceId("postal_code_edit_text"), "1000");

    await clickOn(elementByText("PAY"));

    expect(await elementByText("The payment was confirmed successfully")).toBeDisplayed();
    await clickOn(elementByText("OK"));
  });

  it("Failure path", async () => {
    await clickOn(elementByText("Card"));
    await fillIn(elementByText("Name"), "Saul Goodman");
    await fillIn(elementByResourceId("card_number_edit_text"), "4000000000000101");

    await fillIn(elementByResourceId("expiry_date_edit_text"), "12/25");
    await fillIn(elementByResourceId("cvc_edit_text"), "123");

    await fillIn(elementByResourceId("postal_code_edit_text"), "1000");

    await clickOn(elementByText("PAY"));

    expect(await elementByText("Error code:")).toBeDisplayed();
    await clickOn(elementByText("OK"));
  });
});
