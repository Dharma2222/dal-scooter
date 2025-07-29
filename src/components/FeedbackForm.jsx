// src/components/FeedbackForm.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createFeedback, decodeJwt } from '../api/gatewayClient';

// Validation schema for feedback form
const feedbackSchema = Yup.object().shape({
  comment: Yup.string()
    .min(5, 'Too short!')
    .required('Comment is required'),
  rating: Yup.number()
    .min(1, 'Min rating is 1')
    .max(5, 'Max rating is 5')
    .required('Rating is required'),
});

export default function FeedbackForm({ bookingId, scooterId, onClose }) {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
  // Decode Cognito token to get the userId (sub)
  const token = localStorage.getItem('authToken');
  const { sub: userId } = decodeJwt(token);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await createFeedback(
        {
          bookingId,
          scooterId,
          userId,
          comment: values.comment,
          rating: values.rating,
        },
        token
      );
      alert('Thanks for your feedback!');
      onClose();
    } catch (err) {
      alert('Failed to submit feedback: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">How was your ride?</h2>
        <Formik
          initialValues={{ comment: '', rating: 5 }}
          validationSchema={feedbackSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Comment</label>
                <Field
                  as="textarea"
                  name="comment"
                  rows="3"
                  className="w-full border px-3 py-2 rounded"
                />
                <ErrorMessage
                  name="comment"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Rating</label>
                <Field
                  type="number"
                  name="rating"
                  min="1"
                  max="5"
                  className="w-20 border px-3 py-2 rounded"
                />
                <ErrorMessage
                  name="rating"
                  component="div"
                  className="text-red-600 text-sm mt-1"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {isSubmitting ? 'Saving…' : 'Submit'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
