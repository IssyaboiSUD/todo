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
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth, db } from './firebase';
import { Task, Category } from '../types';


// Auth functions
export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Task functions
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
        dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Task);
    });
    
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const addTask = async (userId: string, task: Omit<Task, 'id'>): Promise<string | null> => {
  try {
    const tasksRef = collection(db, 'tasks');
    
    // Clean up undefined values for Firestore
    const cleanTask = {
      title: task.title,
      description: task.description || null,
      notes: task.notes || null,
      completed: task.completed,
      status: task.status,
      dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
      category: task.category,
      priority: task.priority,
      repeat: task.repeat || null, // Convert undefined to null
      createdAt: Timestamp.fromDate(task.createdAt),
      updatedAt: Timestamp.fromDate(task.updatedAt),
      tags: task.tags || [],
      userId,
    };
    
    const docRef = await addDoc(tasksRef, cleanTask);
    return docRef.id;
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    
    // Clean up undefined values for Firestore
    const cleanUpdates: any = {
      updatedAt: Timestamp.fromDate(new Date()),
    };
    
    // Only include defined fields
    if (updates.title !== undefined) cleanUpdates.title = updates.title;
    if (updates.description !== undefined) cleanUpdates.description = updates.description || null;
    if (updates.notes !== undefined) cleanUpdates.notes = updates.notes || null;
    if (updates.completed !== undefined) cleanUpdates.completed = updates.completed;
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.dueDate !== undefined) cleanUpdates.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null;
    if (updates.category !== undefined) cleanUpdates.category = updates.category;
    if (updates.priority !== undefined) cleanUpdates.priority = updates.priority;
    if (updates.repeat !== undefined) cleanUpdates.repeat = updates.repeat || null;
    if (updates.tags !== undefined) cleanUpdates.tags = updates.tags || [];
    
    await updateDoc(taskRef, cleanUpdates);
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

// Real-time listener for tasks
export const subscribeToUserTasks = (
  userId: string, 
  callback: (tasks: Task[]) => void
) => {
  const tasksRef = collection(db, 'tasks');
  const q = query(
    tasksRef, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
        dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Task);
    });
    callback(tasks);
  }, (error) => {
    console.error('Firebase listener error:', error);
  });
};

// User settings functions
export const getUserSettings = async (userId: string) => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    const docSnap = await getDoc(settingsRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

export const updateUserSettings = async (userId: string, settings: any): Promise<boolean> => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: Timestamp.fromDate(new Date()),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
};
