import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, AuthContext } from './context/AuthContext';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import ProductDetailScreen from './screens/ProductDetailScreen';
import LoginScreen from './screens/LoginScreen';
import CartScreen from './screens/CartScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {({ isLoggedIn }) => (
          <NavigationContainer>
            {isLoggedIn === null ? null : (
              <Stack.Navigator>
                {isLoggedIn ? (
                  <>
                    <Stack.Screen
                      name="Main"
                      component={BottomTabNavigator}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                    <Stack.Screen name="Cart" component={CartScreen} />
                  </>
                ) : (
                  <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                  />
                )}
              </Stack.Navigator>
            )}
          </NavigationContainer>
        )}
      </AuthContext.Consumer>
    </AuthProvider>
  );
};

export default App;