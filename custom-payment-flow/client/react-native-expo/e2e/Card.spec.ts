describe('Payment with card', function () {
  async function launchApp() {
    const pkg = 'host.exp.exponent';
    const activity = '.experience.HomeActivity';
    await browser.startActivity(pkg, activity);
    await browser.execute('mobile:deepLink', { url: 'exp://127.0.0.1:19000', package: pkg });
  }

  async function dismissDevDialog(retry = 3) {
    console.log(`dismissDevDialog(retry = ${retry});`);

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

  async function findElementByText(text: string) {
    return await $(`android=new UiSelector().text("${text}")`);
  }

  async function findElementByResourceId(id: string) {
    return await $(`//*[contains(@resource-id,"${id}")]`);
  }

  before(dismissDevDialog);

  beforeEach(launchApp);

  afterEach(async function () {
    if (this.currentTest && this.currentTest.isPassed) {
      await takeScreenshot(this.currentTest.fullTitle().replace(/\s+/g, '_'));
    }
  });

  it('happy path', async () => {
    const link = await findElementByText("Card");
    await link.click();

    const name = await findElementByText("Name");
    await name.setValue('Saul Goodman');

    const cardNumberEdit = await findElementByResourceId("card_number_edit_text");
    await cardNumberEdit.setValue('4242424242424242');

    const expiryDateEdit = await findElementByResourceId("expiry_date_edit_text");
    await expiryDateEdit.setValue('12/22');

    const CvCEdit = await findElementByResourceId("cvc_edit_text");
    await CvCEdit.setValue('123');

    const PostalCodeEdit = await findElementByResourceId("postal_code_edit_text");
    await PostalCodeEdit.setValue('1000');

    const payButton = await findElementByText("PAY");
    await payButton.click();

    const dialog = await findElementByText("The payment was confirmed successfully");
    expect(dialog).toBeDisplayed();
    await (await findElementByText("OK")).click();
  });

  it('failure path', async () => {
    const link = await findElementByText("Card");
    await link.click();

    const name = await findElementByText("Name");
    await name.setValue('Saul Goodman');

    const cardNumberEdit = await findElementByResourceId("card_number_edit_text");
    await cardNumberEdit.setValue('4000000000000101');

    const expiryDateEdit = await findElementByResourceId("expiry_date_edit_text");
    await expiryDateEdit.setValue('12/22');

    const CvCEdit = await findElementByResourceId("cvc_edit_text");
    await CvCEdit.setValue('123');

    const PostalCodeEdit = await findElementByResourceId("postal_code_edit_text");
    await PostalCodeEdit.setValue('1000');

    const payButton = await findElementByText("PAY");
    await payButton.click();

    const dialog = await findElementByText("Error code:");
    expect(dialog).toBeDisplayed();
    await (await findElementByText("OK")).click();
  });
});
