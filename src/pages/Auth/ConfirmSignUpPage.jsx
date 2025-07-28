// src/pages/auth/ConfirmSignUpPage.jsx
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  CognitoUserPool,
  CognitoUser
} from 'amazon-cognito-identity-js';
import { COGNITO_CONFIG } from '../../config/awsCognitoConfig';
import { registerUser } from '../../api/gatewayClient';

const ConfirmSchema = Yup.object({
  code: Yup.string().length(6, 'Must be 6 digits').required('Confirmation code is required')
});

export default function ConfirmSignUpPage() {
  const { state } = useLocation(); // contains name,email,password,shiftKey,securityQuestion,securityAnswer
  const navigate = useNavigate();
  const pool = new CognitoUserPool(COGNITO_CONFIG);

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Confirm Your Email</h2>
      <Formik
        initialValues={{ code: '' }}
        validationSchema={ConfirmSchema}
        onSubmit={async ({ code }, { setSubmitting, setErrors }) => {
          setSubmitting(true);
          // build CognitoUser for confirmation
          const user = new CognitoUser({
            Username: state.email,
            Pool: pool
          });
          console.log(code,"code");
          // 1) Confirm signup in Cognito
          user.confirmRegistration(code, true, async (err) => {
            if (err) {
              setErrors({ code: err.message });
              setSubmitting(false);
              return;
            }

            // 2) Persist user details in DynamoDB via API Gateway
            try {
              await registerUser({
                name: state.name,
                email: state.email,
                shiftKey: Number(state.shiftKey),
                securityQuestion: state.securityQuestion,
                securityAnswer: state.securityAnswer,
                role: state.role

              });
              // ✅ Call the notification Lambda API
              await fetch("https://fv3uizm1fd.execute-api.us-east-1.amazonaws.com/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: state.email,
                  subject: "DALScooter Registration Successful!",
                  body: `Hi ${state.name},\n\nYour registration as a ${state.role} was successful.\n\nWelcome to DALScooter!`
                })
              });
            } catch (apiErr) {
              setErrors({ code: apiErr.message || 'Failed to save user details' });
              setSubmitting(false);
              return;
            }

            // 3) Redirect to login
            navigate(state.role == "Client"?'/auth/LoginPage':'/auth/FranchiseLoginPage');
          });
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Confirmation Code</label>
              <Field
                name="code"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ErrorMessage name="code" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              {isSubmitting ? 'Verifying…' : 'Verify & Complete'}
            </button>
          </Form>
        )}
      </Formik>
      <p className="mt-4 text-center text-sm">
        Didn’t receive a code?{' '}
        <Link to="/auth/RegistrationPage" className="text-purple-600 hover:underline">
          Back to Sign Up
        </Link>
      </p>
    </div>
  );
}
