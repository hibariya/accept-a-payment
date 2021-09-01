RSpec.describe 'Custom payment flow on Android App', type: :appium_android do
  example 'Happy path' do
    text('Card').click

    textfield('Card number').send_keys '4242424242424242'
    textfield('Expiration date').send_keys '1230'
    textfield('CVC').send_keys '123'
    textfield('Postal code').send_keys '10000'
    button('Pay').click

    # TODO: FIXME
    # no superclass method `text' for #<RSpec::ExampleGroups::CustomPaymentFlowOnAndroidApp:0x00007fd956b205e8>
    # expect(wait { switch_to.alert }.text).to include('Payment succeeded')
  end

  example 'CVC check fails' do
    text('Card').click

    textfield('Card number').send_keys '4000000000000101'
    textfield('Expiration date').send_keys '1230'
    textfield('CVC').send_keys '123'
    textfield('Postal code').send_keys '10000'
    button('Pay').click

    # TODO: FIXME
    # no superclass method `text' for #<RSpec::ExampleGroups::CustomPaymentFlowOnAndroidApp:0x00007fd956b205e8>
    # expect(wait { switch_to.alert }.text).to include('Error')
  end
end
