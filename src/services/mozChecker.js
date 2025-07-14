// services/mozChecker.js
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_ID = process.env.MOZ_ACCESS_ID;
const SECRET_KEY = process.env.MOZ_SECRET_KEY;

export const getMozData = async (domain) => {
  const expires = Math.floor(Date.now() / 1000) + 300;
  const stringToSign = `${ACCESS_ID}\n${expires}`;
  const signature = crypto
    .createHmac('sha1', SECRET_KEY)
    .update(stringToSign)
    .digest('base64');
  const encodedSignature = encodeURIComponent(signature);

  const endpoint = 'https://lsapi.seomoz.com/v2/url_metrics';
  const body = { targets: [domain] };

  try {
    const response = await axios.post(endpoint, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${ACCESS_ID}:${SECRET_KEY}`).toString('base64')}`,
      },
    });

    const { page_authority, domain_authority, spam_score } = response.data[0];

    return {
      page_authority,
      domain_authority,
      spam_score,
    };
  } catch (err) {
    console.error('Moz API Error:', err.response?.data || err.message);
    throw new Error('Failed to fetch Moz data.');
  }
};
