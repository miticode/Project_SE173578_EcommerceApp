import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Button, SafeAreaView } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { Feather, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error details:', error);
      setError(error.message || 'Failed to fetch products');
      setLoading(false);
    }
  };
  const loadFavorites = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        return;
      }
  
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        const userFavorites = Array.isArray(parsedFavorites[userId]) ? parsedFavorites[userId] : [];
        setFavorites(userFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };
  

  const saveFavorites = async (updatedFavorites) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const storedFavorites = await AsyncStorage.getItem('favorites');
      let allFavorites = storedFavorites ? JSON.parse(storedFavorites) : {};
      
      allFavorites[userId] = updatedFavorites; // Lưu danh sách theo userId
      await AsyncStorage.setItem('favorites', JSON.stringify(allFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };
  

  const toggleFavorite = async (productId) => {
    if (!Array.isArray(favorites)) {
      console.error('Favorites is not an array:', favorites);
      return;
    }
  
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found');
      return;
    }
  
    const isFavorite = favorites.includes(productId);
    let updatedFavorites = isFavorite
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
  
    setFavorites(updatedFavorites);
    await saveFavorites(updatedFavorites);
  
    // Cập nhật FavoriteScreen ngay lập tức bằng cách gọi sự kiện focus
    navigation.navigate('Favorite');
  };
  
  
  

  useEffect(() => {
    fetchProducts();
    loadFavorites();
  }, []);

  const categories = [
    { id: '1', name: 'Women', image: 'https://womanate.com/wp-content/uploads/2023/04/WATE_Salvadoran3.jpg' },
    { id: '2', name: 'Men', image: 'https://m.media-amazon.com/images/M/MV5BODlmZDRkMWEtMTE3MC00MTAwLWE3YWEtYzc2ZmFlNzQxOGNkXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg' },
    { id: '3', name: 'Teens', image: 'https://about.fb.com/wp-content/uploads/2023/01/Youth-Ads-Update_Header.jpg' },
    { id: '4', name: 'Kids', image: 'https://static.independent.co.uk/s3fs-public/thumbnails/image/2019/11/20/09/children-0.jpg' },
    { id: '5', name: 'Baby', image: 'https://tse3.mm.bing.net/th?id=OIP.b8sXW1nuB7LPxCjgGu3clwAAAA&pid=Api&P=0&h=180' },
  ];

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://img.freepik.com/premium-vector/circle-floral-fashion-store-hanger-logo-design-vector_680355-4.jpg' }}
          style={styles.logo}
          resizeMode="contain"
        />
       <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
          <Feather name="shopping-bag" size={22} color="#000" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>NEW COLLECTIONS</Text>
          <Text style={styles.bannerSubtitle}>20% OFF</Text>
          <TouchableOpacity style={styles.shopNowButton}>
            <Text style={styles.shopNowButtonText}>SHOP NOW</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: 'https://png.pngtree.com/png-vector/20240628/ourlarge/pngtree-top-saleclothesadvertising-images-fashion-luxury-models-girl-banner-png-image_12783563.png' }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop By Category</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products Section Header */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Curated For You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderProductItem = ({ item, index }) => {
    const isFavorite = Array.isArray(favorites) ? favorites.includes(item.id) : false;
  
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <AntDesign name={isFavorite ? 'heart' : 'hearto'} size={18} color={isFavorite ? '#e91e63' : '#d9d9d9'} />
          </TouchableOpacity>
        </View>
        <View style={styles.productDetails}>
          <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.productPrice}>{item.price}$</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.categoryImage}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button title="Retry" onPress={fetchProducts} color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products.slice(0, 6)}
        renderItem={renderProductItem}
        keyExtractor={item => item.id || item.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollContentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  logo: {
    width: 28,
    height: 28,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: '#d4e1e6',
    height: 160,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  bannerSubtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 6,
  },
  shopNowButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  shopNowButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerImage: {
    width: '40%',
    height: '100%',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAll: {
    color: '#888',
    fontSize: 14,
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryItem: {
    marginRight: 12,
    alignItems: 'center',
    width: 70,
  },
  categoryImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryImage: {
    width: 60,
    height: 60,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#000',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#888',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
  
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    width: '48%', // Adjust width to allow proper spacing between items
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
    height: 180, // Increased height for better visibility
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  productDetails: {
    padding: 12,
  },
  brandRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandName: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 11,
    color: '#000',
    marginLeft: 2,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 10,
    color: '#888',
    marginLeft: 2,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000',
    height: 40, // Fixed height for 2 lines
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  originalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  emptyProductsContainer: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#888',
    fontWeight: '500',
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff1f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffccc7',
  },
  errorText: {
    color: '#f5222d',
    marginBottom: 15,
    fontWeight: '500',
  },
  scrollContentContainer: {
    paddingBottom: 40, // Add padding at the bottom
    flexGrow: 1, // Important for scrolling
  },
 
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow items to wrap to next line
    justifyContent: 'space-between',
  },
  productsContainer: {
    width: '100%',
  },
  productRow: {
    justifyContent: 'space-between',
  },
});

export default HomeScreen;