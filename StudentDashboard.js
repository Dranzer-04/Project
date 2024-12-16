import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './StudentDashboard.css';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import studentPic from './user-profile.jpg'; // Path to student profile picture
import collegeLogo from './logo_campus.png'; // Path to college logo

const StudentDashboard = () => {
  const [studentName, setStudentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [roleOfUser, setRoleUser] = useState('');
  const [emailId, setEmailID] = useState('');
  const [department, setDepartment] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar for small screens

  useEffect(() => {
    const checkIfAdmin = async () => {
      if (auth.currentUser) {
        const email = auth.currentUser.email;
        const adminRef = doc(db, 'authorizedAdmins', email);
        const adminDoc = await getDoc(adminRef);
        setIsAdmin(adminDoc.exists());
      }
    };

    const fetchStudentData = async () => {
      if (auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setStudentName(userData.name);
            setDepartment(userData.department);
            setContactNumber(userData.contactNumber);
            setRoleUser(userData.userType);
            setEmailID(userData.email);
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
        }
      }
    };

    const fetchComplaints = async () => {
      if (auth.currentUser) {
        try {
          const complaintsRef = collection(db, 'complaints');
          const complaintsQuery = query(
            complaintsRef,
            where('userId', '==', auth.currentUser.uid)
          );
          const querySnapshot = await getDocs(complaintsQuery);
          const complaintsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            showFeedback: false, // Initialize feedback visibility
            ...doc.data(),
          }));
          setComplaints(complaintsData);
        } catch (error) {
          console.error('Error fetching complaints:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkIfAdmin();
    fetchStudentData();
    fetchComplaints();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-container">
   <header className="header">
  <img src={collegeLogo} alt="College Logo" className="logo" />
  <h1>Bharati Vidyapeeth (Deemed to be University)</h1>
  {/* Menu button for all screen sizes */}
  <button className="menu-button" onClick={toggleSidebar}>
    ☰
  </button>
</header>



      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link" onClick={toggleSidebar}>
            Dashboard
          </Link>
          <Link to="/register-complaint" className="nav-link" onClick={toggleSidebar}>
            Make a Complaint
          </Link>
          <Link to="/make-suggestion" className="nav-link" onClick={toggleSidebar}>
            Give Suggestion
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link" onClick={toggleSidebar}>
              Admin Panel
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Profile Section */}
        <section className="profile-section">
          <div className="profile-card">
            <img src={studentPic} alt="Profile" className="profile-avatar" />
            <div className="profile-info">
              <h2>{studentName}</h2>
              <p><strong>Email:</strong> {emailId}</p>
              <p><strong>Contact:</strong> {contactNumber}</p>
              <p><strong>Role:</strong> {roleOfUser}</p>
              <p><strong>Department:</strong> {department}</p>
            </div>
          </div>
        </section>

          {/* Active Complaints Section */}
          <section className="complaints-section">
            <h3>Active Complaints</h3>
            {loading ? (
              <p>Loading complaints...</p>
            ) : complaints.length > 0 ? (
              <div className="complaints-container">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="complaint-card">
                    <div className="complaint-header">
                      <div className="complaint-info">
                        <h4 className="complaint-title">{complaint.complaintTitle}</h4>
                        <p className="complaint-id">Complaint ID: #{complaint.id}</p>
                      </div>
                      <span className={`status-badge ${complaint.status.toLowerCase() === 'resolved' ? 'status-resolved' : 'status-unresolved'}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="complaint-description">{complaint.description}</p>
                    <div className="complaint-footer">
                      <div className="complaint-footer-info">
                        <p><strong>Category:</strong> {complaint.category}</p>
                        <p><strong>Submitted On:</strong> {new Date(complaint.createdAt.seconds * 1000).toLocaleDateString()}</p>
                        <p><strong>Priority: </strong>
                          <span className="priority-badge"
                            style={{
                              backgroundColor:
                                complaint.priority.toLowerCase() === 'high'
                                  ? '#dc2626'
                                  : complaint.priority.toLowerCase() === 'medium'
                                  ? '#f97316'
                                  : '#059669',
                              color: '#fff',
                            }}
                          >
                            {complaint.priority}
                          </span>
                        </p>
                      </div>

                      {complaint.feedback && complaint.feedback.length > 0 ? (
                        <div className="feedback-button-container">
                          <button
                            className="feedback-toggle-button"
                            onClick={() =>  (complaint.id)}
                          >
                            {complaint.showFeedback ? 'Hide Feedback' : `View Feedback (${complaint.feedback.length})`}
                          </button>
                        </div>
                      ) : (
                        <div className="no-feedback-button-container">
                          <button
                            className="no-feedback-button"
                            onClick={() => alert('No feedback available yet.')}
                          >
                            No feedback available yet.
                          </button>
                        </div>
                      )}

                      {complaint.showFeedback && complaint.feedback.length > 0 && (
                        <div className="feedback-section">
                          <h4>Feedback:</h4>
                          <div className="feedback-content">
                            {complaint.feedback.map((feedback, index) => (
                              <div key={index} className="feedback-item">
                                <p><strong>{feedback.adminName}:</strong> {feedback.feedback}</p>
                                <p><small>{new Date(feedback.timestamp).toLocaleString()}</small></p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No active complaints found.</p>
            )}
          </section>
        </main>
      </div>
    
  );
};

export default StudentDashboard;