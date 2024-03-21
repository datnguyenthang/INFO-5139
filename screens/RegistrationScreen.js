import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

const RegistrationScreen = (props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // register using firebase auth service
  const registerWithFirebase = () => {
    if (!firstName.trim() || !lastName.trim() || email.length < 4 || password.length < 4) {
      Alert.alert('Please fill out all fields.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (_firebaseUser) => {
        await saveUserWithFirebase();
      })
      .catch((error) => {
        console.log(email);
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/weak-password') {
          Alert.alert('The password is too weak.');
        } else {
          Alert.alert(errorMessage);
        }
        console.log(error);
      });
  };

  const saveUserWithFirebase = async () => {
    const userID = auth.currentUser.uid;

    // SAVE USER TO FIRESTORE

    try {
      await setDoc(doc(firestore, 'users', userID), {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
      });

      Alert.alert('User registration successfully!');
      props.navigation.navigate('ScreenOne');
    } catch (error) {
      Alert.alert('Error saving user');
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <FontAwesome name="user-circle" size={100} color="#3498db" style={styles.icon} />
      <Text style={styles.label}>Complete the form</Text>
      <TextInput
        style={[styles.input, styles.textInput]}
        onChangeText={(value) => setFirstName(value)}
        placeholder="First Name"
        placeholderTextColor="#666"
      />
      <TextInput
        style={[styles.input, styles.textInput]}
        onChangeText={(value) => setLastName(value)}
        placeholder="Last Name"
        placeholderTextColor="#666"
      />
      <TextInput
        style={[styles.input, styles.textInput]}
        onChangeText={(value) => setEmail(value)}
        autoCapitalize="none"
        autoCorrect={false}
        autoCompleteType="email"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="#666"
      />
      <TextInput
        style={[styles.input, styles.textInput]}
        onChangeText={(value) => setPassword(value)}
        autoCapitalize="none"
        autoCorrect={false}
        autoCompleteType="password"
        keyboardType="default"
        placeholder="Password"
        secureTextEntry={true}
        placeholderTextColor="#666"
      />
      <TouchableOpacity style={styles.buttonContainer} onPress={registerWithFirebase}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#E2E1D3',
  },
  icon: {
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginBottom: 10,
    width: 350,
    backgroundColor: 'white',
  },
  textInput: {
    color: '#000000', // White text color
  },
  buttonContainer: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default RegistrationScreen;
