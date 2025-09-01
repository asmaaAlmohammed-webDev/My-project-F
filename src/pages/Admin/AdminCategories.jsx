import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fetchCategories } from "../../services/productService";
import { API_ENDPOINTS } from "../../config/api";
import { getImageUrl } from "../../utils/imageUtils";
import axios from "axios";
import ImageUpload from "../../components/ImageUpload/ImageUpload";
import "./AdminCategories.css";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    descrption: "", // Note: backend uses 'descrption' not 'description'
    photo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  // Function to get category image with fallbacks
  const getCategoryImageUrl = (photo) => {
    if (!photo) return null;

    // Define mapping for database categories to available images
    const categoryImageMap = {
      "fiction.jpg": "fiction.png", // Fiction -> fiction.png
      "romance.jpg": "romance.png", // Romance -> romance.png (book_1)
      "mystery.jpg": "mystery.png", // Mystery -> mystery.png (book_15)
      "scifi.jpg": "scifi.png", // Science Fiction -> scifi.png (book_3)
      "biography.jpg": "biography.png", // Biography -> biography.png (book_7)
      "history.jpg": "history.png", // History -> history.png (book_12)
      "selfhelp.jpg": "selfhelp.png", // Self Help -> selfhelp.png (book_25)
      "technology.jpg": "technology.png", // Technology -> technology.png (book_30)
      "health.jpg": "health.png",
      "business.jpg": "business.png",
      "children.jpg": "children.png",
      "academic.jpg": "academic.png",
      "religious.jpg": "religious.png",
    };

    // Check if we have a mapped image for this category
    const mappedImage = categoryImageMap[photo];
    if (mappedImage) {
      return `http://localhost:7000/img/static/${mappedImage}`;
    }

    // Try the original filename
    return `http://localhost:7000/img/static/${photo}`;
  };

  // Function to translate category names
  const translateCategoryName = (name) => {
    const categoryTranslations = {
      Fiction: t("categoryFiction"),
      "Science Fiction": t("categoryScienceFiction"),
      Biography: t("categoryBiography"),
      History: t("categoryHistory"),
      Romance: t("categoryRomance"),
      Mystery: t("categoryMystery"),
      Thriller: t("categoryThriller"),
      Fantasy: t("categoryFantasy"),
      Horror: t("categoryHorror"),
      "Self Help": t("categorySelfHelp"),
      Business: t("categoryBusiness"),
      Technology: t("categoryTechnology"),
      Children: t("categoryChildren"),
      Education: t("categoryEducation"),
      Travel: t("categoryTravel"),
    };
    return categoryTranslations[name] || name;
  };

  // Function to translate category descriptions
  const translateCategoryDescription = (description) => {
    const descriptionTranslations = {
      "Fictional stories and novels": t("descriptionFiction"),
      "Love stories and romantic novels": t("descriptionRomance"),
      "Mystery and thriller books": t("descriptionMystery"),
      "Science fiction and fantasy books": t("descriptionScienceFiction"),
      "Biographies and memoirs": t("descriptionBiography"),
      "Historical books and documentaries": t("descriptionHistory"),
      "Personal development and self-improvement": t("descriptionSelfHelp"),
      "Programming, AI, and technology books": t("descriptionTechnology"),
      "Thriller and suspense novels": t("descriptionThriller"),
      "Fantasy and magical stories": t("descriptionFantasy"),
      "Horror and scary stories": t("descriptionHorror"),
      "Business and entrepreneurship": t("descriptionBusiness"),
      "Children books and stories": t("descriptionChildren"),
      "Educational and academic books": t("descriptionEducation"),
      "Travel guides and adventures": t("descriptionTravel"),
    };
    return descriptionTranslations[description] || description;
  };

  // Fetch categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(t("failedToLoadCategories"));
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (editingCategory) {
        // Update existing category
        await axios.patch(
          `${API_ENDPOINTS.CATEGORIES}/${editingCategory._id}`,
          formData,
          { headers }
        );
      } else {
        // Create new category
        await axios.post(API_ENDPOINTS.CATEGORIES, formData, { headers });
      }

      // Reload categories and reset form
      await loadCategories();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || t("failedToSaveCategory"));
      console.error("Error saving category:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      descrption: category.descrption || "",
      photo: category.photo || "",
    });
    setShowForm(true);

    // Scroll to top smoothly so user can see the edit form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm(t("confirmDeleteCategory"))) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await axios.delete(`${API_ENDPOINTS.CATEGORIES}/${categoryId}`, {
        headers,
      });

      await loadCategories();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || t("failedToDeleteCategory"));
      console.error("Error deleting category:", err);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", descrption: "", photo: "" });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (imageUrl) => {
    setFormData({
      ...formData,
      photo: imageUrl,
    });
  };

  if (loading) {
    return (
      <div className="admin-categories-loading">
        <div className="loading-spinner"></div>
        <p>{t("loadingCategories")}</p>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      <div className="admin-categories-header">
        <h1>{t("categoriesManagement")}</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              // Scroll to top when opening the form
              setTimeout(() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }, 100);
            }
          }}
        >
          {showForm ? t("cancel") : t("addNewCategory")}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="category-form-section">
          <h2>{editingCategory ? t("editCategory") : t("addNewCategory")}</h2>
          <form onSubmit={handleFormSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="name">{t("categoryName")}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder={t("categoryName")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="descrption">{t("categoryDescription")}</label>
              <textarea
                id="descrption"
                name="descrption"
                value={formData.descrption}
                onChange={handleInputChange}
                placeholder={t("categoryDescription")}
                rows="3"
              />
            </div>

            <ImageUpload
              currentImage={formData.photo}
              onImageChange={handleImageChange}
              label={t("categoryPhoto")}
              required={false}
            />

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting
                  ? t("processing")
                  : editingCategory
                  ? t("updateCategory")
                  : t("createCategory")}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="categories-table-section">
        <h2>
          {t("allCategories")} ({categories.length})
        </h2>
        {categories.length === 0 ? (
          <div className="no-categories">
            <p>{t("noCategories")}</p>
          </div>
        ) : (
          <div className="categories-table">
            <table>
              <thead>
                <tr>
                  <th>{t("categoryName")}</th>
                  <th>{t("categoryDescription")}</th>
                  <th>{t("categoryPhoto")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td className="category-name-dashboard">
                      {translateCategoryName(category.name)}
                    </td>
                    <td className="category-description">
                      {category.descrption
                        ? translateCategoryDescription(category.descrption)
                        : t("noDescription")}
                    </td>
                    <td className="category-photo">
                      {category.photo || category.name ? (
                        <>
                          <img
                            src={getCategoryImageUrl(category.photo)}
                            alt={translateCategoryName(category.name)}
                            className="category-thumbnail"
                            onError={(e) => {
                              // Fallback to a no-image placeholder
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div
                            className="no-image-placeholder"
                            style={{ display: "none" }}
                          >
                            <i className="fas fa-camera"></i>
                          </div>
                        </>
                      ) : (
                        <div className="no-image-placeholder">
                          <i className="fas fa-camera"></i>
                        </div>
                      )}
                    </td>
                    <td className="category-actions">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(category)}
                        title={t("editCategory")}
                      >
                        {t("editAction")}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(category._id)}
                        title={t("deleteCategory")}
                      >
                        {t("deleteAction")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
