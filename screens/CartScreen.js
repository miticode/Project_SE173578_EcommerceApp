import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch giỏ hàng từ AsyncStorage
  const fetchCartFromStorage = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setError('User not logged in. Please login to view your cart.');
        setLoading(false);
        return;
      }

      const storedCarts = await AsyncStorage.getItem('carts');
      const allCarts = storedCarts ? JSON.parse(storedCarts) : {};
      const userCart = Array.isArray(allCarts[userId]) ? allCarts[userId] : [];

      if (userCart.length > 0) {
        setCartItems(userCart);
      } else {
        setError('No items in your cart yet.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart from AsyncStorage:', err);
      setError('Failed to load cart from storage');
      setLoading(false);
    }
  };

  // Fetch giỏ hàng từ API (tùy chọn)
  const fetchCartFromAPI = async () => {
    try {
      const cartId = await AsyncStorage.getItem('cartId');
      if (!cartId) return;

      const response = await fetch(`${API_BASE_URL}/carts/${cartId}`);
      const data = await response.json();
      console.log('Cart data from API:', data);

      const userId = await AsyncStorage.getItem('userId');
      const storedCarts = await AsyncStorage.getItem('carts');
      let allCarts = storedCarts ? JSON.parse(storedCarts) : {};

      const apiProducts = data.products.map(p => ({
        id: p.id,
        quantity: p.quantity || 1,
      }));

      if (allCarts[userId]) {
        allCarts[userId] = allCarts[userId].map(item => {
          const apiProduct = apiProducts.find(p => p.id === item.id);
          return apiProduct ? { ...item, quantity: apiProduct.quantity } : item;
        });
        await AsyncStorage.setItem('carts', JSON.stringify(allCarts));
        setCartItems(allCarts[userId]);
      }
    } catch (err) {
      console.warn('Failed to fetch cart from API:', err);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (productId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const storedCarts = await AsyncStorage.getItem('carts');
      const allCarts = storedCarts ? JSON.parse(storedCarts) : {};
      const userCart = Array.isArray(allCarts[userId]) ? allCarts[userId] : [];

      // Lọc bỏ sản phẩm có productId
      const updatedCart = userCart.filter(item => item.id !== productId);
      allCarts[userId] = updatedCart;

      // Lưu lại vào AsyncStorage
      await AsyncStorage.setItem('carts', JSON.stringify(allCarts));

      // Cập nhật UI
      setCartItems(updatedCart);
      Alert.alert('Success', 'Item removed from cart!');
    } catch (err) {
      console.error('Error removing item from cart:', err);
      Alert.alert('Error', 'Failed to remove item from cart.');
    }
  };

  useEffect(() => {
    const loadCart = async () => {
      await fetchCartFromStorage();
      await fetchCartFromAPI();
      setLoading(false);
    };
    loadCart();
  }, []);

  // Tính tổng giá tiền
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0).toFixed(2);
  };

  // Xử lý khi nhấn Checkout
  const handleCheckout = () => {
    const totalPrice = calculateTotalPrice();
    Alert.alert(
      'Checkout',
      `Total amount: $${totalPrice}\nProceed to payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => console.log('Proceed to payment') },
      ]
    );
  };

  // Render từng sản phẩm trong giỏ hàng
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>${item.price} x {item.quantity}</Text>
        <Text style={styles.totalPrice}>Total: ${(item.price * item.quantity).toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
        <Feather name="trash-2" size={18} color="#fff" />
      </TouchableOpacity>
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
      <Text style={styles.header}>Your Cart</Text>
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.cartList}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ${calculateTotalPrice()}</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.noCartsText}>No items in your cart</Text>
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
  cartList: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'tomato',
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
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
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;