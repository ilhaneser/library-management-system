import { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AlertContext from '../../context/alert/AlertContext';

const PdfReader = () => {
  const { id } = useParams(); // Loan ID
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [readingStartTime, setReadingStartTime] = useState(null);
  const [pdfHeight, setPdfHeight] = useState('calc(100vh - 150px)');
  const iframeRef = useRef(null);
  
  // Get the backend URL from axios defaults or use the default
  const backendUrl = axios.defaults.baseURL || 'http://localhost:5001';

  // Load loan and PDF information
  useEffect(() => {
    fetchLoan();
    
    // Track reading session
    setReadingStartTime(Date.now());
    
    // Set up event listener to send reading progress when leaving
    const handleBeforeUnload = () => {
      sendReadingProgress();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Adjust iframe height on window resize for better responsiveness
    const adjustHeight = () => {
      const viewportHeight = window.innerHeight;
      const topOffset = 150; // Reduced offset with simpler header
      setPdfHeight(`calc(${viewportHeight}px - ${topOffset}px)`);
    };
    
    // Initial height adjustment
    adjustHeight();
    window.addEventListener('resize', adjustHeight);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('resize', adjustHeight);
      // Send reading progress when component unmounts
      sendReadingProgress();
    };
    // eslint-disable-next-line
  }, [id]);

  const fetchLoan = async () => {
    try {
      console.log("Fetching loan with ID:", id);
      const res = await axios.get(`/api/loans/${id}`);
      const loanData = res.data.data;
      console.log("Loan data fetched:", loanData);
      
      setLoan(loanData);
      setPageNumber(loanData.lastReadPage || 1);
      setTotalPages(loanData.book.totalPages || 1);
      
      // Set iframe source to the PDF reader URL with authentication token
      if (iframeRef.current) {
        const token = localStorage.getItem('token');
        // Use full URL with backend port and add token
        const pdfUrl = `${backendUrl}/api/books/${loanData.book._id}/read?token=${token}`;
        console.log("Setting PDF URL to:", pdfUrl);
        iframeRef.current.src = pdfUrl;
      }
    } catch (err) {
      console.error("Error fetching loan:", err);
      setAlert('Error loading the book', 'danger');
      navigate('/myloans');
    } finally {
      setLoading(false);
    }
  };

  const sendReadingProgress = async () => {
    if (!loan || !readingStartTime) return;
    
    // Calculate session duration in seconds
    const sessionDuration = Math.floor((Date.now() - readingStartTime) / 1000);
    
    // Only send progress if the session was at least 5 seconds
    if (sessionDuration < 5) return;
    
    try {
      console.log("Sending reading progress update:", {
        pageNumber,
        sessionDuration
      });
      
      await axios.put(`/api/loans/${id}/progress`, {
        pageNumber,
        sessionDuration
      });
      
      // Reset reading start time
      setReadingStartTime(Date.now());
    } catch (err) {
      console.error('Error updating reading progress:', err);
    }
  };
  
  // Function to open PDF in a new tab
  const openPdfInNewTab = () => {
    if (!loan) return;
    
    const token = localStorage.getItem('token');
    const pdfUrl = `${backendUrl}/api/books/${loan.book._id}/read?token=${token}`;
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return <Spinner />;
  }

  if (!loan) {
    return (
      <div className="alert alert-danger">
        Book loan not found
        <button 
          className="btn btn-primary ml-3"
          onClick={() => navigate('/myloans')}
        >
          Back to My Loans
        </button>
      </div>
    );
  }

  return (
    <div className="pdf-reader">
      <div className="reader-toolbar bg-light p-3 mb-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-secondary mr-2"
            onClick={() => navigate('/myloans')}
            title="Back to My Loans"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          
          <h5 className="mb-0 ml-2">{loan.book.title}</h5>
        </div>
        
        <div>
          <button
            onClick={openPdfInNewTab}
            className="btn btn-outline-primary btn-sm"
            title="Open in new tab for better viewing"
          >
            <i className="fas fa-external-link-alt mr-1"></i> Full Screen
          </button>
        </div>
      </div>
      
      <div className="pdf-container mb-3" style={{ height: pdfHeight }}>
        <iframe
          ref={iframeRef}
          title="PDF Reader"
          className="pdf-iframe"
          style={{ 
            width: '100%', 
            height: '100%', 
            border: '1px solid #ddd',
            backgroundColor: '#f5f5f5'
          }}
          allowFullScreen
        ></iframe>
      </div>
      
      <div className="loan-info mt-3">
        <p className="text-muted">
          <small>
            Borrowed on: {new Date(loan.issueDate).toLocaleDateString()}
            <span className="mx-2">|</span>
            Due date: {new Date(loan.dueDate).toLocaleDateString()}
            <span className="mx-2">|</span>
            Renewals: {loan.renewalCount}/2
          </small>
        </p>
      </div>
    </div>
  );
};

export default PdfReader;