import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users,
  Settings,
  Wallet, 
  DollarSign, 
  BarChart3,
  Share2, 
  FileText,
  Ticket,
  Bell,
  Menu, 
  X,
  ChevronDown,
  Link as LinkIcon,
  Key,
  Network,
  UserPlus,
  PieChart,
  LogOut,
  Save,
  Edit,
  Hash,
  Award,
  Activity,
  Check,
  Circle,
  LayoutDashboard,
  RefreshCw,
  Lock,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
} from 'lucide-react';
import ReactApexChart from 'react-apexcharts';
import { Link } from 'react-router-dom';

// Import the session validation function from App.tsx
import { validateSession } from '../App';

// Enhanced utility function to get token from sessionStorage with validation
const getSessionToken = () => {
  try {
    const sessionData = sessionStorage.getItem('user_session');
    if (!sessionData) return null;
    const parsed = JSON.parse(sessionData);
    
    // Check if session is still valid
    const now = Date.now();
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    if (now - parsed.timestamp > SESSION_TIMEOUT) {
      // Session expired, clear it
      sessionStorage.removeItem('user_session');
      return null;
    }
    
    return parsed.token;
  } catch {
    // Invalid session data, clear it
    sessionStorage.removeItem('user_session');
    return null;
  }
};

// Enhanced session check function
const checkSessionAndRedirect = (onLogout: () => void) => {
  const token = getSessionToken();
  if (!token) {
    // No valid token, trigger logout which will redirect to login
    onLogout();
    return false;
  }
  return true;
};

// Utility function to handle authentication errors from API responses
const handleAuthError = (response: Response, onLogout: () => void) => {
  if (response.status === 401 || response.status === 403) {
    // Authentication/authorization error - session expired or invalid
    onLogout();
    return true;
  }
  return false;
};

// Replace all localStorage.getItem('token') with getSessionToken()
// This is a comprehensive replacement for session security

const sidebarMenu = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Activation Wallet', icon: Wallet },
  { label: 'Generate TPin', icon: Lock },
  { label: 'Referral Link', icon: LinkIcon },
  { label: 'Income Wallet', icon: DollarSign },
  { label: 'My Investment', icon: BarChart3 },
  { label: 'FFT Coin Transaction', icon: ArrowLeftRight },
  { label: 'Your Network', icon: Network },
  // { label: 'Update Name', icon: Edit },
  { label: 'Account Settings', icon: Settings },
  // { label: 'Payout Report', icon: FileText },
  { label: 'Withdrawal', icon: DollarSign },
];

interface UserData {
  _id: string;
  name: string;
  email: string;
  userId: string;
  role: string;
  isActive: boolean;
  address?: {
    country: string;
  };
  incomeWallet?: {
    balance: number;
    selfIncome: number;
    directIncome: number;
    matrixIncome: number;
    dailyTeamIncome: number;
    rankRewards: number;
    fxTradingIncome: number;
    totalEarnings: number;
    withdrawnAmount: number;
    lastUpdated: string;
  };
  investmentWallet?: {
    balance: number;
    lastUpdated: string;
    totalInvested: number;
    totalMatured: number;
    totalReturns: number;
  };
  cryptoWallet?: {
    balance: number;
    coin: string;
    enabled: boolean;
    lastUpdated: string;
    transactions: Array<{
      amount: number;
      type: string;
      description: string;
      inrValue: number;
      createdAt: string;
      _id: string;
    }>;
  };
  tradingPackage?: {
    purchased: boolean;
  };
  referrer?: string;
  referrals?: any[];
  rank?: string;
  teamSize?: number;
  tpins: Array<{
    code: string;
    isUsed: boolean;
    purchaseDate: string;
    activationDate?: string;
    status: string;
  }>;
  paymentDetails: any[];
  incomeTransactions?: any[];
  downline?: any[];
  withdrawals?: any[];
  investments?: any[];
  createdAt: string;
  updatedAt: string;
}

const userId = 'RW606741';
const sponsorId = 'RW735752';

const Dashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameUpdateMessage, setNameUpdateMessage] = useState({ type: '', text: '' });
  const [tpinAmount, setTpinAmount] = useState('');
  const [tpinQuantity, setTpinQuantity] = useState('1');
  const [isGeneratingTpin, setIsGeneratingTpin] = useState(false);
  const [tpinMessage, setTpinMessage] = useState({ type: '', text: '' });
  const [activeTpinCard, setActiveTpinCard] = useState('Generate TPin');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ currency: '', amount: '' });
  const [paymentID, setPaymentID] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [paymentImagePreview, setPaymentImagePreview] = useState('');
  const [showGetTpinModal, setShowGetTpinModal] = useState(false);
  const [tpinStatusData, setTpinStatusData] = useState<any>(null);
  const [isLoadingTpinStatus, setIsLoadingTpinStatus] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [directReferrals, setDirectReferrals] = useState<any[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeData, setIncomeData] = useState<any>(null);
  const [isLoadingIncome, setIsLoadingIncome] = useState(false);
  const [incomeError, setIncomeError] = useState('');
  const [tpinPaymentData, setTpinPaymentData] = useState<any>(null);
  const [isLoadingTpinPayments, setIsLoadingTpinPayments] = useState(false);
  const [tpinPaymentError, setTpinPaymentError] = useState('');
  const [showActivateTpinModal, setShowActivateTpinModal] = useState(false);
  const [activateTpinCode, setActivateTpinCode] = useState('');
  const [isActivatingTpin, setIsActivatingTpin] = useState(false);
  const [activateTpinMessage, setActivateTpinMessage] = useState({ type: '', text: '' });
  const [mlmData, setMlmData] = useState<any>(null);
  const [isLoadingMlm, setIsLoadingMlm] = useState(false);
  const [mlmError, setMlmError] = useState('');
  const [transferTpinCode, setTransferTpinCode] = useState('');
  const [recipientUserId, setRecipientUserId] = useState('');
  const [isTransferringTpin, setIsTransferringTpin] = useState(false);
  const [transferMessage, setTransferMessage] = useState({ type: '', text: '' });
  const [activeWithdrawalCard, setActiveWithdrawalCard] = useState('Request Withdrawal');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
  const [cryptoWalletType, setCryptoWalletType] = useState('');
  const [cryptoNetwork, setCryptoNetwork] = useState('');
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);
  const [withdrawalMessage, setWithdrawalMessage] = useState({ type: '', text: '' });
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState('');
  const [approvedWithdrawals, setApprovedWithdrawals] = useState<any>({ summary: {}, approvedWithdrawals: [] });
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any>({ summary: {}, pendingWithdrawals: [] });
  const [rejectedWithdrawals, setRejectedWithdrawals] = useState<any>({ summary: {}, rejectedWithdrawals: [] });
  const [activeWithdrawalTab, setActiveWithdrawalTab] = useState('approved');
  const [referralLinkData, setReferralLinkData] = useState<any>(null);
  const [isLoadingReferralLink, setIsLoadingReferralLink] = useState(false);
  const [referralLinkError, setReferralLinkError] = useState('');
  const [matrixStructureData, setMatrixStructureData] = useState<any>(null);
  const [isLoadingMatrixStructure, setIsLoadingMatrixStructure] = useState(false);
  const [matrixStructureError, setMatrixStructureError] = useState('');
  const [activeMlmTab, setActiveMlmTab] = useState('overview');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: '',
    aadhaarNumber: '',
    panNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedInvestmentCurrency, setSelectedInvestmentCurrency] = useState('');
  const [showInvestmentPayment, setShowInvestmentPayment] = useState(false);
  const [investmentPaymentID, setInvestmentPaymentID] = useState('');
  const [investmentPaymentImage, setInvestmentPaymentImage] = useState<File | null>(null);
  const [investmentPaymentImagePreview, setInvestmentPaymentImagePreview] = useState('');
  const [isProcessingInvestment, setIsProcessingInvestment] = useState(false);
  const [investmentMessage, setInvestmentMessage] = useState({ type: '', text: '' });
  const [investmentWalletData, setInvestmentWalletData] = useState<any>(null);
  const [investmentHistoryData, setInvestmentHistoryData] = useState<any>(null);
  const [isLoadingInvestmentWallet, setIsLoadingInvestmentWallet] = useState(false);
  const [isLoadingInvestmentHistory, setIsLoadingInvestmentHistory] = useState(false);
  const [investmentWalletError, setInvestmentWalletError] = useState('');
  const [investmentHistoryError, setInvestmentHistoryError] = useState('');
  const [activeInvestmentTab, setActiveInvestmentTab] = useState('wallet');
  const [investmentPercentageChange, setInvestmentPercentageChange] = useState(0);
  const [cryptoPercentageChange, setCryptoPercentageChange] = useState(0);
  const [displayInvestmentBalance, setDisplayInvestmentBalance] = useState<number | null>(null);
  const [displayCryptoBalance, setDisplayCryptoBalance] = useState<number | null>(null);
  const [balanceAnimating, setBalanceAnimating] = useState(false);
  
  // Crypto Buy/Sell states
  const [showCryptoBuyModal, setShowCryptoBuyModal] = useState(false);
  const [showCryptoSellModal, setShowCryptoSellModal] = useState(false);
  const [cryptoBuyQuantity, setCryptoBuyQuantity] = useState('');
  const [cryptoBuyCurrentCoinValue, setCryptoBuyCurrentCoinValue] = useState(0.10);
  const [cryptoSellQuantity, setCryptoSellQuantity] = useState('');
  const [cryptoSellCurrentCoinValue, setCryptoSellCurrentCoinValue] = useState(0.10);
  const [isProcessingCryptoBuy, setIsProcessingCryptoBuy] = useState(false);
  const [isProcessingCryptoSell, setIsProcessingCryptoSell] = useState(false);
  const [cryptoTradeMessage, setCryptoTradeMessage] = useState({ type: '', text: '' });
  
  // Crypto Transactions states
  const [cryptoTransactions, setCryptoTransactions] = useState<any>(null);
  const [isLoadingCryptoTransactions, setIsLoadingCryptoTransactions] = useState(false);
  const [cryptoTransactionsError, setCryptoTransactionsError] = useState('');
  
  // Chart data for investment performance
  const [investmentChartOptions, setInvestmentChartOptions] = useState<any>({
    chart: {
      type: 'area',
      height: 350,
      zoom: {
        enabled: false
      },
      toolbar: {
        show: false
      },
      foreColor: '#6B7280',
      redrawOnWindowResize: true,
      redrawOnParentResize: true,
      responsive: true
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    colors: ['#4F46E5'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    tooltip: {
      theme: 'dark'
    },
    grid: {
      borderColor: '#f1f1f1',
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.5
      }
    },
    xaxis: {
      categories: [],
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(value: number) {
          return '₹' + value.toFixed(2);
        },
        style: {
          colors: '#6B7280'
        }
      }
    }
  });
  const [investmentChartSeries, setInvestmentChartSeries] = useState<any>([
    {
      name: 'Investment Value',
      data: []
    }
  ]);
  
  // Candlestick chart data for MLM Coin
  const [coinChartOptions, setCoinChartOptions] = useState<any>({
    chart: {
      type: 'candlestick',
      height: 350,
      toolbar: {
        show: false
      },
      foreColor: '#6B7280',
      redrawOnWindowResize: true,
      redrawOnParentResize: true,
      responsive: true,
      animations: {
        enabled: true
      }
    },
    title: {
      text: 'MLM Coin Price',
      align: 'left',
      style: {
        fontSize: '16px',
        color: '#1856a7'
      }
    },
    xaxis: {
      type: 'category',
      labels: {
        style: {
          colors: '#6B7280'
        }
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        formatter: function(value: number) {
          return '₹' + value.toFixed(2);
        },
        style: {
          colors: '#6B7280'
        }
      }
    },
    grid: {
      borderColor: '#f1f1f1'
    }
  });
  const [coinChartSeries, setCoinChartSeries] = useState<any>([
    {
      data: []
    }
  ]);

  // Prevent scrolling when sidebar is open on mobile
  React.useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Fetch direct referrals when Referral Link section is active
  useEffect(() => {
    if (activeMenu === 'Referral Link') {
      fetchDirectReferrals();
    }
  }, [activeMenu]);

  // Fetch TPin payments when Payout Report section is active
  useEffect(() => {
    if (activeMenu === 'Payout Report') {
      fetchTpinPayments();
    }
  }, [activeMenu]);

  // Fetch MLM data when MLM section is active
  useEffect(() => {
    if (activeMenu === 'Your Network') {
      fetchMlmData();
      fetchMatrixStructure();
    }
  }, [activeMenu]);

  // Fetch withdrawal history when Withdrawal section is active and History card is selected
  useEffect(() => {
    if (activeMenu === 'Withdrawal' && activeWithdrawalCard === 'Withdrawal History') {
      fetchWithdrawalHistory();
    }
  }, [activeMenu, activeWithdrawalCard]);

  // Fetch referral link data when Referral Link section is active
  useEffect(() => {
    if (activeMenu === 'Referral Link') {
      fetchReferralLinkData();
    }
  }, [activeMenu]);

  // Fetch crypto transactions when FFT Coin Transaction section is active
  useEffect(() => {
    if (activeMenu === 'FFT Coin Transaction') {
      fetchCryptoTransactions();
    }
  }, [activeMenu]);

  // Fetch profile data when Account Settings section is active
  useEffect(() => {
    if (activeMenu === 'Account Settings') {
      fetchProfileData();
    }
  }, [activeMenu]);

  // Fetch investment data when My Investment section is active
  useEffect(() => {
    if (activeMenu === 'My Investment') {
      if (activeInvestmentTab === 'wallet') {
        fetchInvestmentWallet();
      } else if (activeInvestmentTab === 'history') {
        fetchInvestmentHistory();
      }
    }
  }, [activeMenu, activeInvestmentTab]);

  // Fetch user data function
  const fetchUserData = async () => {
    setIsLoading(true);
    
    // Check session validity first
    if (!checkSessionAndRedirect(onLogout)) {
      setIsLoading(false);
      return;
    }
    
    try {
      const token = getSessionToken();
      if (!token) {
        setError('Session expired. Please login again.');
        onLogout();
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setUserData(data.data.user);
      } else {
        // Check if it's an authentication error
        if (response.status === 401 || response.status === 403) {
          setError('Session expired. Please login again.');
          onLogout();
        } else {
          setError(data.message || 'Failed to fetch user data');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
    
    // Generate initial chart data
    generateInvestmentChartData();
    generateCoinChartData();
  }, []);
  
  // Update candlestick chart data periodically
  useEffect(() => {
    const updateCoinChart = () => {
      // Update the last candlestick data point to simulate live trading
      if (coinChartSeries[0].data.length > 0) {
        const newData = [...coinChartSeries[0].data];
        const lastCandle = {...newData[newData.length - 1]};
        
        // Random price movement between -0.03 and +0.03 rupees
        const priceChange = (Math.random() * 0.06) - 0.03;
        
        // Update the close price
        let newClose = lastCandle.y[3] + priceChange;
        
        // Ensure price stays between 0.10 and 1.00
        newClose = Math.max(0.10, Math.min(1.00, newClose));
        
        // Update high/low if needed
        const newHigh = Math.max(lastCandle.y[1], newClose);
        const newLow = Math.min(lastCandle.y[2], newClose);
        
        // Update the candle
        lastCandle.y = [
          lastCandle.y[0], // Open stays the same
          newHigh,
          newLow,
          parseFloat(newClose.toFixed(2))
        ];
        
        newData[newData.length - 1] = lastCandle;
        
        setCoinChartSeries([{
          data: newData
        }]);
      }
    };
    
    // Update every 3-5 seconds
    const interval = setInterval(() => {
      updateCoinChart();
    }, Math.random() * 2000 + 3000);
    
    return () => clearInterval(interval);
  }, [coinChartSeries]);

  // Random percentage change updater for investment cards
  useEffect(() => {
    const updatePercentages = () => {
      // Only update percentages if balances are greater than 0
      const investmentBalance = userData?.investmentWallet?.balance || 0;
      const cryptoBalance = userData?.cryptoWallet?.balance || 0;
      
      if (investmentBalance > 0) {
        const randomInvestmentPercentage = (Math.random() * 6 - 3).toFixed(2);
        setInvestmentPercentageChange(parseFloat(randomInvestmentPercentage));
      } else {
        setInvestmentPercentageChange(0);
      }
      
      if (cryptoBalance > 0) {
        const randomCryptoPercentage = (Math.random() * 8 - 4).toFixed(2); // Crypto is more volatile
        setCryptoPercentageChange(parseFloat(randomCryptoPercentage));
      } else {
        setCryptoPercentageChange(0);
      }
    };

    // Initial random values
    updatePercentages();

    // Update every 3-5 seconds randomly
    const interval = setInterval(() => {
      updatePercentages();
    }, Math.random() * 2000 + 3000); // Random interval between 3-5 seconds

    return () => clearInterval(interval);
  }, [userData?.investmentWallet?.balance, userData?.cryptoWallet?.balance]);
  
  // Generate random investment chart data
  const generateInvestmentChartData = () => {
    const categories = [];
    const data = [];
    
    // Generate data for 30 points without dates
    for (let i = 1; i <= 30; i++) {
      categories.push(i.toString());
      
      // Generate random value between 5000 and 15000
      const baseValue = 5000 + Math.random() * 10000;
      
      // Add some trend to make it look realistic
      const trendValue = i < 15 ? baseValue * (1 + (i * 0.01)) : baseValue * (1 + ((30 - i) * 0.01));
      
      data.push(parseFloat(trendValue.toFixed(2)));
    }
    
    setInvestmentChartOptions({
      ...investmentChartOptions,
      xaxis: {
        ...investmentChartOptions.xaxis,
        categories: categories
      }
    });
    
    setInvestmentChartSeries([{
      name: 'Investment Value',
      data: data
    }]);
  };
  
  // Generate random candlestick data for MLM Coin
  const generateCoinChartData = () => {
    const data = [];
    
    // Generate data for 30 points without dates
    for (let i = 1; i <= 30; i++) {
      // Random price between 0.10 (10 paisa) and 1.00 rupee
      const basePrice = 0.10 + Math.random() * 0.90;
      
      // Generate OHLC data
      const open = basePrice;
      const high = open + (Math.random() * 0.05); // Up to 5 paisa higher
      const low = Math.max(0.10, open - (Math.random() * 0.05)); // Up to 5 paisa lower but not below 10 paisa
      const close = low + (Math.random() * (high - low)); // Random close between high and low
      
      data.push({
        x: i,
        y: [
          parseFloat(open.toFixed(2)),
          parseFloat(high.toFixed(2)),
          parseFloat(low.toFixed(2)),
          parseFloat(close.toFixed(2))
        ]
      });
    }
    
    setCoinChartSeries([{
      data: data
    }]);
  };
  
  // Update display balances based on percentage changes
  useEffect(() => {
    if (userData?.investmentWallet?.balance && userData?.cryptoWallet?.balance) {
      // Trigger animation state
      setBalanceAnimating(true);
      
      // Calculate new balances
      const baseInvestmentBalance = userData.investmentWallet.balance;
      const investmentChangeAmount = baseInvestmentBalance * (investmentPercentageChange / 100);
      
      const baseCryptoBalance = userData.cryptoWallet.balance;
      const cryptoChangeAmount = baseCryptoBalance * (cryptoPercentageChange / 100);
      
      // Add slight delay to make the change more noticeable after percentage changes
      setTimeout(() => {
        setDisplayInvestmentBalance(baseInvestmentBalance + investmentChangeAmount);
        setDisplayCryptoBalance(baseCryptoBalance + cryptoChangeAmount);
        
        // Reset animation state after a short delay
        setTimeout(() => {
          setBalanceAnimating(false);
        }, 400);
      }, 200);
    }
  }, [investmentPercentageChange, cryptoPercentageChange, userData?.investmentWallet?.balance, userData?.cryptoWallet?.balance]);

  const handleLogout = () => {
    // Session is cleared by the parent component
    onLogout();
  };

  // Handle name update
  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setNameUpdateMessage({ type: 'error', text: 'Please enter a valid name' });
      return;
    }

    // Check session validity first
    if (!checkSessionAndRedirect(onLogout)) {
      return;
    }

    setIsUpdatingName(true);
    setNameUpdateMessage({ type: '', text: '' });

    try {
      const token = getSessionToken();
      if (!token) {
        setNameUpdateMessage({ type: 'error', text: 'Session expired. Please login again.' });
        onLogout();
        setIsUpdatingName(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/auth/updateMe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        // Update user data in state with the complete updated user data from response
        if (data.data && data.data.user) {
          setUserData(data.data.user);
                  // Session storage is managed by SessionManager in App.tsx
        }
        setNameUpdateMessage({ type: 'success', text: 'Name updated successfully!' });
        setNewName(''); // Clear the input
      } else {
        setNameUpdateMessage({ type: 'error', text: data.message || 'Failed to update name' });
      }
    } catch (err) {
      setNameUpdateMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsUpdatingName(false);
    }
  };

  // Handle opening generate modal
  const handleGenerateClick = () => {
    setShowGenerateModal(true);
    setSelectedPackage('');
    setTpinMessage({ type: '', text: '' });
  };

  // Handle opening payment modal from first modal
  const handlePaymentModalOpen = () => {
    if (!selectedPackage) {
      setTpinMessage({ type: 'error', text: 'Please select a package' });
      return;
    }

    const packageData = selectedPackage === 'rupees' 
      ? { currency: 'INR', amount: '499' }
      : { currency: 'USD', amount: '6' };
    
    setPaymentData(packageData);
    setShowGenerateModal(false);
    setShowPaymentModal(true);
    setPaymentID('');
    setQuantity('1');
    setPaymentImage(null);
    setPaymentImagePreview('');
    setTpinMessage({ type: '', text: '' });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPaymentImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle final TPin generation with payment proof
  const handleFinalTpinGeneration = async () => {
    if (!paymentID.trim()) {
      setTpinMessage({ type: 'error', text: 'Please enter payment ID' });
      return;
    }

    if (!paymentImage) {
      setTpinMessage({ type: 'error', text: 'Please upload payment proof image' });
      return;
    }

    if (parseInt(quantity) < 1) {
      setTpinMessage({ type: 'error', text: 'Quantity must be at least 1' });
      return;
    }

    setIsGeneratingTpin(true);
    setTpinMessage({ type: '', text: '' });

    // Check session validity first
    if (!checkSessionAndRedirect(onLogout)) {
      setIsGeneratingTpin(false);
      return;
    }

    try {
      const token = getSessionToken();
      if (!token) {
        setTpinMessage({ type: 'error', text: 'Session expired. Please login again.' });
        onLogout();
        setIsGeneratingTpin(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('amount', paymentData.amount);
      formData.append('currency', paymentData.currency);
      formData.append('quantity', quantity);
      formData.append('paymentId', paymentID);
      formData.append('screenshot', paymentImage);

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/tpin/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setTpinMessage({ type: 'success', text: `Successfully submitted TPin generation request with payment proof!` });
        // Reset form
        setPaymentID('');
        setQuantity('1');
        setPaymentImage(null);
        setPaymentImagePreview('');
        
        // Refresh user data
        const updatedUserResponse = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const updatedUserData = await updatedUserResponse.json();
        if (updatedUserResponse.ok && updatedUserData.status === 'success') {
          setUserData(updatedUserData.data.user);
        }
        
        // Close modal after 3 seconds
        setTimeout(() => {
          setShowPaymentModal(false);
        }, 3000);
      } else {
        setTpinMessage({ type: 'error', text: data.message || 'Failed to generate TPin' });
      }
    } catch (err) {
      setTpinMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsGeneratingTpin(false);
    }
  };

  // Handle copy referral link
  const handleCopyReferralLink = async (customLink?: string) => {
    const referralLink = customLink || referralLinkData?.referralLink || `${window.location.origin}/register?ref=${userData?.userId}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopyMessage('Referral link copied to clipboard!');
      setTimeout(() => setCopyMessage(''), 3000);
    } catch (err) {
      setCopyMessage('Failed to copy link. Please copy manually.');
      setTimeout(() => setCopyMessage(''), 3000);
    }
  };

  // Fetch direct referrals data
  const fetchDirectReferrals = async () => {
    setIsLoadingReferrals(true);
    setReferralError('');
    
    // Check session validity first
    if (!checkSessionAndRedirect(onLogout)) {
      setIsLoadingReferrals(false);
      return;
    }
    
    try {
      const token = getSessionToken();
      if (!token) {
        setReferralError('Session expired. Please login again.');
        onLogout();
        setIsLoadingReferrals(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/mlm/referral/direct', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setDirectReferrals(data.data.directReferrals || []);
        setReferralError('');
      } else {
        setReferralError(data.message || 'Failed to fetch referrals');
        setDirectReferrals([]);
      }
    } catch (err) {
      setReferralError('Network error. Please try again.');
      setDirectReferrals([]);
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  // Fetch referral income data
  const fetchReferralIncome = async () => {
    setIsLoadingIncome(true);
    setIncomeError('');
    
    try {
      const token = getSessionToken();
      if (!token) {
        setIncomeError('Authentication token not found');
        onLogout(); // Auto logout if no token
        setIsLoadingIncome(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/mlm/referral/income', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setIncomeData(data.data);
        setIncomeError('');
      } else {
        setIncomeError(data.message || 'Failed to fetch income data');
        setIncomeData(null);
      }
    } catch (err) {
      setIncomeError('Network error. Please try again.');
      setIncomeData(null);
    } finally {
      setIsLoadingIncome(false);
    }
  };

  // Handle referral earnings click
  const handleReferralEarningsClick = () => {
    setShowIncomeModal(true);
    fetchReferralIncome();
  };

  // Handle activate TPin click
  const handleActivateTpinClick = () => {
    setShowActivateTpinModal(true);
    setActivateTpinCode('');
    setActivateTpinMessage({ type: '', text: '' });
  };

  // Handle TPin activation submission
  const handleActivateTpinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activateTpinCode.trim()) {
      setActivateTpinMessage({ type: 'error', text: 'Please enter a valid TPin code' });
      return;
    }

    setIsActivatingTpin(true);
    setActivateTpinMessage({ type: '', text: '' });

    try {
      const token = getSessionToken();
      if (!token) {
        setActivateTpinMessage({ type: 'error', text: 'Authentication token not found' });
        onLogout(); // Auto logout if no token
        setIsActivatingTpin(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/auth/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tpinCode: activateTpinCode }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setActivateTpinMessage({ type: 'success', text: data.message || 'Account activated successfully' });
        setActivateTpinCode('');
        // Close modal and reload the page after success
        setTimeout(() => {
          setShowActivateTpinModal(false);
          setActivateTpinMessage({ type: '', text: '' });
          window.location.reload();
        }, 2000);
      } else {
        setActivateTpinMessage({ type: 'error', text: data.message || 'Failed to activate account' });
      }
    } catch (err) {
      setActivateTpinMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsActivatingTpin(false);
    }
  };

  // Fetch MLM dashboard data
  const fetchMlmData = async () => {
    setIsLoadingMlm(true);
    setMlmError('');

    try {
      const token = getSessionToken();
      if (!token) {
        setMlmError('Authentication token not found');
        onLogout(); // Auto logout if no token
        setIsLoadingMlm(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/mlm/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setMlmData(data.data);
      } else {
        setMlmError(data.message || 'Failed to fetch MLM data');
      }
    } catch (err) {
      setMlmError('Network error. Please try again.');
    } finally {
      setIsLoadingMlm(false);
    }
  };

  // Fetch matrix structure data
  const fetchMatrixStructure = async () => {
    setIsLoadingMatrixStructure(true);
    setMatrixStructureError('');

    try {
      const token = getSessionToken();
      if (!token) {
        setMatrixStructureError('Authentication token not found');
        onLogout(); // Auto logout if no token
        setIsLoadingMatrixStructure(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/mlm/matrix/structure', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setMatrixStructureData(data.data);
      } else {
        setMatrixStructureError(data.message || 'Failed to fetch matrix structure data');
      }
    } catch (err) {
      setMatrixStructureError('Network error. Please try again.');
    } finally {
      setIsLoadingMatrixStructure(false);
    }
  };

  // Handle TPin transfer
  const handleTpinTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTpinCode.trim() || !recipientUserId.trim()) {
      setTransferMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setIsTransferringTpin(true);
    setTransferMessage({ type: '', text: '' });

    try {
      const token = getSessionToken();
      if (!token) {
        setTransferMessage({ type: 'error', text: 'Authentication token not found' });
        onLogout(); // Auto logout if no token
        setIsTransferringTpin(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/tpin/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tpinCode: transferTpinCode,
          recipientUserId: recipientUserId
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setTransferMessage({ type: 'success', text: data.message || 'TPin transferred successfully!' });
        setTransferTpinCode('');
        setRecipientUserId('');
      } else {
        setTransferMessage({ type: 'error', text: data.message || 'Failed to transfer TPin' });
      }
    } catch (err) {
      setTransferMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsTransferringTpin(false);
    }
  };

  // Handle withdrawal request
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalAmount.trim() || !paymentMethod.trim()) {
      setWithdrawalMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    // Validate UPI details if UPI is selected
    if (paymentMethod === 'upi' && !upiId.trim()) {
      setWithdrawalMessage({ type: 'error', text: 'Please provide UPI ID for UPI payment method' });
      return;
    }

    // Validate bank details if bank transfer is selected
    if (paymentMethod === 'bank' && (!bankName.trim() || !accountNumber.trim() || !accountName.trim() || !ifscCode.trim())) {
      setWithdrawalMessage({ type: 'error', text: 'Please provide complete bank details for bank transfer' });
      return;
    }

    // Validate crypto wallet details if crypto is selected
    if (paymentMethod === 'crypto' && (!cryptoWalletAddress.trim() || !cryptoWalletType.trim() || !cryptoNetwork.trim())) {
      setWithdrawalMessage({ type: 'error', text: 'Please provide complete crypto wallet details' });
      return;
    }

    if (parseFloat(withdrawalAmount) < 150) {
      setWithdrawalMessage({ type: 'error', text: 'Minimum withdrawal amount is ₹150' });
      return;
    }

    setIsRequestingWithdrawal(true);
    setWithdrawalMessage({ type: '', text: '' });

    try {
      const token = getSessionToken();
      if (!token) {
        setWithdrawalMessage({ type: 'error', text: 'Authentication token not found' });
        onLogout(); // Auto logout if no token
        setIsRequestingWithdrawal(false);
        return;
      }

      let requestBody;
      if (paymentMethod === 'upi') {
        requestBody = {
                amount: parseFloat(withdrawalAmount),
                paymentMethod: 'upi',
                upiId: upiId
        };
      } else if (paymentMethod === 'bank') {
        requestBody = {
                amount: parseFloat(withdrawalAmount),
                paymentMethod: 'bank',
                bankDetails: {
                  accountNumber: accountNumber,
                  ifscCode: ifscCode,
                  accountHolderName: accountName,
                  bankName: bankName
                }
        };
      } else if (paymentMethod === 'crypto') {
        requestBody = {
          amount: parseFloat(withdrawalAmount),
          paymentMethod: 'crypto',
          cryptoWallet: {
            walletAddress: cryptoWalletAddress,
            walletType: cryptoWalletType,
            network: cryptoNetwork
          }
        };
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/mlm/withdrawal/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        const successMessage = `${data.message || 'Withdrawal request submitted successfully!'} - Amount: ₹${data.data?.amount || withdrawalAmount}, Status: ${data.data?.status || 'Pending'}, Remaining Balance: ₹${data.data?.remainingBalance || 'N/A'}`;
        setWithdrawalMessage({ type: 'success', text: successMessage });
        setWithdrawalAmount('');
        setPaymentMethod('');
        setUpiId('');
        setBankName('');
        setAccountNumber('');
        setAccountName('');
        setIfscCode('');
        setCryptoWalletAddress('');
        setCryptoWalletType('');
        setCryptoNetwork('');
        // Refresh withdrawal history if we're viewing it
        if (activeWithdrawalCard === 'Withdrawal History') {
          fetchWithdrawalHistory();
        }
      } else {
        setWithdrawalMessage({ type: 'error', text: data.message || 'Failed to submit withdrawal request' });
      }
    } catch (err) {
      setWithdrawalMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsRequestingWithdrawal(false);
    }
  };

  // Fetch withdrawal history
  // Fetch approved withdrawals
  const fetchApprovedWithdrawals = async () => {
    try {
      const token = getSessionToken();
      if (!token) {
        setWithdrawalError('Authentication token not found');
        onLogout(); // Auto logout if no token
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/mlm/withdrawal/approved/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setApprovedWithdrawals(data.data);
      } else {
        setWithdrawalError(data.message || 'Failed to fetch approved withdrawals');
      }
    } catch (err) {
      setWithdrawalError('Network error. Please try again.');
    }
  };

  // Fetch pending withdrawals
  const fetchPendingWithdrawals = async () => {
    try {
      const token = getSessionToken();
      if (!token) {
        setWithdrawalError('Authentication token not found');
        onLogout(); // Auto logout if no token
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/mlm/withdrawal/pending/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setPendingWithdrawals(data.data);
      } else {
        setWithdrawalError(data.message || 'Failed to fetch pending withdrawals');
      }
    } catch (err) {
      setWithdrawalError('Network error. Please try again.');
    }
  };

  // Fetch rejected withdrawals
  const fetchRejectedWithdrawals = async () => {
    try {
      const token = getSessionToken();
      if (!token) {
        setWithdrawalError('Authentication token not found');
        onLogout(); // Auto logout if no token
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/mlm/withdrawal/rejected/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setRejectedWithdrawals(data.data);
      } else {
        setWithdrawalError(data.message || 'Failed to fetch rejected withdrawals');
      }
    } catch (err) {
      setWithdrawalError('Network error. Please try again.');
    }
  };

  // Fetch all withdrawal history
  const fetchWithdrawalHistory = async () => {
    setIsLoadingWithdrawals(true);
    setWithdrawalError('');

    try {
      await Promise.all([
        fetchApprovedWithdrawals(),
        fetchPendingWithdrawals(),
        fetchRejectedWithdrawals()
      ]);
    } catch (err) {
      setWithdrawalError('Failed to fetch withdrawal data');
    } finally {
      setIsLoadingWithdrawals(false);
    }
  };

  // Fetch referral link data
  const fetchReferralLinkData = async () => {
    setIsLoadingReferralLink(true);
    setReferralLinkError('');

    try {
      const token = getSessionToken();
      if (!token) {
        setReferralLinkError('Authentication token not found');
        onLogout(); // Auto logout if no token
        setIsLoadingReferralLink(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/mlm/referral/link', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setReferralLinkData(data.data);
      } else {
        setReferralLinkError(data.message || 'Failed to fetch referral link data');
      }
    } catch (err) {
      setReferralLinkError('Network error. Please try again.');
    } finally {
      setIsLoadingReferralLink(false);
    }
  };

  // Fetch TPin payments data
  const fetchTpinPayments = async () => {
    setIsLoadingTpinPayments(true);
    setTpinPaymentError('');
    
    try {
      const token = getSessionToken();
      if (!token) {
        setTpinPaymentError('Authentication token not found');
        onLogout(); // Auto logout if no token
        setIsLoadingTpinPayments(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/tpin/payments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setTpinPaymentData(data.data);
        setTpinPaymentError('');
      } else {
        setTpinPaymentError(data.message || 'Failed to fetch payment data');
        setTpinPaymentData(null);
      }
    } catch (err) {
      setTpinPaymentError('Network error. Please try again.');
      setTpinPaymentData(null);
    } finally {
      setIsLoadingTpinPayments(false);
    }
  };

  // Handle Get TPin card click - fetch TPin status
  const handleGetTpinClick = async () => {
    setIsLoadingTpinStatus(true);
    setShowGetTpinModal(true);
    setTpinStatusData(null);

    try {
      const token = getSessionToken();
      if (!token) {
        setTpinMessage({ type: 'error', text: 'Authentication token not found' });
        onLogout(); // Auto logout if no token
        setIsLoadingTpinStatus(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/tpin/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setTpinStatusData(data.data);
        setTpinMessage({ type: '', text: '' });
      } else {
        setTpinMessage({ type: 'error', text: data.message || 'Failed to fetch TPin status' });
      }
    } catch (err) {
      setTpinMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoadingTpinStatus(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Validate password strength
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const token = getSessionToken();
      if (!token) {
        setPasswordError('Authentication token not found');
        onLogout(); // Auto logout if no token
        setIsChangingPassword(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/auth/account/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setPasswordSuccess('');
        }, 5000);
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('Network error. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      const token = getSessionToken();
      if (!token) {
        setProfileError('Authentication token not found');
        onLogout(); // Auto logout if no token
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/auth/account/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        const profile = data.data;
        setProfileData({
          name: profile.name || '',
          email: profile.email || '',
          mobile: profile.mobile || '',
          aadhaarNumber: profile.aadhaarNumber || '',
          panNumber: profile.panNumber || '',
          address: {
            street: profile.address?.street || '',
            city: profile.address?.city || '',
            state: profile.address?.state || '',
            pincode: profile.address?.pincode || '',
            country: profile.address?.country || 'India'
          }
        });
        setProfileError('');
      } else {
        setProfileError(data.message || 'Failed to fetch profile data');
      }
    } catch (err) {
      setProfileError('Network error. Please try again.');
    }
  };

  // Handle investment click
  const handleInvestmentClick = () => {
    setShowInvestmentModal(true);
    setSelectedInvestmentCurrency('');
    setShowInvestmentPayment(false);
    setInvestmentMessage({ type: '', text: '' });
  };

  // Handle investment currency selection
  const handleInvestmentCurrencySelect = (currency: string) => {
    setSelectedInvestmentCurrency(currency);
    setShowInvestmentModal(false);
    setShowInvestmentPayment(true);
    setInvestmentPaymentID('');
    setInvestmentPaymentImage(null);
    setInvestmentPaymentImagePreview('');
  };

  // Handle investment image upload
  const handleInvestmentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvestmentPaymentImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setInvestmentPaymentImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch investment wallet data
  const fetchInvestmentWallet = async () => {
    setIsLoadingInvestmentWallet(true);
    setInvestmentWalletError('');
    
    try {
      const token = getSessionToken();
      if (!token) {
        setInvestmentWalletError('Authentication token not found');
        onLogout();
        setIsLoadingInvestmentWallet(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/investment/wallet', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setInvestmentWalletData(data.data);
      } else {
        setInvestmentWalletError(data.message || 'Failed to fetch investment wallet data');
      }
    } catch (err) {
      setInvestmentWalletError('Network error. Please try again.');
    } finally {
      setIsLoadingInvestmentWallet(false);
    }
  };

  // Fetch investment history data
  const fetchInvestmentHistory = async () => {
    setIsLoadingInvestmentHistory(true);
    setInvestmentHistoryError('');
    
    try {
      const token = getSessionToken();
      if (!token) {
        setInvestmentHistoryError('Authentication token not found');
        onLogout();
        setIsLoadingInvestmentHistory(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/investment/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setInvestmentHistoryData(data.data);
      } else {
        setInvestmentHistoryError(data.message || 'Failed to fetch investment history');
      }
    } catch (err) {
      setInvestmentHistoryError('Network error. Please try again.');
    } finally {
      setIsLoadingInvestmentHistory(false);
    }
  };

  // Handle investment submission
  const handleInvestmentSubmit = async () => {
    if (!investmentPaymentID.trim()) {
      setInvestmentMessage({ type: 'error', text: 'Please enter payment ID' });
      return;
    }

    if (!investmentPaymentImage) {
      setInvestmentMessage({ type: 'error', text: 'Please upload payment proof image' });
      return;
    }

    setIsProcessingInvestment(true);
    setInvestmentMessage({ type: '', text: '' });

    try {
      const token = getSessionToken();
      if (!token) {
        setInvestmentMessage({ type: 'error', text: 'Authentication token not found' });
        onLogout();
        setIsProcessingInvestment(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('amount', selectedInvestmentCurrency === 'inr' ? '5999' : '5999');
      formData.append('currency', selectedInvestmentCurrency === 'inr' ? 'INR' : 'USDT');
      formData.append('paymentId', investmentPaymentID);
      formData.append('screenshot', investmentPaymentImage);
      formData.append('investmentType', 'premium_plan');

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/investment/recharge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setInvestmentMessage({ 
          type: 'success', 
          text: `🎉 Investment Request Submitted Successfully! 💰\n\nYour ${selectedInvestmentCurrency === 'inr' ? '₹5,999' : '$72'} investment has been received and is being processed.\n\n✅ Payment ID: ${investmentPaymentID}\n⏰ Processing Time: 24-48 hours\n📧 You'll receive confirmation via email\n\nThank you for investing with us! 🚀` 
        });
        
        // Reset form
        setInvestmentPaymentID('');
        setInvestmentPaymentImage(null);
        setInvestmentPaymentImagePreview('');
        
        // Refresh user data to show updated investment info
        fetchUserData();
        
        // Close modal after 5 seconds to give user time to read the message
        setTimeout(() => {
          setShowInvestmentPayment(false);
          setInvestmentMessage({ type: '', text: '' });
        }, 5000);
      } else {
        setInvestmentMessage({ type: 'error', text: data.message || 'Failed to submit investment request. Please try again.' });
      }
    } catch (err) {
      setInvestmentMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsProcessingInvestment(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!profileData.name.trim()) {
      setProfileError('Name is required');
      return;
    }
    
    if (!profileData.email.trim()) {
      setProfileError('Email is required');
      return;
    }

    setIsUpdatingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const token = getSessionToken();
      if (!token) {
        setProfileError('Authentication token not found');
        onLogout(); // Auto logout if no token
        setIsUpdatingProfile(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/auth/account/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          userId: userData?._id
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setProfileSuccess('Profile updated successfully!');
        // Refresh user data in the main dashboard
        fetchUserData();
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setProfileSuccess('');
        }, 5000);
      } else {
        setProfileError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError('Network error. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Generate random coin value between 0.10 and 0.90 for buying
  const generateRandomCoinValue = () => {
    const min = 0.10;
    const max = 0.90;
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  };

  // Generate random coin value between 0.10 and 0.50 for selling
  const generateRandomSellCoinValue = () => {
    const min = 0.10;
    const max = 0.50;
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  };

  // Handle crypto buy
  const handleCryptoBuy = () => {
    setShowCryptoBuyModal(true);
    setCryptoBuyQuantity('');
    setCryptoBuyCurrentCoinValue(generateRandomCoinValue());
    setCryptoTradeMessage({ type: '', text: '' });
    
    // Start coin value fluctuation
    const interval = setInterval(() => {
      setCryptoBuyCurrentCoinValue(generateRandomCoinValue());
    }, 2000); // Update every 2 seconds
    
    // Store interval ID to clear it when modal closes
    (window as any).coinValueInterval = interval;
  };

  // Handle crypto sell
  const handleCryptoSell = () => {
    setShowCryptoSellModal(true);
    setCryptoSellQuantity('');
    setCryptoSellCurrentCoinValue(generateRandomSellCoinValue());
    setCryptoTradeMessage({ type: '', text: '' });
    
    // Start coin value fluctuation for sell
    const sellInterval = setInterval(() => {
      setCryptoSellCurrentCoinValue(generateRandomSellCoinValue());
    }, 2000); // Update every 2 seconds
    
    // Store interval ID to clear it when modal closes
    (window as any).coinSellValueInterval = sellInterval;
  };

  // Clear coin value interval when buy modal is closed
  const handleCryptoBuyModalClose = () => {
    setShowCryptoBuyModal(false);
    if ((window as any).coinValueInterval) {
      clearInterval((window as any).coinValueInterval);
    }
  };

  // Clear coin value interval when sell modal is closed
  const handleCryptoSellModalClose = () => {
    setShowCryptoSellModal(false);
    if ((window as any).coinSellValueInterval) {
      clearInterval((window as any).coinSellValueInterval);
    }
  };

  // Handle crypto buy submit
  const handleCryptoBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cryptoBuyQuantity) {
      setCryptoTradeMessage({ type: 'error', text: 'Please enter the quantity.' });
      return;
    }

    const quantity = parseInt(cryptoBuyQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      setCryptoTradeMessage({ type: 'error', text: 'Please enter a valid quantity.' });
      return;
    }

    setIsProcessingCryptoBuy(true);
    setCryptoTradeMessage({ type: '', text: '' });

    try {
      const token = getSessionToken();
      if (!token) {
        setCryptoTradeMessage({ type: 'error', text: 'Authentication token not found' });
        onLogout();
        setIsProcessingCryptoBuy(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/crypto/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coinValue: cryptoBuyCurrentCoinValue,
          quantity: quantity
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setCryptoTradeMessage({ type: 'success', text: 'Crypto purchase successful! Coins have been added to your wallet.' });
        setShowCryptoBuyModal(false);
        
        // Clear coin value interval
        if ((window as any).coinValueInterval) {
          clearInterval((window as any).coinValueInterval);
        }
        
        fetchUserData(); // Refresh user data
        
        setTimeout(() => {
          setCryptoTradeMessage({ type: '', text: '' });
        }, 5000);
      } else {
        setCryptoTradeMessage({ type: 'error', text: data.message || 'Failed to purchase crypto. Please try again.' });
      }
    } catch (err) {
      setCryptoTradeMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsProcessingCryptoBuy(false);
    }
  };

  // Handle crypto sell submit
  const handleCryptoSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cryptoSellQuantity) {
      setCryptoTradeMessage({ type: 'error', text: 'Please enter the quantity to sell.' });
      return;
    }

    const quantity = parseInt(cryptoSellQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      setCryptoTradeMessage({ type: 'error', text: 'Please enter a valid quantity.' });
      return;
    }

    const currentBalance = userData?.cryptoWallet?.balance || 0;
    if (quantity > currentBalance) {
      setCryptoTradeMessage({ type: 'error', text: 'Insufficient crypto balance.' });
      return;
    }

    setIsProcessingCryptoSell(true);
    setCryptoTradeMessage({ type: '', text: '' });

    try {
      const token = getSessionToken();
      if (!token) {
        setCryptoTradeMessage({ type: 'error', text: 'Authentication token not found' });
        onLogout();
        setIsProcessingCryptoSell(false);
        return;
      }

      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/crypto/sell', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coinValue: cryptoSellCurrentCoinValue,
          quantity: quantity
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setCryptoTradeMessage({ type: 'success', text: 'Crypto sold successfully! Amount has been credited to your income wallet.' });
        setShowCryptoSellModal(false);
        
        // Clear coin value interval
        if ((window as any).coinSellValueInterval) {
          clearInterval((window as any).coinSellValueInterval);
        }
        
        fetchUserData(); // Refresh user data
        
        setTimeout(() => {
          setCryptoTradeMessage({ type: '', text: '' });
        }, 5000);
      } else {
        setCryptoTradeMessage({ type: 'error', text: data.message || 'Failed to sell crypto. Please try again.' });
      }
    } catch (err) {
      setCryptoTradeMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsProcessingCryptoSell(false);
    }
  };

  const fetchCryptoTransactions = async () => {
    setIsLoadingCryptoTransactions(true);
    setCryptoTransactionsError('');
    
    try {
      const token = getSessionToken();
      const response = await fetch('https://7cvccltb-3111.inc1.devtunnels.ms/api/crypto/transactions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setCryptoTransactions(data.data);
      } else {
        setCryptoTransactionsError(data.message || 'Failed to fetch crypto transactions');
      }
    } catch (err) {
      setCryptoTransactionsError('Network error. Please check your connection.');
    } finally {
      setIsLoadingCryptoTransactions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={handleLogout}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#f3f4f6] overflow-hidden">
      {/* Sidebar for desktop and mobile */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed z-50 top-0 left-0 h-screen bg-[#0d4d87] flex flex-col transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:z-10
          ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'} w-64`}
      >
        <div className={`flex items-center gap-2 border-b border-blue-900 ${sidebarCollapsed ? 'px-3 py-4' : 'px-6 py-6'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">FLT</span>
              </div>
              <div className="text-white">
                <div className="font-bold text-sm leading-tight">ForLifeTrading</div>
                <div className="text-xs opacity-80">India</div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FLT</span>
            </div>
          )}
          {/* Toggle button for desktop */}
          {/* <button
            className="ml-auto text-white hidden lg:block"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button> */}
          {/* Close button for mobile */}
          <button
            className="ml-auto text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 py-4">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.label;
            return (
              <div key={item.label} className="relative group">
                <button
                  onClick={() => {
                    setActiveMenu(item.label);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center text-left text-white font-medium transition-colors ${
                    sidebarCollapsed 
                      ? 'gap-0 px-3 py-3 justify-center' 
                      : 'gap-3 px-6 py-3'
                  } ${
                    isActive
                      ? 'bg-[#d4f7c5] text-[#0d4d87] rounded-r-full font-bold'
                      : 'hover:bg-blue-800/80'
                  }`}
                  style={isActive ? { borderLeft: '6px solid #8bc34a' } : {}}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#0d4d87]' : 'text-white'}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className={`mt-auto border-t border-blue-900 ${sidebarCollapsed ? 'px-3 py-4' : 'px-6 py-4'}`}>
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`flex items-center text-white hover:text-red-600 font-medium ${
                sidebarCollapsed ? 'gap-0 justify-center w-full' : 'gap-2'
              }`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Top Bar */}
        <header className="flex items-center justify-between bg-[#0d4d87] h-16 px-6 shadow sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger menu for mobile */}
            <button
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            {/* Desktop sidebar toggle */}
            <button
              className="hidden lg:block text-white hover:bg-blue-600 p-1 rounded"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-white font-bold text-lg">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white font-medium hidden md:block">Welcome {userData?.userId}</span>
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border-2 border-blue-200">
              <User className="h-6 w-6 text-[#0d4d87]" />
            </div>
          </div>
        </header>
        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-[#f3f4f6] overflow-y-auto">
          {activeMenu === 'Dashboard' ? (
            <>
              {/* Top Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* User Info */}
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-5 flex items-center gap-3 sm:gap-4 min-h-[100px] sm:min-h-[110px]">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm sm:text-base lg:text-lg text-[#222] leading-tight truncate">{userData?.name}</div>
                    <div className="text-xs sm:text-sm text-gray-700 truncate">User Id: {userData?.userId}</div>
                    <div className="text-xs sm:text-sm text-gray-700 truncate">Email: {userData?.email}</div>
                  </div>
                </div>
                {/* Account Status */}
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-5 flex flex-col justify-center min-h-[100px] sm:min-h-[110px]">
                  <div className="font-semibold text-gray-700 mb-1 text-sm sm:text-base">Account Status</div>
                  <div className="text-center">
                    {userData?.isActive ? (
                      <span className="text-green-600 font-bold text-base sm:text-lg">Active</span>
                    ) : (
                      <>
                        <span className="text-red-600 font-bold text-base sm:text-lg">Inactive</span>
                        <br />
                        <span 
                          onClick={handleActivateTpinClick}
                          className="text-xs sm:text-sm text-red-500 font-medium cursor-pointer hover:underline"
                        >
                          Click here to Activate the Account
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* Total Income */}
                <div className="rounded-lg shadow p-3 sm:p-4 lg:p-5 flex flex-col justify-center min-h-[100px] sm:min-h-[110px] bg-gradient-to-r from-[#ff9800] to-[#ffb74d] text-white sm:col-span-2 lg:col-span-1">
                  <div className="font-semibold text-white mb-1 text-sm sm:text-base">Total Income</div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    ₹{userData?.incomeWallet?.totalEarnings?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {/* My Team */}
                <div className="bg-[#1856a7] rounded-lg shadow p-3 sm:p-4 text-white flex flex-col items-center min-h-[100px] sm:min-h-[110px]">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mb-2" />
                  <div className="font-semibold text-sm sm:text-base text-center">My Team</div>
                  <div className="text-xs mt-1 text-center">Total Team : {userData?.teamSize || 0}</div>
                  <div className="text-xs text-center">Rank : {userData?.rank || 'Newcomer'}</div>
                  <div className="text-xs text-center">Referrals : {userData?.referrals?.length || 0}</div>
                </div>
                {/* My Direct */}
                <div className="bg-[#1856a7] rounded-lg shadow p-3 sm:p-4 text-white flex flex-col items-center min-h-[100px] sm:min-h-[110px]">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mb-2" />
                  <div className="font-semibold text-sm sm:text-base text-center">My Direct</div>
                  <div className="text-xs mt-1 text-center">Active : {userData?.downline?.length || 0}</div>
                  <div className="text-xs text-center">Total Users : {userData?.downline?.length || 0}</div>
                </div>
                {/* My Single Leg Team */}
                {/* <div className="bg-[#1856a7] rounded-lg shadow p-3 sm:p-4 text-white flex flex-col items-center min-h-[100px] sm:min-h-[110px] sm:col-span-2 lg:col-span-1">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mb-2" />
                  <div className="font-semibold text-sm sm:text-base text-center">My Single Leg Team</div>
                  <div className="text-xs mt-1 text-center">Active(12 USDT) : 0</div>
                  <div className="text-xs text-center">Active(24 USDT) : 0</div>
                  <div className="text-xs text-center">Active(48 USDT) : 0</div>
                  <div className="text-xs text-center">Active(96 USDT) : 0</div>
                  <div className="text-xs text-center">Active(192 USDT) : 0</div>
                  <div className="text-xs text-center">Inactive : 0</div>
                </div> */}
                {/* Level Income */}
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col items-center min-h-[100px] sm:min-h-[110px]">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mb-2 text-[#1856a7]" />
                  <div className="font-semibold text-[#1856a7] text-sm sm:text-base text-center">Level Income</div>
                  <div className="text-base sm:text-lg font-bold text-[#1856a7]">0.00</div>
                </div>
                {/* Direct Bonus */}
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col items-center min-h-[100px] sm:min-h-[110px]">
                  <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mb-2 text-[#1856a7]" />
                  <div className="font-semibold text-[#1856a7] text-sm sm:text-base text-center">Direct Bonus</div>
                  <div className="text-base sm:text-lg font-bold text-[#1856a7]">
                    ₹{userData?.incomeWallet?.directIncome?.toFixed(2) || '0.00'}
                  </div>
                </div>
                {/* Income Wallet */}
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col items-center min-h-[100px] sm:min-h-[110px]">
                  <Wallet className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mb-2 text-[#1856a7]" />
                  <div className="font-semibold text-[#1856a7] text-sm sm:text-base text-center">Income Wallet</div>
                  <div className="text-base sm:text-lg font-bold text-[#1856a7]">
                    ₹{userData?.incomeWallet?.balance?.toFixed(2) || '0.00'}
                  </div>
                </div>
                {/* Investment Wallet */}
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col items-center justify-center min-h-[100px] sm:min-h-[110px] relative">
                  {/* Percentage Change Indicator - Only show if balance > 0 */}
                  {(userData?.investmentWallet?.balance || 0) > 0 && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold flex items-center transition-all duration-300 ${
                      investmentPercentageChange >= 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {investmentPercentageChange >= 0 ? (
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          +{investmentPercentageChange.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          {investmentPercentageChange.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                  
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mb-2 text-[#1856a7]" />
                  <div className="font-semibold text-[#1856a7] text-sm sm:text-base text-center">Investment Wallet</div>
                  <div className="flex flex-col items-center">
                    <div className={`text-base sm:text-lg font-bold mb-1 transition-all duration-300 ${
                      (userData?.investmentWallet?.balance || 0) > 0 && investmentPercentageChange >= 0 ? 'text-green-600' : 
                      (userData?.investmentWallet?.balance || 0) > 0 && investmentPercentageChange < 0 ? 'text-red-600' : 'text-[#1856a7]'
                    } ${balanceAnimating ? 'transform scale-110' : ''} flex items-center justify-center gap-1`}>
                      <span>₹{displayInvestmentBalance !== null 
                        ? displayInvestmentBalance.toFixed(2) 
                        : userData?.investmentWallet?.balance?.toFixed(2) || '0.00'}</span>
                      {(userData?.investmentWallet?.balance || 0) > 0 && investmentPercentageChange > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (userData?.investmentWallet?.balance || 0) > 0 && investmentPercentageChange < 0 ? (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                    {(userData?.investmentWallet?.balance || 0) > 0 && (
                      <div className={`text-xs font-medium ${
                        investmentPercentageChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {investmentPercentageChange > 0 ? '+' : ''}{investmentPercentageChange.toFixed(2)}%
                      </div>
                    )}
                  </div>
                  {(!userData?.investmentWallet?.balance || userData.investmentWallet.balance === 0) && (
                    <button
                      onClick={handleInvestmentClick}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Click to Invest
                    </button>
                  )}
                </div>
                {/* Crypto Wallet */}
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col items-center min-h-[140px] sm:min-h-[150px] relative">
                  {/* Percentage Change Indicator - Only show if balance > 0 */}
                  {(userData?.cryptoWallet?.balance || 0) > 0 && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold flex items-center transition-all duration-300 ${
                      cryptoPercentageChange >= 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {cryptoPercentageChange >= 0 ? (
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          +{cryptoPercentageChange.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          {cryptoPercentageChange.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mb-2 rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src="/fftcoin.jpeg" 
                      alt="FFT Coin" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-semibold text-[#1856a7] text-sm sm:text-base text-center">Crypto Wallet</div>
                  <div className="flex flex-col items-center mb-3">
                    <div className={`text-base sm:text-lg font-bold mb-1 transition-all duration-300 ${
                      (userData?.cryptoWallet?.balance || 0) > 0 && cryptoPercentageChange >= 0 ? 'text-green-600' : 
                      (userData?.cryptoWallet?.balance || 0) > 0 && cryptoPercentageChange < 0 ? 'text-red-600' : 'text-[#1856a7]'
                    } ${balanceAnimating ? 'transform scale-110' : ''} flex items-center justify-center gap-1`}>
                      <span>
                        {displayCryptoBalance !== null 
                          ? displayCryptoBalance.toFixed(2) 
                          : userData?.cryptoWallet?.balance?.toFixed(2) || '0.00'} FFT Coin
                      </span>
                      {(userData?.cryptoWallet?.balance || 0) > 0 && cryptoPercentageChange > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (userData?.cryptoWallet?.balance || 0) > 0 && cryptoPercentageChange < 0 ? (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                    {(userData?.cryptoWallet?.balance || 0) > 0 && (
                      <div className={`text-xs font-medium ${
                        cryptoPercentageChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {cryptoPercentageChange > 0 ? '+' : ''}{cryptoPercentageChange.toFixed(2)}%
                      </div>
                    )}
                  </div>
                  
                  {/* Buy/Sell Buttons */}
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleCryptoBuy}
                      disabled={!userData?.cryptoWallet?.balance || userData.cryptoWallet.balance <= 0}
                      className="flex-1 bg-green-600 text-white px-2 py-1 text-xs rounded hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Buy
                    </button>
                    <button
                      onClick={handleCryptoSell}
                      disabled={!userData?.cryptoWallet?.balance || userData.cryptoWallet.balance <= 0}
                      className="flex-1 bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Sell
                    </button>
                  </div>
                </div>
                {/* Total Withdraw */}
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col items-center min-h-[100px] sm:min-h-[110px]">
                  <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mb-2 text-[#1856a7]" />
                  <div className="font-semibold text-[#1856a7] text-sm sm:text-base text-center">Total Withdraw</div>
                  <div className="text-base sm:text-lg font-bold text-[#1856a7]">
                    ₹{userData?.incomeWallet?.withdrawnAmount?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
              
              {/* Investment Performance Chart */}
              <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6 mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Investment Performance</h3>
                <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full">
                  <ReactApexChart 
                    options={investmentChartOptions}
                    series={investmentChartSeries}
                    type="area"
                    height="100%"
                    width="100%"
                  />
                </div>
              </div>
              
              {/* MLM Coin Price Chart */}
              <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6 mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">FFT Coin Price (Live)</h3>
                <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full">
                  <ReactApexChart 
                    options={coinChartOptions}
                    series={coinChartSeries}
                    type="candlestick"
                    height="100%"
                    width="100%"
                  />
                </div>
                <div className="mt-3 text-sm text-gray-500 flex flex-wrap items-center justify-center">
                  {/* <span className="mr-1 sm:mr-2">Price fluctuates between</span>
                  <span className="font-medium text-blue-600">₹0.10</span>
                  <span className="mx-1">and</span>
                  <span className="font-medium text-blue-600">₹1.00</span> */}
                </div>
              </div>
            </>
          ) : activeMenu === 'My Investment' ? (
            /* My Investment Section */
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">My Investment</h1>
                <p className="text-purple-100">Manage and track your investment portfolio</p>
              </div>

              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex space-x-1 sm:space-x-4">
                  <button
                    onClick={() => setActiveInvestmentTab('wallet')}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeInvestmentTab === 'wallet'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Investment Wallet
                  </button>
                  <button
                    onClick={() => setActiveInvestmentTab('history')}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeInvestmentTab === 'history'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Investment History
                  </button>
                </div>
              </div>

              {/* Investment Wallet Tab */}
              {activeInvestmentTab === 'wallet' && (
                <div className="space-y-6">
                  {/* Loading State */}
                  {isLoadingInvestmentWallet && (
                    <div className="bg-white rounded-lg shadow p-8">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-gray-600">Loading investment wallet...</span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {investmentWalletError && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="text-center">
                        <div className="text-red-500 mb-4">
                          <BarChart3 className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-red-600 mb-4">{investmentWalletError}</p>
                        <button 
                          onClick={fetchInvestmentWallet}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Investment Wallet Data */}
                  {investmentWalletData && !isLoadingInvestmentWallet && (
                    <div className="space-y-6">
                      {/* Wallet Summary Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <div className="text-sm text-green-800 font-medium mb-1">Wallet Balance</div>
                          <div className="text-2xl font-bold text-green-700">
                            ₹{investmentWalletData.wallet?.balance?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <div className="text-sm text-blue-800 font-medium mb-1">Total Invested</div>
                          <div className="text-2xl font-bold text-blue-700">
                            ₹{investmentWalletData.wallet?.totalInvested?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
                          <div className="text-sm text-purple-800 font-medium mb-1">Total Returns</div>
                          <div className="text-2xl font-bold text-purple-700">
                            ₹{investmentWalletData.wallet?.totalReturns?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                          <div className="text-sm text-amber-800 font-medium mb-1">Total Matured</div>
                          <div className="text-2xl font-bold text-amber-700">
                            ₹{investmentWalletData.wallet?.totalMatured?.toLocaleString() || '0'}
                          </div>
                        </div>
                      </div>

                      {/* Investment Opportunity */}
                      {investmentWalletData.canInvest && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Investment Opportunity</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Investment Amount</div>
                              <div className="text-xl font-bold text-blue-600">
                                ₹{investmentWalletData.investmentAmount?.toLocaleString() || '0'}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Expected Return</div>
                              <div className="text-xl font-bold text-green-600">
                                ₹{investmentWalletData.expectedReturn?.toLocaleString() || '0'}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Investment Period</div>
                              <div className="text-xl font-bold text-purple-600">
                                {investmentWalletData.investmentPeriod || '0'} days
                              </div>
                            </div>
                          </div>
                          {investmentWalletData.wallet?.balance >= investmentWalletData.investmentAmount && (
                            <div className="mt-4 text-center">
                              {/* <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
                                Start Investment
                              </button> */}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Active Investment */}
                      {investmentWalletData.activeInvestment && (
                        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Investment</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">Amount Invested</div>
                              <div className="text-lg font-bold text-blue-600">
                                ₹{investmentWalletData.activeInvestment.amount?.toLocaleString() || '0'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Expected Return</div>
                              <div className="text-lg font-bold text-green-600">
                                ₹{investmentWalletData.activeInvestment.expectedReturn?.toLocaleString() || '0'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Days Remaining</div>
                              <div className="text-lg font-bold text-purple-600">
                                {investmentWalletData.activeInvestment.daysRemaining || '0'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pending Recharges */}
                      {investmentWalletData.pendingRecharges && investmentWalletData.pendingRecharges.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Recharges</h3>
                          <div className="space-y-3">
                            {investmentWalletData.pendingRecharges.map((recharge: any, index: number) => (
                              <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <div className="text-sm text-gray-600">Amount</div>
                                    <div className="font-semibold">₹{recharge.amount?.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600">Payment ID</div>
                                    <div className="font-semibold">{recharge.paymentId}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600">Date</div>
                                    <div className="font-semibold">{new Date(recharge.date).toLocaleDateString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600">Status</div>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                      Pending
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Investment History Tab */}
              {activeInvestmentTab === 'history' && (
                <div className="space-y-6">
                  {/* Loading State */}
                  {isLoadingInvestmentHistory && (
                    <div className="bg-white rounded-lg shadow p-8">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-gray-600">Loading investment history...</span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {investmentHistoryError && (
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="text-center">
                        <div className="text-red-500 mb-4">
                          <BarChart3 className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-red-600 mb-4">{investmentHistoryError}</p>
                        <button 
                          onClick={fetchInvestmentHistory}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Investment History Data */}
                  {investmentHistoryData && !isLoadingInvestmentHistory && (
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Investment Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Total Investments</div>
                            <div className="text-lg font-bold text-blue-600">
                              {investmentHistoryData.summary?.totalInvestments || 0}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Total Invested</div>
                            <div className="text-lg font-bold text-green-600">
                              ₹{investmentHistoryData.summary?.totalInvested?.toLocaleString() || '0'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Total Returns</div>
                            <div className="text-lg font-bold text-purple-600">
                              ₹{investmentHistoryData.summary?.totalReturns?.toLocaleString() || '0'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Total Matured</div>
                            <div className="text-lg font-bold text-amber-600">
                              ₹{investmentHistoryData.summary?.totalMatured?.toLocaleString() || '0'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Active</div>
                            <div className="text-lg font-bold text-blue-600">
                              {investmentHistoryData.summary?.activeInvestments || 0}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Matured</div>
                            <div className="text-lg font-bold text-green-600">
                              {investmentHistoryData.summary?.maturedInvestments || 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recharge History */}
                      {investmentHistoryData.rechargeHistory && investmentHistoryData.rechargeHistory.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recharge History</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved Date</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screenshot</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                                {investmentHistoryData.rechargeHistory.map((recharge: any, index: number) => (
                          <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {recharge.paymentId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {recharge.amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {recharge.currency}
                                    </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        recharge.status === 'verified' 
                                          ? 'bg-green-100 text-green-800'
                                          : recharge.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {recharge.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(recharge.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {recharge.approvedAt ? new Date(recharge.approvedAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      {recharge.screenshotUrl ? (
                                        <a 
                                          href={recharge.screenshotUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                          View
                                        </a>
                                      ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

                      {/* Empty State */}
                      {(!investmentHistoryData.rechargeHistory || investmentHistoryData.rechargeHistory.length === 0) &&
                       (!investmentHistoryData.investments || investmentHistoryData.investments.length === 0) && (
                        <div className="text-center py-8">
                          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No investment history found.</p>
                          <p className="text-sm text-gray-500 mt-2">Start investing to see your history here.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeMenu === 'Generate TPin' ? (
            /* Generate TPin Section */
            <div className="space-y-4 sm:space-y-6">
              {/* TPin Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Get TPin Card */}
                <div 
                  onClick={handleGetTpinClick}
                  className={`bg-white rounded-lg shadow p-4 sm:p-6 cursor-pointer transition-all duration-200 border-2 ${
                    activeTpinCard === 'Get TPin' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${
                      activeTpinCard === 'Get TPin' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                      <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className={`font-semibold text-sm sm:text-base ${
                      activeTpinCard === 'Get TPin' ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      Get TPin
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      View and manage your existing TPins
                    </p>
                  </div>
                </div>

                {/* Generate TPin Card */}
                <div 
                  onClick={handleGenerateClick}
                  className={`bg-white rounded-lg shadow p-4 sm:p-6 cursor-pointer transition-all duration-200 border-2 ${
                    activeTpinCard === 'Generate TPin' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${
                      activeTpinCard === 'Generate TPin' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                      <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className={`font-semibold text-sm sm:text-base ${
                      activeTpinCard === 'Generate TPin' ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      Generate TPin
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Create new TPins for your account
                    </p>
                  </div>
                </div>

                {/* Transfer TPin Card */}
                <div 
                  onClick={() => setActiveTpinCard('Transfer TPin')}
                  className={`bg-white rounded-lg shadow p-4 sm:p-6 cursor-pointer transition-all duration-200 border-2 ${
                    activeTpinCard === 'Transfer TPin' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent hover:border-gray-300'
                  } sm:col-span-2 lg:col-span-1`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${
                      activeTpinCard === 'Transfer TPin' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                      <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className={`font-semibold text-sm sm:text-base ${
                      activeTpinCard === 'Transfer TPin' ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      Transfer TPin
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Transfer your TPins to other users
                    </p>
                  </div>
                </div>
              </div>

              {/* Content based on selected card */}
              <div className="bg-white rounded-lg shadow p-6">
                {activeTpinCard === 'Get TPin' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">MLM Coin Price Chart</h3>
                    <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full">
                      <ReactApexChart 
                        options={coinChartOptions}
                        series={coinChartSeries}
                        type="candlestick"
                        height="100%"
                        width="100%"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        MLM Coin price fluctuates between ₹0.10 (10 paisa) and ₹1.00 based on market demand.
                      </p>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="text-center bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-500">Current Price</div>
                          <div className={`text-lg font-bold ${
                            coinChartSeries[0]?.data?.length > 0 && 
                            coinChartSeries[0].data[coinChartSeries[0].data.length - 1].y[3] > 
                            coinChartSeries[0].data[coinChartSeries[0].data.length - 1].y[0] 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            ₹{coinChartSeries[0]?.data?.length > 0 
                              ? coinChartSeries[0].data[coinChartSeries[0].data.length - 1].y[3].toFixed(2)
                              : '0.00'}
                      </div>
                      </div>
                        <div className="text-center bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-500">24h High</div>
                          <div className="text-lg font-bold text-green-600">
                            ₹{coinChartSeries[0]?.data?.length > 0 
                              ? Math.max(...coinChartSeries[0].data.slice(-24).map((item: any) => item.y[1])).toFixed(2)
                              : '0.00'}
                          </div>
                        </div>
                        <div className="text-center bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-500">24h Low</div>
                          <div className="text-lg font-bold text-red-600">
                            ₹{coinChartSeries[0]?.data?.length > 0 
                              ? Math.min(...coinChartSeries[0].data.slice(-24).map((item: any) => item.y[2])).toFixed(2)
                              : '0.00'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTpinCard === 'Transfer TPin' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Transfer TPin</h3>
                    <p className="text-gray-600 mb-6">Transfer your TPins to other users in your network.</p>
                    
                    <form onSubmit={handleTpinTransfer} className="space-y-4">
                      <div>
                        <label htmlFor="recipientUserId" className="block text-sm font-medium text-gray-700 mb-1">
                          Recipient User ID
                        </label>
                        <input
                          id="recipientUserId"
                          type="text"
                          value={recipientUserId}
                          onChange={(e) => setRecipientUserId(e.target.value)}
                          placeholder="Enter recipient's User ID"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isTransferringTpin}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="transferTpinCode" className="block text-sm font-medium text-gray-700 mb-1">
                          TPin Code to Transfer
                        </label>
                        <input
                          id="transferTpinCode"
                          type="text"
                          value={transferTpinCode}
                          onChange={(e) => setTransferTpinCode(e.target.value.toUpperCase())}
                          placeholder="Enter TPin code to transfer"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-center uppercase"
                          maxLength={10}
                          disabled={isTransferringTpin}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the TPin code you want to transfer
                        </p>
                      </div>

                      {/* Error/Success Message */}
                      {transferMessage.text && (
                        <div className={`p-3 rounded-md text-sm ${
                          transferMessage.type === 'error' 
                            ? 'bg-red-50 border border-red-200 text-red-600' 
                            : 'bg-green-50 border border-green-200 text-green-600'
                        }`}>
                          {transferMessage.text}
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isTransferringTpin || !transferTpinCode.trim() || !recipientUserId.trim()}
                          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isTransferringTpin ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Transferring...
                            </>
                          ) : (
                            <>
                              <Share2 className="h-5 w-5" />
                              <span>Transfer TPin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : activeMenu === 'Your Network' ? (
            /* MLM Section */
            <div className="space-y-6">
              {/* MLM Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                      <Network className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Your Network Dashboard</h3>
                      <p className="text-gray-600">Manage your network and track matrix structure</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(isLoadingMlm || isLoadingMatrixStructure) && (
                      <div className="flex items-center text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading...
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        fetchMlmData();
                        fetchMatrixStructure();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <Network className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveMlmTab('overview')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeMlmTab === 'overview'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Network Overview
                  </button>
                  <button
                    onClick={() => setActiveMlmTab('matrix')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeMlmTab === 'matrix'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Matrix Structure
                  </button>
                  {/* <button
                    onClick={() => setActiveMlmTab('tree')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeMlmTab === 'tree'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Tree View
                  </button> */}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-lg shadow p-6">
                
                {/* Error Handling */}
                {(mlmError || matrixStructureError) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                      <X className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700 font-medium">Error Loading Data</span>
                    </div>
                    {mlmError && <p className="text-red-600 text-sm mb-1">MLM Data: {mlmError}</p>}
                    {matrixStructureError && <p className="text-red-600 text-sm mb-1">Matrix Data: {matrixStructureError}</p>}
                    <button 
                      onClick={() => {
                        fetchMlmData();
                        fetchMatrixStructure();
                      }}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                    >
                      Retry All
                    </button>
                  </div>
                )}

                                {/* Tab Content */}
                {activeMlmTab === 'overview' && (
                  <div className="space-y-6">
                    {mlmData ? (
                      <>
                        {/* Sponsor Information */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
                          <div className="flex items-center">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <User className="h-7 w-7 text-blue-700" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-800">Sponsor Information</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                {mlmData.sponsor ? (
                                  <>
                                    <p><span className="font-medium">Name:</span> {mlmData.sponsor.name || "System Admin"}</p>
                                    <p><span className="font-medium">User ID:</span> {mlmData.sponsor.userId || "ADMIN"}</p>
                                    <p><span className="font-medium">Email:</span> {mlmData.sponsor.email || "admin@example.com"}</p>
                                  </>
                                ) : mlmData.referrer ? (
                                  <>
                                    <p><span className="font-medium">Name:</span> {mlmData.referrer.name || "System Admin"}</p>
                                    <p><span className="font-medium">User ID:</span> {mlmData.referrer.userId || "ADMIN"}</p>
                                    <p><span className="font-medium">Email:</span> {mlmData.referrer.email || "admin@example.com"}</p>
                                  </>
                                ) : (
                                  <p>System Admin (No direct sponsor)</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>


                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Loading MLM data...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Matrix Structure Tab */}
                {activeMlmTab === 'matrix' && (
                  <div className="space-y-6">
                    {matrixStructureData ? (
                      <>
                        {/* Matrix Summary */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                            Matrix Summary
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {matrixStructureData.matrixSummary?.totalLevels || 0}
                              </div>
                              <p className="text-sm text-gray-600">Total Levels</p>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                ₹{matrixStructureData.matrixSummary?.totalMatrixIncome?.toFixed(2) || '0.00'}
                              </div>
                              <p className="text-sm text-gray-600">Matrix Income</p>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {matrixStructureData.matrixSummary?.totalDownlineMembers || 0}
                              </div>
                              <p className="text-sm text-gray-600">Downline Members</p>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                ₹{matrixStructureData.matrixSummary?.activationIncome?.toFixed(2) || '0.00'}
                              </div>
                              <p className="text-sm text-gray-600">Activation Income</p>
                            </div>
                          </div>
                        </div>

                        {/* Matrix Levels */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(matrixStructureData.matrixStructure || {}).map(([level, data]: [string, any]) => (
                            <div key={level} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-blue-600 font-bold">L{level}</span>
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-gray-800">Level {level}</h5>
                                    <p className="text-sm text-gray-500">Matrix Level</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-800">
                                    {data.currentCount || 0}/{data.capacity || 0}
                                  </div>
                                  <p className="text-xs text-gray-500">Filled</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Capacity:</span>
                                  <span className="text-sm font-medium">{data.capacity || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Income per Member:</span>
                                  <span className="text-sm font-medium text-green-600">₹{data.incomePerMember || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Total Potential:</span>
                                  <span className="text-sm font-medium text-blue-600">₹{data.totalPotentialIncome?.toLocaleString() || 0}</span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((data.currentCount || 0) / (data.capacity || 1)) * 100}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                  {(((data.currentCount || 0) / (data.capacity || 1)) * 100).toFixed(1)}% Complete
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Loading matrix structure...</p>
                      </div>
                    )}
                  </div>
                )}

{/* Tree View Tab - Commented out 
                {activeMlmTab === 'tree' && (
                  <div className="space-y-6">
                    {matrixStructureData ? (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                          <Network className="h-5 w-5 mr-2 text-blue-600" />
                          Matrix Tree Visualization
                        </h4>
                        
                        Tree Structure
                        <div className="space-y-8">
                          Root Node
                          <div className="flex justify-center">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-4 shadow-lg">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <User className="h-6 w-6" />
                                </div>
                                <div className="font-semibold">{matrixStructureData.userInfo?.name}</div>
                                <div className="text-sm opacity-90">{matrixStructureData.userInfo?.userId}</div>
                                <div className="text-xs mt-1 opacity-75">
                                  Rank: {matrixStructureData.userInfo?.rank}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Loading tree visualization...</p>
                      </div>
                    )}
                  </div>
                )}
*/}

                {!activeMlmTab && (
                  <div className="text-center py-8">
                    <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a tab to view MLM data</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeMenu === 'Activation Wallet' ? (
            /* Activation Wallet Section */
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Activation Wallet</h3>
                <p className="text-gray-600 mb-6">Choose your activation package and activate with TPin.</p>
                
                {/* Activation Package Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* INR Package Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="text-center">
                                             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                         <DollarSign className="h-8 w-8 text-green-600" />
                       </div>
                       <h4 className="text-xl font-bold text-gray-800 mb-2">INR Package</h4>
                       <div className="text-3xl font-bold text-green-600 mb-2">₹499</div>
                       <p className="text-sm text-gray-600 mb-4">Indian Rupees</p>
                       
                       <div className="space-y-2 text-sm text-gray-600 mb-6">
                         <div className="flex items-center justify-center">
                           <Check className="h-4 w-4 text-green-500 mr-2" />
                           <span>Full platform access</span>
                         </div>
                         <div className="flex items-center justify-center">
                           <Check className="h-4 w-4 text-green-500 mr-2" />
                           <span>Referral rewards</span>
                         </div>
                         <div className="flex items-center justify-center">
                           <Check className="h-4 w-4 text-green-500 mr-2" />
                           <span>Instant activation</span>
                         </div>
                       </div>
                      
                      <button 
                        onClick={handleActivateTpinClick}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors"
                      >
                        <Key className="h-4 w-4" />
                        <span>Activate with TPin</span>
                      </button>
                    </div>
                  </div>

                  {/* USD Package Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-2">USD Package</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-2">$6</div>
                      <p className="text-sm text-gray-600 mb-4">US Dollars</p>
                      
                                             <div className="space-y-2 text-sm text-gray-600 mb-6">
                         <div className="flex items-center justify-center">
                           <Check className="h-4 w-4 text-blue-500 mr-2" />
                           <span>Full platform access</span>
                         </div>
                         <div className="flex items-center justify-center">
                           <Check className="h-4 w-4 text-blue-500 mr-2" />
                           <span>Referral rewards</span>
                         </div>
                         <div className="flex items-center justify-center">
                           <Check className="h-4 w-4 text-blue-500 mr-2" />
                           <span>Instant activation</span>
                         </div>
                       </div>
                      
                      <button 
                        onClick={handleActivateTpinClick}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
                      >
                        <Key className="h-4 w-4" />
                        <span>Activate with TPin</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeMenu === 'Update Name' ? (
            /* Update Name Section */
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Your Name</h3>
              <form onSubmit={handleNameUpdate} className="space-y-4">
                <div>
                  <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Name: <span className="font-semibold">{userData?.name}</span>
                  </label>
                  <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                    New Name
                  </label>
                  <input
                    id="newName"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isUpdatingName}
                  />
                </div>
                
                {nameUpdateMessage.text && (
                  <div className={`text-sm ${nameUpdateMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {nameUpdateMessage.text}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingName}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isUpdatingName ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Update Name</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : activeMenu === 'Payout Report' ? (
            /* Payout Report Section - TPin Payments */
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">TPin Payment Report</h3>
                      <p className="text-gray-600">Track your TPin purchases and payment history</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchTpinPayments}
                    disabled={isLoadingTpinPayments}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm disabled:opacity-50"
                  >
                    {isLoadingTpinPayments ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Refresh
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoadingTpinPayments && (
                <div className="bg-white rounded-lg shadow p-8">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-gray-600">Loading payment data...</span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {tpinPaymentError && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-sm text-red-600">
                      {tpinPaymentError}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Data Display */}
              {tpinPaymentData && !isLoadingTpinPayments && (
                <div className="space-y-6">
                  {/* Summary Statistics */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                      Payment Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-2xl font-bold text-blue-800">
                          {(tpinPaymentData.pendingPayments?.length || 0) + 
                           (tpinPaymentData.verifiedPayments?.length || 0) + 
                           (tpinPaymentData.rejectedPayments?.length || 0)}
                        </div>
                        <div className="text-sm text-blue-600">Total Payments</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-800">
                          {tpinPaymentData.pendingPayments?.length || 0}
                        </div>
                        <div className="text-sm text-yellow-600">Pending</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-2xl font-bold text-green-800">
                          {tpinPaymentData.verifiedPayments?.length || 0}
                        </div>
                        <div className="text-sm text-green-600">Verified</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-2xl font-bold text-red-800">
                          {tpinPaymentData.rejectedPayments?.length || 0}
                        </div>
                        <div className="text-sm text-red-600">Rejected</div>
                      </div>
                    </div>
                  </div>

                  {/* Payments Tables */}
                  {((tpinPaymentData.pendingPayments && tpinPaymentData.pendingPayments.length > 0) ||
                    (tpinPaymentData.verifiedPayments && tpinPaymentData.verifiedPayments.length > 0) ||
                    (tpinPaymentData.rejectedPayments && tpinPaymentData.rejectedPayments.length > 0)) ? (
                    <div className="space-y-6">
                      {/* Pending Payments */}
                      {tpinPaymentData.pendingPayments && tpinPaymentData.pendingPayments.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
                            Pending Payments ({tpinPaymentData.pendingPayments.length})
                          </h4>
                          
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-yellow-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Payment ID</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Amount</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Currency</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Date</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Screenshot</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {tpinPaymentData.pendingPayments.map((payment: any, index: number) => (
                                  <tr key={payment._id || index} className="hover:bg-yellow-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                      {payment.paymentId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                      {payment.currency === 'INR' ? '₹' : '$'}{payment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                        {payment.currency}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        {payment.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <a 
                                        href={payment.screenshotUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline"
                                      >
                                        View Screenshot
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Verified Payments */}
                      {tpinPaymentData.verifiedPayments && tpinPaymentData.verifiedPayments.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                            Verified Payments ({tpinPaymentData.verifiedPayments.length})
                          </h4>
                          
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-green-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Payment ID</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Amount</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Currency</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Date</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Screenshot</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {tpinPaymentData.verifiedPayments.map((payment: any, index: number) => (
                                  <tr key={payment._id || index} className="hover:bg-green-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                      {payment.paymentId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                      {payment.currency === 'INR' ? '₹' : '$'}{payment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                        {payment.currency}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {payment.status || 'verified'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <a 
                                        href={payment.screenshotUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline"
                                      >
                                        View Screenshot
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Rejected Payments */}
                      {tpinPaymentData.rejectedPayments && tpinPaymentData.rejectedPayments.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                            Rejected Payments ({tpinPaymentData.rejectedPayments.length})
                          </h4>
                          
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-red-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Payment ID</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Amount</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Currency</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Date</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Screenshot</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {tpinPaymentData.rejectedPayments.map((payment: any, index: number) => (
                                  <tr key={payment._id || index} className="hover:bg-red-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                      {payment.paymentId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                      {payment.currency === 'INR' ? '₹' : '$'}{payment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                        {payment.currency}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        {payment.status || 'rejected'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <a 
                                        href={payment.screenshotUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline"
                                      >
                                        View Screenshot
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : !isLoadingTpinPayments && tpinPaymentData && (
                    <div className="bg-white rounded-lg shadow p-8">
                      <div className="text-center text-gray-500">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p>No payment history found</p>
                        <p className="text-sm">Your TPin purchase history will appear here</p>
                      </div>
                    </div>
                  )}

                  {/* Financial Overview */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                      Financial Overview
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-purple-700 mb-1">
                          Total Pending Amount
                        </label>
                        <div className="text-2xl font-bold text-purple-800">
                          ₹{tpinPaymentData.pendingPayments?.reduce((total: number, payment: any) => {
                            return total + (payment.currency === 'USD' ? payment.amount : payment.amount / 83);
                          }, 0).toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-indigo-700 mb-1">
                          Total Verified Amount
                        </label>
                        <div className="text-2xl font-bold text-indigo-800">
                          ₹{tpinPaymentData.verifiedPayments?.reduce((total: number, payment: any) => {
                            return total + (payment.currency === 'USD' ? payment.amount : payment.amount / 83);
                          }, 0).toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-teal-700 mb-1">
                          Total Rejected Amount
                        </label>
                        <div className="text-2xl font-bold text-teal-800">
                          ₹{tpinPaymentData.rejectedPayments?.reduce((total: number, payment: any) => {
                            return total + (payment.currency === 'USD' ? payment.amount : payment.amount / 83);
                          }, 0).toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Initial State - No Data */}
              {!tpinPaymentData && !isLoadingTpinPayments && !tpinPaymentError && (
                <div className="bg-white rounded-lg shadow p-8">
                  <div className="text-center text-gray-500">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>Click "Refresh" to load your TPin payment data</p>
                    <p className="text-sm">Your payment history and statistics will appear here</p>
                  </div>
                </div>
              )}
            </div>
          ) : activeMenu === 'Withdrawal' ? (
            /* Withdrawal Section */
            <div className="space-y-6">
              {/* Withdrawal Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Request Withdrawal Card */}
                <div 
                  onClick={() => setActiveWithdrawalCard('Request Withdrawal')}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 border-2 ${
                    activeWithdrawalCard === 'Request Withdrawal' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      activeWithdrawalCard === 'Request Withdrawal' ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`font-semibold ${
                      activeWithdrawalCard === 'Request Withdrawal' ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      Request Withdrawal
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Submit a new withdrawal request
                    </p>
                  </div>
                </div>

                {/* Withdrawal History Card */}
                <div 
                  onClick={() => setActiveWithdrawalCard('Withdrawal History')}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 border-2 ${
                    activeWithdrawalCard === 'Withdrawal History' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      activeWithdrawalCard === 'Withdrawal History' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`font-semibold ${
                      activeWithdrawalCard === 'Withdrawal History' ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      Withdrawal History
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View your withdrawal history
                    </p>
                  </div>
                </div>
              </div>

              {/* Content based on selected card */}
              <div className="bg-white rounded-lg shadow p-6">
                {activeWithdrawalCard === 'Request Withdrawal' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Withdrawal</h3>
                    <p className="text-gray-600 mb-6">Submit a withdrawal request for your available balance.</p>
                    
                    <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                      {/* Amount and Payment Method Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="withdrawalAmount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="withdrawalAmount"
                            type="number"
                            step="1"
                            min="150"
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                            placeholder="Enter amount (minimum ₹150)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            disabled={isRequestingWithdrawal}
                          />
                          <p className="text-xs text-gray-500 mt-1">Minimum withdrawal amount is ₹150</p>
                        </div>
                        <div>
                          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Method <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            disabled={isRequestingWithdrawal}
                          >
                            <option value="">Select payment method</option>
                            <option value="upi">UPI</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="crypto">Crypto Wallet</option>
                          </select>
                        </div>
                      </div>

                      {/* UPI Details Section - Only show when UPI is selected */}
                      {paymentMethod === 'upi' && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="text-sm font-medium text-blue-800 mb-3">UPI Details</h4>
                          <div>
                            <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                              UPI ID <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="upiId"
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="user@upi (e.g., 9876543210@paytm)"
                              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              disabled={isRequestingWithdrawal}
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter your UPI ID for instant transfer</p>
                          </div>
                        </div>
                      )}

                      {/* Bank Details Section - Only show when Bank Transfer is selected */}
                      {paymentMethod === 'bank' && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="text-sm font-medium text-green-800 mb-3">Bank Transfer Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                                Bank Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="bankName"
                                type="text"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                placeholder="State Bank of India"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                disabled={isRequestingWithdrawal}
                              />
                            </div>
                            <div>
                              <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-1">
                                IFSC Code <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="ifscCode"
                                type="text"
                                value={ifscCode}
                                onChange={(e) => setIfscCode(e.target.value)}
                                placeholder="ABCD0001234"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                disabled={isRequestingWithdrawal}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                                Account Holder Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="accountName"
                                type="text"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                disabled={isRequestingWithdrawal}
                              />
                            </div>
                            <div>
                              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Account Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="accountNumber"
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="1234567890"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                disabled={isRequestingWithdrawal}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Crypto Wallet Details Section - Only show when Crypto is selected */}
                      {paymentMethod === 'crypto' && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h4 className="text-sm font-medium text-purple-800 mb-3">Crypto Wallet Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="cryptoWalletType" className="block text-sm font-medium text-gray-700 mb-1">
                                Wallet Type <span className="text-red-500">*</span>
                              </label>
                              <select
                                id="cryptoWalletType"
                                value={cryptoWalletType}
                                onChange={(e) => {
                                  setCryptoWalletType(e.target.value);
                                  // Auto-set network based on wallet type
                                  const networkMap: { [key: string]: string } = {
                                    'bitcoin': 'BTC',
                                    'ethereum': 'ETH',
                                    'binance': 'BSC',
                                    'tron': 'TRX',
                                    'polygon': 'MATIC',
                                    'other': ''
                                  };
                                  setCryptoNetwork(networkMap[e.target.value] || '');
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                disabled={isRequestingWithdrawal}
                              >
                                <option value="">Select wallet type</option>
                                <option value="bitcoin">Bitcoin (BTC)</option>
                                <option value="ethereum">Ethereum (ETH)</option>
                                <option value="binance">Binance Smart Chain (BSC)</option>
                                <option value="tron">Tron (TRX)</option>
                                <option value="polygon">Polygon (MATIC)</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="cryptoNetwork" className="block text-sm font-medium text-gray-700 mb-1">
                                Network <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="cryptoNetwork"
                                type="text"
                                value={cryptoNetwork}
                                onChange={(e) => setCryptoNetwork(e.target.value)}
                                placeholder="ETH, BTC, BSC, TRX, MATIC"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                disabled={isRequestingWithdrawal}
                              />
                              <p className="text-xs text-gray-500 mt-1">Network will auto-fill based on wallet type</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <label htmlFor="cryptoWalletAddress" className="block text-sm font-medium text-gray-700 mb-1">
                              Wallet Address <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="cryptoWalletAddress"
                              type="text"
                              value={cryptoWalletAddress}
                              onChange={(e) => setCryptoWalletAddress(e.target.value)}
                              placeholder="0x742d35Cc6634C0532925a3b8D431A9123C..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                              disabled={isRequestingWithdrawal}
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter your complete wallet address - double check for accuracy</p>
                          </div>
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                  <p>• Double-check your wallet address before submitting</p>
                                  <p>• Incorrect addresses will result in permanent loss of funds</p>
                                  <p>• Make sure the network matches your wallet type</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error/Success Message */}
                      {withdrawalMessage.text && (
                        <div className={`p-3 rounded-md text-sm ${
                          withdrawalMessage.type === 'error' 
                            ? 'bg-red-50 border border-red-200 text-red-600' 
                            : 'bg-green-50 border border-green-200 text-green-600'
                        }`}>
                          {withdrawalMessage.text}
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={
                            isRequestingWithdrawal || 
                            !withdrawalAmount.trim() || 
                            !paymentMethod.trim() ||
                            (paymentMethod === 'upi' && !upiId.trim()) ||
                            (paymentMethod === 'bank' && (!bankName.trim() || !accountNumber.trim() || !accountName.trim() || !ifscCode.trim())) ||
                            (paymentMethod === 'crypto' && (!cryptoWalletAddress.trim() || !cryptoWalletType.trim() || !cryptoNetwork.trim()))
                          }
                          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRequestingWithdrawal ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-5 w-5" />
                              <span>Submit Request</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeWithdrawalCard === 'Withdrawal History' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-800">Withdrawal History</h3>
                      <div className="flex items-center gap-3">
                        {isLoadingWithdrawals && (
                          <div className="flex items-center text-blue-600">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading...
                          </div>
                        )}
                        <button 
                          onClick={fetchWithdrawalHistory}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Refresh
                        </button>
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
                      <button
                        onClick={() => setActiveWithdrawalTab('approved')}
                        className={`flex-1 min-w-0 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                          activeWithdrawalTab === 'approved'
                            ? 'bg-white text-green-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        Approved ({approvedWithdrawals.summary?.approvedCount || 0})
                      </button>
                      <button
                        onClick={() => setActiveWithdrawalTab('pending')}
                        className={`flex-1 min-w-0 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                          activeWithdrawalTab === 'pending'
                            ? 'bg-white text-yellow-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        Pending ({pendingWithdrawals.summary?.pendingCount || 0})
                      </button>
                      <button
                        onClick={() => setActiveWithdrawalTab('rejected')}
                        className={`flex-1 min-w-0 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                          activeWithdrawalTab === 'rejected'
                            ? 'bg-white text-red-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        Rejected ({rejectedWithdrawals.summary?.rejectedCount || 0})
                      </button>
                    </div>
                    
                    {withdrawalError ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <X className="h-5 w-5 text-red-500 mr-2" />
                          <span className="text-red-700">{withdrawalError}</span>
                        </div>
                        <button 
                          onClick={fetchWithdrawalHistory}
                          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <div>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          {activeWithdrawalTab === 'approved' && (
                            <>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="text-sm text-green-700">Total Approved</div>
                                <div className="text-2xl font-bold text-green-900">
                                  ₹{approvedWithdrawals.summary?.totalApprovedAmount || 0}
                                </div>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-sm text-blue-700">Total Withdrawn</div>
                                <div className="text-2xl font-bold text-blue-900">
                                  ₹{approvedWithdrawals.summary?.totalWithdrawn || 0}
                                </div>
                              </div>
                            </>
                          )}
                          {activeWithdrawalTab === 'pending' && (
                            <>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="text-sm text-yellow-700">Total Pending</div>
                                <div className="text-2xl font-bold text-yellow-900">
                                  ₹{pendingWithdrawals.summary?.totalPendingAmount || 0}
                                </div>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-sm text-blue-700">Available Balance</div>
                                <div className="text-2xl font-bold text-blue-900">
                                  ₹{pendingWithdrawals.summary?.availableBalance || 0}
                                </div>
                              </div>
                            </>
                          )}
                          {activeWithdrawalTab === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="text-sm text-red-700">Total Rejected</div>
                              <div className="text-2xl font-bold text-red-900">
                                ₹{rejectedWithdrawals.summary?.totalRejectedAmount || 0}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Withdrawal List */}
                        {(() => {
                          let withdrawals = [];
                          if (activeWithdrawalTab === 'approved') {
                            withdrawals = approvedWithdrawals.approvedWithdrawals || [];
                          } else if (activeWithdrawalTab === 'pending') {
                            withdrawals = pendingWithdrawals.pendingWithdrawals || [];
                          } else if (activeWithdrawalTab === 'rejected') {
                            withdrawals = rejectedWithdrawals.rejectedWithdrawals || [];
                          }

                          if (withdrawals.length === 0) {
                            return (
                              <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">
                                  No {activeWithdrawalTab} withdrawals found.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4">
                              {withdrawals.map((withdrawal: any, index: number) => (
                                <div key={withdrawal._id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                          <div className="text-xs text-gray-500 uppercase tracking-wide">Amount</div>
                                          <div className="text-lg font-semibold text-gray-900">
                                            ₹{withdrawal.amount}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-500 uppercase tracking-wide">Method</div>
                                          <div className="text-sm text-gray-700 capitalize">
                                            {withdrawal.paymentMethod}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-500 uppercase tracking-wide">Request Date</div>
                                          <div className="text-sm text-gray-700">
                                            {new Date(withdrawal.requestDate).toLocaleDateString()}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            withdrawal.status === 'approved'
                                              ? 'bg-green-100 text-green-800'
                                              : withdrawal.status === 'pending'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : withdrawal.status === 'rejected'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {withdrawal.status}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Payment Details */}
                                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Payment Details</div>
                                        {withdrawal.paymentMethod === 'upi' && withdrawal.paymentDetails?.upiId && (
                                          <div className="text-sm text-gray-700">
                                            <span className="font-medium">UPI ID:</span> {withdrawal.paymentDetails.upiId}
                                          </div>
                                        )}
                                        {withdrawal.paymentMethod === 'bank' && withdrawal.paymentDetails?.bankDetails && (
                                          <div className="text-sm text-gray-700 space-y-1">
                                            <div><span className="font-medium">Account:</span> {withdrawal.paymentDetails.bankDetails.accountNumber}</div>
                                            <div><span className="font-medium">IFSC:</span> {withdrawal.paymentDetails.bankDetails.ifscCode}</div>
                                            <div><span className="font-medium">Name:</span> {withdrawal.paymentDetails.bankDetails.accountHolderName}</div>
                                            <div><span className="font-medium">Bank:</span> {withdrawal.paymentDetails.bankDetails.bankName}</div>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Additional Info for Approved */}
                                      {withdrawal.status === 'approved' && (
                                        <div className="mt-3 flex flex-col sm:flex-row gap-4 text-sm">
                                          {withdrawal.processedDate && (
                                            <div>
                                              <span className="text-gray-500">Processed:</span>
                                              <span className="ml-1 text-gray-700">
                                                {new Date(withdrawal.processedDate).toLocaleDateString()}
                                              </span>
                                            </div>
                                          )}
                                          {withdrawal.transactionId && (
                                            <div>
                                              <span className="text-gray-500">Transaction ID:</span>
                                              <span className="ml-1 text-gray-700 font-mono">
                                                {withdrawal.transactionId}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : activeMenu === 'Referral Link' ? (
            /* Referral Link Section */
            <div className="space-y-6">
              {/* Section Title */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Referral Management</h1>
                <p className="text-blue-100">Manage your referral network and track earnings</p>
              </div>

              {/* Three Main Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Referral Link Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <LinkIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Referral Link</h3>
                    </div>
                    {isLoadingReferralLink && (
                      <div className="flex items-center text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm">Loading...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Error Message */}
                    {referralLinkError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="text-sm text-red-600">{referralLinkError}</div>
                        <button 
                          onClick={fetchReferralLinkData}
                          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Referral Code Display */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Referral Code
                      </label>
                      <div className="bg-gray-50 p-3 rounded border text-lg font-mono text-blue-600 font-bold text-center">
                        {referralLinkData?.referralCode || userData?.userId || 'N/A'}
                      </div>
                    </div>

                    {/* Referral Link Display */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Referral Link
                      </label>
                      <div className="bg-gray-50 p-3 rounded border text-sm font-mono text-gray-800 break-all">
                        {isLoadingReferralLink ? (
                          <div className="flex items-center justify-center py-2">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading referral link...
                          </div>
                        ) : (
                          referralLinkData?.referralLink || `${window.location.origin}/register?ref=${userData?.userId}`
                        )}
                      </div>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyReferralLink(referralLinkData?.referralLink)}
                      disabled={isLoadingReferralLink}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Copy Referral Link
                    </button>

                    {/* Copy Message */}
                    {copyMessage && (
                      <div className="text-sm text-green-600 font-medium text-center">
                        {copyMessage}
                      </div>
                    )}

                    {/* Additional API Data */}
                    {referralLinkData && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">Referral Statistics:</h4>
                        <div className="text-xs text-blue-700 space-y-1">
                          {referralLinkData.totalReferrals !== undefined && (
                            <div>• Total Referrals: {referralLinkData.totalReferrals}</div>
                          )}
                          {referralLinkData.activeReferrals !== undefined && (
                            <div>• Active Referrals: {referralLinkData.activeReferrals}</div>
                          )}
                          {referralLinkData.totalEarnings !== undefined && (
                            <div>• Total Earnings: ₹{referralLinkData.totalEarnings}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">How to Use:</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Share your referral link with friends</li>
                        <li>• Earn bonuses when they join</li>
                        <li>• Track your referrals in real-time</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 2. Direct Referral Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Direct Referrals</h3>
                    </div>
                    <button 
                      onClick={fetchDirectReferrals}
                      disabled={isLoadingReferrals}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:opacity-50"
                    >
                      {isLoadingReferrals ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Users className="h-3 w-3" />
                      )}
                      Refresh
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                        <p className="text-sm text-green-600 font-medium">Total</p>
                        <p className="text-xl font-bold text-green-800">
                          {isLoadingReferrals ? '...' : directReferrals.length}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                        <p className="text-sm text-blue-600 font-medium">Active</p>
                        <p className="text-xl font-bold text-blue-800">
                          {isLoadingReferrals ? '...' : directReferrals.filter(r => r.isActive).length}
                        </p>
                      </div>
                    </div>

                    {/* Error Message */}
                    {referralError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="text-sm text-red-600">{referralError}</div>
                      </div>
                    )}

                    {/* Referrals List */}
                    <div className="max-h-80 overflow-y-auto">
                      {directReferrals.length > 0 ? (
                        <div className="space-y-3">
                          {directReferrals.map((referral, index) => (
                            <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                    <User className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">{referral.name}</h4>
                                    <p className="text-xs text-gray-600 font-mono">ID: {referral.userId}</p>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  referral.isActive 
                                    ? 'bg-green-100 text-green-700 border border-green-300' 
                                    : 'bg-red-100 text-red-700 border border-red-300'
                                }`}>
                                  {referral.isActive ? '✓ Active' : '✗ Inactive'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="bg-white p-2 rounded border">
                                  <p className="text-gray-500 font-medium">Join Date</p>
                                  <p className="text-gray-800 font-semibold">
                                    {new Date(referral.joinDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                  <p className="text-gray-500 font-medium">Team Size</p>
                                  <p className="text-gray-800 font-semibold flex items-center">
                                    <Users className="h-3 w-3 mr-1 text-blue-500" />
                                    {referral.teamSize} {referral.teamSize === 1 ? 'member' : 'members'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : !isLoadingReferrals ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-gray-400" />
                          </div>
                          <h4 className="font-medium text-gray-700 mb-2">No Direct Referrals Yet</h4>
                          <p className="text-sm text-gray-500 mb-4">Start sharing your referral link to build your network!</p>
                          <button
                            onClick={() => {
                              const referralLink = referralLinkData?.referralLink || `${window.location.origin}/register?ref=${userData?.userId}`;
                              navigator.clipboard.writeText(referralLink);
                              setCopyMessage('Referral link copied!');
                              setTimeout(() => setCopyMessage(''), 2000);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Copy Referral Link
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-sm text-gray-600">Loading direct referrals...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Referral Income Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                  {/* <div className="flex items-center justify-between mb-4">
                    <div 
                      className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => {
                        if (!incomeData) {
                          fetchReferralIncome();
                        }
                      }}
                      title="Click to fetch latest income data"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Referral Income</h3>
                      {isLoadingIncome && (
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin ml-2"></div>
                      )}
                    </div>
                    <button 
                      onClick={handleReferralEarningsClick}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <DollarSign className="h-3 w-3" />
                      Details
                    </button>
                  </div> */}

                  <div className="space-y-4">
                    {/* Income Stats */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
                        <p className="text-sm text-purple-600 font-medium">Total Earnings</p>
                        <p className="text-xl font-bold text-purple-800">
                          ₹{incomeData ? incomeData.totalEarnings?.toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                        <p className="text-sm text-green-600 font-medium">Available Balance</p>
                        <p className="text-xl font-bold text-green-800">
                          ₹{incomeData ? incomeData.availableBalance?.toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
                        <p className="text-sm text-orange-600 font-medium">Withdrawn</p>
                        <p className="text-xl font-bold text-orange-800">
                          ₹{incomeData ? incomeData.withdrawnAmount?.toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>

                    {/* Income Breakdown */}
                    {incomeData?.incomeBreakdown && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Income Sources</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Direct Income:</span>
                            <span className="font-medium">₹{incomeData.incomeBreakdown.directIncome?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Matrix Income:</span>
                            <span className="font-medium">₹{incomeData.incomeBreakdown.matrixIncome?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Rank Rewards:</span>
                            <span className="font-medium">₹{incomeData.incomeBreakdown.rankRewards?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Self Income:</span>
                            <span className="font-medium">₹{incomeData.incomeBreakdown.selfIncome?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveMenu('Withdrawal')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                      >
                        <DollarSign className="h-4 w-4" />
                        Request Withdrawal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeMenu === 'Income Wallet' ? (
            /* Income Wallet Section */
            <div className="space-y-6">
              {/* Income Wallet Overview */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Income Wallet</h3>
                      <p className="text-gray-600">Your earnings and income breakdown</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-700">
                      {userData?.incomeWallet?.lastUpdated ? 
                        new Date(userData.incomeWallet.lastUpdated).toLocaleDateString() : 
                        'N/A'
                      }
                    </p>
                  </div>
                </div>

                {/* Main Balance */}
                <div className="text-center mb-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Total Available Balance</p>
                    <p className="text-4xl font-bold text-green-600">
                      ₹{userData?.incomeWallet?.balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {/* Income Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Self Income */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs text-blue-600 font-medium">SELF</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Self Income</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{userData?.incomeWallet?.selfIncome?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  {/* Direct Income */}
                  <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserPlus className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-xs text-green-600 font-medium">DIRECT</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Direct Income</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{userData?.incomeWallet?.directIncome?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  {/* Matrix Income */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Network className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-xs text-purple-600 font-medium">MATRIX</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Matrix Income</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{userData?.incomeWallet?.matrixIncome?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  {/* Rank Rewards */}
                  <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-yellow-600" />
                      </div>
                      <span className="text-xs text-yellow-600 font-medium">RANK</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Rank Rewards</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{userData?.incomeWallet?.rankRewards?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {/* Additional Income Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Daily Team Income */}
                  <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-xs text-orange-600 font-medium">TEAM</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Daily Team Income</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{userData?.incomeWallet?.dailyTeamIncome?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  {/* FX Trading Income */}
                  <div className="bg-white rounded-lg p-4 border border-indigo-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-xs text-indigo-600 font-medium">FX</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">FX Trading Income</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{userData?.incomeWallet?.fxTradingIncome?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Income Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{userData?.incomeWallet?.totalEarnings?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{userData?.incomeWallet?.balance?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{userData?.incomeWallet?.withdrawnAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setActiveMenu('Withdrawal')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-colors"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Request Withdrawal</span>
                  </button>
                  <button
                    onClick={() => setActiveMenu('Payout Report')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Reports</span>
                  </button>
                </div>
              </div>
            </div>
          ) : activeMenu === 'FFT Coin Transaction' ? (
            /* FFT Coin Transaction Section */
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                      <ArrowLeftRight className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">FFT Coin Transactions</h3>
                      <p className="text-gray-600">View your FFT Coin transaction history</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isLoadingCryptoTransactions && (
                      <div className="flex items-center text-green-600">
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading...
                      </div>
                    )}
                    <button 
                      onClick={fetchCryptoTransactions}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Handling */}
              {cryptoTransactionsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <X className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700 font-medium">Error Loading Transactions</span>
                  </div>
                  <p className="text-red-600 text-sm mb-3">{cryptoTransactionsError}</p>
                  <button 
                    onClick={fetchCryptoTransactions}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Transaction Summary */}
              {cryptoTransactions && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Transaction Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {cryptoTransactions.totalTransactions || 0}
                      </div>
                      <p className="text-sm text-gray-600">Total Transactions</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {cryptoTransactions.summary?.totalWalletTransactions || 0}
                      </div>
                      <p className="text-sm text-gray-600">Wallet Transactions</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {cryptoTransactions.summary?.totalCryptoRequests || 0}
                      </div>
                      <p className="text-sm text-gray-600">Crypto Requests</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {cryptoTransactions.summary?.pendingRequests || 0}
                      </div>
                      <p className="text-sm text-gray-600">Pending Requests</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction List */}
              {cryptoTransactions ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-600" />
                      Transaction History
                    </h4>
                    <div className="text-sm text-gray-500">
                      {cryptoTransactions.transactions?.length || 0} transactions found
                    </div>
                  </div>
                  
                  {cryptoTransactions.transactions && cryptoTransactions.transactions.length > 0 ? (
                    <div className="space-y-4">
                      {cryptoTransactions.transactions.map((transaction: any, index: number) => (
                        <div key={transaction._id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                transaction.type === 'wallet_transaction' 
                                  ? 'bg-blue-100' 
                                  : transaction.transactionType === 'purchase' 
                                    ? 'bg-green-100' 
                                    : 'bg-red-100'
                              }`}>
                                {transaction.type === 'wallet_transaction' ? (
                                  <Wallet className={`h-5 w-5 text-blue-600`} />
                                ) : transaction.transactionType === 'purchase' ? (
                                  <ArrowUp className="h-5 w-5 text-green-600" />
                                ) : (
                                  <ArrowDown className="h-5 w-5 text-red-600" />
                                )}
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-800">
                                  {transaction.type === 'wallet_transaction' 
                                    ? 'Wallet Transaction' 
                                    : transaction.transactionType === 'purchase' 
                                      ? 'FFT Coin Purchase' 
                                      : 'FFT Coin Sale'
                                  }
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {transaction.transactionType && transaction.transactionType !== 'activation_bonus' 
                                    ? `${transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)} Request`
                                    : transaction.transactionType === 'activation_bonus'
                                      ? 'Activation Bonus'
                                      : 'Transaction'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-lg ${
                                transaction.type === 'wallet_transaction' 
                                  ? 'text-blue-600' 
                                  : transaction.transactionType === 'purchase' 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                              }`}>
                                {transaction.type === 'crypto_request' ? (
                                  `₹${transaction.totalAmount || 0}`
                                ) : (
                                  `${transaction.amount || 0} FFT`
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.type === 'crypto_request' && transaction.coinValue ? (
                                  `${transaction.quantity} coins @ ₹${transaction.coinValue}`
                                ) : transaction.inrValue ? (
                                  `₹${transaction.inrValue} INR Value`
                                ) : ''}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Description:</span>
                              </p>
                              <p className="text-sm text-gray-800">{transaction.description || 'No description available'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Date:</span>
                              </p>
                              <p className="text-sm text-gray-800">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          {transaction.status && (
                            <div className="flex items-center justify-between">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                transaction.status === 'completed' || transaction.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                              {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
                                <div className="text-xs text-gray-500">
                                  Updated: {new Date(transaction.updatedAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No transactions found</p>
                      <p className="text-gray-500 text-sm mt-2">Your FFT Coin transaction history will appear here</p>
                    </div>
                  )}
                </div>
              ) : !isLoadingCryptoTransactions && !cryptoTransactionsError ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center py-8">
                    <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click "Refresh" to load transaction data</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : activeMenu === 'Account Settings' ? (
            /* Account Settings Section */
            <div className="space-y-6">
              {/* Profile Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
                      <p className="text-gray-600">Your account details and information</p>
                    </div>
                  </div>
                  <button
                    onClick={fetchUserData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                        {userData?.name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                        {userData?.email || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                        {userData?.userId || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userData?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                        {userData?.role || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                        {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Profile Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                      <Edit className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Update Profile</h3>
                      <p className="text-gray-600">Update your personal information and address</p>
                    </div>
                  </div>
                  <button
                    onClick={fetchProfileData}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="profileName"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="profileEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="profileEmail"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="profileMobile" className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        id="profileMobile"
                        value={profileData.mobile}
                        onChange={(e) => setProfileData(prev => ({...prev, mobile: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your mobile number"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label htmlFor="profileAadhaar" className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        id="profileAadhaar"
                        value={profileData.aadhaarNumber}
                        onChange={(e) => setProfileData(prev => ({...prev, aadhaarNumber: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your Aadhaar number"
                        maxLength={12}
                      />
                    </div>
                    <div>
                      <label htmlFor="profilePan" className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        id="profilePan"
                        value={profileData.panNumber}
                        onChange={(e) => setProfileData(prev => ({...prev, panNumber: e.target.value.toUpperCase()}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your PAN number"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label htmlFor="profileStreet" className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          id="profileStreet"
                          value={profileData.address.street}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev, 
                            address: {...prev.address, street: e.target.value}
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your street address"
                        />
                      </div>
                      <div>
                        <label htmlFor="profileCity" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="profileCity"
                          value={profileData.address.city}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev, 
                            address: {...prev.address, city: e.target.value}
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your city"
                        />
                      </div>
                      <div>
                        <label htmlFor="profileState" className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          id="profileState"
                          value={profileData.address.state}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev, 
                            address: {...prev.address, state: e.target.value}
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your state"
                        />
                      </div>
                      <div>
                        <label htmlFor="profilePincode" className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          id="profilePincode"
                          value={profileData.address.pincode}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev, 
                            address: {...prev.address, pincode: e.target.value}
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your pincode"
                          maxLength={6}
                        />
                      </div>
                      <div>
                        <label htmlFor="profileCountry" className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          id="profileCountry"
                          value={profileData.address.country}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev, 
                            address: {...prev.address, country: e.target.value}
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="India">India</option>
                          <option value="USA">USA</option>
                          <option value="UK">UK</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Error and Success Messages */}
                  {profileError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                      {profileError}
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200">
                      {profileSuccess}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                                             {isUpdatingProfile ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           Updating Profile...
                         </>
                       ) : (
                         <>
                           <Save className="h-4 w-4" />
                           Update Profile
                         </>
                       )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Change Password Section */}
              {/* <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
                    <p className="text-gray-600">Update your account password for security</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                  </div>

                  {passwordError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200">
                      {passwordSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </button>
                </form>
              </div> */}
            </div>
          ) : (
            /* Other Menu Items */
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{activeMenu}</h3>
              <p className="text-gray-600">Content for {activeMenu} will be implemented here.</p>
            </div>
          )}
        </main>
      </div>

      {/* Referral Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowIncomeModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl leading-6 font-semibold text-gray-900 flex items-center">
                        <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
                        Referral Income Details
                      </h3>
                      <button
                        onClick={() => setShowIncomeModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Loading State */}
                    {isLoadingIncome && (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-gray-600">Loading income data...</span>
                      </div>
                    )}

                    {/* Error State */}
                    {incomeError && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="text-sm text-red-600">
                          {incomeError}
                        </div>
                      </div>
                    )}

                    {/* Income Data */}
                    {incomeData && !isLoadingIncome && (
                      <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-green-700 mb-1">Total Earnings</h4>
                            <p className="text-2xl font-bold text-green-800">
                              ${incomeData.totalEarnings?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-700 mb-1">Available Balance</h4>
                            <p className="text-2xl font-bold text-blue-800">
                              ${incomeData.availableBalance?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-orange-700 mb-1">Withdrawn Amount</h4>
                            <p className="text-2xl font-bold text-orange-800">
                              ${incomeData.withdrawnAmount?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>

                        {/* Income Breakdown */}
                        {incomeData.incomeBreakdown && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                              Income Breakdown
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <UserPlus className="h-6 w-6 text-blue-600" />
                                </div>
                                <p className="text-sm text-gray-600">Direct Income</p>
                                <p className="text-lg font-bold text-gray-800">
                                  ${incomeData.incomeBreakdown.directIncome?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                              <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Network className="h-6 w-6 text-purple-600" />
                                </div>
                                <p className="text-sm text-gray-600">Matrix Income</p>
                                <p className="text-lg font-bold text-gray-800">
                                  ${incomeData.incomeBreakdown.matrixIncome?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                              <div className="text-center">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Award className="h-6 w-6 text-yellow-600" />
                                </div>
                                <p className="text-sm text-gray-600">Rank Rewards</p>
                                <p className="text-lg font-bold text-gray-800">
                                  ${incomeData.incomeBreakdown.rankRewards?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                              <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <User className="h-6 w-6 text-green-600" />
                                </div>
                                <p className="text-sm text-gray-600">Self Income</p>
                                <p className="text-lg font-bold text-gray-800">
                                  ${incomeData.incomeBreakdown.selfIncome?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Recent Transactions */}
                        {incomeData.recentTransactions && incomeData.recentTransactions.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              <Activity className="h-5 w-5 text-gray-600 mr-2" />
                              Recent Transactions
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {incomeData.recentTransactions.map((transaction: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          transaction.type === 'matrix_commission' 
                                            ? 'bg-purple-100 text-purple-800'
                                            : transaction.type === 'direct_commission'
                                            ? 'bg-blue-100 text-blue-800'
                                            : transaction.type === 'withdrawal'
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                          {transaction.type?.replace('_', ' ')?.toUpperCase() || 'Unknown'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                                          ${Math.abs(transaction.amount)?.toFixed(2) || '0.00'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                        {transaction.from || '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {transaction.level ? `Level ${transaction.level}` : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {transaction.status && (
                                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            transaction.status === 'completed' 
                                              ? 'bg-green-100 text-green-800'
                                              : transaction.status === 'pending'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {transaction.status}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activate TPin Modal */}
      {showActivateTpinModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowActivateTpinModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4 sm:mx-0">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl leading-6 font-semibold text-gray-900 flex items-center">
                        <Key className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                        Activate TPin
                      </h3>
                      <button
                        onClick={() => setShowActivateTpinModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <X className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                      Enter your TPin code to activate your account and start earning.
                    </p>

                    {/* TPin Activation Form */}
                    <form onSubmit={handleActivateTpinSubmit} className="space-y-3 sm:space-y-4">
                      <div>
                        <label htmlFor="activateTpinCode" className="block text-sm font-medium text-gray-700 mb-2">
                          TPin Code
                        </label>
                        <input
                          id="activateTpinCode"
                          type="text"
                          value={activateTpinCode}
                          onChange={(e) => setActivateTpinCode(e.target.value.toUpperCase())}
                          placeholder="Enter your TPin code"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-center text-base sm:text-lg tracking-wider uppercase"
                          maxLength={10}
                          disabled={isActivatingTpin}
                        />
                        <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                          Enter the 10-digit TPin code you received after purchase
                        </p>
                      </div>

                      {/* Error/Success Message */}
                      {activateTpinMessage.text && (
                        <div className={`p-2 sm:p-3 rounded-md text-xs sm:text-sm ${
                          activateTpinMessage.type === 'error' 
                            ? 'bg-red-50 border border-red-200 text-red-600' 
                            : 'bg-green-50 border border-green-200 text-green-600'
                        }`}>
                          {activateTpinMessage.text}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                        <button
                          type="button"
                          onClick={() => setShowActivateTpinModal(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm sm:text-base order-2 sm:order-1"
                          disabled={isActivatingTpin}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isActivatingTpin || !activateTpinCode.trim()}
                          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base order-1 sm:order-2"
                        >
                          {isActivatingTpin ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="hidden sm:inline">Activating...</span>
                              <span className="sm:hidden">Activating</span>
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4" />
                              <span className="hidden sm:inline">Activate TPin</span>
                              <span className="sm:hidden">Activate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate TPin Modal (First Modal) */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowGenerateModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Generate TPin
                      </h3>
                      <button
                        onClick={() => setShowGenerateModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6">
                      Select a package to generate your TPin
                    </p>

                    {/* Package Options */}
                    <div className="space-y-4">
                      {/* 499 Rupees Option */}
                      <div 
                        onClick={() => setSelectedPackage('rupees')}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPackage === 'rupees' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="package"
                            value="rupees"
                            checked={selectedPackage === 'rupees'}
                            onChange={() => setSelectedPackage('rupees')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <label className="block text-sm font-medium text-gray-700">
                              ₹499 Package
                            </label>
                            <p className="text-sm text-gray-500">
                              Generate TPin for 499 Indian Rupees
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 20 Dollar Option */}
                      <div 
                        onClick={() => setSelectedPackage('dollars')}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPackage === 'dollars' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="package"
                            value="dollars"
                            checked={selectedPackage === 'dollars'}
                            onChange={() => setSelectedPackage('dollars')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <label className="block text-sm font-medium text-gray-700">
                              $6 Package
                            </label>
                            <p className="text-sm text-gray-500">
                              Generate TPin for 6 US Dollars
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Details Section */}
                    {selectedPackage && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">
                          Payment Details
                        </h4>
                        
                        {selectedPackage === 'rupees' ? (
                          /* Indian Rupees Account Details */
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Account Number
                                </label>
                                <div className="bg-white p-2 border rounded text-sm font-mono">
                                43388906230
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  IFSC Code
                                </label>
                                <div className="bg-white p-2 border rounded text-sm font-mono">
                                SBIN0009696
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Account Holder Name
                                </label>
                                <div className="bg-white p-2 border rounded text-sm">
                                  ForLifeTrading India Ltd
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Bank Name
                                </label>
                                <div className="bg-white p-2 border rounded text-sm">
                                  State Bank of India
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-center">
                              <div className="text-center">
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                  QR Code for Payment
                                </label>
                                <div className="bg-white p-3 border rounded-lg inline-block">
                                  <img 
                                    src="./image.png" 
                                    alt="UPI QR Code" 
                                    className="w-25 h-25"
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Scan to pay ₹499
                                </p>
                              </div>
                            </div>
                          </div>
                                                 ) : (
                           /* US Dollars Crypto Payment Details */
                           <div className="space-y-4">
                             <div>
                               <label className="block text-xs font-medium text-gray-600 mb-1">
                                 Crypto Wallet Address (USDT TRC20)
                               </label>
                               <div className="bg-white p-2 border rounded text-sm font-mono break-all">
                               0x291e8c34cdea3c833a77f2f3c96eaed453659ca3
                               </div>
                             </div>
                             
                             <div className="flex justify-center">
                               <div className="text-center">
                                 <label className="block text-xs font-medium text-gray-600 mb-2">
                                   Crypto Payment QR Code
                                 </label>
                                 <div className="bg-white p-3 border rounded-lg inline-block">
                                   <img 
                                     src="./crupto.png" 
                                     alt="Crypto Wallet QR Code" 
                                     className="w-26 h-26"
                                   />
                                 </div>
                                 <p className="text-xs text-gray-500 mt-1">
                                   Send $6 USDT to this address
                                 </p>
                               </div>
                             </div>
                           </div>
                        )}
                        
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-xs text-yellow-800">
                                <strong>Important:</strong> Please make the payment and then click "Generate TPin" button. 
                                Your TPin will be generated after payment verification.
                              </p>
                            </div>
                          </div>
                                                 </div>
                       </div>
                     )}

                     {/* Error/Success Message */}
                     {tpinMessage.text && (
                       <div className={`mt-4 text-sm ${
                         tpinMessage.type === 'error' ? 'text-red-600' : 'text-green-600'
                       }`}>
                         {tpinMessage.text}
                       </div>
                     )}
                   </div>
                 </div>
               </div>
              
              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handlePaymentModalOpen}
                  disabled={isGeneratingTpin}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  <Hash className="h-4 w-4 mr-2" />
                  Continue to Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal (Second Modal) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowPaymentModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Payment Proof Submission
                      </h3>
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {/* Payment Summary */}
                    <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-1">Payment Details</h4>
                      {/* <p className="text-sm text-blue-700">
                        Amount: <strong>{paymentData.currency === 'INR' ? '₹' : '$'}{paymentData.amount}</strong>
                      </p> */}
                      <p className="text-sm text-blue-700">
                        Currency: <strong>{paymentData.currency}</strong>
                      </p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      {/* Payment ID */}
                      <div>
                        <label htmlFor="paymentID" className="block text-sm font-medium text-gray-700 mb-1">
                          Payment ID / Transaction ID *
                        </label>
                        <input
                          id="paymentID"
                          type="text"
                          value={paymentID}
                          onChange={(e) => setPaymentID(e.target.value)}
                          placeholder="Enter your payment/transaction ID"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isGeneratingTpin}
                          required
                        />
                      </div>

                      {/* Quantity */}
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          id="quantity"
                          type="number"
                          min="1"
                          max="10"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isGeneratingTpin}
                          required
                        />
                      </div>

                      {/* Payment Proof Image */}
                      <div>
                        <label htmlFor="paymentImage" className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Proof Image *
                        </label>
                        <input
                          id="paymentImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isGeneratingTpin}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload screenshot of your payment confirmation
                        </p>
                      </div>

                      {/* Image Preview */}
                      {paymentImagePreview && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image Preview
                          </label>
                          <div className="border rounded-lg p-2 bg-gray-50">
                            <img 
                              src={paymentImagePreview} 
                              alt="Payment proof preview" 
                              className="max-w-full h-32 object-contain mx-auto rounded"
                            />
                          </div>
                        </div>
                      )}

                      {/* Total Cost Display */}
                      {quantity && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                          <h4 className="font-medium text-green-800">Generation Summary</h4>
                          <p className="text-sm text-green-700">
                            You will generate <strong>{quantity}</strong> TPin(s) of <strong>{paymentData.currency === 'INR' ? '₹' : '$'}{paymentData.amount}</strong> each.
                          </p>
                          <p className="text-sm text-green-700">
                            Total Cost: <strong>{paymentData.currency === 'INR' ? '₹' : '$'}{(parseFloat(paymentData.amount) * parseInt(quantity)).toFixed(2)}</strong>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Error/Success Message */}
                    {tpinMessage.text && (
                      <div className={`mt-4 text-sm ${
                        tpinMessage.type === 'error' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {tpinMessage.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleFinalTpinGeneration}
                  disabled={isGeneratingTpin}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isGeneratingTpin ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Hash className="h-4 w-4 mr-2" />
                      Generate TPin
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Get TPin Status Modal */}
      {showGetTpinModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowGetTpinModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        TPin Status & History
                      </h3>
                      <button
                        onClick={() => setShowGetTpinModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Loading State */}
                    {isLoadingTpinStatus && (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">Loading TPin status...</span>
                      </div>
                    )}

                    {/* Error Message */}
                    {tpinMessage.text && tpinMessage.type === 'error' && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="text-sm text-red-600">
                          {tpinMessage.text}
                        </div>
                      </div>
                    )}

                    {/* TPin Status Data */}
                    {tpinStatusData && !isLoadingTpinStatus && (
                      <div className="space-y-6">
                        {/* Account Status */}
                        {tpinStatusData.isActive !== undefined && (
                          <div className="mb-4 p-4 rounded-lg border-2 bg-gradient-to-r from-blue-50 to-green-50">
                            <div className="flex items-center justify-center">
                              <span className="text-lg font-semibold">Account Status: </span>
                              <span className={`ml-2 px-4 py-1 rounded-full font-bold ${
                                tpinStatusData.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {tpinStatusData.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Summary Cards */}
                        {tpinStatusData.summary && (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                              <h4 className="font-medium text-blue-800 text-sm">Total</h4>
                              <p className="text-xl font-bold text-blue-900">
                                {tpinStatusData.summary.total || 0}
                              </p>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                              <h4 className="font-medium text-yellow-800 text-sm">Pending</h4>
                              <p className="text-xl font-bold text-yellow-900">
                                {tpinStatusData.summary.pending || 0}
                              </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                              <h4 className="font-medium text-green-800 text-sm">Approved</h4>
                              <p className="text-xl font-bold text-green-900">
                                {tpinStatusData.summary.approved || 0}
                              </p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                              <h4 className="font-medium text-emerald-800 text-sm">Active</h4>
                              <p className="text-xl font-bold text-emerald-900">
                                {tpinStatusData.summary.active || 0}
                              </p>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                              <h4 className="font-medium text-gray-800 text-sm">Used</h4>
                              <p className="text-xl font-bold text-gray-900">
                                {tpinStatusData.summary.used || 0}
                              </p>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                              <h4 className="font-medium text-red-800 text-sm">Rejected</h4>
                              <p className="text-xl font-bold text-red-900">
                                {tpinStatusData.summary.rejected || 0}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* All TPins List */}
                        {tpinStatusData.tpins && tpinStatusData.tpins.all && tpinStatusData.tpins.all.length > 0 ? (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">All TPins</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TPin Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activation Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used At</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {tpinStatusData.tpins.all.map((tpin: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tpin.id ? tpin.id.slice(-6) : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                        {tpin.code || '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          tpin.status === 'approved' 
                                            ? 'bg-green-100 text-green-800' 
                                            : tpin.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : tpin.status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                          {tpin.status || 'Unknown'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tpin.purchaseDate ? new Date(tpin.purchaseDate).toLocaleDateString() : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tpin.activationDate ? new Date(tpin.activationDate).toLocaleDateString() : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          tpin.isUsed ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                          {tpin.isUsed ? 'Yes' : 'No'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tpin.usedAt ? new Date(tpin.usedAt).toLocaleDateString() : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : !isLoadingTpinStatus && (
                          <div className="text-center py-8">
                            <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No TPins found.</p>
                          </div>
                        )}

                        {/* Payment Information */}
                        {tpinStatusData.payments && (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h4>
                            
                            {/* Pending Payments */}
                            {tpinStatusData.payments.pending && tpinStatusData.payments.pending.length > 0 && (
                              <div className="mb-6">
                                <h5 className="text-md font-medium text-yellow-700 mb-3">Pending Payments</h5>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-yellow-50">
                                      <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Payment ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Currency</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase tracking-wider">Screenshot</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {tpinStatusData.payments.pending.map((payment: any, index: number) => (
                                        <tr key={index} className="hover:bg-yellow-50">
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                            {payment.paymentId || '-'}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.amount || '-'}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.currency || '-'}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                              {payment.status || 'Unknown'}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {payment.date ? new Date(payment.date).toLocaleDateString() : '-'}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {payment.screenshotUrl ? (
                                              <a 
                                                href={payment.screenshotUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                              >
                                                View Screenshot
                                              </a>
                                            ) : '-'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Verified and Rejected Payments (if any) */}
                            {((tpinStatusData.payments.verified && tpinStatusData.payments.verified.length > 0) ||
                              (tpinStatusData.payments.rejected && tpinStatusData.payments.rejected.length > 0)) && (
                              <div className="text-sm text-gray-600">
                                <p>Verified Payments: {tpinStatusData.payments.verified?.length || 0}</p>
                                <p>Rejected Payments: {tpinStatusData.payments.rejected?.length || 0}</p>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowGetTpinModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Selection Modal */}
      {showInvestmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowInvestmentModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Select Investment Plan
                      </h3>
                      <button
                        onClick={() => setShowInvestmentModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h4 className="text-xl font-bold text-gray-800 mb-2">Premium Investment Plan</h4>
                        <p className="text-gray-600">Choose your preferred currency for investment</p>
                      </div>

                      {/* INR Option */}
                      <div 
                        onClick={() => handleInvestmentCurrencySelect('inr')}
                        className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-800">Indian Rupees</h5>
                            <p className="text-sm text-gray-600">Pay with INR</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">₹5,999</div>
                            <div className="text-sm text-gray-500">Investment Amount</div>
                          </div>
                        </div>
                      </div>

                      {/* USDT Option */}
                      <div 
                        onClick={() => handleInvestmentCurrencySelect('usdt')}
                        className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-800">USDT (Crypto)</h5>
                            <p className="text-sm text-gray-600">Pay with USDT</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">$72</div>
                            <div className="text-sm text-gray-500">Investment Amount</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Payment Modal */}
      {showInvestmentPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowInvestmentPayment(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Investment Payment - {selectedInvestmentCurrency === 'inr' ? '₹5,999' : '$72'}
                    </h3>
                    <button
                      onClick={() => setShowInvestmentPayment(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Payment Instructions */}
                  <div className="space-y-6">
                    {selectedInvestmentCurrency === 'inr' ? (
                      <>
                        {/* INR Payment Details */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-3">Bank Transfer Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">Account Name:</span>
                              <span>ForLifeTrading India Ltd</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Account Number:</span>
                              <span>43388906230</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">IFSC Code:</span>
                              <span>SBIN0009696</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Bank Name:</span>
                              <span>State Bank of India</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Amount:</span>
                              <span className="font-bold text-green-600">₹5,999</span>
                            </div>
                          </div>
                        </div>

                        {/* QR Code for INR */}
                        <div className="text-center">
                          <h5 className="font-medium mb-3">UPI QR Code</h5>
                          <div className="bg-gray-100 p-4 rounded-lg inline-block">
                            <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                              <img 
                                src="/image.png" 
                                alt="UPI QR Code"
                                className="w-44 h-44 object-contain"
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">Scan to pay ₹5,999</p>
                          <p className="text-sm text-gray-600">UPI ID: mlminvestment@paytm</p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* USDT Payment Details */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-3">USDT Wallet Details</h4>
                          <div className="space-y-2 text-sm">
                            {/* <div className="flex justify-between">
                              <span className="font-medium">Network:</span>
                              <span>TRC20 (Tron)</span>
                            </div> */}
                            <div className="flex justify-between">
                              <span className="font-medium">Wallet Address:</span>
                              <span className="font-mono text-xs">0x291e8c34cdea3c833a77f2f3c96eaed453659ca3</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Amount:</span>
                              <span className="font-bold text-blue-600">$72</span>
                            </div>
                          </div>
                        </div>

                        {/* QR Code for USDT */}
                        <div className="text-center">
                          <h5 className="font-medium mb-3">USDT Wallet QR Code</h5>
                          <div className="bg-gray-100 p-4 rounded-lg inline-block">
                            <div className="w-25 h-25 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                              <img 
                                src="/crupto.png" 
                                alt="USDT Wallet QR Code"
                                className="w-25 h-25 object-contain"
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">Scan to send $72</p>
                          <p className="text-xs text-gray-600 font-mono">0x291e8c34cdea3c833a77f2f3c96eaed453659ca3</p>
                        </div>
                      </>
                    )}

                    {/* Payment Proof Upload */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment ID / Transaction ID
                        </label>
                        <input
                          type="text"
                          value={investmentPaymentID}
                          onChange={(e) => setInvestmentPaymentID(e.target.value)}
                          placeholder="Enter payment/transaction ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Payment Screenshot
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleInvestmentImageUpload}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {investmentPaymentImagePreview && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                          <img 
                            src={investmentPaymentImagePreview} 
                            alt="Payment proof preview" 
                            className="max-w-full h-32 object-cover rounded border"
                          />
                        </div>
                      )}

                      {investmentMessage.text && (
                        <div className={`p-4 rounded-lg border ${
                          investmentMessage.type === 'error' 
                            ? 'bg-red-50 border-red-200 text-red-800' 
                            : 'bg-green-50 border-green-200 text-green-800'
                        }`}>
                          <div className={`flex items-start ${investmentMessage.type === 'success' ? 'flex-col' : 'flex-row'}`}>
                            {investmentMessage.type === 'success' ? (
                              <div className="text-center w-full">
                                <div className="text-2xl mb-2">🎉</div>
                                <div className="font-semibold text-lg mb-2">Investment Submitted Successfully!</div>
                                <div className="text-sm whitespace-pre-line leading-relaxed">
                                  {investmentMessage.text.replace('🎉 Investment Request Submitted Successfully! 💰\n\n', '')}
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="text-xl mr-2">❌</div>
                                <div className="text-sm">{investmentMessage.text}</div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleInvestmentSubmit}
                  disabled={isProcessingInvestment || investmentMessage.type === 'success'}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isProcessingInvestment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Submit Investment
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvestmentPayment(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crypto Buy Modal */}
      {showCryptoBuyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCryptoBuyModalClose}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCryptoBuySubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                          <img 
                            src="/crupto.png" 
                            alt="FFT Coin" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        Buy Crypto
                      </h3>
                      <button
                        type="button"
                        onClick={handleCryptoBuyModalClose}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Current Coin Value Display */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse mr-2"></span>
                          Live Coin Value
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-blue-700">
                            ₹{cryptoBuyCurrentCoinValue.toFixed(2)}
                          </div>
                          <div className="text-xs text-blue-600 flex items-center">
                            <span className="animate-pulse mr-1">📈</span>
                            Live Price
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          Price updates every 2 seconds
                        </p>
                      </div>

                      {/* Quantity Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity (Number of Coins)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={cryptoBuyQuantity}
                          onChange={(e) => setCryptoBuyQuantity(e.target.value)}
                          placeholder="Enter quantity of coins"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum: 1 coin</p>
                      </div>

                      {/* Total Amount Calculation */}
                      {cryptoBuyQuantity && parseInt(cryptoBuyQuantity) > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 mb-2">Purchase Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="font-medium">{cryptoBuyQuantity} coins</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price per coin:</span>
                              <span className="font-medium">₹{cryptoBuyCurrentCoinValue.toFixed(2)}</span>
                            </div>
                            <hr className="border-yellow-300" />
                            <div className="flex justify-between font-bold text-yellow-800">
                              <span>Total Amount:</span>
                              <span>₹{(parseInt(cryptoBuyQuantity) * cryptoBuyCurrentCoinValue).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Purchase Instructions */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Purchase Instructions</h4>
                        <div className="text-sm text-green-700 space-y-1">
                          <p>• Enter the quantity of coins you want to purchase</p>
                          <p>• Price will be calculated at current coin value</p>
                          <p>• Coins will be credited instantly after purchase</p>
                          <p>• Amount will be deducted from your income wallet</p>
                        </div>
                      </div>

                      {cryptoTradeMessage.text && (
                        <div className={`p-4 rounded-lg border ${
                          cryptoTradeMessage.type === 'error' 
                            ? 'bg-red-50 border-red-200 text-red-800' 
                            : 'bg-green-50 border-green-200 text-green-800'
                        }`}>
                          <div className="flex items-start">
                            <div className="text-xl mr-2">
                              {cryptoTradeMessage.type === 'success' ? '✅' : '❌'}
                            </div>
                            <div className="text-sm">{cryptoTradeMessage.text}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isProcessingCryptoBuy}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isProcessingCryptoBuy ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Purchase Crypto'
                    )}
                  </button>
                                      <button
                      type="button"
                      onClick={handleCryptoBuyModalClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Crypto Sell Modal */}
      {showCryptoSellModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCryptoSellModalClose}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCryptoSellSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                          <img 
                            src="/crupto.png" 
                            alt="FFT Coin" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        Sell Crypto
                      </h3>
                      <button
                        type="button"
                        onClick={handleCryptoSellModalClose}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Current Coin Value Display */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                          <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2"></span>
                          Live Sell Price
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-red-700">
                            ₹{cryptoSellCurrentCoinValue.toFixed(2)}
                          </div>
                          <div className="text-xs text-red-600 flex items-center">
                            <span className="animate-pulse mr-1">📉</span>
                            Live Price
                          </div>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          Price updates every 2 seconds
                        </p>
                      </div>

                      {/* Current Balance Display */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-800 mb-2">Available Balance</h4>
                        <div className="text-2xl font-bold text-yellow-700">
                          {userData?.cryptoWallet?.balance?.toFixed(2) || '0.00'} FFT Coin
                        </div>
                      </div>

                      {/* Quantity Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity (Number of Coins to Sell)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={userData?.cryptoWallet?.balance || 0}
                          value={cryptoSellQuantity}
                          onChange={(e) => setCryptoSellQuantity(e.target.value)}
                          placeholder="Enter quantity of coins to sell"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Available: {userData?.cryptoWallet?.balance?.toFixed(2) || '0.00'} FFT Coin
                        </p>
                      </div>

                      {/* Total Amount Calculation */}
                      {cryptoSellQuantity && parseInt(cryptoSellQuantity) > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">Sell Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="font-medium">{cryptoSellQuantity} coins</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price per coin:</span>
                              <span className="font-medium">₹{cryptoSellCurrentCoinValue.toFixed(2)}</span>
                            </div>
                            <hr className="border-blue-300" />
                            <div className="flex justify-between font-bold text-blue-800">
                              <span>Total Earnings:</span>
                              <span>₹{(parseInt(cryptoSellQuantity) * cryptoSellCurrentCoinValue).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sell Instructions */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 mb-2">Sell Instructions</h4>
                        <div className="text-sm text-red-700 space-y-1">
                          <p>• Enter the quantity of coins you want to sell</p>
                          <p>• Earnings will be calculated at current sell price</p>
                          <p>• Coins will be deducted from your crypto wallet</p>
                          <p>• INR amount will be credited to your income wallet instantly</p>
                        </div>
                      </div>

                      {cryptoTradeMessage.text && (
                        <div className={`p-4 rounded-lg border ${
                          cryptoTradeMessage.type === 'error' 
                            ? 'bg-red-50 border-red-200 text-red-800' 
                            : 'bg-green-50 border-green-200 text-green-800'
                        }`}>
                          <div className="flex items-start">
                            <div className="text-xl mr-2">
                              {cryptoTradeMessage.type === 'success' ? '✅' : '❌'}
                            </div>
                            <div className="text-sm">{cryptoTradeMessage.text}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isProcessingCryptoSell || !cryptoSellQuantity || parseInt(cryptoSellQuantity) <= 0}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isProcessingCryptoSell ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Sell Crypto'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCryptoSellModalClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;