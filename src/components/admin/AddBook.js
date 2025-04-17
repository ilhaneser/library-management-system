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
    copies: 1,
    location: {
      shelf: '',
      section: ''
    },
    coverImage: 'default-book-cover.jpg'
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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