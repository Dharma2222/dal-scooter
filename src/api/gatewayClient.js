// src/api/gatewayClient.js
import { API_BASE_URL, API_ROUTES } from './gatewayConfig';
import {jwtDecode} from 'jwt-decode';

export function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(parts[1].length + (4 - parts[1].length % 4) % 4, '=');
    const decoded = JSON.parse(window.atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * POST /register
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
 */
export async function fetchSecurityAnswer(email) {
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.GET_SECURITY_ANSWER}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!resp.ok) throw new Error(`Fetch security question failed: ${resp.status}`);
  return resp.json();
}

/**
 * POST /getCipherKey
 */
export async function fetchCipherKey(email) {
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.GET_CIPHER_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!resp.ok) throw new Error(`Fetch cipher key failed: ${resp.status}`);
  return resp.json();
}

/**
 * GET /scooters
 */
export async function fetchAvailableScooters() {
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.LIST_SCOOTERS}`,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!resp.ok) throw new Error(`List scooters failed: ${resp.status}`);
  return resp.json();
}

/**
 * POST /scooters
 */
export async function createScooter(data) {
  const userId = decodeJwt(localStorage.getItem('authToken')).sub;
  data = {...data,companyId:userId};
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.CREATE_SCOOTER}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(data)
  });
  if (!resp.ok) {
    let errText;
    try {
      errText = await resp.text();
    } catch (e) {
      errText = 'Unknown error';
    }
    throw new Error(`Create scooter failed: ${resp.status} ${errText}`);
  }
  return resp.json();
}


/**
 * PUT /scooters
 */
export async function updateScooter(data) {
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.UPDATE_SCOOTER}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('authToken')
    },
    body: JSON.stringify(data)
  });
  if (!resp.ok) throw new Error(`Update scooter failed: ${resp.status}`);
  return resp.json();
}

/**
 * DELETE /scooters
 */
export async function deleteScooter(scooterId) {
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.DELETE_SCOOTER}`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('authToken')
    },
    body: JSON.stringify({ scooterId })
  });
  if (!resp.ok) throw new Error(`Delete scooter failed: ${resp.status}`);
  return resp.json();
}

/**
 * POST /ride/start
 */
export async function startRide(data) {
  const userId = decodeJwt(localStorage.getItem('authToken')).sub;
  data = {...data,userId:userId};
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.START_RIDE}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(data)
  });
  if (!resp.ok) throw new Error(`Start ride failed: ${resp.status}`);
  return resp.json();
}

/**
 * POST /ride/end
 */
export async function endRide(data) {
  const resp = await fetch(`${API_BASE_URL}${API_ROUTES.END_RIDE}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(data)
  });
  if (!resp.ok) throw new Error(`End ride failed: ${resp.status}`);
  return resp.json();
}

/**
 * GET /bookings/user?userId={userId}
 */
export async function fetchUserBookings() {
  const userId = decodeJwt(localStorage.getItem('authToken')).sub;
  const url = new URL(`${API_BASE_URL}${API_ROUTES.USER_HISTORY}`);
  url.searchParams.set('userId', userId);
  const resp = await fetch(url.toString(), {
    headers: { 'Authorization': localStorage.getItem('authToken') }
  });
  if (!resp.ok) throw new Error(`Fetch user bookings failed: ${resp.status}`);
  return resp.json();
}

/**
 * GET /bookings/partner/{companyId}/scooters
 */
export async function fetchPartnerScooters(companyId) {
  const resp = await fetch(
    `${API_BASE_URL}${API_ROUTES.PARTNER_SCOOTERS}/${companyId}/scooters`,
    { headers: { 'Authorization': localStorage.getItem('authToken') } }
  );
  if (!resp.ok) throw new Error(`Fetch partner scooters failed: ${resp.status}`);
  return resp.json();
}

/**
 * GET /bookings/partner/{companyId}/scooters/{scooterId}/history
 */
export async function fetchScooterHistory(companyId, scooterId) {
  const resp = await fetch(
    `${API_BASE_URL}${API_ROUTES.SCOOTER_HISTORY}/${companyId}/scooters/${scooterId}/history`,
    { headers: { 'Authorization': localStorage.getItem('authToken') } }
  );
  if (!resp.ok) throw new Error(`Fetch scooter history failed: ${resp.status}`);
  return resp.json();
}

export async function createFeedback(data, token) {
  const resp = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

export async function listFeedback({ bookingId, userId }) {
  const qs = bookingId
    ? `?bookingId=${encodeURIComponent(bookingId)}`
    : userId
      ? `?userId=${encodeURIComponent(userId)}`
      : '';

  const resp = await fetch(
    API_BASE_URL + API_ROUTES.LIST_FEEDBACK + qs,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  if (!resp.ok) {
    throw new Error(`Fetch feedback failed: ${resp.status}`);
  }
  return resp.json();
}