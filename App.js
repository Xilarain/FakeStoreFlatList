import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image } from 'react-native';
import axios from 'axios';

const App = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const INITIAL_LOAD = 10;
  const ITEMS_PER_PAGE = 5;

  const fetchProducts = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const { data: products } = await axios.get('https://fakestoreapi.com/products');
      setAllProducts(products);

      setData(products.slice(0, INITIAL_LOAD));
      setPage(2);
      setHasMore(products.length > INITIAL_LOAD);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch products. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []); 


  const loadMore = async () => {
    if (!loading && hasMore) {
      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const startIndex = ((page - 1) * ITEMS_PER_PAGE) + (INITIAL_LOAD - ITEMS_PER_PAGE);
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedData = allProducts.slice(startIndex, endIndex);
      
      if (paginatedData.length === 0) {
        setHasMore(false);
      } else {
        setData(prevData => [...prevData, ...paginatedData]);
        setPage(prev => prev + 1);
      }
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);


  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={item => `product-${item.id}`} 
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : null}
        ListEmptyComponent={!loading && (
          <View style={styles.centerContainer}>
            <Text>No products available</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  loaderContainer: {
    paddingVertical: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default App;
