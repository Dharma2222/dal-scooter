// src/api/gatewayClient.js
import { API_BASE_URL, API_ROUTES } from './gatewayConfig';

/**
 * POST /register
 * @param {object} userData  { name, email, shiftKey, securityQuestion, securityAnswer }
 */
export async function registerUser(userData) {
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.REGISTER}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Register failed: ${resp.status} ${err}`);
  }
  return resp.json();
}

/**
 * POST /getSecurityAnswer
 * @param {{email:string}} body
 * @returns {{securityQuestion: string}}
 */
export async function fetchSecurityAnswer(email) {
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.GET_SECURITY_ANSWER}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Fetch security question failed: ${resp.status} ${err}`);
  }
  return resp.json();
}

/**
 * POST /getCipherKey
 * @param {{email:string}} body
 * @returns {{shiftKey: number}}
 */
export async function fetchCipherKey(email) {
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.GET_CIPHER_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Fetch cipher key failed: ${resp.status} ${err}`);
  }
  return resp.json();
}
