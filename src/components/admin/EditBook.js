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
    copies: 1,
    location: {
      shelf: '',
      section: ''
    },
    coverImage: ''
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
        copies: bookData.copies || 1,
        location: {
          shelf: bookData.location?.shelf || '',
          section: bookData.location?.section || ''
        },
        coverImage: bookData.coverImage || 'default-book-cover.jpg'
      });
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
    copies,
    location,
    coverImage
  } = book;

  const onChange = (e) => {
    if (e.target.name.startsWith('location.')) {
      const locationField = e.target.name.split('.')[1];
      setBook({
        ...book,
        location: {
          ...location,
          [locationField]: e.target.value
        }
      });
    } else {
      setBook({
        ...book,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('coverImage', file);

    setUploading(true);

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
      setUploading(false);
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
      !location.shelf ||
      !location.section
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
                      disabled={uploading}
                    />
                    <label className="custom-file-label" htmlFor="coverImage">
                      {uploading ? 'Uploading...' : 'Choose cover image'}
                    </label>
                  </div>
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
                  <div className="col-md-3">
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
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="genre">Genre <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="genre"
                        name="genre"
                        value={genre}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="copies">Copies <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        id="copies"
                        name="copies"
                        value={copies}
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
                      <label htmlFor="location.section">Section <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="location.section"
                        name="location.section"
                        value={location.section}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="location.shelf">Shelf <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="location.shelf"
                        name="location.shelf"
                        value={location.shelf}
                        onChange={onChange}
                        required
                      />
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