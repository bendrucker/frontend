import fetchJsonp from "fetch-jsonp";

const PIN_PAYMENTS_ATTRIBUTE_MAP = {
  name: 'name',
  number: 'number',
  cvc: 'cvc',
  month: 'expiry_month',
  year: 'expiry_year',
  postcode: 'address_postcode',
  country: 'address_country'
};

const createPinPaymentsCard = (config, card, resolve, reject) => {
  // Copy all the card attributes to the body
  const body = { publishable_api_key: config.key };
  for (const field in PIN_PAYMENTS_ATTRIBUTE_MAP) {
    body[PIN_PAYMENTS_ATTRIBUTE_MAP[field]] = card[field];
  }

  // Add all the attributes to the end of the URL since this is a JSONP
  // request, and all the attributes need to be in the URL
  let url = `${config.endpoint}/1/cards.json?_method=POST`;
  for (const key in body) {
    url = `${url}&${key}=${encodeURI(body[key])}`;
  }

  fetchJsonp(url)
    .then(function(response) {
      return response.json();
    }).then(function(json) {
      // Aww nuu, Pin returned an error!
      if (json["error"]) {
        const errors = [];

        if (json["error"] === "invalid_resource") {
          // Translate each error message from Pin to our own field names
          for (const message of json["messages"]) {
            for (const field in PIN_PAYMENTS_ATTRIBUTE_MAP) {
              if (PIN_PAYMENTS_ATTRIBUTE_MAP[field] === message["param"]) {
                errors.push({ field: field, message: message["message"] });
              }
            }
          }
        } else {
          // We're not sure what this error is, so we'll just return it on the
          // `number` field
          errors.push({ field: "number", message: json["error_description"] });
        }

        // Finally reject the promise with the error
        reject({ errors: errors });
      } else {
        // Figure out the last 4 digits of the display number and just return that.
        let last4;
        if (json["response"]["display_number"]) {
          last4 = json["response"]["display_number"].replace(/[^0-9]/g, "");
        }

        // Woo, it worked!
        resolve({
          provider: "pin_payments",
          token: json["response"]["token"],
          scheme: json["response"]["scheme"],
          name: card.name,
          month: card.month,
          year: card.year,
          postcode: card.postcode,
          country: card.country,
          last4: last4
        });
      }
    }).catch(function(exception) {
      // Something went really wrong, so we'll just throw the error on `number` here as well
      return ({ errors: [{ field: "number", message: exception.message }] });
    });
};

const STRIPE_ATTRIBUTE_MAP = {
  name: 'name',
  number: 'number',
  cvc: 'cvc',
  month: 'exp_month',
  year: 'exp_year',
  postcode: 'address_zip',
  country: 'address_country'
};

const createStripeCard = (config, card, resolve, reject) => {
  Stripe.setPublishableKey(config.key);

  // Copy all the card attributes to the body
  const body = { };
  for (const field in STRIPE_ATTRIBUTE_MAP) {
    body[STRIPE_ATTRIBUTE_MAP[field]] = card[field];
  }

  // Create the stripe token
  Stripe.card.createToken(body, (status, response) => {
    const error = response['error'];

    if (error) {
      const errors = [];

      // Translate the Stripe param into a local attribute
      for (const field in STRIPE_ATTRIBUTE_MAP) {
        if (STRIPE_ATTRIBUTE_MAP[field] === error["param"]) {
          errors.push({ field: field, message: error["message"] });
        }
      }

      // If no params matched, just dump the error on the `number` attribute
      if (!errors.length) {
        errors.push({ field: "card", message: error["message"] });
      }

      reject({ errors: errors });
    } else {
      // Yay, we made it!
      resolve({
        provider: "stripe",
        name: card.name,
        month: card.month,
        year: card.year,
        postcode: card.postcode,
        country: card.country,
        token: response['id'],
        scheme: response['card']['brand'],
        last4: response['card']['last4']
      });
    }
  });
};

export function createCardToken(card) {
  return new Promise((resolve, reject) => {
    const { pin, stripe } = window._billing;

    // Figure out which provider to use. We'll first check to see if Stripe
    // should handle the card, otherwise we'll always just default back to Pin
    // Payments.
    if (stripe.schemes.indexOf(card.type) !== -1) {
      createStripeCard(stripe, card, resolve, reject);
    } else {
      createPinPaymentsCard(pin, card, resolve, reject);
    }
  });
}
