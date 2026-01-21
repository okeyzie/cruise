const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

exports.autocompleteLocation = async (input) => {
  const response = await client.placeAutocomplete({
    params: {
      input,
      key: process.env.GOOGLE_MAPS_API_KEY,
      types: ["(cities)"],
    },
  });

  return response.data.predictions;
};

exports.geocodeAddress = async (address) => {
  const response = await client.geocode({
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  const location = response.data.results[0].geometry.location;

  return {
    lat: location.lat,
    lng: location.lng,
  };
};
