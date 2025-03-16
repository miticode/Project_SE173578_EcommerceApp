import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API để lấy thông tin giỏ hàng
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartId = await AsyncStorage.getItem('cartId');
        console.log('CartId retrieved from AsyncStorage:', cartId); // Kiểm tra log
  
        if (!cartId) {
          setError('No cart found. Please add items to your cart first.');
          setLoading(false);
          return;
        }
  
        const response = await fetch(`${API_BASE_URL}/carts/${cartId}`);
        const data = await response.json();
        console.log('Cart data from API:', data); // Kiểm tra dữ liệu giỏ hàng
        setCart(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load cart');
        setLoading(false);
        Alert.alert('Error', 'Failed to load cart. Please try again.');
      }
    };
  
    fetchCart();
  }, []);

  // Render thông tin giỏ hàng
  const renderCart = () => (
    <View style={styles.cartItem}>
      <Text style={styles.cartId}>Cart ID: {cart.id}</Text>
      <Text style={styles.userId}>User ID: {cart.userId}</Text>
      <Text style={styles.productsText}>
        Products: {cart.products.length > 0 ? cart.products.map(p => p.id).join(', ') : 'None'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <Text style={styles.header}>Cart Details</Text>
    {cart ? (
      <View style={styles.cartItem}>
        <Text style={styles.cartId}>Cart ID: {cart.id}</Text>
        <Text style={styles.userId}>User ID: {cart.userId}</Text>
        <Text style={styles.productsText}>
          Products: {cart.products.length > 0 ? cart.products.map(p => p.id).join(', ') : 'None'}
        </Text>
      </View>
    ) : (
      <Text style={styles.noCartsText}>No cart available</Text>
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  cartItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  productsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noCartsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default CartScreen;