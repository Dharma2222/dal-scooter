import React, { useState } from "react";

const ConcernForm = () => {
  const [form, setForm] = useState({
    bookingRef: "",
    concern: "",
    type: "battery",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const authUser = JSON.parse(localStorage.getItem("authUser"));
    const email = authUser?.email;

    if (!email) {
      alert("User not authenticated. Please log in.");
      return;
    }

    const requestBody = {
      email,
      ...form,
      timestamp: new Date().toISOString(),
    };

    console.log("Submitting concern with payload:", requestBody);

    try {
      const response = await fetch(
        "https://fv3uizm1fd.execute-api.us-east-1.amazonaws.com/concern/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      console.log("Server response:", data);

      if (response.ok) {
        alert("Concern submitted!");
        setForm({ bookingRef: "", concern: "", type: "battery" });
      } else {
        alert("Error: " + (data?.error || "Submission failed"));
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Submit a Concern</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="bookingRef"
          value={form.bookingRef}
          onChange={handleChange}
          placeholder="Booking Reference"
          className="w-full border px-3 py-2"
          required
        />
        <textarea
          name="concern"
          value={form.concern}
          onChange={handleChange}
          placeholder="Describe your concern"
          className="w-full border px-3 py-2"
          required
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full border px-3 py-2"
        >
          <option value="battery">Battery</option>
          <option value="brake">Brake</option>
          <option value="engine">Engine</option>
          <option value="other">Other</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ConcernForm;
