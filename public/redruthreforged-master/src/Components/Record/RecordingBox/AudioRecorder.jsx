import { useState, useRef, /*useEffect*/} from "react";
import './Form.css';
import { Typography } from '@mui/material';
/*import AWS from 'aws-sdk'
import ReactS3 from 'react-s3';

import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";
*/

import disabledMic from "../../../images/disabledMic.png";
import neutralMic from "../../../images/neutralMic.png";
import recordingMic from "../../../images/recordingMic.png";
import axios from '../../../API/axios';
//const mimeType = "audio/webm";

const AudioRecorder = (props) => {
	const [permission, setPermission] = useState(false);
	const mediaRecorder = useRef(null);
	const [recordingStatus, setRecordingStatus] = useState("inactive");
	const [stream, setStream] = useState(null);
	const [audio, setAudio] = useState(null);
	const [audioChunks, setAudioChunks] = useState([]);
	const [audioMime, setAudioMime] = useState(null);

	//form related
	const [title, setTitle] = useState("");
	const [userName, setName] = useState("");
	const [phoneNum, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const promptId = props.prompt_id;
	let timer = null;

	
	const getMicrophonePermission = async () => {
		if ("MediaRecorder" in window) {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					audio: true,
					video: false,
				});
				setPermission(true);
				setStream(mediaStream);
			} catch (err) {
				alert(err.message);
			}
		} else {
			alert("The MediaRecorder API is not supported in your browser.");
		}
	};

	const startRecording = async () => {
		setRecordingStatus("recording");
		timer =  Date.now();

		const media = new MediaRecorder(stream, { type: 'audio/wav' });

		mediaRecorder.current = media;

		mediaRecorder.current.start();

		let localAudioChunks = [];

		mediaRecorder.current.ondataavailable = (event) => {
			if (typeof event.data === "undefined") return;
			if (event.data.size === 0) return;
			console.log ('data\n')
			console.log (event.data.text())
			localAudioChunks.push(event.data);
			
		};


		setAudioChunks(localAudioChunks);
	};

	const stopRecording = () => {
		setRecordingStatus("inactive");
		mediaRecorder.current.stop();
		timer =  timer - Date.now();

		mediaRecorder.current.onstop = () => {
			// save audio to url so it can be played back before submission
			console.log("AUDIO CUNKS")
			console.log(audioChunks)
			console.log(typeof(audioChunks))

			const audioMime = new Blob(audioChunks, { type: 'mimeType' });
			console.log(audioMime)

			const audioUrl = URL.createObjectURL(audioMime);
			setAudioMime(audioUrl);
			console.log(audioUrl)
			
			// save audio in correct wav format or s3 bucket upload
			const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
			//const audioUrl = URL.createObjectURL(audioBlob);

			setAudio(audioBlob);
			setAudioChunks([]);
		};
	};


	const uploadAudio = async () => {
		if(!alert('Your submission has been sent!'))
		{
			setTimeout(() => {
				window.location.reload();
			  }, 1000);
		}

		try {
		  const formData = new FormData();
		  formData.append('audio', audio, 'submission.wav');
		  //formData.append('userName', 'test name'/*userName*/);

		  console.log(audio);
		  
	
		  const response = await axios.post('/api/upload', formData, {
			headers: {
			  'Content-Type': 'multipart/form-data'
			},
			params:{
				'userName': userName,
				//'timestamp': timer ///doesnt work rn :(
				'promptId': promptId,
				'title': title,
				'phoneNum': phoneNum,
				'email': email
			}
		  });
	
		  console.log('File uploaded successfully:', response.data);
		
		} catch (error) {
		  console.error('Error uploading file:', error);
		}
		
		
	};

	function MouseOver(event) {
        event.target.style.background = '#6b86b3';
    }
	function MouseOut(event){
		event.target.style.background='#323f54';
	}

	return (
		<>		

		<div>
			<main>
				
				<div className="audio-controls" style={{textAlign: 'center', marginTop: '5rem' }}>
					{!permission ? (
						<img  onClick={getMicrophonePermission} style={{height: 150, }} src={disabledMic} alt="record button, get permission"/>
					) : null}
					{permission && recordingStatus === "inactive" ? (
						<img  onClick={startRecording} style={{height: 150, }} src={neutralMic} alt="record button, inactive"/>
					) : null}
					{recordingStatus === "recording" ? (
						<img  onClick={stopRecording} style={{height: 150, }} src={recordingMic} alt="record button, active"/>
					) : null}
				<br></br><br></br><br></br><br></br>
				<Typography sx={{fontSize: 12}} align='center'>Note: Tap the icon above to activate your device's microphone. <br></br>
																																When the icon turns red, your device's microphone is enabled, and when it turns green, it indicates that the microphone is actively recording. <br></br>
																																Press the icon once more to stop recording. To initiate a new recording, tap the red microphone icon.<br></br></Typography>
									
				</div>
				{audio ? (
					<div className="audio-player" style={{textAlign: 'center', marginTop: '3rem', marginBottom: '5rem' }}>
						<audio src={audioMime} controls></audio>
						<br></br>
						<a download href={audioMime} style={{color: '#323f54', textDecoration: 'none', fontSize: 12}}>
							Download Recording
						</a>
						<br></br>
						<br></br>
						<div className="form-box">
							<form >
								
								<label><h2>Submission Details</h2></label>
								<br></br>
								<input placeholder="Title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}/>
								
								<br></br>
								<input placeholder="Jane Doe" type="text" value={userName} onChange={(e) => setName(e.target.value)}/>
								
								<br></br>

								<input placeholder="(xxx)-xxx-xxxx" type="text" value={phoneNum} onChange={(e) => setPhone(e.target.value)}/>
								
								<br></br>

								<input placeholder="Jane_Doe@email.org" type="text" value={email} onChange={(e) => setEmail(e.target.value)}/>
								
							</form>

							<br></br>
							<button onClick={uploadAudio} onMouseOver={MouseOver} onMouseOut={MouseOut} style={{marginTop: '3rem', background:'#323f54', color: '#faf9f6', fontSize: 30, borderRadius: 5, padding: 20, paddingLeft:40, paddingRight:40}}>SUBMIT</button>	

						</div>

						
					</div>
				) : null}
				
			</main>
		</div>
		</>
	);
};
//<button onClick={uploadAudio} style={{marginTop: '3rem', background:'#323f54', color: '#faf9f6', fontSize: 20, borderRadius: 5, padding: 10, paddingLeft:20, paddingRight:20 }}>SUBMIT</button>
export default AudioRecorder;