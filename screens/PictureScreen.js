import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { firestore, auth } from '../firebaseConfig';
import { onSnapshot, collection, deleteDoc, addDoc, doc, where, query } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as MailComposer from 'expo-mail-composer';

const PictureScreen = () => {
  const [images, setImages] = useState([]);
  const [sortBy, setSortBy] = useState('date'); // Default sorting by date
  const currentUser = auth.currentUser;

  // Request permission to access camera and albums
  const verifyPermissions = async () => {
    const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
    const libraryResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraResult.status !== 'granted' && libraryResult.status !== 'granted') {
      Alert.alert('Grant Permissions first to use the app', [{ text: 'OK' }]);
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(firestore, 'images'), where('userId', '==', currentUser.uid)),
      (snapshot) => {
        const imagesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
        // Sort images based on sortBy state
        if (sortBy === 'date') {
          sortImagesByDate(imagesData);
        } else {
          sortImagesByName(imagesData);
        }
      }
    );
  
    return () => unsubscribe();
  }, [currentUser, sortBy]);
  
  // Function to sort images by date
  const sortImagesByDate = (imagesData) => {
    const sorted = [...imagesData].sort((a, b) => new Date(b.date) - new Date(a.date));
    setImages(sorted);
  };

  // Function to sort images by name
  const sortImagesByName = (imagesData) => {
    const sorted = [...imagesData].sort((a, b) => {
      // Check if both images have a name property
      if (a.name && b.name) {
        return a.name.localeCompare(b.name);
      } else {
        // If one of the images doesn't have a name property, consider it greater
        return a.name ? -1 : 1;
      }
    });
    setImages(sorted);
  };

  // Handle delete image
  const handleDeleteImage = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'images', id));
      setImages((prevImages) => prevImages.filter((image) => image.id !== id));
    } catch (error) {
      console.error('Error deleting image', error);
      Alert.alert('Error', 'Sorry! Failed to delete the image!');
    }
  };

  // Select picture from album
  const handlePickImage = async () => {
    const hasPermission = await verifyPermissions();

    if (hasPermission) {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.5,
        });

        if (!result.canceled) {
          const imageRef = await addDoc(collection(firestore, 'images'), {
            imageUrl: result.assets[0].uri,
            userId: currentUser.uid,
          });
        }
      } catch (error) {
        console.error('Error picking image!', error);
        Alert.alert('Error', 'Failed to pick image!');
      }
    }
  };

  // Get pictures from camera
  const handleTakePicture = async () => {
    const hasPermission = await verifyPermissions();

    if (hasPermission) {
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.5,
        });

        if (!result.canceled) {
          const imageRef = await addDoc(collection(firestore, 'images'), {
            imageUrl: result.assets[0].uri,
            userId: currentUser.uid,
          });
        }
      } catch (error) {
        console.error('Error taking picture', error);
        Alert.alert('Error', 'Failed to take picture!');
      }
    }
  };

  // Share the image using email
  const sendMessageWithMail = async (imageUrl) => {
    const isAvailable = await MailComposer.isAvailableAsync();

    if (isAvailable) {
      var options = {
        subject: 'Check out this image!',
        body: `I wanted to share this image with you.`,
        attachments: [imageUrl],
      };

      MailComposer.composeAsync(options)
        .then((result) => {
          console.log(result.status);
          Alert.alert('Email Sent', 'The Image has been sent successfully.');
        })
        .catch((error) => {
          console.error('Error sending email', error);
          Alert.alert('Error', 'Failed to send email');
        });
    } else {
      Alert.alert('Email is not available');
    }
  };

  // Handle image option to take action on image
  const handleImageOptions = (id, imageUrl) => {
    Alert.alert(
      'Confirmation',
      'What do you plan to do with the image?',
      [
        {
          text: 'Share Via Email',
          onPress: async () => {
            sendMessageWithMail(imageUrl);
          },
        },

        {
          text: 'Delete',
          onPress: async () => {
            handleDeleteImage(id);
            Alert.alert('Image Delete', 'Image Deleted successfully!');
          },
        },

        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  };

  // Render the pressable image
  const renderItem = ({ item }) => (
    <View style={stylePictures.pictureItem}>
      <TouchableOpacity onPress={() => handleImageOptions(item.id, item.imageUrl)}>
        <Image source={{ uri: item.imageUrl }} style={stylePictures.imageThumbnail} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={stylePictures.container}>
      <View style={stylePictures.sortOptions}>
        <TouchableOpacity onPress={() => setSortBy('date')} style={[stylePictures.sortButton, sortBy === 'date' && stylePictures.activeSortButton]}>
          <Text style={stylePictures.sortButtonText}>Sort by Date</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSortBy('name')} style={[stylePictures.sortButton, sortBy === 'name' && stylePictures.activeSortButton]}>
          <Text style={stylePictures.sortButtonText}>Sort by Name</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handlePickImage} style={stylePictures.button}>
        <Text style={stylePictures.buttonText}>Pick Image</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleTakePicture} style={stylePictures.button}>
        <Text style={stylePictures.buttonText}>Take Picture</Text>
      </TouchableOpacity>
      {images.length === 0 ? (
        <Text>No images available.</Text>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
        />
      )}
    </View>
  );
};

const stylePictures = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF', // Replace with your desired background color
  },
  button: {
    backgroundColor: '#3498db', // Replace with your desired button color
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff', 
    fontSize: 16,
  },
  imageThumbnail: {
    width: 150,
    height: 150,
    margin: 5,
    borderRadius: 5,
  },
  flatListContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pictureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sortOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  sortButton: {
    backgroundColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeSortButton: {
    backgroundColor: '#3498db',
  },
  sortButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PictureScreen;


