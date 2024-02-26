import axios from "axios";

export default axios.create({
    // local machine
    // baseURL: 'http://localhost:8000'
    
    // prod
    baseURL: 'https://redruthreforged-server-master.onrender.com'
});
