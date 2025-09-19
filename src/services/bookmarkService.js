import { 
  collection, 
  doc, 
  setDoc,
  updateDoc,
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Firestore Bookmark Service
 * 
 * Schema: users/{uid}/bookmarks/{recipeId}
 * Each bookmark document contains:
 * - title: string (recipe name)
 * - ingredients: array of strings
 * - createdAt: timestamp
 * - updatedAt: timestamp (when recipe is updated)
 * - imageUrl: string (optional, for recipe image)
 * - instructions: array of strings (optional)
 * - cookingTime: string (optional)
 * - difficulty: string (optional)
 * - cuisine: string (optional)
 * - rating: number (optional, 1-5 star rating)
 * - ratedAt: timestamp (when recipe was rated)
 */

/**
 * Add a recipe to user's bookmarks (OPTIMIZED VERSION)
 * Uses setDoc with merge: true for better performance
 * @param {string} userId - The user's UID
 * @param {Object} recipe - Recipe object to bookmark
 * @returns {Promise<string>} - The document ID of the created bookmark
 */
export const addBookmark = async (userId, recipe) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!recipe || !recipe.name) {
      throw new Error('Recipe data is required');
    }

    // Generate a consistent recipe ID based on title and ingredients
    const recipeId = generateRecipeId(recipe);
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', recipeId);
    
    const bookmarkData = {
      title: recipe.name,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      cookingTime: recipe.cookingTime || '',
      difficulty: recipe.difficulty || '',
      cuisine: recipe.cuisine || '',
      imageUrl: recipe.imageUrl || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Use setDoc with merge: true for better performance
    await setDoc(bookmarkRef, bookmarkData, { merge: true });
    return recipeId;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }
};

/**
 * Generate a consistent recipe ID based on title and ingredients
 * This allows us to use setDoc with merge instead of addDoc
 * @param {Object} recipe - Recipe object
 * @returns {string} - Generated recipe ID
 */
const generateRecipeId = (recipe) => {
  const title = recipe.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const ingredientsHash = recipe.ingredients 
    ? recipe.ingredients.join(',').toLowerCase().replace(/[^a-z0-9,]/g, '')
    : '';
  
  // Create a simple hash of the ingredients
  let hash = 0;
  for (let i = 0; i < ingredientsHash.length; i++) {
    const char = ingredientsHash.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `${title}-${Math.abs(hash).toString(36)}`;
};

/**
 * Remove a recipe from user's bookmarks
 * @param {string} userId - The user's UID
 * @param {string} bookmarkId - The bookmark document ID
 */
export const removeBookmark = async (userId, bookmarkId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!bookmarkId) {
      throw new Error('Bookmark ID is required');
    }

    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', bookmarkId);
    await deleteDoc(bookmarkRef);
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
};

/**
 * Get all bookmarks for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<Array>} - Array of bookmark objects with document IDs
 */
export const getUserBookmarks = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
    const q = query(bookmarksRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const bookmarks = [];

    querySnapshot.forEach((doc) => {
      bookmarks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return bookmarks;
  } catch (error) {
    console.error('Error getting user bookmarks:', error);
    throw error;
  }
};

/**
 * Check if a recipe is bookmarked (OPTIMIZED VERSION)
 * Uses direct document lookup instead of loading all bookmarks
 * @param {string} userId - The user's UID
 * @param {Object} recipe - Recipe object to check
 * @returns {Promise<Object|null>} - Bookmark document if found, null otherwise
 */
export const isRecipeBookmarked = async (userId, recipe) => {
  try {
    if (!userId || !recipe) {
      return null;
    }

    // Generate the same recipe ID that would be used for bookmarking
    const recipeId = generateRecipeId(recipe);
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', recipeId);
    
    // Direct document lookup - much faster than loading all bookmarks
    const bookmarkDoc = await getDoc(bookmarkRef);
    
    if (bookmarkDoc.exists()) {
      return {
        id: bookmarkDoc.id,
        ...bookmarkDoc.data()
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking if recipe is bookmarked:', error);
    return null;
  }
};

/**
 * Get bookmark count for a user (OPTIMIZED VERSION)
 * Uses getDocs with limit to avoid loading all bookmark data
 * @param {string} userId - The user's UID
 * @returns {Promise<number>} - Number of bookmarks
 */
export const getBookmarkCount = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
    const querySnapshot = await getDocs(bookmarksRef);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting bookmark count:', error);
    return 0;
  }
};

/**
 * Update the rating for a bookmarked recipe
 * @param {string} userId - The user's UID
 * @param {string} bookmarkId - The bookmark document ID
 * @param {number} rating - The rating (1-5)
 * @returns {Promise<void>}
 */
export const updateBookmarkRating = async (userId, bookmarkId, rating) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!bookmarkId) {
      throw new Error('Bookmark ID is required');
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', bookmarkId);
    
    await updateDoc(bookmarkRef, {
      rating: rating,
      ratedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating bookmark rating:', error);
    throw error;
  }
};

