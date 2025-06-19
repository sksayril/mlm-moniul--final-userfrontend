import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface RegistrationProps {
  onRegister: (token: string, userData: any) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    referralCode: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isReferralFromUrl, setIsReferralFromUrl] = useState(false);

  // Extract referral code from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const refCode = queryParams.get('ref');
    
    if (refCode) {
      setFormData(prev => ({
        ...prev,
        referralCode: refCode
      }));
      // Store that this was auto-filled
      setIsReferralFromUrl(true);
    }
  }, [location]);

  // Function to clear referral code
  const handleClearReferralCode = () => {
    setFormData(prev => ({
      ...prev,
      referralCode: ''
    }));
    setIsReferralFromUrl(false);
    
    // Remove ref parameter from URL without page reload
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('https://api.forlifetradingindia.life/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.firstName + ' ' + formData.lastName,
          username: formData.username,
          email: formData.email,
          country: formData.country,
          mobile: formData.mobile,
          password: formData.password,
          referralCode: formData.referralCode,
        }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        // Extract data from response
        const responseReferralCode = data.data.referralCode || '';
        const userId = data.data.user.userId || '';
        const email = data.data.user.email || '';
        const name = data.data.user.name || '';
        
        setRegisteredData({
          sponsorName: 'ForLifeTrading India',
          sponsorUserId: formData.referralCode,
          referralCode: responseReferralCode,
          userId: userId,
          username: name,
          fullName: name,
          email: email,
          password: formData.password,
        });
        setShowModal(true);
        // Don't call onRegister() here to prevent automatic navigation to Dashboard
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/login');
  };

  const handleLoginNow = () => {
    setShowModal(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#232323] relative overflow-hidden">
      {/* Geometric background (simple, dark, with gold accents) */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-[#232323] to-[#353535] opacity-90 absolute inset-0" />
        {/* Gold triangles */}
        <div className="absolute left-0 top-0 w-1/2 h-full pointer-events-none">
          <svg width="100%" height="100%" className="absolute left-0 top-0" style={{zIndex:0}}>
            <polygon points="0,0 180,0 0,300" fill="#232323" />
            <polygon points="0,200 120,0 300,400" fill="#232323" />
            <polygon points="60,400 200,200 300,600" fill="#232323" />
            <polygon points="0,0 120,0 0,120" fill="#FFD700" opacity="0.15" />
            <polygon points="100,300 180,200 200,400" fill="#FFD700" opacity="0.12" />
          </svg>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-none">
          <svg width="100%" height="100%" className="absolute right-0 top-0" style={{zIndex:0}}>
            <polygon points="100,0 400,0 400,400" fill="#232323" />
            <polygon points="200,100 400,0 400,300" fill="#FFD700" opacity="0.13" />
            <polygon points="300,400 400,200 400,600" fill="#FFD700" opacity="0.10" />
          </svg>
        </div>
      </div>
      {/* Registration Card */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8 md:p-12 flex flex-col items-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
                          <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">FLT</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#2196f3] tracking-wide" style={{fontFamily:'serif'}}>ForLifeTrading</div>
                    <div className="text-lg font-semibold text-[#1976d2] tracking-wide">India</div>
                  </div>
                </div>
        </div>
        {/* Title */}
        <h2 className="text-xl font-semibold text-[#2196f3] mb-8 tracking-wide text-center">NEW REGISTRATION</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {/* Referral Code Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">REFERRAL CODE INFORMATION</label>
            <span className="block text-xs text-gray-600 mb-2">
              {formData.referralCode ? 
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Using referral code: <span className="font-semibold text-green-700">{formData.referralCode}</span></span>
                </span> : 
                <span className="text-red-600 font-medium">* Referral code is required to register</span>}
            </span>
            <div className="relative">
              <input
                type="text"
                name="referralCode"
                required
                value={formData.referralCode}
                onChange={handleInputChange}
                readOnly={isReferralFromUrl}
                placeholder="Enter referral code (required)"
                className={`w-full px-4 py-3 ${formData.referralCode ? 'bg-[#0d6e87]' : 'bg-[#0d4d87]'} text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-[#2196f3] mb-4 ${isReferralFromUrl ? 'cursor-not-allowed' : ''} placeholder-white/70`}
              />
              {formData.referralCode && isReferralFromUrl && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                    Auto-filled
                  </div>
                  <button
                    type="button"
                    onClick={handleClearReferralCode}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    title="Clear referral code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Personal Information Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">PERSONAL INFORMATION</label>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">ENTER USERNAME</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter Username"
                className="w-full px-4 py-3 bg-[#0d4d87] text-white rounded font-medium focus:outline-none focus:ring-2 focus:ring-[#2196f3] placeholder-white/80"
              />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">FIRST NAME</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="w-full px-4 py-3 bg-[#0d4d87] text-white rounded font-medium focus:outline-none focus:ring-2 focus:ring-[#2196f3] placeholder-white/80"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">LAST NAME</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full px-4 py-3 bg-[#0d4d87] text-white rounded font-medium focus:outline-none focus:ring-2 focus:ring-[#2196f3] placeholder-white/80"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">EMAIL</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full px-4 py-3 bg-[#0d4d87] text-white rounded font-medium focus:outline-none focus:ring-2 focus:ring-[#2196f3] placeholder-white/80"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">COUNTRY</label>
              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Country"
                className="w-full px-4 py-3 bg-[#0d4d87] text-white rounded font-medium focus:outline-none focus:ring-2 focus:ring-[#2196f3] placeholder-white/80"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">MOBILE NUMBER</label>
              <input
                type="tel"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Mobile Number"
                className="w-full px-4 py-3 bg-[#0d4d87] text-white rounded font-medium focus:outline-none focus:ring-2 focus:ring-[#2196f3] placeholder-white/80"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">PASSWORD</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-4 py-3 bg-[#0d4d87] text-white rounded font-medium focus:outline-none focus:ring-2 focus:ring-[#2196f3] placeholder-white/80"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">CONFIRM PASSWORD</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 bg-[#0d4d87] text-white rounded font-medium focus:outline-none focus:ring-2 focus:ring-[#2196f3] placeholder-white/80"
              />
            </div>
          </div>
          {error && <div className="text-red-600 text-sm text-center -mt-4">{error}</div>}
          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-[#2196f3] text-white rounded font-bold text-base tracking-wide hover:bg-[#1769aa] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                'Register'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 bg-gray-300 text-gray-800 rounded font-bold text-base tracking-wide hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
        {/* Login Link */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-[#2196f3] hover:underline font-medium text-base">
            Go to Login Page
          </Link>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-full max-w-lg mx-auto rounded-2xl shadow-2xl bg-gradient-to-b from-[#444] to-[#222] p-0 flex flex-col items-center" style={{minHeight:'520px'}}>
            {/* Modal Card */}
            <div className="w-full flex flex-col items-center rounded-2xl bg-gradient-to-b from-[#444] to-[#222] p-0">
              {/* Logo */}
              <div className="flex flex-col items-center mt-8 mb-2">
                <div className="flex items-center gap-2 mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">FLT</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#2196f3]">ForLifeTrading</div>
                  <div className="text-sm font-semibold text-[#1976d2]">India</div>
                </div>
              </div>
                <span className="text-2xl font-bold text-[#2196f3] tracking-wide" style={{fontFamily:'serif'}}>CONFIRMATION</span>
              </div>
              {/* Message */}
              <div className="w-full px-8 text-center text-white text-base mb-2">
                <p>Thank you for registering with us. To view your registration details, you can check your email or log in to see your dashboard.</p>
                <p className="mt-2 text-green-500 font-semibold">You have registered successfully with the following details:</p>
              </div>
              {/* Details Table */}
              <div className="w-full px-8 mb-6">
                <table className="w-full text-sm bg-white rounded shadow overflow-hidden">
                  <tbody>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#ff9800]">Sponsor Name</td>
                      <td className="py-2 px-3 text-gray-800">{registeredData?.sponsorName}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#ff9800]">Sponsor User ID</td>
                      <td className="py-2 px-3 text-gray-800">{registeredData?.sponsorUserId}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#2196f3]">User ID</td>
                      <td className="py-2 px-3 text-gray-800">{registeredData?.userId}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#2196f3]">Email</td>
                      <td className="py-2 px-3 text-gray-800">{registeredData?.email}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#2196f3]">Username</td>
                      <td className="py-2 px-3 text-gray-800">{registeredData?.username}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-[#2196f3]">Referral Code</td>
                      <td className="py-2 px-3 text-gray-800">{registeredData?.referralCode}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Login Now Button */}
              <button
                onClick={handleLoginNow}
                className="mb-8 mt-2 px-8 py-3 bg-[#0d4d87] text-white rounded font-bold text-base tracking-wide hover:bg-[#1769aa] transition-colors duration-200"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;