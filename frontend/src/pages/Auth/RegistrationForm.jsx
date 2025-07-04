// src/pages/auth/RegistrationPage.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Key, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  CognitoUserPool,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';
import { COGNITO_CONFIG } from '../../config/awsCognitoConfig';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

const RegistrationPage = () => {
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
      .required('Retype password'),
    shiftKey: Yup.number().integer('Must be integer').min(1, 'Min 1').max(25, 'Max 25').required('Shift key required'),
    securityQuestion: Yup.string().oneOf(['favMovie', 'homeTown', 'favColor']),
    securityAnswer: Yup.string().required('Answer is required')
  });

  const onSubmit = (values, { setSubmitting, setErrors }) => {
    console.log(values);
    values.role="Client";
    const attributeList = [
      new CognitoUserAttribute({ Name: 'name', Value: values.name }),
      new CognitoUserAttribute({ Name: 'email', Value: values.email }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: 'Client' })
    ];

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
      <div className="max-w-4xl w-full bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Welcome */}
        <div className="md:w-1/2 p-10 text-white bg-gradient-to-br from-pink-500 to-purple-500 flex flex-col justify-center">
          <Zap className="w-16 h-16 mb-4 animate-pulse text-yellow-300" />
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Welcome to DALScooter</h1>
          <p className="text-lg leading-relaxed drop-shadow-sm">
            Discover the joy of effortless rides! Sign up to unlock vibrant eBikes, reserve instantly, and explore your city on two dynamic wheels.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Your Account</h2>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                {[
                  { name: 'name', icon: <User />, placeholder: 'Full Name', type: 'text' },
                  { name: 'email', icon: <Mail />, placeholder: 'Email Address', type: 'email' },
                  { name: 'password', icon: <Lock />, placeholder: 'Password', type: 'password' },
                  { name: 'confirmPassword', icon: <Lock />, placeholder: 'Retype Password', type: 'password' },
                  { name: 'shiftKey', icon: <Key />, placeholder: 'Caesar Shift (1-25)', type: 'number' }
                ].map(field => (
                  <div key={field.name} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      {field.icon}
                    </div>
                    <Field
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    />
                    <ErrorMessage name={field.name} component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                ))}
                {/* Security Answer */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Key />
                  </div>
                  <Field
                    name="securityAnswer"
                    placeholder="Your home town?"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                  />
                  <ErrorMessage name="securityAnswer" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-purple-600 text-white text-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Signing Up…' : 'Sign Up'}
                </button>

                <div className="flex justify-between text-sm mt-4 text-gray-600">
                  <Link to="/Auth/LoginPage" className="hover:text-purple-600">Have an account?</Link>
                  <Link to="/Auth/FranchiseSignUpPage" className="hover:text-purple-600">Franchise Sign Up</Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
