import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { API_BASE_URL } from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API để lấy thông tin sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Hàm lưu giỏ hàng vào AsyncStorage
  const saveCartToStorage = async (updatedCart) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const storedCarts = await AsyncStorage.getItem('carts');
      let allCarts = storedCarts ? JSON.parse(storedCarts) : {};
      
      allCarts[userId] = updatedCart; // Lưu giỏ hàng theo userId
      await AsyncStorage.setItem('carts', JSON.stringify(allCarts));
      console.log('Cart saved to AsyncStorage:', allCarts);
    } catch (err) {
      console.error('Error saving cart to AsyncStorage:', err);
    }
  };

  // Hàm xử lý Add to Cart
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not logged in. Please login to add items to cart.');
        return;
      }

      // Lấy giỏ hàng hiện tại từ AsyncStorage
      const storedCarts = await AsyncStorage.getItem('carts');
      const allCarts = storedCarts ? JSON.parse(storedCarts) : {};
      const userCart = Array.isArray(allCarts[userId]) ? allCarts[userId] : [];

      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const isProductInCart = userCart.some(item => item.id === productId);
      let updatedCart;

      if (isProductInCart) {
        // Nếu sản phẩm đã có, tăng số lượng (nếu cần)
        updatedCart = userCart.map(item =>
          item.id === productId ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      } else {
        // Nếu sản phẩm chưa có, thêm mới vào giỏ hàng
        const newCartItem = {
          id: productId,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: 1,
        };
        updatedCart = [...userCart, newCartItem];
      }

      // Lưu giỏ hàng cục bộ vào AsyncStorage
      await saveCartToStorage(updatedCart);

      // Gọi API để đồng bộ với server (nếu có kết nối)
      const cart = {
        userId: parseInt(userId, 10),
        products: updatedCart.map(item => ({ id: item.id, quantity: item.quantity })),
      };

      try {
        const response = await axios.post(`${API_BASE_URL}/carts`, cart);
        console.log('Add to Cart response:', response.data);

        const cartId = response.data.id; // Giả sử API trả về cartId
        await AsyncStorage.setItem('cartId', cartId.toString());
      } catch (apiError) {
        console.warn('API call failed, cart saved locally:', apiError);
      }

      Alert.alert('Success', `${product.title} has been added to your cart!`);
    } catch (err) {
      console.error('Add to Cart error:', err);
      Alert.alert('Error', 'Failed to add product to cart. Please try again.');
    }
  };

  // Hàm xử lý Buy (tạm thời chỉ hiển thị alert)
  const handleBuy = () => {
    if (product) {
      Alert.alert('Purchase', `Purchasing ${product.title} for $${product.price}!`);
    }
  };

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
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.category}>Category: {product.category}</Text>

      {/* Nút Add to Cart và Buy */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
          <Text style={styles.buttonText}>Buy</Text>
        </TouchableOpacity>
      </View>
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
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: 'tomato',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  buyButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;