import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader/Loader';
import axios from 'axios';
import "./collection.css"

const Collections = () => {

    const [collection, setCollection] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    let move = useNavigate()

    useEffect(() => {
        setIsLoading(true)
        axios
            .get(`${process.env.REACT_APP_BASE_URL}/collection`)
            .then((res) => {
                setCollection(res?.data);
                setIsLoading(false);
            })
            .catch((error) => {
            });
    }, []);

    return <>
        <div className="container mt-5">
            <div className="row">
                <div className="col-12"><h1 className='home_heading text-center mb-5'>Our Collections</h1></div>
            </div>
            <div className='row row-cols-lg-3 row-cols-md-2 row-cols-sm-1 align-center'>
            {collection.map((data, index) => {
    return (
        <div className='cols px-3 my-3' key={index}>
            <div className='collection_card'>
                <div className='image_wrapper'>
                    <img src={data.image} alt="" className='collection_image'/>
                    <div className='overlay'>
                        <p className='collection_title'>{data.title}</p>
                    </div>
                </div>
            </div>
        </div>
    );
})}


            </div>
        </div>
    </>
}

export default Collections