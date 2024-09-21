import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import "./card.css";
import {jwtDecode} from "jwt-decode";
import { toast } from 'react-toastify';

const Arrivals = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [videoUrl, setVideoUrl] = useState(""); // URL from MongoDB
    const [isUploaded, setIsUploaded] = useState(false); // Flag to track video upload

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/product`);
                setProducts(response.data);
            } catch (error) {
                setError("Failed to fetch products. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    /* Video Testimonial */
    const [videoFile, setVideoFile] = useState(null); // Selected video file from gallery
    const [video, setVideo] = useState(null); // Recorded or selected video file for uploading
    const [recordedVideoURL, setRecordedVideoURL] = useState(null); // URL of recorded video for preview
    const [isRecording, setIsRecording] = useState(false); // Recording state
    const mediaRecorderRef = useRef(null);
    const videoRef = useRef(null);

    // Handle selecting a video from the gallery
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(URL.createObjectURL(file));
            setVideo(file); // Set video file for upload
        }
    };

    // Handle recording video
    const startRecording = async () => {
        setIsRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoRef.current.srcObject = stream;

        mediaRecorderRef.current = new MediaRecorder(stream);
        let chunks = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            chunks.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            setRecordedVideoURL(URL.createObjectURL(blob));
            setVideo(blob); // Set recorded video for uploading
            chunks = [];
            stream.getTracks().forEach(track => track.stop()); // Stop the camera
        };

        mediaRecorderRef.current.start();
    };

    // Handle stopping recording
    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    // Handle uploading the video (either selected or recorded)
    const handleUpload = async (e) => {
        const data = new FormData();
        data.append("file", video); // Use the recorded or selected video
        data.append("upload_preset", "adeelrana");
        data.append("cloud_name", "dr3ie9gpz");

        try {
            const res = await axios.post("https://api.cloudinary.com/v1_1/dr3ie9gpz/video/upload", data);
            console.log(res.data,'here is response from cloudinary')
            const videoUrl = res.data.url;

            const token = localStorage.getItem("userToken") || "Login To Get User";
            const decoded = (token === "Login To Get User") ? null : jwtDecode(token);
            const userId = decoded?.tokenId || "Login To Get User";

            // Now send the video URL to your backend
            const backendResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/add-video`, {
                url: videoUrl, // Sending the video URL to the backend
                user: userId
            });
console.log(backendResponse.data,'here is Data Received')
            setVideoUrl(backendResponse.data.url); // Set the uploaded video URL from MongoDB
            setIsUploaded(true); // Set upload flag to true
            setRecordedVideoURL(null); // Clear recorded video
            setVideoFile(null); // Clear selected video
            toast.success("Video Uploaded Successfully!");
        } catch (error) {
            console.error('Error uploading video:', error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <h1 className="home_heading text-center mb-5">NEW ARRIVALS</h1>
                </div>
            </div>
            <div className="row row-cols-lg-4 row-cols-md-3 row-cols-sm-2 row-cols-2">
                {isLoading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    products?.map((item, index) => (
                        <div className="col card" key={index}>
                            <a href={`/product/${item.title.replace(/ /g, '-')}/${item._id}`}>
                                <div className="card_img">
                                    <img src={item?.images[0]} className="text-center" alt={item?.title} />
                                </div>
                                <p className="card_title">{item?.title}</p>
                                <p className="final_price">
                                    ${item?.Fprice}
                                    {item?.discount > 0 && (
                                        <>
                                            <span className="mx-2 text-muted discounted_price"><s>${item?.price}</s></span>
                                            <span className="mx-2 discount">-{item?.discount}%</span>
                                        </>
                                    )}
                                </p>
                            </a>
                        </div>
                    ))
                )}
            </div>

            {/* Video Testimonial */}
            <div className="text-center my-3">
                <h2>Add or Record Video</h2>

                {/* Add Video Button */}
                <input
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    id="uploadVideo"
                    onChange={handleVideoChange}
                />
                <label htmlFor="uploadVideo" style={buttonStyle}>
                    Add Video
                </label>

                {/* Record Video Button */}
                <button onClick={isRecording ? stopRecording : startRecording} style={buttonStyle}>
                    {isRecording ? 'Stop Recording' : 'Record Video'}
                </button>

                {/* Video Preview */}
                {!isUploaded && ( // Only show blob preview if video hasn't been uploaded
                    <>
                        {videoFile && (
                            <div>
                                <h3>Selected Video</h3>
                                <video src={videoFile} controls width="300" style={{ margin: '10px 0' }}></video>
                            </div>
                        )}

                        {recordedVideoURL && (
                            <div>
                                <h3>Recorded Video</h3>
                                <video src={recordedVideoURL} controls width="300" style={{ margin: '10px 0' }}></video>
                            </div>
                        )}
                    </>
                )}

                {/* Uploaded Video Preview */}
                {isUploaded && (
                    <div>
                        <h3>Uploaded Video</h3>
                        <video src={videoUrl} controls autoPlay width="300" style={{ margin: '10px 0' }}></video>
                    </div>
                )}

                {/* Recording Live Stream */}
                {isRecording && (
                    <div>
                        <h3>Recording...</h3>
                        <video ref={videoRef} autoPlay width="300" style={{ margin: '10px 0' }}></video>
                    </div>
                )}

                {/* Upload Button */}
                <button onClick={handleUpload} style={buttonStyle}>
                    Upload Video
                </button>
            </div>
        </div>
    );
};

const buttonStyle = {
    display: 'inline-block',
    padding: '10px 20px',
    margin: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
};

export default Arrivals;
