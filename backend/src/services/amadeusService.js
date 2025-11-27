const axios = require('axios');

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID || '';
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET || '';
const AMADEUS_AUTH_URL = 'https://test.api.amadeus.com/v1/security/oauth2/token';
const AMADEUS_FLIGHT_OFFERS_URL = 'https://test.api.amadeus.com/v2/shopping/flight-offers';

let tokenCache = { token: null, expires: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expires > now) {
    return tokenCache.token;
  }
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', AMADEUS_CLIENT_ID);
  params.append('client_secret', AMADEUS_CLIENT_SECRET);
  const response = await axios.post(AMADEUS_AUTH_URL, params);
  tokenCache.token = response.data.access_token;
  tokenCache.expires = now + (response.data.expires_in - 60) * 1000;
  return tokenCache.token;
}

async function cotarVoo({ origem, destino, dataIda, dataVolta, adults = 1 }) {
  const token = await getAccessToken();
  const params = {
    originLocationCode: origem,
    destinationLocationCode: destino,
    departureDate: dataIda,
    adults,
    ...(dataVolta ? { returnDate: dataVolta } : {})
  };
  const response = await axios.get(AMADEUS_FLIGHT_OFFERS_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
}

module.exports = { getAccessToken, cotarVoo };
