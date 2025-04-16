import axios from "axios";


const api = axios.create({
    baseURL: "https://quickchart.io/"
});

export default api;