import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

function FavoriteScreen({ navigation }) {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm fetch danh sách sản phẩm yêu thích
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }
  
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : {};
      const favoriteIds = Array.isArray(parsedFavorites[userId]) ? parsedFavorites[userId] : [];
  
      if (favoriteIds.length > 0) {
        const response = await axios.get(`${API_BASE_URL}/products`);
        const allProducts = response.data;
        const filteredProducts = allProducts.filter(product => favoriteIds.includes(product.id));
        setFavoriteProducts(filteredProducts);
      } else {
        setFavoriteProducts([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message || 'Failed to fetch favorites');
      setLoading(false);
    }
  };
  

  // Sử dụng useFocusEffect để cập nhật danh sách khi quay lại màn hình
  useEffect(() => {
    fetchFavorites();
  }, [navigation]);
  

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.productDetails}>
        <Text style={styles.productTitle} numberOfLines={2} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text style={styles.productPrice}>{item.price}$</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading favorites...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AntDesign name="hearto" size={60} color="#888" />
        <Text style={styles.emptyText}>No favorite products yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favoriteProducts}
      renderItem={renderProductItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.productRow}
      contentContainerStyle={styles.scrollContentContainer}
    />
  );
}

const styles = StyleSheet.create({
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    height: 180,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productDetails: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000',
    height: 40,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  scrollContentContainer: {
    paddingBottom: 40,
    paddingTop: 10,
  },
});

export default FavoriteScreen;
