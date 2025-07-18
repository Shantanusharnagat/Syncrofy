import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import './Editor.css';

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  [{ align: [] }],
  ['clean'],
];

export default function Editor({ token, documentId }) {
  const wrapperRef = useRef();
  const [quill, setQuill] = useState();
  const socketRef = useRef();
  console.log(token);

  // Setup Quill editor
  useEffect(() => {
    if (!wrapperRef.current) return;
    const editor = document.createElement('div');
    wrapperRef.current.innerHTML = '';
    wrapperRef.current.append(editor);

    const q = new Quill(editor, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS }
    });

    q.disable();
    q.setText('Loading...');
    setQuill(q);
  }, []);

  // Initialize Socket.IO and join document room
  useEffect(() => {
    if (!quill || !token || !documentId) return;

    socketRef.current = io('https://syncrofy-backend.onrender.com', {
      auth: { token }
    });

    socketRef.current.emit('join-document', documentId);

    socketRef.current.once('load-document', (document) => {
      quill.setContents(document);
      quill.enable();
    });

    // CLEANUP on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [quill, token, documentId]);

  // Send changes to server
  useEffect(() => {
    if (!quill || !socketRef.current) return;

    const handler = (delta, _, source) => {
      if (source !== 'user') return;
      socketRef.current.emit('send-changes', {
        documentId,
        delta,
      });
    };

    quill.on('text-change', handler);
    return () => quill.off('text-change', handler);
  }, [quill, documentId]);

  // Receive changes from server
  useEffect(() => {
    if (!quill || !socketRef.current) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socketRef.current.on('receive-changes', handler);
    return () => socketRef.current.off('receive-changes', handler);
  }, [quill]);

  // Auto-save every 2 seconds
  useEffect(() => {
    if (!quill || !socketRef.current) return;
    const interval = setInterval(() => {
      socketRef.current.emit('save-document', quill.getContents());
    }, 2000);
    return () => clearInterval(interval);
  }, [quill]);

  return <div ref={wrapperRef} style={{ height: '100%', padding: '1rem' }}></div>;
}
