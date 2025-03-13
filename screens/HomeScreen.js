import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Button, ScrollView, SafeAreaView } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { Feather, AntDesign } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderProductItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.productItem, index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }]}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <AntDesign name="heart" size={18} color="#d9d9d9" />
        </TouchableOpacity>
      </View>
      <View style={styles.productDetails}>
        <View style={styles.brandRatingContainer}>
          <Text style={styles.brandName}>H&M</Text>
          <View style={styles.ratingContainer}>
            <AntDesign name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{index % 2 === 0 ? '4.9' : '4.8'}</Text>
            <Text style={styles.reviewCount}>({index % 2 === 0 ? '136' : '178'})</Text>
          </View>
        </View>
        <Text style={styles.productTitle} numberOfLines={2} ellipsizeMode="tail">
          {index % 2 === 0 ? 'Oversized Fit Printed M...' : 'Printed Sweatshirt'}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>${index % 2 === 0 ? '295.00' : '314.00'}</Text>
          {index % 2 === 0 && <Text style={styles.originalPrice}>$550.00</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

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

  const categories = [
    { id: '1', name: 'Women', image: 'https://womanate.com/wp-content/uploads/2023/04/WATE_Salvadoran3.jpg' },
    { id: '2', name: 'Men', image: 'https://m.media-amazon.com/images/M/MV5BODlmZDRkMWEtMTE3MC00MTAwLWE3YWEtYzc2ZmFlNzQxOGNkXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg' },
    { id: '3', name: 'Teens', image: 'https://about.fb.com/wp-content/uploads/2023/01/Youth-Ads-Update_Header.jpg' },
    { id: '4', name: 'Kids', image: 'https://static.independent.co.uk/s3fs-public/thumbnails/image/2019/11/20/09/children-0.jpg' },
    { id: '5', name: 'Baby', image: 'https://tse3.mm.bing.net/th?id=OIP.b8sXW1nuB7LPxCjgGu3clwAAAA&pid=Api&P=0&h=180' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://img.freepik.com/premium-vector/circle-floral-fashion-store-hanger-logo-design-vector_680355-4.jpg' }} 
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.cartButton}>
          <Feather name="shopping-bag" size={22} color="#000" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={true} contentContainerStyle={styles.scrollContentContainer}>
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

        {/* Products Section */}
        <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Curated For You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Button title="Retry" onPress={fetchProducts} color="#000" />
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products.length > 0 ? products.slice(0, 6).map((item, index) => (
              <View key={item.id || index} style={{flex: 1}}>
                {renderProductItem({item, index})}
              </View>
            )) : (
              <View style={styles.emptyProductsContainer}>
                <Text>No products available</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Add bottom padding view for better scrolling */}
      <View style={{height: 40}} />
      </ScrollView>

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
  productsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    flex: 1,
  },
  productImageContainer: {
    position: 'relative',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    padding: 10,
  },
  brandRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 12,
    color: '#888',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#000',
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 11,
    color: '#888',
    marginLeft: 2,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#000',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  originalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: '#888',
  },
  activeNavText: {
    color: '#000',
    fontWeight: '500',
  },
  scrollContentContainer: {
    paddingBottom: 40, // Add padding at the bottom
    flexGrow: 1, // Important for scrolling
  },
  emptyProductsContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow items to wrap to next line
    justifyContent: 'space-between',
  },
});

export default HomeScreen;