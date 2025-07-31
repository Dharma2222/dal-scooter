export const API_BASE_URL = 'https://fv3uizm1fd.execute-api.us-east-1.amazonaws.com';

export const API_ROUTES = {
  REGISTER:            '/register',
  GET_SECURITY_ANSWER: '/getSecurityAnswer',
  GET_CIPHER_KEY:      '/getCipherKey',
  LIST_SCOOTERS:       '/scooters',
  CREATE_SCOOTER:      '/scooters',
  UPDATE_SCOOTER:      '/scooters',
  DELETE_SCOOTER:      '/scooters',
  START_RIDE:          '/ride/start',
  END_RIDE:            '/ride/end',
  USER_HISTORY:        '/bookings/user',
  PARTNER_SCOOTERS:    '/bookings/partner',
  SCOOTER_HISTORY:     '/bookings/partner',
  CREATE_FEEDBACK:     '/feedback',    // POST
  LIST_FEEDBACK:       '/feedback',    // GET /feedback?bookingId=...
  FEEDBACK_SUMMARY: '/feedback/summary',

  
};