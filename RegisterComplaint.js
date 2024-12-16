import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterComplaint.css';
import { auth, db } from '../firebaseConfig';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'; // Correct imports
import collegeLogo from './logo_campus.png'; // Logo path
import Modal from './Modal'; // Import the Modal component

const RegisterComplaint = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Fetch user details (including name and phone) from Firebase on auth state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email);

        // Fetch user details from Firestore using user UID
        const userRef = doc(db, 'users', user.uid); // Use 'doc' to reference a single document
        getDoc(userRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setFullName(userData.name || ''); // Prefill name from Firestore
            setPhone(userData.contactNumber || ''); // Prefill phone number from Firestore
            setRole(userData.userType || '');
            setDepartment(userData.department || '');
          }
        });
      }
      setIsUserLoaded(true);
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreement) {
      setModalMessage("Please agree to the privacy policy.");
      setShowModal(true);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'complaints'), {
        userId: auth.currentUser.uid,
        fullName,
        email,
        phone,
        role,
        department,
        complaintTitle,
        description,
        category,
        priority,
        status: 'Unresolved',
        createdAt: new Date(),
      });
      setModalMessage("Complaint registered successfully!");
      setShowModal(true);
      setTimeout(() => navigate('/dashboard'), 1500); // Redirect after 1.5 seconds
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setModalMessage("There was an issue submitting your complaint.");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (!isUserLoaded) {
    // Render loading spinner or message until user data is ready
    return <div>Loading...</div>;
  }

  return (
    <div className="register-complaint-page">
      {/* Header */}
      <header className="register-complaint-header">
        <img src={collegeLogo} alt="College Logo" className="register-complaint-logo" />
        <h1>Bharati Vidyapeeth (Deemed to be University)</h1>
      </header>

      {/* Sidebar Navigation */}
      <aside className="register-complaint-sidebar">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/register-complaint" className="nav-link active">Make a Complaint</Link>
        <Link to="/make-suggestion" className="nav-link">Give Suggestion</Link>
      </aside>

      {/* Main Content */}
      <main className="register-complaint-main-content">
        <h2>Register a Complaint</h2>
        <form onSubmit={handleSubmit} className="register-complaint-form">
          <fieldset>
            <legend>Personal Information</legend>
            <label>
              Full Name:
              <input
                type="text"
                value={fullName}
                disabled
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={email}
                disabled
              />
            </label>
            <label>
              Phone No:
              <input
                type="tel"
                value={phone}
                disabled
              />
            </label>
            <label>
              User Type:
              <input
                type="text"
                value={role}
                disabled
              />
              </label>
            <label>
              Department:
              <input
                type="text"
                value={department}
                disabled
              />
              </label>
          </fieldset>

          <fieldset>
            <legend>Complaint Details</legend>
            <label>
              Complaint Title:
              <input
                type="text"
                value={complaintTitle}
                onChange={(e) => setComplaintTitle(e.target.value)}
                required
              />
            </label>
            <label>
              Description of Complaint:
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </label>
            <label>
              Category:
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a Category</option>
                <option value="IT Support">IT Support</option>
                <option value="Facilities">Facilities</option>
                <option value="Academics">Academics</option>
              </select>
            </label>
            <label>
              Priority:<br></br>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                <option value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
          </fieldset>

          <label className="register-complaint-agreement-label">
            <input
              type="checkbox"
              checked={agreement}
              onChange={() => setAgreement(!agreement)}
            />
            I agree to the privacy policy.
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>

        {/* Modal for Error/Success Messages */}
        {showModal && (
          <Modal message={modalMessage} onClose={closeModal} />
        )}
      </main>
    </div>
  );
};

export default RegisterComplaint;
