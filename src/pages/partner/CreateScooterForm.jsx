import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createScooter } from '../../api/gatewayClient';
import { Loader, PlusCircle } from 'lucide-react';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { decodeJwt } from '../../api/gatewayClient';

const scooterSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name too short!").required('Scooter name is required'),
  type: Yup.string().required('Type is required'),
  latitude: Yup.number().required('Latitude is required').min(-90).max(90),
  longitude: Yup.number().required('Longitude is required').min(-180).max(180),
});

export default function CreateScooterForm({ onCreate, onSuccess }) {
  const { authUser } = useAuth();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');
  const companyId = decodeJwt(token).sub;
  

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <PlusCircle className="text-green-500"/> Add New Scooter
      </h2>
      {!companyId && (
        <div className="text-red-600 mb-2 font-bold">
          <console className="log"></console>
          You must be logged in as a partner to add scooters!
        </div>
      )}
      <Formik
        initialValues={{
          name: '',
          type: '',
          latitude: '',
          longitude: '',
        }}
        validationSchema={scooterSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          setSuccess('');
          setError('');
          if (!companyId) {
            setError('Company ID not found. Are you logged in as a partner?');
            setSubmitting(false);
            return;
          }
          try {
            await createScooter({
              name: values.name,
              companyId:companyId,
              type: values.type,
              latitude: parseFloat(values.latitude),
              longitude: parseFloat(values.longitude),
            });
            setSuccess('Scooter added successfully!');
            resetForm();
            if (onCreate) onCreate();
            if (onSuccess) onSuccess();
          } catch (err) {
            setError(
              err?.message?.includes('companyId')
                ? 'Missing company ID! (Are you logged in as a partner?)'
                : (err.message || 'Failed to add scooter')
            );
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <div>
              <label className="block font-semibold mb-1">Scooter Name</label>
              <Field
                name="name"
                type="text"
                placeholder="Enter name"
                className="w-full border px-4 py-2 rounded"
              />
              <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Scooter Type</label>
              <Field as="select" name="type" className="w-full border px-4 py-2 rounded">
                <option value="">Select type</option>
                <option value="Gyroscooter">🛴 Gyroscooter</option>
                <option value="eBike">🚲 eBike</option>
                <option value="Segway">🚶 Segway</option>
              </Field>
              <ErrorMessage name="type" component="div" className="text-red-500 text-xs mt-1" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-semibold mb-1">Latitude</label>
                <Field
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="Latitude (-90 to 90)"
                  className="w-full border px-4 py-2 rounded"
                />
                <ErrorMessage name="latitude" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">Longitude</label>
                <Field
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="Longitude (-180 to 180)"
                  className="w-full border px-4 py-2 rounded"
                />
                <ErrorMessage name="longitude" component="div" className="text-red-500 text-xs mt-1" />
              </div>
            </div>

            {success && <div className="text-green-600 font-semibold">{success}</div>}
            {error && <div className="text-red-500 font-semibold">{error}</div>}

            <button
              type="submit"
              className={`w-full py-2 rounded bg-green-500 text-white font-bold flex items-center justify-center gap-2
              hover:bg-green-600 transition disabled:bg-green-300`}
              disabled={isSubmitting || !companyId}
            >
              {isSubmitting ? <Loader className="animate-spin" size={18} /> : <PlusCircle size={18} />}
              {isSubmitting ? "Adding..." : "Add Scooter"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
