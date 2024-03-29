import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { onSnapshot, doc } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { firestore, auth } from '../firebaseConfig';

const MainScreen = (props) => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
	const retrieveDataWithFirebase = async () => {
	  const userID = auth.currentUser.uid;
	  onSnapshot(doc(firestore, '/users/' + userID), (snapshot) => {
		if (snapshot.exists()) {
		  const firstName = snapshot.data().FirstName;
		  setWelcomeMessage(`Welcome, ${firstName}`);
		  setEmailVerified(auth.currentUser.emailVerified);
		}
	  });
	};

	retrieveDataWithFirebase();

	// Interval to update verified email status every 3000 milliseconds
	const interval = setInterval(() => {
	  const userID = auth.currentUser.uid;
	  onSnapshot(doc(firestore, '/users/' + userID), (snapshot) => {
		if (snapshot.exists()) {
		  setEmailVerified(auth.currentUser.emailVerified);
		}
	  });
	}, 3000);

	// Clean up function to clear interval
	  return () => clearInterval(interval);
  }, []);

  const sendVerificationEmail = () => {
    sendEmailVerification(auth.currentUser)
      .then(() => {
        alert('Verification Email Sent Successfully!');
      })
      .catch((error) => {
        alert('Error Sending Verification Email', error.message);
      });
  };

  const handleNavigation = (screen) => {
    props.navigation.navigate(screen);
  };

  const renderButton = () => {
    if (!emailVerified) {
      return (
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={sendVerificationEmail}
          animation="pulse"
          iterationCount="infinite"
        >
          <Ionicons name="mail" size={20} color="#e74c3c" />
          <Text style={styles.buttonTextEmail}>Send Verification Email</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.verifiedButton}
          disabled
          animation="pulse"
          iterationCount="infinite"
        >
          <Ionicons name="mail-open" size={20} color="#2ecc71" />
          <Text style={styles.buttonTextEmail}>Email Verified</Text>
        </TouchableOpacity>
      );
    }
  };
  
  const renderElement = () => {
    if (!emailVerified) {
      return (
        <>
          <Text style={styles.warningToVerify}>You must verify your email before using app!!</Text>
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={sendVerificationEmail}
            animation="pulse"
            iterationCount="infinite"
          >
            <Ionicons name="mail" size={20} color="#e74c3c" />
            <Text style={styles.buttonTextEmail}>Send Verification Email</Text>
          </TouchableOpacity>
        </>
      );
    } else {
      return (
        <>
          <Text style={styles.welcomeText}>{welcomeMessage}</Text>
          <Animatable.View style={styles.blockContainer} animation="fadeInUp" delay={500}>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('ScreenFour')}
              style={[styles.buttonLarge, { backgroundColor: '#3498db' }]}
            >
              <Ionicons name="images" size={50} color="white" />
              <Text style={styles.buttonText}> - Image Repository - </Text>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View style={styles.blockContainer} animation="fadeInUp" delay={800}>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('ScreenFive')}
              style={[styles.buttonLarge, { backgroundColor: '#e74c3c' }]}
            >
              <FontAwesome name="music" size={50} color="white" />
              <Text style={styles.buttonText}> - Audio Repository - </Text>
            </TouchableOpacity>
          </Animatable.View>
        </>
      );
    } 
  }

  return (
    <View style={styles.container}>
      {renderElement()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  blockContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    justifyContent: 'center',
  },
  verifyButtonContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    width: '60%',
    justifyContent: 'center',
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  verifiedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    width: '60%',
    justifyContent: 'center',
    borderColor: '#2ecc71',
    borderWidth: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  buttonTextEmail: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  warningToVerify: {
    color: 'red',
    fontSize: 18,
    marginBottom: 10,
  },
});

export default MainScreen;
