// src/pages/auth/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { Mail, Lock, Key, Shield, ChevronLeft, CheckCircle } from 'lucide-react';
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
          cognitoUser.getUserAttributes((err, attributes) => {
            let name = email;
          
            if (!err && attributes) {
              const nameAttr = attributes.find(attr => attr.getName() === "name");
              if (nameAttr) name = nameAttr.getValue();
            }
            resolve({
              accessToken,
              idToken,
              refreshToken,
              user: cognitoUser,
              name
            });
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
          jwtToken: authResult.accessToken, 
          name: authResult.name,
          userId:authResult.user.username
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
        completeAuth({user:{userId:credentials.userId,email:values.email,role:getUserRoleFromToken(credentials.jwtToken)},token :credentials.jwtToken || jwtToken});
        const token = credentials.jwtToken || jwtToken;
        const role = getUserRoleFromToken(token);
        const userName = credentials.name || values.email;
        try {
          await fetch("https://fv3uizm1fd.execute-api.us-east-1.amazonaws.com/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: values.email,
              subject: "DALScooter Login Successful!",
              body: `Hi ${userName},\n\nYou have successfully logged in to your ${role} account.\n\nWelcome back to DALScooter!`
            })
          });
        } catch (e) {
          console.warn("Login notification email failed:", e);
        }
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

  const stepTitles = [
    'Enter Credentials',
    'Security Question',
    'Cipher Verification'
  ];

  const stepDescriptions = [
    'Please enter your email and password to continue',
    'Answer your security question for additional verification',
    'Decrypt the cipher text to complete authentication'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to DALScooter
          </h2>
          <p className="text-sm text-gray-600">
            Secure multi-factor authentication
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : step > stepNumber
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="px-6 py-8">
            {/* Back Button */}
            {step > 1 && (
              <button
                onClick={prevStep}
                className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </button>
            )}

            {/* Step Header */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {stepTitles[step - 1]}
              </h3>
              <p className="text-sm text-gray-600">
                {stepDescriptions[step - 1]}
              </p>
            </div>

            {/* Form */}
            <Formik
              initialValues={{ email: '', password: '', securityAnswer: '', cipherAnswer: '' }}
              validationSchema={schemas[step - 1]}
              onSubmit={onSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  {step === 1 && (
                    <>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Field
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Field
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Security Question
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-gray-800 font-medium">
                          What is the name of your home town ?
                        </p>
                      </div>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Field
                          name="securityAnswer"
                          placeholder="Enter your answer"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <ErrorMessage name="securityAnswer" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cipher Challenge
                      </label>
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                        <p className="text-sm text-blue-800 mb-2">
                          Your security answer has been encrypted using a Caesar cipher. 
                          Please decrypt the following text:
                        </p>
                        <div className="bg-white border border-blue-200 rounded p-3">
                          <p className="font-mono text-lg font-bold text-gray-900 text-center tracking-wider">
                            {cipherText || 'Loading...'}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Field
                          name="cipherAnswer"
                          placeholder="Enter the decrypted text"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <ErrorMessage name="cipherAnswer" component="div" className="text-red-600 text-sm mt-1" />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      step < 3 ? 'Continue' : 'Sign In'
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          {/* Footer Links */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between text-sm">
              <Link 
                to="/auth/register" 
                className="text-blue-600 hover:text-blue-500 transition-colors"
              >
                Create an account
              </Link>
              <Link 
                to="/auth/franchise-signup" 
                className="text-blue-600 hover:text-blue-500 transition-colors"
              >
                Franchise signup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;