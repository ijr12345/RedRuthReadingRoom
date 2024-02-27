import React, { useState } from 'react'
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Modal, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import axios from '../../../API/axios';

// This component returns a button that handles new collection creation.
// Returns a button and associated modal (controlled by button)

function CreateCollectionButton() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [c_name, setC_Name] = useState("");
    const [c_description, setC_Description] = useState("");

    // Styling
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'white',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const response = axios.post('/api/admin/createcollection/', {
            cName: c_name,
            cDescription: c_description
          });

        setOpen(false)
        window.location.reload()
    }

    return (
        <React.Fragment>
            <Button variant="contained" onClick={handleOpen} sx={{backgroundColor: '#323f54'}}>New Collection</Button>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <form onSubmit={handleSubmit}> 
                        <Typography variant='h5'>
                            Create A New Collection
                        </Typography>
                        <TextField
                            required
                            id="standard-search"
                            label="Collection Name"
                            variant="standard"
                            value={c_name}
                            onChange={(e) => setC_Name(e.target.value)}
                        />
                        <br /> <br />
                        <TextField
                            required
                            id="standard-search"
                            label="Collection Description"
                            variant="standard"
                            value={c_description}
                            onChange={(e) => setC_Description(e.target.value)}
                        />
                        <br />
                        <input type="submit" value={'Create'} style={{marginTop: '3rem', background:'#323f54', color: '#faf9f6', fontSize: 20, borderRadius: 5, padding: 10, paddingLeft:20, paddingRight:20 }}/>
                    </form>
                </Box>
            </Modal>
        </React.Fragment>
    )
}

export default CreateCollectionButton