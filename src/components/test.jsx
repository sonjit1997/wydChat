import React, { useState } from "react";
import axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

const CloudinaryUpload = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cloudinary instance
  const cld = new Cloudinary({ cloud: { cloudName: "dtwwkgb3e" } });

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // Use your Cloudinary upload preset

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dtwwkgb3e/image/upload",
        formData
      );

      setImageUrl(response.data.secure_url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Image to Cloudinary</h2>
      <input type="file" onChange={handleUpload} accept="image/*" />
      {loading && <p>Uploading...</p>}

      {imageUrl && (
        <div>
          <h3>Uploaded Image</h3>
          <AdvancedImage
            cldImg={cld.image(imageUrl).format("auto").quality("auto").resize(auto().gravity(autoGravity()).width(500).height(500))}
          />
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;
