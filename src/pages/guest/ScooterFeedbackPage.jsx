// src/pages/guest/ScooterFeedbackPage.jsx

import React, { useEffect, useState } from 'react';
import { listFeedback } from '../../api/gatewayClient';
import { useParams } from 'react-router-dom';

export default function ScooterFeedbackPage() {
  const { scooterId } = useParams();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    listFeedback({ scooterId })
      .then(setRows)
      .catch(console.error);
  }, [scooterId]);

  // render same table as above…
}
