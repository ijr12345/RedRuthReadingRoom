import { useState, useRef, /*useEffect*/} from "react";
/*import AWS from 'aws-sdk'
import ReactS3 from 'react-s3';

import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";
*/

import disabledMic from "../../../images/disabledMic.png";
import neutralMic from "../../../images/neutralMic.png";
import recordingMic from "../../../images/recordingMic.png";
import axios from '../../../API/axios';
//const mimeType = "audio/webm";

const AudioRecorder = () => {
	const [permission, setPermission] = useState(false);
	const mediaRecorder = useRef(null);
	const [recordingStatus, setRecordingStatus] = useState("inactive");
	const [stream, setStream] = useState(null);
	const [audio, setAudio] = useState(null);
	const [audioChunks, setAudioChunks] = useState([]);
	const [audioMime, setAudioMime] = useState(null);

	//form related
	const [userName, setName] = useState("");
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
				//'timer': timer ///HERE, doesnt work rn :(
				//prompt id
				//title
				//time duration
			}
		  });

	
		  console.log('File uploaded successfully:', response.data);
		} catch (error) {
		  console.error('Error uploading file:', error);
		}
	};

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
				</div>
				{audio ? (
					<div className="audio-player" style={{textAlign: 'center', marginTop: '3rem' }}>
						<audio src={audioMime} controls></audio>
						<br></br>
						<a download href={audioMime} style={{color: '#323f54', textDecoration: 'none', fontSize: 12}}>
							Download Recording
						</a>
						<br></br>

						<form>
							<label>Enter your full name:
								<input 
									type="text" 
									value={userName}
									onChange={(e) => setName(e.target.value)}
									/>
							</label>
						</form>

						<text>{userName}</text>
						<br></br>
        				<button onClick={uploadAudio} style={{marginTop: '3rem', background:'#323f54', color: '#faf9f6', fontSize: 20, borderRadius: 5, padding: 10, paddingLeft:20, paddingRight:20 }}>SUBMIT</button>	

					</div>
				) : null}
			</main>
		</div>
		</>
	);
};
//<button onClick={uploadAudio} style={{marginTop: '3rem', background:'#323f54', color: '#faf9f6', fontSize: 20, borderRadius: 5, padding: 10, paddingLeft:20, paddingRight:20 }}>SUBMIT</button>
export default AudioRecorder;