// src/pages/auth/RegistrationPage.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Key, Zap, Shield, CheckCircle, ArrowRight } from 'lucide-react';
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
    values.role = 'Client';
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        {/* Left Side: Welcome */}
        <div style={{
          width: '45%',
          padding: '48px 40px',
          backgroundColor: '#1f2937',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#3b82f6',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Zap size={32} color="white" />
            </div>
            
            <h1 style={{
              fontSize: '36px',
              fontWeight: 800,
              margin: 0,
              marginBottom: '16px',
              lineHeight: 1.1
            }}>
              Welcome to<br />DALScooter
            </h1>
            
            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: '#d1d5db',
              marginBottom: '32px'
            }}>
              Join thousands of riders who have discovered the future of urban mobility. 
              Create your account to unlock instant access to our premium scooter network.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: <CheckCircle size={20} />, text: 'Instant scooter reservations' },
                { icon: <CheckCircle size={20} />, text: 'Real-time availability tracking' },
                { icon: <CheckCircle size={20} />, text: 'Secure payment processing' },
                { icon: <CheckCircle size={20} />, text: '24/7 customer support' }
              ].map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#d1d5db'
                }}>
                  <div style={{ color: '#10b981' }}>
                    {feature.icon}
                  </div>
                  <span style={{ fontSize: '14px' }}>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={{
          width: '55%',
          padding: '48px 40px'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#111827',
              margin: 0,
              marginBottom: '8px'
            }}>
              Create Your Account
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: 0
            }}>
              Fill in your details to get started with DALScooter
            </p>
          </div>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ isSubmitting, errors, touched }) => (
              <Form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { name: 'name', icon: <User size={20} />, placeholder: 'Full Name', type: 'text', label: 'Full Name' },
                  { name: 'email', icon: <Mail size={20} />, placeholder: 'Email Address', type: 'email', label: 'Email Address' },
                  { name: 'password', icon: <Lock size={20} />, placeholder: 'Password', type: 'password', label: 'Password' },
                  { name: 'confirmPassword', icon: <Lock size={20} />, placeholder: 'Confirm Password', type: 'password', label: 'Confirm Password' },
                  { name: 'shiftKey', icon: <Key size={20} />, placeholder: 'Enter a number between 1-25', type: 'number', label: 'Caesar Shift Key' }
                ].map(field => (
                  <div key={field.name}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      {field.label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        zIndex: 1
                      }}>
                        {field.icon}
                      </div>
                      <Field
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 44px',
                          border: `2px solid ${errors[field.name] && touched[field.name] ? '#ef4444' : '#e5e7eb'}`,
                          borderRadius: '10px',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          backgroundColor: 'white'
                        }}
                        onFocus={e => {
                          if (!errors[field.name] || !touched[field.name]) {
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }
                        }}
                        onBlur={e => {
                          if (!errors[field.name] || !touched[field.name]) {
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                    </div>
                    <ErrorMessage name={field.name} component="div" style={{
                      color: '#ef4444',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontWeight: 500
                    }} />
                  </div>
                ))}

                {/* Security Question */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Security Question
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      zIndex: 1
                    }}>
                      <Shield size={20} />
                    </div>
                    <Field
                      name="securityAnswer"
                      placeholder="What is your home town?"
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 44px',
                        border: `2px solid ${errors.securityAnswer && touched.securityAnswer ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white'
                      }}
                      onFocus={e => {
                        if (!errors.securityAnswer || !touched.securityAnswer) {
                          e.target.style.borderColor = '#3b82f6';
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                        }
                      }}
                      onBlur={e => {
                        if (!errors.securityAnswer || !touched.securityAnswer) {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                  </div>
                  <ErrorMessage name="securityAnswer" component="div" style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    marginTop: '4px',
                    fontWeight: 500
                  }} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px'
                  }}
                  onMouseOver={e => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = '#2563eb';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 10px 20px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseOut={e => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <Link 
                    to="/auth/login" 
                    style={{
                      color: '#6b7280',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'color 0.2s ease'
                    }}
                    onMouseOver={e => e.target.style.color = '#3b82f6'}
                    onMouseOut={e => e.target.style.color = '#6b7280'}
                  >
                    Already have an account? Sign in
                  </Link>
                  <Link 
                    to="/auth/franchise-signup" 
                    style={{
                      color: '#6b7280',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'color 0.2s ease'
                    }}
                    onMouseOver={e => e.target.style.color = '#3b82f6'}
                    onMouseOut={e => e.target.style.color = '#6b7280'}
                  >
                    Franchise Registration →
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegistrationPage;