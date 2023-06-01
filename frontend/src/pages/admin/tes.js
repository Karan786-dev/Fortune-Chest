import axios from 'axios'
import React, { useState } from 'react'

export default function tes() {
    const [image, setimage] = useState(null)
    const addOffer = (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append("profit", 2)
        formData.append("period", 2)
        formData.append('commision', 2)
        formData.append('maximum', 10)
        formData.append('minimum', 1)
        formData.append('image', image)
        axios.post(`${process.env.NEXT_PUBLIC_API}/api/plan/create`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        })
    }
    return (
        <>
            <button onClick={addOffer}>Add</button>
            <br />
            <input
                type="file"
                className="custom-file-input"
                id="photo"
                onChange={(e) => {
                    e.preventDefault()
                    const file = e.target.files[0];
                    setimage(file)
                }}
                name="image"
            />
        </>
    )
}
