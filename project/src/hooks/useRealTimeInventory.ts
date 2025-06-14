import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useRealTimeInventory = (productId: string) => {
  const [stock, setStock] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    // Initial fetch
    const fetchInitialStock = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', productId)
          .single();

        if (error) throw error;
        
        setStock(data.stock_quantity || 0);
      } catch (error) {
        console.error('Error fetching initial stock:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStock();

    // Set up real-time subscription
    const channel = supabase
      .channel(`inventory-${productId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
        filter: `id=eq.${productId}`
      }, (payload) => {
        console.log('Real-time inventory update:', payload);
        setStock(payload.new.stock_quantity || 0);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return { stock, loading };
};

export const useRealTimeOrderNotifications = (userId: string) => {
  const [newOrders, setNewOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Set up real-time subscription for new orders
    const channel = supabase
      .channel(`orders-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('New order received:', payload);
        setNewOrders(prev => [payload.new, ...prev]);
      })
      .subscribe();

    setLoading(false);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const clearNotifications = () => {
    setNewOrders([]);
  };

  return { newOrders, loading, clearNotifications };
};