import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SubmitSuggestion.css';
import { auth, db } from '../firebaseConfig';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import collegeLogo from './logo_campus.png';
import Modal from './Modal';

const SubmitSuggestion = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Fetch user data with an auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setEmail(user.email);

        try {
          // Fetch user details from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFullName(userData.name || '');
            setPhone(userData.contactNumber || '');
            setRole(userData.userType || '');
            setDepartment(userData.department || '');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setIsUserLoaded(true);
    });

    return () => unsubscribe();
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
      await addDoc(collection(db, 'suggestions'), {
        userId: auth.currentUser.uid,
        fullName,
        email,
        phone,
        role,
        department,
        suggestionTitle,
        description,
        category,
        status: "unread",
        createdAt: new Date(),
      });
      setModalMessage("Suggestion submitted successfully!");
      setShowModal(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      setModalMessage(`Error: ${error.message || "Unable to submit suggestion."}`);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (!isUserLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="submit-suggestion-page">
      {/* Header */}
      <header className="submit-suggestion-header">
        <img src={collegeLogo} alt="College Logo" className="submit-suggestion-logo" />
        <h1>Bharati Vidyapeeth (Deemed to be University)</h1>
      </header>

      {/* Sidebar Navigation */}
      <aside className="submit-suggestion-sidebar">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/register-complaint" className="nav-link">Make a Complaint</Link>
        <Link to="/make-suggestion" className="nav-link active">Submit Suggestion</Link>
      </aside>

      {/* Main Content */}
      <main className="submit-suggestion-main-content">
        <h2>Submit a Suggestion</h2>
        <form onSubmit={handleSubmit} className="submit-suggestion-form">
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
            <legend>Suggestion Details</legend>
            <label>
              Suggestion Title:
              <input
                type="text"
                value={suggestionTitle}
                onChange={(e) => setSuggestionTitle(e.target.value)}
                required
              />
            </label>
            <label>
              Description:
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
                <option value="Academic">Academic</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </fieldset>

          <label className="submit-suggestion-agreement-label">
            <input
              type="checkbox"
              checked={agreement}
              onChange={() => setAgreement(!agreement)}
            />
            I agree to the privacy policy.
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Suggestion"}
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

export default SubmitSuggestion;
