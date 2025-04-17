import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AlertContext from '../../context/alert/AlertContext';
import Book from '../books/Book';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get('/api/users/wishlist');
      setWishlist(res.data.data);
    } catch (err) {
      setAlert('Error fetching wishlist', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="wishlist">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">My Wishlist</h1>
        <Link to="/books" className="btn btn-primary">
          <i className="fas fa-search mr-1"></i> Browse Books
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="alert alert-info">
          <i className="fas fa-info-circle mr-2"></i>
          Your wishlist is empty. Browse books and add them to your wishlist.
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">
            You have {wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} in your wishlist.
          </p>
          
          <div className="row">
            {wishlist.map((book) => (
              <div key={book._id} className="col-md-6 col-lg-3 mb-4">
                <Book book={book} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;