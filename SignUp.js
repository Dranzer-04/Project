import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import collegeLogo from './logo_campus.png';
import './SignUp.css';
import Modal from './Modal'; // Import the Modal component

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [userType, setUserType] = useState('');
  const [modalMessage, setModalMessage] = useState(''); // State for modal message
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name,
        contactNumber,
        department,
        userType,
        role: 'user',
      });

      navigate('/');
    } catch (error) {
      console.error("Sign-up error:", error);
      setModalMessage(`Sign-Up failed: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <img src={collegeLogo} alt="College Logo" className="logo" />
        <h1>Bharati Vidyapeeth (Deemed to be university)</h1>
      </header>

      <div className="login-section">
        <h2>Sign Up</h2>

        <form className="login-form" onSubmit={handleSignUp}>
          {/* Name input */}
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Contact Number input */}
          <div className="form-group">
            <label>Contact Number</label>
            <input
              type="text"
              placeholder="Enter your contact no"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
              maxLength="10"
              pattern="\d{10}"
            />
          </div>

          {/* Department dropdown */}
          <div className="form-group department">
            <label>Department</label>
            <div className="dropdown-container">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="dropdown"
              >
                <option value="">Select Department</option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="MCA">MCA</option>
                <option value="MBA">MBA</option>
              </select>
            </div>
          </div>

          {/* User Type dropdown */}
          <div className="form-group user-type">
            <label>User Type</label>
            <div className="dropdown-container">
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
                className="dropdown"
              >
                <option value="">Select role</option>
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
                <option value="Visitor">Visitor</option>
              </select>
            </div>
          </div>

          {/* Email input */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordRequirements(true)}
              onBlur={() => setShowPasswordRequirements(false)}
              required
              minLength="8"
            />
            {showPasswordRequirements && (
              <ul className="password-requirements">
                <li>Password must contain an upper case character</li>
                <li>Password must contain a numeric character</li>
                <li>Password must contain a non-alphanumeric character</li>
              </ul>
            )}
          </div>

          {/* Submit button */}
          <button type="submit">Sign Up</button>
        </form>

        {/* Sign In link */}
        <div className="sign-up-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>

      {/* Render Modal if modalMessage is not empty */}
      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage('')} />}
    </div>
  );
}

export default SignUp;
