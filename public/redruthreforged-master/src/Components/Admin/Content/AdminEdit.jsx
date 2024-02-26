import React, { useEffect }  from 'react'
import { MenuItem, Button, Select, Box, Typography, TableRow, TableContainer, Table, TableHead, TableCell, TableBody, TableSortLabel, responsiveFontSizes } from '@mui/material';
import axios from '../../../API/axios'
import ListenBox from '../../Listen/ListenBox';

function AdminEdit() {

    const [vis, setvis] = React.useState(false);
    const [audioURLList, setAudioUrlList] = React.useState(null)
    const [waitingText, setwaitingText] = React.useState("")
    const [collectionName, setCollectionName] = React.useState("")
    const [listOfUserCollections, setlistOfUserCollections] = React.useState([])
    const [listOfPrompts, setListOfPrompts] = React.useState([])
    const [promptName, setPromptName]= React.useState(null)

    
    const getColections = async() =>{
      let bob = await axios.get('/api/admin/getusercollections?user_id=12345')
      setlistOfUserCollections(bob.data)
    }

    const getPrompts = async(collName) =>{
      let collectionID = await axios.get('/api/admin/getCollectionId?collection_name='+collName)
      let promptNames = await axios.get('/api/admin/promptByCollection?collection_id='+collectionID.data[0].collection_id)
      setListOfPrompts(promptNames.data)
      setPromptName(promptNames.data[0].prompt)
    } 

    const getMutupleAudio = async() => {
      setwaitingText('Please wait while we get your recordings')
      setvis(false)
      if(promptName == null){
        setwaitingText("No prompt is selected")
        return
      }
      const prompt_id = await axios.get('/api/admin/getPromptId?prompt_name=' + promptName);
      //const prompt_id = '666' // HARD CODED FOR NOW
      //const pname = await axios.get('/api/admin/getPromptName?prompt_id=' + prompt_id)
      //console.log(pname.data[0].prompt)
      //setPromptName(pname.data[0].prompt)
      const response = await axios.get('/api/admin/getListOfFiles?prompt_id=' + prompt_id.data[0].prompt_id);
      if(response.data === ''){
        console.log('nothing In The Response This should never hapen')
      }
      else{
        let audioList = []
        for ( let i = 0; i < response.data.length; i++){
          const fileToAdd = await axios.get('/api/admin/getAudioFile?file_id=' + response.data[i].file_id);
          const audioBlob = new Blob([new Uint8Array(fileToAdd.data.Body.data)], { type: 'audio/wav' });
          audioList = [...audioList, {URL: URL.createObjectURL(audioBlob), file_id: response.data[i].file_id, name: response.data[i].name}]
          
        }
  
        setAudioUrlList(audioList)
      } 
      setvis(true)
    }
  
  useEffect(() =>{
    getColections()
  },[])

  async function handelCollectionChange(e){
    setCollectionName(e.target.value);
    getPrompts(e.target.value)
    setPromptName(null)


  }
  async function handelPromptChange(e){
    setPromptName(e.target.value)
  }

  const optionStyle = {
    display: "flex",
    paddingTop: 3,
    paddingBottom: 3,
  }
       
    return (
  
      <>
      <Typography variant='h4'>Listen</Typography>
      <br />

      <table>
        <tr>
          <td>
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
          </td>

          <td>
            {listOfPrompts != null &&
            <Box sx={{width: "400px"}}>
              <Typography>{'Prompt'}</Typography>
              <Select sx={{width: '100%', maxWidth: '400px', minWidth: '80px'}}
              value={promptName}
              label="Prompt"
              onChange={handelPromptChange}>
                  {listOfPrompts.map((prompts) => {
                      return (
                          <MenuItem value={prompts.prompt}>{prompts.prompt}</MenuItem>
                      )
                  })}
              
              </Select>
            </Box>
            }
            </td>
        <Button variant="contained" onClick={getMutupleAudio} sx={{marginTop: 3, marginLeft:3, backgroundColor: '#323f54'}}>Get Recordings</Button>
      </tr>
      </table>

      <br /><br />
      <Typography variant='h4'>Recordings</Typography>
      <br />

      {vis == true && audioURLList.length == 0 && waitingText == 'Please wait while we get your data' &&
      <text> There are no audios in this prompt</text> }
      {vis == true && audioURLList.length != 0 &&
        <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Prompt</TableCell>
            <TableCell>Recording</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
          audioURLList.map((individualAudio) =>{
            return(
              <TableRow>
                <ListenBox data = {individualAudio} prompt = {promptName}></ListenBox>
              </TableRow>        
            )
          })}
        </TableBody>
        </Table>
        }
        {vis == false && <text>{waitingText}</text>}

      </>
    )
  }
export default AdminEdit