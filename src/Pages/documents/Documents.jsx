import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Table, Spinner } from 'react-bootstrap';
import MotionDiv from '../../Components/MotionDiv';
import {
  useGetDocumentsMutation,
  useCreateDocumentMutation,
  useCreateDocumentSingleMutation,
  useUpdateDocumentMutation,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useGetTeamUsersMutation,
  useCreateDocumentUserMutation,
  useDeleteUserMutation
} from '../../features/apiSlice';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/authSlice';
import { FaFile, FaPlus, FaUserPlus, FaUsers, FaSave, FaEye, FaTrash } from 'react-icons/fa';
import ImageUpload from '../../Components/ImageUpload';
import { toast } from 'react-toastify';

const documentFields = [
  { key: 'policies-procedures', label: 'Policies/Procedures and Benefits', icon: FaFile },
  { key: 'employee-records', label: 'Employee Records', icon: FaFile },
  { key: 'schedules', label: 'Workers Schedules', icon: FaFile },
  { key: 'performance-reviews', label: 'Performance Review', icon: FaFile },
  { key: 'handbooks', label: 'Signed Employee Handbook/Acknowledgement', icon: FaFile },
  { key: 'job-descriptions', label: 'Job Descriptions', icon: FaFile },
  { key: 'disciplinary-actions', label: 'Disciplinary Actions Report', icon: FaFile },
  { key: 'attendance-records', label: 'Attendance Records', icon: FaFile },
  { key: 'training-records', label: 'Training Records', icon: FaFile },
  { key: 'direct-deposit', label: 'Direct Deposit Form', icon: FaFile },
  { key: 'form-i9', label: 'Form I-9 (US Employment Eligibility)', icon: FaFile },
  { key: 'w4-forms', label: 'W-4 Forms (Federal Tax Withholding)', icon: FaFile },
  { key: 'employment-contracts', label: 'Employment Contract/Agreement', icon: FaFile }
];

const Documents = () => {
    const [uploadedDocs, setUploadedDocs] = useState({}); // { key: { url, filePublicId, mimeType, size, title, id, _id, docId } }
    const [customDocuments, setCustomDocuments] = useState([]);

    const [showAddDocModal, setShowAddDocModal] = useState(false);
    const [newDocName, setNewDocName] = useState('');
    const [newDocFile, setNewDocFile] = useState(null);

    const [showUserModal, setShowUserModal] = useState(false);
    const [showViewUsersModal, setShowViewUsersModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', contactNumber: '', designation: '' });
    const [users, setUsers] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

    const [getDocuments] = useGetDocumentsMutation();
    const [createDocument] = useCreateDocumentMutation();
    const [createDocumentSingle] = useCreateDocumentSingleMutation();
    const [updateDocument] = useUpdateDocumentMutation();
    const [uploadDocument] = useUploadDocumentMutation();
    const [deleteDocument] = useDeleteDocumentMutation();
    const [getTeamUsers, { isLoading: isUsersLoading }] = useGetTeamUsersMutation();
    const [createDocumentUser] = useCreateDocumentUserMutation();
    const [deleteUser] = useDeleteUserMutation();

    const handleDeleteUser = async (userId) => {
      if (!userId) return;
      const ok = window.confirm('Delete this user? This action cannot be undone.');
      if (!ok) return;
      try {
        const res = await deleteUser(userId).unwrap();
        // Remove from local list on success
        setUsers(prev => prev.filter(u => String(u._id || u.id || u.userId || '') !== String(userId)));
        toast.success(res?.message || 'User deleted');
      } catch (err) {
        console.error('Delete user error', err);
        // Fallback: remove locally so UI stays consistent
        setUsers(prev => prev.filter(u => String(u._id || u.id || u.userId || '') !== String(userId)));
        const msg = err?.data?.message || err?.message || 'Error deleting user; removed locally';
        toast.error(msg);
      }
    };

    useEffect(() => {
      const categoryMap = {
        'Direct_Deposit': 'direct-deposit',
        'Direct Deposit': 'direct-deposit',
        'Disciplinary_Actions_Report': 'disciplinary-actions',
        'Attendance_Records': 'attendance-records',
        'Performance_Review': 'performance-reviews',
        'Form_I-9': 'form-i9',
        'W-4_Forms': 'w4-forms'
      };

      const fetchDocuments = async () => {
        try {
          const res = await getDocuments().unwrap();
          if (res && res.success && Array.isArray(res.documents)) {
            const docsMap = {};
            const newCustom = [];
            res.documents.forEach(doc => {
              let key = null;
              if (doc.category && categoryMap[doc.category]) key = categoryMap[doc.category];
              if (!key && doc.category) {
                const normalized = doc.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                if (documentFields.some(f => f.key === normalized)) key = normalized;
              }
              if (!key && doc.title) {
                const normalized = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                if (documentFields.some(f => f.key === normalized)) key = normalized;
              }

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
                size: doc.size || 0
              };

              if (key) {
                const existing = docsMap[key];
                const sameAs = (e) => e && (e.url === entry.url || e.filePublicId === entry.filePublicId || (e.id && entry.id && String(e.id) === String(entry.id)));
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
                const customKey = doc.category || `custom-${doc._id || Date.now()}`;
                const c = { key: customKey, label: doc.title || customKey, icon: FaFile, ...entry };
                // Add to docsMap under the custom key. We'll derive `customDocuments` from docsMap after processing all docs
                docsMap[customKey] = c;
              }
            });

            // Derive custom documents from docsMap keys (ensure no custom backend docs are missed)
            const derivedCustom = Object.keys(docsMap)
              .filter(k => k && k.startsWith('custom-'))
              .map(k => {
                const e = docsMap[k];
                return { key: k, label: e.title || e.label || k, icon: FaFile, ...e };
              });

            // Debug: log fetched documents and mapping to help trace missing items
            try {
              // eslint-disable-next-line no-console
              console.debug('fetchDocuments: fetched', res.documents.length, 'docs, derivedCustom:', derivedCustom.map(nc => nc.key));
              // eslint-disable-next-line no-console
              console.debug('fetchDocuments: docsMap keys', Object.keys(docsMap));
            } catch (e) {}

            setUploadedDocs(docsMap);
            // Replace custom documents list with the freshly derived list to avoid duplicates or omissions
            setCustomDocuments(derivedCustom);
          }
        } catch (err) {
          console.error('Error fetching documents:', err);
        }
      };

      fetchDocuments();
    }, [getDocuments]);

    const getDocsForKey = (key) => { const entry = uploadedDocs[key]; if (!entry) return []; return Array.isArray(entry) ? entry : [entry]; };

    const getFileName = (url) => { if (!url) return ''; const realUrl = typeof url === 'object' && url.url ? url.url : url; try { const parts = realUrl.split('/'); return parts[parts.length - 1]; } catch { return ''; } };

    const handleAddDocFileSelect = async (file) => {
      if (!file) return;
      try {
        const fd = new FormData(); fd.append('files', file); fd.append('folder', 'documents');
        const res = await uploadDocument(fd).unwrap();
        if (res && res.success && res.files && res.files[0]) {
          const f = res.files[0];
          setNewDocFile({ url: f.url, filePublicId: f.public_id, mimeType: file.type, size: file.size, name: file.name });
          toast.success('File uploaded and ready');
        } else toast.error('Upload failed');
      } catch (err) {
        console.error('Upload failed:', err);
        toast.error('Upload failed');
      }
    };

    const handleUpload = async (key, uploadData) => {
      if (!uploadData) return;
      // If a File object, upload immediately
      if (uploadData instanceof File) {
        try {
          const fd = new FormData(); fd.append('files', uploadData); fd.append('folder', 'documents');
          const res = await uploadDocument(fd).unwrap();
          if (res && res.success && res.files && res.files[0]) {
            const f = res.files[0];
            setUploadedDocs(prev => {
              const prevEntry = prev[key];
              const newEntry = { url: f.url, filePublicId: f.public_id, mimeType: uploadData.type, size: uploadData.size, title: uploadData.name, category: key };
              if (Array.isArray(prevEntry)) { const updated = [...prevEntry]; updated[0] = { ...updated[0], ...newEntry }; return { ...prev, [key]: updated }; }
              if (prevEntry && typeof prevEntry === 'object') return { ...prev, [key]: { ...prevEntry, ...newEntry } };
              return { ...prev, [key]: newEntry };
            });
            toast.success('Document uploaded');
          }
        } catch (err) { console.error('Upload error:', err); toast.error('Upload failed'); }
        return;
      }

      // If uploadData is URL/metadata, merge it preserving id fields
      const entryFromUpload = typeof uploadData === 'string' ? { url: uploadData } : uploadData || { url: '' };
      setUploadedDocs(prev => {
        const prevEntry = prev[key] || {};
        const merged = { ...prevEntry, ...entryFromUpload };
        // preserve id/_id/docId from prevEntry if present
        if (prevEntry.id || prevEntry._id || prevEntry.docId) merged.id = prevEntry.id || prevEntry._id || prevEntry.docId;
        return { ...prev, [key]: merged };
      });
    };

    const handleSaveDocument = async (key, index = 0, showToast = true) => {
      const docs = getDocsForKey(key); const doc = docs[index];
      if (!doc || !doc.url) { if (showToast) toast.error('Missing document data'); return { success: false, key, label: key }; }

      try {
        // If has id -> update (PUT)
        const existingId = doc.id || doc._id || doc.docId;
        const payload = { title: doc.title || key, category: doc.category || key, fileUrl: doc.url, filePublicId: doc.filePublicId, mimeType: doc.mimeType, size: doc.size || 0 };

        if (!existingId) {
          // Try single endpoint (multipart-friendly) first, fallback to generic create
          try {
            const res = await createDocumentSingle({ title: payload.title, category: payload.category, fileName: doc.title || getFileName(doc.url), fileUrl: payload.fileUrl, fileSize: payload.size }).unwrap();
            if (res && res.success) {
              // Save returned id into local state so subsequent saves don't create duplicates
              const created = res.document || res;
              const createdId = created._id || created.id || null;
              if (createdId) {
                setUploadedDocs(prev => {
                  const prevEntry = prev[key];
                  if (Array.isArray(prevEntry)) {
                    const updated = [...prevEntry];
                    updated[index] = { ...updated[index], id: createdId, _id: createdId };
                    return { ...prev, [key]: updated };
                  }
                  const merged = { ...prevEntry, id: createdId, _id: createdId };
                  return { ...prev, [key]: merged };
                });
              }
              if (showToast) toast.success('Document created');
              return { success: true, key, label: payload.title };
            }
          } catch (err) {
            const isFileRequired = err?.data?.message === 'File is required' || err?.status === 400;
            if (!isFileRequired) throw err;
          }

          const fallback = await createDocument(payload).unwrap();
          if (fallback && fallback.success) {
            const created = fallback.document || fallback;
            const createdId = created._id || created.id || null;
            if (createdId) {
              setUploadedDocs(prev => {
                const prevEntry = prev[key];
                if (Array.isArray(prevEntry)) {
                  const updated = [...prevEntry];
                  updated[index] = { ...updated[index], id: createdId, _id: createdId };
                  return { ...prev, [key]: updated };
                }
                const merged = { ...prevEntry, id: createdId, _id: createdId };
                return { ...prev, [key]: merged };
              });
            }
            if (showToast) toast.success('Document created');
            return { success: true, key, label: payload.title };
          }
          if (showToast) toast.error(fallback?.message || 'Failed to create document');
          return { success: false, key, label: payload.title };
        }

        const res = await updateDocument({ id: existingId, data: payload }).unwrap();
        if (res && (res.success === true || res.document)) {
          // ensure local state has the id
          const returned = res.document || res;
          const returnedId = returned._id || returned.id || existingId;
          if (returnedId) {
            setUploadedDocs(prev => {
              const prevEntry = prev[key];
              if (Array.isArray(prevEntry)) {
                const updated = [...prevEntry];
                updated[index] = { ...updated[index], id: returnedId, _id: returnedId };
                return { ...prev, [key]: updated };
              }
              const merged = { ...prevEntry, id: returnedId, _id: returnedId };
              return { ...prev, [key]: merged };
            });
          }
          if (showToast) toast.success('Document updated');
          return { success: true, key, label: payload.title };
        }
        if (showToast) toast.error(res?.message || 'Failed to update');
        return { success: false, key, label: payload.title };
      } catch (err) {
        console.error('Save document error:', err);
        if (showToast) toast.error(err?.data?.message || err?.message || 'Error saving document');
        return { success: false, key, label: doc.title || key };
      }
    };

    const handleSaveDocuments = async () => {
      const keys = Object.keys(uploadedDocs);
      if (keys.length === 0) { toast.info('No documents to save'); return; }
      setIsSaving(true);
      try {
        const results = await Promise.all(keys.map(k => handleSaveDocument(k, 0, false)));
        const failed = results.filter(r => !r.success);
        const succeeded = results.filter(r => r.success);
        if (failed.length === 0) toast.success('All documents saved successfully!');
        else if (succeeded.length === 0) toast.error('Failed to save documents');
        else toast.warning(`${succeeded.length} saved, ${failed.length} failed: ${failed.map(f => f.label).join(', ')}`);
      } finally { setIsSaving(false); }
    };

    const handleDeleteAt = async (key, index = null) => {
      const prevEntry = uploadedDocs[key]; if (!prevEntry) return;
      const removeLocal = (k, idx = null) => setUploadedDocs(prev => { const next = { ...prev }; if (idx === null) { delete next[k]; return next; } const entry = prev[k]; if (Array.isArray(entry)) { const updated = entry.filter((_, i) => i !== idx); next[k] = updated; return next; } delete next[k]; return next; });

      if (index === null) {
        const docs = getDocsForKey(key);
        for (const d of docs) {
          const idToDelete = d && (d._id || d.id || d.docId);
          if (idToDelete) try { await deleteDocument(idToDelete).unwrap(); } catch (err) { console.error('Delete remote failed', err); }
        }
        removeLocal(key, null); toast.success('Document(s) removed'); return;
      }

      const docs = getDocsForKey(key); const doc = docs[index]; if (!doc) return;
      const idToDelete = doc && (doc._id || doc.id || doc.docId);
      if (idToDelete) {
        try {
          const res = await deleteDocument(idToDelete).unwrap();
          if (res && res.success) { removeLocal(key, index); toast.success(res.message || 'Deleted'); }
          else toast.error(res?.message || 'Failed to delete');
        } catch (err) { console.error('Delete error', err); toast.error('Error deleting document'); }
      } else { removeLocal(key, index); toast.success('Removed locally'); }
    };

    const handleView = (url) => {
      if (!url) return; const realUrl = typeof url === 'object' && url.url ? url.url : url;
      const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BASE_URL) ? import.meta.env.VITE_BASE_URL : '';
      const makeAbsolute = (u) => { if (!u) return u; if (/^https?:\/\//i.test(u) || /^\/\//.test(u)) return u; if (!base) return u; const b = base.replace(/\/$/, ''); if (u.startsWith('/')) return b + u; return b + '/' + u; };
      const finalUrl = makeAbsolute(realUrl);
      try { window.open(encodeURI(finalUrl), '_blank'); } catch { window.open(finalUrl, '_blank'); }
    };

    const handleCreateUser = async () => {
      if (!newUser.name || !newUser.email) { toast.error('Name and email required'); return; }
      setCreatingUser(true);
      try {
        const payload = { name: newUser.name, email: newUser.email, contact: newUser.contactNumber || '', designation: newUser.designation || '' };
        const res = await createDocumentUser(payload).unwrap();
        if (res && (res.success === true || res.user)) {
          const created = res.user || res;
          setUsers(prev => [{ _id: created._id || created.id, name: created.name || payload.name, email: created.email || payload.email, contact: created.contact || payload.contact, designation: created.designation || payload.designation }, ...prev]);
          setNewUser({ name: '', email: '', contactNumber: '', designation: '' });
          setShowUserModal(false);
          toast.success('User added');
        } else {
          toast.error(res?.message || 'Failed to create user');
        }
      } catch (err) {
        console.error('Create user error', err);
        // Fallback: add locally (kept existing behavior)
        setUsers(prev => [{ id: Date.now(), name: newUser.name, email: newUser.email, contact: newUser.contactNumber || '', designation: newUser.designation || '' }, ...prev]);
        setNewUser({ name: '', email: '', contactNumber: '', designation: '' });
        setShowUserModal(false);
        toast.warn('Invalid Email address, Try again');
      } finally {
        setCreatingUser(false);
      }
    };

    const handleAddCustomDocument = async () => {
      if (!newDocName.trim()) { toast.error('Document name required'); return; }
      if (!newDocFile || !newDocFile.url) { toast.error('Please upload a file first'); return; }
      const customKey = `custom-${Date.now()}`;
      try {
        // Try single endpoint then fallback
        try {
          const res = await createDocumentSingle({ title: newDocName, category: customKey, fileName: newDocFile.name || getFileName(newDocFile.url), fileUrl: newDocFile.url, fileSize: newDocFile.size || 0 }).unwrap();
          if (res && res.success) {
            const created = res.document || res;
            const entry = { key: customKey, label: newDocName, url: newDocFile.url, filePublicId: newDocFile.filePublicId, mimeType: newDocFile.mimeType, size: newDocFile.size, title: newDocFile.name || getFileName(newDocFile.url), category: customKey, id: created._id || created.id || null };
            setCustomDocuments(prev => [...prev, entry]);
            setUploadedDocs(prev => ({ ...prev, [customKey]: entry }));
            setNewDocName(''); setNewDocFile(null); setShowAddDocModal(false); toast.success('Document added'); return;
          }
        } catch (err) {
          const isFileRequired = err?.data?.message === 'File is required' || err?.status === 400;
          if (!isFileRequired) throw err;
        }

        const fallback = await createDocument({ title: newDocName, category: customKey, fileName: newDocFile.name || getFileName(newDocFile.url), fileUrl: newDocFile.url, fileSize: newDocFile.size || 0 }).unwrap();
        if (fallback && fallback.success) {
          const created = fallback.document || fallback;
          const entry = { key: customKey, label: newDocName, url: newDocFile.url, filePublicId: newDocFile.filePublicId, mimeType: newDocFile.mimeType, size: newDocFile.size, title: newDocFile.name || getFileName(newDocFile.url), category: customKey, id: created._id || created.id || null };
          setCustomDocuments(prev => [...prev, entry]);
          setUploadedDocs(prev => ({ ...prev, [customKey]: entry }));
          setNewDocName(''); setNewDocFile(null); setShowAddDocModal(false); toast.success('Document added'); return;
        }
        toast.error('Failed to add document');
      } catch (err) { console.error('Add custom doc failed', err); toast.error('Failed to add document'); }
    };

    return (
      <MotionDiv>
        <Container fluid>
          <div className="mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h2>Document Management</h2>
              <p className="text-muted">Upload company documents, policies, and employee records</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="info" onClick={() => { setNewDocName(''); setNewDocFile(null); setShowAddDocModal(true); }}><FaPlus /> Add Document</Button>
              <Button variant="primary" onClick={() => { setNewUser({ name: '', email: '' }); setShowUserModal(true); }}><FaUserPlus /> Add User</Button>
              <Button variant="outline-primary" onClick={async () => { setShowViewUsersModal(true); try { const res = await getTeamUsers().unwrap(); if (res && res.success && Array.isArray(res.users)) setUsers(res.users); } catch (e) { setUsers([]); } }}><FaUsers /> View Users</Button>
              <Button variant="success" onClick={handleSaveDocuments} disabled={Object.keys(uploadedDocs).length === 0 || isSaving}>{isSaving ? (<><Spinner as="span" animation="border" size="sm" /> Saving...</>) : (<><FaSave /> Save Documents</>)}</Button>
            </div>
          </div>

          

          <Row>
            {customDocuments.map(field => (
              <Col xs={12} md={6} lg={4} key={field.key} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <strong>{field.label}</strong>
                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => { setCustomDocuments(prev => prev.filter(d => d.key !== field.key)); setUploadedDocs(prev => { const copy = { ...prev }; delete copy[field.key]; return copy; }); }}><FaTrash /></Button>
                  </Card.Header>
                  <Card.Body>
                    <ImageUpload value={(getDocsForKey(field.key)[0] && getDocsForKey(field.key)[0].url) || ''} onChange={val => handleUpload(field.key, val)} label={`Upload ${field.label}`} buttonText="Select File" showPreview={false} maxSize={10} />
                    {getDocsForKey(field.key).length > 0 && (
                      <div className="uploaded-file-info mt-3">
                        {getDocsForKey(field.key).map((d, idx) => (
                          <div key={idx} className="d-flex align-items-center justify-content-between p-3 bg-light rounded mb-2" style={{ minHeight: 56 }}>
                            <div className="d-flex align-items-center"><FaFile className="me-2 text-primary" size={20} /><span className="text-truncate" style={{ maxWidth: '200px', lineHeight: '1.2' }}>{getFileName(d && d.url)}</span></div>
                            <div className="d-flex gap-2 align-items-center">
                              <Button variant="outline-primary" size="sm" onClick={() => handleView(d.url)}><FaEye /></Button>
                              <Button variant="outline-success" size="sm" onClick={() => handleSaveDocument(field.key, idx)}><FaSave /></Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAt(field.key, idx)}><FaTrash /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}

            {documentFields.map(field => (
              <Col xs={12} md={6} lg={4} key={field.key} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header><strong>{field.label}</strong></Card.Header>
                  <Card.Body>
                    <ImageUpload value={(getDocsForKey(field.key)[0] && getDocsForKey(field.key)[0].url) || ''} onChange={val => handleUpload(field.key, val)} label={`Upload ${field.label}`} buttonText="Select File" showPreview={false} maxSize={10} />
                    {getDocsForKey(field.key).length > 0 && (
                      <div className="uploaded-file-info mt-3">
                        {getDocsForKey(field.key).map((d, idx) => (
                          <div key={idx} className="d-flex align-items-center justify-content-between p-3 bg-light rounded mb-2" style={{ minHeight: 36 }}>
                            <div className="d-flex align-items-center"><FaFile className="me-2 text-primary" size={20} /><span className="text-truncate" style={{ maxWidth: '100px', lineHeight: '1.2' }}>{getFileName(d && d.url)}</span></div>
                            <div className="d-flex gap-2 align-items-center">
                              <Button variant="outline-primary" size="sm" onClick={() => handleView(d.url)}><FaEye /></Button>
                              <Button variant="outline-success" size="sm" onClick={() => handleSaveDocument(field.key, idx)}><FaSave /></Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAt(field.key, idx)}><FaTrash /></Button>
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
          <Modal show={showAddDocModal} onHide={() => { setShowAddDocModal(false); setNewDocName(''); setNewDocFile(null); }} centered>
            <Modal.Header closeButton><Modal.Title><FaPlus className="me-2" /> Add New Document</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Document Name <span style={{ color: 'red' }}>*</span></Form.Label>
                  <Form.Control type="text" value={newDocName} onChange={e => setNewDocName(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                  
                  <ImageUpload value={newDocFile ? 'file-selected' : ''} onChange={handleAddDocFileSelect} label="Upload File" buttonText={newDocFile ? 'Change File' : 'Select File'} showPreview={false} maxSize={10} />
                  {newDocFile && (<small className="text-muted d-block mt-2">Selected: {newDocFile.name || getFileName(newDocFile.url)}</small>)}
                </Form.Group>
                <Button variant="primary" onClick={handleAddCustomDocument} className="w-100" disabled={!newDocName.trim() || !newDocFile}>Add Document</Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Add/Edit User Modal */}
          <Modal show={showUserModal} onHide={() => { setShowUserModal(false); setNewUser({ name: '', email: '', contactNumber: '', designation: '' }); }} centered>
            <Modal.Header closeButton><Modal.Title><FaUserPlus className="me-2" /> Add New User</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Name <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Email <span style={{ color: 'red' }}>*</span>
                    </Form.Label>
                    <Form.Control value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Contact <span className="text-muted">(optional)</span>
                    </Form.Label>
                    <Form.Control value={newUser.contactNumber} onChange={e => setNewUser({ ...newUser, contactNumber: e.target.value })} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Designation <span className="text-muted">(optional)</span>
                    </Form.Label>
                    <Form.Control value={newUser.designation} onChange={e => setNewUser({ ...newUser, designation: e.target.value })} />
                  </Form.Group>
                 <Button variant="primary" onClick={handleCreateUser} disabled={!newUser.name || !newUser.email || creatingUser} className="w-100">
                  {creatingUser ? (<><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> Creating...</>) : 'Create User'}
                 </Button>  
              </Form>
            </Modal.Body>
          </Modal>

          {/* View Users Modal */}
          <Modal show={showViewUsersModal} onHide={() => setShowViewUsersModal(false)} size="lg" centered>
            <Modal.Header closeButton><Modal.Title><FaUsers className="me-2" /> All Users</Modal.Title></Modal.Header>
            <Modal.Body>
              {isUsersLoading ? <Alert variant="info">Loading users...</Alert> : users.length === 0 ? <Alert variant="info">No users found.</Alert> : (
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
                          <td>{i+1}</td>
                          <td>{u.name || `${u.firstName || ''} ${u.lastName || ''}`}</td>
                          <td>{u.email}</td>
                          <td>{u.role || '-'}</td>
                          <td>{u.isActive ? 'Yes' : 'No'}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(u._id || u.id || u.userId)}><FaTrash /></Button>
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