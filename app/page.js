'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Button, Input, Typography } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

import { collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc, getDoc, setDoc, newDocRef, onSnapshot, storage } from "firebase/firestore"; 
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

import { db } from './firebase';

import {Camera} from "react-camera-pro";
import Navbar from './components/Navbar';
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';

import OpenAI from 'openai';
import Link from 'next/link';
import Recipes from './recipes/page';
import { useRouter } from 'next/navigation';
import FullScreenDialog from './components/Modal';
import CircularWithValueLabel from './components/Loading';




export default function Home() {


  // { id: ..., name: ..., quantity: ...}
  const [items, setItems] = useState([]);
  const [item, setItem] = useState('');
  const [isModal, setIsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

  const [backgroundCover, setBackgroundCover] = useState(false)

  // --------------------- Added from Navbar.js (Taking a photo from a webcam): -------------------------------------------------
  
  const [isCameraOpen, setIsCameraOpen] = useState(false); // State to control camera visibility
  const [photos, setPhotos] = useState([]);
  const [isSwitch, setIsSwitch] = useState(false);

  const [recipes, setRecipes] = useState("");
  const cameraRef = useRef(null);

  const openCamera = () => {
      setIsCameraOpen(true);
      setBackgroundCover(true);
      setIsSwitch(true);
    };


  async function processImage(image_url) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/processImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Here is the data: ', data['labels'][0]);
      const topLabel = data['labels'][0];
      addItemHandler(topLabel);

    } catch (error) {
      console.log("Error processing image: ", error);
    }
    setIsLoading(false);
  }

  async function recipeGenerator(){
    setIsLoading(true)
    try {
      //console.log("Here is the key: ", process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
      const ingredients = [];
      items.forEach((element) => {
        ingredients.push(element.name)
      })
      ingredients.forEach((element) => {
        console.log(element)
      })
      console.log(ingredients.join(', '))
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [
          {"role": "user", "content": `Give recipes for delicious foods that can be made from the following items: ${ingredients.join(', ')}`},
        ],
      })
      });
      const data = await response.json();
      const generatedRecipes = data['choices'][0]['message']['content'];
      console.log('Here is the data: ', data['choices'][0]['message']['content']);
      //console.log(data);
      setRecipes(generatedRecipes);
      setIsLoading(false);
      setIsModal(true)


    } catch (error) {
      alert("Error generating recipes! Try again!");
    }
    
  }
  
  
  const takePhoto = () => {
      const photo = cameraRef.current.takePhoto();
      setPhotos([...photos, photo]);
      setIsCameraOpen(false); // Optional: close camera after taking photo
      setBackgroundCover(false);

      const photoBlob = base64ToBlob(photo, 'image/jpeg');
      console.log("Here is the Blob URL: " , {photoBlob});

      // Generate a unique filename
      const photoName = `photo_${Date.now()}.jpg`;

      const storage = getStorage();
      const storageRef = ref(storage, 'image/' + photoName);
      
      // Upload the Blob to Firebase Storage
      uploadBytes(storageRef, photoBlob)
      .then(async (snapshot) => {
        const url = await getDownloadURL(ref(storage, 'image/' + photoName));
        console.log('Download URL:', url);
        // Further processing with the URL, like sending it to OpenAI's API
        processImage(url)
        //quickstart(url);
      })
      .catch((error) => {
        console.error('Error uploading the blob: ', error);
      });



    };
    

  function switchCameraHandler(){
      cameraRef.current.switchCamera();
  }

  // -----------------------------------------------------------------------------------------------------------------
  
  // --------------------------- Adding, reading, and deleting data through Google Firebase ------------------------
  
  function itemInputHandler (event) {
    setItem(event.target.value)
  }

  // Add Data
  
  async function addItemHandler(item) {
    if (item) {
      const itemRef = collection(db, "Items List");
      const q = query(itemRef, where("Name", "==", item));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Item found, increment quantity
        querySnapshot.forEach(async (docSnapshot) => {
          const docRef = doc(db, "Items List", docSnapshot.id);
          await updateDoc(docRef, {
            Quantity: docSnapshot.data().Quantity + 1
          });
        });
      
      } else {
        // Item not found, create new document
        await addDoc(itemRef, {
          Name: item,
          Quantity: 1,
          Timestamp: Date.now()
        });
        
      }
      setItem(''); // Clear the input
    } else {
      alert("Please enter an item to add to the pantry!");
    }
  }

  // Read (Fetch) Data

  useEffect(() => {
    const q = query(collection(db, 'Items List'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsArray = [];
      querySnapshot.forEach((doc) => {
        itemsArray.push({
          id: doc.id,
          name: doc.data().Name,
          quantity: doc.data().Quantity,
          timestamp: doc.data().Timestamp // Fetch timestamp
        });
      });
      // Sort items by timestamp in descending order
      itemsArray.sort((a, b) => b.timestamp - a.timestamp);
      // Update the state with sorted items
      setItems(itemsArray);
    });
  
    return () => unsubscribe();
  }, []);
  
  

  // Delete Data

  async function removeItemHandler(id){
    await deleteDoc(doc(db, "Items List", id))
 
  }


  async function increaseQuantity(itemName) {
    const itemRef = collection(db, "Items List");
    const q = query(itemRef, where("Name", "==", itemName));
    const querySnapshot = await getDocs(q);

    if(!querySnapshot.empty) {
      querySnapshot.forEach(async (docSnapshot) => {
        const docRef = doc(db, "Items List", docSnapshot.id);
        await updateDoc(docRef, {
          Quantity: docSnapshot.data().Quantity + 1
        });
      });

    }

  }

  
  async function decreaseQuantity(itemName) {
    const itemRef = collection(db, "Items List");
    const q = query(itemRef, where("Name", "==", itemName));
    const querySnapshot = await getDocs(q);

    if(!querySnapshot.empty) {
      querySnapshot.forEach(async (docSnapshot) => {
        const docRef = doc(db, "Items List", docSnapshot.id);
        await updateDoc(docRef, {
          Quantity: docSnapshot.data().Quantity - 1
        });
      });

    }
  }

  // -------------------------------- Converting and uploading pictures, taken from camera, to google firebase cloud storage ---------------------------------------

  function base64ToBlob(base64, contentType) {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, { type: contentType });
  }
  const handleClose = () => setIsModal(false);
  

// ------------------------------------------------------------------------------------------------------------------
  if (isLoading) {
    return ( <Box 
    height={'100vh'}
    bgcolor={'#ADD8E6'} 
    display={'flex'} 
    flexDirection={'column'}
    justifyContent={'center'}
    alignItems={'center'}><CircularWithValueLabel /></Box> 
    )
  }

 else {
  return (
    <Box bgcolor={'#ADD8E6'}>
      
      <Navbar />
      <Box>
        <Box style={{ display: backgroundCover ? 'none' : 'block'}} /*marginTop={'50px'}*/ marginTop={'4%'} height={'0px'}>
        <Typography textAlign={'center'} variant={'h4'}>Welcome to StoreSmart AI!</Typography>
        <Box /*marginTop='5px'*/ marginTop='3%'>
          <Typography textAlign={'center'} variant='h6'>You can also enter items by taking pictures! Try new recipes suggested by our 'AI Chef'!</Typography>
        </Box>
      </Box>
      
    <Box  component="section" 
      height={'100vh'}
      width={'100vw'}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      //style={{
      //  backgroundImage: `url('/Inventory-bg.jpg')`,
      //  backgroundSize: 'cover', // or 'contain' depending on your need
      //  backgroundPosition: 'center',
      //  backgroundRepeat: 'no-repeat'
      //}}
      //bgcolor={'white'}
      bgcolor={'#ADD8E6'} 
     >
      <Box /*marginTop={'50px'}*/ marginTop={'4%'} /*width='1000px'*/ width={'69%'} /*height='150px'*/ height={'20%'} bgcolor={'#ADD8E6'} border={'1px solid grey'}>
        <Typography 
          variant={'h2'}
          textAlign={'center'}
          color={'#333'}>
          Inventory Items
        </Typography >
        <Box display={'flex'} alignItems={'center'} justifyContent={'center'} /*gap={'50px'}*/ gap={'5%'}  /*marginTop={'20px'}*/ marginTop={'3%'}>
          <Input value={item} onChange={itemInputHandler} placeholder='Add Item'></Input>
          <Button onClick={() => addItemHandler(item)} variant="contained">Add</Button></Box>
        </Box>
        <Stack border={'1px solid grey'} /*width='1000px'*/ width={'69%'}  /*height={'300px'}*/ height={'35%'} overflow={'auto'} >
        {items.map((item) => (
          <Box component="section" 
            key={item.id}
            /*height={'100px'}*/
            height={'50%'}
            width={'100%'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            /*gap={'100px'}*/
            gap={'10%'}
            //bgcolor={'#f0f0f0'}
            bgcolor={'#ADD8E6'}
            sx={{ borderBottom: 1,
                  borderBottomColor: 'grey'}} >
              <Typography
              variant={'h6'}
              textAlign={'center'}
              color={'#333'}
              width={'33%'}
              >
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>{item.name}</Box>
              </Typography>
              
              <Typography>
              <Box /*height={'100px'}*/ height={'100px'} display={'flex'} /*gap={'40px'}*/ gap={'40px'} alignItems={'center'} justifyContent={'center'}>  
              Quantity: {item.quantity}
              <Button variant='contained' onClick={() => increaseQuantity(item.name)} >+</Button>
              <Button variant='contained' onClick={() => decreaseQuantity(item.name)} disabled={item.quantity === 0}>-</Button>
              </Box>
              </Typography>
              
              <Box ><Button variant='contained' key={item.id} onClick={() => removeItemHandler(item.id)} >Remove Item</Button></Box>
          </Box>
          
        ))}
      </Stack>
      <Box /*marginTop={'30px'}*/ marginTop={'2%'}>
      {!isCameraOpen && 
        <Box display={'flex'} /*gap={'50px'}*/ gap={'50px'}>
          <Button onClick={openCamera} variant='outlined'>
            Take Photo <CameraEnhanceIcon />
          </Button>
          <Button onClick={recipeGenerator} variant='outlined'>AI Chef <OutdoorGrillIcon /></Button>
          <Button variant='outlined' onClick={() => setIsModal(true)} >Display Recipes</Button>
        </Box>
      }
      {isCameraOpen && (
        <Box display={'flex'} /*gap={'50px'}*/ gap={'50px'}>
          <Camera ref={cameraRef} facingMode='environment' />
          <Button variant='contained' onClick={takePhoto}>Take Photo</Button>
          {isSwitch && <Button variant='contained' onClick={switchCameraHandler}>Switch Camera</Button>}
        </Box>
      )}
      <FullScreenDialog open={isModal} onClose={handleClose} recipes={recipes} />
      
      </Box>
      
    </Box>
    
    </Box>
    </Box>

      
      
  );
 }
}
