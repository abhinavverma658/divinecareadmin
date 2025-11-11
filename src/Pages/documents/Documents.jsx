import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Table, Spinner } from 'react-bootstrap';
import MotionDiv from '../../Components/MotionDiv';
import { useGetDocumentsMutation, useCreateDocumentMutation, useCreateDocumentSingleMutation, useUpdateDocumentMutation, useUploadDocumentMutation, useDeleteDocumentMutation, useGetTeamUsersMutation, useCreateDocumentUserMutation } from '../../features/apiSlice';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import { FaUpload, FaFileContract, FaUserTie, FaCalendarAlt, FaChartLine, FaBook, FaBriefcase, FaExclamationTriangle, FaClock, FaGraduationCap, FaUniversity, FaIdCard, FaCalculator, FaHandshake, FaEye, FaEdit, FaTrash, FaFile, FaPlus, FaUserPlus, FaUsers, FaSave } from 'react-icons/fa';
import ImageUpload from '../../Components/ImageUpload';
import { toast } from 'react-toastify';

const documentFields = [
  { key: 'policies-procedures', label: 'Policies/Procedures and Benefits', icon: FaFileContract },
  { key: 'employee-records', label: 'Employee Records', icon: FaUserTie },
  { key: 'schedules', label: 'Workers Schedules', icon: FaCalendarAlt },
  { key: 'performance-reviews', label: 'Performance Review', icon: FaChartLine },
  { key: 'handbooks', label: 'Signed Employee Handbook/Acknowledgement', icon: FaBook },
  { key: 'job-descriptions', label: 'Job Descriptions', icon: FaBriefcase },
  { key: 'disciplinary-actions', label: 'Disciplinary Actions Report', icon: FaExclamationTriangle },
  { key: 'attendance-records', label: 'Attendance Records', icon: FaClock },
  { key: 'training-records', label: 'Training Records', icon: FaGraduationCap },
  { key: 'direct-deposit', label: 'Direct Deposit Form', icon: FaUniversity },
  { key: 'form-i9', label: 'Form I-9 (US Employment Eligibility)', icon: FaIdCard },
  { key: 'w4-forms', label: 'W-4 Forms (Federal Tax Withholding)', icon: FaCalculator },
  { key: 'employment-contracts', label: 'Employment Contract/Agreement', icon: FaHandshake }
];

const Documents = () => {
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [showUserModal, setShowUserModal] = useState(false);
  const [showViewUsersModal, setShowViewUsersModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocFile, setNewDocFile] = useState(null);
  const [customDocuments, setCustomDocuments] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', contactNumber: '', designation: '' });
  // Team users state from API
  const [users, setUsers] = useState([]);
  const [getTeamUsers, { isLoading: isUsersLoading }] = useGetTeamUsersMutation();
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [getDocuments] = useGetDocumentsMutation();
  const [createDocument] = useCreateDocumentMutation();
  const [createDocumentSingle] = useCreateDocumentSingleMutation();
  const [updateDocument] = useUpdateDocumentMutation();
  const [createDocumentUser, { isLoading: isCreatingUser }] = useCreateDocumentUserMutation();
  const auth = useSelector(selectAuth);

  useEffect(() => {
    // Map API categories to our internal documentFields keys
    const categoryMap = {
      'Direct_Deposit': 'direct-deposit',
      'Direct Deposit': 'direct-deposit',
      'Disciplinary_Actions_Report': 'disciplinary-actions',
      'Attendance_Records': 'attendance-records',
      'Performance_Review': 'performance-reviews',
      'Form_I-9': 'form-i9',
      'W-4_Forms': 'w4-forms',
      'Policies': 'policies-procedures',
      'Policies_Procedures_and_Benefits': 'policies-procedures',
      'Job_Description': 'job-descriptions',
      'Job_Descriptions': 'job-descriptions',
      'Employment_Contract': 'employment-contracts',
      'Signed_Employee': 'handbooks',
      'Workers_Schedules': 'schedules',
      'Training_Records': 'training-records',
      'Employee_Records': 'employee-records'
    };

    const fetchDocuments = async () => {
      try {
        const response = await getDocuments().unwrap();
        if (response && response.success && Array.isArray(response.documents)) {
          const docsMap = {};
          const newCustomDocs = [];
          response.documents.forEach(doc => {
            let key = null;

            // 1) exact mapping from API category
            if (doc.category && categoryMap[doc.category]) {
              key = categoryMap[doc.category];
            }

            // 2) fallback: normalize category (underscores/spaces -> hyphens) and try to match existing keys
            if (!key && doc.category) {
              const normalized = doc.category.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
              if (documentFields.some(f => f.key === normalized)) key = normalized;
              else if (documentFields.some(f => f.key === normalized + 's')) key = normalized + 's';
            }

            // 3) fallback: use title similarly
            if (!key && doc.title) {
              const normalizedTitle = doc.title.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
              if (documentFields.some(f => f.key === normalizedTitle)) key = normalizedTitle;
              else if (documentFields.some(f => f.key === normalizedTitle + 's')) key = normalizedTitle + 's';
            }

              if (key) {
                // store complete document metadata for updating later
                // Save all possible id shapes returned by the API so the UI can
                // reliably detect existing documents (some endpoints return _id or id or docId)
                const resolvedId = doc._id || doc.id || doc.docId || null;
                const entry = {
                  url: doc.fileUrl,
                  mimeType: doc.mimeType,
                  title: doc.title || '',
                  id: resolvedId,
                  _id: doc._id || null,
                  docId: doc.docId || null,
                  category: doc.category,
                  filePublicId: doc.filePublicId,
                };

                if (docsMap[key]) {
                  // convert to array if needed and append
                  if (Array.isArray(docsMap[key])) {
                    docsMap[key].push(entry);
                  } else {
                    docsMap[key] = [docsMap[key], entry];
                  }
                } else {
                  docsMap[key] = entry;
                }
            } else {
              // If we couldn't map category/title to a known key, expose it as a custom document so it appears in UI
              // create a unique key and add to docsMap and newCustomDocs
              const customKey = `custom-${doc._id || Date.now()}`;
              const entry = {
                key: customKey,
                label: doc.title || customKey,
                icon: FaFile,
                url: doc.fileUrl,
                filePublicId: doc.filePublicId,
                mimeType: doc.mimeType,
                size: doc.size || 0,
                title: doc.title || '',
                category: doc.category || customKey,
                id: doc._id || doc.id || doc.docId || null,
              };
              newCustomDocs.push(entry);

              // add to docsMap as its own key
              docsMap[customKey] = entry;
            }
          });
          setUploadedDocs(docsMap);
          if (newCustomDocs.length > 0) setCustomDocuments(prev => [...prev, ...newCustomDocs]);
        } else {
          toast.error('Failed to fetch documents');
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Error loading documents');
      }
    };

    fetchDocuments();
  }, [getDocuments]);

  const [uploadDocument] = useUploadDocumentMutation();

  // When adding a custom document we want to upload the file immediately on selection
  // so we have the storage key/url available before the user clicks "Add Document".
  const handleAddDocFileSelect = async (file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('folder', 'documents');

      const uploadResponse = await uploadDocument(formData).unwrap();
      if (uploadResponse && uploadResponse.success && uploadResponse.files && uploadResponse.files[0]) {
        const fileData = uploadResponse.files[0];
        // store metadata (not the raw File) so Add Document can post the payload
        setNewDocFile({
          url: fileData.url,
          filePublicId: fileData.public_id,
          mimeType: file.type,
          size: file.size,
          name: file.name
        });
        toast.success('File uploaded and ready to add');
      } else {
        toast.error('Upload failed: ' + (uploadResponse.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Immediate upload failed:', err);
      toast.error('Upload failed: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleUpload = async (key, uploadData) => {
    if (!uploadData) return;

    // If we got a raw File object from ImageUpload
    if (uploadData instanceof File) {
      try {
        const formData = new FormData();
        formData.append('files', uploadData);
        formData.append('folder', 'documents'); // Store in documents folder

        const uploadResponse = await uploadDocument(formData).unwrap();

        if (uploadResponse.success && uploadResponse.files && uploadResponse.files[0]) {
          const fileData = uploadResponse.files[0];

          // Preserve any existing id fields when updating an existing entry.
          // Support multiple documents per category: if existing entry is an array, merge into the first element.
          setUploadedDocs(prev => {
            const prevEntry = prev[key];
            const newEntry = {
              url: fileData.url,
              filePublicId: fileData.public_id,
              mimeType: uploadData.type,
              size: uploadData.size,
              title: uploadData.name,
              category: key
            };

            // If previous is an array, update the first item while preserving ids
            if (Array.isArray(prevEntry)) {
              const updatedArr = [...prevEntry];
              updatedArr[0] = { ...updatedArr[0], ...newEntry };
              return { ...prev, [key]: updatedArr };
            }

            // If previous is an object, merge into it
            if (prevEntry && typeof prevEntry === 'object') {
              return { ...prev, [key]: { ...prevEntry, ...newEntry } };
            }

            // No previous entry: set as single object
            return { ...prev, [key]: newEntry };
          });

          toast.success('Document uploaded successfully');
        } else {
          toast.error('Upload failed: ' + (uploadResponse.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Upload failed: ' + (error.message || 'Unknown error'));
      }
      return;
    }

    // Handle legacy string URL or object case
    const entryFromUpload = typeof uploadData === 'string' ? { url: uploadData } : uploadData || { url: '' };

    setUploadedDocs(prev => {
      const prevEntry = prev[key] || {};
      const merged = { ...prevEntry, ...entryFromUpload };
      return { ...prev, [key]: merged };
    });
  };

  const handleDelete = (key) => {
    // delete whole key or if index passed (handled by wrapper below)
    setUploadedDocs(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  // Helper to normalize entries to arrays for multiple docs per category
  const getDocsForKey = (key) => {
    const entry = uploadedDocs[key];
    if (!entry) return [];
    return Array.isArray(entry) ? entry : [entry];
  };

  const [deleteDocument] = useDeleteDocumentMutation();

  // Delete a specific document entry (by index) or entire key when index === null
  const handleDeleteAt = async (key, index = null) => {
    const prevEntry = uploadedDocs[key];
    if (!prevEntry) return;

    // Helper to remove locally
    const removeLocal = (k, idx = null) => {
      setUploadedDocs(prev => {
        const entry = prev[k];
        if (!entry) return prev;
        if (idx === null) {
          const updated = { ...prev };
          delete updated[k];
          return updated;
        }
        if (Array.isArray(entry)) {
          const updatedArr = entry.filter((_, i) => i !== idx);
          return { ...prev, [k]: updatedArr };
        }
        if (idx === 0) {
          const updated = { ...prev };
          delete updated[k];
          return updated;
        }
        return prev;
      });
    };

    // If no index provided, delete all entries under this key
    if (index === null) {
      const docs = getDocsForKey(key);
      for (const d of docs) {
        const idToDelete = d && (d._id || d.id || d.docId);
        if (idToDelete) {
          try {
            await deleteDocument(idToDelete).unwrap();
          } catch (err) {
            console.error('Failed to delete document remote:', err);
            toast.error('Failed to delete some documents from server');
            // stop further remote deletes but still remove local entries
            break;
          }
        }
      }
      // remove locally
      removeLocal(key, null);
      toast.success('Document(s) removed');
      return;
    }

    // Delete a single entry at index
    const docs = getDocsForKey(key);
    const doc = docs[index];
    if (!doc) return;

    const idToDelete = doc && (doc._id || doc.id || doc.docId);
    if (idToDelete) {
      try {
        const res = await deleteDocument(idToDelete).unwrap();
        if (res && res.success) {
          // remove locally
          removeLocal(key, index);
          toast.success(res.message || 'Document deleted');
        } else {
          toast.error(res.message || 'Failed to delete document');
        }
      } catch (err) {
        console.error('Error deleting document:', err);
        const errMsg = err?.data?.message || err?.message || 'Error deleting document';
        toast.error(errMsg);
      }
    } else {
      // No server id: just remove locally
      removeLocal(key, index);
      toast.success('Document removed (local)');
    }
  };

  const getFileName = (url) => {
    if (!url) return '';
    // support passing an object { url }
    const realUrl = typeof url === 'object' && url.url ? url.url : url;
    try {
      const parts = realUrl.split('/');
      return parts[parts.length - 1];
    } catch (e) {
      return '';
    }
  };

  const handleView = (url, mimeType) => {
    if (!url) return;

    // Support object { url } or raw string
    const realUrl = typeof url === 'object' && url.url ? url.url : url;

    // Use Vite env base if provided for relative keys/paths
    const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BASE_URL) ? import.meta.env.VITE_BASE_URL : '';

    const makeAbsolute = (u) => {
      if (!u) return u;
      // already absolute
      if (/^https?:\/\//i.test(u) || /^\/\//.test(u)) return u;
      if (!base) return u;
      // ensure no double slashes
      const b = base.replace(/\/$/, '');
      if (u.startsWith('/')) return b + u;
      return b + '/' + u;
    };

    const finalUrl = makeAbsolute(realUrl);

    // Open the file directly in a new tab. The backend storage URL (prefixed by VITE_BASE_URL)
    // should serve the file with correct Content-Type so the browser can render PDFs/images inline.
    try {
      const encoded = encodeURI(finalUrl);
      window.open(encoded, '_blank');
    } catch (e) {
      // Fallback to non-encoded open
      window.open(finalUrl, '_blank');
    }
  };

  // Create user via backend API `/api/users/create` (falls back to local behaviour on error)
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      // Call backend create user endpoint. API expects { name, email, contact, designation }
      const payload = {
        name: newUser.name,
        email: newUser.email,
        contact: newUser.contactNumber || newUser.contact || '',
        designation: newUser.designation || ''
      };

      const res = await createDocumentUser(payload).unwrap();

      // Normalise created user object from possible response shapes
      const created = res?.user || res?.data?.user || res?.createdUser || res?.userCreated || res;

      // If the response indicates success, add to local users list
      if (res && (res.success === true || res.success === undefined)) {
        // Build a local user entry. Prefer server-provided fields when present.
        const userEntry = {
          _id: created && (created._id || created.id) ? (created._id || created.id) : undefined,
          id: created && (created.id || created._id) ? (created.id || created._id) : Date.now(),
          name: created?.name || newUser.name,
          email: created?.email || newUser.email,
          contact: created?.contact || payload.contact,
          designation: created?.designation || payload.designation,
          role: created?.role || 'user',
        };

        setUsers(prev => [userEntry, ...prev]);
        setNewUser({ name: '', email: '', contactNumber: '', designation: '' });
        setShowUserModal(false);
        toast.success('User added');
        return;
      }

      // If response indicates failure, show message
      const errMsg = res?.message || 'Failed to create user';
      toast.error(errMsg);
    } catch (err) {
      console.error('Create user error:', err);
      // Fallback: local-only add so UI remains usable if API fails
      const id = Date.now();
      const userEntry = { id, name: newUser.name, email: newUser.email, contact: newUser.contactNumber || '', designation: newUser.designation || '' };
      setUsers(prev => [...prev, userEntry]);
      setNewUser({ name: '', email: '', contactNumber: '', designation: '' });
      setShowUserModal(false);
      toast.warn('User added locally (server unavailable)');
    }
  };


  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({ name: user.name, email: user.email });
    // Don't close the View Users modal
    setShowUserModal(true);
  };

  const handleUpdateUser = () => {
    // Update user in the list
    setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...newUser } : u));
    setNewUser({ name: '', email: '' });
    setEditingUser(null);
    setShowUserModal(false);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleSaveDocument = async (key, index = 0, notify = true) => {
    const docs = getDocsForKey(key);
    const doc = docs[index];
    if (!doc || !doc.url) {
      if (notify) toast.error('Cannot save document: missing document data');
      return false;
    }

    try {
      // Determine any existing id shape the doc may have
      const existingId = doc.id || doc._id || doc.docId || null;

      // Check if this is a custom document (no id) - need to create it
      if (!existingId) {
        // Get the label for custom documents
        const customDoc = customDocuments.find(d => d.key === key);
        const docLabel = customDoc ? customDoc.label : key;

        const response = await createDocument({
          title: docLabel,
          category: key,
          fileName: doc.title || getFileName(doc.url),
          fileUrl: doc.url,
          fileSize: doc.size || 0,
          description: `Custom document: ${docLabel}`
        }).unwrap();

        if (response && response.success) {
          // Update the uploadedDocs with the new document ID (accept _id, id or docId)
          const newId = (response.document && (response.document._id || response.document.id || response.document.docId)) || null;
          setUploadedDocs(prev => {
            const prevEntry = prev[key];
            const idFields = {
              id: newId,
              _id: response.document && response.document._id ? response.document._id : null,
              docId: response.document && response.document.docId ? response.document.docId : null,
            };

            if (Array.isArray(prevEntry)) {
              const updated = [...prevEntry];
              updated[index] = { ...updated[index], ...idFields };
              return { ...prev, [key]: updated };
            }

            return { ...prev, [key]: { ...(prevEntry || {}), ...idFields } };
          });
          if (notify) toast.success('Document saved successfully!');
          return true;
        } else {
          if (notify) toast.error(response.message || 'Failed to save document');
          return false;
        }
      } else {
        // Existing document - update it via RTK Query mutation (centralized, uses PUT in apiSlice)
        try {
          const payload = {
            title: doc.title,
            category: doc.category,
            fileUrl: doc.url,
            filePublicId: doc.filePublicId,
            mimeType: doc.mimeType,
            docId: doc.docId,
            size: doc.size || 0
          };

          const idToUse = existingId;

          const response = await updateDocument({ id: idToUse, data: payload }).unwrap();

          // The apiSlice returns an object with at least success/document or message
          if (response && (response.success === true || response.document)) {
            // update local entry if API returned document
            const returnedDoc = response.document;
            if (returnedDoc) {
              setUploadedDocs(prev => {
                const prevEntry = prev[key];
                const updatedDoc = {
                  url: returnedDoc.fileUrl || doc.url,
                  mimeType: returnedDoc.mimeType || doc.mimeType,
                  title: returnedDoc.title || doc.title,
                  id: returnedDoc._id || returnedDoc.id || returnedDoc.docId || doc.id,
                  _id: returnedDoc._id || doc._id,
                  docId: returnedDoc.docId || doc.docId,
                  category: returnedDoc.category || doc.category,
                  filePublicId: returnedDoc.filePublicId || doc.filePublicId,
                };

                if (Array.isArray(prevEntry)) {
                  const updated = [...prevEntry];
                  updated[index] = { ...updated[index], ...updatedDoc };
                  return { ...prev, [key]: updated };
                }

                return { ...prev, [key]: { ...(prevEntry || {}), ...updatedDoc } };
              });
            }

            if (notify) toast.success('Document saved successfully!');
            return true;
          } else if (response && response.success === false) {
            if (notify) toast.error(response.message || 'Failed to save document');
            return false;
          } else {
            // Fallback success handling
            if (notify) toast.success('Document saved (response received)');
            return true;
          }
        } catch (err) {
          console.error('Error updating document via updateDocument mutation:', err);
          // Better error extraction
          const errMsg = err?.data?.message || err?.message || JSON.stringify(err);
          if (notify) toast.error(errMsg || 'Error saving document. Please try again.');
          return false;
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      if (notify) toast.error('Error saving document. Please try again.');
      return false;
    }
    return true;
  };

  // Save all documents function now triggers individual saves for every document entry
  const handleSaveDocuments = async () => {
    const promises = [];
    Object.keys(uploadedDocs).forEach(key => {
      const docs = getDocsForKey(key);
      // pass notify = false to suppress per-document toasts during bulk save
      docs.forEach((_, index) => promises.push(handleSaveDocument(key, index, false)));
    });

    setIsSaving(true);
    try {
      const results = await Promise.all(promises);
      const allOk = results.every(r => r === true);
      if (allOk) {
        toast.success('All documents saved successfully!');
      } else {
        toast.error('Some documents failed to save. Please check individual items.');
      }
    } catch (error) {
      // If a promise threw (shouldn't if handleSaveDocument returns booleans), show generic error
      toast.error('Error saving some documents. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle custom document add (file should already be uploaded via handleAddDocFileSelect)
  const handleAddCustomDocument = async () => {
    if (!newDocName.trim()) {
      toast.error('Document name is required');
      return;
    }
    if (!newDocFile || !newDocFile.url) {
      toast.error('Please upload a file before adding the document');
      return;
    }

    try {
      // Create a unique key for this custom document
      const customKey = `custom-${Date.now()}`;

      // Try single-document endpoint first
      try {
        const response = await createDocumentSingle({
          title: newDocName,
          category: customKey,
          fileName: newDocFile.name || getFileName(newDocFile.url),
          fileUrl: newDocFile.url,
          fileSize: newDocFile.size || 0,
          description: `Custom document: ${newDocName}`
        }).unwrap();

        if (response && response.success) {
          const created = response.document || null;
          const newDoc = {
            key: customKey,
            label: newDocName,
            icon: FaFile,
            url: newDocFile.url,
            filePublicId: newDocFile.filePublicId,
            mimeType: newDocFile.mimeType,
            size: newDocFile.size,
            title: newDocFile.name || getFileName(newDocFile.url),
            category: customKey,
            id: created ? (created._id || created.id || created.docId) : null,
            _id: created ? created._id : null,
            docId: created ? created.docId : null,
          };

          setCustomDocuments(prev => [...prev, newDoc]);
          setUploadedDocs(prev => ({
            ...prev,
            [customKey]: {
              url: newDoc.url,
              filePublicId: newDoc.filePublicId,
              mimeType: newDoc.mimeType,
              size: newDoc.size,
              title: newDoc.title,
              category: customKey,
              id: newDoc.id,
              _id: newDoc._id,
              docId: newDoc.docId
            }
          }));

          setNewDocName('');
          setNewDocFile(null);
          setShowAddDocModal(false);
          toast.success('Document added successfully');
          return;
        }
        // fallthrough to fallback
      } catch (err) {
        // If backend expects a multipart file and returns 400 File is required, fall back to createDocument
        const isFileRequired = err?.data?.message === 'File is required' || err?.status === 400;
        if (!isFileRequired) {
          // unknown error - rethrow to outer catch
          throw err;
        }
        // else continue to fallback below
      }

      // Fallback: persist via the generic createDocument endpoint which accepts fileUrl
      const fallback = await createDocument({
        title: newDocName,
        category: customKey,
        fileName: newDocFile.name || getFileName(newDocFile.url),
        fileUrl: newDocFile.url,
        fileSize: newDocFile.size || 0,
        description: `Custom document (fallback): ${newDocName}`
      }).unwrap();

      if (fallback && fallback.success) {
        const created = fallback.document || null;
        const newDoc = {
          key: customKey,
          label: newDocName,
          icon: FaFile,
          url: newDocFile.url,
          filePublicId: newDocFile.filePublicId,
          mimeType: newDocFile.mimeType,
          size: newDocFile.size,
          title: newDocFile.name || getFileName(newDocFile.url),
          category: customKey,
          id: created ? (created._id || created.id || created.docId) : null,
          _id: created ? created._id : null,
          docId: created ? created.docId : null,
        };

        setCustomDocuments(prev => [...prev, newDoc]);
        setUploadedDocs(prev => ({
          ...prev,
          [customKey]: {
            url: newDoc.url,
            filePublicId: newDoc.filePublicId,
            mimeType: newDoc.mimeType,
            size: newDoc.size,
            title: newDoc.title,
            category: customKey,
            id: newDoc.id,
            _id: newDoc._id,
            docId: newDoc.docId
          }
        }));

        setNewDocName('');
        setNewDocFile(null);
        setShowAddDocModal(false);
        toast.success('Document added successfully (fallback)');
      } else {
        toast.error('Failed to add document: ' + (fallback?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Add document failed:', error);
      const errMsg = error?.data?.message || error?.message || JSON.stringify(error);
      toast.error('Failed to add document: ' + errMsg);
    }
  };

  const handleDeleteCustomDocument = (key) => {
    setCustomDocuments(prev => prev.filter(doc => doc.key !== key));
    handleDelete(key);
  };

  return (
    <MotionDiv>
      <Container fluid>
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h2 style={{ color: 'var(--dark-color)' }}>Document Management</h2>
            <p className="text-muted">Upload company documents, policies, and employee records</p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="info" 
              onClick={() => {
                setNewDocName('');
                setNewDocFile(null);
                setShowAddDocModal(true);
              }}
              className="d-flex align-items-center gap-2"
            >
              <FaPlus />
              Add Document
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setEditingUser(null);
                setNewUser({ name: '', email: '' });
                setShowUserModal(true);
              }}
              className="d-flex align-items-center gap-2"
            >
              <FaUserPlus />
              Add User
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={async () => {
                setShowViewUsersModal(true);
                try {
                  const res = await getTeamUsers().unwrap();
                  if (res && res.success && Array.isArray(res.users)) {
                    setUsers(res.users);
                  } else {
                    setUsers([]);
                  }
                } catch (e) {
                  setUsers([]);
                }
              }}
              className="d-flex align-items-center gap-2"
            >
              <FaUsers />
              View Users
            </Button>
            <Button 
              variant="success" 
              onClick={handleSaveDocuments}
              className="d-flex align-items-center gap-2"
              disabled={Object.keys(uploadedDocs).length === 0 || isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  Save Documents
                </>
              )}
            </Button>
          </div>
        </div>
        <Row>
          {/* Render custom documents first */}
          {customDocuments.map(field => (
            <Col md={6} lg={4} key={field.key} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      {React.createElement(field.icon, { className: 'me-2 text-primary', size: 20 })}
                      <strong>{field.label}</strong>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => handleDeleteCustomDocument(field.key)}
                      title="Remove this document type"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {(() => {
                    const docs = getDocsForKey(field.key);
                    return (
                      <>
                        <ImageUpload
                          value={(docs[0] && docs[0].url) || ''}
                          onChange={val => handleUpload(field.key, val)}
                          label={docs[0] ? 'Edit File' : `Upload ${field.label}`}
                          buttonText={docs[0] ? 'Edit File' : 'Select File'}
                    successMessage="Document uploaded successfully"
                    helpText="Upload a single document"
                    showPreview={false}
                    acceptedTypes={[
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'application/vnd.ms-powerpoint',
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                    ]}
                    maxSize={10}
                        />

                        {docs.length > 0 && (
                          <div className="uploaded-file-info mt-3">
                            {docs.map((d, idx) => (
                              <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded mb-2" key={idx}>
                                <div className="d-flex align-items-center grow">
                                  <FaFile className="me-2 text-primary" size={24} />
                                  <span className="text-truncate" style={{ maxWidth: '200px' }}>
                                    {getFileName(d && d.url)}
                                  </span>
                                </div>
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleView(d.url, d.mimeType)}
                                    title="View Document"
                                  >
                                    <FaEye />
                                  </Button>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleSaveDocument(field.key, idx)}
                                    title="Save Document"
                                    className="me-2"
                                  >
                                    <FaSave />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteAt(field.key, idx)}
                                    title="Delete Document"
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </Card.Body>
              </Card>
            </Col>
          ))}

          {/* Render default document fields */}
          {documentFields.map(field => (
            <Col md={6} lg={4} key={field.key} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header>
                  <div className="d-flex align-items-center">
                    {React.createElement(field.icon, { className: 'me-2 text-primary', size: 20 })}
                    <strong>{field.label}</strong>
                  </div>
                </Card.Header>
                <Card.Body>
                  {(() => {
                    const docs = getDocsForKey(field.key);
                    return (
                      <>
                        <ImageUpload
                          value={(docs[0] && docs[0].url) || ''}
                          onChange={val => handleUpload(field.key, val)}
                          label={docs[0] ? 'Edit File' : `Upload ${field.label}`}
                          buttonText={docs[0] ? 'Edit File' : 'Select File'}
                    successMessage="Document uploaded successfully"
                    helpText="Upload a single document"
                    showPreview={false}
                    acceptedTypes={[
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'application/vnd.ms-powerpoint',
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                    ]}
                    maxSize={10}
                        />

                        {docs.length > 0 && (
                          <div className="uploaded-file-info mt-3">
                            {docs.map((d, idx) => (
                              <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded mb-2" key={idx}>
                                <div className="d-flex align-items-center grow">
                                  <FaFile className="me-2 text-primary" size={24} />
                                  <span className="text-truncate" style={{ maxWidth: '200px' }}>
                                    {getFileName(d && d.url)}
                                  </span>
                                </div>
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleView(d.url, d.mimeType)}
                                    title="View Document"
                                  >
                                    <FaEye />
                                  </Button>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleSaveDocument(field.key, idx)}
                                    title="Save Document"
                                    className="me-2"
                                  >
                                    <FaSave />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteAt(field.key, idx)}
                                    title="Delete Document"
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
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
            setNewDocName('');
            setNewDocFile(null);
          }} 
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaPlus className="me-2" />
              Add New Document
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Document Name <span style={{ color: 'red' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter document name"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Upload File <span style={{ color: 'red' }}>*</span>
                </Form.Label>
                <ImageUpload
                  value={newDocFile ? 'file-selected' : ''}
                  onChange={handleAddDocFileSelect}
                  label="Upload File"
                  buttonText={newDocFile ? 'Change File' : 'Select File'}
                  successMessage="File selected successfully"
                  helpText="Upload a document file"
                  showPreview={false}
                  acceptedTypes={[
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                  ]}
                  maxSize={10}
                />
                {newDocFile && (
                  <small className="text-muted d-block mt-2">
                    Selected: {newDocFile.name || getFileName(newDocFile.url)}
                  </small>
                )}
              </Form.Group>
              <Button 
                variant="primary" 
                onClick={handleAddCustomDocument}
                className="w-100"
                disabled={!newDocName.trim() || !newDocFile}
              >
                Add Document
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Add/Edit User Modal */}
        <Modal 
          show={showUserModal} 
          onHide={() => {
            setShowUserModal(false);
            setEditingUser(null);
            setNewUser({ name: '', email: '' });
          }} 
          centered 
          backdrop={editingUser ? false : true}
          style={{ zIndex: editingUser ? 1060 : 1050 }}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUserPlus className="me-2" />
              {editingUser ? 'Edit User' : 'Add New User'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Name <span style={{ color: 'red' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Email <span style={{ color: 'red' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Contact Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter contact number (optional)"
                  value={newUser.contactNumber}
                  onChange={(e) => setNewUser({ ...newUser, contactNumber: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter designation (optional)"
                  value={newUser.designation}
                  onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                />
              </Form.Group>
              <Button 
                variant="primary" 
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
                className="w-100"
                disabled={!newUser.name || !newUser.email}
              >
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* View Users Modal */}
        <Modal 
          show={showViewUsersModal} 
          onHide={() => {
            setShowViewUsersModal(false);
            setShowUserModal(false);
            setEditingUser(null);
            setNewUser({ name: '', email: '' });
          }} 
          size="lg" 
          centered
          backdrop={true}
          enforceFocus={false}
        >
          <div style={{ 
            opacity: showUserModal && editingUser ? 0.5 : 1,
            transition: 'opacity 0.3s ease'
          }}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUsers className="me-2" />
              All Users
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isUsersLoading ? (
              <Alert variant="info">Loading users...</Alert>
            ) : users.length === 0 ? (
              <Alert variant="info">No users found.</Alert>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user._id || index}>
                      <td>{index + 1}</td>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.isActive ? 'Yes' : 'No'}</td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}</td>
                      <td>{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : ''}</td>
                      <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>
          </div>
        </Modal>
      </Container>
    </MotionDiv>
  );
};

export default Documents;