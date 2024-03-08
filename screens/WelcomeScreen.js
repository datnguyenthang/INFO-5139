import React, { useState, useEffect, useLayoutEffect } from 'react';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert, Platform, Image } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import CustomHeaderButton from '../components/CustomHeaderButton';
import { styles } from '../styles/styles';

const WelcomeScreen = (props) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [logoOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    animateLogo();
  }, []);

  const animateLogo = () => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const loginWithFirebase = () => {
    if (loginEmail.length < 4 || loginPassword.length < 4) {
      Alert.alert('Please enter valid credentials!!!.');
      return;
    }

    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      .then((_firebaseUser) => {
        props.navigation.navigate('ScreenTwo');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/wrong-password') {
          Alert.alert('Wrong password! Please, try again!');
        } else {
          Alert.alert('Invalid login!');
        }
      });
  };

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
          <Item
            title="Screen 2"
            iconName={Platform.OS === 'android' ? 'md-add' : 'ios-add'}
            onPress={() => props.navigation.navigate('ScreenThree')}
          />
        </HeaderButtons>
      ),
    });
  }, [props.navigation]);

  return (
    <View style={styleWelcomes.container}>
      <Animated.View style={{ opacity: logoOpacity, marginBottom: 20, flexDirection: 'row' }}>
        <View style={styleWelcomes.iconContainer}>
          <Image source={require('../assets/media.gif')} name="headset" style={styleWelcomes.icon} />          
        </View>        
      </Animated.View>
      <Text style={styles.label}>LOGIN</Text>
      <TextInput
          style={[styleWelcomes.textInput, styleWelcomes.input]}
          onChangeText={(value) => setLoginEmail(value)}
          autoCapitalize="none"
          autoCorrect={false}
          autoCompleteType="email"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#666"
      />
      <TextInput
          style={[styleWelcomes.textInput, styleWelcomes.input]}
          onChangeText={(value) => setLoginPassword(value)}
          autoCapitalize="none"
          autoCorrect={false}
          autoCompleteType="password"
          keyboardType="default"
          placeholder="Password"
          secureTextEntry={true}
          placeholderTextColor="#666"
      />
      <View style={styleWelcomes.buttonContainer}>
        <TouchableOpacity style={styleWelcomes.loginButton} onPress={loginWithFirebase}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styleWelcomes.registerButton} onPress={() => props.navigation.navigate('ScreenThree')}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styleWelcomes = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#E2E1D3',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    width: 350,
    backgroundColor: 'white',
  },
  icon: {
    marginBottom: 10,
    width:240,
    height:140,    
  },
  iconText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    flex: 1, // Equal flex to distribute space evenly
    marginRight: 5, // Add some margin between buttons
  },
  registerButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    flex: 1, // Equal flex to distribute space evenly
    marginLeft: 8, // Add some margin between buttons
  },
  buttonText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  textInput: {
      color: '#000000',
      fontSize: 20,
      height: Platform.OS === 'android' ? 40 : 40, // Adjust the height for Android
      textAlignVertical: 'center', // Center the text vertically on Android
    },
});
