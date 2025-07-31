// src/pages/auth/FranchiseSignUpPage.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Key, ShieldCheck, Building2, Info } from 'lucide-react';
import {
  CognitoUserPool,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';
import { COGNITO_CONFIG } from '../../config/awsCognitoConfig';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Franchise registration form (1st factor sign-up only).
 */
const FranchiseSignUpPage = () => {
  const navigate = useNavigate();
  const pool = new CognitoUserPool(COGNITO_CONFIG);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    shiftKey: '',
    securityQuestion: 'homeTown',
    securityAnswer: ''
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().matches(emailRegex, 'Invalid email').required('Email is required'),
    password: Yup.string().min(8, 'At least 8 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please retype password'),
    shiftKey: Yup.number().integer('Must be integer').min(1,'Min 1').max(25,'Max 25').required('Shift key required'),
    securityQuestion: Yup.string().oneOf(['favMovie','homeTown','favColor']),
    securityAnswer: Yup.string().required('Answer is required')
  });

  const onSubmit = (values, { setSubmitting, setErrors }) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'name', Value: values.name }),
      new CognitoUserAttribute({ Name: 'email', Value: values.email }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: 'Franchise' })
    ];
    values.role='Franchise';

    pool.signUp(
      values.email,
      values.password,
      attributeList,
      null,
      (err, result) => {
        setSubmitting(false);
        if (err) {
          setErrors({ email: err.message || JSON.stringify(err) });
        } else {
          navigate('/auth/confirm', { state: values });
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Franchise Registration
          </h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Register your franchise operator account to manage eBikes, update rates, and respond to customer concerns.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="px-8 py-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Create Your Franchise Account
              </h2>
              <p className="text-sm text-gray-600">
                Please fill in all required information to set up your franchise operator account.
              </p>
            </div>

            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Field
                            name="name"
                            placeholder="Enter your full name"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>
                        <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Field
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>
                        <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Account Security Section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2 text-gray-500" />
                      Account Security
                    </h3>
                    <div className="space-y-4">
                      {/* Password */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Field
                            name="password"
                            type="password"
                            placeholder="Create a secure password"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                        <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Field
                            name="confirmPassword"
                            type="password"
                            placeholder="Re-enter your password"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>
                        <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Multi-Factor Authentication Section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                      <Key className="w-4 h-4 mr-2 text-gray-500" />
                      Multi-Factor Authentication Setup
                    </h3>
                    <div className="space-y-4">
                      {/* Shift Key */}
                      <div>
                        <label htmlFor="shiftKey" className="block text-sm font-medium text-gray-700 mb-1">
                          Caesar Cipher Shift Key
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Field
                            name="shiftKey"
                            type="number"
                            min="1"
                            max="25"
                            placeholder="Enter a number between 1-25"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-start">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-xs text-blue-800">
                              This number will be used to encrypt text during login for additional security. 
                              Choose a number you'll remember.
                            </p>
                          </div>
                        </div>
                        <ErrorMessage name="shiftKey" component="div" className="text-red-600 text-sm mt-1" />
                      </div>

                      {/* Security Answer */}
                      <div>
                        <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                          Security Question
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-2">
                          <p className="text-sm text-gray-800 font-medium">
                            What is the name of your home town?
                          </p>
                        </div>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Field
                            name="securityAnswer"
                            placeholder="Enter your answer"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>
                        <ErrorMessage name="securityAnswer" component="div" className="text-red-600 text-sm mt-1" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Franchise Account'
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have a franchise account?{' '}
                <Link 
                  to="/auth/login" 
                  className="font-medium text-green-600 hover:text-green-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FranchiseSignUpPage;