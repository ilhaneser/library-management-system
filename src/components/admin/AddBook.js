import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertContext from '../../context/alert/AlertContext';

const AddBook = () => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;
  const navigate = useNavigate();

  const [book, setBook] = useState({
    title: '',
    author: '',
    ISBN: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    genre: '',
    description: '',
    maxConcurrentLoans: 3,
    totalPages: 1,
    coverImage: 'default-book-cover.jpg',
    pdfFile: ''
  });

  const [uploading, setUploading] = useState({
    cover: false,
    pdf: false
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAlert('Please upload an image file', 'danger');
      return;
    }

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

    // Validate file type
    if (file.type !== 'application/pdf') {
      setAlert('Please upload a PDF file', 'danger');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setAlert('PDF size should be less than 50MB', 'danger');
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
      !description ||
      !pdfFile // PDF is required
    ) {
      setAlert('Please fill in all required fields, including PDF file', 'danger');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post('/api/books', book);
      setAlert('Book added successfully', 'success');
      navigate('/admin/books');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error adding book';
      setAlert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-book">
      <h1 className="mb-4">Add New Book</h1>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-md-3">
                <div className="text-center mb-4">
                  <img
                    src={
                      coverImage === 'default-book-cover.jpg'
                        ? '/img/default-book-cover.jpg'
                        : coverImage
                    }
                    alt="Book Cover"
                    className="img-fluid rounded mb-3"
                    style={{ maxHeight: '300px' }}
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
                  <h5 className="mb-3">PDF File <span className="text-danger">*</span></h5>
                  {pdfFile ? (
                    <div className="text-center">
                      <div className="alert alert-success">
                        <i className="fas fa-file-pdf mr-2"></i>
                        PDF uploaded successfully
                      </div>
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
                        required
                      />
                      <label className="custom-file-label" htmlFor="pdfFile">
                        {uploading.pdf ? 'Uploading...' : 'Choose PDF file'}
                      </label>
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
                      <small className="text-muted">
                        This will be calculated automatically if left as 1
                      </small>
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
                      />
                      <small className="text-muted">
                        How many users can borrow this book at the same time
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
                disabled={submitting || !pdfFile}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Adding Book...
                  </>
                ) : (
                  'Add Book'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBook;