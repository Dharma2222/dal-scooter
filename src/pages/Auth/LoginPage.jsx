  // src/pages/auth/LoginPage.jsx
  import React, { useState, useEffect } from 'react';
  import { Formik, Form, Field, ErrorMessage } from 'formik';
  import { useNavigate } from 'react-router-dom';
  import * as Yup from 'yup';
  import { Link } from 'react-router-dom';
  import { Mail, Lock, Key, Zap, ChevronLeft } from 'lucide-react';
  import { useAuth } from '../../context/AuthContext';
  import { fetchSecurityAnswer, fetchCipherKey } from '../../api/gatewayClient';
  import { 
    CognitoUserPool, 
    CognitoUser, 
    AuthenticationDetails 
  } from 'amazon-cognito-identity-js';
  import { COGNITO_CONFIG } from '../../config/awsCognitoConfig';

  
  
  const userPool = new CognitoUserPool(COGNITO_CONFIG);
  const generateRandomCaps = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Helper to apply Caesar cipher
  const applyCaesarCipher = (text, shift) => {
    const s = Number(shift) % 26;
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + s + 26) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + s + 26) % 26) + 97);
        }
        return char;
      })
      .join('');
  };

  const LoginPage = () => {
    const { credentials, saveCredentials, nextStep, prevStep, step, completeAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState("What is your mother's maiden name ?");
    const [shiftKey, setShiftKey] = useState(null);
    const [cognitoUser, setCognitoUser] = useState(null);
    const [jwtToken, setJwtToken] = useState(null);
    const [cipherText, setCipherText] = useState('');
    const [cipherAnswer, setCipherAnswer] = useState('');
    const navigate = useNavigate();

    // Validation schemas for each step
    const schemas = [
      Yup.object({
        email: Yup.string().email('Invalid email').required('Email required'),
        password: Yup.string().required('Password required')
      }),
      Yup.object({
        securityAnswer: Yup.string().required('Answer required')
      }),
      Yup.object({
        cipherAnswer: Yup.string().required('Ciphered answer required')
      })
    ];

    // Fetch question on step 2, shiftKey on step 3
    useEffect(() => {
      if (step === 2 && credentials.email) {
        fetchSecurityAnswer(credentials.email)
          .then(data => setAnswer(data.securityAnswer))
          .catch(err => console.error('Error fetching security question:', err));
      }
      if (step === 3 && credentials.email) {
        fetchCipherKey(credentials.email)
          .then(data => {
            setShiftKey(data.shiftKey);
            // Generate cipher text when we have both security answer and shift key
            if (credentials.securityAnswer && data.shiftKey) {
              const text = generateRandomCaps();
              console.log(text)
              setCipherAnswer(text);
              const encrypted = applyCaesarCipher(text, data.shiftKey);
              setCipherText(encrypted);
            }
          })
          .catch(err => console.error('Error fetching cipher key:', err));
      }
    }, [step, credentials.email, credentials.securityAnswer]);

    // AWS Cognito authentication
    const authenticateWithCognito = (email, password) => {
      return new Promise((resolve, reject) => {
        const userData = {
          Username: email,
          Pool: userPool,
        };

        const cognitoUser = new CognitoUser(userData);
        setCognitoUser(cognitoUser);

        const authenticationData = {
          Username: email,
          Password: password,
        };

        const authenticationDetails = new AuthenticationDetails(authenticationData);

        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => {
            const accessToken = result.getAccessToken().getJwtToken();
            const idToken = result.getIdToken().getJwtToken();
            const refreshToken = result.getRefreshToken().getToken();

            // Store the JWT token
            setJwtToken(accessToken);
            
            resolve({
              accessToken,
              idToken,
              refreshToken,
              user: cognitoUser
            });
          },
          onFailure: (err) => {
            reject(err);
          },
          newPasswordRequired: (userAttributes, requiredAttributes) => {
            // Handle case where user needs to set a new password
            reject(new Error('New password required'));
          },
          mfaRequired: (challengeName, challengeParameters) => {
            // Handle MFA if enabled
            reject(new Error('MFA required'));
          }
        });
      });
    };
    function getUserRoleFromToken(token) {
      if (!token) return null;
      try {
        // JWTs are three Base64URL-encoded segments: header.payload.signature
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        const groups = payload['cognito:groups'] || [];
        return Array.isArray(groups) && groups.length > 0 ? groups[0] : null;
      } catch (e) {
        console.error('Failed to decode JWT payload', e);
        return null;
      }
    }
    
    const onSubmit = async (values, { setSubmitting, setErrors }) => {
      if (step === 1) {
        setLoading(true);
        let role = "";
        try {
          // Authenticate with AWS Cognito
          const authResult = await authenticateWithCognito(values.email, values.password);
          // Extract role

          // Save credentials including JWT token
          saveCredentials({ 
            email: values.email, 
            password: values.password,
            jwtToken: authResult.accessToken 
          });
          nextStep();
        } catch (error) {
          console.error('Cognito authentication failed:', error);
          
          let errorMessage = 'Authentication failed';
          
          if (error.code === 'NotAuthorizedException') {
            errorMessage = 'Invalid email or password';
          } else if (error.code === 'UserNotConfirmedException') {
            errorMessage = 'Account not verified. Please check your email.';
          } else if (error.code === 'UserNotFoundException') {
            errorMessage = 'User not found';
          } else if (error.code === 'TooManyRequestsException') {
            errorMessage = 'Too many failed attempts. Please try again later.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setErrors({ 
            email: errorMessage.includes('email') ? errorMessage : '',
            password: !errorMessage.includes('email') ? errorMessage : ''
          });
        } finally {
          setLoading(false);
          setSubmitting(false);
        }
      } else if (step === 2) {
        saveCredentials({ securityAnswer: values.securityAnswer });
        nextStep();
        setSubmitting(false);
      } else {
        // Step 3: Verify user's answer against the generated cipher text
        if (values.cipherAnswer === cipherAnswer) {
          setLoading(true);
          console.log(credentials);
          completeAuth({user:{email:values.email,role:getUserRoleFromToken(credentials.jwtToken)},token :credentials.jwtToken || jwtToken});
          const token = credentials.jwtToken || jwtToken;
          const role = getUserRoleFromToken(token);
          if (role === 'Client') {
            navigate('/user');          
          } else if (role === 'Franchise') {
            navigate('/partner');       
          } else {
            console.warn('Unknown role:', role);
            navigate('/');              // fallback
          }
            setLoading(false);
            setSubmitting(false);
         
        } else {
          setErrors({ cipherAnswer: 'Incorrect cipher. Please try again.' });
          setSubmitting(false);
        }
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-400 p-6">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex w-full max-w-4xl">
          {/* Left Panel */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-pink-500 to-purple-600 text-white p-10 flex flex-col justify-center">
            <Zap className="w-16 h-16 text-yellow-300 mb-4 animate-pulse" />
            <h1 className="text-4xl font-extrabold mb-3 drop-shadow">Welcome Back!</h1>
            <p className="text-lg leading-relaxed drop-shadow-sm">
              Log in to your DALScooter account to continue reserving and unlocking eBikes instantly.
              Ready to ride again? Let's get you back on two wheels!
            </p>
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-1/2 bg-purple-50 p-10 flex flex-col justify-center relative">
            {/* Back arrow */}
            {step > 1 && (
              <button
                onClick={prevStep}
                className="absolute top-6 left-6 text-gray-500 hover:text-purple-700"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Secure Login</h2>
            <p className="text-center text-sm text-gray-600 mb-6">Step {step} of 3</p>

            <Formik
              initialValues={{ email: '', password: '', securityAnswer: '', cipherAnswer: '' }}
              validationSchema={schemas[step - 1]}
              onSubmit={onSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-5">
                  {step === 1 && (
                    <>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-500" />
                        <Field
                          name="email"
                          type="email"
                          placeholder="Email Address"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring focus:ring-pink-200 transition"
                        />
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-500" />
                        <Field
                          name="password"
                          type="password"
                          placeholder="Password"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring focus:ring-pink-200 transition"
                        />
                        <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <p className="text-gray-700">What is the name of your home town ?</p>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 text-gray-500" />
                        <Field
                          name="securityAnswer"
                          placeholder="Your Answer"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring focus:ring-pink-200 transition"
                        />
                        <ErrorMessage name="securityAnswer" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <p className="text-gray-700 mb-2">Your security answer has been encrypted with Caesar cipher.</p>
                      <div className="bg-gray-100 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-600 mb-1">Encrypted text:</p>
                        <p className="font-mono text-lg font-bold text-gray-800">{cipherText || 'Loading...'}</p>
                      </div>
                      <p className="text-gray-700 mb-3">Enter the original (decrypted) text:</p>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 text-gray-500" />
                        <Field
                          name="cipherAnswer"
                          placeholder="Your Original Answer"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring focus:ring-pink-200 transition"
                        />
                        <ErrorMessage name="cipherAnswer" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-pink-500 hover:to-purple-500 transition disabled:opacity-50"
                  >
                    {step < 3 ? 'Next' : loading ? 'Logging in...' : 'Login'}
                  </button>

                  <div className="flex justify-between text-sm text-gray-600">
                    <Link to="/auth/RegistrationPage" className="hover:text-purple-700">Create an account</Link>
                    <Link to="/auth/FranchiseSignUpPage" className="hover:text-purple-700">Franchise sign up</Link>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    );
  };

  export default LoginPage;