// src/pages/auth/FranchiseSignUpPage.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Key, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-600 to-teal-500 p-6">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex w-full max-w-4xl">
        {/* Left panel: welcome */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-yellow-500 to-orange-400 text-white p-10 flex flex-col justify-center">
          <ShieldCheck className="w-16 h-16 text-blue-900 mb-4" />
          <h1 className="text-4xl font-extrabold mb-3">Franchise Sign Up</h1>
          <p className="text-lg">
            Register your franchise operator account to manage eBikes, update rates, and respond to customer concerns.
          </p>
        </div>

        {/* Right panel: form */}
        <div className="w-full md:w-1/2 bg-gray-50 p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Franchise Account</h2>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                {/* Name */}
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" />
                  <Field
                    name="name"
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" />
                  <Field
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" />
                  <Field
                    name="confirmPassword"
                    type="password"
                    placeholder="Retype Password"
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Shift Key */}
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-400" />
                  <Field
                    name="shiftKey"
                    type="number"
                    placeholder="Caesar Shift (1-25)"
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300"
                  />
                  <ErrorMessage name="shiftKey" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                {/* Security Answer */}
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-400" />
                  <Field
                    name="securityAnswer"
                    placeholder="Your home town?"
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300"
                  />
                  <ErrorMessage name="securityAnswer" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-400 text-white font-medium rounded-lg hover:from-teal-400 hover:to-green-500 transition"
                >
                  {isSubmitting ? 'Signing Up…' : 'Sign Up'}
                </button>

                <div className="mt-4 text-sm text-gray-600 flex justify-center">
                  Already registered?{' '}
                  <Link to="/" className="text-green-600 hover:underline ml-1">
                    Franchise Login
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default FranchiseSignUpPage;
