import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

const PRODUCTS_COLLECTION = 'products';

/**
 * Service for managing real-time store inventory in Firestore.
 * Supports listening to live inventory updates, changing prices,
 * updating stock levels, and adding/editing items directly.
 */
export class InventoryService {
  /**
   * Listen to real-time inventory updates from Firestore.
   * If the collection is empty, returns fallback products and triggers initial seed.
   */
  public static subscribe(
    onUpdate: (products: Product[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const productsRef = collection(db, PRODUCTS_COLLECTION);

    return onSnapshot(
      productsRef,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, provide default products
          onUpdate(PRODUCTS);
          return;
        }

        const items: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Product;
          items.push({
            ...data,
            id: docSnap.id,
          });
        });

        // Sort items logically by category and name
        items.sort((a, b) => a.name.localeCompare(b.name));
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore live inventory listener error:', error);
        if (onError) onError(error);
        // Fallback to local products if offline or error
        onUpdate(PRODUCTS);
      }
    );
  }

  /**
   * Update live product price directly in Firestore
   */
  public static async updatePrice(productId: string, pricePKR: number): Promise<void> {
    const path = `${PRODUCTS_COLLECTION}/${productId}`;
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      await updateDoc(docRef, {
        pricePKR,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  /**
   * Update live stock level and in-stock status directly in Firestore
   */
  public static async updateStock(
    productId: string,
    inStock: boolean,
    stockCount: number
  ): Promise<void> {
    const path = `${PRODUCTS_COLLECTION}/${productId}`;
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      await updateDoc(docRef, {
        inStock,
        stockCount,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  /**
   * Create or update a product document in Firestore
   */
  public static async saveProduct(product: Product): Promise<void> {
    const path = `${PRODUCTS_COLLECTION}/${product.id}`;
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await setDoc(
        docRef,
        {
          ...product,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Delete a product from Firestore
   */
  public static async deleteProduct(productId: string): Promise<void> {
    const path = `${PRODUCTS_COLLECTION}/${productId}`;
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Sync default inventory to Firestore in bulk batch
   */
  public static async syncAllToFirestore(products: Product[] = PRODUCTS): Promise<number> {
    try {
      const batch = writeBatch(db);
      let count = 0;
      for (const item of products) {
        const docRef = doc(db, PRODUCTS_COLLECTION, item.id);
        batch.set(
          docRef,
          {
            ...item,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        count++;
      }
      await batch.commit();
      return count;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
    }
  }

  /**
   * Check if Firestore inventory currently has records
   */
  public static async isInitialized(): Promise<boolean> {
    try {
      const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      return !snapshot.empty;
    } catch {
      return false;
    }
  }
}
