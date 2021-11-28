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
      if (retry > 0) dismissDevDialog(retry - 1);
    }
  }

  before(dismissDevDialog);

  beforeEach(launchApp);

  afterEach(async function () {
    if (this.currentTest && this.currentTest.isPassed) {
      require('fs').writeFileSync(
        `tmp/screenshots/${this.currentTest.fullTitle}.png`,
        Buffer.from(await browser.takeScreenshot(), 'base64'), 'binary'
      );
    }
  });

  it('happy path', async () => {
    console.log('============== happy path');

    const link = await $(`android=new UiSelector().text("Card")`);
    await link.click();

    const name = await $(`android=new UiSelector().text("Name")`);
    await name.setValue('Saul Goodman');

    const cardNumberEdit = await $('//android.widget.EditText[contains(@resource-id,"card_number_edit_text")]');
    await cardNumberEdit.setValue('4242424242424242');

    const expiryDateEdit = await $('//android.widget.EditText[contains(@resource-id,"expiry_date_edit_text")]');
    await expiryDateEdit.setValue('12/22');

    const CvCEdit = await $('//android.widget.EditText[contains(@resource-id,"cvc_edit_text")]');
    await CvCEdit.setValue('123');

    const PostalCodeEdit = await $('//android.widget.EditText[contains(@resource-id,"postal_code_edit_text")]');
    await PostalCodeEdit.setValue('1000');

    const payButton = await $(`android=new UiSelector().text("PAY")`);
    await payButton.click();

    const dialog = await $(`android=new UiSelector().text("The payment was confirmed successfully")`);
    expect(dialog).toBeDisplayed();
    await (await $(`android=new UiSelector().text("OK")`)).click();
  });

  it('failure path', async () => {
    console.log('============== failure path');
    const link = await $(`android=new UiSelector().text("Card")`);
    await link.click();

    const name = await $(`android=new UiSelector().text("Name")`);
    await name.setValue('Saul Goodman');

    const cardNumberEdit = await $('//android.widget.EditText[contains(@resource-id,"card_number_edit_text")]');
    await cardNumberEdit.setValue('4000000000000101');

    const expiryDateEdit = await $('//android.widget.EditText[contains(@resource-id,"expiry_date_edit_text")]');
    await expiryDateEdit.setValue('12/22');

    const CvCEdit = await $('//android.widget.EditText[contains(@resource-id,"cvc_edit_text")]');
    await CvCEdit.setValue('123');

    const PostalCodeEdit = await $('//android.widget.EditText[contains(@resource-id,"postal_code_edit_text")]');
    await PostalCodeEdit.setValue('1000');

    const payButton = await $(`android=new UiSelector().text("PAY")`);
    await payButton.click();

    const dialog = await $(`android=new UiSelector().text("Error code:")`);
    expect(dialog).toBeDisplayed();
    await (await $(`android=new UiSelector().text("OK")`)).click();
  });
});
