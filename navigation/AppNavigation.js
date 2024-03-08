import { Platform, TouchableOpacity, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import RegistrationScreen from '../screens/RegistrationScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import MainScreen from '../screens/MainScreen';
import PictureScreen from '../screens/PictureScreen';
import AudioScreen from '../screens/AudioScreen';
import { auth } from '../firebaseConfig';


const Stack = createNativeStackNavigator();

const handleLogout = (navigation) => {
  if (auth.currentUser) {
    auth.signOut()
      .then(() => {
        alert("User signed out successfully");
        navigation.navigate('ScreenOne', { key: Math.random().toString() });
      })
      .catch((error) => {
        alert("Sign out error: " + error.message);
      });
  }
}

function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="ScreenOne"
                headerMode="screen"
                screenOptions={{
                    headerTintColor: Platform.OS === 'android' ? 'white' : 'blue',
                    headerStyle: {
                        backgroundColor: Platform.OS === 'android' ? 'gray' : ''
                    }
                }}
            >
                <Stack.Screen
                    name="ScreenOne"
                    component={WelcomeScreen}
                    options={{
                        title: 'Media Follow',
                        headerTitleStyle: {
                            fontSize: 24,
                        },
                        statusBarColor: '#fff'
                    }}
                />
                <Stack.Screen
                    name="ScreenTwo"
                    component={MainScreen}

					options={({ navigation }) => ({
						title: 'App',
						headerLeft: null,
						headerRight: () => (
							<TouchableOpacity
								style={{ marginRight: 10 }}
								onPress={() => handleLogout(navigation)}
							>
								<Text style={{ color: 'red', fontSize: 20 }}>Log out</Text>
							</TouchableOpacity>
						)
					})}
                />
                <Stack.Screen
                    name="ScreenThree"
                    component={RegistrationScreen}
                    options={{
                        title: 'Registration Page',
                    }}
                />
                <Stack.Screen
                    name="ScreenFour"
                    component={PictureScreen}
                    options={{
                        title: 'Picture Repository',
                    }}
                />
                <Stack.Screen
                    name="ScreenFive"
                    component={AudioScreen}
                    options={{
                        title: 'Audio Repository',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default AppNavigator;