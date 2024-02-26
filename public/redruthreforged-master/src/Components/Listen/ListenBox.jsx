import React from 'react'
import axios from '../../API/axios'
import {Button, IconButton} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';



function ListenBox(params){  
    const [vis, setVis] = React.useState(true)
    
    let name = params.data.name
    if(name == null){
       name = "No Name"
    }
    async function Deleate(){
        setVis(false)
        await axios.get('/api/admin/RemoveAudio?file_id=' + params.data.file_id)
    }
    return(
        <>
            {vis == true && <>
            <td>{name}</td>
            <td>{params.prompt}</td>
            <td>
            <audio src={params.data.URL} type='audio/mpeg' controls></audio> 
            </td>
            <td>            
            <IconButton aria-label="delete" onClick={Deleate} sx={{marginLeft: 2, color: 'red'}}>
                <DeleteIcon />
            </IconButton>
            </td>
            </>    }
            </>
    )
}

export default ListenBox