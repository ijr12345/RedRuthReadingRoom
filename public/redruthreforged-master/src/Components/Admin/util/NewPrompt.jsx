import React, { useState, useEffect } from 'react'
import { Box, Select, MenuItem, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Modal, TextField } from '@mui/material'
import axios from '../../../API/axios';


// This component returns a button that handles new collection creation.
// Returns a button and associated modal (controlled by button)

function CreatePromptButton() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [p_name, setp_name] = useState("");
    const [p_description, setp_description] = useState("");
    const [listOfUserCollections, setlistOfUserCollections] = React.useState([])
    const [collectionName, setCollectionName] = React.useState("")
    const [collectionID, setCollectionID] = React.useState(0)


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
        console.log("here poooooo");
        const response = axios.post('/api/admin/createprompt/', {
            cID: collectionID,
            pName: p_name,
            pDescription: p_description
          });

        setOpen(false)
        // window.location.reload()
    }

    // const getCollectionID = async() => {
    //     setCollectionID(await axios.get('/api/admin/getCollectionId?collection_name='+collectionName));
        
    // }

    async function handelCollectionChange(e){
        setCollectionName(e.target.value);
        var tempID = await axios.get('/api/admin/getCollectionId?collection_name='+e.target.value);
        setCollectionID(tempID.data[0].collection_id);
      }

    const getColections = async() =>{
    let bob = await axios.get('/api/admin/getusercollections?user_id=12345')
    setlistOfUserCollections(bob.data)
    }

    useEffect(() =>{
        getColections()
      },[])

    return (
        <React.Fragment>
            <Button variant="contained" onClick={handleOpen} sx={{backgroundColor: '#323f54'}}>New Prompt</Button>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <form onSubmit={handleSubmit}> 
                        <Typography variant='h5'>
                            Create A New Prompt
                        </Typography>

                        <br />
                        <Box sx={{width: "400px", paddingRight: 3}}>
                            <Typography>{'Collection'}</Typography>
                            <Select sx={{width: '100%', maxWidth: '400px', minWidth: '80px'}}
                            value={collectionName}
                            label="Collection"
                            onChange={handelCollectionChange}>
                                {listOfUserCollections.map((collectoins) => {
                                    return (
                                        <MenuItem value={collectoins.title}>{collectoins.title}</MenuItem>
                                    )
                                })}
                            </Select>
                        </Box>


                        <TextField
                            required
                            id="standard-search"
                            label="Prompt Name"
                            variant="standard"
                            value={p_name}
                            onChange={(e) => setp_name(e.target.value)}
                        />
                        <br /> <br />
                        <TextField
                            required
                            id="standard-search"
                            label="Prompt Description"
                            variant="standard"
                            value={p_description}
                            onChange={(e) => setp_description(e.target.value)}
                        />
                        <br />
                        <input type="submit" value={'Create'} style={{marginTop: '3rem', background:'#323f54', color: '#faf9f6', fontSize: 20, borderRadius: 5, padding: 10, paddingLeft:20, paddingRight:20 }}/>
                    </form>
                </Box>
            </Modal>
        </React.Fragment>
    )
}

export default CreatePromptButton