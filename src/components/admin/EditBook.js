import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import AlertContext from '../../context/alert/AlertContext';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const [book, setBook] = useState({
    title: '',
    author: '',
    ISBN: '',
    publisher: '',
    publicationYear: '',
    genre: '',
    description: '',
    maxConcurrentLoans: 3,
    totalPages: 1,
    coverImage: '',
    pdfFile: null
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({
    cover: false,
    pdf: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBook();
    // eslint-disable-next-line
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await axios.get(`/api/books/${id}`);
      const bookData = res.data.data;

      setBook({
        title: bookData.title || '',
        author: bookData.author || '',
        ISBN: bookData.ISBN || '',
        publisher: bookData.publisher || '',
        publicationYear: bookData.publicationYear || new Date().getFullYear(),
        genre: bookData.genre || '',
        description: bookData.description || '',
        maxConcurrentLoans: bookData.maxConcurrentLoans || 3,
        totalPages: bookData.totalPages || 1,
        coverImage: bookData.coverImage || 'default-book-cover.jpg',
        pdfFile: bookData.pdfFile || null
      });
      
      console.log("Book data loaded:", bookData);
    } catch (err) {
      setAlert('Error fetching book details', 'danger');
      navigate('/admin/books');
    } finally {
      setLoading(false);
    }
  };

  const {
    title,
    author,
    ISBN,
    publisher,
    publicationYear,
    genre,
    description,
    maxConcurrentLoans,
    totalPages,
    coverImage,
    pdfFile
  } = book;

  const onChange = (e) => {
    setBook({
      ...book,
      [e.target.name]: e.target.value
    });
  };

  // Function to get the correct image URL directly from backend
  const getImageUrl = (coverImage) => {
    // Get the backend URL from axios defaults or use the default
    const backendUrl = axios.defaults.baseURL || 'http://localhost:5001';
    
    // Handle empty or default case
    if (!coverImage || coverImage === 'default-book-cover.jpg') {
      return '/img/default-book-cover.jpg';
    }
    
    // Extract just the filename regardless of path format
    let filename;
    if (coverImage.includes('/')) {
      // If it has a path, extract just the filename
      filename = coverImage.split('/').pop();
    } else {
      // It's already just a filename
      filename = coverImage;
    }
    
    // Return direct URL to backend
    return `${backendUrl}/direct-file/covers/${filename}`;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('coverImage', file);

    setUploading({...uploading, cover: true});

    try {
      const res = await axios.post('/api/upload/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setBook({
        ...book,
        coverImage: res.data.filePath
      });

      setAlert('Cover image uploaded successfully', 'success');
    } catch (err) {
      setAlert('Error uploading cover image', 'danger');
    } finally {
      setUploading({...uploading, cover: false});
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a PDF file
    if (file.type !== 'application/pdf') {
      setAlert('Please upload a PDF file', 'danger');
      return;
    }

    const formData = new FormData();
    formData.append('pdfFile', file);

    setUploading({...uploading, pdf: true});

    try {
      const res = await axios.post('/api/upload/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setBook({
        ...book,
        pdfFile: res.data.filePath
      });

      setAlert('PDF uploaded successfully', 'success');
    } catch (err) {
      setAlert('Error uploading PDF file', 'danger');
    } finally {
      setUploading({...uploading, pdf: false});
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (
      !title ||
      !author ||
      !ISBN ||
      !publisher ||
      !publicationYear ||
      !genre ||
      !description
    ) {
      setAlert('Please fill in all required fields', 'danger');
      return;
    }

    setSubmitting(true);

    try {
      await axios.put(`/api/books/${id}`, book);
      setAlert('Book updated successfully', 'success');
      navigate('/admin/books');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error updating book';
      setAlert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const removePdf = () => {
    setBook({
      ...book,
      pdfFile: null
    });
    setAlert('PDF file removed', 'success');
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="edit-book">
      <h1 className="mb-4">Edit Book</h1>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-md-3">
                <div className="text-center mb-4">
                  <img
                    src={getImageUrl(coverImage)}
                    alt="Book Cover"
                    className="img-fluid rounded mb-3"
                    style={{ maxHeight: '300px' }}
                    onError={(e) => {
                      if (!e.target.src.includes('default-book-cover.jpg')) {
                        console.error("Failed to load image:", e.target.src);
                        e.target.src = '/img/default-book-cover.jpg';
                        e.target.onerror = null;
                      }
                    }}
                  />
                  <div className="custom-file">
                    <input
                      type="file"
                      className="custom-file-input"
                      id="coverImage"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading.cover}
                    />
                    <label className="custom-file-label" htmlFor="coverImage">
                      {uploading.cover ? 'Uploading...' : 'Choose cover image'}
                    </label>
                  </div>
                </div>

                {/* PDF File Upload Section */}
                <div className="mb-4">
                  <h5 className="mb-3">PDF Version</h5>
                  {pdfFile ? (
                    <div className="text-center">
                      <div className="alert alert-success">
                        <i className="fas fa-file-pdf mr-2"></i>
                        PDF uploaded successfully
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={removePdf}
                      >
                        <i className="fas fa-trash mr-1"></i> Remove PDF
                      </button>
                    </div>
                  ) : (
                    <div className="custom-file">
                      <input
                        type="file"
                        className="custom-file-input"
                        id="pdfFile"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        disabled={uploading.pdf}
                      />
                      <label className="custom-file-label" htmlFor="pdfFile">
                        {uploading.pdf ? 'Uploading...' : 'Choose PDF file'}
                      </label>
                      <small className="form-text text-muted mt-2">
                        Upload a PDF version of this book.
                      </small>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="title">Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={title}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="author">Author <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="author"
                        name="author"
                        value={author}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="ISBN">ISBN <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="ISBN"
                        name="ISBN"
                        value={ISBN}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="publisher">Publisher <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="publisher"
                        name="publisher"
                        value={publisher}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="publicationYear">Year <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        id="publicationYear"
                        name="publicationYear"
                        value={publicationYear}
                        onChange={onChange}
                        min="1000"
                        max={new Date().getFullYear()}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="genre">Genre <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        id="genre"
                        name="genre"
                        value={genre}
                        onChange={onChange}
                        required
                      >
                        <option value="">-- Select Genre --</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Non-Fiction">Non-Fiction</option>
                        <option value="Science Fiction">Science Fiction</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Thriller">Thriller</option>
                        <option value="Romance">Romance</option>
                        <option value="Biography">Biography</option>
                        <option value="History">History</option>
                        <option value="Self-Help">Self-Help</option>
                        <option value="Business">Business</option>
                        <option value="Children">Children</option>
                        <option value="Young Adult">Young Adult</option>
                        <option value="Science">Science</option>
                        <option value="Technology">Technology</option>
                        <option value="Travel">Travel</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="totalPages">Total Pages <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        id="totalPages"
                        name="totalPages"
                        value={totalPages}
                        onChange={onChange}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="maxConcurrentLoans">Max Concurrent Loans</label>
                      <input
                        type="number"
                        className="form-control"
                        id="maxConcurrentLoans"
                        name="maxConcurrentLoans"
                        value={maxConcurrentLoans}
                        onChange={onChange}
                        min="1"
                        required
                      />
                      <small className="text-muted">
                        Maximum number of users who can borrow this book simultaneously
                      </small>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={description}
                    onChange={onChange}
                    rows="4"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button 
                type="button"
                className="btn btn-light mr-2"
                onClick={() => navigate('/admin/books')}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  'Update Book'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBook;