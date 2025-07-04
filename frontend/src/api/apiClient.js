const API_BASE_URL = 'https://fv3uizm1fd.execute-api.us-east-1.amazonaws.com';

/**
 * Post a new user record to the UsersAPI (stores user in DynamoDB).
 * @param {{ name: string, email: string, shiftKey: number, securityQuestion: string, securityAnswer: string }} userData
 */
export async function postUser(userData) {
    const response = await fetch(
      `https://fv3uizm1fd.execute-api.us-east-1.amazonaws.com/users`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }
    );
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error: ${response.status} ${err}`);
    }
    return response.json();
  }