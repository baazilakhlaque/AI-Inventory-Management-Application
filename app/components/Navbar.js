import React from 'react'
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import {Camera} from "react-camera-pro";
import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Button } from '@mui/material';

const Navbar = () => {
  
    return (
    <Box sx={{ borderBottom: 4,
        borderBottomColor: '#ADD8E6'}}  display={'flex'} justifyContent={'space-between'}>
        <Box marginTop={'10px'} marginLeft={'20px'}>
            <Typography sx={{ fontStyle: 'italic' }}  variant='h6'>StoreSmart AI</Typography>
        </Box>
       
    </Box>
  )
}

export default Navbar