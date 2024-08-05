import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog({ open, onClose, recipes }) {
    const recipeLines = recipes.split('\n');
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography textAlign={'center'} sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Suggested Recipes
          </Typography>
        </Toolbar>
      </AppBar>
      <List>
        <Divider />
        {recipeLines.map((line, index) => (
            <Typography marginLeft={'1%'} key={index} variant="body1" style={{ whiteSpace: 'pre-line', marginBottom: '10px' }}>
                {line}
            </Typography>
        ))}
      </List>
    </Dialog>
  );
}


