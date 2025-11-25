import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useToast } from '@chakra-ui/react';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [showEmployeeInfo, setShowEmployeeInfo] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [showPasswordTab, setShowPasswordTab] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const loadEmployeeData = async () => {
      // Get employee info from localStorage
      const employeeData = localStorage.getItem('employee_info');
      if (employeeData) {
        try {
          const parsed = JSON.parse(employeeData);
          setEmployeeInfo(parsed);

          // Fetch employee schedule from employee_store_job table
          try {
            const scheduleData = await api.getEmployeeSchedule(parsed.employee_id);
            console.log('Schedule data received:', scheduleData);
            console.log('Is array?', Array.isArray(scheduleData));
            console.log('Length:', scheduleData?.length);
            setSchedule(scheduleData || []);
          } catch (error) {
            console.error('Failed to fetch employee schedule:', error);
            setSchedule([]);
          }

        } catch (error) {
          console.error('Error parsing employee data:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    };

    loadEmployeeData();
  }, [navigate]);

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all password fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'New password and confirmation do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 8 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast({
        title: 'Same password',
        description: 'New password must be different from current password',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.changeEmployeePasswordVerified(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      toast({
        title: 'Success!',
        description: 'Password changed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);

      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employee_info');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="employee-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (!employeeInfo) {
    return null;
  }

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="employee-header">
        <div className="header-content">
          <div>
            <h1>Employee Dashboard</h1>
            <p>Welcome back, {employeeInfo.first_name} {employeeInfo.last_name}</p>
            <span className="job-title">{employeeInfo.job_title}</span>
          </div>
          <div>
            <button
              onClick={() => setShowEmployeeInfo(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#5a6b3d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                marginRight: '10px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#6d8047'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#5a6b3d'}
            >My Information
            </button>
            <button onClick={handleLogout} className="logout-btn">
            Logout
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="dashboard-grid">
          {/* My Schedule */}
          <div className="dashboard-card full-width">
            <h2>📅 My Work Schedule</h2>
            <div className="schedule-list">
              {schedule.length === 0 ? (
                <p className="no-schedule-message">No shifts scheduled yet.</p>
              ) : (
                <div className="schedule-table">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Store</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Shift Start</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Shift End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((shift, index) => (
                        <tr key={`${shift.store_id}-${shift.work_date}-${index}`} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>
                            <strong>{shift.store_name}</strong>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {shift.work_date
                              ? new Date(shift.work_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Not set'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {shift.shift_start ? shift.shift_start.slice(0, 5) : 'Not set'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {shift.shift_end ? shift.shift_end.slice(0, 5) : 'Not set'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Employee Information Modal with Tabs */}
      {showEmployeeInfo && employeeInfo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '18px',
            maxWidth: '500px',
            width: '100%',
            margin: '0 16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#607245ff', marginBottom: '20px'}}>
              My Profile
            </h2>

            {/* Tabs */}
            <div style={{display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0'}}>
              <button
                onClick={() => setShowPasswordTab(false)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: !showPasswordTab ? '3px solid #3e4b2b' : '3px solid transparent',
                  color: !showPasswordTab ? '#3e4b2b' : '#666',
                  fontWeight: !showPasswordTab ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '15px',
                  backgroundColor: 'transparent'
                }}
              >Information
              </button>
              <button
                onClick={() => setShowPasswordTab(true)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: showPasswordTab ? '3px solid #3e4b2b' : '3px solid transparent',
                  color: showPasswordTab ? '#3e4b2b' : '#666',
                  fontWeight: showPasswordTab ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '15px',
                  backgroundColor: 'transparent'
                }}
              >Change Password
              </button>
            </div>

            {/* Information Tab */}
            {!showPasswordTab && (
              <div>
                <div style={{marginBottom: '15px'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Employee ID
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employeeInfo.employee_id}
                  </p>
                </div>

                <div style={{marginBottom: '15px', borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Name
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employeeInfo.first_name} {employeeInfo.last_name}
                  </p>
                </div>

                <div style={{marginBottom: '15px',  borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Job Title
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employeeInfo.job_title}
                  </p>
                </div>

                <div style={{marginBottom: '15px',  borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Email
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employeeInfo.email || 'Not provided'}
                  </p>
                </div>

                <div style={{marginBottom: '15px', borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Phone
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employeeInfo.phone || 'Not provided'}
                  </p>
                </div>

                <div style={{marginBottom: '15px', borderBottom: '1px solid #e0e0e0'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Gender
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employeeInfo.gender || 'Not provided'}
                  </p>
                </div>

                <div style={{marginBottom: '15px'}}>
                  <label style={{display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                    Hire Date
                  </label>
                  <p style={{fontSize: '16px', color: '#333', margin: 0, fontWeight: '500'}}>
                    {employeeInfo.hire_date
                      ? new Date(employeeInfo.hire_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not provided'}
                  </p>
                </div>
              </div>
            )}

            {/* Password Change Tab */}
            {showPasswordTab && (
              <form onSubmit={handlePasswordChange}>
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '8px'}}>
                    Current Password
                  </label>
                  <div style={{position: 'relative'}}>
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: '45px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '8px'}}>
                    New Password
                  </label>
                  <div style={{position: 'relative'}}>
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password (min 8 characters)"
                      style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: '45px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '8px'}}>
                    Confirm New Password
                  </label>
                  <div style={{position: 'relative'}}>
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Re-type new password"
                      style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: '45px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#e8f4f8',
                  border: '1px solid #b8daeb',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px'
                }}>
                  <p style={{fontSize: '13px', color: '#31708f', margin: 0}}>
                    <strong>Password requirements:</strong><br />
                    • Minimum 8 characters<br />
                    • Must be different from current password
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: isChangingPassword ? '#aaa' : '#3e4b2b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    marginBottom: '10px'
                  }}
                >
                  {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setShowEmployeeInfo(false);
                setShowPasswordTab(false);
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
