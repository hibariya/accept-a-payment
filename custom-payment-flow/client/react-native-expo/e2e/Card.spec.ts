// TODO: make it .ts
// https://medium.com/swlh/testing-your-react-native-app-with-expo-appium-eb6b72ce1349
// https://stackoverflow.com/questions/66891822/how-do-i-test-expo-application-without-building-apk-with-appium

describe('Payment with card', function () {
  async function launchApp() {
    const pkg = 'host.exp.exponent';
    const activity = '.experience.HomeActivity';
    // await browser.startActivity(pkg, activity);
    await browser.execute('mobile:startActivity', { intent: activity, package: pkg, extras: [['z', 'EXKernelDisableNuxDefaultsKey', true]] });
    await browser.execute('mobile:deepLink', { url: 'exp://127.0.0.1:19000', package: pkg });
  }

  async function dismissDevDialog() {
    const dialogCloseButton = await $(`android=new UiSelector().text("Got it")`);
    await dialogCloseButton.click();
    await $(`android=new UiSelector().text("react-native-expo")`);
  }

  before(async () => {
    await launchApp();
    // require('fs').writeFileSync(`tmp/screenshots/shot0.png`, Buffer.from(await browser.takeScreenshot(), 'base64'), 'binary');
    // for(let t = 1; t < 10; t++) {
    //   require('fs').writeFileSync(`tmp/screenshots/shot${t}.png`, Buffer.from(await browser.takeScreenshot(), 'base64'), 'binary');
    //   await browser.pause(3000);
    // }
    // try {
    //   await dismissDevDialog();
    // } catch (e) {
    //   require('fs').writeFileSync(`tmp/screenshots/shot1.png`, Buffer.from(await browser.takeScreenshot(), 'base64'), 'binary');
    //   throw e;
    // }
  });

  beforeEach(launchApp);
  // [0-0] 2021-11-25T21:44:45.125Z INFO webdriver: COMMAND startActivity("host.exp.exponent", ".experience.HomeActivity")
  // [21:44:50] Android Bundling complete 28ms
  // [0-0] 2021-11-25T21:44:50.434Z INFO webdriver: COMMAND findElement("-android uiautomator", "new UiSelector().text("Card")")
  // [0-0] 2021-11-25T21:45:07.343Z INFO webdriver: RESULT [
  // [0-0] 2021-11-25T21:45:25.139Z INFO webdriver: COMMAND findElement("-android uiautomator", "new UiSelector().text("Error code:")")

  it('happy path', async function () {
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

  it('failure path', async function () {
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

    // const dialog = await $(`android=new UiSelector().text("Error code:")`);
    // expect(dialog).toBeDisplayed();
    const ok = await $(`android=new UiSelector().text("OK")`);
    require('fs').writeFileSync(`tmp/screenshots/shot0.png`, Buffer.from(await browser.takeScreenshot(), 'base64'), 'binary');
    await ok.click();
  });
});
