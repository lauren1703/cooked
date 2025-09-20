import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  addBookmark, 
  removeBookmark, 
  isRecipeBookmarked,
  updateBookmarkRating
} from '../services/bookmarkService';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Custom hook for managing user bookmarks with Firestore (REAL-TIME VERSION)
 * Uses onSnapshot for real-time updates when bookmarks are added/removed
 */
export const useBookmarks = (userId = null) => {
  const { currentUser } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  // Use provided userId or fall back to currentUser
  const targetUserId = userId || currentUser?.uid;

  // Set up real-time listener for bookmarks
  useEffect(() => {
    if (!targetUserId) {
      setBookmarks([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Create query for user's bookmarks, ordered by creation date (newest first)
    const bookmarksRef = collection(db, 'users', targetUserId, 'bookmarks');
    const q = query(bookmarksRef, orderBy('createdAt', 'desc'));

    // Set up real-time listener
    unsubscribeRef.current = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const bookmarksData = [];
          querySnapshot.forEach((doc) => {
            bookmarksData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setBookmarks(bookmarksData);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing bookmarks snapshot:', err);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in bookmarks snapshot listener:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from listener
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [targetUserId]);

  /**
   * Add a recipe to bookmarks
   * @param {Object} recipe - Recipe object to bookmark
   */
  const addToBookmarks = useCallback(async (recipe) => {
    if (!targetUserId) {
      throw new Error('User must be logged in to bookmark recipes');
    }

    try {
      setError(null);
      
      // Add bookmark to Firestore - the real-time listener will automatically update the state
      const bookmarkId = await addBookmark(targetUserId, recipe);
      return bookmarkId;
    } catch (err) {
      setError(err.message);
      console.error('Error adding bookmark:', err);
      throw err;
    }
  }, [targetUserId]);

  /**
   * Remove a recipe from bookmarks
   * @param {string} bookmarkId - The bookmark document ID
   */
  const removeFromBookmarks = useCallback(async (bookmarkId) => {
    if (!targetUserId) {
      throw new Error('User must be logged in to remove bookmarks');
    }

    try {
      setError(null);
      
      // Remove bookmark from Firestore - the real-time listener will automatically update the state
      await removeBookmark(targetUserId, bookmarkId);
    } catch (err) {
      setError(err.message);
      console.error('Error removing bookmark:', err);
      throw err;
    }
  }, [targetUserId]);

  /**
   * Check if a recipe is bookmarked (optimized - checks local state first)
   * @param {Object} recipe - Recipe object to check
   * @returns {Object|null} - Bookmark if found, null otherwise
   */
  const checkIfBookmarked = useCallback((recipe) => {
    if (!targetUserId || !recipe) {
      return null;
    }

    // Check local state first (much faster than API call)
    const localBookmark = bookmarks.find(bookmark => 
      bookmark.title === recipe.name && 
      JSON.stringify(bookmark.ingredients) === JSON.stringify(recipe.ingredients)
    );

    return localBookmark || null;
  }, [targetUserId, bookmarks]);

  /**
   * Get bookmark count
   * @returns {number} - Number of bookmarks
   */
  const getCount = useCallback(() => {
    return bookmarks.length;
  }, [bookmarks]);

  /**
   * Toggle bookmark status for a recipe
   * @param {Object} recipe - Recipe object to toggle
   * @returns {Promise<boolean>} - True if bookmarked, false if removed
   */
  const toggleBookmark = useCallback(async (recipe) => {
    if (!targetUserId) {
      throw new Error('User must be logged in to bookmark recipes');
    }

    try {
      const existingBookmark = checkIfBookmarked(recipe);
      
      if (existingBookmark) {
        await removeFromBookmarks(existingBookmark.id);
        return false; // Removed
      } else {
        await addToBookmarks(recipe);
        return true; // Added
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      throw err;
    }
  }, [targetUserId, addToBookmarks, removeFromBookmarks, checkIfBookmarked]);

  /**
   * Update the rating for a bookmarked recipe
   * @param {string} bookmarkId - The bookmark document ID
   * @param {number} rating - The rating (1-5)
   */
  const rateBookmark = useCallback(async (bookmarkId, rating) => {
    if (!targetUserId) {
      throw new Error('User must be logged in to rate recipes');
    }

    try {
      setError(null);
      
      // Update rating in Firestore - the real-time listener will automatically update the state
      await updateBookmarkRating(targetUserId, bookmarkId, rating);
    } catch (err) {
      setError(err.message);
      console.error('Error rating bookmark:', err);
      throw err;
    }
  }, [targetUserId]);

  return {
    bookmarks,
    loading,
    error,
    addToBookmarks,
    removeFromBookmarks,
    checkIfBookmarked,
    toggleBookmark,
    rateBookmark,
    getCount
  };
};