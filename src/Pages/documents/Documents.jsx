import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Modal,
  Table,
  Spinner,
} from "react-bootstrap";
import MotionDiv from "../../Components/MotionDiv";
import {
  useGetDocumentsMutation,
  useGetDocumentByIdMutation,
  useCreateDocumentMutation,
  useCreateDocumentSingleMutation,
  useUpdateDocumentMutation,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useGetTeamUsersMutation,
  useCreateDocumentUserMutation,
  useDeleteUserMutation,
  useCreateDocumentCategoryMutation,
  useGetDocumentCategoriesMutation,
  useDeleteDocumentCategoryMutation,
} from "../../features/apiSlice";
import { useSelector } from "react-redux";
import { selectAuth } from "../../features/authSlice";
import {
  FaFile,
  FaPlus,
  FaUserPlus,
  FaUsers,
  FaSave,
  FaEye,
  FaTrash,
} from "react-icons/fa";
import ImageUpload from "../../Components/ImageUpload";
import { toast } from "react-toastify";

const documentFields = [
  {
    key: "policies-procedures",
    label: "Policies/Procedures and Benefits",
    icon: FaFile,
  },
  { key: "employee-records", label: "Employee Records", icon: FaFile },
  { key: "schedules", label: "Workers Schedules", icon: FaFile },
  { key: "performance-reviews", label: "Performance Review", icon: FaFile },
  {
    key: "handbooks",
    label: "Signed Employee Handbook/Acknowledgement",
    icon: FaFile,
  },
  { key: "job-descriptions", label: "Job Descriptions", icon: FaFile },
  {
    key: "disciplinary-actions",
    label: "Disciplinary Actions Report",
    icon: FaFile,
  },
  { key: "attendance-records", label: "Attendance Records", icon: FaFile },
  { key: "training-records", label: "Training Records", icon: FaFile },
  { key: "direct-deposit", label: "Direct Deposit Form", icon: FaFile },
  {
    key: "form-i9",
    label: "Form I-9 (US Employment Eligibility)",
    icon: FaFile,
  },
  {
    key: "w4-forms",
    label: "W-4 Forms (Federal Tax Withholding)",
    icon: FaFile,
  },
  {
    key: "employment-contracts",
    label: "Employment Contract/Agreement",
    icon: FaFile,
  },
];

const Documents = () => {
  const [uploadedDocs, setUploadedDocs] = useState({}); // { key: { url, filePublicId, mimeType, size, title, id, _id, docId } }
  const [customDocuments, setCustomDocuments] = useState([]);

  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocCategory, setNewDocCategory] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [newDocFile, setNewDocFile] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showCategoryDropdownMenu, setShowCategoryDropdownMenu] =
    useState(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewUsersModal, setShowViewUsersModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    contactNumber: "",
    designation: "",
  });
  const [users, setUsers] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  const [getDocuments] = useGetDocumentsMutation();
  const [getDocumentById] = useGetDocumentByIdMutation();
  const [createDocument] = useCreateDocumentMutation();
  const [createDocumentSingle] = useCreateDocumentSingleMutation();
  const [updateDocument] = useUpdateDocumentMutation();
  const [uploadDocument] = useUploadDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [getTeamUsers, { isLoading: isUsersLoading }] =
    useGetTeamUsersMutation();
  const [createDocumentUser] = useCreateDocumentUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [getDocumentCategories] = useGetDocumentCategoriesMutation();
  const [createDocumentCategory] = useCreateDocumentCategoryMutation();
  const [deleteDocumentCategory] = useDeleteDocumentCategoryMutation();

  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setIsCreatingCategory(true);
    try {
      const res = await createDocumentCategory({
        name: newCategoryName,
      }).unwrap();
      toast.success("Category created successfully");
      // Refresh categories list
      try {
        const catRes = await getDocumentCategories().unwrap();
        if (catRes?.categories) {
          // Normalize structure to match main useEffect format
          const normalizedCategories = catRes.categories.map((cat) => ({
            _id: cat._id || cat.id,
            id: cat._id || cat.id,
            name: cat.name,
          }));
          setCategories(normalizedCategories);
        }
      } catch (e) {
        console.error("Failed to refresh categories", e);
      }
      setNewCategoryName("");
      setShowAddCategoryModal(false);
    } catch (err) {
      console.error("Create category error", err);
      const msg =
        err?.data?.message || err?.message || "Failed to create category";
      toast.error(msg);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!categoryId) return;
    const ok = window.confirm(
      "Delete this category? This action cannot be undone.",
    );
    if (!ok) return;
    try {
      const res = await deleteDocumentCategory(categoryId).unwrap();
      // Find the deleted category
      const deletedCategory = categories.find(
        (cat) => String(cat._id || cat.id) === String(categoryId),
      );
      // Remove from local list on success
      setCategories((prev) =>
        prev.filter((cat) => String(cat._id || cat.id) !== String(categoryId)),
      );
      // Clear selection if the deleted category was selected
      if (deletedCategory && newDocCategory === deletedCategory.name) {
        setNewDocCategory("");
      }
      setShowCategoryDropdownMenu(false);
      toast.success(res?.message || "Category deleted");
    } catch (err) {
      console.error("Delete category error", err);
      const msg =
        err?.data?.message || err?.message || "Error deleting category";
      toast.error(msg);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) return;
    const ok = window.confirm(
      "Delete this user? This action cannot be undone.",
    );
    if (!ok) return;
    try {
      const res = await deleteUser(userId).unwrap();
      // Remove from local list on success
      setUsers((prev) =>
        prev.filter(
          (u) => String(u._id || u.id || u.userId || "") !== String(userId),
        ),
      );
      toast.success(res?.message || "User deleted");
    } catch (err) {
      console.error("Delete user error", err);
      // Fallback: remove locally so UI stays consistent
      setUsers((prev) =>
        prev.filter(
          (u) => String(u._id || u.id || u.userId || "") !== String(userId),
        ),
      );
      const msg =
        err?.data?.message ||
        err?.message ||
        "Error deleting user; removed locally";
      toast.error(msg);
    }
  };

  useEffect(() => {
    const categoryMap = {
      Direct_Deposit: "direct-deposit",
      "Direct Deposit": "direct-deposit",
      Disciplinary_Actions_Report: "disciplinary-actions",
      Attendance_Records: "attendance-records",
      Performance_Review: "performance-reviews",
      "Form_I-9": "form-i9",
      "W-4_Forms": "w4-forms",
    };

    const fetchDocuments = async (categoryFilter = null) => {
      try {
        // Call API with or without category filter
        const res = await getDocuments(
          categoryFilter ? { category: categoryFilter } : {},
        ).unwrap();

        let allDocuments = [];

        // Handle new API structure with categories
        if (res && res.success && Array.isArray(res.categories)) {
          console.log(
            "Using new API structure with categories, filter:",
            categoryFilter,
          );

          // Update categories state from the new API response (only on initial load)
          if (!categoryFilter || categoryFilter === "all") {
            const categoriesFromAPI = res.categories.map((cat) => ({
              _id: cat.categoryId,
              id: cat.categoryId,
              name: cat.categoryName,
            }));
            setCategories(categoriesFromAPI);
          }

          // Flatten categories into documents array
          res.categories.forEach((category) => {
            if (category.documents && Array.isArray(category.documents)) {
              category.documents.forEach((doc) => {
                allDocuments.push({
                  ...doc,
                  categoryId: category.categoryId,
                  categoryName: category.categoryName,
                  category: doc.category || category.categoryName,
                });
              });
            }
          });
        }
        // Backward compatibility: handle old API structure with documents array
        else if (res && res.success && Array.isArray(res.documents)) {
          console.log("Using legacy API structure with documents array");
          allDocuments = res.documents;
        }

        if (allDocuments.length > 0) {
          const docsMap = {};
          const newCustom = [];

          allDocuments.forEach((doc) => {
            let key = null;

            // Extract category info - handle both string and object formats
            const categoryInfo =
              typeof doc.category === "object" && doc.category
                ? {
                    categoryId: doc.category._id || doc.category.id,
                    categoryName: doc.category.name,
                    categoryString: doc.category.name,
                  }
                : {
                    categoryId: doc.categoryId,
                    categoryName: doc.categoryName,
                    categoryString: doc.category,
                  };

            if (
              categoryInfo.categoryString &&
              categoryMap[categoryInfo.categoryString]
            )
              key = categoryMap[categoryInfo.categoryString];
            if (!key && categoryInfo.categoryString) {
              const normalized = categoryInfo.categoryString
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-");
              if (documentFields.some((f) => f.key === normalized))
                key = normalized;
            }
            if (!key && doc.title) {
              const normalized = doc.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-");
              if (documentFields.some((f) => f.key === normalized))
                key = normalized;
            }

            const resolvedId = doc._id || doc.id || doc.docId || null;
            const entry = {
              url: doc.fileUrl,
              mimeType: doc.mimeType,
              title: doc.title || "",
              id: resolvedId,
              _id: doc._id || null,
              docId: doc.docId || null,
              category: categoryInfo.categoryString,
              categoryId: categoryInfo.categoryId || null,
              categoryName: categoryInfo.categoryName || "",
              filePublicId: doc.filePublicId || doc.fileKey,
              size: doc.size || 0,
            };

            if (key) {
              const existing = docsMap[key];
              const sameAs = (e) =>
                e &&
                (e.url === entry.url ||
                  e.filePublicId === entry.filePublicId ||
                  (e.id && entry.id && String(e.id) === String(entry.id)));
              if (existing) {
                if (Array.isArray(existing)) {
                  // only push if an entry with same url/filePublicId/id isn't already present
                  if (!existing.some(sameAs)) existing.push(entry);
                } else {
                  // if single entry and it's different, convert to array
                  if (!sameAs(existing)) docsMap[key] = [existing, entry];
                  else docsMap[key] = existing;
                }
              } else docsMap[key] = entry;
            } else {
              // Prefer using the server-provided category as the custom key when available
              // This keeps client-side keys stable across refreshes (client used custom-<timestamp> when creating)
              const customKey = `custom-${doc._id || Date.now()}`;
              const c = {
                key: customKey,
                label: doc.title || doc.categoryName || customKey,
                icon: FaFile,
                ...entry,
              };
              // Add to docsMap under the custom key. We'll derive `customDocuments` from docsMap after processing all docs
              docsMap[customKey] = c;
            }
          });

          // Derive custom documents from docsMap keys (ensure no custom backend docs are missed)
          const derivedCustom = Object.keys(docsMap)
            .filter((k) => k && k.startsWith("custom-"))
            .map((k) => {
              const e = docsMap[k];
              return {
                key: k,
                label: e.title || e.label || k,
                icon: FaFile,
                ...e,
              };
            });

          // Debug: log fetched documents and mapping to help trace missing items
          try {
            // eslint-disable-next-line no-console
            console.debug(
              "fetchDocuments: fetched",
              allDocuments.length,
              "docs, derivedCustom:",
              derivedCustom.map((nc) => nc.key),
            );
            // eslint-disable-next-line no-console
            console.debug("fetchDocuments: docsMap keys", Object.keys(docsMap));
            // eslint-disable-next-line no-console
            console.debug("fetchDocuments: allDocuments", allDocuments);
            // eslint-disable-next-line no-console
            console.debug("fetchDocuments: derivedCustom", derivedCustom);
          } catch (e) {}

          setUploadedDocs(docsMap);
          // Replace custom documents list with the freshly derived list to avoid duplicates or omissions
          setCustomDocuments(derivedCustom);

          // Debug: log category information for filtering
          try {
            // eslint-disable-next-line no-console
            console.debug(
              "Documents with categories:",
              derivedCustom.map((d) => ({
                key: d.key,
                label: d.label,
                categoryName: d.categoryName,
                category: d.category,
              })),
            );
          } catch (e) {}
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };

    // Determine what category filter to send to API
    let apiCategoryFilter = null;
    if (
      filterCategory &&
      filterCategory !== "all" &&
      filterCategory !== "custom" &&
      filterCategory !== "predefined"
    ) {
      // Find the category ID from the categories list
      const selectedCategory = categories.find(
        (cat) => cat.name === filterCategory,
      );
      apiCategoryFilter = selectedCategory
        ? selectedCategory._id || selectedCategory.id
        : null;
    }

    fetchDocuments(apiCategoryFilter);
  }, [getDocuments, filterCategory]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showCategoryDropdownMenu &&
        !event.target.closest(".category-dropdown-container")
      ) {
        setShowCategoryDropdownMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCategoryDropdownMenu]);

  const getDocsForKey = (key) => {
    const entry = uploadedDocs[key];
    if (!entry) return [];
    return Array.isArray(entry) ? entry : [entry];
  };

  const getFileName = (url) => {
    if (!url) return "";
    const realUrl = typeof url === "object" && url.url ? url.url : url;
    try {
      const parts = realUrl.split("/");
      return parts[parts.length - 1];
    } catch {
      return "";
    }
  };

  const handleAddDocFileSelect = async (file) => {
    if (!file) return;
    // Store the file object directly without uploading
    setNewDocFile(file);
    toast.success("File selected");
  };

  const handleUpload = async (key, uploadData) => {
    if (!uploadData) return;
    // If a File object, upload immediately
    if (uploadData instanceof File) {
      try {
        const fd = new FormData();
        fd.append("files", uploadData);
        fd.append("folder", "documents");
        const res = await uploadDocument(fd).unwrap();
        if (res && res.success && res.files && res.files[0]) {
          const f = res.files[0];
          setUploadedDocs((prev) => {
            const prevEntry = prev[key];
            const newEntry = {
              url: f.url,
              filePublicId: f.public_id,
              mimeType: uploadData.type,
              size: uploadData.size,
              title: uploadData.name,
              category: key,
            };
            if (Array.isArray(prevEntry)) {
              const updated = [...prevEntry];
              updated[0] = { ...updated[0], ...newEntry };
              return { ...prev, [key]: updated };
            }
            if (prevEntry && typeof prevEntry === "object")
              return { ...prev, [key]: { ...prevEntry, ...newEntry } };
            return { ...prev, [key]: newEntry };
          });
          toast.success("Document uploaded");
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Upload failed");
      }
      return;
    }

    // If uploadData is URL/metadata, merge it preserving id fields
    const entryFromUpload =
      typeof uploadData === "string"
        ? { url: uploadData }
        : uploadData || { url: "" };
    setUploadedDocs((prev) => {
      const prevEntry = prev[key] || {};
      const merged = { ...prevEntry, ...entryFromUpload };
      // preserve id/_id/docId from prevEntry if present
      if (prevEntry.id || prevEntry._id || prevEntry.docId)
        merged.id = prevEntry.id || prevEntry._id || prevEntry.docId;
      return { ...prev, [key]: merged };
    });
  };

  const handleSaveDocument = async (key, index = 0, showToast = true) => {
    const docs = getDocsForKey(key);
    const doc = docs[index];
    if (!doc || !doc.url) {
      if (showToast) toast.error("Missing document data");
      return { success: false, key, label: key };
    }

    try {
      // If has id -> update (PUT)
      const existingId = doc.id || doc._id || doc.docId;
      const payload = {
        title: doc.title || key,
        category: doc.category || key,
        fileUrl: doc.url,
        filePublicId: doc.filePublicId,
        mimeType: doc.mimeType,
        size: doc.size || 0,
      };

      if (!existingId) {
        // Try single endpoint (multipart-friendly) first, fallback to generic create
        try {
          const res = await createDocumentSingle({
            title: payload.title,
            category: payload.category,
            fileName: doc.title || getFileName(doc.url),
            fileUrl: payload.fileUrl,
            fileSize: payload.size,
          }).unwrap();
          if (res && res.success) {
            // Save returned document data into local state
            const created = res.document || res;
            const createdId = created._id || created.id || null;

            // Handle category object from API response
            const categoryData =
              typeof created.category === "object"
                ? {
                    categoryId: created.category._id || created.category.id,
                    categoryName: created.category.name,
                    category: created.category.name,
                  }
                : {
                    category: created.category,
                  };

            if (createdId) {
              setUploadedDocs((prev) => {
                const prevEntry = prev[key];
                const newData = {
                  ...prevEntry,
                  id: createdId,
                  _id: createdId,
                  title: created.title || prevEntry.title,
                  url: created.fileUrl || prevEntry.url,
                  mimeType: created.mimeType || prevEntry.mimeType,
                  size: created.size || prevEntry.size,
                  filePublicId:
                    created.filePublicId ||
                    created.fileKey ||
                    prevEntry.filePublicId,
                  ...categoryData,
                };

                if (Array.isArray(prevEntry)) {
                  const updated = [...prevEntry];
                  updated[index] = newData;
                  return { ...prev, [key]: updated };
                }
                return { ...prev, [key]: newData };
              });
            }
            if (showToast) toast.success("Document created");
            return { success: true, key, label: payload.title };
          }
        } catch (err) {
          const isFileRequired =
            err?.data?.message === "File is required" || err?.status === 400;
          if (!isFileRequired) throw err;
        }

        const fallback = await createDocument(payload).unwrap();
        if (fallback && fallback.success) {
          const created = fallback.document || fallback;
          const createdId = created._id || created.id || null;

          // Handle category object from API response
          const categoryData =
            typeof created.category === "object"
              ? {
                  categoryId: created.category._id || created.category.id,
                  categoryName: created.category.name,
                  category: created.category.name,
                }
              : {
                  category: created.category,
                };

          if (createdId) {
            setUploadedDocs((prev) => {
              const prevEntry = prev[key];
              const newData = {
                ...prevEntry,
                id: createdId,
                _id: createdId,
                title: created.title || prevEntry.title,
                url: created.fileUrl || prevEntry.url,
                mimeType: created.mimeType || prevEntry.mimeType,
                size: created.size || prevEntry.size,
                filePublicId:
                  created.filePublicId ||
                  created.fileKey ||
                  prevEntry.filePublicId,
                ...categoryData,
              };

              if (Array.isArray(prevEntry)) {
                const updated = [...prevEntry];
                updated[index] = newData;
                return { ...prev, [key]: updated };
              }
              return { ...prev, [key]: newData };
            });
          }
          if (showToast) toast.success("Document created");
          return { success: true, key, label: payload.title };
        }
        if (showToast)
          toast.error(fallback?.message || "Failed to create document");
        return { success: false, key, label: payload.title };
      }

      const res = await updateDocument({
        id: existingId,
        data: payload,
      }).unwrap();

      console.log("Document updated successfully:", res);

      if (res && (res.success === true || res.document)) {
        // ensure local state has the updated document data
        const returned = res.document || res;
        const returnedId = returned._id || returned.id || existingId;

        // Handle category object from API response
        const categoryData =
          typeof returned.category === "object"
            ? {
                categoryId: returned.category._id || returned.category.id,
                categoryName: returned.category.name,
                category: returned.category.name,
              }
            : {
                category: returned.category,
              };

        if (returnedId) {
          setUploadedDocs((prev) => {
            const prevEntry = prev[key];
            const updatedData = {
              ...prevEntry,
              id: returnedId,
              _id: returnedId,
              title: returned.title || prevEntry.title,
              url: returned.fileUrl || prevEntry.url,
              mimeType: returned.mimeType || prevEntry.mimeType,
              size: returned.size || prevEntry.size,
              filePublicId:
                returned.filePublicId ||
                returned.fileKey ||
                prevEntry.filePublicId,
              ...categoryData,
            };

            if (Array.isArray(prevEntry)) {
              const updated = [...prevEntry];
              updated[index] = updatedData;
              return { ...prev, [key]: updated };
            }
            return { ...prev, [key]: updatedData };
          });
        }
        if (showToast) toast.success("Document updated");
        return { success: true, key, label: payload.title };
      }
      if (showToast) toast.error(res?.message || "Failed to update");
      return { success: false, key, label: payload.title };
    } catch (err) {
      console.error("Save document error:", err);
      if (showToast)
        toast.error(
          err?.data?.message || err?.message || "Error saving document",
        );
      return { success: false, key, label: doc.title || key };
    }
  };

  const handleSaveDocuments = async () => {
    const keys = Object.keys(uploadedDocs);
    if (keys.length === 0) {
      toast.info("No documents to save");
      return;
    }
    setIsSaving(true);
    try {
      const results = await Promise.all(
        keys.map((k) => handleSaveDocument(k, 0, false)),
      );
      const failed = results.filter((r) => !r.success);
      const succeeded = results.filter((r) => r.success);
      if (failed.length === 0)
        toast.success("All documents saved successfully!");
      else if (succeeded.length === 0) toast.error("Failed to save documents");
      else
        toast.warning(
          `${succeeded.length} saved, ${failed.length} failed: ${failed.map((f) => f.label).join(", ")}`,
        );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAt = async (key, index = null) => {
    const prevEntry = uploadedDocs[key];
    if (!prevEntry) return;
    const removeLocal = (k, idx = null) =>
      setUploadedDocs((prev) => {
        const next = { ...prev };
        if (idx === null) {
          delete next[k];
          return next;
        }
        const entry = prev[k];
        if (Array.isArray(entry)) {
          const updated = entry.filter((_, i) => i !== idx);
          next[k] = updated;
          return next;
        }
        delete next[k];
        return next;
      });

    if (index === null) {
      console.log("Deleting all documents for key:", key);
      const docs = getDocsForKey(key);
      let deletedCount = 0;
      let errorCount = 0;

      for (const d of docs) {
        const idToDelete = d && (d._id || d.id || d.docId);
        if (idToDelete) {
          try {
            console.log("Deleting document with ID:", idToDelete);
            const res = await deleteDocument(idToDelete).unwrap();
            console.log("Delete response:", res);
            if (res && res.success) {
              deletedCount++;
            } else {
              errorCount++;
              console.error("Delete failed for ID:", idToDelete, res);
            }
          } catch (err) {
            errorCount++;
            console.error("Delete remote failed for ID:", idToDelete, err);
            const msg = err?.data?.message || err?.message || "Error deleting";
            toast.error(msg);
          }
        }
      }

      removeLocal(key, null);
      if (errorCount === 0) {
        toast.success(`Document(s) removed successfully`);
      } else if (deletedCount > 0) {
        toast.warning(`${deletedCount} deleted, ${errorCount} failed`);
      }
      return;
    }

    const docs = getDocsForKey(key);
    const doc = docs[index];
    console.log("Deleting document:", doc);

    if (!doc) return;
    const idToDelete = doc && (doc._id || doc.id || doc.docId);
    console.log("Document ID to delete:", idToDelete);

    if (idToDelete) {
      try {
        const res = await deleteDocument(idToDelete).unwrap();
        console.log("Delete response:", res);

        if (res && res.success) {
          removeLocal(key, index);
          toast.success(res.message || "Document deleted successfully");
        } else {
          toast.error(res?.message || "Failed to delete document");
        }
      } catch (err) {
        console.error("Delete error:", err);
        const msg =
          err?.data?.message || err?.message || "Error deleting document";
        toast.error(msg);
      }
    } else {
      console.log("No document ID found, removing locally only");
      removeLocal(key, index);
      toast.success("Removed locally");
    }
  };

  const handleFetchDocumentById = async (documentId) => {
    if (!documentId) {
      toast.error("Document ID is required");
      return null;
    }
    try {
      const res = await getDocumentById(documentId).unwrap();
      if (res && res.success && res.document) {
        console.log("Fetched document details:", res.document);
        return res.document;
      } else {
        toast.error("Failed to fetch document details");
        return null;
      }
    } catch (err) {
      console.error("Error fetching document by ID:", err);
      const msg =
        err?.data?.message || err?.message || "Error fetching document";
      toast.error(msg);
      return null;
    }
  };

  const handleView = (url, documentId = null) => {
    console.log("handleView called with:", { url, documentId });

    // If documentId is provided, fetch fresh document details first
    if (documentId) {
      handleFetchDocumentById(documentId).then((doc) => {
        console.log("Fetched doc for view:", doc);
        if (doc && doc.fileUrl) {
          // Open the fresh URL from the API response
          console.log("Opening fileUrl:", doc.fileUrl);
          try {
            window.open(encodeURI(doc.fileUrl), "_blank");
          } catch {
            window.open(doc.fileUrl, "_blank");
          }
        } else if (url) {
          // Fallback to provided URL if API fetch fails
          console.log("Fallback to provided url:", url);
          openDocumentUrl(url);
        }
      });
      return;
    }

    // If no documentId, use the provided URL directly
    console.log("Using url directly:", url);
    openDocumentUrl(url);
  };

  const openDocumentUrl = (url) => {
    if (!url) {
      console.warn("openDocumentUrl: No URL provided");
      toast.error("No document URL available");
      return;
    }
    console.log("openDocumentUrl called with:", url);

    const realUrl = typeof url === "object" && url.url ? url.url : url;
    console.log("realUrl:", realUrl);

    // Check if it's already a full URL
    if (/^https?:\/\//i.test(realUrl)) {
      console.log("Already a full URL, opening directly:", realUrl);
      try {
        window.open(realUrl, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.error("Failed to open URL:", err);
        toast.error("Failed to open document");
      }
      return;
    }

    // If not a full URL, try to construct it with base URL
    const base =
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_BASE_URL
        ? import.meta.env.VITE_BASE_URL
        : "";
    console.log("base:", base);

    if (!base) {
      console.warn("No VITE_BASE_URL configured and URL is relative:", realUrl);
      toast.error("Document URL configuration error");
      return;
    }

    const makeAbsolute = (u) => {
      if (!u) return u;
      if (/^https?:\/\//i.test(u) || /^\/\//.test(u)) return u;
      if (!base) return u;
      const b = base.replace(/\/$/, "");
      if (u.startsWith("/")) return b + u;
      return b + "/" + u;
    };
    const finalUrl = makeAbsolute(realUrl);
    console.log("finalUrl to open:", finalUrl);

    try {
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to open URL:", err);
      toast.error("Failed to open document");
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Name and email required");
      return;
    }
    setCreatingUser(true);
    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        contact: newUser.contactNumber || "",
        designation: newUser.designation || "",
      };
      const res = await createDocumentUser(payload).unwrap();
      if (res && (res.success === true || res.user)) {
        const created = res.user || res;
        setUsers((prev) => [
          {
            _id: created._id || created.id,
            name: created.name || payload.name,
            email: created.email || payload.email,
            contact: created.contact || payload.contact,
            designation: created.designation || payload.designation,
          },
          ...prev,
        ]);
        setNewUser({ name: "", email: "", contactNumber: "", designation: "" });
        setShowUserModal(false);
        toast.success("User added");
      } else {
        toast.error(res?.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Create user error", err);
      // Fallback: add locally (kept existing behavior)
      setUsers((prev) => [
        {
          id: Date.now(),
          name: newUser.name,
          email: newUser.email,
          contact: newUser.contactNumber || "",
          designation: newUser.designation || "",
        },
        ...prev,
      ]);
      setNewUser({ name: "", email: "", contactNumber: "", designation: "" });
      setShowUserModal(false);
      toast.warn("Invalid Email address, Try again");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleAddCustomDocument = async () => {
    if (!newDocCategory.trim()) {
      toast.error("Category name required");
      return;
    }
    if (!newDocName.trim()) {
      toast.error("Document name required");
      return;
    }
    if (!newDocFile) {
      toast.error("Please select a file first");
      return;
    }
    const customKey = `custom-${Date.now()}`;
    try {
      // Find the selected category to get categoryId
      const selectedCategory = categories.find(
        (c) => c.name === newDocCategory,
      );

      if (!selectedCategory) {
        toast.error("Please select a valid category");
        return;
      }

      const categoryId = selectedCategory._id || selectedCategory.id;

      // Create FormData with categoryId, title, and file
      const formData = new FormData();
      formData.append("categoryId", categoryId);
      formData.append("title", newDocName);
      formData.append("file", newDocFile);

      // Send to single document creation endpoint
      const res = await createDocumentSingle(formData).unwrap();

      if (res && res.success) {
        const created = res.document || res;
        const entry = {
          key: customKey,
          label: newDocCategory,
          url: created.fileUrl || created.url,
          filePublicId: created.filePublicId,
          mimeType: newDocFile.type,
          size: newDocFile.size,
          title: newDocName,
          category: customKey,
          id: created._id || created.id || null,
        };
        setCustomDocuments((prev) => [...prev, entry]);
        setUploadedDocs((prev) => ({ ...prev, [customKey]: entry }));
        setNewDocCategory("");
        setNewDocName("");
        setNewDocFile(null);
        setShowAddDocModal(false);
        toast.success("Document added successfully");
        // Refresh categories
        try {
          const catRes = await getDocumentCategories().unwrap();
          if (catRes?.categories) {
            // Normalize structure to match main useEffect format
            const normalizedCategories = catRes.categories.map((cat) => ({
              _id: cat._id || cat.id,
              id: cat._id || cat.id,
              name: cat.name,
            }));
            setCategories(normalizedCategories);
          }
        } catch (e) {
          console.error("Failed to refresh categories", e);
        }
      } else {
        toast.error("Failed to add document");
      }
    } catch (err) {
      console.error("Add custom doc failed", err);
      const msg =
        err?.data?.message || err?.message || "Failed to add document";
      toast.error(msg);
    }
  };

  return (
    <MotionDiv>
      <Container fluid>
        <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h2>Document Management</h2>
            <p className="text-muted">
              Upload company documents, policies, and employee records
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="info"
              size="sm"
              onClick={async () => {
                setNewDocCategory("");
                setNewDocName("");
                setNewDocFile(null);
                setShowAddDocModal(true);
                // Fetch categories when modal opens (only if not already loaded)
                if (categories.length === 0) {
                  try {
                    const res = await getDocumentCategories().unwrap();
                    if (res && res.success && res.categories) {
                      // Normalize structure to match main useEffect format
                      const normalizedCategories = res.categories.map(
                        (cat) => ({
                          _id: cat._id || cat.id,
                          id: cat._id || cat.id,
                          name: cat.name,
                        }),
                      );
                      setCategories(normalizedCategories);
                    }
                  } catch (err) {
                    console.error("Failed to fetch categories:", err);
                  }
                }
              }}
            >
              <FaPlus /> Add Document
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setNewUser({ name: "", email: "" });
                setShowUserModal(true);
              }}
            >
              <FaUserPlus /> Add User
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={async () => {
                setShowViewUsersModal(true);
                try {
                  const res = await getTeamUsers().unwrap();
                  if (res && res.success && Array.isArray(res.users))
                    setUsers(res.users);
                } catch (e) {
                  setUsers([]);
                }
              }}
            >
              <FaUsers /> View Users
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleSaveDocuments}
              disabled={Object.keys(uploadedDocs).length === 0 || isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner as="span" animation="border" size="sm" /> Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Documents
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-3 d-flex align-items-center gap-2">
          <label
            className="mb-0 fw-semibold"
            style={{ minWidth: "fit-content" }}
          >
            Filter by Category:
          </label>
          <Form.Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ maxWidth: "300px" }}
            size="sm"
          >
            <option value="all">All Categories</option>
            {/* <option value="custom">Custom Documents</option>
            <option value="predefined">Predefined Documents</option> */}
            {categories.length > 0 && (
              <optgroup label="Categories">
                {categories
                  .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
                  .map((cat) => (
                    <option key={cat._id || cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
              </optgroup>
            )}
          </Form.Select>
          {filterCategory !== "all" && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setFilterCategory("all")}
            >
              Clear Filter
            </Button>
          )}
        </div>

        <Row className="g-2 g-sm-3">
          {customDocuments
            .filter((field) => {
              if (filterCategory === "all") return true;

              // For "custom": show only documents that don't match predefined documentFields keys
              if (filterCategory === "custom") {
                const predefinedKeys = documentFields.map((f) => f.key);
                return !predefinedKeys.includes(field.key);
              }

              // For "predefined": show only documents that match predefined documentFields keys
              if (filterCategory === "predefined") {
                const predefinedKeys = documentFields.map((f) => f.key);
                return predefinedKeys.includes(field.key);
              }

              // For specific category selections: check if document belongs to selected category
              return (
                field.categoryName === filterCategory ||
                field.category === filterCategory
              );
            })
            .map((field) => (
              <Col xs={12} sm={6} md={4} lg={3} key={field.key}>
                <Card className="h-100 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center py-2 px-3">
                    <strong
                      className="text-truncate me-2 small"
                      style={{ minWidth: 0, flex: 1 }}
                      title={field.label}
                    >
                      {field.label}
                    </strong>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0 shrink-0"
                      onClick={async () => {
                        const docs = getDocsForKey(field.key);
                        // Delete all documents from backend
                        for (const d of docs) {
                          const idToDelete = d && (d._id || d.id || d.docId);
                          if (idToDelete) {
                            try {
                              await deleteDocument(idToDelete).unwrap();
                            } catch (err) {
                              console.error("Delete remote failed", err);
                            }
                          }
                        }
                        // Remove from local state
                        setCustomDocuments((prev) =>
                          prev.filter((d) => d.key !== field.key),
                        );
                        setUploadedDocs((prev) => {
                          const copy = { ...prev };
                          delete copy[field.key];
                          return copy;
                        });
                        toast.success("Custom document removed");
                      }}
                    >
                      <FaTrash size={14} />
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-3">
                    <ImageUpload
                      value={
                        (getDocsForKey(field.key)[0] &&
                          getDocsForKey(field.key)[0].url) ||
                        ""
                      }
                      onChange={(val) => handleUpload(field.key, val)}
                      label={`Upload ${field.label}`}
                      buttonText="Select File"
                      showPreview={false}
                      maxSize={30}
                    />
                    {getDocsForKey(field.key).length > 0 && (
                      <div className="uploaded-file-info mt-2 mt-sm-3">
                        {getDocsForKey(field.key).map((d, idx) => (
                          <div
                            key={idx}
                            className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between p-2 bg-light rounded mb-2 gap-2"
                          >
                            <div
                              className="d-flex align-items-center w-100 w-sm-auto"
                              style={{
                                minWidth: 0,
                                flex: 1,
                                overflow: "hidden",
                              }}
                            >
                              <FaFile
                                className="me-2 text-primary shrink-0"
                                size={16}
                              />
                              <span
                                className="small text-truncate"
                                style={{ minWidth: 0, flex: 1 }}
                                title={getFileName(d && d.url)}
                              >
                                {getFileName(d && d.url)}
                              </span>
                            </div>
                            <div className="d-flex gap-1 shrink-0 align-self-end align-self-sm-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  console.log(
                                    "View button clicked for custom document:",
                                    d,
                                  );
                                  console.log("Document URL:", d.url);
                                  console.log("Document IDs:", {
                                    id: d.id,
                                    _id: d._id,
                                    docId: d.docId,
                                  });
                                  handleView(d.url, d.id || d._id || d.docId);
                                }}
                                title="View"
                              >
                                <FaEye size={12} />
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  handleSaveDocument(field.key, idx)
                                }
                                title="Save"
                              >
                                <FaSave size={12} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteAt(field.key, idx)}
                                title="Delete"
                              >
                                <FaTrash size={12} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          {documentFields
            .filter((field) => {
              if (getDocsForKey(field.key).length === 0) return false;
              if (filterCategory === "all") return true;
              if (filterCategory === "custom") return false;
              if (filterCategory === "predefined") return true;
              return field.label === filterCategory;
            })
            .map((field) => (
              <Col xs={12} sm={6} md={4} lg={3} key={field.key}>
                <Card className="h-100 shadow-sm">
                  <Card.Header className="py-2 px-3">
                    <strong
                      className="text-truncate d-block small"
                      title={field.label}
                    >
                      {field.label}
                    </strong>
                  </Card.Header>
                  <Card.Body className="p-3">
                    <ImageUpload
                      value={
                        (getDocsForKey(field.key)[0] &&
                          getDocsForKey(field.key)[0].url) ||
                        ""
                      }
                      onChange={(val) => handleUpload(field.key, val)}
                      label={`Upload ${field.label}`}
                      buttonText="Select File"
                      showPreview={false}
                      maxSize={30}
                    />
                    {getDocsForKey(field.key).length > 0 && (
                      <div className="uploaded-file-info mt-2 mt-sm-3">
                        {getDocsForKey(field.key).map((d, idx) => (
                          <div
                            key={idx}
                            className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between p-2 bg-light rounded mb-2 gap-2"
                          >
                            <div
                              className="d-flex align-items-center w-100 w-sm-auto"
                              style={{
                                minWidth: 0,
                                flex: 1,
                                overflow: "hidden",
                              }}
                            >
                              <FaFile
                                className="me-2 text-primary shrink-0"
                                size={16}
                              />
                              <span
                                className="small text-truncate"
                                style={{ minWidth: 0, flex: 1 }}
                                title={getFileName(d && d.url)}
                              >
                                {getFileName(d && d.url)}
                              </span>
                            </div>
                            <div className="d-flex gap-1 shrink-0 align-self-end align-self-sm-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  console.log(
                                    "View button clicked for predefined document:",
                                    d,
                                  );
                                  console.log("Document URL:", d.url);
                                  console.log("Document IDs:", {
                                    id: d.id,
                                    _id: d._id,
                                    docId: d.docId,
                                  });
                                  handleView(d.url, d.id || d._id || d.docId);
                                }}
                                title="View"
                              >
                                <FaEye size={12} />
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  handleSaveDocument(field.key, idx)
                                }
                                title="Save"
                              >
                                <FaSave size={12} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteAt(field.key, idx)}
                                title="Delete"
                              >
                                <FaTrash size={12} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>

        {/* Add Document Modal */}
        <Modal
          show={showAddDocModal}
          onHide={() => {
            setShowAddDocModal(false);
            setNewDocCategory("");
            setNewDocName("");
            setNewDocFile(null);
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaPlus className="me-2" /> Add New Document
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" style={{ position: "relative" }}>
                <Form.Label>
                  Category Name <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <div className="d-flex gap-2">
                  <div
                    className="category-dropdown-container"
                    style={{ flex: 1, position: "relative" }}
                  >
                    <Form.Control
                      type="text"
                      value={newDocCategory}
                      placeholder="Select category"
                      onClick={() =>
                        setShowCategoryDropdownMenu(!showCategoryDropdownMenu)
                      }
                      readOnly
                      style={{ cursor: "pointer" }}
                    />
                    {showCategoryDropdownMenu && categories.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 1050,
                          backgroundColor: "white",
                          border: "1px solid #dee2e6",
                          borderRadius: "0.375rem",
                          maxHeight: "200px",
                          overflowY: "auto",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          marginTop: "4px",
                        }}
                      >
                        {categories.map((cat) => (
                          <div
                            key={cat._id}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "white";
                            }}
                          >
                            <span
                              style={{ flex: 1 }}
                              onClick={() => {
                                setNewDocCategory(cat.name);
                                setShowCategoryDropdownMenu(false);
                              }}
                            >
                              {cat.name}
                            </span>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger p-0 ms-2"
                              style={{ fontSize: "14px" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(cat._id);
                              }}
                              title="Delete category"
                            >
                              <FaTrash size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="success"
                    onClick={() => setShowAddCategoryModal(true)}
                    title="Add new category"
                  >
                    <FaPlus /> Add
                  </Button>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Document Name <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <ImageUpload
                  value={newDocFile ? "file-selected" : ""}
                  onChange={handleAddDocFileSelect}
                  label="Upload File"
                  buttonText={newDocFile ? "Change File" : "Select File"}
                  showPreview={false}
                  maxSize={30}
                />
                {newDocFile && (
                  <small className="text-muted d-block mt-2">
                    Selected: {newDocFile.name || "Unknown file"}
                  </small>
                )}
              </Form.Group>
              <Button
                variant="primary"
                onClick={handleAddCustomDocument}
                className="w-100"
                disabled={
                  !newDocCategory.trim() || !newDocName.trim() || !newDocFile
                }
              >
                Add Document
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Add Category Modal */}
        <Modal
          show={showAddCategoryModal}
          onHide={() => {
            setShowAddCategoryModal(false);
            setNewCategoryName("");
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaPlus className="me-2" /> Add New Category
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Category Name <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateNewCategory();
                    }
                  }}
                />
              </Form.Group>
              <Button
                variant="primary"
                onClick={handleCreateNewCategory}
                className="w-100"
                disabled={!newCategoryName.trim() || isCreatingCategory}
              >
                {isCreatingCategory ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Add/Edit User Modal */}
        <Modal
          show={showUserModal}
          onHide={() => {
            setShowUserModal(false);
            setNewUser({
              name: "",
              email: "",
              contactNumber: "",
              designation: "",
            });
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUserPlus className="me-2" /> Add New User
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Name <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Email <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Contact <span className="text-muted">(optional)</span>
                </Form.Label>
                <Form.Control
                  value={newUser.contactNumber}
                  onChange={(e) =>
                    setNewUser({ ...newUser, contactNumber: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Designation <span className="text-muted">(optional)</span>
                </Form.Label>
                <Form.Control
                  value={newUser.designation}
                  onChange={(e) =>
                    setNewUser({ ...newUser, designation: e.target.value })
                  }
                />
              </Form.Group>
              <Button
                variant="primary"
                onClick={handleCreateUser}
                disabled={!newUser.name || !newUser.email || creatingUser}
                className="w-100"
              >
                {creatingUser ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />{" "}
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* View Users Modal */}
        <Modal
          show={showViewUsersModal}
          onHide={() => setShowViewUsersModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUsers className="me-2" /> All Users
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isUsersLoading ? (
              <Alert variant="info">Loading users...</Alert>
            ) : users.length === 0 ? (
              <Alert variant="info">No users found.</Alert>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u._id || u.id || i}>
                        <td>{i + 1}</td>
                        <td>
                          {u.name || `${u.firstName || ""} ${u.lastName || ""}`}
                        </td>
                        <td>{u.email}</td>
                        <td>{u.role || "-"}</td>
                        <td>{u.isActive ? "Yes" : "No"}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                handleDeleteUser(u._id || u.id || u.userId)
                              }
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </MotionDiv>
  );
};

export default Documents;
