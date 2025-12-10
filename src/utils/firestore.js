import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ============ GLOBAL TASKS ============
export const createGlobalTask = async (taskData) => {
  try {
    const docRef = await addDoc(collection(db, 'globalTasks'), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating global task:', error);
    return { success: false, error: error.message };
  }
};

export const getAllGlobalTasks = async () => {
  try {
    const q = query(collection(db, 'globalTasks'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching global tasks:', error);
    return [];
  }
};

export const updateGlobalTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, 'globalTasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating global task:', error);
    return { success: false, error: error.message };
  }
};

export const deleteGlobalTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'globalTasks', taskId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting global task:', error);
    return { success: false, error: error.message };
  }
};

// ============ STUDENT PROGRESS ============
export const getStudentProgress = async (userId) => {
  try {
    const q = query(
      collection(db, 'studentProgress'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return [];
  }
};

export const updateStudentProgress = async (userId, taskId, status, notes = '') => {
  try {
    // Check if progress already exists
    const q = query(
      collection(db, 'studentProgress'),
      where('userId', '==', userId),
      where('taskId', '==', taskId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Create new progress
      await addDoc(collection(db, 'studentProgress'), {
        userId,
        taskId,
        status,
        notes,
        completedAt: status === 'done' ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Update existing progress
      const progressDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'studentProgress', progressDoc.id), {
        status,
        notes,
        completedAt: status === 'done' ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error updating student progress:', error);
    return { success: false, error: error.message };
  }
};

export const deleteStudentProgress = async (userId) => {
  try {
    const q = query(
      collection(db, 'studentProgress'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    // Delete all progress records for this user
    const deletePromises = querySnapshot.docs.map(docSnap =>
      deleteDoc(doc(db, 'studentProgress', docSnap.id))
    );

    await Promise.all(deletePromises);
    return { success: true, deletedCount: querySnapshot.docs.length };
  } catch (error) {
    console.error('Error deleting student progress:', error);
    return { success: false, error: error.message };
  }
};

export const deleteUserTaskCreationRequests = async (userId) => {
  try {
    const q = query(
      collection(db, 'taskCreationRequests'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    // Delete all task creation requests for this user
    const deletePromises = querySnapshot.docs.map(docSnap =>
      deleteDoc(doc(db, 'taskCreationRequests', docSnap.id))
    );

    await Promise.all(deletePromises);
    return { success: true, deletedCount: querySnapshot.docs.length };
  } catch (error) {
    console.error('Error deleting task creation requests:', error);
    return { success: false, error: error.message };
  }
};

export const deleteUserDocument = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting user document:', error);
    return { success: false, error: error.message };
  }
};

export const getAllUserIdsWithData = async () => {
  try {
    const userDetailsMap = new Map();

    // Get all users from users collection first to get their details
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      userDetailsMap.set(doc.id, {
        userId: doc.id,
        name: data.displayName || data.email || 'Unknown User',
        email: data.email || 'No email',
        batch: data.batch || 'Unknown',
        progressCount: 0,
        requestsCount: 0,
      });
    });

    // Get user IDs from studentProgress and count records
    const progressSnapshot = await getDocs(collection(db, 'studentProgress'));
    progressSnapshot.docs.forEach(doc => {
      const userId = doc.data().userId;
      if (userId) {
        if (userDetailsMap.has(userId)) {
          userDetailsMap.get(userId).progressCount++;
        } else {
          // User not in users collection (deleted from auth)
          if (!userDetailsMap.has(userId)) {
            userDetailsMap.set(userId, {
              userId: userId,
              name: 'Deleted User',
              email: 'N/A',
              batch: 'Unknown',
              progressCount: 1,
              requestsCount: 0,
            });
          }
        }
      }
    });

    // Get user IDs from taskCreationRequests and count records
    const requestsSnapshot = await getDocs(collection(db, 'taskCreationRequests'));
    requestsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const userId = data.userId;
      if (userId) {
        if (userDetailsMap.has(userId)) {
          userDetailsMap.get(userId).requestsCount++;
        } else {
          // User not in users collection (deleted from auth)
          userDetailsMap.set(userId, {
            userId: userId,
            name: data.userName || 'Deleted User',
            email: data.userEmail || 'N/A',
            batch: data.batch || 'Unknown',
            progressCount: 0,
            requestsCount: 1,
          });
        }
      }
    });

    return Array.from(userDetailsMap.values());
  } catch (error) {
    console.error('Error fetching user IDs:', error);
    return [];
  }
};

// ============ ANNOUNCEMENTS ============
export const createAnnouncement = async (announcementData) => {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), {
      ...announcementData,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating announcement:', error);
    return { success: false, error: error.message };
  }
};

export const getActiveAnnouncements = async () => {
  try {
    const q = query(
      collection(db, 'announcements'),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const announcements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by createdAt in JavaScript to avoid needing a composite index
    return announcements.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime; // Descending order (newest first)
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

export const updateAnnouncement = async (announcementId, updates) => {
  try {
    await updateDoc(doc(db, 'announcements', announcementId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating announcement:', error);
    return { success: false, error: error.message };
  }
};

export const deactivateAnnouncement = async (announcementId) => {
  try {
    // Permanently delete the announcement from Firestore
    await deleteDoc(doc(db, 'announcements', announcementId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return { success: false, error: error.message };
  }
};

// ============ CLASS SETTINGS ============
export const getClassSettings = async () => {
  try {
    const docRef = doc(db, 'classSettings', 'config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching class settings:', error);
    return null;
  }
};

export const updateClassSettings = async (settings) => {
  try {
    await updateDoc(doc(db, 'classSettings', 'config'), {
      ...settings,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating class settings:', error);
    return { success: false, error: error.message };
  }
};

// ============ USER MANAGEMENT ============
export const createUserDocument = async (userId, userData) => {
  try {
    // Use setDoc with userId as document ID for easier querying
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      ...userData,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user document:', error);
    return { success: false, error: error.message };
  }
};

export const getUserData = async (userId) => {
  try {
    // Direct document access since we're using userId as document ID
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const updateUserLastLogin = async (userId) => {
  try {
    // Direct document access
    await updateDoc(doc(db, 'users', userId), {
      lastLogin: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

export const getAllStudentProgress = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'studentProgress'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all student progress:', error);
    return [];
  }
};

// ============ TASK CREATION REQUESTS (for 1A2 students to request new tasks) ============
export const createTaskCreationRequest = async (requestData) => {
  try {
    const docRef = await addDoc(collection(db, 'taskCreationRequests'), {
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating task creation request:', error);
    return { success: false, error: error.message };
  }
};

export const getTaskCreationRequests = async (filters = {}) => {
  try {
    let q = query(collection(db, 'taskCreationRequests'), orderBy('createdAt', 'desc'));

    if (filters.userId) {
      q = query(collection(db, 'taskCreationRequests'), where('userId', '==', filters.userId), orderBy('createdAt', 'desc'));
    }

    if (filters.status) {
      q = query(collection(db, 'taskCreationRequests'), where('status', '==', filters.status), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching task creation requests:', error);
    return [];
  }
};

export const approveTaskCreationRequest = async (requestId, requestData) => {
  try {
    // Create the global task from the request
    const taskData = {
      title: requestData.title,
      description: requestData.description,
      subject: requestData.subject,
      dueDate: requestData.dueDate,
      priority: requestData.priority || 'medium',
      column: 'todo',
      batch: requestData.batch, // Should be 1A2
      order: Date.now(),
    };

    // Add attachments if present
    if (requestData.attachments && requestData.attachments.length > 0) {
      taskData.attachments = requestData.attachments;
    }

    const taskResult = await createGlobalTask(taskData);

    if (taskResult.success) {
      // Delete the request after successful task creation to clean up Firestore
      await deleteDoc(doc(db, 'taskCreationRequests', requestId));
      return { success: true, taskId: taskResult.id };
    }
    return { success: false, error: 'Failed to create task' };
  } catch (error) {
    console.error('Error approving task creation request:', error);
    return { success: false, error: error.message };
  }
};

export const rejectTaskCreationRequest = async (requestId, adminNote = '') => {
  try {
    // Delete rejected request immediately to clean up Firestore
    await deleteDoc(doc(db, 'taskCreationRequests', requestId));
    return { success: true };
  } catch (error) {
    console.error('Error rejecting task creation request:', error);
    return { success: false, error: error.message };
  }
};

export const deleteTaskCreationRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, 'taskCreationRequests', requestId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting task creation request:', error);
    return { success: false, error: error.message };
  }
};

// ============ TASK REVISION REQUESTS (students request changes to existing tasks) ============
export const createTaskRevisionRequest = async (requestData) => {
  try {
    const docRef = await addDoc(collection(db, 'taskRevisionRequests'), {
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating task revision request:', error);
    return { success: false, error: error.message };
  }
};

export const getTaskRevisionRequests = async (filters = {}) => {
  try {
    let q = query(collection(db, 'taskRevisionRequests'), orderBy('createdAt', 'desc'));

    if (filters.userId) {
      q = query(collection(db, 'taskRevisionRequests'), where('userId', '==', filters.userId), orderBy('createdAt', 'desc'));
    }

    if (filters.status) {
      q = query(collection(db, 'taskRevisionRequests'), where('status', '==', filters.status), orderBy('createdAt', 'desc'));
    }

    if (filters.taskId) {
      q = query(collection(db, 'taskRevisionRequests'), where('taskId', '==', filters.taskId), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching task revision requests:', error);
    return [];
  }
};

export const approveTaskRevisionRequest = async (requestId, requestData) => {
  try {
    // Update the global task with proposed changes
    const updates = {};
    if (requestData.proposedChanges.title) updates.title = requestData.proposedChanges.title;
    if (requestData.proposedChanges.description) updates.description = requestData.proposedChanges.description;
    if (requestData.proposedChanges.dueDate) updates.dueDate = requestData.proposedChanges.dueDate;
    if (requestData.proposedChanges.priority) updates.priority = requestData.proposedChanges.priority;
    if (requestData.proposedChanges.subject) updates.subject = requestData.proposedChanges.subject;

    // Apply attachments from revision request if they exist
    if (requestData.attachments && requestData.attachments.length > 0) {
      updates.attachments = requestData.attachments;
    }

    const taskResult = await updateGlobalTask(requestData.taskId, updates);

    if (taskResult.success) {
      // Delete the request after successful task update to clean up Firestore
      await deleteDoc(doc(db, 'taskRevisionRequests', requestId));
      return { success: true };
    }
    return { success: false, error: 'Failed to update task' };
  } catch (error) {
    console.error('Error approving task revision request:', error);
    return { success: false, error: error.message };
  }
};

export const rejectTaskRevisionRequest = async (requestId, adminNote = '') => {
  try {
    // Delete rejected request immediately to clean up Firestore
    await deleteDoc(doc(db, 'taskRevisionRequests', requestId));
    return { success: true };
  } catch (error) {
    console.error('Error rejecting task revision request:', error);
    return { success: false, error: error.message };
  }
};

export const deleteTaskRevisionRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, 'taskRevisionRequests', requestId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting task revision request:', error);
    return { success: false, error: error.message };
  }
};

// ============ CONTENT SUBMISSION REQUESTS (students submit new tasks or announcements) ============
export const createContentSubmissionRequest = async (requestData) => {
  try {
    const docRef = await addDoc(collection(db, 'contentSubmissionRequests'), {
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating content submission request:', error);
    return { success: false, error: error.message };
  }
};

export const getContentSubmissionRequests = async (filters = {}) => {
  try {
    let q = query(collection(db, 'contentSubmissionRequests'), orderBy('createdAt', 'desc'));

    if (filters.userId) {
      q = query(collection(db, 'contentSubmissionRequests'), where('userId', '==', filters.userId), orderBy('createdAt', 'desc'));
    }

    if (filters.status) {
      q = query(collection(db, 'contentSubmissionRequests'), where('status', '==', filters.status), orderBy('createdAt', 'desc'));
    }

    if (filters.contentType) {
      q = query(collection(db, 'contentSubmissionRequests'), where('contentType', '==', filters.contentType), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching content submission requests:', error);
    return [];
  }
};

export const approveContentSubmissionRequest = async (requestId, requestData) => {
  try {
    if (requestData.contentType === 'task') {
      // Create a new global task
      const taskData = {
        title: requestData.title,
        description: requestData.description || '',
        subject: requestData.subject || '',
        dueDate: requestData.dueDate || null,
        priority: requestData.priority || 'medium',
        column: 'todo',
        order: Date.now(),
      };

      // Add attachments if present
      if (requestData.attachments && requestData.attachments.length > 0) {
        taskData.attachments = requestData.attachments;
      }

      // Add batch field if specified, otherwise 'all'
      if (requestData.targetBatch && requestData.targetBatch !== 'both') {
        taskData.batch = requestData.targetBatch;
      } else {
        taskData.batch = 'all';
      }

      const taskResult = await createGlobalTask(taskData);

      if (taskResult.success) {
        // Delete the request after successful task creation to clean up Firestore
        await deleteDoc(doc(db, 'contentSubmissionRequests', requestId));
        console.log('Task created successfully with ID:', taskResult.id);
        return { success: true, contentId: taskResult.id, type: 'task' };
      }
      console.error('Failed to create task:', taskResult.error);
      return { success: false, error: 'Failed to create task' };
    } else if (requestData.contentType === 'announcement') {
      // Create a new announcement
      const announcementData = {
        title: requestData.announcementTitle,
        message: requestData.announcementMessage,
        type: requestData.announcementType || 'info',
        createdBy: 'student-submission',
        createdAt: serverTimestamp(),
        isActive: true,
      };

      // Add attachments if present
      if (requestData.attachments && requestData.attachments.length > 0) {
        announcementData.attachments = requestData.attachments;
      }

      const announcementRef = await addDoc(collection(db, 'announcements'), announcementData);

      if (announcementRef.id) {
        // Delete the request after successful announcement creation to clean up Firestore
        await deleteDoc(doc(db, 'contentSubmissionRequests', requestId));
        return { success: true, contentId: announcementRef.id };
      }
      return { success: false, error: 'Failed to create announcement' };
    }
    return { success: false, error: 'Invalid content type' };
  } catch (error) {
    console.error('Error approving content submission request:', error);
    return { success: false, error: error.message };
  }
};

export const rejectContentSubmissionRequest = async (requestId, adminNote = '') => {
  try {
    // Delete rejected submission immediately to clean up Firestore
    await deleteDoc(doc(db, 'contentSubmissionRequests', requestId));
    return { success: true };
  } catch (error) {
    console.error('Error rejecting content submission request:', error);
    return { success: false, error: error.message };
  }
};

export const deleteContentSubmissionRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, 'contentSubmissionRequests', requestId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting content submission request:', error);
    return { success: false, error: error.message };
  }
};

// Announcement Revision Requests
export const createAnnouncementRevisionRequest = async (requestData) => {
  try {
    const docRef = await addDoc(collection(db, 'announcementRevisionRequests'), {
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating announcement revision request:', error);
    return { success: false, error: error.message };
  }
};

export const getAnnouncementRevisionRequests = async (filters = {}) => {
  try {
    let q = query(collection(db, 'announcementRevisionRequests'), orderBy('createdAt', 'desc'));

    if (filters.userId) {
      q = query(collection(db, 'announcementRevisionRequests'), where('userId', '==', filters.userId), orderBy('createdAt', 'desc'));
    }

    if (filters.status) {
      q = query(collection(db, 'announcementRevisionRequests'), where('status', '==', filters.status), orderBy('createdAt', 'desc'));
    }

    if (filters.announcementId) {
      q = query(collection(db, 'announcementRevisionRequests'), where('announcementId', '==', filters.announcementId), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting announcement revision requests:', error);
    return [];
  }
};

export const approveAnnouncementRevisionRequest = async (requestId, requestData) => {
  try {
    // Get the announcement document
    const announcementRef = doc(db, 'announcements', requestData.announcementId);
    const announcementDoc = await getDoc(announcementRef);

    if (!announcementDoc.exists()) {
      return { success: false, error: 'Announcement not found' };
    }

    // Update announcement with revised data
    const updateData = {};
    if (requestData.revisedTitle) updateData.title = requestData.revisedTitle;
    if (requestData.revisedMessage) updateData.message = requestData.revisedMessage;
    if (requestData.revisedType) updateData.type = requestData.revisedType;

    await updateDoc(announcementRef, updateData);

    // Delete the revision request
    await deleteDoc(doc(db, 'announcementRevisionRequests', requestId));

    return { success: true };
  } catch (error) {
    console.error('Error approving announcement revision request:', error);
    return { success: false, error: error.message };
  }
};

export const rejectAnnouncementRevisionRequest = async (requestId, adminNote = '') => {
  try {
    // Update the request status to rejected with admin note
    await updateDoc(doc(db, 'announcementRevisionRequests', requestId), {
      status: 'rejected',
      adminNote,
      reviewedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error rejecting announcement revision request:', error);
    return { success: false, error: error.message };
  }
};

